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
export interface Product {
    id: string;
    name: string;
    isAvailable: boolean;
    description: string;
    productType: ProductType;
    sizes: Array<ProductSize>;
    stockCount: bigint;
    price: bigint;
    images: Array<ExternalBlob>;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type ProductType = {
    __kind__: "Shirt";
    Shirt: null;
} | {
    __kind__: "Skirt";
    Skirt: null;
} | {
    __kind__: "Pant";
    Pant: null;
} | {
    __kind__: "Suit";
    Suit: null;
} | {
    __kind__: "Shorts";
    Shorts: null;
} | {
    __kind__: "Dress";
    Dress: null;
} | {
    __kind__: "Sweater";
    Sweater: null;
} | {
    __kind__: "TShirt";
    TShirt: null;
} | {
    __kind__: "Jacket";
    Jacket: null;
} | {
    __kind__: "Other";
    Other: string;
} | {
    __kind__: "Blazer";
    Blazer: null;
} | {
    __kind__: "Jeans";
    Jeans: null;
};
export interface OrderRecord {
    id: string;
    status: OrderStatus;
    paymentMethod: PaymentMethod;
    user: Principal;
    totalAmount: bigint;
    timestamp: bigint;
    products: Array<Product>;
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
export interface ProductFilter {
    size?: ProductSize;
    isAvailable?: boolean;
    productType?: ProductType;
    maxPrice?: bigint;
    searchText?: string;
    minPrice?: bigint;
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
export interface ContactInfo {
    instagram: string;
    email: string;
    phone: string;
    instagramQr: ExternalBlob;
}
export interface UserProfile {
    name: string;
    email: string;
    address: string;
    phone: string;
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
    deleteProduct(id: string): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getContactInfo(): Promise<ContactInfo>;
    getFilteredProducts(filter: ProductFilter): Promise<Array<Product>>;
    getOrderById(id: string): Promise<OrderRecord>;
    getOrdersByUser(user: Principal): Promise<Array<OrderRecord>>;
    getPaymentMethods(): Promise<Array<PaymentMethod>>;
    getProductById(id: string): Promise<Product>;
    getStripeConfiguration(): Promise<StripeConfiguration>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    initializeAccessControl(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    placeOrder(order: OrderRecord): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdminContactInfo(info: ContactInfo): Promise<void>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
    updateProduct(product: Product): Promise<void>;
    updateProductImages(id: string, images: Array<ExternalBlob>): Promise<void>;
}
