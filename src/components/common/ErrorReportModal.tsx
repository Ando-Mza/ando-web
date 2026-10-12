'use client';

import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Send, 
  Copy, 
  Check, 
  Mail, 
  Eye, 
  Cpu
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api, uploadFileToR2 } from '@/utils/api';

export interface ErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ErrorReportModal({ isOpen, onClose }: ErrorReportModalProps) {
  const { currentUser } = useApp();

  const [tipoError, setTipoError] = useState<'funcional' | 'visual'>('funcional');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [evidencias, setEvidencias] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ asunto?: string; descripcion?: string }>({});
  const [copiedId, setCopiedId] = useState(false);

  // Success Confirmation State (US-AYS-05)
  const [confirmationData, setConfirmationData] = useState<{
    id: string;
    mensaje: string;
    email: string;
  } | null>(null);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { asunto?: string; descripcion?: string } = {};

    if (!asunto.trim()) {
      newErrors.asunto = 'El asunto es un campo obligatorio.';
    } else if (asunto.trim().length > 200) {
      newErrors.asunto = 'El asunto no puede superar los 200 caracteres.';
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = 'La descripción del problema es obligatoria.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    try {
      const file = files[0];
      const uploadedUrl = await uploadFileToR2(file);
      if (uploadedUrl) {
        setEvidencias((prev) => [...prev, uploadedUrl]);
      }
    } catch (err) {
      console.error('Error al subir imagen de evidencia:', err);
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setEvidencias((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const tipoTag = tipoError === 'funcional' ? '[ERROR FUNCIONAL]' : '[ERROR VISUAL]';
      const formattedAsunto = `${tipoTag} ${asunto.trim()}`;

      const res = await api.createReporteError({
        asunto: formattedAsunto,
        descripcion: descripcion.trim(),
        evidencias: evidencias.length > 0 ? evidencias : undefined,
      });

      setConfirmationData({
        id: res.id,
        mensaje: res.mensaje || 'Reporte enviado correctamente',
        email: currentUser?.email || 'tu cuenta de correo registrada',
      });
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        descripcion: err.message || 'Ocurrió un error al enviar el reporte. Por favor reintenta.',
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (confirmationData?.id) {
      navigator.clipboard.writeText(confirmationData.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const handleCloseAll = () => {
    setConfirmationData(null);
    setAsunto('');
    setDescripcion('');
    setEvidencias([]);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in font-wixText">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-black/10 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-all transform animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-bgPrimary/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-wixDisplay text-base font-bold text-textDark">
                Reporte de Errores por el Usuario
              </h3>
              <p className="text-xs text-textDark/60">
                Informa problemas funcionales o visuales para el equipo técnico
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseAll}
            className="p-1.5 rounded-full text-textDark/50 hover:text-textDark hover:bg-black/5 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {confirmationData ? (
            /* Confirmation Cartel fulfilling US-AYS-05 criteria:
               - Cartel de confirmación: "Reporte enviado correctamente"
               - Muestra un identificador de incidente
               - Informa su seguimiento vía correo electrónico de la cuenta que reporta */
            <div className="text-center py-4 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold tracking-wide">
                  Cartel de Confirmación
                </div>
                <h3 className="font-wixDisplay text-2xl font-black text-textDark">
                  {confirmationData.mensaje}
                </h3>
                <p className="text-xs sm:text-sm text-textDark/70 max-w-md mx-auto leading-relaxed">
                  Tu reporte ha sido registrado exitosamente en nuestro sistema de incidentes de Ando.
                </p>
              </div>

              {/* Incident Identifier Box */}
              <div className="p-4 rounded-2xl bg-bgPrimary border border-black/10 text-left space-y-2 max-w-md mx-auto">
                <span className="text-xs font-extrabold uppercase tracking-wider text-textDark/60 block">
                  Identificador de Incidente:
                </span>
                <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-black/10">
                  <span className="font-mono text-xs font-bold text-accentWine break-all select-all">
                    {confirmationData.id}
                  </span>
                  <button
                    onClick={handleCopyId}
                    className="ml-2 inline-flex items-center space-x-1 text-xs font-semibold text-textDark/70 hover:text-textDark px-2 py-1 rounded-lg hover:bg-black/5 transition cursor-pointer flex-shrink-0"
                    title="Copiar ID de incidente"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600 text-[11px]">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Email Notification Alert */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-left space-y-1.5 max-w-md mx-auto">
                <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs">
                  <Mail className="w-4 h-4 text-blue-600" />
                  <span>Seguimiento vía Correo Electrónico</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Se ha enviado un correo electrónico a <strong>{confirmationData.email}</strong> con el comprobante y el enlace para dar seguimiento a la resolución de este problema.
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCloseAll}
                  className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-accentWine text-white font-bold text-sm shadow-md hover:bg-accentWine/90 transition cursor-pointer"
                >
                  Entendido y Finalizar
                </button>
              </div>
            </div>
          ) : (
            /* Error Report Form */
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Type of Error Selector (Funcional vs Visual) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-textDark/70 block">
                  Tipo de Error <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoError('funcional')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                      tipoError === 'funcional'
                        ? 'bg-accentWine text-white border-accentWine shadow-xs'
                        : 'bg-bgPrimary/60 border-black/10 text-textDark hover:bg-black/5'
                    }`}
                  >
                    <Cpu className="w-4 h-4" />
                    <span>Error Funcional</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoError('visual')}
                    className={`flex items-center justify-center space-x-2 p-3 rounded-2xl border text-xs font-bold transition cursor-pointer ${
                      tipoError === 'visual'
                        ? 'bg-accentWine text-white border-accentWine shadow-xs'
                        : 'bg-bgPrimary/60 border-black/10 text-textDark hover:bg-black/5'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span>Error Visual / Diseño</span>
                  </button>
                </div>
                <p className="text-[11px] text-textDark/60">
                  {tipoError === 'funcional'
                    ? 'Fallas al presionar botones, bloqueos, problemas al guardar o mensajes de error inesperados.'
                    : 'Problemas de visualización, elementos cortados, solapamientos, fuentes o colores distorsionados.'}
                </p>
              </div>

              {/* Subject Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="error-asunto" className="text-xs font-bold text-textDark">
                    Asunto del Error <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-textDark/50">
                    {asunto.length}/200 caracteres
                  </span>
                </div>
                <input
                  id="error-asunto"
                  type="text"
                  maxLength={200}
                  value={asunto}
                  onChange={(e) => {
                    setAsunto(e.target.value);
                    if (errors.asunto) setErrors((prev) => ({ ...prev, asunto: undefined }));
                  }}
                  placeholder="Ej: No se guardan los cambios al editar el POI"
                  className={`w-full px-4 py-3 rounded-2xl border bg-bgPrimary/30 text-sm text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/40 transition ${
                    errors.asunto ? 'border-red-500 bg-red-50/30' : 'border-black/10'
                  }`}
                />
                {errors.asunto && (
                  <p className="text-xs text-red-600 font-semibold animate-fade-in">
                    {errors.asunto}
                  </p>
                )}
              </div>

              {/* Description Textarea */}
              <div className="space-y-1.5">
                <label htmlFor="error-desc" className="text-xs font-bold text-textDark">
                  Descripción Detallada del Problema <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="error-desc"
                  rows={4}
                  value={descripcion}
                  onChange={(e) => {
                    setDescripcion(e.target.value);
                    if (errors.descripcion) setErrors((prev) => ({ ...prev, descripcion: undefined }));
                  }}
                  placeholder="Describe los pasos para reproducir el error y qué pantalla estabas usando..."
                  className={`w-full px-4 py-3 rounded-2xl border bg-bgPrimary/30 text-sm text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/40 transition resize-none ${
                    errors.descripcion ? 'border-red-500 bg-red-50/30' : 'border-black/10'
                  }`}
                />
                {errors.descripcion && (
                  <p className="text-xs text-red-600 font-semibold animate-fade-in">
                    {errors.descripcion}
                  </p>
                )}
              </div>

              {/* Screenshot Attachments */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-textDark flex items-center justify-between">
                  <span>Adjuntar Capturas de Pantalla (Opcional)</span>
                  <span className="text-[11px] font-normal text-textDark/60">
                    JPG, PNG o WEBP
                  </span>
                </label>

                {/* Thumbnail list */}
                {evidencias.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 pb-2">
                    {evidencias.map((url, idx) => (
                      <div 
                        key={idx} 
                        className="relative w-20 h-20 rounded-2xl overflow-hidden border border-black/10 group shadow-xs"
                      >
                        <img 
                          src={url} 
                          alt={`Captura ${idx + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          title="Eliminar captura"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="border-2 border-dashed border-black/15 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-bgPrimary/40 transition cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                  {isUploadingImage ? (
                    <div className="flex items-center space-x-2 text-xs text-accentWine font-semibold">
                      <div className="w-4 h-4 rounded-full border-2 border-accentWine border-t-transparent animate-spin" />
                      <span>Subiendo captura...</span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-5 h-5 mx-auto text-accentWine" />
                      <p className="text-xs font-bold text-textDark">
                        Haz clic para subir una captura del error
                      </p>
                      <p className="text-[11px] text-textDark/50">
                        Una imagen ayuda a identificar el fallo con mayor rapidez
                      </p>
                    </div>
                  )}
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-textDark/60 hover:text-textDark hover:bg-black/5 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingImage}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-accentWine text-white font-bold text-xs shadow-md hover:bg-accentWine/90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Enviando reporte...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Reporte</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
