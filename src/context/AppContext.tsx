'use client';

import React, { createContext, useContext, useState } from 'react';
import { POI, Schedule, AuditLog, GeneralParams, Integration, User, UserRole, Category, ValidationState, POIStatus } from '../types';
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
  TranslationDict
} from '../utils/mockData';

interface AppContextProps {
  currentUser: User | null;
  pois: POI[];
  schedules: Schedule[];
  logs: AuditLog[];
  generalParams: GeneralParams;
  integrations: Integration[];
  categories: Category[];
  validationStates: ValidationState[];
  translations: TranslationDict;
  currentLanguage: 'es' | 'en' | 'pt';
  setCurrentLanguage: (lang: 'es' | 'en' | 'pt') => void;
  login: (role: UserRole) => boolean;
  logout: () => void;
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
  const [pois, setPois] = useState<POI[]>(mockPOIs);
  const [schedules, setSchedules] = useState<Schedule[]>(mockSchedules);
  const [logs, setLogs] = useState<AuditLog[]>(mockLogs);
  const [generalParams, setGeneralParams] = useState<GeneralParams>(mockGeneralParams);
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [validationStates, setValidationStates] = useState<ValidationState[]>(mockValidationStates);
  const [translations, setTranslations] = useState<TranslationDict>(mockTranslations);
  const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en' | 'pt'>('es');

  const login = (role: UserRole): boolean => {
    const user = mockUsers.find((u) => u.role === role);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const approvePOI = (id: string, adminName: string) => {
    setPois((prev) =>
      prev.map((poi) => (poi.id === id ? { ...poi, status: 'approved', feedback: undefined } : poi))
    );

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

  const rejectPOI = (id: string, adminName: string, feedback: string) => {
    setPois((prev) =>
      prev.map((poi) => (poi.id === id ? { ...poi, status: 'rejected', feedback } : poi))
    );

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

  const requestCorrectionPOI = (id: string, adminName: string, feedback: string) => {
    setPois((prev) =>
      prev.map((poi) => (poi.id === id ? { ...poi, status: 'correction', feedback } : poi))
    );

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
      adminName: currentUser?.name || 'Sofía Romero',
      comment: `Modificados límites globales (Imágenes: ${params.maxImagesPerPOI}, Franjas: ${params.maxTimeRangesPerDay}, Gracia: ${params.validationGracePeriodDays} días).`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const resetGeneralParams = () => {
    const defaultParams: GeneralParams = {
      maxImagesPerPOI: 8,
      maxTimeRangesPerDay: 3,
      validationGracePeriodDays: 5,
      requireReviewForEdits: true,
    };
    setGeneralParams(defaultParams);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'param_reset',
      adminName: currentUser?.name || 'Sofía Romero',
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
          adminName: currentUser?.name || 'Sofía Romero',
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

  const addPOI = (poiData: Omit<POI, 'id' | 'status' | 'createdBy' | 'updatedAt'>) => {
    const newPOI: POI = {
      ...poiData,
      id: `poi-${Date.now()}`,
      status: 'pending',
      createdBy: currentUser?.id || 'usr-prov-1',
      updatedAt: new Date().toISOString(),
    };
    setPois((prev) => [...prev, newPOI]);
  };

  const updatePOI = (updatedPoi: POI) => {
    setPois((prev) =>
      prev.map((p) => (p.id === updatedPoi.id ? { ...updatedPoi, updatedAt: new Date().toISOString() } : p))
    );
  };

  const saveSchedules = (poiId: string, newSchedules: Schedule[]) => {
    setSchedules((prev) => {
      const filtered = prev.filter((s) => s.poiId !== poiId);
      return [...filtered, ...newSchedules];
    });
  };

  // CRUD Categorías (US-CYP-03)
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'category_create',
      adminName: currentUser?.name || 'Sofía Romero',
      comment: `Creada categoría turística: "${newCat.name}"`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const updateCategory = (updatedCat: Category) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
    );
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'category_toggle',
      adminName: currentUser?.name || 'Sofía Romero',
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

    setCategories((prev) => prev.filter((c) => c.id !== id));
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      poiId: 'system',
      poiName: 'Configuración CYP',
      action: 'category_delete',
      adminName: currentUser?.name || 'Sofía Romero',
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
      adminName: currentUser?.name || 'Sofía Romero',
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
      adminName: currentUser?.name || 'Sofía Romero',
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
      adminName: currentUser?.name || 'Sofía Romero',
      comment: `Eliminado estado de validación: "${target.name}"`,
      timestamp: new Date().toISOString(),
    };
    setLogs((prev) => [newLog, ...prev]);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        pois,
        schedules,
        logs,
        generalParams,
        integrations,
        categories,
        validationStates,
        translations,
        currentLanguage,
        setCurrentLanguage,
        login,
        logout,
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

