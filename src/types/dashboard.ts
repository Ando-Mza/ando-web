export type PeriodoDashboard = '7d' | '30d' | 'mes' | 'este_ano' | 'ano' | 'todos' | 'personalizado';

export interface GeneralDashboardResponse {
  periodo: { tipo: string; fechaDesde: string | null; fechaHasta: string | null };
  kpis: {
    totalUsuarios: number;
    nuevosUsuariosPeriodo: number;
    itinerariosActivos: number;
    itinerariosGenerados: number;
    poisValidados: number;
    resenasPendientes: number;
  };
  graficos: {
    crecimientoUsuarios: { fecha: string; label: string; cantidad: number }[];
    rankingTop5Pois: {
      id: string;
      nombre: string;
      visitados: number;
      guardados: number;
      totalInteracciones: number;
    }[];
    top5Visitados: { id: string; nombre: string; cantidad: number }[];
    top5Guardados: { id: string; nombre: string; cantidad: number }[];
  };
  sinActividad: boolean;
  mensajeEstado?: string | null;
}

export interface ProviderDashboardResponse {
  misPuntosDeInteres: {
    id: string;
    nombre: string;
    puntuacionPromedio: number;
    cantidadReviews: number;
    seleccionado: boolean;
  }[];
  poiSeleccionado: { id: string; nombre: string } | null;
  periodo: { tipo: string; fechaDesde: string | null; fechaHasta: string | null };
  kpis: {
    visitasExitosas: number;
    cantidadGuardados: number;
    puntuacionPromedio: number;
    totalResenas: number;
  };
  graficos: {
    distribucionCalificaciones: { puntuacion: number; cantidad: number; porcentaje: number }[];
    ultimasResenas: {
      id: string;
      autorNombre: string;
      puntuacion: number;
      comentario: string | null;
      fechaCreacion: string;
      poiNombre: string;
    }[];
    visitasEnElTiempo: { fecha: string; label: string; cantidad: number }[];
  };
  sinActividad: boolean;
  mensajeEstado?: string | null;
}
