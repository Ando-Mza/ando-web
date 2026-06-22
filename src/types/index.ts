export type UserRole = 'admin' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessName?: string; // Solo para Prestadores
}

export type POIStatus = 'pending' | 'approved' | 'rejected';

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
  feedback?: string; // Comentarios de rechazo
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
  action: 'approve' | 'reject';
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
  type: 'maps' | 'weather' | 'payment';
}
