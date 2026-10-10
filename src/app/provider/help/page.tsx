'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { api } from '@/utils/api';
import { AyudaArticulo } from '@/types';
import { 
  HelpCircle, 
  BookOpen, 
  Sparkles, 
  AlertTriangle,
  ChevronDown, 
  ChevronUp, 
  Phone,
  Mail
} from 'lucide-react';
import OnboardingTutorialModal from '@/components/common/OnboardingTutorialModal';
import ErrorReportModal from '@/components/common/ErrorReportModal';

export default function ProviderHelpPage() {
  const { currentUser } = useApp();

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isErrorReportOpen, setIsErrorReportOpen] = useState(false);
  const [remoteFaqs, setRemoteFaqs] = useState<AyudaArticulo[]>([]);

  useEffect(() => {
    api.getAyudaArticulos({ tipo: 'FAQ' })
      .then((items) => {
        if (Array.isArray(items) && items.length > 0) {
          setRemoteFaqs(items.filter((i) => i.activo));
        }
      })
      .catch(() => {});
  }, []);

  const defaultFaqs = [
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

  const activeFaqs = remoteFaqs.length > 0 
    ? remoteFaqs.map((f) => ({ q: f.titulo, a: f.contenido }))
    : defaultFaqs;

  return (
    <div className="space-y-8 font-wixText">
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
        {/* FAQs Accordion (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-black/5 pb-3">
              <BookOpen className="h-5 w-5 text-fillPrimary" />
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">Preguntas Frecuentes (FAQs)</h3>
            </div>

            <div className="divide-y divide-black/5">
              {activeFaqs.map((faq, idx) => {
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

        {/* Direct Channels */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
            <h4 className="font-wixDisplay text-base font-bold text-textDark">Canales de atención directa</h4>
            <p className="text-xs text-textDark/70 leading-relaxed">
              Nuestro equipo de soporte técnico y turístico está disponible para asesorarte de manera personalizada.
            </p>
            <div className="space-y-3 text-xs text-textDark/80 pt-2">
              <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-bgPrimary/60 border border-black/5">
                <Mail className="h-4 w-4 text-fillPrimary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-textDark block">Correo electrónico:</span>
                  <span>soporte@ando.mendoza.gov.ar</span>
                </div>
              </div>
              <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-bgPrimary/60 border border-black/5">
                <Phone className="h-4 w-4 text-fillPrimary flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-textDark block">Atención telefónica:</span>
                  <span>+54 (261) 420-2000 (Lun a Vie 8 a 18hs)</span>
                </div>
              </div>
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
