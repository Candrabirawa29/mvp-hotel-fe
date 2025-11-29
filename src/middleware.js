// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;
  const { pathname } = request.nextUrl;

  // 🔍 Debug logging (hapus di production)
  if (process.env.NODE_ENV === 'development') {
    console.log('🛡️ Middleware Check:', {
      path: pathname,
      hasToken: !!token,
      role: role || 'none',
    });
  }
  
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  if (!token && !isPublicRoute) {
    console.log('❌ No token, redirecting to login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublicRoute) {
    console.log('✅ Has token, redirecting to dashboard');
    return NextResponse.redirect(new URL(getDefaultRoute(role), request.url));
  }

  if (token && role) {
    if (pathname.startsWith('/admin') && role !== 'admin') {
      console.log('🚫 Unauthorized access attempt to admin area');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  console.log('✅ Access granted');
  return NextResponse.next();
}

function getDefaultRoute(role) {
  const roleRoutes = {
    'admin': '/admin/dashboard',
    'hotel': '/hotel',
    'customer': '/dashboard',
  };
  return roleRoutes[role] || '/dashboard';
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',],
};