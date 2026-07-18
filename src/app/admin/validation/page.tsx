'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { POI, User } from '@/types';
import {
  Check,
  X,
  MapPin,
  Tag,
  Eye,
  MessageSquare,
  Trash2,
  AlertCircle,
  User as UserIcon,
  Phone,
  Mail,
  Briefcase,
  FileText,
  CheckSquare,
  ShieldCheck,
  Power
} from 'lucide-react';

export default function ContentValidation() {
  const { 
    pois, 
    approvePOI, 
    rejectPOI, 
    requestCorrectionPOI, 
    deletePOIImage, 
    currentUser,
    users,
    updateProviderProfile
  } = useApp();

  // Active validation tab: 'content' for POIs, 'users' for GDU provider accounts
  const [activeSection, setActiveSection] = useState<'content' | 'users'>('content');

  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUserRejectModal, setShowUserRejectModal] = useState(false);

  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 1. DATA FILTERING
  // POI content validation data
  const pendingPois = pois.filter((poi) => poi.status === 'pending');
  const auditedPois = pois.filter((poi) => poi.status !== 'pending');

  // GDU provider registration validation data
  const pendingUsers = users.filter((u) => u.role === 'provider' && u.status === 'pending');
  const auditedUsers = users.filter((u) => u.role === 'provider' && u.status !== 'pending');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // 2. POI CONTENT HANDLERS
  const handleApprovePOI = (id: string, name: string) => {
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

  // 3. GDU USER (PROVIDER) VALIDATION HANDLERS
  const handleApproveUser = (id: string, name: string) => {
    const res = updateProviderProfile(id, { status: 'active' });
    if (res.success) {
      triggerToast(`La cuenta de "${name}" ha sido aprobada y activada.`);
    } else {
      triggerToast(res.error || 'No se pudo aprobar la cuenta.');
    }
  };

  const openUserRejectModal = (user: User) => {
    setSelectedUser(user);
    setShowUserRejectModal(true);
    setFeedbackText('');
    setFeedbackError(false);
  };

  const handleConfirmUserReject = () => {
    if (!feedbackText.trim()) {
      setFeedbackError(true);
      return;
    }

    if (selectedUser) {
      const res = updateProviderProfile(selectedUser.id, { status: 'inactive' });
      if (res.success) {
        setShowUserRejectModal(false);
        triggerToast(`Se rechazó el registro de "${selectedUser.name}" (CUIT: ${selectedUser.cuit}).`);
        setSelectedUser(null);
      } else {
        triggerToast(res.error || 'No se pudo procesar la solicitud.');
      }
    }
  };

  const handleToggleUserStatus = (id: string, name: string, currentStatus?: 'active' | 'pending' | 'inactive') => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const res = updateProviderProfile(id, { status: nextStatus });
    if (res.success) {
      triggerToast(`La cuenta de "${name}" ha sido ${nextStatus === 'active' ? 'reactivada' : 'desactivada'}.`);
    } else {
      triggerToast(res.error || 'No se pudo actualizar el estado.');
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
        <h3 className="font-wixDisplay text-2xl font-bold text-accentWine">Consola de Moderación y Auditoría</h3>
        <p className="text-sm text-textDark/60">
          Audita y valida las modificaciones de atractivos turísticos (GIT) y gestiona registros comerciales de nuevos socios prestadores (GDU).
        </p>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-black/5">
        <button
          onClick={() => setActiveSection('content')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeSection === 'content'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark hover:bg-black/5 rounded-t-lg'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>Validar Contenido (POIs)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeSection === 'content' ? 'bg-accentWine/10 text-accentWine' : 'bg-black/5 text-textDark/60'
          }`}>
            {pendingPois.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSection('users')}
          className={`flex items-center space-x-2 py-3 px-4 border-b-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
            activeSection === 'users'
              ? 'border-fillPrimary text-fillPrimary'
              : 'border-transparent text-textDark/60 hover:text-textDark hover:bg-black/5 rounded-t-lg'
          }`}
        >
          <UserIcon className="h-4 w-4" />
          <span>Validar Prestadores (GDU)</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            activeSection === 'users' ? 'bg-fillPrimary/10 text-fillPrimary' : 'bg-black/5 text-textDark/60'
          }`}>
            {pendingUsers.length}
          </span>
        </button>
      </div>

      {/* ==================== SECTION: CONTENT VALIDATION (POIs) ==================== */}
      {activeSection === 'content' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Pending POIs */}
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
                      <div className="flex md:flex-col items-center justify-end gap-2 self-end md:self-start flex-wrap">
                        <button
                          onClick={() => openDetailModal(poi)}
                          className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-bgPrimary hover:bg-black/5 text-textDark/80 rounded-lg text-xs font-bold transition-all border border-black/5 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Ver Detalle</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openCorrectionModal(poi)}
                            className="p-2 bg-amber-50 hover:bg-amber-100 border border-amber-250 text-amber-700 rounded-lg transition-colors cursor-pointer"
                            title="Solicitar Correcciones"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openRejectModal(poi)}
                            className="p-2 bg-red-50 hover:bg-red-100 border border-red-250 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Rechazar y Ocultar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleApprovePOI(poi.id, poi.name)}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all shadow-sm shadow-green-600/10 cursor-pointer"
                            title="Aprobar POI"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Historical / Audited POIs */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
              <h4 className="font-wixDisplay text-lg font-bold text-textDark mb-4 border-b border-black/5 pb-4">
                Historial de Auditoría
              </h4>

              {auditedPois.length === 0 ? (
                <p className="text-xs text-textDark/45 text-center py-6">No hay registros auditados aún.</p>
              ) : (
                <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                  {auditedPois.map((poi) => (
                    <div key={poi.id} className="p-3 bg-bgPrimary/40 border border-black/5 rounded-xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-textDark line-clamp-1">{poi.name}</span>
                        <span className="block text-[10px] text-textDark/55">{poi.category}</span>
                        {poi.feedback && (
                          <p className="text-[9px] text-accentWine bg-accentWine/5 px-2 py-0.5 rounded-md mt-1 italic line-clamp-1">
                            &quot;{poi.feedback}&quot;
                          </p>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {poi.status === 'approved' && (
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                            Aprobado
                          </span>
                        )}
                        {poi.status === 'rejected' && (
                          <span className="text-[10px] bg-red-50 text-red-600 border border-red-150 px-2 py-0.5 rounded-full font-bold">
                            Rechazado
                          </span>
                        )}
                        {poi.status === 'correction' && (
                          <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-150 px-2 py-0.5 rounded-full font-bold">
                            Corregir
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SECTION: PROVIDER USER VALIDATION (GDU) ==================== */}
      {activeSection === 'users' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Pending Provider Accounts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-4">
                <h4 className="font-wixDisplay text-lg font-bold text-textDark flex items-center space-x-2">
                  <span>Solicitudes de Prestadores Pendientes</span>
                  <span className="text-xs bg-fillPrimary/10 text-fillPrimary px-2.5 py-0.5 rounded-full font-bold">
                    {pendingUsers.length}
                  </span>
                </h4>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-textDark/60">No hay registros de prestadores pendientes de revisión.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="py-5 flex flex-col md:flex-row md:items-start justify-between gap-4 first:pt-0 last:pb-0">
                      
                      {/* Provider info card */}
                      <div className="flex items-start space-x-4">
                        {/* Avatar box */}
                        <div className="h-12 w-12 flex-shrink-0 rounded-full bg-fillPrimary/10 text-fillPrimary border border-fillPrimary/20 flex items-center justify-center font-bold text-base uppercase">
                          {user.name.slice(0, 2)}
                        </div>

                        {/* Details */}
                        <div className="space-y-1.5">
                          <h5 className="font-wixDisplay text-base font-bold text-textDark">
                            {user.name}
                          </h5>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-textDark/60">
                            <span className="flex items-center bg-black/5 text-textDark px-2 py-0.5 rounded-md font-semibold">
                              <Briefcase className="h-3 w-3 mr-1 text-textDark/50" />
                              {user.businessName || 'Empresa sin definir'}
                            </span>
                            <span className="flex items-center bg-accentWine/5 text-accentWine px-2 py-0.5 rounded-md font-bold">
                              <FileText className="h-3 w-3 mr-1 text-accentWine/55" />
                              CUIT: {user.cuit || 'S/D'}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-textDark/50 font-medium">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1.5" />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1.5" />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        <button
                          onClick={() => openUserRejectModal(user)}
                          className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Rechazar</span>
                        </button>
                        <button
                          onClick={() => handleApproveUser(user.id, user.name)}
                          className="px-3.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-green-600/10 hover:shadow-lg cursor-pointer flex items-center space-x-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Validar Acceso</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Historical Providers (Active/Inactive) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
              <h4 className="font-wixDisplay text-lg font-bold text-textDark mb-4 border-b border-black/5 pb-4">
                Socios Registrados (Historial GDU)
              </h4>

              {auditedUsers.length === 0 ? (
                <p className="text-xs text-textDark/45 text-center py-6">No hay prestadores validados en el sistema.</p>
              ) : (
                <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
                  {auditedUsers.map((user) => (
                    <div key={user.id} className="p-3 bg-bgPrimary/40 border border-black/5 rounded-xl flex items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="font-bold text-xs text-textDark block truncate max-w-[130px]" title={user.name}>
                          {user.name}
                        </span>
                        <span className="text-[10px] text-textDark/50 block truncate max-w-[130px]">
                          {user.businessName}
                        </span>
                        <span className="text-[9px] text-textDark/40 block font-mono">
                          CUIT: {user.cuit}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2.5 flex-shrink-0">
                        {user.status === 'active' ? (
                          <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                            Activo
                          </span>
                        ) : (
                          <span className="text-[9px] bg-red-50 text-red-600 border border-red-150 px-2 py-0.5 rounded-full font-bold">
                            Inactivo
                          </span>
                        )}

                        {/* Power Toggle Button */}
                        <button
                          onClick={() => handleToggleUserStatus(user.id, user.name, user.status)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            user.status === 'active'
                              ? 'bg-red-50 hover:bg-red-100 border-red-200 text-red-600'
                              : 'bg-green-50 hover:bg-green-100 border-green-200 text-green-700'
                          }`}
                          title={user.status === 'active' ? 'Desactivar Prestador' : 'Activar Prestador'}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Modal: Detail of a POI (US-GIT-07) */}
      {showDetailModal && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-2xl p-6 overflow-hidden transition-all transform scale-100 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 border-b border-black/5 pb-4 flex-shrink-0">
              <h4 className="font-wixDisplay text-lg font-bold text-accentWine">Detalle del Atractivo Turístico</h4>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50">Nombre</span>
                  <p className="text-sm font-semibold text-textDark mt-0.5">{selectedPoi.name}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50">Categoría</span>
                  <span className="inline-block text-xs bg-accentWine/5 text-accentWine px-2.5 py-0.5 rounded-md font-bold mt-1">
                    {selectedPoi.category}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50">Descripción</span>
                  <p className="text-xs text-textDark/80 leading-relaxed mt-1 bg-bgPrimary/40 p-3 rounded-xl border border-black/5">
                    {selectedPoi.description}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50">Ubicación Física</span>
                  <p className="text-xs text-textDark/80 mt-1 flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-fillPrimary flex-shrink-0" />
                    {selectedPoi.address}
                  </p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50">Coordenadas GPS</span>
                  <p className="text-xs text-textDark/60 mt-1 font-mono">
                    Lat: {selectedPoi.location.lat.toFixed(6)}, Lng: {selectedPoi.location.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              {/* Multimedia section */}
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50 mb-2">Multimedia Adjunta</span>
                {selectedPoi.images && selectedPoi.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {selectedPoi.images.map((imgUrl, index) => (
                      <div key={index} className="relative group aspect-video overflow-hidden rounded-xl border border-black/5 bg-bgPrimary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`POI ${index}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => handleDeleteImage(imgUrl)}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                          title="Eliminar Imagen"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-textDark/40 italic">El prestador no ha adjuntado imágenes para este POI.</p>
                )}
              </div>
            </div>

            {/* Modal actions */}
            {selectedPoi.status === 'pending' && (
              <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-black/5 mt-4 flex-shrink-0">
                <button
                  onClick={() => openCorrectionModal(selectedPoi)}
                  className="px-4 py-2 border border-black/10 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Solicitar Cambios
                </button>
                <button
                  onClick={() => openRejectModal(selectedPoi)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => handleApprovePOI(selectedPoi.id, selectedPoi.name)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md shadow-green-600/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Aprobar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: POI Rejection (US-GIT-07) */}
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
              <div className="p-3 bg-red-50 text-red-800 rounded-lg flex items-start space-x-2 border border-red-100">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
                <div className="text-xs">
                  <p className="font-bold">¿Seguro que desea rechazar el POI &quot;{selectedPoi.name}&quot;?</p>
                  <p className="mt-0.5">El prestador recibirá el comentario y el elemento no se mostrará en el catálogo.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Motivo de Rechazo (Obligatorio)
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value);
                    if (e.target.value.trim()) setFeedbackError(false);
                  }}
                  placeholder="Explica detalladamente por qué se rechaza la solicitud..."
                  className={`w-full px-4 py-3 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all duration-200 text-sm ${
                    feedbackError ? 'border-red-500 ring-1 ring-red-500' : 'border-black/10 focus:border-fillPrimary'
                  }`}
                />
                {feedbackError && (
                  <p className="text-red-600 text-xs font-semibold mt-1">El motivo del rechazo es obligatorio.</p>
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

      {/* Modal: POI Correction Request (US-GIT-07) */}
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

      {/* Modal: Provider User Rejection (GDU Rejection) */}
      {showUserRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-md p-6 overflow-hidden transition-all transform scale-100">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-wixDisplay text-lg font-bold text-accentWine">Rechazar Registro Comercial</h4>
              <button
                onClick={() => setShowUserRejectModal(false)}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-red-50 text-red-800 rounded-lg flex items-start space-x-2 border border-red-100">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
                <div className="text-xs">
                  <p className="font-bold">¿Seguro que desea rechazar al prestador &quot;{selectedUser.name}&quot;?</p>
                  <p className="mt-0.5">La cuenta pasará a estado Inactiva. El CUIT {selectedUser.cuit} no podrá autenticarse.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Motivo del Rechazo de Cuenta (Obligatorio)
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value);
                    if (e.target.value.trim()) setFeedbackError(false);
                  }}
                  placeholder="Indique las causas del rechazo de la cuenta (ej. CUIT inválido, Razón Social inexistente)..."
                  className={`w-full px-4 py-3 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all duration-200 text-sm ${
                    feedbackError ? 'border-red-500 ring-1 ring-red-500' : 'border-black/10 focus:border-fillPrimary'
                  }`}
                />
                {feedbackError && (
                  <p className="text-red-600 text-xs font-semibold mt-1">El motivo de rechazo de cuenta es obligatorio.</p>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowUserRejectModal(false)}
                  className="px-4 py-2 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUserReject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Confirmar Rechazo de Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
