import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/RentDashboard', '/payment(.*)', '/file-report']);
//const isAdminRoute = createRouteMatcher(['/dashboard', '/edit-bike(.*)', '/users-dashboard', '/transaction-history', '/report-track']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth(); // Get user session and claims
  const userRole = sessionClaims?.metadata?.role; // Extract user role

  // Require authentication for protected routes
  if (isProtectedRoute(req) && !userId) {
    const url = new URL('/sign-in', req.url); // Redirect to login if not signed in
    return NextResponse.redirect(url);
  }

  // Restrict admin-only routes
  if (isAdminRoute(req) && userRole !== 'admin') {
    const url = new URL('/', req.url); // Redirect non-admins
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Allow other requests to continue
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
