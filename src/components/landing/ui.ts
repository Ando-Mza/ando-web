/** Clases compartidas de la landing (Tailwind las detecta al escanear este archivo). */
export const WRAP = 'mx-auto w-full max-w-[1296px] px-5 sm:px-8 lg:px-12';

const BTN_BASE =
  'inline-block rounded-full text-center transition-transform duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:transform-none focus-visible:outline-[3px] focus-visible:outline-offset-4';

/** Primario sobre naranja: crema con texto vino. */
export const BTN_LIGHT = `${BTN_BASE} bg-bgPrimary px-3 py-4 text-[0.875rem] max-[374px]:text-[0.8rem] sm:px-7 sm:text-base font-medium text-accentWine focus-visible:outline-accentWine`;
/** Secundario sobre naranja: vidrio blanco translúcido, sin trazo. */
export const BTN_GHOST_DEEP = `${BTN_BASE} bg-white/20 px-3 py-4 text-[0.875rem] max-[374px]:text-[0.8rem] sm:px-7 sm:text-base font-medium text-bgPrimary backdrop-blur-sm [text-shadow:0_1px_2px_rgba(58,0,24,0.35)] hover:bg-white/30 focus-visible:outline-bgPrimary`;
/** Secundario del hero: contorno blanco con velo translúcido (sin trazos oscuros). */
export const BTN_HERO_OUTLINE = `${BTN_BASE} border-2 border-bgPrimary/80 bg-white/10 px-3 py-[14px] text-[0.875rem] max-[374px]:text-[0.8rem] sm:px-7 sm:text-base font-medium text-bgPrimary backdrop-blur-sm [text-shadow:0_1px_2px_rgba(58,0,24,0.3)] hover:bg-white/20 focus-visible:outline-bgPrimary`;
/** Primario sobre crema: naranja con texto oscuro (contraste AA). */
export const BTN_ORANGE = `${BTN_BASE} bg-fillPrimary px-3 py-4 text-[0.875rem] max-[374px]:text-[0.8rem] sm:px-7 sm:text-base font-bold text-[#2C0A14] focus-visible:outline-accentWine`;
/** Secundario sobre crema: tinte vino suave, sin trazo. */
export const BTN_GHOST_WINE = `${BTN_BASE} bg-accentWine/10 px-3 py-4 text-[0.875rem] max-[374px]:text-[0.8rem] sm:px-7 sm:text-base font-medium text-accentWine hover:bg-accentWine/15 focus-visible:outline-accentWine`;

/** Naranja con brillo (oscuro a la izquierda, luminoso a la derecha): hero y cierre. */
export const ORANGE_GLOW =
  'bg-[radial-gradient(55%_65%_at_92%_6%,rgba(255,166,40,0.85)_0%,transparent_62%),radial-gradient(45%_55%_at_100%_80%,rgba(255,150,30,0.7)_0%,transparent_65%),linear-gradient(100deg,#D95805_0%,#E96509_46%,#F28410_100%)]';

export const EYEBROW = 'font-unbounded text-xs font-bold uppercase tracking-[0.18em]';
