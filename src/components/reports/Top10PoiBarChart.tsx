'use client';

import React, { useState } from 'react';
import { Top10PoiGrafico, PoiReporteItem } from '@/types/reportes';
import { BarChart3, TrendingUp, AlertTriangle, Eye, Info } from 'lucide-react';

interface Top10PoiBarChartProps {
  data: Top10PoiGrafico[];
  onSelectPoi?: (poiId: string) => void;
}

export default function Top10PoiBarChart({ data, onSelectPoi }: Top10PoiBarChartProps) {
  const [hoveredPoiId, setHoveredPoiId] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  // Máximo valor para calcular la escala porcentual de las barras
  const maxPlanificados = Math.max(...data.map(d => d.planificados), 1);

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Header del Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-accentWine">
            <BarChart3 className="h-4 w-4" />
            <span>Métricas Comparativas</span>
          </div>
          <h3 className="font-wixDisplay text-lg font-bold text-textDark">
            Top 10 POIs más Incluidos y Visitados
          </h3>
          <p className="text-xs text-textDark/60">
            Comparativa entre itinerarios planificados y visitas efectivamente completadas por turistas
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-accentWine/30 border border-accentWine/50" />
            <span className="text-textDark/70">Planificados</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="h-3 w-3 rounded-full bg-accentWine shadow-xs" />
            <span className="text-textDark font-bold">Visitas Efectivas</span>
          </div>
        </div>
      </div>

      {/* Lista de Barras de los Top 10 */}
      <div className="space-y-4">
        {data.map((item, index) => {
          const planWidth = (item.planificados / maxPlanificados) * 100;
          const visitasWidth = (item.visitadosEfectivos / maxPlanificados) * 100;
          const isHighAbandonment = item.tasaAbandono >= 40;
          const isHovered = hoveredPoiId === item.poiId;

          return (
            <div
              key={item.poiId}
              onMouseEnter={() => setHoveredPoiId(item.poiId)}
              onMouseLeave={() => setHoveredPoiId(null)}
              onClick={() => onSelectPoi && onSelectPoi(item.poiId)}
              className={`p-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${
                isHovered
                  ? 'bg-accentWine/5 ring-1 ring-accentWine/30 shadow-xs'
                  : 'hover:bg-bgPrimary/60'
              }`}
            >
              {/* Info Superior de la Barra */}
              <div className="flex items-center justify-between text-xs mb-2 gap-2">
                <div className="flex items-center space-x-2 min-w-0">
                  <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    index < 3 
                      ? 'bg-accentWine text-white shadow-xs' 
                      : 'bg-black/5 text-textDark/70'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="font-bold text-textDark truncate hover:text-accentWine transition-colors">
                    {item.nombre}
                  </span>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  {/* Badge de Tasa de Abandono */}
                  {isHighAbandonment ? (
                    <span 
                      title="Alta tasa de abandono (≥ 40%): Este destino suele planificarse pero se cancela o abandona durante el viaje."
                      className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                    >
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      <span>{item.tasaAbandono.toFixed(1)}% abandono</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-textDark/60">
                      {item.tasaAbandono.toFixed(1)}% abandono
                    </span>
                  )}

                  <span className="text-[11px] text-textDark/80 font-mono font-bold">
                    <span className="text-accentWine font-extrabold">{item.visitadosEfectivos}</span>
                    <span className="text-textDark/40"> / </span>
                    <span className="text-textDark/60">{item.planificados}</span>
                  </span>

                  <button 
                    type="button" 
                    className="p-1 text-textDark/40 hover:text-accentWine transition-colors"
                    title="Ver desglose mensual"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Barra de Progreso Compuesta */}
              <div className="relative h-4 w-full bg-black/5 rounded-full overflow-hidden">
                {/* Barra de Planificados (fondo translúcido) */}
                <div
                  className="absolute top-0 bottom-0 left-0 bg-accentWine/25 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${planWidth}%` }}
                />
                {/* Barra de Visitas Efectivas (frente sólido) */}
                <div
                  className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-700 ease-out ${
                    isHighAbandonment 
                      ? 'bg-gradient-to-r from-accentWine to-amber-600' 
                      : 'bg-gradient-to-r from-accentWine to-fillPrimary'
                  }`}
                  style={{ width: `${visitasWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pie con información contextual */}
      <div className="flex items-center justify-between pt-2 border-t border-black/5 text-[11px] text-textDark/50">
        <span className="flex items-center space-x-1.5">
          <Info className="h-3.5 w-3.5 text-accentWine" />
          <span>Hacé clic en cualquier POI para consultar el detalle mensual de visitas</span>
        </span>
        <span className="font-semibold text-accentWine">
          Actualizado en tiempo real
        </span>
      </div>
    </div>
  );
}
