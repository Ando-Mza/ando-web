'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  FileText, 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  User, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';

export default function AdminLogsPage() {
  const { logs, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesSearch = 
      log.poiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.comment && log.comment.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesAction && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,ID,Fecha,Accion,Entidad_POI,Administrador_Actor,Detalle_Comentario\n';
    filteredLogs.forEach((l) => {
      csvContent += `"${l.id}","${l.timestamp}","${l.action}","${l.poiName.replace(/"/g, '""')}","${l.adminName.replace(/"/g, '""')}","${(l.comment || '').replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approve':
        return <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Aprobación</span>;
      case 'reject':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Rechazo</span>;
      case 'correction':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Corrección</span>;
      case 'category_create':
      case 'state_create':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Alta Config</span>;
      case 'image_delete':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Eliminación Foto</span>;
      default:
        return <span className="bg-bgPrimary text-textDark/70 border border-black/10 px-2.5 py-0.5 rounded-full font-bold text-[10px]">Parámetros</span>;
    }
  };

  return (
    <div className="space-y-8 font-wixText">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-accentWine/10 via-accentWine/5 to-transparent border border-accentWine/20 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-accentWine/10 border border-accentWine/20 px-3 py-1 rounded-full text-xs font-bold text-accentWine">
              <FileText className="h-3.5 w-3.5" />
              <span>Auditoría y Trazabilidad (US-AYT-01)</span>
            </div>
            <h2 className="font-wixDisplay text-2xl sm:text-3xl font-extrabold text-textDark">
              Registro de Actividad y Logs del Sistema
            </h2>
            <p className="text-xs sm:text-sm text-textDark/70 max-w-2xl leading-relaxed">
              Supervisá en tiempo real todas las acciones administrativas, cambios en POIs, moderaciones y eventos críticos de seguridad con trazabilidad inmutable.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-5 py-3 bg-accentWine hover:bg-accentWine/90 text-white rounded-2xl text-xs font-bold shadow-lg shadow-accentWine/20 transition-all flex items-center space-x-2 cursor-pointer flex-shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Descargar log en CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Tipo de Acción */}
          <div>
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Tipo de Evento</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs py-2.5 px-3 rounded-xl bg-bgPrimary/60 border border-black/10 text-textDark font-semibold focus:outline-none focus:ring-2 focus:ring-accentWine/20"
            >
              <option value="all">Todos los eventos</option>
              <option value="approve">Aprobaciones de POIs</option>
              <option value="reject">Rechazos formales</option>
              <option value="correction">Solicitudes de corrección</option>
              <option value="image_delete">Eliminación de multimedia</option>
              <option value="param_change">Cambios en configuración</option>
            </select>
          </div>

          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-textDark/70 mb-1">Buscar en logs</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-textDark/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar por POI, administrador o comentario..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bgPrimary/60 border border-black/10 text-xs font-medium text-textDark placeholder-textDark/40 focus:outline-none focus:ring-2 focus:ring-accentWine/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-black/5 p-6 shadow-xs space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-textDark/60 space-y-2">
            <Clock className="h-8 w-8 mx-auto text-textDark/30" />
            <p>No se encontraron registros de auditoría para los filtros aplicados.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 text-textDark/60 text-[10px] uppercase font-bold tracking-wider">
                    <th className="pb-3">Fecha y Hora</th>
                    <th className="pb-3">Tipo de Evento</th>
                    <th className="pb-3">Elemento Afectado</th>
                    <th className="pb-3">Actor / Admin</th>
                    <th className="pb-3">Detalle del Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-bgPrimary/40 transition-colors">
                      <td className="py-3 text-textDark/60 font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 font-bold text-textDark">{log.poiName}</td>
                      <td className="py-3 text-textDark/70">{log.adminName}</td>
                      <td className="py-3 text-textDark/80 max-w-xs truncate" title={log.comment}>
                        {log.comment || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-black/5 text-xs text-textDark/70">
                <span>
                  Página {currentPage} de {totalPages} ({filteredLogs.length} eventos)
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-black/10 hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-black/10 hover:bg-black/5 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
