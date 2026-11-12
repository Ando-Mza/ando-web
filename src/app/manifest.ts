import type { MetadataRoute } from 'next';

/** Web App Manifest: ícono, nombre y colores al guardar ANDO en la pantalla de inicio. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ANDO por Mendoza',
    short_name: 'ANDO',
    description:
      'Planificá tu viaje por el Gran Mendoza: itinerarios a mano o con IA, mapa de bodegas, actividades y sabores.',
    lang: 'es-AR',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFAF5',
    theme_color: '#E96509',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
