'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ExternalLink, Globe, Loader2, MapPin, Phone, Star, X } from 'lucide-react';
import { api } from '@/utils/api';

interface Props {
  poiId: string;
  stats?: { visitados: number; guardados: number };
  onClose: () => void;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type RawPoi = any;

function pickName(value: any, fallback = ''): string {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.nombre || value.name || fallback;
}

function toExternalUrl(raw: string): string {
  const url = String(raw).trim();
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export default function PoiQuickViewModal({ poiId, stats, onClose }: Props) {
  const router = useRouter();
  const [poi, setPoi] = useState<RawPoi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .getAdminPoiRevisionDetail(poiId)
      .then((res) => {
        if (!cancelled) setPoi(res);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [poiId, reloadKey]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const retry = () => {
    setLoading(true);
    setError(false);
    setReloadKey((k) => k + 1);
  };

  const cats: string[] = Array.isArray(poi?.categorias ?? poi?.categoriasPoi)
    ? (poi.categorias ?? poi.categoriasPoi)
        .map((c: any) => pickName(c?.categoria ?? c))
        .filter(Boolean)
    : [];
  const images: string[] = Array.isArray(poi?.imagenes)
    ? poi.imagenes.map((i: any) => (typeof i === 'string' ? i : i.url || i.urlPublica || '')).filter(Boolean)
    : poi?.imagenPrincipalUrl
      ? [poi.imagenPrincipalUrl]
      : [];
  const rating = poi?.puntuacionPromedio ?? poi?.rating;
  const estado = pickName(poi?.estado);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Ficha del negocio"
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-black/5 p-5">
          <div>
            {cats.length > 0 && (
              <p className="text-xs font-bold uppercase tracking-wider text-textDark/50">{cats.join(' · ')}</p>
            )}
            <h3 className="font-wixDisplay text-xl font-bold text-textDark">
              {loading ? 'Cargando...' : pickName(poi?.nombre ?? poi?.name, 'Negocio')}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="cursor-pointer rounded-lg p-1.5 text-textDark/60 hover:bg-black/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-accentWine" />
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center space-y-3 py-12 text-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <p className="text-sm font-medium text-red-800">No se pudo cargar la ficha del negocio.</p>
              <button
                onClick={retry}
                className="cursor-pointer rounded-xl bg-accentWine px-5 py-2.5 text-xs font-bold text-white hover:opacity-90"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && poi && (
            <>
              {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.slice(0, 5).map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={src}
                      alt=""
                      className="h-40 w-auto flex-none rounded-xl object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats && (
                  <>
                    <div className="rounded-xl bg-blue-50 p-3">
                      <p className="text-xs text-blue-700">Visitados</p>
                      <p className="text-lg font-bold text-blue-900">{stats.visitados}</p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-3">
                      <p className="text-xs text-amber-700">Guardados</p>
                      <p className="text-lg font-bold text-amber-900">{stats.guardados}</p>
                    </div>
                  </>
                )}
                {rating != null && (
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs text-emerald-700">Puntuación</p>
                    <p className="flex items-center gap-1 text-lg font-bold text-emerald-900">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {Number(rating).toFixed(1)}
                    </p>
                  </div>
                )}
                {estado && (
                  <div className="rounded-xl bg-violet-50 p-3">
                    <p className="text-xs text-violet-700">Estado</p>
                    <p className="text-lg font-bold capitalize text-violet-900">{estado}</p>
                  </div>
                )}
              </div>

              {(poi.descripcion || poi.description) && (
                <p className="whitespace-pre-wrap text-sm text-textDark/80">{poi.descripcion || poi.description}</p>
              )}

              <ul className="space-y-2 text-sm text-textDark/80">
                {(poi.direccion || poi.address) && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-none text-textDark/50" />
                    {poi.direccion || poi.address}
                  </li>
                )}
                {(poi.telefono || poi.phone) && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-none text-textDark/50" />
                    {poi.telefono || poi.phone}
                  </li>
                )}
                {(poi.sitioWeb || poi.website) && (
                  <li className="flex items-center gap-2">
                    <Globe className="h-4 w-4 flex-none text-textDark/50" />
                    <button
                      type="button"
                      onClick={() => window.open(toExternalUrl(poi.sitioWeb || poi.website), '_blank', 'noopener,noreferrer')}
                      title="Abrir sitio web en una pestaña nueva"
                      className="cursor-pointer break-all text-left text-blue-600 transition-opacity hover:opacity-60"
                    >
                      {poi.sitioWeb || poi.website}
                    </button>
                  </li>
                )}
              </ul>
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-black/5 p-4">
          <button
            type="button"
            onClick={() => router.push('/admin/validation')}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-accentWine px-4 py-2.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
          >
            <ExternalLink className="h-4 w-4" />
            Ir a Catálogo y Validación
          </button>
        </div>
      </div>
    </div>
  );
}
