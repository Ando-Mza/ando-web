'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bug,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  ImageIcon,
  Mail,
  Search,
  X,
} from 'lucide-react';
import { api, ReporteErrorAdmin } from '@/utils/api';
import { ReportErrorState, ReportLoadingState } from '@/components/reports/ReportStates';

const PAGE_SIZE = 20;
const ESPERA_BUSQUEDA_MS = 400;

function fechaLegible(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

/**
 * US-AYS-07: reportes de error enviados por los usuarios (US-AYS-05), para que el equipo
 * pueda consultarlos y ubicarlos por su identificador de incidente.
 */
export default function AdminErrorReportsPage() {
  const [reportes, setReportes] = useState<ReporteErrorAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // La búsqueda se aplica con una breve espera para no consultar al servidor en cada tecla
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [seleccionado, setSeleccionado] = useState<ReporteErrorAdmin | null>(null);
  const [copiado, setCopiado] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, ESPERA_BUSQUEDA_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchReportes = useCallback(async () => {
    const id = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getReportesError({ search: search || undefined, page, limit: PAGE_SIZE });
      if (id !== requestId.current) return;
      setReportes(Array.isArray(res?.data) ? res.data : []);
      setTotal(res?.meta?.total ?? 0);
      setTotalPages(Math.max(res?.meta?.totalPages ?? 1, 1));
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
  }, [search, page]);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  useEffect(() => {
    if (!seleccionado) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && setSeleccionado(null);
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [seleccionado]);

  const copiarCodigo = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Sin permiso de portapapeles: el identificador queda visible para copiarlo a mano
    }
  };

  const desde = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const hasta = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-8 font-wixText">
      {/* Encabezado */}
      <div className="bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/20 rounded-3xl p-6 sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-accentWine/10 border border-accentWine/20 px-3 py-1 rounded-full text-xs font-bold text-accentWine">
            <Bug className="h-3.5 w-3.5" />
            <span>Reportes de error</span>
          </div>
          <h1 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
            Reportes de error de los usuarios
          </h1>
          <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
            Errores que los usuarios reportaron desde la web y la app. Buscá por el identificador de incidente que recibió el usuario para ver el detalle.
          </p>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textDark/40" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Buscar reportes de error"
            placeholder="Identificador, asunto o correo del usuario"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/20"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              aria-label="Borrar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-textDark/50 hover:text-textDark hover:bg-black/5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <span className="text-xs font-semibold text-textDark/60">
          {total} {total === 1 ? 'reporte' : 'reportes'}
          {search ? ' para esta búsqueda' : ''}
        </span>
      </div>

      {/* Listado */}
      {isLoading && reportes.length === 0 ? (
        <ReportLoadingState message="Cargando los reportes de error..." />
      ) : error ? (
        <ReportErrorState message={error} onRetry={fetchReportes} />
      ) : total === 0 ? (
        <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
          <div className="h-14 w-14 rounded-full bg-accentWine/10 text-accentWine flex items-center justify-center mx-auto">
            <Bug className="h-7 w-7" />
          </div>
          <h3 className="font-wixDisplay text-lg font-bold text-textDark">
            {search ? 'Ningún reporte coincide con la búsqueda' : 'Todavía no hay reportes de error'}
          </h3>
          <p className="text-xs text-textDark/60 max-w-md mx-auto leading-relaxed">
            {search
              ? 'Revisá que el identificador esté completo, por ejemplo INC-261013-K7QD.'
              : 'Cuando un usuario reporte un error desde la web o la app, va a aparecer acá.'}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearchInput('')}
              className="px-5 py-2.5 bg-accentWine hover:bg-accentWine/90 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Ver todos los reportes
            </button>
          )}
        </div>
      ) : (
        <div
          className={`bg-white rounded-3xl border border-black/5 shadow-xs p-6 space-y-4 ${
            isLoading ? 'opacity-60 pointer-events-none' : ''
          }`}
          aria-busy={isLoading}
        >
          <div className="overflow-x-auto border border-black/5 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bgPrimary/60 border-b border-black/5 text-textDark/60 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Identificador</th>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Reportado por</th>
                  <th className="py-3 px-3">Asunto</th>
                  <th className="py-3 px-3 text-center">Capturas</th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {reportes.map((reporte) => (
                  <tr key={reporte.id} className="hover:bg-accentWine/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-accentWine whitespace-nowrap">
                      {reporte.codigo}
                    </td>
                    <td className="py-3.5 px-3 text-textDark/70 whitespace-nowrap">
                      {fechaLegible(reporte.fechaCreacion)}
                    </td>
                    <td className="py-3.5 px-3">
                      {reporte.usuario ? (
                        <div className="min-w-0">
                          <p className="font-bold text-textDark truncate">
                            {reporte.usuario.nombre || reporte.usuario.email}
                          </p>
                          {reporte.usuario.nombre && (
                            <p className="text-[10px] text-textDark/50 truncate">{reporte.usuario.email}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-textDark/50">Usuario no disponible</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-textDark max-w-xs">
                      <p className="truncate" title={reporte.asunto}>
                        {reporte.asunto}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-textDark/70">
                      {reporte.evidencias.length}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setCopiado(false);
                          setSeleccionado(reporte);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-black/10 text-[11px] font-bold text-textDark hover:bg-black/5 cursor-pointer whitespace-nowrap"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-textDark/70">
            <div>
              Mostrando <span className="text-textDark font-bold">{desde}</span> a{' '}
              <span className="text-textDark font-bold">{hasta}</span> de{' '}
              <span className="text-accentWine font-black">{total}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                aria-label="Página anterior"
                className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                aria-label="Página siguiente"
                className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detalle del reporte */}
      {seleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Reporte ${seleccionado.codigo}`}
          onClick={() => setSeleccionado(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-black/5">
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-textDark/50">
                  Identificador del incidente
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-lg font-black text-accentWine break-all">
                    {seleccionado.codigo}
                  </span>
                  <button
                    type="button"
                    onClick={() => copiarCodigo(seleccionado.codigo)}
                    className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-textDark/70 hover:text-textDark hover:bg-black/5 cursor-pointer"
                  >
                    {copiado ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-green-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSeleccionado(null)}
                aria-label="Cerrar detalle"
                className="p-1.5 rounded-full text-textDark/50 hover:text-textDark hover:bg-black/5 cursor-pointer flex-shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-textDark/50">Fecha</p>
                  <p className="font-semibold text-textDark mt-1">{fechaLegible(seleccionado.fechaCreacion)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-textDark/50">
                    Reportado por
                  </p>
                  {seleccionado.usuario ? (
                    <div className="mt-1 space-y-0.5">
                      {seleccionado.usuario.nombre && (
                        <p className="font-semibold text-textDark">{seleccionado.usuario.nombre}</p>
                      )}
                      <p className="text-textDark/70 flex items-center space-x-1 break-all">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="select-all">{seleccionado.usuario.email}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-textDark/50 mt-1">Usuario no disponible</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-textDark/50">Asunto</p>
                <p className="text-sm font-bold text-textDark mt-1 break-words">{seleccionado.asunto}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-textDark/50">Descripción</p>
                <p className="text-xs text-textDark/80 mt-1 leading-relaxed whitespace-pre-wrap break-words">
                  {seleccionado.descripcion}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-textDark/50">
                  Capturas adjuntas ({seleccionado.evidencias.length})
                </p>
                {seleccionado.evidencias.length === 0 ? (
                  <p className="text-xs text-textDark/50 mt-1">El usuario no adjuntó capturas.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                    {seleccionado.evidencias.map((url, idx) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir la captura en una pestaña nueva"
                        className="group relative block aspect-video rounded-xl overflow-hidden border border-black/10 bg-bgPrimary"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Captura ${idx + 1} del reporte ${seleccionado.codigo}`}
                          className="h-full w-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                        <span className="absolute bottom-1 left-1 inline-flex items-center space-x-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                          <ImageIcon className="h-3 w-3" />
                          <span>{idx + 1}</span>
                        </span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
