'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar, 
  TrendingUp, 
  Users, 
  Store, 
  Bot, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  Search,
  Sparkles,
  PieChart
} from 'lucide-react';

export default function AdminReportsPage() {
  const { pois, users, categories } = useApp();

  const [activeTab, setActiveTab] = useState<'pois' | 'users' | 'businesses' | 'ai'>('pois');
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Filtrado de POIs
  const filteredPois = pois.filter((poi) => {
    const matchesCategory = selectedCategory === 'all' || poi.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = poi.name.toLowerCase().includes(searchQuery.toLowerCase()) || poi.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // 2. Métricas calculadas reales
  const totalApprovedPois = pois.filter((p) => p.status === 'approved').length;
  const totalPendingPois = pois.filter((p) => p.status === 'pending' || p.status === 'correction').length;
  const totalProviders = users.filter((u) => u.role === 'provider').length;
  const totalTourists = users.filter((u) => u.role === 'tourist').length;
  const totalActiveUsers = users.filter((u) => u.status === 'active').length;

  // 3. Exportación a CSV real (US-RYI-05)
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    let filename = `reporte_ando_${activeTab}_${period}.csv`;

    if (activeTab === 'pois') {
      csvContent += 'ID,Nombre,Categoria,Direccion,Estado,Calificacion,Total Resenas\n';
      filteredPois.forEach((p) => {
        csvContent += `"${p.id}","${p.name.replace(/"/g, '""')}","${p.category}","${p.address.replace(/"/g, '""')}","${p.status}","${p.rating || 0}","${p.reviewsCount || 0}"\n`;
      });
    } else if (activeTab === 'users') {
      csvContent += 'ID,Nombre,Email,Rol,Estado,Empresa,CUIT\n';
      users.forEach((u) => {
        csvContent += `"${u.id}","${u.name.replace(/"/g, '""')}","${u.email}","${u.role}","${u.status || 'active'}","${(u.businessName || '').replace(/"/g, '""')}","${u.cuit || ''}"\n`;
      });
    } else {
      csvContent += 'Categoria,Cantidad POIs\n';
      categories.forEach((c) => {
        const count = pois.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length;
        csvContent += `"${c.name}","${count}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-wixText">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-accentWine/10 border border-accentWine/20 px-3 py-1 rounded-full text-xs font-bold text-accentWine">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Reportes Estadísticos y Analíticas</span>
            </div>
            <h2 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
              Centro de Informes y Estadísticas
            </h2>
            <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
              Consultá el rendimiento de los atractivos turísticos, el flujo de usuarios registrados y la oferta de prestadores en Mendoza.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-5 py-3 bg-accentWine hover:bg-accentWine/90 text-white rounded-2xl text-xs font-bold shadow-lg shadow-accentWine/20 transition-all flex items-center space-x-2 cursor-pointer flex-shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Exportar reporte en CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-black/5 pb-2">
        <button
          onClick={() => setActiveTab('pois')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'pois' 
              ? 'bg-accentWine text-white shadow-md shadow-accentWine/10' 
              : 'text-textDark/70 hover:bg-black/5 hover:text-textDark'
          }`}
        >
          <Store className="h-4 w-4" />
          <span>Atractivos y POIs Populares</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'users' 
              ? 'bg-accentWine text-white shadow-md shadow-accentWine/10' 
              : 'text-textDark/70 hover:bg-black/5 hover:text-textDark'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Actividad de Usuarios</span>
        </button>

        <button
          onClick={() => setActiveTab('businesses')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'businesses' 
              ? 'bg-accentWine text-white shadow-md shadow-accentWine/10' 
              : 'text-textDark/70 hover:bg-black/5 hover:text-textDark'
          }`}
        >
          <PieChart className="h-4 w-4" />
          <span>Distribución de Negocios</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer ${
            activeTab === 'ai' 
              ? 'bg-accentWine text-white shadow-md shadow-accentWine/10' 
              : 'text-textDark/70 hover:bg-black/5 hover:text-textDark'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>Uso de Asistente IA</span>
        </button>
      </div>

      {/* Filter Bar (US-RYI-06) */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Período */}
          <div>
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Período de análisis</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="all">Histórico completo</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Categoría turística</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Búsqueda rápida</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre o dirección..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TAB 1: POIS POPULARES */}
      {activeTab === 'pois' && (
        <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-wixDisplay text-lg font-bold text-textDark">Atractivos turísticos registrados</h3>
              <p className="text-xs text-textDark/60">Lista consolidada de POIs según el filtro seleccionado ({filteredPois.length} resultados)</p>
            </div>
          </div>

          {filteredPois.length === 0 ? (
            <div className="py-12 text-center text-xs text-textDark/60">
              No se encontraron puntos de interés para los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 text-textDark/60 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-3">Nombre del Atractivo</th>
                    <th className="pb-3">Categoría</th>
                    <th className="pb-3">Ubicación</th>
                    <th className="pb-3">Estado</th>
                    <th className="pb-3 text-right">Puntuación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredPois.map((poi) => (
                    <tr key={poi.id} className="hover:bg-bgPrimary/40 transition-colors">
                      <td className="py-3.5 font-bold text-textDark">{poi.name}</td>
                      <td className="py-3.5">
                        <span className="bg-accentWine/10 text-accentWine px-2.5 py-0.5 rounded-md font-bold text-[10px]">
                          {poi.category}
                        </span>
                      </td>
                      <td className="py-3.5 text-textDark/70">{poi.address}</td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          poi.status === 'approved' 
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : poi.status === 'rejected'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {poi.status === 'approved' ? 'Aprobado' : poi.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-bold text-textDark font-mono">
                        {poi.rating ? `⭐ ${poi.rating}.0` : 'Sin reseñas'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVIDAD DE USUARIOS */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase text-textDark/50">Prestadores Registrados</span>
            <div className="flex items-baseline space-x-2">
              <span className="font-wixDisplay text-3xl font-extrabold text-textDark">{totalProviders}</span>
              <span className="text-xs text-textDark/60">cuentas</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase text-textDark/50">Turistas Registrados</span>
            <div className="flex items-baseline space-x-2">
              <span className="font-wixDisplay text-3xl font-extrabold text-textDark">{totalTourists}</span>
              <span className="text-xs text-textDark/60">cuentas</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-2">
            <span className="text-[11px] font-bold uppercase text-textDark/50">Cuentas Activas</span>
            <div className="flex items-baseline space-x-2">
              <span className="font-wixDisplay text-3xl font-extrabold text-green-600">{totalActiveUsers}</span>
              <span className="text-xs text-textDark/60">activas</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NEGOCIOS LOCALES */}
      {activeTab === 'businesses' && (
        <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
          <h3 className="font-wixDisplay text-lg font-bold text-textDark">Distribución por Categoría</h3>
          <div className="space-y-3">
            {categories.map((c) => {
              const count = pois.filter((p) => p.category.toLowerCase() === c.name.toLowerCase()).length;
              const total = pois.length || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={c.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-textDark/80">{c.name}</span>
                    <span className="text-textDark font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-bgPrimary rounded-full overflow-hidden border border-black/5">
                    <div className="h-full bg-accentWine rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ASISTENTE IA */}
      {activeTab === 'ai' && (
        <div className="bg-white rounded-3xl border border-black/5 p-12 text-center space-y-3 shadow-xs">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accentWine/10 text-accentWine">
            <Bot className="h-7 w-7" />
          </div>
          <h4 className="font-wixDisplay text-lg font-bold text-textDark">Métricas del Asistente Conversacional</h4>
          <p className="text-xs text-textDark/60 max-w-md mx-auto">
            El módulo de Asistente IA procesa consultas turísticas en tiempo real en la aplicación móvil. Las métricas agregadas se calcularán automáticamente a medida que los turistas completen itinerarios.
          </p>
        </div>
      )}
    </div>
  );
}
