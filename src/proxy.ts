import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
  const token = await getToken({ req });
  const { pathname } = req.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup') || pathname.startsWith('/forgot-password');

  if (isAuthPage) {
    if (token) {
      if ((token as any).role === 'PARENT' && (token as any).isApproved === false) {
        return NextResponse.redirect(new URL('/parent/pending', req.url));
      }
      return NextResponse.redirect(new URL('/' + (token as any).role.toLowerCase(), req.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Handle Unapproved / Probationary Parent Accounts
  if ((token as any).role === 'PARENT' && (token as any).isApproved === false) {
    if (pathname !== '/parent/pending') {
      return NextResponse.redirect(new URL('/parent/pending', req.url));
    }
    return NextResponse.next();
  }

  // If approved parent tries to visit /parent/pending, redirect to /parent
  if (pathname === '/parent/pending' && (token as any).isApproved !== false) {
    return NextResponse.redirect(new URL('/parent', req.url));
  }

  // Role-based routing protection
  if (pathname.startsWith('/admin') && (token as any).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/' + (token as any).role.toLowerCase(), req.url));
  }
  
  if (pathname.startsWith('/teacher') && (token as any).role !== 'TEACHER' && (token as any).role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/' + (token as any).role.toLowerCase(), req.url));
  }
  
  if (pathname.startsWith('/parent') && (token as any).role !== 'PARENT') {
    return NextResponse.redirect(new URL('/' + (token as any).role.toLowerCase(), req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/teacher/:path*', '/parent/:path*', '/parent/pending', '/login', '/signup', '/forgot-password'],
};
