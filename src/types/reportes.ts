export interface CategoriaReporte {
  id: string;
  nombre: string;
}

export interface UbicacionReporte {
  departamento?: string;
  zona?: string;
  region?: string;
}

export interface PoiReporteItem {
  poiId: string;
  nombre: string;
  imagenPrincipalUrl?: string;
  categorias: CategoriaReporte[];
  ubicacion: UbicacionReporte;
  aparicionesItinerarios: number;
  visitasEfectivas: number;
  tasaAbandono: number;
  esAltaTasaAbandono: boolean;
}

export interface Top10PoiGrafico {
  poiId: string;
  nombre: string;
  planificados: number;
  visitadosEfectivos: number;
  tasaAbandono: number;
}

export interface ReportePoisMasVisitadosMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  periodo: {
    fechaDesde: string;
    fechaHasta: string;
  };
}

export interface ReportePoisMasVisitadosResponse {
  data: PoiReporteItem[];
  top10Grafico: Top10PoiGrafico[];
  meta: ReportePoisMasVisitadosMeta;
  mensaje?: string;
}

export interface DistribucionMensualVisita {
  mes: string;
  etiquetaMes: string;
  apariciones: number;
  visitasEfectivas: number;
  tasaAbandono: number;
}

export interface PoiDetalleMensualResponse {
  poiId: string;
  nombre: string;
  categoria?: string;
  totalApariciones: number;
  totalVisitasEfectivas: number;
  tasaAbandonoGlobal: number;
  distribucionMensual: DistribucionMensualVisita[];
}

export type SortByPoiReporte = 'visitasEfectivas' | 'aparicionesItinerarios' | 'tasaAbandono' | 'nombre';
export type SortOrder = 'ASC' | 'DESC';

export interface FiltroReporteParams {
  fechaDesde: string;
  fechaHasta: string;
  categoriaId?: string;
  departamentoId?: string;
  search?: string;
  sortBy?: SortByPoiReporte;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

// =========================================================================
// US-RYI-02: Reporte de Actividad de Usuarios
// =========================================================================

export interface MetricaVariacion {
  actual: number;
  anterior: number;
  porcentajeVariacion: number;
}

export interface KpisActividadUsuarios {
  nuevosRegistros: MetricaVariacion;
  usuariosActivosUnicos: MetricaVariacion;
  itinerariosCreados: MetricaVariacion;
  itinerariosCreadosIA: MetricaVariacion;
  itinerariosCreadosManual: MetricaVariacion;
  itinerariosFinalizados: MetricaVariacion;
  resenasAprobadas: MetricaVariacion;
  conversacionesIaIniciadas: MetricaVariacion;
  tasaRetencion: MetricaVariacion;
}

export interface PuntoEvolucionTemporal {
  periodo: string;
  etiqueta: string;
  nuevosRegistros: number;
  usuariosActivos: number;
  itinerariosCreados: number;
  itinerariosFinalizados: number;
  resenas: number;
  conversacionesIa: number;
}

export type GranularidadReporte = 'auto' | 'diaria' | 'semanal' | 'mensual';

export interface ReporteActividadUsuariosResponse {
  kpis: KpisActividadUsuarios;
  evolucionTemporal: PuntoEvolucionTemporal[];
  meta: {
    periodoActual: {
      fechaDesde: string;
      fechaHasta: string;
    };
    periodoAnterior: {
      fechaDesde: string;
      fechaHasta: string;
    };
    granularidadAplicada: 'diaria' | 'semanal' | 'mensual';
    totalDias: number;
  };
  mensaje?: string;
}

// =========================================================================
// US-RYI-03: Reporte Negocios Locales (Admin y Prestador)
// =========================================================================

export interface OrganizacionResumen {
  id: string;
  nombre: string;
}

export interface NegocioLocalItem {
  poiId: string;
  nombre: string;
  imagenPrincipalUrl?: string;
  organizacion?: OrganizacionResumen;
  categorias: CategoriaReporte[];
  ubicacion: UbicacionReporte;
  inclusionesRutas: number;
  checkInsConfirmados: number;
  tasaAbandono: number;
  esAltaTasaAbandono: boolean;
  puntuacionPromedio: number;
  volumenOpiniones: number;
  incidenciasReportadas: number;
  situacionAdministrativa: string;
  incrementoActividad?: number;
}

export interface RankingTopCrecimiento {
  poiId: string;
  nombre: string;
  categoria?: string;
  inclusionesActual: number;
  inclusionesAnterior: number;
  porcentajeCrecimiento: number;
}

export interface ReporteNegociosAdminResponse {
  data: NegocioLocalItem[];
  top10MayorCrecimiento: RankingTopCrecimiento[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    periodo: {
      fechaDesde: string;
      fechaHasta: string;
    };
  };
  mensaje?: string;
}

export interface PosicionRankingCategoria {
  categoriaId: string;
  categoriaNombre: string;
  posicionActual: number;
  totalEnCategoria: number;
  posicionAnterior: number;
  cambioPosiciones: number;
  subioPosiciones: boolean;
}

export interface TendenciaMensualNegocio {
  mes: string;
  etiquetaMes: string;
  paradasPlanificadas: number;
  checkIns: number;
}

export interface ResenaRecientePrestador {
  id: string;
  puntuacion: number | null;
  comentario?: string;
  fechaCreacion: string;
  autor: {
    nombre: string;
    avatarUrl?: string;
  };
  respuestaPrestador?: {
    id: string;
    comentario: string;
    fechaCreacion: string;
  };
}

export interface DetalleNegocioPrestador {
  poiId: string;
  nombre: string;
  imagenPrincipalUrl?: string;
  inclusionesRutas: number;
  checkInsConfirmados: number;
  tasaAbandono: number;
  esAltaTasaAbandono: boolean;
  puntuacionPromedio: number;
  volumenOpiniones: number;
  incidenciasReportadas: number;
  situacionAdministrativa: string;
  tendenciaMensual: TendenciaMensualNegocio[];
  resenasRecientes: ResenaRecientePrestador[];
  rankingCategoria?: PosicionRankingCategoria;
  categorias?: { id: string; nombre: string }[];
  ubicacion?: UbicacionReporte;
}

export interface ReporteNegociosPrestadorResponse {
  negocios: DetalleNegocioPrestador[];
  /** true cuando el Prestador no tiene ningún negocio vinculado */
  sinNegociosVinculados?: boolean;
  meta: {
    totalNegocios: number;
    totalNegociosVinculados?: number;
    periodo: {
      fechaDesde: string;
      fechaHasta: string;
    };
  };
  mensaje?: string;
}

// =========================================================================
// US-RYI-04: Reporte de Uso del Asistente IA
// =========================================================================

export interface DistribucionTematicaItem {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}

export interface MetricasAsistenteIa {
  totalConversaciones: number;
  totalMensajesEnviados: number;
  totalTokensConsumidos: number;
  costoPorToken: number;
  costoEstimado: number;
  umbralCostoAlerta: number;
  superaUmbralCosto: boolean;
  promedioMensajesPorConversacion: number;
  promedioTokensPorMensaje: number;
}

export interface ReporteAsistenteIaResponse {
  metricas: MetricasAsistenteIa;
  distribucionTematica: DistribucionTematicaItem[];
  datosSemanaAnterior: boolean;
  mensajeEstadoProcesamiento?: string;
  meta: {
    periodo: {
      fechaDesde: string;
      fechaHasta: string;
    };
  };
  mensaje?: string;
}

// =========================================================================
// US-RYI-05: Exportación de Reportes (PDF, XLSX, CSV)
// =========================================================================

export type FormatoExportacion = 'pdf' | 'xlsx' | 'csv';

export type TipoReporteExportacion = 
  | 'pois-mas-visitados' 
  | 'actividad-usuarios' 
  | 'negocios-locales' 
  | 'mi-negocio' 
  | 'asistente-ia'
  | 'distribucion-turistica';

export interface ExportReporteQuery {
  tipoReporte: TipoReporteExportacion;
  formato: FormatoExportacion;
  fechaDesde?: string;
  fechaHasta?: string;
  categoriaId?: string;
  departamento?: string;
  search?: string;
  ordenarPor?: string;
  orden?: 'ASC' | 'DESC';
}

export interface ExportReporteAsyncResponse {
  esAsincrono: boolean;
  totalRegistros: number;
  urlDescarga?: string;
  expiraEn?: string;
  token?: string;
  mensaje?: string;
}

export interface ReportExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ReportExportSection {
  title: string;
  columns: ReportExportColumn[];
  rows: Record<string, any>[];
  summary?: { label: string; value: string | number }[];
}

export interface ReportExportMetadata {
  nombreReporte: string;
  periodo: { fechaDesde: string; fechaHasta: string };
  filtrosAplicados: {
    categoria?: string;
    departamento?: string;
    ordenarPor?: string;
    orden?: string;
    busqueda?: string;
    [key: string]: any;
  };
  fechaGeneracion?: string;
}

// =========================================================================
// US-RYI-06: Filtros Globales (Disponibles y Configuración)
// =========================================================================

export interface FiltrosDisponiblesCatalogo {
  categorias: { id: string; nombre: string; descripcion?: string }[];
  departamentos: { id: string; nombre: string }[];
  zonas: { id: string; nombre: string }[];
  regiones: { id: string; nombre: string }[];
  configuracion: {
    fechaDesdeDefecto: string;
    fechaHastaDefecto: string;
    maxDiasRango: number;
    permiteFechasFuturas: boolean;
  };
}

// US-RYI-06: catálogo de filtros globales (GET /{rol}/reportes/filtros-disponibles)
export interface OpcionFiltroReporte {
  id: string;
  nombre: string;
}

export interface FiltrosDisponiblesReportes {
  categorias: OpcionFiltroReporte[];
  departamentos: OpcionFiltroReporte[];
  zonas: OpcionFiltroReporte[];
  regiones: OpcionFiltroReporte[];
  configuracion: {
    fechaDesdeDefecto: string;
    fechaHastaDefecto: string;
    maxDiasRango: number;
    permiteFechasFuturas: boolean;
  };
}
