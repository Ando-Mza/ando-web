'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Bot,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  ShieldAlert,
  Trash2,
  UserX,
  X,
  XCircle,
} from 'lucide-react';
import { api } from '@/utils/api';
import type { ModerationCase, ModerationEstado, ModerationFilters } from '@/types/moderation';

const PAGE_SIZE = 20;

const ENTIDADES = [
  { value: 'todos', label: 'Todas las entidades' },
  { value: 'resena', label: 'Solo reseñas' },
  { value: 'imagen', label: 'Solo imágenes' },
  { value: 'poi', label: 'Solo puntos de interés' },
];

const ESTADOS = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'resuelto', label: 'Resueltos' },
  { value: 'desestimado', label: 'Desestimados' },
];

const ORIGENES = [
  { value: 'todos', label: 'Todos los orígenes' },
  { value: 'usuario', label: 'Reporte de Usuario' },
  { value: 'ia', label: 'Detectado por IA' },
];

type ConfirmAction = 'eliminar' | 'suspender' | 'desestimar';

function EstadoBadge({ estado }: { estado: ModerationEstado }) {
  const styles: Record<ModerationEstado, string> = {
    pendiente: 'bg-amber-50 text-amber-800 border-amber-200',
    resuelto: 'bg-green-50 text-green-700 border-green-200',
    desestimado: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  const labels: Record<ModerationEstado, string> = {
    pendiente: 'Pendiente',
    resuelto: 'Resuelto',
    desestimado: 'Desestimado',
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles[estado] ?? styles.pendiente}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

function OrigenBadge({ origen }: { origen: string }) {
  const esIa = origen === 'Detectado por IA';
  return (
    <span
      className={`inline-flex items-center space-x-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
        esIa ? 'border-violet-200 bg-violet-50 text-violet-700' : 'border-blue-200 bg-blue-50 text-blue-700'
      }`}
    >
      {esIa && <Bot className="h-3 w-3" />}
      <span>{origen}</span>
    </span>
  );
}

export default function AdminModeracionPage() {
  const [origen, setOrigen] = useState<NonNullable<ModerationFilters['origen']>>('todos');
  const [entidad, setEntidad] = useState('todos');
  const [estado, setEstado] = useState<NonNullable<ModerationFilters['estado']>>('pendiente');
  const [page, setPage] = useState(1);

  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  // Resultado de la última consulta; "loading" se deriva de comparar su clave con la actual.
  const [fetched, setFetched] = useState<{ key: string; error: string | null } | null>(null);
  const queryKey = [origen, entidad, estado, page, reloadKey].join('|');
  const loading = fetched?.key !== queryKey;
  const error = fetched && !loading ? fetched.error : null;

  const [selected, setSelected] = useState<ModerationCase | null>(null);
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);
  const [motivoAdmin, setMotivoAdmin] = useState('');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getModerationCases({ origen, entidad, estado, page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setCases(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
        setFetched({ key: queryKey, error: null });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setFetched({ key: queryKey, error: e.message || 'No se pudieron cargar los casos de moderación.' });
      });
    return () => {
      cancelled = true;
    };
  }, [origen, entidad, estado, page, queryKey]);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const changeFilter = <T,>(setter: (v: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  const openDetail = (c: ModerationCase) => {
    setSelected(c);
    setConfirm(null);
    setMotivoAdmin('');
    setActionError(null);
    // Refresca el detalle por si cambió desde que se listó.
    api
      .getModerationCase(c.id)
      .then((fresh) => setSelected((cur) => (cur && cur.id === fresh.id ? fresh : cur)))
      .catch(() => undefined);
  };

  const closeDetail = () => {
    if (acting) return;
    setSelected(null);
    setConfirm(null);
  };

  const applyResult = (updated: ModerationCase | undefined, fallbackId: string, nextEstado: ModerationEstado) => {
    const nextCase = (c: ModerationCase): ModerationCase =>
      updated ? { ...c, ...updated } : { ...c, estado: nextEstado };
    setCases((list) => {
      const mapped = list.map((c) => (c.id === fallbackId ? nextCase(c) : c));
      // Con filtro "pendientes", el caso resuelto sale de la bandeja.
      return estado !== 'todos' && estado !== nextEstado ? mapped.filter((c) => c.id !== fallbackId) : mapped;
    });
    setSelected((cur) => (cur && cur.id === fallbackId ? nextCase(cur) : cur));
  };

  const runAction = async () => {
    if (!selected || !confirm) return;
    setActing(true);
    setActionError(null);
    try {
      if (confirm === 'desestimar') {
        const res = await api.desestimarReporte(selected.id);
        applyResult(res.reporte, selected.id, 'desestimado');
        showToast('Reporte desestimado. El contenido sigue visible.');
      } else if (confirm === 'eliminar') {
        const res = await api.eliminarContenidoReportado(selected.id, motivoAdmin.trim() || undefined);
        applyResult(res.reporte, selected.id, 'resuelto');
        showToast('Contenido eliminado y reporte resuelto.');
      } else {
        const res = await api.suspenderAutorReporte(selected.id, motivoAdmin.trim() || undefined);
        setSelected((cur) =>
          cur && cur.contenido.autor
            ? { ...cur, contenido: { ...cur.contenido, autor: { ...cur.contenido.autor, suspendido: true } } }
            : cur,
        );
        setCases((list) =>
          list.map((c) =>
            c.id === selected.id && c.contenido.autor
              ? { ...c, contenido: { ...c.contenido, autor: { ...c.contenido.autor, suspendido: true } } }
              : c,
          ),
        );
        showToast(res.message || 'Usuario suspendido correctamente.');
      }
      setConfirm(null);
      setMotivoAdmin('');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo completar la acción.');
    } finally {
      setActing(false);
    }
  };

  const esPendiente = selected?.estado === 'pendiente';
  const autor = selected?.contenido.autor;
  const puedeSuspender = esPendiente && !!autor && !autor.suspendido;

  return (
    <div className="space-y-8 font-wixText">
      <div className="rounded-3xl border border-accentWine/20 bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent p-6 sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-accentWine/20 bg-accentWine/10 px-3 py-1 text-xs font-bold text-accentWine">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Moderación de Contenido</span>
          </div>
          <h2 className="font-wixDisplay text-2xl font-extrabold text-textDark sm:text-3xl">Bandeja de moderación</h2>
          <p className="max-w-2xl text-xs leading-relaxed text-textDark/70 sm:text-sm">
            Revisá el contenido reportado por los usuarios o detectado automáticamente por IA y resolvé cada caso.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Entidad', value: entidad, set: changeFilter(setEntidad), options: ENTIDADES },
            { label: 'Estado del reporte', value: estado, set: changeFilter(setEstado as (v: string) => void), options: ESTADOS },
            { label: 'Origen', value: origen, set: changeFilter(setOrigen as (v: string) => void), options: ORIGENES },
          ].map((f) => (
            <div key={f.label}>
              <label className="mb-1 block text-[11px] font-bold text-textDark/70">{f.label}</label>
              <select
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-bgPrimary/60 px-3 py-2.5 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
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

        {!loading && !error && cases.length === 0 && (
          <div className="space-y-2 py-12 text-center text-xs text-textDark/60">
            <CheckCircle className="mx-auto h-8 w-8 text-textDark/30" />
            <p>No hay casos de moderación para los filtros seleccionados.</p>
          </div>
        )}

        {!loading && !error && cases.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 text-[10px] font-bold uppercase tracking-wider text-textDark/60">
                    <th className="pb-3">Tipo de contenido</th>
                    <th className="pb-3">Motivo</th>
                    <th className="pb-3">Origen</th>
                    <th className="pb-3">Fecha</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {cases.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-bgPrimary/40">
                      <td className="py-3 font-bold text-textDark">{c.tipoContenido}</td>
                      <td className="max-w-xs truncate py-3 text-textDark/80" title={c.motivo}>
                        {c.motivo}
                      </td>
                      <td className="py-3">
                        <OrigenBadge origen={c.origen} />
                      </td>
                      <td className="py-3 font-mono text-[11px] text-textDark/60">
                        {new Date(c.fechaCreacion).toLocaleString('es-AR')}
                      </td>
                      <td className="py-3">
                        <EstadoBadge estado={c.estado} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => openDetail(c)}
                          className="inline-flex cursor-pointer items-center space-x-1 rounded-lg border border-black/10 px-3 py-1.5 text-[11px] font-bold text-textDark hover:bg-black/5"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ver más</span>
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
                  Página {page} de {totalPages} ({total} casos)
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

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeDetail}
          role="dialog"
          aria-modal="true"
          aria-label="Detalle del reporte"
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-wixDisplay text-xl font-bold text-textDark">Detalle del reporte</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <OrigenBadge origen={selected.origen} />
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
                <dt className="font-bold text-textDark/60">Fecha de creación</dt>
                <dd className="text-textDark">{new Date(selected.fechaCreacion).toLocaleString('es-AR')}</dd>
              </div>
              <div>
                <dt className="font-bold text-textDark/60">Entidad reportada</dt>
                <dd className="text-textDark">{selected.tipoContenido}</dd>
              </div>
              <div>
                <dt className="font-bold text-textDark/60">Código</dt>
                <dd className="break-all font-mono text-[11px] text-textDark">{selected.id}</dd>
              </div>
              <div>
                <dt className="font-bold text-textDark/60">Usuario reportante</dt>
                <dd className="text-textDark">
                  {selected.reportante
                    ? `${selected.reportante.nombre} (${selected.reportante.email})`
                    : 'Detectado por IA (sin usuario reportante)'}
                </dd>
              </div>
              {selected.contenido.poi && (
                <div>
                  <dt className="font-bold text-textDark/60">Punto de interés</dt>
                  <dd className="text-textDark">{selected.contenido.poi.nombre}</dd>
                </div>
              )}
            </dl>

            <div className="space-y-1 rounded-2xl border border-orange-300 bg-orange-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-orange-800">Motivo de la denuncia</p>
              <p className="text-sm font-semibold text-red-800">{selected.motivo}</p>
              {selected.aclaracion && <p className="text-xs text-orange-900">{selected.aclaracion}</p>}
              <p className="text-xs text-orange-900">
                Denunciado por:{' '}
                <span className="font-bold">
                  {selected.reportante ? selected.reportante.nombre : 'Detectado por IA'}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-textDark/60">Contenido original</p>
              {selected.contenido.texto ? (
                <p className="whitespace-pre-wrap rounded-2xl border border-black/10 bg-bgPrimary/60 p-4 text-sm text-textDark">
                  {selected.contenido.texto}
                </p>
              ) : (
                <p className="rounded-2xl border border-dashed border-black/10 p-4 text-xs text-textDark/60">
                  El contenido original ya no está disponible (pudo haber sido eliminado).
                </p>
              )}
              {autor && (
                <p className="text-xs text-textDark/70">
                  Autor: <span className="font-bold text-textDark">{autor.nombre}</span> ({autor.email})
                  {autor.suspendido && (
                    <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      Suspendido
                    </span>
                  )}
                </p>
              )}
            </div>

            {actionError && (
              <div className="flex items-start space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {confirm ? (
              <div className="space-y-3 rounded-2xl border border-black/10 bg-bgPrimary/60 p-4">
                <p className="text-sm font-bold text-textDark">
                  {confirm === 'eliminar' && '¿Confirmás que el contenido infringe las normas y debe eliminarse?'}
                  {confirm === 'desestimar' && '¿Desestimar el reporte? El contenido seguirá visible.'}
                  {confirm === 'suspender' && `¿Suspender la cuenta de ${autor?.nombre ?? 'el autor'}?`}
                </p>
                {confirm !== 'desestimar' && (
                  <textarea
                    value={motivoAdmin}
                    onChange={(e) => setMotivoAdmin(e.target.value)}
                    rows={2}
                    placeholder={
                      confirm === 'eliminar'
                        ? 'Motivo de la moderación (se notifica al autor, opcional)'
                        : 'Motivo de la suspensión (opcional)'
                    }
                    className="w-full rounded-xl border border-black/10 bg-white p-3 text-xs text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
                  />
                )}
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setConfirm(null);
                      setActionError(null);
                    }}
                    disabled={acting}
                    className="cursor-pointer rounded-xl border border-black/10 px-4 py-2 text-xs font-bold text-textDark hover:bg-black/5 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={runAction}
                    disabled={acting}
                    className="inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-accentWine px-4 py-2 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {acting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Confirmar</span>
                  </button>
                </div>
              </div>
            ) : esPendiente ? (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => setConfirm('desestimar')}
                  className="inline-flex cursor-pointer items-center space-x-2 rounded-xl border border-black/10 px-4 py-2.5 text-xs font-bold text-textDark hover:bg-black/5"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Desestimar Reporte</span>
                </button>
                {puedeSuspender && (
                  <button
                    onClick={() => setConfirm('suspender')}
                    className="inline-flex cursor-pointer items-center space-x-2 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2.5 text-xs font-bold text-orange-800 hover:bg-orange-100"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Suspender Usuario autor</span>
                  </button>
                )}
                <button
                  onClick={() => setConfirm('eliminar')}
                  className="inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar Contenido</span>
                </button>
              </div>
            ) : (
              <p className="text-right text-xs text-textDark/60">Este caso ya fue resuelto.</p>
            )}
          </div>
        </div>
      )}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-[60] max-w-sm rounded-xl px-4 py-3 text-xs font-bold text-white shadow-lg ${
            toast.ok ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
