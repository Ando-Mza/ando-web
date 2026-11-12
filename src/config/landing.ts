/**
 * Datos de la landing pública. El link de descarga se define por entorno para no
 * publicar un botón roto: mientras no exista, el CTA invita a pedir acceso por mail.
 */
const appDownloadUrl = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL?.trim() || '';

export const LANDING = {
  contactEmail: 'andoapp.mza@gmail.com',
  domain: 'andoapp.com.ar',
  portalPath: '/login',
  appCta: appDownloadUrl
    ? { href: appDownloadUrl, label: 'Descargar la app' }
    : {
        href: 'mailto:andoapp.mza@gmail.com?subject=Quiero%20probar%20ANDO',
        label: 'Quiero probar la app',
      },
} as const;
