'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Save, Settings2, Globe2, Link2, ShieldCheck, Check } from 'lucide-react';

export default function AdminSettings() {
  const { 
    generalParams, 
    updateGeneralParams, 
    integrations, 
    toggleIntegration, 
    translations, 
    updateTranslation 
  } = useApp();

  const [maxImages, setMaxImages] = useState(generalParams.maxImagesPerPOI);
  const [maxSlots, setMaxSlots] = useState(generalParams.maxTimeRangesPerDay);
  const [gracePeriod, setGracePeriod] = useState(generalParams.validationGracePeriodDays);
  const [requireReview, setRequireReview] = useState(generalParams.requireReviewForEdits);

  const [activeTab, setActiveTab] = useState<'params' | 'languages' | 'integrations'>('params');
  const [selectedLang, setSelectedLang] = useState<'es' | 'en' | 'pt'>('es');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const [showToast, setShowToast] = useState(false);

  const handleSaveParams = (e: React.FormEvent) => {
    e.preventDefault();
    updateGeneralParams({
      maxImagesPerPOI: maxImages,
      maxTimeRangesPerDay: maxSlots,
      validationGracePeriodDays: gracePeriod,
      requireReviewForEdits: requireReview,
    });
    triggerToast();
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStartEditTranslation = (key: string, value: string) => {
    setEditingKey(key);
    setEditingValue(value);
  };

  const handleSaveTranslation = (key: string) => {
    updateTranslation(selectedLang, key, editingValue);
    setEditingKey(null);
    triggerToast();
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center space-x-2 bg-accentWine text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 animate-slide-in">
          <Check className="h-4 w-4 text-fillSecondary" />
          <span className="text-sm font-semibold">Configuración guardada exitosamente</span>
        </div>
      )}

      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-wixDisplay text-2xl font-bold text-accentWine">Configuración del Sistema (CYP)</h3>
          <p className="text-sm text-textDark/60">
            Administra los límites de negocio, diccionarios multiidioma e integraciones con APIs externas de ANDO.
          </p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-black/5">
        <button
          onClick={() => setActiveTab('params')}
          className={`flex items-center space-x-2 py-3.5 px-6 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'params' 
              ? 'border-fillPrimary text-fillPrimary scale-102' 
              : 'border-transparent text-textDark/50 hover:text-textDark'
          }`}
        >
          <Settings2 className="h-4 w-4" />
          <span>Parámetros Generales</span>
        </button>
        <button
          onClick={() => setActiveTab('languages')}
          className={`flex items-center space-x-2 py-3.5 px-6 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'languages' 
              ? 'border-fillPrimary text-fillPrimary scale-102' 
              : 'border-transparent text-textDark/50 hover:text-textDark'
          }`}
        >
          <Globe2 className="h-4 w-4" />
          <span>Gestión de Idiomas</span>
        </button>
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center space-x-2 py-3.5 px-6 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            activeTab === 'integrations' 
              ? 'border-fillPrimary text-fillPrimary scale-102' 
              : 'border-transparent text-textDark/50 hover:text-textDark'
          }`}
        >
          <Link2 className="h-4 w-4" />
          <span>Integraciones de API</span>
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
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm"
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
                  className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm"
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

            <div className="pt-4 border-t border-black/5 flex justify-end">
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
                            className="w-full max-w-md px-3 py-1 rounded-md border border-black/10 text-sm focus:outline-none focus:border-fillPrimary"
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

        {/* Tab 3: API Integrations (US-CYP-07) */}
        {activeTab === 'integrations' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-wixDisplay text-lg font-bold text-textDark">Conectores de APIs y Pasarelas</h4>
              <p className="text-xs text-textDark/50">Habilita o deshabilita los servicios externos conectados a ANDO</p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {integrations.map((integ) => (
                <div 
                  key={integ.id} 
                  className={`p-6 border rounded-2xl flex items-start justify-between gap-4 transition-all ${
                    integ.enabled 
                      ? 'border-green-200 bg-green-50/10' 
                      : 'border-black/5 bg-bgPrimary/30'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-textDark">{integ.name}</span>
                      <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        integ.type === 'maps' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        integ.type === 'weather' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}>
                        {integ.type === 'maps' && 'Mapas'}
                        {integ.type === 'weather' && 'Clima'}
                        {integ.type === 'payment' && 'Pago'}
                      </span>
                    </div>
                    <p className="text-xs text-textDark/60 leading-relaxed max-w-sm">
                      {integ.description}
                    </p>
                  </div>

                  {/* Switch toggle (US-CYP-07) */}
                  <button
                    type="button"
                    onClick={() => {
                      toggleIntegration(integ.id);
                      triggerToast();
                    }}
                    className={`relative inline-flex h-6.5 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      integ.enabled ? 'bg-green-600' : 'bg-black/15'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        integ.enabled ? 'translate-x-4.5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
