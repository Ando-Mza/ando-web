'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { POI, User } from '@/types';
import {
  Check,
  X,
  MapPin,
  Eye,
  MessageSquare,
  AlertCircle,
  User as UserIcon,
  Phone,
  Mail,
  Briefcase,
  FileText,
  CheckSquare,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  List,
  Store,
  Clock,
  ChevronRight,
  AlertTriangle,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';

import { ADMIN_REJECT_PRESETS, ADMIN_CORRECTION_PRESETS } from '@/config/constants';

export default function ContentValidation() {
  const { 
    pois, 
    approvePOI, 
    rejectPOI, 
    requestCorrectionPOI, 
    deletePOIImage, 
    currentUser,
    users,
    updateProviderProfile,
    categories
  } = useApp();

  // Active validation tab: 'catalog' for all POIs, 'pending' for moderation queue, 'users' for provider accounts
  const [activeSection, setActiveSection] = useState<'catalog' | 'pending' | 'users'>('catalog');

  // Filtros para el catálogo general de POIs
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'correction' | 'rejected'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewLayout, setViewLayout] = useState<'grid' | 'table'>('grid');

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
  const pendingPois = useMemo(() => pois.filter((poi) => poi.status === 'pending' || poi.status === 'correction'), [pois]);
  const approvedPois = useMemo(() => pois.filter((poi) => poi.status === 'approved'), [pois]);
  const correctionPois = useMemo(() => pois.filter((poi) => poi.status === 'correction'), [pois]);
  const rejectedPois = useMemo(() => pois.filter((poi) => poi.status === 'rejected'), [pois]);

  const pendingUsers = useMemo(() => users.filter((u) => u.role === 'provider' && u.status === 'pending'), [users]);
  const auditedUsers = useMemo(() => users.filter((u) => u.role === 'provider' && u.status !== 'pending'), [users]);

  // Lista filtrada para la pestaña de Catálogo
  const filteredCatalogPois = useMemo(() => {
    return pois.filter((poi) => {
      // Filtro por estado
      if (statusFilter !== 'all' && poi.status !== statusFilter) return false;
      // Filtro por categoría
      if (categoryFilter !== 'all' && poi.category !== categoryFilter) return false;
      // Filtro por búsqueda
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = poi.name?.toLowerCase().includes(query);
        const matchDesc = poi.description?.toLowerCase().includes(query);
        const matchAddress = poi.address?.toLowerCase().includes(query);
        const matchCategory = poi.category?.toLowerCase().includes(query);
        if (!matchName && !matchDesc && !matchAddress && !matchCategory) return false;
      }
      return true;
    });
  }, [pois, statusFilter, categoryFilter, searchQuery]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // 2. POI CONTENT HANDLERS
  const handleApprovePOI = (id: string, name: string) => {
    const adminName = currentUser?.name || 'Administrador';
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
      const adminName = currentUser?.name || 'Administrador';
      rejectPOI(selectedPoi.id, adminName, feedbackText.trim());
      setShowRejectModal(false);
      triggerToast(`Se rechazó "${selectedPoi.name}" y se envió la justificación.`);
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
      const adminName = currentUser?.name || 'Administrador';
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
      if (confirm('¿Está seguro de que desea eliminar permanentemente esta imagen del POI?')) {
        const adminName = currentUser?.name || 'Administrador';
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
        <div className="fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 bg-accentWine text-white px-6 py-4 rounded-xl shadow-2xl border border-white/10 animate-slide-in">
          <Check className="h-5 w-5 text-white flex-shrink-0" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-wixDisplay text-2xl font-bold text-accentWine">Catálogo y Moderación de Atractivos</h3>
          <p className="text-sm text-textDark/70 mt-1">
            Explora todos los puntos de interés aprobados y publicados en Mendoza, audita nuevas propuestas y gestiona solicitudes de prestadores.
          </p>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="bg-bgPrimary/60 p-1.5 rounded-xl border border-black/10 inline-flex flex-wrap gap-1 shadow-2xs">
        {/* Tab 1: Catálogo Completo */}
        <button
          onClick={() => setActiveSection('catalog')}
          className={`flex items-center space-x-2 py-2.5 px-5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeSection === 'catalog'
              ? 'bg-white text-accentWine shadow-2xs border border-black/5'
              : 'text-textDark/70 hover:text-textDark hover:bg-black/5'
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Catálogo de Atractivos (Todos)</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
            activeSection === 'catalog' ? 'bg-accentWine/10 text-accentWine' : 'bg-black/5 text-textDark/70'
          }`}>
            {pois.length}
          </span>
        </button>

        {/* Tab 2: Consola de Moderación Pendientes */}
        <button
          onClick={() => setActiveSection('pending')}
          className={`flex items-center space-x-2 py-2.5 px-5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeSection === 'pending'
              ? 'bg-white text-accentWine shadow-2xs border border-black/5'
              : 'text-textDark/70 hover:text-textDark hover:bg-black/5'
          }`}
        >
          <CheckSquare className="h-4 w-4" />
          <span>Pendientes de Validación</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
            pendingPois.length > 0 
              ? 'bg-amber-200 text-amber-950 animate-pulse' 
              : activeSection === 'pending' ? 'bg-accentWine/10 text-accentWine' : 'bg-black/5 text-textDark/70'
          }`}>
            {pendingPois.length}
          </span>
        </button>

        {/* Tab 3: Validación de Prestadores */}
        <button
          onClick={() => setActiveSection('users')}
          className={`flex items-center space-x-2 py-2.5 px-5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeSection === 'users'
              ? 'bg-white text-accentWine shadow-2xs border border-black/5'
              : 'text-textDark/70 hover:text-textDark hover:bg-black/5'
          }`}
        >
          <UserIcon className="h-4 w-4" />
          <span>Validar Prestadores</span>
          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
            pendingUsers.length > 0
              ? 'bg-amber-200 text-amber-950 animate-pulse'
              : activeSection === 'users' ? 'bg-accentWine/10 text-accentWine' : 'bg-black/5 text-textDark/70'
          }`}>
            {pendingUsers.length}
          </span>
        </button>
      </div>

      {/* ==================== SECTION 1: FULL POI CATALOG ==================== */}
      {activeSection === 'catalog' && (
        <div className="space-y-6">
          {/* Filter Bar & Controls */}
          <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-xs space-y-4">
            {/* Status Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold text-textDark/60 mr-1 flex items-center space-x-1">
                <Filter className="h-3.5 w-3.5" />
                <span>Estado:</span>
              </span>

              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-accentWine text-white shadow-xs'
                    : 'bg-bgPrimary text-textDark/70 hover:bg-black/5'
                }`}
              >
                Todos ({pois.length})
              </button>

              <button
                onClick={() => setStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  statusFilter === 'approved'
                    ? 'bg-green-600 text-white shadow-xs'
                    : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                }`}
              >
                <Check className="h-3 w-3" />
                <span>Aprobados / Publicados ({approvedPois.length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  statusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                }`}
              >
                <Clock className="h-3 w-3" />
                <span>Pendientes ({pois.filter(p => p.status === 'pending').length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('correction')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  statusFilter === 'correction'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-orange-50 text-orange-900 hover:bg-orange-100 border border-orange-200'
                }`}
              >
                <AlertTriangle className="h-3 w-3" />
                <span>En Corrección ({correctionPois.length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('rejected')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  statusFilter === 'rejected'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <X className="h-3 w-3" />
                <span>Rechazados ({rejectedPois.length})</span>
              </button>
            </div>

            {/* Search, Category Selector & View Switcher */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-black/5">
              <div className="flex flex-1 items-center space-x-3 w-full">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-textDark/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, dirección o descripción..."
                    className="w-full pl-9 pr-4 py-2 bg-bgPrimary/50 border border-black/10 rounded-xl text-xs text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-textDark/40 hover:text-textDark font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="w-48 flex-shrink-0">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-bgPrimary/50 border border-black/10 rounded-xl text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine cursor-pointer"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* View Layout Toggle */}
              <div className="flex items-center space-x-1 bg-bgPrimary p-1 rounded-xl border border-black/5 flex-shrink-0">
                <button
                  onClick={() => setViewLayout('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewLayout === 'grid' ? 'bg-white shadow-2xs text-accentWine' : 'text-textDark/50 hover:text-textDark'
                  }`}
                  title="Vista en cuadrícula"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewLayout('table')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewLayout === 'table' ? 'bg-white shadow-2xs text-accentWine' : 'text-textDark/50 hover:text-textDark'
                  }`}
                  title="Vista en tabla"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* POI Catalog Content */}
          {filteredCatalogPois.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
              <Store className="h-10 w-10 text-textDark/20 mx-auto" />
              <h4 className="font-wixDisplay text-base font-bold text-textDark">No se encontraron atractivos</h4>
              <p className="text-xs text-textDark/60 max-w-sm mx-auto">
                No hay POIs que coincidan con los filtros seleccionados ({statusFilter !== 'all' ? `estado: ${statusFilter}` : 'todos los estados'}).
              </p>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setCategoryFilter('all');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-accentWine hover:underline cursor-pointer pt-2"
              >
                Limpiar todos los filtros
              </button>
            </div>
          ) : viewLayout === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalogPois.map((poi) => (
                <div
                  key={poi.id}
                  className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-xs hover:shadow-md hover:border-accentWine/20 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="relative h-44 w-full bg-bgPrimary overflow-hidden">
                      {poi.images && poi.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={poi.images[0]}
                          alt={poi.name}
                          className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-textDark/30 space-y-1">
                          <Store className="h-8 w-8" />
                          <span className="text-[11px] font-medium">Sin imagen de portada</span>
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${
                          poi.status === 'approved'
                            ? 'bg-green-600 text-white'
                            : poi.status === 'pending'
                            ? 'bg-amber-400 text-amber-950 font-black'
                            : poi.status === 'correction'
                            ? 'bg-orange-500 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {poi.status === 'approved' && 'Aprobado'}
                          {poi.status === 'pending' && 'Pendiente'}
                          {poi.status === 'correction' && 'En corrección'}
                          {poi.status === 'rejected' && 'Rechazado'}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold bg-white/90 backdrop-blur-xs text-textDark px-2.5 py-1 rounded-full shadow-sm border border-black/5">
                          {poi.category}
                        </span>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h4 className="font-wixDisplay text-base font-bold text-textDark group-hover:text-accentWine transition-colors line-clamp-1">
                          {poi.name}
                        </h4>
                        <p className="text-xs text-textDark/70 line-clamp-2 leading-relaxed mt-1">
                          {poi.description || 'Sin descripción disponible.'}
                        </p>
                      </div>

                      <div className="space-y-1.5 text-xs text-textDark/60 pt-1 border-t border-black/5">
                        <div className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1.5 text-fillPrimary flex-shrink-0" />
                          <span className="truncate">{poi.address || 'Mendoza, Argentina'}</span>
                        </div>
                        {poi.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3.5 w-3.5 mr-1.5 text-textDark/40 flex-shrink-0" />
                            <span>{poi.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-bgPrimary/40 border-t border-black/5 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openDetailModal(poi)}
                      className="px-3 py-2 bg-white hover:bg-black/5 text-textDark font-bold rounded-xl text-xs border border-black/10 transition-colors inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 text-textDark/60" />
                      <span>Ver Ficha</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      {poi.status !== 'approved' && (
                        <button
                          onClick={() => handleApprovePOI(poi.id, poi.name)}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1 cursor-pointer shadow-2xs"
                          title="Aprobar POI"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Aprobar</span>
                        </button>
                      )}
                      {poi.status !== 'rejected' && (
                        <button
                          onClick={() => openRejectModal(poi)}
                          className="p-2 text-red-700 hover:bg-red-50 border border-red-200 rounded-xl transition-colors cursor-pointer"
                          title="Rechazar POI"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 text-textDark/60 font-bold uppercase tracking-wider bg-bgPrimary/50">
                      <th className="py-3.5 px-4 font-bold">Atractivo / POI</th>
                      <th className="py-3.5 px-4 font-bold">Categoría</th>
                      <th className="py-3.5 px-4 font-bold">Estado</th>
                      <th className="py-3.5 px-4 font-bold">Ubicación</th>
                      <th className="py-3.5 px-4 font-bold">Fotos</th>
                      <th className="py-3.5 px-4 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredCatalogPois.map((poi) => (
                      <tr key={poi.id} className="hover:bg-bgPrimary/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-bgPrimary flex-shrink-0 border border-black/5">
                              {poi.images && poi.images.length > 0 ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={poi.images[0]} alt={poi.name} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex items-center justify-center h-full text-textDark/30">
                                  <Store className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-textDark text-sm">{poi.name}</p>
                              <p className="text-[11px] text-textDark/60 truncate max-w-xs">{poi.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-accentWine/10 text-accentWine font-bold px-2.5 py-0.5 rounded-full text-[11px]">
                            {poi.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            poi.status === 'approved'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : poi.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold'
                              : poi.status === 'correction'
                              ? 'bg-orange-50 text-orange-900 border-orange-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {poi.status === 'approved' && 'Aprobado'}
                            {poi.status === 'pending' && 'Pendiente'}
                            {poi.status === 'correction' && 'Corrección'}
                            {poi.status === 'rejected' && 'Rechazado'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-textDark/70 truncate max-w-xs">
                          {poi.address || 'Mendoza'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-textDark/70">
                          {poi.images?.length || 0} fotos
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              onClick={() => openDetailModal(poi)}
                              className="p-1.5 bg-bgPrimary hover:bg-black/5 text-textDark rounded-lg border border-black/10 transition-colors cursor-pointer"
                              title="Ver ficha completa"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            {poi.status !== 'approved' && (
                              <button
                                onClick={() => handleApprovePOI(poi.id, poi.name)}
                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg transition-colors cursor-pointer"
                                title="Aprobar"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            {poi.status !== 'rejected' && (
                              <button
                                onClick={() => openRejectModal(poi)}
                                className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                title="Rechazar"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== SECTION 2: PENDING POIS MODERATION QUEUE ==================== */}
      {activeSection === 'pending' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left 2 Columns: Pending POIs List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-4">
                <h4 className="font-wixDisplay text-lg font-bold text-textDark flex items-center space-x-2">
                  <span>Puntos de interés pendientes de moderación</span>
                  <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                    {pendingPois.length}
                  </span>
                </h4>
              </div>

              {pendingPois.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-textDark/70">No hay contenido de POIs pendiente de revisión.</p>
                  <p className="text-xs text-textDark/40">
                    Podés consultar todos los atractivos turísticos activos en la pestaña{' '}
                    <button onClick={() => setActiveSection('catalog')} className="text-accentWine underline font-bold cursor-pointer">
                      Catálogo de Atractivos
                    </button>.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {pendingPois.map((poi) => (
                    <div key={poi.id} className="py-5 flex flex-col md:flex-row md:items-start justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold bg-accentWine/10 text-accentWine px-2.5 py-0.5 rounded-md">
                            {poi.category}
                          </span>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                            poi.status === 'correction'
                              ? 'bg-orange-50 text-orange-800 border-orange-200'
                              : 'bg-amber-100 text-amber-900 border-amber-300'
                          }`}>
                            {poi.status === 'correction' ? 'Corrección solicitada' : 'Pendiente'}
                          </span>
                        </div>
                        
                        <h5 className="font-wixDisplay text-base font-bold text-textDark">{poi.name}</h5>
                        <p className="text-xs text-textDark/70 line-clamp-2 leading-relaxed">{poi.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs text-textDark/60 pt-1">
                          <span className="flex items-center font-medium">
                            <MapPin className="h-3.5 w-3.5 mr-1 text-fillPrimary flex-shrink-0" />
                            {poi.address}
                          </span>
                          {poi.email && (
                            <span className="flex items-center font-medium">
                              <Mail className="h-3.5 w-3.5 mr-1 text-textDark/50 flex-shrink-0" />
                              {poi.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        <button
                          onClick={() => openDetailModal(poi)}
                          className="p-2.5 bg-bgPrimary hover:bg-black/5 text-textDark/80 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
                          title="Ver detalle del POI"
                          aria-label={`Ver detalle de ${poi.name}`}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openCorrectionModal(poi)}
                          className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Solicitar corrección</span>
                        </button>
                        <button
                          onClick={() => openRejectModal(poi)}
                          className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Rechazar</span>
                        </button>
                        <button
                          onClick={() => handleApprovePOI(poi.id, poi.name)}
                          className="px-3.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer flex items-center space-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Aprobar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Historical Audited POIs */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-4">
                <h4 className="font-wixDisplay text-base font-bold text-textDark">
                  Atractivos Aprobados ({approvedPois.length})
                </h4>
                <button
                  onClick={() => {
                    setActiveSection('catalog');
                    setStatusFilter('approved');
                  }}
                  className="text-xs font-bold text-accentWine hover:underline cursor-pointer"
                >
                  Ver todos →
                </button>
              </div>

              {approvedPois.length === 0 ? (
                <p className="text-xs text-textDark/60 text-center py-6">No hay registros de POIs aprobados.</p>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {approvedPois.slice(0, 8).map((poi) => (
                    <div key={poi.id} className="p-3 bg-bgPrimary/40 border border-black/5 rounded-xl flex items-center justify-between gap-2">
                      <div className="space-y-0.5 max-w-[170px]">
                        <span className="font-bold text-xs text-textDark block truncate" title={poi.name}>
                          {poi.name}
                        </span>
                        <span className="text-[10px] font-bold text-accentWine block">
                          {poi.category}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold">
                          Aprobado
                        </span>
                        <button
                          onClick={() => openDetailModal(poi)}
                          className="p-1.5 text-textDark/60 hover:text-textDark hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                          title="Ver detalle"
                        >
                          <Eye className="h-3.5 w-3.5" />
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

      {/* ==================== SECTION 3: PROVIDER USER VALIDATION ==================== */}
      {activeSection === 'users' && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-4">
                <h4 className="font-wixDisplay text-lg font-bold text-textDark flex items-center space-x-2">
                  <span>Solicitudes de prestadores pendientes</span>
                  <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full font-bold">
                    {pendingUsers.length}
                  </span>
                </h4>
              </div>

              {pendingUsers.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-textDark/70">No hay registros de prestadores pendientes de revisión.</p>
                </div>
              ) : (
                <div className="divide-y divide-black/5">
                  {pendingUsers.map((u) => (
                    <div key={u.id} className="py-5 flex flex-col md:flex-row md:items-start justify-between gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold bg-fillPrimary/10 text-fillPrimary px-2.5 py-0.5 rounded-md">
                            Socio Prestador
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-amber-100 text-amber-900 border-amber-300">
                            Pendiente de verificación
                          </span>
                        </div>

                        <h5 className="font-wixDisplay text-base font-bold text-textDark">{u.name}</h5>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-textDark/80 pt-1">
                          {u.cuit && (
                            <span className="flex items-center font-medium bg-bgPrimary/60 px-2.5 py-1 rounded-md border border-black/5">
                              <FileText className="h-3.5 w-3.5 mr-1.5 text-accentWine flex-shrink-0" />
                              <span>CUIT: {u.cuit}</span>
                            </span>
                          )}
                          {u.businessName && (
                            <span className="flex items-center font-medium bg-bgPrimary/60 px-2.5 py-1 rounded-md border border-black/5">
                              <Briefcase className="h-3.5 w-3.5 mr-1.5 text-fillPrimary flex-shrink-0" />
                              <span>{u.businessName}</span>
                            </span>
                          )}
                          {u.email && (
                            <span className="flex items-center font-medium bg-bgPrimary/60 px-2.5 py-1 rounded-md border border-black/5">
                              <Mail className="h-3.5 w-3.5 mr-1.5 text-textDark/50 flex-shrink-0" />
                              <span>{u.email}</span>
                            </span>
                          )}
                          {u.phone && (
                            <span className="flex items-center font-medium bg-bgPrimary/60 px-2.5 py-1 rounded-md border border-black/5">
                              <Phone className="h-3.5 w-3.5 mr-1.5 text-textDark/50 flex-shrink-0" />
                              <span>{u.phone}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        <button
                          onClick={() => openUserRejectModal(u)}
                          className="px-3.5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Rechazar</span>
                        </button>
                        <button
                          onClick={() => handleApproveUser(u.id, u.name)}
                          className="px-3.5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm hover:shadow cursor-pointer flex items-center space-x-1"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Aprobar cuenta</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs">
              <h4 className="font-wixDisplay text-lg font-bold text-textDark mb-4 border-b border-black/5 pb-4">
                Prestadores Registrados ({auditedUsers.length})
              </h4>

              {auditedUsers.length === 0 ? (
                <p className="text-xs text-textDark/60 text-center py-6">No hay prestadores registrados en el sistema.</p>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {auditedUsers.map((u) => (
                    <div key={u.id} className="p-3.5 bg-bgPrimary/40 border border-black/5 rounded-xl flex items-center justify-between gap-2">
                      <div className="space-y-1 max-w-[170px]">
                        <span className="font-bold text-xs text-textDark block truncate" title={u.name}>
                          {u.name}
                        </span>
                        <span className="text-[10px] text-textDark/60 block truncate">
                          {u.businessName || u.cuit || u.email}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                          u.status === 'active' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {u.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                        <button
                          onClick={() => handleToggleUserStatus(u.id, u.name, u.status)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-white hover:bg-red-50 text-red-600 border-red-200'
                              : 'bg-white hover:bg-green-50 text-green-600 border-green-200'
                          }`}
                          title={u.status === 'active' ? 'Desactivar prestador' : 'Activar prestador'}
                        >
                          {u.status === 'active' ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
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

      {/* ==================== MODAL: DETAIL OF A POI ==================== */}
      {showDetailModal && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/5 animate-scale-up">
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-black/5 flex items-center justify-between z-10">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold bg-accentWine/10 text-accentWine px-2.5 py-0.5 rounded-md">
                  {selectedPoi.category}
                </span>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">{selectedPoi.name}</h4>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-lg hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Cover & Gallery */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-textDark/70 uppercase tracking-wider">
                  Galería de imágenes ({selectedPoi.images.length})
                </label>
                {selectedPoi.images.length === 0 ? (
                  <div className="p-6 bg-bgPrimary rounded-2xl border border-black/5 text-center text-xs text-textDark/50">
                    No se han cargado imágenes para este punto de interés.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedPoi.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden bg-bgPrimary border border-black/5 h-36">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img)}
                          className="absolute top-2 right-2 p-1.5 bg-red-600/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md cursor-pointer"
                          title="Eliminar imagen inapropiada"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-textDark/70 uppercase tracking-wider">Descripción pública</label>
                <p className="text-xs text-textDark/80 leading-relaxed bg-bgPrimary/40 p-4 rounded-xl border border-black/5">
                  {selectedPoi.description || 'Sin descripción.'}
                </p>
              </div>

              {/* Location & Contact Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-bgPrimary/40 p-4 rounded-xl border border-black/5 space-y-1.5">
                  <span className="block text-xs font-bold text-textDark/70 uppercase tracking-wider">Ubicación</span>
                  <p className="text-xs text-textDark flex items-center font-medium">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 text-fillPrimary flex-shrink-0" />
                    <span>{selectedPoi.address || 'Sin dirección especificada'}</span>
                  </p>
                  <p className="text-[11px] text-textDark/50 pl-5">
                    GPS: {selectedPoi.location?.lat}, {selectedPoi.location?.lng}
                  </p>
                </div>

                <div className="bg-bgPrimary/40 p-4 rounded-xl border border-black/5 space-y-1.5">
                  <span className="block text-xs font-bold text-textDark/70 uppercase tracking-wider">Contacto comercial</span>
                  {selectedPoi.phone && (
                    <p className="text-xs text-textDark flex items-center font-medium">
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-fillPrimary flex-shrink-0" />
                      <span>{selectedPoi.phone}</span>
                    </p>
                  )}
                  {selectedPoi.email && (
                    <p className="text-xs text-textDark flex items-center font-medium">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-fillPrimary flex-shrink-0" />
                      <span>{selectedPoi.email}</span>
                    </p>
                  )}
                  {!selectedPoi.phone && !selectedPoi.email && (
                    <p className="text-xs text-textDark/50">Sin datos de contacto cargados</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-black/5 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2.5 text-xs font-semibold text-textDark/70 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              {selectedPoi.status !== 'approved' && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      openCorrectionModal(selectedPoi);
                    }}
                    className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Solicitar corrección
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      openRejectModal(selectedPoi);
                    }}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprovePOI(selectedPoi.id, selectedPoi.name)}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Aprobar Atractivo</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: REJECT POI ==================== */}
      {showRejectModal && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/5 space-y-4 animate-scale-up">
            <div className="flex items-center space-x-2.5 text-red-600">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <h4 className="font-wixDisplay text-lg font-bold text-textDark">Rechazar &quot;{selectedPoi.name}&quot;</h4>
            </div>
            <p className="text-xs text-textDark/70">
              Indique el motivo fundamentado del rechazo. Este mensaje será notificado al responsable del atractivo.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-textDark/70 uppercase tracking-wider">Plantillas rápidas</label>
              <div className="flex flex-wrap gap-1.5">
                {ADMIN_REJECT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFeedbackText(preset);
                      setFeedbackError(false);
                    }}
                    className="px-2.5 py-1 bg-bgPrimary hover:bg-black/5 text-textDark/80 rounded-lg text-[10px] font-semibold border border-black/5 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <textarea
                value={feedbackText}
                onChange={(e) => {
                  setFeedbackText(e.target.value);
                  if (e.target.value.trim()) setFeedbackError(false);
                }}
                placeholder="Escriba el motivo detallado del rechazo..."
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                  feedbackError ? 'border-red-500 ring-2 ring-red-500' : 'border-black/10 focus:ring-red-500'
                }`}
              />
              {feedbackError && (
                <p className="text-[11px] font-bold text-red-600">El motivo del rechazo es obligatorio.</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-textDark/70 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CORRECTION POI ==================== */}
      {showCorrectionModal && selectedPoi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/5 space-y-4 animate-scale-up">
            <div className="flex items-center space-x-2.5 text-amber-600">
              <MessageSquare className="h-6 w-6 flex-shrink-0" />
              <h4 className="font-wixDisplay text-lg font-bold text-textDark">Solicitar correcciones</h4>
            </div>
            <p className="text-xs text-textDark/70">
              Especifique las observaciones a corregir en &quot;{selectedPoi.name}&quot;. El estado cambiará a <em>Corrección solicitada</em>.
            </p>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-textDark/70 uppercase tracking-wider">Plantillas rápidas</label>
              <div className="flex flex-wrap gap-1.5">
                {ADMIN_CORRECTION_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFeedbackText(preset);
                      setFeedbackError(false);
                    }}
                    className="px-2.5 py-1 bg-bgPrimary hover:bg-black/5 text-textDark/80 rounded-lg text-[10px] font-semibold border border-black/5 transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <textarea
                value={feedbackText}
                onChange={(e) => {
                  setFeedbackText(e.target.value);
                  if (e.target.value.trim()) setFeedbackError(false);
                }}
                placeholder="Indique los datos, fotos o detalles a corregir..."
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                  feedbackError ? 'border-red-500 ring-2 ring-red-500' : 'border-black/10 focus:ring-amber-500'
                }`}
              />
              {feedbackError && (
                <p className="text-[11px] font-bold text-red-600">Las observaciones son obligatorias.</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="px-4 py-2 text-xs font-semibold text-textDark/70 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmCorrection}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Enviar Observaciones
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: REJECT PROVIDER USER ==================== */}
      {showUserRejectModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-black/5 space-y-4 animate-scale-up">
            <div className="flex items-center space-x-2.5 text-red-600">
              <AlertCircle className="h-6 w-6 flex-shrink-0" />
              <h4 className="font-wixDisplay text-lg font-bold text-textDark">Rechazar registro de prestador</h4>
            </div>
            <p className="text-xs text-textDark/70">
              Indique el motivo del rechazo del registro de &quot;{selectedUser.name}&quot; (CUIT: {selectedUser.cuit}).
            </p>

            <div className="space-y-1">
              <textarea
                value={feedbackText}
                onChange={(e) => {
                  setFeedbackText(e.target.value);
                  if (e.target.value.trim()) setFeedbackError(false);
                }}
                placeholder="Indique la causa del rechazo (ej: CUIT inválido, datos inconsistentes)..."
                rows={3}
                className={`w-full p-3 rounded-xl border text-xs focus:outline-none focus:ring-2 ${
                  feedbackError ? 'border-red-500 ring-2 ring-red-500' : 'border-black/10 focus:ring-red-500'
                }`}
              />
              {feedbackError && (
                <p className="text-[11px] font-bold text-red-600">El motivo del rechazo es obligatorio.</p>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUserRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-textDark/70 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmUserReject}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
