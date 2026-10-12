'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { BarChart3, Download, Users, Store, Bot, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import { api } from '@/utils/api';
import {
  PoiReporteItem,
  Top10PoiGrafico,
  PoiDetalleMensualResponse,
  SortByPoiReporte,
  SortOrder,
  ReporteActividadUsuariosResponse,
  GranularidadReporte,
  NegocioLocalItem,
  RankingTopCrecimiento,
  ReporteAsistenteIaResponse,
  TipoReporteExportacion,
} from '@/types/reportes';
import ReportGlobalFilters from '@/components/reports/ReportGlobalFilters';
import Top10PoiBarChart from '@/components/reports/Top10PoiBarChart';
import PoisReportTable from '@/components/reports/PoisReportTable';
import PoiMonthlyDetailModal from '@/components/reports/PoiMonthlyDetailModal';
import UserActivityKpis from '@/components/reports/UserActivityKpis';
import UserActivityLineChart from '@/components/reports/UserActivityLineChart';
import AdminLocalBusinessesReport from '@/components/reports/AdminLocalBusinessesReport';
import AiAssistantUsageKpis from '@/components/reports/AiAssistantUsageKpis';
import AiThematicPieChart from '@/components/reports/AiThematicPieChart';
import ExportReportModal, { FiltrosExportacion } from '@/components/reports/ExportReportModal';
import { ReportErrorState, ReportLoadingState } from '@/components/reports/ReportStates';
import { useReportFilterOptions } from '@/utils/useReportFilterOptions';
import { cachedReportRequest, clearReportCache, peekReportCache, reportCacheKey } from '@/utils/reportCache';
import {
  loadSessionReportFilters,
  saveSessionReportFilters,
  clearSessionReportFilters,
  getDefaultReportFilters,
  FiltrosReporteState,
} from '@/utils/reportFiltersStorage';

type ReportTab = 'pois' | 'users' | 'businesses' | 'ai';

const PAGE_SIZE = 20;
/** El catálogo de negocios se ordena y pagina en pantalla, por eso se pide completo. */
const BUSINESSES_FETCH_LIMIT = 2000;

const TABS: { id: ReportTab; label: string; icon: React.ElementType }[] = [
  { id: 'pois', label: 'POIs más visitados', icon: Compass },
  { id: 'users', label: 'Actividad de usuarios', icon: Users },
  { id: 'businesses', label: 'Negocios locales', icon: Store },
  { id: 'ai', label: 'Uso del asistente IA', icon: Bot },
];

const REPORTES: Record<ReportTab, { nombre: string; tipo: TipoReporteExportacion }> = {
  pois: { nombre: 'Reporte de POIs más Visitados', tipo: 'pois-mas-visitados' },
  users: { nombre: 'Reporte de Actividad de Usuarios', tipo: 'actividad-usuarios' },
  businesses: { nombre: 'Reporte de Negocios Locales', tipo: 'negocios-locales' },
  ai: { nombre: 'Reporte de Uso del Asistente IA', tipo: 'asistente-ia' },
};

function mensajeError(err: unknown): string {
  return err instanceof Error && err.message
    ? err.message
    : 'Ocurrió un error inesperado. Intentá nuevamente.';
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('pois');

  // Filtros globales (US-RYI-06): persisten durante la sesión activa
  const [filters, setFilters] = useState<FiltrosReporteState>(getDefaultReportFilters);
  const [filtersReady, setFiltersReady] = useState(false);
  const filterOptions = useReportFilterOptions('admin');

  useEffect(() => {
    setFilters(loadSessionReportFilters());
    setFiltersReady(true);
  }, []);

  const { fechaDesde, fechaHasta, selectedCategory, selectedDepartamento, searchQuery } = filters;
  const categoriaId = selectedCategory !== 'all' ? selectedCategory : undefined;
  const departamentoId = selectedDepartamento !== 'all' ? selectedDepartamento : undefined;

  // ---- US-RYI-01: POIs más visitados
  const [sortBy, setSortBy] = useState<SortByPoiReporte>('visitasEfectivas');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [poisData, setPoisData] = useState<PoiReporteItem[]>([]);
  const [poisTotal, setPoisTotal] = useState(0);
  const [poisTotalPages, setPoisTotalPages] = useState(1);
  const [top10Data, setTop10Data] = useState<Top10PoiGrafico[]>([]);
  const [poisLoading, setPoisLoading] = useState(true);
  const [poisError, setPoisError] = useState<string | null>(null);

  const [poiDetail, setPoiDetail] = useState<PoiDetalleMensualResponse | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ---- US-RYI-02: Actividad de usuarios
  const [selectedGranularidad, setSelectedGranularidad] = useState<GranularidadReporte>('auto');
  const [userActivity, setUserActivity] = useState<ReporteActividadUsuariosResponse | null>(null);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);

  // ---- US-RYI-03: Negocios locales (vista Administrador)
  const [businesses, setBusinesses] = useState<NegocioLocalItem[]>([]);
  const [topGrowth, setTopGrowth] = useState<RankingTopCrecimiento[]>([]);
  const [businessesLoading, setBusinessesLoading] = useState(true);
  const [businessesError, setBusinessesError] = useState<string | null>(null);

  // ---- US-RYI-04: Uso del asistente IA
  const [aiReport, setAiReport] = useState<ReporteAsistenteIaResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  // Cada pestaña descarta las respuestas de consultas anteriores (filtros cambiados mientras cargaba)
  const requestIds = useRef<Record<ReportTab | 'detail', number>>({
    pois: 0,
    users: 0,
    businesses: 0,
    ai: 0,
    detail: 0,
  });

  const fetchPois = useCallback(async () => {
    const id = ++requestIds.current.pois;
    const params = {
      fechaDesde,
      fechaHasta,
      categoriaId,
      departamentoId,
      search: searchQuery || undefined,
      sortBy,
      sortOrder,
      page: currentPage,
      limit: PAGE_SIZE,
    };
    // Una consulta idéntica ya resuelta se toma de memoria, sin volver a mostrar la carga
    const key = reportCacheKey('admin:pois-mas-visitados', params);
    const enMemoria = peekReportCache<any>(key);
    if (enMemoria === undefined) setPoisLoading(true);
    setPoisError(null);
    try {
      const res =
        enMemoria ?? (await cachedReportRequest(key, () => api.getReportePoisMasVisitados(params)));
      if (id !== requestIds.current.pois) return;
      setPoisData(Array.isArray(res?.data) ? res.data : []);
      setTop10Data(Array.isArray(res?.top10Grafico) ? res.top10Grafico : []);
      setPoisTotal(res?.meta?.total ?? 0);
      setPoisTotalPages(Math.max(res?.meta?.totalPages ?? 1, 1));
    } catch (err) {
      if (id !== requestIds.current.pois) return;
      setPoisError(mensajeError(err));
    } finally {
      if (id === requestIds.current.pois) setPoisLoading(false);
    }
  }, [fechaDesde, fechaHasta, categoriaId, departamentoId, searchQuery, sortBy, sortOrder, currentPage]);

  const fetchUsers = useCallback(async () => {
    const id = ++requestIds.current.users;
    const params = { fechaDesde, fechaHasta, granularidad: selectedGranularidad };
    const key = reportCacheKey('admin:actividad-usuarios', params);
    const enMemoria = peekReportCache<any>(key);
    if (enMemoria === undefined) setUsersLoading(true);
    setUsersError(null);
    try {
      const res =
        enMemoria ?? (await cachedReportRequest(key, () => api.getReporteActividadUsuarios(params)));
      if (id !== requestIds.current.users) return;
      if (!res?.kpis || !Array.isArray(res?.evolucionTemporal)) {
        throw new Error('El servidor devolvió una respuesta incompleta para este reporte.');
      }
      setUserActivity(res);
    } catch (err) {
      if (id !== requestIds.current.users) return;
      setUsersError(mensajeError(err));
    } finally {
      if (id === requestIds.current.users) setUsersLoading(false);
    }
  }, [fechaDesde, fechaHasta, selectedGranularidad]);

  const fetchBusinesses = useCallback(async () => {
    const id = ++requestIds.current.businesses;
    const params = {
      fechaDesde,
      fechaHasta,
      categoriaId,
      departamentoId,
      search: searchQuery || undefined,
      page: 1,
      limit: BUSINESSES_FETCH_LIMIT,
    };
    const key = reportCacheKey('admin:negocios-locales', params);
    const enMemoria = peekReportCache<any>(key);
    if (enMemoria === undefined) setBusinessesLoading(true);
    setBusinessesError(null);
    try {
      const res =
        enMemoria ?? (await cachedReportRequest(key, () => api.getReporteNegociosAdmin(params)));
      if (id !== requestIds.current.businesses) return;
      setBusinesses(Array.isArray(res?.data) ? res.data : []);
      setTopGrowth(Array.isArray(res?.top10MayorCrecimiento) ? res.top10MayorCrecimiento : []);
    } catch (err) {
      if (id !== requestIds.current.businesses) return;
      setBusinessesError(mensajeError(err));
    } finally {
      if (id === requestIds.current.businesses) setBusinessesLoading(false);
    }
  }, [fechaDesde, fechaHasta, categoriaId, departamentoId, searchQuery]);

  const fetchAi = useCallback(async () => {
    const id = ++requestIds.current.ai;
    const params = { fechaDesde, fechaHasta };
    const key = reportCacheKey('admin:asistente-ia', params);
    const enMemoria = peekReportCache<any>(key);
    if (enMemoria === undefined) setAiLoading(true);
    setAiError(null);
    try {
      const res =
        enMemoria ?? (await cachedReportRequest(key, () => api.getReporteAsistenteIa(params)));
      if (id !== requestIds.current.ai) return;
      if (!res?.metricas || !Array.isArray(res?.distribucionTematica)) {
        throw new Error('El servidor devolvió una respuesta incompleta para este reporte.');
      }
      setAiReport(res);
    } catch (err) {
      if (id !== requestIds.current.ai) return;
      setAiError(mensajeError(err));
    } finally {
      if (id === requestIds.current.ai) setAiLoading(false);
    }
  }, [fechaDesde, fechaHasta]);

  // Al cambiar un filtro se recalcula automáticamente el reporte visible (US-RYI-06)
  useEffect(() => {
    if (!filtersReady) return;
    if (activeTab === 'pois') fetchPois();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'businesses') fetchBusinesses();
    else fetchAi();
  }, [filtersReady, activeTab, fetchPois, fetchUsers, fetchBusinesses, fetchAi]);

  const handleFilterChange = (next: FiltrosReporteState) => {
    setFilters(next);
    saveSessionReportFilters(next);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    clearSessionReportFilters();
    setFilters(getDefaultReportFilters());
    setSortBy('visitasEfectivas');
    setSortOrder('DESC');
    setSelectedGranularidad('auto');
    setCurrentPage(1);
  };

  const handleSortChange = (column: SortByPoiReporte) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  const handleSelectPoi = async (poiId: string) => {
    const id = ++requestIds.current.detail;
    setPoiDetail(null);
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const res = await api.getDetalleMensualPoi(poiId, { fechaDesde, fechaHasta });
      if (id !== requestIds.current.detail) return;
      setPoiDetail(res?.distribucionMensual ? res : null);
    } catch {
      if (id !== requestIds.current.detail) return;
      setPoiDetail(null);
    } finally {
      if (id === requestIds.current.detail) setIsDetailLoading(false);
    }
  };

  const handleUmbralChange = async (nuevoUmbral: number) => {
    await api.updateUmbralCostoAsistente(nuevoUmbral);
    // El umbral forma parte del reporte: lo guardado en memoria quedó desactualizado
    clearReportCache('admin:asistente-ia');
    await fetchAi();
  };

  // ---- US-RYI-05: Exportación
  const [isExportOpen, setIsExportOpen] = useState(false);
  /** Rango mayor a 365 días que el usuario quiso consultar y se deriva a exportación */
  const [exportRangeOverride, setExportRangeOverride] = useState<{
    fechaDesde: string;
    fechaHasta: string;
  } | null>(null);

  const categoriaNombre = filterOptions.categorias.find((c) => c.id === categoriaId)?.nombre;

  const exportFiltros: FiltrosExportacion = {
    fechaDesde: exportRangeOverride?.fechaDesde ?? fechaDesde,
    fechaHasta: exportRangeOverride?.fechaHasta ?? fechaHasta,
    categoriaId,
    categoriaNombre,
    departamento: departamentoId,
    search: searchQuery || undefined,
    ordenarPor: activeTab === 'pois' ? sortBy : undefined,
    orden: activeTab === 'pois' ? sortOrder : undefined,
  };

  const isZeroUserActivity = useMemo(() => {
    if (!userActivity) return false;
    const { kpis } = userActivity;
    return (
      kpis.nuevosRegistros.actual === 0 &&
      kpis.usuariosActivosUnicos.actual === 0 &&
      kpis.itinerariosCreados.actual === 0 &&
      kpis.itinerariosFinalizados.actual === 0 &&
      kpis.resenasAprobadas.actual === 0 &&
      kpis.conversacionesIaIniciadas.actual === 0
    );
  }, [userActivity]);

  const hayDatosParaExportar =
    exportRangeOverride !== null ||
    (activeTab === 'pois' && !poisLoading && !poisError && poisTotal > 0) ||
    (activeTab === 'users' && !usersLoading && !usersError && !!userActivity) ||
    (activeTab === 'businesses' && !businessesLoading && !businessesError && businesses.length > 0) ||
    (activeTab === 'ai' && !aiLoading && !aiError && !!aiReport);

  const sinConversaciones = !!aiReport && aiReport.metricas.totalConversaciones === 0;

  return (
    <div className="space-y-8 font-wixText">
      {/* Encabezado del módulo */}
      <div className="bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-accentWine/10 border border-accentWine/20 px-3 py-1 rounded-full text-xs font-bold text-accentWine">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Reportes e Informes</span>
            </div>
            <h1 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
              Centro de Analíticas y Reportes Estadísticos
            </h1>
            <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
              Monitoreá los atractivos turísticos más visitados, el desempeño de los negocios locales, la actividad de los usuarios y el uso del asistente IA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setExportRangeOverride(null);
              setIsExportOpen(true);
            }}
            className="px-5 py-3 bg-accentWine hover:bg-accentWine/90 text-white rounded-2xl text-xs font-bold shadow-lg shadow-accentWine/20 transition-all flex items-center space-x-2 cursor-pointer flex-shrink-0 self-start md:self-auto"
            title="Exportar el reporte visible en PDF, Excel (XLSX) o CSV"
          >
            <Download className="h-4 w-4" />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Pestañas de reportes */}
      <div className="flex flex-wrap gap-2 border-b border-black/5 pb-2" role="tablist" aria-label="Reportes disponibles">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
                selected
                  ? 'bg-accentWine text-white shadow-md shadow-accentWine/10'
                  : 'text-textDark/70 hover:bg-black/5 hover:text-textDark'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filtros globales persistentes (US-RYI-06) */}
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
        onRetryOpciones={filterOptions.reintentar}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onSuggestExport={(rango) => {
          setExportRangeOverride(rango);
          setIsExportOpen(true);
        }}
      />

      {(activeTab === 'users' || activeTab === 'ai') &&
        (categoriaId || departamentoId || searchQuery) && (
          <p className="text-[11px] text-textDark/60 -mt-4 px-1">
            Este reporte muestra métricas generales de la plataforma: se filtra por período. Los filtros de categoría, zona y búsqueda se aplican a los reportes de POIs y de negocios.
          </p>
        )}

      {/* ---- POIs más visitados ---- */}
      {activeTab === 'pois' && (
        <div className="space-y-8">
          {poisLoading && poisData.length === 0 ? (
            <ReportLoadingState message="Calculando los POIs más visitados del período..." />
          ) : poisError ? (
            <ReportErrorState message={poisError} onRetry={fetchPois} />
          ) : poisTotal === 0 ? (
            <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-4 shadow-xs">
              <div className="h-16 w-16 rounded-full bg-accentWine/10 text-accentWine flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="font-wixDisplay text-lg font-bold text-textDark">
                  No hay itinerarios finalizados en ese rango
                </h3>
                <p className="text-xs text-textDark/60 leading-relaxed">
                  No se registraron itinerarios finalizados ni en curso entre el{' '}
                  <strong className="text-textDark">{fechaDesde}</strong> y el{' '}
                  <strong className="text-textDark">{fechaHasta}</strong> para los filtros aplicados.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-5 py-2.5 bg-accentWine hover:bg-accentWine/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-accentWine/10 inline-flex items-center space-x-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Restablecer filtros</span>
              </button>
            </div>
          ) : (
            <div className={poisLoading ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'} aria-busy={poisLoading}>
              <div className="space-y-8">
                <Top10PoiBarChart data={top10Data} onSelectPoi={handleSelectPoi} />
                <PoisReportTable
                  data={poisData}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  onSelectPoi={handleSelectPoi}
                  currentPage={currentPage}
                  pageSize={PAGE_SIZE}
                  totalPages={poisTotalPages}
                  totalRecords={poisTotal}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          )}

          <PoiMonthlyDetailModal
            detail={poiDetail}
            isOpen={isDetailOpen}
            onClose={() => {
              requestIds.current.detail++;
              setIsDetailOpen(false);
              setPoiDetail(null);
            }}
            isLoading={isDetailLoading}
          />
        </div>
      )}

      {/* ---- Actividad de usuarios ---- */}
      {activeTab === 'users' && (
        <div className="space-y-8">
          {usersLoading && !userActivity ? (
            <ReportLoadingState message="Calculando métricas de actividad del período..." />
          ) : usersError ? (
            <ReportErrorState message={usersError} onRetry={fetchUsers} />
          ) : userActivity ? (
            <div className={`space-y-8 ${usersLoading ? 'opacity-60 pointer-events-none' : ''}`} aria-busy={usersLoading}>
              {isZeroUserActivity && (
                <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex items-start space-x-4" role="status">
                  <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-wixDisplay text-base font-bold text-amber-900">
                      No hubo actividad en el período seleccionado
                    </h3>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      No se registraron altas, itinerarios ni interacciones entre el{' '}
                      <strong>{fechaDesde}</strong> y el <strong>{fechaHasta}</strong>. Todas las métricas se muestran en cero.
                    </p>
                  </div>
                </div>
              )}

              <UserActivityKpis
                kpis={userActivity.kpis}
                periodoActual={userActivity.meta.periodoActual}
                periodoAnterior={userActivity.meta.periodoAnterior}
              />

              <UserActivityLineChart
                data={userActivity.evolucionTemporal}
                granularidadAplicada={userActivity.meta.granularidadAplicada}
                selectedGranularidad={selectedGranularidad}
                onGranularidadChange={setSelectedGranularidad}
              />

              <div className="p-4 rounded-2xl bg-bgPrimary/60 border border-black/5 text-xs text-textDark/60 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Este reporte muestra únicamente métricas agregadas: no expone información de usuarios individuales.
                </span>
                <span className="font-semibold text-accentWine">
                  Días analizados: {userActivity.meta.totalDias}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ---- Negocios locales ---- */}
      {activeTab === 'businesses' && (
        <div className="space-y-8">
          {businessesLoading && businesses.length === 0 ? (
            <ReportLoadingState message="Consultando el desempeño de los negocios locales..." />
          ) : businessesError ? (
            <ReportErrorState message={businessesError} onRetry={fetchBusinesses} />
          ) : businesses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
              <Store className="h-10 w-10 mx-auto text-textDark/30" />
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">
                No se encontraron negocios para los filtros aplicados
              </h3>
              <p className="text-xs text-textDark/60">
                Probá con otra categoría, zona o texto de búsqueda.
              </p>
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
            <div className={businessesLoading ? 'opacity-60 pointer-events-none' : ''} aria-busy={businessesLoading}>
              <AdminLocalBusinessesReport businesses={businesses} topGrowth={topGrowth} />
            </div>
          )}
        </div>
      )}

      {/* ---- Uso del asistente IA ---- */}
      {activeTab === 'ai' && (
        <div className="space-y-8">
          {aiLoading && !aiReport ? (
            <ReportLoadingState message="Calculando conversaciones, tokens y costo estimado..." />
          ) : aiError ? (
            <ReportErrorState message={aiError} onRetry={fetchAi} />
          ) : aiReport ? (
            <div className={`space-y-8 ${aiLoading ? 'opacity-60 pointer-events-none' : ''}`} aria-busy={aiLoading}>
              {sinConversaciones && (
                <div className="bg-white rounded-3xl border border-black/5 p-6 flex items-start space-x-4 shadow-xs" role="status">
                  <Bot className="h-6 w-6 text-accentWine flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="font-wixDisplay text-base font-bold text-textDark">
                      No hay conversaciones en este período
                    </h3>
                    <p className="text-xs text-textDark/60 leading-relaxed">
                      No se iniciaron conversaciones con el asistente entre el{' '}
                      <strong className="text-textDark">{fechaDesde}</strong> y el{' '}
                      <strong className="text-textDark">{fechaHasta}</strong>. Las métricas se muestran en cero.
                    </p>
                  </div>
                </div>
              )}

              <AiAssistantUsageKpis metricas={aiReport.metricas} onUmbralChange={handleUmbralChange} />

              <AiThematicPieChart
                distribucion={aiReport.distribucionTematica}
                datosSemanaAnterior={aiReport.datosSemanaAnterior}
                mensajeEstadoProcesamiento={aiReport.mensajeEstadoProcesamiento}
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Exportación (US-RYI-05) */}
      <ExportReportModal
        isOpen={isExportOpen}
        onClose={() => {
          setIsExportOpen(false);
          setExportRangeOverride(null);
        }}
        rol="admin"
        tipoReporte={REPORTES[activeTab].tipo}
        nombreReporte={REPORTES[activeTab].nombre}
        filtros={exportFiltros}
        hayDatos={hayDatosParaExportar}
      />
    </div>
  );
}
