'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/utils/api';
import {
  Store,
  Loader2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  Briefcase,
  FileText,
  Key
} from 'lucide-react';

type SubView = 'login' | 'register' | 'forgot_password' | 'recovery_sent' | 'reset_password' | 'registration_pending';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredentials, registerProvider, users, updateProviderProfile } = useApp();

  // Navigation & Subview
  const [subView, setSubView] = useState<SubView>('login');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [shake, setShake] = useState(false);

  // Register Form States
  const [regNombre, setRegNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regFechaNacimiento, setRegFechaNacimiento] = useState('');
  const [regEmpresa, setRegEmpresa] = useState('');
  const [regCuit, setRegCuit] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regTermsAccepted, setRegTermsAccepted] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regErrors, setRegErrors] = useState<string[]>([]);
  const [newlyRegisteredEmail, setNewlyRegisteredEmail] = useState('');

  // Password Recovery States
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetConfirmPasswordVal, setResetConfirmPasswordVal] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [resetErrors, setResetErrors] = useState<string[]>([]);
  const [recoveryUserEmail, setRecoveryUserEmail] = useState('');

  // Cooldown timer for resending recovery email
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const changeView = (newView: SubView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSubView(newView);
      setIsTransitioning(false);
    }, 180);
  };

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      const response = await loginWithCredentials(loginEmail, loginPassword);
      setIsLoading(false);

      if (response.success) {
        if (response.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/provider/dashboard');
        }
      } else {
        setLoginError(response.error || 'Credenciales inválidas. Inténtelo de nuevo.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setIsLoading(false);
      setLoginError(err.message || 'Error al iniciar sesión.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // Helper validation functions
  const validateEmailFormat = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateCuitFormat = (cuit: string) => /^\d{11}$/.test(cuit.replace(/[-]/g, ''));
  const validatePasswordStrength = (pwd: string) =>
    pwd.length >= 8 && pwd.length <= 12 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd) && /[^A-Za-z0-9]/.test(pwd);

  const calculateAge = (birthDateString: string) => {
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    // Fields check
    if (!regNombre.trim() || !regApellido.trim() || !regEmail.trim() || !regTelefono.trim() ||
      !regFechaNacimiento.trim() || !regEmpresa.trim() || !regCuit.trim() || !regPassword || !regConfirmPassword) {
      errors.push('Todos los campos son obligatorios.');
    }
    if (!validateEmailFormat(regEmail)) {
      errors.push('Por favor, ingresa un correo electrónico válido.');
    }
    if (!validateCuitFormat(regCuit)) {
      errors.push('El CUIT debe contener exactamente 11 números.');
    }
    if (regFechaNacimiento && calculateAge(regFechaNacimiento) < 18) {
      errors.push('Debes tener al menos 18 años para registrarte como prestador.');
    }
    if (!validatePasswordStrength(regPassword)) {
      errors.push('La contraseña debe tener entre 8 y 12 caracteres, incluir al menos una mayúscula, un número y un carácter especial.');
    }
    if (regPassword !== regConfirmPassword) {
      errors.push('Las contraseñas no coinciden.');
    }
    if (!regTermsAccepted) {
      errors.push('Debes aceptar los Términos y Condiciones.');
    }

    if (errors.length > 0) {
      setRegErrors(errors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setRegErrors([]);
    setIsLoading(true);

    try {
      const response = await registerProvider({
        name: `${regNombre.trim()} ${regApellido.trim()}`,
        email: regEmail.trim(),
        businessName: regEmpresa.trim(),
        phone: regTelefono.trim(),
        cuit: regCuit.trim(),
        birthDate: regFechaNacimiento.trim(),
        password: regPassword,
      });

      setIsLoading(false);

      if (response.success) {
        setNewlyRegisteredEmail(regEmail.trim());
        changeView('registration_pending');
      } else {
        setRegErrors([response.error || 'Ocurrió un error al registrar la cuenta.']);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } catch (err: any) {
      setIsLoading(false);
      setRegErrors([err.message || 'Ocurrió un error al registrar la cuenta.']);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // 3. RECOVERY HANDLER (Llamada real a la API del backend)
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');

    if (!recoveryEmail.trim() || !validateEmailFormat(recoveryEmail)) {
      setRecoveryError('Por favor, ingresa un correo válido.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    try {
      await api.requestPasswordRecovery(recoveryEmail.trim());
      setIsLoading(false);
      setRecoveryUserEmail(recoveryEmail.trim());
      changeView('recovery_sent');
      setCooldown(30);
    } catch (err: any) {
      setIsLoading(false);
      setRecoveryError(err.message || 'Error al procesar la solicitud de recuperación.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // 4. RESET PASSWORD HANDLER
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!validatePasswordStrength(resetPasswordVal)) {
      errors.push('La contraseña debe tener entre 8 y 12 caracteres, incluir una mayúscula, un número y un carácter especial.');
    }
    if (resetPasswordVal !== resetConfirmPasswordVal) {
      errors.push('Las contraseñas no coinciden.');
    }

    if (errors.length > 0) {
      setResetErrors(errors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
      setIsLoading(false);
      const targetUser = users.find(u => u.email.toLowerCase() === recoveryUserEmail.toLowerCase());
      if (targetUser) {
        const res = await updateProviderProfile(targetUser.id, { password: resetPasswordVal });
        if (res.success) {
          // Success reset
          alert('Contraseña actualizada con éxito. Ya puedes iniciar sesión.');
          changeView('login');
          setLoginEmail(recoveryUserEmail);
          setLoginPassword(resetPasswordVal);
          setResetPasswordVal('');
          setResetConfirmPasswordVal('');
          setResetErrors([]);
        } else {
          setResetErrors([res.error || 'Ocurrió un error al restablecer la contraseña.']);
        }
      } else {
        alert('Contraseña restablecida con éxito. Ya puedes iniciar sesión.');
        changeView('login');
        setLoginEmail(recoveryUserEmail);
        setLoginPassword(resetPasswordVal);
        setResetPasswordVal('');
        setResetConfirmPasswordVal('');
        setResetErrors([]);
      }
    }, 1200);
  };

  // Developer quick-approve for testing registration
  const handleSimulatedApproval = () => {
    const targetUser = users.find(u => u.email.toLowerCase() === newlyRegisteredEmail.toLowerCase());
    if (targetUser) {
      targetUser.status = 'active';
      loginWithCredentials(targetUser.email, targetUser.password || '');
      router.push('/provider/dashboard');
    }
  };

  // Resend recovery email
  const handleResendRecoveryEmail = async () => {
    if (cooldown > 0 || !recoveryUserEmail) return;
    try {
      await api.requestPasswordRecovery(recoveryUserEmail);
      setCooldown(30);
      alert(`Enlace de recuperación reenviado a ${recoveryUserEmail}`);
    } catch (err: any) {
      alert(err.message || 'Error al reenviar el correo.');
    }
  };

  // Real-time checks for register password
  const regReqLen = regPassword.length >= 8 && regPassword.length <= 12;
  const regReqCap = /[A-Z]/.test(regPassword);
  const regReqNum = /[0-9]/.test(regPassword);
  const regReqSpecial = /[^A-Za-z0-9]/.test(regPassword);

  // Real-time checks for reset password
  const resetReqLen = resetPasswordVal.length >= 8 && resetPasswordVal.length <= 12;
  const resetReqCap = /[A-Z]/.test(resetPasswordVal);
  const resetReqNum = /[0-9]/.test(resetPasswordVal);
  const resetReqSpecial = /[^A-Za-z0-9]/.test(resetPasswordVal);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bgPrimary px-4 py-12 sm:px-6 lg:px-8 font-wixText">
      {/* Background blobs for premium depth */}
      <div className="absolute top-10 left-10 h-[400px] w-[400px] rounded-full bg-fillPrimary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-[400px] w-[400px] rounded-full bg-accentPurple/5 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logotipoColor1.svg" alt="ANDO" className="h-16 w-auto mb-2" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-accentWine/75">
            Portal de Gestión Turística
          </p>
        </div>

        {/* Form Container Card */}
        <div
          className={`bg-white rounded-3xl shadow-xl border border-black/5 p-6 sm:p-8 transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
            }`}
          style={shake ? { animation: 'shake 0.4s ease-in-out' } : {}}
        >
          {/* Shake CSS */}
          {shake && (
            <style dangerouslySetInnerHTML={{
              __html: `
              @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                20%, 40%, 60%, 80% { transform: translateX(6px); }
              }
            `}} />
          )}

          {/* ==================== VIEW: LOGIN ==================== */}
          {subView === 'login' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-bold text-accentWine font-wixDisplay">Ingresar al portal</h2>
                <p className="text-xs text-textDark/70 mt-1">Ingresa con tu correo y contraseña para acceder al sistema.</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5 pl-1">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-textDark/45" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-white/50 focus:ring-2 focus:ring-fillPrimary/10 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                      placeholder="ejemplo@ando.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 pl-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70">
                      Contraseña
                    </label>
                    <button
                      type="button"
                      onClick={() => changeView('forgot_password')}
                      className="text-[10px] font-bold text-fillPrimary hover:underline cursor-pointer"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-textDark/45" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-white/50 focus:ring-2 focus:ring-fillPrimary/10 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="bg-red-50 text-red-700 border border-red-200 text-[11px] px-3.5 py-2.5 rounded-xl font-medium flex items-center space-x-2 animate-fade-in shadow-2xs">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !loginEmail || !loginPassword}
                  className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-white shadow-lg transition-all cursor-pointer text-xs bg-fillPrimary hover:bg-fillPrimary/95 hover:shadow-fillPrimary/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar al portal</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-3 border-t border-black/5 mt-4">
                <button
                  onClick={() => {
                    changeView('register');
                    setRegErrors([]);
                  }}
                  className="text-xs font-bold text-accentWine hover:text-fillPrimary transition-colors cursor-pointer"
                >
                  ¿Es un prestador y no tiene cuenta? Regístrese aquí
                </button>
              </div>

              {/* Developer Quick Links */}
              <div className="bg-bgPrimary/60 border border-black/5 rounded-2xl p-4 text-[10px] text-textDark/70 space-y-2 mt-4">
                <p className="font-bold text-accentWine">Acceso rápido de prueba (demo)</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('admin@ando.com');
                      setLoginPassword('Admin123!');
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-black/5 rounded-lg border border-black/5 font-semibold text-center cursor-pointer transition-colors text-textDark inline-flex items-center justify-center space-x-1.5"
                  >
                    <Key className="h-3.5 w-3.5 text-fillPrimary flex-shrink-0" />
                    <span>Admin Demo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('prestador@ando.com');
                      setLoginPassword('Prestador123!');
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-black/5 rounded-lg border border-black/5 font-semibold text-center cursor-pointer transition-colors text-textDark inline-flex items-center justify-center space-x-1.5"
                  >
                    <Store className="h-3.5 w-3.5 text-fillPrimary flex-shrink-0" />
                    <span>Prestador Demo</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== VIEW: REGISTER ==================== */}
          {subView === 'register' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeView('login')}
                  className="p-1.5 rounded-xl hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-textDark/60">Volver a inicio de sesión</span>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-fillPrimary font-wixDisplay">Registro de Socio Prestador</h2>
                <p className="text-xs text-textDark/50 mt-1">Crea tu cuenta de socio para administrar tu POI.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {/* Personal Contact */}
                <div className="bg-bgPrimary/50 p-3 rounded-2xl border border-black/5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textDark/50 pl-0.5">Datos del Representante</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-xs"
                      placeholder="Nombre"
                    />
                    <input
                      type="text"
                      required
                      value={regApellido}
                      onChange={(e) => setRegApellido(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-xs"
                      placeholder="Apellido"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-textDark/45" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-white text-xs"
                      placeholder="Correo electrónico"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-textDark/45" />
                    <input
                      type="text"
                      required
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-white text-xs"
                      placeholder="Teléfono móvil"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-textDark/50 pl-0.5">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      required
                      value={regFechaNacimiento}
                      onChange={(e) => setRegFechaNacimiento(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white text-xs text-textDark/70"
                    />
                  </div>
                </div>

                {/* Business organization */}
                <div className="bg-bgPrimary/50 p-3 rounded-2xl border border-black/5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textDark/50 pl-0.5">Datos del Establecimiento</span>
                  <div className="relative">
                    <Briefcase className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-textDark/45" />
                    <input
                      type="text"
                      required
                      value={regEmpresa}
                      onChange={(e) => setRegEmpresa(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-white text-xs"
                      placeholder="Razón Social / Nombre Establecimiento"
                    />
                  </div>

                  <div className="relative">
                    <FileText className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-textDark/45" />
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={regCuit}
                      onChange={(e) => setRegCuit(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-black/10 bg-white text-xs"
                      placeholder="CUIT (11 números)"
                    />
                  </div>
                </div>

                {/* Passwords */}
                <div className="bg-bgPrimary/50 p-3 rounded-2xl border border-black/5 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-textDark/50 pl-0.5">Contraseña de Acceso</span>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-textDark/45" />
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 rounded-lg border border-black/10 bg-white text-xs"
                      placeholder="Contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-textDark/40 hover:text-textDark cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-textDark/45" />
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full pl-8 pr-8 py-2 rounded-lg border border-black/10 bg-white text-xs"
                      placeholder="Confirmar contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-2.5 top-2.5 text-textDark/40 hover:text-textDark cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Interactive password checks */}
                  {regPassword && (
                    <div className="p-2.5 bg-white rounded-xl border border-black/5 text-[9px] text-textDark/60 space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className={regReqLen ? "text-green-600 font-bold" : "text-textDark/35"}>
                          {regReqLen ? '✓' : '●'}
                        </span>
                        <span className={regReqLen ? "text-textDark font-medium" : ""}>Longitud entre 8 y 12 caracteres</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={regReqCap ? "text-green-600 font-bold" : "text-textDark/35"}>
                          {regReqCap ? '✓' : '●'}
                        </span>
                        <span className={regReqCap ? "text-textDark font-medium" : ""}>Al menos una MAYÚSCULA</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={regReqNum ? "text-green-600 font-bold" : "text-textDark/35"}>
                          {regReqNum ? '✓' : '●'}
                        </span>
                        <span className={regReqNum ? "text-textDark font-medium" : ""}>Al menos un número (0-9)</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className={regReqSpecial ? "text-green-600 font-bold" : "text-textDark/35"}>
                          {regReqSpecial ? '✓' : '●'}
                        </span>
                        <span className={regReqSpecial ? "text-textDark font-medium" : ""}>Al menos un carácter especial</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms checkbox */}
                <div className="flex items-start space-x-2 pt-1 pl-1">
                  <input
                    type="checkbox"
                    id="regTerms"
                    checked={regTermsAccepted}
                    onChange={(e) => setRegTermsAccepted(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-fillPrimary rounded cursor-pointer"
                  />
                  <label htmlFor="regTerms" className="text-[10px] text-textDark/70 leading-normal cursor-pointer select-none">
                    Acepto los <span className="font-bold text-fillPrimary hover:underline">Términos y Condiciones</span> oficiales de ANDO.
                  </label>
                </div>

                {/* Validation and error messages */}
                {regErrors.length > 0 && (
                  <div className="bg-red-50 text-red-600 border border-red-150 text-[11px] p-3 rounded-xl font-medium space-y-1">
                    {regErrors.map((err, idx) => (
                      <div key={idx} className="flex items-start space-x-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all cursor-pointer mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creando cuenta de prestador...</span>
                    </>
                  ) : (
                    <>
                      <span>Completar Registro Oficial</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ==================== VIEW: REGISTRATION PENDING ==================== */}
          {subView === 'registration_pending' && (
            <div className="space-y-6 text-center py-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-fillPrimary border border-fillPrimary/20 animate-pulse">
                <Store className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-accentWine font-wixDisplay">¡Registro Recibido!</h3>
                <p className="text-xs text-textDark/60 leading-relaxed max-w-xs mx-auto">
                  Hemos recibido tu solicitud para <strong className="text-textDark">{newlyRegisteredEmail}</strong>.
                </p>
                <div className="text-[10px] text-textDark/50 bg-bgPrimary/60 p-3 rounded-2xl border border-black/5 mt-2 text-left">
                  Tu cuenta está actualmente en estado <strong>Pendiente de Aprobación</strong>. Un administrador de ANDO revisará la información de tu establecimiento en las próximas 24 a 48 hs hábiles.
                </div>
              </div>

              <div className="space-y-2.5 pt-3">
                <button
                  onClick={() => changeView('login')}
                  className="w-full py-2.5 bg-fillPrimary text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  Volver al Inicio (Login)
                </button>

                {/* Developer testing shortcut */}
                <button
                  onClick={handleSimulatedApproval}
                  className="w-full py-2.5 bg-accentWine text-white font-bold rounded-xl text-xs shadow-md shadow-accentWine/10 hover:bg-accentWine/95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Aprobar de Forma Simulada para Probar</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== VIEW: FORGOT PASSWORD ==================== */}
          {subView === 'forgot_password' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeView('login')}
                  className="p-1 rounded-lg hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-textDark/60">Volver a inicio de sesión</span>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-bold text-accentWine font-wixDisplay">Recuperar Contraseña</h2>
                <p className="text-xs text-textDark/50 mt-1">Ingresa tu correo para recibir un enlace seguro de restablecimiento.</p>
              </div>

              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5 pl-1">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-textDark/40" />
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-white/50 focus:ring-2 focus:ring-fillPrimary/10 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                      placeholder="ejemplo@ando.com"
                    />
                  </div>
                </div>

                {recoveryError && (
                  <div className="bg-red-50 text-red-600 border border-red-150 text-[11px] px-3.5 py-2.5 rounded-xl font-medium flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{recoveryError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Buscando usuario...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Enlace de Recuperación</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ==================== VIEW: RECOVERY SENT ==================== */}
          {subView === 'recovery_sent' && (
            <div className="space-y-6 text-center py-4">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-200">
                <Check className="h-7 w-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-accentWine font-wixDisplay">¡Correo Enviado!</h3>
                <p className="text-xs text-textDark/60 leading-relaxed max-w-xs mx-auto">
                  Hemos enviado un enlace temporal de restablecimiento a <strong className="text-textDark">{recoveryUserEmail}</strong>.
                </p>
                <div className="text-[10px] text-textDark/50 bg-bgPrimary/60 p-3 rounded-2xl border border-black/5 mt-2 text-left">
                  Si no visualizas el mensaje en unos minutos, revisá la carpeta de <strong>SPAM</strong> o promociones.
                </div>
              </div>

              <div className="space-y-2.5 pt-3">
                <button
                  onClick={() => changeView('login')}
                  className="w-full py-2.5 bg-bgPrimary hover:bg-black/5 text-textDark font-bold rounded-xl text-xs border border-black/5 transition-colors cursor-pointer"
                >
                  Volver al Login
                </button>

                <button
                  onClick={handleResendRecoveryEmail}
                  disabled={cooldown > 0}
                  className="w-full py-2.5 bg-white border border-black/10 text-textDark font-bold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Reenviar correo</span>
                  {cooldown > 0 && <span className="text-fillPrimary font-mono">({cooldown}s)</span>}
                </button>

                {/* Developer Simulation Shortcut */}
                <button
                  onClick={() => {
                    changeView('reset_password');
                    setResetErrors([]);
                  }}
                  className="w-full py-2.5 bg-accentPurple text-white font-bold rounded-xl text-xs shadow-md shadow-accentPurple/10 hover:bg-accentPurple/95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Simular Apertura de Enlace de Email</span>
                </button>
              </div>
            </div>
          )}

          {/* ==================== VIEW: RESET PASSWORD ==================== */}
          {subView === 'reset_password' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold text-accentWine font-wixDisplay">Nueva Contraseña</h2>
                <p className="text-xs text-textDark/50 mt-1">
                  Establece tu nueva clave de acceso para <strong className="text-textDark">{recoveryUserEmail}</strong>.
                </p>
              </div>

              <form onSubmit={handleResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5 pl-1">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-textDark/40" />
                    <input
                      type={showResetPassword ? "text" : "password"}
                      required
                      value={resetPasswordVal}
                      onChange={(e) => setResetPasswordVal(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-8 py-3 rounded-xl border border-black/10 bg-white/50 focus:ring-2 focus:ring-fillPrimary/10 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                      placeholder="Nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="absolute right-2.5 top-3.5 text-textDark/40 hover:text-textDark cursor-pointer"
                    >
                      {showResetPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {/* Security policy checklist */}
                  <div className="mt-2.5 p-3 bg-bgPrimary/60 border border-black/5 rounded-2xl text-[10px] text-textDark/60 space-y-1.5">
                    <p className="font-bold mb-0.5">La contraseña debe contener:</p>
                    <div className="flex items-center space-x-1.5">
                      <span className={resetReqLen ? "text-green-600 font-bold" : "text-textDark/35"}>
                        {resetReqLen ? '✓' : '●'}
                      </span>
                      <span className={resetReqLen ? "text-textDark font-medium" : ""}>Longitud entre 8 y 12 caracteres</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={resetReqCap ? "text-green-600 font-bold" : "text-textDark/35"}>
                        {resetReqCap ? '✓' : '●'}
                      </span>
                      <span className={resetReqCap ? "text-textDark font-medium" : ""}>Al menos una letra MAYÚSCULA</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={resetReqNum ? "text-green-600 font-bold" : "text-textDark/35"}>
                        {resetReqNum ? '✓' : '●'}
                      </span>
                      <span className={resetReqNum ? "text-textDark font-medium" : ""}>Al menos un número (0-9)</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <span className={resetReqSpecial ? "text-green-600 font-bold" : "text-textDark/35"}>
                        {resetReqSpecial ? '✓' : '●'}
                      </span>
                      <span className={resetReqSpecial ? "text-textDark font-medium" : ""}>Al menos un carácter especial</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5 pl-1">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-textDark/40" />
                    <input
                      type={showResetConfirmPassword ? "text" : "password"}
                      required
                      value={resetConfirmPasswordVal}
                      onChange={(e) => setResetConfirmPasswordVal(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-10 pr-8 py-3 rounded-xl border border-black/10 bg-white/50 focus:ring-2 focus:ring-fillPrimary/10 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                      placeholder="Confirmar contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                      className="absolute right-2.5 top-3.5 text-textDark/40 hover:text-textDark cursor-pointer"
                    >
                      {showResetConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {resetErrors.length > 0 && (
                  <div className="bg-red-50 text-red-600 border border-red-150 text-[10px] p-3 rounded-xl font-medium space-y-1">
                    {resetErrors.map((err, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5">
                        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Actualizando contraseña...</span>
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
