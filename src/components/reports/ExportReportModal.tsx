'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Info,
  AlertCircle,
} from 'lucide-react';
import {
  ExportReporteQuery,
  FormatoExportacion,
  TipoReporteExportacion,
} from '@/types/reportes';
import { api } from '@/utils/api';
import {
  EnlaceExportacion,
  descargarEnlaceExportacion,
  enlaceExpirado,
  getEnlacesExportacion,
  guardarEnlaceExportacion,
  quitarEnlaceExportacion,
  tokenDesdeUrlDescarga,
  triggerBlobDownload,
} from '@/utils/exportDownloads';
import { useApp } from '@/context/AppContext';

export interface FiltrosExportacion {
  fechaDesde: string;
  fechaHasta: string;
  categoriaId?: string;
  categoriaNombre?: string;
  departamento?: string;
  search?: string;
  ordenarPor?: string;
  orden?: 'ASC' | 'DESC';
}

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rol: 'admin' | 'prestador';
  tipoReporte: TipoReporteExportacion;
  nombreReporte: string;
  filtros: FiltrosExportacion;
  /** El reporte en pantalla tiene al menos un registro para exportar. */
  hayDatos: boolean;
  /** Reportes con mapa: se exporta solo la tabla de datos. */
  esGeografico?: boolean;
}

const FORMATOS: {
  id: FormatoExportacion;
  titulo: string;
  descripcion: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'pdf',
    titulo: 'Documento PDF',
    descripcion: 'Con encabezado: nombre del reporte, período y filtros aplicados.',
    icon: FileText,
  },
  {
    id: 'xlsx',
    titulo: 'Excel (XLSX)',
    descripcion: 'Una hoja por sección, con los encabezados de columna en la primera fila.',
    icon: FileSpreadsheet,
  },
  {
    id: 'csv',
    titulo: 'Datos planos (CSV)',
    descripcion: 'Solo los datos tabulares, sin formato.',
    icon: FileCode,
  },
];

function formatearFechaHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ExportReportModal({
  isOpen,
  onClose,
  rol,
  tipoReporte,
  nombreReporte,
  filtros,
  hayDatos,
  esGeografico = false,
}: ExportReportModalProps) {
  const { currentUser, addNotification } = useApp();
  const userId = currentUser?.id;

  const [formato, setFormato] = useState<FormatoExportacion>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [descargandoToken, setDescargandoToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [enlaceListo, setEnlaceListo] = useState<EnlaceExportacion | null>(null);
  const [enlaceVencido, setEnlaceVencido] = useState<EnlaceExportacion | null>(null);
  const [enlaces, setEnlaces] = useState<EnlaceExportacion[]>([]);

  // Evita exportaciones duplicadas por doble clic antes de que React re-renderice
  const enCurso = useRef(false);

  useEffect(() => {
    if (!isOpen) return;
    setEnlaces(getEnlacesExportacion(userId));
    setEnlaceListo(null);
    setEnlaceVencido(null);
    setErrorMsg(null);
    setSuccessMsg(null);
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !enCurso.current) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const ejecutarExportacion = async (params: ExportReporteQuery, nombre: string) => {
    if (enCurso.current) return;
    enCurso.current = true;
    setIsExporting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setEnlaceVencido(null);

    try {
      const res = await api.exportarReporte(rol, params);

      if (!res.esAsincrono && res.blob) {
        // Menos de 1000 registros: descarga inmediata
        triggerBlobDownload(res.blob, res.filename || `reporte.${params.formato}`);
        setEnlaceListo(null);
        setSuccessMsg(
          `La descarga de "${nombre}" en ${params.formato.toUpperCase()} comenzó. Revisá la carpeta de descargas de tu navegador.`
        );
        return;
      }

      // Más de 1000 registros: el backend deja el archivo disponible 24 horas y notifica
      const token = tokenDesdeUrlDescarga(res.asyncResponse?.urlDescarga);
      if (!token || !res.asyncResponse?.expiraEn) {
        throw new Error('El servidor no devolvió un enlace de descarga válido.');
      }

      const enlace: EnlaceExportacion = {
        token,
        rol,
        nombreReporte: nombre,
        formato: params.formato,
        totalRegistros: res.asyncResponse.totalRegistros,
        fechaCreacion: new Date().toISOString(),
        expiraEn: res.asyncResponse.expiraEn,
        params,
      };
      guardarEnlaceExportacion(userId, enlace);
      setEnlaces(getEnlacesExportacion(userId));
      setEnlaceListo(enlace);

      addNotification({
        title: `Exportación lista: ${nombre} (${params.formato.toUpperCase()})`,
        message: `Tu archivo con ${enlace.totalRegistros.toLocaleString('es-AR')} registros está listo. El enlace de descarga vence en 24 horas.`,
        type: 'success',
        actionUrl: `#download-report:${token}`,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'No se pudo generar la exportación. Intentá nuevamente.'
      );
    } finally {
      enCurso.current = false;
      setIsExporting(false);
    }
  };

  const handleExportar = () => {
    void ejecutarExportacion(
      {
        tipoReporte,
        formato,
        fechaDesde: filtros.fechaDesde,
        fechaHasta: filtros.fechaHasta,
        categoriaId: filtros.categoriaId,
        departamento: filtros.departamento,
        search: filtros.search,
        ordenarPor: filtros.ordenarPor,
        orden: filtros.orden,
      },
      nombreReporte
    );
  };

  const handleDescargarEnlace = async (enlace: EnlaceExportacion) => {
    if (descargandoToken) return;
    setDescargandoToken(enlace.token);
    setErrorMsg(null);
    setSuccessMsg(null);

    const resultado = await descargarEnlaceExportacion(enlace);
    if (resultado.estado === 'descargado') {
      setSuccessMsg(`La descarga de "${enlace.nombreReporte}" comenzó.`);
    } else if (resultado.estado === 'expirado') {
      setEnlaceListo(null);
      setEnlaceVencido(enlace);
    } else {
      setErrorMsg(resultado.mensaje);
    }
    setDescargandoToken(null);
  };

  const handleGenerarNuevo = (enlace: EnlaceExportacion) => {
    quitarEnlaceExportacion(userId, enlace.token);
    setEnlaces(getEnlacesExportacion(userId));
    void ejecutarExportacion(enlace.params, enlace.nombreReporte);
  };

  const filtrosResumen = [
    `Período: ${filtros.fechaDesde} al ${filtros.fechaHasta}`,
    `Categoría: ${filtros.categoriaNombre || 'Todas'}`,
    `Zona: ${filtros.departamento || 'Toda Mendoza'}`,
    filtros.search ? `Búsqueda: "${filtros.search}"` : null,
  ].filter(Boolean) as string[];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-wixText"
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-modal-title"
    >
      <div className="bg-white rounded-3xl border border-black/10 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-black/5 bg-gradient-to-r from-accentWine/10 via-accentWine/5 to-transparent">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-accentWine text-white shadow-md shadow-accentWine/20 flex-shrink-0">
              <Download className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-accentWine uppercase tracking-wider">
                Exportar reporte
              </span>
              <h3
                id="export-modal-title"
                className="font-wixDisplay text-lg sm:text-xl font-bold text-textDark truncate"
              >
                {nombreReporte}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            aria-label="Cerrar"
            className="p-2 text-textDark/40 hover:text-textDark hover:bg-black/5 rounded-full transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2.5" role="alert">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start space-x-2.5" role="status">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="font-semibold leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Enlace vencido: informar y ofrecer uno nuevo */}
          {enlaceVencido && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-3" role="alert">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold font-wixDisplay">El enlace de descarga expiró</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Los enlaces de descarga son válidos por 24 horas. El archivo de &quot;
                    {enlaceVencido.nombreReporte}&quot; ({enlaceVencido.formato.toUpperCase()}) ya no está disponible. Podés generar uno nuevo con los mismos filtros.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setEnlaceVencido(null)}
                  disabled={isExporting}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-800 hover:bg-amber-100/60 transition-colors cursor-pointer"
                >
                  Ahora no
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerarNuevo(enlaceVencido)}
                  disabled={isExporting}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white shadow-sm flex items-center space-x-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isExporting ? 'animate-spin' : ''}`} />
                  <span>{isExporting ? 'Generando...' : 'Generar un enlace nuevo'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Archivo generado en segundo plano */}
          {enlaceListo && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold font-wixDisplay text-emerald-900">
                    Tu archivo está listo
                  </h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    El reporte tiene {enlaceListo.totalRegistros.toLocaleString('es-AR')} registros, por eso se generó en segundo plano. También te enviamos una notificación con el enlace. Podés descargarlo hasta el{' '}
                    <strong>{formatearFechaHora(enlaceListo.expiraEn)} hs</strong>.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleDescargarEnlace(enlaceListo)}
                  disabled={descargandoToken !== null}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  {descargandoToken === enlaceListo.token ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Descargar archivo ({enlaceListo.formato.toUpperCase()})</span>
                </button>
              </div>
            </div>
          )}

          {!hayDatos ? (
            <div className="p-4 rounded-2xl bg-bgPrimary/60 border border-black/5 text-xs text-textDark/70 flex items-start space-x-2.5">
              <Info className="h-4 w-4 text-textDark/50 flex-shrink-0 mt-0.5" />
              <p>
                El reporte no tiene registros para el período y los filtros seleccionados, así que no hay datos para exportar. Ajustá los filtros y volvé a intentarlo.
              </p>
            </div>
          ) : (
            <>
              {esGeografico && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-start space-x-2.5">
                  <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p>El archivo incluye la tabla de datos por zona. El mapa no se exporta.</p>
                </div>
              )}

              <fieldset className="space-y-2.5" disabled={isExporting}>
                <legend className="text-xs font-bold text-textDark">Elegí el formato</legend>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup">
                  {FORMATOS.map((f) => {
                    const selected = formato === f.id;
                    const Icon = f.icon;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => setFormato(f.id)}
                        className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
                          selected
                            ? 'border-accentWine bg-accentWine/5 shadow-md shadow-accentWine/10 ring-2 ring-accentWine/20'
                            : 'border-black/10 bg-white hover:border-black/20 hover:bg-black/[0.01]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-xl ${selected ? 'bg-accentWine text-white' : 'bg-black/5 text-textDark/60'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected ? 'border-accentWine bg-accentWine' : 'border-black/20'}`}>
                            {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-textDark font-wixDisplay">{f.titulo}</h4>
                          <p className="text-[11px] text-textDark/60 mt-1 leading-snug">{f.descripcion}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="p-4 rounded-2xl bg-bgPrimary/50 border border-black/5 space-y-2">
                <span className="text-xs font-bold text-textDark">Se exportará con estos filtros</span>
                <ul className="text-[11px] text-textDark/70 space-y-0.5">
                  {filtrosResumen.map((linea) => (
                    <li key={linea}>• {linea}</li>
                  ))}
                </ul>
                <p className="text-[11px] text-textDark/60 flex items-start space-x-1.5 pt-1">
                  <Clock className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    Si el reporte tiene menos de 1.000 registros la descarga empieza enseguida. Si tiene más, se genera en segundo plano y te avisamos con un enlace válido por 24 horas.
                  </span>
                </p>
              </div>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleExportar}
                className="w-full py-3.5 bg-accentWine hover:bg-accentWine/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-xs shadow-lg shadow-accentWine/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generando archivo...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Exportar en {formato.toUpperCase()}</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Enlaces generados en segundo plano */}
          {enlaces.length > 0 && (
            <div className="pt-4 border-t border-black/5 space-y-2">
              <h4 className="text-xs font-bold text-textDark font-wixDisplay flex items-center space-x-1.5">
                <Clock className="h-3.5 w-3.5 text-textDark/60" />
                <span>Archivos generados en segundo plano</span>
              </h4>

              <div className="divide-y divide-black/5 border border-black/5 rounded-2xl max-h-44 overflow-y-auto bg-white">
                {enlaces.map((enlace) => {
                  const vencido = enlaceExpirado(enlace.expiraEn);
                  return (
                    <div key={enlace.token} className="p-3 flex items-center justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-textDark truncate">{enlace.nombreReporte}</span>
                          <span className="px-1.5 py-0.5 bg-black/5 text-textDark/70 font-mono text-[10px] font-bold rounded uppercase flex-shrink-0">
                            {enlace.formato}
                          </span>
                        </div>
                        <div className="text-[10px] text-textDark/60">
                          {enlace.totalRegistros.toLocaleString('es-AR')} registros ·{' '}
                          {vencido ? (
                            <span className="text-amber-700 font-bold">Enlace vencido</span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">
                              Disponible hasta el {formatearFechaHora(enlace.expiraEn)} hs
                            </span>
                          )}
                        </div>
                      </div>

                      {vencido ? (
                        <button
                          type="button"
                          onClick={() => setEnlaceVencido(enlace)}
                          disabled={isExporting}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 transition-all flex items-center space-x-1 cursor-pointer flex-shrink-0 disabled:opacity-50"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Generar nuevo</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleDescargarEnlace(enlace)}
                          disabled={descargandoToken !== null}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-accentWine/10 hover:bg-accentWine hover:text-white text-accentWine transition-all flex items-center space-x-1 cursor-pointer flex-shrink-0 disabled:opacity-50"
                        >
                          {descargandoToken === enlace.token ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Download className="h-3 w-3" />
                          )}
                          <span>Descargar</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
