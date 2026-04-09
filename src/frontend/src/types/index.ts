import type { Principal } from "@icp-sdk/core/principal";
import type { ExternalBlob } from "../backend";

// Re-export ExternalBlob for use in types
export type { ExternalBlob };

// ─── Product Types ───────────────────────────────────────────────────────────

export type ProductType =
  | { __kind__: "Jeans"; Jeans: null }
  | { __kind__: "Tops"; Tops: null }
  | { __kind__: "Dresses"; Dresses: null }
  | { __kind__: "Kurtas"; Kurtas: null }
  | { __kind__: "Sarees"; Sarees: null }
  | { __kind__: "Leggings"; Leggings: null }
  | { __kind__: "Other"; Other: string };

export type ProductSize =
  | { __kind__: "XS" }
  | { __kind__: "S" }
  | { __kind__: "M" }
  | { __kind__: "L" }
  | { __kind__: "XL" }
  | { __kind__: "XXL" }
  | { __kind__: "Custom"; Custom: string };

export interface Product {
  id: string;
  name: string;
  description: string;
  /** Price in paise (Nat from backend, maps to bigint) */
  price: bigint;
  category: ProductType;
  sizes: ProductSize[];
  stockQuantity: bigint;
  imageUrls: ExternalBlob[];
  createdAt: bigint;
}

export interface ProductFilter {
  category: [] | [ProductType];
  size: [] | [ProductSize];
  minPrice: [] | [bigint];
  maxPrice: [] | [bigint];
  inStock: [] | [boolean];
  searchText: [] | [string];
}

// ─── Enum-like string constants ───────────────────────────────────────────────

/** OrderStatus string keys — used in Record types, SelectItems, and Order.status */
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export const OrderStatus = {
  pending: "pending" as const,
  confirmed: "confirmed" as const,
  shipped: "shipped" as const,
  delivered: "delivered" as const,
  cancelled: "cancelled" as const,
} satisfies Record<OrderStatus, OrderStatus>;

/** PaymentMethod string keys */
export type PaymentMethod = "upi" | "card" | "cashOnDelivery";

export const PaymentMethod = {
  upi: "upi" as const,
  card: "card" as const,
  cashOnDelivery: "cashOnDelivery" as const,
} satisfies Record<PaymentMethod, PaymentMethod>;

/** UserRole string constants */
export type UserRole = "admin" | "user" | "guest";

export const UserRole = {
  admin: "admin" as const,
  user: "user" as const,
  guest: "guest" as const,
} satisfies Record<UserRole, UserRole>;

// ─── Customer / Order Types ───────────────────────────────────────────────────

export interface CustomerProfile {
  username: string;
  email: string;
  phone: string;
  address: string;
  createdAt: bigint;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: bigint;
  quantity: bigint;
  size: ProductSize;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: bigint;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: bigint;
}

// ─── Backend Actor interface (mirrors Motoko backend public methods) ──────────

export interface BackendActor {
  getCallerUserRole(): Promise<string>;
  isCallerAdmin(): Promise<boolean>;
  initializeAccessControl(): Promise<void>;
  assignCallerUserRole(principal: Principal, role: UserRole): Promise<void>;
  getCallerUserProfile(): Promise<CustomerProfile | null>;
  saveCallerUserProfile(profile: CustomerProfile): Promise<void>;
  getAllProducts(): Promise<Product[]>;
  getFilteredProducts(filter: ProductFilter): Promise<Product[]>;
  addProduct(product: Product): Promise<void>;
  updateProduct(product: Product): Promise<void>;
  deleteProduct(id: string): Promise<void>;
  updateProductImages(id: string, images: ExternalBlob[]): Promise<void>;
  getUpiId(): Promise<string>;
  setUpiId(id: string): Promise<void>;
  placeOrder(order: Order): Promise<void>;
  getOrdersByCustomerId(customerId: string): Promise<Order[]>;
  updateOrderStatus(id: string, status: OrderStatus): Promise<void>;
}
