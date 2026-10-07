'use client';

import React, { useEffect, useState } from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, Bookmark, Footprints, Loader2, Star, MessageSquare } from 'lucide-react';
import { api } from '@/utils/api';
import type { PeriodoDashboard, ProviderDashboardResponse } from '@/types/dashboard';

const PERIODOS: { value: PeriodoDashboard; label: string }[] = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'mes', label: 'Mes actual' },
  { value: 'este_ano', label: 'Este año' },
  { value: 'todos', label: 'Todo el historial' },
];

const COLOR_LINE = '#3B82F6';
const STAR_COLORS: Record<number, string> = {
  5: '#10B981',
  4: '#84CC16',
  3: '#F59E0B',
  2: '#F97316',
  1: '#EF4444',
};
const EMPTY_MESSAGE = '¡Tu negocio ya está visible! Pronto empezarás a ver estadísticas de los Turistas aquí';

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-black/10 px-6 text-center text-sm text-textDark/50">
      {EMPTY_MESSAGE}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="flex items-center space-x-4 rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
      <div className={`rounded-xl p-3.5 ${tone}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-textDark/60">{label}</p>
        <h4 className="text-2xl font-bold text-textDark">{value}</h4>
        {hint && <p className="text-xs text-textDark/50">{hint}</p>}
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-black/15'}`}
        />
      ))}
    </span>
  );
}

export default function ProviderDashboard() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>('30d');
  const [poiId, setPoiId] = useState<string | undefined>(undefined);
  const [data, setData] = useState<ProviderDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .getProviderDashboard({ periodo, poiId })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [periodo, poiId, reloadKey]);

  const startLoading = () => {
    setLoading(true);
    setError(false);
  };
  const changePeriodo = (next: PeriodoDashboard) => {
    startLoading();
    setPeriodo(next);
  };
  const changePoi = (next: string) => {
    startLoading();
    setPoiId(next);
  };
  const retry = () => {
    startLoading();
    setReloadKey((k) => k + 1);
  };

  const pois = data?.misPuntosDeInteres ?? [];
  const selectedId = data?.poiSeleccionado?.id ?? '';
  const distribucion = (data?.graficos.distribucionCalificaciones ?? []).filter((d) => d.cantidad > 0);
  const visitas = data?.graficos.visitasEnElTiempo ?? [];
  const resenas = data?.graficos.ultimasResenas ?? [];
  const hasVisitas = visitas.some((v) => v.cantidad > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="font-wixDisplay text-2xl font-bold text-textDark">Dashboard</h3>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={selectedId}
            onChange={(e) => changePoi(e.target.value)}
            disabled={loading || pois.length === 0}
            aria-label="Mis Puntos de Interés"
            className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-textDark shadow-xs focus:border-accentWine focus:outline-none"
          >
            {pois.length === 0 && <option value="">Mis Puntos de Interés</option>}
            {pois.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <select
            value={periodo}
            onChange={(e) => changePeriodo(e.target.value as PeriodoDashboard)}
            disabled={loading}
            aria-label="Período"
            className="rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-textDark shadow-xs focus:border-accentWine focus:outline-none"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center space-y-3 py-24 text-textDark/60">
          <Loader2 className="h-8 w-8 animate-spin text-accentWine" />
          <p className="text-sm font-medium">Cargando...</p>
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center space-y-4 rounded-2xl border border-red-200 bg-red-50 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <p className="text-sm font-medium text-red-800">
            No se pudieron cargar las métricas. Intente nuevamente.
          </p>
          <button
            onClick={retry}
            className="cursor-pointer rounded-xl bg-accentWine px-5 py-2.5 text-xs font-bold text-white transition-all hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Visitas exitosas"
              value={data.kpis.visitasExitosas.toLocaleString('es-AR')}
              icon={<Footprints className="h-6 w-6" />}
              tone="bg-blue-100 text-blue-600"
            />
            <KpiCard
              label="Guardados"
              value={data.kpis.cantidadGuardados.toLocaleString('es-AR')}
              icon={<Bookmark className="h-6 w-6" />}
              tone="bg-emerald-100 text-emerald-600"
            />
            <KpiCard
              label="Puntuación promedio"
              value={data.kpis.puntuacionPromedio.toFixed(1)}
              hint={`${data.kpis.totalResenas} reseñas`}
              icon={<Star className="h-6 w-6" />}
              tone="bg-amber-100 text-amber-600"
            />
            <KpiCard
              label="Reseñas"
              value={data.kpis.totalResenas.toLocaleString('es-AR')}
              icon={<MessageSquare className="h-6 w-6" />}
              tone="bg-violet-100 text-violet-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
              <h4 className="mb-4 font-wixDisplay text-lg font-bold text-textDark">
                Visitas en el tiempo
              </h4>
              {hasVisitas ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={visitas}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [v, 'Visitas']} />
                      <Line
                        type="monotone"
                        dataKey="cantidad"
                        stroke={COLOR_LINE}
                        strokeWidth={2.5}
                        dot={{ r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart />
              )}
            </section>

            <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
              <h4 className="mb-4 font-wixDisplay text-lg font-bold text-textDark">
                Distribución de calificaciones
              </h4>
              {distribucion.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribucion.map((d) => ({ ...d, name: `${d.puntuacion} estrellas` }))}
                        dataKey="cantidad"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={90}
                      >
                        {distribucion.map((d) => (
                          <Cell key={d.puntuacion} fill={STAR_COLORS[d.puntuacion] ?? '#9CA3AF'} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart />
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
            <h4 className="mb-4 font-wixDisplay text-lg font-bold text-textDark">Últimas reseñas</h4>
            {resenas.length > 0 ? (
              <ul className="divide-y divide-black/5">
                {resenas.map((r) => (
                  <li key={r.id} className="space-y-1 py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-textDark">{r.autorNombre}</span>
                        <Stars value={r.puntuacion} />
                      </div>
                      <span className="text-xs text-textDark/50">
                        {new Date(r.fechaCreacion).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                    {r.comentario && <p className="text-sm text-textDark/80">{r.comentario}</p>}
                    <p className="text-xs text-textDark/50">{r.poiNombre}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-textDark/50">{EMPTY_MESSAGE}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
