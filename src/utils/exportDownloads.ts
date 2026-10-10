import { api, ApiError } from '@/utils/api';
import { ExportReporteQuery, FormatoExportacion } from '@/types/reportes';

/**
 * US-RYI-05: enlaces de descarga de exportaciones generadas en segundo plano.
 *
 * El archivo lo genera y lo guarda el backend durante 24 horas; acá solo se recuerda el
 * enlace (token) y los parámetros con los que se pidió, para poder descargarlo más tarde
 * u ofrecer generar uno nuevo cuando venció.
 */
export interface EnlaceExportacion {
  token: string;
  rol: 'admin' | 'prestador';
  nombreReporte: string;
  formato: FormatoExportacion;
  totalRegistros: number;
  fechaCreacion: string;
  expiraEn: string;
  params: ExportReporteQuery;
}

const STORAGE_PREFIX = 'ando_export_links_';
const MAX_ENLACES = 10;
/** Los enlaces vencidos se siguen listando una semana para poder regenerarlos. */
const RETENCION_MS = 7 * 24 * 60 * 60 * 1000;

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function getEnlacesExportacion(userId?: string): EnlaceExportacion[] {
  if (typeof window === 'undefined' || !userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    const parsed: EnlaceExportacion[] = raw ? JSON.parse(raw) : [];
    const limite = Date.now() - RETENCION_MS;
    return parsed.filter((e) => e?.token && new Date(e.expiraEn).getTime() > limite);
  } catch {
    return [];
  }
}

export function guardarEnlaceExportacion(userId: string | undefined, enlace: EnlaceExportacion): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const enlaces = getEnlacesExportacion(userId).filter((e) => e.token !== enlace.token);
    enlaces.unshift(enlace);
    localStorage.setItem(storageKey(userId), JSON.stringify(enlaces.slice(0, MAX_ENLACES)));
  } catch {
    // Almacenamiento no disponible: el enlace sigue llegando por notificación
  }
}

export function quitarEnlaceExportacion(userId: string | undefined, token: string): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const enlaces = getEnlacesExportacion(userId).filter((e) => e.token !== token);
    localStorage.setItem(storageKey(userId), JSON.stringify(enlaces));
  } catch {
    // Ignorar
  }
}

export function enlaceExpirado(expiraEn: string): boolean {
  const expira = new Date(expiraEn).getTime();
  return Number.isNaN(expira) || Date.now() > expira;
}

/** Extrae el token del enlace que devuelve el backend (`/{rol}/reportes/exportar/descargar/{token}`). */
export function tokenDesdeUrlDescarga(urlDescarga?: string): string | null {
  if (!urlDescarga) return null;
  const token = urlDescarga.split('/').filter(Boolean).pop();
  return token || null;
}

/** Dispara la descarga de un archivo en el navegador. */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 200);
}

export type ResultadoDescarga =
  | { estado: 'descargado' }
  | { estado: 'expirado' }
  | { estado: 'error'; mensaje: string };

/** Descarga un archivo generado en segundo plano, validando la vigencia de 24 horas. */
export async function descargarEnlaceExportacion(
  enlace: Pick<EnlaceExportacion, 'token' | 'rol' | 'expiraEn'>
): Promise<ResultadoDescarga> {
  if (enlaceExpirado(enlace.expiraEn)) return { estado: 'expirado' };

  try {
    const { blob, filename } = await api.descargarExportacion(enlace.token, enlace.rol);
    triggerBlobDownload(blob, filename);
    return { estado: 'descargado' };
  } catch (err) {
    if (err instanceof ApiError && err.status === 410) return { estado: 'expirado' };
    return {
      estado: 'error',
      mensaje: err instanceof Error ? err.message : 'No se pudo descargar el archivo.',
    };
  }
}
