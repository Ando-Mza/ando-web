'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { uploadFileToR2, api } from '@/utils/api';
import { POI, Region, Departamento, Zona } from '@/types';
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
  Clock,
  DollarSign,
  Compass
} from 'lucide-react';

const InstagramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

type ViewMode = 'list' | 'create' | 'edit';

// Fallback de Regiones y Departamentos de Mendoza en caso de demora de red
const FALLBACK_REGIONES: Region[] = [
  { id: 'reg-gran-mendoza', nombre: 'Gran Mendoza' },
  { id: 'reg-valle-de-uco', nombre: 'Valle de Uco' },
  { id: 'reg-zona-sur', nombre: 'Zona Sur' },
  { id: 'reg-zona-este', nombre: 'Zona Este' },
  { id: 'reg-zona-norte', nombre: 'Zona Norte' },
];

const FALLBACK_DEPARTAMENTOS: Departamento[] = [
  // Gran Mendoza
  { id: 'dep-capital', nombre: 'Ciudad de Mendoza', regionId: 'reg-gran-mendoza' },
  { id: 'dep-godoy-cruz', nombre: 'Godoy Cruz', regionId: 'reg-gran-mendoza' },
  { id: 'dep-guaymallen', nombre: 'Guaymallén', regionId: 'reg-gran-mendoza' },
  { id: 'dep-las-heras', nombre: 'Las Heras', regionId: 'reg-gran-mendoza' },
  { id: 'dep-lujan-de-cuyo', nombre: 'Luján de Cuyo', regionId: 'reg-gran-mendoza' },
  { id: 'dep-maipu', nombre: 'Maipú', regionId: 'reg-gran-mendoza' },
  // Valle de Uco
  { id: 'dep-tupungato', nombre: 'Tupungato', regionId: 'reg-valle-de-uco' },
  { id: 'dep-tunuyan', nombre: 'Tunuyán', regionId: 'reg-valle-de-uco' },
  { id: 'dep-san-carlos', nombre: 'San Carlos', regionId: 'reg-valle-de-uco' },
  // Zona Sur
  { id: 'dep-san-rafael', nombre: 'San Rafael', regionId: 'reg-zona-sur' },
  { id: 'dep-general-alvear', nombre: 'General Alvear', regionId: 'reg-zona-sur' },
  { id: 'dep-malargue', nombre: 'Malargüe', regionId: 'reg-zona-sur' },
  // Zona Este
  { id: 'dep-san-martin', nombre: 'San Martín', regionId: 'reg-zona-este' },
  { id: 'dep-rivadavia', nombre: 'Rivadavia', regionId: 'reg-zona-este' },
  { id: 'dep-junin', nombre: 'Junín', regionId: 'reg-zona-este' },
  { id: 'dep-santa-rosa', nombre: 'Santa Rosa', regionId: 'reg-zona-este' },
  { id: 'dep-la-paz', nombre: 'La Paz', regionId: 'reg-zona-este' },
  // Zona Norte
  { id: 'dep-lavalle', nombre: 'Lavalle', regionId: 'reg-zona-norte' },
];

export default function BusinessProfile() {
  const { pois, addPOI, updatePOI, generalParams, categories, currentUser } = useApp();
  
  const providerId = currentUser?.id || '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation states
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  // Ubicaciones dinámicas desde backend
  const [regiones, setRegiones] = useState<Region[]>(FALLBACK_REGIONES);
  const [departamentos, setDepartamentos] = useState<Departamento[]>(FALLBACK_DEPARTAMENTOS);
  const [zonas, setZonas] = useState<Zona[]>([]);

  // Form states
  // 1. Básicos (Obligatorios)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  
  // 2. Ubicación (Obligatorios: Región, Departamento, Dirección, Lat, Lng. Opcional: Zona)
  const [regionId, setRegionId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // 3. Precios y Visita (Opcionales)
  const [precioMin, setPrecioMin] = useState<string>('');
  const [precioMax, setPrecioMax] = useState<string>('');
  const [duracionEstimada, setDuracionEstimada] = useState<string>('');

  // 4. Contacto y Redes (Opcionales)
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  // 5. Imágenes (Opcional)
  const [images, setImages] = useState<string[]>([]);

  // Simulation / Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal & Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning'>('success');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Cargar regiones y departamentos desde la API al montar
  useEffect(() => {
    let isMounted = true;
    async function loadUbicaciones() {
      try {
        const [regs, deps] = await Promise.allSettled([
          api.getRegiones(),
          api.getDepartamentos(),
        ]);

        if (isMounted) {
          if (regs.status === 'fulfilled' && Array.isArray(regs.value) && regs.value.length > 0) {
            setRegiones(regs.value);
            if (!regionId) {
              setRegionId(regs.value[0].id);
            }
          }
          if (deps.status === 'fulfilled' && Array.isArray(deps.value) && deps.value.length > 0) {
            setDepartamentos(deps.value);
          }
        }
      } catch (e) {
        console.warn('Uso de fallbacks para ubicaciones:', e);
      }
    }
    loadUbicaciones();
    return () => {
      isMounted = false;
    };
  }, []);

  // Departamentos filtrados por la región activa
  const filteredDepartamentos = React.useMemo(() => {
    if (!regionId) return departamentos;
    return departamentos.filter((d) => d.regionId === regionId || (d as any).region?.id === regionId);
  }, [departamentos, regionId]);

  // Sincronizar departamento cuando cambia la región o cuando se cargan los departamentos
  useEffect(() => {
    if (filteredDepartamentos.length > 0) {
      if (!departamentoId || !filteredDepartamentos.some((d) => d.id === departamentoId)) {
        setDepartamentoId(filteredDepartamentos[0].id);
      }
    } else {
      setDepartamentoId('');
      setZonas([]);
      setZonaId('');
    }
  }, [regionId, filteredDepartamentos]);

  // Cargar zonas cuando cambia el departamento
  useEffect(() => {
    let isMounted = true;
    async function loadZonasForDept() {
      if (!departamentoId) {
        setZonas([]);
        setZonaId('');
        return;
      }
      
      // Chequear si el departamento seleccionado ya contiene zonas precargadas
      const currentDept = departamentos.find((d) => d.id === departamentoId) as any;
      if (currentDept?.zonas && Array.isArray(currentDept.zonas) && currentDept.zonas.length > 0) {
        if (isMounted) setZonas(currentDept.zonas);
        return;
      }

      try {
        const zList = await api.getZonas(departamentoId);
        if (isMounted) {
          if (Array.isArray(zList)) {
            setZonas(zList);
          } else {
            setZonas([]);
          }
        }
      } catch (e) {
        if (isMounted) setZonas([]);
      }
    }
    loadZonasForDept();
    return () => {
      isMounted = false;
    };
  }, [departamentoId, departamentos]);

  // Get POIs belonging to the active provider
  const myPois = currentUser?.role === 'provider' ? pois : pois.filter((p) => 
    currentUser?.role === 'admin' || 
    (providerId && p.createdBy === providerId) || 
    !p.createdBy
  );

  // Derived validation states
  const validationErrors: string[] = [];
  const formatErrors: string[] = [];

  if (viewMode !== 'list') {
    if (!name.trim() || name.trim().length < 2) validationErrors.push('Nombre del negocio (mín. 2 caracteres)');
    if (!category.trim()) validationErrors.push('Categoría de servicio');
    if (!description.trim() || description.trim().length < 10) validationErrors.push('Descripción (mín. 10 caracteres)');
    if (!regionId.trim()) validationErrors.push('Región');
    if (!departamentoId.trim()) validationErrors.push('Departamento');
    if (!address.trim() || address.trim().length < 5) validationErrors.push('Dirección física (mín. 5 caracteres)');
    if (!lat.trim()) validationErrors.push('Latitud');
    if (!lng.trim()) validationErrors.push('Longitud');

    // Validate Phone format (opcional)
    if (phone.trim()) {
      const phoneRegex = /^\+?[0-9\s-]{6,18}$/;
      if (!phoneRegex.test(phone)) {
        formatErrors.push('El formato del Teléfono es inválido (debe contener entre 6 y 18 números)');
      }
    }

    // Validate Website (opcional)
    if (website.trim()) {
      if (!/^https?:\/\/.+\..+/.test(website.trim()) && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(website.trim())) {
        formatErrors.push('El Sitio Web debe tener un formato válido (ej. https://minegocio.com o minegocio.com)');
      }
    }

    // Validate Coordinates
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

    // Validate Prices (opcional)
    if (precioMin.trim() && precioMax.trim()) {
      const min = parseFloat(precioMin);
      const max = parseFloat(precioMax);
      if (!isNaN(min) && !isNaN(max) && min > max) {
        formatErrors.push('El Precio Mínimo no puede ser mayor al Precio Máximo');
      }
    }
  }

  const triggerToast = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleStartCreate = () => {
    setName('');
    setDescription('');
    const activeCats = categories.filter((c) => c.enabled);
    setCategory(activeCats.length > 0 ? activeCats[0].name : 'Enoturismo');
    
    // Región inicial
    const initialRegId = regiones[0]?.id || '';
    setRegionId(initialRegId);
    
    // Depto inicial
    const initialDeptos = departamentos.filter((d) => !initialRegId || d.regionId === initialRegId || (d as any).region?.id === initialRegId);
    setDepartamentoId(initialDeptos[0]?.id || '');
    setZonaId('');
    
    setAddress('');
    setLat('-32.8908');
    setLng('-68.8272');
    
    setPrecioMin('');
    setPrecioMax('');
    setDuracionEstimada('');
    
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
    
    // Determinar región y departamento
    let targetDeptId = poi.departamentoId || '';
    let targetRegId = poi.regionId || '';

    if (!targetRegId && targetDeptId) {
      const matchDep = departamentos.find((d) => d.id === targetDeptId);
      if (matchDep) targetRegId = matchDep.regionId || (matchDep as any).region?.id || '';
    }

    if (!targetRegId) {
      targetRegId = regiones[0]?.id || '';
    }
    if (!targetDeptId) {
      const deptosInReg = departamentos.filter((d) => !targetRegId || d.regionId === targetRegId || (d as any).region?.id === targetRegId);
      targetDeptId = deptosInReg[0]?.id || '';
    }

    setRegionId(targetRegId);
    setDepartamentoId(targetDeptId);
    setZonaId(poi.zonaId || '');
    
    setAddress(poi.address);
    setLat(poi.location?.lat?.toString() || '-32.8908');
    setLng(poi.location?.lng?.toString() || '-68.8272');
    
    setPrecioMin(poi.precioMin !== undefined ? poi.precioMin.toString() : '');
    setPrecioMax(poi.precioMax !== undefined ? poi.precioMax.toString() : '');
    setDuracionEstimada(poi.duracionEstimada !== undefined ? poi.duracionEstimada.toString() : '');
    
    setPhone(poi.phone || '');
    setWebsite(poi.website || '');
    setInstagram(poi.instagram || '');
    
    setImages(poi.images || []);
    setViewMode('edit');
  };

  const isFormDirty = () => {
    if (viewMode === 'create') {
      return (
        name.trim() !== '' ||
        description.trim() !== '' ||
        address.trim() !== '' ||
        phone.trim() !== '' ||
        website.trim() !== '' ||
        instagram.trim() !== '' ||
        precioMin.trim() !== '' ||
        precioMax.trim() !== '' ||
        duracionEstimada.trim() !== '' ||
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
        precioMin !== (selectedPoi.precioMin !== undefined ? selectedPoi.precioMin.toString() : '') ||
        precioMax !== (selectedPoi.precioMax !== undefined ? selectedPoi.precioMax.toString() : '') ||
        duracionEstimada !== (selectedPoi.duracionEstimada !== undefined ? selectedPoi.duracionEstimada.toString() : '') ||
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

    setIsSaving(true);

    const matchCat = categories.find((c) => c.name.toLowerCase() === category.toLowerCase() || c.id === category);
    const catIds = matchCat ? [matchCat.id] : [];

    const poiPayload = {
      name: name.trim(),
      description: description.trim(),
      category,
      categoriaIds: catIds,
      regionId,
      departamentoId,
      zonaId: zonaId.trim() || undefined,
      address: address.trim(),
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      precioMin: precioMin.trim() ? parseFloat(precioMin) : undefined,
      precioMax: precioMax.trim() ? parseFloat(precioMax) : undefined,
      duracionEstimada: duracionEstimada.trim() ? parseInt(duracionEstimada, 10) : undefined,
      phone: phone.trim() || undefined,
      website: website.trim() ? (website.startsWith('http') ? website.trim() : `https://${website.trim()}`) : undefined,
      instagram: instagram.trim() || undefined,
      images,
      imagenPrincipalUrl: images[0] || undefined,
    };

    if (viewMode === 'create') {
      const res = await addPOI(poiPayload);
      setIsSaving(false);
      if (res.success) {
        triggerToast('¡Establecimiento registrado con éxito! Enviado a revisión por el administrador.');
        setViewMode('list');
      } else {
        triggerToast(res.error || 'Ocurrió un error al registrar el negocio', 'error');
      }
    } else if (viewMode === 'edit' && selectedPoi) {
      const updatedPoi: POI = {
        ...selectedPoi,
        ...poiPayload,
        status: 'pending', // Pasa a revisión tras edición
        updatedAt: new Date().toISOString(),
      };
      const res = await updatePOI(updatedPoi);
      setIsSaving(false);
      if (res.success) {
        triggerToast('Establecimiento actualizado con éxito. Se ha enviado a revisión.');
        setViewMode('list');
      } else {
        triggerToast(res.error || 'Ocurrió un error al actualizar el negocio', 'error');
      }
    }
  };

  // Subida de imágenes reales desde el dispositivo a Cloudflare R2
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
    <div className="space-y-8 relative font-wixText">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 animate-slide-in max-w-md ${
          toastType === 'success' ? 'bg-fillPrimary' : toastType === 'error' ? 'bg-red-600' : 'bg-amber-600'
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
            <div className="flex items-center space-x-2.5 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-wixDisplay font-bold text-textDark">¿Descartar cambios?</h4>
            </div>
            <p className="text-xs text-textDark/70 leading-relaxed">
              Tienes cambios no guardados en el formulario del negocio. Si sales ahora, todos los datos se perderán.
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
                Gestiona tus publicaciones, sube fotografías y verifica el estado de aprobación de tus puntos de interés turísticos.
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
                    {poi.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3.5 w-3.5 text-fillPrimary mr-2 flex-shrink-0" />
                        <span>{poi.phone}</span>
                      </div>
                    )}
                    {poi.website && (
                      <div className="flex items-center">
                        <Globe className="h-3.5 w-3.5 text-fillPrimary mr-2 flex-shrink-0" />
                        <span className="truncate">{poi.website}</span>
                      </div>
                    )}
                    {poi.instagram && (
                      <div className="flex items-center">
                        <InstagramIcon className="h-3.5 w-3.5 text-fillPrimary mr-2 flex-shrink-0" />
                        <span>{poi.instagram}</span>
                      </div>
                    )}
                  </div>

                  {poi.status === 'rejected' && poi.feedback && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-950 flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-red-900 font-bold">Motivo de rechazo:</strong>
                        <span className="leading-tight">{poi.feedback}</span>
                      </div>
                    </div>
                  )}
                  {poi.status === 'correction' && poi.feedback && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-amber-900 font-bold">Corrección solicitada:</strong>
                        <span className="leading-tight">{poi.feedback}</span>
                      </div>
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
                {viewMode === 'create' ? 'Registrar Nuevo Negocio Turístico (POI)' : `Administrar: ${selectedPoi?.name}`}
              </h3>
              <p className="text-xs text-textDark/55 mt-0.5">
                {viewMode === 'create' 
                  ? 'Complete los datos obligatorios. Su local quedará en estado pendiente hasta su validación.' 
                  : 'Modifique los datos comerciales. Al guardar pasará a revisión administrativa.'}
              </p>
            </div>
          </div>

          {/* Form and Image Columns Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left 2 columns: Form Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Correction or Rejection Observations Banner */}
              {viewMode === 'edit' && selectedPoi?.status === 'correction' && selectedPoi?.feedback && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex items-start space-x-3 text-xs text-amber-950 shadow-xs">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-amber-900">
                      Observaciones del Administrador (Corrección Solicitada):
                    </h5>
                    <p className="leading-relaxed whitespace-pre-wrap font-medium text-amber-950">
                      {selectedPoi.feedback}
                    </p>
                    <p className="text-[11px] text-amber-800/80 pt-1 border-t border-amber-200">
                      Por favor actualice los datos o imágenes señaladas y guarde los cambios para que su negocio vuelva a ser evaluado.
                    </p>
                  </div>
                </div>
              )}

              {viewMode === 'edit' && selectedPoi?.status === 'rejected' && selectedPoi?.feedback && (
                <div className="p-4 bg-red-50 rounded-2xl border border-red-200 flex items-start space-x-3 text-xs text-red-950 shadow-xs">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-bold text-sm text-red-900">
                      Motivo del Rechazo:
                    </h5>
                    <p className="leading-relaxed whitespace-pre-wrap font-medium text-red-950">
                      {selectedPoi.feedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Validation errors warning */}
              {(validationErrors.length > 0 || formatErrors.length > 0) && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-3 text-xs leading-relaxed text-amber-900 shadow-xs">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    {validationErrors.length > 0 && (
                      <p>
                        <strong>Campos obligatorios incompletos:</strong> {validationErrors.join(', ')}.
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
                  {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
                  <h4 className="font-wixDisplay text-base font-bold text-textDark pb-2 border-b border-black/5 flex items-center space-x-2">
                    <Store className="h-4 w-4 text-fillPrimary" />
                    <span>Información Principal</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Nombre del Negocio *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Bodega Los Andes"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold ${
                          !name.trim() ? 'border-amber-300' : 'border-black/10 focus:border-fillPrimary'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Categoría Principal *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-bold focus:border-fillPrimary"
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
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Descripción General (Mín. 10 caract.) *
                      </label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          maxLength={500}
                          placeholder="Describe la propuesta turística, experiencias, degustaciones y servicios principales..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs leading-relaxed ${
                            !description.trim() ? 'border-amber-300' : 'border-black/10 focus:border-fillPrimary'
                          }`}
                        />
                        <span className="absolute bottom-3 right-3 text-[10px] text-textDark/40 font-bold">
                          {description.length} / 500
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 2: UBICACIÓN GEOGRÁFICA */}
                  <h4 className="font-wixDisplay text-base font-bold text-textDark mt-8 pb-2 border-b border-black/5 flex items-center space-x-2">
                    <Compass className="h-4 w-4 text-fillPrimary" />
                    <span>Ubicación Geográfica en Mendoza</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {/* Región */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Región *
                      </label>
                      <select
                        value={regionId}
                        onChange={(e) => setRegionId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary cursor-pointer"
                      >
                        {regiones.length === 0 && <option value="">Cargando regiones...</option>}
                        {regiones.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Departamento */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Departamento *
                      </label>
                      <select
                        value={departamentoId}
                        onChange={(e) => setDepartamentoId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary cursor-pointer"
                      >
                        {filteredDepartamentos.length === 0 && (
                          <option value="">No hay departamentos disponibles</option>
                        )}
                        {filteredDepartamentos.map((dep) => (
                          <option key={dep.id} value={dep.id}>
                            {dep.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Zona (Opcional) */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Zona / Localidad <span className="text-textDark/40 font-normal">(Opcional)</span>
                      </label>
                      <select
                        value={zonaId}
                        onChange={(e) => setZonaId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary cursor-pointer"
                      >
                        <option value="">Sin zona específica</option>
                        {zonas.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Dirección */}
                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Dirección Física Completa *
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Ruta Provincial 60 Km 15, Maipú"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold ${
                          !address.trim() ? 'border-amber-300' : 'border-black/10 focus:border-fillPrimary'
                        }`}
                      />
                    </div>

                    {/* Coordenadas */}
                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                          Latitud Geográfica *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. -32.8908"
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-mono font-semibold ${
                            !lat.trim() ? 'border-amber-300' : 'border-black/10 focus:border-fillPrimary'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                          Longitud Geográfica *
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. -68.8272"
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          className={`w-full px-4 py-2.5 rounded-xl border bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-mono font-semibold ${
                            !lng.trim() ? 'border-amber-300' : 'border-black/10 focus:border-fillPrimary'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECCIÓN 3: PRECIOS Y VISITA (OPCIONALES) */}
                  <h4 className="font-wixDisplay text-base font-bold text-textDark mt-8 pb-2 border-b border-black/5 flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-fillPrimary" />
                    <span>Rango de Precios y Duración Estimada</span>
                    <span className="text-[10px] text-textDark/40 font-normal uppercase ml-1">(Opcional)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Precio Mínimo ($ ARS)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 1500"
                        value={precioMin}
                        onChange={(e) => setPrecioMin(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Precio Máximo ($ ARS)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Ej. 6500"
                        value={precioMax}
                        onChange={(e) => setPrecioMax(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Duración de Visita (minutos)
                      </label>
                      <input
                        type="number"
                        min="10"
                        step="5"
                        placeholder="Ej. 90 (1h 30m)"
                        value={duracionEstimada}
                        onChange={(e) => setDuracionEstimada(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary"
                      />
                    </div>
                  </div>

                  {/* SECCIÓN 4: CONTACTO Y REDES SOCIALES (OPCIONALES) */}
                  <h4 className="font-wixDisplay text-base font-bold text-textDark mt-8 pb-2 border-b border-black/5 flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-fillPrimary" />
                    <span>Contacto y Enlaces Oficiales</span>
                    <span className="text-[10px] text-textDark/40 font-normal uppercase ml-1">(Opcional)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Teléfono de Contacto
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. +54 9 261 4123456"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Sitio Web Oficial
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. https://bodegalosandes.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                        Usuario de Instagram
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. @bodegalosandes"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/40 focus:bg-white focus:outline-none transition-all text-xs font-semibold focus:border-fillPrimary"
                      />
                    </div>
                  </div>

                  {/* Submit and Cancel Buttons */}
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
                      disabled={validationErrors.length > 0 || formatErrors.length > 0 || isSaving}
                      className="flex items-center space-x-2 px-6 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none"
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
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
                  <p className="text-xs text-textDark/60 mt-0.5">Sube fotografías oficiales para la ficha turística</p>
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
                    <p className="font-bold text-textDark/80">Arrastra fotos aquí o haz clic para explorar</p>
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
