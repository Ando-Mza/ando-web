'use client';

import React, { useState } from 'react';
import { DistribucionTematicaItem } from '@/types/reportes';
import { PieChart, Clock, Info, Sparkles, MessageCircle } from 'lucide-react';

interface AiThematicPieChartProps {
  distribucion: DistribucionTematicaItem[];
  datosSemanaAnterior?: boolean;
  mensajeEstadoProcesamiento?: string;
}

const CATEGORY_COLORS: Record<string, { stroke: string; bg: string; text: string }> = {
  'Información turística': { stroke: '#750031', bg: 'bg-[#750031]', text: 'text-[#750031]' },
  'Ayuda con itinerario': { stroke: '#E96509', bg: 'bg-[#E96509]', text: 'text-[#E96509]' },
  'Recomendaciones': { stroke: '#8E527D', bg: 'bg-[#8E527D]', text: 'text-[#8E527D]' },
  'Soporte de plataforma': { stroke: '#2563EB', bg: 'bg-blue-600', text: 'text-blue-600' },
  'Otros': { stroke: '#6B7280', bg: 'bg-gray-500', text: 'text-gray-500' },
};

export default function AiThematicPieChart({
  distribucion,
  datosSemanaAnterior = false,
  mensajeEstadoProcesamiento,
}: AiThematicPieChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const total = distribucion.reduce((acc, item) => acc + item.cantidad, 0);

  // Dimensiones del Donut SVG
  const size = 260;
  const radius = 90;
  const strokeWidth = 32;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Calcular offsets para cada arco en el SVG Donut
  let accumulatedPercent = 0;
  const segments = distribucion.map((item) => {
    const strokeDasharray = `${(item.porcentaje / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += item.porcentaje;

    const colors = CATEGORY_COLORS[item.categoria] || {
      stroke: '#9CA3AF',
      bg: 'bg-gray-400',
      text: 'text-gray-400',
    };

    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
      colors,
    };
  });

  const activeItem = segments.find((s) => s.categoria === hoveredCategory) || segments[0];

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header del Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-accentWine">
            <PieChart className="h-4 w-4" />
            <span>Clasificación temática semanal</span>
          </div>
          <h3 className="font-wixDisplay text-lg font-bold text-textDark">
            Distribución Temática de Consultas
          </h3>
          <p className="text-xs text-textDark/60">
            Agrupación de las consultas de los turistas por tema. No se muestra el contenido de los mensajes.
          </p>
        </div>

        {/* Criterio 5: Indicación si se exhiben datos de la semana anterior */}
        {datosSemanaAnterior && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold self-start sm:self-auto">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span>Semana actual en procesamiento</span>
          </div>
        )}
      </div>

      {/* Banner de procesamiento en curso si aplica (Criterio 5) */}
      {(datosSemanaAnterior || mensajeEstadoProcesamiento) && (
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start space-x-2.5" role="status">
          <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            {mensajeEstadoProcesamiento ||
              'Los datos de la semana actual están siendo procesados; se muestran los resultados de la última semana clasificada.'}
          </p>
        </div>
      )}

      {total === 0 && (
        <p className="text-xs text-textDark/60 text-center py-2">
          Todavía no hay consultas clasificadas para mostrar en este período.
        </p>
      )}

      {/* Contenido: Gráfico Donut + Leyenda */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Donut SVG Interactivo (Criterio 2) */}
        <div className="md:col-span-5 flex justify-center relative">
          <div className="relative">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
              {segments.map((seg) => {
                const isHovered = hoveredCategory === seg.categoria;

                return (
                  <circle
                    key={seg.categoria}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="transparent"
                    stroke={seg.colors.stroke}
                    strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-200 cursor-pointer"
                    onMouseEnter={() => setHoveredCategory(seg.categoria)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                );
              })}
            </svg>

            {/* Centro del Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
              <span className="text-[10px] font-bold text-textDark/50 uppercase tracking-wider truncate max-w-[120px]">
                {activeItem ? activeItem.categoria : 'Total Consultas'}
              </span>
              <span className="font-wixDisplay text-2xl font-black text-textDark">
                {activeItem ? `${activeItem.porcentaje.toFixed(1)}%` : total}
              </span>
              <span className="text-[10px] font-semibold text-textDark/60 font-mono">
                {activeItem ? `${activeItem.cantidad} consultas` : 'mensajes analizados'}
              </span>
            </div>
          </div>
        </div>

        {/* Leyenda y Lista de Porcentajes */}
        <div className="md:col-span-7 space-y-3">
          {segments.map((seg) => {
            const isHovered = hoveredCategory === seg.categoria;

            return (
              <div
                key={seg.categoria}
                onMouseEnter={() => setHoveredCategory(seg.categoria)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  isHovered
                    ? 'bg-accentWine/5 border-accentWine/30 shadow-xs'
                    : 'bg-bgPrimary/40 border-black/5 hover:bg-bgPrimary'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    <span className={`h-3 w-3 rounded-full ${seg.colors.bg} flex-shrink-0`} />
                    <span className="font-bold text-textDark">{seg.categoria}</span>
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-textDark/50 text-[11px]">{seg.cantidad} consultas</span>
                    <span className="font-black text-textDark text-xs">{seg.porcentaje.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Mini barra de progreso relativa */}
                <div className="w-full bg-black/5 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${seg.colors.bg} rounded-full transition-all duration-500`}
                    style={{ width: `${seg.porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Nota de Privacidad */}
      <div className="p-3 bg-bgPrimary/60 rounded-xl border border-black/5 text-[11px] text-textDark/50 flex items-center justify-between">
        <span>
          🔒 <strong>Privacidad de Chat:</strong> Por seguridad de los usuarios, no se expone el contenido completo de los mensajes individuales.
        </span>
        <span className="font-semibold text-accentWine">
          Total de consultas analizadas: {total}
        </span>
      </div>
    </div>
  );
}
