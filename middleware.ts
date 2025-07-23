import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/checkout(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const session = await auth();

  if (isProtectedRoute(req) && !session.userId) {
    // Not authenticated, redirect or return 401
    return Response.redirect(new URL('/sign-in', req.url));
  }
});
