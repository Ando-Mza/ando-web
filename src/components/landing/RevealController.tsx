'use client';

import { useEffect } from 'react';

/**
 * Entrada suave al hacer scroll para los elementos marcados con `data-reveal`.
 *
 * Mejora progresiva: el HTML del servidor llega visible. Recién al montar se
 * ocultan (con JS) los elementos que están debajo del primer pantallazo y se
 * revelan al entrar en vista. Sin IntersectionObserver no se oculta nada.
 *
 * Con `prefers-reduced-motion: reduce` también se revelan, pero el CSS quita el
 * desplazamiento y deja solo un fundido (ver globals.css).
 *
 * Atributos opcionales: `data-reveal-delay="120"` (ms) para escalonar.
 */
export default function RevealController() {
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const viewport = window.innerHeight;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          // Entra en vista, o ya quedó por encima (salto de ancla): se muestra y se deja de observar.
          if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
            el.setAttribute('data-reveal', 'shown');
            observer.unobserve(el);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    for (const el of els) {
      // Lo que ya está a la vista al cargar (o quedó arriba) no se anima.
      if (el.getBoundingClientRect().top < viewport * 0.92) continue;
      const delay = Number(el.dataset.revealDelay);
      if (delay) el.style.setProperty('--rd', `${delay}ms`);
      el.setAttribute('data-reveal', 'hidden');
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
