import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch users.', details: errorMessage }, { status: 500 });
  }
}