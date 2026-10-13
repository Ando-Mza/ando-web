'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Filter, 
  Calendar, 
  Search, 
  RotateCcw, 
  AlertCircle, 
  MapPin, 
  Layers,
  Download,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { OpcionFiltroReporte } from '@/types/reportes';
import { 
  validateDateRange, 
  getTodayISO, 
  getPastDateISO,
  FiltrosReporteState
} from '@/utils/reportFiltersStorage';

interface ReportGlobalFiltersProps {
  fechaDesde: string;
  fechaHasta: string;
  selectedCategory: string;
  selectedDepartamento: string;
  searchQuery: string;
  /** Categorías y departamentos reales, cargados desde el catálogo de filtros del backend */
  categorias: OpcionFiltroReporte[];
  departamentos: OpcionFiltroReporte[];
  isLoadingOpciones?: boolean;
  /** Mensaje si no se pudo cargar el catálogo de categorías y zonas */
  opcionesError?: string | null;
  /** Vuelve a pedir el catálogo al backend */
  onRetryOpciones?: () => void;
  onFilterChange: (filters: FiltrosReporteState) => void;
  onReset: () => void;
  /** Se invoca con el rango (mayor a 365 días) que el usuario intentó aplicar */
  onSuggestExport?: (rango: { fechaDesde: string; fechaHasta: string }) => void;
  title?: string;
  subtitle?: string;
}

export default function ReportGlobalFilters({
  fechaDesde,
  fechaHasta,
  selectedCategory,
  selectedDepartamento,
  searchQuery,
  categorias,
  departamentos,
  isLoadingOpciones = false,
  opcionesError = null,
  onRetryOpciones,
  onFilterChange,
  onReset,
  onSuggestExport,
  title = 'Filtros de reportes',
  subtitle = 'Se aplican a todos los reportes del módulo y se mantienen mientras dure tu sesión',
}: ReportGlobalFiltersProps) {
  const [localDesde, setLocalDesde] = useState(fechaDesde);
  const [localHasta, setLocalHasta] = useState(fechaHasta);
  const [preset, setPreset] = useState<'7d' | '30d' | '90d' | 'year' | 'custom'>('30d');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExceedingYear, setIsExceedingYear] = useState<boolean>(false);

  // La búsqueda se aplica con una breve espera para no consultar al servidor en cada tecla
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      onFilterChange({
        fechaDesde,
        fechaHasta,
        selectedCategory,
        selectedDepartamento,
        searchQuery: value.trim(),
      });
    }, 400);
  };

  // Sincronizar estado local si las props cambian externamente (ej: reset o cambio de sesión)
  useEffect(() => {
    setLocalDesde(fechaDesde);
    setLocalHasta(fechaHasta);

    // Deducir preset si coincide
    const today = getTodayISO();
    if (fechaHasta === today) {
      if (fechaDesde === getPastDateISO(7)) setPreset('7d');
      else if (fechaDesde === getPastDateISO(30)) setPreset('30d');
      else if (fechaDesde === getPastDateISO(90)) setPreset('90d');
      else if (fechaDesde === `${new Date().getFullYear()}-01-01`) setPreset('year');
      else setPreset('custom');
    } else {
      setPreset('custom');
    }
  }, [fechaDesde, fechaHasta]);

  // Manejar cambio de preset rápido
  const handlePresetChange = (newPreset: '7d' | '30d' | '90d' | 'year' | 'custom') => {
    setPreset(newPreset);
    setErrorMsg(null);
    setIsExceedingYear(false);

    const today = getTodayISO();
    let desde = '';
    let hasta = today;

    if (newPreset === '7d') {
      desde = getPastDateISO(7);
    } else if (newPreset === '30d') {
      desde = getPastDateISO(30);
    } else if (newPreset === '90d') {
      desde = getPastDateISO(90);
    } else if (newPreset === 'year') {
      desde = `${new Date().getFullYear()}-01-01`;
    } else {
      return; // 'custom', espera a que el usuario edite las fechas
    }

    setLocalDesde(desde);
    setLocalHasta(hasta);

    onFilterChange({
      fechaDesde: desde,
      fechaHasta: hasta,
      selectedCategory,
      selectedDepartamento,
      searchQuery,
    });
  };

  // Validar y aplicar cambio manual de fechas (Criterios 1, 4 y 5)
  const handleDateChange = (newDesde: string, newHasta: string) => {
    setLocalDesde(newDesde);
    setLocalHasta(newHasta);
    setPreset('custom');
    setErrorMsg(null);
    setIsExceedingYear(false);

    // Validar rango con las reglas de negocio
    const validation = validateDateRange(newDesde, newHasta);

    if (!validation.isValid) {
      setErrorMsg(validation.errorMsg || 'Rango de fechas inválido');
      if (validation.isExceedingYear) {
        setIsExceedingYear(true);
      }
      // CRITERIO 4 y 5: "Que el sistema muestre un mensaje de error inline y que el filtro no se aplique"
      return;
    }

    // Si es válido, aplicar automáticamente (Criterio 1)
    onFilterChange({
      fechaDesde: newDesde,
      fechaHasta: newHasta,
      selectedCategory,
      selectedDepartamento,
      searchQuery,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-black/5 p-5 sm:p-6 shadow-xs space-y-4 font-wixText">
      {/* Header del Componente de Filtros Globales */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-accentWine/10 text-accentWine">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-wixDisplay font-bold text-xs text-textDark tracking-tight">
              {title}
            </h3>
            <p className="text-[11px] text-textDark/60">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-bold text-textDark/60 hover:text-accentWine hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
          title="Volver a los últimos 30 días, todas las categorías y toda Mendoza"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Restablecer filtros</span>
        </button>
      </div>

      {/* Barra de Filtros Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Selector de Período Preset */}
        <div>
          <label className="block text-[11px] font-bold text-textDark/70 mb-1.5">
            Período
          </label>
          <div className="relative">
            <select
              value={preset}
              onChange={(e) => handlePresetChange(e.target.value as any)}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="year">Año actual ({new Date().getFullYear()})</option>
              <option value="custom">Rango personalizado...</option>
            </select>
          </div>
        </div>

        {/* Categoría Turística (Criterio 2) */}
        <div>
          <label className="block text-[11px] font-bold text-textDark/70 mb-1.5 flex items-center space-x-1">
            <Layers className="h-3 w-3 text-accentWine" />
            <span>Categoría de POI</span>
          </label>
          <select
            aria-label="Categoría de POI"
            disabled={isLoadingOpciones}
            value={selectedCategory}
            onChange={(e) => {
              onFilterChange({
                fechaDesde,
                fechaHasta,
                selectedCategory: e.target.value,
                selectedDepartamento,
                searchQuery,
              });
            }}
            className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
          >
            <option value="all">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Zona Geográfica / Departamento */}
        <div>
          <label className="block text-[11px] font-bold text-textDark/70 mb-1.5 flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-accentWine" />
            <span>Zona geográfica</span>
          </label>
          <select
            aria-label="Zona geográfica"
            disabled={isLoadingOpciones}
            value={selectedDepartamento}
            onChange={(e) => {
              onFilterChange({
                fechaDesde,
                fechaHasta,
                selectedCategory,
                selectedDepartamento: e.target.value,
                searchQuery,
              });
            }}
            className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
          >
            <option value="all">Toda Mendoza</option>
            {departamentos.map((dep) => (
              <option key={dep.id} value={dep.nombre}>
                {dep.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Búsqueda por Nombre / Palabra Clave */}
        <div>
          <label className="block text-[11px] font-bold text-textDark/70 mb-1.5">
            Búsqueda de atractivo o negocio
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40" />
            <input
              type="text"
              aria-label="Búsqueda de atractivo o negocio"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nombre o rubro..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            />
          </div>
        </div>
      </div>

      {/* Rango de Fechas Específico con Calendarios */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-black/5">
        {/* Las fechas solo se eligen a mano con "Rango personalizado"; los demás períodos las fijan solos */}
        <div className={`flex flex-wrap items-center gap-3 ${preset === 'custom' ? '' : 'hidden'}`}>
          <div className="flex items-center space-x-2 text-xs">
            <Calendar className="h-4 w-4 text-accentWine" />
            <span className="font-bold text-textDark/70 text-[11px]">Fecha Inicio:</span>
            <input
              type="date"
              value={localDesde}
              max={getTodayISO()}
              onChange={(e) => handleDateChange(e.target.value, localHasta)}
              className="px-2.5 py-1.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-textDark/70 text-[11px]">Fecha Fin:</span>
            <input
              type="date"
              value={localHasta}
              max={getTodayISO()}
              onChange={(e) => handleDateChange(localDesde, e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
            />
          </div>
        </div>

        {/* Resumen de Filtros Aplicados */}
        <div className="flex items-center space-x-2 text-[11px] text-textDark/60 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            Período aplicado: {fechaDesde} al {fechaHasta}
          </span>
        </div>
      </div>

      {opcionesError && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-amber-700 font-semibold" role="status">
          <span>{opcionesError} Mientras tanto podés filtrar por período.</span>
          {onRetryOpciones && (
            <button
              type="button"
              onClick={onRetryOpciones}
              className="px-2.5 py-1 rounded-full border border-amber-700/40 hover:bg-amber-700/10 cursor-pointer"
            >
              Reintentar
            </button>
          )}
        </div>
      )}

      {/* Mensajes de Validación Inline (Criterio 4 y 5) */}
      {errorMsg && (
        <div role="alert" className={`p-4 rounded-2xl border text-xs animate-fade-in ${
          isExceedingYear 
            ? 'bg-amber-50 border-amber-200 text-amber-900' 
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-2.5">
              {isExceedingYear ? (
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold leading-snug">{errorMsg}</p>
                <p className="text-[11px] opacity-80">
                  {isExceedingYear 
                    ? 'El filtro no se aplicó. Para analizar períodos de más de 365 días, exportá el reporte.'
                    : 'El filtro no se aplicó. Corregí las fechas para actualizar los reportes.'}
                </p>
              </div>
            </div>

            {isExceedingYear && onSuggestExport && (
              <button
                type="button"
                onClick={() => onSuggestExport({ fechaDesde: localDesde, fechaHasta: localHasta })}
                className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5 flex-shrink-0 cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar este período</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
