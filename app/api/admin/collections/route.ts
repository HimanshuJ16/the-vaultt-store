// File: commerce/app/api/admin/collections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Existing GET route
export async function GET() {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: {
        title: 'asc',
      },
    });
    return NextResponse.json(collections, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch collections.', details: errorMessage }, { status: 500 });
  }
}

// Add POST route
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, handle, description } = body;

    // Validate input (basic validation, you can use Zod if needed)
    if (!title || !handle || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const collection = await prisma.collection.create({
      data: {
        title,
        handle,
        description,
      },
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error('Failed to create collection:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create collection.', details: errorMessage }, { status: 500 });
  }
}