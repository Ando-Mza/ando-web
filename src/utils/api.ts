const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

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
};
