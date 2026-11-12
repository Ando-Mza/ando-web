import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  HOME_BY_ROLE,
  LOGIN_PATH,
  SESSION_COOKIE,
  parseSessionCookie,
  safeNextPath,
} from '@/utils/session';

/**
 * Control de acceso previo al render.
 *  - /admin/*    -> requiere rol admin
 *  - /provider/* -> requiere rol provider
 *  - /login      -> si ya hay sesión válida, rebota al portal del rol
 *  - /           -> pública (landing)
 *
 * Se apoya en la cookie `ando_session` (ver utils/session.ts). No reemplaza la
 * validación del backend ni los guards de los layouts: es la primera barrera.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = parseSessionCookie(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === LOGIN_PATH || pathname.startsWith(`${LOGIN_PATH}/`)) {
    if (session) {
      const next = safeNextPath(request.nextUrl.searchParams.get('next'));
      const allowed = next && next.startsWith(`/${session.role}/`) ? next : HOME_BY_ROLE[session.role];
      return NextResponse.redirect(new URL(allowed, request.url));
    }
    return NextResponse.next();
  }

  const requiredRole = pathname === '/admin' || pathname.startsWith('/admin/')
    ? 'admin'
    : pathname === '/provider' || pathname.startsWith('/provider/')
      ? 'provider'
      : null;

  if (!requiredRole) return NextResponse.next();

  if (!session) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    const response = NextResponse.redirect(loginUrl);
    // Cookie vencida o corrupta: se limpia para no repetir el chequeo.
    if (request.cookies.has(SESSION_COOKIE)) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (session.role !== requiredRole) {
    // Sesión válida pero en el portal equivocado: lo mandamos al suyo.
    return NextResponse.redirect(new URL(HOME_BY_ROLE[session.role], request.url));
  }

  const response = NextResponse.next();
  // Las pantallas privadas no deben quedar en caches compartidas.
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export const config = {
  matcher: ['/login/:path*', '/admin/:path*', '/provider/:path*'],
};
