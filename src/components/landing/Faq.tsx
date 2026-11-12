import { LANDING } from '@/config/landing';
import { BTN_GHOST_WINE, WRAP } from './ui';

const FAQS = [
  {
    q: '¿Qué es ANDO?',
    a: 'Una plataforma de planificación turística para Mendoza que centraliza información y permite crear itinerarios personalizados, de forma manual o asistida por inteligencia artificial.',
  },
  {
    q: '¿Cómo armo mi itinerario?',
    a: 'Podés sumar paradas desde el mapa y ordenarlas por día, o pedirle al asistente de IA que te proponga opciones según lo que buscás.',
  },
  {
    q: '¿Qué es el modo viaje activo?',
    a: 'Es la vista para cuando ya estás recorriendo: te muestra la próxima parada, la distancia, el tiempo estimado y cómo llegar, y te deja marcar tu llegada en cada lugar.',
  },
  {
    q: '¿Cómo sumo mi negocio?',
    a: 'Creá tu cuenta de prestador en el portal web y cargá los datos de tu negocio. El equipo lo valida antes de publicarlo, y desde el panel gestionás horarios, fotos, servicios y opiniones.',
  },
];

export default function Faq() {
  return (
    <section id="preguntas" className={`${WRAP} flex flex-wrap gap-x-20 gap-y-12 py-[clamp(4rem,8vw,7rem)]`}>
      <div data-reveal="" className="min-w-0 flex-[1_1_280px]">
        <h2 className="font-wixDisplay text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-[-0.02em] text-accentWine">
          Preguntas frecuentes
        </h2>
        <p className="mb-6 mt-4 text-base leading-relaxed">¿No encontrás lo que buscás? Escribinos y te respondemos.</p>
        <a href={`mailto:${LANDING.contactEmail}`} className={BTN_GHOST_WINE}>
          Contactar al equipo
        </a>
      </div>

      <div data-reveal="" data-reveal-delay="120" className="min-w-0 flex-[2_1_520px] border-b border-[#E6D3BF]">
        {FAQS.map((item, i) => (
          <details key={item.q} open={i === 0} className="group border-t border-[#E6D3BF]">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-5 rounded-lg py-[18px] font-wixDisplay text-xl font-bold focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-accentWine [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="text-[28px] leading-none text-fillPrimary transition-transform duration-300 ease-out group-open:rotate-45 motion-reduce:transition-none"
              >
                +
              </span>
            </summary>
            <p className="max-w-[640px] pb-[22px] text-base leading-[1.65]">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
