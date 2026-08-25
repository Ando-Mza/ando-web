'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Category, ValidationState, Integration, Etiqueta } from '@/types';
import {
  Save,
  Settings2,
  Globe2,
  Link2,
  FolderHeart,
  ListTodo,
  Check,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCcw,
  Tag
} from 'lucide-react';

export default function AdminSettings() {
  const {
    generalParams,
    updateGeneralParams,
    resetGeneralParams,
    integrations,
    updateIntegration,
    testIntegrationConnection,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    etiquetas,
    loadEtiquetas,
    addEtiqueta,
    updateEtiqueta,
    toggleEtiquetaActiva,
    deleteEtiqueta,
    validationStates,
    addValidationState,
    updateValidationState,
    deleteValidationState,
    translations,
    updateTranslation
  } = useApp();

  // Estados locales para parámetros generales
  const [maxImages, setMaxImages] = useState(generalParams.maxImagesPerPOI);
  const [maxSlots, setMaxSlots] = useState(generalParams.maxTimeRangesPerDay);
  const [gracePeriod, setGracePeriod] = useState(generalParams.validationGracePeriodDays);
  const [requireReview, setRequireReview] = useState(generalParams.requireReviewForEdits);
  const [paramError, setParamError] = useState('');

  const [activeTab, setActiveTab] = useState<'params' | 'languages' | 'categories' | 'tags' | 'states' | 'integrations'>('params');
  const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'pt'>('es');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // Estados locales para Categorías
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catEnabled, setCatEnabled] = useState(true);
  const [categoryError, setCategoryError] = useState('');

  // Estados locales para Etiquetas (US-GIT-05)
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Etiqueta | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagError, setTagError] = useState('');

  useEffect(() => {
    loadEtiquetas();
  }, []);

  // Estados locales para Estados de Validación
  const [isAddingState, setIsAddingState] = useState(false);
  const [editingState, setEditingState] = useState<ValidationState | null>(null);
  const [stateName, setStateName] = useState('');
  const [stateDesc, setStateDesc] = useState('');
  const [stateEnabled, setStateEnabled] = useState(true);
  const [stateTransitions, setStateTransitions] = useState<string[]>([]);
  const [stateError, setStateError] = useState('');

  // Estados locales para Integraciones
  const [editingIntegrationId, setEditingIntegrationId] = useState<string | null>(null);
  const [integUrl, setIntegUrl] = useState('');
  const [integKey, setIntegKey] = useState('');
  const [showIntegKeyId, setShowIntegKeyId] = useState<string | null>(null);
  const [testingConnectionId, setTestingConnectionId] = useState<string | null>(null);
  const [connectionResults, setConnectionResults] = useState<{ [id: string]: 'success' | 'error' | null }>({});

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Configuración guardada exitosamente');
  const [toastType, setToastType] = useState<'success' | 'warning'>('success');

  const triggerToast = (msg: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3500);
  };

  // Guardar Parámetros
  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    setParamError('');

    if (maxImages < 1 || maxImages > 20) {
      setParamError('El máximo de imágenes por POI debe estar entre 1 y 20.');
      return;
    }
    if (maxSlots < 1 || maxSlots > 10) {
      setParamError('El máximo de franjas horarias debe estar entre 1 y 10.');
      return;
    }
    if (gracePeriod < 0 || gracePeriod > 30) {
      setParamError('El período de gracia debe estar entre 0 y 30 días.');
      return;
    }

    updateGeneralParams({
      maxImagesPerPOI: maxImages,
      maxTimeRangesPerDay: maxSlots,
      validationGracePeriodDays: gracePeriod,
      requireReviewForEdits: requireReview,
    });
    triggerToast('Límites globales actualizados con éxito');
  };

  // Restablecer Parámetros
  const handleResetParams = () => {
    if (confirm('¿Restablecer los parámetros del sistema a los valores por defecto?')) {
      resetGeneralParams();
      setMaxImages(8);
      setMaxSlots(3);
      setGracePeriod(5);
      setRequireReview(true);
      setParamError('');
      triggerToast('Valores restablecidos a los valores por defecto');
    }
  };

  // Guardar Traducción
  const handleStartEditTranslation = (key: string, value: string) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  const handleSaveTranslation = (key: string) => {
    updateTranslation(selectedLang, key, editingValue);
    setEditingKey(null);
    triggerToast('Traducción de idioma actualizada');
  };

  // CRUD Categorías
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError('');

    if (!catName.trim()) {
      setCategoryError('El nombre de la categoría es obligatorio.');
      return;
    }

    const nameExists = categories.some(
      (c) => c.name.toLowerCase() === catName.trim().toLowerCase() && c.id !== editingCategory?.id
    );
    if (nameExists) {
      setCategoryError('Ya existe una categoría registrada con este nombre.');
      return;
    }

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: catName.trim(),
        description: catDesc.trim(),
        enabled: catEnabled,
      });
      triggerToast(`Categoría "${catName}" modificada con éxito`);
    } else {
      addCategory({
        name: catName.trim(),
        description: catDesc.trim(),
        enabled: catEnabled,
      });
      triggerToast(`Categoría "${catName}" agregada con éxito`);
    }

    setIsAddingCategory(false);
    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatEnabled(true);
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatDesc(cat.description);
    setCatEnabled(cat.enabled);
    setIsAddingCategory(true);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta categoría turística?')) {
      const success = deleteCategory(id);
      if (success) {
        triggerToast('Categoría eliminada con éxito');
      } else {
        triggerToast('No se puede eliminar la categoría porque está asociada a puntos de interés activos.', 'warning');
      }
    }
  };

  // CRUD Etiquetas (US-GIT-05)
  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    setTagError('');

    if (!tagName.trim()) {
      setTagError('El nombre de la etiqueta es obligatorio.');
      return;
    }

    const nameExists = etiquetas.some(
      (et) => et.nombre.toLowerCase() === tagName.trim().toLowerCase() && et.id !== editingTag?.id
    );
    if (nameExists) {
      setTagError('Ya existe una etiqueta registrada con este nombre.');
      return;
    }

    if (editingTag) {
      const res = await updateEtiqueta(editingTag.id, tagName.trim());
      if (res.success) {
        triggerToast(`Etiqueta "${tagName}" modificada con éxito`);
      } else {
        setTagError(res.error || 'Error al actualizar la etiqueta');
        return;
      }
    } else {
      const res = await addEtiqueta(tagName.trim());
      if (res.success) {
        triggerToast(`Etiqueta "${tagName}" agregada con éxito`);
      } else {
        setTagError(res.error || 'Error al crear la etiqueta');
        return;
      }
    }

    setIsAddingTag(false);
    setEditingTag(null);
    setTagName('');
  };

  const handleEditTag = (tag: Etiqueta) => {
    setEditingTag(tag);
    setTagName(tag.nombre);
    setIsAddingTag(true);
  };

  const handleDeleteTag = async (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta etiqueta?')) {
      const res = await deleteEtiqueta(id);
      if (res.success) {
        triggerToast('Etiqueta eliminada con éxito');
      } else {
        triggerToast(res.error || 'No se pudo eliminar la etiqueta.', 'warning');
      }
    }
  };

  // CRUD Estados de Validación
  const handleSaveState = (e: React.FormEvent) => {
    e.preventDefault();
    setStateError('');

    if (!stateName.trim()) {
      setStateError('El nombre del estado es obligatorio.');
      return;
    }

    const nameExists = validationStates.some(
      (s) => s.name.toLowerCase() === stateName.trim().toLowerCase() && s.id !== editingState?.id
    );
    if (nameExists) {
      setStateError('Ya existe un estado de validación con este nombre.');
      return;
    }

    if (editingState) {
      updateValidationState({
        ...editingState,
        name: stateName.trim(),
        description: stateDesc.trim(),
        enabled: stateEnabled,
        allowedTransitions: stateTransitions,
      });
      triggerToast(`Estado "${stateName}" modificado con éxito`);
    } else {
      addValidationState({
        name: stateName.trim(),
        description: stateDesc.trim(),
        enabled: stateEnabled,
        allowedTransitions: stateTransitions,
      });
      triggerToast(`Estado "${stateName}" agregado con éxito`);
    }

    setIsAddingState(false);
    setEditingState(null);
    setStateName('');
    setStateDesc('');
    setStateEnabled(true);
    setStateTransitions([]);
  };

  const handleEditState = (state: ValidationState) => {
    setEditingState(state);
    setStateName(state.name);
    setStateDesc(state.description);
    setStateEnabled(state.enabled);
    setStateTransitions(state.allowedTransitions || []);
    setIsAddingState(true);
  };

  const handleDeleteState = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar este estado de validación?')) {
      const success = deleteValidationState(id);
      if (success) {
        triggerToast('Estado de validación eliminado con éxito');
      } else {
        triggerToast('No se puede eliminar el estado porque está siendo utilizado por registros activos.', 'warning');
      }
    }
  };

  const handleToggleTransition = (stateId: string) => {
    setStateTransitions((prev) =>
      prev.includes(stateId) ? prev.filter((id) => id !== stateId) : [...prev, stateId]
    );
  };

  // Integraciones
  const handleStartEditIntegration = (integ: Integration) => {
    setEditingIntegrationId(integ.id);
    setIntegUrl(integ.apiUrl || '');
    setIntegKey(integ.apiKey || '');
  };

  const handleSaveIntegration = (integ: Integration) => {
    updateIntegration({
      ...integ,
      apiUrl: integUrl.trim(),
      apiKey: integKey.trim(),
    });
    setEditingIntegrationId(null);
    triggerToast(`Credenciales de "${integ.name}" guardadas`);
  };

  const handleTestConnection = async (id: string) => {
    setTestingConnectionId(id);
    try {
      const success = await testIntegrationConnection(id);
      setConnectionResults((prev) => ({
        ...prev,
        [id]: success ? 'success' : 'error',
      }));
      if (success) {
        triggerToast('Prueba de conexión exitosa', 'success');
      } else {
        triggerToast('La prueba de conexión falló. Revise sus credenciales.', 'warning');
      }
    } catch {
      setConnectionResults((prev) => ({
        ...prev,
        [id]: 'error',
      }));
      triggerToast('La prueba de conexión falló. Revise sus credenciales.', 'warning');
    } finally {
      setTestingConnectionId(null);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className={`fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 text-white px-5 py-3.5 rounded-xl shadow-2xl border border-white/10 animate-slide-in max-w-md ${
          toastType === 'success' ? 'bg-accentWine' : 'bg-orange-600'
        }`}>
          {toastType === 'success' ? (
            <Check className="h-4.5 w-4.5 text-fillSecondary flex-shrink-0" />
          ) : (
            <AlertTriangle className="h-4.5 w-4.5 text-white flex-shrink-0" />
          )}
          <span className="text-xs font-semibold leading-normal">{toastMessage}</span>
        </div>
      )}

      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-wixDisplay text-2xl font-bold text-accentWine">Configuración del sistema (CYP)</h3>
          <p className="text-sm text-textDark/70 mt-1">
            Administra los límites de negocio, diccionarios multiidioma, categorías, flujos de revisión e integraciones de ANDO.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-black/5 overflow-x-auto scrollbar-thin">
        <button
          onClick={() => setActiveTab('params')}
          className={`flex items-center space-x-2 py-3.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeTab === 'params'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark'
          }`}
        >
          <Settings2 className="h-4 w-4" />
          <span>Parámetros generales</span>
        </button>
        <button
          onClick={() => setActiveTab('languages')}
          className={`flex items-center space-x-2 py-3.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeTab === 'languages'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark'
          }`}
        >
          <Globe2 className="h-4 w-4" />
          <span>Idiomas y traducción</span>
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center space-x-2 py-3.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeTab === 'categories'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark'
          }`}
        >
          <FolderHeart className="h-4 w-4" />
          <span>Categorías</span>
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`flex items-center space-x-2 py-3.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeTab === 'tags'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>Etiquetas turísticas</span>
        </button>
        <button
          onClick={() => setActiveTab('states')}
          className={`flex items-center space-x-2 py-3.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeTab === 'states'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark'
          }`}
        >
          <ListTodo className="h-4 w-4" />
          <span>Estados de validación</span>
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center space-x-2 py-3.5 px-5 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accentWine ${
            activeTab === 'integrations'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark'
          }`}
        >
          <Link2 className="h-4 w-4" />
          <span>Integraciones y APIs</span>
        </button>
      </div>

      {/* Content Tabs Area */}
      <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">

        {/* Tab 1: General Parameters (US-CYP-01) */}
        {activeTab === 'params' && (
          <form onSubmit={handleSaveParams} className="space-y-6 max-w-2xl">
            <h4 className="font-wixDisplay text-lg font-bold text-textDark mb-4">Límites y Variables Globales</h4>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Máximo de Imágenes por POI
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={maxImages}
                  onChange={(e) => setMaxImages(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Máximo de Franjas Horarias por Día
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={maxSlots}
                  onChange={(e) => setMaxSlots(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                  Período de Gracia de Validación (Días)
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={gracePeriod}
                  onChange={(e) => setGracePeriod(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold"
                />
              </div>

              <div className="flex items-center pt-6">
                <input
                  type="checkbox"
                  id="requireReview"
                  checked={requireReview}
                  onChange={(e) => setRequireReview(e.target.checked)}
                  className="h-4.5 w-4.5 rounded text-fillPrimary border-black/10 focus:ring-fillPrimary focus:ring-opacity-25"
                />
                <label htmlFor="requireReview" className="ml-2.5 text-sm font-semibold text-textDark/80 cursor-pointer">
                  Requerir revisión manual de modificaciones
                </label>
              </div>
            </div>

            {paramError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center space-x-2 border border-red-200 animate-shake">
                <AlertTriangle className="h-4 w-4" />
                <span>{paramError}</span>
              </div>
            )}

            <div className="pt-5 border-t border-black/5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetParams}
                className="flex items-center space-x-1.5 px-4 py-2.5 border border-black/10 hover:bg-black/5 text-textDark/70 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Restablecer Valores por Defecto</span>
              </button>

              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-sm shadow-md shadow-fillPrimary/10 transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>Guardar Parámetros</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Translation Manager (US-CYP-02) */}
        {activeTab === 'languages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Diccionario de Idiomas</h4>
                <p className="text-xs text-textDark/50">Edita los literales de traducción de la plataforma</p>
              </div>

              {/* Language Selection */}
              <div className="flex space-x-2">
                {(['es', 'en', 'pt'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLang(lang);
                      setEditingKey(null);
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-accentWine text-white border-accentWine shadow-sm'
                        : 'bg-bgPrimary text-textDark/60 border-black/5 hover:bg-black/5'
                    }`}
                  >
                    {lang === 'es' && 'Español (ES)'}
                    {lang === 'en' && 'English (EN)'}
                    {lang === 'pt' && 'Português (PT)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Translation Keys Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-textDark/60 text-xs font-bold uppercase tracking-wider">
                    <th className="py-2.5">Llave de Traducción (Key)</th>
                    <th className="py-2.5">Literal Traducido</th>
                    <th className="py-2.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {Object.entries(translations[selectedLang] || {}).map(([key, val]) => (
                    <tr key={key} className="hover:bg-bgPrimary/20">
                      <td className="py-3 font-mono text-xs text-accentWine">{key}</td>
                      <td className="py-3">
                        {editingKey === key ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="w-full max-w-md px-3 py-1.5 rounded-md border border-black/10 text-sm focus:outline-none focus:border-fillPrimary"
                          />
                        ) : (
                          <span className="text-textDark/80 font-medium">{val}</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {editingKey === key ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingKey(null)}
                              className="px-2.5 py-1 text-xs border border-black/10 rounded-md hover:bg-black/5 font-semibold text-textDark/70 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveTranslation(key)}
                              className="px-2.5 py-1 text-xs bg-fillPrimary text-white rounded-md hover:bg-fillPrimary/95 font-semibold cursor-pointer"
                            >
                              Guardar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEditTranslation(key, val)}
                            className="text-xs text-fillPrimary hover:text-fillPrimary/80 font-bold hover:underline cursor-pointer"
                          >
                            Modificar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Tourist Categories Tab (US-CYP-03) */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Categorías Turísticas</h4>
                <p className="text-xs text-textDark/50">Clasificación de puntos de interés y actividades turísticas</p>
              </div>

              {!isAddingCategory && (
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCatName('');
                    setCatDesc('');
                    setCatEnabled(true);
                    setIsAddingCategory(true);
                    setCategoryError('');
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-xs shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Categoría</span>
                </button>
              )}
            </div>

            {isAddingCategory ? (
              <form onSubmit={handleSaveCategory} className="bg-bgPrimary/40 border border-black/5 rounded-2xl p-6 space-y-4 max-w-2xl">
                <h5 className="font-wixDisplay text-sm font-bold text-accentWine uppercase tracking-wider mb-2">
                  {editingCategory ? 'Modificar Categoría' : 'Agregar Nueva Categoría'}
                </h5>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                      Nombre de la Categoría
                    </label>
                    <input
                      type="text"
                      required
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="Ej: Enoturismo"
                      className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-fillPrimary text-sm"
                    />
                  </div>

                  <div className="flex items-center sm:pt-6">
                    <input
                      type="checkbox"
                      id="catEnabled"
                      checked={catEnabled}
                      onChange={(e) => setCatEnabled(e.target.checked)}
                      className="h-4.5 w-4.5 rounded text-fillPrimary border-black/10 focus:ring-fillPrimary focus:ring-opacity-25"
                    />
                    <label htmlFor="catEnabled" className="ml-2.5 text-sm font-semibold text-textDark/80 cursor-pointer">
                      Categoría Activa
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                      Descripción de la Categoría
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      placeholder="Ej: Visitas a bodegas, degustaciones de vinos y almuerzos..."
                      className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-fillPrimary text-sm leading-relaxed"
                    />
                  </div>
                </div>

                {categoryError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center space-x-2 border border-red-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{categoryError}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3.5 pt-3 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(false)}
                    className="px-4 py-2 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-fillPrimary/10"
                  >
                    {editingCategory ? 'Guardar Cambios' : 'Registrar Categoría'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-textDark/60 text-xs font-bold uppercase tracking-wider">
                      <th className="py-2.5">Nombre</th>
                      <th className="py-2.5">Descripción</th>
                      <th className="py-2.5">Estado</th>
                      <th className="py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-bgPrimary/20">
                        <td className="py-3 font-semibold text-textDark">{cat.name}</td>
                        <td className="py-3 text-textDark/70 max-w-sm truncate" title={cat.description}>
                          {cat.description}
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => updateCategory({ ...cat, enabled: !cat.enabled })}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              cat.enabled
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {cat.enabled ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="inline-flex p-1.5 text-textDark/50 hover:text-accentWine hover:bg-black/5 rounded-md transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="inline-flex p-1.5 text-textDark/50 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3.5: Tags Tab (US-GIT-05) */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Etiquetas Turísticas</h4>
                <p className="text-xs text-textDark/50">Palabras clave para optimizar la búsqueda y recomendación de POIs</p>
              </div>

              {!isAddingTag && (
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setTagName('');
                    setTagError('');
                    setIsAddingTag(true);
                  }}
                  className="inline-flex items-center space-x-2 px-3.5 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-fillPrimary/10"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nueva Etiqueta</span>
                </button>
              )}
            </div>

            {isAddingTag ? (
              <form onSubmit={handleSaveTag} className="bg-bgPrimary/30 rounded-xl p-5 border border-black/5 space-y-4 max-w-xl">
                <h5 className="font-bold text-sm text-textDark">
                  {editingTag ? 'Editar Etiqueta' : 'Crear Nueva Etiqueta Turística'}
                </h5>

                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70">
                    Nombre de la Etiqueta *
                  </label>
                  <input
                    type="text"
                    required
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="Ej: Pet Friendly, Accesible, Degustación, WiFi..."
                    className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-fillPrimary text-sm font-semibold"
                  />
                </div>

                {tagError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center space-x-2 border border-red-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{tagError}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3.5 pt-3 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsAddingTag(false)}
                    className="px-4 py-2 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-fillPrimary/10"
                  >
                    {editingTag ? 'Guardar Cambios' : 'Registrar Etiqueta'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-textDark/60 text-xs font-bold uppercase tracking-wider">
                      <th className="py-2.5">Nombre</th>
                      <th className="py-2.5">Estado</th>
                      <th className="py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {etiquetas.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-xs text-textDark/50">
                          No hay etiquetas turísticas registradas.
                        </td>
                      </tr>
                    ) : (
                      etiquetas.map((tag) => (
                        <tr key={tag.id} className="hover:bg-bgPrimary/20">
                          <td className="py-3 font-semibold text-textDark">
                            <span className="bg-bgPrimary px-2.5 py-1 rounded-md text-xs font-mono font-bold text-textDark">
                              #{tag.nombre}
                            </span>
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => toggleEtiquetaActiva(tag.id, !tag.activa)}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                                tag.activa
                                  ? 'bg-green-50 text-green-700 border-green-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {tag.activa ? 'Activa' : 'Inactiva'}
                            </button>
                          </td>
                          <td className="py-3 text-right space-x-2">
                            <button
                              onClick={() => handleEditTag(tag)}
                              className="inline-flex p-1.5 text-textDark/50 hover:text-accentWine hover:bg-black/5 rounded-md transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              className="inline-flex p-1.5 text-textDark/50 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Validation States Tab (US-CYP-04) */}
        {activeTab === 'states' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 pb-4">
              <div>
                <h4 className="font-wixDisplay text-lg font-bold text-textDark">Estados de Validación</h4>
                <p className="text-xs text-textDark/50">Define los estados y flujos de transición del ciclo de moderación</p>
              </div>

              {!isAddingState && (
                <button
                  onClick={() => {
                    setEditingState(null);
                    setStateName('');
                    setStateDesc('');
                    setStateEnabled(true);
                    setStateTransitions([]);
                    setIsAddingState(true);
                    setStateError('');
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-xs shadow-sm transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Nuevo Estado</span>
                </button>
              )}
            </div>

            {isAddingState ? (
              <form onSubmit={handleSaveState} className="bg-bgPrimary/40 border border-black/5 rounded-2xl p-6 space-y-5 max-w-2xl">
                <h5 className="font-wixDisplay text-sm font-bold text-accentWine uppercase tracking-wider mb-2">
                  {editingState ? 'Modificar Estado' : 'Agregar Nuevo Estado de Validación'}
                </h5>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                      Nombre del Estado
                    </label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      placeholder="Ej: En Revisión"
                      className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-fillPrimary text-sm"
                    />
                  </div>

                  <div className="flex items-center sm:pt-6">
                    <input
                      type="checkbox"
                      id="stateEnabled"
                      checked={stateEnabled}
                      onChange={(e) => setStateEnabled(e.target.checked)}
                      className="h-4.5 w-4.5 rounded text-fillPrimary border-black/10 focus:ring-fillPrimary focus:ring-opacity-25"
                    />
                    <label htmlFor="stateEnabled" className="ml-2.5 text-sm font-semibold text-textDark/80 cursor-pointer">
                      Estado Activo
                    </label>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-1.5">
                      Descripción del Estado
                    </label>
                    <input
                      type="text"
                      required
                      value={stateDesc}
                      onChange={(e) => setStateDesc(e.target.value)}
                      placeholder="Ej: Contenido que un administrador está verificando en este momento."
                      className="w-full px-3 py-2 rounded-lg border border-black/10 bg-white focus:outline-none focus:border-fillPrimary text-sm"
                    />
                  </div>

                  {/* Transition Rules Checklist */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                      Transiciones Permitidas (Flujo)
                    </label>
                    <p className="text-[10px] text-textDark/50 mb-3">Seleccione a qué estados se puede avanzar desde este estado:</p>
                    <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-black/10">
                      {validationStates.map((st) => (
                        <div key={st.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`trans-${st.id}`}
                            checked={stateTransitions.includes(st.id)}
                            onChange={() => handleToggleTransition(st.id)}
                            className="h-4 w-4 rounded text-accentWine border-black/10 focus:ring-accentWine"
                          />
                          <label htmlFor={`trans-${st.id}`} className="ml-2 text-xs font-semibold text-textDark/80 cursor-pointer">
                            {st.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {stateError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg text-xs font-bold flex items-center space-x-2 border border-red-200">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{stateError}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3.5 pt-3 border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setIsAddingState(false)}
                    className="px-4 py-2 border border-black/10 text-textDark/70 hover:bg-black/5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-fillPrimary hover:bg-fillPrimary/95 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm shadow-fillPrimary/10"
                  >
                    {editingState ? 'Guardar Cambios' : 'Registrar Estado'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-textDark/60 text-xs font-bold uppercase tracking-wider">
                      <th className="py-2.5">Estado de Validación</th>
                      <th className="py-2.5">Descripción</th>
                      <th className="py-2.5">Flujo (Destinos Permitidos)</th>
                      <th className="py-2.5">Estado</th>
                      <th className="py-2.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {validationStates.map((st) => (
                      <tr key={st.id} className="hover:bg-bgPrimary/20">
                        <td className="py-3 font-semibold text-textDark">{st.name}</td>
                        <td className="py-3 text-textDark/70 max-w-xs truncate" title={st.description}>
                          {st.description}
                        </td>
                        <td className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {st.allowedTransitions && st.allowedTransitions.length > 0 ? (
                              st.allowedTransitions.map((tId) => (
                                <span key={tId} className="inline-flex px-1.5 py-0.5 bg-accentWine/5 text-accentWine rounded text-[9px] font-semibold border border-accentWine/5">
                                  {validationStates.find((s) => s.id === tId)?.name || tId}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-textDark/30 font-medium">Ninguno (Fin del flujo)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3">
                          <button
                            onClick={() => updateValidationState({ ...st, enabled: !st.enabled })}
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              st.enabled
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {st.enabled ? 'Activa' : 'Inactiva'}
                          </button>
                        </td>
                        <td className="py-3 text-right space-x-2">
                          <button
                            onClick={() => handleEditState(st)}
                            className="inline-flex p-1.5 text-textDark/50 hover:text-accentWine hover:bg-black/5 rounded-md transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteState(st.id)}
                            className="inline-flex p-1.5 text-textDark/50 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: API Integrations Tab (US-CYP-07) */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-wixDisplay text-lg font-bold text-textDark">Conectores de APIs Externas</h4>
              <p className="text-xs text-textDark/50">Habilita y administra las credenciales de los servicios externos conectados a ANDO</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {integrations.map((integ) => {
                const isEditing = editingIntegrationId === integ.id;
                const showKey = showIntegKeyId === integ.id;
                const connectionResult = connectionResults[integ.id] || null;
                const isTesting = testingConnectionId === integ.id;

                return (
                  <div
                    key={integ.id}
                    className={`p-6 border rounded-2xl flex flex-col justify-between gap-4 transition-all ${
                      integ.enabled
                        ? 'border-green-200 bg-green-50/5'
                        : 'border-black/5 bg-bgPrimary/30'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-sm text-textDark">{integ.name}</span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              integ.type === 'maps'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-orange-50 text-orange-700 border border-orange-200'
                            }`}>
                              {integ.type === 'maps' ? 'Mapas' : 'Clima'}
                            </span>
                          </div>
                          <p className="text-xs text-textDark/60 leading-relaxed max-w-sm">
                            {integ.description}
                          </p>
                        </div>

                        {/* Enable Switch Toggle */}
                        <button
                          type="button"
                          onClick={() => {
                            updateIntegration({ ...integ, enabled: !integ.enabled });
                            triggerToast(`Servicio "${integ.name}" ${!integ.enabled ? 'habilitado' : 'deshabilitado'}`);
                          }}
                          className={`relative inline-flex h-6 w-10.5 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            integ.enabled ? 'bg-green-600' : 'bg-black/15'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              integ.enabled ? 'translate-x-4.5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Credentials Input form */}
                      {integ.enabled && (
                        <div className="bg-bgPrimary/50 p-4 rounded-xl border border-black/5 space-y-3">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50 mb-1">
                              API URL base
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={integUrl}
                                onChange={(e) => setIntegUrl(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white border border-black/10 rounded-md text-xs focus:outline-none focus:border-fillPrimary"
                              />
                            ) : (
                              <span className="text-xs font-semibold text-textDark/80 font-mono break-all">
                                {integ.apiUrl || 'No configurada'}
                              </span>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-textDark/50 mb-1">
                              API Token / Credencial
                            </label>
                            <div className="flex items-center space-x-1.5">
                              {isEditing ? (
                                <div className="flex-1 relative">
                                  <input
                                    type={showKey ? 'text' : 'password'}
                                    value={integKey}
                                    onChange={(e) => setIntegKey(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-white border border-black/10 rounded-md text-xs focus:outline-none focus:border-fillPrimary pr-8"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowIntegKeyId(showKey ? null : integ.id)}
                                    className="absolute right-2.5 top-1.5 text-textDark/40 hover:text-textDark cursor-pointer"
                                  >
                                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-xs font-semibold text-textDark/85 font-mono flex-1">
                                    {integ.apiKey
                                      ? showKey
                                        ? integ.apiKey
                                        : '••••••••••••••••••••••••••••••••'
                                      : 'Sin clave cargada'}
                                  </span>
                                  {integ.apiKey && (
                                    <button
                                      type="button"
                                      onClick={() => setShowIntegKeyId(showKey ? null : integ.id)}
                                      className="p-1 hover:bg-black/5 rounded text-textDark/60 cursor-pointer"
                                    >
                                      {showKey ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* API Footer Tools */}
                    {integ.enabled && (
                      <div className="pt-3 border-t border-black/5 flex items-center justify-between">
                        {/* Testing Connectivity */}
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            disabled={isTesting}
                            onClick={() => handleTestConnection(integ.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 border border-black/10 hover:bg-black/5 text-textDark/70 font-semibold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isTesting ? (
                              <RefreshCw className="h-3.5 w-3.5 animate-spin text-fillPrimary" />
                            ) : (
                              <Play className="h-3.5 w-3.5 text-fillSecondary" />
                            )}
                            <span>Probar Conexión</span>
                          </button>

                          {connectionResult === 'success' && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded text-[9px] font-bold uppercase">
                              Conectado
                            </span>
                          )}
                          {connectionResult === 'error' && (
                            <span className="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded text-[9px] font-bold uppercase">
                              Error de Conexión
                            </span>
                          )}
                        </div>

                        {/* Save Edit Credentials */}
                        <div>
                          {isEditing ? (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingIntegrationId(null)}
                                className="px-2.5 py-1 text-xs border border-black/10 rounded-md hover:bg-black/5 font-semibold text-textDark/70 cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => handleSaveIntegration(integ)}
                                className="px-2.5 py-1 text-xs bg-fillPrimary text-white rounded-md hover:bg-fillPrimary/95 font-semibold cursor-pointer"
                              >
                                Guardar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleStartEditIntegration(integ)}
                              className="text-xs text-fillPrimary hover:underline font-bold cursor-pointer"
                            >
                              Editar Credenciales
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

