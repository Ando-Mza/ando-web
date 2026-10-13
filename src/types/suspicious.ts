export type AlertaEstado = 'pendiente' | 'revisada' | 'cerrada';
export type AlertaCriticidad = 'baja' | 'media' | 'alta' | 'critica';

export interface AlertaUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  avatarUrl?: string;
}

export interface AlertaSospechosa {
  id: string;
  usuarioId?: string;
  usuario?: AlertaUsuario;
  tipoEvento: string;
  nivelCriticidad: AlertaCriticidad;
  estado: AlertaEstado;
  descripcion: string;
  detalles?: Record<string, unknown>;
  ip?: string;
  revisadoPorId?: string;
  revisadoPor?: AlertaUsuario;
  comentariosRevision?: string;
  comentariosCierre?: string;
  fechaRevisada?: string;
  fechaCerrada?: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface AlertasPage {
  data: AlertaSospechosa[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  mensaje?: string;
}

export interface AlertasMetricas {
  total: number;
  pendientes: number;
  revisadas: number;
  cerradas: number;
  porCriticidad: Record<AlertaCriticidad, number>;
}

export interface ReglaSospecha {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  umbral: number;
  ventanaTiempoMinutos: number;
  nivelCriticidad: AlertaCriticidad;
  tipoEvento: string;
  activo: boolean;
}

export interface AlertasFilters {
  estado?: 'todos' | AlertaEstado;
  nivelCriticidad?: AlertaCriticidad;
  tipoEvento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  limit?: number;
}
