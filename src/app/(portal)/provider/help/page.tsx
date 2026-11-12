'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApp } from '@/context/AppContext';
import { api, uploadFileToR2 } from '@/utils/api';
import { AyudaArticulo } from '@/types';
import { 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  AlertTriangle,
  ChevronDown, 
  ChevronUp, 
  Phone,
  Mail,
  Paperclip,
  X,
  Search,
  FileText,
  MessageCircle,
  Send,
  CheckCircle2
} from 'lucide-react';
import OnboardingTutorialModal from '@/components/common/OnboardingTutorialModal';
import ErrorReportModal from '@/components/common/ErrorReportModal';

export default function ProviderHelpPage() {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'faq' | 'manual'>('manual');
  const [manualContent, setManualContent] = useState('');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openManualIndex, setOpenManualIndex] = useState<number | null>(0);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isErrorReportOpen, setIsErrorReportOpen] = useState(false);
  const [remoteFaqs, setRemoteFaqs] = useState<AyudaArticulo[]>([]);

  const [reportType, setReportType] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    api.getAyudaArticulos({ tipo: 'FAQ' })
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setRemoteFaqs(items.filter((i) => i.activo));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/manual/manual_usuario_ando_prestador.md')
      .then((r) => r.text())
      .then((text) => setManualContent(text))
      .catch(() => setManualContent('No se pudo cargar el manual de usuario.'));
  }, []);

  // Respaldo si el backend no responde: mismas preguntas que publica la gestión de ayuda
  // (antes estaban también al final del manual de usuario)
  const defaultFaqs = [
    {
      q: '¿Cuánto tarda en aprobarse mi cuenta de Prestador?',
      a: 'La validación la realiza el equipo de administradores de ANDO y los tiempos pueden variar según el volumen de solicitudes. Recibirás una notificación cuando tu cuenta sea aprobada.',
    },
    {
      q: '¿Por qué mi negocio no aparece en el mapa si ya lo registré?',
      a: 'Tu negocio solo es visible en el mapa cuando el Administrador lo revisa y cambia su estado a "Aprobado". Mientras esté "Pendiente de validación", los turistas no lo verán.',
    },
    {
      q: '¿Por qué mi POI figura en estado "Corrección solicitada"?',
      a: 'Si un administrador detecta inconsistencias en la dirección, horarios o fotografías, te enviará observaciones específicas. Podés revisar el motivo en tu panel, editar la ficha y reenviarla a revisión sin perder tu información.',
    },
    {
      q: '¿Puedo tener más de un negocio en ANDO?',
      a: 'Sí. Podés registrar varios negocios turísticos con tu cuenta de Prestador. Cada uno se gestiona de forma independiente desde el panel "Mis Negocios".',
    },
    {
      q: '¿Qué pasa con los itinerarios de los turistas si cambio mis horarios?',
      a: 'El sistema detecta qué turistas tienen tu negocio en un itinerario planificado y les envía una notificación para que revisen su viaje. La parada queda marcada como "requiere revisión".',
    },
    {
      q: '¿Puedo eliminar una reseña negativa?',
      a: 'No. Como Prestador no podés eliminar las reseñas que publican los turistas, pero sí podés responderlas públicamente para aclarar la situación. Si la reseña viola las normas de la comunidad (contenido ofensivo, spam, etc.), podés reportarla para que el equipo administrativo la revise.',
    },
    {
      q: '¿Puedo responder la misma reseña más de una vez?',
      a: 'Cada reseña admite una única respuesta del propietario. Si necesitás cambiar tu respuesta, usá el ícono de edición que aparece junto a ella, si la opción está disponible.',
    },
    {
      q: '¿Mis servicios se usan en las recomendaciones de IA?',
      a: 'Sí. Los servicios que cargás (con precio, duración y disponibilidad) los usa el motor de recomendación de ANDO para sugerir tu negocio a turistas según sus preferencias, presupuesto e intereses. Mantené la información actualizada para ganar visibilidad.',
    },
    {
      q: '¿Qué formatos acepta la galería de imágenes?',
      a: 'La galería acepta archivos JPG, PNG y WEBP de hasta 30 MB por imagen. Las imágenes se procesan automáticamente en distintas resoluciones para verse bien en todos los dispositivos.',
    },
    {
      q: '¿Cómo puedo ver cómo luce mi negocio para los turistas?',
      a: 'Abrí el Mapa en la app. Si tu negocio está aprobado, vas a encontrar su pin; al presionarlo verás exactamente la información que ve un turista: fotos, descripción, horarios, reseñas y categorías.',
    },
  ];

  const activeFaqs = remoteFaqs.length > 0 
    ? remoteFaqs.map((f) => ({ q: f.titulo, a: f.contenido }))
    : defaultFaqs;

  const filteredFaqs = activeFaqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        triggerToast('El archivo no debe superar los 5MB.', 'error');
        return;
      }
      setEvidenceFile(file);
    }
  };

  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportType || !reportSubject.trim() || !reportDescription.trim() || isSubmitting) {
      triggerToast('Por favor completá todos los campos obligatorios.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let evidenciaUrl = '';
      if (evidenceFile) {
        evidenciaUrl = await uploadFileToR2(evidenceFile);
      }

      if (reportType === 'problema_tecnico') {
        await api.createReporteError({
          asunto: reportSubject.trim(),
          descripcion: reportDescription.trim(),
          evidencias: evidenciaUrl ? [evidenciaUrl] : [],
        });
      } else {
        await api.createConsultaSoporte({
          asunto: reportSubject.trim(),
          descripcion: reportDescription.trim(),
          evidencia: evidenciaUrl || undefined,
        });
      }

      triggerToast('Gracias por tu consulta. El equipo de soporte te responderá a la brevedad.');
      setReportType('');
      setReportSubject('');
      setReportDescription('');
      setEvidenceFile(null);
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
        <div
          role="status"
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2 ${
            toast.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
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
            Consultá las guías de uso de la plataforma, respuestas a dudas frecuentes, accede a los tutoriales interactivos o reportá inconvenientes técnicos para el equipo de soporte.
          </p>
        </div>
      </div>

      {/* Interactive Tools Cards: US-AYS-04 & US-AYS-05 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-fillPrimary/10 via-white to-white rounded-3xl border border-fillPrimary/20 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-fillPrimary">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Ayuda Visual Interactiva</span>
            </div>
            <h3 className="font-wixDisplay text-lg font-bold text-textDark">
              Tutorial Onboarding para Prestadores
            </h3>
            <p className="text-xs text-textDark/70 leading-relaxed">
              Repasa paso a paso cada una de las herramientas de tu portal: publicación de atractivos, horarios comerciales, respuestas a opiniones y canales de asistencia.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="w-fit inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-fillPrimary text-white font-bold text-xs shadow-md hover:bg-fillPrimary/90 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Iniciar Tutorial de Onboarding</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 via-white to-white rounded-3xl border border-red-500/20 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Centro de Incidentes</span>
            </div>
            <h3 className="font-wixDisplay text-lg font-bold text-textDark">
              Reporte de Errores por el Usuario
            </h3>
            <p className="text-xs text-textDark/70 leading-relaxed">
              ¿Encontraste un fallo técnico o visual en el sistema? Descríbelo y adjunta capturas para generar un identificador de incidente y recibir seguimiento por correo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsErrorReportOpen(true)}
            className="w-fit inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Reportar un Error del Sistema</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white rounded-xl border border-black/5 p-1 shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-fillPrimary text-white shadow-sm'
                  : 'text-textDark hover:bg-black/5'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Manual de Usuario</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-fillPrimary text-white shadow-sm'
                  : 'text-textDark hover:bg-black/5'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Preguntas Frecuentes</span>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden">
            {activeTab === 'manual' ? (
              <div className="p-6 sm:p-8 space-y-4">
                {manualContent ? (() => {
                  const sections = manualContent.split(/(?=^## )/m);
                  const accordionSections = sections.slice(1);

                  return (
                    <div className="divide-y divide-black/5">
                      {accordionSections.map((section, idx) => {
                        const isOpen = openManualIndex === idx;
                        const lines = section.trim().split('\n');
                        const title = lines[0].replace(/^##\s+/, '').replace(/^[\d.]+\s*/, '');
                        const content = lines.slice(1).join('\n');

                        return (
                          <div key={idx} className="py-4">
                            <button
                              onClick={() => setOpenManualIndex(isOpen ? null : idx)}
                              className="w-full flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none group"
                            >
                              <span className="text-sm sm:text-base font-bold text-textDark group-hover:text-fillPrimary transition-colors">
                                {title}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-fillPrimary flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-textDark/40 flex-shrink-0 group-hover:text-fillPrimary transition-colors" />
                              )}
                            </button>
                            {isOpen && (
                              <div className="mt-4 prose prose-sm max-w-none bg-bgPrimary/30 p-4 sm:p-6 rounded-2xl border border-black/5 animate-fade-in
                                [&_h2]:text-xl [&_h2]:font-wixDisplay [&_h2]:font-bold [&_h2]:text-fillPrimary [&_h2]:mt-8 [&_h2]:mb-4
                                [&_h3]:text-lg [&_h3]:font-wixDisplay [&_h3]:font-bold [&_h3]:text-textDark [&_h3]:mt-6 [&_h3]:mb-3
                                [&_p]:text-sm [&_p]:text-textDark/80 [&_p]:leading-relaxed [&_p]:mb-4
                                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul_li]:text-sm [&_ul_li]:text-textDark/80 [&_ul_li]:mb-1
                                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol_li]:text-sm [&_ol_li]:text-textDark/80 [&_ol_li]:mb-1
                                [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:my-6 [&_img]:mx-auto
                                [&_a]:text-fillPrimary [&_a]:font-bold [&_a]:underline [&_a:hover]:text-fillPrimary/80
                                [&_table]:w-full [&_table]:mb-6 [&_table]:border-collapse [&_th]:bg-black/5 [&_th]:p-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_td]:p-3 [&_td]:border-b [&_td]:border-black/5 [&_td]:text-xs [&_td]:text-textDark/80
                                [&_blockquote]:border-l-4 [&_blockquote]:border-fillPrimary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-fillPrimary/5 [&_blockquote]:p-3 [&_blockquote]:rounded-r-xl [&_blockquote]:my-4"
                              >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })() : (
                  <div className="py-8 text-center text-textDark/50 text-xs">Cargando manual...</div>
                )}
              </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5 text-fillPrimary" />
                    <h3 className="font-wixDisplay text-lg font-bold text-textDark">Preguntas Frecuentes</h3>
                  </div>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-textDark/40" />
                    <input
                      type="text"
                      placeholder="Buscar preguntas..."
                      value={faqSearchQuery}
                      onChange={(e) => setFaqSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-9 pr-3 py-2 bg-black/5 border border-transparent focus:bg-white focus:border-fillPrimary/30 rounded-xl text-xs font-semibold focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="divide-y divide-black/5">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, idx) => {
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
                            <p className="mt-2 text-xs text-textDark/70 leading-relaxed bg-bgPrimary/40 p-3.5 rounded-xl border border-black/5 animate-fade-in whitespace-pre-line">
                              {faq.a}
                            </p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-textDark/50 text-sm">
                      No se encontraron preguntas que coincidan con tu búsqueda.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact & Bug Report (1 col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-black/5 pb-3">
              <MessageCircle className="h-5 w-5 text-fillPrimary" />
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">Reportar un problema</h3>
            </div>

            <form onSubmit={handleSendReport} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-textDark/70">Motivo del contacto</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  required
                  className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                >
                  <option value="" disabled>Seleccioná un motivo</option>
                  <option value="duda_general">Consulta o duda general</option>
                  <option value="problema_tecnico">Problema técnico en la plataforma</option>
                  <option value="duda_validacion">Consulta sobre validación de POI</option>
                  <option value="sugerencia">Sugerencia de mejora</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-textDark/70">Asunto *</label>
                <input
                  type="text"
                  value={reportSubject}
                  onChange={(e) => setReportSubject(e.target.value)}
                  placeholder="Ej. Problema al guardar horarios"
                  required
                  className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-textDark/70">Descripción detallada *</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Describí con el mayor detalle posible lo que sucede..."
                  rows={4}
                  required
                  className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-textDark/70">Adjuntar evidencia (Opcional)</label>
                <div className="flex items-center gap-3">
                  <label className="flex-shrink-0 cursor-pointer inline-flex items-center space-x-1.5 px-3 py-2 bg-black/5 hover:bg-black/10 text-textDark/80 font-semibold rounded-lg text-xs transition-colors">
                    <Paperclip className="h-3.5 w-3.5" />
                    <span>Seleccionar archivo</span>
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
                  </label>
                  {evidenceFile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-fillPrimary/10 border border-fillPrimary/20 rounded-lg max-w-full overflow-hidden">
                      <span className="text-[11px] font-semibold text-fillPrimary truncate">
                        {evidenceFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEvidenceFile(null)}
                        className="text-fillPrimary/70 hover:text-fillPrimary cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!reportSubject.trim() || !reportDescription.trim() || isSubmitting}
                className="w-full py-3 bg-fillPrimary hover:bg-fillPrimary/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
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

      {/* Interactive Onboarding Tutorial Modal (US-AYS-04) */}
      <OnboardingTutorialModal
        role="provider"
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* User Error Reporting Modal (US-AYS-05) */}
      <ErrorReportModal
        isOpen={isErrorReportOpen}
        onClose={() => setIsErrorReportOpen(false)}
      />
    </div>
  );
}
