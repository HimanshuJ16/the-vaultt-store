// commerce/app/api/admin/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  // Delete the 'admin-authenticated' cookie
  (await cookies()).delete('admin-authenticated');

  // Redirect to the login page
  return NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_BASE_URL));
}