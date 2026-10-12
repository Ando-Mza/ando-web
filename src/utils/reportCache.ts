/**
 * Caché en memoria de las consultas de reportes (US-RYI-01..06).
 * Vive mientras la pestaña está abierta: no se escribe en disco y se vacía al cerrar sesión.
 * Los datos siempre provienen del backend; acá solo se evita repetir una consulta idéntica.
 */

interface Entrada {
  valor: unknown;
  guardadoEn: number;
}

/** Los reportes cambian con la actividad de la plataforma: se reutilizan por un tiempo acotado */
export const REPORT_CACHE_TTL_MS = 2 * 60 * 1000;

const resueltas = new Map<string, Entrada>();
const enCurso = new Map<string, Promise<unknown>>();
/** Cambia al vaciar la caché, para no guardar respuestas que llegan después (p. ej. tras cerrar sesión) */
let generacion = 0;

export function reportCacheKey(nombre: string, params?: object): string {
  const entradas = Object.entries(params ?? {})
    .filter(([, valor]) => valor !== undefined && valor !== null && valor !== '')
    .sort(([a], [b]) => a.localeCompare(b));
  return `${nombre}?${JSON.stringify(entradas)}`;
}

/** Valor guardado y vigente, o undefined si hay que consultarlo */
export function peekReportCache<T>(key: string, ttlMs: number = REPORT_CACHE_TTL_MS): T | undefined {
  const entrada = resueltas.get(key);
  if (!entrada) return undefined;
  if (Date.now() - entrada.guardadoEn > ttlMs) {
    resueltas.delete(key);
    return undefined;
  }
  return entrada.valor as T;
}

/**
 * Devuelve el valor en memoria si está vigente; si no, lo consulta una sola vez
 * (las llamadas simultáneas con la misma clave comparten la misma consulta).
 * Los errores no se guardan: el próximo intento vuelve a consultar al backend.
 */
export function cachedReportRequest<T>(
  key: string,
  fetcher: () => Promise<T>,
  opciones: { ttlMs?: number; force?: boolean } = {}
): Promise<T> {
  const { ttlMs = REPORT_CACHE_TTL_MS, force = false } = opciones;

  if (!force) {
    const guardado = peekReportCache<T>(key, ttlMs);
    if (guardado !== undefined) return Promise.resolve(guardado);
    const pendiente = enCurso.get(key);
    if (pendiente) return pendiente as Promise<T>;
  }

  const generacionInicial = generacion;
  const promesa = fetcher()
    .then((valor) => {
      if (generacionInicial === generacion) {
        resueltas.set(key, { valor, guardadoEn: Date.now() });
      }
      return valor;
    })
    .finally(() => {
      if (enCurso.get(key) === promesa) enCurso.delete(key);
    });

  enCurso.set(key, promesa);
  return promesa;
}

/** Descarta las consultas guardadas cuya clave empieza con el prefijo (o todas si no se indica) */
export function clearReportCache(prefijo?: string): void {
  generacion++;
  if (!prefijo) {
    resueltas.clear();
    enCurso.clear();
    return;
  }
  for (const key of [...resueltas.keys()]) {
    if (key.startsWith(prefijo)) resueltas.delete(key);
  }
  for (const key of [...enCurso.keys()]) {
    if (key.startsWith(prefijo)) enCurso.delete(key);
  }
}
