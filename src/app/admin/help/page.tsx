'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  HelpCircle, 
  BookOpen, 
  ShieldCheck, 
  Settings, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Tag,
  Search,
  Check,
  X,
  Layers,
  FileText,
  Eye,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { api } from '@/utils/api';
import { AyudaCategoria, AyudaArticulo, AyudaArticuloTipo } from '@/types';
import OnboardingTutorialModal from '@/components/common/OnboardingTutorialModal';
import ErrorReportModal from '@/components/common/ErrorReportModal';

export default function AdminHelpPage() {
  const { currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  // Navegación de pestañas principales: manual, consultas, gestion
  const [activeTab, setActiveTab] = useState<'manual' | 'consultas' | 'gestion'>('manual');
  const [manualContent, setManualContent] = useState('');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Modales de herramientas existentes
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isErrorReportOpen, setIsErrorReportOpen] = useState(false);

  // Estados de datos remotos de Ayuda
  const [categorias, setCategorias] = useState<AyudaCategoria[]>([]);
  const [articulos, setArticulos] = useState<AyudaArticulo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Estados de visualización y filtrado
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedCategoriaFilter, setSelectedCategoriaFilter] = useState<string>('all');
  const [selectedTipoFilter, setSelectedTipoFilter] = useState<string>('all');

  // Modales de Gestión Administrativa (US-AYS-06)
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AyudaCategoria | null>(null);
  const [catNombre, setCatNombre] = useState('');
  const [catDescripcion, setCatDescripcion] = useState('');
  const [catActivo, setCatActivo] = useState(true);
  const [catFormErrors, setCatFormErrors] = useState<{ nombre?: string }>({});
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);

  const [isArtModalOpen, setIsArtModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<AyudaArticulo | null>(null);
  const [artTitulo, setArtTitulo] = useState('');
  const [artCategoriaId, setArtCategoriaId] = useState('');
  const [artTipo, setArtTipo] = useState<AyudaArticuloTipo>('MANUAL');
  const [artContenido, setArtContenido] = useState('');
  const [artPalabrasClaveInput, setArtPalabrasClaveInput] = useState('');
  const [artRolesPermitidos, setArtRolesPermitidos] = useState<string[]>(['turista', 'prestador', 'administrador']);
  const [artActivo, setArtActivo] = useState(true);
  const [artFormErrors, setArtFormErrors] = useState<{
    titulo?: string;
    categoriaId?: string;
    contenido?: string;
    roles?: string;
  }>({});
  const [isSubmittingArt, setIsSubmittingArt] = useState(false);

  // Feedback de éxito temporal
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Errores de guardado (se muestran dentro del formulario) y de acciones sobre la lista
  const [catSubmitError, setCatSubmitError] = useState<string | null>(null);
  const [artSubmitError, setArtSubmitError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Confirmación de acciones sensibles (desactivar / eliminar)
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    destructive: boolean;
    run: () => Promise<void>;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // Preguntas frecuentes publicadas para el rol Administrador (cargadas desde la gestión de ayuda)
  const faqsAdmin = useMemo(
    () =>
      articulos.filter(
        (a) =>
          a.tipo === 'FAQ' &&
          a.activo &&
          (a.rolesPermitidos || []).some((rol) => rol.toLowerCase() === 'administrador')
      ),
    [articulos]
  );

  // Carga de datos desde Backend  // Carga de datos desde Backend
  const loadAyudaData = useCallback(async () => {
    setIsLoadingData(true);
    setDataError(null);
    try {
      // El Administrador ve todo el contenido, incluido el inactivo, para poder gestionarlo
      const [cats, arts] = await Promise.all(
        isAdmin
          ? [api.getAyudaCategoriasAdmin(), api.getAyudaArticulosAdmin()]
          : [api.getAyudaCategorias(), api.getAyudaArticulos()]
      );
      setCategorias(Array.isArray(cats) ? cats : []);
      setArticulos(Array.isArray(arts) ? arts : []);
    } catch (err) {
      setDataError(
        err instanceof Error && err.message
          ? err.message
          : 'No se pudo cargar el contenido de ayuda.'
      );
    } finally {
      setIsLoadingData(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadAyudaData();
  }, [loadAyudaData]);

  const showSuccess = (msg: string) => {
    setActionError(null);
    setSuccessBanner(msg);
    setTimeout(() => setSuccessBanner(null), 5000);
  };

  const errorMessage = (err: unknown, fallback: string) =>
    err instanceof Error && err.message ? err.message : fallback;

  const handleConfirmAction = async () => {
    if (!confirmAction || isConfirming) return;
    setIsConfirming(true);
    setActionError(null);
    try {
      await confirmAction.run();
      setConfirmAction(null);
      await loadAyudaData();
    } catch (err) {
      setConfirmAction(null);
      setActionError(errorMessage(err, 'No se pudo completar la acción. Intentá nuevamente.'));
    } finally {
      setIsConfirming(false);
    }
  };

  // ----------------------------------------------------
  // GESTIÓN DE CATEGORÍAS (US-AYS-06)
  // ----------------------------------------------------
  const handleOpenCatModal = (cat?: AyudaCategoria) => {
    if (cat) {
      setEditingCategory(cat);
      setCatNombre(cat.nombre);
      setCatDescripcion(cat.descripcion || '');
      setCatActivo(cat.activo);
    } else {
      setEditingCategory(null);
      setCatNombre('');
      setCatDescripcion('');
      setCatActivo(true);
    }
    setCatFormErrors({});
    setCatSubmitError(null);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { nombre?: string } = {};

    if (isSubmittingCat) return;

    const nombre = catNombre.trim();
    if (nombre.length < 2) {
      errors.nombre = 'El nombre es obligatorio y debe tener al menos 2 caracteres.';
    } else if (nombre.length > 120) {
      errors.nombre = 'El nombre no puede superar los 120 caracteres.';
    } else if (
      categorias.some(
        (c) => c.id !== editingCategory?.id && c.nombre.trim().toLowerCase() === nombre.toLowerCase()
      )
    ) {
      errors.nombre = 'Ya existe una categoría con ese nombre.';
    }

    if (Object.keys(errors).length > 0) {
      setCatFormErrors(errors);
      return;
    }

    setCatSubmitError(null);
    setIsSubmittingCat(true);
    try {
      if (editingCategory) {
        await api.updateAyudaCategoria(editingCategory.id, {
          nombre: catNombre.trim(),
          // Se envía también vacía, para poder borrar una descripción ya cargada
          descripcion: catDescripcion.trim(),
          activo: catActivo,
        });
        showSuccess('Categoría de ayuda actualizada correctamente.');
      } else {
        await api.createAyudaCategoria({
          nombre: catNombre.trim(),
          descripcion: catDescripcion.trim() || undefined,
          activo: catActivo,
        });
        showSuccess('Categoría de ayuda creada correctamente.');
      }
      setIsCatModalOpen(false);
      await loadAyudaData();
    } catch (err) {
      setCatSubmitError(errorMessage(err, 'No se pudo guardar la categoría. Intentá nuevamente.'));
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleToggleCatActivo = (cat: AyudaCategoria) => {
    setConfirmAction({
      title: cat.activo ? 'Desactivar categoría' : 'Reactivar categoría',
      message: cat.activo
        ? `Los artículos de "${cat.nombre}" van a dejar de mostrarse a los usuarios hasta que la reactives.`
        : `La categoría "${cat.nombre}" y sus artículos activos van a volver a mostrarse a los usuarios.`,
      confirmLabel: cat.activo ? 'Desactivar' : 'Reactivar',
      destructive: cat.activo,
      run: async () => {
        await api.updateAyudaCategoria(cat.id, { activo: !cat.activo });
        showSuccess(`Categoría "${cat.nombre}" ${cat.activo ? 'desactivada' : 'reactivada'}.`);
      },
    });
  };

  const handleDeleteCategory = (cat: AyudaCategoria) => {
    const cantidad = articulos.filter((a) => a.categoriaId === cat.id).length;
    if (cantidad > 0) {
      setSuccessBanner(null);
      setActionError(
        `No se puede eliminar "${cat.nombre}" porque tiene ${cantidad} artículo(s). Eliminá o mové esos artículos primero, o desactivá la categoría.`
      );
      return;
    }
    setConfirmAction({
      title: 'Eliminar categoría',
      message: `Vas a eliminar la categoría "${cat.nombre}" de forma permanente. Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      destructive: true,
      run: async () => {
        await api.deleteAyudaCategoria(cat.id);
        showSuccess(`Categoría "${cat.nombre}" eliminada.`);
      },
    });
  };

  // ----------------------------------------------------
  // GESTIÓN DE ARTÍCULOS (US-AYS-06)
  // ----------------------------------------------------
  const handleOpenArtModal = (art?: AyudaArticulo) => {
    if (art) {
      setEditingArticle(art);
      setArtTitulo(art.titulo);
      setArtCategoriaId(art.categoriaId);
      setArtTipo(art.tipo);
      setArtContenido(art.contenido);
      setArtPalabrasClaveInput((art.palabrasClave || []).join(', '));
      setArtRolesPermitidos(art.rolesPermitidos || ['turista', 'prestador', 'administrador']);
      setArtActivo(art.activo);
    } else {
      setEditingArticle(null);
      setArtTitulo('');
      setArtCategoriaId(categorias[0]?.id || '');
      setArtTipo('MANUAL');
      setArtContenido('');
      setArtPalabrasClaveInput('');
      setArtRolesPermitidos(['turista', 'prestador', 'administrador']);
      setArtActivo(true);
    }
    setArtFormErrors({});
    setArtSubmitError(null);
    setIsArtModalOpen(true);
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: {
      titulo?: string;
      categoriaId?: string;
      contenido?: string;
      roles?: string;
    } = {};

    if (isSubmittingArt) return;

    if (!artTitulo.trim() || artTitulo.trim().length < 2) {
      errors.titulo = 'El título es obligatorio (mínimo 2 caracteres).';
    } else if (artTitulo.trim().length > 200) {
      errors.titulo = 'El título no puede superar los 200 caracteres.';
    }
    if (!artCategoriaId) {
      errors.categoriaId = 'Debe seleccionar una categoría de ayuda existente.';
    }
    if (!artContenido.trim()) {
      errors.contenido = 'El contenido descriptivo / paso a paso es obligatorio.';
    }
    if (artRolesPermitidos.length === 0) {
      errors.roles = 'Debe seleccionar al menos un rol permitido.';
    }

    if (Object.keys(errors).length > 0) {
      setArtFormErrors(errors);
      return;
    }

    setArtSubmitError(null);
    setIsSubmittingArt(true);
    try {
      const palabrasClave = artPalabrasClaveInput
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0);

      if (editingArticle) {
        await api.updateAyudaArticulo(editingArticle.id, {
          categoriaId: artCategoriaId,
          tipo: artTipo,
          titulo: artTitulo.trim(),
          contenido: artContenido.trim(),
          palabrasClave,
          rolesPermitidos: artRolesPermitidos,
          activo: artActivo,
        });
        showSuccess('Artículo de ayuda actualizado correctamente.');
      } else {
        await api.createAyudaArticulo({
          categoriaId: artCategoriaId,
          tipo: artTipo,
          titulo: artTitulo.trim(),
          contenido: artContenido.trim(),
          palabrasClave,
          rolesPermitidos: artRolesPermitidos,
          activo: artActivo,
        });
        showSuccess('Artículo de ayuda creado correctamente.');
      }
      setIsArtModalOpen(false);
      await loadAyudaData();
    } catch (err) {
      setArtSubmitError(errorMessage(err, 'No se pudo guardar el artículo. Intentá nuevamente.'));
    } finally {
      setIsSubmittingArt(false);
    }
  };

  const handleToggleArtActivo = (art: AyudaArticulo) => {
    setConfirmAction({
      title: art.activo ? 'Desactivar artículo' : 'Reactivar artículo',
      message: art.activo
        ? `"${art.titulo}" va a dejar de mostrarse a los usuarios hasta que lo reactives.`
        : `"${art.titulo}" va a volver a mostrarse a los roles seleccionados.`,
      confirmLabel: art.activo ? 'Desactivar' : 'Reactivar',
      destructive: art.activo,
      run: async () => {
        await api.updateAyudaArticulo(art.id, { activo: !art.activo });
        showSuccess(`Artículo "${art.titulo}" ${art.activo ? 'desactivado' : 'reactivado'}.`);
      },
    });
  };

  const handleDeleteArticle = (art: AyudaArticulo) => {
    setConfirmAction({
      title: 'Eliminar artículo',
      message: `Vas a eliminar "${art.titulo}" de forma permanente. Esta acción no se puede deshacer. Si solo querés ocultarlo, usá "Desactivar".`,
      confirmLabel: 'Eliminar',
      destructive: true,
      run: async () => {
        await api.deleteAyudaArticulo(art.id);
        showSuccess(`Artículo "${art.titulo}" eliminado.`);
      },
    });
  };

  // Filtrado de artículos para la vista de gestión o de consulta
  const filteredArticles = useMemo(() => {
    return articulos.filter((art) => {
      if (selectedCategoriaFilter !== 'all' && art.categoriaId !== selectedCategoriaFilter) {
        return false;
      }
      if (selectedTipoFilter !== 'all' && art.tipo !== selectedTipoFilter) {
        return false;
      }
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const matchesTitle = art.titulo.toLowerCase().includes(q);
        const matchesContent = art.contenido.toLowerCase().includes(q);
        const matchesKeywords = (art.palabrasClave || []).some((kw) => kw.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesKeywords) return false;
      }
      return true;
    });
  }, [articulos, selectedCategoriaFilter, selectedTipoFilter, searchFilter]);
  useEffect(() => {
    fetch('/manual/manual_usuario_ando_admin.md')
      .then((r) => r.text())
      .then((text) => setManualContent(text))
      .catch(() => setManualContent('No se pudo cargar el manual del administrador.'));
  }, []);

  return (
    <div className="space-y-8 font-wixText">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/20 rounded-3xl p-6 sm:p-8">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-accentWine/10 border border-accentWine/20 px-3 py-1 rounded-full text-xs font-bold text-accentWine">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Manual del Administrador y Centro de Gestión de Contenido</span>
          </div>
          <h2 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
            Manual de Usuario y Soporte Administrativo
          </h2>
          <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
            Documentación técnica y operativa para la validación de contenidos turísticos, administración de cuentas y gestión activa de artículos de ayuda y soporte.
          </p>
        </div>
      </div>

      {/* Notificación de éxito */}
      {successBanner && (
        <div role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center space-x-2 shadow-xs animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successBanner}</span>
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs flex items-start justify-between gap-3" role="alert">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{actionError}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionError(null)}
            aria-label="Cerrar aviso"
            className="p-1 rounded-lg hover:bg-red-100 cursor-pointer flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Pestañas de Navegación: Manual vs Guía/FAQs vs Gestión Administrativa (US-AYS-06) */}
      <div className="flex border-b border-black/10 gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`pb-3 px-4 font-wixDisplay text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'manual'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Manual del Administrador</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('consultas')}
          className={`pb-3 px-4 font-wixDisplay text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'consultas'
              ? 'border-accentWine text-accentWine'
              : 'border-transparent text-textDark/60 hover:text-textDark'
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Guía Rápida y Preguntas Frecuentes</span>
        </button>
        {isAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('gestion')}
            className={`pb-3 px-4 font-wixDisplay text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'gestion'
                ? 'border-accentWine text-accentWine'
                : 'border-transparent text-textDark/60 hover:text-textDark'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Gestión de Artículos y Categorías</span>
          </button>
        )}
      </div>

      {/* Interactive Tools Cards: US-AYS-04 & US-AYS-05 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-accentWine/10 via-white to-white rounded-3xl border border-accentWine/20 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-accentWine">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Ayuda Visual Interactiva</span>
            </div>
            <h3 className="font-wixDisplay text-lg font-bold text-textDark">
              Tutorial Onboarding para Administradores
            </h3>
            <p className="text-xs text-textDark/70 leading-relaxed">
              Repasa paso a paso cada una de las funcionalidades de tu consola: validación de POIs, gestión de prestadores, configuración CYP y reportes consolidados.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOnboardingOpen(true)}
            className="w-fit inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-accentWine text-white font-bold text-xs shadow-md hover:bg-accentWine/90 transition cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>Iniciar Tutorial de Onboarding</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 via-white to-white rounded-3xl border border-red-500/20 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Centro de Incidentes</span>
            </div>
            <h3 className="font-wixDisplay text-lg font-bold text-textDark">
              Reporte de Errores por el Usuario
            </h3>
            <p className="text-xs text-textDark/70 leading-relaxed">
              ¿Encontraste un fallo técnico o un problema visual en el sistema? Repórtalo con descripción y capturas para recibir seguimiento y número de incidente por correo.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsErrorReportOpen(true)}
            className="w-fit inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-red-600 text-white font-bold text-xs shadow-md hover:bg-red-700 transition cursor-pointer"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Reportar un Error del Sistema</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA: MANUAL DEL ADMINISTRADOR (MARKDOWN) */}
      {activeTab === 'manual' && (
        <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden p-6 sm:p-8 space-y-4 animate-fade-in">
          {manualContent ? (() => {
            const sections = manualContent.split(/(?=^## )/m);
            const accordionSections = sections.slice(1);

            return (
              <div className="divide-y divide-black/5">
                {accordionSections.map((section, idx) => {
                  const isOpen = openManualIndex === idx;
                  const lines = section.trim().split('\n');
                  const title = lines[0].replace(/^##\s+/, '').replace(/^[\d.]+\s*/, '');
                  const content = lines.slice(1).join('\n');

                  return (
                    <div key={idx} className="py-4">
                      <button
                        onClick={() => setOpenManualIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none group"
                      >
                        <span className="text-sm sm:text-base font-bold text-textDark group-hover:text-accentWine transition-colors">
                          {title}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-accentWine flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-textDark/40 flex-shrink-0 group-hover:text-accentWine transition-colors" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="mt-4 prose prose-sm max-w-none bg-bgPrimary/30 p-4 sm:p-6 rounded-2xl border border-black/5 animate-fade-in
                          [&_h2]:text-xl [&_h2]:font-wixDisplay [&_h2]:font-bold [&_h2]:text-accentWine [&_h2]:mt-8 [&_h2]:mb-4
                          [&_h3]:text-lg [&_h3]:font-wixDisplay [&_h3]:font-bold [&_h3]:text-textDark [&_h3]:mt-6 [&_h3]:mb-3
                          [&_p]:text-sm [&_p]:text-textDark/80 [&_p]:leading-relaxed [&_p]:mb-4
                          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-4 [&_ul_li]:text-sm [&_ul_li]:text-textDark/80 [&_ul_li]:mb-1
                          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-4 [&_ol_li]:text-sm [&_ol_li]:text-textDark/80 [&_ol_li]:mb-1
                          [&_img]:rounded-xl [&_img]:shadow-md [&_img]:max-w-full [&_img]:my-6 [&_img]:mx-auto
                          [&_a]:text-accentWine [&_a]:font-bold [&_a]:underline [&_a:hover]:text-accentWine/80
                          [&_table]:w-full [&_table]:mb-6 [&_table]:border-collapse [&_th]:bg-black/5 [&_th]:p-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_td]:p-3 [&_td]:border-b [&_td]:border-black/5 [&_td]:text-xs [&_td]:text-textDark/80
                          [&_blockquote]:border-l-4 [&_blockquote]:border-accentWine [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:bg-accentWine/5 [&_blockquote]:p-3 [&_blockquote]:rounded-r-xl [&_blockquote]:my-4"
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })() : (
            <div className="py-8 text-center text-textDark/50 text-xs">Cargando manual...</div>
          )}
        </div>
      )}

      {/* PESTAÑA 1: VISTA DE GUÍAS Y FAQS */}
      {activeTab === 'consultas' && (
        <div className="space-y-8 animate-fade-in">
          {/* Modules Quick Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-3">
              <div className="p-2.5 rounded-xl bg-accentWine/10 text-accentWine w-fit">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="font-wixDisplay text-base font-bold text-textDark">Validación de POIs</h4>
              <p className="text-xs text-textDark/70 leading-relaxed">
                Revisión formal de propuestas comunitarias y negocios turísticos antes de su publicación en la app móvil.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-3">
              <div className="p-2.5 rounded-xl bg-accentWine/10 text-accentWine w-fit">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="font-wixDisplay text-base font-bold text-textDark">Gestión de Usuarios</h4>
              <p className="text-xs text-textDark/70 leading-relaxed">
                Control de cuentas, asignación de roles (Prestador, Turista, Administrador) y bajas lógicas.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-3">
              <div className="p-2.5 rounded-xl bg-accentWine/10 text-accentWine w-fit">
                <Settings className="h-5 w-5" />
              </div>
              <h4 className="font-wixDisplay text-base font-bold text-textDark">Configuración CYP</h4>
              <p className="text-xs text-textDark/70 leading-relaxed">
                Mantenimiento de categorías, etiquetas de búsqueda, integraciones y parámetros globales.
              </p>
            </div>
          </div>

          {/* FAQs Accordion */}
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-accentWine" />
                <h3 className="font-wixDisplay text-lg font-bold text-textDark">Preguntas Frecuentes de Administración</h3>
              </div>
              {faqsAdmin.length > 0 && (
                <span className="text-[11px] font-bold text-accentWine bg-accentWine/10 px-2.5 py-1 rounded-full">
                  {faqsAdmin.length} {faqsAdmin.length === 1 ? 'pregunta publicada' : 'preguntas publicadas'}
                </span>
              )}
            </div>

            {isLoadingData ? (
              <p className="text-xs text-textDark/60 py-6 text-center">Cargando preguntas frecuentes...</p>
            ) : dataError ? (
              <p className="text-xs text-red-700 py-6 text-center" role="alert">
                No se pudieron cargar las preguntas frecuentes: {dataError}
              </p>
            ) : faqsAdmin.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <p className="text-xs text-textDark/60 max-w-md mx-auto leading-relaxed">
                  Todavía no hay preguntas frecuentes publicadas para el rol Administrador.
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setActiveTab('gestion')}
                    className="px-4 py-2 bg-accentWine hover:bg-accentWine/90 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cargar preguntas frecuentes
                  </button>
                )}
              </div>
            ) : null}

            <div className="divide-y divide-black/5">
              {(isLoadingData || dataError
                ? []
                : faqsAdmin.map((a) => ({ q: a.titulo, a: a.contenido }))
              ).map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="py-4">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
                    >
                      <span className="text-xs sm:text-sm font-bold text-textDark">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-accentWine flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-textDark/40 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="mt-2 text-xs text-textDark/70 leading-relaxed bg-bgPrimary/40 p-3.5 rounded-xl border border-black/5 animate-fade-in whitespace-pre-line">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: GESTIÓN ADMINISTRATIVA DE CONTENIDO DE AYUDA (US-AYS-06) */}
      {activeTab === 'gestion' && isAdmin && (
        <div className="space-y-8 animate-fade-in">
          {/* Header de Gestión con Botones de Alta */}
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-wixDisplay text-lg font-bold text-textDark flex items-center space-x-2">
                <Layers className="h-5 w-5 text-accentWine" />
                <span>Gestión de Contenido de Ayuda y Soporte</span>
              </h3>
              <p className="text-xs text-textDark/60">
                Creá, editá, desactivá o eliminá las categorías y los artículos del manual y de las preguntas frecuentes.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleOpenCatModal()}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-bgPrimary hover:bg-black/5 border border-black/10 text-textDark font-bold text-xs transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-accentWine" />
                <span>Nueva Categoría</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenArtModal()}
                disabled={categorias.length === 0}
                title={
                  categorias.length === 0
                    ? 'Primero creá una categoría para poder cargar artículos'
                    : 'Cargar un nuevo artículo o pregunta frecuente'
                }
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-accentWine text-white font-bold text-xs shadow-md hover:bg-accentWine/90 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Nuevo Artículo</span>
              </button>
              <button
                type="button"
                onClick={() => loadAyudaData()}
                disabled={isLoadingData}
                title="Actualizar datos"
                aria-label="Actualizar datos"
                className="p-2.5 bg-bgPrimary hover:bg-black/5 border border-black/10 rounded-2xl text-textDark text-xs transition cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingData ? 'animate-spin text-accentWine' : 'text-textDark/70'}`} />
              </button>
            </div>
          </div>

          {dataError && !isLoadingData && (
            <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-3 shadow-xs" role="alert">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-500" />
              <p className="font-bold text-sm text-textDark">No pudimos cargar el contenido de ayuda</p>
              <p className="text-xs text-textDark/60 max-w-md mx-auto">{dataError}</p>
              <button
                type="button"
                onClick={() => loadAyudaData()}
                className="px-4 py-2 bg-accentWine hover:bg-accentWine/90 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center space-x-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reintentar</span>
              </button>
            </div>
          )}

          {/* Filtros para la lista de artículos */}
          <div className="bg-white rounded-3xl border border-black/5 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40" />
              <input
                type="text"
                placeholder="Buscar por título, contenido o palabra clave..."
                aria-label="Buscar artículos"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-accentWine/20"
              />
            </div>
            <div>
              <select
                aria-label="Filtrar por categoría"
                value={selectedCategoriaFilter}
                onChange={(e) => setSelectedCategoriaFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
              >
                <option value="all">Todas las categorías</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {!c.activo ? '(Inactiva)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                aria-label="Filtrar por tipo de contenido"
                value={selectedTipoFilter}
                onChange={(e) => setSelectedTipoFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
              >
                <option value="all">Todos los tipos (Manual y FAQ)</option>
                <option value="MANUAL">Solo Guías y Manual</option>
                <option value="FAQ">Solo Preguntas Frecuentes (FAQ)</option>
              </select>
            </div>
          </div>

          {/* Categorías Registradas */}
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
            <h4 className="font-wixDisplay text-base font-bold text-textDark flex items-center space-x-2">
              <Layers className="h-4 w-4 text-accentWine" />
              <span>Categorías de Ayuda Registradas ({categorias.length})</span>
            </h4>
            {categorias.length === 0 ? (
              <p className="text-xs text-textDark/50 italic py-4 text-center">
                Todavía no hay categorías. Creá la primera con &quot;Nueva Categoría&quot; para poder cargar artículos.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      cat.activo
                        ? 'bg-white border-black/10 hover:border-accentWine/30 shadow-2xs'
                        : 'bg-black/5 border-dashed border-black/20 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs text-textDark">{cat.nombre}</span>
                          {!cat.activo && (
                            <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded-sm">
                              Inactiva
                            </span>
                          )}
                        </div>
                        {cat.descripcion && (
                          <p className="text-[11px] text-textDark/60 mt-1 line-clamp-2">
                            {cat.descripcion}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenCatModal(cat)}
                          title="Editar categoría"
                          aria-label={`Editar categoría ${cat.nombre}`}
                          className="p-1.5 rounded-lg text-textDark/60 hover:text-accentWine hover:bg-accentWine/10 transition cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleCatActivo(cat)}
                          title={cat.activo ? 'Desactivar categoría' : 'Reactivar categoría'}
                          aria-label={cat.activo ? `Desactivar categoría ${cat.nombre}` : `Reactivar categoría ${cat.nombre}`}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            cat.activo ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {cat.activo ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          title="Eliminar categoría"
                          aria-label={`Eliminar categoría ${cat.nombre}`}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Listado y Tabla de Artículos */}
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-wixDisplay text-base font-bold text-textDark flex items-center space-x-2">
                <FileText className="h-4 w-4 text-accentWine" />
                <span>Artículos de Ayuda ({filteredArticles.length})</span>
              </h4>
              <span className="text-[11px] text-textDark/50">
                {articulos.filter((a) => a.activo).length} publicados · {articulos.filter((a) => !a.activo).length} inactivos
              </span>
            </div>

            {isLoadingData ? (
              <div className="py-12 text-center text-xs text-textDark/50">
                <RefreshCw className="h-6 w-6 mx-auto animate-spin text-accentWine mb-2" />
                <span>Cargando contenido de ayuda...</span>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="py-12 text-center text-xs text-textDark/50 space-y-2">
                <FileText className="h-8 w-8 mx-auto text-textDark/20" />
                <p className="font-bold text-textDark">
                  {articulos.length === 0
                    ? 'Todavía no hay artículos cargados'
                    : 'No se encontraron artículos con los filtros aplicados'}
                </p>
                <p className="text-[11px]">
                  {articulos.length === 0
                    ? 'Hacé clic en "Nuevo Artículo" para crear la primera guía o pregunta frecuente.'
                    : 'Probá con otra búsqueda, categoría o tipo de contenido.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-black/10 text-textDark/60 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-3 pr-4">Título</th>
                      <th className="pb-3 pr-4">Tipo</th>
                      <th className="pb-3 pr-4">Categoría</th>
                      <th className="pb-3 pr-4">Roles Visibles</th>
                      <th className="pb-3 pr-4">Palabras Clave</th>
                      <th className="pb-3 pr-4">Estado</th>
                      <th className="pb-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {filteredArticles.map((art) => {
                      const catName = categorias.find((c) => c.id === art.categoriaId)?.nombre || 'General';
                      return (
                        <tr key={art.id} className="hover:bg-bgPrimary/50 transition-colors">
                          <td className="py-3.5 pr-4">
                            <span className="font-bold text-textDark block max-w-xs truncate" title={art.titulo}>
                              {art.titulo}
                            </span>
                            <span className="text-[10px] text-textDark/50 line-clamp-1 max-w-xs">
                              {art.contenido}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                art.tipo === 'FAQ'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {art.tipo === 'FAQ' ? 'Pregunta frecuente' : 'Manual'}
                            </span>
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap text-textDark/80 font-medium">
                            {catName}
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {(art.rolesPermitidos || []).map((r) => (
                                <span
                                  key={r}
                                  className="text-[9px] bg-bgPrimary border border-black/10 px-1.5 py-0.5 rounded-md font-semibold text-textDark/70"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 max-w-xs">
                            <div className="flex flex-wrap gap-1">
                              {(art.palabrasClave || []).slice(0, 3).map((kw, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] bg-accentWine/10 text-accentWine font-bold px-1.5 py-0.5 rounded-sm"
                                >
                                  #{kw}
                                </span>
                              ))}
                              {(art.palabrasClave || []).length > 3 && (
                                <span className="text-[9px] text-textDark/40">
                                  +{art.palabrasClave.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                art.activo
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {art.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="py-3.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => handleOpenArtModal(art)}
                                title="Editar artículo"
                                aria-label={`Editar artículo ${art.titulo}`}
                                className="p-1.5 rounded-lg text-textDark/60 hover:text-accentWine hover:bg-accentWine/10 transition cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleArtActivo(art)}
                                title={art.activo ? 'Desactivar artículo' : 'Reactivar artículo'}
                                aria-label={art.activo ? `Desactivar artículo ${art.titulo}` : `Reactivar artículo ${art.titulo}`}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  art.activo ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                              >
                                {art.activo ? <X className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteArticle(art)}
                                title="Eliminar artículo"
                                aria-label={`Eliminar artículo ${art.titulo}`}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ALTA Y EDICIÓN DE CATEGORÍA (US-AYS-06) */}
      {isCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">
                {editingCategory ? 'Editar Categoría de Ayuda' : 'Nueva Categoría de Ayuda'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCatModalOpen(false)}
                className="p-1.5 text-textDark/50 hover:text-textDark hover:bg-black/5 rounded-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs" noValidate>
              {catSubmitError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold" role="alert">
                  {catSubmitError}
                </div>
              )}
              <div>
                <label htmlFor="cat-nombre" className="block font-bold text-textDark mb-1">
                  Nombre de la categoría <span className="text-red-500">*</span>
                </label>
                <input
                  id="cat-nombre"
                  type="text"
                  maxLength={120}
                  autoFocus
                  placeholder="Ej: Gestión de Itinerarios"
                  value={catNombre}
                  onChange={(e) => {
                    setCatNombre(e.target.value);
                    if (catFormErrors.nombre) setCatFormErrors({});
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary/60 border ${
                    catFormErrors.nombre ? 'border-red-400 ring-1 ring-red-400' : 'border-black/10'
                  } text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20`}
                />
                {catFormErrors.nombre && (
                  <p className="text-[11px] text-red-500 mt-1">{catFormErrors.nombre}</p>
                )}
              </div>

              <div>
                <label htmlFor="cat-descripcion" className="block font-bold text-textDark mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  id="cat-descripcion"
                  maxLength={500}
                  rows={3}
                  placeholder="Explicación del alcance de los contenidos en esta categoría..."
                  value={catDescripcion}
                  onChange={(e) => setCatDescripcion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20 resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="catActivoCheckbox"
                  checked={catActivo}
                  onChange={(e) => setCatActivo(e.target.checked)}
                  className="w-4 h-4 rounded text-accentWine focus:ring-accentWine/20 cursor-pointer"
                />
                <label htmlFor="catActivoCheckbox" className="font-semibold text-textDark cursor-pointer">
                  Categoría activa (visible para los usuarios)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsCatModalOpen(false)}
                  disabled={isSubmittingCat}
                  className="px-4 py-2 rounded-xl bg-bgPrimary hover:bg-black/5 font-bold text-textDark cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCat}
                  className="px-5 py-2 rounded-xl bg-accentWine hover:bg-accentWine/90 text-white font-bold shadow-md transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSubmittingCat && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

      {/* MODAL: ALTA Y EDICIÓN DE ARTÍCULO (US-AYS-06) */}
      {isArtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">
                {editingArticle ? 'Editar Artículo de Ayuda' : 'Nuevo Artículo de Ayuda'}
              </h3>
              <button
                type="button"
                onClick={() => setIsArtModalOpen(false)}
                className="p-1.5 text-textDark/50 hover:text-textDark hover:bg-black/5 rounded-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4 text-xs" noValidate>
              {artSubmitError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold" role="alert">
                  {artSubmitError}
                </div>
              )}
              <div>
                <label htmlFor="art-titulo" className="block font-bold text-textDark mb-1">
                  Título del artículo <span className="text-red-500">*</span>
                </label>
                <input
                  id="art-titulo"
                  type="text"
                  maxLength={200}
                  autoFocus
                  placeholder="Ej: ¿Cómo crear un itinerario asistido con IA?"
                  value={artTitulo}
                  onChange={(e) => {
                    setArtTitulo(e.target.value);
                    if (artFormErrors.titulo) setArtFormErrors((prev) => ({ ...prev, titulo: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary/60 border ${
                    artFormErrors.titulo ? 'border-red-400 ring-1 ring-red-400' : 'border-black/10'
                  } text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20`}
                />
                {artFormErrors.titulo && (
                  <p className="text-[11px] text-red-500 mt-1">{artFormErrors.titulo}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="art-categoria" className="block font-bold text-textDark mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="art-categoria"
                    value={artCategoriaId}
                    onChange={(e) => {
                      setArtCategoriaId(e.target.value);
                      if (artFormErrors.categoriaId) setArtFormErrors((prev) => ({ ...prev, categoriaId: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary/60 border ${
                      artFormErrors.categoriaId ? 'border-red-400 ring-1 ring-red-400' : 'border-black/10'
                    } text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer`}
                  >
                    <option value="">Seleccionar categoría...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {!c.activo ? '(Inactiva)' : ''}
                      </option>
                    ))}
                  </select>
                  {artFormErrors.categoriaId && (
                    <p className="text-[11px] text-red-500 mt-1">{artFormErrors.categoriaId}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="art-tipo" className="block font-bold text-textDark mb-1">
                    Tipo de contenido <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="art-tipo"
                    value={artTipo}
                    onChange={(e) => setArtTipo(e.target.value as AyudaArticuloTipo)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
                  >
                    <option value="MANUAL">Manual (guía paso a paso)</option>
                    <option value="FAQ">Pregunta frecuente (FAQ)</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="block font-bold text-textDark mb-1">
                  ¿Quiénes pueden verlo? <span className="text-red-500">*</span>
                </span>
                <div className="flex flex-wrap items-center gap-4 p-3 rounded-xl bg-bgPrimary/60 border border-black/10">
                  {['turista', 'prestador', 'administrador'].map((rol) => {
                    const isChecked = artRolesPermitidos.includes(rol);
                    return (
                      <label key={rol} className="inline-flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setArtRolesPermitidos([...artRolesPermitidos, rol]);
                            } else {
                              setArtRolesPermitidos(artRolesPermitidos.filter((r) => r !== rol));
                            }
                            if (artFormErrors.roles) setArtFormErrors((prev) => ({ ...prev, roles: undefined }));
                          }}
                          className="w-4 h-4 rounded text-accentWine focus:ring-accentWine/20 cursor-pointer"
                        />
                        <span className="capitalize font-semibold text-textDark">{rol}</span>
                      </label>
                    );
                  })}
                </div>
                {artFormErrors.roles && (
                  <p className="text-[11px] text-red-500 mt-1">{artFormErrors.roles}</p>
                )}
              </div>

              <div>
                <label htmlFor="art-palabras" className="block font-bold text-textDark mb-1">
                  Palabras clave de búsqueda (opcional, separadas por coma)
                </label>
                <input
                  id="art-palabras"
                  type="text"
                  placeholder="itinerario, ia, mapa, paradas, sugerencias"
                  value={artPalabrasClaveInput}
                  onChange={(e) => setArtPalabrasClaveInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20"
                />
                <span className="text-[10px] text-textDark/50 block mt-1">
                  Ayudan a que los usuarios encuentren el artículo desde el buscador de ayuda.
                </span>
              </div>

              <div>
                <label htmlFor="art-contenido" className="block font-bold text-textDark mb-1">
                  Contenido (explicación o pasos a seguir) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="art-contenido"
                  rows={6}
                  placeholder="Detalla de forma clara el procedimiento o la respuesta correspondiente..."
                  value={artContenido}
                  onChange={(e) => {
                    setArtContenido(e.target.value);
                    if (artFormErrors.contenido) setArtFormErrors((prev) => ({ ...prev, contenido: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-bgPrimary/60 border ${
                    artFormErrors.contenido ? 'border-red-400 ring-1 ring-red-400' : 'border-black/10'
                  } text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20`}
                />
                {artFormErrors.contenido && (
                  <p className="text-[11px] text-red-500 mt-1">{artFormErrors.contenido}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="artActivoCheckbox"
                  checked={artActivo}
                  onChange={(e) => setArtActivo(e.target.checked)}
                  className="w-4 h-4 rounded text-accentWine focus:ring-accentWine/20 cursor-pointer"
                />
                <label htmlFor="artActivoCheckbox" className="font-semibold text-textDark cursor-pointer">
                  Publicar artículo (visible para los roles seleccionados)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setIsArtModalOpen(false)}
                  disabled={isSubmittingArt}
                  className="px-4 py-2 rounded-xl bg-bgPrimary hover:bg-black/5 font-bold text-textDark cursor-pointer transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingArt}
                  className="px-5 py-2 rounded-xl bg-accentWine hover:bg-accentWine/90 text-white font-bold shadow-md transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {isSubmittingArt && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>{editingArticle ? 'Guardar Cambios' : 'Crear Artículo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación de desactivación / eliminación */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-action-title"
        >
          <div className="bg-white rounded-3xl border border-black/10 shadow-2xl max-w-sm w-full p-6 space-y-4 text-xs">
            <h3 id="confirm-action-title" className="font-wixDisplay text-base font-bold text-textDark">
              {confirmAction.title}
            </h3>
            <p className="text-textDark/70 leading-relaxed">{confirmAction.message}</p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isConfirming}
                className="px-4 py-2 rounded-xl bg-bgPrimary hover:bg-black/5 font-bold text-textDark cursor-pointer transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isConfirming}
                className={`px-5 py-2 rounded-xl text-white font-bold shadow-md transition cursor-pointer disabled:opacity-50 flex items-center space-x-1.5 ${
                  confirmAction.destructive ? 'bg-red-600 hover:bg-red-700' : 'bg-accentWine hover:bg-accentWine/90'
                }`}
              >
                {isConfirming && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{confirmAction.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Onboarding Tutorial Modal (US-AYS-04) */}
      <OnboardingTutorialModal
        role="admin"
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* User Error Reporting Modal (US-AYS-05) */}
      <ErrorReportModal
        isOpen={isErrorReportOpen}
        onClose={() => setIsErrorReportOpen(false)}
      />
    </div>
  );
}
