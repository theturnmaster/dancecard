import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL('/' + (token as any).role.toLowerCase(), req.url));
    }
    return null;
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Role-based routing protection
  if (pathname.startsWith('/admin') && (token as any).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/' + (token as any).role.toLowerCase(), req.url));
  }
  
  if (pathname.startsWith('/teacher') && (token as any).role !== 'TEACHER' && (token as any).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/' + (token as any).role.toLowerCase(), req.url));
  }
  
  if (pathname.startsWith('/parent') && (token as any).role !== 'PARENT') {
    // Admins might want to test parent view, but strictly adhering to roles:
    return NextResponse.redirect(new URL('/' + (token as any).role.toLowerCase(), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/parent/:path*', '/login', '/signup', '/forgot-password'],
};
