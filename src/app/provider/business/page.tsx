'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  CheckCircle2,
  Sparkles,
  RefreshCw,
  CheckSquare,
  Square
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
  { id: 1, nombre: 'Lunes', corto: 'Lun' },
  { id: 2, nombre: 'Martes', corto: 'Mar' },
  { id: 3, nombre: 'Miércoles', corto: 'Mié' },
  { id: 4, nombre: 'Jueves', corto: 'Jue' },
  { id: 5, nombre: 'Viernes', corto: 'Vie' },
  { id: 6, nombre: 'Sábado', corto: 'Sáb' },
  { id: 0, nombre: 'Domingo', corto: 'Dom' },
];

const MAX_FILE_SIZE_MB = 30;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; // 30 MB (Regla de negocio US-CYN-02)

export default function BusinessProfile() {
  const router = useRouter();
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
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Step 3: Contacto
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  // Step 4: Horarios (multiselección de días como en Ando App)
  const [horariosList, setHorariosList] = useState<ScheduleEntry[]>([]);
  const [selectedDraftDias, setSelectedDraftDias] = useState<number[]>([1, 2, 3, 4, 5]); // Lunes a Viernes por defecto
  const [nuevaHoraDesde, setNuevaHoraDesde] = useState('09:00');
  const [nuevaHoraHasta, setNuevaHoraHasta] = useState('18:00');
  const [horarioError, setHorarioError] = useState<string | null>(null);
  const [horarioToDelete, setHorarioToDelete] = useState<ScheduleEntry | null>(null);

  const toggleDraftDia = (diaNum: number) => {
    if (selectedDraftDias.includes(diaNum)) {
      if (selectedDraftDias.length > 1) {
        setSelectedDraftDias(selectedDraftDias.filter((d) => d !== diaNum));
      }
    } else {
      setSelectedDraftDias([...selectedDraftDias, diaNum]);
    }
  };

  // Step 5: Fotos (Gestión Multimedia US-GIT-07)
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  
  // Selección múltiple, reemplazo y eliminación masiva (US-GIT-07)
  const [selectedImageIndices, setSelectedImageIndices] = useState<number[]>([]);
  const [replaceImageIdx, setReplaceImageIdx] = useState<number | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  const [deleteImageConfirmConfig, setDeleteImageConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isBulk: boolean;
    targetIdx?: number;
  } | null>(null);

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
      if (!lat.trim()) {
        errors.push('La latitud es obligatoria.');
      } else {
        const latNum = parseFloat(lat);
        if (isNaN(latNum) || latNum < -90 || latNum > 90) errors.push('La latitud debe estar entre -90 y 90.');
      }
      if (!lng.trim()) {
        errors.push('La longitud es obligatoria.');
      } else {
        const lngNum = parseFloat(lng);
        if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) errors.push('La longitud debe estar entre -180 y 180.');
      }
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

  // Agregar horario con selección múltiple de días y validación de superposición (igual a Ando App)
  const handleAddHorario = () => {
    setHorarioError(null);
    if (nuevaHoraHasta <= nuevaHoraDesde) {
      setHorarioError('La hora de cierre debe ser posterior a la de apertura.');
      return;
    }
    if (selectedDraftDias.length === 0) {
      setHorarioError('Seleccioná al menos un día de la semana.');
      return;
    }

    const newEntries: ScheduleEntry[] = [];
    let overlapCount = 0;

    for (const diaNum of selectedDraftDias) {
      const solapado = horariosList.some(
        (h) => h.diaSemanaDesde === diaNum && nuevaHoraDesde < h.horaHasta && nuevaHoraHasta > h.horaDesde
      );
      if (solapado) {
        overlapCount++;
      } else {
        newEntries.push({
          id: `sch-${Date.now()}-${diaNum}-${Math.random().toString(36).slice(2, 6)}`,
          diaSemanaDesde: diaNum,
          horaDesde: nuevaHoraDesde,
          diaSemanaHasta: diaNum,
          horaHasta: nuevaHoraHasta,
        });
      }
    }

    if (newEntries.length > 0) {
      setHorariosList((prev) => [...prev, ...newEntries]);
    }

    if (overlapCount > 0 && newEntries.length === 0) {
      setHorarioError('Los días seleccionados ya tienen horarios que se superponen.');
    } else if (overlapCount > 0) {
      setHorarioError('Se agregaron algunos días, pero otros tenían horarios superpuestos.');
    }
  };

  const handleRemoveHorario = (id: string) => {
    setHorariosList((prev) => prev.filter((h) => h.id !== id));
  };

  const handleRequestRemoveHorario = (h: ScheduleEntry) => {
    setHorarioToDelete(h);
  };

  const handleConfirmRemoveHorario = () => {
    if (!horarioToDelete) return;
    handleRemoveHorario(horarioToDelete.id);
    setHorarioToDelete(null);
    triggerToast('Horario eliminado exitosamente', 'success');
  };

  const handleCancelRemoveHorario = () => {
    setHorarioToDelete(null);
    triggerToast('Operación cancelada', 'warning');
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

  // Manejo de fotos con validaciones y acciones US-GIT-07
  const handleDeviceImageUpload = async (fileList: FileList | File[], replaceTargetIdx?: number) => {
    setFileSizeError(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

    // Validar formato (JPG, PNG, WEBP) - US-GIT-07 Criterio 34
    const invalidFormat = files.find((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      const mime = f.type.toLowerCase();
      const isMimeValid = mime && validMimeTypes.includes(mime);
      const isExtValid = validExtensions.includes(ext);
      return !isMimeValid && !isExtValid;
    });

    if (invalidFormat) {
      const msg = 'El archivo debe ser una imagen en formato JPG, PNG o WEBP';
      setFileSizeError(msg);
      triggerToast(msg, 'warning');
      return;
    }

    // Validar tamaño máximo (30 MB) - US-GIT-07 Criterio 35
    const oversized = files.find((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized) {
      const msg = 'La imagen no puede superar los 30 MB';
      setFileSizeError(msg);
      triggerToast(msg, 'warning');
      return;
    }

    if (replaceTargetIdx === undefined && images.length + files.length > generalParams.maxImagesPerPOI) {
      triggerToast(`Límite superado. Máximo configurado: ${generalParams.maxImagesPerPOI} fotos.`, 'warning');
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      if (replaceTargetIdx !== undefined) {
        // Reemplazar imagen existente (US-GIT-07 Criterio 38)
        const file = files[0];
        const uploadedUrl = await uploadFileToR2(file, (prog) => {
          setUploadProgress(prog);
        });
        setImages((prev) => prev.map((url, i) => (i === replaceTargetIdx ? uploadedUrl : url)));
        triggerToast('Ha actualizado una de las imágenes de su POI', 'success');
      } else {
        // Subir nueva(s) imagen(es)
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const uploadedUrl = await uploadFileToR2(file, (prog) => {
            const overallProgress = Math.round(((i + prog / 100) / files.length) * 100);
            setUploadProgress(overallProgress);
          });
          setImages((prev) => [...prev, uploadedUrl]);
        }
        triggerToast('Imagen cargada y procesada exitosamente', 'success');
      }
    } catch (err) {
      console.error('Error al subir imágenes:', err);
      triggerToast('No fue posible subir la imagen en este momento. Intentá más tarde.', 'warning');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setReplaceImageIdx(null);
    }
  };

  // Selección individual e integral de imágenes (US-GIT-07)
  const toggleSelectImageIdx = (idx: number) => {
    setSelectedImageIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const isAllImagesSelected = images.length > 0 && selectedImageIndices.length === images.length;

  const toggleSelectAllImages = () => {
    if (isAllImagesSelected) {
      setSelectedImageIndices([]);
    } else {
      setSelectedImageIndices(images.map((_, i) => i));
    }
  };

  // Solicitud de eliminación individual de imagen (US-GIT-07 Criterio 36 y 37)
  const handleRequestDeleteImageIdx = (idx: number) => {
    const isLastImage = images.length === 1;
    setDeleteImageConfirmConfig({
      isOpen: true,
      title: isLastImage ? 'Eliminar Única Imagen' : 'Confirmar Eliminación',
      message: isLastImage
        ? 'Tu POI quedará sin imágenes. ¿Confirmás la eliminación?'
        : '¿Estás seguro de que deseas eliminar esta imagen de tu establecimiento?',
      isBulk: false,
      targetIdx: idx,
    });
  };

  // Solicitud de eliminación masiva de imágenes (US-GIT-07)
  const handleRequestBulkDeleteImages = () => {
    if (selectedImageIndices.length === 0) return;
    const isDeletingAll = selectedImageIndices.length === images.length;
    const count = selectedImageIndices.length;

    setDeleteImageConfirmConfig({
      isOpen: true,
      title: 'Eliminación Masiva',
      message: isDeletingAll
        ? `Tu POI quedará sin imágenes. ¿Confirmás la eliminación masiva de las ${count} fotos seleccionadas?`
        : `¿Estás seguro de que deseas eliminar las ${count} fotos seleccionadas? Esta acción no se puede deshacer.`,
      isBulk: true,
    });
  };

  // Ejecución confirmada de eliminación
  const handleConfirmDeleteImageAction = () => {
    if (!deleteImageConfirmConfig) return;
    const { isBulk, targetIdx } = deleteImageConfirmConfig;
    setDeleteImageConfirmConfig(null);

    const indicesToRemove = isBulk ? selectedImageIndices : targetIdx !== undefined ? [targetIdx] : [];
    if (indicesToRemove.length === 0) return;

    setImages((prev) => prev.filter((_, i) => !indicesToRemove.includes(i)));
    setSelectedImageIndices((prev) => prev.filter((i) => !indicesToRemove.includes(i)));

    if (isBulk) {
      triggerToast(`${indicesToRemove.length} fotos eliminadas exitosamente`, 'success');
    } else {
      triggerToast('Su imagen fue eliminada exitosamente', 'success');
    }
  };

  const handleCancelDeleteImageAction = () => {
    setDeleteImageConfirmConfig(null);
    triggerToast('Operación cancelada', 'warning');
  };

  // Iniciar reemplazo de imagen (US-GIT-07 Criterio 38)
  const handleInitiateReplaceImage = (idx: number) => {
    setReplaceImageIdx(idx);
    replaceFileInputRef.current?.click();
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
    setLat('');
    setLng('');
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
    setLat(poi.location?.lat !== undefined && poi.location?.lat !== null ? String(poi.location.lat) : '');
    setLng(poi.location?.lng !== undefined && poi.location?.lng !== null ? String(poi.location.lng) : '');
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

                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleStartEdit(poi)}
                      className="w-full py-2 bg-bgPrimary hover:bg-black/5 border border-black/5 text-textDark hover:text-accentWine font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Administrar Perfil</span>
                    </button>

                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('selectedProviderPoiId', poi.id);
                        }
                        router.push('/provider/services');
                      }}
                      className="w-full py-2 bg-accentWine/5 hover:bg-accentWine/10 border border-accentWine/20 text-accentWine font-bold rounded-lg text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-accentWine" />
                      <span>Servicios del negocio</span>
                    </button>
                  </div>
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
                  {viewMode === 'create' ? 'Crear nuevo negocio' : `Editar Negocio: ${selectedPoi?.name}`}
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
          <div className="bg-white rounded-2xl border border-black/5 p-4 sm:p-5 shadow-xs space-y-4">
            {/* Step Pills Navigation */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto pb-1">
              {[
                { step: 1, title: '1. Básica', label: 'Información básica', desc: 'Nombre comercial del establecimiento, descripción corta y categorías de la actividad.' },
                { step: 2, title: '2. Ubicación', label: 'Ubicación y mapa', desc: 'Dirección física completa, región, departamento, zona y coordenadas GPS.' },
                { step: 3, title: '3. Contacto', label: 'Contacto y redes', desc: 'Teléfono comercial, correo electrónico de atención, sitio web e Instagram.' },
                { step: 4, title: '4. Horarios', label: 'Horarios de atención', desc: 'Días de apertura y franjas de atención semanal para los visitantes.' },
                { step: 5, title: '5. Fotos', label: 'Galería de fotos', desc: 'Fotografías del establecimiento y sus instalaciones (máximo 30 MB por foto).' },
                { step: 6, title: '6. Adicional', label: 'Precios y tiempo', desc: 'Rango estimado de precios ($ ARS) y duración recomendada de la visita.' },
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
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-3 rounded-xl border text-xs transition-all flex-1 justify-center min-w-[70px] sm:min-w-0 ${
                      isCurrent
                        ? 'border-accentWine bg-accentWine text-white shadow-md font-extrabold scale-[1.03] ring-2 ring-accentWine/30 cursor-default'
                        : isPassed
                        ? 'border-green-200 bg-green-50 text-green-900 font-semibold hover:bg-green-100 cursor-pointer'
                        : isAccessible
                        ? 'border-black/10 bg-bgPrimary/60 text-textDark/70 hover:bg-bgPrimary font-medium cursor-pointer'
                        : 'border-black/5 bg-black/2 text-textDark/30 cursor-not-allowed opacity-40'
                    }`}
                    title={`${item.step}. ${item.label}`}
                  >
                    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
                      isCurrent
                        ? 'bg-white text-accentWine'
                        : isPassed
                        ? 'bg-green-600 text-white'
                        : 'bg-black/10 text-textDark/60'
                    }`}>
                      {isPassed ? <Check className="h-3.5 w-3.5" /> : item.step}
                    </div>
                    <span className="hidden sm:inline font-bold truncate">
                      {item.title.replace(/^[0-9]+\.\s*/, '')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Highlight Banner */}
            {(() => {
              const currentItem = [
                { step: 1, label: 'Paso 1: Información básica del negocio', desc: 'Indica el nombre comercial del establecimiento, descripción detallada y rubro/categorías de tu actividad.' },
                { step: 2, label: 'Paso 2: Ubicación física y coordenadas GPS', desc: 'Indica la dirección física completa, región, departamento, zona y las coordenadas GPS exactas.' },
                { step: 3, label: 'Paso 3: Canales de contacto y redes sociales', desc: 'Registra el teléfono de atención comercial, email de contacto, sitio web oficial y usuario de Instagram.' },
                { step: 4, label: 'Paso 4: Días y horarios de atención semanal', desc: 'Configura los días de apertura y rangos horarios de atención para que los turistas sepan cuándo visitarte.' },
                { step: 5, label: 'Paso 5: Galería de fotos del negocio', desc: 'Sube fotografías de tu local e instalaciones (límite máximo de 30 MB por foto en JPG, PNG o WEBP).' },
                { step: 6, label: 'Paso 6: Información adicional y estimación de costos', desc: 'Establece los precios estimados mínimo y máximo ($ ARS) y la duración promedio recomendada de la visita.' },
              ].find((s) => s.step === currentStep);

              if (!currentItem) return null;

              return (
                <div className="bg-accentWine/5 border border-accentWine/20 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-in">
                  <div className="flex items-center space-x-3">
                    <span className="bg-accentWine text-white text-xs font-black px-3 py-1 rounded-lg shadow-2xs flex-shrink-0">
                      PASO {currentItem.step} DE 6
                    </span>
                    <div>
                      <h4 className="font-wixDisplay text-sm font-bold text-accentWine">{currentItem.label}</h4>
                      <p className="text-xs text-textDark/70">{currentItem.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })()}
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
                      Categorías del negocio * (Seleccione al menos una)
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

            {/* PASO 4: HORARIOS DE ATENCIÓN (Adaptado de Ando App) */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="font-wixDisplay text-lg font-bold text-textDark">Paso 4: Horarios de atención</h4>
                    <p className="text-xs text-textDark/60 mt-1">
                      Seleccioná uno o más días y asigná su rango horario de apertura y cierre.
                    </p>
                  </div>
                  {/* Presets rápidos de carga completa */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAddPresetHorarios('semana')}
                      className="px-3 py-1.5 text-xs font-bold bg-bgPrimary hover:bg-black/5 text-accentWine rounded-xl border border-black/10 transition-colors cursor-pointer"
                    >
                      Preset: Lun-Vie 9-18
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetHorarios('completo')}
                      className="px-3 py-1.5 text-xs font-bold bg-bgPrimary hover:bg-black/5 text-accentWine rounded-xl border border-black/10 transition-colors cursor-pointer"
                    >
                      Preset: Todos 9-20
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddPresetHorarios('finde')}
                      className="px-3 py-1.5 text-xs font-bold bg-bgPrimary hover:bg-black/5 text-accentWine rounded-xl border border-black/10 transition-colors cursor-pointer"
                    >
                      Preset: Sáb-Dom 10-19
                    </button>
                  </div>
                </div>

                {/* Formulario de franja con chips multiselección */}
                <div className="p-5 bg-bgPrimary/50 rounded-2xl border border-black/5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-textDark/80">
                      Seleccioná los días para aplicar la franja:
                    </span>
                    <div className="flex items-center space-x-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setSelectedDraftDias([0, 1, 2, 3, 4, 5, 6])}
                        className="px-2 py-0.5 rounded-lg bg-white border border-black/10 text-textDark/70 hover:text-accentWine font-bold cursor-pointer transition-colors"
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDraftDias([1, 2, 3, 4, 5])}
                        className="px-2 py-0.5 rounded-lg bg-white border border-black/10 text-textDark/70 hover:text-accentWine font-bold cursor-pointer transition-colors"
                      >
                        Lun-Vie
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDraftDias([6, 0])}
                        className="px-2 py-0.5 rounded-lg bg-white border border-black/10 text-textDark/70 hover:text-accentWine font-bold cursor-pointer transition-colors"
                      >
                        Sáb-Dom
                      </button>
                    </div>
                  </div>

                  {/* Chips de Días (Multiselección) */}
                  <div className="flex flex-wrap gap-2">
                    {DIAS_SEMANA.map((item) => {
                      const active = selectedDraftDias.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleDraftDia(item.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center space-x-1 ${
                            active
                              ? 'bg-accentWine text-white border-accentWine shadow-2xs scale-[1.02]'
                              : 'bg-white text-textDark/80 border-black/10 hover:border-black/20 hover:bg-black/5'
                          }`}
                        >
                          {active && <Check className="h-3 w-3 mr-0.5" />}
                          <span>{item.nombre} ({item.corto})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Entradas de Hora Desde y Hasta */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-1">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-textDark/60 mb-1.5">
                        Apertura (Desde)
                      </label>
                      <input
                        type="time"
                        value={nuevaHoraDesde}
                        onChange={(e) => setNuevaHoraDesde(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold text-textDark focus:ring-2 focus:ring-accentWine focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-textDark/60 mb-1.5">
                        Cierre (Hasta)
                      </label>
                      <input
                        type="time"
                        value={nuevaHoraHasta}
                        onChange={(e) => setNuevaHoraHasta(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-white text-xs font-bold text-textDark focus:ring-2 focus:ring-accentWine focus:outline-none"
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={handleAddHorario}
                        className="w-full py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all shadow-md flex items-center justify-center space-x-1.5"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Agregar horario</span>
                      </button>
                    </div>
                  </div>

                  {horarioError && (
                    <p className="text-xs font-bold text-red-600 flex items-center space-x-1 pt-1">
                      <AlertTriangle className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span>{horarioError}</span>
                    </p>
                  )}
                </div>

                {/* Lista de franjas configuradas ordenadas por día de la semana */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textDark/80">
                      Franjas configuradas ({horariosList.length}):
                    </span>
                    {horariosList.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setHorariosList([])}
                        className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Limpiar todos
                      </button>
                    )}
                  </div>

                  {horariosList.length === 0 ? (
                    <p className="text-xs text-textDark/45 italic p-4 bg-bgPrimary/20 rounded-xl border border-black/5 text-center">
                      No hay horarios cargados aún. Seleccioná los días arriba y hacé clic en "+ Agregar horario".
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {[...horariosList]
                        .sort((a, b) => {
                          const dayA = a.diaSemanaDesde === 0 ? 7 : a.diaSemanaDesde;
                          const dayB = b.diaSemanaDesde === 0 ? 7 : b.diaSemanaDesde;
                          if (dayA !== dayB) return dayA - dayB;
                          return a.horaDesde.localeCompare(b.horaDesde);
                        })
                        .map((h) => {
                          const diaObj = DIAS_SEMANA.find((d) => d.id === h.diaSemanaDesde);
                          return (
                            <div
                              key={h.id}
                              className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/10 shadow-2xs text-xs group hover:border-accentWine/30 transition-all"
                            >
                              <div className="flex items-center space-x-2">
                                <Clock className="h-3.5 w-3.5 text-accentWine flex-shrink-0" />
                                <span className="font-bold text-textDark">{diaObj?.nombre}:</span>
                                <span className="text-textDark/70 font-semibold">{h.horaDesde} a {h.horaHasta} hs</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRequestRemoveHorario(h)}
                                className="text-red-400 hover:text-red-700 p-1 cursor-pointer transition-colors"
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

            {/* PASO 5: FOTOS DEL NEGOCIO (GESTIÓN MULTIMEDIA - US-GIT-07) */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-black/5">
                  <div>
                    <h4 className="font-wixDisplay text-lg font-bold text-textDark flex items-center space-x-2">
                      <ImageIcon className="h-5 w-5 text-fillPrimary" />
                      <span>Gestión Multimedia de Fotos ({images.length} / {generalParams.maxImagesPerPOI})</span>
                    </h4>
                    <p className="text-xs text-textDark/60 mt-0.5">
                      Sube, reemplaza, visualiza y administra las imágenes oficiales de tu establecimiento.
                    </p>
                  </div>

                  {images.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={toggleSelectAllImages}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-bgPrimary text-xs font-bold text-textDark transition-all cursor-pointer shadow-2xs"
                      >
                        {isAllImagesSelected ? (
                          <CheckSquare className="h-4 w-4 text-fillPrimary" />
                        ) : (
                          <Square className="h-4 w-4 text-textDark/40" />
                        )}
                        <span>{isAllImagesSelected ? 'Deseleccionar todas' : 'Select All'}</span>
                      </button>

                      {selectedImageIndices.length > 0 && (
                        <button
                          type="button"
                          onClick={handleRequestBulkDeleteImages}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Eliminar ({selectedImageIndices.length})</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Input oculto para subida normal */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleDeviceImageUpload(e.target.files);
                    e.target.value = '';
                  }}
                />

                {/* Input oculto para reemplazo de foto */}
                <input
                  ref={replaceFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && replaceImageIdx !== null) {
                      handleDeviceImageUpload(e.target.files, replaceImageIdx);
                    }
                    e.target.value = '';
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
                  className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2.5 ${
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
                    <p className="text-[11px] text-textDark/60 mt-1">
                      Formatos válidos: <strong>JPG, PNG, WEBP</strong> • Límite estricto: <strong>30 MB por imagen</strong> • Máx. {generalParams.maxImagesPerPOI} fotos
                    </p>
                  </div>
                </div>

                {fileSizeError && (
                  <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs font-bold text-red-800 flex items-center space-x-2 animate-fadeIn">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <span>{fileSizeError}</span>
                  </div>
                )}

                {isUploading && (
                  <div className="p-4 bg-bgPrimary/60 rounded-xl border border-black/5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="flex items-center text-textDark/70">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-fillPrimary mr-2" />
                        Procesando imagen...
                      </span>
                      <span className="text-fillPrimary">{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-fillPrimary transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-textDark/70 uppercase tracking-wider">
                      Galería de Fotos ({images.length} / {generalParams.maxImagesPerPOI})
                    </span>
                    {selectedImageIndices.length > 0 && (
                      <span className="text-xs font-semibold text-fillPrimary">
                        {selectedImageIndices.length} seleccionada(s)
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {images.map((imgUrl, idx) => {
                      const isSelected = selectedImageIndices.includes(idx);
                      return (
                        <div
                          key={idx}
                          className={`group relative h-36 rounded-xl overflow-hidden border transition-all bg-bgPrimary ${
                            isSelected
                              ? 'border-fillPrimary ring-2 ring-fillPrimary/30 shadow-md scale-[1.02]'
                              : 'border-black/10 hover:border-black/20 hover:shadow-xs'
                          }`}
                        >
                          {/* Checkbox de Selección Individual */}
                          <button
                            type="button"
                            onClick={() => toggleSelectImageIdx(idx)}
                            className={`absolute top-2 left-2 z-10 p-1 rounded-md transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-fillPrimary text-white shadow-md'
                                : 'bg-black/40 text-white/80 hover:bg-black/60 opacity-80 group-hover:opacity-100'
                            }`}
                            title={isSelected ? 'Deseleccionar foto' : 'Seleccionar foto'}
                          >
                            {isSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </button>

                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imgUrl} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />

                          {idx === 0 && (
                            <span className="absolute bottom-2 left-2 z-10 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-md">
                              Portada
                            </span>
                          )}

                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 p-2">
                            <button
                              type="button"
                              onClick={() => handleInitiateReplaceImage(idx)}
                              className="p-2 bg-white/90 hover:bg-white text-textDark hover:text-fillPrimary rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1"
                              title="Reemplazar esta imagen por una nueva"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline text-[10px]">Reemplazar</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRequestDeleteImageIdx(idx)}
                              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-md cursor-pointer"
                              title="Eliminar foto"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {images.length === 0 && (
                      <div className="col-span-2 sm:col-span-3 md:col-span-4 border border-dashed border-black/10 rounded-2xl py-10 flex flex-col items-center justify-center text-xs text-textDark/50 space-y-1.5 bg-bgPrimary/20">
                        <ImageIcon className="h-6 w-6 text-textDark/40" />
                        <span className="font-bold text-textDark/70">No has cargado ninguna fotografía todavía</span>
                        <span className="text-[11px] text-textDark/50">
                          Sube fotos en formato JPG, PNG o WEBP (máx 30 MB) para dar a conocer tu local.
                        </span>
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
                      step="any"
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
                      step="any"
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
                        min="0"
                        step="1"
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
                className="px-7 py-3.5 border border-black/15 hover:bg-black/5 text-textDark font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              <button
                type="button"
                onClick={handleNextStep}
                className="px-8 py-3.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-fillPrimary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center space-x-2"
              >
                <span>{currentStep === 6 ? 'Ver Resumen y Vista Previa' : 'Continuar al Paso ' + (currentStep + 1)}</span>
                <span className="text-base font-bold">→</span>
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
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Vista previa de la ficha del negocio</h4>
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
                    {[...horariosList]
                      .sort((a, b) => {
                        const dayA = a.diaSemanaDesde === 0 ? 7 : a.diaSemanaDesde;
                        const dayB = b.diaSemanaDesde === 0 ? 7 : b.diaSemanaDesde;
                        if (dayA !== dayB) return dayA - dayB;
                        return a.horaDesde.localeCompare(b.horaDesde);
                      })
                      .map((h) => {
                        const diaObj = DIAS_SEMANA.find((d) => d.id === h.diaSemanaDesde);
                        const hDesde = h.horaDesde ? h.horaDesde.slice(0, 5) : '';
                        const hHasta = h.horaHasta ? h.horaHasta.slice(0, 5) : '';
                        return (
                          <div key={h.id} className="bg-white p-2 rounded-lg border border-black/5 text-[11px]">
                            <strong>{diaObj?.nombre}:</strong> {hDesde} - {hHasta} hs
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions (Criterios 45 y 46) */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md px-6 py-5 border-t border-black/5 flex items-center justify-end space-x-3 z-10">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-7 py-3.5 border border-black/15 hover:bg-black/5 text-textDark font-bold rounded-xl text-sm transition-all cursor-pointer shadow-xs"
              >
                Editar
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSaveBusiness}
                className="px-8 py-3.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-fillPrimary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer flex items-center space-x-2.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>Guardar Negocio</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación de horario (US-GIT-03) */}
      {horarioToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-black/10">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-textDark">Confirmar eliminación</h3>
            </div>
            <p className="text-sm font-semibold text-textDark/80">
              ¿Confirmás la eliminación del rango de atención seleccionado?
            </p>
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs font-bold text-red-900">
              {DIAS_SEMANA.find((d) => d.id === horarioToDelete.diaSemanaDesde)?.nombre}: {horarioToDelete.horaDesde} a {horarioToDelete.horaHasta} hs
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancelRemoveHorario}
                className="px-4 py-2 bg-bgPrimary hover:bg-black/5 text-textDark/80 font-bold rounded-xl text-xs transition-all border border-black/10 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRemoveHorario}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Confirmar eliminación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación de imagen (US-GIT-07) */}
      {deleteImageConfirmConfig && deleteImageConfirmConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-black/10">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-textDark">{deleteImageConfirmConfig.title}</h3>
            </div>
            <p className="text-sm font-semibold text-textDark/80">
              {deleteImageConfirmConfig.message}
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancelDeleteImageAction}
                className="px-4 py-2 bg-bgPrimary hover:bg-black/5 text-textDark/80 font-bold rounded-xl text-xs transition-all border border-black/10 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteImageAction}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
