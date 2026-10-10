/**
 * US-RYI-06: Gestión de Persistencia de Filtros Globales de Reportes en la Sesión Activa
 */

export interface FiltrosReporteState {
  fechaDesde: string;
  fechaHasta: string;
  selectedCategory: string;
  selectedDepartamento: string;
  searchQuery: string;
}

export const RYI_SESSION_FILTERS_KEY = 'ando_ryi_global_filters';

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Retorna una fecha pasada relativa en formato YYYY-MM-DD
 */
export function getPastDateISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Valores por defecto según US-RYI-06:
 * - Últimos 30 días
 * - Todas las categorías ('all')
 * - Toda Mendoza ('all')
 * - Búsqueda vacía ('')
 */
export function getDefaultReportFilters(): FiltrosReporteState {
  return {
    fechaDesde: getPastDateISO(30),
    fechaHasta: getTodayISO(),
    selectedCategory: 'all',
    selectedDepartamento: 'all',
    searchQuery: '',
  };
}

/**
 * Carga los filtros persistidos de la sesión activa (sessionStorage)
 * Si no existen o son inválidos, retorna los valores por defecto.
 */
export function loadSessionReportFilters(): FiltrosReporteState {
  if (typeof window === 'undefined') {
    return getDefaultReportFilters();
  }

  try {
    const raw = sessionStorage.getItem(RYI_SESSION_FILTERS_KEY);
    if (!raw) return getDefaultReportFilters();

    const parsed = JSON.parse(raw);
    const defaults = getDefaultReportFilters();

    // La categoría se guarda por id; se descarta cualquier valor con otro formato
    const categoriaValida =
      typeof parsed.selectedCategory === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(parsed.selectedCategory);

    // Un período guardado que dejó de ser válido vuelve a los últimos 30 días
    const fechasValidas =
      parsed.fechaDesde &&
      parsed.fechaHasta &&
      validateDateRange(parsed.fechaDesde, parsed.fechaHasta).isValid;

    return {
      fechaDesde: fechasValidas ? parsed.fechaDesde : defaults.fechaDesde,
      fechaHasta: fechasValidas ? parsed.fechaHasta : defaults.fechaHasta,
      selectedCategory: categoriaValida ? parsed.selectedCategory : 'all',
      selectedDepartamento: parsed.selectedDepartamento || 'all',
      searchQuery: parsed.searchQuery || '',
    };
  } catch {
    return getDefaultReportFilters();
  }
}

/**
 * Guarda los filtros en la sesión activa (sessionStorage)
 */
export function saveSessionReportFilters(filters: FiltrosReporteState): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(RYI_SESSION_FILTERS_KEY, JSON.stringify(filters));
  } catch {
    // Si la cuota está llena o almacenamiento privado restringido, ignorar sin crash
  }
}

/**
 * Limpia los filtros de sesión (llamado en logout o restablecer)
 */
export function clearSessionReportFilters(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(RYI_SESSION_FILTERS_KEY);
  } catch {
    // Ignorar
  }
}

/**
 * Valida las reglas de negocio de fechas de US-RYI-06:
 * 1. Fecha inicio no puede ser posterior a fecha fin.
 * 2. Fecha fin no puede ser posterior a la fecha actual.
 * 3. Rango máximo permitido de 365 días para consultas en pantalla.
 */
export function validateDateRange(
  fechaDesde: string, 
  fechaHasta: string
): { isValid: boolean; errorMsg?: string; isExceedingYear?: boolean } {
  const today = getTodayISO();

  if (!fechaDesde || !fechaHasta) {
    return { isValid: false, errorMsg: 'Debe ingresar fecha de inicio y fecha de fin.' };
  }

  if (fechaDesde > fechaHasta) {
    return { 
      isValid: false, 
      errorMsg: 'La fecha de inicio no puede ser posterior a la fecha de fin.' 
    };
  }

  if (fechaHasta > today) {
    return { 
      isValid: false, 
      errorMsg: 'La fecha de fin no puede ser posterior a la fecha actual.' 
    };
  }

  const d1 = new Date(fechaDesde);
  const d2 = new Date(fechaHasta);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 365) {
    return { 
      isValid: false, 
      isExceedingYear: true,
      errorMsg: 'El rango seleccionado supera el límite de 365 días para visualización en pantalla. Te sugerimos utilizar la función "Exportar Reporte" para analizar períodos más extensos.' 
    };
  }

  return { isValid: true };
}
