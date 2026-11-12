import { EYEBROW } from './ui';

/** Encabezado centrado: etiqueta con filetes naranja a los lados + título. */
export default function SectionHeading({
  eyebrow,
  children,
  nowrap = false,
}: {
  eyebrow: string;
  children: React.ReactNode;
  /** Mantiene el título en una sola línea desde `lg`. */
  nowrap?: boolean;
}) {
  return (
    <div data-reveal="" className="mb-12 text-center">
      <div className="mb-4 flex items-center justify-center gap-4">
        <span aria-hidden="true" className="h-px w-12 bg-fillPrimary/60 sm:w-28" />
        <p className={`${EYEBROW} text-fillPrimary`}>{eyebrow}</p>
        <span aria-hidden="true" className="h-px w-12 bg-fillPrimary/60 sm:w-28" />
      </div>
      <h2
        className={`font-wixDisplay text-[clamp(1.9rem,3.4vw,3.1rem)] font-bold leading-[1.08] tracking-[-0.02em] text-accentWine ${
          nowrap ? 'lg:whitespace-nowrap' : ''
        }`}
      >
        {children}
      </h2>
    </div>
  );
}
