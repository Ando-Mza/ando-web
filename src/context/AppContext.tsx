'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { POI, Schedule, AuditLog, GeneralParams, Integration, User, UserRole, Category, ValidationState, POIStatus, Review } from '../types';
import {
  mockPOIs,
  mockSchedules,
  mockLogs,
  mockGeneralParams,
  mockIntegrations,
  mockTranslations,
  mockUsers,
  mockCategories,
  mockValidationStates,
  mockReviews,
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
  deleteProviderAccount: (id: string) => { success: boolean };
  adminCreateUser: (userData: Omit<User, 'id'> & { password?: string }) => { success: boolean; error?: string };
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
  saveSchedules: (poiId: string, newSchedules: Schedule[]) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => boolean;
  addValidationState: (state: Omit<ValidationState, 'id'>) => void;
  updateValidationState: (state: ValidationState) => void;
  deleteValidationState: (id: string) => boolean;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [pois, setPois] = useState<POI[]>(mockPOIs);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs);
  const [generalParams, setGeneralParams] = useState<GeneralParams>(mockGeneralParams);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [validationStates, setValidationStates] = useState<ValidationState[]>(mockValidationStates);
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [translations, setTranslations] = useState<TranslationDict>(mockTranslations);
  const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en' | 'pt'>('es');

  const loadBackendData = async (role: string) => {
    try {
      const cats = await api.getCategories();
      if (Array.isArray(cats)) {
        const mappedCats: Category[] = cats.map((c: any) => ({
          id: c.id,
          name: c.nombre,
          description: '',
          enabled: true,
        }));
        setCategories(mappedCats);
      }

      if (role === 'admin') {
        const dbUsers = await api.getUsers();
        if (Array.isArray(dbUsers)) {
          const mappedUsers: User[] = dbUsers.map((u: any) => {
            const roleObj = u.usuarioRoles?.[0]?.rol;
            const mappedRole = mapBackendRoleToFrontend(roleObj?.nombre);
            return {
              id: u.id,
              name: `${u.nombre} ${u.apellido}`,
              email: u.email,
              role: mappedRole,
              phone: u.telefono || '',
              businessName: u.usuarioOrganizaciones?.[0]?.organizacion?.nombre || '',
              cuit: '',
              status: u.fechaBaja ? 'inactive' : 'active',
            };
          });
          setUsers(mappedUsers);
        }
      }

      if (role === 'provider' || role === 'admin') {
        try {
          const dbPois = await api.getMyPois();
          if (Array.isArray(dbPois) && dbPois.length > 0) {
            const mappedPois: POI[] = dbPois.map((p: any) => ({
              id: p.id,
              name: p.nombre,
              description: p.descripcion || '',
              category: p.categorias?.[0]?.categoria?.nombre || p.categoria || 'Enoturismo',
              address: p.direccion || '',
              location: {
                lat: p.latitud ? Number(p.latitud) : -32.8894,
                lng: p.longitud ? Number(p.longitud) : -68.8681,
              },
              images: Array.isArray(p.imagenes) && p.imagenes.length > 0 
                ? p.imagenes 
                : (p.imagenPrincipalUrl ? [p.imagenPrincipalUrl] : []),
              status: p.estado || 'pending',
              createdBy: p.creadoPorId || p.organizacionId || p.usuarioId || '',
              updatedAt: p.updatedAt || new Date().toISOString(),
              email: p.emailContacto || '',
              phone: p.telefono || '',
            }));
            setPois((prev) => {
              const map = new Map(prev.map(item => [item.id, item]));
              mappedPois.forEach(item => map.set(item.id, item));
              return Array.from(map.values());
            });
          }
        } catch (e) {
          console.warn('Nota de carga POIs backend:', e);
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
      try {
        const profile = await api.getProfile();
        if (profile && profile.userId) {
          const mappedRole = mapBackendRoleToFrontend(profile.role);
          
          if (mappedRole !== 'admin' && mappedRole !== 'provider') {
            console.warn('Acceso denegado: El rol no está autorizado para acceder a este portal.');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setCurrentUser(null);
            return;
          }
          
          let nombreCompleto = profile.nombre ? `${profile.nombre} ${profile.apellido || ''}`.trim() : profile.email.split('@')[0];
          let businessName = '';
          let phone = '';
          try {
            if (mappedRole === 'provider') {
              const provProf = await api.getPrestadorProfile();
              if (provProf) {
                if (provProf.nombre) nombreCompleto = `${provProf.nombre} ${provProf.apellido || ''}`.trim();
                if (provProf.nombreEmpresa) businessName = provProf.nombreEmpresa;
                if (provProf.telefono) phone = provProf.telefono;
              }
            } else {
              const fullUser = await api.getUser(profile.userId);
              if (fullUser && fullUser.nombre) {
                nombreCompleto = `${fullUser.nombre} ${fullUser.apellido || ''}`.trim();
              }
            }
          } catch (e) {
            console.error('Error fetching full user profile details:', e);
          }

          const loggedUser: User = {
            id: profile.userId,
            name: nombreCompleto,
            email: profile.email,
            role: mappedRole,
            businessName: businessName || undefined,
            phone: phone || undefined,
            status: 'active',
          };
          setCurrentUser(loggedUser);
          await loadBackendData(mappedRole);
        }
      } catch (err) {
        console.error('Sesión expirada o inválida:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    };
    restoreSession();
  }, []);

  const login = (role: UserRole): boolean => {
    const user = users.find((u) => u.role === role && u.status !== 'inactive');
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const loginWithCredentials = async (email: string, password: string): Promise<{ success: boolean; role?: string; error?: string }> => {
    try {
      const data = await api.login({ email, password });
      if (data && data.accessToken) {
        const roleName = data.user.role.nombre.trim().toLowerCase();
        const mappedRole = roleName === 'administrador' ? 'admin' : (roleName === 'prestador' ? 'provider' : 'tourist');
        
        if (mappedRole !== 'admin' && mappedRole !== 'provider') {
          return {
            success: false,
            error: 'Acceso denegado. Este portal es exclusivo para administradores y prestadores de servicios.'
          };
        }

        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        const loggedUser: User = {
          id: data.user.id,
          name: `${data.user.nombre} ${data.user.apellido}`,
          email: data.user.email,
          role: mappedRole,
          status: 'active',
        };
        
        setCurrentUser(loggedUser);
        await loadBackendData(mappedRole);
        
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
      const parts = (updatedData.name || '').trim().split(' ');
      const payload = {
        nombre: parts[0] || undefined,
        apellido: parts.slice(1).join(' ') || undefined,
        telefono: updatedData.phone,
        nombreEmpresa: updatedData.businessName,
        cuitEmpresa: updatedData.cuit,
      };
      api.updatePrestadorProfile(payload).catch((err) => console.warn('Nota de actualización perfil prestador backend:', err));
    }

    return { success: true };
  };

  const deleteProviderAccount = (id: string): { success: boolean } => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: 'inactive' } : u))
    );
    
    setPois((prev) =>
      prev.map((poi) => (poi.createdBy === id ? { ...poi, status: 'rejected', feedback: 'Cuenta del prestador dada de baja.' } : poi))
    );
    
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
    
    return { success: true };
  };

  const adminCreateUser = (userData: Omit<User, 'id'> & { password?: string }): { success: boolean; error?: string } => {
    const exists = users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      return { success: false, error: 'El correo electrónico ya está registrado' };
    }
    const newUser: User = {
      ...userData,
      id: `usr-${userData.role}-${Date.now()}`,
    };
    setUsers((prev) => [...prev, newUser]);
    return { success: true };
  };

  const adminDeleteUser = (id: string): { success: boolean } => {
    api.deleteUser(id).catch(err => console.error('Error deleting user from server:', err));
    
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

    try {
      await api.updatePoiStatus(id, 'aprobado');
    } catch (err) {
      console.warn('Error al actualizar estado POI en backend:', err);
    }

    const target = pois.find((p) => p.id === id);
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

    try {
      await api.updatePoiStatus(id, 'rechazado');
    } catch (err) {
      console.warn('Error al rechazar POI en backend:', err);
    }

    const target = pois.find((p) => p.id === id);
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

    try {
      await api.updatePoiStatus(id, 'pendiente');
    } catch (err) {
      console.warn('Error al enviar corrección de POI en backend:', err);
    }

    const target = pois.find((p) => p.id === id);
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

  const deletePOIImage = (poiId: string, imageUrl: string, adminName: string) => {
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
        await api.createPoi(payload);
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

  const saveSchedules = async (poiId: string, newSchedules: Schedule[]) => {
    setSchedules((prev) => {
      const filtered = prev.filter((s) => s.poiId !== poiId);
      return [...filtered, ...newSchedules];
    });

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && !poiId.startsWith('poi-')) {
      try {
        const batchHorarios = newSchedules.map((s) => ({
          diasSemana: s.daysOfWeek,
          horaApertura: s.timeRanges[0]?.start || '09:00',
          horaCierre: s.timeRanges[0]?.end || '18:00',
          temporada: s.season,
          esFeriado: s.isHoliday || false,
          descripcion: s.description || '',
        }));
        await api.createMultipleHorarios(poiId, batchHorarios);
      } catch (err) {
        console.warn('Nota de guardado backend horarios:', err);
      }
    }
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

    // Validar si algún POI activo utiliza esta categoría
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

    // Mapeo simple de IDs predeterminados para chequear uso
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
        saveSchedules,
        addCategory,
        updateCategory,
        deleteCategory,
        addValidationState,
        updateValidationState,
        deleteValidationState,
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

