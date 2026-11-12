'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Schedule, TimeRange, SeasonType } from '@/types';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3,
  Check, 
  AlertTriangle,
  Clock,
  Tag,
  X,
  Store,
  Sparkles,
  Info,
  BellRing,
  Sunrise,
  Sun,
  Moon
} from 'lucide-react';

import { DAYS_OF_WEEK, MENDOZA_SCHEDULE_PRESETS } from '@/config/constants';

const generateScheduleId = () => `sch-${Date.now()}`;

export default function BusinessSchedules() {
  const { pois, schedules, saveSchedules, loadSchedulesForPoi, generalParams, currentUser } = useApp();
  
  // 1. Memoizar POIs pertenecientes al Prestador
  const providerPois = React.useMemo(() => {
    if (currentUser?.role === 'provider') return pois;
    const providerId = currentUser?.id || '';
    return pois.filter(p => currentUser?.role === 'admin' || (providerId && p.createdBy === providerId) || !p.createdBy);
  }, [pois, currentUser]);

  const [selectedPoiId, setSelectedPoiId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedProviderPoiId') || '';
    }
    return '';
  });

  useEffect(() => {
    if (providerPois.length > 0) {
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('selectedProviderPoiId') : null;
      if (savedId && providerPois.some((p) => p.id === savedId)) {
        if (selectedPoiId !== savedId) {
          setSelectedPoiId(savedId);
        }
      } else if (!selectedPoiId || !providerPois.some((p) => p.id === selectedPoiId)) {
        const defaultId = providerPois[0].id;
        setSelectedPoiId(defaultId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('selectedProviderPoiId', defaultId);
        }
      }
    } else {
      setSelectedPoiId('');
    }
  }, [providerPois]);

  // Cargar horarios reales desde el backend cuando cambia el POI seleccionado
  useEffect(() => {
    if (selectedPoiId) {
      loadSchedulesForPoi(selectedPoiId);
    }
  }, [selectedPoiId]);

  const selectedPoi = providerPois.find(p => p.id === selectedPoiId) || (providerPois.length > 0 ? providerPois[0] : undefined);
  const hasValidPoi = Boolean(selectedPoi && selectedPoi.id);
  const mySchedules = selectedPoi ? schedules.filter(s => s.poiId === selectedPoi.id) : [];

  // Estados del editor (nueva regla o edición)
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([{ start: '09:00', end: '18:00' }]);
  const [season, setSeason] = useState<SeasonType>('all');
  const [isHoliday, setIsHoliday] = useState(false);
  const [description, setDescription] = useState('');
  
  // Validaciones y notificaciones
  const [validationError, setValidationError] = useState('');
  const [shake, setShake] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('Horarios actualizados exitosamente');
  const [touristAlert, setTouristAlert] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modal de confirmación de eliminación (US-GIT-03)
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Verificar si hay cambios sin guardar en el formulario
  const hasUnsavedChanges = selectedDays.length > 0 || description !== '' || editingScheduleId !== null;

  // Cambiar POI seleccionado
  const handleSelectPoi = (poiId: string) => {
    if (poiId === selectedPoiId) return;
    setSelectedPoiId(poiId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedProviderPoiId', poiId);
    }
    resetForm();
  };

  // Alternar selección de días
  const handleToggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
    setValidationError('');
  };

  // Aplicar franja estándar de Mendoza (US-GIT-01)
  const handleApplyPreset = (preset: { start: string; end: string }) => {
    setTimeRanges([{ start: preset.start, end: preset.end }]);
    setValidationError('');
  };

  // Manejar franjas horarias
  const handleAddTimeRange = () => {
    if (timeRanges.length >= generalParams.maxTimeRangesPerDay) {
      alert(`Ha alcanzado el límite máximo de ${generalParams.maxTimeRangesPerDay} franjas horarias por día.`);
      return;
    }
    setTimeRanges(prev => [...prev, { start: '09:00', end: '18:00' }]);
    setValidationError('');
  };

  const handleRemoveTimeRange = (index: number) => {
    setTimeRanges(prev => prev.filter((_, i) => i !== index));
    setValidationError('');
  };

  const handleTimeChange = (index: number, field: 'start' | 'end', val: string) => {
    setTimeRanges(prev => prev.map((range, i) => 
      i === index ? { ...range, [field]: val } : range
    ));
    setValidationError('');
  };

  // Conversión de hora HH:mm a minutos
  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Validaciones críticas de negocio según US-GIT-01 y US-GIT-02
  const validateForm = (): boolean => {
    if (!hasValidPoi || !selectedPoi?.id) {
      setValidationError('Debes tener o seleccionar un Punto de Interés (POI) registrado antes de configurar días y horarios.');
      return false;
    }

    if (selectedDays.length === 0) {
      setValidationError('Debe seleccionar al menos un día de la semana.');
      return false;
    }

    if (timeRanges.length === 0) {
      setValidationError('Debe agregar al menos una franja horaria.');
      return false;
    }

    // 1. Validar que horaHasta sea posterior a horaDesde (Criterio de aceptación 2 de US-GIT-01)
    for (let i = 0; i < timeRanges.length; i++) {
      const { start, end } = timeRanges[i];
      if (!start || !end) {
        setValidationError('Por favor completa todos los campos de hora.');
        return false;
      }
      
      const startMin = timeToMinutes(start);
      let endMin = timeToMinutes(end);
      if (end === '00:00') endMin = 24 * 60; // 00:00 representa la medianoche al final del día
      
      if (endMin <= startMin) {
        setValidationError(`El horario de apertura (${start}) no puede ser posterior o igual al horario de cierre (${end}).`);
        return false;
      }
    }

    // 2. Validar solapamiento interno entre las franjas horarias del propio formulario
    for (let i = 0; i < timeRanges.length; i++) {
      const rangeA = timeRanges[i];
      const startA = timeToMinutes(rangeA.start);
      let endA = timeToMinutes(rangeA.end);
      if (rangeA.end === '00:00') endA = 24 * 60;

      for (let j = i + 1; j < timeRanges.length; j++) {
        const rangeB = timeRanges[j];
        const startB = timeToMinutes(rangeB.start);
        let endB = timeToMinutes(rangeB.end);
        if (rangeB.end === '00:00') endB = 24 * 60;

        if (startA < endB && startB < endA) {
          setValidationError(`Las franjas horarias ${i + 1} y ${j + 1} ingresadas se solapan entre sí. Ajuste los rangos.`);
          return false;
        }
      }
    }

    // 3. Validar superposición de horarios para el MISMO POI y MISMO DÍA (Criterio de Aceptación 6 de US-GIT-01)
    for (const dayValue of selectedDays) {
      const dayObj = DAYS_OF_WEEK.find(d => d.value === dayValue);
      const dayName = dayObj ? dayObj.name : `Día ${dayValue}`;

      for (const existingSch of mySchedules) {
        // Ignorar la misma regla si se está modificando (US-GIT-02)
        if (editingScheduleId && existingSch.id === editingScheduleId) continue;

        // Comprobar coincidencia de festivo y temporada
        const sameHoliday = existingSch.isHoliday === isHoliday;
        const sameSeason = existingSch.season === season || existingSch.season === 'all' || season === 'all';

        if (sameHoliday && sameSeason && existingSch.daysOfWeek.includes(dayValue)) {
          for (const newRange of timeRanges) {
            const newStart = timeToMinutes(newRange.start);
            let newEnd = timeToMinutes(newRange.end);
            if (newRange.end === '00:00') newEnd = 24 * 60;

            for (const existRange of existingSch.timeRanges) {
              const existStart = timeToMinutes(existRange.start);
              let existEnd = timeToMinutes(existRange.end);
              if (existRange.end === '00:00') existEnd = 24 * 60;

              // Superposición exacta
              if (newStart < existEnd && existStart < newEnd) {
                setValidationError(
                  `El rango de horarios para el día ${dayName} se superpone con un rango de horarios ya definido para este día y POI.`
                );
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  };

  const resetForm = () => {
    setEditingScheduleId(null);
    setSelectedDays([]);
    setTimeRanges([{ start: '09:00', end: '18:00' }]);
    setSeason('all');
    setIsHoliday(false);
    setDescription('');
    setValidationError('');
  };

  const handleCancelForm = () => {
    resetForm();
  };

  // Guardar o modificar horario (US-GIT-01 / US-GIT-02)
  const handleAddOrUpdateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setTouristAlert(null);

    if (!validateForm() || !selectedPoi) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsSaving(true);
    let updatedSchedules: Schedule[] = [];
    const isEditing = !!editingScheduleId;

    if (editingScheduleId) {
      // US-GIT-02: Modificación de día y horario
      updatedSchedules = mySchedules.map(sch => 
        sch.id === editingScheduleId
          ? {
              ...sch,
              daysOfWeek: selectedDays,
              timeRanges,
              season,
              isHoliday,
              description: description || 'Horario modificado por prestador',
            }
          : sch
      );
    } else {
      // US-GIT-01: Carga inicial de día y horario
      const newRule: Schedule = {
        id: generateScheduleId(),
        poiId: selectedPoi.id,
        daysOfWeek: selectedDays,
        timeRanges,
        season,
        isHoliday,
        description: description || 'Horario cargado por prestador',
      };
      updatedSchedules = [...mySchedules, newRule];
    }

    const res = await saveSchedules(selectedPoi.id, updatedSchedules);
    setIsSaving(false);

    if (res && !res.success) {
      setToastType('error');
      setToastMessage(res.error || 'Error al guardar horarios en el servidor');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setToastType('success');
    setToastMessage(isEditing ? 'Cambios guardados exitosamente' : 'Horario guardado exitosamente');
    if (isEditing) {
      setTouristAlert(`Se notificó a los turistas con itinerarios activos que incluyan "${selectedPoi.name}" para revisar su plan.`);
    }

    resetForm();
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Iniciar edición de una regla (US-GIT-02)
  const handleEditRule = (sch: Schedule) => {
    setEditingScheduleId(sch.id);
    setSelectedDays(sch.daysOfWeek);
    setTimeRanges(sch.timeRanges);
    setSeason(sch.season);
    setIsHoliday(sch.isHoliday);
    setDescription(sch.description || '');
    setValidationError('');
  };

  const getScheduleLabel = (sch: Schedule) => {
    const daysText = sch.daysOfWeek
      .sort((a, b) => a - b)
      .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.name || `Día ${d}`)
      .join(', ');
    const timesText = sch.timeRanges
      .map((r) => `${r.start} a ${r.end} hs`)
      .join(' / ');
    return `${daysText} (${timesText})`;
  };

  const handleRequestDeleteRule = (sch: Schedule) => {
    setScheduleToDelete(sch);
  };

  const handleConfirmDeleteRule = async () => {
    if (!scheduleToDelete) return;
    const schId = scheduleToDelete.id;
    setScheduleToDelete(null);
    await handleDeleteRule(schId);
  };

  const handleCancelDeleteRule = () => {
    setScheduleToDelete(null);
    setToastType('error');
    setToastMessage('Operación cancelada');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Eliminación masiva de todos los horarios (US-GIT-03)
  const handleConfirmDeleteAll = async () => {
    if (!selectedPoi) return;
    setShowDeleteAllModal(false);
    resetForm();
    const res = await saveSchedules(selectedPoi.id, []);

    if (res && !res.success) {
      setToastType('error');
      setToastMessage(res.error || 'Error al eliminar los horarios del servidor');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setToastType('success');
    setToastMessage('Todos los horarios fueron eliminados exitosamente');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancelDeleteAll = () => {
    setShowDeleteAllModal(false);
    setToastType('error');
    setToastMessage('Operación cancelada');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Eliminación de una regla (US-GIT-03)
  const handleDeleteRule = async (id: string) => {
    if (!selectedPoi) return;
    if (editingScheduleId === id) {
      resetForm();
    }
    const filtered = mySchedules.filter(s => s.id !== id);
    const res = await saveSchedules(selectedPoi.id, filtered);

    if (res && !res.success) {
      setToastType('error');
      setToastMessage(res.error || 'Error al eliminar el horario del servidor');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setToastType('success');
    setToastMessage('Horario eliminado exitosamente');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="space-y-8 relative">
      {/* Modal de confirmación de eliminación (US-GIT-03) */}
      {scheduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-black/10">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-textDark">Confirmar eliminación</h3>
            </div>
            <p className="text-sm font-semibold text-textDark/80">
              ¿Confirmás la eliminación del rango de atención seleccionado?
            </p>
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs font-bold text-red-900 space-y-1">
              <p>{getScheduleLabel(scheduleToDelete)}</p>
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancelDeleteRule}
                className="px-4 py-2 bg-bgPrimary hover:bg-black/5 text-textDark/80 font-bold rounded-xl text-xs transition-all border border-black/10 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteRule}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Confirmar eliminación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación masiva de todos los horarios (US-GIT-03) */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-black/10">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <h3 className="text-lg font-bold text-textDark">Eliminar todos los horarios</h3>
            </div>
            <p className="text-sm font-semibold text-textDark/80">
              Estas por eliminar TODOS los rangos de atención de este punto de interés. El lugar quedará marcado como Horario no disponible y el motor de recomendación no sugerirá este POI para itinerarios automáticos
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={handleCancelDeleteAll}
                className="px-4 py-2 bg-bgPrimary hover:bg-black/5 text-textDark/80 font-bold rounded-xl text-xs transition-all border border-black/10 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
              >
                Eliminar todos los horarios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification de Popup de guardado (Criterio de Aceptación US-GIT-01 y US-GIT-02) */}
      {showToast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-3 text-white px-6 py-4 rounded-xl shadow-2xl border border-white/10 animate-slide-in ${
          toastType === 'error' ? 'bg-red-600' : 'bg-fillPrimary'
        }`}>
          {toastType === 'error' ? <AlertTriangle className="h-5 w-5 text-white flex-shrink-0" /> : <Check className="h-5 w-5 text-white flex-shrink-0" />}
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header & POI Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-black/5 shadow-xs">
        <div>
          <h3 className="font-wixDisplay text-2xl font-bold text-fillPrimary">Gestión de días y horarios por POI</h3>
          <p className="text-sm text-textDark/70 mt-1">
            Administra los horarios de atención y apertura de tus puntos de interés turísticos para mantener actualizada la información pública.
          </p>
        </div>

        {/* POI Selector Dropdown (US-GIT-01: Por POI) */}
        <div className="min-w-[280px]">
          <label htmlFor="poi-select" className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5 flex items-center space-x-1.5">
            <Store className="h-4 w-4 text-fillPrimary" />
            <span>Seleccionar POI a gestionar</span>
          </label>
          {providerPois.length > 0 ? (
            <select
              id="poi-select"
              value={selectedPoiId}
              onChange={(e) => handleSelectPoi(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-fillPrimary/20 bg-bgPrimary focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary focus-visible:ring-offset-2 transition-all text-sm font-bold text-fillPrimary cursor-pointer shadow-2xs"
            >
              {providerPois.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="px-4 py-2.5 rounded-lg border border-amber-300 bg-amber-50 text-xs font-semibold text-amber-800">
              No hay negocios registrados
            </div>
          )}
        </div>
      </div>

      {/* Alerta si no hay POIs creados */}
      {!hasValidPoi && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-5 py-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-900">No tienes ningún negocio registrado</p>
              <p className="text-xs text-amber-800/90 mt-0.5">
                Para configurar días y horarios de atención, primero debes registrar tu punto de interés turístico.
              </p>
            </div>
          </div>
          <Link
            href="/provider/business"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/90 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex-shrink-0"
          >
            <Store className="h-4 w-4" />
            <span>Registrar Negocio</span>
          </Link>
        </div>
      )}

      {/* Alerta de notificación a turistas afectados por cambio en itinerario (US-GIT-02) */}
      {touristAlert && (
        <div className="bg-amber-50 text-amber-900 border border-amber-200 text-xs px-5 py-4 rounded-xl font-medium flex items-start space-x-3 shadow-2xs animate-fadeIn">
          <BellRing className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm mb-0.5 text-amber-900">Notificación enviada a turistas</p>
            <p className="text-amber-800/90">{touristAlert}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Form to Add/Edit Schedule Rule */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`bg-white rounded-2xl border border-black/5 p-6 shadow-xs transition-transform ${
              shake ? 'animate-bounce' : ''
            }`}
            style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
          >
            {shake && (
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                  20%, 40%, 60%, 80% { transform: translateX(6px); }
                }
              `}} />
            )}

            <form onSubmit={handleAddOrUpdateRule} className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <div>
                  <h4 className="font-wixDisplay text-lg font-bold text-textDark flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-fillPrimary" />
                    <span>{editingScheduleId ? 'Modificar días y horarios' : 'Cargar días y horarios de atención'}</span>
                  </h4>
                  <p className="text-xs text-textDark/60 mt-0.5">
                    {hasValidPoi ? (
                      <>Configurando horarios para: <strong className="text-fillPrimary font-bold">{selectedPoi?.name}</strong></>
                    ) : (
                      <span className="text-amber-700 font-semibold">Sin negocio seleccionado</span>
                    )}
                  </p>
                </div>
                {editingScheduleId && (
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-textDark/70 hover:text-textDark cursor-pointer bg-bgPrimary px-3 py-1.5 rounded-lg border border-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancelar edición</span>
                  </button>
                )}
              </div>

              {/* Day Selector (US-GIT-01: Selección de días) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70">
                    Días de la semana aplicables
                  </label>
                  <span className="text-[11px] text-textDark/60 font-medium">Selección múltiple disponible</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        disabled={!hasValidPoi}
                        onClick={() => handleToggleDay(day.value)}
                        className={`h-11 px-4 rounded-lg text-xs font-bold transition-all border flex items-center justify-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary focus-visible:ring-offset-2 ${
                          !hasValidPoi
                            ? 'bg-black/5 text-textDark/30 border-black/5 cursor-not-allowed'
                            : isSelected
                            ? 'bg-fillPrimary text-white border-fillPrimary shadow-2xs scale-105 cursor-pointer'
                            : 'bg-bgPrimary text-textDark/70 border-black/10 hover:bg-black/5 hover:text-textDark cursor-pointer'
                        }`}
                        title={day.name}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                        <span>{day.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mendoza Standard Quick Presets (US-GIT-01 Criterio de Aceptación: Acceso Rápido Franjas Mendoza) */}
              <div className="bg-bgPrimary/50 p-4 rounded-xl border border-black/5 space-y-2.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-textDark/70 flex items-center space-x-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-accentYellow" />
                  <span>Acceso rápido: franjas estándar de Mendoza</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MENDOZA_SCHEDULE_PRESETS.map((preset) => {
                    const PresetIcon = preset.Icon;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        disabled={!hasValidPoi}
                        onClick={() => handleApplyPreset(preset)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary ${
                          !hasValidPoi
                            ? 'bg-white/50 text-textDark/30 border-black/5 cursor-not-allowed'
                            : 'bg-white hover:bg-fillPrimary/10 border-black/10 text-textDark/80 hover:text-fillPrimary cursor-pointer shadow-2xs'
                        }`}
                      >
                        <PresetIcon className="h-3.5 w-3.5 text-fillPrimary flex-shrink-0" />
                        <span>{preset.name} ({preset.start} a {preset.end} h)</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70">
                    Franjas horarias ({timeRanges.length} / {generalParams.maxTimeRangesPerDay})
                  </label>
                  {timeRanges.length < generalParams.maxTimeRangesPerDay && hasValidPoi && (
                    <button
                      type="button"
                      onClick={handleAddTimeRange}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-fillPrimary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary rounded cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Agregar otra franja</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {timeRanges.map((range, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-bgPrimary/50 p-3.5 rounded-xl border border-black/5">
                      <Clock className="h-4 w-4 text-textDark/50 flex-shrink-0" />
                      <span className="text-xs font-bold text-textDark/70 min-w-[55px]">Franja {idx + 1}:</span>
                      
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col">
                          <label htmlFor={`start-time-${idx}`} className="text-[10px] font-bold text-textDark/60 uppercase mb-0.5">Apertura</label>
                          <input
                            id={`start-time-${idx}`}
                            type="time"
                            required
                            disabled={!hasValidPoi}
                            value={range.start}
                            onChange={(e) => handleTimeChange(idx, 'start', e.target.value)}
                            className="px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-bold text-textDark focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary disabled:bg-gray-100 disabled:text-textDark/40"
                          />
                        </div>
                        <span className="text-xs font-semibold text-textDark/60 pt-4">a</span>
                        <div className="flex flex-col">
                          <label htmlFor={`end-time-${idx}`} className="text-[10px] font-bold text-textDark/60 uppercase mb-0.5">Cierre</label>
                          <input
                            id={`end-time-${idx}`}
                            type="time"
                            required
                            disabled={!hasValidPoi}
                            value={range.end}
                            onChange={(e) => handleTimeChange(idx, 'end', e.target.value)}
                            className="px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-bold text-textDark focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary disabled:bg-gray-100 disabled:text-textDark/40"
                          />
                        </div>
                      </div>

                      {timeRanges.length > 1 && hasValidPoi && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeRange(idx)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                          title="Eliminar franja"
                          aria-label={`Eliminar franja ${idx + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Season & Holiday Selector */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="season-select" className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                    Temporada del año
                  </label>
                  <select
                    id="season-select"
                    value={season}
                    disabled={!hasValidPoi}
                    onChange={(e) => setSeason(e.target.value as SeasonType)}
                    className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary transition-all text-sm font-semibold text-textDark disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="all">Todas las temporadas (Todo el año)</option>
                    <option value="high">Temporada alta (Noviembre a abril)</option>
                    <option value="medium">Temporada media (Mayo a agosto)</option>
                    <option value="low">Temporada baja (Septiembre a octubre)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="isHoliday"
                    checked={isHoliday}
                    disabled={!hasValidPoi}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    className="h-4.5 w-4.5 rounded text-fillPrimary border-black/20 focus:ring-fillPrimary focus:ring-opacity-25 focus-visible:ring-2 focus-visible:ring-fillPrimary disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="isHoliday" className="ml-2.5 text-sm font-semibold text-textDark/80 cursor-pointer select-none">
                    Aplica únicamente para feriados y festivos
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="schedule-desc" className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Descripción corta (Opcional)
                </label>
                <input
                  id="schedule-desc"
                  type="text"
                  value={description}
                  disabled={!hasValidPoi}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Visitas guiadas a cava privada y degustación..."
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Error de Validación en Formulario (Mensajes Exactos de US-GIT-01 y US-GIT-02) */}
              {validationError && (
                <div className="bg-red-50 text-red-800 border border-red-200 text-xs px-4 py-3.5 rounded-xl font-bold flex items-start space-x-2.5 animate-fadeIn shadow-2xs">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  disabled={!hasValidPoi || isSaving}
                  title={!hasValidPoi ? 'Debes seleccionar un POI antes de guardar horarios' : undefined}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3.5 font-bold rounded-lg text-sm shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary focus-visible:ring-offset-2 ${
                    !hasValidPoi 
                      ? 'bg-black/10 text-textDark/40 cursor-not-allowed shadow-none' 
                      : 'bg-fillPrimary hover:bg-fillPrimary/95 text-white cursor-pointer hover:-translate-y-0.5'
                  }`}
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : editingScheduleId ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>{editingScheduleId ? 'Guardar cambios' : 'Guardar horarios'}</span>
                </button>
                {editingScheduleId && (
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-5 py-3.5 bg-bgPrimary hover:bg-black/5 text-textDark/80 font-bold rounded-lg text-sm transition-all border border-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Active Schedules list for Selected POI */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex flex-col space-y-2 pb-2 border-b border-black/5">
              <div className="flex items-center justify-between">
                <h4 className="font-wixDisplay text-sm font-bold text-textDark uppercase tracking-wider">
                  Horarios activos ({mySchedules.length})
                </h4>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  hasValidPoi ? 'bg-fillPrimary/10 text-fillPrimary' : 'bg-amber-100 text-amber-800'
                }`}>
                  {hasValidPoi ? selectedPoi?.name : 'Sin negocio'}
                </span>
              </div>
              {mySchedules.length > 0 && (
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAllModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Eliminar todos los horarios</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
              {mySchedules.map((sch) => (
                <div 
                  key={sch.id} 
                  className={`p-4 border rounded-xl space-y-3 relative group transition-all bg-white shadow-2xs ${
                    editingScheduleId === sch.id
                      ? 'border-fillPrimary ring-2 ring-fillPrimary/20 shadow-sm'
                      : 'border-black/10 hover:border-black/20 hover:shadow-xs'
                  }`}
                >
                  {/* Card Action Badges (Siempre Visibles con Opacidad Suave para Descubribilidad Accesible) */}
                  <div className="absolute top-3 right-3 flex items-center space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditRule(sch)}
                      className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      title="Editar horario"
                      aria-label="Editar horario"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleRequestDeleteRule(sch)}
                      className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      title="Eliminar horario"
                      aria-label="Eliminar horario"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 pr-16">
                    <p className="text-xs font-bold text-textDark flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-fillPrimary flex-shrink-0" />
                      <span>{sch.daysOfWeek.sort((a,b)=>a-b).map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')}</span>
                    </p>
                    <p className="text-xs font-semibold text-textDark/60 italic">
                      {sch.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {sch.timeRanges.map((range, rIdx) => (
                      <div key={rIdx} className="inline-flex items-center space-x-1.5 bg-bgPrimary/60 border border-black/5 px-2.5 py-1 rounded-md text-xs font-bold mr-1.5 text-textDark">
                        <Clock className="h-3 w-3 text-fillPrimary" />
                        <span>{range.start} a {range.end} h</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-black/5">
                    {sch.season !== 'all' && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-accentPurple/10 text-accentPurple border border-accentPurple/10 rounded-md text-[9px] font-bold uppercase">
                        <Tag className="h-2.5 w-2.5 mr-0.5" />
                        Temp. {sch.season === 'high' ? 'Alta' : sch.season === 'medium' ? 'Media' : 'Baja'}
                      </span>
                    )}
                    {sch.isHoliday && (
                      <span className="inline-flex items-center px-2 py-0.5 bg-accentWine/10 text-accentWine border border-accentWine/10 rounded-md text-[9px] font-bold uppercase">
                        Solo feriados
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {mySchedules.length === 0 && (
                <div className="border border-dashed border-black/10 rounded-xl py-12 flex flex-col items-center justify-center text-textDark/50 text-xs space-y-2">
                  <Info className="h-6 w-6 text-textDark/40" />
                  <span className="font-semibold text-center text-textDark/70">
                    {hasValidPoi ? 'No hay horarios cargados para este POI.' : 'No hay ningún negocio seleccionado.'}
                  </span>
                  <span className="text-[11px] text-textDark/50 text-center px-4">
                    {hasValidPoi 
                      ? 'Los turistas verán este lugar como "Horario no disponible" y no será recomendado en itinerarios.'
                      : 'Registra tu primer negocio para empezar a administrar sus días y horarios de atención.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
