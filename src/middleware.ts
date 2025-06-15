import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the path from the request
  const path = request.nextUrl.pathname;
  
  // Check if path starts with /app/ (protected routes)
  if (path.startsWith('/app/')) {
    // Check for authentication cookie
    const session = request.cookies.get('legaltendr_session');
    const isAuthenticated = !!session;
    
    // If not authenticated and trying to access protected route, redirect to login
    if (!isAuthenticated) {
      console.log('Middleware: Redirecting unauthenticated user from protected route');
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Protected app routes
    '/app/:path*',
  ],
};
