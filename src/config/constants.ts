import { Sunrise, Sun, Moon, Clock } from 'lucide-react';
import { GeneralParams } from '../types';

/**
 * Default general parameters for the platform (US-CYP-01)
 */
export const DEFAULT_GENERAL_PARAMS: GeneralParams = {
  maxImagesPerPOI: 8,
  maxTimeRangesPerDay: 3,
  validationGracePeriodDays: 5,
  requireReviewForEdits: true,
};

/**
 * Days of the week mapping (0 = Sunday, 1 = Monday, etc.)
 */
export const DAYS_OF_WEEK = [
  { value: 1, label: 'Lun', name: 'Lunes' },
  { value: 2, label: 'Mar', name: 'Martes' },
  { value: 3, label: 'Mié', name: 'Miércoles' },
  { value: 4, label: 'Jue', name: 'Jueves' },
  { value: 5, label: 'Vie', name: 'Viernes' },
  { value: 6, label: 'Sáb', name: 'Sábado' },
  { value: 0, label: 'Dom', name: 'Domingo' },
] as const;

/**
 * Standard Mendoza region schedule presets (US-GIT-01)
 */
export const MENDOZA_SCHEDULE_PRESETS = [
  { name: 'Mañana', start: '09:00', end: '13:30', Icon: Sunrise },
  { name: 'Tarde', start: '16:00', end: '20:00', Icon: Sun },
  { name: 'Noche', start: '20:00', end: '00:00', Icon: Moon },
  { name: 'Corrido', start: '09:00', end: '18:00', Icon: Clock },
] as const;

/**
 * Presets for Administrator POI Rejection feedback
 */
export const ADMIN_REJECT_PRESETS = [
  'Imágenes de baja resolución o no representativas',
  'Información del establecimiento no verificable',
  'Ubicación física o coordenadas GPS imprecisas',
] as const;

/**
 * Presets for Administrator POI Correction requests
 */
export const ADMIN_CORRECTION_PRESETS = [
  'Falta adjuntar más fotografías del interior del establecimiento',
  'Revisar y ajustar el horario de atención para feriados',
  'Completar la descripción detallada del servicio turístico',
] as const;
