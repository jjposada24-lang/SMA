import { NextResponse, type NextRequest } from 'next/server';
import { decode } from './lib/auth/session';

const ADMIN_PREFIX = '/admin';
const CUSTOMER_PREFIX = '/cliente';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard the protected areas
  if (!pathname.startsWith(ADMIN_PREFIX) && !pathname.startsWith(CUSTOMER_PREFIX)) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('auth_session')?.value;
  const session = decode(cookie);

  // Not authenticated → send to login
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role mismatch → send to the correct home
  if (pathname.startsWith(ADMIN_PREFIX) && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/cliente/home', req.url));
  }
  if (pathname.startsWith(CUSTOMER_PREFIX) && session.role !== 'customer') {
    return NextResponse.redirect(new URL('/admin/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/cliente/:path*'],
};


