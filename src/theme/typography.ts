/**
 * ANDO Official Design Tokens - Typography (Web Copy)
 */
export const fontFamilies = {
  hero: 'var(--font-unbounded), sans-serif',
  title: 'var(--font-wix-display), sans-serif',
  body: 'var(--font-wix-text), sans-serif',
} as const;

export const typography = {
  // Hero / Identidad (Unbounded)
  hero: {
    fontFamily: fontFamilies.hero,
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 'bold',
  },

  // Interface Titles (Wix Madefor Display)
  h1: {
    fontFamily: fontFamilies.title,
    fontSize: '24px',
    lineHeight: '30px',
    fontWeight: 'bold',
  },
  h2: {
    fontFamily: fontFamilies.title,
    fontSize: '20px',
    lineHeight: '26px',
    fontWeight: '600', // SemiBold
  },
  h3: {
    fontFamily: fontFamilies.title,
    fontSize: '16px',
    lineHeight: '22px',
    fontWeight: '600', // SemiBold
  },

  // Body and Controls (Wix Madefor Text)
  bodyLarge: {
    fontFamily: fontFamilies.body,
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 'normal',
  },
  bodyMedium: {
    fontFamily: fontFamilies.body,
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 'normal',
  },
  bodySmall: {
    fontFamily: fontFamilies.body,
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 'normal',
  },

  // Controls (Buttons, Inputs)
  controlMedium: {
    fontFamily: fontFamilies.body,
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: '500', // Medium
  },
  controlLarge: {
    fontFamily: fontFamilies.body,
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: '500', // Medium
  },
} as const;

export type AppTypography = typeof typography;
