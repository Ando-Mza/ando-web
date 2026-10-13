/**
 * Centralized environment configuration for the web application.
 */
export const getApiBaseUrl = (): string => {
  const configurada = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configurada) {
    // Sin "https://" el navegador la toma como ruta relativa al propio sitio y ninguna
    // consulta llega al backend; también se quita la barra final para no duplicarla.
    const conProtocolo = /^https?:\/\//i.test(configurada) ? configurada : `https://${configurada}`;
    return conProtocolo.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:3000`;
  }
  return 'http://127.0.0.1:3000';
};

export const ENV = {
  get API_BASE_URL() {
    return getApiBaseUrl();
  },
  R2_PUBLIC_URL:
    process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL ||
    'https://pub-e2f6233ffa5c42d499c619bcb2607d32.r2.dev',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;
