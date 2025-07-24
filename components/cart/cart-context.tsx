"use client";

import { Cart, CartItem, Product, ProductVariant } from "@/lib/sfcc/types";
import React, {
  createContext,
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useOptimistic,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { syncGuestCart } from "./actions";

// --- IndexedDB Helper ---
const DB_NAME = "guest-cart-db";
const STORE_NAME = "cart-store";

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const dbManager = {
  async getCart(id: string): Promise<Cart | null> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result?.cart || null);
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },
  async setCart(id: string, cart: Cart) {
    try {
      const db = await openDB();
      return new Promise<void>((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.put({ id, cart });
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      });
    } catch {
      // Silently handle errors
    }
  },
  async deleteCart(id: string) {
    try {
      const db = await openDB();
      return new Promise<void>((resolve) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => resolve();
      });
    } catch {
      // Silently handle errors
    }
  },
};
// --- End IndexedDB Helper ---

export type UpdateType = "plus" | "minus" | "delete";

type CartAction =
  | {
      type: "UPDATE_ITEM";
      payload: { lineId: string; updateType: UpdateType };
    }
  | {
      type: "ADD_ITEM";
      payload: { variant: ProductVariant; product: Product; quantity?: number };
    }
  | {
      type: "SET_CART";
      payload: Cart;
    };

type CartContextType = {
  cartPromise: Promise<Cart | null>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: number): number {
  return price * quantity;
}

function updateCartItem(
  item: CartItem,
  updateType: UpdateType
): CartItem | null {
  if (updateType === "delete") return null;

  const newQuantity = updateType === "plus" ? item.quantity + 1 : item.quantity - 1;
  if (newQuantity <= 0) return null;

  const singleItemPrice = Number(item.cost.totalAmount.amount) / item.quantity;
  const newTotalAmount = calculateItemCost(newQuantity, singleItemPrice);

  return {
    ...item,
    quantity: newQuantity,
    cost: {
      totalAmount: {
        ...item.cost.totalAmount,
        amount: newTotalAmount.toString(),
      },
    },
    totalAmount: newTotalAmount,
  };
}

function createOrUpdateCartItem(
  existingItem: CartItem | undefined,
  variant: ProductVariant,
  product: Product,
  quantity: number = 1
): CartItem {
  const existingQuantity = existingItem ? existingItem.quantity : 0;
  const newQuantity = existingQuantity + quantity;
  const price = variant.price;

  return {
    id: existingItem?.id ?? crypto.randomUUID(),
    quantity: newQuantity,
    cost: {
      totalAmount: {
        amount: calculateItemCost(newQuantity, price).toString(),
        currencyCode: product.currencyCode,
      },
    },
    merchandise: {
      id: variant.id,
      title: product.title,
      selectedOptions: (variant.selectedOptions as { name: string; value: string }[]) || [],
      product: { ...product, variants: product.variants, images: product.images, options: product.options },
    },
    cartId: existingItem?.cartId ?? crypto.randomUUID(),
    productId: product.id,
    productVariantId: variant.id,
    totalAmount: calculateItemCost(newQuantity, price),
  };
}

function updateCartTotals(lines: CartItem[]): Pick<Cart, "totalQuantity" | "cost"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce((sum, item) => sum + Number(item.cost.totalAmount.amount), 0);
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "INR";

  return {
    totalQuantity,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
      shippingAmount: { amount: "0", currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  return {
    id: crypto.randomUUID(),
    totalQuantity: 0,
    lines: [],
    cost: {
      subtotalAmount: { amount: "0", currencyCode: "INR" },
      totalAmount: { amount: "0", currencyCode: "INR" },
      totalTaxAmount: { amount: "0", currencyCode: "INR" },
      shippingAmount: { amount: "0", currencyCode: "INR" },
    },
    subtotalAmount: 0,
    totalAmount: 0,
    totalTaxAmount: 0,
    shippingAmount: 0,
    userId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    checkoutUrl: "",
  };
}

function cartReducer(state: Cart | undefined, action: CartAction): Cart {
  const currentCart = state || createEmptyCart();
  console.log("Reducer action:", action.type, "Current cart lines:", currentCart.lines.length);

  switch (action.type) {
    case "UPDATE_ITEM": {
      const { lineId, updateType } = action.payload;
      const updatedLines = currentCart.lines
        .map((item) => (item.id === lineId ? updateCartItem(item, updateType) : item))
        .filter(Boolean) as CartItem[];

      return { ...currentCart, ...updateCartTotals(updatedLines), lines: updatedLines, updatedAt: new Date() };
    }
    case "ADD_ITEM": {
      const { variant, product, quantity = 1 } = action.payload;
      const existingItem = currentCart.lines.find((item) => item.merchandise.id === variant.id);
      const updatedItem = createOrUpdateCartItem(existingItem, variant, product, quantity);
      const updatedLines = existingItem
        ? currentCart.lines.map((item) => (item.merchandise.id === variant.id ? updatedItem : item))
        : [...currentCart.lines, updatedItem];

      return { ...currentCart, ...updateCartTotals(updatedLines), lines: updatedLines, updatedAt: new Date() };
    }
    case "SET_CART": {
      return { ...action.payload, updatedAt: new Date() };
    }
    default:
      return currentCart;
  }
}

export function CartProvider({ children, cartPromise }: { children: React.ReactNode; cartPromise: Promise<Cart | null> }) {
  return <CartContext.Provider value={{ cartPromise }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }

  const initialCart = use(context.cartPromise);
  const { isSignedIn } = useAuth();
  const [localCart, setLocalCart] = useState<Cart>(createEmptyCart());
  const [isLoading, setIsLoading] = useState(true);

  // Initialize guest cart
  useEffect(() => {
    if (typeof window !== "undefined" && !isSignedIn) {
      dbManager.getCart("guest-cart").then((cartData) => {
        const newCart = cartData || createEmptyCart();
        console.log("Initializing guest cart with lines:", newCart.lines.length);
        setLocalCart(newCart);
        setIsLoading(false);
      }).catch(() => {
        console.log("Failed to load guest cart, initializing empty");
        setLocalCart(createEmptyCart());
        setIsLoading(false);
      });
    } else {
      setLocalCart(createEmptyCart());
      setIsLoading(false);
    }
  }, [isSignedIn]);

  // Sync guest cart on sign-in
  useEffect(() => {
    if (isSignedIn && localCart.lines.length > 0) {
      syncGuestCart(localCart).then(() => {
        dbManager.deleteCart("guest-cart");
        setLocalCart(createEmptyCart());
      }).catch((error) => {
        console.error("Failed to sync guest cart:", error);
      });
    }
  }, [isSignedIn, localCart]);

  // Persist local cart updates to IndexedDB
  useEffect(() => {
    if (!isSignedIn && !isLoading && localCart.lines.length > 0) {
      console.log("Persisting cart with lines:", localCart.lines.length);
      dbManager.setCart("guest-cart", localCart);
    }
  }, [localCart, isLoading, isSignedIn]);

  const [optimisticCart, dispatch] = useOptimistic(
    initialCart ?? undefined,
    cartReducer
  );

  const cart = isSignedIn ? optimisticCart : localCart;

  const updateCartItem = useCallback((lineId: string, updateType: UpdateType) => {
    if (isSignedIn) {
      dispatch({ type: "UPDATE_ITEM", payload: { lineId, updateType } });
    } else {
      setLocalCart((prevCart) => {
        const updatedCart = cartReducer(prevCart, {
          type: "UPDATE_ITEM",
          payload: { lineId, updateType },
        });
        console.log("Updated cart lines after update:", updatedCart.lines.length);
        return updatedCart;
      });
    }
  }, [dispatch, isSignedIn]);

  const addCartItem = useCallback((variant: ProductVariant, product: Product, quantity: number = 1) => {
    if (isSignedIn) {
      dispatch({ type: "ADD_ITEM", payload: { variant, product, quantity } });
    } else {
      setLocalCart((prevCart) => {
        const updatedCart = cartReducer(prevCart, {
          type: "ADD_ITEM",
          payload: { variant, product, quantity },
        });
        console.log("Added item, new cart lines:", updatedCart.lines.length);
        return updatedCart;
      });
    }
  }, [dispatch, isSignedIn]);

  return useMemo(
    () => ({
      cart,
      isLoading,
      updateCartItem,
      addCartItem,
    }),
    [cart, isLoading, updateCartItem, addCartItem]
  );
}