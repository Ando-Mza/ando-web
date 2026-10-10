'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Search,
  Calendar,
  Download,
  User as UserIcon,
  Shield,
  AlertTriangle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  X,
  RefreshCw,
  Lock,
  Activity,
  Layers,
  Check
} from 'lucide-react';
import { api, ApiError } from '@/utils/api';
import { AuditoriaLogItemDto, EventoAuditoriaTipo } from '@/types/audit';
import { describirEvento, getTipoEventoMeta } from '@/utils/auditEventTypes';
import { triggerBlobDownload } from '@/utils/exportDownloads';
import { MENSAJE_SIN_PERMISOS, setFlashMessage } from '@/components/common/FlashMessage';

// Criterio de Aceptación 1: paginados de a 50 registros
const ITEMS_PER_PAGE = 50;

export default function AdminLogsPage() {
  const router = useRouter();
  const { currentUser, isAuthLoading, users } = useApp();

  // Datos (siempre desde el backend: tabla AuditoriaLog)
  const [logs, setLogs] = useState<AuditoriaLogItemDto[]>([]);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Filtros combinables: se aplican en el servidor sobre todos los registros
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');
  const [tipoEvento, setTipoEvento] = useState<EventoAuditoriaTipo>('all');
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>('all');
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Modal de Detalle (Solo lectura)
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditoriaLogItemDto | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const requestId = useRef(0);
  const isAdmin = currentUser?.role === 'admin';

  // Criterio de Aceptación 8: sin rol de Administrador se deniega el acceso y se redirige al inicio
  const denyAccess = useCallback(() => {
    setAccessDeniedMessage(MENSAJE_SIN_PERMISOS);
    setFlashMessage(MENSAJE_SIN_PERMISOS);
    router.replace('/');
  }, [router]);

  useEffect(() => {
    if (isAuthLoading) return;
    if (currentUser && !isAdmin) denyAccess();
  }, [currentUser, isAdmin, isAuthLoading, denyAccess]);

  // La búsqueda por texto se aplica con una breve espera para no consultar en cada tecla
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const dateRangeError =
    fechaDesde && fechaHasta && fechaDesde > fechaHasta
      ? 'La fecha "Desde" no puede ser posterior a la fecha "Hasta".'
      : null;

  const fetchLogs = useCallback(async () => {
    if (dateRangeError) return;
    const id = ++requestId.current;
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await api.getAuditLogs({
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        tipoEvento: tipoEvento !== 'all' ? tipoEvento : undefined,
        usuarioId: selectedUsuarioId !== 'all' ? selectedUsuarioId : undefined,
        search: searchQuery || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      if (id !== requestId.current) return;
      if (!response || !Array.isArray(response.data)) {
        throw new Error('El servidor devolvió una respuesta inválida.');
      }
      setLogs(response.data);
      setTotalLogs(response.meta?.total ?? response.data.length);
      setTotalPages(Math.max(response.meta?.totalPages ?? 1, 1));
      setHasLoaded(true);
    } catch (err) {
      if (id !== requestId.current) return;
      if (err instanceof ApiError && err.status === 403) {
        denyAccess();
        return;
      }
      setLoadError(
        err instanceof Error && err.message
          ? err.message
          : 'No se pudieron cargar los registros de auditoría.'
      );
    } finally {
      if (id === requestId.current) setIsLoading(false);
    }
  }, [fechaDesde, fechaHasta, tipoEvento, selectedUsuarioId, searchQuery, currentPage, dateRangeError, denyAccess]);

  useEffect(() => {
    if (isAuthLoading || !isAdmin) return;
    fetchLogs();
  }, [fetchLogs, isAuthLoading, isAdmin]);

  // Si el total se redujo (por ejemplo, tras filtrar) y la página quedó fuera de rango
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  // Usuarios de la plataforma para el filtro por Usuario
  const usersForFilter = useMemo(
    () =>
      [...users]
        .filter((u) => !!u.id)
        .map((u) => ({ id: u.id, name: u.name || u.email, email: u.email }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users]
  );

  const hasActiveFilters = Boolean(
    fechaDesde ||
    fechaHasta ||
    tipoEvento !== 'all' ||
    selectedUsuarioId !== 'all' ||
    searchQuery
  );

  const resetFilters = () => {
    setFechaDesde('');
    setFechaHasta('');
    setTipoEvento('all');
    setSelectedUsuarioId('all');
    setSearchInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Exporta a CSV los registros de la página visible (solo lectura)
  const handleExportCSV = () => {
    const celda = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const filas = [
      ['ID', 'Fecha y hora', 'Tipo de evento', 'Acción', 'Entidad', 'Usuario', 'Email', 'IP', 'Detalle']
        .map(celda)
        .join(','),
      ...logs.map((l) =>
        [
          l.id,
          new Date(l.fechaCreacion).toISOString(),
          getTipoEventoMeta(l.tipoEvento).label,
          l.accion,
          l.entidad,
          l.usuario ? `${l.usuario.nombre} ${l.usuario.apellido}` : l.usuarioId || 'Sistema',
          l.usuario?.email || '',
          l.ip || '',
          l.detalle ? JSON.stringify(l.detalle) : '',
        ]
          .map(celda)
          .join(',')
      ),
    ];
    const blob = new Blob(['\uFEFF' + filas.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    triggerBlobDownload(blob, `auditoria_logs_${new Date().toISOString().slice(0, 10)}_pagina_${currentPage}.csv`);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // El navegador no permitió copiar: el detalle sigue visible para copiarlo a mano
    }
  };

  const firstRecord = totalLogs === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const lastRecord = Math.min(currentPage * ITEMS_PER_PAGE, totalLogs);

  // Pantalla de Denegación de Acceso si el usuario no es Administrador
  if (accessDeniedMessage) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-wixText px-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 text-center shadow-xl space-y-5 animate-in fade-in duration-300">
          <div className="h-16 w-16 mx-auto bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-200">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="font-wixDisplay text-xl font-black text-textDark">
              Acceso Denegado
            </h3>
            <p className="text-sm font-bold text-red-600">
              {accessDeniedMessage}
            </p>
            <p className="text-xs text-textDark/60">
              Redirigiendo al inicio...
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 bg-accentWine text-white rounded-xl text-xs font-bold hover:bg-accentWine/90 transition-all cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-wixText">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-accentWine/10 border border-accentWine/20 px-3 py-1 rounded-full text-xs font-bold text-accentWine">
              <Shield className="h-3.5 w-3.5" />
              <span>Auditoría y Trazabilidad</span>
            </div>
            <h2 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
              Visualización de LOGs del Sistema
            </h2>
            <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
              Supervisá el comportamiento del sistema, detectá errores y rastreá las acciones de los usuarios. Los registros son de solo lectura.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={() => fetchLogs()}
              disabled={isLoading}
              title="Actualizar registros desde el servidor"
              className="p-3 bg-white border border-black/10 hover:bg-black/5 text-textDark rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-accentWine' : 'text-textDark/70'}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              onClick={handleExportCSV}
              disabled={logs.length === 0 || isLoading}
              title="Descargar en CSV los registros de la página visible"
              className="px-5 py-3 bg-accentWine hover:bg-accentWine/90 text-white rounded-2xl text-xs font-bold shadow-lg shadow-accentWine/20 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>Exportar página (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Filtros Combinables */}
      <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-textDark">
            <Activity className="h-4 w-4 text-accentWine" />
            <span>Filtros Combinables</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs font-bold text-accentWine hover:text-accentWine/80 flex items-center space-x-1 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Filtro por Rango de Fechas - Desde */}
          <div>
            <label htmlFor="logs-fecha-desde" className="block text-[11px] font-bold text-textDark/70 mb-1">
              Fecha desde
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40" />
              <input
                id="logs-fecha-desde"
                type="date"
                max={fechaHasta || undefined}
                value={fechaDesde}
                onChange={(e) => {
                  setFechaDesde(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
              />
            </div>
          </div>

          {/* 1. Filtro por Rango de Fechas - Hasta */}
          <div>
            <label htmlFor="logs-fecha-hasta" className="block text-[11px] font-bold text-textDark/70 mb-1">
              Fecha hasta
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40" />
              <input
                id="logs-fecha-hasta"
                type="date"
                min={fechaDesde || undefined}
                value={fechaHasta}
                onChange={(e) => {
                  setFechaHasta(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
              />
            </div>
          </div>

          {/* 2. Filtro por Tipo de Evento (4 requeridos: acción de Usuario, error del sistema, cambio en POI, login fallido) */}
          <div>
            <label htmlFor="logs-tipo-evento" className="block text-[11px] font-bold text-textDark/70 mb-1">
              Tipo de evento
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40 pointer-events-none" />
              <select
                id="logs-tipo-evento"
                value={tipoEvento}
                onChange={(e) => {
                  setTipoEvento(e.target.value as EventoAuditoriaTipo);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20 appearance-none cursor-pointer"
              >
                <option value="all">Todos los tipos de evento</option>
                <option value="accion_usuario">Acción de Usuario</option>
                <option value="error_sistema">Error del sistema</option>
                <option value="cambio_poi">Cambio en POI</option>
                <option value="login_fallido">Login fallido</option>
              </select>
            </div>
          </div>

          {/* 3. Filtro por Usuario */}
          <div>
            <label htmlFor="logs-usuario" className="block text-[11px] font-bold text-textDark/70 mb-1">
              Usuario
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40 pointer-events-none" />
              <select
                id="logs-usuario"
                value={selectedUsuarioId}
                onChange={(e) => {
                  setSelectedUsuarioId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20 appearance-none cursor-pointer"
              >
                <option value="all">Todos los usuarios</option>
                {usersForFilter.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.email && u.email !== u.name ? `(${u.email})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Barra de Búsqueda libre */}
        <div>
          <label htmlFor="logs-busqueda" className="block text-[11px] font-bold text-textDark/70 mb-1">
            Búsqueda por texto (usuario, acción, entidad, IP o detalle)
          </label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textDark/40" />
            <input
              id="logs-busqueda"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por usuario, email, IP, acción o texto del detalle..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            />
          </div>
        </div>

        {dateRangeError && (
          <p className="text-[11px] font-bold text-red-600 flex items-center space-x-1.5" role="alert">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{dateRangeError} El filtro no se aplicó.</span>
          </p>
        )}

        {/* Resumen de filtros aplicados */}
        {hasActiveFilters && (
          <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-textDark/50 font-bold">Filtros activos:</span>
            {fechaDesde && (
              <span className="bg-bgPrimary text-textDark px-2.5 py-1 rounded-lg border border-black/10">
                Desde: {fechaDesde}
              </span>
            )}
            {fechaHasta && (
              <span className="bg-bgPrimary text-textDark px-2.5 py-1 rounded-lg border border-black/10">
                Hasta: {fechaHasta}
              </span>
            )}
            {tipoEvento !== 'all' && (
              <span className="bg-accentWine/10 text-accentWine font-bold px-2.5 py-1 rounded-lg border border-accentWine/20">
                Evento: {getTipoEventoMeta(tipoEvento).label}
              </span>
            )}
            {selectedUsuarioId !== 'all' && (
              <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg border border-blue-200">
                Usuario: {usersForFilter.find(u => u.id === selectedUsuarioId)?.name || selectedUsuarioId}
              </span>
            )}
            {searchQuery && (
              <span className="bg-bgPrimary text-textDark px-2.5 py-1 rounded-lg border border-black/10">
                Texto: &quot;{searchQuery}&quot;
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tabla de Registros de Logs (Solo Lectura) */}
      <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
        {isLoading && !hasLoaded ? (
          <div className="py-16 text-center text-xs text-textDark/70 space-y-3" role="status" aria-live="polite">
            <div className="h-9 w-9 border-3 border-accentWine border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-bold text-textDark/70">Cargando registros de auditoría...</p>
          </div>
        ) : loadError ? (
          <div className="py-14 text-center text-xs text-textDark/70 space-y-3" role="alert">
            <AlertCircle className="h-10 w-10 mx-auto text-red-500" />
            <p className="font-bold text-sm text-textDark">No pudimos cargar los registros</p>
            <p className="text-xs text-textDark/60 max-w-sm mx-auto">{loadError}</p>
            <button
              onClick={() => fetchLogs()}
              className="mt-2 px-4 py-2 bg-accentWine hover:bg-accentWine/90 rounded-xl font-bold text-xs text-white transition-all cursor-pointer inline-flex items-center space-x-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        ) : totalLogs === 0 && !hasActiveFilters ? (
          /* Estado 1: el servidor no tiene registros de log disponibles */
          <div className="py-16 text-center text-xs text-textDark/70 space-y-3">
            <Clock className="h-10 w-10 mx-auto text-textDark/30" />
            <p className="font-bold text-sm text-textDark">
              No hay registros de actividad disponibles en este momento
            </p>
            <p className="text-xs text-textDark/50 max-w-sm mx-auto">
              Cuando los usuarios empiecen a operar en la plataforma, sus acciones van a aparecer acá.
            </p>
          </div>
        ) : totalLogs === 0 ? (
          /* Estado 2: No existen logs para los filtros aplicados */
          <div className="py-16 text-center text-xs text-textDark/70 space-y-3">
            <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
            <p className="font-bold text-sm text-textDark">
              No se encontraron registros para los filtros seleccionados
            </p>
            <p className="text-xs text-textDark/50 max-w-sm mx-auto">
              Probá modificando o limpiando el rango de fechas, el tipo de evento, el usuario o el texto buscado.
            </p>
            <button
              onClick={resetFilters}
              className="mt-2 px-4 py-2 bg-bgPrimary hover:bg-black/5 border border-black/10 rounded-xl font-bold text-xs text-textDark transition-all cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          /* Estado 3: Lista estructurada y paginada */
          <>
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="text-xs font-bold text-textDark">
                Mostrando {firstRecord}–{lastRecord} de{' '}
                <span className="text-accentWine">{totalLogs.toLocaleString('es-AR')}</span> registros
              </span>
              <span className="text-[11px] text-textDark/50 font-medium">
                Solo lectura • Ordenados del más reciente al más antiguo
              </span>
            </div>

            <div className={`overflow-x-auto ${isLoading ? 'opacity-60 pointer-events-none' : ''}`} aria-busy={isLoading}>
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 text-textDark/60 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-3 pr-4">Fecha y Hora</th>
                    <th className="pb-3 pr-4">Tipo de Evento</th>
                    <th className="pb-3 pr-4">Descripción del Evento</th>
                    <th className="pb-3 pr-4">Usuario Involucrado</th>
                    <th className="pb-3 pr-4">IP / Origen</th>
                    <th className="pb-3 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {logs.map((log) => {
                    const eventMeta = getTipoEventoMeta(log.tipoEvento);
                    const formattedDate = new Date(log.fechaCreacion).toLocaleString('es-AR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });

                    const eventDescription = describirEvento(log.accion, log.entidad, log.detalle);

                    return (
                      <tr 
                        key={log.id} 
                        className="hover:bg-bgPrimary/50 transition-colors group"
                      >
                        {/* 1. Fecha y hora del evento */}
                        <td className="py-3.5 pr-4 text-textDark/70 font-mono text-[11px] whitespace-nowrap">
                          {formattedDate}
                        </td>

                        {/* 2. Tipo de evento */}
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <span 
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${eventMeta.bgClass} ${eventMeta.colorClass} ${eventMeta.borderClass}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{eventMeta.label}</span>
                          </span>
                        </td>

                        {/* 3. Descripción del evento */}
                        <td className="py-3.5 pr-4 max-w-xs">
                          <div className="font-semibold text-textDark truncate" title={eventDescription}>
                            {eventDescription}
                          </div>
                          <div className="text-[10px] text-textDark/50 font-mono">
                            {log.entidad} • {log.accion}
                          </div>
                        </td>

                        {/* 4. Usuario involucrado si aplica */}
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          {log.usuario ? (
                            <div className="flex items-center space-x-2">
                              {log.usuario.avatarUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                  src={log.usuario.avatarUrl} 
                                  alt="" 
                                  className="w-5 h-5 rounded-full object-cover" 
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-accentWine/10 text-accentWine flex items-center justify-center text-[10px] font-bold">
                                  {log.usuario.nombre.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-textDark text-[11px]">
                                  {log.usuario.nombre} {log.usuario.apellido}
                                </div>
                                <div className="text-[10px] text-textDark/50">
                                  {log.usuario.email}
                                </div>
                              </div>
                            </div>
                          ) : log.usuarioId ? (
                            <div className="text-[11px] font-mono text-textDark/70">
                              UID: {log.usuarioId.slice(0, 8)}...
                            </div>
                          ) : (
                            <span className="text-textDark/40 text-[11px] italic">
                              Sistema / Anónimo
                            </span>
                          )}
                        </td>

                        {/* 5. IP de origen */}
                        <td className="py-3.5 pr-4 font-mono text-[11px] text-textDark/60 whitespace-nowrap">
                          {log.ip || '—'}
                        </td>

                        {/* 6. Acción Ver Detalle (Solo lectura) */}
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLogDetail(log)}
                            className="p-1.5 rounded-lg text-textDark/60 hover:text-accentWine hover:bg-accentWine/10 transition-colors cursor-pointer"
                            title="Ver detalles completos del evento"
                            aria-label="Ver detalles completos del evento"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Controles de Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-black/5 gap-3 text-xs text-textDark/70">
                <span>
                  Página <strong className="text-textDark">{currentPage}</strong> de <strong className="text-textDark">{totalPages}</strong> · {ITEMS_PER_PAGE} registros por página
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    aria-label="Página anterior"
                    className="p-2 rounded-xl border border-black/10 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Limitar botones si hay muchas páginas
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      Math.abs(pageNum - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-accentWine text-white shadow-sm'
                              : 'border border-black/10 hover:bg-black/5 text-textDark'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === 2 && currentPage > 3) {
                      return <span key="dots-1" className="px-1 text-textDark/40">...</span>;
                    }
                    if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                      return <span key="dots-2" className="px-1 text-textDark/40">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    aria-label="Página siguiente"
                    className="p-2 rounded-xl border border-black/10 hover:bg-black/5 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Detalle Estructurado (Solo Lectura) */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span 
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getTipoEventoMeta(selectedLogDetail.tipoEvento).bgClass} ${getTipoEventoMeta(selectedLogDetail.tipoEvento).colorClass} ${getTipoEventoMeta(selectedLogDetail.tipoEvento).borderClass}`}
                  >
                    <span>{getTipoEventoMeta(selectedLogDetail.tipoEvento).label}</span>
                  </span>
                  <span className="text-xs font-mono text-textDark/50">
                    ID: {selectedLogDetail.id}
                  </span>
                </div>
                <h3 className="font-wixDisplay text-xl font-bold text-textDark">
                  {describirEvento(selectedLogDetail.accion, selectedLogDetail.entidad, selectedLogDetail.detalle)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="p-2 text-textDark/50 hover:text-textDark hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metadatos del evento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-bgPrimary/60 p-4 rounded-2xl border border-black/5 text-xs">
              <div>
                <span className="text-textDark/50 block font-bold text-[10px] uppercase">Fecha y Hora</span>
                <span className="font-mono text-textDark font-semibold">
                  {new Date(selectedLogDetail.fechaCreacion).toLocaleString('es-AR')}
                </span>
              </div>
              <div>
                <span className="text-textDark/50 block font-bold text-[10px] uppercase">Entidad Afectada</span>
                <span className="font-semibold text-textDark">
                  {selectedLogDetail.entidad} {selectedLogDetail.entidadId ? `(${selectedLogDetail.entidadId})` : ''}
                </span>
              </div>
              <div>
                <span className="text-textDark/50 block font-bold text-[10px] uppercase">Usuario Involucrado</span>
                <span className="font-semibold text-textDark">
                  {selectedLogDetail.usuario 
                    ? `${selectedLogDetail.usuario.nombre} ${selectedLogDetail.usuario.apellido} (${selectedLogDetail.usuario.email})` 
                    : selectedLogDetail.usuarioId || 'Sistema / Sin sesión'}
                </span>
              </div>
              <div>
                <span className="text-textDark/50 block font-bold text-[10px] uppercase">Dirección IP</span>
                <span className="font-mono text-textDark font-semibold">
                  {selectedLogDetail.ip || 'No registrada'}
                </span>
              </div>
            </div>

            {/* Contexto y Payload de Detalle JSON */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textDark">
                  Detalle técnico del evento
                </span>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(selectedLogDetail.detalle || {}, null, 2), selectedLogDetail.id)}
                  className="text-[11px] font-bold text-accentWine hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  {copiedId === selectedLogDetail.id ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <span>Copiar JSON</span>
                  )}
                </button>
              </div>
              <pre className="bg-textDark text-white p-4 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-60">
                {selectedLogDetail.detalle
                  ? JSON.stringify(selectedLogDetail.detalle, null, 2)
                  : 'Este evento no tiene información adicional.'}
              </pre>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-textDark/60 border-t border-black/5">
              <span className="italic">
                Los registros de auditoría son de solo lectura.
              </span>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-5 py-2.5 bg-bgPrimary hover:bg-black/5 text-textDark font-bold rounded-xl border border-black/10 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
