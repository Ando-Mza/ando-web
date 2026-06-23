'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  LogOut, 
  Bell,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, login } = useApp();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Asegurar que el usuario esté autenticado para facilitar pruebas
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      if (!currentUser) {
        // Auto-login de administrador si se entra directamente a la ruta para evitar redirecciones molestas en desarrollo
        const logged = login('admin');
        if (!logged) {
          router.push('/');
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentUser, login, router]);

  if (!mounted || !currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bgPrimary text-textDark">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentWine border-t-transparent" />
          <p className="text-sm font-semibold">Cargando panel de administrador...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Métricas & Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      desc: 'Métricas y logs globales'
    },
    {
      name: 'Validación de Contenido',
      path: '/admin/validation',
      icon: CheckSquare,
      desc: 'Auditoría de POIs y horarios'
    },
    {
      name: 'Configuración CYP',
      path: '/admin/settings',
      icon: Settings,
      desc: 'Parámetros, traducción e integraciones'
    }
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-bgPrimary font-wixText">
      {/* Sidebar - Desktop */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-20 flex flex-col bg-white border-r border-black/5 transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand/Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-black/5">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <span className="font-unbounded text-xl font-bold tracking-tight text-accentWine">
              ANDO{isSidebarOpen && <span className="text-fillPrimary">.</span>}
            </span>
            {isSidebarOpen && (
              <span className="text-[10px] bg-accentPurple/10 text-accentPurple px-2 py-0.5 rounded-full font-semibold uppercase">
                Admin
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 px-3 py-6">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-accentWine text-white shadow-md shadow-accentWine/10'
                    : 'text-textDark/60 hover:text-textDark hover:bg-black/5'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-textDark/50 group-hover:text-textDark'
                }`} />
                {isSidebarOpen && (
                  <div className="flex flex-col text-left">
                    <span>{item.name}</span>
                    <span className={`text-[10px] font-normal ${isActive ? 'text-white/70' : 'text-textDark/40'}`}>
                      {item.desc}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-black/5">
          {isSidebarOpen ? (
            <div className="bg-bgPrimary/80 rounded-xl p-3 border border-black/5 mb-3">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-full bg-accentWine/10 text-accentWine flex items-center justify-center font-bold">
                  SR
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-textDark truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-textDark/50 truncate">sofia.romero@ando.com</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="h-9 w-9 rounded-full bg-accentWine/10 text-accentWine flex items-center justify-center font-bold">
                SR
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer ${
              !isSidebarOpen && 'px-0'
            }`}
          >
            <LogOut className="h-4 w-4" />
            {isSidebarOpen && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div 
        className={`flex flex-col flex-1 min-w-0 transition-all duration-300 ${
          isSidebarOpen ? 'pl-64' : 'pl-20'
        }`}
      >
        {/* Top Header */}
        <header className="flex h-16 items-center justify-between px-8 bg-white border-b border-black/5 sticky top-0 z-10">
          <div className="flex items-center">
            <h2 className="font-wixDisplay text-lg font-bold text-accentWine">
              {menuItems.find(item => item.path === pathname)?.name || 'Panel Administrador'}
            </h2>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <button className="relative p-2 rounded-lg hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-fillPrimary animate-pulse" />
            </button>
            <div className="h-6 w-px bg-black/10" />
            <div className="flex items-center space-x-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-textDark">{currentUser.name}</p>
                <p className="text-[10px] text-textDark/50">Administrador de Sistemas</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accentWine text-white flex items-center justify-center font-semibold text-sm">
                S
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
