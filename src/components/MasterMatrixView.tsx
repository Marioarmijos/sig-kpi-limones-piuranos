/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Matriz Maestra Oficial de Indicadores de Gestión ISO 9001:2015 & BASC
 * Limones Piuranos S.A.C. · LP-SIG-FR-011 V.04
 */

import React, { useState, useMemo } from 'react';
import { KPIDefinition, ProcessDefinition, UserAccount } from '../types/sig';
import { Search, Edit3, Shield, BookOpen, Check, X, FileText } from 'lucide-react';

interface MasterMatrixViewProps {
  kpis: KPIDefinition[];
  processes: ProcessDefinition[];
  currentUser: UserAccount;
  onUpdateKpi: (payload: {
    kpiId: string;
    targetValue: number;
    warningTolerance: number;
    notes?: string;
  }) => Promise<void>;
}

export const MasterMatrixView: React.FC<MasterMatrixViewProps> = ({
  kpis,
  processes,
  currentUser,
  onUpdateKpi
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'ESTRATEGICO' | 'OPERATIVO' | 'SOPORTE'>('ALL');
  const [editingKpi, setEditingKpi] = useState<KPIDefinition | null>(null);

  // Edit form states
  const [targetValue, setTargetValue] = useState<number>(0);
  const [warningTolerance, setWarningTolerance] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const filteredKpis = useMemo(() => {
    return kpis.filter(k => {
      const proc = processes.find(p => p.id === k.processId);
      if (categoryFilter !== 'ALL' && proc?.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mCode = k.code.toLowerCase().includes(q);
        const mName = k.name.toLowerCase().includes(q);
        const mProc = proc?.name.toLowerCase().includes(q) ?? false;
        if (!mCode && !mName && !mProc) return false;
      }

      return true;
    });
  }, [kpis, processes, categoryFilter, searchQuery]);

  const handleStartEdit = (kpi: KPIDefinition) => {
    setEditingKpi(kpi);
    setTargetValue(kpi.targetValue);
    setWarningTolerance(kpi.warningTolerance);
    setNotes(kpi.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingKpi) return;
    setIsUpdating(true);
    try {
      await onUpdateKpi({
        kpiId: editingKpi.id,
        targetValue,
        warningTolerance,
        notes
      });
      setEditingKpi(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Catálogo Oficial de Parámetros SIG
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Matriz Maestra de Indicadores de Gestión
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Fichas técnicas, fórmulas matemáticas, metas y responsables según documento LP-SIG-FR-011 Versión 04.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-medium">
            Total Indicadores: <strong>{kpis.length}</strong>
          </div>
        </div>
      </div>

      {/* Observaciones y Reglas del Documento Oficial */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-emerald-700" />
          <span>Reglas de Negocio e Inconsistencias Documentadas del Formato Oficial</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">1. Errata Tipográfica en Meta SIG Ambiental:</span>
            <span>En el formato físico figura "&lt; 95%" para "Residuos gestionados correctamente", pero 100% cumple meta verde. Se estandariza a ≥ 95% con advertencia documental.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">2. Manejo de Valores Numéricos Atípicos:</span>
            <span>En Acopio Mayo 2026 figura 100.1% de materia prima conforme; en Legal figura -100% por división con 0 casos. El sistema procesa los datos reales y previene errores futuros.</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-800 block mb-1">3. Frecuencia y Completitud Anual:</span>
            <span>"Índice de Innovación" y "Cumplimiento de Inventarios" son anuales; no penalizan la completitud mensual de meses regulares.</span>
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
              placeholder="Buscar por código, nombre o proceso..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none w-64"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['ALL', 'ESTRATEGICO', 'OPERATIVO', 'SOPORTE'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'Todos' : cat === 'ESTRATEGICO' ? 'Estratégicos' : cat === 'OPERATIVO' ? 'Operativos' : 'Soporte'}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Listando {filteredKpis.length} indicadores
        </span>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-24">Código</th>
                <th className="py-3 px-4 w-40">Proceso</th>
                <th className="py-3 px-4">Indicador / Objetivo</th>
                <th className="py-3 px-4 w-48">Fórmula Matemática</th>
                <th className="py-3 px-4 w-24 text-right">Meta</th>
                <th className="py-3 px-4 w-28 text-center">Frecuencia</th>
                <th className="py-3 px-4 w-36">Responsable</th>
                {currentUser.role === 'ADMIN' && <th className="py-3 px-4 w-16 text-center">Editar</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredKpis.map((k) => {
                const proc = processes.find(p => p.id === k.processId);

                return (
                  <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                      {k.code}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900 block">{proc?.name}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {proc?.category}
                        {k.operationalLineId && ` · Línea ${k.operationalLineId.replace('_', ' ')}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{k.name}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{k.objective}</span>
                      {k.notes && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block mt-1 font-medium">
                          {k.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 text-[11px]">
                      {k.formulaDescription}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {k.operator} {k.targetValue}{k.unit}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {k.frequency}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {k.responsibleTitle}
                    </td>
                    {currentUser.role === 'ADMIN' && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleStartEdit(k)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Modificar meta o parámetros del indicador"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit KPI Modal for Administrator */}
      {editingKpi && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="font-mono text-xs font-bold text-slate-500">{editingKpi.code}</span>
                <h3 className="text-base font-bold text-slate-900">{editingKpi.name}</h3>
              </div>
              <button
                onClick={() => setEditingKpi(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Meta Objetivo ({editingKpi.unit}):</label>
                <input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900 font-bold focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Tolerancia para Alerta (Zona Amarilla):</label>
                <input
                  type="number"
                  step="any"
                  value={warningTolerance}
                  onChange={(e) => setWarningTolerance(parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg p-2 font-mono text-slate-900 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">
                  Diferencia respecto a la meta que activará el estado preventivo Amarillo.
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Notas Técnicas / Justificación:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                onClick={() => setEditingKpi(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isUpdating}
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
              >
                Guardar y Registrar en Auditoría
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
