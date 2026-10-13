export interface AuditoriaUsuarioDto {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  avatarUrl?: string;
}

export type EventoAuditoriaTipo = 
  | 'all'
  | 'accion_usuario'
  | 'error_sistema'
  | 'cambio_poi'
  | 'login_fallido';

export interface AuditoriaLogItemDto {
  id: string;
  usuarioId?: string;
  entidad: string;
  entidadId?: string;
  accion: string;
  /** Categoría del evento calculada por el backend (US-AYT-01) */
  tipoEvento?: Exclude<EventoAuditoriaTipo, 'all'>;
  detalle?: Record<string, any>;
  ip?: string;
  fechaCreacion: string | Date;
  usuario?: AuditoriaUsuarioDto;
}

export interface PaginationMetaDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedAuditLogsResponseDto {
  data: AuditoriaLogItemDto[];
  meta: PaginationMetaDto;
}

export interface QueryAuditLogsParams {
  fechaDesde?: string;
  fechaHasta?: string;
  tipoEvento?: string;
  accion?: string;
  entidad?: string;
  usuarioId?: string;
  search?: string;
  page?: number;
  limit?: number;
}
