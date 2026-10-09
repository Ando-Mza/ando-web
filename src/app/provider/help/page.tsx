'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useApp } from '@/context/AppContext';
import { api, uploadFileToR2 } from '@/utils/api';
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
  Mail,
  Paperclip,
  X,
  Search,
  FileText
} from 'lucide-react';

export default function ProviderHelpPage() {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'faq' | 'manual'>('manual');
  const [manualContent, setManualContent] = useState('');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openManualIndex, setOpenManualIndex] = useState<number | null>(0);
  const [reportType, setReportType] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
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

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  useEffect(() => {
    fetch('/manual/manual_usuario_ando_prestador.md')
      .then((r) => r.text())
      .then((text) => setManualContent(text))
      .catch(() => setManualContent('No se pudo cargar el manual de usuario.'));
  }, []);

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
        {/* Main Content (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex bg-white rounded-xl border border-black/5 p-1 shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('manual')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
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
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
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
              {manualContent && (() => {
                const sections = manualContent.split(/(?=^## )/m);
                const headerSection = sections[0];
                const accordionSections = sections.slice(1);

                return (
                  <>
                    {/* Acordeón de secciones */}
                    <div className="divide-y divide-black/5">
                      {accordionSections.map((section, idx) => {
                        const isOpen = openManualIndex === idx;
                        const lines = section.trim().split('\n');
                        // Remove "## " and then any leading number like "1. " or "5.2 "
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
                  </>
                );
              })()}
            </div>
            ) : (
              <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 border-b border-black/5 pb-4">
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
                            <p className="mt-2 text-xs text-textDark/70 leading-relaxed bg-bgPrimary/40 p-3.5 rounded-xl border border-black/5 animate-fade-in">
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
              <MessageCircle className="h-5 w-5 text-accentWine" />
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
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-accentWine/10 border border-accentWine/20 rounded-lg max-w-full overflow-hidden">
                      <span className="text-[11px] font-semibold text-accentWine truncate">
                        {evidenceFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEvidenceFile(null)}
                        className="text-accentWine/70 hover:text-accentWine cursor-pointer"
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
