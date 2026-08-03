# Reglas de Estética, Colores y Tokens de Diseño (ANDO - Web) 🏔️🎨

Este documento define las directrices estéticas, paleta de colores y tokens tipográficos oficiales del ecosistema de **ANDO**, copiados de `ando-app` para garantizar consistencia visual absoluta entre la plataforma móvil y el portal web de gestión.

---

## 1. Paleta de Colores Oficiales

La marca ANDO basa su identidad en tonos cálidos y vinícolas característicos de la región de Mendoza.

| Variable CSS / Token | Color Hex | Propósito y Uso Sugerido |
| :--- | :--- | :--- |
| `fillPrimary` | `#E96509` | **Naranja Terracota:** Botones principales (CTA), guardado crítico y estados activos de navegación. |
| `fillSecondary` | `#F2904A` | **Naranja Atardecer:** Botones secundarios, badges de estado/categoría y pressed state. |
| `bgPrimary` | `#FFFAF5` | **Crema Cálido:** Fondo base de la aplicación. Reduce la fatiga visual. Reemplaza al blanco puro. |
| `accentPurple` | `#8E527D` | **Malbec Suave:** Mensajes e interfaces del ecosistema de Inteligencia Artificial (IA). |
| `accentWine` | `#750031` | **Vino Profundo:** Títulos principales de alta jerarquía, headers y enoturismo. |
| `textDark` | `#2C2C2C` | **Gris Oscuro:** Color base del texto corporal. Nunca utilizar negro puro (`#000000`) sobre fondo crema. |

---

## 2. Tipografías Oficiales

El portal web utiliza la familia de fuentes de Google Fonts importadas en el enrutador de Next.js:

*   **Identidad / Hero / Logos:** `Unbounded` (700 Bold). Uso exclusivo para logueo, onboarding o títulos destacados de la marca.
*   **Títulos de Interfaz (H1, H2, H3):** `Wix Madefor Display` (SemiBold / Bold). Para nombres de secciones del dashboard, títulos de tablas y modales.
*   **Texto Corporal y Controles (Buttons/Inputs):** `Wix Madefor Text` (Regular / Medium). Para descripciones, inputs de texto, botones, tablas y descripciones generales.

### Escalas Tipográficas de Interfaz (Tokens)

```typescript
export const typography = {
  hero: { fontFamily: 'Unbounded', fontSize: '32px', lineHeight: '40px', fontWeight: 'bold' },
  h1:   { fontFamily: 'Wix Madefor Display', fontSize: '24px', lineHeight: '30px', fontWeight: 'bold' },
  h2:   { fontFamily: 'Wix Madefor Display', fontSize: '20px', lineHeight: '26px', fontWeight: '600' },
  h3:   { fontFamily: 'Wix Madefor Display', fontSize: '16px', lineHeight: '22px', fontWeight: '600' },
  bodyLarge:  { fontFamily: 'Wix Madefor Text', fontSize: '16px', lineHeight: '24px', fontWeight: 'normal' },
  bodyMedium: { fontFamily: 'Wix Madefor Text', fontSize: '14px', lineHeight: '20px', fontWeight: 'normal' },
  bodySmall:  { fontFamily: 'Wix Madefor Text', fontSize: '12px', lineHeight: '16px', fontWeight: 'normal' }
};
```

---

## 3. Directrices de Estética Web

*   **Contraste y Legibilidad:** No usar blanco puro `#FFFFFF` como fondo general; emplear el crema cálido `#FFFAF5`. Asimismo, el texto no debe ser negro puro `#000000`; utilizar el gris oscuro `#2C2C2C`.
*   **Paneles y Tarjetas:** Implementar bordes redondeados amplios (`rounded-2xl` o `rounded-3xl`), sombreados sutiles (`shadow-sm` o `shadow-md`) y bordes semitransparentes en tarjetas blancas (`border border-white/50 bg-white/70 backdrop-blur-md`).
*   **Efectos Dinámicos:** Las interacciones deben ser suaves. Utilizar transiciones en hover (`transition-all duration-200`) y micro-escalas (`hover:-translate-y-0.5 active:translate-y-0`) para dar vida al portal.
