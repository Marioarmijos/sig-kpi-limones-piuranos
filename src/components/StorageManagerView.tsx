/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Módulo de Gestión de Almacenamiento y Liberación de Espacio de Evidencias (Rol Administrador)
 * Limones Piuranos S.A.C. · LP-SIG-FR-011 V.04
 */

import React, { useState, useMemo } from 'react';
import {
  KPIDefinition,
  MonthlyRecord,
  ProcessDefinition,
  UserAccount,
  EvidenceFile
} from '../types/sig';
import {
  HardDrive,
  Trash2,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertTriangle,
  CheckCircle2,
  X,
  FileDown,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface StorageManagerViewProps {
  kpis: KPIDefinition[];
  records: MonthlyRecord[];
  processes: ProcessDefinition[];
  currentUser: UserAccount;
  onDeleteFile: (recordId: string, fileId: string) => Promise<void>;
  onBulkDeleteFiles: (fileIds: string[]) => Promise<void>;
}

interface FlattenedFileEntry {
  file: EvidenceFile;
  recordId: string;
  kpiId: string;
  kpiCode: string;
  kpiName: string;
  processName: string;
  period: string;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function downloadSingleFile(file: EvidenceFile) {
  if (!file.dataUrl) return;
  const link = document.createElement('a');
  link.href = file.dataUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const StorageManagerView: React.FC<StorageManagerViewProps> = ({
  kpis,
  records,
  processes,
  currentUser,
  onDeleteFile,
  onBulkDeleteFiles
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('ALL');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<'ALL' | 'PDF' | 'PNG'>('ALL');
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());
  const [previewingFile, setPreviewingFile] = useState<EvidenceFile | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Flatten all files across records with KPI and Process context
  const allFlattenedFiles: FlattenedFileEntry[] = useMemo(() => {
    const list: FlattenedFileEntry[] = [];
    records.forEach(rec => {
      if (rec.evidenceFiles && rec.evidenceFiles.length > 0) {
        const kpi = kpis.find(k => k.id === rec.kpiId);
        const proc = processes.find(p => p.id === kpi?.processId);

        rec.evidenceFiles.forEach(file => {
          list.push({
            file,
            recordId: rec.id,
            kpiId: rec.kpiId,
            kpiCode: kpi?.code || 'KPI',
            kpiName: kpi?.name || 'Indicador',
            processName: proc?.name || 'Proceso',
            period: rec.period
          });
        });
      }
    });
    return list;
  }, [records, kpis, processes]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    return allFlattenedFiles.filter(item => {
      if (selectedPeriod !== 'ALL' && item.period !== selectedPeriod) return false;

      const kpi = kpis.find(k => k.id === item.kpiId);
      if (selectedProcessId !== 'ALL' && kpi?.processId !== selectedProcessId) return false;

      const isPdf = item.file.type.includes('pdf') || item.file.name.toLowerCase().endsWith('.pdf');
      if (selectedFormat === 'PDF' && !isPdf) return false;
      if (selectedFormat === 'PNG' && isPdf) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.file.name.toLowerCase().includes(q);
        const matchCode = item.kpiCode.toLowerCase().includes(q);
        const matchKpi = item.kpiName.toLowerCase().includes(q);
        const matchProc = item.processName.toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchKpi && !matchProc) return false;
      }

      return true;
    });
  }, [allFlattenedFiles, selectedPeriod, selectedProcessId, selectedFormat, searchQuery, kpis]);

  // Overall storage statistics
  const totalStorageBytes = useMemo(() => {
    return allFlattenedFiles.reduce((acc, item) => acc + (item.file.size || 0), 0);
  }, [allFlattenedFiles]);

  const pdfCount = useMemo(() => {
    return allFlattenedFiles.filter(item => item.file.type.includes('pdf') || item.file.name.toLowerCase().endsWith('.pdf')).length;
  }, [allFlattenedFiles]);

  const pngCount = allFlattenedFiles.length - pdfCount;

  // Selected files count & total bytes
  const selectedCount = selectedFileIds.size;
  const selectedBytes = useMemo(() => {
    return allFlattenedFiles
      .filter(item => selectedFileIds.has(item.file.id))
      .reduce((acc, item) => acc + (item.file.size || 0), 0);
  }, [allFlattenedFiles, selectedFileIds]);

  // Handlers for selection
  const handleToggleSelect = (fileId: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(fileId)) next.delete(fileId);
      else next.add(fileId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedFileIds.size === filteredFiles.length) {
      setSelectedFileIds(new Set());
    } else {
      setSelectedFileIds(new Set(filteredFiles.map(f => f.file.id)));
    }
  };

  // Delete single file
  const handleDeleteSingle = async (recordId: string, file: EvidenceFile) => {
    if (!window.confirm(`¿Está seguro de eliminar el archivo "${file.name}"?\nEsta acción liberará ${formatBytes(file.size)} de espacio de trabajo de forma permanente.`)) {
      return;
    }

    setIsDeleting(true);
    setActionSuccessMsg(null);
    try {
      await onDeleteFile(recordId, file.id);
      setSelectedFileIds(prev => {
        const next = new Set(prev);
        next.delete(file.id);
        return next;
      });
      setActionSuccessMsg(`Archivo "${file.name}" eliminado correctamente. Se liberaron ${formatBytes(file.size)}.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete selected
  const handleBulkDelete = async () => {
    if (selectedFileIds.size === 0) return;
    const ids = Array.from(selectedFileIds);
    if (!window.confirm(`¿Desea eliminar los ${ids.length} archivos seleccionados?\nSe liberarán aproximadamente ${formatBytes(selectedBytes)} de espacio de trabajo.`)) {
      return;
    }

    setIsDeleting(true);
    setActionSuccessMsg(null);
    try {
      await onBulkDeleteFiles(ids);
      setSelectedFileIds(new Set());
      setActionSuccessMsg(`Se eliminaron con éxito ${ids.length} archivos, liberando ${formatBytes(selectedBytes)} de almacenamiento.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk download selected
  const handleDownloadSelected = () => {
    const toDownload = allFlattenedFiles.filter(item => selectedFileIds.has(item.file.id));
    if (toDownload.length === 0) return;
    toDownload.forEach(item => {
      downloadSingleFile(item.file);
    });
  };

  const monthsList = [
    { value: 'ALL', label: 'Todos los períodos' },
    { value: '2026-01', label: 'Enero 2026' },
    { value: '2026-02', label: 'Febrero 2026' },
    { value: '2026-03', label: 'Marzo 2026' },
    { value: '2026-04', label: 'Abril 2026' },
    { value: '2026-05', label: 'Mayo 2026' },
    { value: '2026-06', label: 'Junio 2026' },
    { value: '2026-07', label: 'Julio 2026' },
    { value: '2026-08', label: 'Agosto 2026' },
    { value: '2026-09', label: 'Setiembre 2026' },
    { value: '2026-10', label: 'Octubre 2026' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <span>Control Administrativo del Sistema</span>
            <span>·</span>
            <span>Limones Piuranos S.A.C.</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-emerald-700" />
            <span>Gestor de Almacenamiento y Evidencias Documentales</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualización, descarga masiva y liberación de espacio de trabajo de los archivos PDF y PNG subidos por los dueños de proceso.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedCount > 0 && (
            <button
              onClick={handleDownloadSelected}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar ({selectedCount})</span>
            </button>
          )}

          {selectedCount > 0 && (
            <button
              disabled={isDeleting}
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar y Liberar ({formatBytes(selectedBytes)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Storage Gauge & Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Espacio Utilizado */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Espacio Utilizado</span>
            <HardDrive className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {formatBytes(totalStorageBytes)}
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(5, (totalStorageBytes / (250 * 1024 * 1024)) * 100))}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Capacidad disponible garantizada con límite de 25 MB por archivo.
          </span>
        </div>

        {/* Card 2: Total Archivos */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Archivos Almacenados</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono">
              {allFlattenedFiles.length}
            </span>
            <span className="text-xs text-slate-500">archivos totales</span>
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-red-700">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>{pdfCount} PDF</span>
            </span>
            <span className="flex items-center gap-1 font-semibold text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{pngCount} PNG</span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Evidencias subidas por dueños de proceso.
          </span>
        </div>

        {/* Card 3: Selección Actual */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Selección para Limpieza</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-600 font-mono">
              {selectedCount}
            </span>
            <span className="text-xs text-slate-500">
              ({formatBytes(selectedBytes)})
            </span>
          </div>
          <div className="mt-3 text-xs text-slate-600">
            {selectedCount > 0 ? (
              <span className="text-emerald-700 font-semibold">Listo para descargar o liberar espacio</span>
            ) : (
              <span className="text-slate-400">Seleccione casillas de la tabla</span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Elimina archivos no requeridos para optimizar espacio.
          </span>
        </div>

        {/* Card 4: Política de Retención y Auditoría */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Trazabilidad SIG</span>
            <Sparkles className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">Auditoría Permanente ISO 9001</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Toda eliminación o descarga queda asentada con fecha, usuario y volumen en la bitácora de auditoría.
            </p>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-3 block">
            ✔ Respaldo integral asegurado
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold cursor-pointer"
          >
            Descartar
          </button>
        </div>
      )}

      {/* Table & Toolbar Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filters Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Inventario de Archivos de Respaldo por Indicador
            </h3>
            <span className="text-xs text-slate-500">
              Mostrando {filteredFiles.length} de {allFlattenedFiles.length} archivos registrados
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar archivo o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none w-48"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            {/* Period Filter */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              {monthsList.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>

            {/* Process Filter */}
            <select
              value={selectedProcessId}
              onChange={(e) => setSelectedProcessId(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los procesos</option>
              {processes.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Format Filter */}
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los formatos</option>
              <option value="PDF">Solo PDF (.pdf)</option>
              <option value="PNG">Solo Imágenes (.png)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-10 text-center">
                  <button
                    onClick={handleSelectAll}
                    className="cursor-pointer text-slate-500 hover:text-emerald-700"
                    title="Seleccionar todos"
                  >
                    {filteredFiles.length > 0 && selectedFileIds.size === filteredFiles.length ? (
                      <CheckSquare className="w-4 h-4 text-emerald-700" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4 w-28">Período</th>
                <th className="py-3 px-4 w-32">Código KPI</th>
                <th className="py-3 px-4">Proceso / Indicador</th>
                <th className="py-3 px-4">Nombre de Archivo de Evidencia</th>
                <th className="py-3 px-4 w-24 text-center">Formato</th>
                <th className="py-3 px-4 w-24 text-right">Tamaño</th>
                <th className="py-3 px-4 w-36">Subido Por</th>
                <th className="py-3 px-4 w-28 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredFiles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-400">
                    No se encontraron archivos de evidencia con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredFiles.map((item) => {
                  const isPdf = item.file.type.includes('pdf') || item.file.name.toLowerCase().endsWith('.pdf');
                  const isSelected = selectedFileIds.has(item.file.id);

                  return (
                    <tr
                      key={`${item.recordId}_${item.file.id}`}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.file.id)}
                          className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {item.period}
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {item.kpiCode}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-800">
                        <span className="font-semibold block truncate max-w-xs">{item.kpiName}</span>
                        <span className="text-[10px] text-slate-400 block truncate">{item.processName}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 min-w-0 max-w-sm">
                          <div
                            className={`p-1.5 rounded shrink-0 ${
                              isPdf ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {isPdf ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-medium text-slate-900 truncate" title={item.file.name}>
                            {item.file.name}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPdf ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isPdf ? 'PDF' : 'PNG'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-800 whitespace-nowrap">
                        {formatBytes(item.file.size)}
                      </td>

                      <td className="py-3 px-4 text-slate-600 text-[11px] whitespace-nowrap truncate max-w-[140px]">
                        <span className="block truncate" title={item.file.uploadedBy || 'Usuario'}>
                          {item.file.uploadedBy || 'Dueño de proceso'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(item.file.uploadedAt).toLocaleDateString('es-PE')}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewingFile(item.file)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer transition-colors"
                            title="Visualizar documento"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadSingleFile(item.file)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer transition-colors"
                            title="Descargar archivo"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingle(item.recordId, item.file)}
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition-colors"
                            title="Eliminar permanentemente para liberar espacio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-600 font-medium">
            <span>Espacio de trabajo administrado por: </span>
            <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.email})
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            Módulo de Optimización de Espacio · SIG LP-SIG-FR-011 V.04
          </div>
        </div>
      </div>

      {/* MODAL DE PREVISUALIZACIÓN DE ARCHIVO */}
      {previewingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5 min-w-0 pr-4">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    previewingFile.type.includes('pdf') || previewingFile.name.toLowerCase().endsWith('.pdf')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {previewingFile.type.includes('pdf') || previewingFile.name.toLowerCase().endsWith('.pdf') ? (
                    <FileText className="w-5 h-5" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{previewingFile.name}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>{formatBytes(previewingFile.size)}</span>
                    <span>·</span>
                    <span>Subido: {new Date(previewingFile.uploadedAt).toLocaleString('es-PE')}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => downloadSingleFile(previewingFile)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewingFile(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100/60 min-h-[350px]">
              {previewingFile.type.includes('pdf') || previewingFile.name.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewingFile.dataUrl}
                  title={previewingFile.name}
                  className="w-full h-[65vh] rounded-lg border border-slate-300 bg-white shadow-xs"
                />
              ) : (
                <img
                  src={previewingFile.dataUrl}
                  alt={previewingFile.name}
                  className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-md border border-slate-200 bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
