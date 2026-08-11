import { UserRole, POIStatus } from '../types';

export const USER_ROLES = {
  ADMIN: 'admin' as UserRole,
  PROVIDER: 'provider' as UserRole,
  TOURIST: 'tourist' as UserRole,
} as const;

export const POI_STATUSES = {
  PENDING: 'pending' as POIStatus,
  APPROVED: 'approved' as POIStatus,
  REJECTED: 'rejected' as POIStatus,
  CORRECTION: 'correction' as POIStatus,
} as const;

export const BACKEND_POI_STATUS_MAP = {
  aprobado: 'approved' as POIStatus,
  rechazado: 'rejected' as POIStatus,
  pendiente: 'pending' as POIStatus,
  corregir: 'correction' as POIStatus,
} as const;
