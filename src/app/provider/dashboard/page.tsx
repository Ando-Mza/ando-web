'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Eye, 
  Star, 
  Clock, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function ProviderDashboard() {
  const { pois, schedules, currentUser } = useApp();

  // Encontrar el POI del prestador autenticado
  const myPoi = pois.find(p => p.createdBy === currentUser?.id || !p.createdBy) || pois[0];
  const mySchedules = schedules.filter(s => s.poiId === myPoi?.id);

  return (
    <div className="space-y-8">
      {/* Welcome & Status Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fillPrimary to-fillSecondary p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-xl" />
        <div className="relative z-10 max-w-xl space-y-2">
          <h3 className="font-wixDisplay text-2xl font-bold">
            ¡Bienvenido, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Prestador'}!
          </h3>
          <p className="text-white/80 text-sm">
            Gestiona la información de <strong>{myPoi?.name || 'tu negocio'}</strong>. Mantén tus horarios y fotos actualizadas para atraer más turistas mendocinos y extranjeros.
          </p>
        </div>
      </div>

      {/* Business Status Alerts */}
      {myPoi && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 shadow-sm ${
          myPoi.status === 'approved' 
            ? 'bg-green-50/50 border-green-200 text-green-800' 
            : myPoi.status === 'pending'
            ? 'bg-yellow-50/50 border-yellow-200 text-yellow-800'
            : 'bg-red-50/50 border-red-200 text-red-800'
        }`}>
          {myPoi.status === 'approved' ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${myPoi.status === 'pending' ? 'text-yellow-600' : 'text-red-600'}`} />
          )}
          <div className="text-xs space-y-1">
            <p className="font-bold">
              Estado de tu Punto de Interés (POI):{' '}
              <span className="uppercase">{myPoi.status === 'approved' ? 'Activo y Visible' : myPoi.status === 'pending' ? 'En Revisión' : 'Rechazado'}</span>
            </p>
            {myPoi.status === 'approved' && (
              <p>Tu establecimiento se encuentra listado en la aplicación móvil de ANDO y está recibiendo visitas.</p>
            )}
            {myPoi.status === 'pending' && (
              <p>Un administrador de ANDO está revisando tus modificaciones de horarios y fotos. Te notificaremos aquí.</p>
            )}
            {myPoi.status === 'rejected' && (
              <div className="space-y-1">
                <p>Tu publicación fue rechazada por el siguiente motivo: </p>
                <p className="bg-white/60 p-2.5 rounded-lg font-mono text-[11px] border border-red-200 font-semibold">{myPoi.feedback}</p>
                <p className="pt-1">Por favor ve a &quot;Datos del Local&quot; para corregir los problemas y volver a enviar.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3 bg-fillPrimary/10 text-fillPrimary rounded-lg">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-textDark/50 uppercase tracking-wider">Visitas (Este Mes)</p>
            <h4 className="text-2xl font-bold text-textDark">1,482</h4>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Star className="h-6 w-6 fill-yellow-500 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs font-bold text-textDark/50 uppercase tracking-wider">Calificación</p>
            <h4 className="text-2xl font-bold text-textDark">4.8 <span className="text-xs font-normal text-textDark/40">(124 reseñas)</span></h4>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3 bg-accentWine/10 text-accentWine rounded-lg">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-textDark/50 uppercase tracking-wider">Reglas Horarias</p>
            <h4 className="text-2xl font-bold text-textDark">{mySchedules.length} <span className="text-xs text-textDark/40">vigente{mySchedules.length !== 1 ? 's' : ''}</span></h4>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm hover:shadow-md transition-shadow flex items-center space-x-4">
          <div className="p-3 bg-accentPurple/10 text-accentPurple rounded-lg">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-textDark/50 uppercase tracking-wider">Interacción</p>
            <h4 className="text-2xl font-bold text-textDark">+15.4% <span className="text-xs text-textDark/40">vs. mes anterior</span></h4>
          </div>
        </div>
      </div>

      {/* Details Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: POI preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
            <h4 className="font-wixDisplay text-lg font-bold text-textDark mb-4">Vista Previa del Establecimiento</h4>
            
            {myPoi && (
              <div className="space-y-4">
                <div className="relative h-48 w-full rounded-xl overflow-hidden bg-bgPrimary border border-black/5">
                  {myPoi.images && myPoi.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={myPoi.images[0]}
                      alt={myPoi.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-textDark/30 text-sm">
                      Sin imágenes de portada cargadas.
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-accentWine text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
                    {myPoi.category}
                  </div>
                </div>

                <div className="space-y-2">
                  <h5 className="font-wixDisplay text-xl font-bold text-textDark">{myPoi.name}</h5>
                  <p className="text-xs text-textDark/50 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-fillPrimary" />
                    {myPoi.address}
                  </p>
                  <p className="text-xs text-textDark/75 leading-relaxed pt-2 border-t border-black/5">
                    {myPoi.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick shortcuts & recommendations */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-4">
            <h4 className="font-wixDisplay text-sm font-bold text-textDark uppercase tracking-wider">Accesos Rápidos</h4>
            <div className="space-y-2.5">
              <Link 
                href="/provider/business" 
                className="block w-full text-center py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-xs transition-colors shadow-sm"
              >
                Actualizar Fotos o Información
              </Link>
              <Link 
                href="/provider/schedules" 
                className="block w-full text-center py-2.5 bg-bgPrimary hover:bg-black/5 border border-black/5 text-textDark font-semibold rounded-lg text-xs transition-colors"
              >
                Modificar Horarios de Atención
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm space-y-3">
            <h4 className="font-wixDisplay text-xs font-bold text-textDark uppercase tracking-wider">Reglas de Negocio</h4>
            <div className="space-y-2 text-xs text-textDark/75 leading-relaxed">
              <p>1. Toda modificación de descripción, imágenes o dirección requiere ser aprobada por el Administrador antes de publicarse en la app móvil.</p>
              <p>2. Los horarios deben ser coherentes: la hora de finalización debe ser posterior a la de inicio y no deben solaparse rangos dentro de un mismo día.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
