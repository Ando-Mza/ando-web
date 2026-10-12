'use client';

import React, { useEffect, useState } from 'react';
import { MetricasAsistenteIa } from '@/types/reportes';
import { 
  Bot, 
  MessageSquare, 
  Coins, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Settings2, 
  Sparkles, 
  Repeat,
  Sliders
} from 'lucide-react';

interface AiAssistantUsageKpisProps {
  metricas: MetricasAsistenteIa;
  /** Persiste el nuevo umbral. Si rechaza, se muestra el mensaje del error. */
  onUmbralChange?: (nuevoUmbral: number) => Promise<void>;
}

export default function AiAssistantUsageKpis({
  metricas,
  onUmbralChange,
}: AiAssistantUsageKpisProps) {
  const umbralGuardado = metricas.umbralCostoAlerta;
  const [umbralInput, setUmbralInput] = useState<string>(String(umbralGuardado));
  const [showConfigUmbral, setShowConfigUmbral] = useState<boolean>(false);
  const [isSavingUmbral, setIsSavingUmbral] = useState<boolean>(false);
  const [umbralError, setUmbralError] = useState<string | null>(null);

  useEffect(() => {
    setUmbralInput(String(umbralGuardado));
  }, [umbralGuardado]);

  // Criterio 3: el costo estimado se destaca en rojo cuando supera el umbral configurado (guardado)
  const superaUmbral = metricas.costoEstimado > umbralGuardado;

  const handleApplyUmbral = async () => {
    if (isSavingUmbral) return;
    const valor = Number(umbralInput.replace(',', '.'));
    if (!Number.isFinite(valor) || valor <= 0) {
      setUmbralError('Ingresá un monto mayor a 0.');
      return;
    }
    setUmbralError(null);
    setIsSavingUmbral(true);
    try {
      await onUmbralChange?.(Math.round(valor * 100) / 100);
      setShowConfigUmbral(false);
    } catch (err) {
      setUmbralError(err instanceof Error ? err.message : 'No se pudo guardar el umbral.');
    } finally {
      setIsSavingUmbral(false);
    }
  };

  const handleCancelUmbral = () => {
    setUmbralInput(String(umbralGuardado));
    setUmbralError(null);
    setShowConfigUmbral(false);
  };

  return (
    <div className="space-y-4 font-wixText">
      {/* Banner de Umbral Configurable */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-white rounded-2xl border border-black/5 shadow-xs text-xs">
        <div className="flex items-center space-x-2">
          <Settings2 className="h-4 w-4 text-accentWine" />
          <span className="text-textDark/70">
            Umbral de alerta de costo configurado:{' '}
            <strong className="text-textDark font-bold font-mono">${umbralGuardado.toFixed(2)} USD</strong>
          </span>
          {superaUmbral && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-300">
              Costo por encima del umbral
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {showConfigUmbral ? (
            <div className="flex items-center space-x-2">
              <label htmlFor="umbral-costo-ia" className="text-[11px] text-textDark/60">
                Nuevo umbral (USD):
              </label>
              <input
                id="umbral-costo-ia"
                type="number"
                min="0.01"
                step="0.01"
                value={umbralInput}
                disabled={isSavingUmbral}
                onChange={(e) => {
                  setUmbralInput(e.target.value);
                  if (umbralError) setUmbralError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleApplyUmbral();
                }}
                aria-invalid={!!umbralError}
                className={`w-24 px-2 py-1 text-xs rounded-lg border bg-bgPrimary font-mono font-bold ${
                  umbralError ? 'border-red-400' : 'border-black/20'
                }`}
              />
              <button
                type="button"
                onClick={() => void handleApplyUmbral()}
                disabled={isSavingUmbral}
                className="px-3 py-1 bg-accentWine text-white rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isSavingUmbral ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={handleCancelUmbral}
                disabled={isSavingUmbral}
                className="px-2 py-1 text-xs text-textDark/60 hover:text-textDark cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfigUmbral(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-bgPrimary hover:bg-black/5 rounded-xl text-xs font-bold text-textDark/70 transition-colors cursor-pointer"
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Configurar umbral</span>
            </button>
          )}
        </div>
      </div>
      {umbralError && (
        <p className="text-[11px] font-semibold text-red-600 px-1" role="alert">
          {umbralError}
        </p>
      )}

      {/* Grilla de KPIs de Métricas Clave (Criterio 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Conversaciones Iniciadas */}
        <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textDark/50">
              Conversaciones Iniciadas
            </span>
            <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Bot className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-wixDisplay text-3xl font-black text-textDark">
              {metricas.totalConversaciones.toLocaleString()}
            </span>
            <span className="text-xs text-textDark/50 font-semibold">sesiones</span>
          </div>
          <p className="text-[11px] text-textDark/50 pt-2 border-t border-black/5">
            Interacciones turísticas atendidas por la IA
          </p>
        </div>

        {/* KPI 2: Mensajes de Usuario */}
        <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textDark/50">
              Mensajes de Turistas
            </span>
            <div className="h-9 w-9 rounded-2xl bg-accentWine/10 text-accentWine flex items-center justify-center">
              <MessageSquare className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-wixDisplay text-3xl font-black text-accentWine">
              {metricas.totalMensajesEnviados.toLocaleString()}
            </span>
            <span className="text-xs text-textDark/50 font-semibold">prompts</span>
          </div>
          <p className="text-[11px] text-textDark/50 pt-2 border-t border-black/5">
            Promedio: <strong>{metricas.promedioMensajesPorConversacion.toFixed(1)}</strong> msjs / conversación
          </p>
        </div>

        {/* KPI 3: Tokens Consumidos */}
        <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-textDark/50">
              Tokens Consumidos
            </span>
            <div className="h-9 w-9 rounded-2xl bg-fillPrimary/10 text-fillPrimary flex items-center justify-center">
              <Coins className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-wixDisplay text-3xl font-black text-textDark">
              {(metricas.totalTokensConsumidos / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-textDark/50 font-semibold font-mono">tokens</span>
          </div>
          <p className="text-[11px] text-textDark/50 pt-2 border-t border-black/5">
            Promedio: <strong>{Math.round(metricas.promedioTokensPorMensaje)}</strong> tokens / mensaje
          </p>
        </div>

        {/* KPI 4: Costo Estimado (Criterio 3: Destacado en ROJO si supera el umbral configurable) */}
        <div className={`p-5 rounded-3xl border shadow-xs space-y-2 transition-all ${
          superaUmbral 
            ? 'bg-rose-50/90 border-rose-300 ring-2 ring-rose-400/40' 
            : 'bg-white border-black/5'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              superaUmbral ? 'text-rose-700 font-black' : 'text-textDark/50'
            }`}>
              Costo Estimado (USD)
            </span>
            <div className={`h-9 w-9 rounded-2xl flex items-center justify-center ${
              superaUmbral ? 'bg-rose-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-600'
            }`}>
              <DollarSign className="h-4.5 w-4.5" />
            </div>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className={`font-wixDisplay text-3xl font-black ${
              superaUmbral ? 'text-rose-700' : 'text-textDark'
            }`}>
              ${metricas.costoEstimado.toFixed(2)}
            </span>
            <span className={`text-xs font-semibold ${superaUmbral ? 'text-rose-600 font-bold' : 'text-textDark/50'}`}>
              USD
            </span>
          </div>

          <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
            {superaUmbral ? (
              <span className="text-rose-700 font-bold flex items-center space-x-1">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                <span>Supera umbral (${umbralGuardado.toFixed(2)})</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Dentro del presupuesto</span>
              </span>
            )}
            <span className="text-textDark/40 font-mono text-[10px]">
              Tarifa: ${(metricas.costoPorToken * 1000000).toFixed(1)}/M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
