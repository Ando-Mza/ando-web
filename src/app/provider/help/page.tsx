'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/utils/api';
import { 
  HelpCircle, 
  BookOpen, 
  MessageCircle, 
  Send, 
  Check, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Store, 
  Clock, 
  Image as ImageIcon,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';

export default function ProviderHelpPage() {
  const { currentUser } = useApp();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [reportType, setReportType] = useState('problema_tecnico');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const faqs = [
    {
      q: '¿Cómo publico un nuevo atractivo turístico o negocio?',
      a: 'Accedé a la sección "Mis Negocios", hacé clic en "Nuevo Atractivo" y completá todos los campos obligatorios: nombre, categoría, descripción, dirección física y al menos una fotografía. Tu publicación quedará en estado "Pendiente" hasta que el equipo de moderación la apruebe.',
    },
    {
      q: '¿Por qué mi POI figura en estado "Corrección solicitada"?',
      a: 'Si un administrador detecta inconsistencias en la dirección, horarios o fotografías, te enviará observaciones específicas. Podés revisar el motivo en tu panel, editar la ficha y reenviarla a revisión sin perder tu información.',
    },
    {
      q: '¿Cómo configuro los horarios de atención y feriados?',
      a: 'En "Gestión de Horarios", seleccioná tu negocio y definí las franjas horarias por día de la semana. Podés indicar si abrís en temporada alta/baja y marcar excepciones para feriados nacionales o provinciales.',
    },
    {
      q: '¿Cómo respondo a las opiniones de los turistas?',
      a: 'Desde la sección "Reseñas y Opiniones", podés visualizar las calificaciones que dejaron los turistas y redactar una respuesta oficial de hasta 1000 caracteres. Tu respuesta se mostrará públicamente con la insignia de "Respuesta del propietario".',
    },
    {
      q: '¿Qué formato y tamaño deben tener las fotografías?',
      a: 'Soportamos archivos JPG, PNG y WEBP de hasta 10 MB. Las imágenes son optimizadas automáticamente y almacenadas de forma segura en la nube para garantizar una carga veloz en la aplicación móvil.',
    },
  ];

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportDescription.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await api.createReporteContenido({
        motivo: reportType,
        descripcion: reportDescription.trim(),
      });
      triggerToast('Gracias por tu reporte. El equipo técnico lo revisará a la brevedad.');
      setReportDescription('');
    } catch (err: any) {
      triggerToast(err.message || 'No se pudo enviar el reporte. Por favor intentá más tarde.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-wixText">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-xl shadow-2xl border transition-all duration-300 ${
          toast.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-red-600 text-white border-red-500'
        }`}>
          <Check className="h-4.5 w-4.5 flex-shrink-0" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-fillPrimary/10 via-fillPrimary/5 to-transparent border border-fillPrimary/20 rounded-3xl p-6 sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-fillPrimary/10 border border-fillPrimary/20 px-3 py-1 rounded-full text-xs font-bold text-fillPrimary">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Centro de Ayuda y Soporte al Prestador</span>
          </div>
          <h2 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
            ¿En qué podemos ayudarte hoy?
          </h2>
          <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
            Consultá las guías de uso de la plataforma, respuestas a dudas frecuentes o reportá inconvenientes técnicos directamente a nuestro equipo de soporte.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs Accordion (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-black/5 pb-3">
              <BookOpen className="h-5 w-5 text-fillPrimary" />
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">Preguntas Frecuentes (FAQs)</h3>
            </div>

            <div className="divide-y divide-black/5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
                    >
                      <span className="text-xs sm:text-sm font-bold text-textDark">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-fillPrimary flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-textDark/40 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-xs text-textDark/70 leading-relaxed bg-bgPrimary/40 p-3.5 rounded-xl border border-black/5 animate-fade-in">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contact & Bug Report (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-black/5 pb-3">
              <MessageCircle className="h-5 w-5 text-accentWine" />
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">Reportar un problema</h3>
            </div>

            <form onSubmit={handleSendReport} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-textDark/70">Motivo del reporte</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                >
                  <option value="problema_tecnico">Problema técnico en la web</option>
                  <option value="duda_validacion">Consulta sobre validación de POI</option>
                  <option value="sugerencia">Sugerencia de mejora</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-textDark/70">Descripción del inconveniente *</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describí con el mayor detalle posible lo que sucede..."
                  rows={4}
                  required
                  className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                />
              </div>

              <button
                type="submit"
                disabled={!reportDescription.trim() || isSubmitting}
                className="w-full py-3 bg-accentWine hover:bg-accentWine/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Enviar reporte a soporte</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Direct Channels */}
          <div className="bg-bgPrimary/50 rounded-3xl border border-black/5 p-5 space-y-3">
            <h4 className="text-xs font-bold text-textDark">Canales de atención directa</h4>
            <div className="space-y-2 text-xs text-textDark/70">
              <p className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-fillPrimary" />
                <span>soporte@ando.mendoza.gov.ar</span>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-fillPrimary" />
                <span>+54 (261) 420-2000 (Lunes a Viernes 8 a 18hs)</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
