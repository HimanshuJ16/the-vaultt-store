// commerce/lib/sfcc/index.ts

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
  OrderItem,
} from './types';
import { revalidateTag } from 'next/cache';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Order as PrismaOrder, User as PrismaUser, OrderItem as PrismaOrderItem, Product as PrismaProduct, ProductVariant as PrismaProductVariant } from "@prisma/client";
import { sendWelcomeEmail } from '../email';

export async function getUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return null;
  }

  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);
    if (!clerkUser) {
      throw new Error("Clerk user not found");
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    if (!email) {
      throw new Error("User does not have a primary email address");
    }

    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();

    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        fullName,
      },
    });

    try {
      await sendWelcomeEmail(user.email, user.fullName ?? '');
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send welcome email: ${error}`);
    }
  }

  return user.id;
}

async function getCartId() {
  return (await cookies()).get('cartId')?.value;
}

async function getOrCreateCart(): Promise<Cart> {
  const userId = await getUserId();

  if (!userId) {
    throw new Error('User not authenticated. Please sign in to manage your cart.');
  }

  let cart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: { include: { product: { include: { images: true, options: true, variants: { include: { images: true } }, collections: true } }, productVariant: true } } }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        totalQuantity: 0,
        subtotalAmount: 0,
        totalAmount: 0,
        totalTaxAmount: 0,
        shippingAmount: 0,
      },
      include: { items: { include: { product: { include: { images: true, options: true, variants: { include: { images: true } }, collections: true } }, productVariant: true } } }
    });
    (await cookies()).set('cartId', cart.id, { httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
  } else {
    const cartId = await getCartId();
    if (cartId && cartId !== cart.id) {
      (await cookies()).set('cartId', cart.id, { httpOnly: true, maxAge: 60 * 60 * 24 * 30 });
    }
  }

  return {
    ...cart,
    checkoutUrl: '/checkout',
    lines: cart.items.map(item => ({
      ...item,
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'INR' } },
      merchandise: {
        id: item.productVariantId || item.productId,
        title: item.product.title,
        selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
        product: item.product
      }
    })),
    cost: {
      subtotalAmount: { amount: cart.subtotalAmount.toString(), currencyCode: 'INR' },
      totalAmount: { amount: cart.totalAmount.toString(), currencyCode: 'INR' },
      totalTaxAmount: { amount: cart.totalTaxAmount.toString(), currencyCode: 'INR' },
      shippingAmount: { amount: cart.shippingAmount.toString(), currencyCode: 'INR' },
    }
  };
}

export async function getCollections(): Promise<Collection[]> {
  const collections = await prisma.collection.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
  });
  return collections.map(c => ({ ...c, productsCount: c._count.products }));
}

export async function getCollection(handle: string): Promise<Collection | null> {
  return await prisma.collection.findUnique({ where: { handle } });
}

export async function getProduct(handle: string): Promise<Product | null> {
  return await prisma.product.findUnique({
    where: { handle },
    include: { images: true, options: true, variants: { include: { images: true } }, collections: true },
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
    where: { collections: { some: { handle: collectionHandle } } },
    include: { images: true, options: true, variants: { include: { images: true } }, collections: true },
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
    include: { images: true, options: true, variants: { include: { images: true } }, collections: true },
    take: limit,
  });
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  const product = await prisma.product.findUnique({ where: { id: productId }, include: { collections: true } });
  if (!product?.collections || product.collections.length === 0) return [];

  const collectionIds = product.collections.map(c => c.id);

  return await prisma.product.findMany({
    where: {
      collections: { some: { id: { in: collectionIds } } },
      id: { not: productId },
    },
    include: { images: true, options: true, variants: { include: { images: true } }, collections: true },
    take: 10,
  });
}

export async function createCart(): Promise<Cart> {
  return getOrCreateCart();
}

export async function getCart(): Promise<Cart | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const cart = await prisma.cart.findFirst({
    where: { userId },
    include: { items: { include: { product: { include: { images: true, options: true, variants: { include: { images: true } }, collections: true } }, productVariant: true } } }
  });

  if (!cart) return null;

  return {
    ...cart,
    checkoutUrl: '/checkout',
    lines: cart.items.map(item => ({
      ...item,
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'INR' } },
      merchandise: {
        id: item.productVariantId || item.productId,
        title: item.product.title,
        selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
        product: item.product
      }
    })),
    cost: {
      subtotalAmount: { amount: cart.subtotalAmount.toString(), currencyCode: 'INR' },
      totalAmount: { amount: cart.totalAmount.toString(), currencyCode: 'INR' },
      totalTaxAmount: { amount: cart.totalTaxAmount.toString(), currencyCode: 'INR' },
      shippingAmount: { amount: cart.shippingAmount.toString(), currencyCode: 'INR' },
    }
  };
}

export async function addToCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const cart = await getOrCreateCart();

  for (const line of lines) {
    let product: (Product & {images: any[], options: any[], variants: (ProductVariant & {images: any[]})[], collections: any[]}) | null = null;
    let variant: (ProductVariant & {images: any[]}) | null = null;
    let price: number | undefined;
    let productVariantId: string | null = null;

    variant = await prisma.productVariant.findUnique({ where: { id: line.merchandiseId }, include: { images: true } });

    if (variant) {
      product = await prisma.product.findUnique({ where: { id: variant.productId }, include: { images: true, options: true, variants: { include: { images: true } }, collections: true } });
      price = variant.price;
      productVariantId = variant.id;
    } else {
      product = await prisma.product.findUnique({ where: { id: line.merchandiseId }, include: { images: true, options: true, variants: { include: { images: true } }, collections: true } });
      if (product) {
        price = product.price;
      }
    }

    if (!product || price === undefined) {
      throw new Error(`Product or variant with ID ${line.merchandiseId} not found or missing price`);
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId: product.id, productVariantId: productVariantId }
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

  const updatedCartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id }
  });

  const totalQuantity = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = updatedCartItems.reduce((sum, item) => sum + item.totalAmount, 0);

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      totalQuantity,
      subtotalAmount: totalAmount,
      totalAmount: totalAmount,
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
  const cart = await getCart();
  if (!cart) {
    throw new Error('Cart not found');
  }

  const existingItems = await prisma.cartItem.findMany({
    where: { id: { in: lineIds }, cartId: cart.id }
  });

  if (existingItems.length === 0) {
    throw new Error('No matching cart items found for the provided line IDs');
  }

  await prisma.cartItem.deleteMany({ where: { id: { in: lineIds }, cartId: cart.id } });

  const updatedCartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id }
  });

  const totalQuantity = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = updatedCartItems.reduce((sum, item) => sum + item.totalAmount, 0);

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      totalQuantity,
      subtotalAmount: totalAmount,
      totalAmount: totalAmount,
    }
  });

  revalidateTag(TAGS.cart);
  const updatedCart = await getCart();
  if (!updatedCart) {
    throw new Error("Failed to get updated cart");
  }
  return updatedCart;
}

export async function updateCart(lines: { id: string; merchandiseId: string; quantity: number }[]): Promise<Cart> {
  const cart = await getCart();
  if (!cart) {
    throw new Error('Cart not found');
  }

  for (const line of lines) {
    let product: (Product & {images: any[], options: any[], variants: (ProductVariant & {images: any[]})[], collections: any[]}) | null = null;
    let variant: (ProductVariant & {images: any[]}) | null = null;
    let price: number | undefined;

    variant = await prisma.productVariant.findUnique({ where: { id: line.merchandiseId }, include: { images: true } });

    if (variant) {
      product = await prisma.product.findUnique({ where: { id: variant.productId }, include: { images: true, options: true, variants: { include: { images: true } }, collections: true } });
      price = variant.price;
    } else {
      product = await prisma.product.findUnique({ where: { id: line.merchandiseId }, include: { images: true, options: true, variants: { include: { images: true } }, collections: true } });
      if (product) {
        price = product.price;
      }
    }

    if (!product || price === undefined) {
      throw new Error(`Product or variant with ID ${line.merchandiseId} not found or missing price`);
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { id: line.id, cartId: cart.id }
    });

    if (!existingItem) {
      throw new Error(`Cart item with ID ${line.id} not found`);
    }

    if (line.quantity === 0) {
      await prisma.cartItem.delete({ where: { id: line.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: line.id },
        data: {
          quantity: line.quantity,
          totalAmount: price * line.quantity,
        },
      });
    }
  }

  const updatedCartItems = await prisma.cartItem.findMany({
    where: { cartId: cart.id }
  });

  const totalQuantity = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = updatedCartItems.reduce((sum, item) => sum + item.totalAmount, 0);

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      totalQuantity,
      subtotalAmount: totalAmount,
      totalAmount: totalAmount,
    }
  });

  revalidateTag(TAGS.cart);
  const updatedCart = await getCart();
  if (!updatedCart) {
    throw new Error("Failed to get updated cart");
  }
  return updatedCart;
}


/**
 * Merges items from a guest cart into a user's server cart.
 * This is more efficient than calling `addToCart` repeatedly.
 */
export async function mergeAndGetCart(lines: { merchandiseId: string; quantity: number }[]): Promise<Cart> {
    const cart = await getOrCreateCart(); // Ensures a cart exists for the user

    await prisma.$transaction(async (tx) => {
        for (const line of lines) {
            let product: (Product & {images: any[], options: any[], variants: (ProductVariant & {images: any[]})[], collections: any[]}) | null = null;
            let variant: (ProductVariant & {images: any[]}) | null = null;
            let price: number | undefined;
            let productVariantId: string | null = null;

            variant = await tx.productVariant.findUnique({ where: { id: line.merchandiseId }, include: { images: true } });

            if (variant) {
                product = await tx.product.findUnique({ where: { id: variant.productId }, include: { images: true, options: true, variants: { include: { images: true } }, collections: true } });
                price = variant.price;
                productVariantId = variant.id;
            } else {
                product = await tx.product.findUnique({ where: { id: line.merchandiseId }, include: { images: true, options: true, variants: { include: { images: true } }, collections: true } });
                if (product) price = product.price;
            }

            if (!product || price === undefined) {
                console.warn(`Product or variant with ID ${line.merchandiseId} not found during merge. Skipping.`);
                continue;
            }

            const existingItem = await tx.cartItem.findFirst({
                where: { cartId: cart.id, productId: product.id, productVariantId: productVariantId }
            });

            if (existingItem) {
                await tx.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: { increment: line.quantity },
                        totalAmount: { increment: price * line.quantity }
                    }
                });
            } else {
                await tx.cartItem.create({
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
    });

    // Recalculate cart totals after merging
    const updatedCartItems = await prisma.cartItem.findMany({
        where: { cartId: cart.id }
    });

    const totalQuantity = updatedCartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = updatedCartItems.reduce((sum, item) => sum + item.totalAmount, 0);

    await prisma.cart.update({
        where: { id: cart.id },
        data: {
            totalQuantity,
            subtotalAmount: totalAmount,
            totalAmount: totalAmount,
        }
    });

    revalidateTag(TAGS.cart);
    const updatedCart = await getCart();
    if (!updatedCart) {
        throw new Error("Failed to get updated cart after merge");
    }
    return updatedCart;
}


export async function updateCustomerInfo(email: string): Promise<void> {
  console.log(`Updating checkout email to: ${email}`);
}

export async function updateShippingAddress(address: Address): Promise<void> {
  console.log('Updating shipping address:', address);
}

export async function updateBillingAddress(address: Address): Promise<void> {
  console.log('Updating billing address:', address);
}

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  return [
    {
      id: 'standard-shipping',
      name: 'Standard Shipping',
      description: '5-7 business days',
      price: { amount: '5.00', currencyCode: 'INR' },
      isDefault: true,
    },
    {
      id: 'express-shipping',
      name: 'Express Shipping',
      description: '1-2 business days',
      price: { amount: '15.00', currencyCode: 'INR' },
    },
  ];
}

export async function updateShippingMethod(shippingMethodId: string): Promise<void> {
  console.log(`Updating shipping method to: ${shippingMethodId}`);
}

export async function addPaymentMethod(paymentData: any): Promise<void> {
  console.log('Adding payment method (placeholder):', paymentData.cardholderName);
}

export async function placeOrder({ shippingAddress, email, contactNumber }: { shippingAddress: Address, email: string, contactNumber?: string }): Promise<Order> {
  const cart = await getCart();
  const userId = await getUserId();

  if (!cart || !userId || cart.lines.length === 0) {
    throw new Error('Cannot place an empty order or user/cart not found.');
  }

  const formattedAddress = [
    shippingAddress.address1,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.country
  ].filter(Boolean).join(', ');

  const newOrder = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        orderNumber: `ORDER-${Date.now()}`,
        totalAmount: cart.totalAmount,
        totalTaxAmount: cart.totalTaxAmount,
        shippingAmount: cart.shippingAmount,
        customerEmail: email,
        contactNumber: contactNumber,
        shippingAddress: formattedAddress,
        billingAddress: formattedAddress,
        shippingMethod: 'Standard Shipping',
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

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.delete({ where: { id: cart.id } });

    return order;
  });

  (await cookies()).delete('cartId');
  revalidateTag(TAGS.cart);

  return {
    ...newOrder,
    lines: newOrder.items.map(item => ({
      ...item,
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'INR' } },
      merchandise: {
        id: item.productVariant?.id || item.product.id,
        title: item.product.title,
        selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
        product: {
          ...item.product,
          images: [],
          options: [],
          variants: [],
          collections: [],
        }
      }
    })),
    cost: {
      subtotalAmount: { amount: (newOrder.totalAmount - newOrder.shippingAmount - newOrder.totalTaxAmount).toString(), currencyCode: 'INR' },
      totalAmount: { amount: newOrder.totalAmount.toString(), currencyCode: 'INR' },
      totalTaxAmount: { amount: newOrder.totalTaxAmount.toString(), currencyCode: 'INR' },
      shippingAmount: { amount: newOrder.shippingAmount.toString(), currencyCode: 'INR' },
    }
  };
}

export async function getCheckoutOrder(orderId: string): Promise<Order | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: { include: { images: true } } } } }
  });

  if (!order) return null;

  return {
    ...order,
    lines: order.items.map(item => ({
      ...item,
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'INR' } },
      merchandise: { ...item.product, selectedOptions: [] }
    })),
    cost: {
      subtotalAmount: { amount: (order.totalAmount - order.shippingAmount - order.totalTaxAmount).toString(), currencyCode: 'INR' },
      totalAmount: { amount: order.totalAmount.toString(), currencyCode: 'INR' },
      totalTaxAmount: { amount: order.totalTaxAmount.toString(), currencyCode: 'INR' },
      shippingAmount: { amount: order.shippingAmount.toString(), currencyCode: 'INR' },
    }
  };
}

export async function revalidate(req: NextRequest): Promise<NextResponse> {
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
      cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'INR' } },
      merchandise: {
        id: item.productVariant?.id || item.product.id,
        title: item.product.title,
        selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
        product: {
          ...item.product,
          images: [],
          options: [],
          variants: [],
          collections: [],
        }
      }
    })),
    cost: {
      subtotalAmount: { amount: (order.totalAmount - order.shippingAmount - order.totalTaxAmount).toString(), currencyCode: 'INR' },
      totalAmount: { amount: order.totalAmount.toString(), currencyCode: 'INR' },
      totalTaxAmount: { amount: order.totalTaxAmount.toString(), currencyCode: 'INR' },
      shippingAmount: { amount: order.shippingAmount.toString(), currencyCode: 'INR' },
    }
  }));
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      return null;
    }

    return {
      ...order,
      lines: order.items.map(item => ({
        ...item,
        cost: { totalAmount: { amount: item.totalAmount.toString(), currencyCode: 'INR' } },
        merchandise: {
          id: item.productVariant?.id || item.product.id,
          title: item.product.title,
          selectedOptions: (item.productVariant?.selectedOptions as SelectedOptions) || [],
          product: {
            ...item.product,
            images: [],
            options: [],
            variants: [],
            collections: [],
          }
        }
      })),
      cost: {
        subtotalAmount: { amount: (order.totalAmount - order.shippingAmount - order.totalTaxAmount).toString(), currencyCode: 'INR' },
        totalAmount: { amount: order.totalAmount.toString(), currencyCode: 'INR' },
        totalTaxAmount: { amount: order.totalTaxAmount.toString(), currencyCode: 'INR' },
        shippingAmount: { amount: order.shippingAmount.toString(), currencyCode: 'INR' },
      }
    };
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return null;
  }
}

export type DetailedOrder = PrismaOrder & {
    user: PrismaUser | null;
    items: (PrismaOrderItem & {
        product: PrismaProduct;
        productVariant: PrismaProductVariant | null;
    })[];
};

export async function getOrderDetails(orderId: string): Promise<DetailedOrder | null> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          include: {
            product: true,
            productVariant: true,
          },
        },
      },
    });

    return order;
}

export async function getUsers() {
  return await prisma.user.findMany();
}

export async function deleteProduct(handle: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { handle },
    include: { variants: true }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const variantIds = product.variants.map(variant => variant.id);

  await prisma.$transaction([
    prisma.orderItem.deleteMany({ where: { productVariantId: { in: variantIds } } }),
    prisma.cartItem.deleteMany({ where: { productVariantId: { in: variantIds } } }),
    prisma.orderItem.deleteMany({ where: { productId: product.id } }),
    prisma.cartItem.deleteMany({ where: { productId: product.id } }),
    prisma.productVariant.deleteMany({ where: { productId: product.id } }),
    prisma.productOption.deleteMany({ where: { productId: product.id } }),
    prisma.image.deleteMany({ where: { productId: product.id } }),
    prisma.product.delete({ where: { handle } })
  ]);

  revalidateTag(TAGS.products);
}

export async function deleteCollection(handle: string): Promise<void> {
  await prisma.collection.delete({
    where: { handle },
  });
  revalidateTag(TAGS.collections);
}