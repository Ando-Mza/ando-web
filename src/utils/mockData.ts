import { POI, Schedule, AuditLog, GeneralParams, Integration, User, Category, ValidationState } from '../types';

export const mockUsers: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Sofía Romero',
    email: 'sofia.romero@ando.com',
    role: 'admin',
    password: '123456',
    status: 'active'
  },
  {
    id: 'usr-prov-1',
    name: 'Santiago Catena',
    email: 'santiago@catenazapata.com.ar',
    role: 'provider',
    businessName: 'Bodega Catena Zapata',
    phone: '+54 261 490 0200',
    cuit: '20304567899',
    password: '123456',
    status: 'active'
  },
  {
    id: 'usr-tourist-1',
    name: 'Juan Pérez',
    email: 'juan.perez@gmail.com',
    role: 'tourist',
    phone: '+54 261 555 1234',
    status: 'active'
  },
  {
    id: 'usr-tourist-2',
    name: 'Maria Dupont',
    email: 'maria.dupont@yahoo.fr',
    role: 'tourist',
    phone: '+33 6 1234 5678',
    status: 'active'
  },
  {
    id: 'usr-tourist-3',
    name: 'John Doe',
    email: 'john.doe@hotmail.com',
    role: 'tourist',
    phone: '+1 555 987 6543',
    status: 'inactive'
  },
];

export const mockPOIs: POI[] = [
  {
    id: 'poi-1',
    name: 'Bodega Catena Zapata',
    description: 'Reconocida bodega mendocina pionera en la revolución del Malbec de altura. Ofrece visitas guiadas, catas exclusivas y restaurante de alta gama.',
    category: 'Enoturismo',
    address: 'Cobos s/n, Luján de Cuyo, Mendoza',
    location: { lat: -33.0854, lng: -68.8789 },
    images: [
      'https://images.unsplash.com/photo-1543418219-44e2fd8516ee?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'approved',
    createdBy: 'usr-prov-1',
    updatedAt: '2026-06-20T14:30:00Z',
    email: 'contacto@catenazapata.com.ar',
    phone: '+54 261 490 0200',
    clicksCount: 1482,
  },
  {
    id: 'poi-2',
    name: 'Parque General San Martín',
    description: 'El principal y más antiguo parque de Mendoza. Diseñado por el paisajista Carlos Thays, cuenta con el Cerro de la Gloria, el Lago y portones históricos.',
    category: 'Naturaleza',
    address: 'Av. del Libertador s/n, Ciudad de Mendoza',
    location: { lat: -32.8894, lng: -68.8681 },
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'approved',
    createdBy: 'usr-admin-1',
    updatedAt: '2026-06-18T10:00:00Z',
    email: 'parques@mendoza.gov.ar',
    phone: '+54 261 449 2000',
    clicksCount: 3290,
  },
  {
    id: 'poi-3',
    name: 'Termas de Cacheuta',
    description: 'Parque de agua termal natural rodeado de la Cordillera de los Andes. Ofrece piletas a distintas temperaturas, grutas y fangoterapia.',
    category: 'Bienestar',
    address: 'Ruta Provincial 82, Km 38, Cacheuta, Mendoza',
    location: { lat: -33.0189, lng: -69.1172 },
    images: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'pending',
    createdBy: 'usr-prov-1',
    updatedAt: '2026-06-22T18:15:00Z',
    email: 'reservas@termascacheuta.com',
    phone: '+54 261 490 1520',
    clicksCount: 840,
  },
  {
    id: 'poi-4',
    name: 'Trekking Corto Aconcagua',
    description: 'Experiencia guiada de senderismo en el Parque Provincial Aconcagua. Vista de la pared sur del cerro más alto de América.',
    category: 'Aventura',
    address: 'Ruta Nacional 7, Km 1220, Las Cuevas, Mendoza',
    location: { lat: -32.6531, lng: -70.0108 },
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'pending',
    createdBy: 'usr-prov-1',
    updatedAt: '2026-06-22T19:00:00Z',
    email: 'info@aconcaguatrek.com.ar',
    phone: '+54 261 422 1530',
    clicksCount: 420,
  },
  {
    id: 'poi-5',
    name: 'Museo del Área Fundacional',
    description: 'Museo arqueológico e histórico situado en el corazón del centro histórico de Mendoza. Alberga ruinas del cabildo colonial.',
    category: 'Cultura',
    address: 'Plaza Pedro del Castillo, Beltrán y Videla Castillo, Mendoza',
    location: { lat: -32.8801, lng: -68.8312 },
    images: [
      'https://images.unsplash.com/photo-1566121318536-e8832a829f04?auto=format&fit=crop&w=800&q=80',
    ],
    status: 'rejected',
    feedback: 'Falta adjuntar imágenes en alta resolución del interior de las salas de exposición.',
    createdBy: 'usr-prov-1',
    updatedAt: '2026-06-19T11:45:00Z',
    email: 'museofundacional@ciudaddemendoza.gov.ar',
    phone: '+54 261 425 6927',
    clicksCount: 195,
  },
];

export const mockReviews: any[] = [
  {
    id: 'rev-1',
    poiId: 'poi-1',
    userName: 'Martín Benítez',
    rating: 5,
    comment: 'Excelente atención y degustación inolvidable. El maridaje de la bodega fue excepcional y la vista a la montaña es de otro mundo.',
    date: '2026-06-18',
    reply: {
      comment: '¡Muchas gracias Martín! Nos alegra enormemente que hayas disfrutado de la experiencia en Catena Zapata. Esperamos recibirte nuevamente.',
      date: '2026-06-19',
    },
  },
  {
    id: 'rev-2',
    poiId: 'poi-1',
    userName: 'Camila Rossi',
    rating: 5,
    comment: 'La visita guiada por la arquitectura piramidal y las cavas de barricas es súper completa. Muy recomendado reservar con anticipación.',
    date: '2026-06-15',
  },
  {
    id: 'rev-3',
    poiId: 'poi-1',
    userName: 'Thiago Silva',
    rating: 4,
    comment: 'Ótima vinícola e os vinhos de grande altura são incríveis. Vale a pena cada momento!',
    date: '2026-06-10',
  },
  {
    id: 'rev-4',
    poiId: 'poi-3',
    userName: 'Lucía Fernández',
    rating: 5,
    comment: 'Las termas son el descanso perfecto en la montaña. El almuerzo criollo tipo buffet superó nuestras expectativas.',
    date: '2026-06-14',
  },
];

export const mockSchedules: Schedule[] = [
  {
    id: 'sch-1',
    poiId: 'poi-1',
    daysOfWeek: [1, 2, 3, 4, 5, 6], // Lunes a Sábado
    timeRanges: [
      { start: '09:00', end: '13:00' },
      { start: '15:30', end: '19:30' },
    ],
    season: 'all',
    isHoliday: false,
    description: 'Horario estándar de visitas y degustaciones',
  },
  {
    id: 'sch-2',
    poiId: 'poi-1',
    daysOfWeek: [0], // Domingos
    timeRanges: [
      { start: '10:00', end: '14:00' }
    ],
    season: 'high',
    isHoliday: false,
    description: 'Degustaciones de temporada alta (Noviembre a Abril)',
  },
  {
    id: 'sch-3',
    poiId: 'poi-2',
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Todos los días
    timeRanges: [
      { start: '00:00', end: '23:59' }
    ],
    season: 'all',
    isHoliday: false,
    description: 'Parque público abierto 24 horas',
  },
  {
    id: 'sch-4',
    poiId: 'poi-3',
    daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
    timeRanges: [
      { start: '09:00', end: '18:00' }
    ],
    season: 'all',
    isHoliday: false,
    description: 'Horario termal de semana',
  },
  {
    id: 'sch-5',
    poiId: 'poi-3',
    daysOfWeek: [0, 6], // Sábados y Domingos
    timeRanges: [
      { start: '09:00', end: '19:00' }
    ],
    season: 'all',
    isHoliday: false,
    description: 'Horario termal fines de semana y feriados',
  }
];

export const mockLogs: AuditLog[] = [
  {
    id: 'log-1',
    poiId: 'poi-1',
    poiName: 'Bodega Catena Zapata',
    action: 'approve',
    adminName: 'Sofía Romero',
    comment: 'Validación de bodega y horarios de cata exitosa.',
    timestamp: '2026-06-20T14:30:00Z',
  },
  {
    id: 'log-2',
    poiId: 'poi-5',
    poiName: 'Museo del Área Fundacional',
    action: 'reject',
    adminName: 'Sofía Romero',
    comment: 'Falta adjuntar imágenes en alta resolución del interior de las salas de exposición.',
    timestamp: '2026-06-19T11:45:00Z',
  },
];

export const mockGeneralParams: GeneralParams = {
  maxImagesPerPOI: 8,
  maxTimeRangesPerDay: 3,
  validationGracePeriodDays: 5,
  requireReviewForEdits: true,
};

export const mockIntegrations: Integration[] = [
  {
    id: 'int-1',
    name: 'Mapbox API',
    description: 'Permite geolocalizar POIs y renderizar mapas interactivos mediante vectores de Mapbox dentro de la aplicación móvil y el panel.',
    enabled: true,
    type: 'maps',
    apiUrl: 'https://api.mapbox.com',
    apiKey: 'pk.eyJ1IjoibWFjYSIsImEiOiJjbDFhMmIzYzRkNWU2bTNvdzFhNnoifQ_MapboxKey',
  },
  {
    id: 'int-2',
    name: 'OpenWeatherMap API',
    description: 'Provee datos climáticos en tiempo real y pronósticos para los puntos de interés en el Gran Mendoza.',
    enabled: true,
    type: 'weather',
    apiUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: 'd1e2f3g4h5i6j7k8l9m0n1o2_WeatherKey',
  },
];

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Enoturismo', description: 'Visitas a bodegas, degustaciones de vinos y almuerzos en viñedos.', enabled: true },
  { id: 'cat-2', name: 'Naturaleza', description: 'Actividades al aire libre, visitas a parques naturales y reservas.', enabled: true },
  { id: 'cat-3', name: 'Bienestar', description: 'Spa, termas y experiencias de relajación y salud.', enabled: true },
  { id: 'cat-4', name: 'Aventura', description: 'Trekking, rafting, canopy y deportes extremos en montaña.', enabled: true },
  { id: 'cat-5', name: 'Cultura', description: 'Museos, monumentos históricos, teatros y paseos urbanos.', enabled: true },
];

export const mockValidationStates: ValidationState[] = [
  { id: 'state-pending', name: 'Pendiente de Validación', description: 'Contenido nuevo o editado esperando ser verificado.', enabled: true, allowedTransitions: ['state-approved', 'state-rejected', 'state-correction'] },
  { id: 'state-approved', name: 'Aprobado', description: 'Contenido validado y visible en la aplicación para los turistas.', enabled: true, allowedTransitions: ['state-rejected', 'state-correction'] },
  { id: 'state-rejected', name: 'Rechazado', description: 'Contenido que no cumple con las políticas y requiere rehacerse.', enabled: true, allowedTransitions: ['state-pending'] },
  { id: 'state-correction', name: 'Corrección Solicitada', description: 'El administrador solicitó cambios menores antes de aprobar.', enabled: true, allowedTransitions: ['state-pending', 'state-approved', 'state-rejected'] },
];


// Diccionario de Traducciones (US-CYP-02)
export interface TranslationDict {
  [lang: string]: {
    [key: string]: string;
  };
}

export const mockTranslations: TranslationDict = {
  es: {
    welcome: 'Bienvenido a ANDO',
    dashboard: 'Tablero Principal',
    pois: 'Puntos de Interés',
    schedules: 'Horarios',
    settings: 'Configuración',
    validation: 'Validación de Contenido',
    logout: 'Cerrar Sesión',
    approve: 'Aprobar',
    reject: 'Rechazar',
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    save: 'Guardar Cambios',
    cancel: 'Cancelar',
    categories: 'Categorías',
    integrations: 'Integraciones',
  },
  en: {
    welcome: 'Welcome to ANDO',
    dashboard: 'Dashboard',
    pois: 'Points of Interest',
    schedules: 'Schedules',
    settings: 'Settings',
    validation: 'Content Validation',
    logout: 'Log Out',
    approve: 'Approve',
    reject: 'Reject',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    save: 'Save Changes',
    cancel: 'Cancel',
    categories: 'Categories',
    integrations: 'Integrations',
  },
  pt: {
    welcome: 'Bem-vindo ao ANDO',
    dashboard: 'Painel Principal',
    pois: 'Pontos de Interesse',
    schedules: 'Horários',
    settings: 'Configurações',
    validation: 'Validação de Conteúdo',
    logout: 'Sair',
    approve: 'Aprovar',
    reject: 'Rejeitar',
    pending: 'Pendente',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    save: 'Salvar Alterações',
    cancel: 'Cancelar',
    categories: 'Categorias',
    integrations: 'Integrações',
  },
};
