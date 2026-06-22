'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { POI, Schedule, AuditLog, GeneralParams, Integration, User, UserRole } from '../types';
import {
  mockPOIs,
  mockSchedules,
  mockLogs,
  mockGeneralParams,
  mockIntegrations,
  mockTranslations,
  mockUsers,
  TranslationDict
} from '../utils/mockData';

interface AppContextProps {
  currentUser: User | null;
  pois: POI[];
  schedules: Schedule[];
  logs: AuditLog[];
  generalParams: GeneralParams;
  integrations: Integration[];
  translations: TranslationDict;
  currentLanguage: 'es' | 'en' | 'pt';
  setCurrentLanguage: (lang: 'es' | 'en' | 'pt') => void;
  login: (role: UserRole) => boolean;
  logout: () => void;
  approvePOI: (id: string, adminName: string) => void;
  rejectPOI: (id: string, adminName: string, feedback: string) => void;
  updateGeneralParams: (params: GeneralParams) => void;
  toggleIntegration: (id: string) => void;
  updateTranslation: (lang: string, key: string, value: string) => void;
  addPOI: (poi: Omit<POI, 'id' | 'status' | 'createdBy' | 'updatedAt'>) => void;
  updatePOI: (poi: POI) => void;
  saveSchedules: (poiId: string, newSchedules: Schedule[]) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pois, setPois] = useState<POI[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [generalParams, setGeneralParams] = useState<GeneralParams>(mockGeneralParams);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [translations, setTranslations] = useState<TranslationDict>(mockTranslations);
  const [currentLanguage, setCurrentLanguage] = useState<'es' | 'en' | 'pt'>('es');

  // Carga inicial
  useEffect(() => {
    setPois(mockPOIs);
    setSchedules(mockSchedules);
    setLogs(mockLogs);
    setIntegrations(mockIntegrations);
  }, []);

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

  const updateGeneralParams = (params: GeneralParams) => {
    setGeneralParams(params);
  };

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integ) => (integ.id === id ? { ...integ, enabled: !integ.enabled } : integ))
    );
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
      // Filtrar los horarios antiguos de este POI e insertar los nuevos
      const filtered = prev.filter((s) => s.poiId !== poiId);
      return [...filtered, ...newSchedules];
    });
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
        translations,
        currentLanguage,
        setCurrentLanguage,
        login,
        logout,
        approvePOI,
        rejectPOI,
        updateGeneralParams,
        toggleIntegration,
        updateTranslation,
        addPOI,
        updatePOI,
        saveSchedules,
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
