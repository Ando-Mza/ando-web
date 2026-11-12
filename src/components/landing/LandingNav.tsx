import Image from 'next/image';
import Link from 'next/link';
import { LANDING } from '@/config/landing';
import { WRAP } from './ui';

const LINKS = [
  { href: '#funciones', label: 'Funciones' },
  { href: '#beneficios', label: 'Beneficios' },
  { href: '#prestadores', label: 'Prestadores' },
  { href: '#preguntas', label: 'Preguntas' },
];

const LINK =
  'inline-flex min-h-10 items-center rounded-full px-3.5 text-bgPrimary transition-colors duration-200 hover:bg-white/20 focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-bgPrimary';

export default function LandingNav() {
  return (
    <nav aria-label="Principal" className={`${WRAP} relative z-10 flex items-center justify-between gap-4 pt-6 sm:pt-7`}>
      <Link href="/" aria-label="ANDO por Mendoza, inicio" className="shrink-0 rounded-lg focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-bgPrimary">
        <Image src="/brand/logotipoClaro2.svg" alt="ANDO por Mendoza" width={626} height={372} priority className="h-14 w-auto sm:h-16" />
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Vidrio translúcido: mismo redondeo que el botón de descarga, texto blanco. */}
        <div className="flex items-center gap-0.5 rounded-full bg-white/15 p-1 text-[15px] font-medium backdrop-blur-md [text-shadow:0_1px_2px_rgba(58,0,24,0.4)] max-[380px]:hidden">
          <ul className="hidden items-center gap-0.5 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={LINK}>{l.label}</a>
              </li>
            ))}
          </ul>
          <Link href={LANDING.portalPath} className={LINK}>Ingresar</Link>
        </div>

        <a
          href="#descargar"
          className="whitespace-nowrap rounded-full bg-bgPrimary px-4 py-3 text-[15px] font-medium text-accentWine transition-transform duration-300 ease-out hover:-translate-y-0.5 focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-bgPrimary motion-reduce:transition-none sm:px-5"
        >
          Descargar app
        </a>
      </div>
    </nav>
  );
}
