import { MapPin, Play } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { LANDING } from '@/config/landing';
import { DashedPath, PlaneRoute } from './Decor';
import LandingNav from './LandingNav';
import { BTN_HERO_OUTLINE, BTN_LIGHT, EYEBROW, ORANGE_GLOW, WRAP } from './ui';

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;


export default function Hero() {
  return (
    <header className="relative isolate overflow-hidden bg-bgPrimary text-bgPrimary">
      {/* El fondo termina 4px antes del borde: la ola crema cubre esa franja y no asoma una fila naranja por redondeo de píxeles. */}
      <div aria-hidden="true" className={`absolute inset-x-0 bottom-1 top-0 -z-10 ${ORANGE_GLOW}`} />

      {/* Trazos y avión (solo desktop) */}
      <DashedPath d="M0 20C120 -10 250 70 330 150C380 200 420 230 470 250" viewBox="0 0 480 270" stroke="#FFFAF5" opacity={0.2} strokeWidth={1.75} className="left-0 top-[46%] hidden h-[270px] w-[480px] lg:block" />
      <DashedPath d="M0 130C90 120 170 60 260 20" viewBox="0 0 260 150" stroke="#FFFAF5" opacity={0.55} strokeWidth={1.75} className="bottom-[26%] right-0 hidden h-[150px] w-[260px] xl:block" />
      <PlaneRoute tone="white" className="right-[2%] top-[13%] hidden h-[110px] w-[250px] xl:block" />

      <LandingNav />

      <div className={`${WRAP} relative z-[2] flex flex-wrap items-start gap-12 pt-10 sm:pt-16 lg:pt-20`}>
        <div className="min-w-0 flex-[1_1_460px] pb-10 sm:pb-16 lg:pb-36">
          <div className="rise mb-5 flex items-center gap-4" style={delay(0)}>
            <p className={`${EYEBROW} text-bgPrimary`}>Planificador de viajes · Gran Mendoza</p>
            <span aria-hidden="true" className="hidden h-px max-w-[180px] flex-1 bg-bgPrimary/60 sm:block" />
          </div>
          <h1
            className="rise font-unbounded text-[clamp(2.3rem,5.6vw,5rem)] font-bold leading-[1.04] tracking-[-0.02em] [text-shadow:0_2px_6px_rgba(58,0,24,0.18)]"
            style={delay(100)}
          >
            Descubrí el Gran Mendoza a <span className="block text-sun">tu manera.</span>
          </h1>
          <p
            className="rise mt-7 max-w-[540px] text-[clamp(1.06rem,1.5vw,1.25rem)] font-medium leading-relaxed text-bgPrimary [text-shadow:0_1px_3px_rgba(58,0,24,0.35)]"
            style={delay(220)}
          >
            Armá tu itinerario a mano o con ayuda de la inteligencia artificial, explorá bodegas, actividades y sabores en el mapa. Y recorré cada paraíso sin perder tiempo.
          </p>
          <div className="rise mt-9 flex gap-2.5 sm:flex-wrap sm:gap-3.5" style={delay(340)}>
            <a href={LANDING.appCta.href} className={`${BTN_LIGHT} inline-flex flex-auto items-center justify-center gap-2.5 sm:flex-none`}>
              <MapPin aria-hidden="true" className="hidden size-5 text-fillPrimary sm:block" strokeWidth={2.5} />
              {LANDING.appCta.label}
            </a>
            <a href="#funciones" className={`${BTN_HERO_OUTLINE} inline-flex flex-auto items-center justify-center gap-2.5 sm:flex-none`}>
              Ver cómo funciona
              <Play aria-hidden="true" className="hidden size-4 fill-bgPrimary sm:block" strokeWidth={0} />
            </a>
          </div>
        </div>

        <div
          className="rise relative mx-auto h-[470px] min-w-0 max-w-[580px] flex-[1_1_360px] sm:h-[560px] lg:h-[640px]"
          style={delay(260)}
        >
          {/* Halo de luz detrás de los teléfonos (no es una sombra) */}
          <div aria-hidden="true" className="absolute left-1/2 top-1/2 size-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

          {/* Mockups con marco de dispositivo incluido (PNG con transparencia). */}
          <Image
            src="/landing/hero-mapa.png"
            alt="Mapa de Mendoza en la app con lugares cercanos, precios y filtros por categoría"
            width={509}
            height={1076}
            sizes="(min-width: 640px) 300px, 52vw"
            priority
            className="absolute right-0 top-0 h-[98%] w-auto"
          />
          <Image
            src="/landing/hero-itinerario-v2.png"
            alt="Itinerario Conociendo Luján con presupuesto del viaje y paradas planificadas por día"
            width={460}
            height={946}
            sizes="(min-width: 640px) 290px, 50vw"
            priority
            className="absolute bottom-0 left-0 h-[90%] w-auto"
          />
        </div>
      </div>

      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
        className="relative z-[1] -mt-px block aspect-[1440/220] min-h-[110px] w-full"
      >
        <path d="M0 200 L0 150 L120 90 L190 130 L320 40 L420 120 L520 70 L640 150 L760 60 L880 130 L1010 20 L1120 110 L1230 70 L1340 130 L1440 80 L1440 200 Z" fill="#F8B27C" />
        <path d="M320 40 L296 74 L312 68 L322 80 L336 66 L350 76 Z" fill="#FFFAF5" />
        <path d="M1010 20 L984 62 L1000 54 L1012 68 L1026 52 L1044 64 Z" fill="#FFFAF5" />
        <path d="M760 60 L742 88 L756 82 L764 92 L776 80 L786 88 Z" fill="#FFFAF5" />
        <path d="M0 220 L0 178 C180 142 300 192 480 168 C700 132 820 188 1040 162 C1240 142 1340 172 1440 152 L1440 220 Z" fill="#FFFAF5" />
      </svg>
    </header>
  );
}
