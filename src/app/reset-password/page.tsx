'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/utils/api';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [validationError, setValidationError] = useState('');

  const [passwordNueva, setPasswordNueva] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [shake, setShake] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setTokenValid(false);
      setValidationError('No se proporcionó ningún token de recuperación en el enlace.');
      return;
    }

    const validate = async () => {
      try {
        const response = await api.validatePasswordRecoveryToken(token);
        if (response && response.valid) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setValidationError(response?.message || 'El enlace de recuperación no es válido.');
        }
      } catch (err: any) {
        setTokenValid(false);
        setValidationError(err.message || 'El enlace de recuperación expiró o ya no es válido.');
      } finally {
        setIsValidating(false);
      }
    };

    validate();
  }, [token]);

  // Password policy checks matching backend
  const hasMinLength = passwordNueva.length >= 8 && passwordNueva.length <= 12;
  const hasUppercase = /[A-Z]/.test(passwordNueva);
  const hasNumber = /[0-9]/.test(passwordNueva);
  const hasSpecial = /[^A-Za-z0-9]/.test(passwordNueva);
  const passwordsMatch = passwordNueva !== '' && passwordNueva === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!hasMinLength) {
      newErrors.push('La contraseña debe tener entre 8 y 12 caracteres.');
    }
    if (!hasUppercase) {
      newErrors.push('La contraseña debe incluir al menos una letra mayúscula.');
    }
    if (!hasNumber) {
      newErrors.push('La contraseña debe incluir al menos un número.');
    }
    if (!hasSpecial) {
      newErrors.push('La contraseña debe incluir al menos un carácter especial.');
    }
    if (passwordNueva !== confirmPassword) {
      newErrors.push('Las contraseñas no coinciden.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    try {
      await api.resetPasswordWithToken({
        token,
        passwordNueva,
        confirmPassword,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrors([err.message || 'Ocurrió un error al restablecer la contraseña. Inténtalo nuevamente.']);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bgPrimary px-4 py-12 sm:px-6 lg:px-8 font-wixText">
      {/* Background ambient blobs */}
      <div className="absolute top-10 left-10 h-[400px] w-[400px] rounded-full bg-fillPrimary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-accentPurple/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logotipoColor1.svg" alt="ANDO" className="h-16 w-auto mb-2" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-accentWine/75">
            Recuperación de Cuenta
          </p>
        </div>

        {/* Card Container */}
        <div
          className="bg-white rounded-3xl shadow-xl border border-black/5 p-6 sm:p-8 transition-all duration-300"
          style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
        >
          {shake && (
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                20%, 40%, 60%, 80% { transform: translateX(6px); }
              }
            `,
              }}
            />
          )}

          {/* 1. ESTADO: VALIDANDO TOKEN */}
          {isValidating && (
            <div className="text-center py-10 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-fillPrimary mx-auto" />
              <p className="text-xs text-textDark/70 font-medium">
                Validando enlace de recuperación...
              </p>
            </div>
          )}

          {/* 2. ESTADO: TOKEN INVÁLIDO O EXPIRADO */}
          {!isValidating && !tokenValid && !isSuccess && (
            <div className="text-center py-4 space-y-5">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
                <AlertTriangle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-accentWine font-wixDisplay">
                  Enlace no disponible
                </h3>
                <p className="text-xs text-textDark/70 leading-relaxed">
                  {validationError ||
                    'Este enlace de recuperación no es válido, ha expirado (30 min) o ya fue utilizado.'}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full py-3 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Volver a solicitar recuperación</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. ESTADO: ÉXITO AL RESTABLECER */}
          {isSuccess && (
            <div className="text-center py-4 space-y-5">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200">
                <Check className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-accentWine font-wixDisplay">
                  ¡Contraseña Actualizada!
                </h3>
                <p className="text-xs text-textDark/70 leading-relaxed">
                  Tu nueva contraseña ha sido guardada con éxito. Ya podés iniciar sesión con tus
                  nuevas credenciales.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="w-full py-3 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Ir al Inicio de Sesión</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* 4. ESTADO: FORMULARIO DE NUEVA CONTRASEÑA */}
          {!isValidating && tokenValid && !isSuccess && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-fillPrimary/10 text-fillPrimary mb-2">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-accentWine font-wixDisplay">
                  Establecer Nueva Contraseña
                </h2>
                <p className="text-xs text-textDark/70 mt-1">
                  Ingresá tu nueva clave de acceso para tu cuenta de Ando.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nueva Contraseña */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5 pl-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-textDark/40" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordNueva}
                      onChange={(e) => setPasswordNueva(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-black/10 bg-white/50 focus:ring-2 focus:ring-fillPrimary/10 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                      placeholder="Nueva contraseña (8 a 12 caracteres)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-textDark/40 hover:text-textDark cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar Contraseña */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5 pl-1">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-textDark/40" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-black/10 bg-white/50 focus:ring-2 focus:ring-fillPrimary/10 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                      placeholder="Repetir nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-textDark/40 hover:text-textDark cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Checklist de Requisitos de Seguridad */}
                <div className="p-3 bg-bgPrimary/60 border border-black/5 rounded-2xl text-[10px] text-textDark/70 space-y-1.5">
                  <p className="font-bold text-accentWine mb-1 flex items-center space-x-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Requisitos de seguridad:</span>
                  </p>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={hasMinLength ? 'text-green-600 font-bold' : 'text-textDark/35'}
                    >
                      {hasMinLength ? '✓' : '●'}
                    </span>
                    <span>Entre 8 y 12 caracteres (Llevas {passwordNueva.length})</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={hasUppercase ? 'text-green-600 font-bold' : 'text-textDark/35'}
                    >
                      {hasUppercase ? '✓' : '●'}
                    </span>
                    <span>Al menos una letra MAYÚSCULA</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={hasNumber ? 'text-green-600 font-bold' : 'text-textDark/35'}
                    >
                      {hasNumber ? '✓' : '●'}
                    </span>
                    <span>Al menos un número (0-9)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={hasSpecial ? 'text-green-600 font-bold' : 'text-textDark/35'}
                    >
                      {hasSpecial ? '✓' : '●'}
                    </span>
                    <span>Al menos un carácter especial (@, #, $, !, etc.)</span>
                  </div>
                  {confirmPassword.length > 0 && (
                    <div className="flex items-center space-x-1.5">
                      <span
                        className={
                          passwordsMatch ? 'text-green-600 font-bold' : 'text-red-500 font-bold'
                        }
                      >
                        {passwordsMatch ? '✓' : '✗'}
                      </span>
                      <span>
                        {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Banner de Errores */}
                {errors.length > 0 && (
                  <div className="bg-red-50 text-red-600 border border-red-150 text-[11px] p-3 rounded-xl font-medium space-y-1">
                    {errors.map((err, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Botón de Enviar */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Guardando contraseña...</span>
                    </>
                  ) : (
                    <>
                      <span>Restablecer y Guardar Contraseña</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bgPrimary">
          <Loader2 className="h-8 w-8 animate-spin text-fillPrimary" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
