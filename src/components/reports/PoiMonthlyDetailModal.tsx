'use client';

import React from 'react';
import { PoiDetalleMensualResponse } from '@/types/reportes';
import { 
  X, 
  Calendar, 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  Layers 
} from 'lucide-react';

interface PoiMonthlyDetailModalProps {
  detail: PoiDetalleMensualResponse | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

export default function PoiMonthlyDetailModal({
  detail,
  isOpen,
  onClose,
  isLoading = false,
}: PoiMonthlyDetailModalProps) {
  if (!isOpen) return null;

  const isHighAbandonment = detail ? detail.tasaAbandonoGlobal >= 40 : false;
  const maxMonthly = detail 
    ? Math.max(...detail.distribucionMensual.map(m => m.apariciones), 1) 
    : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/10 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-start justify-between p-6 sm:p-7 border-b border-black/5 bg-gradient-to-r from-bgPrimary to-white sticky top-0 z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-accentWine">
              <BarChart2 className="h-4 w-4" />
              <span>Detalle de Distribución Temporal</span>
            </div>
            <h2 className="font-wixDisplay text-xl sm:text-2xl font-extrabold text-textDark">
              {detail?.nombre || 'Cargando POI...'}
            </h2>
            {detail?.categoria && (
              <div className="flex items-center space-x-2 text-xs text-textDark/60 pt-0.5">
                <span className="bg-accentWine/10 text-accentWine px-2.5 py-0.5 rounded-md font-bold text-[10px]">
                  {detail.categoria}
                </span>
                <span>• Distribución mensual de visitas dentro del período filtrado</span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-textDark/40 hover:text-textDark hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 flex-1">
          {isLoading ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-9 w-9 border-3 border-accentWine border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-textDark/60">
                Consultando distribución mensual del atractivo...
              </p>
            </div>
          ) : !detail ? (
            <div className="py-12 text-center text-xs text-textDark/60">
              No se pudo obtener la información del POI seleccionado.
            </div>
          ) : (
            <>
              {/* KPIs de Resumen */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-bgPrimary/70 border border-black/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textDark/50">
                    Planificados en Rutas
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-wixDisplay text-2xl font-black text-textDark">
                      {detail.totalApariciones}
                    </span>
                    <span className="text-xs text-textDark/60">itinerarios</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-bgPrimary/70 border border-black/5 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textDark/50">
                    Visitas Efectivas
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="font-wixDisplay text-2xl font-black text-accentWine">
                      {detail.totalVisitasEfectivas}
                    </span>
                    <span className="text-xs text-textDark/60">completadas</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border space-y-1 ${
                  isHighAbandonment 
                    ? 'bg-amber-50/70 border-amber-200' 
                    : 'bg-bgPrimary/70 border-black/5'
                }`}>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textDark/50 flex items-center space-x-1">
                    <span>Tasa de Abandono</span>
                    {isHighAbandonment && <AlertTriangle className="h-3 w-3 text-amber-600" />}
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className={`font-wixDisplay text-2xl font-black ${
                      isHighAbandonment ? 'text-amber-800' : 'text-textDark'
                    }`}>
                      {detail.tasaAbandonoGlobal.toFixed(1)}%
                    </span>
                    {isHighAbandonment && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                        ALTA
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensaje de Alta Tasa de Abandono */}
              {isHighAbandonment && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold">Advertencia de Tasa de Abandono Elevada (≥ 40%)</span>
                    <p className="text-amber-800 leading-relaxed text-[11px]">
                      Este POI presenta una gran disparidad entre las veces que los turistas lo planifican y las veces que efectivamente lo visitan. Se recomienda revisar la accesibilidad de la ruta, horarios de atención o tiempos estimados de traslado.
                    </p>
                  </div>
                </div>
              )}

              {/* Gráfico y Desglose por Mes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-wixDisplay text-sm font-bold text-textDark">
                    Desglose Mensual de Visitas
                  </h4>
                  <div className="flex items-center space-x-3 text-[11px] font-semibold text-textDark/60">
                    <span className="flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-accentWine/30" />
                      <span>Planificadas</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="h-2 w-2 rounded-full bg-accentWine" />
                      <span>Visitas Reales</span>
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {detail.distribucionMensual.map((mes) => {
                    const planPct = (mes.apariciones / maxMonthly) * 100;
                    const visitasPct = (mes.visitasEfectivas / maxMonthly) * 100;

                    return (
                      <div key={mes.mes} className="p-3 bg-bgPrimary/40 rounded-xl space-y-2 border border-black/5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-textDark">
                            {mes.etiquetaMes}
                          </span>
                          <div className="flex items-center space-x-3 text-[11px]">
                            <span className="text-textDark/60">
                              <strong className="text-textDark">{mes.visitasEfectivas}</strong> de {mes.apariciones} visitas
                            </span>
                            <span className={`font-semibold px-2 py-0.5 rounded-md ${
                              mes.tasaAbandono >= 40 
                                ? 'bg-amber-100 text-amber-800 font-bold' 
                                : 'bg-black/5 text-textDark/70'
                            }`}>
                              {mes.tasaAbandono.toFixed(1)}% abandono
                            </span>
                          </div>
                        </div>

                        {/* Barra comparativa mensual */}
                        <div className="relative h-3 w-full bg-black/5 rounded-full overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-accentWine/25 rounded-full transition-all duration-500"
                            style={{ width: `${planPct}%` }}
                          />
                          <div
                            className="absolute top-0 bottom-0 left-0 bg-accentWine rounded-full transition-all duration-500"
                            style={{ width: `${visitasPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabla Resumen */}
              <div className="overflow-x-auto border border-black/5 rounded-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-bgPrimary/60 text-[10px] font-bold text-textDark/60 uppercase tracking-wider border-b border-black/5">
                    <tr>
                      <th className="py-2.5 px-4">Período / Mes</th>
                      <th className="py-2.5 px-4 text-center">Planificados</th>
                      <th className="py-2.5 px-4 text-center">Visitas Efectivas</th>
                      <th className="py-2.5 px-4 text-right">Tasa de Abandono</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {detail.distribucionMensual.map((m) => (
                      <tr key={m.mes} className="hover:bg-bgPrimary/30 transition-colors">
                        <td className="py-2.5 px-4 font-semibold text-textDark">{m.etiquetaMes}</td>
                        <td className="py-2.5 px-4 text-center font-mono text-textDark/80">{m.apariciones}</td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-accentWine">{m.visitasEfectivas}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-semibold">
                          <span className={m.tasaAbandono >= 40 ? 'text-amber-700 font-bold' : 'text-textDark/70'}>
                            {m.tasaAbandono.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-black/5 bg-bgPrimary/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-accentWine hover:bg-accentWine/90 text-white rounded-xl text-xs font-bold shadow-md shadow-accentWine/10 transition-all cursor-pointer"
          >
            Cerrar detalle
          </button>
        </div>
      </div>
    </div>
  );
}
