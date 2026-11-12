import Image from 'next/image';
import { Blob, DashedPath, PlaneRoute } from './Decor';
import PhoneFrame from './PhoneFrame';
import SectionHeading from './SectionHeading';
import { EYEBROW, WRAP } from './ui';

/** Captura recortada que asoma desde el borde inferior de una tarjeta. */
function Peek({
  src,
  alt,
  position,
  width,
  height,
}: {
  src: string;
  alt: string;
  position: string;
  width: number;
  height: number;
}) {
  return (
    <div className="relative z-10 mt-auto h-[260px] overflow-hidden px-6 sm:px-9">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes="(min-width: 1024px) 380px, 90vw"
        className={`block h-full w-full rounded-t-[22px] object-cover ${position}`}
      />
    </div>
  );
}

const CARD = 'relative isolate flex min-w-0 overflow-hidden rounded-[2rem]';
const PAD = 'relative z-10 flex flex-col gap-3 px-6 pb-5 pt-8 sm:px-9 sm:pt-10';
const H3 = 'font-wixDisplay text-[1.75rem] font-bold leading-tight';

export default function Features() {
  return (
    <section id="funciones" className="relative overflow-hidden pb-24 pt-[clamp(3rem,6vw,5.5rem)]">
      {/* Fondo no plano: manchas durazno, ruta con avión y trazo lateral */}
      <Blob className="-right-40 -top-10 size-[340px] md:size-[560px]" />
      <Blob className="-left-48 top-[48%] size-[300px] md:size-[480px]" fill="#FCE9DA" />
      <PlaneRoute className="right-10 top-5 hidden h-[100px] w-[420px] lg:block" />
      <DashedPath d="M0 20C80 -10 140 70 190 150" viewBox="0 0 200 160" className="left-0 top-[44%] hidden h-[160px] w-[200px] md:block" />

      <div className={`${WRAP} relative z-10`}>
        <SectionHeading eyebrow="Lo que hace ANDO" nowrap>
          Planificá y recorré Mendoza desde un solo lugar.
        </SectionHeading>

        <div className="flex flex-wrap gap-5">
          {/* Asistente IA */}
          <article data-reveal="" data-reveal-delay="0" className={`${CARD} flex-[2_1_560px] flex-row flex-wrap bg-accentPurple text-bgPrimary`}>
            <span aria-hidden="true" className="absolute -left-16 -top-20 size-60 rounded-full bg-white/[0.06]" />
            <span aria-hidden="true" className="absolute -bottom-24 left-[28%] size-64 rounded-full bg-white/[0.05]" />
            <DashedPath d="M0 90C60 20 140 30 190 80" viewBox="0 0 200 110" stroke="#FFFAF5" opacity={0.3} className="bottom-6 left-4 h-[110px] w-[200px]" />
            <div className="relative z-10 flex min-w-0 flex-[1_1_280px] flex-col justify-center gap-3.5 p-7 sm:p-11">
              <p className={`${EYEBROW} text-[11px] text-[#F3DCEB]`}>Asistente con IA</p>
              <h3 className="font-wixDisplay text-[clamp(1.6rem,2.6vw,2.25rem)] font-bold leading-[1.12]">
                Contale qué querés y armamos el viaje.
              </h3>
              <p className="text-base leading-relaxed">
                Pedí bodegas económicas en Luján de Cuyo y recibí opciones con reseñas, listas para sumar a tu itinerario.
              </p>
            </div>
            <div className="relative z-10 min-h-[340px] min-w-0 flex-[1_1_280px] overflow-hidden">
              <PhoneFrame
                src="/landing/chat.jpg"
                alt="Conversación con el asistente de IA que recomienda bodegas en Luján de Cuyo"
                sizes="300px"
                className="absolute left-1/2 top-8 w-[min(78%,300px)] -translate-x-1/2 rounded-b-none shadow-[0_24px_50px_-20px_rgba(40,0,25,0.6)]"
              />
            </div>
          </article>

          {/* Itinerarios */}
          <article data-reveal="" data-reveal-delay="120" className={`${CARD} flex-[1_1_320px] flex-col border border-[#F0E2D2] bg-white`}>
            <Blob className="-right-16 -top-16 size-64" fill="#FDEBDD" />
            <div className={PAD}>
              <p className={`${EYEBROW} text-[11px] text-fillPrimary`}>Itinerarios</p>
              <h3 className={`${H3} text-accentWine`}>Días, paradas y horarios a tu medida.</h3>
              <p className="text-base leading-relaxed">Ordená las paradas de cada día y mirá cuánto tardás entre una y otra.</p>
            </div>
            <Peek
              src="/landing/feat-itinerario.jpg"
              alt="Itinerario Mi aventura en Mendoza: día 2 con tres paradas y tiempos de traslado"
              position="object-[center_70%]"
              width={630}
              height={1280}
            />
          </article>

          {/* Mapa */}
          <article data-reveal="" data-reveal-delay="0" className={`${CARD} flex-[1_1_320px] flex-col bg-[#241A1E] text-bgPrimary`}>
            <DashedPath d="M0 110C70 100 90 30 160 40C210 48 230 -10 260 -20" viewBox="0 0 260 120" stroke="#F2904A" opacity={0.4} className="right-0 top-3 h-[120px] w-[260px]" />
            <span aria-hidden="true" className="absolute -right-20 top-10 size-52 rounded-full bg-fillSecondary/[0.07]" />
            <div className={PAD}>
              <p className={`${EYEBROW} text-[11px] text-fillSecondary`}>Mapa</p>
              <h3 className={H3}>Bodegas, actividades, hoteles y comida.</h3>
              <p className="text-base leading-relaxed text-[#F1E4DA]">Filtrá por categoría y descubrí qué hay cerca tuyo.</p>
            </div>
            <Peek
              src="/landing/feat-mapa.jpg"
              alt="Mapa de Mendoza en la app con lugares cercanos, calificación y rango de precios"
              position="object-[center_40%]"
              width={800}
              height={1739}
            />
          </article>

          {/* Modo viaje */}
          <article data-reveal="" data-reveal-delay="120" className={`${CARD} flex-[1_1_320px] flex-col bg-[linear-gradient(160deg,#F2904A_0%,#E96509_60%)] text-bgPrimary`}>
            <span aria-hidden="true" className="absolute -right-16 -top-16 size-60 rounded-full bg-white/[0.14]" />
            <span aria-hidden="true" className="absolute -left-10 top-1/2 size-40 rounded-full bg-white/[0.08]" />
            <div className={PAD}>
              <p className={`${EYEBROW} text-[11px] text-wineDeep`}>Modo viaje activo</p>
              <h3 className={H3}>Tu próxima parada, siempre a la vista.</h3>
              <p className="text-base font-medium leading-relaxed text-wineDeep">
                Distancia, tiempo estimado y cómo llegar, con check-in en cada lugar.
              </p>
            </div>
            <Peek
              src="/landing/feat-modo-viaje.jpg"
              alt="Modo viaje: próxima parada Bodega Santa Julia y la ruta en el mapa"
              position="object-[center_46%]"
              width={630}
              height={1280}
            />
          </article>
        </div>
      </div>
    </section>
  );
}
