'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  LayoutDashboard,
  CheckSquare,
  Users,
  Settings,
  BarChart3,
  Store,
  CalendarRange,
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import GuidedTour, { GuidedTourStop } from '@/components/common/GuidedTour';

export interface OnboardingTutorialModalProps {
  role: 'admin' | 'provider';
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

// Recorrido en pantalla: qué se puede hacer en cada menú del panel (último tramo del tutorial)
const ADMIN_TOUR: GuidedTourStop[] = [
  {
    target: '/admin/dashboard',
    title: 'Dashboard',
    text: 'Acá ves el resumen de la plataforma: indicadores de actividad, turistas y estado general del catálogo.',
  },
  {
    target: '/admin/validation',
    title: 'Catálogo y Validación',
    text: 'Acá revisás los puntos de interés que cargan los prestadores y la comunidad: podés aprobarlos, rechazarlos o pedir correcciones.',
  },
  {
    target: '/admin/users',
    title: 'Gestión de Usuarios',
    text: 'Acá administrás las cuentas: creás usuarios, cambiás su estado y das de baja prestadores o administradores.',
  },
  {
    target: '/admin/reports',
    title: 'Reportes e Informes',
    text: 'Acá consultás los POIs más visitados, la actividad de usuarios, los negocios locales y el uso del asistente. Podés filtrar por período y exportar en PDF, Excel o CSV.',
  },
  {
    target: '/admin/logs',
    title: 'Auditoría y Logs',
    text: 'Acá auditás lo que pasó en el sistema: acciones de usuarios, cambios en POIs, logins fallidos y errores, con filtros por fecha, tipo y usuario.',
  },
  {
    target: '/admin/error-reports',
    title: 'Reportes de Error',
    text: 'Acá ves los errores que reportaron los usuarios desde la web y la app. Podés buscarlos por su identificador de incidente y abrir el detalle con las capturas.',
  },
  {
    target: '/admin/settings',
    title: 'Configuración del Sistema',
    text: 'Acá mantenés las categorías, etiquetas, estados de validación y parámetros generales de la plataforma.',
  },
  {
    target: '/admin/help',
    title: 'Centro de Ayuda',
    text: 'Acá están el manual y las preguntas frecuentes. También cargás, editás o eliminás los artículos de ayuda que ven los usuarios.',
  },
  {
    target: 'notifications',
    title: 'Notificaciones',
    text: 'Acá recibís los avisos del sistema, por ejemplo cuando una exportación grande está lista para descargar.',
  },
  {
    target: 'tutorial',
    title: 'Tutorial',
    text: 'Con este botón podés volver a ver este tutorial cuando quieras.',
  },
  {
    target: 'report-error',
    title: 'Reportar un error',
    text: 'Si algo no funciona como esperabas, reportalo desde acá y recibís un número de incidente para el seguimiento.',
  },
];

const PROVIDER_TOUR: GuidedTourStop[] = [
  {
    target: '/provider/dashboard',
    title: 'Dashboard',
    text: 'Acá ves el resumen de tus negocios: visitas, reseñas y estado de tus publicaciones.',
  },
  {
    target: '/provider/business',
    title: 'Mis Negocios',
    text: 'Acá cargás y editás tus negocios: fotos, descripción, ubicación y datos de contacto.',
  },
  {
    target: '/provider/schedules',
    title: 'Días y Horarios',
    text: 'Acá definís los días y horarios de atención que ven los turistas.',
  },
  {
    target: '/provider/services',
    title: 'Servicios y Ofertas',
    text: 'Acá administrás los servicios que ofrece cada negocio.',
  },
  {
    target: '/provider/reviews',
    title: 'Reseñas de Turistas',
    text: 'Acá leés las reseñas que te dejaron y les respondés públicamente.',
  },
  {
    target: '/provider/reports',
    title: 'Reportes y Métricas',
    text: 'Acá consultás el rendimiento de tus negocios: paradas planificadas, visitas, ranking de tu rubro, y podés exportarlo.',
  },
  {
    target: '/provider/profile',
    title: 'Mi Perfil y Cuenta',
    text: 'Acá actualizás tus datos, tu contraseña y la información de tu cuenta.',
  },
  {
    target: '/provider/help',
    title: 'Centro de Ayuda',
    text: 'Acá encontrás el manual, las preguntas frecuentes y el canal de contacto.',
  },
  {
    target: 'notifications',
    title: 'Notificaciones',
    text: 'Acá recibís los avisos sobre tus negocios y tus exportaciones.',
  },
  {
    target: 'tutorial',
    title: 'Tutorial',
    text: 'Con este botón podés volver a ver este tutorial cuando quieras.',
  },
  {
    target: 'report-error',
    title: 'Reportar un error',
    text: 'Si algo no funciona como esperabas, reportalo desde acá.',
  },
];

interface Step {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  badge: string;
  tips: string[];
}

export default function OnboardingTutorialModal({
  role,
  isOpen,
  onClose,
  isFirstTime = false,
}: OnboardingTutorialModalProps) {
  const { completeOnboarding } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompletedState, setIsCompletedState] = useState(false);
  // Tras los pasos explicativos se recorre el panel real señalando cada menú
  const [isTourActive, setIsTourActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setIsCompletedState(false);
      setIsTourActive(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const adminSteps: Step[] = [
    {
      title: 'Bienvenido al Panel de Administrador',
      subtitle: 'Visión general del ecosistema Ando Mendoza',
      description:
        'Desde este panel centralizado tendrás el control total sobre la plataforma turística: seguimiento de visitantes, métricas en tiempo real y estado general de la aplicación.',
      icon: LayoutDashboard,
      badge: 'Paso 1 de 5 · Resumen General',
      tips: [
        'Visualiza indicadores de actividad diaria y métricas de turistas.',
        'Accede rápidamente a las secciones principales desde el menú lateral.',
      ],
    },
    {
      title: 'Catálogo y Validación de POIs',
      subtitle: 'Auditoría y moderación formal de atractivos',
      description:
        'Revisa exhaustivamente las solicitudes de nuevos puntos turísticos enviadas por la comunidad y prestadores comerciales. Podrás aprobar, rechazar o solicitar correcciones.',
      icon: CheckSquare,
      badge: 'Paso 2 de 5 · Moderación',
      tips: [
        'Valida que las coordenadas geográficas y horarios sean correctos.',
        'Envía observaciones detalladas al prestador si se requieren ajustes.',
      ],
    },
    {
      title: 'Gestión de Usuarios y Prestadores',
      subtitle: 'Control de accesos y roles de la plataforma',
      description:
        'Supervisa las cuentas de turistas, prestadores y otros administradores. Podrás gestionar altas, cambios de estado y bajas lógicas seguras manteniendo la integridad de datos.',
      icon: Users,
      badge: 'Paso 3 de 5 · Cuentas y Accesos',
      tips: [
        'Filtra usuarios por rol y estado (activo, pendiente, inactivo).',
        'Gestiona la vinculación comercial de los prestadores de Mendoza.',
      ],
    },
    {
      title: 'Configuración del Sistema (CYP)',
      subtitle: 'Parámetros turísticos, categorías y etiquetas',
      description:
        'Personaliza y mantén las categorías turísticas oficiales, etiquetas de búsqueda predictiva y parámetros geográficos que alimentan los algoritmos de recomendación e IA.',
      icon: Settings,
      badge: 'Paso 4 de 5 · Parámetros CYP',
      tips: [
        'Activa o desactiva categorías según la temporada turística.',
        'Garantiza la consistencia en las etiquetas utilizadas en toda la app.',
      ],
    },
    {
      title: 'Reportes, Analíticas y Auditoría',
      subtitle: 'Trazabilidad inmutable y exportación de datos',
      description:
        'Genera informes tabulares de atracción turística, negocios más visitados y consulta los registros inmutables de auditoría de cada acción crítica realizada.',
      icon: BarChart3,
      badge: 'Paso 5 de 5 · Reportes y Logs',
      tips: [
        'Exporta métricas consolidadas en formato CSV estándar.',
        'Monitorea la trazabilidad completa para cumplimiento normativo.',
      ],
    },
  ];

  const providerSteps: Step[] = [
    {
      title: 'Bienvenido al Portal del Prestador',
      subtitle: 'Gestiona tu presencia turística en Ando Mendoza',
      description:
        'Tu panel exclusivo para dar visibilidad a tus atractivos, bodegas, restaurantes y experiencias guiadas para los miles de turistas que recorren Mendoza.',
      icon: Store,
      badge: 'Paso 1 de 5 · Mi Portal',
      tips: [
        'Conoce el impacto de tus negocios y las visitas recibidas.',
        'Mantén siempre tu información comercial al día para los visitantes.',
      ],
    },
    {
      title: 'Mis Negocios y Atractivos Turísticos',
      subtitle: 'Carga completa de fotos, ubicación y detalles',
      description:
        'Publica nuevos atractivos con fotografías de alta resolución, descripción atractiva, dirección precisa y canales de contacto directo (teléfono, web, redes sociales).',
      icon: Store,
      badge: 'Paso 2 de 5 · Atractivos',
      tips: [
        'Sube fotografías nítidas para destacar en las búsquedas móviles.',
        'Verifica el estado de aprobación por parte del equipo de moderación.',
      ],
    },
    {
      title: 'Días y Horarios Comerciales',
      subtitle: 'Franjas de atención, feriados y temporadas',
      description:
        'Define claramente tus horarios por día de la semana. Los algoritmos de itinerarios de Ando utilizarán estos horarios para sugerir visitas cuando estés abierto.',
      icon: CalendarRange,
      badge: 'Paso 3 de 5 · Horarios',
      tips: [
        'Configura horarios diferenciados para fines de semana y feriados.',
        'Evita que los turistas lleguen fuera de tu horario de atención.',
      ],
    },
    {
      title: 'Reseñas, Calificaciones y Respuestas',
      subtitle: 'Interacción directa con la comunidad de turistas',
      description:
        'Revisa las valoraciones y comentarios que dejan los visitantes sobre tu negocio. Podrás publicar respuestas oficiales firmadas como propietario para cuidar tu reputación.',
      icon: MessageSquare,
      badge: 'Paso 4 de 5 · Reputación',
      tips: [
        'Responde a consultas y agradece los comentarios positivos.',
        'Monitorea tu calificación promedio para mejorar continuamente.',
      ],
    },
    {
      title: 'Centro de Ayuda, Guías y Reporte de Errores',
      subtitle: 'Asistencia y soporte técnico cuando lo necesites',
      description:
        'Accede a manuales de uso, preguntas frecuentes y la herramienta de reporte de incidentes para informar cualquier problema técnico o visual de la plataforma.',
      icon: HelpCircle,
      badge: 'Paso 5 de 5 · Ayuda y Soporte',
      tips: [
        'Puedes repetir este tutorial interactivo cuando quieras desde Ayuda.',
        'Reporta cualquier inconveniente y recibirás seguimiento por email.',
      ],
    },
  ];

  const steps = role === 'admin' ? adminSteps : providerSteps;
  const isLastStep = currentStep === steps.length - 1;
  const activeStep = steps[currentStep];
  const StepIcon = activeStep.icon;

  const handleNext = () => {
    if (isLastStep) {
      setIsTourActive(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsCompletedState(false);
  };

  // El tutorial se cierra al instante; el registro de "ya visto" se guarda en segundo plano
  const closeAndPersist = () => {
    onClose();
    void completeOnboarding();
  };

  const handleOmit = closeAndPersist;
  const handleFinish = closeAndPersist;

  if (isTourActive) {
    return (
      <GuidedTour
        isOpen
        stops={role === 'admin' ? ADMIN_TOUR : PROVIDER_TOUR}
        onFinish={() => {
          setIsTourActive(false);
          setIsCompletedState(true);
        }}
        onSkip={() => {
          setIsTourActive(false);
          handleOmit();
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in font-wixText">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-black/10 max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] transition-all transform animate-scale-up"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 bg-bgPrimary/50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-accentWine/10 text-accentWine">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-accentWine">
              {role === 'admin' ? 'Tutorial Onboarding · Administrador' : 'Tutorial Onboarding · Prestador'}
            </span>
          </div>

          <button
            onClick={handleOmit}
            className="text-xs font-semibold text-textDark/60 hover:text-textDark px-2.5 py-1 rounded-full hover:bg-black/5 transition cursor-pointer"
            title="Omitir tutorial"
          >
            Omitir
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {isCompletedState ? (
            /* Completion Screen meeting Acceptance Criteria:
               "El Usuario finaliza el onboarding -> Que el sistema muestre el mensaje “Tutorial completo ¿Desea repetirlo?”" */
            <div className="text-center py-6 space-y-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h3 className="font-wixDisplay text-2xl font-black text-textDark">
                  Tutorial completo ¿Desea repetirlo?
                </h3>
                <p className="text-sm text-textDark/70 max-w-md mx-auto leading-relaxed">
                  Has recorrido las funcionalidades principales de tu panel en Ando Mendoza. Puedes repasarlo nuevamente ahora o continuar a tu espacio de trabajo.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-bgPrimary/60 border border-black/5 text-xs text-textDark/80 text-left space-y-1.5">
                <p className="font-bold text-textDark">💡 Recordatorio útil:</p>
                <p>
                  Siempre puedes volver a consultar este tutorial o el manual operativo desde la sección de <strong>Centro de Ayuda</strong> en tu menú lateral.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl border border-black/15 font-bold text-sm text-textDark hover:bg-black/5 transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-accentWine" />
                  <span>Repetir</span>
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 flex items-center justify-center space-x-2 px-5 py-3 rounded-2xl bg-accentWine text-white font-bold text-sm shadow-md hover:bg-accentWine/90 transition cursor-pointer"
                >
                  <span>Continuar</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Step Explanation Screen */
            <div className="space-y-6">
              {/* Badge & Step indicator */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-accentWine/10 text-accentWine">
                  {activeStep.badge}
                </span>

                <div className="flex items-center space-x-1.5">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === currentStep
                          ? 'w-6 bg-accentWine'
                          : idx < currentStep
                          ? 'w-2 bg-accentWine/50'
                          : 'w-2 bg-black/15'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Graphic Icon Header */}
              <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/15">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-accentWine/20 flex items-center justify-center text-accentWine flex-shrink-0">
                  <StepIcon className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-wixDisplay text-lg sm:text-xl font-bold text-textDark leading-tight">
                    {activeStep.title}
                  </h3>
                  <p className="text-xs font-semibold text-accentWine">
                    {activeStep.subtitle}
                  </p>
                </div>
              </div>

              {/* Detailed Description */}
              <p className="text-sm text-textDark/80 leading-relaxed">
                {activeStep.description}
              </p>

              {/* Tips & Bullet Points */}
              <div className="p-4 rounded-2xl bg-bgPrimary/60 border border-black/5 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-textDark/60 block">
                  Puntos destacados:
                </span>
                <ul className="space-y-1.5 text-xs text-textDark/80">
                  {activeStep.tips.map((tip, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <span className="text-accentWine font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation (only during active steps) */}
        {!isCompletedState && (
          <div className="px-6 py-4 border-t border-black/5 bg-bgPrimary/30 flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                currentStep === 0
                  ? 'text-black/30 cursor-not-allowed opacity-50'
                  : 'text-textDark hover:bg-black/5'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOmit}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-textDark/60 hover:text-textDark hover:bg-black/5 transition cursor-pointer"
              >
                Omitir
              </button>

              <button
                onClick={handleNext}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-accentWine text-white font-bold text-xs shadow-md hover:bg-accentWine/90 transition cursor-pointer"
              >
                <span>{isLastStep ? 'Ver en pantalla' : 'Siguiente'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
