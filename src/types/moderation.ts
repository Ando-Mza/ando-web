export type ModerationEstado = 'pendiente' | 'resuelto' | 'desestimado';
export type ModerationOrigen = 'Reporte de Usuario' | 'Detectado por IA';

export interface ModerationAutor {
  id: string;
  nombre: string;
  email: string;
  suspendido: boolean;
}

export interface ModerationCase {
  id: string;
  origen: ModerationOrigen;
  tipoContenido: string;
  entidad: string;
  entidadId: string;
  motivo: string;
  aclaracion?: string | null;
  fechaCreacion: string;
  estado: ModerationEstado;
  reportante?: { id: string; nombre: string; email: string } | null;
  contenido: {
    id: string;
    texto?: string | null;
    autor?: ModerationAutor | null;
    poi?: { id: string; nombre: string } | null;
  };
}

export interface ModerationPage {
  data: ModerationCase[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ModerationFilters {
  origen?: 'todos' | 'usuario' | 'ia';
  entidad?: string;
  estado?: 'todos' | ModerationEstado;
  page?: number;
  limit?: number;
}
