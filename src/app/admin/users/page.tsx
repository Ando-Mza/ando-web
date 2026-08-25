'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, UserRole } from '@/types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  Save, 
  X, 
  AlertTriangle,
  Check, 
  Shield, 
  Store,
  User as UserIcon,
  Eye,
  Compass
} from 'lucide-react';

type ViewMode = 'list' | 'create' | 'edit';

export default function UserManagementPage() {
  const { users, adminCreateUser, updateProviderProfile, adminDeleteUser, currentUser } = useApp();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'provider' | 'tourist'>('all');

  // Form States
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('provider');
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formCuit, setFormCuit] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'pending' | 'inactive'>('active');

  // Modal / Feedback States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. FILTER USERS
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.cuit && u.cuit.includes(searchTerm)) ||
      (u.businessName && u.businessName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // 2. NAVIGATION AND INITIALIZATION
  const handleStartCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormRole('provider');
    setFormBusinessName('');
    setFormCuit('');
    setFormPassword('');
    setFormStatus('active');
    setSelectedUser(null);
    setViewMode('create');
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleStartEdit = (user: User) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormRole(user.role);
    setFormBusinessName(user.businessName || '');
    setFormCuit(user.cuit || '');
    setFormPassword(''); // blank password to indicate no change unless filled
    setFormStatus(user.status || 'active');
    setViewMode('edit');
  };

  // 3. FORM DIRTINESS CHECK
  const isFormDirty = () => {
    if (viewMode === 'create') {
      return (
        formName.trim() !== '' ||
        formEmail.trim() !== '' ||
        formPhone.trim() !== '' ||
        formBusinessName.trim() !== '' ||
        formCuit.trim() !== '' ||
        formPassword !== ''
      );
    } else if (viewMode === 'edit' && selectedUser) {
      return (
        formName !== selectedUser.name ||
        formEmail !== selectedUser.email ||
        formPhone !== (selectedUser.phone || '') ||
        formRole !== selectedUser.role ||
        formBusinessName !== (selectedUser.businessName || '') ||
        formCuit !== (selectedUser.cuit || '') ||
        formPassword !== '' ||
        formStatus !== (selectedUser.status || 'active')
      );
    }
    return false;
  };

  const handleCancel = () => {
    if (isFormDirty()) {
      setShowCancelModal(true);
    } else {
      setViewMode('list');
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelModal(false);
    setViewMode('list');
  };

  // 4. VALIDATIONS
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cuitRegex = /^\d{11}$/;

  const isEmailValid = emailRegex.test(formEmail.trim());
  const isCuitValid = formRole !== 'provider' || cuitRegex.test(formCuit.replace(/\D/g, ''));
  const isNameFilled = formName.trim().length > 0;
  const isPasswordFilledForCreate = viewMode !== 'create' || formPassword.trim().length >= 6;
  const isBusinessNameFilled = formRole !== 'provider' || formBusinessName.trim().length > 0;

  const isFormValid = isNameFilled && isEmailValid && isCuitValid && isPasswordFilledForCreate && isBusinessNameFilled;

  // 5. SAVE HANDLER
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    if (viewMode === 'create') {
      const payload: Omit<User, 'id'> & { password?: string } = {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        businessName: formRole === 'provider' ? formBusinessName.trim() : undefined,
        cuit: formRole === 'provider' ? formCuit.replace(/\D/g, '') : undefined,
        password: formPassword || '123456',
        status: formStatus
      };

      const res = await adminCreateUser(payload);
      if (res.success) {
        triggerToast(`Usuario "${formName}" creado exitosamente.`);
        setViewMode('list');
      } else {
        triggerToast(res.error || 'Ocurrió un error al crear la cuenta', 'error');
      }
    } else if (viewMode === 'edit' && selectedUser) {
      const updatedData: Partial<User> = {
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim() || undefined,
        role: formRole,
        businessName: formRole === 'provider' ? formBusinessName.trim() : undefined,
        cuit: formRole === 'provider' ? formCuit.replace(/\D/g, '') : undefined,
        status: formStatus
      };

      if (formPassword.trim()) {
        updatedData.password = formPassword;
      }

      const res = updateProviderProfile(selectedUser.id, updatedData);
      if (res.success) {
        triggerToast(`Usuario "${formName}" actualizado exitosamente.`);
        setViewMode('list');
      } else {
        triggerToast(res.error || 'Ocurrió un error al guardar los cambios', 'error');
      }
    }
  };


  // 6. DELETE HANDLER
  const askDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      adminDeleteUser(userToDelete.id);
      triggerToast('La cuenta fue eliminada correctamente', 'success');
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    triggerToast('Operación cancelada', 'warning');
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-xl shadow-2xl border transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white border-green-500'
            : toast.type === 'error'
            ? 'bg-red-600 text-white border-red-500'
            : 'bg-amber-600 text-white border-amber-500'
        }`}>
          <Check className="h-4.5 w-4.5 flex-shrink-0" />
          <span className="text-xs font-semibold leading-normal">{toast.message}</span>
        </div>
      )}

      {/* Overview Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-wixDisplay text-2xl font-bold text-accentWine">Gestión de Usuarios (GDU)</h3>
          <p className="text-sm text-textDark/60">
            Administra los roles, credenciales y estados de las cuentas de prestadores y administradores del ecosistema.
          </p>
        </div>

        {viewMode === 'list' && (
          <button
            onClick={handleStartCreate}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white rounded-xl text-xs font-bold shadow-md shadow-fillPrimary/10 hover:shadow-lg transition-all cursor-pointer self-start"
          >
            <Plus className="h-4 w-4" />
            <span>Nuevo Usuario</span>
          </button>
        )}
      </div>

      {/* ==================== VIEW: LIST ==================== */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-textDark/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 bg-bgPrimary/30 focus:ring-2 focus:ring-fillPrimary/10 focus:border-fillPrimary focus:bg-white focus:outline-none transition-all text-xs"
                placeholder="Buscar por nombre, email, CUIT o establecimiento..."
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-textDark/60 font-semibold">Rol:</span>
              <div className="flex p-0.5 bg-bgPrimary rounded-lg border border-black/5">
                <button
                  type="button"
                  onClick={() => setRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    roleFilter === 'all' ? 'bg-white text-textDark shadow-xs' : 'text-textDark/65 hover:text-textDark'
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    roleFilter === 'admin' ? 'bg-white text-textDark shadow-xs' : 'text-textDark/65 hover:text-textDark'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('provider')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    roleFilter === 'provider' ? 'bg-white text-textDark shadow-xs' : 'text-textDark/65 hover:text-textDark'
                  }`}
                >
                  Prestadores
                </button>
                <button
                  type="button"
                  onClick={() => setRoleFilter('tourist')}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    roleFilter === 'tourist' ? 'bg-white text-textDark shadow-xs' : 'text-textDark/65 hover:text-textDark'
                  }`}
                >
                  Turistas
                </button>
              </div>
            </div>
          </div>

          {/* Users Grid */}
          {/* Users Table */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-textDark/50 text-xs">
              No se encontraron usuarios con los filtros aplicados.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-black/5">
              <table className="w-full text-left border-collapse bg-white">
                <thead>
                  <tr className="bg-bgPrimary/60 border-b border-black/5 text-[10px] font-bold uppercase tracking-wider text-textDark/60">
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">CUIT / Organización</th>
                    <th className="py-3 px-4">Teléfono</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 text-xs text-textDark/80">
                  {filteredUsers.map((user) => (
                    <tr 
                      key={user.id} 
                      className={`hover:bg-bgPrimary/20 transition-colors ${
                        user.status === 'inactive' ? 'bg-red-50/5' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 ${
                            user.role === 'admin' 
                              ? 'bg-accentWine/10 text-accentWine' 
                              : user.role === 'provider'
                              ? 'bg-fillPrimary/10 text-fillPrimary'
                              : 'bg-sky-50 text-sky-700'
                          }`}>
                            {user.name.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold block truncate max-w-[160px]" title={user.name}>
                              {user.name}
                            </span>
                            <span className="text-[10px] text-textDark/50 block truncate max-w-[160px]">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          user.role === 'admin' 
                            ? 'bg-accentWine/5 text-accentWine border-accentWine/15' 
                            : user.role === 'provider'
                            ? 'bg-fillPrimary/5 text-fillPrimary border-fillPrimary/15'
                            : 'bg-sky-50 text-sky-700 border-sky-200'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : user.role === 'provider' ? 'Prestador' : 'Turista'}
                        </span>
                      </td>

                      {/* CUIT / Business */}
                      <td className="py-3 px-4">
                        {user.role === 'provider' ? (
                          <div className="min-w-0">
                            <span className="block font-medium truncate max-w-[180px]">{user.businessName || 'S/D'}</span>
                            {user.cuit && <span className="text-[10px] text-textDark/45 font-mono block">CUIT: {user.cuit}</span>}
                          </div>
                        ) : (
                          <span className="text-textDark/40 font-mono">-</span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-[10px] text-textDark/70">
                        {user.phone || '-'}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          user.status === 'active'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : user.status === 'pending'
                            ? 'bg-orange-50 text-orange-700 border-orange-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="p-1 hover:bg-black/5 border border-black/5 text-textDark/70 rounded-md transition-colors cursor-pointer"
                            title="Visualizar Usuario"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleStartEdit(user)}
                            className="p-1 hover:bg-black/5 border border-black/5 text-textDark/70 rounded-md transition-colors cursor-pointer"
                            title="Editar Usuario"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => askDeleteUser(user)}
                              className="p-1 rounded-md border bg-red-50 hover:bg-red-100 border-red-200 text-red-600 transition-colors cursor-pointer"
                              title="Eliminar Cuenta"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ==================== VIEW: CREATE / EDIT ==================== */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6 max-w-xl mx-auto">
          <div className="flex items-center space-x-2 border-b border-black/5 pb-4">
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-xl hover:bg-black/5 text-textDark/60 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h4 className="font-wixDisplay text-lg font-bold text-accentWine">
              {viewMode === 'create' ? 'Crear Nuevo Usuario' : `Modificar Usuario: ${selectedUser?.name}`}
            </h4>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Form Role Tabs */}
            {viewMode === 'create' && (
              <div className="grid grid-cols-3 gap-2 p-1 bg-bgPrimary rounded-xl border border-black/5">
                <button
                  type="button"
                  onClick={() => setFormRole('admin')}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    formRole === 'admin'
                      ? 'bg-accentWine text-white'
                      : 'text-textDark/65 hover:bg-black/5'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormRole('provider')}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    formRole === 'provider'
                      ? 'bg-fillPrimary text-white'
                      : 'text-textDark/65 hover:bg-black/5'
                  }`}
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>Prestador</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormRole('tourist')}
                  className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                    formRole === 'tourist'
                      ? 'bg-sky-600 text-white'
                      : 'text-textDark/65 hover:bg-black/5'
                  }`}
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Turista</span>
                </button>
              </div>
            )}

            {/* Standard inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                  placeholder="Nombre y Apellido"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs ${
                    formEmail && !isEmailValid ? 'border-red-500 bg-red-50/10' : 'border-black/10'
                  }`}
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                  placeholder="Número de teléfono móvil"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                  Estado de la Cuenta
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'active' | 'pending' | 'inactive')}
                  className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs bg-white"
                >
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente de Validación</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>
            </div>

            {/* Provider fields */}
            {formRole === 'provider' && (
              <div className="bg-bgPrimary/40 p-4 rounded-2xl border border-black/5 space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accentWine">Datos Comerciales del Prestador</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                      Razón Social / Organización
                    </label>
                    <input
                      type="text"
                      required={formRole === 'provider'}
                      value={formBusinessName}
                      onChange={(e) => setFormBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs bg-white"
                      placeholder="Ej: Bodega Catena Zapata"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                      Número CUIT (11 dígitos)
                    </label>
                    <input
                      type="text"
                      required={formRole === 'provider'}
                      maxLength={11}
                      value={formCuit}
                      onChange={(e) => setFormCuit(e.target.value.replace(/\D/g, ''))}
                      className={`w-full px-3 py-2 rounded-xl border text-xs bg-white ${
                        formCuit && !isCuitValid ? 'border-red-500 bg-red-50/10' : 'border-black/10'
                      }`}
                      placeholder="Ingrese los 11 números"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                {viewMode === 'create' ? 'Contraseña' : 'Modificar Contraseña (Opcional)'}
              </label>
              <input
                type="password"
                required={viewMode === 'create'}
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs ${
                  viewMode === 'create' && formPassword && formPassword.length < 6 ? 'border-red-500' : 'border-black/10'
                }`}
                placeholder={viewMode === 'create' ? 'Mínimo 6 caracteres' : 'Dejar en blanco para conservar clave actual'}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-black/5">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2.5 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!isFormValid}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center space-x-1.5 cursor-pointer ${
                  isFormValid 
                    ? 'bg-fillPrimary hover:bg-fillPrimary/95 shadow-fillPrimary/10 hover:shadow-lg' 
                    : 'bg-black/10 text-textDark/30 cursor-not-allowed shadow-none'
                }`}
              >
                <Save className="h-4 w-4" />
                <span>{viewMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================== DIALOG MODALS ==================== */}

      {/* Modal: Confirm Cancel (Dirty Discard) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-sm p-6 overflow-hidden transition-all transform scale-100">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-wixDisplay text-lg font-bold text-accentWine">Descartar Cambios</h4>
              <button
                onClick={() => setShowCancelModal(false)}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-red-50 text-red-800 rounded-lg flex items-start space-x-2 border border-red-100">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
                <div className="text-xs">
                  <p className="font-bold">Al confirmar esta operación se perderán las modificaciones.</p>
                  <p className="mt-0.5">¿Está seguro que desea continuar?</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirm Account Delete (Inactivation) */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-sm p-6 overflow-hidden transition-all transform scale-100">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-wixDisplay text-lg font-bold text-accentWine">Eliminar Cuenta de Usuario</h4>
              <button
                onClick={handleCancelDelete}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-red-50 text-red-800 rounded-lg flex items-start space-x-2 border border-red-100">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
                <div className="text-xs">
                  <p className="font-bold">¿Desea eliminar la cuenta de &quot;{userToDelete.name}&quot;?</p>
                  <p className="mt-0.5">La cuenta será inactivada permanentemente. Las credenciales de acceso dejarán de funcionar.</p>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="px-4 py-2 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View User Details */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-md p-6 overflow-hidden transition-all transform scale-100">
            <div className="flex justify-between items-center mb-4 border-b border-black/5 pb-3">
              <h4 className="font-wixDisplay text-lg font-bold text-accentWine">Ficha de Información del Usuario</h4>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-textDark/80">
              {/* Profile Card Header */}
              <div className="flex items-center space-x-3 bg-bgPrimary/35 p-3.5 rounded-xl border border-black/5">
                <div className={`h-11 w-11 rounded-full flex items-center justify-center font-bold text-sm uppercase flex-shrink-0 ${
                  selectedUser.role === 'admin' 
                    ? 'bg-accentWine/10 text-accentWine' 
                    : selectedUser.role === 'provider'
                    ? 'bg-fillPrimary/10 text-fillPrimary'
                    : 'bg-sky-50 text-sky-700'
                }`}>
                  {selectedUser.name.slice(0, 2)}
                </div>
                <div>
                  <span className="font-wixDisplay text-sm font-bold text-textDark block">
                    {selectedUser.name}
                  </span>
                  <span className="text-[10px] text-textDark/50 block font-medium">
                    {selectedUser.email}
                  </span>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-textDark/50">Rol en la Plataforma</span>
                  <span className="text-xs font-semibold text-textDark block mt-0.5">
                    {selectedUser.role === 'admin' ? (
                      <span className="inline-flex items-center space-x-1.5"><Shield className="h-3.5 w-3.5 text-fillPrimary flex-shrink-0" /><span>Administrador de sistemas</span></span>
                    ) : selectedUser.role === 'provider' ? (
                      <span className="inline-flex items-center space-x-1.5"><Store className="h-3.5 w-3.5 text-fillPrimary flex-shrink-0" /><span>Prestador de servicios</span></span>
                    ) : (
                      <span className="inline-flex items-center space-x-1.5"><Compass className="h-3.5 w-3.5 text-fillPrimary flex-shrink-0" /><span>Turista registrado</span></span>
                    )}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-textDark/50">Estado de Cuenta</span>
                  <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold border mt-0.5 ${
                    selectedUser.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : selectedUser.status === 'pending'
                      ? 'bg-orange-50 text-orange-700 border-orange-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {selectedUser.status === 'active' ? 'Activo' : selectedUser.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-textDark/50">Teléfono</span>
                  <span className="text-xs font-mono text-textDark block mt-0.5">
                    {selectedUser.phone || 'S/D (Sin Datos)'}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-textDark/50">Identificación</span>
                  <span className="text-xs font-mono text-textDark/60 block mt-0.5">
                    {selectedUser.id}
                  </span>
                </div>
              </div>

              {/* Commercial Data if Provider */}
              {selectedUser.role === 'provider' && (
                <div className="bg-bgPrimary/25 p-3 rounded-xl border border-black/5 space-y-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accentWine block">Información Comercial</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="block text-[9px] text-textDark/50 font-bold uppercase">Razón Social</span>
                      <span className="text-xs font-medium text-textDark block">{selectedUser.businessName || 'S/D'}</span>
                    </div>
                    <div>
                      <span className="block text-[9px] text-textDark/50 font-bold uppercase">CUIT</span>
                      <span className="text-xs font-mono text-textDark block">{selectedUser.cuit || 'S/D'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-4 border-t border-black/5 mt-4">
              <button
                type="button"
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Cerrar Ficha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
