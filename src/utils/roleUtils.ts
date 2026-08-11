import { UserRole, POIStatus } from '../types';
import { USER_ROLES, POI_STATUSES, BACKEND_POI_STATUS_MAP } from '../constants/enums';

/**
 * Normalizes raw role strings from backend APIs into standard UserRole types.
 */
export function mapBackendRoleToFrontend(roleName?: string): UserRole {
  if (!roleName) return USER_ROLES.TOURIST;
  const normalized = roleName.trim().toLowerCase();
  if (normalized === 'administrador' || normalized === 'admin') {
    return USER_ROLES.ADMIN;
  }
  if (normalized === 'prestador' || normalized === 'provider') {
    return USER_ROLES.PROVIDER;
  }
  return USER_ROLES.TOURIST;
}

/**
 * Normalizes backend POI status strings into standard POIStatus types.
 */
export function mapBackendStatusToFrontend(statusStr?: string): POIStatus {
  if (!statusStr) return POI_STATUSES.PENDING;
  const normalized = statusStr.trim().toLowerCase();
  if (normalized === 'aprobado' || normalized === 'approved') return POI_STATUSES.APPROVED;
  if (normalized === 'rechazado' || normalized === 'rejected') return POI_STATUSES.REJECTED;
  if (normalized === 'corregir' || normalized === 'correction') return POI_STATUSES.CORRECTION;
  return POI_STATUSES.PENDING;
}

/**
 * Maps frontend POIStatus into backend API query string format.
 */
export function mapFrontendStatusToBackendQuery(status: POIStatus): string {
  switch (status) {
    case POI_STATUSES.APPROVED:
      return 'aprobado';
    case POI_STATUSES.REJECTED:
      return 'rechazado';
    case POI_STATUSES.CORRECTION:
      return 'pendiente';
    case POI_STATUSES.PENDING:
    default:
      return 'pendiente';
  }
}
