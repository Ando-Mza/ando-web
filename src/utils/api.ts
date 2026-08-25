import { ENV } from '../config/env';

async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  customHeaders: Record<string, string> = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${ENV.API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMessage = `Error HTTP: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || (Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message) || errorMessage;
    } catch {
      // Ignorar si no es JSON
    }
    throw new Error(errorMessage);
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
  getProfile: () => request<any>('/user/profile', 'GET'),

  // Password Recovery (US-ACC-03)
  requestPasswordRecovery: (email: string) =>
    request<any>('/auth/password-recovery/request', 'POST', { email }),
  validateRecoveryToken: (token: string) =>
    request<any>(`/auth/password-recovery/validate?token=${encodeURIComponent(token)}`, 'GET'),
  resetPassword: (body: { token: string; newPassword: string; confirmPassword: string }) =>
    request<any>('/auth/password-recovery/reset', 'POST', body),

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
  getAdminRevisionPois: (params?: { estado?: string; estadoId?: string; fuente?: string; search?: string; page?: number; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.estadoId) qs.set('estadoId', params.estadoId);
    if (params?.estado) qs.set('estado', params.estado);
    if (params?.fuente) qs.set('fuente', params.fuente);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const queryString = qs.toString();
    return request<any>(`/poi/admin/revision${queryString ? `?${queryString}` : ''}`, 'GET');
  },
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
  createCategory: (nombre: string) => request<any>('/poi/categorias', 'POST', { nombre }),
  updateCategory: (id: string, nombre: string) => request<any>(`/poi/categorias/${id}`, 'PATCH', { nombre }),
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
  getServiciosByPoi: (poiId: string) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/servicios`, 'GET'),
  createServicioPoi: (poiId: string, body: any) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/servicios`, 'POST', body),
  updateServicioPoi: (poiId: string, servicioId: string, body: any) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/servicios/${servicioId}`, 'PATCH', body),
  toggleEstadoServicioPoi: (poiId: string, servicioId: string, activo: boolean) =>
    request<any>(`/poi/prestador/my-pois/${poiId}/servicios/${servicioId}/estado`, 'PATCH', { activo }),

  // Reportes y Soporte (US-CYN-08, US-AYS-05)
  createReporteContenido: (body: {
    poiId?: string;
    reviewId?: string;
    motivo: string;
    descripcion?: string;
  }) => request<any>('/reportes', 'POST', body),

  // Storage / Cloudflare R2 Uploads
  getPresignedUrl: (fileName: string, contentType: string) =>
    request<{ uploadUrl: string; key: string }>('/storage/presigned-url', 'POST', { fileName, contentType }),
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
