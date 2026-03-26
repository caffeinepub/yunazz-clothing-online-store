import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import MixinStorage "blob-storage/Mixin";

import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Blob "mo:core/Blob";


actor {
  include MixinStorage();

  // Product Types and Sizes
  public type ProductType = {
    #Jeans;
    #Tops;
    #Dresses;
    #Kurtas;
    #Sarees;
    #Leggings;
    #Other : Text;
  };

  public type ProductSize = {
    #XS;
    #S;
    #M;
    #L;
    #XL;
    #XXL;
    #Custom : Text;
  };

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  // Product Type
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    category : ProductType;
    sizes : [ProductSize];
    stockQuantity : Nat;
    imageUrls : [Storage.ExternalBlob];
    createdAt : Int;
  };

  // Customer Profile Type
  public type CustomerProfile = {
    username : Text;
    email : Text;
    phone : Text;
    address : Text;
    createdAt : Int;
  };

  // Cart Item Type
  public type CartItem = {
    productId : Text;
    quantity : Nat;
    size : ProductSize;
  };

  // Shopping Cart Type
  public type ShoppingCart = {
    customerId : Text;
    items : [CartItem];
    createdAt : Int;
    updatedAt : Int;
  };

  // Order Item Type
  public type OrderItem = {
    productId : Text;
    productName : Text;
    price : Nat;
    quantity : Nat;
    size : ProductSize;
  };

  // Order Type
  public type Order = {
    id : Text;
    customerId : Text;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    items : [OrderItem];
    totalAmount : Nat;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    createdAt : Int;
  };

  public type PaymentMethod = {
    #upi;
    #card;
    #cashOnDelivery;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  // ── Stable storage (persists across canister upgrades) ──────────────────────
  stable var stableProducts    : [(Text, Product)]                        = [];
  stable var stableCustomers   : [(Text, CustomerProfile)]                = [];
  stable var stableCarts       : [(Text, ShoppingCart)]                   = [];
  stable var stableOrders      : [(Text, Order)]                          = [];
  stable var stableUpiId       : Text                                     = "";
  stable var stableAdminAssigned : Bool                                   = false;
  stable var stableUserRoles   : [(Principal, AccessControl.UserRole)]    = [];

  // ── Runtime maps — loaded from stable storage on start ──────────────────────
  let products : Map.Map<Text, Product> = do {
    let m = Map.empty<Text, Product>();
    for ((k, v) in stableProducts.vals()) { m.add(k, v) };
    m
  };

  let customers : Map.Map<Text, CustomerProfile> = do {
    let m = Map.empty<Text, CustomerProfile>();
    for ((k, v) in stableCustomers.vals()) { m.add(k, v) };
    m
  };

  let carts : Map.Map<Text, ShoppingCart> = do {
    let m = Map.empty<Text, ShoppingCart>();
    for ((k, v) in stableCarts.vals()) { m.add(k, v) };
    m
  };

  let orders : Map.Map<Text, Order> = do {
    let m = Map.empty<Text, Order>();
    for ((k, v) in stableOrders.vals()) { m.add(k, v) };
    m
  };

  // UPI ID for payments (admin setting)
  var upiId : Text = stableUpiId;

  // Access Control — restored from stable state
  let accessControlState : AccessControl.AccessControlState = do {
    let m = Map.empty<Principal, AccessControl.UserRole>();
    for ((k, v) in stableUserRoles.vals()) { m.add(k, v) };
    { var adminAssigned = stableAdminAssigned; userRoles = m }
  };

  // ── Upgrade hooks ────────────────────────────────────────────────────────────
  system func preupgrade() {
    stableProducts    := products.entries().toArray();
    stableCustomers   := customers.entries().toArray();
    stableCarts       := carts.entries().toArray();
    stableOrders      := orders.entries().toArray();
    stableUpiId       := upiId;
    stableAdminAssigned := accessControlState.adminAssigned;
    stableUserRoles   := accessControlState.userRoles.entries().toArray();
  };

  system func postupgrade() {
    // Stable arrays already loaded into runtime maps above; clear to save memory.
    stableProducts    := [];
    stableCustomers   := [];
    stableCarts       := [];
    stableOrders      := [];
    stableUserRoles   := [];
  };

  // Product Filters
  public type ProductFilter = {
    category : ?ProductType;
    size : ?ProductSize;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    inStock : ?Bool;
    searchText : ?Text;
  };

  func matchesCategory(product : Product, filter : ?ProductType) : Bool {
    switch (filter) {
      case (null) { true };
      case (?category) { product.category == category };
    };
  };

  func matchesSize(product : Product, filter : ?ProductSize) : Bool {
    switch (filter) {
      case (null) { true };
      case (?size) {
        product.sizes.any(
          func(productSize : ProductSize) : Bool {
            productSize == size;
          }
        );
      };
    };
  };

  func matchesPriceRange(product : Product, min : ?Nat, max : ?Nat) : Bool {
    let price = product.price;
    let minOk = switch (min) {
      case (null) { true };
      case (?minValue) { price >= minValue };
    };
    let maxOk = switch (max) {
      case (null) { true };
      case (?maxValue) { price <= maxValue };
    };
    minOk and maxOk;
  };

  func matchesStockStatus(product : Product, filter : ?Bool) : Bool {
    switch (filter) {
      case (null) { true };
      case (?inStock) { inStock == (product.stockQuantity > 0) };
    };
  };

  func matchesSearchText(product : Product, filter : ?Text) : Bool {
    switch (filter) {
      case (null) { true };
      case (?text) {
        product.name.contains(#text(text)) or product.description.contains(#text(text));
      };
    };
  };

  func filterProduct(product : Product, filter : ProductFilter) : Bool {
    matchesCategory(product, filter.category) and
    matchesSize(product, filter.size) and
    matchesPriceRange(product, filter.minPrice, filter.maxPrice) and
    matchesStockStatus(product, filter.inStock) and
    matchesSearchText(product, filter.searchText);
  };

  // Access Control System
  public shared ({ caller }) func initializeAccessControl() : async () {
    AccessControl.initialize(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    customers.get(caller.toText());
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?CustomerProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    customers.get(user.toText());
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : CustomerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    customers.add(caller.toText(), profile);
  };

  // Product Management Functions (Public Read Access)
  public query func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query func getFilteredProducts(filter : ProductFilter) : async [Product] {
    let filtered = products.values().toArray().filter(
      func(product : Product) : Bool { filterProduct(product, filter) }
    );
    filtered;
  };

  public query func getProductById(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Shopping Cart Functions
  public shared ({ caller }) func createOrUpdateCart(customerId : Text, cart : ShoppingCart) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can manage carts");
    };
    if (cart.customerId != customerId) {
      Runtime.trap("Customer ID mismatch");
    };
    if (caller.toText() != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only manage your own cart");
    };
    carts.add(customerId, cart);
  };

  public query ({ caller }) func getCartByCustomerId(customerId : Text) : async ShoppingCart {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view carts");
    };
    if (caller.toText() != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own cart");
    };
    switch (carts.get(customerId)) {
      case (null) { Runtime.trap("Cart not found") };
      case (?cart) { cart };
    };
  };

  public shared ({ caller }) func deleteCart(customerId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete carts");
    };
    if (caller.toText() != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only delete your own cart");
    };
    carts.remove(customerId);
  };

  // Order Management Functions
  public shared ({ caller }) func placeOrder(order : Order) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    if (caller.toText() != order.customerId) {
      Runtime.trap("Unauthorized: Can only place orders for yourself");
    };
    if (order.customerId != "" and order.customerName != "" and order.customerPhone != "" and order.customerAddress != "" and order.items.size() > 0) {
      orders.add(order.id, order);
      carts.remove(order.customerId);
    } else {
      Runtime.trap("Invalid order data");
    };
  };

  public query ({ caller }) func getOrderById(id : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (caller.toText() != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getOrdersByCustomerId(customerId : Text) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    if (caller.toText() != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    let filtered = orders.values().toArray().filter(
      func(order : Order) : Bool { order.customerId == customerId }
    );
    filtered;
  };

  public shared ({ caller }) func updateOrderStatus(id : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status = status;
        };
        orders.add(id, updatedOrder);
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Admin Functions
  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    if (product.id != "" and product.name != "" and product.price > 0 and product.sizes.size() > 0) {
      products.add(product.id, product);
    } else {
      Runtime.trap("Invalid product data");
    };
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(product.id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_existingProduct) {
        if (product.name != "" and product.price > 0 and product.sizes.size() > 0) {
          products.add(product.id, product);
        } else {
          Runtime.trap("Invalid product data");
        };
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
  };

  public shared ({ caller }) func updateProductImages(id : Text, images : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update product images");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = { product with imageUrls = images };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func setUpiId(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set UPI ID");
    };
    if (id != "") {
      upiId := id;
    } else {
      Runtime.trap("UPI ID cannot be empty");
    };
  };

  public query func getUpiId() : async Text {
    upiId;
  };

  // Stripe Integration (kept for backward compatibility)
  var stripeConfiguration : Stripe.StripeConfiguration = {
    secretKey = "sk_test-54";
    allowedCountries = ["IN"];
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfiguration.secretKey != "";
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfiguration := config;
  };

  public query ({ caller }) func getStripeConfiguration() : async Stripe.StripeConfiguration {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view Stripe configuration");
    };
    stripeConfiguration;
  };

  func getStripeConfigurationInternal() : Stripe.StripeConfiguration {
    stripeConfiguration;
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create checkout sessions");
    };
    await Stripe.createCheckoutSession(getStripeConfigurationInternal(), caller, items, successUrl, cancelUrl, transform);
  };

  public shared ({ caller }) func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check session status");
    };
    await Stripe.getSessionStatus(getStripeConfigurationInternal(), sessionId, transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func getPaymentMethods() : async [PaymentMethod] {
    [#upi, #cashOnDelivery];
  };
};
