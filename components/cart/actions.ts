"use server";

import { TAGS } from "@/lib/constants";
import {
  addToCart,
  createCart,
  getCart,
  placeOrder,
  removeFromCart,
  updateCart,
} from "@/lib/sfcc";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from '@clerk/nextjs/server';
import { Cart, CartItem } from "@/lib/sfcc/types";

export async function addItem(
  prevState: any,
  selectedVariantId: string | undefined,
) {
  const merchandiseId = selectedVariantId;

  if (!merchandiseId) {
    return "Error: Missing product or variant ID.";
  }

  try {
    await addToCart([{ merchandiseId, quantity: 1 }]);
    revalidateTag(TAGS.cart);
    return "success";
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return "Error adding item to cart";
  }
}

export async function removeItem(prevState: any, lineId: string) {
  try {
    await removeFromCart([lineId]);
    revalidateTag(TAGS.cart);
    return "success";
  } catch (e) {
    return "Error removing item from cart";
  }
}

export async function updateItemQuantity(
  prevState: any,
  payload: {
    lineId: string;
    variantId: string;
    quantity: number;
  },
) {
  const { lineId, variantId, quantity } = payload;

  try {
    if (quantity === 0) {
      await removeFromCart([lineId]);
    } else {
      await updateCart([{ id: lineId, merchandiseId: variantId, quantity }]);
    }
    revalidateTag(TAGS.cart);
    return "success";
  } catch (e) {
    console.error(e);
    return "Error updating item quantity";
  }
}

export async function createCartAndSetCookie() {
  try {
    const cart = await createCart();
    if (cart?.id) {
      (await cookies()).set("cartId", cart.id);
    } else {
      return "Error creating cart";
    }
  } catch (e) {
    return "Error creating cart";
  }
}

export async function placeOrderAction(prevState: any, formData: FormData) {
  let order;
  try {
    const { userId } = await auth();
    if (!userId) {
      return "You must be signed in to place an order.";
    }

    const shippingAddress = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      address1: formData.get('address') as string,
      city: formData.get('city') as string,
      state: formData.get('state') as string,
      zip: formData.get('postalCode') as string,
      country: formData.get('country') as string,
    };
    const email = formData.get('email') as string;
    const contactNumber = formData.get('contactNumber') as string;

    order = await placeOrder({ shippingAddress, email, contactNumber });
    if (!order) {
      return "Error placing order: Could not create order.";
    }
  } catch (e) {
    if (e instanceof Error) {
      return e.message;
    }
    return "An unknown error occurred while placing the order.";
  }

  redirect(`/checkout/success?orderId=${order.orderNumber}`);
}

export async function syncGuestCart(guestCart: Cart) {
  const { userId } = await auth();
  if (!userId) return "User not signed in";

  try {
    let serverCart = await getCart();
    if (!serverCart) {
      serverCart = await createCart();
    }

    const lines = guestCart.lines.map((item: CartItem) => ({
      merchandiseId: item.merchandise.id,
      quantity: item.quantity,
    }));

    if (lines.length > 0) {
      await addToCart(lines);
    }

    revalidateTag(TAGS.cart);
    return "success";
  } catch (e) {
    console.error("Failed to sync guest cart:", e);
    return "Error syncing guest cart";
  }
}