// File: commerce/app/api/admin/products/[handle]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteProduct } from '@/lib/sfcc';

export async function GET(
  req: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { handle: params.handle },
      include: {
        images: true,
        options: true,
        variants: true,
        collection: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch product.', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const body = await req.json();
    const { id, title, handle, description, price, collectionId, images } = body;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title,
        handle,
        description,
        price,
        collectionId,
        images: {
          deleteMany: {},
          create: images.map((image: { url: string, altText: string }) => ({
            url: image.url,
            altText: image.altText,
            height: 1000,
            width: 1000
          })),
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    await deleteProduct(params.handle);
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete product:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete product.', details: errorMessage }, { status: 500 });
  }
}