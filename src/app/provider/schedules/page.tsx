'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Schedule, TimeRange, SeasonType } from '@/types';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle,
  Clock,
  Sparkles,
  Save,
  Tag
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

export default function BusinessSchedules() {
  const { pois, schedules, saveSchedules, generalParams } = useApp();
  
  // Encontrar el POI del prestador
  const myPoi = pois.find((p) => p.createdBy === 'usr-prov-1') || pois[0];
  const mySchedules = schedules.filter(s => s.poiId === myPoi?.id);

  // Estados del editor (nueva regla o edición)
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([{ start: '09:00', end: '18:00' }]);
  const [season, setSeason] = useState<SeasonType>('all');
  const [isHoliday, setIsHoliday] = useState(false);
  const [description, setDescription] = useState('');
  
  // Validaciones
  const [validationError, setValidationError] = useState('');
  const [shake, setShake] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Alternar selección de días
  const handleToggleDay = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Manejar franjas horarias
  const handleAddTimeRange = () => {
    if (timeRanges.length >= generalParams.maxTimeRangesPerDay) {
      alert(`Has alcanzado el límite máximo de ${generalParams.maxTimeRangesPerDay} franjas horarias por día.`);
      return;
    }
    setTimeRanges(prev => [...prev, { start: '09:00', end: '18:00' }]);
  };

  const handleRemoveTimeRange = (index: number) => {
    setTimeRanges(prev => prev.filter((_, i) => i !== index));
  };

  const handleTimeChange = (index: number, field: 'start' | 'end', val: string) => {
    setTimeRanges(prev => prev.map((range, i) => 
      i === index ? { ...range, [field]: val } : range
    ));
    setValidationError('');
  };

  // Validaciones críticas de negocio (Horas invertidas o solapamientos)
  const validateForm = (): boolean => {
    if (selectedDays.length === 0) {
      setValidationError('Debe seleccionar al menos un día de la semana.');
      return false;
    }

    if (timeRanges.length === 0) {
      setValidationError('Debe agregar al menos una franja horaria.');
      return false;
    }

    // 1. Validar horas de fin previas a horas de inicio
    for (let i = 0; i < timeRanges.length; i++) {
      const { start, end } = timeRanges[i];
      if (!start || !end) {
        setValidationError('Por favor completa todos los campos de hora.');
        return false;
      }
      
      const startMin = timeToMinutes(start);
      const endMin = timeToMinutes(end);
      
      if (endMin <= startMin) {
        setValidationError(`En la franja ${i + 1}, la hora de cierre (${end}) debe ser posterior a la de apertura (${start}).`);
        return false;
      }
    }

    // 2. Validar solapamiento de rangos horarios (US-GIT-01/08)
    for (let i = 0; i < timeRanges.length; i++) {
      const rangeA = timeRanges[i];
      const startA = timeToMinutes(rangeA.start);
      const endA = timeToMinutes(rangeA.end);

      for (let j = i + 1; j < timeRanges.length; j++) {
        const rangeB = timeRanges[j];
        const startB = timeToMinutes(rangeB.start);
        const endB = timeToMinutes(rangeB.end);

        // Si se cruzan: [startA, endA] y [startB, endB]
        if (startA < endB && startB < endA) {
          setValidationError(`Las franjas horarias ${i + 1} y ${j + 1} se solapan. Ajuste los rangos.`);
          return false;
        }
      }
    }

    return true;
  };

  const timeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!validateForm()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const newRule: Schedule = {
      id: `sch-${Date.now()}`,
      poiId: myPoi.id,
      daysOfWeek: selectedDays,
      timeRanges,
      season,
      isHoliday,
      description: description || 'Horario cargado por prestador',
    };

    // Guardar
    saveSchedules(myPoi.id, [...mySchedules, newRule]);
    
    // Resetear formulario
    setSelectedDays([]);
    setTimeRanges([{ start: '09:00', end: '18:00' }]);
    setSeason('all');
    setIsHoliday(false);
    setDescription('');
    
    // Notificación
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta regla horaria?')) {
      const filtered = mySchedules.filter(s => s.id !== id);
      saveSchedules(myPoi.id, filtered);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center space-x-2 bg-fillPrimary text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 animate-slide-in">
          <Check className="h-4 w-4 text-white" />
          <span className="text-sm font-semibold">Horarios actualizados y enviados a revisión</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h3 className="font-wixDisplay text-2xl font-bold text-fillPrimary">Gestión de Horarios (GIT)</h3>
        <p className="text-sm text-textDark/60">
          Carga múltiples franjas de atención por días, define feriados y selecciona temporadas de alta/baja demanda turística.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Form to Add Rule */}
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={`bg-white rounded-2xl border border-black/5 p-6 shadow-sm transition-transform ${
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

            <form onSubmit={handleAddRule} className="space-y-6">
              <h4 className="font-wixDisplay text-lg font-bold text-textDark mb-4 pb-2 border-b border-black/5 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-fillPrimary" />
                <span>Agregar Regla Horaria</span>
              </h4>

              {/* Day Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-3">
                  Selecciona los días aplicables
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => handleToggleDay(day.value)}
                        className={`h-11 w-11 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-fillPrimary text-white border-fillPrimary shadow-sm scale-105'
                            : 'bg-bgPrimary text-textDark/60 border-black/5 hover:bg-black/5'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selector */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70">
                    Franjas Horarias del Día ({timeRanges.length} / {generalParams.maxTimeRangesPerDay})
                  </label>
                  {timeRanges.length < generalParams.maxTimeRangesPerDay && (
                    <button
                      type="button"
                      onClick={handleAddTimeRange}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-fillPrimary hover:underline cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Agregar Franja</span>
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {timeRanges.map((range, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-bgPrimary/50 p-3 rounded-lg border border-black/5">
                      <Clock className="h-4 w-4 text-textDark/40 flex-shrink-0" />
                      <span className="text-xs font-bold text-textDark/60 min-w-[50px]">Rango {idx + 1}:</span>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          required
                          value={range.start}
                          onChange={(e) => handleTimeChange(idx, 'start', e.target.value)}
                          className="px-2 py-1 bg-white rounded border border-black/10 text-xs focus:outline-none focus:border-fillPrimary"
                        />
                        <span className="text-xs text-textDark/40">a</span>
                        <input
                          type="time"
                          required
                          value={range.end}
                          onChange={(e) => handleTimeChange(idx, 'end', e.target.value)}
                          className="px-2 py-1 bg-white rounded border border-black/10 text-xs focus:outline-none focus:border-fillPrimary"
                        />
                      </div>

                      {timeRanges.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeRange(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Season & Holiday Selector */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                    Temporada del Año
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value as SeasonType)}
                    className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold"
                  >
                    <option value="all">Todas las Temporadas (Todo el año)</option>
                    <option value="high">Temporada Alta (Noviembre a Abril)</option>
                    <option value="medium">Temporada Media (Mayo a Agosto)</option>
                    <option value="low">Temporada Baja (Septiembre a Octubre)</option>
                  </select>
                </div>

                <div className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    id="isHoliday"
                    checked={isHoliday}
                    onChange={(e) => setIsHoliday(e.target.checked)}
                    className="h-4.5 w-4.5 rounded text-fillPrimary border-black/10 focus:ring-fillPrimary focus:ring-opacity-25"
                  />
                  <label htmlFor="isHoliday" className="ml-2.5 text-sm font-semibold text-textDark/80 cursor-pointer">
                    Aplica únicamente para Feriados / Festivos
                  </label>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Descripción Corta (Opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Horario especial de degustación en cava privada..."
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm"
                />
              </div>

              {/* Validation Feedback */}
              {validationError && (
                <div className="bg-red-50 text-red-700 border border-red-200 text-xs px-4 py-3 rounded-lg font-bold flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-sm shadow-md transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar a la Agenda Horaria</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Existing Schedules list */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-4">
            <h4 className="font-wixDisplay text-sm font-bold text-textDark uppercase tracking-wider pb-2 border-b border-black/5">
              Horarios Activos ({mySchedules.length})
            </h4>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {mySchedules.map((sch) => (
                <div key={sch.id} className="p-4 bg-bgPrimary/60 border border-black/5 rounded-xl space-y-3 relative group">
                  
                  {/* Delete Badge */}
                  <button
                    onClick={() => handleDeleteRule(sch.id)}
                    className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-sm"
                    title="Eliminar regla"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-textDark/80">
                      {sch.daysOfWeek.sort((a,b)=>a-b).map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')}
                    </p>
                    <p className="text-xs font-semibold text-textDark/50">
                      {sch.description}
                    </p>
                  </div>

                  <div className="space-y-1">
                    {sch.timeRanges.map((range, rIdx) => (
                      <div key={rIdx} className="inline-flex items-center space-x-1.5 bg-white border border-black/5 px-2.5 py-1 rounded-md text-xs font-bold mr-1.5 text-textDark/80">
                        <Clock className="h-3 w-3 text-fillPrimary" />
                        <span>{range.start} - {range.end}</span>
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
                        Solo Feriados
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {mySchedules.length === 0 && (
                <div className="border border-black/5 rounded-lg py-12 flex flex-col items-center justify-center text-textDark/30 text-xs">
                  <Calendar className="h-5 w-5 mb-1" />
                  <span>No hay reglas horarias registradas</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
