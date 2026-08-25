'use client';

import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Settings, 
  Users, 
  Store, 
  ChevronDown, 
  ChevronUp, 
  FileText,
  Lock,
  Layers
} from 'lucide-react';

export default function AdminHelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const adminFaqs = [
    {
      q: '¿Cómo funciona el flujo formal de auditoría de POIs?',
      a: 'En "Validación de POIs", el administrador revisa los datos completos del POI (descripción, coordenadas, fotos y horarios). Puede aprobar directamente, solicitar corrección indicando observaciones detalladas o rechazar fundando el motivo. Cada acción genera un registro inmutable en el log de auditoría.',
    },
    {
      q: '¿Cómo se gestionan las categorías y etiquetas turísticas?',
      a: 'Desde "Configuración del Sistema", el administrador puede crear, editar, activar o desactivar categorías y etiquetas. Si una categoría ya está asignada a uno o más POIs activos, el sistema impide su eliminación directa para proteger la integridad referencial.',
    },
    {
      q: '¿Cómo se maneja la baja de prestadores y usuarios?',
      a: 'Al dar de baja una cuenta de prestador desde "Gestión de Usuarios", se aplica una baja lógica asignando la fecha de baja en el backend. Los POIs dependientes pasan a estado rechazado/inactivo y no se eliminan físicamente de la base de datos.',
    },
    {
      q: '¿Dónde se consultan y descargan los reportes consolidados?',
      a: 'En "Reportes y Estadísticas", el administrador puede filtrar por período (7d, 30d, 90d, histórico) y categoría turística para visualizar métricas agregadas y descargar los datos tabulares en formato CSV estándar.',
    },
    {
      q: '¿Cómo se garantiza la trazabilidad y auditoría de eventos?',
      a: 'En la sección "Auditoría y Logs", el sistema registra automáticamente el timestamp, IP, administrador actor y detalle de cada decisión crítica. Los registros son de solo lectura y pueden exportarse para auditorías externas.',
    },
  ];

  return (
    <div className="space-y-8 font-wixText">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/20 rounded-3xl p-6 sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-accentWine/10 border border-accentWine/20 px-3 py-1 rounded-full text-xs font-bold text-accentWine">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Manual del Administrador y Guías Operativas</span>
          </div>
          <h2 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
            Manual de Usuario y Soporte Administrativo
          </h2>
          <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
            Documentación técnica y operativa para la validación de contenidos turísticos, administración de cuentas, parámetros del sistema y políticas de moderación.
          </p>
        </div>
      </div>

      {/* Modules Quick Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-3">
          <div className="p-2.5 rounded-xl bg-accentWine/10 text-accentWine w-fit">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-wixDisplay text-base font-bold text-textDark">Validación de POIs</h4>
          <p className="text-xs text-textDark/70 leading-relaxed">
            Revisión formal de propuestas comunitarias y negocios turísticos antes de su publicación en la app móvil.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-3">
          <div className="p-2.5 rounded-xl bg-accentWine/10 text-accentWine w-fit">
            <Users className="h-5 w-5" />
          </div>
          <h4 className="font-wixDisplay text-base font-bold text-textDark">Gestión de Usuarios</h4>
          <p className="text-xs text-textDark/70 leading-relaxed">
            Control de cuentas, asignación de roles (Prestador, Turista, Administrador) y bajas lógicas.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-3">
          <div className="p-2.5 rounded-xl bg-accentWine/10 text-accentWine w-fit">
            <Settings className="h-5 w-5" />
          </div>
          <h4 className="font-wixDisplay text-base font-bold text-textDark">Configuración CYP</h4>
          <p className="text-xs text-textDark/70 leading-relaxed">
            Mantenimiento de categorías, etiquetas de búsqueda, integraciones y parámetros globales.
          </p>
        </div>
      </div>

      {/* FAQs Accordion */}
      <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
        <div className="flex items-center space-x-2 border-b border-black/5 pb-3">
          <BookOpen className="h-5 w-5 text-accentWine" />
          <h3 className="font-wixDisplay text-lg font-bold text-textDark">Preguntas Frecuentes de Administración</h3>
        </div>

        <div className="divide-y divide-black/5">
          {adminFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-xs sm:text-sm font-bold text-textDark">{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-accentWine flex-shrink-0" />
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
  );
}
