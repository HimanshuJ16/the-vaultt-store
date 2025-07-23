"use server";

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TAGS } from '@/lib/constants';
import {
  Cart,
  Collection,
  Order,
  Product,
  Address,
  ShippingMethod,
  ProductVariant,
  SelectedOptions,
} from './types';
import { revalidateTag } from 'next/cache';
import { auth, clerkClient } from '@clerk/nextjs/server';

// Helper to get the user ID from cookies, assuming you set it upon login/session start
export async function getUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    // This will be treated as a guest user
    return null;
  }

  // Check if a user with this Clerk ID already exists in your database
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  // If the user doesn't exist, create a new user entry
  if (!user) {
    // Fetch user details from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    if (!clerkUser) {
      throw new Error('Clerk user not found');
    }

    // Extract the primary email address
    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      // Handle cases where an email might not be available
      throw new Error('User does not have a primary email address');
    }

    // Create a new user in your local database
    const newUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        fullName: `${clerkUser.firstName} ${clerkUser.lastName}`,
      },
    });

    return newUser.id;
  }

  return user.id;
}


// Helper to get the cart ID from cookies
async function getCartId() {
  return (await cookies()).get('cartId')?.value;
}

// Helper to get or create a cart for the current user
async function getOrCreateCart(): Promise<Cart> {
  let cartId = await getCartId();
  const userId = await getUserId();

  if (!userId) {
    throw new Error('User not authenticated. Please sign in to add items to your cart.');
  }
  
  const userCart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: { include: { images: true, options: true, variants: { include: { images: true } } } }, productVariant: true } } }
  });

  if (userCart) {
    cartId = userCart.id;
  }

  if (cartId) {
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: { include: { product: { include: { images: true, options: true, variants: { include: { images: true } } } }, productVariant: true } } }
    });
    if (cart) {
      return {
        ...cart,
        checkoutUrl: '/checkout',
        lines: cart.items.map(item => ({
          ...item,
          cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'USD' } },
          merchandise: {
            id: item.productVariantId || item.productId,
            title: item.product.title,
            selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
            product: item.product
          }
        })),
        cost: {
          subtotalAmount: { amount: cart.subtotalAmount.toString(), currencyCode: 'USD' },
          totalAmount: { amount: cart.totalAmount.toString(), currencyCode: 'USD' },
          totalTaxAmount: { amount: cart.totalTaxAmount.toString(), currencyCode: 'USD' },
          shippingAmount: { amount: cart.shippingAmount.toString(), currencyCode: 'USD' },
        }
      };
    }
  }

  const newCart = await prisma.cart.create({
    data: {
      userId,
      totalQuantity: 0,
      subtotalAmount: 0,
      totalAmount: 0,
      totalTaxAmount: 0,
      shippingAmount: 0,
    }
  });

  (await cookies()).set('cartId', newCart.id, { httpOnly: true, maxAge: 60 * 60 * 24 * 30 });

  return {
    ...newCart,
    checkoutUrl: '/checkout',
    lines: [],
    cost: {
      subtotalAmount: { amount: '0', currencyCode: 'USD' },
      totalAmount: { amount: '0', currencyCode: 'USD' },
      totalTaxAmount: { amount: '0', currencyCode: 'USD' },
      shippingAmount: { amount: '0', currencyCode: 'USD' },
    }
  };
}


//- COLLECTION & PRODUCT FUNCTIONS

export async function getCollections(): Promise<Collection[]> {
  return await prisma.collection.findMany();
}

export async function getCollection(handle: string): Promise<Collection | null> {
  return await prisma.collection.findUnique({ where: { handle } });
}

export async function getProduct(handle: string): Promise<Product | null> {
  return await prisma.product.findUnique({
    where: { handle },
    include: { images: true, options: true, variants: { include: { images: true } }, collection: true },
  });
}

export async function getCollectionProducts({
  collection: collectionHandle,
  limit = 100
}: {
  collection: string;
  limit?: number;
}): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { collection: { handle: collectionHandle } },
    include: { images: true, options: true, variants: { include: { images: true } }, collection: true },
    take: limit,
  });
  return products;
}

export async function getProducts({
  query,
  limit = 100
}: {
  query?: string;
  limit?: number;
}): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      title: {
        contains: query,
        mode: 'insensitive',
      },
    },
    include: { images: true, options: true, variants: { include: { images: true } }, collection: true },
    take: limit,
  });
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product?.collectionId) return [];

  return await prisma.product.findMany({
    where: {
      collectionId: product.collectionId,
      id: { not: productId },
    },
    include: { images: true, options: true, variants: { include: { images: true } }, collection: true },
    take: 10,
  });
}

//- CART FUNCTIONS

export async function createCart(): Promise<Cart> {
  return getOrCreateCart();
}

export async function getCart(): Promise<Cart | null> {
  const cartId = await getCartId();
  if (!cartId) return null;

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: { items: { include: { product: { include: { images: true, options: true, variants: { include: { images: true } } } }, productVariant: true } } }
  });

  if (!cart) return null;

  // Simplified reshape
  return {
    ...cart,
    checkoutUrl: '/checkout',
    lines: cart.items.map(item => ({
      ...item,
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'USD' } },
      merchandise: {
        id: item.productVariantId || item.productId,
        title: item.product.title,
        selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
        product: item.product
      }
    })),
    cost: {
      subtotalAmount: { amount: cart.subtotalAmount.toString(), currencyCode: 'USD' },
      totalAmount: { amount: cart.totalAmount.toString(), currencyCode: 'USD' },
      totalTaxAmount: { amount: cart.totalTaxAmount.toString(), currencyCode: 'USD' },
      shippingAmount: { amount: cart.shippingAmount.toString(), currencyCode: 'USD' },
    }
  };
}

export async function addToCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const cart = await getOrCreateCart();

  for (const line of lines) {
    let product: (Product & {images: any[], options: any[], variants: (ProductVariant & {images: any[]})[], collection: any}) | null = null;
    let variant: (ProductVariant & {images: any[]}) | null = null;
    let price: number | undefined;
    let productVariantId: string | null = null;

    // Check if the merchandiseId is a variant ID
    variant = await prisma.productVariant.findUnique({ where: { id: line.merchandiseId }, include: { images: true } });

    if (variant) {
      product = await prisma.product.findUnique({ where: { id: variant.productId }, include: { images: true, options: true, variants: { include: { images: true } }, collection: true } });
      price = variant.price;
      productVariantId = variant.id;
    } else {
      // Assume it's a product ID
      product = await prisma.product.findUnique({ where: { id: line.merchandiseId }, include: { images: true, options: true, variants: { include: { images: true } }, collection: true } });
      if (product) {
        price = product.price;
      }
    }

    if (!product || price === undefined) continue;

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: product.id, productVariantId: productVariantId } // check for both product and variant
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: { increment: line.quantity },
          totalAmount: { increment: price * line.quantity }
        }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          productVariantId: productVariantId,
          quantity: line.quantity,
          totalAmount: price * line.quantity,
        },
      });
    }
  }

  // After adding/updating items, we need to recalculate cart totals.
  const updatedCartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id }
  });

  const totalQuantity = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = updatedCartItems.reduce((sum, item) => sum + item.totalAmount, 0);

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      totalQuantity,
      subtotalAmount: totalAmount, // assuming subtotal is sum of item totals
      totalAmount: totalAmount, // assuming total is same as subtotal for now
    }
  });


  revalidateTag(TAGS.cart);
  const updatedCart = await getCart();
  if (!updatedCart) {
      throw new Error("Failed to get updated cart");
  }
  return updatedCart;
}


export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) throw new Error('Cart not found');

  await prisma.cartItem.deleteMany({ where: { id: { in: lineIds }, cartId } });

  revalidateTag(TAGS.cart);
  const updatedCart = await getCart();
    if (!updatedCart) {
        throw new Error("Failed to get updated cart");
    }
    return updatedCart;
}

export async function updateCart(lines: { id: string; merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const cartId = await getCartId();
  if (!cartId) throw new Error('Cart not found');

  for (const line of lines) {
    let product: (Product & {images: any[], options: any[], variants: (ProductVariant & {images: any[]})[], collection: any}) | null = null;
    let variant: (ProductVariant & {images: any[]}) | null = null;
    let price: number | undefined;

    // Check if the merchandiseId is a variant ID
    variant = await prisma.productVariant.findUnique({ where: { id: line.merchandiseId }, include: { images: true } });

    if (variant) {
      product = await prisma.product.findUnique({ where: { id: variant.productId }, include: { images: true, options: true, variants: { include: { images: true } }, collection: true } });
      price = variant.price;
    } else {
      // Assume it's a product ID
      product = await prisma.product.findUnique({ where: { id: line.merchandiseId }, include: { images: true, options: true, variants: { include: { images: true } }, collection: true } });
      if (product) {
        price = product.price;
      }
    }

    if (!product || price === undefined) continue;

    if (line.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: line.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: line.id, cartId },
        data: {
          quantity: line.quantity,
          totalAmount: price * line.quantity,
        },
      });
    }
  }
  // After adding/updating items, we need to recalculate cart totals.
  const updatedCartItems = await prisma.cartItem.findMany({
    where: { cartId: cartId }
  });

  const totalQuantity = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = updatedCartItems.reduce((sum, item) => sum + item.totalAmount, 0);

  await prisma.cart.update({
    where: { id: cartId },
    data: {
      totalQuantity,
      subtotalAmount: totalAmount, // assuming subtotal is sum of item totals
      totalAmount: totalAmount, // assuming total is same as subtotal for now
    }
  });


  revalidateTag(TAGS.cart);
  const updatedCart = await getCart();
    if (!updatedCart) {
        throw new Error("Failed to get updated cart");
    }
    return updatedCart;
}

//- CHECKOUT & ORDER FUNCTIONS (Placeholders - requires more complex logic)

export async function updateCustomerInfo(email: string): Promise<void> {
  // In a real app, you'd associate this with the user or a guest checkout session
  console.log(`Updating checkout email to: ${email}`);
}

export async function updateShippingAddress(address: Address): Promise<void> {
  // This would update the shipping address on the cart or a checkout object
  console.log('Updating shipping address:', address);
}

export async function updateBillingAddress(address: Address): Promise<void> {
  // This would update the billing address on the cart or a checkout object
  console.log('Updating billing address:', address);
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  // This would typically calculate shipping rates based on address and cart contents.
  // Returning static data for now.
  return [
    {
      id: 'standard-shipping',
      name: 'Standard Shipping',
      description: '5-7 business days',
      price: { amount: '5.00', currencyCode: 'USD' },
      isDefault: true,
    },
    {
      id: 'express-shipping',
      name: 'Express Shipping',
      description: '1-2 business days',
      price: { amount: '15.00', currencyCode: 'USD' },
    },
  ];
}

export async function updateShippingMethod(shippingMethodId: string): Promise<void> {
  // This would update the selected shipping method on the cart/checkout
  console.log(`Updating shipping method to: ${shippingMethodId}`);
}

export async function addPaymentMethod(paymentData: any): Promise<void> {
  // This is a placeholder for integrating with a payment provider like Stripe or Braintree.
  // NEVER handle raw card data directly.
  console.log('Adding payment method (placeholder):', paymentData.cardholderName);
}

export async function placeOrder({ shippingAddress, email }: { shippingAddress: Address, email: string }): Promise<Order> {
  const cart = await getCart();
  const userId = await getUserId();

  if (!cart || !userId || cart.lines.length === 0) {
    throw new Error('Cannot place an empty order.');
  }

  // Format the address string
  const formattedAddress = [
    shippingAddress.address1,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.country
  ].filter(Boolean).join(', ');

  const newOrder = await prisma.order.create({
    data: {
      userId,
      orderNumber: `ORDER-${Date.now()}`,
      totalAmount: cart.totalAmount,
      totalTaxAmount: cart.totalTaxAmount,
      shippingAmount: cart.shippingAmount,
      customerEmail: email, // This line was missing
      shippingAddress: formattedAddress,
      billingAddress: formattedAddress, // Assuming billing is same as shipping for now
      shippingMethod: 'Standard Shipping', // Placeholder
      items: {
        create: cart.lines.map(item => ({
          productId: item.productId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          totalAmount: item.totalAmount,
        }))
      }
    },
    include: { items: { include: { product: true, productVariant: true } } }
  });
  
  // Clear the cart
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  await prisma.cart.delete({ where: { id: cart.id } });
  (await cookies()).delete('cartId');

  revalidateTag(TAGS.cart);

  // Reshape the order to match the expected type
  return {
    ...newOrder,
    lines: newOrder.items.map(item => ({
      ...item,
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'USD' } },
      merchandise: {
        id: item.productVariant?.id || item.product.id,
        title: item.product.title,
        selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
        product: {
          ...item.product,
          images: [], // add empty array for images
          options: [], // add empty array for options
          variants: [], // add empty array for variants
          collection: null, // add null for collection
        }
      }
    })),
    cost: {
      subtotalAmount: { amount: (newOrder.totalAmount - newOrder.shippingAmount - newOrder.totalTaxAmount).toString(), currencyCode: 'USD' },
      totalAmount: { amount: newOrder.totalAmount.toString(), currencyCode: 'USD' },
      totalTaxAmount: { amount: newOrder.totalTaxAmount.toString(), currencyCode: 'USD' },
      shippingAmount: { amount: newOrder.shippingAmount.toString(), currencyCode: 'USD' },
    }
  };
}

export async function getCheckoutOrder(orderId: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { images: true } } } } }
  });

  if (!order) return null;

  // Simplified reshape
  return {
    ...order,
    lines: order.items.map(item => ({
      ...item,
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'USD' } },
      merchandise: { ...item.product, selectedOptions: [] }
    })),
    cost: {
      subtotalAmount: { amount: (order.totalAmount - order.shippingAmount - order.totalTaxAmount).toString(), currencyCode: 'USD' },
      totalAmount: { amount: order.totalAmount.toString(), currencyCode: 'USD' },
      totalTaxAmount: { amount: order.totalTaxAmount.toString(), currencyCode: 'USD' },
      shippingAmount: { amount: order.shippingAmount.toString(), currencyCode: 'USD' },
    }
  };
}

//- REVALIDATION

export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // This function can be called by a webhook or admin action to revalidate cached data.
  const path = req.nextUrl.searchParams.get('path');

  if (path) {
    revalidateTag(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  }

  return NextResponse.json({
    revalidated: false,
    now: Date.now(),
    message: 'Missing path to revalidate',
  });
}

//- ADMIN FUNCTIONS

export async function getOrders(): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
          productVariant: true,
        },
      },
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders.map(order => ({
    ...order,
    lines: order.items.map(item => ({
      ...item,
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'USD' } },
      merchandise: {
        id: item.productVariant?.id || item.product.id,
        title: item.product.title,
        selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
        product: {
          ...item.product,
          images: [], // add empty array for images
          options: [], // add empty array for options
          variants: [], // add empty array for variants
          collection: null, // add null for collection
        }
      }
    })),
    cost: {
      subtotalAmount: { amount: (order.totalAmount - order.shippingAmount - order.totalTaxAmount).toString(), currencyCode: 'USD' },
      totalAmount: { amount: order.totalAmount.toString(), currencyCode: 'USD' },
      totalTaxAmount: { amount: order.totalTaxAmount.toString(), currencyCode: 'USD' },
      shippingAmount: { amount: order.shippingAmount.toString(), currencyCode: 'USD' },
    }
  }));
}


export async function getUsers() {
  return await prisma.user.findMany();
}

export async function deleteProduct(handle: string): Promise<void> {
  await prisma.product.delete({
    where: { handle },
  });
  revalidateTag(TAGS.products);
}

export async function deleteCollection(handle: string): Promise<void> {
  await prisma.collection.delete({
    where: { handle },
  });
  revalidateTag(TAGS.collections);
}