'use client';

import React, { useState } from 'react';
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

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun', name: 'Lunes' },
  { value: 2, label: 'Mar', name: 'Martes' },
  { value: 3, label: 'Mié', name: 'Miércoles' },
  { value: 4, label: 'Jue', name: 'Jueves' },
  { value: 5, label: 'Vie', name: 'Viernes' },
  { value: 6, label: 'Sáb', name: 'Sábado' },
  { value: 0, label: 'Dom', name: 'Domingo' },
];

// Presets estándar de la Provincia de Mendoza (US-GIT-01) con iconos vectoriales SVG de Lucide
const MENDOZA_PRESETS = [
  { name: 'Mañana', start: '09:00', end: '13:30', Icon: Sunrise },
  { name: 'Tarde', start: '16:00', end: '20:00', Icon: Sun },
  { name: 'Noche', start: '20:00', end: '00:00', Icon: Moon },
  { name: 'Corrido', start: '09:00', end: '18:00', Icon: Clock },
];

const generateScheduleId = () => `sch-${Date.now()}`;

export default function BusinessSchedules() {
  const { pois, schedules, saveSchedules, generalParams, currentUser } = useApp();
  
  // 1. Filtrar los POIs pertenecientes al Prestador (US-GIT-01 / US-GIT-02 por POI)
  const providerPois = pois.filter(p => currentUser?.role === 'admin' || p.createdBy === currentUser?.id || p.createdBy === 'usr-prov-1');
  const [selectedPoiId, setSelectedPoiId] = useState<string>(providerPois[0]?.id || pois[0]?.id || '');

  const selectedPoi = pois.find(p => p.id === selectedPoiId) || providerPois[0] || pois[0];
  const mySchedules = schedules.filter(s => s.poiId === selectedPoi?.id);

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
  const [toastMessage, setToastMessage] = useState('Horarios actualizados exitosamente');
  const [touristAlert, setTouristAlert] = useState<string | null>(null);

  // Verificar si hay cambios sin guardar en el formulario
  const hasUnsavedChanges = selectedDays.length > 0 || description !== '' || editingScheduleId !== null;

  // Cambiar POI seleccionado con confirmación de cambios sin guardar
  const handleSelectPoi = (poiId: string) => {
    if (poiId === selectedPoiId) return;
    if (hasUnsavedChanges) {
      if (!confirm('¿Está seguro de que desea salir sin guardar los cambios?')) {
        return;
      }
    }
    setSelectedPoiId(poiId);
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
    if (hasUnsavedChanges) {
      if (!confirm('¿Está seguro de que desea salir sin guardar los cambios?')) {
        return;
      }
    }
    resetForm();
  };

  // Guardar o modificar horario (US-GIT-01 / US-GIT-02)
  const handleAddOrUpdateRule = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setTouristAlert(null);

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (editingScheduleId) {
      // US-GIT-02: Modificación de día y horario
      const updatedSchedules = mySchedules.map(sch => 
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
      saveSchedules(selectedPoi.id, updatedSchedules);
      setToastMessage('Cambios guardados exitosamente');
      setTouristAlert(`Se notificó a los turistas con itinerarios activos que incluyan "${selectedPoi.name}" para revisar su plan.`);
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
      saveSchedules(selectedPoi.id, [...mySchedules, newRule]);
      setToastMessage('Horario guardado exitosamente');
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

  // Eliminación de una regla (US-GIT-03)
  const handleDeleteRule = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este rango de días y horarios?')) {
      if (editingScheduleId === id) {
        resetForm();
      }
      const filtered = mySchedules.filter(s => s.id !== id);
      saveSchedules(selectedPoi.id, filtered);
      setToastMessage('Horario eliminado exitosamente');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification de Popup de guardado (Criterio de Aceptación US-GIT-01 y US-GIT-02) */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center space-x-3 bg-fillPrimary text-white px-6 py-4 rounded-xl shadow-2xl border border-white/10 animate-slide-in">
          <Check className="h-5 w-5 text-white flex-shrink-0" />
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
          <select
            id="poi-select"
            value={selectedPoiId}
            onChange={(e) => handleSelectPoi(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-fillPrimary/20 bg-bgPrimary focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary focus-visible:ring-offset-2 transition-all text-sm font-bold text-fillPrimary cursor-pointer shadow-2xs"
          >
            {providerPois.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.category})
              </option>
            ))}
          </select>
        </div>
      </div>

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
                    Configurando horarios para: <strong className="text-fillPrimary font-bold">{selectedPoi?.name}</strong>
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
                        onClick={() => handleToggleDay(day.value)}
                        className={`h-11 px-4 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center justify-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary focus-visible:ring-offset-2 ${
                          isSelected
                            ? 'bg-fillPrimary text-white border-fillPrimary shadow-2xs scale-105'
                            : 'bg-bgPrimary text-textDark/70 border-black/10 hover:bg-black/5 hover:text-textDark'
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
                  {MENDOZA_PRESETS.map((preset) => {
                    const PresetIcon = preset.Icon;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleApplyPreset(preset)}
                        className="px-3 py-1.5 bg-white hover:bg-fillPrimary/10 border border-black/10 rounded-lg text-xs font-semibold text-textDark/80 hover:text-fillPrimary transition-all cursor-pointer shadow-2xs flex items-center space-x-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary"
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
                  {timeRanges.length < generalParams.maxTimeRangesPerDay && (
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
                            value={range.start}
                            onChange={(e) => handleTimeChange(idx, 'start', e.target.value)}
                            className="px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-bold text-textDark focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary"
                          />
                        </div>
                        <span className="text-xs font-semibold text-textDark/60 pt-4">a</span>
                        <div className="flex flex-col">
                          <label htmlFor={`end-time-${idx}`} className="text-[10px] font-bold text-textDark/60 uppercase mb-0.5">Cierre</label>
                          <input
                            id={`end-time-${idx}`}
                            type="time"
                            required
                            value={range.end}
                            onChange={(e) => handleTimeChange(idx, 'end', e.target.value)}
                            className="px-3 py-1.5 bg-white rounded-lg border border-black/10 text-xs font-bold text-textDark focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary"
                          />
                        </div>
                      </div>

                      {timeRanges.length > 1 && (
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
                    onChange={(e) => setSeason(e.target.value as SeasonType)}
                    className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary transition-all text-sm font-semibold text-textDark"
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
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    className="h-4.5 w-4.5 rounded text-fillPrimary border-black/20 focus:ring-fillPrimary focus:ring-opacity-25 focus-visible:ring-2 focus-visible:ring-fillPrimary"
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
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Visitas guiadas a cava privada y degustación..."
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary transition-all text-sm"
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
                  className="flex-1 flex items-center justify-center space-x-2 py-3.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-sm shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fillPrimary focus-visible:ring-offset-2 cursor-pointer"
                >
                  {editingScheduleId ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
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
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h4 className="font-wixDisplay text-sm font-bold text-textDark uppercase tracking-wider">
                Horarios activos ({mySchedules.length})
              </h4>
              <span className="text-[10px] font-bold bg-fillPrimary/10 text-fillPrimary px-2.5 py-0.5 rounded-full">
                {selectedPoi?.name}
              </span>
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
                      onClick={() => handleDeleteRule(sch.id)}
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
                  <span className="font-semibold text-center text-textDark/70">No hay horarios cargados para este POI.</span>
                  <span className="text-[11px] text-textDark/50 text-center px-4">
                    Los turistas verán este lugar como "Horario no disponible" y no será recomendado en itinerarios.
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
