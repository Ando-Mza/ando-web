import { Plane } from 'lucide-react';

/**
 * Piezas decorativas de la landing (todas aria-hidden y sin interacción).
 * Se posicionan con `className` (absolute + medidas) desde cada sección.
 */

const BLOB_D =
  'M120 80C220 -20 420 20 520 140C620 260 560 440 420 520C280 600 80 560 30 400C-20 260 20 160 120 80Z';

/** Mancha orgánica de fondo (durazno suave). */
export function Blob({ className = '', fill = '#FBE4D3' }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 600 600" aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <path d={BLOB_D} fill={fill} />
    </svg>
  );
}

/** Trazo punteado suelto. `d` en un viewBox de `viewBox`. */
export function DashedPath({
  d,
  viewBox,
  className = '',
  stroke = '#E96509',
  opacity = 0.55,
  strokeWidth = 2.5,
}: {
  d: string;
  viewBox: string;
  className?: string;
  stroke?: string;
  opacity?: number;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox={viewBox} aria-hidden="true" className={`pointer-events-none absolute overflow-visible ${className}`}>
      <path d={d} fill="none" stroke={stroke} strokeOpacity={opacity} strokeWidth={strokeWidth} strokeDasharray="7 8" strokeLinecap="round" />
    </svg>
  );
}

/** Avión con su trayectoria punteada (naranja por defecto, `white` sobre fondos naranja). */
export function PlaneRoute({ className = '', tone = 'orange' }: { className?: string; tone?: 'orange' | 'white' }) {
  const stroke = tone === 'white' ? '#FFFAF5' : '#E96509';
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <svg viewBox="0 0 420 100" className="h-full w-full overflow-visible">
        <path
          d="M0 86C90 6 220 -6 330 40C360 52 386 50 404 40"
          fill="none"
          stroke={stroke}
          strokeOpacity={tone === 'white' ? 0.75 : 0.7}
          strokeWidth={tone === 'white' ? 2 : 2.5}
          strokeDasharray="7 8"
          strokeLinecap="round"
        />
      </svg>
      <Plane
        className={`absolute -right-3 top-0 size-12 ${tone === 'white' ? 'fill-bgPrimary text-bgPrimary' : 'fill-fillPrimary text-fillPrimary'}`}
        strokeWidth={1.25}
      />
    </div>
  );
}

/** Siluetas de montañas translúcidas para tarjetas oscuras. */
export function Mountains({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 210" aria-hidden="true" className={`pointer-events-none absolute ${className}`}>
      <path d="M0 210V150L70 92L112 124L196 36L258 112L312 70L420 150V210Z" fill="#E58AA9" fillOpacity="0.22" />
      <path d="M90 210L160 128L204 158L262 90L338 166L420 118V210Z" fill="#F2A7C0" fillOpacity="0.2" />
      <path d="M196 36L176 66L190 60L198 72L210 58L222 66Z" fill="#FFFAF5" fillOpacity="0.32" />
      <path d="M262 90L246 112L258 106L264 116L274 104L284 110Z" fill="#FFFAF5" fillOpacity="0.28" />
    </svg>
  );
}
