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

export const ESTADOS_POI_UUID = {
  PENDIENTE: '8cb3f380-4a8b-47a8-929e-fc3c50600380',
  APROBADO: '77129a2b-b2c1-40ea-ad20-385bc4044534',
  RECHAZADO: '8b484db8-61be-43a9-8329-631348632e7f',
  PENDIENTE_COMUNITARIA: '830e01a6-371a-460b-a230-4b5290af0bc3',
  VALIDADO_COMUNIDAD: '16c520a8-eed5-42b2-a486-1921de3c105c',
  OBSERVADO_COMUNIDAD: '92bc4103-f663-4977-acfc-4236d7bfbc58',
  CORRECCION_SOLICITADA: '23289c28-4c67-4957-ba5d-139fca84e47d',
};

/**
 * Normalizes backend POI status strings or status objects into standard POIStatus types.
 */
export function mapBackendStatusToFrontend(statusInput?: any): POIStatus {
  if (!statusInput) return POI_STATUSES.PENDING;
  let statusStr = statusInput;
  if (typeof statusInput === 'object') {
    statusStr = statusInput.nombre || statusInput.name || statusInput.id || statusInput.codigo || '';
  }
  const normalized = String(statusStr || '').trim().toLowerCase();

  // Mapeo por UUID exacto
  if (
    normalized === ESTADOS_POI_UUID.APROBADO.toLowerCase() ||
    normalized === ESTADOS_POI_UUID.VALIDADO_COMUNIDAD.toLowerCase() ||
    normalized === 'aprobado' ||
    normalized === 'approved' ||
    normalized === 'validado por la comunidad'
  ) {
    return POI_STATUSES.APPROVED;
  }

  if (
    normalized === ESTADOS_POI_UUID.RECHAZADO.toLowerCase() ||
    normalized === 'rechazado' ||
    normalized === 'rejected'
  ) {
    return POI_STATUSES.REJECTED;
  }

  if (
    normalized === ESTADOS_POI_UUID.CORRECCION_SOLICITADA.toLowerCase() ||
    normalized === ESTADOS_POI_UUID.OBSERVADO_COMUNIDAD.toLowerCase() ||
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
