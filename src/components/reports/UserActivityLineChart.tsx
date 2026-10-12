'use client';

import React, { useState } from 'react';
import { PuntoEvolucionTemporal, GranularidadReporte } from '@/types/reportes';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Compass, 
  Bot, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';

interface UserActivityLineChartProps {
  data: PuntoEvolucionTemporal[];
  granularidadAplicada: 'diaria' | 'semanal' | 'mensual';
  selectedGranularidad: GranularidadReporte;
  onGranularidadChange: (g: GranularidadReporte) => void;
}

type MetricKey = 'usuariosActivos' | 'nuevosRegistros' | 'itinerariosCreados' | 'conversacionesIa' | 'itinerariosFinalizados';

interface MetricConfig {
  key: MetricKey;
  label: string;
  color: string;
  stroke: string;
  fill: string;
  icon: any;
}

const METRICS: MetricConfig[] = [
  {
    key: 'usuariosActivos',
    label: 'Usuarios Activos',
    color: 'text-accentWine',
    stroke: '#750031',
    fill: 'rgba(117, 0, 49, 0.12)',
    icon: Users,
  },
  {
    key: 'nuevosRegistros',
    label: 'Nuevos Registros',
    color: 'text-fillPrimary',
    stroke: '#E96509',
    fill: 'rgba(233, 101, 9, 0.12)',
    icon: Sparkles,
  },
  {
    key: 'itinerariosCreados',
    label: 'Itinerarios Creados',
    color: 'text-accentPurple',
    stroke: '#8E527D',
    fill: 'rgba(142, 82, 125, 0.12)',
    icon: Compass,
  },
  {
    key: 'conversacionesIa',
    label: 'Conversaciones IA',
    color: 'text-blue-600',
    stroke: '#2563EB',
    fill: 'rgba(37, 99, 235, 0.12)',
    icon: Bot,
  },
  {
    key: 'itinerariosFinalizados',
    label: 'Itinerarios Finalizados',
    color: 'text-emerald-600',
    stroke: '#059669',
    fill: 'rgba(5, 150, 105, 0.12)',
    icon: CheckCircle2,
  },
];

export default function UserActivityLineChart({
  data,
  granularidadAplicada,
  selectedGranularidad,
  onGranularidadChange,
}: UserActivityLineChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('usuariosActivos');
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; pt: PuntoEvolucionTemporal; x: number; y: number } | null>(null);

  const activeConfig = METRICS.find(m => m.key === activeMetric) || METRICS[0];

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-black/5 p-12 text-center text-xs text-textDark/60 shadow-xs">
        No hay puntos de evolución temporal disponibles para este período.
      </div>
    );
  }

  // Dimensiones del canvas SVG
  const width = 800;
  const height = 260;
  const paddingX = 45;
  const paddingY = 30;

  // Extraer valores de la métrica activa
  const values = data.map(d => d[activeMetric] || 0);
  const maxValue = Math.max(...values, 5);
  const minValue = 0;

  // Calcular coordenadas (x, y) de cada punto
  const points = data.map((d, index) => {
    const x = paddingX + (index / Math.max(data.length - 1, 1)) * (width - paddingX * 2);
    const normalizedY = (d[activeMetric] - minValue) / (maxValue - minValue);
    const y = height - paddingY - normalizedY * (height - paddingY * 2);
    return { x, y, data: d, val: d[activeMetric] };
  });

  // Generar string para polilínea / path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  // Guías del eje Y (4 niveles)
  const yTicks = [
    maxValue,
    Math.round(maxValue * 0.66),
    Math.round(maxValue * 0.33),
    0
  ];

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header del Gráfico */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-accentWine">
            <TrendingUp className="h-4 w-4" />
            <span>Evolución Temporal del Comportamiento</span>
          </div>
          <h3 className="font-wixDisplay text-lg font-bold text-textDark">
            Evolución de Actividad en la Plataforma
          </h3>
          <p className="text-xs text-textDark/60">
            Tendencia cronológica con granularidad{' '}
            <strong className="text-accentWine capitalize">{granularidadAplicada}</strong>
            {selectedGranularidad === 'auto' && ' (automática según el período)'}
          </p>
        </div>

        {/* Controles de Granularidad */}
        <div className="flex items-center space-x-2 self-start lg:self-auto">
          <span className="text-[11px] font-bold text-textDark/60 flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-accentWine" />
            <span>Granularidad:</span>
          </span>
          <div className="inline-flex p-1 bg-bgPrimary/80 rounded-xl border border-black/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => onGranularidadChange('auto')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedGranularidad === 'auto'
                  ? 'bg-accentWine text-white shadow-xs'
                  : 'text-textDark/70 hover:text-textDark'
              }`}
              title="Automático: Diaria (<30d), Semanal (30-90d), Mensual (>90d)"
            >
              Auto ({granularidadAplicada[0].toUpperCase()})
            </button>
            <button
              type="button"
              onClick={() => onGranularidadChange('diaria')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedGranularidad === 'diaria'
                  ? 'bg-accentWine text-white shadow-xs'
                  : 'text-textDark/70 hover:text-textDark'
              }`}
            >
              Diaria
            </button>
            <button
              type="button"
              onClick={() => onGranularidadChange('semanal')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedGranularidad === 'semanal'
                  ? 'bg-accentWine text-white shadow-xs'
                  : 'text-textDark/70 hover:text-textDark'
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => onGranularidadChange('mensual')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedGranularidad === 'mensual'
                  ? 'bg-accentWine text-white shadow-xs'
                  : 'text-textDark/70 hover:text-textDark'
              }`}
            >
              Mensual
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Selectoras de Métrica Activa */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          const isActive = activeMetric === metric.key;

          return (
            <button
              key={metric.key}
              type="button"
              onClick={() => {
                setActiveMetric(metric.key);
                setHoveredPoint(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer border ${
                isActive
                  ? 'bg-textDark text-white border-textDark shadow-xs'
                  : 'bg-bgPrimary/60 border-black/10 text-textDark/70 hover:bg-black/5 hover:text-textDark'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-fillSecondary' : metric.color}`} />
              <span>{metric.label}</span>
            </button>
          );
        })}
      </div>

      {/* Canvas SVG del Gráfico de Líneas */}
      <div className="relative w-full overflow-hidden pt-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={activeConfig.stroke} stopOpacity="0.28" />
              <stop offset="100%" stopColor={activeConfig.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Líneas Guía Horizontales (Grid) */}
          {yTicks.map((val, idx) => {
            const normalizedY = (val - minValue) / (maxValue - minValue || 1);
            const y = height - paddingY - normalizedY * (height - paddingY * 2);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(0, 0, 0, 0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3.5}
                  fontSize="10"
                  textAnchor="end"
                  fill="#8E8E93"
                  fontFamily="monospace"
                  fontWeight="600"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Área sombreada bajo la curva */}
          <path
            d={areaPath}
            fill={`url(#gradient-${activeMetric})`}
            className="transition-all duration-500 ease-out"
          />

          {/* Línea principal trazada */}
          <path
            d={linePath}
            fill="none"
            stroke={activeConfig.stroke}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500 ease-out"
          />

          {/* Puntos de datos y etiquetas en eje X */}
          {points.map((pt, idx) => {
            const isHovered = hoveredPoint?.index === idx;
            // Mostrar etiqueta en X con espaciado inteligente para no encimar
            const stepSkip = Math.max(1, Math.ceil(points.length / 8));
            const showLabel = idx % stepSkip === 0 || idx === points.length - 1;

            return (
              <g key={idx}>
                {/* Etiqueta X */}
                {showLabel && (
                  <text
                    x={pt.x}
                    y={height - 8}
                    fontSize="9.5"
                    textAnchor="middle"
                    fill="#6B7280"
                    fontWeight="600"
                  >
                    {pt.data.etiqueta}
                  </text>
                )}

                {/* Zona interactiva invisible de hover */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={16}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint({ index: idx, pt: pt.data, x: pt.x, y: pt.y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />

                {/* Círculo visible del punto */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 3.5}
                  fill="#ffffff"
                  stroke={activeConfig.stroke}
                  strokeWidth={isHovered ? 3.5 : 2}
                  className="transition-all duration-150 pointer-events-none"
                />
              </g>
            );
          })}
        </svg>

        {/* Tooltip flotante interactivo */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-textDark text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1 min-w-[130px] border border-white/10"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <div className="text-[10px] text-white/60 font-semibold border-b border-white/10 pb-1">
              {hoveredPoint.pt.etiqueta}
            </div>
            <div className="flex items-center justify-between space-x-2 pt-0.5">
              <span className="text-white/80 font-medium">{activeConfig.label}:</span>
              <span className="font-mono font-bold text-fillSecondary text-sm">
                {hoveredPoint.pt[activeMetric]}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Info Contextual y Leyenda Inferior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-black/5 text-[11px] text-textDark/60">
        <span className="flex items-center space-x-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeConfig.stroke }} />
          <span>Curva de {activeConfig.label}. Pasá el cursor sobre los puntos para ver el valor exacto.</span>
        </span>
        <span className="font-semibold text-textDark">
          Total del período: <strong className="text-accentWine font-bold">{data.reduce((a, b) => a + (b[activeMetric] || 0), 0)}</strong>
        </span>
      </div>
    </div>
  );
}
