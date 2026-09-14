/**
 * Centralized environment configuration for the web application.
 */
export const getApiBaseUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:3000`;
  }
  return 'http://localhost:3000';
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
