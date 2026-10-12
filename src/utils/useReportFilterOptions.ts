'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ApiError } from '@/utils/api';
import { FiltrosDisponiblesReportes, OpcionFiltroReporte } from '@/types/reportes';
import { cachedReportRequest, peekReportCache, reportCacheKey } from '@/utils/reportCache';

/** El catálogo de categorías y zonas casi no cambia: se consulta una vez y se reutiliza */
const CATALOGO_TTL_MS = 30 * 60 * 1000;
const REINTENTOS_AUTOMATICOS = 1;
const ESPERA_REINTENTO_MS = 1500;

function claveCatalogo(rol: 'admin' | 'prestador'): string {
  return reportCacheKey(`filtros-disponibles:${rol}`);
}

/** Un 401/403 no se resuelve reintentando; un corte de red o una demora, sí */
function esReintentable(err: unknown): boolean {
  const status = err instanceof ApiError ? err.status : undefined;
  return status === undefined || status >= 500;
}

function mensajeDeError(err: unknown): string {
  const status = err instanceof ApiError ? err.status : undefined;
  if (status === 401) return 'Tu sesión venció. Volvé a iniciar sesión para ver las categorías y zonas.';
  if (status === 403) return 'No tenés permisos para consultar las categorías y zonas de los reportes.';
  const detalle = err instanceof Error && err.message ? err.message : 'Ocurrió un error inesperado.';
  return `No se pudieron cargar las categorías y zonas: ${detalle}`;
}

async function cargarCatalogo(rol: 'admin' | 'prestador', force: boolean): Promise<FiltrosDisponiblesReportes> {
  let intento = 0;
  for (;;) {
    try {
      return await cachedReportRequest(claveCatalogo(rol), () => api.getFiltrosDisponiblesReportes(rol), {
        ttlMs: CATALOGO_TTL_MS,
        force: force || intento > 0,
      });
    } catch (err) {
      if (intento >= REINTENTOS_AUTOMATICOS || !esReintentable(err)) throw err;
      intento++;
      await new Promise((resolve) => setTimeout(resolve, ESPERA_REINTENTO_MS));
    }
  }
}

/**
 * US-RYI-06: categorías (tabla Categoria) y zonas geográficas disponibles para los
 * filtros globales, tal como las expone el backend.
 */
export function useReportFilterOptions(rol: 'admin' | 'prestador') {
  const [categorias, setCategorias] = useState<OpcionFiltroReporte[]>([]);
  const [departamentos, setDepartamentos] = useState<OpcionFiltroReporte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intentoManual, setIntentoManual] = useState(0);

  useEffect(() => {
    let cancelado = false;

    const aplicar = (res: FiltrosDisponiblesReportes) => {
      setCategorias(Array.isArray(res?.categorias) ? res.categorias : []);
      setDepartamentos(Array.isArray(res?.departamentos) ? res.departamentos : []);
      setError(null);
      setIsLoading(false);
    };

    const enMemoria =
      intentoManual === 0
        ? peekReportCache<FiltrosDisponiblesReportes>(claveCatalogo(rol), CATALOGO_TTL_MS)
        : undefined;
    if (enMemoria) {
      aplicar(enMemoria);
      return;
    }

    setIsLoading(true);
    setError(null);
    cargarCatalogo(rol, intentoManual > 0)
      .then((res) => {
        if (!cancelado) aplicar(res);
      })
      .catch((err) => {
        if (cancelado) return;
        setError(mensajeDeError(err));
        setIsLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [rol, intentoManual]);

  const reintentar = useCallback(() => setIntentoManual((prev) => prev + 1), []);

  return { categorias, departamentos, isLoading, error, reintentar };
}
