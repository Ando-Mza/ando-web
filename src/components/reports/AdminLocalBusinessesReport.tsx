'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { 
  NegocioLocalItem, 
  RankingTopCrecimiento, 
  CategoriaReporte 
} from '@/types/reportes';
import { 
  Store, 
  TrendingUp, 
  AlertTriangle, 
  Star, 
  MessageSquare, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter, 
  MapPin, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';

interface AdminLocalBusinessesReportProps {
  businesses: NegocioLocalItem[];
  topGrowth: RankingTopCrecimiento[];
}

type SortColumn = 'nombre' | 'inclusionesRutas' | 'checkInsConfirmados' | 'tasaAbandono' | 'puntuacionPromedio' | 'volumenOpiniones' | 'incidenciasReportadas' | 'incrementoActividad';

export default function AdminLocalBusinessesReport({
  businesses,
  topGrowth,
}: AdminLocalBusinessesReportProps) {
  // Estados de filtros internos de negocios
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortColumn>('inclusionesRutas');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Manejo de ordenamiento dinámico
  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('DESC');
    }
    setCurrentPage(1);
  };

  // Filtrado de la lista
  const filteredList = useMemo(() => {
    return businesses.filter((b) => {
      const matchStatus = statusFilter === 'all' || b.situacionAdministrativa.toLowerCase() === statusFilter.toLowerCase();
      const matchQuery = !searchQuery.trim() || 
        b.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.organizacion?.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.ubicacion.departamento?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchQuery;
    });
  }, [businesses, statusFilter, searchQuery]);

  // Ordenamiento de la lista
  const sortedList = useMemo(() => {
    return [...filteredList].sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];

      if (sortBy === 'nombre') {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
        return sortOrder === 'ASC' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = valA || 0;
      valB = valB || 0;
      return sortOrder === 'ASC' ? valA - valB : valB - valA;
    });
  }, [filteredList, sortBy, sortOrder]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(sortedList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, currentPage, pageSize]);

  const startIndex = sortedList.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, sortedList.length);

  const renderSortIcon = (col: SortColumn) => {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 text-textDark/30" />;
    return sortOrder === 'ASC' ? (
      <ArrowUp className="h-3.5 w-3.5 text-accentWine font-bold" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-accentWine font-bold" />
    );
  };

  return (
    <div className="space-y-8 font-wixText">
      {/* SECCIÓN 1: RANKING TOP 10 CRECIMIENTO (US-RYI-03) */}
      <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/5">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 text-xs font-bold text-accentWine">
              <Flame className="h-4 w-4 text-fillPrimary" />
              <span>Emprendimientos Revelación</span>
            </div>
            <h3 className="font-wixDisplay text-lg font-bold text-textDark">
              Top 10 Negocios con Mayor Incremento de Actividad
            </h3>
            <p className="text-xs text-textDark/60">
              Locales y bodegas con mayor porcentaje de crecimiento en inclusiones de itinerarios respecto al ciclo previo
            </p>
          </div>

          <div className="text-xs font-bold text-fillPrimary bg-fillPrimary/10 px-3 py-1.5 rounded-xl border border-fillPrimary/20 self-start sm:self-auto">
            🚀 En ascenso en Mendoza
          </div>
        </div>

        {/* Grilla / Cards de los Top 10 Crecimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {topGrowth.map((item, idx) => (
            <div
              key={item.poiId}
              className="p-4 rounded-2xl bg-bgPrimary/60 border border-black/5 hover:border-fillPrimary/40 transition-all space-y-2.5 relative group hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                  idx < 3 ? 'bg-accentWine text-white shadow-xs' : 'bg-black/10 text-textDark/70'
                }`}>
                  #{idx + 1}
                </span>

                <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  <span>+{item.porcentajeCrecimiento.toFixed(1)}%</span>
                </span>
              </div>

              <div className="space-y-0.5">
                <h4 className="font-bold text-xs text-textDark truncate group-hover:text-accentWine transition-colors" title={item.nombre}>
                  {item.nombre}
                </h4>
                <p className="text-[10px] text-textDark/50 truncate">
                  {item.categoria || 'Sin categoría'}
                </p>
              </div>

              <div className="text-[11px] pt-1.5 border-t border-black/5 flex justify-between font-mono">
                <span className="text-textDark/50">Inclusiones:</span>
                <span className="font-bold text-textDark">
                  {item.inclusionesActual} <span className="text-[10px] text-textDark/40 font-normal">({item.inclusionesAnterior} prev)</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: CATÁLOGO COMPLETO DE NEGOCIOS LOCALES (US-RYI-03) */}
      <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden flex flex-col space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-wixDisplay text-lg font-bold text-textDark">
              Catálogo Integral de Negocios y Emprendimientos
            </h3>
            <p className="text-xs text-textDark/60">
              Evaluación del impacto de ANDO en visibilidad, check-ins y feedback de turistas ({sortedList.length} negocios)
            </p>
          </div>

          {/* Filtros rápidos: Estado administrativo y buscador */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por negocio u organización..."
                className="pl-9 pr-3 py-2 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-semibold text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/20 w-56 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="py-2 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-semibold text-textDark focus:outline-none focus:ring-2 focus:ring-accentWine/20 cursor-pointer"
            >
              <option value="all">Todos los estados</option>
              <option value="aprobado">Aprobado</option>
              <option value="pendiente">Pendiente</option>
              <option value="rechazado">Rechazado</option>
            </select>
          </div>
        </div>

        {/* Tabla Dinámica con Ordenamiento */}
        <div className="overflow-x-auto border border-black/5 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-bgPrimary/60 border-b border-black/5 text-textDark/60 text-[10px] uppercase font-bold tracking-wider select-none">
                <th className="py-3 px-4 cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleSort('nombre')}>
                  <div className="flex items-center space-x-1.5">
                    <span>Negocio / Organización</span>
                    {renderSortIcon('nombre')}
                  </div>
                </th>
                <th className="py-3 px-3">Categoría & Ubicación</th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleSort('inclusionesRutas')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Inclusiones</span>
                    {renderSortIcon('inclusionesRutas')}
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleSort('checkInsConfirmados')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Check-ins</span>
                    {renderSortIcon('checkInsConfirmados')}
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleSort('tasaAbandono')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Deserción</span>
                    {renderSortIcon('tasaAbandono')}
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleSort('puntuacionPromedio')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Puntuación</span>
                    {renderSortIcon('puntuacionPromedio')}
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleSort('volumenOpiniones')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Opiniones</span>
                    {renderSortIcon('volumenOpiniones')}
                  </div>
                </th>
                <th className="py-3 px-3 text-center cursor-pointer hover:bg-black/5 transition-colors" onClick={() => handleSort('incidenciasReportadas')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Incidencias</span>
                    {renderSortIcon('incidenciasReportadas')}
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 font-medium">
              {paginatedList.map((item) => {
                const isHighAbandonment = item.esAltaTasaAbandono || item.tasaAbandono >= 40;

                return (
                  <tr
                    key={item.poiId}
                    className={`hover:bg-accentWine/5 transition-colors ${
                      isHighAbandonment ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* Negocio y Organización */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-xl overflow-hidden bg-bgPrimary border border-black/10 flex-shrink-0 relative">
                          {item.imagenPrincipalUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imagenPrincipalUrl} alt={item.nombre} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-accentWine/10 text-accentWine font-bold text-xs">
                              {item.nombre.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/validation?poi=${encodeURIComponent(item.poiId)}`}
                            className="block font-bold text-textDark text-xs truncate hover:text-accentWine hover:underline"
                            title={`Ver "${item.nombre}" en Catálogo y Validación`}
                          >
                            {item.nombre}
                          </Link>
                          <p className="text-[10px] text-textDark/50 truncate">
                            {item.organizacion?.nombre || 'Sin organización'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría y Ubicación */}
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <span className="bg-accentWine/10 text-accentWine px-2 py-0.5 rounded-md font-bold text-[10px]">
                          {item.categorias[0]?.nombre || 'Sin categoría'}
                        </span>
                        <p className="text-[10px] text-textDark/60 flex items-center space-x-0.5">
                          <MapPin className="h-2.5 w-2.5 text-textDark/40 flex-shrink-0" />
                          <span>{item.ubicacion.departamento || 'Sin departamento'}</span>
                        </p>
                      </div>
                    </td>

                    {/* Inclusiones en Rutas */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-textDark text-xs">
                      {item.inclusionesRutas}
                    </td>

                    {/* Check-ins Confirmados */}
                    <td className="py-3.5 px-3 text-center font-mono font-black text-accentWine text-xs">
                      {item.checkInsConfirmados}
                    </td>

                    {/* Tasa de Abandono (Criterio 3: Identificar visualmente alta deserción >= 40%) */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex flex-col items-center space-y-0.5">
                        <div className="flex items-center space-x-1">
                          <span className={`font-mono font-bold text-xs ${
                            isHighAbandonment ? 'text-amber-700' : 'text-textDark'
                          }`}>
                            {item.tasaAbandono.toFixed(1)}%
                          </span>
                          {isHighAbandonment && (
                            <span title="Alta tasa de deserción (≥ 40%)">
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                            </span>
                          )}
                        </div>
                        {isHighAbandonment && (
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 rounded">
                            Deserción
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Puntuación Promedio */}
                    <td className="py-3.5 px-3 text-center font-mono font-bold text-textDark text-xs">
                      <span className="inline-flex items-center space-x-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span>{item.puntuacionPromedio.toFixed(1)}</span>
                      </span>
                    </td>

                    {/* Volumen de Opiniones */}
                    <td className="py-3.5 px-3 text-center font-mono text-textDark text-xs">
                      <span className="inline-flex items-center space-x-1 text-textDark/70">
                        <MessageSquare className="h-3 w-3 text-textDark/40" />
                        <span>{item.volumenOpiniones}</span>
                      </span>
                    </td>

                    {/* Incidencias Reportadas */}
                    <td className="py-3.5 px-3 text-center">
                      {item.incidenciasReportadas > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center space-x-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{item.incidenciasReportadas}</span>
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px]">0</span>
                      )}
                    </td>

                    {/* Situación Administrativa */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center space-x-1 ${
                        item.situacionAdministrativa === 'Aprobado'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.situacionAdministrativa === 'Rechazado'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {item.situacionAdministrativa === 'Aprobado' && <CheckCircle2 className="h-2.5 w-2.5" />}
                        {item.situacionAdministrativa === 'Pendiente' && <Clock className="h-2.5 w-2.5" />}
                        {item.situacionAdministrativa === 'Rechazado' && <XCircle className="h-2.5 w-2.5" />}
                        <span>{item.situacionAdministrativa}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs font-semibold text-textDark/70">
          <div>
            Mostrando <span className="text-textDark font-bold">{startIndex}</span> a{' '}
            <span className="text-textDark font-bold">{endIndex}</span> de{' '}
            <span className="text-accentWine font-black">{sortedList.length}</span> negocios locales
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === p
                    ? 'bg-accentWine text-white shadow-xs'
                    : 'bg-white border border-black/10 hover:bg-black/5 text-textDark'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
