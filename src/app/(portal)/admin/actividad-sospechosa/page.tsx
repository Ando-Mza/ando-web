'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  X,
} from 'lucide-react';
import { api } from '@/utils/api';
import type {
  AlertaCriticidad,
  AlertaEstado,
  AlertaSospechosa,
  AlertasFilters,
  AlertasMetricas,
  ReglaSospecha,
} from '@/types/suspicious';

const PAGE_SIZE = 20;
const EMPTY_MESSAGE = 'No hay actividades sospechosas pendientes de revisión';

const ESTADOS = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'revisada', label: 'Revisadas' },
  { value: 'cerrada', label: 'Cerradas' },
  { value: 'todos', label: 'Todas' },
];

const CRITICIDADES: { value: '' | AlertaCriticidad; label: string }[] = [
  { value: '', label: 'Todas las criticidades' },
  { value: 'critica', label: 'Crítica' },
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

const TIPOS_EVENTO: { value: string; label: string }[] = [
  { value: '', label: 'Todos los eventos' },
  { value: 'login_anomalo', label: 'Login anómalo' },
  { value: 'spam_resenas', label: 'Spam de reseñas' },
  { value: 'intento_fraude', label: 'Intento de fraude' },
  { value: 'multiples_reportes', label: 'Múltiples reportes' },
  { value: 'cambio_datos_sospechoso', label: 'Cambio de datos sospechoso' },
  { value: 'acceso_no_autorizado', label: 'Acceso no autorizado' },
  { value: 'otro', label: 'Otro' },
];

const tipoLabel = (v: string) => TIPOS_EVENTO.find((t) => t.value === v)?.label ?? v;

function CriticidadBadge({ nivel }: { nivel: AlertaCriticidad }) {
  const styles: Record<AlertaCriticidad, string> = {
    critica: 'bg-red-50 text-red-700 border-red-200',
    alta: 'bg-orange-50 text-orange-700 border-orange-200',
    media: 'bg-amber-50 text-amber-800 border-amber-200',
    baja: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const label = CRITICIDADES.find((c) => c.value === nivel)?.label ?? nivel;
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles[nivel] ?? styles.media}`}>
      {label}
    </span>
  );
}

function EstadoBadge({ estado }: { estado: AlertaEstado }) {
  const styles: Record<AlertaEstado, string> = {
    pendiente: 'bg-amber-50 text-amber-800 border-amber-200',
    revisada: 'bg-blue-50 text-blue-700 border-blue-200',
    cerrada: 'bg-green-50 text-green-700 border-green-200',
  };
  const label = ESTADOS.find((e) => e.value === estado)?.label.replace(/s$/, '') ?? estado;
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles[estado] ?? styles.pendiente}`}>
      {label}
    </span>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-xs">
      <p className="text-[10px] font-bold uppercase tracking-wider text-textDark/60">{label}</p>
      <p className={`text-2xl font-bold ${tone}`}>{value.toLocaleString('es-AR')}</p>
    </div>
  );
}

const userName = (u?: { nombre: string; apellido?: string }) =>
  u ? `${u.nombre} ${u.apellido ?? ''}`.trim() : 'Sistema / sin usuario';

export default function AdminActividadSospechosaPage() {
  const [estado, setEstado] = useState<NonNullable<AlertasFilters['estado']>>('pendiente');
  const [criticidad, setCriticidad] = useState<'' | AlertaCriticidad>('');
  const [tipoEvento, setTipoEvento] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [alertas, setAlertas] = useState<AlertaSospechosa[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetched, setFetched] = useState<{ key: string; error: string | null } | null>(null);
  const queryKey = [estado, criticidad, tipoEvento, fechaDesde, fechaHasta, page, reloadKey].join('|');
  const loading = fetched?.key !== queryKey;
  const error = fetched && !loading ? fetched.error : null;

  const [metricas, setMetricas] = useState<AlertasMetricas | null>(null);
  const [reglas, setReglas] = useState<ReglaSospecha[] | null>(null);
  const [showReglas, setShowReglas] = useState(false);

  const [selected, setSelected] = useState<AlertaSospechosa | null>(null);
  const [comentario, setComentario] = useState('');
  const [confirmClose, setConfirmClose] = useState(false);
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getAlertasSospechosas({
        estado,
        nivelCriticidad: criticidad || undefined,
        tipoEvento: tipoEvento || undefined,
        fechaDesde: fechaDesde || undefined,
        fechaHasta: fechaHasta || undefined,
        page,
        limit: PAGE_SIZE,
      })
      .then((res) => {
        if (cancelled) return;
        setAlertas(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
        setTotalPages(res.meta?.totalPages ?? 1);
        setFetched({ key: queryKey, error: null });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setFetched({ key: queryKey, error: e.message || 'No se pudieron cargar las alertas.' });
      });
    return () => {
      cancelled = true;
    };
  }, [estado, criticidad, tipoEvento, fechaDesde, fechaHasta, page, queryKey]);

  useEffect(() => {
    let cancelled = false;
    api
      .getAlertasMetricas()
      .then((m) => {
        if (!cancelled) setMetricas(m);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const toggleReglas = () => {
    setShowReglas((v) => !v);
    if (!reglas) {
      api
        .getReglasSospecha()
        .then(setReglas)
        .catch(() => setReglas([]));
    }
  };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const resetPage = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const openDetail = (a: AlertaSospechosa) => {
    setSelected(a);
    setComentario('');
    setConfirmClose(false);
    setActionError(null);
    api
      .getAlertaSospechosa(a.id)
      .then((fresh) => setSelected((cur) => (cur && cur.id === fresh.id ? fresh : cur)))
      .catch(() => undefined);
  };

  const closeDetail = () => {
    if (!acting) {
      setSelected(null);
      setConfirmClose(false);
    }
  };

  const runAction = async (kind: 'revisar' | 'cerrar') => {
    if (!selected) return;
    setActing(true);
    setActionError(null);
    try {
      const text = comentario.trim() || undefined;
      const updated =
        kind === 'revisar'
          ? await api.revisarAlerta(selected.id, text)
          : await api.cerrarAlerta(selected.id, text);
      setSelected(updated);
      setAlertas((list) => {
        const mapped = list.map((a) => (a.id === updated.id ? updated : a));
        // Con un filtro de estado activo, la alerta que cambia de estado sale de la tabla.
        return estado !== 'todos' && estado !== updated.estado
          ? mapped.filter((a) => a.id !== updated.id)
          : mapped;
      });
      setReloadKey((k) => k + 1);
      setConfirmClose(false);
      setComentario('');
      showToast(kind === 'revisar' ? 'Alerta marcada como revisada.' : 'Alerta cerrada correctamente.');
      if (kind === 'cerrar') setSelected(null);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo completar la acción.');
    } finally {
      setActing(false);
    }
  };

  const detalles = selected?.detalles && Object.keys(selected.detalles).length > 0 ? selected.detalles : null;

  return (
    <div className="space-y-8 font-wixText">
      <div className="rounded-3xl border border-accentWine/20 bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent p-6 sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-accentWine/20 bg-accentWine/10 px-3 py-1 text-xs font-bold text-accentWine">
            <Activity className="h-3.5 w-3.5" />
            <span>Monitoreo de Actividad Sospechosa</span>
          </div>
          <h2 className="font-wixDisplay text-2xl font-extrabold text-textDark sm:text-3xl">Alertas de seguridad</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-textDark/70 sm:text-sm">
            Revisá los eventos que superaron los umbrales de detección para prevenir fraudes y comportamientos que
            incumplen las políticas de la plataforma.
          </p>
        </div>
      </div>

      {metricas && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
          <MetricCard label="Pendientes" value={metricas.pendientes} tone="text-amber-600" />
          <MetricCard label="Revisadas" value={metricas.revisadas} tone="text-blue-600" />
          <MetricCard label="Cerradas" value={metricas.cerradas} tone="text-green-600" />
          <MetricCard label="Críticas" value={metricas.porCriticidad.critica} tone="text-red-600" />
          <MetricCard label="Altas" value={metricas.porCriticidad.alta} tone="text-orange-600" />
          <MetricCard label="Medias" value={metricas.porCriticidad.media} tone="text-amber-600" />
          <MetricCard label="Bajas" value={metricas.porCriticidad.baja} tone="text-slate-600" />
        </div>
      )}

      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-textDark/70">Estado</label>
            <select
              value={estado}
              onChange={(e) => resetPage(setEstado)(e.target.value as typeof estado)}
              className="w-full rounded-xl border border-black/10 bg-bgPrimary/60 px-3 py-2.5 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            >
              {ESTADOS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-textDark/70">Criticidad</label>
            <select
              value={criticidad}
              onChange={(e) => resetPage(setCriticidad)(e.target.value as typeof criticidad)}
              className="w-full rounded-xl border border-black/10 bg-bgPrimary/60 px-3 py-2.5 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            >
              {CRITICIDADES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-textDark/70">Tipo de evento</label>
            <select
              value={tipoEvento}
              onChange={(e) => resetPage(setTipoEvento)(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-bgPrimary/60 px-3 py-2.5 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            >
              {TIPOS_EVENTO.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-textDark/70">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              max={fechaHasta || undefined}
              onChange={(e) => resetPage(setFechaDesde)(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-bgPrimary/60 px-3 py-2.5 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold text-textDark/70">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde || undefined}
              onChange={(e) => resetPage(setFechaHasta)(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-bgPrimary/60 px-3 py-2.5 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-black/5 bg-white p-6 shadow-xs">
        {loading && (
          <div className="flex flex-col items-center justify-center space-y-3 py-16 text-textDark/60">
            <Loader2 className="h-8 w-8 animate-spin text-accentWine" />
            <p className="text-sm font-medium">Cargando...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-red-200 bg-red-50 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="cursor-pointer rounded-xl bg-accentWine px-5 py-2.5 text-xs font-bold text-white hover:opacity-90"
            >
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && alertas.length === 0 && (
          <div className="space-y-2 py-12 text-center text-xs text-textDark/60">
            <CheckCircle className="mx-auto h-8 w-8 text-textDark/30" />
            <p>{estado === 'pendiente' ? EMPTY_MESSAGE : 'No hay alertas para los filtros seleccionados.'}</p>
          </div>
        )}

        {!loading && !error && alertas.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 text-[10px] font-bold uppercase tracking-wider text-textDark/60">
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Usuario involucrado</th>
                    <th className="pb-3">Tipo de evento</th>
                    <th className="pb-3">Criticidad</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {alertas.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-bgPrimary/40">
                      <td className="py-3 font-mono text-[11px] text-textDark/60">
                        {new Date(a.fechaCreacion).toLocaleString('es-AR')}
                      </td>
                      <td className="py-3 font-bold text-textDark">{userName(a.usuario)}</td>
                      <td className="py-3 text-textDark/80">{tipoLabel(a.tipoEvento)}</td>
                      <td className="py-3">
                        <CriticidadBadge nivel={a.nivelCriticidad} />
                      </td>
                      <td className="py-3">
                        <EstadoBadge estado={a.estado} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => openDetail(a)}
                          className="inline-flex cursor-pointer items-center space-x-1 rounded-lg border border-black/10 px-3 py-1.5 text-[11px] font-bold text-textDark hover:bg-black/5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ver detalle</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-black/5 pt-4 text-xs text-textDark/70">
                <span>
                  Página {page} de {totalPages} ({total} alertas)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Página anterior"
                    className="cursor-pointer rounded-lg border border-black/10 p-2 hover:bg-black/5 disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    aria-label="Página siguiente"
                    className="cursor-pointer rounded-lg border border-black/10 p-2 hover:bg-black/5 disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-xs">
        <button
          onClick={toggleReglas}
          className="flex w-full cursor-pointer items-center justify-between text-left"
          aria-expanded={showReglas}
        >
          <span className="font-wixDisplay text-base font-bold text-textDark">Reglas y umbrales de detección</span>
          <span className="text-xs font-bold text-accentWine">{showReglas ? 'Ocultar' : 'Ver reglas'}</span>
        </button>
        {showReglas && (
          <div className="mt-4 space-y-3">
            {reglas === null && <Loader2 className="h-5 w-5 animate-spin text-accentWine" />}
            {reglas?.length === 0 && <p className="text-xs text-textDark/60">No se pudieron cargar las reglas.</p>}
            {reglas?.map((r) => (
              <div key={r.id} className="rounded-2xl border border-black/10 bg-bgPrimary/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-bold text-textDark">{r.nombre}</p>
                  <div className="flex items-center gap-2">
                    <CriticidadBadge nivel={r.nivelCriticidad} />
                    {!r.activo && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        Inactiva
                      </span>
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-textDark/70">{r.descripcion}</p>
                <p className="mt-1 text-[11px] text-textDark/60">
                  Umbral: {r.umbral} eventos en {r.ventanaTiempoMinutos} min
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDetail}
          role="dialog"
          aria-modal="true"
          aria-label="Detalle de la alerta"
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-wixDisplay text-xl font-bold text-textDark">{tipoLabel(selected.tipoEvento)}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <CriticidadBadge nivel={selected.nivelCriticidad} />
                  <EstadoBadge estado={selected.estado} />
                </div>
              </div>
              <button
                onClick={closeDetail}
                aria-label="Cerrar"
                className="cursor-pointer rounded-lg p-2 text-textDark/60 hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="font-bold text-textDark/60">Usuario involucrado</dt>
                <dd className="text-textDark">
                  {userName(selected.usuario)}
                  {selected.usuario?.email && <span className="text-textDark/60"> ({selected.usuario.email})</span>}
                </dd>
              </div>
              <div>
                <dt className="font-bold text-textDark/60">Fecha del evento</dt>
                <dd className="text-textDark">{new Date(selected.fechaCreacion).toLocaleString('es-AR')}</dd>
              </div>
              <div>
                <dt className="font-bold text-textDark/60">Tipo de evento</dt>
                <dd className="text-textDark">{tipoLabel(selected.tipoEvento)}</dd>
              </div>
              <div>
                <dt className="font-bold text-textDark/60">Nivel de criticidad</dt>
                <dd className="text-textDark">
                  {CRITICIDADES.find((c) => c.value === selected.nivelCriticidad)?.label ?? selected.nivelCriticidad}
                </dd>
              </div>
              {selected.ip && (
                <div>
                  <dt className="font-bold text-textDark/60">IP</dt>
                  <dd className="font-mono text-textDark">{selected.ip}</dd>
                </div>
              )}
              {selected.revisadoPor && (
                <div>
                  <dt className="font-bold text-textDark/60">Revisada por</dt>
                  <dd className="text-textDark">{userName(selected.revisadoPor)}</dd>
                </div>
              )}
            </dl>

            <div className="space-y-1 rounded-2xl border border-black/10 bg-bgPrimary/60 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-textDark/60">Descripción</p>
              <p className="text-sm text-textDark">{selected.descripcion}</p>
            </div>

            {detalles && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-textDark/60">Detalles técnicos</p>
                <pre className="max-h-48 overflow-auto rounded-2xl border border-black/10 bg-bgPrimary/60 p-4 text-[11px] text-textDark">
                  {JSON.stringify(detalles, null, 2)}
                </pre>
              </div>
            )}

            {(selected.comentariosRevision || selected.comentariosCierre) && (
              <div className="space-y-2 text-xs">
                {selected.comentariosRevision && (
                  <p>
                    <span className="font-bold text-textDark/60">Comentario de revisión: </span>
                    {selected.comentariosRevision}
                  </p>
                )}
                {selected.comentariosCierre && (
                  <p>
                    <span className="font-bold text-textDark/60">Comentario de cierre: </span>
                    {selected.comentariosCierre}
                  </p>
                )}
              </div>
            )}

            {actionError && (
              <div className="flex items-start space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {selected.estado !== 'cerrada' ? (
              <div className="space-y-3">
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  rows={2}
                  placeholder="Comentario (opcional)"
                  className="w-full rounded-xl border border-black/10 bg-white p-3 text-xs text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
                />
                <div className="flex flex-wrap justify-end gap-2">
                  {selected.estado === 'pendiente' && (
                    <button
                      onClick={() => runAction('revisar')}
                      disabled={acting}
                      className="inline-flex cursor-pointer items-center space-x-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50"
                    >
                      {acting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      <span>Marcar como Revisada</span>
                    </button>
                  )}
                  <button
                    onClick={() => setConfirmClose(true)}
                    disabled={acting}
                    className="cursor-pointer rounded-xl bg-accentWine px-4 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    Cerrar alerta
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-right text-xs text-textDark/60">Esta alerta ya fue cerrada.</p>
            )}
          </div>
        </div>
      )}

      {selected && confirmClose && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-black/50 p-4"
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirmar cierre de alerta"
        >
          <div className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-xl">
            <h4 className="font-wixDisplay text-lg font-bold text-textDark">¿Cerrar esta alerta?</h4>
            <p className="text-xs text-textDark/70">
              La alerta se cerrará y dejará de aparecer entre las pendientes. Esta acción queda registrada en la
              auditoría.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setConfirmClose(false)}
                disabled={acting}
                className="cursor-pointer rounded-xl border border-black/10 px-4 py-2 text-xs font-bold text-textDark hover:bg-black/5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => runAction('cerrar')}
                disabled={acting}
                className="inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-accentWine px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
              >
                {acting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                <span>Confirmar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl bg-green-600 px-4 py-3 text-xs font-bold text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
