// File: commerce/app/api/admin/collections/[handle]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteProduct } from '@/lib/sfcc';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> } // params is a Promise
) {
  try {
    const { handle } = await params; // Await params to get the handle
    const collection = await prisma.collection.findUnique({
      where: { handle },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    return NextResponse.json(collection, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch collection.', details: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> } // params is a Promise
) {
  try {
    const { handle } = await params; // Await params to get the handle
    const body = await req.json();
    const { title, handle: newHandle, description } = body;

    if (!title || !newHandle || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updatedCollection = await prisma.collection.update({
      where: { handle },
      data: {
        title,
        handle: newHandle,
        description,
      },
    });

    return NextResponse.json(updatedCollection, { status: 200 });
  } catch (error) {
    console.error('Failed to update collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to update collection.', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> } // params is a Promise
) {
  try {
    const { handle } = await params; // Await params to get the handle
    await prisma.collection.delete({
      where: { handle },
    });

    return NextResponse.json({ message: 'Collection deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete collection.', details: errorMessage }, { status: 500 });
  }
}