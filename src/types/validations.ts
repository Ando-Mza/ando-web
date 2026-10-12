export type ValidacionEstado = 'pendiente' | 'validado' | 'rechazada';

export interface ValidacionDocumento {
  id: string;
  tipoDocumento: string;
  nombreArchivo: string;
  archivoUrl: string;
  fechaSubida: string;
  validado: boolean;
}

export interface SolicitudValidacion {
  id: string;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    telefono?: string | null;
    verificado: boolean;
  };
  tipoValidacion: string;
  estado: ValidacionEstado;
  fechaSolicitud: string;
  fechaRevision?: string | null;
  observacionesAdmin?: string | null;
  documentosRequeridos: string[];
  cantidadDocumentosAdjuntos: number;
  documentacionCompleta: boolean;
  documentos: ValidacionDocumento[];
}

export interface ValidacionesPage {
  data: SolicitudValidacion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ValidacionesFilters {
  estado?: 'todos' | ValidacionEstado;
  tipoValidacion?: string;
  page?: number;
  limit?: number;
}
