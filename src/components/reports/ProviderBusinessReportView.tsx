'use client';

import React, { useState } from 'react';
import { 
  DetalleNegocioPrestador, 
  ResenaRecientePrestador 
} from '@/types/reportes';
import { 
  Store, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  MapPin, 
  PlusCircle, 
  ArrowUpRight, 
  CornerDownRight, 
  Send, 
  Clock, 
  Sparkles,
  BarChart3,
  Award,
  Layers
} from 'lucide-react';
import Link from 'next/link';

interface ProviderBusinessReportViewProps {
  negocios: DetalleNegocioPrestador[];
  onReplyReview?: (reviewId: string, replyComment: string) => Promise<void>;
}

export default function ProviderBusinessReportView({
  negocios,
  onReplyReview,
}: ProviderBusinessReportViewProps) {
  const [selectedPoiIndex, setSelectedPoiIndex] = useState<number>(0);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [replyErrorMap, setReplyErrorMap] = useState<Record<string, string>>({});

  // Criterio 5: "El Prestador no tiene negocios vinculados -> Que el sistema muestre un mensaje indicando que debo registrar un negocio primero"
  if (!negocios || negocios.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-5 shadow-xs max-w-xl mx-auto font-wixText">
        <div className="h-16 w-16 rounded-full bg-accentWine/10 text-accentWine flex items-center justify-center mx-auto">
          <Store className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-wixDisplay text-xl font-bold text-textDark">
            No tienes negocios vinculados a tu cuenta
          </h3>
          <p className="text-xs text-textDark/60 leading-relaxed">
            Para consultar las métricas de visibilidad, flujo de turistas, check-ins y ranking de tu rubro, primero debes registrar y dar de alta tu establecimiento en la plataforma.
          </p>
        </div>
        <Link
          href="/provider/business"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-accentWine hover:bg-accentWine/90 text-white rounded-2xl text-xs font-bold shadow-lg shadow-accentWine/20 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Registrar mi negocio ahora</span>
        </Link>
      </div>
    );
  }

  const currentNegocio = negocios[selectedPoiIndex] || negocios[0];
  const ranking = currentNegocio.rankingCategoria;
  const isHighAbandonment = currentNegocio.esAltaTasaAbandono || currentNegocio.tasaAbandono >= 40;

  const handleSendReply = async (reviewId: string) => {
    const text = replyTextMap[reviewId]?.trim();
    if (!text || !onReplyReview || sendingReplyId) return;
    setSendingReplyId(reviewId);
    setReplyErrorMap(prev => ({ ...prev, [reviewId]: '' }));
    try {
      await onReplyReview(reviewId, text);
      setReplyTextMap(prev => ({ ...prev, [reviewId]: '' }));
    } catch (err) {
      setReplyErrorMap(prev => ({
        ...prev,
        [reviewId]:
          err instanceof Error && err.message
            ? err.message
            : 'No se pudo publicar la respuesta. Intentá nuevamente.',
      }));
    } finally {
      setSendingReplyId(null);
    }
  };

  return (
    <div className="space-y-8 font-wixText">
      {/* Selector de Negocio si el Prestador tiene más de 1 POI */}
      {negocios.length > 1 && (
        <div className="flex items-center space-x-2 bg-white p-2 rounded-2xl border border-black/5 w-fit">
          <span className="text-xs font-bold text-textDark/70 pl-2">Mis negocios:</span>
          {negocios.map((neg, idx) => (
            <button
              key={neg.poiId}
              onClick={() => setSelectedPoiIndex(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedPoiIndex === idx
                  ? 'bg-accentWine text-white shadow-xs'
                  : 'text-textDark/70 hover:bg-black/5'
              }`}
            >
              {neg.nombre}
            </button>
          ))}
        </div>
      )}

      {/* BANNER DESTACADO: POSICIONAMIENTO EN EL RANKING (Criterio 4) */}
      {ranking && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-1.5 text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                <Award className="h-3.5 w-3.5 text-emerald-700" />
                <span>Posicionamiento Oficial en Mendoza</span>
              </div>
              <h3 className="font-wixDisplay text-xl sm:text-2xl font-black text-textDark">
                Puesto #{ranking.posicionActual} de {ranking.totalEnCategoria} en {ranking.categoriaNombre}
              </h3>
              <p className="text-xs text-textDark/70">
                Desempeño relativo calculado en base a frecuencia de inclusión en itinerarios de turistas y valoraciones confirmadas.
              </p>
            </div>

            {/* Criterio 4: "mi negocio subió posiciones en el ranking de su categoría respecto al período anterior -> Visualizar ese cambio destacado" */}
            {ranking.subioPosiciones && (
              <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center space-x-3 self-start sm:self-auto flex-shrink-0 animate-pulse">
                <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 stroke-[3]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    ¡Tendencia Positiva!
                  </span>
                  <p className="font-wixDisplay text-sm font-black">
                    ▲ Subió {ranking.cambioPosiciones} posiciones
                  </p>
                  <p className="text-[10px] text-emerald-100">
                    Puesto anterior: #{ranking.posicionAnterior}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GRILLA DE KPIS DEL NEGOCIO PROPIO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Paradas Planificadas */}
        <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textDark/50">
            Itinerarios Planificados
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="font-wixDisplay text-3xl font-black text-textDark">
              {currentNegocio.inclusionesRutas}
            </span>
            <span className="text-xs text-textDark/60">veces incluido</span>
          </div>
          <p className="text-[11px] text-textDark/50 pt-2 border-t border-black/5">
            Turistas que agregaron tu local a su ruta
          </p>
        </div>

        {/* KPI 2: Check-ins Confirmados */}
        <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textDark/50">
            Check-ins Confirmados
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="font-wixDisplay text-3xl font-black text-accentWine">
              {currentNegocio.checkInsConfirmados}
            </span>
            <span className="text-xs text-textDark/60">visitas efectivas</span>
          </div>
          <p className="text-[11px] text-textDark/50 pt-2 border-t border-black/5">
            Llegadas reales registradas en la app
          </p>
        </div>

        {/* KPI 3: Tasa de Abandono (Criterio 3: Identificar visualmente alta deserción) */}
        <div className={`p-5 rounded-3xl border shadow-xs space-y-2 ${
          isHighAbandonment ? 'bg-amber-50/70 border-amber-300' : 'bg-white border-black/5'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textDark/50">
              Tasa de Abandono
            </span>
            {isHighAbandonment && (
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3 text-amber-700" />
                <span>Atención</span>
              </span>
            )}
          </div>
          <div className="flex items-baseline space-x-2">
            <span className={`font-wixDisplay text-3xl font-black ${
              isHighAbandonment ? 'text-amber-800' : 'text-textDark'
            }`}>
              {currentNegocio.tasaAbandono.toFixed(1)}%
            </span>
          </div>
          <p className={`text-[11px] pt-2 border-t ${
            isHighAbandonment ? 'border-amber-200 text-amber-800' : 'border-black/5 text-textDark/50'
          }`}>
            {isHighAbandonment
              ? 'Alta deserción (≥ 40%): Los turistas planifican tu negocio pero no concretan la visita.'
              : 'Nivel óptimo de concreción de visitas en viaje.'}
          </p>
        </div>

        {/* KPI 4: Puntuación & Reseñas */}
        <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-textDark/50">
            Reputación y Opiniones
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="font-wixDisplay text-3xl font-black text-amber-500 flex items-center space-x-1">
              <span>⭐ {currentNegocio.puntuacionPromedio.toFixed(1)}</span>
            </span>
            <span className="text-xs text-textDark/60">({currentNegocio.volumenOpiniones} reseñas)</span>
          </div>
          <p className="text-[11px] text-textDark/50 pt-2 border-t border-black/5">
            Incidencias activas: {currentNegocio.incidenciasReportadas}
          </p>
        </div>
      </div>

      {/* TENDENCIA MENSUAL DE PARADAS PLANIFICADAS VS CHECK-INS */}
      <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div className="space-y-1">
            <h3 className="font-wixDisplay text-lg font-bold text-textDark">
              Tendencia Mensual de Visitas a Tu Negocio
            </h3>
            <p className="text-xs text-textDark/60">
              Evolución de itinerarios planificados vs visitas completadas en los últimos meses
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-accentWine/30" />
              <span className="text-textDark/70">Planificadas</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="h-3 w-3 rounded-full bg-accentWine" />
              <span className="text-textDark font-bold">Check-ins</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {currentNegocio.tendenciaMensual.map((m) => {
            const maxVal = Math.max(...currentNegocio.tendenciaMensual.map(t => t.paradasPlanificadas), 1);
            const planHeight = (m.paradasPlanificadas / maxVal) * 100;
            const checkHeight = (m.checkIns / maxVal) * 100;

            return (
              <div key={m.mes} className="p-3.5 rounded-2xl bg-bgPrimary/50 border border-black/5 flex flex-col justify-between space-y-3">
                <span className="text-xs font-bold text-textDark truncate">
                  {m.etiquetaMes}
                </span>

                {/* Mini barras verticales */}
                <div className="h-28 flex items-end justify-center space-x-2 pt-2">
                  {/* Barra planificadas */}
                  <div
                    className="w-4 bg-accentWine/30 rounded-t-md transition-all duration-500"
                    style={{ height: `${planHeight}%` }}
                    title={`Planificadas: ${m.paradasPlanificadas}`}
                  />
                  {/* Barra check-ins */}
                  <div
                    className="w-4 bg-accentWine rounded-t-md transition-all duration-500"
                    style={{ height: `${checkHeight}%` }}
                    title={`Check-ins: ${m.checkIns}`}
                  />
                </div>

                <div className="text-[11px] font-mono text-center border-t border-black/5 pt-1.5">
                  <span className="font-bold text-accentWine">{m.checkIns}</span>
                  <span className="text-textDark/40"> / </span>
                  <span className="text-textDark/60">{m.paradasPlanificadas}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ÚLTIMAS 5 RESEÑAS CON FLUJO DE RESPUESTA DIRECTA (US-RYV) */}
      <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-accentWine">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Reseñas de tus visitantes</span>
            </div>
            <h3 className="font-wixDisplay text-lg font-bold text-textDark">
              Últimas 5 Reseñas de Turistas
            </h3>
            <p className="text-xs text-textDark/60">
              Respondé directamente a tus visitantes para fortalecer la confianza de la comunidad viajera
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {currentNegocio.resenasRecientes.length === 0 && (
            <p className="text-xs text-textDark/60 text-center py-6">
              Este negocio todavía no recibió reseñas.
            </p>
          )}
          {currentNegocio.resenasRecientes.map((rev) => {
            const hasReply = !!rev.respuestaPrestador;

            return (
              <div key={rev.id} className="p-4 rounded-2xl bg-bgPrimary/40 border border-black/5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-accentWine/10 text-accentWine font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {rev.autor.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={rev.autor.avatarUrl} alt={rev.autor.nombre} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        rev.autor.nombre.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-textDark">{rev.autor.nombre}</p>
                      <span className="text-[10px] text-textDark/50">
                        {new Date(rev.fechaCreacion).toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < (rev.puntuacion ?? 0) ? 'fill-amber-500 text-amber-500' : 'text-black/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {rev.comentario && (
                  <p className="text-xs text-textDark/80 leading-relaxed italic pl-12">
                    &ldquo;{rev.comentario}&rdquo;
                  </p>
                )}

                {/* Respuesta existente */}
                {hasReply ? (
                  <div className="ml-12 p-3 bg-white rounded-xl border border-black/5 space-y-1">
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-accentWine">
                      <CornerDownRight className="h-3 w-3" />
                      <span>Respuesta de tu negocio</span>
                    </div>
                    <p className="text-xs text-textDark/80">
                      {rev.respuestaPrestador?.comentario}
                    </p>
                  </div>
                ) : (
                  /* Formulario para responder directamente */
                  <div className="ml-12 pt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={replyTextMap[rev.id] || ''}
                        onChange={(e) => setReplyTextMap({ ...replyTextMap, [rev.id]: e.target.value })}
                        placeholder="Escribir una respuesta pública..."
                        aria-label={`Responder a la reseña de ${rev.autor.nombre}`}
                        maxLength={1000}
                        disabled={sendingReplyId === rev.id}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void handleSendReply(rev.id);
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-black/15 bg-white text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/30"
                      />
                      <button
                        type="button"
                        onClick={() => handleSendReply(rev.id)}
                        disabled={!replyTextMap[rev.id]?.trim() || sendingReplyId !== null}
                        className="px-4 py-2 bg-accentWine hover:bg-accentWine/90 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                        <span>{sendingReplyId === rev.id ? 'Enviando...' : 'Responder'}</span>
                      </button>
                    </div>
                    {replyErrorMap[rev.id] && (
                      <p className="text-[11px] font-semibold text-red-600" role="alert">
                        {replyErrorMap[rev.id]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
