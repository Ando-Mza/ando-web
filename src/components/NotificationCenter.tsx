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
  ExternalLink 
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationCenter() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  const handleNotificationClick = (id: string, actionUrl?: string | null) => {
    markNotificationAsRead(id);
    if (actionUrl) {
      setIsOpen(false);
      router.push(actionUrl);
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
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/5">
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-textDark font-wixDisplay leading-tight">Notificaciones</h4>
              <p className="text-[11px] text-textDark/55 mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} sin leer`
                  : notifications.length > 0
                    ? 'Estás al día'
                    : 'Sin novedades'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-textDark/50 hover:text-textDark hover:bg-black/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine"
              aria-label="Cerrar notificaciones"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-black/5">
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
                  onClick={() => handleNotificationClick(notif.id, notif.actionUrl)}
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
                        className={`text-xs truncate ${
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
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        notif.isRead ? 'text-textDark/50' : 'text-textDark/70'
                      }`}
                    >
                      {notif.message}
                    </p>
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={(e) => {
                          e.stopPropagation();
                          markNotificationAsRead(notif.id);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center text-[11px] font-bold text-accentWine hover:underline pt-1"
                      >
                        <span>Ver detalles</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    )}
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
