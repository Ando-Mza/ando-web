/**
 * Centralized environment configuration for the web application.
 */
export const ENV = {
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  R2_PUBLIC_URL: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || 'https://pub-e2f6233ffa5c42d499c619bcb2607d32.r2.dev',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
} as const;
