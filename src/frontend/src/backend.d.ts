import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface ShoppingCart {
    createdAt: bigint;
    updatedAt: bigint;
    customerId: string;
    items: Array<CartItem>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type ProductType = {
    __kind__: "Dresses";
    Dresses: null;
} | {
    __kind__: "Leggings";
    Leggings: null;
} | {
    __kind__: "Tops";
    Tops: null;
} | {
    __kind__: "Sarees";
    Sarees: null;
} | {
    __kind__: "Kurtas";
    Kurtas: null;
} | {
    __kind__: "Other";
    Other: string;
} | {
    __kind__: "Jeans";
    Jeans: null;
};
export interface OrderItem {
    size: ProductSize;
    productId: string;
    productName: string;
    quantity: bigint;
    price: bigint;
}
export interface CustomerProfile {
    username: string;
    createdAt: bigint;
    email: string;
    address: string;
    phone: string;
}
export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    customerPhone: string;
    createdAt: bigint;
    customerAddress: string;
    totalAmount: bigint;
    customerId: string;
    items: Array<OrderItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type ProductSize = {
    __kind__: "L";
    L: null;
} | {
    __kind__: "M";
    M: null;
} | {
    __kind__: "S";
    S: null;
} | {
    __kind__: "XL";
    XL: null;
} | {
    __kind__: "XS";
    XS: null;
} | {
    __kind__: "XXL";
    XXL: null;
} | {
    __kind__: "Custom";
    Custom: string;
};
export interface ProductFilter {
    inStock?: boolean;
    size?: ProductSize;
    maxPrice?: bigint;
    searchText?: string;
    category?: ProductType;
    minPrice?: bigint;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface CartItem {
    size: ProductSize;
    productId: string;
    quantity: bigint;
}
export interface Product {
    id: string;
    stockQuantity: bigint;
    imageUrls: Array<ExternalBlob>;
    name: string;
    createdAt: bigint;
    description: string;
    sizes: Array<ProductSize>;
    category: ProductType;
    price: bigint;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    upi = "upi",
    cashOnDelivery = "cashOnDelivery",
    card = "card"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(product: Product): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrUpdateCart(customerId: string, cart: ShoppingCart): Promise<void>;
    deleteCart(customerId: string): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<CustomerProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCartByCustomerId(customerId: string): Promise<ShoppingCart>;
    getFilteredProducts(filter: ProductFilter): Promise<Array<Product>>;
    getOrderById(id: string): Promise<Order>;
    getOrdersByCustomerId(customerId: string): Promise<Array<Order>>;
    getPaymentMethods(): Promise<Array<PaymentMethod>>;
    getProductById(id: string): Promise<Product>;
    getStripeConfiguration(): Promise<StripeConfiguration>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUpiId(): Promise<string>;
    getUserProfile(user: Principal): Promise<CustomerProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    placeOrder(order: Order): Promise<void>;
    saveCallerUserProfile(profile: CustomerProfile): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    setUpiId(id: string): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    updateProductImages(id: string, images: Array<ExternalBlob>): Promise<void>;
}
