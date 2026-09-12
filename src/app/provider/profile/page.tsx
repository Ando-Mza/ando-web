'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { api } from '@/utils/api';
import { 
  Save, 
  X, 
  Trash2, 
  Lock, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  AlertTriangle, 
  Check, 
  Eye, 
  EyeOff 
} from 'lucide-react';

export default function ProviderProfilePage() {
  const router = useRouter();
  const { currentUser, updateProviderProfile, deleteProviderAccount } = useApp();

  // Redirect if not loaded or not provider (safety)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'provider') {
      router.push('/');
    }
  }, [currentUser, router]);

  // Form States
  const [nombre, setNombre] = useState(() => {
    if (currentUser?.firstName) return currentUser.firstName;
    return currentUser?.name ? currentUser.name.split(' ')[0] : '';
  });
  const [apellido, setApellido] = useState(() => {
    if (currentUser?.lastName) return currentUser.lastName;
    return currentUser?.name ? currentUser.name.split(' ').slice(1).join(' ') : '';
  });
  const [email, setEmail] = useState(() => currentUser?.email || '');
  const [phone, setPhone] = useState(() => currentUser?.phone || '');
  const [cuit, setCuit] = useState(() => currentUser?.cuit || '');
  const [businessName, setBusinessName] = useState(() => currentUser?.businessName || '');

  // Sincronizar estados cuando currentUser termine de cargar desde el backend
  useEffect(() => {
    if (currentUser) {
      if (currentUser.firstName !== undefined || currentUser.lastName !== undefined) {
        setNombre(currentUser.firstName || '');
        setApellido(currentUser.lastName || '');
      } else {
        const parts = (currentUser.name || '').trim().split(' ');
        setNombre(parts[0] || '');
        setApellido(parts.slice(1).join(' ') || '');
      }
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setCuit(currentUser.cuit || '');
      setBusinessName(currentUser.businessName || '');
    }
  }, [currentUser]);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Modals & Notifications
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  if (!currentUser) return null;

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check if form has modifications (dirty check)
  const isFormDirty = () => {
    const initialNombre = currentUser.firstName !== undefined ? (currentUser.firstName || '') : (currentUser.name || '').trim().split(' ')[0] || '';
    const initialApellido = currentUser.lastName !== undefined ? (currentUser.lastName || '') : (currentUser.name || '').trim().split(' ').slice(1).join(' ') || '';
    
    return (
      nombre !== initialNombre ||
      apellido !== initialApellido ||
      email !== currentUser.email ||
      phone !== (currentUser.phone || '') ||
      cuit !== (currentUser.cuit || '') ||
      businessName !== (currentUser.businessName || '') ||
      newPassword.trim() !== '' ||
      confirmPassword.trim() !== ''
    );
  };

  // Form Validation
  const validateForm = () => {
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !phone.trim() || !cuit.trim() || !businessName.trim()) {
      showToast('Todos los campos de perfil son obligatorios.', 'error');
      return false;
    }
    
    // Email regex
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('El correo electrónico tiene un formato inválido.', 'error');
      return false;
    }

    // Phone regex
    if (!/^\+?[0-9\s-]{6,18}$/.test(phone)) {
      showToast('El teléfono debe tener un formato válido (entre 6 y 18 números).', 'error');
      return false;
    }

    // CUIT regex (11 numbers)
    if (!/^\d{11}$/.test(cuit.replace(/[-]/g, ''))) {
      showToast('El CUIT debe contener exactamente 11 números.', 'error');
      return false;
    }

    // Password change validations: SOLO se activa si el usuario ingresó algo en Nueva Contraseña
    if (newPassword.trim() || confirmPassword.trim()) {
      if (!currentPassword.trim()) {
        showToast('Debes ingresar tu contraseña actual para confirmar el cambio de clave.', 'error');
        return false;
      }
      if (newPassword.length < 8 || newPassword.length > 12 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
        showToast('La nueva contraseña debe tener entre 8 y 12 caracteres, una mayúscula, un número y un carácter especial.', 'error');
        return false;
      }
      if (newPassword !== confirmPassword) {
        showToast('La confirmación de la nueva contraseña no coincide.', 'error');
        return false;
      }
    }

    return true;
  };

  // Handle Cancel Action
  const handleCancelClick = () => {
    if (isFormDirty()) {
      setShowCancelModal(true);
    } else {
      router.push('/provider/dashboard');
    }
  };

  const confirmDiscardChanges = () => {
    // Reset inputs
    if (currentUser.firstName !== undefined || currentUser.lastName !== undefined) {
      setNombre(currentUser.firstName || '');
      setApellido(currentUser.lastName || '');
    } else {
      const parts = (currentUser.name || '').trim().split(' ');
      setNombre(parts[0] || '');
      setApellido(parts.slice(1).join(' ') || '');
    }
    setEmail(currentUser.email || '');
    setPhone(currentUser.phone || '');
    setCuit(currentUser.cuit || '');
    setBusinessName(currentUser.businessName || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCancelModal(false);
    showToast('Los cambios se descartaron', 'warning');
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/provider/dashboard');
    }, 1000);
  };

  // Handle Save Action
  const handleSaveClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowSaveModal(true);
    }
  };

  const confirmSaveProfile = async () => {
    setShowSaveModal(false);
    
    const payload: Partial<typeof currentUser> = {
      name: `${nombre.trim()} ${apellido.trim()}`.trim(),
      firstName: nombre.trim(),
      lastName: apellido.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cuit: cuit.trim(),
      businessName: businessName.trim(),
    };

    const res = await updateProviderProfile(currentUser.id, payload);
    if (!res.success) {
      showToast(res.error || 'Error al guardar los cambios.', 'error');
      return;
    }

    // Si el usuario solicitó cambio de contraseña, se procesa en el backend
    if (newPassword.trim()) {
      try {
        await api.changePassword({
          passwordActual: currentPassword,
          passwordNueva: newPassword,
        });
        showToast('Perfil y contraseña actualizados correctamente', 'success');
      } catch (err: any) {
        showToast(`Perfil actualizado, pero falló el cambio de contraseña: ${err.message}`, 'warning');
      }
    } else {
      showToast('Perfil actualizado correctamente', 'success');
    }

    // Reset password fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Handle Account Deletion
  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteModal(false);
    deleteProviderAccount(currentUser.id);
    
    // Create temporary confirmation overlay before page redirect
    alert('La cuenta fue eliminada correctamente');
    router.push('/');
  };

  const cancelDeleteAccount = () => {
    setShowDeleteModal(false);
    showToast('Operación cancelada', 'warning');
  };

  // Password requirements calculation
  const reqLength = newPassword.length >= 8 && newPassword.length <= 12;
  const reqCapital = /[A-Z]/.test(newPassword);
  const reqNumber = /[0-9]/.test(newPassword);
  const reqSpecial = /[^A-Za-z0-9]/.test(newPassword);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 relative font-wixText">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 animate-slide-in max-w-md ${
          toast.type === 'success' ? 'bg-fillPrimary' : toast.type === 'error' ? 'bg-red-600' : 'bg-amber-600'
        }`}>
          {toast.type === 'success' ? (
            <Check className="h-4.5 w-4.5 text-white flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4.5 w-4.5 text-white flex-shrink-0" />
          )}
          <span className="text-xs font-semibold leading-normal">{toast.message}</span>
        </div>
      )}

      {/* Discard Changes Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/5 animate-scale-up space-y-4">
            <div className="flex items-center space-x-2.5 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <h4 className="font-wixDisplay font-bold text-textDark">¿Deshacer cambios?</h4>
            </div>
            <p className="text-xs text-textDark/70 leading-relaxed">
              Los cambios se descartarán si confirma esta acción ¿Está seguro que desea deshacer los cambios?
            </p>
            <div className="flex space-x-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
              >
                Seguir Editando
              </button>
              <button
                type="button"
                onClick={confirmDiscardChanges}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-colors cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Profile Changes Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/5 animate-scale-up space-y-4">
            <div className="flex items-center space-x-2.5 text-fillPrimary">
              <Check className="h-5 w-5" />
              <h4 className="font-wixDisplay font-bold text-textDark">Confirmar Cambios</h4>
            </div>
            <p className="text-xs text-textDark/70 leading-relaxed">
              ¿Desea guardar los cambios realizados sobre el Usuario?
            </p>
            <div className="flex space-x-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmSaveProfile}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-fillPrimary hover:bg-fillPrimary/95 text-white shadow-md shadow-fillPrimary/10 transition-colors cursor-pointer"
              >
                Confirmar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Danger Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-100 animate-scale-up space-y-4">
            <div className="flex items-center space-x-2.5 text-red-600">
              <Trash2 className="h-5.5 w-5.5" />
              <h4 className="font-wixDisplay font-bold text-lg text-textDark">Eliminar Cuenta de Socio</h4>
            </div>
            <div className="space-y-2 text-xs text-textDark/70 leading-relaxed">
              <p className="font-semibold text-red-700 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                <span>Advertencia crítica de baja:</span>
              </p>
              <p>Al confirmar esta acción, tu cuenta quedará desactivada de forma permanente y ya no podrás acceder con tus credenciales.</p>
              <p>Además, todos los establecimientos y puntos de interés (POIs) vinculados a tu cuenta (<strong>{currentUser.businessName}</strong>) dejarán de estar visibles en el catálogo y mapas de la aplicación móvil.</p>
            </div>
            <div className="flex space-x-2 justify-end pt-3 border-t border-black/5">
              <button
                type="button"
                onClick={cancelDeleteAccount}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAccount}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/10 transition-colors cursor-pointer"
              >
                Confirmar Eliminación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Title */}
      <div>
        <h3 className="font-wixDisplay text-2xl font-bold text-fillPrimary">Mi Cuenta</h3>
        <p className="text-xs text-textDark/60 mt-1">
          Administra la información de tu perfil comercial, cambia tu contraseña y configura tu cuenta corporativa.
        </p>
      </div>

      <form onSubmit={handleSaveClick} className="space-y-8">
        {/* Section 1: Personal and business details */}
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-6 shadow-xs">
          <h4 className="font-wixDisplay text-sm font-bold text-accentWine pb-2 border-b border-black/5 flex items-center">
            <UserIcon className="h-4.5 w-4.5 mr-2 text-fillPrimary" />
            <span>Datos de Contacto y Organización</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                Nombre de Contacto
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-textDark/45" />
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                Apellido de Contacto
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-textDark/45" />
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-textDark/45" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                Teléfono de Contacto
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-textDark/45" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                Nombre de la Empresa / Establecimiento
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-textDark/45" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                CUIT (11 números)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-textDark/45" />
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={cuit}
                  onChange={(e) => setCuit(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Password modification */}
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-6 shadow-xs">
          <div className="pb-2 border-b border-black/5">
            <h4 className="font-wixDisplay text-sm font-bold text-accentWine flex items-center">
              <Lock className="h-4.5 w-4.5 mr-2 text-fillPrimary" />
              <span>Seguridad y Cambio de Contraseña (Opcional)</span>
            </h4>
            <p className="text-[11px] text-textDark/60 mt-1">
              Deja estos campos en blanco si solo deseas modificar tus datos personales o comerciales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                Contraseña Actual
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-textDark/40" />
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                  placeholder="Contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-2.5 top-3 text-textDark/40 hover:text-textDark cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-textDark/40" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2.5 top-3 text-textDark/40 hover:text-textDark cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-2 pl-0.5">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-textDark/40" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                  placeholder="Repita nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-3 text-textDark/40 hover:text-textDark cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time feedback for password policies */}
          {newPassword && (
            <div className="bg-bgPrimary/65 border border-black/5 rounded-xl p-3.5 max-w-md space-y-1.5 text-[10px] text-textDark/60 transition-all">
              <p className="font-bold mb-1">Requisitos de la nueva contraseña:</p>
              <div className="flex items-center space-x-2">
                <span className={reqLength ? "text-green-600 font-bold" : "text-textDark/35"}>
                  {reqLength ? '✓' : '●'}
                </span>
                <span className={reqLength ? "text-textDark" : ""}>Longitud entre 8 y 12 caracteres</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={reqCapital ? "text-green-600 font-bold" : "text-textDark/35"}>
                  {reqCapital ? '✓' : '●'}
                </span>
                <span className={reqCapital ? "text-textDark" : ""}>Al menos una letra MAYÚSCULA</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={reqNumber ? "text-green-600 font-bold" : "text-textDark/35"}>
                  {reqNumber ? '✓' : '●'}
                </span>
                <span className={reqNumber ? "text-textDark" : ""}>Al menos un número (0-9)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={reqSpecial ? "text-green-600 font-bold" : "text-textDark/35"}>
                  {reqSpecial ? '✓' : '●'}
                </span>
                <span className={reqSpecial ? "text-textDark" : ""}>Al menos un carácter especial</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Action buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-black/5">
          <button
            type="button"
            onClick={handleCancelClick}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-white border border-black/10 text-textDark hover:bg-black/5 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Cancelar y Volver</span>
          </button>

          <button
            type="submit"
            disabled={!isFormDirty()}
            className="flex items-center justify-center space-x-2 px-6 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-xl text-xs shadow-md shadow-fillPrimary/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Guardar cambios</span>
          </button>
        </div>
      </form>

      {/* Section 4: Danger Zone (US-GDU-04) */}
      <div className="mt-12 bg-red-50/50 rounded-2xl border border-red-200/60 p-6 space-y-4">
        <h4 className="font-wixDisplay text-sm font-bold text-red-700 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
          <span>Zona de Peligro</span>
        </h4>
        <p className="text-xs text-textDark/65 leading-relaxed max-w-2xl">
          Al eliminar tu cuenta, se borrarán todos tus accesos y tu local comercial (POI) ya no será visible en el catálogo de ANDO. Esta operación no se puede deshacer de forma simple.
        </p>
        <button
          type="button"
          onClick={handleDeleteAccountClick}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/10 hover:shadow-lg transition-colors cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          <span>Eliminar mi Cuenta</span>
        </button>
      </div>
    </div>
  );
}
