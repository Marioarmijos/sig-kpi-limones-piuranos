/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pista de Auditoría y Trazabilidad Documental Inalterable (ISO 9001:2015 & BASC)
 * Limones Piuranos S.A.C.
 */

import React, { useState, useMemo } from 'react';
import { AuditLogEntry } from '../types/sig';
import { ShieldCheck, Search, Filter, History, Clock } from 'lucide-react';

interface AuditViewProps {
  auditLogs: AuditLogEntry[];
}

export const AuditView: React.FC<AuditViewProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mUser = log.userName.toLowerCase().includes(q) || log.userEmail.toLowerCase().includes(q);
        const mEntity = log.entityId.toLowerCase().includes(q);
        const mDesc = log.description.toLowerCase().includes(q);
        if (!mUser && !mEntity && !mDesc) return false;
      }

      return true;
    });
  }, [auditLogs, actionFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Control y Seguridad de la Información BASC
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pista de Auditoría y Trazabilidad del Sistema
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro cronológico inmutable de todas las operaciones críticas, aprobaciones, modificaciones y reaperturas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Integridad de Registros Verificada</span>
          </div>
        </div>
      </div>

      {/* Toolbar & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por usuario, entidad o detalle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          {/* Action Filter */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todas las Operaciones</option>
            <option value="CREATE">Creación / Registro</option>
            <option value="UPDATE">Actualización de Datos</option>
            <option value="VALIDATE">Aprobación / Validación</option>
            <option value="RETURN">Devolución / Observación</option>
            <option value="CONFIG_CHANGE">Cambio de Configuración / Metas</option>
            <option value="REOPEN">Reapertura de Periodo</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Mostrando {filteredLogs.length} eventos registrados
        </span>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-44">Fecha / Hora</th>
                <th className="py-3 px-4 w-48">Usuario / Correo</th>
                <th className="py-3 px-4 w-32 text-center">Acción</th>
                <th className="py-3 px-4 w-36">Objeto / Entidad</th>
                <th className="py-3 px-4">Descripción del Cambio</th>
                <th className="py-3 px-4 w-48">Valores (Previo → Nuevo)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No se encontraron registros de auditoría para los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-600 font-mono whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp).toLocaleString('es-PE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{log.userName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.userEmail}</span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.action === 'VALIDATE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action === 'RETURN'
                            ? 'bg-red-100 text-red-800'
                            : log.action === 'CONFIG_CHANGE'
                            ? 'bg-purple-100 text-purple-800'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 text-[11px]">
                      {log.entityId}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {log.description}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {log.previousValue && log.newValue ? (
                        <span>
                          <span className="text-slate-400">{log.previousValue}</span>
                          <span className="text-emerald-700 mx-1">→</span>
                          <span className="font-bold text-slate-800">{log.newValue}</span>
                        </span>
                      ) : (
                        <span>—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
