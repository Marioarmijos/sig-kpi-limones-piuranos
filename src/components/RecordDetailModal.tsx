/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Modal de Ficha Técnica Detallada e Historial de KPI (LP-SIG-FR-011 V.04)
 * Con visualización, descarga de archivos de evidencia (PDF / PNG)
 * y opción de eliminación de archivos para el Administrador para liberar espacio.
 */

import React, { useState } from 'react';
import { KPIDefinition, MonthlyRecord, ProcessDefinition, EvidenceFile, UserAccount } from '../types/sig';
import { getEvidenceRequirement } from '../utils/evidenceRequirements';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Calendar,
  Edit3,
  FileWarning,
  Paperclip,
  Image as ImageIcon,
  Eye,
  Download,
  Trash2,
  HardDrive
} from 'lucide-react';

interface RecordDetailModalProps {
  kpi: KPIDefinition;
  record?: MonthlyRecord;
  allRecords: MonthlyRecord[];
  processes: ProcessDefinition[];
  period: string;
  currentUser?: UserAccount;
  onClose: () => void;
  onGoToEntry: (kpiId: string) => void;
  onDeleteFile?: (recordId: string, fileId: string) => Promise<void>;
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function triggerDownload(file: EvidenceFile) {
  if (!file.dataUrl) return;
  const link = document.createElement('a');
  link.href = file.dataUrl;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  kpi,
  record,
  allRecords,
  processes,
  period,
  currentUser,
  onClose,
  onGoToEntry,
  onDeleteFile
}) => {
  const proc = processes.find(p => p.id === kpi.processId);
  const [previewingFile, setPreviewingFile] = useState<EvidenceFile | null>(null);
  const evidenceReq = getEvidenceRequirement(kpi);

  // Collect all months for this KPI (Ene-Oct 2026)
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
  const monthLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct'];

  const handleDeleteEvidence = async (file: EvidenceFile) => {
    if (!record || !onDeleteFile) return;
    if (window.confirm(`¿Está seguro de eliminar el archivo "${file.name}" permanentemente?\nEsta acción liberará ${formatFileSize(file.size)} de espacio en el sistema.`)) {
      await onDeleteFile(record.id, file.id);
    }
  };

  const handleDownloadAll = () => {
    if (!record?.evidenceFiles) return;
    record.evidenceFiles.forEach(f => triggerDownload(f));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                {kpi.code}
              </span>
              <span className="text-xs text-slate-500">
                {proc?.name} {kpi.operationalLineId && `(Línea ${kpi.operationalLineId.replace('_', ' ')})`}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{kpi.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ficha Técnica Card */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 text-xs">
          <div>
            <span className="font-semibold text-slate-700">Objetivo del Indicador:</span>
            <p className="text-slate-600 mt-0.5">{kpi.objective}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <div>
              <span className="font-semibold text-slate-700">Fórmula de Cálculo:</span>
              <p className="font-mono text-slate-800 font-bold mt-0.5">{kpi.formulaDescription}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Meta y Tolerancia:</span>
              <p className="text-slate-800 font-bold mt-0.5">
                {kpi.operator} {kpi.targetValue}{kpi.unit} (Alerta: ±{kpi.warningTolerance}{kpi.unit})
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200">
            <div>
              <span className="font-semibold text-slate-700">Fuente de Información:</span>
              <p className="text-slate-600 mt-0.5">{kpi.sourceOfData}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Responsable de Medición:</span>
              <p className="text-slate-600 mt-0.5">{kpi.responsibleTitle || proc?.defaultResponsible}</p>
            </div>
          </div>
          {kpi.notes && (
            <div className="pt-2 border-t border-slate-200">
              <span className="font-semibold text-amber-800">Nota Técnica / Errata Documentada:</span>
              <p className="text-amber-900 mt-0.5">{kpi.notes}</p>
            </div>
          )}
        </div>

        {/* Evidencia Requerida según la Ficha Técnica */}
        {evidenceReq && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-emerald-950">
              <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
              <span>Evidencia Requerida: {evidenceReq.shortPrompt}</span>
            </div>
            <p className="text-emerald-800 text-[11px] leading-relaxed">
              {evidenceReq.detailedInstruction}
            </p>
          </div>
        )}

        {/* Selected Period Status & Real Evidence Variables */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
            <span>Evaluación del Periodo: {period}</span>
            {record?.complianceStatus === 'VERDE' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cumple Meta</span>
              </span>
            )}
            {record?.complianceStatus === 'AMARILLO' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>En Alerta</span>
              </span>
            )}
            {record?.complianceStatus === 'ROJO' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Acción Correctiva</span>
              </span>
            )}
            {(!record || record.complianceStatus === 'SIN_DATO') && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                <FileWarning className="w-3.5 h-3.5" />
                <span>Sin Datos Brindados (#¡DIV/0!)</span>
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {record && record.calculatedResult !== null ? `${record.calculatedResult}${kpi.unit}` : '#¡DIV/0!'}
            </span>
            <span className="text-slate-500">
              (Meta fijada: {kpi.operator} {kpi.targetValue}{kpi.unit})
            </span>
          </div>

          {/* Real Variables Evidence Breakdown */}
          {record && record.inputs && Object.keys(record.inputs).length > 0 && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1 text-[11px] uppercase tracking-wider">
                Variables Reales de la Ficha Técnica:
              </span>
              <div className="grid grid-cols-2 gap-2 font-mono">
                {Object.entries(record.inputs).map(([k, v]) => (
                  <div key={k} className="flex justify-between bg-white px-2 py-1 rounded border border-slate-100 text-slate-700">
                    <span className="capitalize">{k}:</span>
                    <span className="font-bold text-slate-900">{typeof v === 'number' ? v.toLocaleString('es-PE') : v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {record?.observations && (
            <div className="pt-2 text-slate-600">
              <span className="font-semibold text-slate-700">Observaciones registradas:</span>
              <p className="mt-0.5 bg-slate-50 p-2 rounded border border-slate-200">{record.observations}</p>
            </div>
          )}

          {/* Referencia documental y Archivos de Evidencia Adjuntos */}
          {(record?.evidenceRef || (record?.evidenceFiles && record.evidenceFiles.length > 0)) && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {record?.evidenceRef && (
                <div className="text-slate-600">
                  <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px]">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Referencia documental:</span>
                  </span>
                  <p className="font-mono text-[11px] text-slate-800 mt-0.5">{record.evidenceRef}</p>
                </div>
              )}

              {record?.evidenceFiles && record.evidenceFiles.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-700 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Archivos de Evidencia Adjuntos ({record.evidenceFiles.length}):</span>
                    </span>
                    {record.evidenceFiles.length > 1 && (
                      <button
                        type="button"
                        onClick={handleDownloadAll}
                        className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Descargar todos</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {record.evidenceFiles.map(file => {
                      const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
                      return (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded-lg border border-slate-200 bg-white shadow-2xs text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <div className={`p-1.5 rounded shrink-0 ${isPdf ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {isPdf ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-slate-800 text-[11px] block truncate" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {formatFileSize(file.size)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setPreviewingFile(file)}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                              title="Visualizar archivo"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => triggerDownload(file)}
                              className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded cursor-pointer"
                              title="Descargar archivo"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            {currentUser?.role === 'ADMIN' && onDeleteFile && (
                              <button
                                type="button"
                                onClick={() => handleDeleteEvidence(file)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                                title="Eliminar para liberar espacio"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 italic pt-1">
                  Sin archivos de evidencia adjuntos en este período.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 10-Month Historical Comparison Table */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Histórico Oficial Ene–Oct 2026 (LP-SIG-FR-011 V.04)
          </span>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {months.map((m, idx) => {
              const rec = allRecords.find(r => r.kpiId === kpi.id && r.period === m);
              const val = rec && rec.calculatedResult !== null ? rec.calculatedResult : null;
              const status = rec ? rec.complianceStatus : 'SIN_DATO';

              return (
                <div
                  key={m}
                  className={`p-2 rounded border text-center text-xs ${
                    status === 'VERDE'
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : status === 'AMARILLO'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : status === 'ROJO'
                      ? 'bg-red-50/70 border-red-200 text-red-900'
                      : 'bg-rose-50/60 border-rose-200 text-rose-700'
                  }`}
                >
                  <span className="font-semibold block text-[10px] text-slate-500">{monthLabels[idx]}</span>
                  <span className="font-mono font-bold block my-1">
                    {val !== null ? `${val}${kpi.unit}` : '#¡DIV/0!'}
                  </span>
                  <span className="text-[9px] block">
                    {status === 'VERDE' ? 'OK' : status === 'AMARILLO' ? 'Alerta' : status === 'ROJO' ? 'Rojo' : 'Sin Dato'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            onClick={() => {
              onClose();
              onGoToEntry(kpi.id);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Ir a Registro de este KPI</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Modal de Previsualización interna de archivo */}
      {previewingFile && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${
                    previewingFile.type.includes('pdf') || previewingFile.name.toLowerCase().endsWith('.pdf')
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {previewingFile.type.includes('pdf') || previewingFile.name.toLowerCase().endsWith('.pdf') ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <ImageIcon className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 text-xs truncate">{previewingFile.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatFileSize(previewingFile.size)} · Subido: {new Date(previewingFile.uploadedAt).toLocaleString('es-PE')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => triggerDownload(previewingFile)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewingFile(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-slate-100/60 min-h-[350px]">
              {previewingFile.type.includes('pdf') || previewingFile.name.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={previewingFile.dataUrl}
                  title={previewingFile.name}
                  className="w-full h-[65vh] rounded-lg border border-slate-300 bg-white"
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
