'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Star, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  Filter, 
  Calendar, 
  User, 
  Store, 
  AlertCircle, 
  Clock, 
  CornerDownRight, 
  Sparkles,
  Search,
  Check,
  X
} from 'lucide-react';

export default function ProviderReviewsPage() {
  const { 
    pois, 
    providerReviews, 
    loadProviderReviews, 
    replyToReview, 
    currentUser 
  } = useApp();

  const [selectedPoiId, setSelectedPoiId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'answered'>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Cargar reseñas reales del prestador al montar
  useEffect(() => {
    loadProviderReviews();
  }, []);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Filtrado de reseñas
  const filteredReviews = providerReviews.filter((r) => {
    const matchesPoi = selectedPoiId === 'all' || r.poiId === selectedPoiId;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && r.status === 'pendiente de respuesta') ||
      (statusFilter === 'answered' && r.status === 'respondida');
    const matchesRating = ratingFilter === 'all' || r.rating === ratingFilter;
    const matchesSearch = 
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.poiName && r.poiName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPoi && matchesStatus && matchesRating && matchesSearch;
  });

  const pendingCount = providerReviews.filter((r) => r.status === 'pendiente de respuesta').length;
  const answeredCount = providerReviews.filter((r) => r.status === 'respondida').length;

  const handleStartReply = (reviewId: string) => {
    setReplyingReviewId(reviewId);
    setReplyText('');
  };

  const handleCancelReply = () => {
    setReplyingReviewId(null);
    setReplyText('');
  };

  const handleSendReply = async (reviewId: string) => {
    if (!replyText.trim() || replyText.length > 1000 || isSubmitting) return;

    setIsSubmitting(true);
    const res = await replyToReview(reviewId, replyText.trim());

    if (res.success) {
      triggerToast('Tu respuesta se ha publicado correctamente.');
      setReplyingReviewId(null);
      setReplyText('');
    } else {
      triggerToast(res.error || 'No se pudo publicar la respuesta.', 'error');
    }
    setIsSubmitting(false);
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

      {/* Overview Banner */}
      <div className="bg-gradient-to-br from-fillPrimary/10 via-fillPrimary/5 to-transparent border border-fillPrimary/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-fillPrimary/10 border border-fillPrimary/20 px-3 py-1 rounded-full text-xs font-bold text-fillPrimary">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Gestión de Experiencias y Opiniones (US-CYN-07)</span>
            </div>
            <h2 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
              Reseñas y valoraciones de tu negocio
            </h2>
            <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
              Interactuá con la comunidad de turistas, agradecé sus valoraciones y brindá soporte ante cualquier comentario sobre tus atractivos turísticos.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-black/5 p-4 text-center min-w-[110px] shadow-xs">
              <span className="block text-2xl font-black text-amber-600 font-wixDisplay">{pendingCount}</span>
              <span className="text-[11px] font-bold text-textDark/60">Por responder</span>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 p-4 text-center min-w-[110px] shadow-xs">
              <span className="block text-2xl font-black text-green-600 font-wixDisplay">{answeredCount}</span>
              <span className="text-[11px] font-bold text-textDark/60">Respondidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Selector POI */}
          <div>
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Establecimiento</label>
            <select
              value={selectedPoiId}
              onChange={(e) => setSelectedPoiId(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
            >
              <option value="all">Todos mis establecimientos</option>
              {pois.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Selector Estado */}
          <div>
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Estado de respuesta</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
            >
              <option value="all">Todas las reseñas</option>
              <option value="pending">Pendientes de responder ({pendingCount})</option>
              <option value="answered">Respondidas ({answeredCount})</option>
            </select>
          </div>

          {/* Selector Calificación */}
          <div>
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Puntuación</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
            >
              <option value="all">Todas las estrellas (1 - 5)</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 estrellas)</option>
              <option value="4">⭐⭐⭐⭐ (4 estrellas)</option>
              <option value="3">⭐⭐⭐ (3 estrellas)</option>
              <option value="2">⭐⭐ (2 estrellas)</option>
              <option value="1">⭐ (1 estrella)</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por turista o texto..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Review Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-bgPrimary text-textDark/40">
              <MessageSquare className="h-7 w-7" />
            </div>
            <h4 className="font-wixDisplay text-lg font-bold text-textDark">No hay reseñas para mostrar</h4>
            <p className="text-xs text-textDark/60 max-w-sm mx-auto">
              No se encontraron opiniones que coincidan con los filtros seleccionados o tus establecimientos aún no han recibido valoraciones.
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => {
            const isReplying = replyingReviewId === review.id;
            const hasReply = !!review.response || review.status === 'respondida';

            return (
              <div key={review.id} className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4 transition-all">
                {/* Review Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-fillPrimary/10 text-fillPrimary border border-fillPrimary/20 flex items-center justify-center font-bold text-sm">
                      {review.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-textDark">{review.userName}</h4>
                      <p className="text-[11px] text-textDark/60 flex items-center gap-1.5">
                        <Store className="h-3 w-3 text-fillSecondary" />
                        <span className="font-semibold text-textDark/80">{review.poiName}</span>
                        <span>•</span>
                        <Calendar className="h-3 w-3" />
                        <span>{review.date}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Stars */}
                    <div className="flex items-center space-x-0.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-black/20'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-900 ml-1">{review.rating}.0</span>
                    </div>

                    {/* Status Badge */}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      hasReply 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                    }`}>
                      {hasReply ? 'Respondida' : 'Pendiente de responder'}
                    </span>
                  </div>
                </div>

                {/* Review Body */}
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-textDark/80 leading-relaxed">
                    {review.comment || <span className="italic text-textDark/40">Sin comentario escrito.</span>}
                  </p>

                  {/* Photos */}
                  {review.images && review.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {review.images.map((img, idx) => (
                        <div key={idx} className="h-20 w-20 rounded-xl overflow-hidden border border-black/10 bg-bgPrimary">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="Foto turista" className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Provider Existing Reply */}
                {hasReply && (
                  <div className="ml-4 sm:ml-8 mt-3 p-4 rounded-2xl bg-fillPrimary/5 border-l-4 border-fillPrimary space-y-1.5 animate-fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-fillPrimary flex items-center">
                        <CornerDownRight className="h-3.5 w-3.5 mr-1" />
                        Respuesta del propietario ({review.response?.authorName || currentUser?.businessName || currentUser?.name || 'Prestador'})
                      </span>
                      <span className="text-[10px] text-textDark/50">
                        {review.response?.fechaCreacion ? review.response.fechaCreacion.split('T')[0] : review.date}
                      </span>
                    </div>
                    <p className="text-xs text-textDark/80 leading-relaxed pl-4">
                      {review.response?.comentario || 'Tu respuesta pública ha sido registrada en el sistema.'}
                    </p>
                  </div>
                )}

                {/* Reply Form Trigger & Form */}
                {!hasReply && !isReplying && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleStartReply(review.id)}
                      className="px-4 py-2 bg-fillPrimary/10 hover:bg-fillPrimary/20 text-fillPrimary rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Responder a este turista</span>
                    </button>
                  </div>
                )}

                {isReplying && (
                  <div className="mt-3 p-4 rounded-2xl bg-bgPrimary/50 border border-black/5 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-textDark flex items-center">
                        <CornerDownRight className="h-3.5 w-3.5 mr-1 text-fillPrimary" />
                        Redactar respuesta pública
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        replyText.length > 900 ? 'text-amber-600' : 'text-textDark/50'
                      }`}>
                        {replyText.length} / 1000 caracteres
                      </span>
                    </div>

                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value.slice(0, 1000))}
                      placeholder="Escribí una respuesta profesional y agradecé la visita del turista..."
                      rows={3}
                      className="w-full p-3 rounded-xl bg-white border border-black/10 text-xs text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-fillPrimary/20 focus:border-fillPrimary transition-all"
                    />

                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={handleCancelReply}
                        className="px-3.5 py-2 text-xs font-bold text-textDark/60 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendReply(review.id)}
                        disabled={!replyText.trim() || isSubmitting}
                        className="px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                      >
                        {isSubmitting ? (
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <Send className="h-3.5 w-3.5" />
                            <span>Publicar respuesta</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
