'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { uploadFileToR2, api } from '@/utils/api';
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
  Phone,
  MapPin,
  Edit2,
  Globe,
  Compass
} from 'lucide-react';

function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      stroke="currentColor" 
      strokeWidth="2" 
      fill="none" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

type ViewMode = 'list' | 'create' | 'edit';

export default function BusinessProfile() {
  const { pois, addPOI, updatePOI, generalParams, categories, currentUser } = useApp();
  
  const providerId = currentUser?.id || '';
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
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [images, setImages] = useState<string[]>([]);

  // Locations states
  const [regions, setRegions] = useState<{ id: string; nombre: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; nombre: string; regionId: string; latitudCentro?: number; longitudCentro?: number }[]>([]);
  const [zones, setZones] = useState<{ id: string; nombre: string; departamentoId: string }[]>([]);
  const [regionId, setRegionId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [zonaId, setZonaId] = useState('');

  // Simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Modal & Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Cargar regiones y departamentos desde el backend al montar
  useEffect(() => {
    async function loadLocations() {
      try {
        const [regs, deps] = await Promise.all([
          api.getRegiones(),
          api.getDepartamentos(),
        ]);
        if (Array.isArray(regs)) setRegions(regs);
        if (Array.isArray(deps)) setDepartments(deps);
      } catch (err) {
        console.warn('Error al cargar regiones o departamentos:', err);
      }
    }
    loadLocations();
  }, []);

  // Departamentos filtrados por la región seleccionada
  const availableDepartments = regionId
    ? departments.filter((d) => d.regionId === regionId)
    : departments;

  const handleRegionChange = (newRegionId: string) => {
    setRegionId(newRegionId);
    const validDeps = departments.filter((d) => d.regionId === newRegionId);
    if (validDeps.length > 0) {
      setDepartamentoId(validDeps[0].id);
      if (validDeps[0].latitudCentro && validDeps[0].longitudCentro) {
        setLat(validDeps[0].latitudCentro.toString());
        setLng(validDeps[0].longitudCentro.toString());
      }
      api.getZonas(validDeps[0].id).then((z) => {
        if (Array.isArray(z)) setZones(z);
      }).catch(() => setZones([]));
    } else {
      setDepartamentoId('');
      setZones([]);
    }
    setZonaId('');
  };

  const handleDepartmentChange = async (newDepId: string) => {
    setDepartamentoId(newDepId);
    const dep = departments.find((d) => d.id === newDepId);
    if (dep && dep.latitudCentro && dep.longitudCentro) {
      setLat(dep.latitudCentro.toString());
      setLng(dep.longitudCentro.toString());
    }
    setZonaId('');
    if (newDepId) {
      try {
        const loadedZones = await api.getZonas(newDepId);
        if (Array.isArray(loadedZones)) setZones(loadedZones);
      } catch (err) {
        setZones([]);
      }
    } else {
      setZones([]);
    }
  };

  // Get POIs belonging to the active provider
  const myPois = pois.filter((p) => 
    currentUser?.role === 'admin' || 
    (providerId && p.createdBy === providerId) || 
    !p.createdBy
  );

  // Validation states
  const validationErrors: string[] = [];
  const formatErrors: string[] = [];

  if (viewMode !== 'list') {
    if (!name.trim()) validationErrors.push('Nombre del negocio');
    if (!category.trim()) validationErrors.push('Categoría');
    if (!description.trim()) validationErrors.push('Descripción');
    if (!regionId) validationErrors.push('Región turística');
    if (!departamentoId) validationErrors.push('Departamento');
    if (!address.trim()) validationErrors.push('Dirección física');
    if (!lat.trim()) validationErrors.push('Latitud');
    if (!lng.trim()) validationErrors.push('Longitud');
    if (!phone.trim()) validationErrors.push('Teléfono de contacto');

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
    const initialRegId = regions.length > 0 ? regions[0].id : '';
    setRegionId(initialRegId);
    const firstRegDeps = initialRegId ? departments.filter((d) => d.regionId === initialRegId) : [];
    if (firstRegDeps.length > 0) {
      setDepartamentoId(firstRegDeps[0].id);
      setLat(firstRegDeps[0].latitudCentro ? firstRegDeps[0].latitudCentro.toString() : '-32.8900');
      setLng(firstRegDeps[0].longitudCentro ? firstRegDeps[0].longitudCentro.toString() : '-68.8400');
      api.getZonas(firstRegDeps[0].id).then((z) => {
        if (Array.isArray(z)) setZones(z);
      }).catch(() => setZones([]));
    } else {
      setDepartamentoId('');
      setLat('-32.8900');
      setLng('-68.8400');
      setZones([]);
    }
    setZonaId('');
    setAddress('');
    setPhone('');
    setWebsite('');
    setInstagram('');
    setImages([]);
    setSelectedPoi(null);
    setViewMode('create');
  };

  const handleStartEdit = (poi: POI) => {
    setSelectedPoi(poi);
    setName(poi.name);
    setDescription(poi.description);
    setCategory(poi.category);
    setRegionId(poi.regionId || (regions[0]?.id || ''));
    setDepartamentoId(poi.departamentoId || (departments[0]?.id || ''));
    setZonaId(poi.zonaId || '');
    setAddress(poi.address);
    setLat(poi.location.lat.toString());
    setLng(poi.location.lng.toString());
    setPhone(poi.phone || '');
    setWebsite(poi.website || '');
    setInstagram(poi.instagram || '');
    const normalizedImages = Array.isArray(poi.images)
      ? poi.images.map((img: any) => (typeof img === 'string' ? img : img?.url || '')).filter(Boolean)
      : [];
    setImages(normalizedImages);
    if (poi.departamentoId) {
      api.getZonas(poi.departamentoId).then((z) => {
        if (Array.isArray(z)) setZones(z);
      }).catch(() => setZones([]));
    } else {
      setZones([]);
    }
    setViewMode('edit');
  };

  const isFormDirty = () => {
    if (viewMode === 'create') {
      return (
        name.trim() !== '' ||
        description.trim() !== '' ||
        address.trim() !== '' ||
        regionId !== '' ||
        departamentoId !== '' ||
        zonaId !== '' ||
        phone.trim() !== '' ||
        website.trim() !== '' ||
        instagram.trim() !== '' ||
        images.length > 0
      );
    } else if (viewMode === 'edit' && selectedPoi) {
      return (
        name !== selectedPoi.name ||
        description !== selectedPoi.description ||
        category !== selectedPoi.category ||
        regionId !== (selectedPoi.regionId || '') ||
        departamentoId !== (selectedPoi.departamentoId || '') ||
        zonaId !== (selectedPoi.zonaId || '') ||
        address !== selectedPoi.address ||
        lat !== selectedPoi.location.lat.toString() ||
        lng !== selectedPoi.location.lng.toString() ||
        phone !== (selectedPoi.phone || '') ||
        website !== (selectedPoi.website || '') ||
        instagram !== (selectedPoi.instagram || '') ||
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validationErrors.length > 0 || formatErrors.length > 0) {
      triggerToast('Por favor resuelva los errores del formulario antes de guardar.', 'warning');
      return;
    }

    const poiPayload = {
      name,
      description,
      category,
      regionId,
      departamentoId,
      zonaId: zonaId || undefined,
      address,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      images,
      phone,
      website: website.trim() || undefined,
      instagram: instagram.trim() || undefined,
    };

    try {
      if (viewMode === 'create') {
        await addPOI(poiPayload);
        triggerToast('¡Establecimiento registrado con éxito! Enviado a revisión.');
      } else if (viewMode === 'edit' && selectedPoi) {
        const updatedPoi: POI = {
          ...selectedPoi,
          ...poiPayload,
          status: 'pending', // Regla de negocio: pasa a revisión tras edición
          updatedAt: new Date().toISOString(),
        };
        await updatePOI(updatedPoi);
        triggerToast('Establecimiento actualizado con éxito. Se ha enviado a revisión.');
      }
      setViewMode('list');
    } catch (err: any) {
      triggerToast(err?.message || 'Error al guardar el negocio en el servidor.', 'warning');
    }
  };

  // Subida de imágenes a Cloudflare R2
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
          setUploadProgress(Math.max(10, overallProgress));
        });
        if (uploadedUrl) {
          setImages((prev) => [...prev, uploadedUrl]);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error al subir la imagen');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
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
    <div className="space-y-6">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`flex items-center space-x-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-semibold text-white ${
              toastType === 'success' ? 'bg-[#2E7D32]' : 'bg-[#EF6C00]'
            }`}
          >
            {toastType === 'success' ? (
              <Check className="h-5 w-5 shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 shrink-0" />
            )}
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Discard Modal */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-[#EF6C00]">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="font-wixDisplay text-lg font-bold">¿Descartar cambios?</h3>
            </div>
            <p className="text-sm text-textDark/70 leading-relaxed">
              Tienes cambios sin guardar en el formulario. Si sales ahora, todos los datos ingresados se perderán permanentemente.
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-4 py-2 border border-black/10 hover:bg-black/5 rounded-xl text-xs font-semibold text-textDark/80 transition-colors cursor-pointer"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Descartar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          {viewMode !== 'list' && (
            <button
              onClick={handleCancel}
              className="p-2 border border-black/10 hover:bg-black/5 rounded-xl text-textDark transition-colors cursor-pointer"
              title="Volver a la lista"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="font-wixDisplay text-3xl font-extrabold text-fillPrimary">
              {viewMode === 'list'
                ? 'Mis Negocios'
                : viewMode === 'create'
                ? 'Nuevo Negocio Turístico'
                : 'Editar Negocio Turístico'}
            </h1>
            <p className="text-sm text-textDark/60 mt-1">
              {viewMode === 'list'
                ? 'Gestiona la información de tus puntos de interés registrados en la plataforma Ando'
                : 'Completa los campos obligatorios para registrar o actualizar tu establecimiento'}
            </p>
          </div>
        </div>

        {viewMode === 'list' && (
          <button
            onClick={handleStartCreate}
            className="flex items-center space-x-2 px-5 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Registrar Nuevo Negocio</span>
          </button>
        )}
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {myPois.length === 0 ? (
            <div className="bg-white rounded-2xl border border-black/5 p-12 text-center shadow-sm">
              <div className="mx-auto w-16 h-16 rounded-full bg-fillPrimary/10 flex items-center justify-center text-fillPrimary mb-4">
                <Store className="h-8 w-8" />
              </div>
              <h3 className="font-wixDisplay text-lg font-bold text-textDark mb-1">
                No tienes negocios registrados
              </h3>
              <p className="text-sm text-textDark/60 max-w-md mx-auto mb-6">
                Comienza registrando tu primer establecimiento turístico para que pueda ser validado por el administrador y publicado en la app.
              </p>
              <button
                onClick={handleStartCreate}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Negocio</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPois.map((poi) => (
                <div
                  key={poi.id}
                  className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group"
                >
                  {/* Card Thumbnail */}
                  <div className="relative h-48 bg-bgPrimary overflow-hidden">
                    {poi.images && poi.images.length > 0 && (typeof poi.images[0] === 'string' ? poi.images[0] : (poi.images[0] as any)?.url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={typeof poi.images[0] === 'string' ? poi.images[0] : (poi.images[0] as any)?.url}
                        alt={poi.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-textDark/30">
                        <ImageIcon className="h-10 w-10 mb-1" />
                        <span className="text-[11px] font-semibold">Sin imagen</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md uppercase tracking-wider ${
                          poi.status === 'approved'
                            ? 'bg-green-500/90 text-white'
                            : poi.status === 'rejected'
                            ? 'bg-red-500/90 text-white'
                            : poi.status === 'correction'
                            ? 'bg-orange-500/90 text-white'
                            : 'bg-yellow-500/90 text-white'
                        }`}
                      >
                        {poi.status === 'approved'
                          ? 'Aprobado'
                          : poi.status === 'rejected'
                          ? 'Rechazado'
                          : poi.status === 'correction'
                          ? 'Requiere Corrección'
                          : 'En Revisión'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 text-white text-[11px] font-bold backdrop-blur-md">
                        {poi.category}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-wixDisplay text-lg font-bold text-textDark line-clamp-1 mb-1">
                        {poi.name}
                      </h3>
                      <p className="text-xs text-textDark/60 line-clamp-2 leading-relaxed mb-4">
                        {poi.description}
                      </p>

                      <div className="space-y-2 text-xs text-textDark/70 mb-4">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-fillPrimary shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{poi.address || 'Sin dirección'}</span>
                        </div>
                        {poi.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-fillPrimary shrink-0" />
                            <span>{poi.phone}</span>
                          </div>
                        )}
                        {poi.website && (
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-fillPrimary shrink-0" />
                            <a
                              href={poi.website.startsWith('http') ? poi.website : `https://${poi.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-fillPrimary hover:underline line-clamp-1"
                            >
                              {poi.website}
                            </a>
                          </div>
                        )}
                        {poi.instagram && (
                          <div className="flex items-center space-x-2">
                            <InstagramIcon className="h-4 w-4 text-pink-600 shrink-0" />
                            <span className="text-pink-600 font-semibold">{poi.instagram}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5 flex items-center justify-end">
                      <button
                        onClick={() => handleStartEdit(poi)}
                        className="flex items-center space-x-1.5 px-4 py-2 border border-black/10 hover:border-fillPrimary hover:text-fillPrimary text-textDark rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                        <span>Editar Negocio</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT FORM VIEW */}
      {viewMode !== 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Form Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-8 shadow-sm">
              <form onSubmit={handleSave} className="space-y-6">
                {/* Error Banner */}
                {(validationErrors.length > 0 || formatErrors.length > 0) && (
                  <div className="p-4 bg-orange-50/70 border border-orange-200/80 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-orange-800 text-xs font-bold">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>Verifique los siguientes campos:</span>
                    </div>
                    <ul className="text-xs text-orange-700/90 list-disc list-inside space-y-0.5">
                      {validationErrors.map((err, i) => (
                        <li key={`v-${i}`}>El campo <strong>{err}</strong> es obligatorio.</li>
                      ))}
                      {formatErrors.map((err, i) => (
                        <li key={`f-${i}`}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Section 1: General Info */}
                <div>
                  <h3 className="font-wixDisplay text-lg font-bold text-textDark mb-1">
                    Información Principal
                  </h3>
                  <p className="text-xs text-textDark/60 mb-5">
                    Datos básicos del establecimiento turístico para su identificación
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Nombre del Negocio / Establecimiento *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Bodega Los Andes"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                          !name.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Categoría Principal *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold cursor-pointer"
                      >
                        {categories
                          .filter((c) => c.enabled)
                          .map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Descripción Detallada *
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe la experiencia turística, historia, propuestas y características del lugar..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                          !description.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Location */}
                <div className="pt-6 border-t border-black/5">
                  <h3 className="font-wixDisplay text-lg font-bold text-textDark mb-1">
                    Ubicación Geográfica
                  </h3>
                  <p className="text-xs text-textDark/60 mb-5">
                    Selecciona la región, departamento, zona y coordenadas exactas
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Región Turística *
                      </label>
                      <select
                        value={regionId}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold cursor-pointer"
                      >
                        <option value="" disabled>Seleccione una región</option>
                        {regions.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Departamento *
                      </label>
                      <select
                        value={departamentoId}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold cursor-pointer"
                      >
                        <option value="" disabled>Seleccione un departamento</option>
                        {availableDepartments.map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Zona Turística (Opcional)
                      </label>
                      <select
                        value={zonaId}
                        onChange={(e) => setZonaId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold cursor-pointer"
                      >
                        <option value="">Sin zona específica / General del departamento</option>
                        {zones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Dirección Física Completa *
                      </label>
                      <input
                        type="text"
                        placeholder="Calle, Número, Localidad"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                          !address.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Latitud *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. -32.8900"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-mono font-semibold ${
                          !lat.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Longitud *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. -68.8400"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-mono font-semibold ${
                          !lng.trim() ? 'border-orange-300' : 'border-black/10'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact & Social Presence */}
                <div className="pt-6 border-t border-black/5">
                  <h3 className="font-wixDisplay text-lg font-bold text-textDark mb-1">
                    Contacto y Presencia Digital
                  </h3>
                  <p className="text-xs text-textDark/60 mb-5">
                    Información para que los turistas puedan comunicarse y acceder a tus redes
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Teléfono de Contacto *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-3 h-4 w-4 text-textDark/40" />
                        <input
                          type="text"
                          placeholder="Ej. +54 261 4123456"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold ${
                            !phone.trim() ? 'border-orange-300' : 'border-black/10'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Sitio Web (Opcional)
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3.5 top-3 h-4 w-4 text-textDark/40" />
                        <input
                          type="text"
                          placeholder="Ej. https://miestablecimiento.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                        Instagram (Opcional)
                      </label>
                      <div className="relative">
                        <InstagramIcon className="absolute left-3.5 top-3 h-4 w-4 text-textDark/40" />
                        <input
                          type="text"
                          placeholder="Ej. @miestablecimiento"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit & Cancel Buttons */}
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

          {/* Right Column: Image Uploader & Media */}
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

              {/* Drag and Drop Zone */}
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
                <span className="text-xs font-bold text-textDark/60 block">
                  Imágenes Guardadas ({images.length} / {generalParams.maxImagesPerPOI})
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  {images.map((imgUrl, index) => {
                    const src = typeof imgUrl === 'string' ? imgUrl : (imgUrl as any)?.url;
                    return (
                      <div key={index} className="group relative h-24 rounded-lg overflow-hidden border border-black/5 bg-bgPrimary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src}
                          alt={`POI Image ${index + 1}`}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        {/* Hover delete button */}
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
                    );
                  })}

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
      )}
    </div>
  );
}
