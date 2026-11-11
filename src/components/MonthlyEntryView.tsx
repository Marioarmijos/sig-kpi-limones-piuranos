/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Módulo de Registro Mensual de KPIs con validación por rol, cálculo en tiempo real,
 * Solicitud de Evidencia Contextualizada por Indicador (Obligatoria para Validación),
 * Carga de Múltiples Archivos PDF/PNG (límite 25 MB) y Opciones de Administración para Liberar Espacio.
 * Limones Piuranos S.A.C. · LP-SIG-FR-011 V.04
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  KPIDefinition,
  MonthlyRecord,
  ProcessDefinition,
  UserAccount,
  OperationalLineDefinition,
  EvidenceFile
} from '../types/sig';
import { getEvidenceRequirement } from '../utils/evidenceRequirements';
import {
  Save,
  Send,
  CheckCircle,
  AlertCircle,
  FileCheck,
  ShieldAlert,
  Info,
  RotateCcw,
  Paperclip,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  Eye,
  Download,
  X,
  FileUp,
  AlertTriangle,
  FolderArchive,
  HardDrive
} from 'lucide-react';

interface MonthlyEntryViewProps {
  kpis: KPIDefinition[];
  records: MonthlyRecord[];
  processes: ProcessDefinition[];
  lines: OperationalLineDefinition[];
  currentUser: UserAccount;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onSaveRecord: (payload: {
    kpiId: string;
    period: string;
    inputs: Record<string, number>;
    observations?: string;
    evidenceRef?: string;
    evidenceFiles?: EvidenceFile[];
    submitForValidation: boolean;
  }) => Promise<void>;
  onReviewRecord: (recordId: string, action: 'VALIDATE' | 'RETURN', reason?: string) => Promise<void>;
  onDeleteFile?: (recordId: string, fileId: string) => Promise<void>;
  onNavigateToStorage?: () => void;
  initialProcessId?: string;
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

export const MonthlyEntryView: React.FC<MonthlyEntryViewProps> = ({
  kpis,
  records,
  processes,
  currentUser,
  selectedPeriod,
  onPeriodChange,
  onSaveRecord,
  onReviewRecord,
  onDeleteFile,
  onNavigateToStorage,
  initialProcessId
}) => {
  // Determine processes the current user can access
  const authorizedProcesses = useMemo(() => {
    if (currentUser.role === 'ADMIN') return processes;
    return processes.filter(p => currentUser.processIds.includes(p.id));
  }, [processes, currentUser]);

  const [activeProcessId, setActiveProcessId] = useState<string>(() => {
    if (initialProcessId && authorizedProcesses.some(p => p.id === initialProcessId)) {
      return initialProcessId;
    }
    return authorizedProcesses.length > 0 ? authorizedProcesses[0].id : '';
  });

  // Sync if initialProcessId changes
  React.useEffect(() => {
    if (initialProcessId && authorizedProcesses.some(p => p.id === initialProcessId)) {
      setActiveProcessId(initialProcessId);
    }
  }, [initialProcessId, authorizedProcesses]);

  // Selected KPI inside the process
  const processKpis = useMemo(() => {
    if (!activeProcessId) return [];
    return kpis.filter(k => {
      if (k.processId !== activeProcessId) return false;
      // If user is restricted to an operational line (e.g. CITRICOS, JUGOS_TROPICALES, FRUTA_FRESCA)
      if (currentUser.role === 'OPERATIONAL_USER' && currentUser.operationalLineId) {
        if (k.operationalLineId && k.operationalLineId !== currentUser.operationalLineId) {
          return false;
        }
      }
      return true;
    });
  }, [kpis, activeProcessId, currentUser]);

  const [selectedKpiId, setSelectedKpiId] = useState<string>('');

  // Active KPI object
  const activeKpi = useMemo(() => {
    if (selectedKpiId) {
      const found = processKpis.find(k => k.id === selectedKpiId);
      if (found) return found;
    }
    return processKpis.length > 0 ? processKpis[0] : null;
  }, [processKpis, selectedKpiId]);

  // Specific evidence requirement for the active KPI
  const evidenceReq = useMemo(() => {
    if (!activeKpi) return null;
    return getEvidenceRequirement(activeKpi);
  }, [activeKpi]);

  // Existing record for this KPI & Period
  const activeRecord = useMemo(() => {
    if (!activeKpi) return undefined;
    return records.find(r => r.kpiId === activeKpi.id && r.period === selectedPeriod);
  }, [records, activeKpi, selectedPeriod]);

  // Form input states
  const [inputNumerador, setInputNumerador] = useState<string>('');
  const [inputDenominador, setInputDenominador] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [evidenceRef, setEvidenceRef] = useState<string>('');
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // File upload drag & preview states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [previewingFile, setPreviewingFile] = useState<EvidenceFile | null>(null);

  // Sync inputs whenever activeKpi or period changes
  React.useEffect(() => {
    if (activeRecord) {
      setInputNumerador(activeRecord.inputs.numerador !== undefined ? String(activeRecord.inputs.numerador) : '');
      setInputDenominador(activeRecord.inputs.denominador !== undefined ? String(activeRecord.inputs.denominador) : '');
      setObservations(activeRecord.observations || '');
      setEvidenceRef(activeRecord.evidenceRef || '');
      setEvidenceFiles(activeRecord.evidenceFiles ? [...activeRecord.evidenceFiles] : []);
    } else {
      setInputNumerador('');
      setInputDenominador(activeKpi && activeKpi.variables.length >= 2 ? '100' : '');
      setObservations('');
      setEvidenceRef('');
      setEvidenceFiles([]);
    }
    setSaveSuccessMsg(null);
    setFileUploadError(null);
  }, [activeKpi, activeRecord, selectedPeriod]);

  // Real-time calculation
  const calculatedResult = useMemo(() => {
    if (!activeKpi) return null;
    const num = parseFloat(inputNumerador);
    if (isNaN(num)) return null;

    if (activeKpi.variables.length >= 2) {
      const den = parseFloat(inputDenominador);
      if (isNaN(den) || den === 0) return 0;
      return Number(((num / den) * 100).toFixed(1));
    }
    return num;
  }, [activeKpi, inputNumerador, inputDenominador]);

  // Compliance preview
  const previewCompliance = useMemo(() => {
    if (!activeKpi || calculatedResult === null) return 'SIN_DATO';
    const target = activeKpi.targetValue;
    const tol = activeKpi.warningTolerance;

    if (activeKpi.operator === '>=') {
      if (calculatedResult >= target) return 'VERDE';
      if (calculatedResult >= target - tol) return 'AMARILLO';
      return 'ROJO';
    }
    if (activeKpi.operator === '>') {
      if (calculatedResult > target) return 'VERDE';
      if (calculatedResult >= target - tol) return 'AMARILLO';
      return 'ROJO';
    }
    if (activeKpi.operator === '<=') {
      if (calculatedResult <= target) return 'VERDE';
      if (calculatedResult <= target + tol) return 'AMARILLO';
      return 'ROJO';
    }
    return calculatedResult >= target ? 'VERDE' : 'ROJO';
  }, [activeKpi, calculatedResult]);

  // Handle multiple file selection / drop with 25 MB limit per file
  const handleProcessFiles = (files: FileList | File[]) => {
    setFileUploadError(null);
    const validFiles: File[] = [];
    const maxSizeBytes = 25 * 1024 * 1024; // 25 MB per file

    Array.from(files).forEach(file => {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');

      if (!isPdf && !isPng) {
        setFileUploadError(`El archivo "${file.name}" no está permitido. Solo se aceptan archivos en formato PDF (.pdf) o imágenes PNG (.png).`);
        return;
      }

      if (file.size > maxSizeBytes) {
        setFileUploadError(`El archivo "${file.name}" (${formatFileSize(file.size)}) supera el límite máximo de 25 MB por archivo.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length === 0) return;

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const newFile: EvidenceFile = {
          id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          size: file.size,
          type: file.type || (file.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/png'),
          dataUrl: result,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser.email
        };

        setEvidenceFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Remove file from form state or call server if admin
  const handleRemoveFile = async (fileId: string) => {
    const targetFile = evidenceFiles.find(f => f.id === fileId);
    if (!targetFile) return;

    // If Admin and record exists on server, ask to liberate space permanently
    if (currentUser.role === 'ADMIN' && activeRecord && onDeleteFile) {
      const confirmMsg = `¿Desea eliminar el archivo "${targetFile.name}" (${formatFileSize(targetFile.size)}) permanentemente para liberar espacio de trabajo?`;
      if (window.confirm(confirmMsg)) {
        await onDeleteFile(activeRecord.id, fileId);
      }
    }

    setEvidenceFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Download all files for this KPI
  const handleDownloadAllFiles = () => {
    if (evidenceFiles.length === 0) return;
    evidenceFiles.forEach(file => triggerDownload(file));
  };

  // Submit Handler with Strict Evidence Obligation
  const handleSubmit = async (submitForValidation: boolean) => {
    if (!activeKpi) return;
    setFileUploadError(null);
    setSaveSuccessMsg(null);

    // Strict validation: Evidence is mandatory when submitting for formal validation
    if (submitForValidation) {
      if (!inputNumerador || inputNumerador.trim() === '') {
        setFileUploadError('Debe ingresar los datos numéricos requeridos antes de enviar a validación.');
        return;
      }

      if (!evidenceFiles || evidenceFiles.length === 0) {
        setFileUploadError(
          `⚠️ Evidencia Obligatoria: Para enviar este indicador a validación de Gerencia SIG, es estrictamente obligatorio adjuntar al menos un archivo (PDF o PNG) correspondiente a: "${evidenceReq?.shortPrompt || 'Evidencia de respaldo'}".`
        );
        const uploadEl = document.getElementById('zona-carga-archivos');
        if (uploadEl) uploadEl.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const num = parseFloat(inputNumerador) || 0;
      const den = parseFloat(inputDenominador) || 1;

      await onSaveRecord({
        kpiId: activeKpi.id,
        period: selectedPeriod,
        inputs: { numerador: num, denominador: den },
        observations,
        evidenceRef: evidenceRef.trim() || evidenceReq?.mandatoryItemName,
        evidenceFiles,
        submitForValidation
      });

      setSaveSuccessMsg(
        submitForValidation
          ? `Registro y ${evidenceFiles.length} archivo(s) de evidencia enviados formalmente a validación de Gerencia SIG.`
          : `Borrador guardado exitosamente. ${evidenceFiles.length === 0 ? 'Nota: Para el envío a validación final de Gerencia SIG será obligatorio adjuntar la evidencia en PDF o PNG.' : ''}`
      );
    } catch (err: any) {
      console.error(err);
      setFileUploadError('Ocurrió un error al guardar el registro. Intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAdminApproval = async (action: 'VALIDATE' | 'RETURN') => {
    if (!activeRecord) return;
    const reason = action === 'RETURN' ? prompt('Ingrese el motivo de devolución del registro:') || undefined : undefined;
    if (action === 'RETURN' && !reason) return;

    await onReviewRecord(activeRecord.id, action, reason);
    setSaveSuccessMsg(action === 'VALIDATE' ? 'Registro validado y aprobado.' : 'Registro devuelto al responsable.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Sistema de Monitoreo ISO 9001 / BASC
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Registro Mensual de Indicadores de Gestión
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Carga de datos de origen, cálculo automatizado de resultados y respaldo obligatorio con archivos PDF o PNG.
          </p>
        </div>

        {/* Period Selector & Admin Storage Shortcut */}
        <div className="flex items-center gap-3">
          {currentUser.role === 'ADMIN' && onNavigateToStorage && (
            <button
              onClick={onNavigateToStorage}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
              title="Abrir Gestor de Almacenamiento y Liberación de Espacio"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-700" />
              <span>Gestor de Espacio</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="entry-period-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
              Mes de Medición:
            </label>
            <select
              id="entry-period-select"
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="2026-01">Enero 2026</option>
              <option value="2026-02">Febrero 2026</option>
              <option value="2026-03">Marzo 2026</option>
              <option value="2026-04">Abril 2026</option>
              <option value="2026-05">Mayo 2026</option>
              <option value="2026-06">Junio 2026</option>
              <option value="2026-07">Julio 2026</option>
              <option value="2026-08">Agosto 2026</option>
              <option value="2026-09">Setiembre 2026</option>
              <option value="2026-10">Octubre 2026</option>
              <option value="2026-11">Noviembre 2026</option>
              <option value="2026-12">Diciembre 2026</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Authorized Processes & KPI Selector */}
        <div className="lg:col-span-4 space-y-5">
          {/* Process Switcher */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
              Procesos Asignados a su Cuenta:
            </label>
            <div className="space-y-1.5">
              {authorizedProcesses.map(proc => (
                <button
                  key={proc.id}
                  onClick={() => {
                    setActiveProcessId(proc.id);
                    setSelectedKpiId('');
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                    activeProcessId === proc.id
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{proc.name}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${
                      activeProcessId === proc.id
                        ? 'bg-emerald-900 text-emerald-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {proc.category.substring(0, 3)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* KPI List in Selected Process */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Indicadores a Registrar ({processKpis.length})
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {selectedPeriod}
              </span>
            </div>

            {processKpis.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No hay indicadores asignados para este proceso o línea.
              </p>
            ) : (
              <div className="space-y-2">
                {processKpis.map(k => {
                  const rec = records.find(r => r.kpiId === k.id && r.period === selectedPeriod);
                  const isCurrent = activeKpi?.id === k.id;
                  const hasFiles = rec?.evidenceFiles && rec.evidenceFiles.length > 0;

                  return (
                    <div
                      key={k.id}
                      onClick={() => setSelectedKpiId(k.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-slate-900">{k.code}</span>
                        <div className="flex items-center gap-1.5">
                          {hasFiles && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.2 rounded" title={`${rec?.evidenceFiles?.length} archivos de evidencia adjuntos`}>
                              <Paperclip className="w-3 h-3" />
                              <span>{rec?.evidenceFiles?.length}</span>
                            </span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rec?.recordStatus === 'VALIDADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec?.recordStatus === 'REGISTRADO'
                                ? 'bg-blue-100 text-blue-800'
                                : rec?.recordStatus === 'DEVUELTO'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {rec?.recordStatus || 'PENDIENTE'}
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold text-slate-800 line-clamp-1">{k.name}</h4>
                      <div className="flex items-center justify-between text-slate-500 mt-2 pt-1.5 border-t border-slate-100 text-[11px]">
                        <span>Meta: {k.operator} {k.targetValue}{k.unit}</span>
                        <span className="font-mono font-bold text-slate-900">
                          {rec && rec.calculatedResult !== null ? `${rec.calculatedResult}${k.unit}` : '—'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active KPI Input Form & Contextual Evidence Upload */}
        <div className="lg:col-span-8">
          {activeKpi ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Form Title & KPI Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {activeKpi.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      Frecuencia: {activeKpi.frequency}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">
                    {activeKpi.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeKpi.objective}
                  </p>
                </div>

                {/* State Tag */}
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Estado actual:</span>
                  <span
                    className={`inline-block px-2.5 py-1 rounded text-xs font-bold mt-0.5 ${
                      activeRecord?.recordStatus === 'VALIDADO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeRecord?.recordStatus === 'REGISTRADO'
                        ? 'bg-blue-100 text-blue-800'
                        : activeRecord?.recordStatus === 'DEVUELTO'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {activeRecord?.recordStatus || 'PENDIENTE'}
                  </span>
                </div>
              </div>

              {/* Rejection notice if returned */}
              {activeRecord?.recordStatus === 'DEVUELTO' && activeRecord.rejectionReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Observación de Gerencia SIG para subsanación:</span>
                    <span>{activeRecord.rejectionReason}</span>
                  </div>
                </div>
              )}

              {/* Technical Formula Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fórmula Matemática:</span>
                  <span className="font-mono text-slate-900 font-bold">{activeKpi.formulaDescription}</span>
                </div>
                <div className="text-slate-500 flex flex-wrap gap-4 pt-1">
                  <span>Meta: <strong className="text-slate-800">{activeKpi.operator} {activeKpi.targetValue}{activeKpi.unit}</strong></span>
                  <span>Fuente: <strong className="text-slate-800">{activeKpi.sourceOfData}</strong></span>
                  <span>Responsable: <strong className="text-slate-800">{activeKpi.responsibleTitle}</strong></span>
                </div>
              </div>

              {/* Input Variables Form */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Datos de Entrada requeridos para {selectedPeriod}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Numerator Variable */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      {activeKpi.variables[0]?.label || 'Numerador'} ({activeKpi.variables[0]?.unit || 'unid'}):
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="Ej. 98.5"
                      value={inputNumerador}
                      onChange={(e) => setInputNumerador(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  {/* Denominator Variable (if applicable) */}
                  {activeKpi.variables.length >= 2 && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">
                        {activeKpi.variables[1]?.label || 'Denominador'} ({activeKpi.variables[1]?.unit || 'unid'}):
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="Ej. 100"
                        value={inputDenominador}
                        onChange={(e) => setInputDenominador(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Live Result Calculation Preview Box */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-600 block">
                      Resultado Calculado Automáticamente:
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-2xl font-extrabold font-mono text-slate-900">
                        {calculatedResult !== null ? `${calculatedResult}${activeKpi.unit}` : '—'}
                      </span>
                      <span className="text-xs text-slate-500">
                        (Meta: {activeKpi.operator} {activeKpi.targetValue}{activeKpi.unit})
                      </span>
                    </div>
                  </div>

                  {/* Status Preview */}
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block mb-1">Semáforo preliminar:</span>
                    {previewCompliance === 'VERDE' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Cumple Meta</span>
                      </span>
                    )}
                    {previewCompliance === 'AMARILLO' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>En Alerta</span>
                      </span>
                    )}
                    {previewCompliance === 'ROJO' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Acción Correctiva</span>
                      </span>
                    )}
                    {previewCompliance === 'SIN_DATO' && (
                      <span className="text-xs text-slate-400">Ingrese valores numéricos</span>
                    )}
                  </div>
                </div>

                {/* SECCIÓN CONTEXTUALIZADA DE EVIDENCIA DOCUMENTAL OBLIGATORIA */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {/* Banner de Evidencia Requerida según el Indicador */}
                  {evidenceReq && (
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4 text-emerald-700" />
                          <span>{evidenceReq.shortPrompt}</span>
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                          * OBLIGATORIO PARA VALIDACIÓN
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        {evidenceReq.detailedInstruction}
                      </p>
                    </div>
                  )}

                  {/* Campo de Referencia Documental */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Referencia Documental / N° de Registro o Acta:</span>
                    </label>
                    <input
                      type="text"
                      placeholder={`Ej. ${evidenceReq?.mandatoryItemName || 'Parte Diario de Molienda N° 1042 / Acta de Inspección BASC'}`}
                      value={evidenceRef}
                      onChange={(e) => setEvidenceRef(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  {/* CARGA DE MÚLTIPLES ARCHIVOS (LÍMITE 25 MB POR ARCHIVO) */}
                  <div id="zona-carga-archivos" className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <UploadCloud className="w-4 h-4 text-emerald-700" />
                        <span>Carga de Archivos de Evidencia (PDF o PNG):</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          (Límite: <strong className="text-emerald-800">25 MB</strong> por archivo, se permiten varios archivos)
                        </span>
                      </label>
                      <div className="flex items-center gap-2">
                        {evidenceFiles.length > 1 && (
                          <button
                            type="button"
                            onClick={handleDownloadAllFiles}
                            className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            <span>Descargar todos</span>
                          </button>
                        )}
                        <span className="text-[11px] font-mono font-bold text-slate-600">
                          {evidenceFiles.length} {evidenceFiles.length === 1 ? 'archivo adjunto' : 'archivos adjuntos'}
                        </span>
                      </div>
                    </div>

                    {/* Drag & Drop Upload Zone */}
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(true);
                      }}
                      onDragLeave={() => setIsDraggingFile(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingFile(false);
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          handleProcessFiles(e.dataTransfer.files);
                        }
                      }}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                        isDraggingFile
                          ? 'border-emerald-600 bg-emerald-50/70 scale-[1.01]'
                          : evidenceFiles.length === 0
                          ? 'border-amber-300 bg-amber-50/30 hover:border-emerald-600 hover:bg-slate-50/70'
                          : 'border-slate-300 hover:border-emerald-600 hover:bg-slate-50/70'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.png,image/png,application/pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files.length > 0) {
                            handleProcessFiles(e.target.files);
                          }
                        }}
                      />
                      <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="p-2.5 bg-emerald-100/70 rounded-full text-emerald-700 mb-1">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">
                          Haga clic para examinar o arrastre varios archivos aquí
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Formatos permitidos: <span className="font-semibold text-red-600">.PDF</span> o <span className="font-semibold text-blue-600">.PNG</span> · Límite de hasta <strong className="text-slate-800 font-bold">25 MB</strong> por archivo
                        </p>
                      </div>
                    </div>

                    {/* Error Notice */}
                    {fileUploadError && (
                      <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-900 flex items-start gap-2 shadow-xs">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">Validación de Evidencia:</span>
                          <span>{fileUploadError}</span>
                        </div>
                      </div>
                    )}

                    {/* Attached Files List */}
                    {evidenceFiles.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600 uppercase tracking-wide">
                            Archivos de Respaldo Adjuntos ({evidenceFiles.length}):
                          </span>
                          {currentUser.role === 'ADMIN' && (
                            <span className="text-amber-800 font-medium">
                              (Modo Admin: Elimine para liberar espacio permanentemente)
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {evidenceFiles.map((file) => {
                            const isPdf = file.type.includes('pdf') || file.name.toLowerCase().endsWith('.pdf');
                            return (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 shadow-xs transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <div
                                    className={`p-2 rounded-lg shrink-0 ${
                                      isPdf ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                    }`}
                                  >
                                    {isPdf ? (
                                      <FileText className="w-4 h-4" />
                                    ) : (
                                      <ImageIcon className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-slate-800 text-xs block truncate" title={file.name}>
                                      {file.name}
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                      <span className={`px-1 py-0.2 rounded font-bold ${isPdf ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                        {isPdf ? 'PDF' : 'PNG'}
                                      </span>
                                      <span>{formatFileSize(file.size)}</span>
                                    </div>
                                  </div>
                                </div>

                                {/* Actions: Preview, Download, Delete (con opción para Admin de liberar espacio) */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setPreviewingFile(file)}
                                    className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded transition-colors cursor-pointer"
                                    title="Visualizar archivo"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => triggerDownload(file)}
                                    className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                                    title="Descargar archivo"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFile(file.id)}
                                    className={`p-1.5 rounded transition-colors cursor-pointer ${
                                      currentUser.role === 'ADMIN'
                                        ? 'text-red-600 hover:bg-red-100'
                                        : 'text-slate-400 hover:text-red-700 hover:bg-red-50'
                                    }`}
                                    title={currentUser.role === 'ADMIN' ? 'Eliminar y liberar espacio de trabajo' : 'Quitar archivo'}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Observaciones y Análisis de Causa (Opcional si cumple meta, Obligatorio si está en alerta o rojo):
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Detalle desviaciones, factores estacionales, rendimientos atípicos o medidas tomadas..."
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback Success Message */}
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    disabled={isSaving || !inputNumerador}
                    onClick={() => handleSubmit(false)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Borrador</span>
                  </button>

                  <button
                    disabled={isSaving || !inputNumerador}
                    onClick={() => handleSubmit(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar a Validación</span>
                  </button>
                </div>

                {/* Admin Actions: Validate or Return */}
                {currentUser.role === 'ADMIN' && activeRecord && (
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 px-1">Acción Admin:</span>
                    <button
                      onClick={() => handleAdminApproval('VALIDATE')}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer"
                      title="Aprobar y cerrar registro oficialmente"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Validar</span>
                    </button>
                    <button
                      onClick={() => handleAdminApproval('RETURN')}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold cursor-pointer"
                      title="Devolver con observaciones para subsanación"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Devolver</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
              Seleccione un indicador del panel izquierdo para cargar sus datos.
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE PREVISUALIZACIÓN DE ARCHIVO DE EVIDENCIA (PDF O PNG) */}
      {previewingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
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
                    <span>{formatFileSize(previewingFile.size)}</span>
                    <span>·</span>
                    <span>Subido: {new Date(previewingFile.uploadedAt).toLocaleString('es-PE')}</span>
                  </div>
                </div>
              </div>

              {/* Header Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => triggerDownload(previewingFile)}
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

            {/* Modal Content */}
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
