'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Store,
  Clock, 
  AlertCircle,
  CheckCircle,
  MapPin,
  Image as ImageIcon,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Phone,
  Mail,
  Sparkles,
  Award,
  Star,
  MousePointerClick,
  MessageSquare,
  Send,
  User as UserIcon
} from 'lucide-react';
import Link from 'next/link';

export default function ProviderDashboard() {
  const { pois, schedules, generalParams, currentUser, reviews, addReviewReply } = useApp();

  // 1. Memoizar POIs del prestador autenticado
  const providerPois = React.useMemo(() => {
    const providerId = currentUser?.id || '';
    return pois.filter((p) => 
      currentUser?.role === 'admin' || 
      (providerId && p.createdBy === providerId) || 
      !p.createdBy
    );
  }, [pois, currentUser]);

  // 2. Estado para seleccionar el negocio activo con persistencia en localStorage
  const [selectedPoiId, setSelectedPoiId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedProviderPoiId') || '';
    }
    return '';
  });
  
  // Estado para la respuesta interactiva a reseñas
  const [replyingToReviewId, setReplyingToReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Sincronizar selección inicial o recuperarla de localStorage
  useEffect(() => {
    if (providerPois.length > 0) {
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('selectedProviderPoiId') : null;
      if (savedId && providerPois.some((p) => p.id === savedId)) {
        if (selectedPoiId !== savedId) {
          setSelectedPoiId(savedId);
        }
      } else if (!selectedPoiId || !providerPois.some((p) => p.id === selectedPoiId)) {
        const defaultId = providerPois[0].id;
        setSelectedPoiId(defaultId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedProviderPoiId', defaultId);
        }
      }
    }
  }, [providerPois]);

  const handleSelectBusiness = (newId: string) => {
    setSelectedPoiId(newId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedProviderPoiId', newId);
    }
  };

  const selectedPoi = providerPois.find((p) => p.id === selectedPoiId) || providerPois[0];
  const selectedSchedules = schedules.filter((s) => s.poiId === selectedPoi?.id);
  const selectedReviews = reviews.filter((r) => r.poiId === selectedPoi?.id);

  // 3. Cálculo dinámico del porcentaje de completitud del perfil del negocio seleccionado
  const calculateCompleteness = () => {
    if (!selectedPoi) return 0;
    let score = 0;
    if (selectedPoi.name?.trim()) score += 15;
    if (selectedPoi.description?.trim()) score += 15;
    if (selectedPoi.address?.trim()) score += 15;
    if (selectedPoi.location?.lat && selectedPoi.location?.lng) score += 15;
    if (selectedPoi.phone?.trim() || selectedPoi.email?.trim()) score += 15;
    if (selectedPoi.images && selectedPoi.images.length > 0) score += 15;
    if (selectedSchedules && selectedSchedules.length > 0) score += 10;
    return score;
  };

  const completenessScore = calculateCompleteness();

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    addReviewReply(reviewId, replyText.trim());
    setReplyingToReviewId(null);
    setReplyText('');
  };

  if (providerPois.length === 0) {
    return (
      <div className="space-y-8">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fillPrimary to-fillSecondary p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-xl space-y-2">
            <h3 className="font-wixDisplay text-2xl font-bold">
              ¡Bienvenido, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Prestador'}!
            </h3>
            <p className="text-white/80 text-sm">
              Comienza registrando tu primer establecimiento o punto de interés turístico en Mendoza.
            </p>
          </div>
        </div>

        <div className="bg-white p-12 rounded-2xl border border-black/5 text-center space-y-4 shadow-sm">
          <div className="h-16 w-16 bg-fillPrimary/10 text-fillPrimary rounded-full flex items-center justify-center mx-auto">
            <Store className="h-8 w-8" />
          </div>
          <h4 className="font-wixDisplay text-xl font-bold text-textDark">No tienes negocios registrados</h4>
          <p className="text-sm text-textDark/60 max-w-md mx-auto">
            Registra tu primer negocio para gestionar sus horarios, fotos, clics y reseñas de turistas.
          </p>
          <Link
            href="/provider/business"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-fillPrimary hover:bg-fillPrimary/90 text-white font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer"
          >
            <Store className="h-4 w-4" />
            <span>Registrar Nuevo Negocio</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header con Bienvenida y Selector de Negocio */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-fillPrimary to-fillSecondary p-8 text-white shadow-lg">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-white/10 blur-xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                Panel del Prestador
              </span>
              <span className="text-xs text-white/80">({providerPois.length} negocio{providerPois.length !== 1 ? 's' : ''} en total)</span>
            </div>
            <h3 className="font-wixDisplay text-2xl font-bold">
              ¡Bienvenido, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Prestador'}!
            </h3>
            <p className="text-white/80 text-sm">
              Selecciona el negocio que deseas auditar y gestionar en tiempo real.
            </p>
          </div>

          {/* Business Selector Dropdown */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[280px]">
            <label htmlFor="dashboard-business-select" className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Store className="h-4 w-4 text-accentYellow" />
              <span>Seleccionar Negocio</span>
            </label>
            <select
              id="dashboard-business-select"
              value={selectedPoiId}
              onChange={(e) => handleSelectBusiness(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-white/30 bg-white text-fillPrimary focus:outline-none focus:ring-2 focus:ring-accentYellow font-bold text-sm cursor-pointer shadow-sm"
            >
              {providerPois.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* State & Alerts for the Selected Business */}
      {selectedPoi && (
        <div className={`p-5 rounded-2xl border flex items-start space-x-4 shadow-xs transition-all ${
          selectedPoi.status === 'approved' 
            ? 'bg-green-50/70 border-green-200 text-green-900' 
            : selectedPoi.status === 'pending'
            ? 'bg-yellow-50/70 border-yellow-200 text-yellow-900'
            : selectedPoi.status === 'correction'
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-red-50/70 border-red-200 text-red-900'
        }`}>
          {selectedPoi.status === 'approved' && (
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          {selectedPoi.status === 'pending' && (
            <Clock className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          )}
          {selectedPoi.status === 'correction' && (
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
          )}
          {selectedPoi.status === 'rejected' && (
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          )}

          <div className="text-xs space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-sm">
                Estado de <span className="underline decoration-2">{selectedPoi.name}</span>:{' '}
                <span className="uppercase tracking-wider font-extrabold">
                  {selectedPoi.status === 'approved' && 'Aprobado y Publicado'}
                  {selectedPoi.status === 'pending' && 'Pendiente de Validación'}
                  {selectedPoi.status === 'correction' && 'Requiere Correcciones'}
                  {selectedPoi.status === 'rejected' && 'Rechazado'}
                </span>
              </p>
              <Link
                href="/provider/business"
                className="inline-flex items-center space-x-1 font-bold text-fillPrimary hover:underline"
              >
                <span>Editar Ficha</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {selectedPoi.status === 'approved' && (
              <p className="text-green-800">
                Tu establecimiento se encuentra verificado por el administrador y activo en la plataforma turística ANDO.
              </p>
            )}
            {selectedPoi.status === 'pending' && (
              <p className="text-yellow-800">
                Un administrador está revisando las imágenes y datos comerciales de tu local. Te notificaremos al finalizar la auditoría.
              </p>
            )}
            {selectedPoi.status === 'correction' && (
              <div className="space-y-1.5 pt-1">
                <p className="font-semibold text-amber-900">Observaciones del Administrador:</p>
                <div className="bg-white/80 p-3 rounded-lg border border-amber-300 font-medium text-amber-900">
                  {selectedPoi.feedback || 'Por favor revisa y actualiza la información del local.'}
                </div>
              </div>
            )}
            {selectedPoi.status === 'rejected' && (
              <div className="space-y-1.5 pt-1">
                <p className="font-semibold text-red-900">Motivo del Rechazo:</p>
                <div className="bg-white/80 p-3 rounded-lg border border-red-300 font-medium text-red-900">
                  {selectedPoi.feedback || 'El contenido no cumple con los requisitos del sistema.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real Per-Business Metrics Grid */}
      {selectedPoi && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Métrica 1: Clics / Interacciones */}
          <div className="bg-white rounded-xl p-5 border border-black/5 shadow-xs hover:shadow-md transition-shadow flex items-center space-x-4">
            <div className="p-3 bg-fillPrimary/10 text-fillPrimary rounded-xl">
              <MousePointerClick className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-textDark/50 uppercase tracking-wider">Clics / Vistas</p>
              <h4 className="text-2xl font-bold text-textDark">
                {(selectedPoi.clicksCount || 0).toLocaleString()}{' '}
                <span className="text-xs font-normal text-textDark/40">interacciones</span>
              </h4>
            </div>
          </div>

          {/* Métrica 2: Rating Promedio y Reseñas */}
          <div className="bg-white rounded-xl p-5 border border-black/5 shadow-xs hover:shadow-md transition-shadow flex items-center space-x-4">
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-textDark/50 uppercase tracking-wider">Calificación Promedio</p>
              {selectedReviews.length > 0 ? (
                <h4 className="text-2xl font-bold text-textDark">
                  {(selectedReviews.reduce((acc, r) => acc + r.rating, 0) / selectedReviews.length).toFixed(1)}{' '}
                  <span className="text-xs font-normal text-textDark/40">
                    ({selectedReviews.length} reseña{selectedReviews.length !== 1 ? 's' : ''})
                  </span>
                </h4>
              ) : (
                <h4 className="text-sm font-bold text-textDark/50 mt-1">Sin reseñas</h4>
              )}
            </div>
          </div>

          {/* Métrica 3: Galería Multimedia */}
          <div className="bg-white rounded-xl p-5 border border-black/5 shadow-xs hover:shadow-md transition-shadow flex items-center space-x-4">
            <div className="p-3 bg-accentWine/10 text-accentWine rounded-xl">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-textDark/50 uppercase tracking-wider">Galería de Fotos</p>
              <h4 className="text-2xl font-bold text-textDark">
                {selectedPoi.images?.length || 0}{' '}
                <span className="text-xs font-normal text-textDark/40">/ {generalParams.maxImagesPerPOI} máx</span>
              </h4>
            </div>
          </div>

          {/* Métrica 4: Completitud del Perfil */}
          <div className="bg-white rounded-xl p-5 border border-black/5 shadow-xs hover:shadow-md transition-shadow flex items-center space-x-4">
            <div className="p-3 bg-accentPurple/10 text-accentPurple rounded-xl">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-textDark/50 uppercase tracking-wider">Completitud Perfil</p>
              <h4 className="text-2xl font-bold text-textDark">{completenessScore}%</h4>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Details + Reviews Section */}
      {selectedPoi && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Detailed View & Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ficha Comercial */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <div>
                  <h4 className="font-wixDisplay text-lg font-bold text-textDark">
                    Ficha Comercial: {selectedPoi.name}
                  </h4>
                  <p className="text-xs text-textDark/60">
                    Información pública visible para turistas en ANDO.
                  </p>
                </div>
                <span className="bg-accentWine/10 text-accentWine px-3 py-1 rounded-full text-xs font-bold">
                  {selectedPoi.category}
                </span>
              </div>

              {/* Cover Image */}
              <div className="relative h-56 w-full rounded-xl overflow-hidden bg-bgPrimary border border-black/5">
                {selectedPoi.images && selectedPoi.images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedPoi.images[0]}
                    alt={selectedPoi.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-textDark/40 space-y-2">
                    <ImageIcon className="h-10 w-10 text-textDark/20" />
                    <span className="text-xs">Sin fotos de portada cargadas.</span>
                  </div>
                )}
              </div>

              {/* Details List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-bgPrimary/50 p-4 rounded-xl border border-black/5 space-y-2">
                  <span className="font-bold text-textDark/70 uppercase tracking-wider block">Ubicación y Dirección</span>
                  <p className="flex items-start text-textDark font-medium">
                    <MapPin className="h-4 w-4 mr-1.5 text-fillPrimary flex-shrink-0 mt-0.5" />
                    <span>{selectedPoi.address || 'Sin dirección especificada'}</span>
                  </p>
                  <p className="text-[11px] text-textDark/50">
                    GPS: Lat {selectedPoi.location?.lat}, Lng {selectedPoi.location?.lng}
                  </p>
                </div>

                <div className="bg-bgPrimary/50 p-4 rounded-xl border border-black/5 space-y-2">
                  <span className="font-bold text-textDark/70 uppercase tracking-wider block">Contacto Comercial</span>
                  {selectedPoi.phone && (
                    <p className="flex items-center text-textDark font-medium">
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-fillPrimary flex-shrink-0" />
                      <span>{selectedPoi.phone}</span>
                    </p>
                  )}
                  {selectedPoi.email && (
                    <p className="flex items-center text-textDark font-medium">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-fillPrimary flex-shrink-0" />
                      <span>{selectedPoi.email}</span>
                    </p>
                  )}
                  {!selectedPoi.phone && !selectedPoi.email && (
                    <p className="text-textDark/50">Sin datos de contacto cargados</p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 border-t border-black/5 pt-4">
                <span className="font-bold text-xs text-textDark/70 uppercase tracking-wider block">Descripción Pública</span>
                <p className="text-xs text-textDark/80 leading-relaxed bg-bgPrimary/30 p-4 rounded-xl border border-black/5">
                  {selectedPoi.description || 'Sin descripción detallada cargada.'}
                </p>
              </div>

              {/* Schedules Overview */}
              <div className="space-y-3 border-t border-black/5 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-textDark/70 uppercase tracking-wider flex items-center space-x-1.5">
                    <Calendar className="h-4 w-4 text-fillPrimary" />
                    <span>Horarios de Atención Configurados ({selectedSchedules.length})</span>
                  </span>
                  <Link
                    href="/provider/schedules"
                    className="text-xs font-bold text-fillPrimary hover:underline"
                  >
                    Gestionar Horarios →
                  </Link>
                </div>

                {selectedSchedules.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedSchedules.map((sch) => (
                      <div key={sch.id} className="p-3 bg-bgPrimary/60 rounded-xl border border-black/5 text-xs space-y-1">
                        <div className="font-bold text-fillPrimary flex items-center justify-between">
                          <span>
                            {sch.daysOfWeek.map((d) => ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d]).join(', ')}
                          </span>
                          <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-black/10 text-textDark/70 font-semibold">
                            {sch.season === 'all' ? 'Todo el año' : sch.season}
                          </span>
                        </div>
                        <p className="text-textDark/80">
                          {sch.timeRanges.map((tr) => `${tr.start} a ${tr.end} h`).join(' | ')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span>Este negocio aún no posee reglas horarias asociadas.</span>
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN DE RESEÑAS Y OPINIONES DE TURISTAS */}
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-black/5 pb-4">
                <div>
                  <h4 className="font-wixDisplay text-lg font-bold text-textDark flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-fillPrimary" />
                    <span>Reseñas y Opiniones de Turistas</span>
                  </h4>
                  <p className="text-xs text-textDark/60 mt-0.5">
                    Opiniones públicas dejadas por visitantes para <strong className="text-textDark font-bold">{selectedPoi.name}</strong>.
                  </p>
                </div>
                <div className="flex items-center space-x-1.5 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full border border-yellow-200 text-xs font-bold">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>
                    {selectedReviews.length > 0
                      ? `${(selectedReviews.reduce((acc, r) => acc + r.rating, 0) / selectedReviews.length).toFixed(1)} / 5.0`
                      : 'Sin reseñas'}
                  </span>
                </div>
              </div>

              {selectedReviews.length > 0 ? (
                <div className="space-y-4">
                  {selectedReviews.map((rev) => (
                    <div key={rev.id} className="p-4 bg-bgPrimary/40 rounded-xl border border-black/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="h-8 w-8 bg-fillPrimary/10 text-fillPrimary rounded-full flex items-center justify-center font-bold text-xs border border-fillPrimary/20">
                            <UserIcon className="h-4 w-4 text-fillPrimary" />
                          </div>
                          <div>
                            <h5 className="font-bold text-xs text-textDark">{rev.userName}</h5>
                            <span className="text-[10px] text-textDark/50">{rev.date}</span>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center space-x-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= rev.rating 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-black/10'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-textDark/80 leading-relaxed pl-1">
                        &quot;{rev.comment}&quot;
                      </p>

                      {/* Reply from Provider if exists */}
                      {rev.reply ? (
                        <div className="ml-4 pl-3 border-l-2 border-fillPrimary bg-white p-3 rounded-r-xl text-xs space-y-1 border border-black/5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-fillPrimary flex items-center space-x-1">
                              <Store className="h-3.5 w-3.5 text-fillPrimary" />
                              <span>Respuesta de {rev.reply.authorName || selectedPoi.name}</span>
                            </span>
                            <span className="text-[10px] text-textDark/40">{rev.reply.date}</span>
                          </div>
                          <p className="text-textDark/80 italic">{rev.reply.comment}</p>
                        </div>
                      ) : (
                        <div>
                          {replyingToReviewId === rev.id ? (
                            <div className="mt-2 space-y-2 bg-white p-3 rounded-xl border border-black/10">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Escribe tu respuesta pública como ${selectedPoi.name}...`}
                                rows={2}
                                className="w-full text-xs p-2.5 rounded-lg border border-black/10 focus:outline-none focus:ring-2 focus:ring-fillPrimary"
                              />
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setReplyingToReviewId(null)}
                                  className="px-3 py-1 text-xs text-textDark/70 hover:text-textDark font-semibold cursor-pointer"
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSendReply(rev.id)}
                                  className="px-3 py-1 bg-fillPrimary text-white rounded-lg text-xs font-bold hover:bg-fillPrimary/90 inline-flex items-center space-x-1 cursor-pointer"
                                >
                                  <Send className="h-3 w-3" />
                                  <span>Publicar Respuesta</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingToReviewId(rev.id);
                                setReplyText('');
                              }}
                              className="text-xs font-bold text-fillPrimary hover:underline inline-flex items-center space-x-1 pt-1 cursor-pointer"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>Responder como prestador</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 bg-bgPrimary/30 rounded-xl border border-black/5 text-center space-y-2">
                  <MessageSquare className="h-8 w-8 text-textDark/20 mx-auto" />
                  <p className="text-xs font-bold text-textDark/60">Aún no hay reseñas registradas para este negocio</p>
                  <p className="text-[11px] text-textDark/40">Las opiniones dejadas por turistas en la app móvil aparecerán aquí.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Direct Business Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs space-y-4">
              <h4 className="font-wixDisplay text-xs font-bold text-textDark uppercase tracking-wider flex items-center space-x-2">
                <Store className="h-4 w-4 text-fillPrimary" />
                <span>Acciones Directas: {selectedPoi.name}</span>
              </h4>
              
              <div className="space-y-3">
                <Link 
                  href="/provider/business" 
                  className="w-full py-3 px-4 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs transition-all shadow-xs flex items-center justify-between cursor-pointer"
                >
                  <span>Actualizar Fotos o Información</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link 
                  href="/provider/schedules" 
                  className="w-full py-3 px-4 bg-bgPrimary hover:bg-black/5 border border-black/10 text-textDark font-bold rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Modificar Horarios de Atención</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>

                <Link 
                  href="/provider/business" 
                  className="w-full py-3 px-4 bg-white hover:bg-black/5 border border-black/10 text-textDark/80 font-semibold rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer"
                >
                  <span>Registrar Nuevo Negocio</span>
                  <Store className="h-4 w-4 text-fillPrimary" />
                </Link>
              </div>
            </div>

            {/* Validation Policy Notice */}
            <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-xs space-y-3">
              <h4 className="font-wixDisplay text-xs font-bold text-textDark uppercase tracking-wider">Políticas de Moderación</h4>
              <div className="space-y-2 text-xs text-textDark/75 leading-relaxed">
                <p>1. **Aprobación de Cambios:** Cualquier modificación a la descripción, fotos o datos de ubicación pasará a estado <em>Pendiente de Validación</em> hasta ser aprobada por el administrador.</p>
                <p>2. **Consistencia de Horarios:** La hora de cierre debe ser siempre posterior a la hora de apertura.</p>
                <p>3. **Imágenes Permitidas:** Las imágenes deben ser representativas del establecimiento y en formato JPG, PNG o WEBP (máx. 30 MB por archivo).</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
