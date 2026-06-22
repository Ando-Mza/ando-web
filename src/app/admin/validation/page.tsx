'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { POI } from '@/types';
import { 
  Check, 
  X, 
  MapPin, 
  Tag, 
  User as UserIcon, 
  AlertTriangle, 
  Eye, 
  ChevronRight,
  Sparkles,
  MessageSquare
} from 'lucide-react';

export default function ContentValidation() {
  const { pois, approvePOI, rejectPOI, currentUser } = useApp();
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);

  // Filtrar POIs pendientes e históricos
  const pendingPois = pois.filter((poi) => poi.status === 'pending');
  const auditedPois = pois.filter((poi) => poi.status !== 'pending');

  const handleApprove = (id: string, name: string) => {
    const adminName = currentUser?.name || 'Sofía Romero';
    approvePOI(id, adminName);
    // Alert simplificado en UI
    if (selectedPoi?.id === id) {
      setSelectedPoi(null);
    }
  };

  const openRejectModal = (poi: POI) => {
    setSelectedPoi(poi);
    setShowRejectModal(true);
    setRejectFeedback('');
    setFeedbackError(false);
  };

  const handleConfirmReject = () => {
    if (!rejectFeedback.trim()) {
      setFeedbackError(true);
      return;
    }
    
    if (selectedPoi) {
      const adminName = currentUser?.name || 'Sofía Romero';
      rejectPOI(selectedPoi.id, adminName, rejectFeedback);
      setShowRejectModal(false);
      setSelectedPoi(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div>
        <h3 className="font-wixDisplay text-2xl font-bold text-accentWine">Consola de Moderación (GIT)</h3>
        <p className="text-sm text-textDark/60">
          Audita y valida las modificaciones de información comercial e imágenes subidas por los prestadores a Cloudflare R2.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column(s): Pending items list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-4">
              <h4 className="font-wixDisplay text-lg font-bold text-textDark flex items-center space-x-2">
                <span>Solicitudes Pendientes</span>
                <span className="text-xs bg-fillPrimary/10 text-fillPrimary px-2.5 py-0.5 rounded-full font-bold">
                  {pendingPois.length}
                </span>
              </h4>
            </div>

            {pendingPois.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Check className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-textDark/60">¡Excelente! No quedan solicitudes pendientes de revisión.</p>
              </div>
            ) : (
              <div className="divide-y divide-black/5">
                {pendingPois.map((poi) => (
                  <div key={poi.id} className="py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      {/* POI Thumbnail */}
                      <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-bgPrimary border border-black/5">
                        {poi.images && poi.images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={poi.images[0]}
                            alt={poi.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-textDark/30 text-xs">
                            Sin Foto
                          </div>
                        )}
                      </div>

                      {/* POI Details */}
                      <div className="space-y-1">
                        <h5 className="font-wixDisplay text-base font-bold text-textDark">{poi.name}</h5>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-textDark/60">
                          <span className="inline-flex items-center bg-accentWine/5 text-accentWine px-2 py-0.5 rounded-md font-semibold">
                            <Tag className="h-3 w-3 mr-1" />
                            {poi.category}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {poi.address}
                          </span>
                        </div>
                        <p className="text-xs text-textDark/70 line-clamp-2 max-w-lg mt-1.5 leading-relaxed">
                          {poi.description}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex md:flex-col justify-end gap-2.5 min-w-[130px] flex-shrink-0">
                      <button
                        onClick={() => handleApprove(poi.id, poi.name)}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-green-600/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => openRejectModal(poi)}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all cursor-pointer border border-red-200"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Moderation History list */}
        <div className="space-y-6">
          {/* AI Helper Panel */}
          <div className="bg-gradient-to-br from-accentWine/5 to-accentPurple/5 rounded-2xl border border-accentWine/10 p-5 space-y-3">
            <div className="flex items-center space-x-2 text-accentWine font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-fillSecondary" />
              <span>Ayuda IA Moderación</span>
            </div>
            <p className="text-xs text-textDark/70 leading-relaxed">
              Las imágenes cargadas por los prestadores se comparan con los términos de uso. No se detectó contenido ofensivo ni de baja resolución en los pendientes actuales.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
            <h4 className="font-wixDisplay text-sm font-bold text-textDark uppercase tracking-wider mb-4 pb-2 border-b border-black/5">
              Auditorías Recientes ({auditedPois.length})
            </h4>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {auditedPois.map((poi) => (
                <div key={poi.id} className="p-3 bg-bgPrimary/60 border border-black/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-xs text-textDark truncate max-w-[130px]" title={poi.name}>
                      {poi.name}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      poi.status === 'approved' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {poi.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </div>
                  {poi.status === 'rejected' && poi.feedback && (
                    <div className="text-[11px] text-red-600 bg-red-50/50 p-2 rounded-lg border border-red-100 flex items-start space-x-1.5 leading-relaxed">
                      <MessageSquare className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <span>{poi.feedback}</span>
                    </div>
                  )}
                  <p className="text-[10px] text-textDark/40 text-right">
                    Actualizado: {new Date(poi.updatedAt).toLocaleDateString('es-AR')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Feedback Modal (US-GIT-07) */}
      {showRejectModal && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div 
            className={`bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-md p-6 overflow-hidden transition-all transform scale-100 ${
              feedbackError ? 'animate-bounce' : ''
            }`}
            style={feedbackError ? { animation: 'shake 0.4s ease-in-out' } : {}}
          >
            {feedbackError && (
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                  20%, 40%, 60%, 80% { transform: translateX(6px); }
                }
              `}} />
            )}

            <div className="flex justify-between items-start mb-4">
              <h4 className="font-wixDisplay text-lg font-bold text-accentWine">Rechazar Publicación</h4>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start space-x-2 border border-red-100">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">¿Desea rechazar "{selectedPoi.name}"?</p>
                  <p className="mt-0.5">El prestador recibirá notificación inmediata con el motivo redactado.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Motivo de Rechazo (Feedback Obligatorio)
                </label>
                <textarea
                  required
                  rows={4}
                  value={rejectFeedback}
                  onChange={(e) => {
                    setRejectFeedback(e.target.value);
                    if (e.target.value.trim()) setFeedbackError(false);
                  }}
                  placeholder="Ej: La imagen de portada no corresponde con el establecimiento o tiene marcas de agua de terceros..."
                  className={`w-full px-4 py-3 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all duration-200 text-sm ${
                    feedbackError ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500' : 'border-black/10 focus:border-fillPrimary'
                  }`}
                />
                {feedbackError && (
                  <p className="text-red-600 text-xs font-semibold mt-1">El motivo de rechazo es obligatorio para enviar feedback.</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-red-600/10"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
