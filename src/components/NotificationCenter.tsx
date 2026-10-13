'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  X, 
  ExternalLink,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/utils/api';
import {
  descargarEnlaceExportacion,
  getEnlacesExportacion,
  triggerBlobDownload,
} from '@/utils/exportDownloads';
import { EVENTO_ENLACE_NOTIFICACION, resolverDestinoNotificacion } from '@/utils/notificationLinks';

const PREFIJO_DESCARGA = '#download-report:';

export default function NotificationCenter() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, currentUser } = useApp();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [descargandoId, setDescargandoId] = useState<string | null>(null);
  const [avisoDescarga, setAvisoDescarga] = useState<Record<string, string>>({});

  // Descarga del archivo de una exportación generada en segundo plano (US-RYI-05)
  const handleDescargarExportacion = async (notifId: string, actionUrl: string) => {
    if (descargandoId) return;
    const token = actionUrl.replace(PREFIJO_DESCARGA, '');
    const enlace = getEnlacesExportacion(currentUser?.id).find((e) => e.token === token);
    const seccionReportes = currentUser?.role === 'admin' ? 'Reportes e Informes' : 'Reportes';

    if (!enlace) {
      setAvisoDescarga((prev) => ({
        ...prev,
        [notifId]: `Este enlace ya no está disponible. Generá una nueva exportación desde ${seccionReportes}.`,
      }));
      return;
    }

    setDescargandoId(notifId);
    const resultado = await descargarEnlaceExportacion(enlace);
    setDescargandoId(null);

    const mensaje =
      resultado.estado === 'descargado'
        ? 'La descarga comenzó.'
        : resultado.estado === 'expirado'
          ? `El enlace expiró (24 horas). Generá uno nuevo desde ${seccionReportes} > Exportar.`
          : resultado.mensaje;
    setAvisoDescarga((prev) => ({ ...prev, [notifId]: mensaje }));
  };
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Exportación avisada por el backend: el enlace trae el token, no la fecha de vencimiento
  const handleDescargaBackend = async (notifId: string, token: string, rol: 'admin' | 'prestador') => {
    if (descargandoId) return;
    const guardado = getEnlacesExportacion(currentUser?.id).find((e) => e.token === token);
    setDescargandoId(notifId);
    try {
      if (guardado) {
        const resultado = await descargarEnlaceExportacion(guardado);
        if (resultado.estado !== 'descargado') {
          throw resultado.estado === 'expirado' ? new ApiError('expirado', 410) : new Error(resultado.mensaje);
        }
      } else {
        const { blob, filename } = await api.descargarExportacion(token, rol);
        triggerBlobDownload(blob, filename);
      }
      setAvisoDescarga((prev) => ({ ...prev, [notifId]: 'La descarga comenzó.' }));
    } catch (err) {
      const seccionReportes = rol === 'admin' ? 'Reportes e Informes' : 'Reportes';
      const mensaje =
        err instanceof ApiError && err.status === 410
          ? `El enlace expiró (24 horas). Generá uno nuevo desde ${seccionReportes} > Exportar.`
          : err instanceof Error
            ? err.message
            : 'No se pudo descargar el archivo.';
      setAvisoDescarga((prev) => ({ ...prev, [notifId]: mensaje }));
    } finally {
      setDescargandoId(null);
    }
  };

  const destinoDe = (notif: { actionUrl?: string | null; title: string }) =>
    resolverDestinoNotificacion(notif.actionUrl, currentUser?.role, notif.title);

  const handleNotificationClick = (notif: { id: string; actionUrl?: string | null; title: string }) => {
    const { id, actionUrl } = notif;
    markNotificationAsRead(id);

    if (actionUrl?.startsWith(PREFIJO_DESCARGA)) {
      void handleDescargarExportacion(id, actionUrl);
      return;
    }
    const destino = destinoDe(notif);
    // Aviso solo informativo: ya se lee completo en el panel, no hay pantalla a la que ir
    if (destino.tipo === 'ninguno') return;
    if (destino.tipo === 'descarga') {
      // La descarga se hace sin cerrar el panel, para mostrar cómo terminó
      void handleDescargaBackend(id, destino.token, destino.rol);
      return;
    }

    setIsOpen(false);
    if (destino.tipo === 'externa') {
      window.open(destino.href, '_blank');
    } else if (destino.href.split('?')[0] === window.location.pathname) {
      // Misma pantalla: solo cambia la query, así que se le avisa para que la procese
      window.history.pushState(null, '', destino.href);
      window.dispatchEvent(new Event(EVENTO_ENLACE_NOTIFICACION));
    } else {
      router.push(destino.href);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'validation':
        return <ShieldCheck className="h-4 w-4 text-accentWine" />;
      case 'review':
        return <MessageSquare className="h-4 w-4 text-fillPrimary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-fillSecondary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de Campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-textDark/70 hover:text-textDark hover:bg-black/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine cursor-pointer"
        aria-label="Abrir centro de notificaciones"
        title="Notificaciones y avisos"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accentWine px-1 text-[10px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-black/10 shadow-2xl z-50 overflow-hidden animate-fade-in font-wixText flex flex-col">
          {/* Header */}
          <div className="relative flex items-center justify-between px-5 py-3.5 overflow-hidden border-b border-black/5">
            <div className="absolute inset-0 bg-gradient-to-r from-accentWine/5 to-transparent pointer-events-none" />
            
            {/* Espaciador invisible para centrar exactamente el contenido con la X de la derecha */}
            <div className="w-7 h-7" />
            
            <div className="relative flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5">
                <Bell className="h-3.5 w-3.5 text-accentWine" />
                <h4 className="text-sm font-bold text-textDark font-wixDisplay leading-tight">Notificaciones</h4>
              </div>
              {unreadCount > 0 && (
                <p className="text-[11px] font-medium mt-1">
                  <span className="text-accentWine font-bold">{unreadCount} nuevas</span>
                </p>
              )}
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="relative p-1.5 rounded-lg text-textDark/40 hover:text-textDark hover:bg-black/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              aria-label="Cerrar notificaciones"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto divide-y divide-black/5">
            {notifications.length === 0 ? (
              <div className="px-8 py-10 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-bgPrimary text-textDark/40">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-textDark/80">Por acá todo tranquilo</p>
                  <p className="text-xs text-textDark/55">No tenés notificaciones pendientes.</p>
                </div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`relative px-5 py-4 transition-colors flex items-start gap-3 cursor-pointer ${
                    !notif.isRead ? 'bg-accentWine/[0.04] hover:bg-accentWine/[0.07]' : 'hover:bg-bgPrimary/40'
                  }`}
                >
                  <div
                    className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 border border-black/5 ${
                      notif.isRead ? 'bg-bgPrimary/60 opacity-70' : 'bg-white'
                    }`}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h5
                        className={`text-xs min-w-0 break-words ${
                          notif.isRead ? 'font-semibold text-textDark/70' : 'font-bold text-textDark'
                        }`}
                      >
                        {notif.title}
                      </h5>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-textDark/45 tabular-nums">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-accentWine" aria-label="No leída" />
                        )}
                      </div>
                    </div>
                    <p
                      className={`text-xs leading-relaxed break-words whitespace-pre-line ${
                        notif.isRead ? 'text-textDark/50' : 'text-textDark/70'
                      }`}
                    >
                      {notif.message}
                    </p>
                    {(() => {
                      const destino = destinoDe(notif);
                      if (destino.tipo === 'ninguno' && !notif.actionUrl?.startsWith(PREFIJO_DESCARGA)) return null;
                      return notif.actionUrl?.startsWith(PREFIJO_DESCARGA) || destino.tipo === 'descarga' ? (
                        <div className="pt-1 space-y-1">
                          <button
                            type="button"
                            disabled={descargandoId !== null}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notif);
                            }}
                            className="inline-flex items-center text-[11px] font-bold text-accentWine hover:underline cursor-pointer disabled:opacity-50"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            <span>{descargandoId === notif.id ? 'Descargando...' : 'Descargar archivo'}</span>
                          </button>
                          {avisoDescarga[notif.id] && (
                            <p className="text-[11px] text-textDark/70" role="status">
                              {avisoDescarga[notif.id]}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end pt-1.5">
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notif);
                            }}
                            className="inline-flex items-center text-[11px] font-bold text-accentWine hover:text-accentWine/80 hover:underline transition-colors cursor-pointer"
                          >
                            <span>Ver detalles</span>
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-black/5 p-2 bg-bgPrimary/20">
              <button
                onClick={markAllNotificationsAsRead}
                disabled={unreadCount === 0}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-fillPrimary hover:bg-black/5 transition-colors cursor-pointer disabled:cursor-default disabled:text-textDark/40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              >
                <CheckCheck className="h-4 w-4" />
                <span>{unreadCount > 0 ? 'Marcar todas como leídas' : 'Todas leídas'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
