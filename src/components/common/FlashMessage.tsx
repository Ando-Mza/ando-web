'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Lock, X } from 'lucide-react';

const FLASH_KEY = 'ando_flash_message';

/** Deja un aviso para mostrar en la próxima pantalla (por ejemplo, tras una redirección). */
export function setFlashMessage(message: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(FLASH_KEY, message);
  } catch {
    // Almacenamiento no disponible: la redirección se hace igual
  }
}

export const MENSAJE_SIN_PERMISOS = 'No tenés permisos para acceder a esta sección';

/**
 * Muestra una sola vez el aviso pendiente, si lo hay. Vive en el layout raíz para que
 * el aviso siga visible aunque la redirección pase por más de una pantalla.
 */
export default function FlashMessage() {
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(FLASH_KEY);
      if (pending) {
        setMessage(pending);
        sessionStorage.removeItem(FLASH_KEY);
      }
    } catch {
      // Ignorar
    }
  }, [pathname]);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 8000);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md bg-white border border-red-200 shadow-2xl rounded-2xl p-4 flex items-start space-x-3 font-wixText animate-fade-in"
    >
      <div className="p-2 rounded-xl bg-red-50 text-red-600 flex-shrink-0">
        <Lock className="h-4 w-4" />
      </div>
      <p className="flex-1 text-xs font-bold text-textDark pt-1.5">{message}</p>
      <button
        type="button"
        onClick={() => setMessage(null)}
        aria-label="Cerrar aviso"
        className="p-1.5 text-textDark/50 hover:text-textDark hover:bg-black/5 rounded-lg cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
