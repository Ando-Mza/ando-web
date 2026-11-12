import Image from 'next/image';
import Link from 'next/link';
import { LANDING } from '@/config/landing';
import { BTN_GHOST_WINE, BTN_ORANGE, EYEBROW, WRAP } from './ui';

export default function Providers() {
  return (
    <section id="prestadores" className="bg-sand py-[clamp(4rem,8vw,7rem)]">
      <div className={`${WRAP} flex flex-wrap items-center gap-x-20 gap-y-14`}>
        <div data-reveal="" className="min-w-0 flex-[1_1_420px]">
          <p className={`${EYEBROW} mb-3.5 text-fillPrimary`}>Para prestadores</p>
          <h2 className="font-wixDisplay text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1.08] tracking-[-0.02em] text-accentWine">
            Tu negocio, a la vista de quienes recorren Mendoza.
          </h2>
          <p className="mt-6 max-w-[520px] text-lg leading-relaxed">
            Gestioná horarios, fotos, servicios y opiniones desde el portal web. Cada negocio se valida antes de publicarse.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link href={LANDING.portalPath} className={BTN_ORANGE}>
              Ingresar al portal
            </Link>
            <Link href={LANDING.portalPath} className={BTN_GHOST_WINE}>
              Registrar mi negocio
            </Link>
          </div>
        </div>
        <div data-reveal="" data-reveal-delay="140" className="flex min-w-0 flex-[1.5_1_480px] justify-center">
          <Image
            src="/landing/prestador-web.png"
            alt="Panel web del prestador: visitas, calificaciones, reseñas y de dónde vienen los turistas"
            width={1472}
            height={910}
            sizes="(min-width: 1024px) 720px, 94vw"
            className="h-auto w-full max-w-[760px] drop-shadow-[0_30px_40px_rgba(117,0,49,0.3)]"
          />
        </div>
      </div>
    </section>
  );
}
