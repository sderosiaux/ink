import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Admin pages protection
  if (pathname.startsWith('/admin')) {
    const token = searchParams.get('token');
    const validToken = process.env.ADMIN_TOKEN;

    if (!validToken || token !== validToken) {
      // Return 404 to hide existence of admin routes
      return new NextResponse(null, { status: 404 });
    }

    // Continue with token in URL for navigation
    return NextResponse.next();
  }

  // Admin API protection
  if (pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    const validToken = process.env.ADMIN_TOKEN;

    if (!validToken || token !== validToken) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
