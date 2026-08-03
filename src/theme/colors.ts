/**
 * ANDO Official Design Tokens - Color Palette (Web Copy)
 */
export const colors = {
  // Brand & Action Colors
  fillPrimary: '#E96509', // Naranja terracota - CTA principales / estados activos
  fillSecondary: '#F2904A', // Naranja atardecer - CTA secundarios / badges / pressed

  // Backgrounds
  bgPrimary: '#FFFAF5', // Crema cálido - Fondo base (reduce fatiga visual)

  // Accents
  accentPurple: '#8E527D', // Malbec suave - Ecosistema IA (mensajes chatbot, etc.)
  accentWine: '#750031', // Vino profundo - Títulos principales / iconografía enoturismo

  // Typography
  textDark: '#2C2C2C', // Gris oscuro - Texto de lectura (cuerpo)
} as const;

export type AppColors = typeof colors;
