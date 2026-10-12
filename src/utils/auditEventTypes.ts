import { EventoAuditoriaTipo } from '@/types/audit';

type TipoEvento = Exclude<EventoAuditoriaTipo, 'all'>;

/** Presentación de los cuatro tipos de evento de US-AYT-01 (la clasificación la hace el backend). */
export const TIPOS_EVENTO_AUDITORIA: Record<
  TipoEvento,
  { label: string; colorClass: string; bgClass: string; borderClass: string }
> = {
  accion_usuario: {
    label: 'Acción de Usuario',
    colorClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
  },
  error_sistema: {
    label: 'Error del sistema',
    colorClass: 'text-red-700',
    bgClass: 'bg-red-50',
    borderClass: 'border-red-200',
  },
  cambio_poi: {
    label: 'Cambio en POI',
    colorClass: 'text-amber-800',
    bgClass: 'bg-amber-50',
    borderClass: 'border-amber-200',
  },
  login_fallido: {
    label: 'Login fallido',
    colorClass: 'text-rose-700',
    bgClass: 'bg-rose-50',
    borderClass: 'border-rose-200',
  },
};

export function getTipoEventoMeta(tipo?: string) {
  return TIPOS_EVENTO_AUDITORIA[(tipo as TipoEvento) ?? 'accion_usuario'] ?? TIPOS_EVENTO_AUDITORIA.accion_usuario;
}

const DESCRIPCIONES_ACCION: Record<string, string> = {
  LOGIN_SUCCESS: 'Inicio de sesión',
  LOGIN_FAILED: 'Intento de inicio de sesión fallido',
  LOGOUT_SUCCESS: 'Cierre de sesión',
  AUTH_ACCOUNT_LOCKED: 'Cuenta bloqueada por intentos fallidos',
  PASSWORD_RESET_SUCCESS: 'Contraseña restablecida',
  PASSWORD_RESET_FAILED: 'Restablecimiento de contraseña fallido',
  PASSWORD_CHANGED: 'Cambio de contraseña',
  ERROR_SISTEMA: 'Error del sistema',
  CREAR_POI: 'Alta de POI',
  APROBAR_POI_ADMIN: 'POI aprobado',
  RECHAZAR_POI_ADMIN: 'POI rechazado',
  SOLICITAR_CORRECCION_POI_ADMIN: 'Corrección de POI solicitada',
  ELIMINAR_IMAGEN_POI: 'Imagen de POI eliminada',
  CREAR: 'Alta de registro',
  MODIFICAR: 'Modificación de registro',
  ELIMINAR: 'Eliminación de registro',
};

/** Descripción legible del evento a partir de la acción y su detalle. */
export function describirEvento(accion: string, entidad: string, detalle?: Record<string, any>): string {
  const base =
    DESCRIPCIONES_ACCION[accion] ??
    accion
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/^\w/, (c) => c.toUpperCase());

  if (detalle?.mensajeError) {
    const ruta = detalle.ruta ? ` (${detalle.metodo ?? ''} ${detalle.ruta})`.replace('( ', '(') : '';
    return `${base}: ${detalle.mensajeError}${ruta}`;
  }
  if (detalle?.poiNombre) return `${base}: ${detalle.poiNombre}`;
  if (detalle?.nombre) return `${base}: ${detalle.nombre}`;
  if (detalle?.titulo) return `${base}: ${detalle.titulo}`;
  if (detalle?.motivo) return `${base} (${detalle.motivo})`;
  if (detalle?.emailIntentado || detalle?.email) {
    return `${base}: ${detalle.emailIntentado ?? detalle.email}`;
  }
  if (['CREAR', 'MODIFICAR', 'ELIMINAR'].includes(accion)) return `${base} en ${entidad}`;
  return base;
}
