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
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { pois, logs, integrations, currentUser } = useApp();

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
        <div className="relative z-10 max-w-xl space-y-2">
          <h3 className="font-wixDisplay text-2xl font-bold">
            ¡Hola de nuevo, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Administrador'}!
          </h3>
          <p className="text-white/90 text-sm leading-relaxed">
            Bienvenida al centro de control de ANDO. Aquí puedes auditar los nuevos atractivos turísticos del Gran Mendoza y ajustar los parámetros del motor de traducción y mapas.
          </p>
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs hover:shadow-sm transition-shadow flex items-center space-x-4">
          <div className="p-3.5 bg-accentWine/10 text-accentWine rounded-xl">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-textDark/60 uppercase tracking-wider">Total POIs</p>
            <h4 className="text-2xl font-bold text-textDark">{totalPois}</h4>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs hover:shadow-sm transition-shadow flex items-center space-x-4">
          <div className={`p-3.5 rounded-xl ${pendingValidation > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-green-50 text-green-600'}`}>
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-textDark/60 uppercase tracking-wider">Pendientes</p>
            <h4 className="text-2xl font-bold text-textDark">
              {pendingValidation}
              {pendingValidation > 0 && (
                <span className="ml-2 text-xs font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full animate-pulse">
                  Revisar
                </span>
              )}
            </h4>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs hover:shadow-sm transition-shadow flex items-center space-x-4">
          <div className="p-3.5 bg-green-50 text-green-700 rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-textDark/60 uppercase tracking-wider">Aprobados</p>
            <h4 className="text-2xl font-bold text-textDark">{approvedPois}</h4>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-xs hover:shadow-sm transition-shadow flex items-center space-x-4">
          <div className="p-3.5 bg-accentPurple/10 text-accentPurple rounded-xl">
            <Globe className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-textDark/60 uppercase tracking-wider">APIs activas</p>
            <h4 className="text-2xl font-bold text-textDark">{activeIntegrations} <span className="text-xs text-textDark/50 font-normal">/ {integrations.length}</span></h4>
          </div>
        </div>
      </div>

      {/* Main Section: Analytics & Activity */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Columns: Charts & Visuals */}
        <div className="lg:col-span-2 space-y-8">
          {/* Mock Chart Card */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Puntos de interés por categoría</h4>
                <p className="text-xs text-textDark/60">Distribución de atractivos turísticos en Mendoza</p>
              </div>
              <TrendingUp className="h-5 w-5 text-fillSecondary" />
            </div>

            {/* Visual Bar Chart */}
            <div className="space-y-4">
              {Object.entries(categoriesCount).map(([category, count]) => {
                const percentage = (count / totalPois) * 100;
                
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
              })}
            </div>
          </div>

          {/* Activity Log Table */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="h-5 w-5 text-accentWine" />
              <h4 className="font-wixDisplay text-lg font-bold text-textDark">Historial de decisiones (GIT)</h4>
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
                        No hay registros de auditoría en esta sesión.
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
                  &quot;El prestador Santiago Catena modificó horarios de la Bodega Catena Zapata para temporada alta. Te recomendamos revisar el solapamiento con eventos locales registrados en la agenda de Luján de Cuyo.&quot;
                </p>
              </div>

              <div className="bg-white/90 border border-accentPurple/15 rounded-xl p-3.5 space-y-2 shadow-2xs">
                <span className="text-[10px] font-bold text-accentPurple uppercase tracking-wider block">Estadísticas de tráfico</span>
                <p className="text-xs text-textDark/80 font-medium leading-relaxed">
                  El enoturismo creció un <strong>12%</strong> este mes en búsquedas dentro de la app móvil.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
            <h5 className="font-wixDisplay text-sm font-bold text-textDark uppercase tracking-wider mb-4">Atajos rápidos</h5>
            <div className="space-y-2.5">
              <Link 
                href="/admin/validation" 
                className="block w-full text-center py-2.5 bg-bgPrimary hover:bg-black/5 border border-black/10 text-textDark font-semibold rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              >
                Ir a validar pendientes ({pendingValidation})
              </Link>
              <Link 
                href="/admin/settings" 
                className="block w-full text-center py-2.5 bg-bgPrimary hover:bg-black/5 border border-black/10 text-textDark font-semibold rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              >
                Modificar idiomas y traducciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
