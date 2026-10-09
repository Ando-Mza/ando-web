'use client';

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  Layers,
  Search
} from 'lucide-react';

export default function AdminHelpPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'manual'>('manual');
  const [manualContent, setManualContent] = useState('');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [openManualIndex, setOpenManualIndex] = useState<number | null>(0);

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
    {
      q: '¿Qué pasa si apruebo por error un negocio falso?',
      a: 'Podés buscar el POI en el sistema, ingresar a su detalle y cambiar su estado manualmente a "Suspendido" o "Rechazado", lo que lo ocultará inmediatamente del mapa público.'
    },
    {
      q: '¿Por qué hay reportes sin "Usuario reportante"?',
      a: 'Son los reportes generados automáticamente por la Inteligencia Artificial de ANDO al detectar lenguaje inapropiado durante la publicación de una reseña.'
    },
    {
      q: '¿La eliminación de usuarios borra sus datos de la base de datos?',
      a: 'No. Por cuestiones de auditoría e integridad referencial, las eliminaciones son "lógicas". La cuenta se desactiva y se oculta su contenido, pero los registros persisten en la base de datos.'
    },
    {
      q: '¿Puedo crear otro usuario Administrador?',
      a: 'Sí. Desde el módulo de Administración de Usuarios, usando el botón "+ Nuevo Usuario" y asignándole el rol `Administrador`. Tienen los mismos privilegios que tu cuenta.'
    }
  ];

  const filteredFaqs = adminFaqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  useEffect(() => {
    fetch('/manual/manual_usuario_ando_admin.md')
      .then((r) => r.text())
      .then((text) => setManualContent(text))
      .catch(() => setManualContent('No se pudo cargar el manual del administrador.'));
  }, []);

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

      <div className="space-y-6">
        <div className="flex bg-white rounded-xl border border-black/5 p-1 shadow-sm overflow-x-auto">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'manual'
                ? 'bg-accentWine text-white shadow-sm'
                : 'text-textDark hover:bg-black/5'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Manual del Administrador</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-colors whitespace-nowrap ${
              activeTab === 'faq'
                ? 'bg-accentWine text-white shadow-sm'
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
                              <span className="text-sm sm:text-base font-bold text-textDark group-hover:text-accentWine transition-colors">
                                {title}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="h-5 w-5 text-accentWine flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-textDark/40 flex-shrink-0 group-hover:text-accentWine transition-colors" />
                              )}
                            </button>
                            {isOpen && (
                              <div className="mt-4 prose prose-sm max-w-none bg-bgPrimary/30 p-4 sm:p-6 rounded-2xl border border-black/5 animate-fade-in
                                [&_h2]:text-xl [&_h2]:font-wixDisplay [&_h2]:font-bold [&_h2]:text-accentWine [&_h2]:mt-8 [&_h2]:mb-4
                                [&_h3]:text-lg [&_h3]:font-wixDisplay [&_h3]:font-bold [&_h3]:text-textDark [&_h3]:mt-6 [&_h3]:mb-3
                                [&_p]:text-sm [&_p]:text-textDark/80 [&_p]:leading-relaxed [&_p]:mb-4
                                [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul_li]:text-sm [&_ul_li]:text-textDark/80 [&_ul_li]:mb-1
                                [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol_li]:text-sm [&_ol_li]:text-textDark/80 [&_ol_li]:mb-1
                                [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:my-6 [&_img]:mx-auto
                                [&_a]:text-accentWine [&_a]:font-bold [&_a]:underline [&_a:hover]:text-accentWine/80
                                [&_table]:w-full [&_table]:mb-6 [&_table]:border-collapse [&_th]:bg-black/5 [&_th]:p-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_td]:p-3 [&_td]:border-b [&_td]:border-black/5 [&_td]:text-xs [&_td]:text-textDark/80
                                [&_blockquote]:border-l-4 [&_blockquote]:border-accentWine [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-accentWine/5 [&_blockquote]:p-3 [&_blockquote]:rounded-r-xl [&_blockquote]:my-4"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-accentWine" />
                  <h3 className="font-wixDisplay text-lg font-bold text-textDark">Preguntas Frecuentes</h3>
                </div>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-textDark/40" />
                  <input
                    type="text"
                    placeholder="Buscar preguntas..."
                    value={faqSearchQuery}
                    onChange={(e) => setFaqSearchQuery(e.target.value)}
                    className="w-full sm:w-64 pl-9 pr-3 py-2 bg-black/5 border border-transparent focus:bg-white focus:border-accentWine/30 rounded-xl text-xs font-semibold focus:outline-none transition-all"
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
    </div>
  );
}
