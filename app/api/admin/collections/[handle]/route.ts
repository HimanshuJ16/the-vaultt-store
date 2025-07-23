import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { handle: params.handle },
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
  { params }: { params: { handle: string } }
) {
  try {
    const body = await req.json();
    const { title, handle, description } = body;

    const updatedCollection = await prisma.collection.update({
      where: { handle: params.handle },
      data: {
        title,
        handle,
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
  { params }: { params: { handle: string } }
) {
  try {
    await prisma.collection.delete({
      where: { handle: params.handle },
    });

    return NextResponse.json({ message: 'Collection deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to delete collection.', details: errorMessage }, { status: 500 });
  }
}