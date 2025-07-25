"use client";

import { Cart, CartItem, Product, ProductVariant } from "@/lib/sfcc/types";
import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { syncGuestCart } from "./actions";

export type UpdateType = "plus" | "minus" | "delete";

type CartAction =
  | { type: "UPDATE_ITEM"; payload: { lineId: string; updateType: UpdateType } }
  | { type: "ADD_ITEM"; payload: { variant: ProductVariant; product: Product; quantity?: number } }
  | { type: "SET_CART"; payload: Cart | null };

type CartContextType = {
  cart: Cart | null;
  isLoading: boolean;
  optimisticUpdate: (lineId: string, updateType: UpdateType) => void;
  addCartItem: (variant: ProductVariant, product: Product, quantity?: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemCost(quantity: number, price: number): number {
  return price * quantity;
}

function calculateUpdatedItem(item: CartItem, updateType: UpdateType): CartItem | null {
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
        currencyCode: product.currencyCode || "INR",
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

function updateCartTotals(lines: CartItem[]): Pick<Cart, "totalQuantity" | "cost" | "subtotalAmount" | "totalAmount"> {
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = lines.reduce((sum, item) => sum + Number(item.cost.totalAmount.amount), 0);
  const currencyCode = lines[0]?.cost.totalAmount.currencyCode ?? "INR";

  return {
    totalQuantity,
    subtotalAmount: totalAmount,
    totalAmount: totalAmount,
    cost: {
      subtotalAmount: { amount: totalAmount.toString(), currencyCode },
      totalAmount: { amount: totalAmount.toString(), currencyCode },
      totalTaxAmount: { amount: "0", currencyCode },
      shippingAmount: { amount: "0", currencyCode },
    },
  };
}

function createEmptyCart(): Cart {
  const now = new Date();
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
    createdAt: now,
    updatedAt: now,
    checkoutUrl: "",
  };
}

function cartReducer(state: Cart, action: CartAction): Cart {
  switch (action.type) {
    case "UPDATE_ITEM": {
      const { lineId, updateType } = action.payload;
      const updatedLines = state.lines
        .map((item) => (item.id === lineId ? calculateUpdatedItem(item, updateType) : item))
        .filter(Boolean) as CartItem[];
      return { ...state, ...updateCartTotals(updatedLines), lines: updatedLines, updatedAt: new Date() };
    }
    case "ADD_ITEM": {
      const { variant, product, quantity = 1 } = action.payload;
      const existingItem = state.lines.find((item) => item.merchandise.id === variant.id);
      const updatedItem = createOrUpdateCartItem(existingItem, variant, product, quantity);
      const updatedLines = existingItem
        ? state.lines.map((item) => (item.merchandise.id === variant.id ? updatedItem : item))
        : [...state.lines, updatedItem];
      return { ...state, ...updateCartTotals(updatedLines), lines: updatedLines, updatedAt: new Date() };
    }
    case "SET_CART": {
      return action.payload ?? createEmptyCart();
    }
    default:
      return state;
  }
}

export function CartProvider({ children, serverCart }: { children: React.ReactNode; serverCart: Cart | null }) {
  const [cart, dispatch] = useReducer(cartReducer, serverCart ?? createEmptyCart());
  const [isLoading, setIsLoading] = useState(true);
  const { isSignedIn } = useAuth();
  const [hasSynced, setHasSynced] = useState(false);

  // KEY FIX: Sync with serverCart prop whenever it changes.
  // This ensures the client state reflects the server state after revalidation.
  useEffect(() => {
    if (isSignedIn) {
      dispatch({ type: "SET_CART", payload: serverCart });
      if (serverCart) {
        localStorage.removeItem("guest-cart");
      }
    }
  }, [serverCart, isSignedIn]);

  // Handle initial load for guests and cart syncing on login.
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const guestCartData = localStorage.getItem("guest-cart");

      if (isSignedIn) {
        // If user is signed in, check if there's a guest cart to sync.
        if (guestCartData && !hasSynced) {
          try {
            const guestCart = JSON.parse(guestCartData);
            if (guestCart.lines.length > 0) {
              console.log("Syncing guest cart on sign-in...");
              const syncedCart = await syncGuestCart(guestCart);
              dispatch({ type: "SET_CART", payload: syncedCart });
              localStorage.removeItem("guest-cart");
            } else {
              localStorage.removeItem("guest-cart");
            }
          } catch (error) {
            console.error("Failed to parse or sync guest cart:", error);
          } finally {
            setHasSynced(true);
          }
        }
      } else {
        // If user is a guest, load their cart from local storage.
        try {
          const guestCart = guestCartData ? JSON.parse(guestCartData) : createEmptyCart();
          dispatch({ type: "SET_CART", payload: guestCart });
        } catch (error) {
          console.error("Failed to load guest cart:", error);
          dispatch({ type: "SET_CART", payload: createEmptyCart() });
        }
      }
      setIsLoading(false);
    };
    initialize();
  }, [isSignedIn, hasSynced]);

  // Persist guest cart to localStorage
  useEffect(() => {
    if (!isSignedIn && !isLoading && cart) {
      localStorage.setItem("guest-cart", JSON.stringify(cart));
    }
  }, [cart, isSignedIn, isLoading]);

  const optimisticUpdate = (lineId: string, updateType: UpdateType) => {
    dispatch({ type: "UPDATE_ITEM", payload: { lineId, updateType } });
  };

  const addCartItem = (variant: ProductVariant, product: Product, quantity: number = 1) => {
    dispatch({ type: "ADD_ITEM", payload: { variant, product, quantity } });
  };

  const contextValue = useMemo(
    () => ({
      cart,
      isLoading,
      optimisticUpdate,
      addCartItem,
    }),
    [cart, isLoading]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
