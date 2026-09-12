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

export const ESTADOS_POI_MAP = {
  // UUIDs de estados_poi en base de datos
  '8cb3f380-4a8b-47a8-929e-fc3c50600380': POI_STATUSES.PENDING, // pendiente
  '77129a2b-b2c1-40ea-ad20-385bc4044534': POI_STATUSES.APPROVED, // aprobado
  '8b484db8-61be-43a9-8329-631348632e7f': POI_STATUSES.REJECTED, // rechazado
  '830e01a6-371a-460b-a230-4b5290af0bc3': POI_STATUSES.PENDING, // Pendiente de validación comunitaria
  '16c520a8-eed5-42b2-a486-1921de3c105c': POI_STATUSES.PENDING, // Validado por la comunidad (pendiente de aprobación admin)
  '92bc4103-f663-4977-acfc-4236d7bfbc58': POI_STATUSES.CORRECTION, // Observado por la comunidad
  '23289c28-4c67-4957-ba5d-139fca84e47d': POI_STATUSES.CORRECTION, // Corrección solicitada
} as const;

/**
 * Normalizes backend POI status strings or UUIDs into standard POIStatus types.
 */
export function mapBackendStatusToFrontend(statusStr?: string): POIStatus {
  if (!statusStr) return POI_STATUSES.PENDING;
  const trimmed = statusStr.trim().toLowerCase();

  // Comprobar si es un UUID conocido
  if (trimmed in ESTADOS_POI_MAP) {
    return ESTADOS_POI_MAP[trimmed as keyof typeof ESTADOS_POI_MAP];
  }

  // Comprobar por texto/nombre
  if (trimmed.includes('aprobado') || trimmed === 'approved') return POI_STATUSES.APPROVED;
  if (trimmed.includes('rechazado') || trimmed === 'rejected') return POI_STATUSES.REJECTED;
  if (
    trimmed.includes('correcci') ||
    trimmed.includes('corregir') ||
    trimmed === 'correction' ||
    trimmed.includes('observado')
  ) {
    return POI_STATUSES.CORRECTION;
  }
  if (trimmed.includes('validado por la comunidad')) {
    return POI_STATUSES.PENDING;
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
      return 'Corrección solicitada';
    case POI_STATUSES.PENDING:
    default:
      return 'pendiente';
  }
}
