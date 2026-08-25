'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Globe, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Users, 
  BarChart3, 
  FileText, 
  Settings, 
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { pois, logs, integrations, currentUser, users } = useApp();

  // Calcular métricas rápidas
  const totalPois = pois.length;
  const pendingValidation = pois.filter(p => p.status === 'pending').length;
  const approvedPois = pois.filter(p => p.status === 'approved').length;
  const activeIntegrations = integrations.filter(i => i.enabled).length;

  // Contar por categorías para mostrar en el desglose
  const categoriesCount = pois.reduce((acc: { [key: string]: number }, poi) => {
    acc[poi.category] = (acc[poi.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accentWine to-accentPurple p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                Panel de Administración
              </span>
              <span className="text-xs text-white/80">({users.length} usuarios registrados)</span>
            </div>
            <h3 className="font-wixDisplay text-2xl font-bold">
              ¡Hola de nuevo, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Administrador'}!
            </h3>
            <p className="text-white/90 text-sm leading-relaxed">
              Bienvenido al centro de control de ANDO. Aquí puedes auditar los atractivos turísticos del Gran Mendoza, moderar propuestas y configurar el sistema.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/admin/validation"
              className="px-5 py-2.5 bg-white text-accentWine hover:bg-white/90 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-2 cursor-pointer hover:-translate-y-0.5"
            >
              <ShieldCheck className="h-4 w-4 text-accentWine" />
              <span>Validar Contenido ({pendingValidation})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Metrics Grid - All Clickable with Links */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total POIs */}
        <Link 
          href="/admin/validation"
          className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs hover:shadow-md hover:border-accentWine/20 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-accentWine/10 text-accentWine rounded-xl group-hover:scale-105 transition-transform">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-textDark/60 uppercase tracking-wider">Total POIs</p>
              <h4 className="text-2xl font-bold text-textDark">{totalPois}</h4>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-textDark/30 group-hover:text-accentWine group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Metric 2: Pendientes de validación */}
        <Link 
          href="/admin/validation"
          className={`rounded-2xl p-6 border shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer ${
            pendingValidation > 0 
              ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300' 
              : 'bg-white border-black/5 hover:border-black/10'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-3.5 rounded-xl group-hover:scale-105 transition-transform ${
              pendingValidation > 0 
                ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-green-50 text-green-600'
            }`}>
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-textDark/60 uppercase tracking-wider">Pendientes</p>
              <h4 className="text-2xl font-bold text-textDark flex items-center">
                {pendingValidation}
                {pendingValidation > 0 && (
                  <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-amber-200 text-amber-950 rounded-full animate-pulse">
                    Revisar
                  </span>
                )}
              </h4>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-textDark/30 group-hover:text-amber-800 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Metric 3: Aprobados */}
        <Link 
          href="/admin/validation"
          className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs hover:shadow-md hover:border-green-200 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-green-50 text-green-700 rounded-xl group-hover:scale-105 transition-transform">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-textDark/60 uppercase tracking-wider">Aprobados</p>
              <h4 className="text-2xl font-bold text-textDark">{approvedPois}</h4>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-textDark/30 group-hover:text-green-700 group-hover:translate-x-0.5 transition-all" />
        </Link>

        {/* Metric 4: APIs / Integraciones */}
        <Link 
          href="/admin/settings"
          className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs hover:shadow-md hover:border-accentPurple/20 transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3.5 bg-accentPurple/10 text-accentPurple rounded-xl group-hover:scale-105 transition-transform">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-textDark/60 uppercase tracking-wider">APIs activas</p>
              <h4 className="text-2xl font-bold text-textDark">
                {activeIntegrations} <span className="text-xs text-textDark/50 font-normal">/ {integrations.length}</span>
              </h4>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-textDark/30 group-hover:text-accentPurple group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* Quick Direct Actions Panel */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          href="/admin/validation"
          className="bg-white p-4 rounded-xl border border-black/5 hover:border-accentWine/30 hover:shadow-sm transition-all text-center space-y-2 group cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="p-2.5 bg-accentWine/10 text-accentWine rounded-lg group-hover:scale-110 transition-transform">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-textDark group-hover:text-accentWine">Validar POIs</span>
        </Link>

        <Link
          href="/admin/users"
          className="bg-white p-4 rounded-xl border border-black/5 hover:border-fillPrimary/30 hover:shadow-sm transition-all text-center space-y-2 group cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="p-2.5 bg-fillPrimary/10 text-fillPrimary rounded-lg group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-textDark group-hover:text-fillPrimary">Usuarios</span>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white p-4 rounded-xl border border-black/5 hover:border-fillSecondary/30 hover:shadow-sm transition-all text-center space-y-2 group cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="p-2.5 bg-fillSecondary/10 text-fillSecondary rounded-lg group-hover:scale-110 transition-transform">
            <BarChart3 className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-textDark group-hover:text-fillSecondary">Reportes</span>
        </Link>

        <Link
          href="/admin/logs"
          className="bg-white p-4 rounded-xl border border-black/5 hover:border-accentWine/30 hover:shadow-sm transition-all text-center space-y-2 group cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="p-2.5 bg-amber-100 text-amber-900 rounded-lg group-hover:scale-110 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-textDark group-hover:text-amber-900">Auditoría</span>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white p-4 rounded-xl border border-black/5 hover:border-accentPurple/30 hover:shadow-sm transition-all text-center space-y-2 group cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="p-2.5 bg-accentPurple/10 text-accentPurple rounded-lg group-hover:scale-110 transition-transform">
            <Settings className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-textDark group-hover:text-accentPurple">Configuración</span>
        </Link>

        <Link
          href="/admin/help"
          className="bg-white p-4 rounded-xl border border-black/5 hover:border-blue-300 hover:shadow-sm transition-all text-center space-y-2 group cursor-pointer flex flex-col items-center justify-center"
        >
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-lg group-hover:scale-110 transition-transform">
            <HelpCircle className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-textDark group-hover:text-blue-700">Ayuda</span>
        </Link>
      </div>

      {/* Main Section: Analytics & Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Charts & Visuals */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Card */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Puntos de interés por categoría</h4>
                <p className="text-xs text-textDark/60">Distribución de atractivos turísticos en Mendoza</p>
              </div>
              <Link href="/admin/reports" className="p-2 hover:bg-black/5 rounded-lg text-fillSecondary transition-colors" title="Ver reporte completo">
                <TrendingUp className="h-5 w-5" />
              </Link>
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-4">
              {Object.keys(categoriesCount).length > 0 ? (
                Object.entries(categoriesCount).map(([category, count]) => {
                  const percentage = totalPois > 0 ? (count / totalPois) * 100 : 0;
                  
                  let barColor = 'bg-accentWine';
                  if (category === 'Enoturismo') barColor = 'bg-accentWine';
                  if (category === 'Naturaleza') barColor = 'bg-fillPrimary';
                  if (category === 'Bienestar') barColor = 'bg-fillSecondary';
                  if (category === 'Aventura') barColor = 'bg-accentPurple';
                  
                  return (
                    <div key={category} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-textDark/80">{category}</span>
                        <span className="text-textDark font-bold">{count} {count === 1 ? 'POI' : 'POIs'} ({Math.round(percentage)}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-bgPrimary rounded-full overflow-hidden border border-black/5">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center space-y-2">
                  <AlertCircle className="h-8 w-8 text-textDark/20 mx-auto" />
                  <p className="text-xs font-bold text-textDark/60">No hay atractivos categorizados en este momento.</p>
                  <p className="text-[11px] text-textDark/40">
                    Podés validar solicitudes en la <Link href="/admin/validation" className="text-accentWine underline font-bold">Consola de Moderación</Link> o configurar nuevas categorías en <Link href="/admin/settings" className="text-accentWine underline font-bold">Ajustes</Link>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-accentWine" />
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Historial de decisiones de moderación</h4>
              </div>
              <Link href="/admin/logs" className="text-xs font-bold text-accentWine hover:underline">
                Ver todos los registros →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-black/10 text-textDark/60 text-xs font-bold uppercase tracking-wider bg-bgPrimary/40">
                    <th className="py-3 px-3 font-bold">POI Atractivo</th>
                    <th className="py-3 px-3 font-bold">Acción</th>
                    <th className="py-3 px-3 font-bold">Auditor</th>
                    <th className="py-3 px-3 font-bold">Fecha y hora</th>
                    <th className="py-3 px-3 font-bold">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {logs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="hover:bg-bgPrimary/30 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-textDark">{log.poiName}</td>
                      <td className="py-3.5 px-3">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          log.action === 'approve' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {log.action === 'approve' ? <CheckCircle className="h-3 w-3 mr-0.5" /> : <XCircle className="h-3 w-3 mr-0.5" />}
                          <span>{log.action === 'approve' ? 'Aprobado' : 'Rechazado'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-textDark/70">{log.adminName}</td>
                      <td className="py-3.5 px-3 text-textDark/60 text-xs font-medium">
                        {new Date(log.timestamp).toLocaleString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-3 text-textDark/60 text-xs max-w-xs truncate" title={log.comment}>
                        {log.comment || 'Sin comentarios adicionales'}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-textDark/50">
                        No hay registros de auditoría en esta sesión.{' '}
                        <Link href="/admin/validation" className="text-accentWine underline font-bold">Moderar un POI</Link> para registrar acciones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: System & AI Suggestions */}
        <div className="space-y-8">
          {/* Ecosistema IA Card */}
          <div className="bg-gradient-to-br from-white to-accentPurple/5 rounded-2xl border border-accentPurple/10 p-6 shadow-xs relative overflow-hidden">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-accentPurple/10 blur-lg" />
            
            <div className="flex items-center space-x-2 text-accentPurple mb-4">
              <Sparkles className="h-5 w-5 fill-accentPurple/10" />
              <h5 className="font-wixDisplay text-sm font-bold uppercase tracking-wider">Asistente IA ANDO</h5>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-textDark/70 leading-relaxed">
                El motor inteligente detectó <strong>{pendingValidation}</strong> solicitud{pendingValidation !== 1 ? 'es' : ''} de validación pendiente{pendingValidation !== 1 ? 's' : ''}.
              </p>
              
              <div className="bg-white/90 border border-accentPurple/15 rounded-xl p-3.5 space-y-2 shadow-2xs">
                <span className="text-[10px] font-bold text-accentPurple uppercase tracking-wider block">Sugerencia de optimización</span>
                <p className="text-xs text-textDark/80 font-medium leading-relaxed">
                  &quot;Revisá los POIs pendientes de validación para mantener el catálogo turístico actualizado y publicado en la plataforma ANDO.&quot;
                </p>
                <Link
                  href="/admin/validation"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-accentPurple hover:underline pt-1"
                >
                  <span>Ir a consola de validación</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="bg-white/90 border border-accentPurple/15 rounded-xl p-3.5 space-y-2 shadow-2xs">
                <span className="text-[10px] font-bold text-accentPurple uppercase tracking-wider block">Estadísticas de tráfico</span>
                <p className="text-xs text-textDark/60 font-medium leading-relaxed italic">
                  Las estadísticas de tráfico en tiempo real están disponibles en el panel de reportes.
                </p>
                <Link
                  href="/admin/reports"
                  className="inline-flex items-center space-x-1 text-xs font-bold text-fillPrimary hover:underline pt-1"
                >
                  <span>Ver estadísticas</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
            <h5 className="font-wixDisplay text-sm font-bold text-textDark uppercase tracking-wider mb-4">Atajos de Administración</h5>
            <div className="space-y-2.5">
              <Link 
                href="/admin/validation" 
                className="w-full flex items-center justify-between py-2.5 px-3 bg-bgPrimary hover:bg-black/5 border border-black/10 text-textDark font-semibold rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              >
                <span>Validar solicitudes ({pendingValidation})</span>
                <ChevronRight className="h-3.5 w-3.5 text-textDark/40" />
              </Link>
              <Link 
                href="/admin/users" 
                className="w-full flex items-center justify-between py-2.5 px-3 bg-bgPrimary hover:bg-black/5 border border-black/10 text-textDark font-semibold rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              >
                <span>Gestionar usuarios ({users.length})</span>
                <ChevronRight className="h-3.5 w-3.5 text-textDark/40" />
              </Link>
              <Link 
                href="/admin/settings" 
                className="w-full flex items-center justify-between py-2.5 px-3 bg-bgPrimary hover:bg-black/5 border border-black/10 text-textDark font-semibold rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              >
                <span>Categorías y parámetros</span>
                <ChevronRight className="h-3.5 w-3.5 text-textDark/40" />
              </Link>
              <Link 
                href="/admin/reports" 
                className="w-full flex items-center justify-between py-2.5 px-3 bg-bgPrimary hover:bg-black/5 border border-black/10 text-textDark font-semibold rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              >
                <span>Exportar reportes de actividad</span>
                <ChevronRight className="h-3.5 w-3.5 text-textDark/40" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
