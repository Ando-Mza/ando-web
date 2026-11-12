'use client';

import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AlertCircle, Loader2, MapPin, MessageSquare, Route, Users } from 'lucide-react';
import PoiQuickViewModal from '@/components/PoiQuickViewModal';
import { api } from '@/utils/api';
import type { GeneralDashboardResponse, PeriodoDashboard } from '@/types/dashboard';

const PERIODOS: { value: PeriodoDashboard; label: string }[] = [
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'mes', label: 'Mes actual' },
  { value: 'este_ano', label: 'Este año' },
  { value: 'todos', label: 'Todo el historial' },
];

const COLOR_VISITADOS = '#3B82F6';
const COLOR_GUARDADOS = '#F59E0B';
const COLOR_USUARIOS = '#10B981';
const EMPTY_MESSAGE = 'No hay datos registrados en este período';

function EmptyChart() {
  return (
    <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-black/10 text-sm text-textDark/50">
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
  value: number;
  hint?: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="flex items-center space-x-4 rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
      <div className={`rounded-xl p-3.5 ${tone}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-textDark/60">{label}</p>
        <h4 className="text-2xl font-bold text-textDark">{value.toLocaleString('es-AR')}</h4>
        {hint && <p className="text-xs text-textDark/50">{hint}</p>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [periodo, setPeriodo] = useState<PeriodoDashboard>('30d');
  const [data, setData] = useState<GeneralDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const [selectedPoiId, setSelectedPoiId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getGeneralDashboard({ periodo })
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
  }, [periodo, reloadKey]);

  const refetch = (next: PeriodoDashboard) => {
    setLoading(true);
    setError(false);
    if (next === periodo) setReloadKey((k) => k + 1);
    else setPeriodo(next);
  };

  const ranking = data?.graficos.rankingTop5Pois ?? [];
  const totalVisitados = ranking.reduce((acc, p) => acc + p.visitados, 0);
  const totalGuardados = ranking.reduce((acc, p) => acc + p.guardados, 0);
  const pieData = [
    { name: 'Visitados', value: totalVisitados, color: COLOR_VISITADOS },
    { name: 'Guardados', value: totalGuardados, color: COLOR_GUARDADOS },
  ];
  const crecimiento = data?.graficos.crecimientoUsuarios ?? [];
  const hasGrowth = crecimiento.some((c) => c.cantidad > 0);
  const hasPie = totalVisitados + totalGuardados > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="font-wixDisplay text-2xl font-bold text-textDark">Dashboard General</h3>
        <select
          value={periodo}
          onChange={(e) => refetch(e.target.value as PeriodoDashboard)}
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
            onClick={() => refetch(periodo)}
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
              label="Total de usuarios"
              value={data.kpis.totalUsuarios}
              hint={`+${data.kpis.nuevosUsuariosPeriodo} en el período`}
              icon={<Users className="h-6 w-6" />}
              tone="bg-emerald-100 text-emerald-600"
            />
            <KpiCard
              label="Itinerarios activos"
              value={data.kpis.itinerariosActivos}
              hint={`${data.kpis.itinerariosGenerados} generados en el período`}
              icon={<Route className="h-6 w-6" />}
              tone="bg-blue-100 text-blue-600"
            />
            <KpiCard
              label="POIs validados"
              value={data.kpis.poisValidados}
              icon={<MapPin className="h-6 w-6" />}
              tone="bg-violet-100 text-violet-600"
            />
            <KpiCard
              label="Reseñas pendientes"
              value={data.kpis.resenasPendientes}
              icon={<MessageSquare className="h-6 w-6" />}
              tone="bg-amber-100 text-amber-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
              <h4 className="mb-4 font-wixDisplay text-lg font-bold text-textDark">
                Crecimiento de usuarios
              </h4>
              {hasGrowth ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={crecimiento}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v) => [v, 'Usuarios nuevos']} />
                      <Bar dataKey="cantidad" fill={COLOR_USUARIOS} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart />
              )}
            </section>

            <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-xs">
              <h4 className="mb-4 font-wixDisplay text-lg font-bold text-textDark">
                Top 5 POIs: visitados vs. guardados
              </h4>
              {hasPie ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                        {pieData.map((s) => (
                          <Cell key={s.name} fill={s.color} />
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
            <h4 className="mb-4 font-wixDisplay text-lg font-bold text-textDark">
              Ranking de POIs más visitados / guardados
            </h4>
            <p className="-mt-2 mb-4 text-xs text-textDark/50">
              Hacé clic en un negocio o en sus barras para ver su ficha.
            </p>
            {ranking.length > 0 ? (
              <div style={{ height: Math.max(180, ranking.length * 56) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ranking} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis
                      type="category"
                      dataKey="nombre"
                      width={160}
                      tick={(props) => {
                        const { x, y, payload } = props as { x: number; y: number; payload: { value: string } };
                        const poi = ranking.find((p) => p.nombre === payload.value);
                        return (
                          <text
                            x={x}
                            y={y}
                            dy={4}
                            textAnchor="end"
                            fontSize={12}
                            className="cursor-pointer fill-textDark transition-opacity hover:opacity-60"
                            onClick={() => poi && setSelectedPoiId(poi.id)}
                          >
                            {payload.value.length > 22 ? `${payload.value.slice(0, 21)}…` : payload.value}
                          </text>
                        );
                      }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="visitados"
                      name="Visitados"
                      fill={COLOR_VISITADOS}
                      radius={[0, 6, 6, 0]}
                      cursor="pointer"
                      onClick={(d) => setSelectedPoiId(d.payload.id)}
                    />
                    <Bar
                      dataKey="guardados"
                      name="Guardados"
                      fill={COLOR_GUARDADOS}
                      radius={[0, 6, 6, 0]}
                      cursor="pointer"
                      onClick={(d) => setSelectedPoiId(d.payload.id)}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart />
            )}
          </section>
        </>
      )}

      {selectedPoiId && (
        <PoiQuickViewModal
          poiId={selectedPoiId}
          stats={ranking.find((p) => p.id === selectedPoiId)}
          onClose={() => setSelectedPoiId(null)}
        />
      )}
    </div>
  );
}
