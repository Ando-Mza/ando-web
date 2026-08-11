'use client';

import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { uploadFileToR2 } from '@/utils/api';
import { POI } from '@/types';
import { 
  UploadCloud, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  AlertTriangle,
  Plus,
  Store,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Edit2
} from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

export default function BusinessProfile() {
  const { pois, addPOI, updatePOI, generalParams, categories, currentUser } = useApp();
  
  const providerId = currentUser?.id || 'usr-prov-1';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation states
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hours, setHours] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Modal & Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Get POIs belonging to the active provider
  const myPois = pois.filter((p) => 
    currentUser?.role === 'admin' || 
    p.createdBy === providerId || 
    p.createdBy === 'usr-prov-1' || 
    !p.createdBy
  );

  // Sample photos for R2 simulations
  const sampleUploadUrls = [
    'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470158943483-e1c7a66e5590?auto=format&fit=crop&w=800&q=80',
  ];

  // Derived validation states (calculated during render to prevent set-state-in-effect cascading renders)
  const validationErrors: string[] = [];
  const formatErrors: string[] = [];

  if (viewMode !== 'list') {
    if (!name.trim()) validationErrors.push('Nombre del negocio');
    if (!category.trim()) validationErrors.push('Categoría');
    if (!description.trim()) validationErrors.push('Descripción');
    if (!address.trim()) validationErrors.push('Dirección física');
    if (!lat.trim()) validationErrors.push('Latitud');
    if (!lng.trim()) validationErrors.push('Longitud');
    if (!email.trim()) validationErrors.push('Email de contacto');
    if (!phone.trim()) validationErrors.push('Teléfono de contacto');
    if (!hours.trim()) validationErrors.push('Horario de atención');

    // Validate Email format
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        formatErrors.push('El formato del Email es inválido (ej. negocio@ejemplo.com)');
      }
    }

    // Validate Phone format
    if (phone.trim()) {
      const phoneRegex = /^\+?[0-9\s-]{6,18}$/;
      if (!phoneRegex.test(phone)) {
        formatErrors.push('El formato del Teléfono es inválido (debe contener entre 6 y 18 números)');
      }
    }

    // Validate coordinates
    if (lat.trim()) {
      const latNum = parseFloat(lat);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        formatErrors.push('La Latitud debe ser un número válido entre -90 y 90');
      }
    }
    if (lng.trim()) {
      const lngNum = parseFloat(lng);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        formatErrors.push('La Longitud debe ser un número válido entre -180 y 180');
      }
    }
  }

  const triggerToast = (msg: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleStartCreate = () => {
    setName('');
    setDescription('');
    const activeCats = categories.filter(c => c.enabled);
    setCategory(activeCats.length > 0 ? activeCats[0].name : 'Enoturismo');
    setAddress('');
    setLat('-32.8900');
    setLng('-68.8400');
    setEmail('');
    setPhone('');
    setHours('');
    setImages([]);
    setSelectedPoi(null);
    setViewMode('create');
  };

  const handleStartEdit = (poi: POI) => {
    setSelectedPoi(poi);
    setName(poi.name);
    setDescription(poi.description);
    setCategory(poi.category);
    setAddress(poi.address);
    setLat(poi.location.lat.toString());
    setLng(poi.location.lng.toString());
    setEmail(poi.email || '');
    setPhone(poi.phone || '');
    // Horario: prefilled with mock hours or default placeholder
    setHours(poi.address.includes('Cobos') ? 'Lunes a Sábado 09:00 a 19:30, Dom 10:00 a 14:00' : 'Lunes a Domingos 09:00 a 18:00');
    setImages(poi.images);
    setViewMode('edit');
  };

  const isFormDirty = () => {
    if (viewMode === 'create') {
      return (
        name.trim() !== '' ||
        description.trim() !== '' ||
        address.trim() !== '' ||
        email.trim() !== '' ||
        phone.trim() !== '' ||
        hours.trim() !== '' ||
        images.length > 0
      );
    } else if (viewMode === 'edit' && selectedPoi) {
      return (
        name !== selectedPoi.name ||
        description !== selectedPoi.description ||
        category !== selectedPoi.category ||
        address !== selectedPoi.address ||
        lat !== selectedPoi.location.lat.toString() ||
        lng !== selectedPoi.location.lng.toString() ||
        email !== (selectedPoi.email || '') ||
        phone !== (selectedPoi.phone || '') ||
        images !== selectedPoi.images
      );
    }
    return false;
  };

  const handleCancel = () => {
    if (isFormDirty()) {
      setShowDiscardModal(true);
    } else {
      setViewMode('list');
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    setViewMode('list');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationErrors.length > 0 || formatErrors.length > 0) {
      triggerToast('Por favor resuelva los errores del formulario antes de guardar.', 'warning');
      return;
    }

    const poiPayload = {
      name,
      description,
      category,
      address,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      images,
      email,
      phone,
    };

    if (viewMode === 'create') {
      addPOI(poiPayload);
      triggerToast('¡Establecimiento registrado con éxito! Enviado a revisión por el administrador.');
    } else if (viewMode === 'edit' && selectedPoi) {
      const updatedPoi: POI = {
        ...selectedPoi,
        ...poiPayload,
        status: 'pending', // Regla de negocio: pasa a revisión tras edición
        updatedAt: new Date().toISOString(),
      };
      updatePOI(updatedPoi);
      triggerToast('Establecimiento actualizado con éxito. Se ha enviado a revisión.');
    }

    setViewMode('list');
  };

  // Subida de imágenes reales desde el dispositivo a Cloudflare R2 (US-GIT-09)
  const handleDeviceImageUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    if (images.length + files.length > generalParams.maxImagesPerPOI) {
      alert(`Límite superado. Máximo configurado: ${generalParams.maxImagesPerPOI} imágenes.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploadedUrl = await uploadFileToR2(file, (prog) => {
          const overallProgress = Math.round(((i + prog / 100) / files.length) * 100);
          setUploadProgress(overallProgress);
        });
        setImages((prev) => [...prev, uploadedUrl]);
      }
    } catch (err) {
      console.error('Error al subir la imagen:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleDeviceImageUpload(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDeviceImageUpload(e.dataTransfer.files);
    }
  };

  const handleDeleteImage = (index: number) => {
    if (confirm('¿Está seguro de que desea eliminar permanentemente esta imagen?')) {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 animate-slide-in max-w-md ${
          toastType === 'success' ? 'bg-fillPrimary' : 'bg-orange-600'
        }`}>
          {toastType === 'success' ? (
            <Check className="h-4.5 w-4.5 text-white flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4.5 w-4.5 text-white flex-shrink-0" />
          )}
          <span className="text-xs font-semibold leading-normal">{toastMessage}</span>
        </div>
      )}

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/5 animate-scale-up space-y-4">
            <div className="flex items-center space-x-2.5 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-wixDisplay font-bold text-textDark">¿Descartar cambios?</h4>
            </div>
            <p className="text-xs text-textDark/70 leading-relaxed">
              Tienes cambios no guardados en el formulario del negocio. Si sales ahora, todos los datos no guardados se perderán permanentemente.
            </p>
            <div className="flex space-x-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
              >
                Seguir Editando
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/10 transition-colors cursor-pointer"
              >
                Descartar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 1: MASTER LIST -------------------- */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-wixDisplay text-2xl font-bold text-fillPrimary">Mis negocios turísticos</h3>
              <p className="text-sm text-textDark/70 mt-1">
                Gestiona tus publicaciones, sube fotografías y verifica el estado de aprobación de tus locales en la aplicación.
              </p>
            </div>
            <button
              onClick={handleStartCreate}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer self-start sm:self-center"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Registrar Nuevo Negocio</span>
            </button>
          </div>

          {/* Grid of existing businesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPois.map((poi) => (
              <div 
                key={poi.id}
                className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Header Image / Cover */}
                <div className="relative h-44 bg-bgPrimary border-b border-black/5 overflow-hidden">
                  {poi.images && poi.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={poi.images[0]} 
                      alt={poi.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-textDark/35 text-xs font-semibold">
                      <ImageIcon className="h-6 w-6 mr-1.5 opacity-60" /> Sin portada cargada
                    </div>
                  )}
                  {/* Category Chip */}
                  <span className="absolute top-3 left-3 bg-accentWine text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md">
                    {poi.category}
                  </span>
                  
                  {/* Status Badge */}
                  <span className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md border ${
                    poi.status === 'approved'
                      ? 'bg-green-600 text-white border-green-500'
                      : poi.status === 'pending'
                      ? 'bg-yellow-500 text-textDark border-yellow-400'
                      : poi.status === 'rejected'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-orange-600 text-white border-orange-500'
                  }`}>
                    {poi.status === 'approved' && 'Publicado'}
                    {poi.status === 'pending' && 'En Revisión'}
                    {poi.status === 'rejected' && 'Rechazado'}
                    {poi.status === 'correction' && 'Cambios Solicitados'}
                  </span>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2.5">
                    <h4 className="font-wixDisplay text-lg font-bold text-textDark">{poi.name}</h4>
                    <p className="text-xs text-textDark/60 line-clamp-2 leading-relaxed">
                      {poi.description}
                    </p>
                  </div>

                  <div className="pt-3.5 border-t border-black/5 space-y-2 text-[11px] text-textDark/75">
                    <div className="flex items-center">
                      <MapPin className="h-3.5 w-3.5 text-fillPrimary mr-2 flex-shrink-0" />
                      <span className="truncate" title={poi.address}>{poi.address}</span>
                    </div>
                    {poi.email && (
                      <div className="flex items-center">
                        <Mail className="h-3.5 w-3.5 text-fillPrimary mr-2 flex-shrink-0" />
                        <span className="truncate">{poi.email}</span>
                      </div>
                    )}
                    {poi.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 text-fillPrimary mr-2 flex-shrink-0" />
                        <span>{poi.phone}</span>
                      </div>
                    )}
                  </div>

                  {poi.status === 'rejected' && poi.feedback && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-150 text-[10px] text-red-800 leading-relaxed font-mono">
                      <strong>Motivo de rechazo:</strong> {poi.feedback}
                    </div>
                  )}
                  {poi.status === 'correction' && poi.feedback && (
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-150 text-[10px] text-orange-800 leading-relaxed font-mono">
                      <strong>Corrección pedida:</strong> {poi.feedback}
                    </div>
                  )}

                  <button
                    onClick={() => handleStartEdit(poi)}
                    className="w-full py-2 bg-bgPrimary hover:bg-black/5 border border-black/5 text-textDark hover:text-accentWine font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Administrar Perfil</span>
                  </button>
                </div>
              </div>
            ))}

            {myPois.length === 0 && (
              <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white border border-black/5 rounded-2xl py-12 flex flex-col items-center justify-center text-center p-6 space-y-3">
                <Store className="h-10 w-10 text-textDark/30" />
                <div>
                  <h4 className="font-wixDisplay text-sm font-bold text-textDark">No tienes negocios cargados</h4>
                  <p className="text-xs text-textDark/50 mt-1 max-w-sm leading-relaxed">
                    Registra tu primer establecimiento turístico completando los datos comerciales obligatorios y subiendo fotos de tu local.
                  </p>
                </div>
                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-xs shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Comenzar Registro
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- VIEW 2 & 3: FORM VIEW (CREATE & EDIT) -------------------- */}
      {viewMode !== 'list' && (
        <div className="space-y-6">
          {/* Header row */}
          <div className="flex items-center space-x-3 pb-4 border-b border-black/5">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-black/5 rounded-xl text-textDark/60 transition-colors cursor-pointer"
              title="Volver"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h3 className="font-wixDisplay text-xl font-bold text-accentWine">
                {viewMode === 'create' ? 'Registrar Nuevo Negocio Turístico' : `Administrar: ${selectedPoi?.name}`}
              </h3>
              <p className="text-xs text-textDark/55 mt-0.5">
                {viewMode === 'create' 
                  ? 'Complete todos los campos obligatorios para registrar y enviar su local a validación.' 
                  : 'Modifique los campos requeridos. Guardar enviará el local nuevamente a revisión administrativa.'}
              </p>
            </div>
          </div>

          {/* Form and Image Columns Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left 2 columns: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Validation errors warning */}
              {(validationErrors.length > 0 || formatErrors.length > 0) && (
                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-150 flex items-start space-x-3 text-xs leading-relaxed text-orange-900 shadow-xs">
                  <AlertTriangle className="h-4.5 w-4.5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {validationErrors.length > 0 && (
                      <p>
                        <strong>Campos obligatorios vacíos:</strong> {validationErrors.join(', ')}.
                      </p>
                    )}
                    {formatErrors.map((err, i) => (
                      <p key={i} className="font-semibold">• {err}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
                <form onSubmit={handleSave} className="space-y-6">
                  <h4 className="font-wixDisplay text-base font-bold text-textDark mb-4 pb-2 border-b border-black/5">Información Comercial</h4>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Nombre del Negocio *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Bodega Santa Julia"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                          !name.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Categoría de Servicio *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-bold"
                      >
                        {categories
                          .filter((cat) => cat.enabled)
                          .map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Descripción General (Máx. 500 caract.) *
                      </label>
                      <div className="relative">
                        <textarea
                          rows={4}
                          maxLength={500}
                          placeholder="Describe la propuesta turística, productos principales o servicios..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className={`w-full px-4 py-3 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm leading-relaxed ${
                            !description.trim() ? 'border-orange-300' : 'border-black/10'
                          }`}
                        />
                        <span className="absolute bottom-3 right-3 text-[10px] text-textDark/40 font-bold">
                          {description.length} / 500
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Dirección Física Completa *
                      </label>
                      <input
                        type="text"
                        placeholder="Calle, Número, Departamento, Provincia"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                          !address.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Latitud Geográfica *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. -32.8894"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-mono font-semibold ${
                          !lat.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Longitud Geográfica *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. -68.8681"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-mono font-semibold ${
                          !lng.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>
                  </div>

                  <h4 className="font-wixDisplay text-base font-bold text-textDark mt-8 mb-4 pb-2 border-b border-black/5">Contacto y Horarios</h4>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Email de Contacto *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. contacto@nonegocio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                          !email.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Teléfono de Contacto *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. +54 261 4123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                          !phone.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Horario de Atención de Muestra *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Lunes a Viernes de 09:00 a 18:00 hs"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                          !hours.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Submit and Cancel Tools */}
                  <div className="pt-6 border-t border-black/5 flex space-x-3 justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-5 py-2.5 border border-black/10 hover:bg-black/5 text-textDark/75 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={validationErrors.length > 0 || formatErrors.length > 0}
                      className="flex items-center space-x-2 px-6 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                    >
                      <Save className="h-4 w-4" />
                      <span>{viewMode === 'create' ? 'Registrar Negocio' : 'Guardar Cambios'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: R2 Drag & Drop Multimedia */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
                <div>
                  <h4 className="font-wixDisplay text-base font-bold text-textDark">Galería de imágenes</h4>
                  <p className="text-xs text-textDark/60 mt-0.5">Gestiona las fotografías oficiales del negocio</p>
                </div>

                {/* Hidden File Input for Device Filesystem */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInputChange}
                />

                {/* Drag and Drop Zone (US-GIT-09) */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                    dragActive 
                      ? 'border-fillPrimary bg-fillPrimary/5 scale-[1.01]' 
                      : 'border-black/10 hover:border-fillPrimary/60 bg-bgPrimary/40 hover:bg-bgPrimary/60'
                  }`}
                >
                  <UploadCloud className="h-8 w-8 text-fillPrimary/70" />
                  <div className="text-xs">
                    <p className="font-bold text-textDark/80">Arrastra fotos de tu dispositivo aquí o haz clic para explorar</p>
                    <p className="text-[10px] text-textDark/50 mt-1">Soporta PNG, JPG, WEBP (Máx. {generalParams.maxImagesPerPOI} imágenes)</p>
                  </div>
                </div>

                {/* Uploading progress animation */}
                {isUploading && (
                  <div className="space-y-2 bg-bgPrimary/60 p-3 rounded-lg border border-black/5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="flex items-center text-textDark/70">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-fillPrimary mr-1.5" />
                        Subiendo imágenes...
                      </span>
                      <span className="text-fillPrimary">{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-fillPrimary rounded-full transition-all duration-150"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Uploaded Images Grid */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-textDark/60 block">Imágenes Guardadas ({images.length} / {generalParams.maxImagesPerPOI})</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((imgUrl, index) => (
                      <div key={index} className="group relative h-24 rounded-lg overflow-hidden border border-black/5 bg-bgPrimary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgUrl}
                          alt={`POI Image ${index + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Hover delete button (US-GIT-11) */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteImage(index);
                            }}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-transform hover:scale-115 cursor-pointer shadow"
                            title="Eliminar imagen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {images.length === 0 && (
                      <div className="col-span-2 border border-black/5 rounded-lg py-6 flex flex-col items-center justify-center text-textDark/30 text-xs">
                        <ImageIcon className="h-5 w-5 mb-1" />
                        <span>No hay imágenes cargadas aún</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
