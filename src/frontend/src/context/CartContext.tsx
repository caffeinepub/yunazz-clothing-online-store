import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  useState,
} from "react";
import type { ProductSize } from "../types";

export interface CartItem {
  productId: string;
  productName: string;
  price: bigint;
  quantity: number;
  size: ProductSize;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

type CartAction =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; productId: string; sizeKey: string }
  | { type: "UPDATE"; productId: string; sizeKey: string; quantity: number }
  | { type: "CLEAR" };

function sizeKey(size: ProductSize): string {
  return size.__kind__ === "Custom"
    ? `Custom:${(size as { __kind__: "Custom"; Custom: string }).Custom}`
    : size.__kind__;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "CLEAR":
      return { ...state, items: [] };
    case "ADD": {
      const key = sizeKey(action.item.size);
      const existing = state.items.find(
        (i) => i.productId === action.item.productId && sizeKey(i.size) === key,
      );
      if (existing) {
        return {
          ...state,
          isOpen: true,
          items: state.items.map((i) =>
            i.productId === action.item.productId && sizeKey(i.size) === key
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i,
          ),
        };
      }
      return { ...state, isOpen: true, items: [...state.items, action.item] };
    }
    case "REMOVE":
      return {
        ...state,
        items: state.items.filter(
          (i) =>
            !(
              i.productId === action.productId &&
              sizeKey(i.size) === action.sizeKey
            ),
        ),
      };
    case "UPDATE": {
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) =>
              !(
                i.productId === action.productId &&
                sizeKey(i.size) === action.sizeKey
              ),
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.productId === action.productId && sizeKey(i.size) === action.sizeKey
            ? { ...i, quantity: action.quantity }
            : i,
        ),
      };
    }
    default:
      return state;
  }
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: ProductSize) => void;
  updateQuantity: (
    productId: string,
    size: ProductSize,
    quantity: number,
  ) => void;
  clearCart: () => void;
  total: bigint;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
  });

  const openCart = useCallback(() => dispatch({ type: "OPEN" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE" }), []);
  const addItem = useCallback(
    (item: CartItem) => dispatch({ type: "ADD", item }),
    [],
  );
  const removeItem = useCallback(
    (productId: string, size: ProductSize) =>
      dispatch({ type: "REMOVE", productId, sizeKey: sizeKey(size) }),
    [],
  );
  const updateQuantity = useCallback(
    (productId: string, size: ProductSize, quantity: number) =>
      dispatch({ type: "UPDATE", productId, sizeKey: sizeKey(size), quantity }),
    [],
  );
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const total = state.items.reduce(
    (sum, i) => sum + i.price * BigInt(i.quantity),
    BigInt(0),
  );

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
