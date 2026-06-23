'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { POI } from '@/types';
import {
  Check,
  X,
  MapPin,
  Tag,
  AlertTriangle,
  Eye,
  Sparkles,
  MessageSquare,
  Trash2,
  AlertCircle,
  XCircle
} from 'lucide-react';

export default function ContentValidation() {
  const { pois, approvePOI, rejectPOI, requestCorrectionPOI, deletePOIImage, currentUser } = useApp();
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Filtrar POIs pendientes e históricos
  const pendingPois = pois.filter((poi) => poi.status === 'pending');
  const auditedPois = pois.filter((poi) => poi.status !== 'pending');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleApprove = (id: string, name: string) => {
    const adminName = currentUser?.name || 'Sofía Romero';
    approvePOI(id, adminName);
    triggerToast(`"${name}" ha sido aprobado exitosamente.`);
    if (selectedPoi?.id === id) {
      setSelectedPoi(null);
      setShowDetailModal(false);
    }
  };

  const openRejectModal = (poi: POI) => {
    setSelectedPoi(poi);
    setShowRejectModal(true);
    setFeedbackText('');
    setFeedbackError(false);
  };

  const handleConfirmReject = () => {
    if (!feedbackText.trim()) {
      setFeedbackError(true);
      return;
    }

    if (selectedPoi) {
      const adminName = currentUser?.name || 'Sofía Romero';
      rejectPOI(selectedPoi.id, adminName, feedbackText.trim());
      setShowRejectModal(false);
      triggerToast(`Se rechazó "${selectedPoi.name}" y se envió feedback.`);
      setSelectedPoi(null);
      setShowDetailModal(false);
    }
  };

  const openCorrectionModal = (poi: POI) => {
    setSelectedPoi(poi);
    setShowCorrectionModal(true);
    setFeedbackText('');
    setFeedbackError(false);
  };

  const handleConfirmCorrection = () => {
    if (!feedbackText.trim()) {
      setFeedbackError(true);
      return;
    }

    if (selectedPoi) {
      const adminName = currentUser?.name || 'Sofía Romero';
      requestCorrectionPOI(selectedPoi.id, adminName, feedbackText.trim());
      setShowCorrectionModal(false);
      triggerToast(`Se solicitaron correcciones para "${selectedPoi.name}".`);
      setSelectedPoi(null);
      setShowDetailModal(false);
    }
  };

  const openDetailModal = (poi: POI) => {
    setSelectedPoi(poi);
    setShowDetailModal(true);
  };

  const handleDeleteImage = (imageUrl: string) => {
    if (selectedPoi) {
      if (confirm('¿Está seguro de que desea eliminar permanentemente esta imagen de las políticas del POI?')) {
        const adminName = currentUser?.name || 'Sofía Romero';
        deletePOIImage(selectedPoi.id, imageUrl, adminName);
        triggerToast('Imagen eliminada exitosamente');

        // Actualizar estado local para reflejar la eliminación inmediatamente en el modal
        setSelectedPoi((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            images: prev.images.filter((img) => img !== imageUrl),
          };
        });
      }
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 bg-accentWine text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 animate-slide-in">
          <Check className="h-4.5 w-4.5 text-fillSecondary flex-shrink-0" />
          <span className="text-xs font-semibold leading-normal">{toastMessage}</span>
        </div>
      )}

      {/* Overview Banner */}
      <div>
        <h3 className="font-wixDisplay text-2xl font-bold text-accentWine">Consola de Moderación (GIT)</h3>
        <p className="text-sm text-textDark/60">
          Audita y valida las modificaciones de atractivos turísticos, horarios y multimedia subida por los prestadores.
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
                    <div className="flex flex-wrap md:flex-col justify-end gap-2 min-w-[130px] flex-shrink-0">
                      <button
                        onClick={() => openDetailModal(poi)}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 border border-black/10 hover:bg-black/5 text-textDark/80 rounded-lg text-xs font-bold transition-all cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-fillSecondary" />
                        <span>Ver Detalle</span>
                      </button>
                      <button
                        onClick={() => handleApprove(poi.id, poi.name)}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-green-600/10"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Aprobar</span>
                      </button>
                      <button
                        onClick={() => openCorrectionModal(poi)}
                        className="flex-1 md:flex-none flex items-center justify-center space-x-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all cursor-pointer border border-amber-200"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Corregir</span>
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
              Las imágenes cargadas por los prestadores se comparan automáticamente contra las directivas de calidad de la plataforma. Las que presenten baja resolución serán marcadas con alertas visuales.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
            <h4 className="font-wixDisplay text-sm font-bold text-textDark uppercase tracking-wider mb-4 pb-2 border-b border-black/5">
              Auditorías Recientes ({auditedPois.length})
            </h4>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {auditedPois.map((poi) => (
                <div key={poi.id} className="p-3 bg-bgPrimary/60 border border-black/5 rounded-xl space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-semibold text-xs text-textDark truncate max-w-[130px]" title={poi.name}>
                      {poi.name}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      poi.status === 'approved'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : poi.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {poi.status === 'approved' ? 'Aprobado' : poi.status === 'rejected' ? 'Rechazado' : 'Corrección'}
                    </span>
                  </div>
                  {poi.feedback && (
                    <div className={`text-[11px] p-2 rounded-lg border flex items-start space-x-1.5 leading-relaxed ${
                      poi.status === 'rejected' ? 'text-red-600 bg-red-50/50 border-red-100' : 'text-amber-700 bg-amber-50/50 border-amber-100'
                    }`}>
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

      {/* POI Details modal (US-GIT-07 & US-GIT-11) */}
      {showDetailModal && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transition-all transform scale-100">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 border-b border-black/5 bg-bgPrimary/30">
              <div>
                <span className="text-[10px] font-bold uppercase bg-accentWine/10 text-accentWine px-2.5 py-0.5 rounded-full mb-1 inline-block">
                  Detalles del Punto de Interés
                </span>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">{selectedPoi.name}</h4>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPoi(null);
                }}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Categorías & Ubicación */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <span className="inline-flex items-center px-2.5 py-1 bg-accentPurple/10 text-accentPurple border border-accentPurple/10 rounded-md">
                  <Tag className="h-3.5 w-3.5 mr-1" />
                  {selectedPoi.category}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 bg-black/5 text-textDark/70 border border-black/5 rounded-md">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {selectedPoi.address}
                </span>
              </div>

              {/* Descripción */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50">Descripción</span>
                <p className="text-xs text-textDark/80 leading-relaxed bg-bgPrimary/40 p-3.5 border border-black/5 rounded-xl">
                  {selectedPoi.description}
                </p>
              </div>

              {/* R2 Multimedia Gallery Moderation (US-GIT-11) */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50">Galería de Imágenes</span>
                  <span className="text-[10px] text-textDark/40">Total: {selectedPoi.images?.length || 0} fotos</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {selectedPoi.images && selectedPoi.images.length > 0 ? (
                    selectedPoi.images.map((img, idx) => (
                      <div key={idx} className="group relative h-28 rounded-lg overflow-hidden border border-black/5 bg-bgPrimary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`${selectedPoi.name} view ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Overlay Moderation Delete Action */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => handleDeleteImage(img)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-transform hover:scale-110 cursor-pointer shadow-md"
                            title="Eliminar de la plataforma"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 border border-black/5 rounded-lg py-8 text-center text-textDark/30 text-xs flex flex-col items-center justify-center">
                      <AlertCircle className="h-5 w-5 mb-1" />
                      <span>No hay imágenes cargadas para este POI.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-bgPrimary/30 border-t border-black/5 flex justify-end space-x-2.5">
              <button
                onClick={() => openRejectModal(selectedPoi)}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-all border border-red-200 cursor-pointer"
              >
                Rechazar POI
              </button>
              <button
                onClick={() => openCorrectionModal(selectedPoi)}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-all border border-amber-200 cursor-pointer"
              >
                Solicitar Corrección
              </button>
              <button
                onClick={() => handleApprove(selectedPoi.id, selectedPoi.name)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Aprobar POI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-md p-6 overflow-hidden transition-all transform scale-100">
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
                  <p className="font-bold">¿Desea rechazar &quot;{selectedPoi.name}&quot;?</p>
                  <p className="mt-0.5">El prestador recibirá notificación con el motivo detallado.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Motivo de Rechazo (Feedback Obligatorio)
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value);
                    if (e.target.value.trim()) setFeedbackError(false);
                  }}
                  placeholder="Ej: La imagen de portada tiene marcas de agua o no corresponde al local..."
                  className={`w-full px-4 py-3 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all duration-200 text-sm ${
                    feedbackError ? 'border-red-500 ring-1 ring-red-500' : 'border-black/10 focus:border-fillPrimary'
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
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Correction Modal (US-GIT-07) */}
      {showCorrectionModal && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-md p-6 overflow-hidden transition-all transform scale-100">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-wixDisplay text-lg font-bold text-accentWine">Solicitar Correcciones</h4>
              <button
                onClick={() => setShowCorrectionModal(false)}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-amber-50 text-amber-800 rounded-lg flex items-start space-x-2 border border-amber-100">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="text-xs">
                  <p className="font-bold">¿Solicitar cambios para &quot;{selectedPoi.name}&quot;?</p>
                  <p className="mt-0.5">El prestador podrá editar el POI conservando sus borradores.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Observaciones y Correcciones Requeridas (Obligatorio)
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value);
                    if (e.target.value.trim()) setFeedbackError(false);
                  }}
                  placeholder="Ej: Por favor, modifique la descripción para corregir errores ortográficos..."
                  className={`w-full px-4 py-3 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all duration-200 text-sm ${
                    feedbackError ? 'border-red-500 ring-1 ring-red-500' : 'border-black/10 focus:border-fillPrimary'
                  }`}
                />
                {feedbackError && (
                  <p className="text-red-600 text-xs font-semibold mt-1">Las observaciones son obligatorias para solicitar cambios.</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowCorrectionModal(false)}
                  className="px-4 py-2 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCorrection}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Enviar Observaciones
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

