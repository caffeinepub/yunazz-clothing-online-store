import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import MixinStorage "blob-storage/Mixin";
import OutCall "http-outcalls/outcall";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Blob "mo:core/Blob";

actor {
  include MixinStorage();

  // Product Types and Sizes
  public type ProductType = {
    #Shirt;
    #Pant;
    #Dress;
    #TShirt;
    #Jacket;
    #Sweater;
    #Blazer;
    #Shorts;
    #Skirt;
    #Jeans;
    #Suit;
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

  module OrderRecord {
    public func compare(o1 : OrderRecord, o2 : OrderRecord) : Order.Order {
      switch (Text.compare(o1.id, o2.id)) {
        case (#equal) { Nat.compare(Int.abs(o1.timestamp), Int.abs(o2.timestamp)) };
        case (order) { order };
      };
    };
  };

  // Product and Order Types
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    sizes : [ProductSize];
    productType : ProductType;
    images : [Storage.ExternalBlob];
    isAvailable : Bool;
    stockCount : Nat;
  };

  public type OrderRecord = {
    id : Text;
    user : Principal;
    products : [Product];
    totalAmount : Nat;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    timestamp : Int;
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

  // Contact Info Type
  public type ContactInfo = {
    phone : Text;
    email : Text;
    instagram : Text;
    instagramQr : Storage.ExternalBlob;
  };

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
  };

  // Product Data Structures
  let products = Map.empty<Text, Product>();
  let orderRecords = Map.empty<Text, OrderRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Contact Information
  var contactInfo : ContactInfo = {
    phone = "8904107520";
    email = "ymd72675@gmail.com";
    instagram = "@yunazzclotheshub";
    instagramQr = Blob.empty();
  };

  public type ProductFilter = {
    productType : ?ProductType;
    size : ?ProductSize;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    isAvailable : ?Bool;
    searchText : ?Text;
  };

  func matchesProductType(product : Product, filter : ?ProductType) : Bool {
    switch (filter) {
      case (null) { true };
      case (?productType) { product.productType == productType };
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

  func matchesIsAvailable(product : Product, filter : ?Bool) : Bool {
    switch (filter) {
      case (null) { true };
      case (?value) { product.isAvailable == value };
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
    matchesProductType(product, filter.productType) and
    matchesSize(product, filter.size) and
    matchesPriceRange(product, filter.minPrice, filter.maxPrice) and
    matchesIsAvailable(product, filter.isAvailable) and
    matchesSearchText(product, filter.searchText);
  };

  // Access Control System
  let accessControlState = AccessControl.initState();

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

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product Management Functions (Public Read Access)
  public query func getAllProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getFilteredProducts(filter : ProductFilter) : async [Product] {
    let filtered = products.values().toArray().filter(
      func(product : Product) : Bool { filterProduct(product, filter) }
    );
    filtered.sort();
  };

  public query func getProductById(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  // Admin Functions for Product Management
  public shared ({ caller }) func addProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    products.add(product.id, product);
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    products.remove(id);
  };

  public shared ({ caller }) func updateProductImages(id : Text, images : [Storage.ExternalBlob]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updatedProduct = {
          product with
          images = images;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  // Order Management Functions
  public shared ({ caller }) func placeOrder(order : OrderRecord) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };
    // Verify that the order belongs to the caller
    if (order.user != caller) {
      Runtime.trap("Unauthorized: Cannot place order for another user");
    };
    orderRecords.add(order.id, order);
  };

  public query ({ caller }) func getOrderById(id : Text) : async OrderRecord {
    switch (orderRecords.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        // Only the order owner or admin can view the order
        if (order.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func getOrdersByUser(user : Principal) : async [OrderRecord] {
    // Users can only view their own orders, admins can view any user's orders
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    let filtered = orderRecords.values().toArray().filter(
      func(order : OrderRecord) : Bool { order.user == user }
    );
    filtered.sort();
  };

  public shared ({ caller }) func updateOrderStatus(id : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    switch (orderRecords.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status = status;
        };
        orderRecords.add(id, updatedOrder);
      };
    };
  };

  // Contact Information Management
  public shared ({ caller }) func setAdminContactInfo(info : ContactInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    contactInfo := info;
  };

  public query func getContactInfo() : async ContactInfo {
    contactInfo;
  };

  // Stripe Integration
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

  // Define available payment methods as a constant
  public query func getPaymentMethods() : async [PaymentMethod] {
    [#upi, #card, #cashOnDelivery];
  };
};
