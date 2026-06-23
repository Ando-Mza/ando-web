export type UserRole = 'admin' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessName?: string; // Solo para Prestadores
}

export type POIStatus = 'pending' | 'approved' | 'rejected' | 'correction';

export interface POI {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  images: string[];
  status: POIStatus;
  feedback?: string; // Comentarios de rechazo o solicitud de corrección
  createdBy: string; // ID del prestador
  updatedAt: string;
}

export interface TimeRange {
  start: string; // Formato "HH:MM"
  end: string;   // Formato "HH:MM"
}

export type SeasonType = 'high' | 'medium' | 'low' | 'all';

export interface Schedule {
  id: string;
  poiId: string;
  daysOfWeek: number[]; // 0 = Domingo, 1 = Lunes, etc.
  timeRanges: TimeRange[];
  season: SeasonType;
  isHoliday: boolean;
  exceptionDate?: string; // Para días festivos específicos (YYYY-MM-DD)
  description?: string;
}

export interface AuditLog {
  id: string;
  poiId: string;
  poiName: string;
  action: 'approve' | 'reject' | 'correction' | 'param_change' | 'param_reset' | 'category_create' | 'category_delete' | 'category_toggle' | 'state_create' | 'state_delete' | 'state_toggle' | 'image_delete' | 'test_connection';
  adminName: string;
  comment?: string;
  timestamp: string;
}

export interface GeneralParams {
  maxImagesPerPOI: number;
  maxTimeRangesPerDay: number;
  validationGracePeriodDays: number;
  requireReviewForEdits: boolean;
}

export interface Integration {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'maps' | 'weather';
  apiUrl?: string;
  apiKey?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface ValidationState {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  allowedTransitions: string[]; // IDs de estados destinos válidos
}

