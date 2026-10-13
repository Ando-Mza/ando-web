'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

/** Estado de carga compartido por los reportes del módulo. */
export function ReportLoadingState({ message }: { message: string }) {
  return (
    <div
      className="py-20 text-center space-y-3 bg-white rounded-3xl border border-black/5 shadow-xs"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 border-3 border-accentWine border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-bold text-textDark/70">{message}</p>
    </div>
  );
}

/** Estado de error con reintento. Nunca se reemplaza por datos de ejemplo. */
export function ReportErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      className="bg-white rounded-3xl border border-red-200 p-10 text-center space-y-4 shadow-xs"
      role="alert"
    >
      <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
        <AlertCircle className="h-7 w-7" />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="font-wixDisplay text-base font-bold text-textDark">
          No pudimos cargar el reporte
        </h3>
        <p className="text-xs text-textDark/70 leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2.5 bg-accentWine hover:bg-accentWine/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-accentWine/10 inline-flex items-center space-x-2"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Reintentar</span>
      </button>
    </div>
  );
}
