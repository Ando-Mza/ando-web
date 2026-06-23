'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { POI } from '@/types';
import { 
  UploadCloud, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  Loader2, 
  Check, 
  AlertTriangle
} from 'lucide-react';

export default function BusinessProfile() {
  const { pois, updatePOI, generalParams, categories } = useApp();

  // Encontrar el POI del prestador
  const myPoi = pois.find((p) => p.createdBy === 'usr-prov-1') || pois[0];

  // Estado del formulario
  const [name, setName] = useState(myPoi?.name || '');
  const [description, setDescription] = useState(myPoi?.description || '');
  const [category, setCategory] = useState(myPoi?.category || 'Enoturismo');
  const [address, setAddress] = useState(myPoi?.address || '');
  const [images, setImages] = useState<string[]>(myPoi?.images || []);

  // Estados de subida y guardado
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Imágenes predeterminadas de simulación
  const sampleUploadUrls = [
    'https://images.unsplash.com/photo-1528821128474-27f963b062bf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470158943483-e1c7a66e5590?auto=format&fit=crop&w=800&q=80',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myPoi) return;

    // Actualizar POI y cambiar su estado a 'pending' porque toda modificación pasa por auditoría
    const updatedPoi: POI = {
      ...myPoi,
      name,
      description,
      category,
      address,
      images,
      status: 'pending', // Regla de negocio: re-auditar tras edición
    };

    updatePOI(updatedPoi);
    setToastMessage('Cambios guardados. Tu POI se ha enviado a revisión por el administrador.');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  // Simular la subida directa a Cloudflare R2 (US-GIT-09)
  const simulateR2Upload = () => {
    if (images.length >= generalParams.maxImagesPerPOI) {
      alert(`Has alcanzado el límite máximo de ${generalParams.maxImagesPerPOI} imágenes configurado.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Añadir una imagen aleatoria de los samples
            const nextUrl = sampleUploadUrls[Math.floor(Math.random() * sampleUploadUrls.length)];
            // Evitar duplicados simples
            if (!images.includes(nextUrl)) {
              setImages((old) => [...old, nextUrl]);
            } else {
              setImages((old) => [...old, nextUrl + `?sig=${Date.now()}`]);
            }
            setIsUploading(false);
            setUploadProgress(0);
          }, 300);
          return 100;
        }
        return prev + 20;
      });
    }, 150);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Simular subida con el archivo arrastrado
      simulateR2Upload();
    }
  };

  const handleDeleteImage = (index: number) => {
    // Confirmación simple de seguridad para eliminar multimedia (US-GIT-11)
    if (confirm('¿Está seguro de que desea eliminar permanentemente esta imagen?')) {
      setImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-50 flex items-center space-x-2.5 bg-fillPrimary text-white px-5 py-3 rounded-xl shadow-2xl border border-white/10 animate-slide-in max-w-md">
          <Check className="h-4 w-4 text-white flex-shrink-0" />
          <span className="text-xs font-semibold leading-normal">{toastMessage}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <h3 className="font-wixDisplay text-2xl font-bold text-fillPrimary">Datos del Establecimiento</h3>
        <p className="text-sm text-textDark/60">
          Modifica el perfil del local y gestiona el contenido multimedia guardado en la nube Cloudflare R2.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
            <form onSubmit={handleSave} className="space-y-6">
              <h4 className="font-wixDisplay text-lg font-bold text-textDark mb-4 pb-2 border-b border-black/5">Información General</h4>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                    Nombre del POI / Establecimiento
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                    Categoría Turística
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm font-semibold"
                  >
                    {categories
                      .filter((cat) => cat.enabled)
                      .map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                    Dirección Física / Ubicación
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-textDark/70 mb-2">
                    Descripción Detallada (Turistas)
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-black/10 bg-bgPrimary focus:bg-white focus:outline-none transition-all text-sm leading-relaxed"
                  />
                </div>
              </div>

              {/* Warning about re-validation */}
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl border border-yellow-150 flex items-start space-x-2 text-xs leading-relaxed">
                <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Aviso Importante:</strong> Al guardar los cambios, la información de tu establecimiento quedará temporalmente en estado &quot;Pendiente de Validación&quot; y oculta para nuevos visitantes en la aplicación móvil de ANDO hasta que un administrador verifique el contenido.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-black/5">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-5 py-2.5 bg-fillPrimary hover:bg-fillPrimary/95 text-white font-bold rounded-lg text-sm shadow-md shadow-fillPrimary/10 transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar y Enviar a Auditoría</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: R2 Drag & Drop Multimedia */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm space-y-6">
            <div>
              <h4 className="font-wixDisplay text-base font-bold text-textDark">Galería Multimedia (Cloudflare R2)</h4>
              <p className="text-xs text-textDark/50">Gestiona las imágenes en el almacenamiento seguro R2</p>
            </div>

            {/* Drag and Drop Zone (US-GIT-09) */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={simulateR2Upload}
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                dragActive 
                  ? 'border-fillPrimary bg-fillPrimary/5 scale-[1.01]' 
                  : 'border-black/10 hover:border-fillPrimary/60 bg-bgPrimary/40 hover:bg-bgPrimary/60'
              }`}
            >
              <UploadCloud className="h-8 w-8 text-fillPrimary/70" />
              <div className="text-xs">
                <p className="font-bold text-textDark/80">Arrastra fotos aquí o haz clic para subir</p>
                <p className="text-[10px] text-textDark/40 mt-1">Soporta PNG, JPG de alta resolución (Máx. {generalParams.maxImagesPerPOI})</p>
              </div>
            </div>

            {/* Uploading progress animation */}
            {isUploading && (
              <div className="space-y-2 bg-bgPrimary/60 p-3 rounded-lg border border-black/5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="flex items-center text-textDark/70">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-fillPrimary mr-1.5" />
                    Subiendo archivo a Cloudflare R2...
                  </span>
                  <span className="text-fillPrimary">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-fillPrimary rounded-full transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Uploaded Images Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-textDark/60 block">Imágenes Guardadas ({images.length} / {generalParams.maxImagesPerPOI})</span>
              
              <div className="grid grid-cols-2 gap-3">
                {images.map((imgUrl, index) => (
                  <div key={index} className="group relative h-24 rounded-lg overflow-hidden border border-black/5 bg-bgPrimary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`POI Image ${index + 1}`}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    {/* Hover delete button (US-GIT-11) */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(index);
                        }}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md transition-transform hover:scale-115 cursor-pointer shadow"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {images.length === 0 && (
                  <div className="col-span-2 border border-black/5 rounded-lg py-6 flex flex-col items-center justify-center text-textDark/30 text-xs">
                    <ImageIcon className="h-5 w-5 mb-1" />
                    <span>La galería está vacía</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
