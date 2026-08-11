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
  getProfile: () => request<any>('/auth/profile', 'GET'),

  // Users & Profiles
  getUsers: () => request<any[]>('/user', 'GET'),
  getUser: (id: string) => request<any>(`/user/${id}`, 'GET'),
  deleteUser: (id: string) => request<any>(`/user/${id}`, 'DELETE'),
  updateProfile: (body: any) => request<any>('/user/profile', 'PATCH', body),
  getPrestadorProfile: () => request<any>('/user/prestador/profile', 'GET'),
  updatePrestadorProfile: (body: any) => request<any>('/user/prestador/profile', 'PATCH', body),
  changePassword: (body: any) => request<any>('/user/profile/change-password', 'POST', body),

  // POI Status (Admin)
  updatePoiStatus: (id: string, estado: string) => request<any>(`/poi/${id}/estado?estado=${encodeURIComponent(estado)}`, 'PATCH'),

  // POI Categories (Admin)
  getCategories: () => request<any[]>('/poi/categorias/all', 'GET'),
  createCategory: (nombre: string) => request<any>('/poi/categorias', 'POST', { nombre }),
  updateCategory: (id: string, nombre: string) => request<any>(`/poi/categorias/${id}`, 'PATCH', { nombre }),
  toggleCategoryActiva: (id: string, activa: boolean) => request<any>(`/poi/categorias/${id}/activar?activa=${activa}`, 'PATCH'),
  deleteCategory: (id: string) => request<any>(`/poi/categorias/${id}`, 'DELETE'),

  // POI Tags (Admin)
  getEtiquetas: (soloActivas?: boolean) => request<any[]>(`/poi/etiquetas${soloActivas ? '?soloActivas=true' : ''}`, 'GET'),
  createEtiqueta: (nombre: string) => request<any>('/poi/etiquetas', 'POST', { nombre }),
  updateEtiqueta: (id: string, nombre: string) => request<any>(`/poi/etiquetas/${id}`, 'PATCH', { nombre }),
  toggleEtiquetaActiva: (id: string, activa: boolean) => request<any>(`/poi/etiquetas/${id}/activar?activa=${activa}`, 'PATCH'),
  deleteEtiqueta: (id: string) => request<any>(`/poi/etiquetas/${id}`, 'DELETE'),

  // POIs (Prestador)
  getMyPois: () => request<any[]>('/poi/prestador/my-pois', 'GET'),
  getMyPoiDetail: (id: string) => request<any>(`/poi/prestador/my-pois/${id}`, 'GET'),
  createPoi: (body: any) => request<any>('/poi/prestador/my-pois', 'POST', body),
  updatePoi: (id: string, body: any) => request<any>(`/poi/prestador/my-pois/${id}`, 'PATCH', body),

  // Schedules (Prestador)
  getHorariosByPoi: (poiId: string) => request<any[]>(`/poi/prestador/my-pois/${poiId}/horarios`, 'GET'),
  createHorario: (poiId: string, body: any) => request<any>(`/poi/prestador/my-pois/${poiId}/horarios`, 'POST', body),
  createMultipleHorarios: (poiId: string, horarios: any[]) => request<any>(`/poi/prestador/my-pois/${poiId}/horarios/batch`, 'POST', { horarios }),
  updateHorario: (poiId: string, horarioId: string, body: any) => request<any>(`/poi/prestador/my-pois/${poiId}/horarios/${horarioId}`, 'PATCH', body),
  deleteHorario: (poiId: string, horarioId: string) => request<any>(`/poi/prestador/my-pois/${poiId}/horarios/${horarioId}`, 'DELETE'),
  deleteAllHorarios: (poiId: string) => request<any>(`/poi/prestador/my-pois/${poiId}/horarios`, 'DELETE'),

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
