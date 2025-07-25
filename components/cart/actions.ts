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

export async function placeOrderAction(prevState: any, formData: FormData): Promise<string> {
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

    const order = await placeOrder({ shippingAddress, email, contactNumber });
    if (!order) {
      return "Error placing order: Could not create order.";
    }

    try {
      const clerk = await clerkClient();
      const user = await clerk.users.getUser(userId);
      const fullName = user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : email;

      const orderDetailsForEmail = {
        id: order.orderNumber,
        totalAmount: parseFloat(order.cost.totalAmount.amount),
        createdAt: new Date(order.createdAt),
        shippingAddress: {
          line1: shippingAddress.address1,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zip,
          country: shippingAddress.country,
        },
        items: order.lines.map(item => {
          const colorOption = item.merchandise.selectedOptions.find(opt => opt.name.toLowerCase() === 'color');
          const sizeOption = item.merchandise.selectedOptions.find(opt => opt.name.toLowerCase() === 'size');
          return {
            quantity: item.quantity,
            price: parseFloat(item.cost.totalAmount.amount) / item.quantity,
            product: {
              title: item.merchandise.product.title,
              image: item.merchandise.product.featuredImage,
            },
            variant: {
              color: colorOption ? colorOption.value : 'N/A',
              size: sizeOption ? sizeOption.value : 'N/A',
            },
          };
        }),
      };

      await sendOrderConfirmationEmail(email, fullName, orderDetailsForEmail);
    } catch (emailError) {
      console.error("Order placed, but failed to send confirmation email:", emailError);
    }

    // This will throw the special NEXT_REDIRECT error
    redirect(`/checkout/success?orderId=${order.orderNumber}`);

  } catch (e: any) {
    // KEY FIX: Check if the error is a redirect error. If it is, re-throw it
    // so Next.js can handle it correctly.
    if (e.digest?.startsWith('NEXT_REDIRECT')) {
      throw e;
    }
    console.error("Error placing order:", e);
    return `Error placing order: ${e instanceof Error ? e.message : 'Unknown error'}`;
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