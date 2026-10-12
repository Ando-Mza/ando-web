'use client';

import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export interface GuidedTourStop {
  /** Valor del atributo data-tour del elemento a señalar */
  target: string;
  title: string;
  text: string;
}

interface GuidedTourProps {
  isOpen: boolean;
  stops: GuidedTourStop[];
  /** Se recorrieron todos los puntos (o no había ninguno visible) */
  onFinish: () => void;
  /** El usuario eligió omitir el recorrido */
  onSkip: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const HOLE_PADDING = 6;
const CARD_WIDTH = 320;
const CARD_GAP = 16;
const VIEWPORT_MARGIN = 16;

function findTarget(target: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
}

/**
 * Recorrido guiado del onboarding (US-AYS-04): oscurece la pantalla y señala, de a uno,
 * los elementos reales del panel con un cartel que explica qué se puede hacer en cada uno.
 */
export default function GuidedTour({ isOpen, stops, onFinish, onSkip }: GuidedTourProps) {
  const [visibleStops, setVisibleStops] = useState<GuidedTourStop[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  // Solo se recorren los elementos que están en pantalla en este momento
  useEffect(() => {
    if (!isOpen) {
      setVisibleStops(null);
      setIndex(0);
      setRect(null);
      return;
    }
    const found = stops.filter((stop) => {
      const el = findTarget(stop.target);
      return !!el && el.getClientRects().length > 0;
    });
    if (found.length === 0) {
      onFinish();
      return;
    }
    setVisibleStops(found);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const current = visibleStops?.[Math.min(index, (visibleStops?.length ?? 1) - 1)] ?? null;

  const measure = useCallback(() => {
    if (!current) return;
    const el = findTarget(current.target);
    if (!el) return;
    const box = el.getBoundingClientRect();
    setRect({ top: box.top, left: box.left, width: box.width, height: box.height });
  }, [current]);

  useLayoutEffect(() => {
    if (!current) return;
    findTarget(current.target)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [current, measure]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onSkip]);

  if (!isOpen || !visibleStops || !current || !rect) return null;

  const isLast = index >= visibleStops.length - 1;
  const hole = {
    top: rect.top - HOLE_PADDING,
    left: rect.left - HOLE_PADDING,
    width: rect.width + HOLE_PADDING * 2,
    height: rect.height + HOLE_PADDING * 2,
  };

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const cardWidth = Math.min(CARD_WIDTH, viewportW - VIEWPORT_MARGIN * 2);

  // El cartel va a la derecha del elemento si hay lugar (menú lateral); si no, debajo o arriba
  const fitsRight = hole.left + hole.width + CARD_GAP + cardWidth <= viewportW - VIEWPORT_MARGIN;
  const placeBelow = hole.top + hole.height / 2 < viewportH / 2;

  const cardStyle: React.CSSProperties = { width: cardWidth };
  const arrowStyle: React.CSSProperties = {};

  if (fitsRight) {
    const top = Math.min(Math.max(hole.top, VIEWPORT_MARGIN), Math.max(viewportH - 220, VIEWPORT_MARGIN));
    cardStyle.left = hole.left + hole.width + CARD_GAP;
    cardStyle.top = top;
    arrowStyle.left = -7;
    arrowStyle.top = Math.min(Math.max(hole.top + hole.height / 2 - top - 7, 14), 150);
  } else {
    const left = Math.min(
      Math.max(hole.left + hole.width / 2 - cardWidth / 2, VIEWPORT_MARGIN),
      viewportW - cardWidth - VIEWPORT_MARGIN
    );
    cardStyle.left = left;
    if (placeBelow) {
      cardStyle.top = hole.top + hole.height + CARD_GAP;
      arrowStyle.top = -7;
    } else {
      cardStyle.bottom = viewportH - hole.top + CARD_GAP;
      arrowStyle.bottom = -7;
    }
    arrowStyle.left = Math.min(Math.max(hole.left + hole.width / 2 - left - 7, 18), cardWidth - 32);
  }

  return (
    <div className="fixed inset-0 z-[70] font-wixText" role="dialog" aria-modal="true" aria-label="Recorrido por el panel">
      {/* Capa que bloquea los clics fuera del cartel */}
      <div className="absolute inset-0" />

      {/* Foco sobre el elemento: el resto de la pantalla se oscurece con la sombra */}
      <div
        className="absolute rounded-2xl border-2 border-white pointer-events-none transition-all duration-200"
        style={{ ...hole, boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)' }}
      />

      <div
        className="absolute bg-white rounded-2xl shadow-2xl border border-black/10 p-5 space-y-3 transition-all duration-200"
        style={cardStyle}
      >
        <div className="absolute w-3.5 h-3.5 bg-white rotate-45" style={arrowStyle} />

        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-accentWine">
            {index + 1} de {visibleStops.length}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="text-xs font-semibold text-textDark/50 hover:text-textDark px-2 py-0.5 rounded-full hover:bg-black/5 cursor-pointer"
          >
            Omitir
          </button>
        </div>

        <div className="space-y-1">
          <h3 className="font-wixDisplay text-base font-bold text-textDark">{current.title}</h3>
          <p className="text-xs text-textDark/70 leading-relaxed">{current.text}</p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setIndex((prev) => Math.max(prev - 1, 0))}
            disabled={index === 0}
            className={`flex items-center space-x-1 px-2 py-2 rounded-xl text-xs font-bold text-textDark hover:bg-black/5 cursor-pointer ${
              index === 0 ? 'invisible' : ''
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => (isLast ? onFinish() : setIndex((prev) => prev + 1))}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-accentWine text-white text-xs font-bold shadow-md hover:bg-accentWine/90 cursor-pointer"
          >
            <span>{isLast ? 'Listo' : 'Siguiente'}</span>
            {isLast ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
