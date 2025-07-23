import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/checkout(.*)']);
const isAdminLoginRoute = createRouteMatcher(['/admin/login']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const session = await auth();
  const isAdminAuthenticated = req.cookies.get('admin-authenticated')?.value === 'true';

  if (isProtectedRoute(req) && !session.userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  if (isAdminRoute(req) && !isAdminLoginRoute(req) && !isAdminAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  if (isAdminLoginRoute(req) && isAdminAuthenticated) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
});