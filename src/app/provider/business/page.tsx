'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { api, uploadFileToR2 } from '@/utils/api';
import { POI } from '@/types';
import { 
  UploadCloud, 
  Trash2, 
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
  Edit2,
  Clock,
  Globe,
  DollarSign,
  X,
  CheckCircle2
} from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

type ViewMode = 'list' | 'create' | 'edit';

interface ScheduleEntry {
  id: string;
  diaSemanaDesde: number;
  horaDesde: string;
  diaSemanaHasta: number;
  horaHasta: string;
}

const DIAS_SEMANA = [
  { id: 0, nombre: 'Domingo' },
  { id: 1, nombre: 'Lunes' },
  { id: 2, nombre: 'Martes' },
  { id: 3, nombre: 'Miércoles' },
  { id: 4, nombre: 'Jueves' },
  { id: 5, nombre: 'Viernes' },
  { id: 6, nombre: 'Sábado' },
];

const MAX_FILE_SIZE_MB = 30;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 30 MB (Regla de negocio US-CYN-02)

export default function BusinessProfile() {
  const { pois, addPOI, updatePOI, generalParams, categories, currentUser } = useApp();
  
  const providerId = currentUser?.id || '';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mode & navigation
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxStepReached, setMaxStepReached] = useState<number>(1);
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null);

  // Step 1: Información básica
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Step 2: Ubicación
  const [address, setAddress] = useState('');
  const [regionId, setRegionId] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  const [zonaId, setZonaId] = useState('');
  const [lat, setLat] = useState('-32.8900');
  const [lng, setLng] = useState('-68.8400');

  // Step 3: Contacto
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  // Step 4: Horarios
  const [horariosList, setHorariosList] = useState<ScheduleEntry[]>([]);
  const [nuevoDia, setNuevoDia] = useState<number>(1);
  const [nuevaHoraDesde, setNuevaHoraDesde] = useState('09:00');
  const [nuevaHoraHasta, setNuevaHoraHasta] = useState('18:00');
  const [horarioError, setHorarioError] = useState<string | null>(null);

  // Step 5: Fotos
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);

  // Step 6: Información adicional
  const [precioMin, setPrecioMin] = useState<string>('');
  const [precioMax, setPrecioMax] = useState<string>('');
  const [duracionEstimada, setDuracionEstimada] = useState<string>('60');

  // Ubicaciones dinámicas desde backend (DB)
  const [regiones, setRegiones] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [zonas, setZonas] = useState<any[]>([]);

  // Modales y estados de guardado
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');

  // Cargar regiones al inicializar
  useEffect(() => {
    let isMounted = true;
    api.getRegiones()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setRegiones(data);
          if (data.length > 0 && !regionId) {
            setRegionId(data[0].id);
          }
        }
      })
      .catch((err) => console.warn('Error al cargar regiones:', err));
    return () => { isMounted = false; };
  }, []);

  // Cargar departamentos cuando cambia regionId
  useEffect(() => {
    if (!regionId) {
      setDepartamentos([]);
      setDepartamentoId('');
      return;
    }
    let isMounted = true;
    api.getDepartamentos(regionId)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setDepartamentos(data);
          if (data.length > 0 && (!departamentoId || !data.some((d) => d.id === departamentoId))) {
            setDepartamentoId(data[0].id);
          }
        }
      })
      .catch((err) => console.warn('Error al cargar departamentos:', err));
    return () => { isMounted = false; };
  }, [regionId]);

  // Cargar zonas cuando cambia departamentoId
  useEffect(() => {
    if (!departamentoId) {
      setZonas([]);
      setZonaId('');
      return;
    }
    let isMounted = true;
    api.getZonas(departamentoId)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setZonas(data);
        }
      })
      .catch((err) => console.warn('Error al cargar zonas:', err));
    return () => { isMounted = false; };
  }, [departamentoId]);

  // Filtrar POIs del prestador
  const myPois = useMemo(() => {
    if (currentUser?.role === 'admin') return pois;
    return pois.filter((p) => (providerId && p.createdBy === providerId) || p.fuente === 'prestador');
  }, [pois, currentUser, providerId]);

  const triggerToast = (msg: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  // Validaciones por paso
  const getStepErrors = (step: number): string[] => {
    const errors: string[] = [];
    if (step === 1) {
      if (!name.trim()) errors.push('El nombre del negocio es obligatorio (mínimo 2 caracteres).');
      else if (name.trim().length < 2) errors.push('El nombre debe tener al menos 2 caracteres.');
      if (!description.trim()) errors.push('La descripción es obligatoria.');
      else if (description.trim().length < 10) errors.push('La descripción debe tener al menos 10 caracteres.');
      if (selectedCategoryIds.length === 0) errors.push('Debe seleccionar al menos una categoría.');
    } else if (step === 2) {
      if (!address.trim()) errors.push('La dirección física es obligatoria.');
      else if (address.trim().length < 5) errors.push('La dirección debe tener al menos 5 caracteres.');
      if (!regionId) errors.push('Debe seleccionar una región.');
      if (!departamentoId) errors.push('Debe seleccionar un departamento.');
      const latNum = parseFloat(lat);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) errors.push('La latitud debe estar entre -90 y 90.');
      const lngNum = parseFloat(lng);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) errors.push('La longitud debe estar entre -180 y 180.');
    } else if (step === 3) {
      if (email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) errors.push('El email no tiene un formato válido.');
      }
      if (phone.trim()) {
        const phoneRegex = /^\+?[0-9\s-]{6,20}$/;
        if (!phoneRegex.test(phone.trim())) errors.push('El teléfono debe tener entre 6 y 20 dígitos numéricos.');
      }
    } else if (step === 4) {
      // Horarios opcionales pero si se cargaron deben ser válidos
    } else if (step === 5) {
      // Fotos opcionales pero recomendadas
    } else if (step === 6) {
      if (precioMin && precioMax) {
        const pMin = parseFloat(precioMin);
        const pMax = parseFloat(precioMax);
        if (pMin > pMax) errors.push('El precio mínimo no puede superar al precio máximo.');
      }
    }
    return errors;
  };

  const currentStepErrors = getStepErrors(currentStep);

  const handleNextStep = () => {
    const errs = getStepErrors(currentStep);
    if (errs.length > 0) {
      triggerToast(errs[0], 'warning');
      return;
    }
    if (currentStep < 6) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep > maxStepReached) {
        setMaxStepReached(nextStep);
      }
    } else {
      // Abre la vista previa final (Criterio 44)
      setShowPreviewModal(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToStep = (step: number) => {
    if (step <= maxStepReached) {
      setCurrentStep(step);
    }
  };

  // Agregar horario con validación de superposición
  const handleAddHorario = () => {
    setHorarioError(null);
    if (nuevaHoraHasta <= nuevaHoraDesde) {
      setHorarioError('La hora de cierre debe ser posterior a la de apertura.');
      return;
    }

    // Comprobar superposición en el mismo día
    const solapado = horariosList.some((h) => {
      if (h.diaSemanaDesde === nuevoDia) {
        return nuevaHoraDesde < h.horaHasta && nuevaHoraHasta > h.horaDesde;
      }
      return false;
    });

    if (solapado) {
      setHorarioError('El rango horario se superpone con otro horario existente para ese mismo día.');
      return;
    }

    const entry: ScheduleEntry = {
      id: `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      diaSemanaDesde: nuevoDia,
      horaDesde: nuevaHoraDesde,
      diaSemanaHasta: nuevoDia,
      horaHasta: nuevaHoraHasta,
    };

    setHorariosList((prev) => [...prev, entry]);
  };

  const handleRemoveHorario = (id: string) => {
    setHorariosList((prev) => prev.filter((h) => h.id !== id));
  };

  const handleAddPresetHorarios = (presetType: 'semana' | 'completo' | 'finde') => {
    if (presetType === 'semana') {
      const entries: ScheduleEntry[] = [1, 2, 3, 4, 5].map((d) => ({
        id: `sch-${Date.now()}-${d}`,
        diaSemanaDesde: d,
        horaDesde: '09:00',
        diaSemanaHasta: d,
        horaHasta: '18:00',
      }));
      setHorariosList(entries);
    } else if (presetType === 'completo') {
      const entries: ScheduleEntry[] = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
        id: `sch-${Date.now()}-${d}`,
        diaSemanaDesde: d,
        horaDesde: '09:00',
        diaSemanaHasta: d,
        horaHasta: '20:00',
      }));
      setHorariosList(entries);
    } else if (presetType === 'finde') {
      const entries: ScheduleEntry[] = [6, 0].map((d) => ({
        id: `sch-${Date.now()}-${d}`,
        diaSemanaDesde: d,
        horaDesde: '10:00',
        diaSemanaHasta: d,
        horaHasta: '19:00',
      }));
      setHorariosList((prev) => [...prev, ...entries]);
    }
  };

  // Manejo de fotos con límite de 30 MB (US-CYN-02 Criterio 43)
  const handleDeviceImageUpload = async (fileList: FileList | File[]) => {
    setFileSizeError(null);
    const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
    if (files.length === 0) return;

    // Verificar límite <= 30 MB por archivo
    const oversized = files.find((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      const sizeMb = (oversized.size / (1024 * 1024)).toFixed(1);
      const msg = `El archivo "${oversized.name}" pesa ${sizeMb} MB. El límite máximo permitido es de ${MAX_FILE_SIZE_MB} MB por foto.`;
      setFileSizeError(msg);
      triggerToast(msg, 'warning');
      return;
    }

    if (images.length + files.length > generalParams.maxImagesPerPOI) {
      triggerToast(`Límite superado. Máximo configurado: ${generalParams.maxImagesPerPOI} fotos.`, 'warning');
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
      console.error('Error al subir imágenes:', err);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleStartCreate = () => {
    setName('');
    setDescription('');
    const activeCats = categories.filter((c) => c.enabled);
    setSelectedCategoryIds(activeCats.length > 0 ? [activeCats[0].id] : []);
    setAddress('');
    if (regiones.length > 0) setRegionId(regiones[0].id);
    if (departamentos.length > 0) setDepartamentoId(departamentos[0].id);
    setZonaId('');
    setLat('-32.8900');
    setLng('-68.8400');
    setPhone('');
    setEmail('');
    setWebsite('');
    setInstagram('');
    setHorariosList([]);
    setImages([]);
    setPrecioMin('');
    setPrecioMax('');
    setDuracionEstimada('60');
    setSelectedPoi(null);
    setCurrentStep(1);
    setMaxStepReached(1);
    setViewMode('create');
  };

  const handleStartEdit = (poi: POI) => {
    setSelectedPoi(poi);
    setName(poi.name || '');
    setDescription(poi.description || '');
    
    // Categorías
    if (poi.categoriaIds && poi.categoriaIds.length > 0) {
      setSelectedCategoryIds(poi.categoriaIds);
    } else {
      const matchCat = categories.find((c) => c.name.toLowerCase() === poi.category.toLowerCase());
      setSelectedCategoryIds(matchCat ? [matchCat.id] : []);
    }

    setAddress(poi.address || '');
    if (poi.regionId) setRegionId(poi.regionId);
    if (poi.departamentoId) setDepartamentoId(poi.departamentoId);
    if (poi.zonaId) setZonaId(poi.zonaId);
    setLat(poi.location?.lat?.toString() || '-32.8900');
    setLng(poi.location?.lng?.toString() || '-68.8400');
    setPhone(poi.phone || '');
    setEmail(poi.email || '');
    setWebsite(poi.website || '');
    setInstagram(poi.instagram || '');
    
    if (Array.isArray(poi.horarios)) {
      setHorariosList(poi.horarios.map((h: any, idx: number) => ({
        id: h.id || `h-${idx}`,
        diaSemanaDesde: h.diaSemanaDesde ?? 1,
        horaDesde: h.horaDesde ?? '09:00',
        diaSemanaHasta: h.diaSemanaHasta ?? 1,
        horaHasta: h.horaHasta ?? '18:00',
      })));
    } else {
      setHorariosList([]);
    }

    setImages(poi.images || []);
    setPrecioMin(poi.precioMin !== undefined ? String(poi.precioMin) : '');
    setPrecioMax(poi.precioMax !== undefined ? String(poi.precioMax) : '');
    setDuracionEstimada(poi.duracionEstimada ? String(poi.duracionEstimada) : '60');
    
    setCurrentStep(1);
    setMaxStepReached(6);
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
        images.length > 0 ||
        horariosList.length > 0
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

  // Guardado real en Backend y Base de Datos (US-CYN-02 Criterio 46)
  const handleConfirmSaveBusiness = async () => {
    setIsSubmitting(true);

    const payloadPoi: any = {
      name: name.trim(),
      description: description.trim(),
      category: categories.find((c) => selectedCategoryIds.includes(c.id))?.name || 'General',
      categoriaIds: selectedCategoryIds,
      address: address.trim(),
      departamentoId,
      regionId,
      zonaId: zonaId || undefined,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      instagram: instagram.trim() || undefined,
      images,
      duracionEstimada: duracionEstimada ? parseInt(duracionEstimada, 10) : undefined,
      precioMin: precioMin ? parseFloat(precioMin) : undefined,
      precioMax: precioMax ? parseFloat(precioMax) : undefined,
      horarios: horariosList.map((h) => ({
        diaSemanaDesde: h.diaSemanaDesde,
        horaDesde: h.horaDesde,
        diaSemanaHasta: h.diaSemanaHasta,
        horaHasta: h.horaHasta,
      })),
    };

    try {
      if (viewMode === 'create') {
        const result = await addPOI(payloadPoi);
        if (result.success) {
          triggerToast('¡Establecimiento registrado con éxito! El negocio queda en estado "Pendiente de validación".', 'success');
          setShowPreviewModal(false);
          setViewMode('list');
        } else {
          triggerToast(result.error || 'Error al registrar el negocio en el servidor.', 'warning');
        }
      } else if (viewMode === 'edit' && selectedPoi) {
        const updated: POI = {
          ...selectedPoi,
          ...payloadPoi,
          status: 'pending', // Regla de negocio: vuelve a pendiente tras edición
          updatedAt: new Date().toISOString(),
        };
        const result = await updatePOI(updated);
        if (result.success) {
          triggerToast('Establecimiento actualizado con éxito. Ha sido enviado nuevamente a revisión.', 'success');
          setShowPreviewModal(false);
          setViewMode('list');
        } else {
          triggerToast(result.error || 'Error al actualizar el negocio en el servidor.', 'warning');
        }
      }
    } catch (err: any) {
      triggerToast(err.message || 'Ocurrió un error inesperado al guardar.', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryNames = useMemo(() => {
    return categories.filter((c) => selectedCategoryIds.includes(c.id)).map((c) => c.name);
  }, [categories, selectedCategoryIds]);

  const selectedRegionName = useMemo(() => {
    return regiones.find((r) => r.id === regionId)?.nombre || 'Región';
  }, [regiones, regionId]);

  const selectedDeptoName = useMemo(() => {
    return departamentos.find((d) => d.id === departamentoId)?.nombre || 'Departamento';
  }, [departamentos, departamentoId]);

  const selectedZonaName = useMemo(() => {
    return zonas.find((z) => z.id === zonaId)?.nombre;
  }, [zonas, zonaId]);

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 animate-slide-in max-w-md ${
          toastType === 'success' ? 'bg-green-700' : 'bg-orange-600'
        }`}>
          {toastType === 'success' ? (
            <Check className="h-5 w-5 text-white flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" />
          )}
          <span className="text-xs font-semibold leading-normal">{toastMessage}</span>
        </div>
      )}

      {/* Discard Changes Modal (Criterio 47) */}
      {showDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/5 animate-scale-up space-y-4">
            <div className="flex items-center space-x-2.5 text-orange-600">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-wixDisplay font-bold text-textDark">¿Descartar cambios?</h4>
            </div>
            <p className="text-xs text-textDark/70 leading-relaxed">
              Tienes datos ingresados en el asistente de creación. Si sales ahora, todos los cambios se descartarán sin guardar.
            </p>
            <div className="flex space-x-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardModal(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
              >
                Continuar Editando
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardModal(false);
                  setViewMode('list');
                }}
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
                Publica y gestiona tus establecimientos en Mendoza, consulta su estado de aprobación formal y mantén tu oferta actualizada.
              </p>
            </div>
            <button
              onClick={handleStartCreate}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer self-start sm:self-center"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Crear Negocio</span>
            </button>
          </div>

          {/* Grid of existing businesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPois.map((poi) => (
              <div 
                key={poi.id}
                className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
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
                      ? 'bg-amber-400 text-amber-950 border-amber-300 font-extrabold'
                      : poi.status === 'rejected'
                      ? 'bg-red-600 text-white border-red-500'
                      : 'bg-orange-600 text-white border-orange-500'
                  }`}>
                    {poi.status === 'approved' && 'Publicado'}
                    {poi.status === 'pending' && 'Pendiente de validación'}
                    {poi.status === 'rejected' && 'Rechazado'}
                    {poi.status === 'correction' && 'Cambios Solicitados'}
                  </span>
                </div>

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
                  <h4 className="font-wixDisplay text-sm font-bold text-textDark">No tienes negocios registrados</h4>
                  <p className="text-xs text-textDark/50 mt-1 max-w-sm leading-relaxed">
                    Crea tu primer establecimiento turístico mediante nuestro asistente guiado de 6 pasos.
                  </p>
                </div>
                <button
                  onClick={handleStartCreate}
                  className="px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-xs shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Comenzar Asistente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- VIEW 2: 6-STEP INTERACTIVE WIZARD (US-CYN-02) -------------------- */}
      {viewMode !== 'list' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-black/5">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-black/5 rounded-xl text-textDark/60 transition-colors cursor-pointer"
                title="Cancelar y volver"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h3 className="font-wixDisplay text-xl font-bold text-accentWine">
                  {viewMode === 'create' ? 'Crear Nuevo Negocio Turístico (CYN-02)' : `Editar Negocio: ${selectedPoi?.name}`}
                </h3>
                <p className="text-xs text-textDark/55 mt-0.5">
                  Asistente interactivo de 6 pasos con validación progresiva y persistencia directa.
                </p>
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="text-xs font-bold text-textDark/50 hover:text-textDark px-3 py-1.5 rounded-lg border border-black/10 hover:bg-black/5 transition-colors cursor-pointer"
            >
              Cancelar y volver
            </button>
          </div>

          {/* Stepper Navigation Indicator */}
          <div className="bg-white rounded-2xl border border-black/5 p-4 shadow-xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { step: 1, title: 'Básica', subtitle: 'Nombre y rubro' },
                { step: 2, title: 'Ubicación', subtitle: 'Cascada y mapa' },
                { step: 3, title: 'Contacto', subtitle: 'Email, tel y redes' },
                { step: 4, title: 'Horarios', subtitle: 'Atención semanal' },
                { step: 5, title: 'Fotos', subtitle: 'Galería (<= 30 MB)' },
                { step: 6, title: 'Adicional', subtitle: 'Precios y tiempo' },
              ].map((item) => {
                const isCurrent = currentStep === item.step;
                const isPassed = currentStep > item.step;
                const isAccessible = item.step <= maxStepReached;

                return (
                  <button
                    key={item.step}
                    type="button"
                    disabled={!isAccessible}
                    onClick={() => handleJumpToStep(item.step)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-accentWine bg-accentWine/5 ring-1 ring-accentWine shadow-2xs'
                        : isPassed
                        ? 'border-green-200 bg-green-50/50 hover:bg-green-50 text-green-900 cursor-pointer'
                        : isAccessible
                        ? 'border-black/5 bg-bgPrimary/40 hover:bg-bgPrimary text-textDark/70 cursor-pointer'
                        : 'border-black/5 bg-black/2 text-textDark/30 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${
                      isCurrent
                        ? 'bg-accentWine text-white'
                        : isPassed
                        ? 'bg-green-600 text-white'
                        : 'bg-black/10 text-textDark/60'
                    }`}>
                      {isPassed ? <Check className="h-3.5 w-3.5" /> : item.step}
                    </div>
                    <div className="truncate">
                      <span className={`block text-[11px] font-bold ${isCurrent ? 'text-accentWine' : 'text-textDark'}`}>
                        {item.title}
                      </span>
                      <span className="block text-[9px] text-textDark/45 truncate">
                        {item.subtitle}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Validation Warning Alert */}
          {currentStepErrors.length > 0 && (
            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-200 flex items-start space-x-3 text-xs text-orange-900">
              <AlertTriangle className="h-4.5 w-4.5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Para avanzar complete los campos obligatorios:</p>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                  {currentStepErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Content Card by Step */}
          <div className="bg-white rounded-2xl border border-black/5 p-6 sm:p-8 shadow-sm">
            {/* PASO 1: INFORMACIÓN BÁSICA */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div>
                  <h4 className="font-wixDisplay text-lg font-bold text-textDark">Paso 1: Información básica del negocio</h4>
                  <p className="text-xs text-textDark/60 mt-1">
                    Indica la identidad de tu establecimiento turístico y las categorías principales en las que operas.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      Nombre comercial del negocio *
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Bodega Los Andes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      Categorías de servicio * (Seleccione al menos una)
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {categories.map((cat) => {
                        const isSelected = selectedCategoryIds.includes(cat.id);
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategoryIds((prev) =>
                                isSelected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                              );
                            }}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 border ${
                              isSelected
                                ? 'bg-accentWine text-white border-accentWine shadow-2xs'
                                : 'bg-bgPrimary text-textDark/70 border-black/5 hover:bg-black/5'
                            }`}
                          >
                            <span>{cat.name}</span>
                            {isSelected && <Check className="h-3 w-3" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      Descripción general del negocio * (Mín. 10 y máx. 500 caract.)
                    </label>
                    <div className="relative">
                      <textarea
                        rows={4}
                        maxLength={500}
                        placeholder="Detalla los servicios, experiencias, productos o propuestas ofrecidas para los visitantes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm leading-relaxed"
                      />
                      <span className="absolute bottom-3 right-3 text-[10px] text-textDark/40 font-bold">
                        {description.length} / 500
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2: UBICACIÓN (SELECCIÓN EN CASCADA Y COORDENADAS) */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div>
                  <h4 className="font-wixDisplay text-lg font-bold text-textDark">Paso 2: Ubicación geográfica</h4>
                  <p className="text-xs text-textDark/60 mt-1">
                    Selección en cascada por Región, Departamento y Zona de Mendoza, junto con la dirección física y coordenadas GPS.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      1. Región *
                    </label>
                    <select
                      value={regionId}
                      onChange={(e) => setRegionId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-xs font-bold cursor-pointer"
                    >
                      <option value="">Seleccione Región</option>
                      {regiones.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      2. Departamento *
                    </label>
                    <select
                      value={departamentoId}
                      onChange={(e) => setDepartamentoId(e.target.value)}
                      disabled={departamentos.length === 0}
                      className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-xs font-bold cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Seleccione Departamento</option>
                      {departamentos.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      3. Zona (Opcional)
                    </label>
                    <select
                      value={zonaId}
                      onChange={(e) => setZonaId(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-xs font-semibold cursor-pointer"
                    >
                      <option value="">Sin zona específica</option>
                      {zonas.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                    Dirección física completa *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Ruta Provincial 60 Km 15, Cruz de Piedra"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      Latitud GPS * (-90 a 90)
                    </label>
                    <input
                      type="text"
                      placeholder="-32.8894"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      Longitud GPS * (-180 a 180)
                    </label>
                    <input
                      type="text"
                      placeholder="-68.8681"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-mono font-semibold"
                    />
                  </div>
                </div>

                {/* Preajustes rápidos */}
                <div className="flex items-center space-x-2 text-xs pt-1">
                  <span className="text-textDark/50 font-bold">Puntos de muestra:</span>
                  <button
                    type="button"
                    onClick={() => { setLat('-32.8894'); setLng('-68.8681'); }}
                    className="px-2.5 py-1 bg-bgPrimary hover:bg-black/5 rounded-md text-[11px] font-semibold text-accentWine"
                  >
                    Ciudad Mendoza
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLat('-33.0039'); setLng('-68.8785'); }}
                    className="px-2.5 py-1 bg-bgPrimary hover:bg-black/5 rounded-md text-[11px] font-semibold text-accentWine"
                  >
                    Luján de Cuyo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLat('-32.9781'); setLng('-68.7852'); }}
                    className="px-2.5 py-1 bg-bgPrimary hover:bg-black/5 rounded-md text-[11px] font-semibold text-accentWine"
                  >
                    Maipú
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3: DATOS DE CONTACTO */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div>
                  <h4 className="font-wixDisplay text-lg font-bold text-textDark">Paso 3: Canales de contacto comercial</h4>
                  <p className="text-xs text-textDark/60 mt-1">
                    Permite que los turistas se comuniquen directamente, visiten tu sitio web o sigan tus redes sociales.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2 flex items-center space-x-1.5">
                      <Phone className="h-3.5 w-3.5 text-accentWine" />
                      <span>Teléfono / WhatsApp</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. +54 9 261 4123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2 flex items-center space-x-1.5">
                      <Mail className="h-3.5 w-3.5 text-accentWine" />
                      <span>Email de contacto comercial</span>
                    </label>
                    <input
                      type="email"
                      placeholder="contacto@nonegocio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2 flex items-center space-x-1.5">
                      <Globe className="h-3.5 w-3.5 text-accentWine" />
                      <span>Sitio web oficial</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://www.minegocio.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2 flex items-center space-x-1.5">
                      <InstagramIcon className="h-3.5 w-3.5 text-accentWine" />
                      <span>Instagram (@usuario)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="@minegocio_mza"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASO 4: HORARIOS DE ATENCIÓN */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h4 className="font-wixDisplay text-lg font-bold text-textDark">Paso 4: Horarios de atención</h4>
                    <p className="text-xs text-textDark/60 mt-1">
                      Carga dinámica de rangos horarios por día con validación de superposición.
                    </p>
                  </div>
                  {/* Presets */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddPresetHorarios('semana')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-bgPrimary hover:bg-black/5 text-accentWine rounded-lg border border-black/5"
                    >
                      Lun-Vie 9-18
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetHorarios('completo')}
                      className="px-2.5 py-1 text-[11px] font-bold bg-bgPrimary hover:bg-black/5 text-accentWine rounded-lg border border-black/5"
                    >
                      Todos los días 9-20
                    </button>
                  </div>
                </div>

                {/* Formulario de franja */}
                <div className="p-4 bg-bgPrimary/50 rounded-xl border border-black/5 space-y-3">
                  <span className="text-xs font-bold text-textDark/70 block">Agregar nueva franja horaria:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-textDark/60 mb-1">Día</label>
                      <select
                        value={nuevoDia}
                        onChange={(e) => setNuevoDia(parseInt(e.target.value, 10))}
                        className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-xs font-bold"
                      >
                        {DIAS_SEMANA.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-textDark/60 mb-1">Apertura</label>
                      <input
                        type="time"
                        value={nuevaHoraDesde}
                        onChange={(e) => setNuevaHoraDesde(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-textDark/60 mb-1">Cierre</label>
                      <input
                        type="time"
                        value={nuevaHoraHasta}
                        onChange={(e) => setNuevaHoraHasta(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-black/10 bg-white text-xs font-semibold"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={handleAddHorario}
                        className="w-full py-2 bg-fillPrimary hover:bg-fillPrimary/90 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>

                  {horarioError && (
                    <p className="text-xs font-bold text-red-600 flex items-center space-x-1 pt-1">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                      <span>{horarioError}</span>
                    </p>
                  )}
                </div>

                {/* Lista de franjas */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-textDark/70 block">
                    Franjas configuradas ({horariosList.length}):
                  </span>
                  {horariosList.length === 0 ? (
                    <p className="text-xs text-textDark/45 italic p-3 bg-bgPrimary/20 rounded-lg">
                      No hay horarios cargados aún. Puedes agregarlos individualmente o usar los preajustes arriba.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {horariosList.map((h) => {
                        const diaObj = DIAS_SEMANA.find((d) => d.id === h.diaSemanaDesde);
                        return (
                          <div
                            key={h.id}
                            className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-black/10 shadow-2xs text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <Clock className="h-3.5 w-3.5 text-accentWine" />
                              <span className="font-bold text-textDark">{diaObj?.nombre}:</span>
                              <span className="text-textDark/70">{h.horaDesde} a {h.horaHasta} hs</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveHorario(h.id)}
                              className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                              title="Eliminar franja"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASO 5: FOTOS DEL NEGOCIO (LÍMITE 30 MB - US-CYN-02 Criterio 43) */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div>
                  <h4 className="font-wixDisplay text-lg font-bold text-textDark">Paso 5: Galería de fotos del negocio</h4>
                  <p className="text-xs text-textDark/60 mt-1">
                    Carga fotografías de tu local (límite máximo de 30 MB por archivo). Puedes visualizarlas o eliminarlas antes de guardar.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleDeviceImageUpload(e.target.files);
                  }}
                />

                <div
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    if (e.dataTransfer.files) handleDeviceImageUpload(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2.5 ${
                    dragActive
                      ? 'border-fillPrimary bg-fillPrimary/5 scale-[1.01]'
                      : 'border-black/10 hover:border-fillPrimary/60 bg-bgPrimary/40 hover:bg-bgPrimary/70'
                  }`}
                >
                  <UploadCloud className="h-10 w-10 text-fillPrimary/70" />
                  <div>
                    <p className="text-xs font-bold text-textDark">
                      Arrastra tus fotos aquí o haz clic para explorar desde tu dispositivo
                    </p>
                    <p className="text-[11px] text-textDark/50 mt-1">
                      PNG, JPG, WEBP • <strong>Límite estricto: hasta 30 MB por archivo</strong> • Máx. {generalParams.maxImagesPerPOI} fotos
                    </p>
                  </div>
                </div>

                {fileSizeError && (
                  <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-800 flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span>{fileSizeError}</span>
                  </div>
                )}

                {isUploading && (
                  <div className="p-4 bg-bgPrimary/60 rounded-xl border border-black/5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="flex items-center text-textDark/70">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-fillPrimary mr-2" />
                        Subiendo fotos...
                      </span>
                      <span className="text-fillPrimary">{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-fillPrimary transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <span className="text-xs font-bold text-textDark/70 block">
                    Fotos cargadas ({images.length} / {generalParams.maxImagesPerPOI})
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {images.map((imgUrl, idx) => (
                      <div key={idx} className="group relative h-28 rounded-xl overflow-hidden border border-black/10 bg-bgPrimary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Portada
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setImages((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg cursor-pointer"
                            title="Eliminar foto"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {images.length === 0 && (
                      <div className="col-span-2 sm:col-span-4 border border-black/5 rounded-xl py-6 text-center text-xs text-textDark/40">
                        No has cargado ninguna fotografía todavía.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PASO 6: INFORMACIÓN ADICIONAL */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div>
                  <h4 className="font-wixDisplay text-lg font-bold text-textDark">Paso 6: Información adicional y precios</h4>
                  <p className="text-xs text-textDark/60 mt-1">
                    Establece el rango estimado de costos para el turista y la duración promedio recomendada de la visita.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2 flex items-center space-x-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-accentWine" />
                      <span>Precio estimado mínimo ($ ARS)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Ej. 2000"
                      value={precioMin}
                      onChange={(e) => setPrecioMin(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2 flex items-center space-x-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-accentWine" />
                      <span>Precio estimado máximo ($ ARS)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Ej. 10000"
                      value={precioMax}
                      onChange={(e) => setPrecioMax(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2 flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-accentWine" />
                      <span>Duración estimada de la visita (minutos)</span>
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="15"
                        step="15"
                        placeholder="60"
                        value={duracionEstimada}
                        onChange={(e) => setDuracionEstimada(e.target.value)}
                        className="w-40 px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-accentWine text-sm font-semibold"
                      />
                      <span className="text-xs text-textDark/60">
                        {duracionEstimada ? `${Math.floor(parseInt(duracionEstimada, 10) / 60)}h ${parseInt(duracionEstimada, 10) % 60}min` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper Footer / Next and Prev actions */}
            <div className="pt-8 mt-8 border-t border-black/5 flex items-center justify-between">
              <button
                type="button"
                disabled={currentStep === 1}
                onClick={handlePrevStep}
                className="px-5 py-2.5 border border-black/10 hover:bg-black/5 text-textDark/75 font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-6 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <span>{currentStep === 6 ? 'Ver Resumen y Vista Previa' : 'Continuar al Paso ' + (currentStep + 1)}</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MODAL DE RESUMEN Y VISTA PREVIA (US-CYN-02 Criterios 44, 45, 46) -------------------- */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-black/5 animate-scale-up flex flex-col justify-between">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-black/5 flex items-center justify-between z-10">
              <div>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Vista Previa de la Ficha del Negocio</h4>
                <p className="text-[11px] text-textDark/60">Revisa la información consolidada antes de enviar la propuesta formal.</p>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-black/5 rounded-full text-textDark/50 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body / Emulated Card */}
            <div className="p-6 space-y-6">
              {/* Cover & Badges */}
              <div className="relative h-52 w-full rounded-2xl overflow-hidden bg-bgPrimary border border-black/5">
                {images.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[0]} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-textDark/30 text-xs font-semibold">
                    <ImageIcon className="h-8 w-8 mr-2" /> Sin foto de portada
                  </div>
                )}

                {/* State Badge: Pendiente de validación (Criterio 44 & 46) */}
                <div className="absolute top-3 right-3">
                  <span className="bg-amber-400 text-amber-950 font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md border border-amber-300 flex items-center space-x-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>Pendiente de validación</span>
                  </span>
                </div>

                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {selectedCategoryNames.map((cat, i) => (
                    <span key={i} className="bg-accentWine text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-md">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="font-wixDisplay text-2xl font-bold text-textDark">{name || 'Sin nombre asignado'}</h3>
                <p className="text-xs text-textDark/75 leading-relaxed bg-bgPrimary/40 p-3.5 rounded-xl border border-black/5">
                  {description || 'Sin descripción.'}
                </p>
              </div>

              {/* Location & Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-bgPrimary/40 rounded-xl border border-black/5 space-y-1.5">
                  <span className="font-bold text-textDark uppercase text-[10px] tracking-wider block">Ubicación</span>
                  <p className="font-medium text-textDark flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-fillPrimary flex-shrink-0" />
                    <span>{address || 'Sin dirección'}</span>
                  </p>
                  <p className="text-[11px] text-textDark/60 pl-4.5">
                    {selectedDeptoName}, {selectedRegionName} {selectedZonaName ? `(${selectedZonaName})` : ''}
                  </p>
                  <p className="text-[10px] font-mono text-textDark/45 pl-4.5">
                    Coordenadas: {lat}, {lng}
                  </p>
                </div>

                <div className="p-4 bg-bgPrimary/40 rounded-xl border border-black/5 space-y-1.5">
                  <span className="font-bold text-textDark uppercase text-[10px] tracking-wider block">Contacto y Visita</span>
                  {phone && (
                    <p className="text-textDark flex items-center">
                      <Phone className="h-3 w-3 mr-1.5 text-accentWine" />
                      <span>{phone}</span>
                    </p>
                  )}
                  {email && (
                    <p className="text-textDark flex items-center">
                      <Mail className="h-3 w-3 mr-1.5 text-accentWine" />
                      <span>{email}</span>
                    </p>
                  )}
                  {website && (
                    <p className="text-textDark flex items-center truncate">
                      <Globe className="h-3 w-3 mr-1.5 text-accentWine" />
                      <span className="truncate">{website}</span>
                    </p>
                  )}
                  {instagram && (
                    <p className="text-textDark flex items-center">
                      <InstagramIcon className="h-3 w-3 mr-1.5 text-accentWine" />
                      <span>{instagram}</span>
                    </p>
                  )}
                  <p className="text-[11px] text-textDark/60 pt-1">
                    Duración: {duracionEstimada} min • Rango: ${precioMin || '0'} - ${precioMax || 'Consultar'}
                  </p>
                </div>
              </div>

              {/* Horarios */}
              {horariosList.length > 0 && (
                <div className="p-4 bg-bgPrimary/40 rounded-xl border border-black/5 space-y-1.5 text-xs">
                  <span className="font-bold text-textDark uppercase text-[10px] tracking-wider block">Horarios de atención</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {horariosList.map((h) => {
                      const diaObj = DIAS_SEMANA.find((d) => d.id === h.diaSemanaDesde);
                      return (
                        <div key={h.id} className="bg-white p-2 rounded-lg border border-black/5 text-[11px]">
                          <strong>{diaObj?.nombre}:</strong> {h.horaDesde} - {h.horaHasta} hs
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions (Criterios 45 y 46) */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-4 border-t border-black/5 flex items-center justify-end space-x-3 z-10">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 border border-black/10 hover:bg-black/5 text-textDark font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Editar
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSaveBusiness}
                className="px-6 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/15 hover:shadow-lg transition-all cursor-pointer flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando en el servidor...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Guardar Negocio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
