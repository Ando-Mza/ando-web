'use client';

import React from 'react';
import { KpisActividadUsuarios, MetricaVariacion } from '@/types/reportes';
import { 
  Users, 
  UserPlus, 
  Compass, 
  Bot, 
  CheckCircle2, 
  Star, 
  Repeat, 
  ArrowUpRight, 
  ArrowDownRight, 
  Minus,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';

interface UserActivityKpisProps {
  kpis: KpisActividadUsuarios;
  periodoActual: { fechaDesde: string; fechaHasta: string };
  periodoAnterior: { fechaDesde: string; fechaHasta: string };
}

interface CardProps {
  title: string;
  metric: MetricaVariacion;
  icon: any;
  iconColor: string;
  iconBg: string;
  unit?: string;
  subtitle?: string;
  isPercentage?: boolean;
}

function KpiCard({
  title,
  metric,
  icon: Icon,
  iconColor,
  iconBg,
  unit = '',
  subtitle,
  isPercentage = false,
}: CardProps) {
  const isPositive = metric.porcentajeVariacion > 0;
  const isNegative = metric.porcentajeVariacion < 0;
  const isNeutral = metric.porcentajeVariacion === 0;

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wider text-textDark/60 truncate">
          {title}
        </span>
        <div className={`h-9 w-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg} ${iconColor}`}>
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline space-x-2">
          <span className="font-wixDisplay text-2xl sm:text-3xl font-black text-textDark">
            {isPercentage ? `${metric.actual.toFixed(1)}%` : metric.actual.toLocaleString()}
          </span>
          {unit && <span className="text-xs text-textDark/50 font-semibold">{unit}</span>}
        </div>

        {/* Variación vs Período Anterior (US-RYI-02 Criterio 4) */}
        <div className="flex items-center space-x-2 text-[11px]">
          <span
            className={`inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full font-bold ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isNegative
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-black/5 text-textDark/60 border border-black/10'
            }`}
          >
            {isPositive && <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />}
            {isNegative && <ArrowDownRight className="h-3 w-3 stroke-[2.5]" />}
            {isNeutral && <Minus className="h-3 w-3 stroke-[2.5]" />}
            <span>
              {metric.porcentajeVariacion > 0 ? `+${metric.porcentajeVariacion.toFixed(1)}%` : `${metric.porcentajeVariacion.toFixed(1)}%`}
            </span>
          </span>

          <span className="text-textDark/50">
            vs {isPercentage ? `${metric.anterior.toFixed(1)}%` : metric.anterior.toLocaleString()} anterior
          </span>
        </div>
      </div>

      {subtitle && (
        <p className="text-[10px] text-textDark/50 pt-2 border-t border-black/5 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function UserActivityKpis({
  kpis,
  periodoActual,
  periodoAnterior,
}: UserActivityKpisProps) {
  return (
    <div className="space-y-4">
      {/* Banner de Referencia de Períodos Consecutivos (Criterio 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 bg-bgPrimary/70 rounded-2xl border border-black/5 text-xs text-textDark/70">
        <div className="flex items-center space-x-2">
          <Repeat className="h-4 w-4 text-accentWine" />
          <span>
            Comparativa activa:{' '}
            <strong className="text-textDark">{periodoActual.fechaDesde} al {periodoActual.fechaHasta}</strong>{' '}
            vs período previo{' '}
            <strong className="text-textDark">{periodoAnterior.fechaDesde} al {periodoAnterior.fechaHasta}</strong>
          </span>
        </div>
        <span className="text-[11px] text-textDark/50 font-medium">
          Las variaciones reflejan el porcentaje relativo de crecimiento o desaceleración
        </span>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Nuevos Registros */}
        <KpiCard
          title="Nuevos Registros"
          metric={kpis.nuevosRegistros}
          icon={UserPlus}
          iconColor="text-fillPrimary"
          iconBg="bg-fillPrimary/10"
          unit="cuentas"
          subtitle="Usuarios con fecha de alta en el período"
        />

        {/* KPI 2: Usuarios Activos Únicos */}
        <KpiCard
          title="Usuarios Activos Únicos"
          metric={kpis.usuariosActivosUnicos}
          icon={Users}
          iconColor="text-accentWine"
          iconBg="bg-accentWine/10"
          unit="activos"
          subtitle="Con al menos 1 acción registrada en logs"
        />

        {/* KPI 3: Itinerarios Creados */}
        <KpiCard
          title="Itinerarios Creados"
          metric={kpis.itinerariosCreados}
          icon={Compass}
          iconColor="text-accentPurple"
          iconBg="bg-accentPurple/10"
          unit="rutas"
          subtitle={`IA: ${kpis.itinerariosCreadosIA.actual} | Manual: ${kpis.itinerariosCreadosManual.actual}`}
        />

        {/* KPI 4: Itinerarios Finalizados */}
        <KpiCard
          title="Itinerarios Finalizados"
          metric={kpis.itinerariosFinalizados}
          icon={CheckCircle2}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          unit="completados"
          subtitle="Turistas que concluyeron su viaje"
        />

        {/* KPI 5: Tasa de Retención */}
        <KpiCard
          title="Tasa de Retención"
          metric={kpis.tasaRetencion}
          icon={Repeat}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-50"
          isPercentage={true}
          subtitle="Usuarios con más de una sesión activa"
        />

        {/* KPI 6: Conversaciones con Asistente IA */}
        <KpiCard
          title="Conversaciones IA"
          metric={kpis.conversacionesIaIniciadas}
          icon={Bot}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          unit="sesiones"
          subtitle="Interacciones iniciadas con el chatbot"
        />

        {/* KPI 7: Reseñas Aprobadas */}
        <KpiCard
          title="Reseñas Aprobadas"
          metric={kpis.resenasAprobadas}
          icon={Star}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
          unit="reseñas"
          subtitle="Feedback validado en atractivos turísticos"
        />

        {/* KPI 8: Adopción del Creador IA */}
        <div className="bg-gradient-to-br from-accentPurple/10 via-accentPurple/5 to-transparent rounded-3xl border border-accentPurple/20 p-5 shadow-xs space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accentPurple truncate">
              Adopción Creador IA
            </span>
            <div className="h-9 w-9 rounded-2xl flex items-center justify-center bg-accentPurple/20 text-accentPurple">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="font-wixDisplay text-2xl sm:text-3xl font-black text-textDark">
                {kpis.itinerariosCreados.actual > 0 
                  ? `${Math.round((kpis.itinerariosCreadosIA.actual / kpis.itinerariosCreados.actual) * 100)}%` 
                  : '0%'}
              </span>
              <span className="text-xs text-textDark/60 font-semibold">de rutas</span>
            </div>
            <p className="text-[11px] text-textDark/70">
              {kpis.itinerariosCreadosIA.actual} de {kpis.itinerariosCreados.actual} itinerarios generados con asistencia de IA
            </p>
          </div>

          <div className="w-full bg-black/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-accentPurple rounded-full transition-all duration-500"
              style={{
                width: `${
                  kpis.itinerariosCreados.actual > 0
                    ? Math.round((kpis.itinerariosCreadosIA.actual / kpis.itinerariosCreados.actual) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
