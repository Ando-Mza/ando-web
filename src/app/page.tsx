import Benefits from '@/components/landing/Benefits';
import Faq from '@/components/landing/Faq';
import Features from '@/components/landing/Features';
import FinalCta from '@/components/landing/FinalCta';
import Hero from '@/components/landing/Hero';
import Providers from '@/components/landing/Providers';
import RevealController from '@/components/landing/RevealController';

/**
 * Landing pública de ANDO. Es estática y no carga el AppProvider del portal
 * (que vive en el route group (portal)).
 */
export default function LandingPage() {
  return (
    <main>
      <RevealController />
      <Hero />
      <Features />
      <Benefits />
      <Providers />
      <Faq />
      <FinalCta />
    </main>
  );
}
