'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { BarChart3, Download, PlusCircle, RefreshCw, Search, Store } from 'lucide-react';
import { api } from '@/utils/api';
import { DetalleNegocioPrestador, ReporteNegociosPrestadorResponse } from '@/types/reportes';
import ProviderBusinessReportView from '@/components/reports/ProviderBusinessReportView';
import ExportReportModal, { FiltrosExportacion } from '@/components/reports/ExportReportModal';
import ReportGlobalFilters from '@/components/reports/ReportGlobalFilters';
import { ReportErrorState, ReportLoadingState } from '@/components/reports/ReportStates';
import { useReportFilterOptions } from '@/utils/useReportFilterOptions';
import {
  loadSessionReportFilters,
  saveSessionReportFilters,
  clearSessionReportFilters,
  getDefaultReportFilters,
  FiltrosReporteState,
} from '@/utils/reportFiltersStorage';

const NOMBRE_REPORTE = 'Reporte de Desempeño de Negocios Propios';

export default function ProviderReportsPage() {
  // Filtros globales (US-RYI-06): persisten durante la sesión activa
  const [filters, setFilters] = useState<FiltrosReporteState>(getDefaultReportFilters);
  const [filtersReady, setFiltersReady] = useState(false);
  const filterOptions = useReportFilterOptions('prestador');

  useEffect(() => {
    setFilters(loadSessionReportFilters());
    setFiltersReady(true);
  }, []);

  const { fechaDesde, fechaHasta, selectedCategory, selectedDepartamento, searchQuery } = filters;
  const categoriaId = selectedCategory !== 'all' ? selectedCategory : undefined;
  const departamentoId = selectedDepartamento !== 'all' ? selectedDepartamento : undefined;

  const [negocios, setNegocios] = useState<DetalleNegocioPrestador[]>([]);
  const [sinNegociosVinculados, setSinNegociosVinculados] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // El backend devuelve únicamente los negocios vinculados al Prestador autenticado (US-RYI-03)
  const fetchProviderReport = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const res: ReporteNegociosPrestadorResponse = await api.getReporteNegociosPrestador({
        fechaDesde,
        fechaHasta,
        categoriaId,
        departamentoId,
        search: searchQuery || undefined,
      });
      if (id !== requestId.current) return;
      const lista = Array.isArray(res?.negocios) ? res.negocios : [];
      setNegocios(lista);
      setSinNegociosVinculados(
        res?.sinNegociosVinculados ?? (lista.length === 0 && !res?.meta?.totalNegociosVinculados)
      );
      setHasLoaded(true);
    } catch (err) {
      if (id !== requestId.current) return;
      setError(
        err instanceof Error && err.message
          ? err.message
          : 'Ocurrió un error inesperado. Intentá nuevamente.'
      );
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [fechaDesde, fechaHasta, categoriaId, departamentoId, searchQuery]);

  useEffect(() => {
    if (filtersReady) fetchProviderReport();
  }, [filtersReady, fetchProviderReport]);

  const handleFilterChange = (next: FiltrosReporteState) => {
    setFilters(next);
    saveSessionReportFilters(next);
  };

  const handleResetFilters = () => {
    clearSessionReportFilters();
    setFilters(getDefaultReportFilters());
  };

  // La respuesta se publica en el backend (flujo de US-RYV) y recién entonces se refleja en pantalla
  const handleReplyReview = async (reviewId: string, replyComment: string) => {
    const res = await api.replyReview(reviewId, replyComment);
    const respuesta = res?.response ?? res?.respuesta ?? res?.data ?? res;
    setNegocios((prev) =>
      prev.map((neg) => ({
        ...neg,
        resenasRecientes: neg.resenasRecientes.map((rev) =>
          rev.id === reviewId
            ? {
                ...rev,
                respuestaPrestador: {
                  id: respuesta?.id ?? reviewId,
                  comentario: respuesta?.comentario ?? replyComment,
                  fechaCreacion: respuesta?.fechaCreacion ?? new Date().toISOString(),
                },
              }
            : rev
        ),
      }))
    );
  };

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportRangeOverride, setExportRangeOverride] = useState<{
    fechaDesde: string;
    fechaHasta: string;
  } | null>(null);

  const exportFiltros: FiltrosExportacion = {
    fechaDesde: exportRangeOverride?.fechaDesde ?? fechaDesde,
    fechaHasta: exportRangeOverride?.fechaHasta ?? fechaHasta,
    categoriaId,
    categoriaNombre: filterOptions.categorias.find((c) => c.id === categoriaId)?.nombre,
    departamento: departamentoId,
    search: searchQuery || undefined,
  };

  const puedeExportar = hasLoaded && !error && !sinNegociosVinculados;

  return (
    <div className="space-y-8 font-wixText">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-accentWine/10 border border-accentWine/20 px-3 py-1 rounded-full text-xs font-bold text-accentWine">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Reportes de mi negocio</span>
            </div>
            <h1 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
              Rendimiento y Métricas de Tu Negocio
            </h1>
            <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
              Consultá cómo le va a tu establecimiento en ANDO: paradas planificadas, visitas completadas, posición en el ranking de tu rubro y reseñas recientes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setExportRangeOverride(null);
              setIsExportOpen(true);
            }}
            disabled={!puedeExportar}
            className="px-5 py-3 bg-accentWine hover:bg-accentWine/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl text-xs font-bold shadow-lg shadow-accentWine/20 transition-all flex items-center space-x-2 cursor-pointer flex-shrink-0 self-start md:self-auto"
            title={
              puedeExportar
                ? 'Exportar el reporte en PDF, Excel (XLSX) o CSV'
                : 'Necesitás tener un negocio registrado para exportar'
            }
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Sin negocios vinculados: no tiene sentido mostrar filtros (US-RYI-03) */}
      {hasLoaded && sinNegociosVinculados && !error ? (
        <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-5 shadow-xs max-w-xl mx-auto">
          <div className="h-16 w-16 rounded-full bg-accentWine/10 text-accentWine flex items-center justify-center mx-auto">
            <Store className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-wixDisplay text-xl font-bold text-textDark">
              Primero tenés que registrar un negocio
            </h3>
            <p className="text-xs text-textDark/60 leading-relaxed">
              Todavía no tenés negocios vinculados a tu cuenta. Registrá tu establecimiento para ver sus métricas de visitas, check-ins y posición en el ranking de tu rubro.
            </p>
          </div>
          <Link
            href="/provider/business"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-accentWine hover:bg-accentWine/90 text-white rounded-2xl text-xs font-bold shadow-lg shadow-accentWine/20 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Registrar mi negocio</span>
          </Link>
        </div>
      ) : (
        <>
          <ReportGlobalFilters
            fechaDesde={fechaDesde}
            fechaHasta={fechaHasta}
            selectedCategory={selectedCategory}
            selectedDepartamento={selectedDepartamento}
            searchQuery={searchQuery}
            categorias={filterOptions.categorias}
            departamentos={filterOptions.departamentos}
            isLoadingOpciones={filterOptions.isLoading}
            opcionesError={filterOptions.error}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
            onSuggestExport={(rango) => {
              setExportRangeOverride(rango);
              setIsExportOpen(true);
            }}
            title="Filtros del reporte"
            subtitle="Elegí el período, el rubro y la zona para acotar las métricas de tus negocios"
          />

          {isLoading && !hasLoaded ? (
            <ReportLoadingState message="Cargando las métricas de tu negocio..." />
          ) : error ? (
            <ReportErrorState message={error} onRetry={fetchProviderReport} />
          ) : negocios.length === 0 ? (
            <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
              <Search className="h-10 w-10 mx-auto text-textDark/30" />
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">
                Ninguno de tus negocios coincide con los filtros
              </h3>
              <p className="text-xs text-textDark/60">Probá con otra categoría, zona o texto de búsqueda.</p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-accentWine hover:bg-accentWine/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Restablecer filtros</span>
              </button>
            </div>
          ) : (
            <div className={isLoading ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'} aria-busy={isLoading}>
              <ProviderBusinessReportView negocios={negocios} onReplyReview={handleReplyReview} />
            </div>
          )}
        </>
      )}

      {/* Exportación (US-RYI-05) */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => {
          setIsExportOpen(false);
          setExportRangeOverride(null);
        }}
        rol="prestador"
        tipoReporte="mi-negocio"
        nombreReporte={NOMBRE_REPORTE}
        filtros={exportFiltros}
        hayDatos={exportRangeOverride !== null || negocios.length > 0}
      />
    </div>
  );
}
