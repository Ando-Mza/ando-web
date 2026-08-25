'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  POI,
  Schedule,
  AuditLog,
  GeneralParams,
  Integration,
  User,
  UserRole,
  Category,
  ValidationState,
  POIStatus,
  Review,
  Etiqueta,
  ServiceItem,
  ReviewItem,
  NotificationItem,
  AuditLogEntry,
  FAQItem
} from '../types';
import {
  mockIntegrations,
  mockTranslations,
  mockValidationStates,
  TranslationDict
} from '../utils/mockData';
import { api } from '../utils/api';
import { DEFAULT_GENERAL_PARAMS } from '../config/constants';
import { USER_ROLES } from '../constants/enums';
import { mapBackendRoleToFrontend, mapBackendStatusToFrontend } from '../utils/roleUtils';

interface AppContextProps {
  currentUser: User | null;
  users: User[];
  pois: POI[];
  schedules: Schedule[];
  logs: AuditLog[];
  generalParams: GeneralParams;
  integrations: Integration[];
  categories: Category[];
  validationStates: ValidationState[];
  reviews: Review[];
  addReviewReply: (reviewId: string, comment: string) => void;
  translations: TranslationDict;
  currentLanguage: 'es' | 'en' | 'pt';
  setCurrentLanguage: (lang: 'es' | 'en' | 'pt') => void;
  login: (role: UserRole) => boolean;
  loginWithCredentials: (email: string, password: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => void;
  registerProvider: (userData: Omit<User, 'id' | 'role' | 'status'> & { password: string }) => Promise<{ success: boolean; error?: string }>;
  updateProviderProfile: (id: string, updatedData: Partial<User>) => { success: boolean; error?: string };
  changePassword: (passwordActual: string, passwordNueva: string) => Promise<{ success: boolean; error?: string }>;
  deleteProviderAccount: (id: string, options?: { passwordActual?: string; motivo?: string; detalle?: string }) => Promise<{ success: boolean; error?: string }>;
  adminCreateUser: (userData: Omit<User, 'id'> & { password?: string }) => Promise<{ success: boolean; error?: string }>;
  adminDeleteUser: (id: string) => { success: boolean };
  approvePOI: (id: string, adminName: string) => void;
  rejectPOI: (id: string, adminName: string, feedback: string) => void;
  requestCorrectionPOI: (id: string, adminName: string, feedback: string) => void;
  deletePOIImage: (poiId: string, imageUrl: string, adminName: string) => void;
  updateGeneralParams: (params: GeneralParams) => void;
  resetGeneralParams: () => void;
  toggleIntegration: (id: string) => void;
  updateIntegration: (integration: Integration) => void;
  testIntegrationConnection: (id: string) => Promise<boolean>;
  updateTranslation: (lang: string, key: string, value: string) => void;
  addPOI: (poi: Omit<POI, 'id' | 'status' | 'createdBy' | 'updatedAt'>) => void;
  updatePOI: (poi: POI) => void;
  loadSchedulesForPoi: (poiId: string) => Promise<void>;
  saveSchedules: (poiId: string, newSchedules: Schedule[]) => Promise<{ success: boolean; error?: string }>;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => boolean;
  addValidationState: (state: Omit<ValidationState, 'id'>) => void;
  updateValidationState: (state: ValidationState) => void;
  deleteValidationState: (id: string) => boolean;

  // Nuevas capacidades (Etiquetas, Reseñas del prestador, Servicios, Notificaciones)
  etiquetas: Etiqueta[];
  loadEtiquetas: (soloActivas?: boolean) => Promise<void>;
  addEtiqueta: (nombre: string) => Promise<{ success: boolean; error?: string }>;
  updateEtiqueta: (id: string, nombre: string) => Promise<{ success: boolean; error?: string }>;
  toggleEtiquetaActiva: (id: string, activa: boolean) => Promise<{ success: boolean; error?: string }>;
  deleteEtiqueta: (id: string) => Promise<{ success: boolean; error?: string }>;

  providerReviews: ReviewItem[];
  loadProviderReviews: () => Promise<void>;
  replyToReview: (reviewId: string, comentario: string) => Promise<{ success: boolean; error?: string }>;
  deleteReview: (reviewId: string) => Promise<{ success: boolean; error?: string }>;

  services: ServiceItem[];
  loadServicesForPoi: (poiId: string) => Promise<void>;
  saveService: (service: Omit<ServiceItem, 'id'> & { id?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteService: (serviceId: string) => Promise<{ success: boolean; error?: string }>;
  toggleServiceAvailability: (serviceId: string) => Promise<{ success: boolean; error?: string }>;

  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Helper para decodificar JWT sin librerías externas de forma segura
function decodeJwt(token: string): { userId?: string; email?: string; role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return {
      userId: parsed.sub || parsed.userId || parsed.id,
      email: parsed.email,
      role: parsed.role || parsed.roleName || (typeof parsed.role === 'object' ? parsed.role?.nombre : undefined),
    };
  } catch {
    return null;
  }
}

// Helper para mapear POI del backend al modelo del frontend
function mapBackendPoi(p: any): POI {
  if (!p) return {} as POI;

  // Extracción robusta de nombre de categoría
  let catName = 'General';
  if (Array.isArray(p.categorias) && p.categorias.length > 0) {
    const firstCat = p.categorias[0];
    catName = typeof firstCat === 'string' ? firstCat : (firstCat?.nombre || firstCat?.categoria?.nombre || 'General');
  } else if (Array.isArray(p.categoriaPois) && p.categoriaPois.length > 0) {
    catName = p.categoriaPois[0]?.categoria?.nombre || 'General';
  } else if (p.categoria) {
    catName = typeof p.categoria === 'object' ? (p.categoria?.nombre || 'General') : String(p.categoria);
  } else if (p.categoriaNombre) {
    catName = p.categoriaNombre;
  }

  // Extracción robusta de imágenes
  let imageList: string[] = [];
  if (Array.isArray(p.imagenes) && p.imagenes.length > 0) {
    imageList = p.imagenes
      .map((img: any) => {
        if (typeof img === 'string') return img;
        return img.url || img.urlPublica || img.path || '';
      })
      .filter(Boolean);
  }
  if (imageList.length === 0 && p.imagenPrincipalUrl) {
    imageList = [p.imagenPrincipalUrl];
  }

  // Extracción robusta de estado
  const rawStatus = typeof p.estado === 'object' ? (p.estado?.nombre || p.estado?.name || '') : (p.estado || p.estadoNombre || p.status || '');
  const mappedStatus = mapBackendStatusToFrontend(rawStatus);

  return {
    id: p.id || '',
    name: p.nombre || p.name || 'Sin nombre',
    description: p.descripcion || p.description || '',
    category: catName,
    address: p.direccion || p.address || '',
    location: {
      lat: p.latitud !== undefined && p.latitud !== null ? Number(p.latitud) : -32.8894,
      lng: p.longitud !== undefined && p.longitud !== null ? Number(p.longitud) : -68.8681,
    },
    images: imageList,
    status: mappedStatus,
    feedback: p.observaciones || p.feedback || p.motivoRechazo || undefined,
    createdBy: p.creadoPorId || p.organizacionId || p.usuarioId || '',
    updatedAt: p.updatedAt || p.actualizadoEn || new Date().toISOString(),
    email: p.emailContacto || p.email || '',
    phone: p.telefono || p.phone || '',
    clicksCount: p.clicksCount || p.clics || 0,
    rating: p.rating || p.puntuacionPromedio || undefined,
    reviewsCount: p.reviewsCount || p.cantidadReviews || undefined,
  };
}

// Helper para mapear usuario del backend
function mapBackendUser(u: any): User {
  const roleObj = u.usuarioRoles?.[0]?.rol || u.role;
  const mappedRole = mapBackendRoleToFrontend(roleObj?.nombre || roleObj);
  return {
    id: u.id,
    name: `${u.nombre || ''} ${u.apellido || ''}`.trim() || u.email,
    email: u.email,
    role: mappedRole,
    phone: u.telefono || '',
    businessName: u.usuarioOrganizaciones?.[0]?.organizacion?.nombre || '',
    cuit: u.usuarioOrganizaciones?.[0]?.organizacion?.cuit || '',
    status: u.fechaBaja
      ? 'inactive'
      : (u.estado === 'pendiente' || u.status === 'pending' ? 'pending' : 'active'),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [generalParams, setGeneralParams] = useState<GeneralParams>(DEFAULT_GENERAL_PARAMS);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [categories, setCategories] = useState<Category[]>([]);
  const [validationStates, setValidationStates] = useState<ValidationState[]>(mockValidationStates);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [translations, setTranslations] = useState<TranslationDict>(mockTranslations);
  const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en' | 'pt'>('es');

  const loadBackendData = async (role: string, userId?: string) => {
    try {
      // Siempre cargar categorías (disponibles públicamente)
      try {
        const cats = await api.getCategories();
        if (Array.isArray(cats)) {
          const mappedCats: Category[] = cats.map((c: any) => ({
            id: c.id,
            name: c.nombre,
            description: c.descripcion || '',
            enabled: c.activa !== undefined ? c.activa : true,
          }));
          setCategories(mappedCats);
        }
      } catch (e) {
        console.warn('No se pudieron cargar categorías desde el backend:', e);
      }

      if (role === 'admin') {
        // Cargar lista de usuarios
        try {
          const dbUsers = await api.getUsers();
          if (Array.isArray(dbUsers)) {
            setUsers(dbUsers.map(mapBackendUser));
          }
        } catch (e) {
          console.warn('No se pudieron cargar usuarios:', e);
        }

        // Cargar POIs para revisión y moderación admin
        try {
          const allAdminPois: POI[] = [];
          const seenIds = new Set<string>();

          // 1. POIs en revisión formal
          try {
            const revisionData = await api.getAdminRevisionPois();
            const poisArray = Array.isArray(revisionData)
              ? revisionData
              : (revisionData?.data || revisionData?.items || []);
            if (Array.isArray(poisArray)) {
              for (const p of poisArray) {
                if (p?.id && !seenIds.has(p.id)) {
                  seenIds.add(p.id);
                  allAdminPois.push(mapBackendPoi(p));
                }
              }
            }
          } catch (eRev) {
            console.warn('Nota al cargar POIs de revisión admin:', eRev);
          }

          // 2. POIs en validación comunitaria
          try {
            const comunitariaData: any = await api.getValidacionComunitariaPois();
            const comArray: any[] = Array.isArray(comunitariaData)
              ? comunitariaData
              : (comunitariaData?.data || comunitariaData?.items || []);
            if (Array.isArray(comArray)) {
              for (const p of comArray) {
                if (p?.id && !seenIds.has(p.id)) {
                  seenIds.add(p.id);
                  allAdminPois.push(mapBackendPoi(p));
                }
              }
            }
          } catch (eCom) {
            console.warn('Nota al cargar POIs comunitarios:', eCom);
          }

          if (allAdminPois.length > 0) {
            setPois(allAdminPois);
          }
        } catch (e) {
          console.warn('No se pudieron cargar POIs admin:', e);
        }
      }

      if (role === 'provider') {
        // Cargar POIs del prestador autenticado
        try {
          const dbPois: any = await api.getMyPois();
          const poisArray: any[] = Array.isArray(dbPois) ? dbPois : (dbPois?.pois || dbPois?.data || dbPois?.items || []);
          if (Array.isArray(poisArray)) {
            const mappedPois: POI[] = poisArray.map(mapBackendPoi);
            setPois(mappedPois);

            // Cargar horarios del primer POI del prestador al arrancar
            if (mappedPois.length > 0) {
              try {
                const firstPoiId = mappedPois[0].id;
                const horarios: any = await api.getHorariosByPoi(firstPoiId);
                const horariosArray: any[] = Array.isArray(horarios) ? horarios : (horarios?.data || []);
                if (Array.isArray(horariosArray)) {
                  const mappedSchedules: Schedule[] = horariosArray.map((h: any) => ({
                    id: h.id,
                    poiId: firstPoiId,
                    daysOfWeek: Array.isArray(h.diasSemana) ? h.diasSemana : [],
                    timeRanges: [{ start: h.horaApertura || '09:00', end: h.horaCierre || '18:00' }],
                    season: h.temporada || 'all',
                    isHoliday: h.esFeriado || false,
                    description: h.descripcion || '',
                  }));
                  setSchedules(mappedSchedules);
                }
              } catch (e) {
                console.warn('No se pudieron cargar horarios iniciales:', e);
              }
            }
          }
        } catch (e) {
          console.warn('No se pudieron cargar POIs desde /poi/prestador/my-pois:', e);
          // Fallback: intentar cargar POIs desde getPrestadorProfile() si getMyPois() falla
          try {
            const provProf = await api.getPrestadorProfile();
            if (provProf?.pois && Array.isArray(provProf.pois)) {
              const mappedPois: POI[] = provProf.pois.map(mapBackendPoi);
              setPois(mappedPois);
            }
          } catch (e2) {
            console.warn('Fallback getPrestadorProfile también falló:', e2);
          }
        }
      }
    } catch (err) {
      console.error('Error al cargar datos desde el backend:', err);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (!token) return;

      const jwtData = decodeJwt(token);
      let detectedRole: UserRole | null = jwtData?.role ? mapBackendRoleToFrontend(jwtData.role) : null;
      let targetUserId = jwtData?.userId || '';

      try {
        const profile = await api.getProfile();
        const profileId = profile?.id || profile?.userId || targetUserId;
        
        if (profileId) {
          let nombreCompleto = profile?.nombre
            ? `${profile.nombre} ${profile.apellido || ''}`.trim()
            : profile?.email?.split('@')[0] || 'Usuario';
          let businessName = '';
          let phone = profile?.telefono || '';

          // Si el rol no vino en el token, resolverlo
          if (!detectedRole) {
            try {
              const fullUser = await api.getUser(profileId);
              const roleObj = fullUser?.usuarioRoles?.[0]?.rol || fullUser?.role;
              detectedRole = mapBackendRoleToFrontend(roleObj);
            } catch {
              detectedRole = 'provider';
            }
          }

          if (detectedRole !== 'admin' && detectedRole !== 'provider') {
            console.warn('Acceso denegado: El rol no está autorizado para acceder a este portal.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setCurrentUser(null);
            return;
          }

          if (detectedRole === 'provider') {
            try {
              const provProf = await api.getPrestadorProfile();
              if (provProf) {
                if (provProf.user?.nombre) {
                  nombreCompleto = `${provProf.user.nombre} ${provProf.user.apellido || ''}`.trim();
                }
                if (provProf.organizacion?.nombre) {
                  businessName = provProf.organizacion.nombre;
                }
                if (provProf.user?.telefono) {
                  phone = provProf.user.telefono;
                }
              }
            } catch (e) {
              console.warn('No se pudo cargar perfil extendido de prestador:', e);
            }
          }

          const loggedUser: User = {
            id: profileId,
            name: nombreCompleto,
            email: profile?.email || jwtData?.email || '',
            role: detectedRole,
            businessName: businessName || undefined,
            phone: phone || undefined,
            status: 'active',
          };

          setCurrentUser(loggedUser);
          await loadBackendData(detectedRole, profileId);
        }
      } catch (err) {
        console.error('Sesión expirada o inválida:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setCurrentUser(null);
      }
    };
    restoreSession();
  }, []);

  // Solo para uso en layouts como fallback de redirección (no hace login real con backend)
  const login = (role: UserRole): boolean => {
    console.warn('Advertencia: login() mock llamado. En producción usar loginWithCredentials().');
    return false;
  };

  const loginWithCredentials = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const data = await api.login({ email, password });
      if (data && data.accessToken) {
        const roleObj = data.user?.role || data.user?.usuarioRoles?.[0]?.rol;
        const mappedRole = mapBackendRoleToFrontend(roleObj?.nombre || roleObj);
        
        if (mappedRole !== 'admin' && mappedRole !== 'provider') {
          return {
            success: false,
            error: 'Acceso denegado. Este portal es exclusivo para administradores y prestadores de servicios.'
          };
        }

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        let businessName = '';
        let phone = data.user?.telefono || '';
        if (mappedRole === 'provider') {
          try {
            const provProf = await api.getPrestadorProfile();
            if (provProf?.organizacion?.nombre) {
              businessName = provProf.organizacion.nombre;
            }
            if (provProf?.user?.telefono) {
              phone = provProf.user.telefono;
            }
          } catch (e) {
            console.warn('No se pudo cargar perfil comercial inicial:', e);
          }
        }

        const loggedUser: User = {
          id: data.user.id,
          name: `${data.user.nombre || ''} ${data.user.apellido || ''}`.trim() || data.user.email,
          email: data.user.email,
          role: mappedRole,
          businessName: businessName || undefined,
          phone: phone || undefined,
          status: 'active',
        };
        
        setCurrentUser(loggedUser);
        await loadBackendData(mappedRole, data.user.id);
        
        return { success: true, role: mappedRole };
      }
      return { success: false, error: 'Respuesta inválida del servidor.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al iniciar sesión.' };
    }
  };

  const logout = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      api.logout().catch(err => console.error('Error logging out from server:', err));
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    setPois([]);
    setUsers([]);
    setSchedules([]);
    setLogs([]);
  };

  const registerProvider = async (userData: Omit<User, 'id' | 'role' | 'status'> & { password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const nameParts = userData.name.trim().split(' ');
      const nombre = nameParts[0] || '';
      const apellido = nameParts.slice(1).join(' ') || '';
      
      const payload = {
        nombre,
        apellido,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
        telefono: userData.phone,
        aceptaTerminos: true,
        nombreEmpresa: userData.businessName || '',
        cuitEmpresa: userData.cuit || '',
      };
      
      await api.registerPrestador(payload);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al registrar el prestador.' };
    }
  };

  const updateProviderProfile = (id: string, updatedData: Partial<User>): { success: boolean; error?: string } => {
    if (updatedData.email) {
      const emailTaken = users.some((u) => u.id !== id && u.email.toLowerCase() === updatedData.email!.toLowerCase());
      if (emailTaken) {
        return { success: false, error: 'El correo electrónico ya está en uso' };
      }
    }
    
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedData } : u))
    );
    
    setCurrentUser((prev) => {
      if (prev && prev.id === id) {
        return { ...prev, ...updatedData };
      }
      return prev;
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      const isAdminEditingOther = currentUser && currentUser.id !== id;

      if (isAdminEditingOther) {
        // Admin editando otro usuario — usar PATCH /user/:id
        const parts = (updatedData.name || '').trim().split(' ');
        const payload: any = {};
        if (updatedData.name) {
          payload.nombre = parts[0] || undefined;
          payload.apellido = parts.slice(1).join(' ') || undefined;
        }
        if (updatedData.phone !== undefined) payload.telefono = updatedData.phone;
        if (updatedData.status !== undefined) {
          payload.estado = updatedData.status;
          if (updatedData.status === 'inactive') {
            payload.fechaBaja = new Date().toISOString().slice(0, 10);
          } else if (updatedData.status === 'active') {
            payload.fechaBaja = null;
          }
        }
        api.updateUser(id, payload).catch((err) =>
          console.warn('Nota de actualización usuario admin backend:', err)
        );
      } else {
        // Prestador editando su propio perfil
        const parts = (updatedData.name || '').trim().split(' ');
        const payload = {
          nombre: parts[0] || undefined,
          apellido: parts.slice(1).join(' ') || undefined,
          telefono: updatedData.phone,
          nombreEmpresa: updatedData.businessName,
          cuitEmpresa: updatedData.cuit,
        };
        api.updatePrestadorProfile(payload).catch((err) =>
          console.warn('Nota de actualización perfil prestador backend:', err)
        );
      }
    }

    return { success: true };
  };

  const changePassword = async (passwordActual: string, passwordNueva: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.changePassword({ passwordActual, passwordNueva });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al cambiar la contraseña.' };
    }
  };

  const deleteProviderAccount = async (
    id: string,
    options?: { passwordActual?: string; motivo?: string; detalle?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token && options?.passwordActual) {
        await api.deleteMyAccount({
          userId: id,
          passwordActual: options.passwordActual,
          motivo: options.motivo || 'OTRO',
          detalle: options.detalle,
        });
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al dar de baja la cuenta.' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'inactive' } : u))
    );
    
    setPois((prev) =>
      prev.map((poi) => (poi.createdBy === id ? { ...poi, status: 'rejected', feedback: 'Cuenta del prestador dada de baja.' } : poi))
    );
    
    if (currentUser?.id === id) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setCurrentUser(null);
    }
    
    return { success: true };
  };

  const adminCreateUser = async (userData: Omit<User, 'id'> & { password?: string }): Promise<{ success: boolean; error?: string }> => {
    const exists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'El correo electrónico ya está registrado' };
    }

    try {
      const nameParts = userData.name.trim().split(' ');
      const payload: any = {
        nombre: nameParts[0] || userData.name,
        apellido: nameParts.slice(1).join(' ') || '',
        email: userData.email,
        password: userData.password || '123456',
        telefono: userData.phone || '',
        rol: userData.role === 'admin' ? 'administrador' : (userData.role === 'provider' ? 'prestador' : 'turista'),
        estado: userData.status || 'active',
      };
      if (userData.role === 'provider' && userData.businessName) {
        payload.nombreEmpresa = userData.businessName;
        payload.cuitEmpresa = userData.cuit || '';
      }

      const created = await api.createUser(payload);
      const newUser: User = {
        id: created.id || `usr-${Date.now()}`,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        phone: userData.phone,
        businessName: userData.businessName,
        cuit: userData.cuit,
        status: userData.status || 'active',
      };
      setUsers((prev) => [...prev, newUser]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al crear el usuario.' };
    }
  };

  const adminDeleteUser = (id: string): { success: boolean } => {
    // La baja administrativa se persiste mediante PATCH /user/:id
    api.updateUser(id, { fechaBaja: new Date().toISOString().slice(0, 10) }).catch(err =>
      console.warn('Nota de baja administrativa:', err)
    );
    
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'inactive' } : u))
    );
    setPois((prev) =>
      prev.map((poi) => (poi.createdBy === id ? { ...poi, status: 'rejected', feedback: 'Cuenta desactivada por el administrador.' } : poi))
    );
    return { success: true };
  };

  const approvePOI = async (id: string, adminName: string) => {
    setPois((prev) =>
      prev.map((poi) => (poi.id === id ? { ...poi, status: 'approved', feedback: undefined } : poi))
    );

    const target = pois.find((p) => p.id === id);
    try {
      // Usar el endpoint específico de aprobación del admin
      await api.aprobarPoi(id);
    } catch (err) {
      console.warn('Error al aprobar POI en backend:', err);
      // Fallback al endpoint genérico
      try {
        await api.updatePoiStatus(id, 'aprobado');
      } catch (e) {
        console.warn('Error en fallback approvePoiStatus:', e);
      }
    }

    if (target) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        poiId: id,
        poiName: target.name,
        action: 'approve',
        adminName,
        comment: 'POI aprobado para su publicación.',
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const rejectPOI = async (id: string, adminName: string, feedback: string) => {
    setPois((prev) =>
      prev.map((poi) => (poi.id === id ? { ...poi, status: 'rejected', feedback } : poi))
    );

    const target = pois.find((p) => p.id === id);
    try {
      // Usar el endpoint específico de rechazo del admin
      await api.rechazarPoi(id, feedback);
    } catch (err) {
      console.warn('Error al rechazar POI en backend:', err);
      try {
        await api.updatePoiStatus(id, 'rechazado');
      } catch (e) {
        console.warn('Error en fallback rejectPoiStatus:', e);
      }
    }

    if (target) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        poiId: id,
        poiName: target.name,
        action: 'reject',
        adminName,
        comment: feedback,
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const requestCorrectionPOI = async (id: string, adminName: string, feedback: string) => {
    setPois((prev) =>
      prev.map((poi) => (poi.id === id ? { ...poi, status: 'correction', feedback } : poi))
    );

    const target = pois.find((p) => p.id === id);
    try {
      // Usar el endpoint específico de corrección del admin
      await api.solicitarCorreccionPoi(id, feedback);
    } catch (err) {
      console.warn('Error al solicitar corrección de POI en backend:', err);
      try {
        await api.updatePoiStatus(id, 'pendiente');
      } catch (e) {
        console.warn('Error en fallback correctionPoiStatus:', e);
      }
    }

    if (target) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        poiId: id,
        poiName: target.name,
        action: 'correction',
        adminName,
        comment: feedback,
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    }
  };

  const deletePOIImage = async (poiId: string, imageUrl: string, adminName: string) => {
    let targetPoiName = '';
    setPois((prev) =>
      prev.map((poi) => {
        if (poi.id === poiId) {
          targetPoiName = poi.name;
          return {
            ...poi,
            images: poi.images.filter((img) => img !== imageUrl),
            updatedAt: new Date().toISOString(),
          };
        }
        return poi;
      })
    );

    // Llamar al backend para eliminar la imagen
    // El backend requiere el ID de la imagen, no la URL. Extraemos el ID del path si es posible.
    try {
      // Intentar extraer el imagenId de la URL (ej: última parte del path)
      const urlParts = imageUrl.split('/');
      const imagenId = urlParts[urlParts.length - 1]?.split('?')[0];
      if (imagenId) {
        await api.deletePoiImagen(poiId, imagenId);
      }
    } catch (err) {
      console.warn('Nota de eliminación de imagen en backend:', err);
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId,
      poiName: targetPoiName || 'POI Atractivo',
      action: 'image_delete',
      adminName,
      comment: `Eliminada imagen del POI.`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const updateGeneralParams = (params: GeneralParams) => {
    setGeneralParams(params);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'param_change',
      adminName: currentUser?.name || 'Administrador',
      comment: `Modificados límites globales (Imágenes: ${params.maxImagesPerPOI}, Franjas: ${params.maxTimeRangesPerDay}, Gracia: ${params.validationGracePeriodDays} días).`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const resetGeneralParams = () => {
    setGeneralParams({ ...DEFAULT_GENERAL_PARAMS });
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'param_reset',
      adminName: currentUser?.name || 'Administrador',
      comment: 'Restablecidos parámetros generales a valores por defecto.',
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integ) => (integ.id === id ? { ...integ, enabled: !integ.enabled } : integ))
    );
  };

  const updateIntegration = (updatedInteg: Integration) => {
    setIntegrations((prev) =>
      prev.map((integ) => (integ.id === updatedInteg.id ? updatedInteg : integ))
    );
  };

  const testIntegrationConnection = (id: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const target = integrations.find((i) => i.id === id);
        const success = !!(target && target.apiKey && target.apiKey.length > 5);

        const newLog: AuditLog = {
          id: `log-${Date.now()}`,
          poiId: 'system',
          poiName: target?.name || 'Integración API',
          action: 'test_connection',
          adminName: currentUser?.name || 'Administrador',
          comment: `Prueba de conexión: ${success ? 'Exitosa (Conectado)' : 'Fallida (Error de credenciales)'}`,
          timestamp: new Date().toISOString(),
        };
        setLogs((prev) => [newLog, ...prev]);
        resolve(success);
      }, 1000);
    });
  };

  const updateTranslation = (lang: string, key: string, value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [key]: value,
      },
    }));
  };

  const addPOI = async (poiData: Omit<POI, 'id' | 'status' | 'createdBy' | 'updatedAt'>) => {
    const newPOI: POI = {
      ...poiData,
      id: `poi-${Date.now()}`,
      status: 'pending',
      createdBy: currentUser?.id || '',
      updatedAt: new Date().toISOString(),
    };
    setPois((prev) => [...prev, newPOI]);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const payload = {
          nombre: poiData.name,
          descripcion: poiData.description,
          direccion: poiData.address,
          latitud: poiData.location.lat,
          longitud: poiData.location.lng,
          telefono: poiData.phone,
          emailContacto: poiData.email,
          imagenes: poiData.images,
          imagenPrincipalUrl: poiData.images?.[0] || '',
        };
        const created = await api.createPoi(payload);
        // Actualizar el ID local con el ID real del backend
        if (created?.id) {
          setPois((prev) =>
            prev.map((p) => (p.id === newPOI.id ? { ...p, id: created.id } : p))
          );
        }
      } catch (err) {
        console.warn('Nota de sincronización backend POI:', err);
      }
    }
  };

  const updatePOI = async (updatedPoi: POI) => {
    setPois((prev) =>
      prev.map((p) => (p.id === updatedPoi.id ? { ...updatedPoi, updatedAt: new Date().toISOString() } : p))
    );

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && !updatedPoi.id.startsWith('poi-')) {
      try {
        const payload = {
          nombre: updatedPoi.name,
          descripcion: updatedPoi.description,
          direccion: updatedPoi.address,
          latitud: updatedPoi.location.lat,
          longitud: updatedPoi.location.lng,
          telefono: updatedPoi.phone,
          emailContacto: updatedPoi.email,
          imagenes: updatedPoi.images,
          imagenPrincipalUrl: updatedPoi.images?.[0] || '',
        };
        await api.updatePoi(updatedPoi.id, payload);
      } catch (err) {
        console.warn('Nota de sincronización backend POI update:', err);
      }
    }
  };

  const loadSchedulesForPoi = async (poiId: string) => {
    if (!poiId || poiId.startsWith('poi-')) return;
    try {
      const horarios: any = await api.getHorariosByPoi(poiId);
      const horariosList: any[] = Array.isArray(horarios) ? horarios : (horarios?.data || []);
      if (Array.isArray(horariosList)) {
        const mappedSchedules: Schedule[] = horariosList.map((h: any) => {
          const days = h.diaSemanaDesde !== undefined
            ? (h.diaSemanaDesde === h.diaSemanaHasta ? [h.diaSemanaDesde] : [h.diaSemanaDesde, h.diaSemanaHasta])
            : (Array.isArray(h.diasSemana) ? h.diasSemana : [1]);
          return {
            id: h.id || `sch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            poiId: poiId,
            daysOfWeek: days,
            timeRanges: [{ start: h.horaDesde || h.horaApertura || '09:00', end: h.horaHasta || h.horaCierre || '18:00' }],
            season: h.temporada || 'all',
            isHoliday: h.esFeriado || false,
            description: h.descripcion || '',
          };
        });
        setSchedules((prev) => {
          const others = prev.filter((s) => s.poiId !== poiId);
          return [...others, ...mappedSchedules];
        });
      }
    } catch (err) {
      console.warn('Nota al cargar horarios del POI:', err);
    }
  };

  const saveSchedules = async (poiId: string, newSchedules: Schedule[]): Promise<{ success: boolean; error?: string }> => {
    setSchedules((prev) => {
      const filtered = prev.filter((s) => s.poiId !== poiId);
      return [...filtered, ...newSchedules];
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && !poiId.startsWith('poi-')) {
      try {
        // Eliminar horarios anteriores para reemplazo limpio
        await api.deleteAllHorarios(poiId).catch(() => {});

        if (newSchedules.length > 0) {
          const batchHorarios: Array<{ diaSemanaDesde: number; horaDesde: string; diaSemanaHasta: number; horaHasta: string }> = [];
          for (const s of newSchedules) {
            const ranges = s.timeRanges && s.timeRanges.length > 0 ? s.timeRanges : [{ start: '09:00', end: '18:00' }];
            const days = Array.isArray(s.daysOfWeek) && s.daysOfWeek.length > 0 ? s.daysOfWeek : [1];
            for (const day of days) {
              for (const range of ranges) {
                batchHorarios.push({
                  diaSemanaDesde: Number(day),
                  horaDesde: range.start || '09:00',
                  diaSemanaHasta: Number(day),
                  horaHasta: range.end || '18:00',
                });
              }
            }
          }

          if (batchHorarios.length > 0) {
            await api.createMultipleHorarios(poiId, batchHorarios);
          }
        }
        return { success: true };
      } catch (err: any) {
        console.warn('Nota de guardado backend horarios:', err);
        return { success: false, error: err.message || 'Error al guardar horarios en el servidor' };
      }
    }
    return { success: true };
  };

  // CRUD Categorías (US-CYP-03)
  const addCategory = async (catData: Omit<Category, 'id'>) => {
    try {
      const dbCat = await api.createCategory(catData.name);
      const newCat: Category = {
        id: dbCat.id,
        name: dbCat.nombre,
        description: '',
        enabled: true,
      };
      setCategories((prev) => [...prev, newCat]);
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        poiId: 'system',
        poiName: 'Configuración CYP',
        action: 'category_create',
        adminName: currentUser?.name || 'Administrador',
        comment: `Creada categoría turística: "${newCat.name}"`,
        timestamp: new Date().toISOString(),
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (err: any) {
      alert(err.message || 'Error al crear la categoría');
    }
  };

  const updateCategory = async (updatedCat: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
    try {
      if (updatedCat.name) {
        await api.updateCategory(updatedCat.id, updatedCat.name);
      }
      await api.toggleCategoryActiva(updatedCat.id, updatedCat.enabled);
    } catch (err) {
      console.warn('Nota de actualización categoría backend:', err);
    }
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'category_toggle',
      adminName: currentUser?.name || 'Administrador',
      comment: `Modificada categoría turística: "${updatedCat.name}" (${updatedCat.enabled ? 'Activa' : 'Inactiva'})`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const deleteCategory = (id: string): boolean => {
    const target = categories.find((c) => c.id === id);
    if (!target) return false;

    const isUsed = pois.some((p) => p.category.toLowerCase() === target.name.toLowerCase());
    if (isUsed) return false;

    api.deleteCategory(id).catch((err) => console.warn('Nota de eliminación categoría backend:', err));

    setCategories((prev) => prev.filter((c) => c.id !== id));
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'category_delete',
      adminName: currentUser?.name || 'Administrador',
      comment: `Eliminada categoría turística: "${target.name}"`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    return true;
  };

  // CRUD Estados de Validación (US-CYP-04)
  const addValidationState = (stateData: Omit<ValidationState, 'id'>) => {
    const newState: ValidationState = {
      ...stateData,
      id: `state-${Date.now()}`,
    };
    setValidationStates((prev) => [...prev, newState]);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'state_create',
      adminName: currentUser?.name || 'Administrador',
      comment: `Creado estado de validación: "${newState.name}"`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const updateValidationState = (updatedState: ValidationState) => {
    setValidationStates((prev) =>
      prev.map((s) => (s.id === updatedState.id ? updatedState : s))
    );
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'state_toggle',
      adminName: currentUser?.name || 'Administrador',
      comment: `Modificado estado de validación: "${updatedState.name}" (${updatedState.enabled ? 'Activa' : 'Inactiva'})`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const deleteValidationState = (id: string): boolean => {
    const target = validationStates.find((s) => s.id === id);
    if (!target) return false;

    let mappedStatus: POIStatus | null = null;
    if (id === 'state-pending') mappedStatus = 'pending';
    else if (id === 'state-approved') mappedStatus = 'approved';
    else if (id === 'state-rejected') mappedStatus = 'rejected';
    else if (id === 'state-correction') mappedStatus = 'correction';

    const isUsed = pois.some((p) => p.status === mappedStatus || p.status.toLowerCase() === target.name.toLowerCase());
    if (isUsed) return false;

    setValidationStates((prev) => prev.filter((s) => s.id !== id));
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'state_delete',
      adminName: currentUser?.name || 'Administrador',
      comment: `Eliminado estado de validación: "${target.name}"`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    return true;
  };

  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);
  const [providerReviews, setProviderReviews] = useState<ReviewItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // 1. GESTIÓN DE ETIQUETAS (US-GIT-05)
  const loadEtiquetas = async (soloActivas?: boolean) => {
    try {
      const data = await api.getEtiquetas(soloActivas);
      if (Array.isArray(data)) {
        setEtiquetas(
          data.map((et: any) => ({
            id: et.id,
            nombre: et.nombre,
            activa: et.activa !== undefined ? et.activa : true,
            fechaCreacion: et.fechaCreacion,
          }))
        );
      }
    } catch (e) {
      console.warn('Nota al cargar etiquetas:', e);
    }
  };

  const addEtiqueta = async (nombre: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const created = await api.createEtiqueta(nombre.trim());
      const newEt: Etiqueta = {
        id: created.id || `tag-${Date.now()}`,
        nombre: created.nombre || nombre.trim(),
        activa: true,
      };
      setEtiquetas((prev) => [...prev, newEt]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al crear la etiqueta' };
    }
  };

  const updateEtiqueta = async (id: string, nombre: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.updateEtiqueta(id, nombre.trim());
      setEtiquetas((prev) =>
        prev.map((e) => (e.id === id ? { ...e, nombre: nombre.trim() } : e))
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al actualizar la etiqueta' };
    }
  };

  const toggleEtiquetaActiva = async (id: string, activa: boolean): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.toggleEtiquetaActiva(id, activa);
      setEtiquetas((prev) =>
        prev.map((e) => (e.id === id ? { ...e, activa } : e))
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al cambiar estado de etiqueta' };
    }
  };

  const deleteEtiqueta = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.deleteEtiqueta(id);
      setEtiquetas((prev) => prev.filter((e) => e.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar la etiqueta' };
    }
  };

  // 2. GESTIÓN DE RESEÑAS DEL PRESTADOR (US-CYN-07)
  const loadProviderReviews = async () => {
    try {
      const data: any = await api.getMisReviewsPrestador();
      const rawReviews: any[] = Array.isArray(data) ? data : (data?.data || data?.items || data?.reviews || []);
      
      if (Array.isArray(rawReviews)) {
        // Extraer IDs únicos de POIs para buscar respuestas detalladas y fotos
        const poiIds = Array.from(new Set(rawReviews.map((r) => r.poiId || r.poi?.id).filter(Boolean)));
        
        // Consultar detalles de reseñas por POI para enriquecer con respuestas y multimedia
        const detailsByReviewId: Record<string, { responses?: any[]; imagenes?: any[] }> = {};
        await Promise.all(
          poiIds.map(async (poiId) => {
            try {
              const poiReviewsData: any = await api.getReviewsByPoi(poiId);
              const poiReviewsList: any[] = poiReviewsData?.reviews || (Array.isArray(poiReviewsData) ? poiReviewsData : []);
              poiReviewsList.forEach((pr: any) => {
                if (pr.id) {
                  detailsByReviewId[pr.id] = {
                    responses: pr.responses || [],
                    imagenes: pr.imagenes || [],
                  };
                }
              });
            } catch {
              // Silencioso ante POI sin reseñas
            }
          })
        );

        const mapped: ReviewItem[] = rawReviews.map((r: any) => {
          const detail = detailsByReviewId[r.id];
          const responses = (detail?.responses && detail.responses.length > 0) ? detail.responses : (r.responses || []);
          const images = (detail?.imagenes && detail.imagenes.length > 0)
            ? detail.imagenes.map((img: any) => img.url || img)
            : (Array.isArray(r.imagenes) ? r.imagenes.map((img: any) => img.url || img) : []);

          const rawState = (r.estadoResponse || r.estado || r.estadoReview?.nombre || '').toString().toLowerCase();
          const isAnswered = rawState === 'respondida' || (Array.isArray(responses) && responses.length > 0);

          let replyObj: any = undefined;
          if (responses && responses.length > 0) {
            replyObj = {
              id: responses[0].id,
              comentario: responses[0].comentario,
              fechaCreacion: responses[0].fechaCreacion,
              authorName: responses[0].usuario ? `${responses[0].usuario.nombre || ''} ${responses[0].usuario.apellido || ''}`.trim() : (currentUser?.businessName || currentUser?.name || 'Respuesta del propietario'),
            };
          } else if (isAnswered) {
            replyObj = {
              comentario: 'Tu respuesta ha sido publicada en la plataforma.',
              fechaCreacion: r.fechaCreacion || new Date().toISOString(),
              authorName: currentUser?.businessName || currentUser?.name || 'Respuesta del propietario',
            };
          }

          return {
            id: r.id,
            poiId: r.poiId || r.poi?.id || '',
            poiName: r.poi?.nombre || r.poiNombre || 'Mi Establecimiento',
            userName: r.usuario ? `${r.usuario.nombre || ''} ${r.usuario.apellido || ''}`.trim() : 'Turista',
            userAvatar: r.usuario?.avatarUrl,
            rating: r.puntuacion || 5,
            comment: r.comentario || '',
            date: r.fechaCreacion ? r.fechaCreacion.split('T')[0] : new Date().toISOString().split('T')[0],
            status: isAnswered ? 'respondida' : 'pendiente de respuesta',
            images,
            response: replyObj,
          };
        });

        setProviderReviews(mapped);
      }
    } catch (e) {
      console.warn('Nota al cargar reseñas del prestador:', e);
    }
  };

  const replyToReview = async (reviewId: string, comentario: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res: any = await api.replyReview(reviewId, comentario.trim());
      setProviderReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                status: 'respondida',
                response: {
                  id: res?.respuesta?.id,
                  comentario: res?.respuesta?.comentario || comentario.trim(),
                  fechaCreacion: res?.respuesta?.fechaCreacion || new Date().toISOString(),
                  authorName: currentUser?.businessName || currentUser?.name || 'Respuesta del propietario',
                },
              }
            : r
        )
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al publicar la respuesta' };
    }
  };

  const deleteReview = async (reviewId: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.deleteReview(reviewId);
      setProviderReviews((prev) => prev.filter((r) => r.id !== reviewId));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar la reseña' };
    }
  };

  // 3. GESTIÓN DE SERVICIOS DEL POI (US-CYN-03)
  const loadServicesForPoi = async (poiId: string) => {
    if (!poiId || poiId.startsWith('poi-')) return;
    try {
      const data: any = await api.getServiciosByPoi(poiId);
      const list: any[] = Array.isArray(data) ? data : (data?.servicios || data?.data || []);
      if (Array.isArray(list) && list.length > 0) {
        const mapped: ServiceItem[] = list.map((sp: any) => ({
          id: sp.id,
          poiId: sp.poiId || poiId,
          name: sp.servicio?.nombre || sp.nombre || 'Servicio',
          category: sp.servicio?.categoria || sp.categoria || 'Comodidad',
          description: sp.notas || sp.servicio?.descripcion || '',
          price: sp.precio !== null && sp.precio !== undefined ? Number(sp.precio) : 0,
          durationMinutes: sp.duracionMinutos || 60,
          isAvailable: sp.disponible ?? sp.activo ?? true,
        }));
        setServices(mapped);
      }
    } catch (e) {
      console.warn('Nota al cargar servicios del POI:', e);
    }
  };

  const saveService = async (serviceData: Omit<ServiceItem, 'id'> & { id?: string }): Promise<{ success: boolean; error?: string }> => {
    if (serviceData.id) {
      setServices((prev) =>
        prev.map((s) => (s.id === serviceData.id ? ({ ...s, ...serviceData } as ServiceItem) : s))
      );
    } else {
      const newService: ServiceItem = {
        ...serviceData,
        id: `srv-${Date.now()}`,
      };
      setServices((prev) => [...prev, newService]);
    }
    return { success: true };
  };

  const deleteService = async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    setServices((prev) => prev.filter((s) => s.id !== serviceId));
    return { success: true };
  };

  const toggleServiceAvailability = async (serviceId: string): Promise<{ success: boolean; error?: string }> => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, isAvailable: !s.isAvailable } : s))
    );
    return { success: true };
  };

  // 4. CENTRO DE NOTIFICACIONES (US-NYA-07)
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const addReviewReply = (reviewId: string, comment: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              reply: {
                comment,
                date: new Date().toISOString().split('T')[0],
                authorName: currentUser?.businessName || currentUser?.name || 'Prestador',
              },
            }
          : r
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        pois,
        schedules,
        logs,
        generalParams,
        integrations,
        categories,
        validationStates,
        reviews,
        addReviewReply,
        translations,
        currentLanguage,
        setCurrentLanguage,
        login,
        loginWithCredentials,
        logout,
        registerProvider,
        updateProviderProfile,
        changePassword,
        deleteProviderAccount,
        adminCreateUser,
        adminDeleteUser,
        approvePOI,
        rejectPOI,
        requestCorrectionPOI,
        deletePOIImage,
        updateGeneralParams,
        resetGeneralParams,
        toggleIntegration,
        updateIntegration,
        testIntegrationConnection,
        updateTranslation,
        addPOI,
        updatePOI,
        loadSchedulesForPoi,
        saveSchedules,
        addCategory,
        updateCategory,
        deleteCategory,
        addValidationState,
        updateValidationState,
        deleteValidationState,
        etiquetas,
        loadEtiquetas,
        addEtiqueta,
        updateEtiqueta,
        toggleEtiquetaActiva,
        deleteEtiqueta,
        providerReviews,
        loadProviderReviews,
        replyToReview,
        deleteReview,
        services,
        loadServicesForPoi,
        saveService,
        deleteService,
        toggleServiceAvailability,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
}
