const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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

  const response = await fetch(`${API_URL}${path}`, {
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

  // Users
  getUsers: () => request<any[]>('/user', 'GET'),
  getUser: (id: string) => request<any>(`/user/${id}`, 'GET'),
  deleteUser: (id: string) => request<any>(`/user/${id}`, 'DELETE'),

  // POI Categories
  getCategories: () => request<any[]>('/poi/categorias/all', 'GET'),
  createCategory: (nombre: string) => request<any>('/poi/categorias', 'POST', { nombre }),

  // POIs (Prestador)
  getMyPois: () => request<any[]>('/poi/prestador/my-pois', 'GET'),
  getMyPoiDetail: (id: string) => request<any>(`/poi/prestador/my-pois/${id}`, 'GET'),
  createPoi: (body: any) => request<any>('/poi/prestador/my-pois', 'POST', body),
  updatePoi: (id: string, body: any) => request<any>(`/poi/prestador/my-pois/${id}`, 'PATCH', body),

  // Schedules (Prestador)
  getHorariosByPoi: (poiId: string) => request<any[]>(`/poi/prestador/my-pois/${poiId}/horarios`, 'GET'),
  createHorario: (poiId: string, body: any) => request<any>(`/poi/prestador/my-pois/${poiId}/horarios`, 'POST', body),
  updateHorario: (poiId: string, horarioId: string, body: any) => request<any>(`/poi/prestador/my-pois/${poiId}/horarios/${horarioId}`, 'PATCH', body),
  deleteHorario: (poiId: string, horarioId: string) => request<any>(`/poi/prestador/my-pois/${poiId}/horarios/${horarioId}`, 'DELETE'),

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
    
    // 1. Obtener la URL firmada de Cloudflare R2 desde el backend NestJS
    const { uploadUrl, key } = await api.getPresignedUrl(file.name, file.type);
    
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
      // Construir la URL pública de la imagen
      return `https://images.andoapp.com/${key}`;
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
