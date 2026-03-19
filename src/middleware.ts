import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard(.*)'];

// Check if the route is protected
const isProtectedRoute = (path: string) => {
  return protectedRoutes.some((route) => {
    const pattern = new RegExp(`^${route}$`);
    return pattern.test(path);
  });
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  if (isProtectedRoute(pathname)) {
    // If no token exists, redirect to login
    if (!token) {
      const url = new URL('/auth/sign-in', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (
    token &&
    (pathname.startsWith('/auth/sign-in') ||
      pathname.startsWith('/auth/sign-up'))
  ) {
    return NextResponse.redirect(new URL('/dashboard/overview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
