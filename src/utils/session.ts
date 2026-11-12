/**
 * "Pista" de sesión compartida entre el cliente y el proxy (proxy.ts).
 *
 * El JWT real vive en localStorage, que el servidor no puede leer. Para poder
 * decidir redirecciones antes de renderizar, el cliente publica una cookie
 * liviana con el rol y la expiración: `<role>.<exp>` (exp en segundos UNIX).
 *
 * IMPORTANTE: la cookie NO es una credencial ni protege datos. Cualquiera puede
 * fabricarla. Solo evita renderizar/entregar pantallas privadas a quien no tiene
 * sesión. La autorización real la hace el backend en cada request con el JWT.
 */

export const SESSION_COOKIE = 'ando_session';

export type SessionRole = 'admin' | 'provider';

export const LOGIN_PATH = '/login';

/** Tras el login, cada rol aterriza en su portal. */
export const HOME_BY_ROLE: Record<SessionRole, string> = {
  admin: '/admin/dashboard',
  provider: '/provider/dashboard',
};

/** Parsea `<role>.<exp>`; devuelve null si es inválida o está vencida. */
export function parseSessionCookie(
  value: string | undefined | null,
  nowMs: number = Date.now()
): { role: SessionRole; exp: number } | null {
  if (!value) return null;
  const [role, expRaw] = value.split('.');
  if (role !== 'admin' && role !== 'provider') return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 <= nowMs) return null;
  return { role, exp };
}

/** Solo permite rutas internas relativas (evita open redirects vía ?next=). */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) {
    return null;
  }
  if (next === LOGIN_PATH || next.startsWith(`${LOGIN_PATH}?`)) return null;
  return next;
}

/** Fallback si el token no trae `exp`: 7 días. */
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60;

export function setSessionCookie(role: SessionRole, expSeconds?: number): void {
  if (typeof document === 'undefined') return;
  const nowSec = Math.floor(Date.now() / 1000);
  const exp = expSeconds && expSeconds > nowSec ? expSeconds : nowSec + DEFAULT_TTL_SECONDS;
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${SESSION_COOKIE}=${role}.${exp}; Path=/; Max-Age=${exp - nowSec}; SameSite=Lax${secure}`;
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
