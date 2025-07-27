"use server";

import { TAGS } from "@/lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  mergeAndGetCart,
  placeOrder,
  removeFromCart,
  updateCart,
} from "@/lib/sfcc";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Cart, CartItem } from "@/lib/sfcc/types";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function addItem(prevState: any, selectedVariantId: string | undefined): Promise<string> {
  const merchandiseId = selectedVariantId;

  if (!merchandiseId) {
    return "Error: Missing product or variant ID.";
  }

  try {
    await addToCart([{ merchandiseId, quantity: 1 }]);
    revalidateTag(TAGS.cart);
    return "success";
  } catch (e) {
    console.error("Error adding item to cart:", e);
    return `Error adding item to cart: ${e instanceof Error ? e.message : 'Unknown error'}`;
  }
}

export async function removeItem(prevState: any, lineId: string): Promise<string> {
  try {
    const cart = await getCart();
    if (!cart) {
      return "Error: Cart not found";
    }
    await removeFromCart([lineId]);
    revalidateTag(TAGS.cart);
    return "success";
  } catch (e) {
    console.error("Error removing item from cart:", e);
    return `Error removing item from cart: ${e instanceof Error ? e.message : 'Unknown error'}`;
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: { lineId: string; variantId: string; quantity: number }
): Promise<string> {
  const { lineId, variantId, quantity } = payload;

  try {
    const cart = await getCart();
    if (!cart) {
      return "Error: Cart not found";
    }
    if (quantity === 0) {
      await removeFromCart([lineId]);
    } else {
      await updateCart([{ id: lineId, merchandiseId: variantId, quantity }]);
    }
    revalidateTag(TAGS.cart);
    return "success";
  } catch (e) {
    console.error("Error updating item quantity:", e);
    return `Error updating item quantity: ${e instanceof Error ? e.message : 'Unknown error'}`;
  }
}

export async function createCartAndSetCookie(): Promise<string> {
  try {
    const cart = await createCart();
    if (cart?.id) {
      (await cookies()).set("cartId", cart.id);
      return "success";
    } else {
      return "Error creating cart: No cart ID returned";
    }
  } catch (e) {
    console.error("Error creating cart:", e);
    return `Error creating cart: ${e instanceof Error ? e.message : 'Unknown error'}`;
  }
}

export async function syncGuestCart(guestCart: Cart): Promise<Cart | null> {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    const lines = guestCart.lines.map((item: CartItem) => ({
      merchandiseId: item.merchandise.id,
      quantity: item.quantity,
    }));

    if (lines.length > 0) {
      const updatedCart = await mergeAndGetCart(lines);
      return updatedCart;
    }

    return await getCart();
  } catch (e) {
    console.error("Failed to sync guest cart:", e);
    return null;
  }
}