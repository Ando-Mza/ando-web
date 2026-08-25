'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Users,
  BarChart3,
  FileText,
  HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import NotificationCenter from '@/components/NotificationCenter';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useApp();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Verificar autenticación real — sin auto-login mock
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
      if (!currentUser) {
        router.push('/');
      } else if (currentUser.role !== 'admin') {
        router.push('/');
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [currentUser, router]);

  if (!mounted || !currentUser) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-bgPrimary text-textDark">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accentWine border-t-transparent" />
          <p className="text-sm font-semibold text-textDark/80">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      name: 'Métricas y dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      desc: 'Métricas generales'
    },
    {
      name: 'Validación de contenido',
      path: '/admin/validation',
      icon: CheckSquare,
      desc: 'Auditoría de POIs y cuentas'
    },
    {
      name: 'Gestión de usuarios',
      path: '/admin/users',
      icon: Users,
      desc: 'Administración de cuentas'
    },
    {
      name: 'Reportes e informes',
      path: '/admin/reports',
      icon: BarChart3,
      desc: 'Estadísticas y exportación'
    },
    {
      name: 'Auditoría y LOGs',
      path: '/admin/logs',
      icon: FileText,
      desc: 'Trazabilidad de eventos'
    },
    {
      name: 'Configuración CYP',
      path: '/admin/settings',
      icon: Settings,
      desc: 'Categorías, etiquetas y APIs'
    },
    {
      name: 'Ayuda y soporte',
      path: '/admin/help',
      icon: HelpCircle,
      desc: 'Manuales y documentación'
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
          <Link href="/admin/dashboard" className="flex items-center space-x-2 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine focus-visible:ring-offset-2 rounded-lg">
            {isSidebarOpen ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/brand/logotipoColor1.svg" alt="ANDO" className="h-7 w-auto" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/brand/iconoClaro.svg" alt="ANDO" className="h-6 w-auto invert opacity-75" />
            )}
            {isSidebarOpen && (
              <span className="text-[10px] bg-accentWine/10 text-accentWine px-2 py-0.5 rounded-full font-semibold uppercase flex-shrink-0">
                Admin
              </span>
            )}
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden md:flex h-6 w-6 items-center justify-center rounded-md hover:bg-black/5 text-textDark/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine cursor-pointer"
            aria-label={isSidebarOpen ? "Colapsar menú lateral" : "Expandir menú lateral"}
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
                className={`group flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-accentWine text-white shadow-md shadow-accentWine/10'
                    : 'text-textDark/70 hover:text-textDark hover:bg-black/5'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-textDark/50 group-hover:text-textDark'
                }`} />
                {isSidebarOpen && (
                  <div className="flex flex-col text-left">
                    <span>{item.name}</span>
                    <span className={`text-[10px] font-normal ${isActive ? 'text-white/80' : 'text-textDark/50'}`}>
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
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold text-textDark/70 hover:text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all duration-200 cursor-pointer ${
              !isSidebarOpen && 'px-0'
            }`}
          >
            <LogOut className="h-4 w-4" />
            {isSidebarOpen && <span>Cerrar sesión</span>}
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
              {menuItems.find(item => item.path === pathname)?.name || 'Panel de administración'}
            </h2>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <NotificationCenter />
            <div className="h-6 w-px bg-black/10" />
            <div className="flex items-center space-x-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-textDark">{currentUser.name}</p>
                <p className="text-[10px] text-textDark/60 font-medium">Administrador de sistemas</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-accentWine text-white flex items-center justify-center font-semibold text-sm uppercase">
                {currentUser.name ? currentUser.name.slice(0, 2) : 'AD'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal (US-ACC-05) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/5 animate-scale-up space-y-4">
            <div className="flex items-center space-x-2.5 text-accentWine">
              <LogOut className="h-5 w-5" />
              <h4 className="font-wixDisplay font-bold text-textDark">Cerrar sesión</h4>
            </div>
            <p className="text-xs text-textDark/70 leading-relaxed">
              ¿Está seguro de que desea cerrar la sesión? Deberá iniciar sesión nuevamente para acceder a su panel de gestión.
            </p>
            <div className="flex space-x-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 text-textDark/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 cursor-pointer"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
