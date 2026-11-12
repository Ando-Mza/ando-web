import { ArrowRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { LANDING } from '@/config/landing';
import { DashedPath, PlaneRoute } from './Decor';
import { BTN_HERO_OUTLINE, BTN_LIGHT, EYEBROW, ORANGE_GLOW, WRAP } from './ui';

const COL_TITLE = 'mb-1 font-unbounded text-[11px] font-bold uppercase tracking-[0.18em] text-bgPrimary';
const LINK =
  'inline-flex min-h-11 items-center rounded-md font-medium text-bgPrimary decoration-bgPrimary/60 underline-offset-4 transition-opacity hover:underline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bgPrimary';

/**
 * Cierre de la landing: mismo lenguaje tipográfico y de fondo que el header
 * (etiqueta con filete, acento amarillo, texto blanco, botones con ícono),
 * en versión más sobria, + pie de página en una isla de vidrio translúcido.
 */
export default function FinalCta() {
  return (
    <section
      id="descargar"
      className="relative isolate overflow-hidden bg-bgPrimary text-bgPrimary"
    >
      {/* El fondo empieza 4px debajo del borde para que no asome una fila naranja sobre la ola. */}
      <div aria-hidden="true" className={`absolute inset-x-0 bottom-0 top-1 -z-10 ${ORANGE_GLOW}`} />

      {/* Trazos y avión (solo desktop), como en el header */}
      <DashedPath d="M0 20C100 -10 210 60 280 130C320 170 360 190 400 200" viewBox="0 0 410 220" stroke="#FFFAF5" opacity={0.2} strokeWidth={1.75} className="left-0 top-[24%] hidden h-[220px] w-[410px] lg:block" />
      <PlaneRoute tone="white" className="right-[3%] top-[22%] hidden h-[100px] w-[230px] xl:block" />

      <svg viewBox="0 0 1440 120" preserveAspectRatio="xMidYMin slice" aria-hidden="true" className="block aspect-[1440/120] min-h-[60px] w-full">
        <path d="M0 0 L1440 0 L1440 40 C1240 20 1140 60 960 44 C760 24 660 70 460 46 C300 28 140 64 0 44 Z" fill="#FFFAF5" />
      </svg>

      {/* CTA */}
      <div className={`${WRAP} relative z-[2] flex flex-wrap items-center gap-x-16 gap-y-10 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(1.5rem,4vw,3.5rem)]`}>
        <div data-reveal="" className="min-w-0 flex-[2_1_480px]">
          <div className="mb-5 flex items-center gap-4">
            <p className={`${EYEBROW} text-bgPrimary`}>Descargá ANDO</p>
            <span aria-hidden="true" className="hidden h-px max-w-[180px] flex-1 bg-bgPrimary/60 sm:block" />
          </div>
          <h2 className="font-unbounded text-[clamp(2.1rem,4.6vw,4rem)] font-bold leading-[1.06] tracking-[-0.02em] [text-shadow:0_2px_6px_rgba(58,0,24,0.18)]">
            Tu próximo viaje <span className="block text-sun">arranca acá.</span>
          </h2>
          <p className="mt-6 max-w-[520px] text-[clamp(1.06rem,1.5vw,1.25rem)] font-medium leading-relaxed text-bgPrimary [text-shadow:0_1px_3px_rgba(58,0,24,0.35)]">
            Empezá a armar tu recorrido por el Gran Mendoza, a mano o con ayuda de la inteligencia artificial.
          </p>
          <div className="mt-9 flex gap-2.5 sm:flex-wrap sm:gap-3.5">
            <a href={LANDING.appCta.href} className={`${BTN_LIGHT} inline-flex flex-auto items-center justify-center gap-2.5 sm:flex-none`}>
              <MapPin aria-hidden="true" className="hidden size-5 text-fillPrimary sm:block" strokeWidth={2.5} />
              {LANDING.appCta.label}
            </a>
            <a href="#prestadores" className={`${BTN_HERO_OUTLINE} inline-flex flex-auto items-center justify-center gap-2.5 sm:flex-none`}>
              Soy prestador
              <ArrowRight aria-hidden="true" className="hidden size-4 sm:block" strokeWidth={2.5} />
            </a>
          </div>
        </div>
        <div data-reveal="" data-reveal-delay="160" className="flex flex-[1_1_200px] justify-center">
          <Image src="/brand/iconoClaro.svg" alt="" aria-hidden="true" width={831} height={564} className="h-auto w-[min(100%,260px)] opacity-95" />
        </div>
      </div>

      {/* Pie de página */}
      <footer className={`${WRAP} relative z-[2] pb-[clamp(1.5rem,4vw,3rem)]`}>
        <div data-reveal="" className="rounded-[2rem] bg-white/15 p-7 backdrop-blur-md [text-shadow:0_1px_3px_rgba(58,0,24,0.45)] sm:p-10 lg:p-12">
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            <div className="min-w-0 flex-[2_1_280px]">
              <Image src="/brand/logotipoClaro2.svg" alt="ANDO por Mendoza" width={626} height={372} className="h-16 w-auto" />
              <p className="mt-[18px] max-w-[340px] text-[15px] font-medium leading-relaxed text-bgPrimary">
                Sistema integral de planificación de viajes por Mendoza.
              </p>
            </div>

            <nav aria-label="Producto" className="flex min-w-0 flex-[1_1_140px] flex-col text-[15px]">
              <p className={COL_TITLE}>Producto</p>
              <a className={LINK} href="#funciones">Funciones</a>
              <a className={LINK} href="#beneficios">Beneficios</a>
              <a className={LINK} href="#preguntas">Preguntas</a>
            </nav>

            <nav aria-label="Prestadores" className="flex min-w-0 flex-[1_1_140px] flex-col text-[15px]">
              <p className={COL_TITLE}>Prestadores</p>
              <Link className={LINK} href={LANDING.portalPath}>Ingresar al portal</Link>
              <Link className={LINK} href={LANDING.portalPath}>Registrar mi negocio</Link>
            </nav>

            <div className="flex min-w-0 flex-[1_1_200px] flex-col text-[15px]">
              <p className={COL_TITLE}>Contacto</p>
              <a className={LINK} href={`mailto:${LANDING.contactEmail}`}>{LANDING.contactEmail}</a>
              <span className="inline-flex min-h-11 items-center font-medium text-bgPrimary">{LANDING.domain}</span>
            </div>
          </div>

          <p className="mt-10 border-t border-bgPrimary/30 pt-6 text-[13px] font-medium leading-relaxed text-bgPrimary">
            © 2026 ANDO por Mendoza. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </section>
  );
}
