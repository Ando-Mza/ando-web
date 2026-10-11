import { ENV } from '../config/env';
import { ExportReporteQuery, ExportReporteAsyncResponse, FiltrosDisponiblesReportes } from '@/types/reportes';
import { QueryAuditLogsParams, PaginatedAuditLogsResponseDto } from '@/types/audit';
import { AyudaCategoria, AyudaArticulo, AyudaArticuloTipo } from '@/types';

/** Error de la API con el código HTTP, para que la UI distinga 403, 410, etc. */
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Los reportes agregan datos de varias tablas y pueden demorar más que una consulta común. */
const REPORT_TIMEOUT_MS = 45000;

function mensajeDeError(errorData: any, fallback: string): string {
  const message = errorData?.message;
  if (Array.isArray(message)) return message.join(', ');
  return message || fallback;
}

async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT' = 'GET',
  body?: any,
  customHeaders: Record<string, string> = {},
  timeoutMs: number = 10000
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    response = await fetch(`${ENV.API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new ApiError('El servidor tardó demasiado en responder. Intentá nuevamente.');
    }
    throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
  }

  if (!response.ok) {
    let errorMessage = `Error HTTP: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = mensajeDeError(errorData, errorMessage);
    } catch {
      // Ignorar si no es JSON
    }
    throw new ApiError(errorMessage, response.status);
  }

  if (response.status === 204 || response.status === 205) {
    return {} as T;
  }

  try {
    return await response.json();
  } catch {
    return {} as T;
  }
}

export const api = {
  // Auth
  login: (body: any) => request<any>('/auth/login', 'POST', body),
  logout: (body?: any) => request<any>('/auth/logout', 'POST', body),
  registerPrestador: (body: any) => request<any>('/auth/register/prestador', 'POST', body),
  getProfile: () => request<any>('/auth/profile', 'GET'),
  requestPasswordRecovery: (email: string) =>
    request<{ message: string }>('/auth/password-recovery/request', 'POST', { email }),
  validatePasswordRecoveryToken: (token: string) =>
    request<{ valid: boolean; message: string }>(
      `/auth/password-recovery/validate?token=${encodeURIComponent(token)}`,
      'GET',
    ),
  resetPasswordWithToken: (body: { token: string; passwordNueva: string; confirmPassword: string }) =>
    request<{ message: string }>('/auth/password-recovery/reset', 'POST', body),

  // Users & Profiles
  getUsers: (params?: { search?: string; rol?: string }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.rol) qs.set('rol', params.rol);
    const queryString = qs.toString();
    return request<any[]>(`/user${queryString ? `?${queryString}` : ''}`, 'GET');
  },
  getUser: (id: string) => request<any>(`/user/${id}`, 'GET'),
  createUser: (body: any) => request<any>('/user', 'POST', body),
  updateUser: (id: string, body: any) => request<any>(`/user/${id}`, 'PATCH', body),
  deleteUser: (id: string) => request<any>(`/user/${id}`, 'DELETE'),
  updateProfile: (body: any) => request<any>('/user/profile', 'PATCH', body),
  getPrestadorProfile: () => request<any>('/user/prestador/profile', 'GET'),
  updatePrestadorProfile: (body: any) => request<any>('/user/prestador/profile', 'PATCH', body),
  changePassword: (body: { passwordActual: string; passwordNueva: string }) =>
    request<any>('/user/profile/change-password', 'POST', body),
  verifyPassword: (password: string) =>
    request<{ success: boolean }>('/user/profile/verify-password', 'POST', { password }),
  deleteMyAccount: (body: { userId: string; passwordActual: string; motivo: string; detalle?: string }) =>
    request<any>('/user/profile', 'DELETE', body),

  // POI Status — Admin (endpoint genérico, se mantiene para compatibilidad)
  updatePoiStatus: (id: string, estado: string) =>
    request<any>(`/poi/${id}/estado?estado=${encodeURIComponent(estado)}`, 'PATCH'),

  // Admin POI Revision (US-CYN-05, US-GIT-07)
  getAdminRevisionPois: (params?: { estado?: string; estadoId?: string; incluirTodos?: string | boolean; fuente?: string; search?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.estadoId) qs.set('estadoId', params.estadoId);
    if (params?.estado) qs.set('estado', params.estado);
    if (params?.incluirTodos !== undefined) qs.set('incluirTodos', String(params.incluirTodos));
    if (params?.fuente) qs.set('fuente', params.fuente);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const queryString = qs.toString();
    return request<any>(`/poi/admin/revision${queryString ? `?${queryString}` : ''}`, 'GET');
  },
  getAllPublicPois: () => request<any[]>('/poi', 'GET'),
  getAdminPoiRevisionDetail: (id: string) =>
    request<any>(`/poi/admin/revision/${id}`, 'GET'),
  aprobarPoi: (id: string) =>
    request<any>(`/poi/admin/revision/${id}/aprobar`, 'POST'),
  rechazarPoi: (id: string, motivo: string) =>
    request<any>(`/poi/admin/revision/${id}/rechazar`, 'POST', { motivo }),
  solicitarCorreccionPoi: (id: string, observaciones: string) =>
    request<any>(`/poi/admin/revision/${id}/solicitar-correccion`, 'POST', { observaciones }),
  getValidacionComunitariaPois: () =>
    request<any[]>('/poi/validacion-comunitaria', 'GET'),

  // POI Images — Admin
  deletePoiImagen: (poiId: string, imagenId: string) =>
    request<any>(`/poi/${poiId}/imagenes/${imagenId}`, 'DELETE'),

  // POI Categories (Admin)
  getCategories: () => request<any[]>('/poi/categorias/all', 'GET'),
  createCategory: (data: { nombre: string; descripcion?: string; activa?: boolean }) => request<any>('/poi/categorias', 'POST', data),
  updateCategory: (id: string, data: { nombre?: string; descripcion?: string; activa?: boolean }) => request<any>(`/poi/categorias/${id}`, 'PATCH', data),
  toggleCategoryActiva: (id: string, activa: boolean) =>
    request<any>(`/poi/categorias/${id}/activar?activa=${activa}`, 'PATCH'),
  deleteCategory: (id: string) => request<any>(`/poi/categorias/${id}`, 'DELETE'),

  // POI Tags (Admin)
  getEtiquetas: (soloActivas?: boolean) =>
    request<any[]>(`/poi/etiquetas${soloActivas ? '?soloActivas=true' : ''}`, 'GET'),
  createEtiqueta: (nombre: string) => request<any>('/poi/etiquetas', 'POST', { nombre }),
  updateEtiqueta: (id: string, nombre: string) => request<any>(`/poi/etiquetas/${id}`, 'PATCH', { nombre }),
  toggleEtiquetaActiva: (id: string, activa: boolean) =>
    request<any>(`/poi/etiquetas/${id}/activar?activa=${activa}`, 'PATCH'),
  deleteEtiqueta: (id: string) => request<any>(`/poi/etiquetas/${id}`, 'DELETE'),

  // Validation States (Admin - US-CYP-04)
  getValidationStates: (soloActivos?: boolean) =>
    request<any[]>(`/admin/estados-validacion${soloActivos ? '?soloActivos=true' : ''}`, 'GET'),
  createValidationState: (body: any) => request<any>('/admin/estados-validacion', 'POST', body),
  updateValidationState: (id: string, body: any) => request<any>(`/admin/estados-validacion/${id}`, 'PATCH', body),
  toggleValidationState: (id: string, activa: boolean) =>
    request<any>(`/admin/estados-validacion/${id}/estado?activa=${activa}`, 'PATCH'),
  deleteValidationState: (id: string) => request<any>(`/admin/estados-validacion/${id}`, 'DELETE'),

  // Ubicaciones (Regiones, Departamentos, Zonas - US-CYN-02)
  getRegiones: (includeAll?: boolean) =>
    request<any[]>(`/ubicaciones/regiones${includeAll ? '?includeAll=true' : ''}`, 'GET'),
  getDepartamentos: (regionId?: string, includeAll?: boolean) => {
    const qs = new URLSearchParams();
    if (regionId) qs.set('regionId', regionId);
    if (includeAll) qs.set('includeAll', 'true');
    const q = qs.toString();
    return request<any[]>(`/ubicaciones/departamentos${q ? `?${q}` : ''}`, 'GET');
  },
  getZonas: (departamentoId?: string, includeAll?: boolean) => {
    const qs = new URLSearchParams();
    if (departamentoId) qs.set('departamentoId', departamentoId);
    if (includeAll) qs.set('includeAll', 'true');
    const q = qs.toString();
    return request<any[]>(`/ubicaciones/zonas${q ? `?${q}` : ''}`, 'GET');
  },

  // POIs (Prestador)
  getMyPois: () => request<any[]>('/poi/prestador/my-pois', 'GET'),
  getMyPoiDetail: (id: string) => request<any>(`/poi/prestador/my-pois/${id}`, 'GET'),
  createPoi: (body: any) => request<any>('/poi/prestador/my-pois', 'POST', body),
  updatePoi: (id: string, body: any) => request<any>(`/poi/prestador/my-pois/${id}`, 'PATCH', body),

  // Schedules / Horarios (Prestador)
  getHorariosByPoi: (poiId: string) =>
    request<any[]>(`/poi/prestador/my-pois/${poiId}/horarios`, 'GET'),
  createHorario: (poiId: string, body: any) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/horarios`, 'POST', body),
  createMultipleHorarios: (poiId: string, horarios: any[]) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/horarios/batch`, 'POST', { horarios }),
  updateHorario: (poiId: string, horarioId: string, body: any) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/horarios/${horarioId}`, 'PATCH', body),
  deleteHorario: (poiId: string, horarioId: string) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/horarios/${horarioId}`, 'DELETE'),
  deleteAllHorarios: (poiId: string) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/horarios`, 'DELETE'),

  // Reviews / Reseñas (Prestador / Admin)
  getMisReviewsPrestador: () => request<any>('/review/prestador/mis-reviews', 'GET'),
  getReviewsByPoi: (poiId: string, query?: { ordenarPor?: string; orden?: 'ASC' | 'DESC'; puntuacion?: number }) => {
    const params = new URLSearchParams();
    if (query?.ordenarPor) params.append('ordenarPor', query.ordenarPor);
    if (query?.orden) params.append('orden', query.orden);
    if (query?.puntuacion) params.append('puntuacion', String(query.puntuacion));
    const qs = params.toString();
    return request<any>(`/review/poi/${poiId}${qs ? `?${qs}` : ''}`, 'GET');
  },
  replyReview: (reviewId: string, comentario: string) =>
    request<any>(`/review/${reviewId}/response`, 'POST', { comentario }),
  deleteReview: (reviewId: string) => request<any>(`/review/${reviewId}`, 'DELETE'),

  // Servicios (Catálogo y Negocios - US-CYN-03)
  getCatalogoServicios: (soloActivos?: boolean) =>
    request<any>(`/poi/servicios/catalogo${soloActivos ? '?soloActivos=true' : ''}`, 'GET'),
  getServiciosByPoi: async (poiId: string) => {
    try {
      return await request<any>(`/poi/prestador/my-pois/${poiId}/servicios`, 'GET');
    } catch {
      return await request<any>(`/poi/${poiId}/servicios`, 'GET');
    }
  },
  createServicioPoi: (poiId: string, body: any) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/servicios`, 'POST', body),
  updateServicioPoi: (poiId: string, servicioId: string, body: any) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/servicios/${servicioId}`, 'PATCH', body),
  toggleEstadoServicioPoi: (poiId: string, servicioId: string, activo: boolean) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/servicios/${servicioId}/estado`, 'PATCH', { activo }),
  deleteServicioPoi: (poiId: string, servicioId: string) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/servicios/${servicioId}`, 'DELETE'),

  // Reportes y Soporte (US-CYN-08, US-AYS-03, US-AYS-05)
  createReporteContenido: (body: {
    poiId?: string;
    reviewId?: string;
    motivo: string;
    descripcion?: string;
  }) => request<any>('/reportes', 'POST', body),
  createConsultaSoporte: (body: { asunto: string; descripcion: string; evidencia?: string }) => 
    request<any>('/soporte/consultas', 'POST', body),
  createReporteError: (body: { asunto: string; descripcion: string; evidencias?: string[] }) =>
    request<{ id: string; mensaje: string }>('/soporte/reportes-error', 'POST', body),

  // Módulo de Reportes e Informes (US-RYI-01, US-RYI-06)
  getReportePoisMasVisitados: (params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    categoriaId?: string;
    departamentoId?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.fechaDesde) qs.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) qs.set('fechaHasta', params.fechaHasta);
    if (params?.categoriaId && params.categoriaId !== 'all') qs.set('categoriaId', params.categoriaId);
    if (params?.departamentoId && params.departamentoId !== 'all') qs.set('departamentoId', params.departamentoId);
    if (params?.search) qs.set('search', params.search);
    if (params?.sortBy) qs.set('sortBy', params.sortBy);
    if (params?.sortOrder) qs.set('sortOrder', params.sortOrder);
    if (params?.page) qs.set('page', params.page.toString());
    if (params?.limit) qs.set('limit', params.limit.toString());
    const query = qs.toString();
    return request<any>(`/admin/reportes/pois-mas-visitados${query ? `?${query}` : ''}`, 'GET', undefined, {}, REPORT_TIMEOUT_MS);
  },
  getDetalleMensualPoi: (poiId: string, params?: { fechaDesde?: string; fechaHasta?: string }) => {
    const qs = new URLSearchParams();
    if (params?.fechaDesde) qs.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) qs.set('fechaHasta', params.fechaHasta);
    const query = qs.toString();
    return request<any>(`/admin/reportes/pois-mas-visitados/${poiId}/detalle-mensual${query ? `?${query}` : ''}`, 'GET', undefined, {}, REPORT_TIMEOUT_MS);
  },
  // US-RYI-02: Reporte de Actividad de Usuarios
  getReporteActividadUsuarios: (params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    granularidad?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.fechaDesde) qs.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) qs.set('fechaHasta', params.fechaHasta);
    if (params?.granularidad && params.granularidad !== 'auto') qs.set('granularidad', params.granularidad);
    const query = qs.toString();
    return request<any>(`/admin/reportes/actividad-usuarios${query ? `?${query}` : ''}`, 'GET', undefined, {}, REPORT_TIMEOUT_MS);
  },
  // US-RYI-03: Reporte Negocios Locales (Admin y Prestador)
  getReporteNegociosAdmin: (params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    categoriaId?: string;
    departamentoId?: string;
    estado?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params?.fechaDesde) qs.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) qs.set('fechaHasta', params.fechaHasta);
    if (params?.categoriaId && params.categoriaId !== 'all') qs.set('categoriaId', params.categoriaId);
    if (params?.departamentoId && params.departamentoId !== 'all') qs.set('departamentoId', params.departamentoId);
    if (params?.estado && params.estado !== 'all') qs.set('estado', params.estado);
    if (params?.search) qs.set('search', params.search);
    if (params?.sortBy) qs.set('sortBy', params.sortBy);
    if (params?.sortOrder) qs.set('sortOrder', params.sortOrder);
    if (params?.page) qs.set('page', params.page.toString());
    if (params?.limit) qs.set('limit', params.limit.toString());
    const query = qs.toString();
    return request<any>(`/admin/reportes/negocios-locales${query ? `?${query}` : ''}`, 'GET', undefined, {}, REPORT_TIMEOUT_MS);
  },
  getReporteNegociosPrestador: (params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    categoriaId?: string;
    departamentoId?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.fechaDesde) qs.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) qs.set('fechaHasta', params.fechaHasta);
    if (params?.categoriaId && params.categoriaId !== 'all') qs.set('categoriaId', params.categoriaId);
    if (params?.departamentoId && params.departamentoId !== 'all') qs.set('departamentoId', params.departamentoId);
    if (params?.search) qs.set('search', params.search);
    const query = qs.toString();
    return request<any>(`/prestador/reportes/mi-negocio${query ? `?${query}` : ''}`, 'GET', undefined, {}, REPORT_TIMEOUT_MS);
  },
  // US-RYI-04: Reporte de Uso del Asistente IA
  getReporteAsistenteIa: (params?: { fechaDesde?: string; fechaHasta?: string }) => {
    const qs = new URLSearchParams();
    if (params?.fechaDesde) qs.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) qs.set('fechaHasta', params.fechaHasta);
    const query = qs.toString();
    return request<any>(`/admin/reportes/asistente-ia${query ? `?${query}` : ''}`, 'GET', undefined, {}, REPORT_TIMEOUT_MS);
  },
  updateUmbralCostoAsistente: (umbralCostoAlerta: number) =>
    request<{ umbralCostoAlerta: number }>('/admin/reportes/asistente-ia/umbral-costo', 'PATCH', {
      umbralCostoAlerta,
    }),
  getFiltrosDisponiblesReportes: (rol: 'admin' | 'prestador' = 'admin') =>
    request<FiltrosDisponiblesReportes>(`/${rol}/reportes/filtros-disponibles`, 'GET'),

  // US-RYI-05: Exportación de Reportes (el archivo lo genera el backend con los filtros aplicados)
  exportarReporte: async (
    rol: 'admin' | 'prestador',
    params: ExportReporteQuery
  ): Promise<{ esAsincrono: boolean; blob?: Blob; filename?: string; asyncResponse?: ExportReporteAsyncResponse }> => {
    const qs = new URLSearchParams();
    qs.set('tipoReporte', rol === 'prestador' ? 'mi-negocio' : params.tipoReporte);
    qs.set('formato', params.formato);
    if (params.fechaDesde) qs.set('fechaDesde', params.fechaDesde);
    if (params.fechaHasta) qs.set('fechaHasta', params.fechaHasta);
    if (params.categoriaId && params.categoriaId !== 'all') qs.set('categoriaId', params.categoriaId);
    if (params.departamento && params.departamento !== 'all') qs.set('departamento', params.departamento);
    if (params.search) qs.set('search', params.search);
    if (params.ordenarPor) qs.set('ordenarPor', params.ordenarPor);
    if (params.orden) qs.set('orden', params.orden);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let res: Response;
    try {
      res = await fetch(`${ENV.API_BASE_URL}/${rol}/reportes/exportar?${qs.toString()}`, {
        method: 'GET',
        headers,
      });
    } catch {
      throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(mensajeDeError(err, 'No se pudo generar la exportación.'), res.status);
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const asyncData: ExportReporteAsyncResponse = await res.json();
      return { esAsincrono: true, asyncResponse: asyncData };
    }

    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition') || '';
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : `reporte-${params.tipoReporte}.${params.formato}`;
    return { esAsincrono: false, blob, filename };
  },

  /** Descarga un archivo generado en segundo plano. Lanza ApiError con status 410 si el enlace venció. */
  descargarExportacion: async (
    token: string,
    rol: 'admin' | 'prestador' = 'admin'
  ): Promise<{ blob: Blob; filename: string }> => {
    const userToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    const headers: Record<string, string> = {};
    if (userToken) headers['Authorization'] = `Bearer ${userToken}`;

    let res: Response;
    try {
      res = await fetch(`${ENV.API_BASE_URL}/${rol}/reportes/exportar/descargar/${token}`, {
        method: 'GET',
        headers,
      });
    } catch {
      throw new ApiError('No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ApiError(mensajeDeError(err, 'No se pudo descargar el archivo.'), res.status);
    }

    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition') || '';
    const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : 'reporte-exportado';
    return { blob, filename };
  },

  // Storage / Cloudflare R2 Uploads
  getPresignedUrl: (fileName: string, contentType: string) =>
    request<{ uploadUrl: string; key: string }>('/storage/presigned-url', 'POST', { fileName, contentType }),

  // Auditoría y Trazabilidad (US-AYT-01)
  getAuditLogs: (params?: QueryAuditLogsParams) => {
    const query = new URLSearchParams();
    if (params?.fechaDesde) query.append('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) query.append('fechaHasta', params.fechaHasta);
    if (params?.tipoEvento && params.tipoEvento !== 'all') query.append('tipoEvento', params.tipoEvento);
    if (params?.accion) query.append('accion', params.accion);
    if (params?.entidad) query.append('entidad', params.entidad);
    if (params?.usuarioId && params.usuarioId !== 'all') query.append('usuarioId', params.usuarioId);
    if (params?.search) query.append('search', params.search);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<PaginatedAuditLogsResponseDto>(`/audit/logs${qs}`, 'GET');
  },

  // Soporte y Onboarding (US-AYS-04 & US-AYS-05)
  completeOnboarding: () =>
    request<{ onboardingCompletado: boolean }>('/user/profile/onboarding', 'PATCH'),

  // Ayuda y Soporte — Gestión de Contenidos (US-AYS-01 & US-AYS-06)
  getAyudaCategorias: () =>
    request<AyudaCategoria[]>('/ayuda/categorias', 'GET'),
  createAyudaCategoria: (body: { nombre: string; descripcion?: string; activo?: boolean }) =>
    request<AyudaCategoria>('/ayuda/categorias', 'POST', body),
  updateAyudaCategoria: (id: string, body: Partial<{ nombre: string; descripcion: string; activo: boolean }>) =>
    request<AyudaCategoria>(`/ayuda/categorias/${id}`, 'PATCH', body),
  getAyudaArticulos: (params?: { search?: string; q?: string; categoriaId?: string; tipo?: AyudaArticuloTipo }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.q) query.append('q', params.q);
    if (params?.categoriaId) query.append('categoriaId', params.categoriaId);
    if (params?.tipo) query.append('tipo', params.tipo);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<AyudaArticulo[]>(`/ayuda/articulos${qs}`, 'GET');
  },
  getAyudaCategoriasAdmin: () =>
    request<AyudaCategoria[]>('/ayuda/admin/categorias', 'GET'),
  getAyudaArticulosAdmin: () =>
    request<AyudaArticulo[]>('/ayuda/admin/articulos', 'GET'),
  deleteAyudaCategoria: (id: string) =>
    request<{ id: string; eliminado: boolean }>(`/ayuda/categorias/${id}`, 'DELETE'),
  deleteAyudaArticulo: (id: string) =>
    request<{ id: string; eliminado: boolean }>(`/ayuda/articulos/${id}`, 'DELETE'),
  getAyudaArticulo: (id: string) =>
    request<AyudaArticulo>(`/ayuda/articulos/${id}`, 'GET'),
  createAyudaArticulo: (body: {
    categoriaId: string;
    tipo: AyudaArticuloTipo;
    titulo: string;
    contenido: string;
    palabrasClave: string[];
    rolesPermitidos: string[];
    activo?: boolean;
  }) => request<AyudaArticulo>('/ayuda/articulos', 'POST', body),
  updateAyudaArticulo: (
    id: string,
    body: Partial<{
      categoriaId: string;
      tipo: AyudaArticuloTipo;
      titulo: string;
      contenido: string;
      palabrasClave: string[];
      rolesPermitidos: string[];
      activo: boolean;
    }>
  ) => request<AyudaArticulo>(`/ayuda/articulos/${id}`, 'PATCH', body),

  // Parámetros Generales (US-CYP-01)
  getParametrosGenerales: () => request<any[]>('/parametros', 'GET'),
  updateParametro: (identifier: string, valor: string) =>
    request<any>(`/parametros/${identifier}`, 'PATCH', { valor }),
  resetParametro: (identifier: string) => request<any>(`/parametros/${identifier}/reset`, 'POST'),

  // Integraciones (US-CYP-07)
  getIntegraciones: () => request<any[]>('/integraciones', 'GET'),
  updateIntegracion: (id: string, body: any) =>
    request<any>(`/integraciones/${id}`, 'PATCH', body),
  toggleIntegracion: (id: string, habilitada: boolean) =>
    request<any>(`/integraciones/${id}/estado`, 'PATCH', { habilitada }),
  testIntegracion: (id: string, confirmarConsumo?: boolean) =>
    request<any>(`/integraciones/${id}/prueba-conexion`, 'POST', { confirmarConsumo }),

  // Notifications (US-NYA-04, 05, 07)
  getNotifications: () => request<any[]>('/notifications', 'GET'),
  getUnreadNotificationsCount: () => request<number>('/notifications/unread-count', 'GET'),
  markNotificationAsRead: (id: string) => request<any>(`/notifications/${id}/read`, 'PATCH'),
  markAllNotificationsAsRead: () => request<any>('/notifications/read-all', 'PATCH'),
  getNotificationPreferences: () => request<any>('/notifications/preferences', 'GET'),
  updateNotificationPreferences: (preferencias: any[]) => request<any>('/notifications/preferences', 'PUT', { preferencias }),
  
  // Platform Updates (US-NYA-06)
  publishPlatformUpdate: (body: { titulo: string; mensaje: string; urlAccion?: string }) =>
    request<any>('/notifications/platform-update', 'POST', body),
};

/**
 * Helper para subir un archivo directamente desde el dispositivo del usuario a Cloudflare R2 usando URLs firmadas.
 */
export async function uploadFileToR2(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    if (onProgress) onProgress(15);
    
    const resData = await api.getPresignedUrl(file.name, file.type);
    const uploadUrl = resData.uploadUrl;
    const key = resData.key;
    const publicUrl = (resData as any).publicUrl || `${ENV.R2_PUBLIC_URL}/${key}`;
    
    if (onProgress) onProgress(45);

    // 2. Subir el archivo binario a Cloudflare R2 mediante PUT HTTP
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (onProgress) onProgress(85);

    if (uploadRes.ok) {
      if (onProgress) onProgress(100);
      return publicUrl;
    }
  } catch (error) {
    console.warn('Advertencia: Subida a R2 no completada, utilizando vista previa local:', error);
  }

  // Fallback: Leer archivo local con FileReader para previsualizar si R2 no tiene llaves de producción
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
}
