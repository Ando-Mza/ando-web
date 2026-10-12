'use client';

import React from 'react';
import { PoiReporteItem, SortByPoiReporte, SortOrder } from '@/types/reportes';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  AlertTriangle, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Layers,
  Sparkles
} from 'lucide-react';

interface PoisReportTableProps {
  data: PoiReporteItem[];
  sortBy: SortByPoiReporte;
  sortOrder: SortOrder;
  onSortChange: (column: SortByPoiReporte) => void;
  onSelectPoi: (poiId: string) => void;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  onPageChange: (newPage: number) => void;
}

export default function PoisReportTable({
  data,
  sortBy,
  sortOrder,
  onSortChange,
  onSelectPoi,
  currentPage,
  pageSize,
  totalPages,
  totalRecords,
  onPageChange,
}: PoisReportTableProps) {
  // Render de ícono de ordenamiento por columna
  const renderSortIcon = (column: SortByPoiReporte) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 text-textDark/30" />;
    }
    return sortOrder === 'ASC' ? (
      <ArrowUp className="h-3.5 w-3.5 text-accentWine font-bold" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-accentWine font-bold" />
    );
  };

  const startIndex = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="bg-white rounded-3xl border border-black/5 shadow-xs overflow-hidden flex flex-col">
      {/* Header de la Tabla */}
      <div className="p-6 border-b border-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-wixDisplay text-lg font-bold text-textDark">
            Registro de Destinos y Métricas de Visita
          </h3>
          <p className="text-xs text-textDark/60">
            Mostrando {totalRecords} atractivos evaluados en el período. Hacé clic en cualquier columna para ordenar.
          </p>
        </div>

        {/* Indicador de orden activo */}
        <div className="text-xs font-semibold text-textDark/70 bg-bgPrimary/80 px-3 py-1.5 rounded-xl border border-black/5 self-start sm:self-auto">
          Ordenado por:{' '}
          <span className="text-accentWine font-bold">
            {sortBy === 'visitasEfectivas' && 'Visitas Efectivas'}
            {sortBy === 'aparicionesItinerarios' && 'Itinerarios Planificados'}
            {sortBy === 'tasaAbandono' && 'Tasa de Abandono'}
            {sortBy === 'nombre' && 'Nombre del POI'}
          </span>{' '}
          ({sortOrder === 'DESC' ? 'Mayor a menor' : 'Menor a mayor'})
        </div>
      </div>

      {/* Contenedor de la Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-bgPrimary/60 border-b border-black/5 text-textDark/60 text-[10px] uppercase font-bold tracking-wider select-none">
              {/* Columna POI */}
              <th 
                className="py-3.5 px-6 cursor-pointer hover:bg-black/5 transition-colors"
                onClick={() => onSortChange('nombre')}
              >
                <div className="flex items-center space-x-2">
                  <span>Punto de Interés (POI)</span>
                  {renderSortIcon('nombre')}
                </div>
              </th>

              {/* Columna Categoría */}
              <th className="py-3.5 px-4">
                <div className="flex items-center space-x-1.5">
                  <Layers className="h-3 w-3 text-textDark/40" />
                  <span>Categoría</span>
                </div>
              </th>

              {/* Columna Planificados */}
              <th 
                className="py-3.5 px-4 text-center cursor-pointer hover:bg-black/5 transition-colors"
                onClick={() => onSortChange('aparicionesItinerarios')}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span>Planificados</span>
                  {renderSortIcon('aparicionesItinerarios')}
                </div>
              </th>

              {/* Columna Visitas Efectivas */}
              <th 
                className="py-3.5 px-4 text-center cursor-pointer hover:bg-black/5 transition-colors"
                onClick={() => onSortChange('visitasEfectivas')}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span className="text-accentWine font-extrabold">Visitas Efectivas</span>
                  {renderSortIcon('visitasEfectivas')}
                </div>
              </th>

              {/* Columna Tasa de Abandono */}
              <th 
                className="py-3.5 px-4 text-center cursor-pointer hover:bg-black/5 transition-colors"
                onClick={() => onSortChange('tasaAbandono')}
              >
                <div className="flex items-center justify-center space-x-1.5">
                  <span>Tasa de Abandono</span>
                  {renderSortIcon('tasaAbandono')}
                </div>
              </th>

              {/* Acciones */}
              <th className="py-3.5 px-6 text-right">
                <span>Acciones</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/5 font-medium">
            {data.map((poi, idx) => {
              const isHighAbandonment = poi.esAltaTasaAbandono || poi.tasaAbandono >= 40;

              return (
                <tr 
                  key={poi.poiId}
                  onClick={() => onSelectPoi(poi.poiId)}
                  className={`hover:bg-accentWine/5 transition-all duration-150 cursor-pointer ${
                    isHighAbandonment ? 'bg-amber-50/20' : ''
                  }`}
                >
                  {/* Celda POI / Nombre */}
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3.5">
                      {/* Avatar / Imagen */}
                      <div className="h-11 w-11 rounded-2xl overflow-hidden bg-bgPrimary border border-black/10 flex-shrink-0 relative">
                        {poi.imagenPrincipalUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img 
                            src={poi.imagenPrincipalUrl} 
                            alt={poi.nombre} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-accentWine/10 text-accentWine font-bold text-xs">
                            {poi.nombre.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Info Textual */}
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-textDark text-xs truncate hover:text-accentWine transition-colors">
                            {poi.nombre}
                          </p>
                          {isHighAbandonment && (
                            <span 
                              title="Alta tasa de abandono (≥ 40%): Planificado pero no completado por turistas."
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1 flex-shrink-0"
                            >
                              <AlertTriangle className="h-3 w-3 text-amber-600" />
                              <span>Alta deserción</span>
                            </span>
                          )}
                        </div>
                        {poi.ubicacion && (
                          <p className="text-[11px] text-textDark/60 flex items-center space-x-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-textDark/40 flex-shrink-0" />
                            <span className="truncate">
                              {poi.ubicacion.departamento || 'Mendoza'}
                              {poi.ubicacion.zona ? ` • ${poi.ubicacion.zona}` : ''}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Celda Categoría */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {poi.categorias && poi.categorias.length > 0 ? (
                        poi.categorias.map((cat) => (
                          <span 
                            key={cat.id || cat.nombre}
                            className="bg-accentWine/10 text-accentWine px-2.5 py-0.5 rounded-lg font-bold text-[10px]"
                          >
                            {cat.nombre}
                          </span>
                        ))
                      ) : (
                        <span className="text-textDark/40 text-[11px]">General</span>
                      )}
                    </div>
                  </td>

                  {/* Celda Planificados */}
                  <td className="py-4 px-4 text-center font-mono font-bold text-textDark text-xs">
                    {poi.aparicionesItinerarios}
                  </td>

                  {/* Celda Visitas Efectivas */}
                  <td className="py-4 px-4 text-center font-mono font-black text-accentWine text-sm">
                    {poi.visitasEfectivas}
                  </td>

                  {/* Celda Tasa de Abandono */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="flex items-center space-x-1">
                        <span className={`font-mono font-bold text-xs ${
                          isHighAbandonment ? 'text-amber-700' : 'text-textDark'
                        }`}>
                          {poi.tasaAbandono.toFixed(1)}%
                        </span>
                        {isHighAbandonment && (
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                        )}
                      </div>
                      {/* Mini barra de abandono */}
                      <div className="w-16 h-1.5 bg-black/10 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            isHighAbandonment ? 'bg-amber-600' : 'bg-accentWine'
                          }`}
                          style={{ width: `${Math.min(poi.tasaAbandono, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Celda Acciones */}
                  <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectPoi(poi.poiId)}
                      className="px-3 py-1.5 rounded-xl bg-accentWine/10 hover:bg-accentWine hover:text-white text-accentWine text-[11px] font-bold transition-all duration-150 inline-flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Ver detalle mensual</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="p-4 sm:p-5 border-t border-black/5 bg-bgPrimary/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-textDark/70">
        <div>
          Mostrando <span className="text-textDark font-bold">{startIndex}</span> a{' '}
          <span className="text-textDark font-bold">{endIndex}</span> de{' '}
          <span className="text-accentWine font-black">{totalRecords}</span> POIs
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Páginas numeradas */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`h-8 w-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  currentPage === page
                    ? 'bg-accentWine text-white shadow-xs'
                    : 'bg-white border border-black/10 hover:bg-black/5 text-textDark'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="p-2 rounded-xl border border-black/10 bg-white hover:bg-black/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
