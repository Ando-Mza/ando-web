'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Shield, Store, Loader2, Sparkles, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useApp();
  
  const [role, setRole] = useState<'admin' | 'provider'>('admin');
  const [email, setEmail] = useState('sofia.romero@ando.com');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const handleRoleChange = (newRole: 'admin' | 'provider') => {
    setRole(newRole);
    setError('');
    if (newRole === 'admin') {
      setEmail('sofia.romero@ando.com');
    } else {
      setEmail('santiago@catenazapata.com.ar');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Simular latencia de red para efecto de UI premium
    setTimeout(() => {
      const success = login(role);
      setIsLoading(false);
      
      if (success) {
        if (role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/provider/dashboard');
        }
      } else {
        setError('Credenciales inválidas. Inténtelo de nuevo.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }, 1200);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bgPrimary px-4 py-12 sm:px-6 lg:px-8">
      {/* Background Ornaments (Aesthetic Soft Blobs) */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-fillPrimary/5 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-accentPurple/5 blur-[120px]" />
      
      <div className="w-full max-w-lg z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="inline-flex items-center justify-center space-x-2 bg-accentWine/5 text-accentWine px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-sm border border-accentWine/10">
            <Sparkles className="h-3.5 w-3.5 text-fillSecondary" />
            <span>PFC - UTN FRM 2026</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight font-unbounded text-accentWine md:text-5xl">
            ANDO<span className="text-fillPrimary">.</span>
          </h1>
          <p className="mt-2 text-sm text-textDark/60 max-w-sm font-wixText">
            Portal de Gestión y Administración Turística Inteligente del Gran Mendoza
          </p>
        </div>

        {/* Login Box */}
        <div 
          className={`bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-8 sm:p-10 transition-transform duration-300 ${
            shake ? 'animate-bounce' : ''
          }`}
          style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
        >
          {/* Custom shake keyframe style */}
          {shake && (
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                20%, 40%, 60%, 80% { transform: translateX(6px); }
              }
            `}} />
          )}

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-bgPrimary/80 rounded-xl border border-black/5 mb-8">
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'admin'
                  ? 'bg-accentWine text-white shadow-sm scale-[1.02]'
                  : 'text-textDark/60 hover:text-textDark hover:bg-black/5'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Administrador</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange('provider')}
              className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                role === 'provider'
                  ? 'bg-fillPrimary text-white shadow-sm scale-[1.02]'
                  : 'text-textDark/60 hover:text-textDark hover:bg-black/5'
              }`}
            >
              <Store className="h-4 w-4" />
              <span>Prestador</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white/50 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all duration-200 text-sm"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70">
                  Contraseña
                </label>
                <span className="text-xs text-fillSecondary hover:underline cursor-pointer">
                  ¿Olvidó su contraseña?
                </span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border border-black/10 bg-white/50 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all duration-200 text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 border border-red-200 text-xs px-4 py-3 rounded-lg font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ${
                role === 'admin'
                  ? 'bg-accentWine hover:bg-accentWine/95 hover:shadow-accentWine/20'
                  : 'bg-fillPrimary hover:bg-fillPrimary/95 hover:shadow-fillPrimary/20'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Iniciando Sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Portal</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Preset details for easy evaluation */}
          <div className="mt-8 pt-6 border-t border-black/5 text-center text-xs text-textDark/50">
            {role === 'admin' ? (
              <p>Módulo de Control y Parámetros (CYP) e información agregada (GIT)</p>
            ) : (
              <p>Módulo de Carga y Modificación de Horarios (GIT) y subida multimedia</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
