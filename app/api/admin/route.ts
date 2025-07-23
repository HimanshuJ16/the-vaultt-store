// commerce/app/api/admin/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Handles POST requests to create a new product or collection.
 * The type of entity to create is determined by the 'type' field in the request body.
 *
 * @param req The Next.js request object.
 * @returns A JSON response indicating success or failure.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    if (type === 'product') {
      const { title, handle, description, descriptionHtml, price, collectionIds, images, category, sizes, currencyCode, tags, availableForSale } = data;

      if (!title || !handle || !description || !price) {
        return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
      }

      const newProduct = await prisma.product.create({
        data: {
          title,
          handle,
          description,
          descriptionHtml: descriptionHtml || `<p>${description}</p>`,
          price: parseFloat(price),
          collections: {
            connect: collectionIds?.map((id: string) => ({ id })) || [],
          },
          featuredImage: images?.[0] || 'https://placehold.co/600x600/EEE/31343C?text=Product+Image',
          currencyCode: currencyCode || 'USD',
          tags: tags || [],
          category,
          availableForSale: availableForSale !== undefined ? availableForSale : true,
          images: {
            create: images.map((url: string) => ({
              url,
              altText: title,
              height: 600, // You might want to get actual dimensions
              width: 600,
            })),
          },
          options: {
            create: sizes?.length > 0 ? [{ name: 'Size', values: sizes }] : [],
          },
          variants: {
            create: sizes?.length > 0
              ? sizes.map((size: string) => ({
                title: `${title} - ${size}`,
                availableForSale: true,
                price: parseFloat(price),
                size,
                selectedOptions: [{ name: 'Size', value: size }],
              }))
              : [{
                title: title,
                availableForSale: true,
                price: parseFloat(price),
                selectedOptions: [],
              }],
          },
        },
      });

      if (collectionIds && collectionIds.length > 0) {
        await prisma.collection.updateMany({
          where: { id: { in: collectionIds } },
          data: { productsCount: { increment: 1 } },
        });
      }

      return NextResponse.json(newProduct, { status: 201 });

    } else if (type === 'collection') {
      const { title, handle, description } = data;

      if (!title || !handle || !description) {
        return NextResponse.json({ error: 'Missing required collection fields' }, { status: 400 });
      }

      const newCollection = await prisma.collection.create({
        data: {
          title,
          handle,
          description,
        },
      });

      return NextResponse.json(newCollection, { status: 201 });

    } else {
      return NextResponse.json({ error: "Invalid 'type' specified. Must be 'product' or 'collection'." }, { status: 400 });
    }
  } catch (error) {
    console.error('Failed to create entity:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create entity.', details: errorMessage }, { status: 500 });
  }
}