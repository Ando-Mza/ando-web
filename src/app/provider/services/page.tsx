'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ServiceItem } from '@/types';
import { 
  Plus, 
  Sparkles, 
  Store, 
  Clock, 
  DollarSign, 
  Users, 
  Edit2, 
  Trash2, 
  Power, 
  Check, 
  AlertTriangle, 
  X, 
  Layers, 
  Info,
  ShieldCheck
} from 'lucide-react';

export default function ProviderServicesPage() {
  const { pois, services, saveService, deleteService, toggleServiceAvailability, currentUser } = useApp();

  const providerPois = currentUser?.role === 'provider' ? pois : pois.filter((p) => currentUser?.role === 'admin' || !p.createdBy || p.createdBy === currentUser?.id);

  const [selectedPoiId, setSelectedPoiId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedProviderPoiId') || '';
    }
    return '';
  });

  useEffect(() => {
    if (providerPois.length > 0) {
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('selectedProviderPoiId') : null;
      if (savedId && providerPois.some((p) => p.id === savedId)) {
        if (selectedPoiId !== savedId) setSelectedPoiId(savedId);
      } else if (!selectedPoiId || !providerPois.some((p) => p.id === selectedPoiId)) {
        const defaultId = providerPois[0].id;
        setSelectedPoiId(defaultId);
        if (typeof window !== 'undefined') localStorage.setItem('selectedProviderPoiId', defaultId);
      }
    }
  }, [providerPois]);

  const selectedPoi = providerPois.find((p) => p.id === selectedPoiId) || providerPois[0];
  const poiServices = services.filter((s) => s.poiId === selectedPoi?.id);

  // Form States (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [maxCapacity, setMaxCapacity] = useState<number | undefined>(undefined);
  const [terms, setTerms] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  // Validation States
  const [validationError, setValidationError] = useState('');
  const [deleteModalService, setDeleteModalService] = useState<ServiceItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setName('');
    setDescription('');
    setCategory(selectedPoi?.category || 'General');
    setPrice(0);
    setDurationMinutes(60);
    setMaxCapacity(undefined);
    setTerms('');
    setIsAvailable(true);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: ServiceItem) => {
    setEditingServiceId(service.id);
    setName(service.name);
    setDescription(service.description);
    setCategory(service.category || selectedPoi?.category || 'General');
    setPrice(service.price);
    setDurationMinutes(service.durationMinutes);
    setMaxCapacity(service.maxCapacity);
    setTerms(service.terms || '');
    setIsAvailable(service.isAvailable);
    setValidationError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!selectedPoi) {
      setValidationError('Debés seleccionar un establecimiento.');
      return;
    }

    if (!name.trim()) {
      setValidationError('El nombre del servicio es obligatorio.');
      return;
    }

    if (price < 0) {
      setValidationError('El precio del servicio no puede ser negativo.');
      return;
    }

    if (!durationMinutes || durationMinutes <= 0) {
      setValidationError('La duración del servicio debe ser mayor a cero.');
      return;
    }

    const payload: Omit<ServiceItem, 'id'> & { id?: string } = {
      id: editingServiceId || undefined,
      poiId: selectedPoi.id,
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || selectedPoi.category,
      price: Number(price),
      durationMinutes: Number(durationMinutes),
      maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
      terms: terms.trim() || undefined,
      isAvailable,
    };

    const res = await saveService(payload);
    if (res.success) {
      triggerToast(editingServiceId ? 'Servicio actualizado correctamente.' : 'Servicio guardado correctamente.');
      setIsModalOpen(false);
    } else {
      setValidationError(res.error || 'Ocurrió un error al guardar el servicio.');
    }
  };

  const handleToggleActive = async (service: ServiceItem) => {
    const res = await toggleServiceAvailability(service.id);
    if (res.success) {
      triggerToast(`Servicio "${service.name}" ${service.isAvailable ? 'desactivado' : 'activado'}.`);
    }
  };

  const confirmDelete = async () => {
    if (deleteModalService) {
      const res = await deleteService(deleteModalService.id);
      if (res.success) {
        triggerToast('Servicio eliminado correctamente.');
      }
      setDeleteModalService(null);
    }
  };

  const cancelDelete = () => {
    triggerToast('Operación cancelada.', 'warning');
    setDeleteModalService(null);
  };

  return (
    <div className="space-y-8 font-wixText">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 px-5 py-3 rounded-xl shadow-2xl border transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-600 text-white border-green-500'
            : toast.type === 'warning'
            ? 'bg-amber-600 text-white border-amber-500'
            : 'bg-red-600 text-white border-red-500'
        }`}>
          <Check className="h-4.5 w-4.5 flex-shrink-0" />
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-fillPrimary/10 via-fillPrimary/5 to-transparent border border-fillPrimary/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-fillPrimary/10 border border-fillPrimary/20 px-3 py-1 rounded-full text-xs font-bold text-fillPrimary">
              <Layers className="h-3.5 w-3.5" />
              <span>Oferta Turística y Experiencias (US-CYN-03)</span>
            </div>
            <h2 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
              Servicios y actividades de tu negocio
            </h2>
            <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
              Administrá las experiencias, visitas guiadas, degustaciones y servicios que ofrecés a los turistas. Esta información alimenta el motor de recomendaciones personalizadas de ANDO.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            disabled={!selectedPoi}
            className="px-5 py-3 bg-fillPrimary hover:bg-fillPrimary/90 disabled:opacity-50 text-white rounded-2xl text-xs font-bold shadow-lg shadow-fillPrimary/20 transition-all flex items-center space-x-2 cursor-pointer flex-shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Agregar nuevo servicio</span>
          </button>
        </div>
      </div>

      {/* Selector POI */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-fillPrimary/10 text-fillPrimary">
            <Store className="h-5 w-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/60">
              Establecimiento Activo
            </label>
            <span className="text-sm font-bold text-textDark">
              {selectedPoi ? selectedPoi.name : 'No hay establecimientos registrados'}
            </span>
          </div>
        </div>

        {providerPois.length > 1 && (
          <select
            value={selectedPoiId}
            onChange={(e) => {
              setSelectedPoiId(e.target.value);
              if (typeof window !== 'undefined') localStorage.setItem('selectedProviderPoiId', e.target.value);
            }}
            className="text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-fillPrimary/20 cursor-pointer"
          >
            {providerPois.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Services List */}
      <div className="space-y-4">
        {poiServices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-bgPrimary text-textDark/40">
              <Layers className="h-7 w-7" />
            </div>
            <h4 className="font-wixDisplay text-lg font-bold text-textDark">No hay servicios registrados</h4>
            <p className="text-xs text-textDark/60 max-w-sm mx-auto">
              Añadí los servicios que ofrece {selectedPoi?.name || 'tu negocio'} (ej: Degustación de Vinos, Visita Guiada, Menú de Pasos) para que los turistas puedan descubrirlos.
            </p>
            <div className="pt-2">
              <button
                onClick={handleOpenCreate}
                disabled={!selectedPoi}
                className="px-5 py-2.5 bg-fillPrimary hover:bg-fillPrimary/90 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                Crear primer servicio
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {poiServices.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition-all ${
                  service.isAvailable ? 'border-black/5' : 'border-black/10 opacity-70 bg-bgPrimary/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold bg-fillPrimary/10 text-fillPrimary px-2.5 py-0.5 rounded-md">
                        {service.category || 'General'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        service.isAvailable
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {service.isAvailable ? 'Disponible' : 'Pausado'}
                      </span>
                    </div>
                    <h4 className="font-wixDisplay text-base font-bold text-textDark">{service.name}</h4>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(service)}
                      className={`p-2 rounded-lg border transition-all cursor-pointer ${
                        service.isAvailable 
                          ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200' 
                          : 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200'
                      }`}
                      title={service.isAvailable ? 'Desactivar servicio' : 'Activar servicio'}
                    >
                      <Power className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(service)}
                      className="p-2 bg-bgPrimary hover:bg-black/5 text-textDark/80 rounded-lg border border-black/10 transition-colors cursor-pointer"
                      title="Editar servicio"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteModalService(service)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-colors cursor-pointer"
                      title="Eliminar servicio"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-textDark/70 line-clamp-2 leading-relaxed">
                  {service.description || <span className="italic text-textDark/40">Sin descripción adicional.</span>}
                </p>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-black/5 text-center">
                  <div className="bg-bgPrimary/60 p-2 rounded-xl border border-black/5">
                    <span className="block text-[10px] text-textDark/50 font-bold uppercase">Precio</span>
                    <span className="text-xs font-extrabold text-textDark font-mono">
                      {service.price > 0 ? `$${service.price.toLocaleString()}` : 'Gratuito'}
                    </span>
                  </div>
                  <div className="bg-bgPrimary/60 p-2 rounded-xl border border-black/5">
                    <span className="block text-[10px] text-textDark/50 font-bold uppercase">Duración</span>
                    <span className="text-xs font-extrabold text-textDark font-mono">
                      {service.durationMinutes} min
                    </span>
                  </div>
                  <div className="bg-bgPrimary/60 p-2 rounded-xl border border-black/5">
                    <span className="block text-[10px] text-textDark/50 font-bold uppercase">Capacidad</span>
                    <span className="text-xs font-extrabold text-textDark font-mono">
                      {service.maxCapacity ? `${service.maxCapacity} pers.` : 'Ilimitada'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Crear / Editar Servicio */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl w-full max-w-lg p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">
                {editingServiceId ? 'Editar servicio' : 'Nuevo servicio o actividad'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md hover:bg-black/5 text-textDark/60 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {validationError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs font-semibold flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-textDark">Nombre del servicio *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Degustación Premium de 4 Varietales"
                  required
                  className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-medium focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-textDark">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalles sobre la experiencia, qué incluye y recomendaciones..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-medium focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-textDark">Precio estimado ($ ARS) *</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    required
                    className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-medium font-mono focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-textDark">Duración estimada (minutos) *</label>
                  <input
                    type="number"
                    min="1"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    required
                    className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-medium font-mono focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-textDark">Capacidad máxima (opcional)</label>
                  <input
                    type="number"
                    min="1"
                    value={maxCapacity || ''}
                    onChange={(e) => setMaxCapacity(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Sin límite"
                    className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-medium font-mono focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-textDark">Categoría</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ej: Enoturismo, Gastronomía..."
                    className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-medium focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-textDark">Condiciones de contratación / reserva</label>
                <input
                  type="text"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Ej: Requiere reserva con 24hs de anticipación"
                  className="w-full text-xs p-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-medium focus:outline-none focus:ring-2 focus:ring-fillPrimary/20"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="serviceAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="h-4 w-4 rounded text-fillPrimary focus:ring-fillPrimary cursor-pointer"
                />
                <label htmlFor="serviceAvailable" className="text-xs font-bold text-textDark cursor-pointer">
                  Servicio disponible inmediatamente en la plataforma
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-textDark/60 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-fillPrimary hover:bg-fillPrimary/90 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Guardar Servicio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmación de Eliminación */}
      {deleteModalService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 rounded-full bg-red-50 border border-red-200">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h4 className="font-wixDisplay text-lg font-bold text-textDark">¿Eliminar servicio?</h4>
            </div>
            <p className="text-xs text-textDark/70 leading-relaxed">
              ¿Está seguro que desea eliminar este servicio? Dejará de estar disponible para todos los turistas.
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-4 py-2 text-xs font-bold text-textDark/60 hover:bg-black/5 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
