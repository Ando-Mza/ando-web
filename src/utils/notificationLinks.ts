import { useEffect, useRef } from 'react';

/**
 * Las notificaciones guardan en `urlAccion` rutas que también usa la app móvil
 * (p. ej. `/provider/pois/{id}/editar`). Acá se traducen a las pantallas que existen en la web.
 */
export type DestinoNotificacion =
  | { tipo: 'ruta'; href: string }
  | { tipo: 'externa'; href: string }
  | { tipo: 'descarga'; token: string; rol: 'admin' | 'prestador' }
  /** Aviso solo informativo (p. ej. novedades de la plataforma): se lee completo en el panel */
  | { tipo: 'ninguno' };

/** Evento que avisa a la pantalla actual que cambió su query sin volver a montarse. */
export const EVENTO_ENLACE_NOTIFICACION = 'ando:enlace-notificacion';

type RolWeb = 'admin' | 'provider' | 'tourist' | undefined;

const INICIO_POR_ROL: Record<string, string> = {
  admin: '/admin/dashboard',
  provider: '/provider/dashboard',
};

// Los avisos de integraciones caídas apuntan a Configuración, que abre en otra pestaña por defecto
const RUTAS_LEGADAS: Record<string, string> = {
  '/admin/integraciones': '/admin/settings?tab=integrations',
  '/admin/settings': '/admin/settings?tab=integrations',
};

const conParam = (ruta: string, param: string, valor: string) =>
  `${ruta}?${param}=${encodeURIComponent(valor)}`;

/** Ficha de un negocio: el prestador la ve en Mis Negocios y el administrador en Validación */
function destinoPoi(poiId: string, accion: string | undefined, rol: RolWeb): DestinoNotificacion {
  if (rol === 'admin') return { tipo: 'ruta', href: conParam('/admin/validation', 'poi', poiId) };
  if (accion === 'reviews') return { tipo: 'ruta', href: conParam('/provider/reviews', 'poi', poiId) };
  if (accion === 'editar') return { tipo: 'ruta', href: conParam('/provider/business', 'editar', poiId) };
  return { tipo: 'ruta', href: conParam('/provider/business', 'poi', poiId) };
}

/** Notificaciones que llegan sin enlace: se deduce la pantalla a partir del título */
function destinoPorTitulo(titulo: string, rol: RolWeb): DestinoNotificacion {
  const t = titulo.toLowerCase();
  if (rol === 'admin') {
    if (t.includes('integraci')) return { tipo: 'ruta', href: '/admin/settings?tab=integrations' };
    if (t.includes('exportaci')) return { tipo: 'ruta', href: '/admin/reports' };
    return { tipo: 'ninguno' };
  }
  if (rol === 'provider') {
    if (t.includes('reseña')) return { tipo: 'ruta', href: '/provider/reviews' };
    if (t.includes('negocio') || t.includes('correcci')) return { tipo: 'ruta', href: '/provider/business' };
    if (t.includes('exportaci')) return { tipo: 'ruta', href: '/provider/reports' };
  }
  return { tipo: 'ninguno' };
}

export function resolverDestinoNotificacion(
  urlAccion: string | null | undefined,
  rol?: RolWeb,
  titulo = ''
): DestinoNotificacion {
  const url = (urlAccion ?? '').trim();
  if (!url) return destinoPorTitulo(titulo, rol);

  if (url.startsWith('http')) return { tipo: 'externa', href: url };
  if (url.startsWith('/api')) {
    return { tipo: 'externa', href: `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'}${url}` };
  }

  // Exportación generada en segundo plano: /{admin|prestador}/reportes/exportar/descargar/{token}
  const descarga = url.match(/^\/(admin|prestador)\/reportes\/exportar\/descargar\/([^/?#]+)/);
  if (descarga) return { tipo: 'descarga', rol: descarga[1] as 'admin' | 'prestador', token: descarga[2] };

  // /provider/pois/{id}[/reviews|/editar] y el formato anterior /poi/{id}[/editar]
  const poi = url.match(/^\/(?:provider\/pois|poi)\/([^/?#]+)(?:\/([^/?#]+))?/);
  if (poi) return destinoPoi(poi[1], poi[2], rol);

  if (url === '/') {
    return rol && INICIO_POR_ROL[rol] ? { tipo: 'ruta', href: INICIO_POR_ROL[rol] } : { tipo: 'ninguno' };
  }

  const ruta = RUTAS_LEGADAS[url] ?? url;
  // Rutas propias de la app móvil (itinerarios, colaboraciones, etc.) no tienen pantalla en la web
  if (!ruta.startsWith('/admin') && !ruta.startsWith('/provider')) return destinoPorTitulo(titulo, rol);
  return { tipo: 'ruta', href: ruta };
}

/**
 * Ejecuta `alAbrir` con el valor del parámetro `param` de la URL (p. ej. `?poi=123`) cuando la
 * pantalla ya tiene los datos (`listo`), y lo quita de la URL para no repetirlo al refrescar.
 * También responde a una notificación abierta estando ya en esta misma pantalla.
 */
export function useParametroDeEnlace(param: string, listo: boolean, alAbrir: (valor: string) => boolean) {
  const alAbrirRef = useRef(alAbrir);
  useEffect(() => {
    alAbrirRef.current = alAbrir;
  });

  useEffect(() => {
    if (!listo) return;

    const procesar = () => {
      const params = new URLSearchParams(window.location.search);
      const valor = params.get(param);
      if (!valor || !alAbrirRef.current(valor)) return;
      params.delete(param);
      const query = params.toString();
      window.history.replaceState(null, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    };

    procesar();
    window.addEventListener(EVENTO_ENLACE_NOTIFICACION, procesar);
    return () => window.removeEventListener(EVENTO_ENLACE_NOTIFICACION, procesar);
  }, [param, listo]);
}
