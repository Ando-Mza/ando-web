import { UserRole, POIStatus } from '../types';
import { USER_ROLES, POI_STATUSES, BACKEND_POI_STATUS_MAP } from '../constants/enums';

/**
 * Normalizes raw role strings or role objects from backend APIs into standard UserRole types.
 */
export function mapBackendRoleToFrontend(roleInput?: any): UserRole {
  if (!roleInput) return USER_ROLES.TOURIST;
  let roleName = roleInput;
  if (typeof roleInput === 'object') {
    roleName = roleInput.nombre || roleInput.name || roleInput.rol?.nombre || roleInput.role || '';
  }
  const normalized = String(roleName || '').trim().toLowerCase();
  if (normalized === 'administrador' || normalized === 'admin') {
    return USER_ROLES.ADMIN;
  }
  if (normalized === 'prestador' || normalized === 'provider') {
    return USER_ROLES.PROVIDER;
  }
  return USER_ROLES.TOURIST;
}

/**
 * Normalizes backend POI status strings or status objects into standard POIStatus types.
 */
export function mapBackendStatusToFrontend(statusInput?: any): POIStatus {
  if (!statusInput) return POI_STATUSES.PENDING;
  let statusStr = statusInput;
  if (typeof statusInput === 'object') {
    statusStr = statusInput.nombre || statusInput.name || statusInput.codigo || '';
  }
  const normalized = String(statusStr || '').trim().toLowerCase();
  if (normalized === 'aprobado' || normalized === 'approved' || normalized === 'validado por la comunidad') {
    return POI_STATUSES.APPROVED;
  }
  if (normalized === 'rechazado' || normalized === 'rejected') {
    return POI_STATUSES.REJECTED;
  }
  if (
    normalized === 'corregir' || 
    normalized === 'correction' || 
    normalized === 'corrección solicitada' || 
    normalized === 'correccion solicitada' ||
    normalized === 'observado por la comunidad'
  ) {
    return POI_STATUSES.CORRECTION;
  }
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
