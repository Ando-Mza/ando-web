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

export default function NotificationCenter() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useApp();
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
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-white border border-black/10 shadow-2xl z-50 overflow-hidden animate-fade-in font-wixText">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/5 bg-bgPrimary/30">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-textDark/80" />
              <h4 className="text-xs font-bold text-textDark font-wixDisplay">Notificaciones</h4>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-accentWine/10 text-accentWine font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-semibold text-fillPrimary hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-0.5" />
                <span>Marcar todas</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-black/5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-bgPrimary text-textDark/40">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs font-medium text-textDark/60">No tenés notificaciones pendientes.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`p-4 transition-colors flex items-start space-x-3 cursor-pointer hover:bg-bgPrimary/40 ${
                    !notif.isRead ? 'bg-accentWine/[0.02] border-l-2 border-accentWine' : 'opacity-75'
                  }`}
                >
                  <div className="mt-0.5 p-1.5 rounded-lg bg-bgPrimary flex-shrink-0 border border-black/5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-textDark truncate">{notif.title}</h5>
                      <span className="text-[10px] text-textDark/50">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-textDark/70 leading-relaxed line-clamp-2">{notif.message}</p>
                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
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
        </div>
      )}
    </div>
  );
}
