import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * Handles GET requests to fetch all collections.
 *
 * @returns A JSON response with the list of collections or an error.
 */
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
