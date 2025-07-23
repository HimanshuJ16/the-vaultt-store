// commerce/app/api/admin/products/route.ts

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to convert newlines to <br> tags and wrap in <p>
const formatDescriptionToHtml = (description: string) => {
  if (!description) {
    return '';
  }
  // Split by double newlines for paragraphs, then by single for line breaks
  return description
    .split(/\n\s*\n/)
    .map(paragraph => 
      `<p>${paragraph.split('\n').join('<br />')}</p>`
    )
    .join('');
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, handle, description, price, collectionIds, images, category, sizes } = body;

    if (!title || !handle || !description || !price) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    const descriptionHtml = formatDescriptionToHtml(description);

    const newProduct = await prisma.product.create({
      data: {
        title,
        handle,
        description,
        descriptionHtml,
        price: parseFloat(price),
        collections: {
          connect: collectionIds.map((id: string) => ({ id })),
        },
        featuredImage: images?.[0] || 'https://placehold.co/600x600/EEE/31343C?text=Product+Image',
        currencyCode: 'USD',
        tags: [],
        category,
        availableForSale: true,
        images: {
          create: images.map((url: string) => ({
            url,
            altText: title,
            height: 600,
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
  } catch (error) {
    console.error('Failed to create product:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create product.', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: Request) {
    try {
      const body = await req.json();
      const { id, title, handle, description, price, collectionIds, images, category, sizes } = body;
  
      if (!id || !title || !handle || !description || !price) {
        return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
      }
  
      const descriptionHtml = formatDescriptionToHtml(description);
  
      // First, delete existing variants and options to avoid conflicts
      await prisma.productVariant.deleteMany({ where: { productId: id } });
      await prisma.productOption.deleteMany({ where: { productId: id } });
  
      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          title,
          handle,
          description,
          descriptionHtml,
          price: parseFloat(price),
          collections: {
            set: collectionIds.map((id: string) => ({ id })),
          },
          featuredImage: images?.[0] || 'https://placehold.co/600x600/EEE/31343C?text=Product+Image',
          currencyCode: 'USD',
          tags: [],
          category,
          availableForSale: true,
          images: {
            deleteMany: {},
            create: images.map((url: string) => ({
              url,
              altText: title,
              height: 600,
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
  
      return NextResponse.json(updatedProduct, { status: 200 });
    } catch (error) {
      console.error('Failed to update product:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return NextResponse.json({ error: 'Failed to update product.', details: errorMessage }, { status: 500 });
    }
  }