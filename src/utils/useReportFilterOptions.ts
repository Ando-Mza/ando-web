'use client';

import { useEffect, useState } from 'react';
import { api } from '@/utils/api';
import { OpcionFiltroReporte } from '@/types/reportes';

/**
 * US-RYI-06: categorías (tabla Categoria) y zonas geográficas disponibles para los
 * filtros globales, tal como las expone el backend.
 */
export function useReportFilterOptions(rol: 'admin' | 'prestador') {
  const [categorias, setCategorias] = useState<OpcionFiltroReporte[]>([]);
  const [departamentos, setDepartamentos] = useState<OpcionFiltroReporte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    api
      .getFiltrosDisponiblesReportes(rol)
      .then((res) => {
        if (cancelado) return;
        setCategorias(Array.isArray(res?.categorias) ? res.categorias : []);
        setDepartamentos(Array.isArray(res?.departamentos) ? res.departamentos : []);
        setError(null);
      })
      .catch(() => {
        if (cancelado) return;
        setError(
          'No se pudieron cargar las categorías y zonas. Podés filtrar por período; para el resto recargá la página.'
        );
      })
      .finally(() => {
        if (!cancelado) setIsLoading(false);
      });

    return () => {
      cancelado = true;
    };
  }, [rol]);

  return { categorias, departamentos, isLoading, error };
}
