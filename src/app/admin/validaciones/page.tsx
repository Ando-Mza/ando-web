'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  X,
  XCircle,
} from 'lucide-react';
import { api } from '@/utils/api';
import type { SolicitudValidacion, ValidacionEstado, ValidacionesFilters } from '@/types/validations';

const PAGE_SIZE = 20;
const MIN_MOTIVO = 5;

const ESTADOS = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'validado', label: 'Validadas' },
  { value: 'rechazada', label: 'Rechazadas' },
  { value: 'todos', label: 'Todas' },
];

const TIPOS = [
  { value: '', label: 'Todos los tipos' },
  { value: 'identidad_turista', label: 'Identidad de turista' },
  { value: 'prestador_comercial', label: 'Prestador comercial' },
  { value: 'guia_turismo', label: 'Guía de turismo' },
  { value: 'agencia_viajes', label: 'Agencia de viajes' },
];

const DOCUMENTOS: Record<string, string> = {
  dni_frente: 'DNI (frente)',
  dni_dorso: 'DNI (dorso)',
  cuit_constancia: 'Constancia de CUIT',
  habilitacion_comercial: 'Habilitación comercial',
  credencial_guia: 'Credencial de guía',
  legajo_turismo: 'Legajo de turismo',
  seguro_turismo: 'Seguro de turismo',
};

const tipoLabel = (v: string) => TIPOS.find((t) => t.value === v)?.label ?? v;
const docLabel = (v: string) => DOCUMENTOS[v] ?? v;
const esUrlSegura = (url: string) => /^https?:\/\//i.test(url);

function EstadoBadge({ estado }: { estado: ValidacionEstado }) {
  const styles: Record<ValidacionEstado, string> = {
    pendiente: 'bg-amber-50 text-amber-800 border-amber-200',
    validado: 'bg-green-50 text-green-700 border-green-200',
    rechazada: 'bg-red-50 text-red-700 border-red-200',
  };
  const labels: Record<ValidacionEstado, string> = {
    pendiente: 'Pendiente',
    validado: 'Validado',
    rechazada: 'Rechazada',
  };
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${styles[estado] ?? styles.pendiente}`}>
      {labels[estado] ?? estado}
    </span>
  );
}

export default function AdminValidacionesPage() {
  const [estado, setEstado] = useState<NonNullable<ValidacionesFilters['estado']>>('pendiente');
  const [tipo, setTipo] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [items, setItems] = useState<SolicitudValidacion[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fetched, setFetched] = useState<{ key: string; error: string | null } | null>(null);
  const queryKey = [estado, tipo, page, reloadKey].join('|');
  const loading = fetched?.key !== queryKey;
  const error = fetched && !loading ? fetched.error : null;

  const [selected, setSelected] = useState<SolicitudValidacion | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [acting, setActing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getValidacionesUsuario({ estado, tipoValidacion: tipo || undefined, page, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.data ?? []);
        setTotal(res.total ?? 0);
        setTotalPages(res.totalPages ?? 1);
        setFetched({ key: queryKey, error: null });
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setFetched({ key: queryKey, error: e.message || 'No se pudieron cargar las solicitudes.' });
      });
    return () => {
      cancelled = true;
    };
  }, [estado, tipo, page, queryKey]);

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const openDetail = (s: SolicitudValidacion) => {
    setSelected(s);
    setRejecting(false);
    setMotivo('');
    setActionError(null);
    api
      .getValidacionUsuario(s.id)
      .then((fresh) => setSelected((cur) => (cur && cur.id === fresh.id ? fresh : cur)))
      .catch(() => undefined);
  };

  const closeDetail = () => {
    if (!acting) {
      setSelected(null);
      setRejecting(false);
    }
  };

  const afterResolve = (updated: SolicitudValidacion) => {
    setItems((list) => {
      const mapped = list.map((s) => (s.id === updated.id ? updated : s));
      return estado !== 'todos' && estado !== updated.estado ? mapped.filter((s) => s.id !== updated.id) : mapped;
    });
    setTotal((t) => (estado !== 'todos' && estado !== updated.estado ? Math.max(0, t - 1) : t));
    setSelected(null);
    setRejecting(false);
    setMotivo('');
  };

  const aprobar = async () => {
    if (!selected) return;
    setActing(true);
    setActionError(null);
    try {
      const res = await api.aprobarValidacionUsuario(selected.id);
      afterResolve(res.solicitud);
      showToast('Validación aprobada correctamente');
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo aprobar la validación.');
    } finally {
      setActing(false);
    }
  };

  const rechazar = async () => {
    if (!selected) return;
    const text = motivo.trim();
    if (text.length < MIN_MOTIVO) {
      setActionError(`Ingresá un motivo de rechazo de al menos ${MIN_MOTIVO} caracteres.`);
      return;
    }
    setActing(true);
    setActionError(null);
    try {
      const res = await api.rechazarValidacionUsuario(selected.id, text);
      afterResolve(res.solicitud);
      showToast('Validación rechazada', false);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'No se pudo rechazar la validación.');
    } finally {
      setActing(false);
    }
  };

  const faltantes = selected
    ? selected.documentosRequeridos.filter(
        (req) => !selected.documentos.some((d) => d.tipoDocumento.toLowerCase().trim() === req.toLowerCase().trim()),
      )
    : [];

  return (
    <div className="space-y-8 font-wixText">
      <div className="rounded-3xl border border-accentWine/20 bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent p-6 sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 rounded-full border border-accentWine/20 bg-accentWine/10 px-3 py-1 text-xs font-bold text-accentWine">
            <BadgeCheck className="h-3.5 w-3.5" />
            <span>Gestión de Validaciones</span>
          </div>
          <h2 className="font-wixDisplay text-2xl font-extrabold text-textDark sm:text-3xl">
            Validaciones de usuario
          </h2>
          <p className="max-w-2xl text-xs leading-relaxed text-textDark/70 sm:text-sm">
            Revisá la documentación enviada por turistas, prestadores y guías, y aprobá o rechazá cada solicitud.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-xs">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-textDark/70">Estado</label>
            <select
              value={estado}
              onChange={(e) => {
                setEstado(e.target.value as typeof estado);
                setPage(1);
              }}
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
            <label className="mb-1 block text-[11px] font-bold text-textDark/70">Tipo de validación</label>
            <select
              value={tipo}
              onChange={(e) => {
                setTipo(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-black/10 bg-bgPrimary/60 px-3 py-2.5 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            >
              {TIPOS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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

        {!loading && !error && items.length === 0 && (
          <div className="space-y-2 py-12 text-center text-xs text-textDark/60">
            <CheckCircle className="mx-auto h-8 w-8 text-textDark/30" />
            <p>
              {estado === 'pendiente'
                ? 'No hay solicitudes de validación pendientes.'
                : 'No hay solicitudes para los filtros seleccionados.'}
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 text-[10px] font-bold uppercase tracking-wider text-textDark/60">
                    <th className="pb-3">Solicitante</th>
                    <th className="pb-3">Tipo</th>
                    <th className="pb-3">Documentación</th>
                    <th className="pb-3">Fecha de solicitud</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {items.map((s) => (
                    <tr key={s.id} className="transition-colors hover:bg-bgPrimary/40">
                      <td className="py-3">
                        <p className="font-bold text-textDark">{s.usuario.nombre}</p>
                        <p className="text-[11px] text-textDark/60">{s.usuario.email}</p>
                      </td>
                      <td className="py-3 text-textDark/80">{tipoLabel(s.tipoValidacion)}</td>
                      <td className="py-3">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                            s.documentacionCompleta
                              ? 'border-green-200 bg-green-50 text-green-700'
                              : 'border-red-200 bg-red-50 text-red-700'
                          }`}
                        >
                          {s.documentacionCompleta
                            ? 'Completa'
                            : `Incompleta (${s.cantidadDocumentosAdjuntos}/${s.documentosRequeridos.length})`}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-textDark/60">
                        {new Date(s.fechaSolicitud).toLocaleString('es-AR')}
                      </td>
                      <td className="py-3">
                        <EstadoBadge estado={s.estado} />
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => openDetail(s)}
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
                  Página {page} de {totalPages} ({total} solicitudes)
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
          aria-label="Detalle de la solicitud de validación"
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-3xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="font-wixDisplay text-xl font-bold text-textDark">{tipoLabel(selected.tipoValidacion)}</h3>
                <EstadoBadge estado={selected.estado} />
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
                <dt className="font-bold text-textDark/60">Solicitante</dt>
                <dd className="text-textDark">{selected.usuario.nombre}</dd>
              </div>
              <div>
                <dt className="font-bold text-textDark/60">Email</dt>
                <dd className="text-textDark">{selected.usuario.email}</dd>
              </div>
              {selected.usuario.telefono && (
                <div>
                  <dt className="font-bold text-textDark/60">Teléfono</dt>
                  <dd className="text-textDark">{selected.usuario.telefono}</dd>
                </div>
              )}
              <div>
                <dt className="font-bold text-textDark/60">Cuenta verificada</dt>
                <dd className="text-textDark">{selected.usuario.verificado ? 'Sí' : 'No'}</dd>
              </div>
              <div>
                <dt className="font-bold text-textDark/60">Fecha de solicitud</dt>
                <dd className="text-textDark">{new Date(selected.fechaSolicitud).toLocaleString('es-AR')}</dd>
              </div>
              {selected.fechaRevision && (
                <div>
                  <dt className="font-bold text-textDark/60">Fecha de revisión</dt>
                  <dd className="text-textDark">{new Date(selected.fechaRevision).toLocaleString('es-AR')}</dd>
                </div>
              )}
            </dl>

            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-textDark/60">Documentación adjunta</p>
              {selected.documentos.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-black/10 p-4 text-xs text-textDark/60">
                  El usuario no adjuntó documentos.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selected.documentos.map((d) => (
                    <li
                      key={d.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-bgPrimary/60 p-3"
                    >
                      <div className="flex min-w-0 items-center space-x-3">
                        <FileText className="h-4 w-4 shrink-0 text-textDark/50" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-textDark">{docLabel(d.tipoDocumento)}</p>
                          <p className="truncate text-[11px] text-textDark/60">{d.nombreArchivo}</p>
                        </div>
                      </div>
                      {esUrlSegura(d.archivoUrl) ? (
                        <a
                          href={d.archivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex shrink-0 items-center space-x-1 text-[11px] font-bold text-accentWine hover:underline"
                        >
                          <span>Abrir</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="shrink-0 text-[11px] text-textDark/40">Sin enlace</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!selected.documentacionCompleta && (
              <div className="flex items-start space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Documentación incompleta. Faltan:{' '}
                  <span className="font-bold">{faltantes.map(docLabel).join(', ') || 'documentos requeridos'}</span>.
                  No se puede aprobar la validación.
                </span>
              </div>
            )}

            {selected.estado === 'rechazada' && selected.observacionesAdmin && (
              <div className="rounded-2xl border border-orange-300 bg-orange-50 p-4 text-xs">
                <p className="font-bold uppercase tracking-wider text-orange-800">Motivo del rechazo</p>
                <p className="mt-1 text-orange-900">{selected.observacionesAdmin}</p>
              </div>
            )}

            {actionError && (
              <div className="flex items-start space-x-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {selected.estado !== 'pendiente' ? (
              <p className="text-right text-xs text-textDark/60">Esta solicitud ya fue revisada.</p>
            ) : rejecting ? (
              <div className="space-y-3 rounded-2xl border border-black/10 bg-bgPrimary/60 p-4">
                <label className="block text-xs font-bold text-textDark">
                  Motivo del rechazo <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  placeholder="Explicá por qué se rechaza la validación (se notifica al usuario)"
                  className="w-full rounded-xl border border-black/10 bg-white p-3 text-xs text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setRejecting(false);
                      setActionError(null);
                    }}
                    disabled={acting}
                    className="cursor-pointer rounded-xl border border-black/10 px-4 py-2 text-xs font-bold text-textDark hover:bg-black/5 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={rechazar}
                    disabled={acting || motivo.trim().length < MIN_MOTIVO}
                    className="inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {acting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    <span>Confirmar rechazo</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => {
                    setRejecting(true);
                    setActionError(null);
                  }}
                  disabled={acting}
                  className="inline-flex cursor-pointer items-center space-x-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Rechazar</span>
                </button>
                <button
                  onClick={aprobar}
                  disabled={acting || !selected.documentacionCompleta}
                  title={selected.documentacionCompleta ? undefined : 'La documentación está incompleta'}
                  className="inline-flex cursor-pointer items-center space-x-2 rounded-xl bg-green-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  <span>Aprobar</span>
                </button>
              </div>
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
