'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/utils/api';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  KeyRound, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [isLoading, setIsLoading] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Validar el token con el backend al montar
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setIsTokenValid(false);
        setTokenError('No se proporcionó un token de recuperación en el enlace.');
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.validateRecoveryToken(token);
        if (res && res.valid !== false) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          setTokenError(res?.message || 'El enlace de recuperación es inválido o ha expirado.');
        }
      } catch (err: any) {
        setIsTokenValid(false);
        setTokenError(err.message || 'El enlace de recuperación es inválido o ha expirado.');
      } finally {
        setIsLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  // 2. Validaciones de la contraseña
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = hasMinLength && hasNumber && hasLetter && passwordsMatch;

  // 3. Envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.resetPassword({
        token,
        newPassword: password,
        confirmPassword: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error al restablecer la contraseña. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-accentWine border-t-transparent" />
        <p className="text-sm font-semibold text-textDark/70">Verificando enlace de recuperación...</p>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-6 text-center py-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-wixDisplay text-xl font-bold text-textDark">Enlace no válido o expirado</h3>
          <p className="text-xs text-textDark/70 max-w-sm mx-auto leading-relaxed">
            {tokenError || 'Por motivos de seguridad, los enlaces de recuperación tienen una validez temporal de 1 hora.'}
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-accentWine text-white rounded-xl text-xs font-bold shadow-md hover:bg-accentWine/90 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Volver a solicitar recuperación</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="space-y-6 text-center py-6 animate-fade-in">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200 shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h3 className="font-wixDisplay text-2xl font-bold text-textDark">¡Contraseña restablecida!</h3>
          <p className="text-xs text-textDark/70 max-w-sm mx-auto leading-relaxed">
            Tu contraseña ha sido actualizada con éxito. Ya podés iniciar sesión con tus nuevas credenciales.
          </p>
        </div>
        <div className="pt-4">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center py-3.5 px-6 bg-accentWine hover:bg-accentWine/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-accentWine/20 transition-all cursor-pointer"
          >
            <span>Iniciar sesión en ANDO</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h3 className="font-wixDisplay text-2xl font-bold text-textDark">Creá tu nueva contraseña</h3>
        <p className="text-xs text-textDark/70">
          Ingresá una clave segura que cumpla con los requisitos mínimos de la plataforma.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center space-x-2.5 p-3.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Campo: Nueva Contraseña */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-textDark">Nueva contraseña</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textDark/40" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/20 focus:border-accentWine transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textDark/40 hover:text-textDark/70 cursor-pointer"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Campo: Confirmar Contraseña */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-textDark">Confirmar nueva contraseña</label>
        <div className="relative">
          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-textDark/40" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repetí la contraseña"
            required
            className="w-full pl-10 pr-10 py-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/20 focus:border-accentWine transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textDark/40 hover:text-textDark/70 cursor-pointer"
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Requisitos Checklist */}
      <div className="p-3.5 rounded-xl bg-bgPrimary/40 border border-black/5 space-y-2 text-[11px]">
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-black/20'}`} />
          <span className={hasMinLength ? 'text-green-700 font-semibold' : 'text-textDark/60'}>
            Mínimo 8 caracteres
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${hasLetter && hasNumber ? 'bg-green-500' : 'bg-black/20'}`} />
          <span className={hasLetter && hasNumber ? 'text-green-700 font-semibold' : 'text-textDark/60'}>
            Contiene letras y números
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`h-2 w-2 rounded-full ${passwordsMatch ? 'bg-green-500' : 'bg-black/20'}`} />
          <span className={passwordsMatch ? 'text-green-700 font-semibold' : 'text-textDark/60'}>
            Las contraseñas coinciden
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full py-3.5 px-4 bg-accentWine hover:bg-accentWine/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-accentWine/20 transition-all cursor-pointer flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            <span>Guardar nueva contraseña</span>
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <Link href="/" className="text-xs font-semibold text-textDark/60 hover:text-textDark flex items-center justify-center space-x-1.5">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver al inicio de sesión</span>
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bgPrimary p-4 font-wixText">
      <div className="w-full max-w-md bg-white rounded-3xl border border-black/10 shadow-2xl p-8 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center justify-center space-x-2 pb-2 border-b border-black/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logotipoColor1.svg" alt="ANDO Mendoza" className="h-8 w-auto" />
        </div>

        <Suspense fallback={
          <div className="py-12 text-center text-xs text-textDark/60">
            Cargando formulario de restablecimiento...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
