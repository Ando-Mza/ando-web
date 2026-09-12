'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { POI, Schedule, TimeRange, AuditLog, GeneralParams, Integration, User, UserRole, Category, ValidationState, POIStatus, Review } from '../types';
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
  updateProviderProfile: (id: string, updatedData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
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
                ? p.imagenes.map((img: any) => typeof img === 'string' ? img : (img?.url || '')).filter(Boolean)
                : (p.imagenPrincipalUrl ? [p.imagenPrincipalUrl] : []),
              status: p.estado?.nombre || p.estado || 'pending',
              createdBy: p.creadoPorId || p.organizacionId || p.usuarioId || '',
              updatedAt: p.updatedAt || new Date().toISOString(),
              phone: p.telefono || '',
              website: p.website || '',
              instagram: p.instagram || '',
              regionId: p.regionId || p.region?.id,
              departamentoId: p.departamentoId || p.departamento?.id,
              zonaId: p.zonaId || p.zona?.id,
            }));
            setPois((prev) => {
              const map = new Map(prev.map(item => [item.id, item]));
              mappedPois.forEach(item => map.set(item.id, item));
              return Array.from(map.values());
            });

            // Cargar horarios reales de la base de datos para cada POI
            try {
              const loadedSchedules: Schedule[] = [];
              for (const poi of mappedPois) {
                if (!poi.id.startsWith('poi-')) {
                  const dbHorarios = await api.getHorariosByPoi(poi.id);
                  if (Array.isArray(dbHorarios) && dbHorarios.length > 0) {
                    const schedulesByRange = new Map<string, { days: number[]; timeRanges: TimeRange[] }>();
                    dbHorarios.forEach((h: any) => {
                      const key = `${h.horaDesde}-${h.horaHasta}`;
                      if (!schedulesByRange.has(key)) {
                        schedulesByRange.set(key, {
                          days: [],
                          timeRanges: [{ start: h.horaDesde, end: h.horaHasta }],
                        });
                      }
                      const entry = schedulesByRange.get(key)!;
                      if (!entry.days.includes(h.diaSemanaDesde)) {
                        entry.days.push(h.diaSemanaDesde);
                      }
                    });

                    schedulesByRange.forEach((val, key) => {
                      loadedSchedules.push({
                        id: `sch-db-${poi.id}-${key}`,
                        poiId: poi.id,
                        daysOfWeek: val.days.sort((a, b) => a - b),
                        timeRanges: val.timeRanges,
                        season: 'all',
                        isHoliday: false,
                      });
                    });
                  }
                }
              }
              if (loadedSchedules.length > 0) {
                setSchedules((prev) => {
                  const dbPoiIds = new Set(mappedPois.map(p => p.id));
                  const keepSchedules = prev.filter(s => !dbPoiIds.has(s.poiId));
                  return [...keepSchedules, ...loadedSchedules];
                });
              }
            } catch (hErr) {
              console.warn('Nota al cargar horarios desde la base de datos:', hErr);
            }
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
          
          let firstName = '';
          let lastName = '';
          let nombreCompleto = '';
          let businessName = '';
          let cuit = '';
          let phone = '';
          try {
            if (mappedRole === 'provider') {
              const provProf = await api.getPrestadorProfile();
              if (provProf) {
                const u = provProf.user || provProf;
                const org = provProf.organizacion || {};
                if (u.nombre) firstName = u.nombre;
                if (u.apellido) lastName = u.apellido;
                if (u.nombre) nombreCompleto = `${u.nombre} ${u.apellido || ''}`.trim();
                if (org.nombre || provProf.nombreEmpresa) businessName = org.nombre || provProf.nombreEmpresa;
                if (org.cuit || provProf.cuitEmpresa) cuit = org.cuit || provProf.cuitEmpresa;
                if (u.telefono || provProf.telefono) phone = u.telefono || provProf.telefono;
              }
            } else {
              const fullUser = await api.getUser(profile.userId || profile.sub);
              if (fullUser && fullUser.nombre) {
                firstName = fullUser.nombre;
                lastName = fullUser.apellido || '';
                nombreCompleto = `${fullUser.nombre} ${fullUser.apellido || ''}`.trim();
                if (fullUser.telefono) phone = fullUser.telefono;
              }
            }
          } catch (e) {
            console.error('Error fetching full user profile details:', e);
          }

          if (!nombreCompleto) {
            nombreCompleto = profile.nombre ? `${profile.nombre} ${profile.apellido || ''}`.trim() : profile.email.split('@')[0];
            firstName = profile.nombre || '';
            lastName = profile.apellido || '';
          }

          const loggedUser: User = {
            id: profile.userId || profile.sub,
            name: nombreCompleto,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            email: profile.email,
            role: mappedRole,
            businessName: businessName || undefined,
            cuit: cuit || undefined,
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
        
        let firstName = '';
        let lastName = '';
        let nombreCompleto = `${data.user.nombre || ''} ${data.user.apellido || ''}`.trim();
        let businessName = '';
        let cuit = '';
        let phone = '';

        try {
          if (mappedRole === 'provider') {
            const provProf = await api.getPrestadorProfile();
            if (provProf) {
              const u = provProf.user || provProf;
              const org = provProf.organizacion || {};
              if (u.nombre) firstName = u.nombre;
              if (u.apellido) lastName = u.apellido;
              if (u.nombre) nombreCompleto = `${u.nombre} ${u.apellido || ''}`.trim();
              if (org.nombre || provProf.nombreEmpresa) businessName = org.nombre || provProf.nombreEmpresa;
              if (org.cuit || provProf.cuitEmpresa) cuit = org.cuit || provProf.cuitEmpresa;
              if (u.telefono || provProf.telefono) phone = u.telefono || provProf.telefono;
            }
          }
        } catch (e) {
          console.warn('Nota al cargar perfil detallado en login:', e);
        }

        const loggedUser: User = {
          id: data.user.id,
          name: nombreCompleto || data.user.email.split('@')[0],
          firstName: firstName || data.user.nombre || undefined,
          lastName: lastName || data.user.apellido || undefined,
          email: data.user.email,
          role: mappedRole,
          businessName: businessName || undefined,
          cuit: cuit || undefined,
          phone: phone || undefined,
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
      const nombre = userData.firstName || nameParts[0] || '';
      const apellido = userData.lastName || (nameParts.length > 1 ? nameParts.slice(1).join(' ') : '');
      
      const payload = {
        nombre,
        apellido,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.password,
        telefono: userData.phone,
        fechaNacimiento: userData.birthDate,
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

  const updateProviderProfile = async (id: string, updatedData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (updatedData.email) {
      const emailTaken = users.some((u) => u.id !== id && u.email.toLowerCase() === updatedData.email!.toLowerCase());
      if (emailTaken) {
        return { success: false, error: 'El correo electrónico ya está en uso' };
      }
    }
    
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedData } : u))
    );

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      try {
        const parts = (updatedData.name || '').trim().split(' ');
        const nombre = updatedData.firstName || parts[0] || undefined;
        const apellido = updatedData.lastName || (parts.length > 1 ? parts.slice(1).join(' ') : undefined);
        const telefono = updatedData.phone || undefined;
        const nombreOrganizacion = updatedData.businessName || undefined;

        let firstName = nombre;
        let lastName = apellido;
        let nombreCompleto = updatedData.name;
        let phone = updatedData.phone;
        let businessName = updatedData.businessName;
        let cuit = updatedData.cuit;

        if (currentUser?.role === 'provider') {
          try {
            const updatedProfile = await api.updatePrestadorProfile({
              nombre,
              apellido,
              telefono,
              nombreOrganizacion,
            });
            if (updatedProfile) {
              const u = updatedProfile.user || updatedProfile;
              const org = updatedProfile.organizacion || {};
              if (u.nombre) {
                firstName = u.nombre;
                lastName = u.apellido || '';
                nombreCompleto = `${u.nombre} ${u.apellido || ''}`.trim();
              }
              if (u.telefono) phone = u.telefono;
              if (org.nombre) businessName = org.nombre;
              if (org.cuit) cuit = org.cuit;
            }
          } catch (provErr: any) {
            console.warn('Nota de actualización perfil prestador (intentando /user/profile):', provErr);
            // Fallback a actualizar datos personales del usuario directamente
            const updatedUser = await api.updateProfile({
              nombre,
              apellido,
              telefono,
            });
            if (updatedUser && updatedUser.nombre) {
              firstName = updatedUser.nombre;
              lastName = updatedUser.apellido || '';
              nombreCompleto = `${updatedUser.nombre} ${updatedUser.apellido || ''}`.trim();
              if (updatedUser.telefono) phone = updatedUser.telefono;
            }
          }
        } else {
          const updatedUser = await api.updateProfile({
            nombre,
            apellido,
            telefono,
          });
          if (updatedUser && updatedUser.nombre) {
            firstName = updatedUser.nombre;
            lastName = updatedUser.apellido || '';
            nombreCompleto = `${updatedUser.nombre} ${updatedUser.apellido || ''}`.trim();
            if (updatedUser.telefono) phone = updatedUser.telefono;
          }
        }

        const newUserData: Partial<User> = {
          ...updatedData,
          name: nombreCompleto || updatedData.name,
          firstName: firstName || updatedData.firstName,
          lastName: lastName || updatedData.lastName,
          phone: phone || updatedData.phone,
          businessName: businessName || updatedData.businessName,
          cuit: cuit || updatedData.cuit,
        };
        
        setCurrentUser((prev) => (prev && prev.id === id ? { ...prev, ...newUserData } : prev));
        return { success: true };
      } catch (err: any) {
        console.error('Error al actualizar perfil en el backend:', err);
        return { success: false, error: err.message || 'Error al actualizar el perfil en el servidor.' };
      }
    }

    setCurrentUser((prev) => (prev && prev.id === id ? { ...prev, ...updatedData } : prev));
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

    // Obtener UUID de categoría coincidente o la primera activa
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase() === poiData.category.toLowerCase() || c.id === poiData.category
    );
    const categoriaIds = matchedCategory?.id
      ? [matchedCategory.id]
      : (categories.length > 0 ? [categories[0].id] : []);

    let newPOI: POI = {
      ...poiData,
      id: `poi-${Date.now()}`,
      status: 'pending',
      createdBy: currentUser?.id || '',
      updatedAt: new Date().toISOString(),
    };

    if (token) {
      try {
        const payload: any = {
          nombre: poiData.name,
          descripcion: poiData.description,
          direccion: poiData.address,
          latitud: Number(poiData.location.lat),
          longitud: Number(poiData.location.lng),
          regionId: poiData.regionId,
          departamentoId: poiData.departamentoId,
          zonaId: poiData.zonaId || undefined,
          telefono: poiData.phone || undefined,
          website: poiData.website || undefined,
          instagram: poiData.instagram || undefined,
          categoriaIds,
          imagenes: poiData.images,
          imagenPrincipalUrl: poiData.images?.[0] || '',
        };
        const saved = await api.createPoi(payload);
        if (saved && saved.id) {
          newPOI = {
            id: saved.id,
            name: saved.nombre || poiData.name,
            description: saved.descripcion || poiData.description,
            category: poiData.category,
            address: saved.direccion || poiData.address,
            location: {
              lat: saved.latitud !== undefined ? Number(saved.latitud) : poiData.location.lat,
              lng: saved.longitud !== undefined ? Number(saved.longitud) : poiData.location.lng,
            },
            regionId: saved.regionId || poiData.regionId,
            departamentoId: saved.departamentoId || poiData.departamentoId,
            zonaId: saved.zonaId || poiData.zonaId,
            website: saved.website || poiData.website,
            instagram: saved.instagram || poiData.instagram,
            images: Array.isArray(saved.imagenes) && saved.imagenes.length > 0
              ? saved.imagenes.map((img: any) => typeof img === 'string' ? img : img.url)
              : poiData.images,
            status: saved.estado?.nombre || saved.estado || 'pending',
            createdBy: saved.creadoPorId || currentUser?.id || '',
            updatedAt: saved.updatedAt || new Date().toISOString(),
            phone: saved.telefono || poiData.phone,
          };
        }
      } catch (err) {
        console.error('Error al sincronizar creación de POI con el backend:', err);
        throw err;
      }
    }

    setPois((prev) => [...prev, newPOI]);
  };

  const updatePOI = async (updatedPoi: POI) => {
    setPois((prev) =>
      prev.map((p) => (p.id === updatedPoi.id ? { ...updatedPoi, updatedAt: new Date().toISOString() } : p))
    );

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token && !updatedPoi.id.startsWith('poi-')) {
      try {
        const matchedCategory = categories.find(
          (c) => c.name.toLowerCase() === updatedPoi.category.toLowerCase() || c.id === updatedPoi.category
        );
        const categoriaIds = matchedCategory?.id
          ? [matchedCategory.id]
          : (categories.length > 0 ? [categories[0].id] : []);

        const payload: any = {
          nombre: updatedPoi.name,
          descripcion: updatedPoi.description,
          direccion: updatedPoi.address,
          latitud: Number(updatedPoi.location.lat),
          longitud: Number(updatedPoi.location.lng),
          regionId: updatedPoi.regionId,
          departamentoId: updatedPoi.departamentoId,
          zonaId: updatedPoi.zonaId || undefined,
          telefono: updatedPoi.phone || undefined,
          website: updatedPoi.website || undefined,
          instagram: updatedPoi.instagram || undefined,
          categoriaIds,
          imagenes: updatedPoi.images,
          imagenPrincipalUrl: updatedPoi.images?.[0] || '',
        };
        await api.updatePoi(updatedPoi.id, payload);
      } catch (err) {
        console.error('Error al sincronizar actualización de POI con el backend:', err);
        throw err;
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
        // 1. Limpiar horarios anteriores en BD para este POI
        await api.deleteAllHorarios(poiId);

        // 2. Construir lista plana de DTOs válidos para la BD (diaSemanaDesde, diaSemanaHasta, horaDesde, horaHasta)
        const batchHorarios: { diaSemanaDesde: number; diaSemanaHasta: number; horaDesde: string; horaHasta: string }[] = [];
        for (const s of newSchedules) {
          for (const day of s.daysOfWeek) {
            for (const tr of s.timeRanges) {
              if (tr.start && tr.end) {
                batchHorarios.push({
                  diaSemanaDesde: Number(day),
                  diaSemanaHasta: Number(day),
                  horaDesde: tr.start,
                  horaHasta: tr.end,
                });
              }
            }
          }
        }

        // 3. Guardar en la base de datos PostgreSQL
        if (batchHorarios.length > 0) {
          await api.createMultipleHorarios(poiId, batchHorarios);
        }
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

