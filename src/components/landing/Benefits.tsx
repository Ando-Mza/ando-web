import { Compass, Laptop, MapPin, Star, Store, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Blob, DashedPath, Mountains } from './Decor';
import RoutePin from './RoutePin';
import SectionHeading from './SectionHeading';
import { WRAP } from './ui';

interface Item {
  icon: LucideIcon;
  title: string;
  text: string;
}

const TURISTA: Item[] = [
  { icon: MapPin, title: 'Planificación simple.', text: 'Armá tu itinerario a mano o con ayuda de la IA.' },
  { icon: Star, title: 'Recomendaciones que van con vos.', text: 'Lugares, actividades y experiencias a tu medida.' },
  { icon: Compass, title: 'Recorridos pensados para aprovechar el tiempo.', text: 'Ordená las paradas y disfrutá el camino.' },
];

const LOCAL: Item[] = [
  { icon: Store, title: 'Tu negocio, en el mapa.', text: 'Llegá a más viajeros y clientes.' },
  { icon: TrendingUp, title: 'Nuevos recorridos, nuevas oportunidades.', text: 'Mostrá lo que ofrecés en cada plan.' },
  { icon: Laptop, title: 'Toda tu información en un solo lugar.', text: 'Actualizá tu propuesta de forma fácil y rápida.' },
];

const ISLAND = 'relative isolate min-w-0 flex-[1_1_440px] overflow-hidden rounded-[2rem] p-7 sm:p-10 lg:p-12';

function Pill({ className, children }: { className: string; children: string }) {
  return (
    <p className={`mb-6 inline-block rounded-full px-4 py-1.5 font-unbounded text-[11px] font-bold uppercase tracking-[0.18em] ${className}`}>
      {children}
    </p>
  );
}

function List({ items, badge, title, text }: { items: Item[]; badge: string; title: string; text: string }) {
  return (
    <ul className="flex flex-col gap-6">
      {items.map(({ icon: Icon, title: t, text: d }, i) => (
        <li key={t} data-reveal="" data-reveal-delay={String(200 + i * 90)} className="flex items-center gap-5">
          <span aria-hidden="true" className={`grid size-14 shrink-0 place-items-center rounded-full ${badge}`}>
            <Icon className="size-6" strokeWidth={2} />
          </span>
          <div>
            <h3 className={`font-wixDisplay text-[1.2rem] font-bold leading-snug ${title}`}>{t}</h3>
            <p className={`mt-0.5 text-base leading-relaxed ${text}`}>{d}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Benefits() {
  return (
    <section id="beneficios" className="relative overflow-hidden pb-[clamp(4rem,8vw,7rem)] pt-4">
      <Blob className="-left-44 top-10 size-[320px] md:size-[520px]" />
      <Blob className="-right-52 bottom-0 size-[360px] md:size-[560px]" fill="#FCE9DA" />
      <DashedPath d="M0 10C60 -10 150 40 170 120" viewBox="0 0 180 130" className="right-[3%] top-24 hidden h-[130px] w-[180px] xl:block" />

      <div className={`${WRAP} relative z-10`}>
        <SectionHeading eyebrow="Dos formas de disfrutar ANDO">Para quienes viajan y para quienes reciben.</SectionHeading>

        <div className="flex flex-wrap gap-6">
          {/* Turista */}
          <div data-reveal="" className={`${ISLAND} bg-white shadow-[0_28px_60px_-30px_rgba(117,0,49,0.35)]`}>
            <Blob className="-bottom-32 -left-28 size-64" fill="#FDEEE2" />
            <DashedPath d="M0 70C70 0 150 10 205 78" viewBox="0 0 220 100" className="right-24 top-8 hidden h-[100px] w-[220px] sm:block" />
            <RoutePin color="#E96509" hole="#FFFFFF" className="absolute right-10 top-10 hidden !h-[58px] !w-[46px] text-accentWine sm:block" />

            <div className="relative z-10">
              <Pill className="bg-[#FDE6D3] text-[#B84A08]">Para el turista</Pill>
              <h3 className="mb-9 max-w-[420px] font-wixDisplay text-[clamp(1.9rem,3vw,2.7rem)] font-bold leading-[1.1] tracking-[-0.02em] text-accentWine">
                Tu próximo viaje empieza con un buen plan.
              </h3>
              <List items={TURISTA} badge="bg-[#FCE3CF] text-fillPrimary" title="text-accentWine" text="text-textDark" />
            </div>
          </div>

          {/* Turismo local */}
          <div data-reveal="" data-reveal-delay="140" className={`${ISLAND} bg-[linear-gradient(155deg,#8A0A3D_0%,#750031_45%,#5C0027_100%)] text-bgPrimary shadow-[0_28px_60px_-30px_rgba(117,0,49,0.6)]`}>
            <Mountains className="-bottom-1 right-0 w-[52%] max-w-[380px] opacity-80" />
            <DashedPath d="M70 10C150 40 190 110 150 180C120 230 160 262 200 250" viewBox="0 0 210 270" stroke="#FFFAF5" opacity={0.3} className="right-2 top-28 hidden h-[270px] w-[150px] sm:block" />
            <RoutePin color="#FFFAF5" hole="#750031" className="absolute right-10 top-10 hidden !h-[58px] !w-[46px] opacity-25 sm:block" />

            <div className="relative z-10">
              <Pill className="bg-fillSecondary text-wineDeep">Para el turismo local</Pill>
              <h3 className="mb-9 max-w-[440px] font-wixDisplay text-[clamp(1.9rem,3vw,2.7rem)] font-bold leading-[1.1] tracking-[-0.02em]">
                Más visibilidad para quienes <span className="text-fillSecondary">hacen grande a Mendoza.</span>
              </h3>
              <List items={LOCAL} badge="bg-bgPrimary text-accentWine" title="text-bgPrimary" text="text-[#F6E6DF]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
