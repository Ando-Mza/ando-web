import Image from 'next/image';

interface PhoneFrameProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Marco de teléfono para capturas de la app (768x1376). */
export default function PhoneFrame({ src, alt, className = '', sizes = '(min-width: 1024px) 300px, 60vw', priority = false }: PhoneFrameProps) {
  return (
    <div className={`rounded-[2.4rem] bg-[#2A1218] p-[7px] shadow-[0_36px_70px_-24px_rgba(58,0,24,0.55)] ${className}`}>
      <Image src={src} alt={alt} width={768} height={1376} sizes={sizes} priority={priority} className="block h-auto w-full rounded-[1.95rem]" />
    </div>
  );
}
