/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Dashboard Ejecutivo de Gerencia — Limones Piuranos S.A.C.
 * ISO 9001:2015 & BASC
 */

import React, { useState, useMemo } from 'react';
import {
  KPIDefinition,
  MonthlyRecord,
  ProcessDefinition,
  OperationalLineDefinition,
  ComplianceStatus
} from '../types/sig';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Eye,
  AlertOctagon,
  FileWarning,
  Activity,
  UserX,
  UserCheck,
  ChevronRight,
  Info,
  Paperclip
} from 'lucide-react';

interface DashboardViewProps {
  kpis: KPIDefinition[];
  records: MonthlyRecord[];
  processes: ProcessDefinition[];
  lines: OperationalLineDefinition[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  onOpenRecordDetail: (kpi: KPIDefinition, record?: MonthlyRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  records,
  processes,
  selectedPeriod,
  onPeriodChange,
  onOpenRecordDetail
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'ESTRATEGICO' | 'OPERATIVO' | 'SOPORTE'>('ALL');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | ComplianceStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  const monthsList = [
    { value: '2026-01', label: 'Enero 2026', short: 'Ene' },
    { value: '2026-02', label: 'Febrero 2026', short: 'Feb' },
    { value: '2026-03', label: 'Marzo 2026', short: 'Mar' },
    { value: '2026-04', label: 'Abril 2026', short: 'Abr' },
    { value: '2026-05', label: 'Mayo 2026', short: 'May' },
    { value: '2026-06', label: 'Junio 2026', short: 'Jun' },
    { value: '2026-07', label: 'Julio 2026', short: 'Jul' },
    { value: '2026-08', label: 'Agosto 2026', short: 'Ago' },
    { value: '2026-09', label: 'Setiembre 2026', short: 'Set' },
    { value: '2026-10', label: 'Octubre 2026', short: 'Oct' }
  ];

  // Filter applicable KPIs for monthly evaluation
  const applicableMonthlyKpis = useMemo(() => {
    return kpis.filter(k => k.frequency === 'MENSUAL');
  }, [kpis]);

  // Compute metrics for selected period including missing data alerts
  const stats = useMemo(() => {
    let completed = 0;
    let verde = 0;
    let amarillo = 0;
    let rojo = 0;
    let sinDato = 0;

    const deviations: { kpi: KPIDefinition; record: MonthlyRecord; processName: string }[] = [];
    const missingKpis: { kpi: KPIDefinition; processName: string; processId: string; responsible: string }[] = [];

    applicableMonthlyKpis.forEach(k => {
      const rec = records.find(r => r.kpiId === k.id && r.period === selectedPeriod);
      const proc = processes.find(p => p.id === k.processId);
      const procName = proc?.name || 'Proceso no identificado';
      const responsible = proc?.defaultResponsible || 'Responsable de Proceso';

      // Has value if calculatedResult is a valid number
      const hasRealData = rec && rec.calculatedResult !== null && !isNaN(rec.calculatedResult);

      if (hasRealData) {
        completed++;
        if (rec.complianceStatus === 'VERDE') {
          verde++;
        } else if (rec.complianceStatus === 'AMARILLO') {
          amarillo++;
          deviations.push({ kpi: k, record: rec, processName: procName });
        } else if (rec.complianceStatus === 'ROJO') {
          rojo++;
          deviations.push({ kpi: k, record: rec, processName: procName });
        } else {
          sinDato++;
          missingKpis.push({ kpi: k, processName: procName, processId: k.processId, responsible });
        }
      } else {
        sinDato++;
        missingKpis.push({ kpi: k, processName: procName, processId: k.processId, responsible });
      }
    });

    const total = applicableMonthlyKpis.length;
    const completitudPct = total > 0 ? (completed / total) * 100 : 0;
    const cumplimientoPct = completed > 0 ? (verde / completed) * 100 : 0;

    // Group missing KPIs by process
    const missingByProcessMap = new Map<string, { processName: string; processId: string; responsible: string; category: string; kpis: KPIDefinition[] }>();
    missingKpis.forEach(item => {
      const proc = processes.find(p => p.id === item.processId);
      if (!missingByProcessMap.has(item.processId)) {
        missingByProcessMap.set(item.processId, {
          processName: item.processName,
          processId: item.processId,
          responsible: item.responsible,
          category: proc?.category || 'PROCESO',
          kpis: []
        });
      }
      missingByProcessMap.get(item.processId)!.kpis.push(item.kpi);
    });

    const missingProcesses = Array.from(missingByProcessMap.values());

    return {
      total,
      completed,
      verde,
      amarillo,
      rojo,
      sinDato,
      completitudPct: Number(completitudPct.toFixed(1)),
      cumplimientoPct: Number(cumplimientoPct.toFixed(1)),
      deviations,
      missingKpis,
      missingProcesses
    };
  }, [applicableMonthlyKpis, records, selectedPeriod, processes]);

  // Filter table rows
  const filteredKpis = useMemo(() => {
    return applicableMonthlyKpis.filter(k => {
      const proc = processes.find(p => p.id === k.processId);

      // Category filter
      if (selectedCategory !== 'ALL' && proc?.category !== selectedCategory) return false;

      // Process filter
      if (selectedProcessId !== 'ALL' && k.processId !== selectedProcessId) return false;

      // Status filter
      const rec = records.find(r => r.kpiId === k.id && r.period === selectedPeriod);
      const status = rec ? rec.complianceStatus : 'SIN_DATO';
      if (selectedStatus !== 'ALL' && status !== selectedStatus) return false;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchCode = k.code.toLowerCase().includes(query);
        const matchName = k.name.toLowerCase().includes(query);
        const matchProc = proc?.name.toLowerCase().includes(query) ?? false;
        if (!matchCode && !matchName && !matchProc) return false;
      }

      return true;
    });
  }, [applicableMonthlyKpis, processes, records, selectedPeriod, selectedCategory, selectedProcessId, selectedStatus, searchQuery]);

  // Historical trend summary across all 10 months Ene-Oct 2026
  const historicalTrend = useMemo(() => {
    return monthsList.map(m => {
      let v = 0;
      let count = 0;
      let missing = 0;
      const missingProcIds = new Set<string>();

      applicableMonthlyKpis.forEach(k => {
        const rec = records.find(r => r.kpiId === k.id && r.period === m.value);
        if (rec && rec.calculatedResult !== null && !isNaN(rec.calculatedResult)) {
          count++;
          if (rec.complianceStatus === 'VERDE') v++;
        } else {
          missing++;
          missingProcIds.add(k.processId);
        }
      });

      const compliance = count > 0 ? Number(((v / count) * 100).toFixed(1)) : 0;
      const completitud = applicableMonthlyKpis.length > 0 ? Number(((count / applicableMonthlyKpis.length) * 100).toFixed(1)) : 0;
      return {
        period: m.value,
        label: m.short,
        fullLabel: m.label,
        compliance,
        completitud,
        reported: count,
        missing,
        missingProcessCount: missingProcIds.size
      };
    });
  }, [applicableMonthlyKpis, records, monthsList]);

  // Trend averages
  const trendAverages = useMemo(() => {
    if (historicalTrend.length === 0) return { avgCompliance: 0, avgCompletitud: 0 };
    const totalComp = historicalTrend.reduce((acc, h) => acc + h.compliance, 0);
    const totalCompl = historicalTrend.reduce((acc, h) => acc + h.completitud, 0);
    return {
      avgCompliance: Number((totalComp / historicalTrend.length).toFixed(1)),
      avgCompletitud: Number((totalCompl / historicalTrend.length).toFixed(1))
    };
  }, [historicalTrend]);

  // SVG Line Chart coordinates calculation
  const svgConfig = useMemo(() => {
    const width = 840;
    const height = 230;
    const padding = { top: 25, right: 30, bottom: 35, left: 45 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const n = historicalTrend.length;
    const getX = (idx: number) => padding.left + (idx / (n - 1)) * chartWidth;
    const getY = (val: number) => padding.top + (1 - Math.max(0, Math.min(100, val)) / 100) * chartHeight;

    const compliancePoints = historicalTrend.map((h, i) => ({
      x: getX(i),
      y: getY(h.compliance),
      val: h.compliance,
      period: h.period,
      label: h.label,
      fullLabel: h.fullLabel,
      completitud: h.completitud,
      reported: h.reported,
      missingProcessCount: h.missingProcessCount
    }));

    const completitudPoints = historicalTrend.map((h, i) => ({
      x: getX(i),
      y: getY(h.completitud),
      val: h.completitud,
      period: h.period,
      label: h.label
    }));

    const compliancePathD = compliancePoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const completitudPathD = completitudPoints.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    const areaPathD = compliancePoints.length > 0
      ? `${compliancePathD} L ${compliancePoints[compliancePoints.length - 1].x} ${padding.top + chartHeight} L ${compliancePoints[0].x} ${padding.top + chartHeight} Z`
      : '';

    const targetLineY = getY(90); // 90% meta SIG corporativa

    return {
      width,
      height,
      padding,
      chartWidth,
      chartHeight,
      compliancePoints,
      completitudPoints,
      compliancePathD,
      completitudPathD,
      areaPathD,
      targetLineY
    };
  }, [historicalTrend]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Document Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <span>Limones Piuranos S.A.C.</span>
            <span>·</span>
            <span>ISO 9001:2015</span>
            <span>·</span>
            <span>BASC</span>
            <span>·</span>
            <span className="font-mono text-slate-500">LP-SIG-FR-011 V.04</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tablero Ejecutivo de Monitoreo de Procesos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervisión integral de indicadores de calidad, rendimientos industriales y seguridad en cadena de suministro.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="period-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Periodo evaluado:
          </label>
          <select
            id="period-select"
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
          >
            {monthsList.map(m => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Global Executive Stats Grid: 5 Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Cumplimiento de Metas */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Cumplimiento Metas</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              {stats.cumplimientoPct}%
            </span>
            <span className="text-xs text-slate-500">
              ({stats.verde} de {stats.completed})
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.cumplimientoPct}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            KPIs reportados que alcanzaron la meta fijada.
          </span>
        </div>

        {/* Metric 2: Completitud de Carga Mensual */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Completitud de Carga</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono tabular-nums">
              {stats.completitudPct}%
            </span>
            <span className="text-xs text-slate-500">
              ({stats.completed} de {stats.total})
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.completitudPct}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Avance de entrega de datos vs total programado.
          </span>
        </div>

        {/* Metric 3: NUEVO INDICADOR DE ALERTA: Procesos Sin Datos (#¡DIV/0!) */}
        <div
          onClick={() => {
            const el = document.getElementById('seccion-omision-datos');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            stats.missingProcesses.length > 0
              ? 'bg-rose-50/40 border-rose-300 hover:border-rose-400 hover:shadow-sm'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase text-rose-800">
              Sin Entrega de Datos
            </span>
            <FileWarning className={`w-4 h-4 ${stats.missingProcesses.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold tracking-tight font-mono tabular-nums ${stats.missingProcesses.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {stats.missingProcesses.length}
            </span>
            <span className="text-xs text-slate-600">
              {stats.missingProcesses.length === 1 ? 'proceso omitido' : 'procesos omitidos'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-rose-800">
            <span className={`w-2 h-2 rounded-full inline-block ${stats.missingProcesses.length > 0 ? 'bg-rose-600 animate-pulse' : 'bg-slate-300'}`} />
            <span className="font-medium">
              {stats.missingKpis.length} KPIs con #¡DIV/0!
            </span>
          </div>
          <span className="text-[11px] text-rose-600/80 mt-2 block font-medium">
            Falta de datos brindados por dueños de proceso.
          </span>
        </div>

        {/* Metric 4: Desviaciones y Alertas (Amarillo) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">En Alerta Preventiva</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-amber-600 font-mono tabular-nums">
              {stats.amarillo}
            </span>
            <span className="text-xs text-slate-500">
              {stats.amarillo === 1 ? 'indicador en alerta' : 'indicadores en alerta'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-700">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span>En banda de tolerancia preventiva</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Monitoreo preventivo previo a acción correctiva.
          </span>
        </div>

        {/* Metric 5: Acciones Correctivas (Rojo) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold tracking-wide uppercase">Acción Correctiva</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-red-600 font-mono tabular-nums">
              {stats.rojo}
            </span>
            <span className="text-xs text-slate-500">
              {stats.rojo === 1 ? 'desviación crítica' : 'desviaciones críticas'}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-red-700">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
            <span>Exige análisis de causa raíz</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Incumplimiento formal ISO 9001 / BASC.
          </span>
        </div>
      </div>

      {/* CUADRO DE LÍNEAS DE TENDENCIA EJECUTIVA (Trend Chart) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">
                Cuadro de Líneas de Tendencia Ejecutiva (Enero – Octubre 2026)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Comportamiento dinámico de cumplimiento de metas y entrega de información a lo largo del año 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            {/* Chart Legends */}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-emerald-600 rounded-full inline-block" />
              <span className="font-semibold text-slate-700">% Cumplimiento de Metas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-blue-600 rounded-full inline-block" />
              <span className="font-semibold text-slate-700">% Completitud de Datos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 border-b-2 border-dashed border-red-500 inline-block" />
              <span className="font-semibold text-red-600">Meta SIG (90%)</span>
            </div>

            {/* Averages Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <span className="font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-semibold">
                Prom. Cumplimiento: {trendAverages.avgCompliance}%
              </span>
              <span className="font-mono text-blue-800 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md font-semibold">
                Prom. Carga: {trendAverages.avgCompletitud}%
              </span>
            </div>
          </div>
        </div>

        {/* SVG High-Precision Line Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[720px] relative">
            <svg
              viewBox={`0 0 ${svgConfig.width} ${svgConfig.height}`}
              className="w-full h-56 select-none overflow-visible"
            >
              <defs>
                {/* Emerald gradient for compliance line area */}
                <linearGradient id="complianceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines & percentage labels */}
              {[0, 25, 50, 75, 90, 100].map(val => {
                const y = svgConfig.padding.top + (1 - val / 100) * svgConfig.chartHeight;
                const isMeta = val === 90;
                return (
                  <g key={val}>
                    <line
                      x1={svgConfig.padding.left}
                      y1={y}
                      x2={svgConfig.width - svgConfig.padding.right}
                      y2={y}
                      stroke={isMeta ? '#f43f5e' : '#e2e8f0'}
                      strokeWidth={isMeta ? 1.5 : 1}
                      strokeDasharray={isMeta ? '4 4' : undefined}
                    />
                    <text
                      x={svgConfig.padding.left - 8}
                      y={y + 3.5}
                      textAnchor="end"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight={isMeta ? 'bold' : 'normal'}
                      fill={isMeta ? '#e11d48' : '#94a3b8'}
                    >
                      {val}%
                    </text>
                    {isMeta && (
                      <text
                        x={svgConfig.width - svgConfig.padding.right + 6}
                        y={y + 3.5}
                        fontSize="9"
                        fontWeight="bold"
                        fill="#e11d48"
                      >
                        Meta 90%
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Shaded Area under Compliance curve */}
              {svgConfig.areaPathD && (
                <path d={svgConfig.areaPathD} fill="url(#complianceGradient)" />
              )}

              {/* Highlight Vertical Bar for Selected Month */}
              {svgConfig.compliancePoints.map(pt => {
                const isSelected = pt.period === selectedPeriod;
                if (!isSelected) return null;
                return (
                  <g key={`cursor-${pt.period}`}>
                    <line
                      x1={pt.x}
                      y1={svgConfig.padding.top}
                      x2={pt.x}
                      y2={svgConfig.padding.top + svgConfig.chartHeight}
                      stroke="#059669"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                      opacity={0.7}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={7}
                      fill="#059669"
                      opacity={0.2}
                    />
                  </g>
                );
              })}

              {/* % Completitud Line (Blue) */}
              <path
                d={svgConfig.completitudPathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* % Cumplimiento Line (Emerald) */}
              <path
                d={svgConfig.compliancePathD}
                fill="none"
                stroke="#059669"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Dots & Month Labels */}
              {svgConfig.compliancePoints.map((pt, idx) => {
                const isSelected = pt.period === selectedPeriod;
                const isHovered = hoveredTrendIndex === idx;
                const compY = pt.y;
                const complY = svgConfig.completitudPoints[idx].y;

                return (
                  <g
                    key={pt.period}
                    className="cursor-pointer"
                    onClick={() => onPeriodChange(pt.period)}
                    onMouseEnter={() => setHoveredTrendIndex(idx)}
                    onMouseLeave={() => setHoveredTrendIndex(null)}
                  >
                    {/* Completitud dot (blue) */}
                    <circle
                      cx={pt.x}
                      cy={complY}
                      r={isSelected || isHovered ? 5 : 3.5}
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth={2}
                    />

                    {/* Compliance dot (emerald) */}
                    <circle
                      cx={pt.x}
                      cy={compY}
                      r={isSelected || isHovered ? 6 : 4}
                      fill={isSelected ? '#047857' : '#059669'}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />

                    {/* Month label along bottom */}
                    <text
                      x={pt.x}
                      y={svgConfig.padding.top + svgConfig.chartHeight + 18}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight={isSelected ? 'bold' : '500'}
                      fill={isSelected ? '#065f46' : '#64748b'}
                    >
                      {pt.label}
                    </text>

                    {/* Value Badge above node if selected or hovered */}
                    {(isSelected || isHovered) && (
                      <g>
                        <rect
                          x={pt.x - 28}
                          y={compY - 26}
                          width={56}
                          height={18}
                          rx={4}
                          fill="#0f172a"
                          opacity={0.9}
                        />
                        <text
                          x={pt.x}
                          y={compY - 14}
                          textAnchor="middle"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          fill="#ffffff"
                        >
                          {pt.val}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Card if hovering a month node */}
            {hoveredTrendIndex !== null && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs border border-slate-700 transition-all"
                style={{
                  left: Math.min(Math.max(svgConfig.compliancePoints[hoveredTrendIndex].x - 90, 10), svgConfig.width - 200),
                  top: 20
                }}
              >
                <div className="font-bold text-emerald-400 mb-1 border-b border-slate-700 pb-1">
                  {svgConfig.compliancePoints[hoveredTrendIndex].fullLabel}
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-300">Cumplimiento:</span>
                    <span className="font-mono font-bold text-emerald-300">
                      {svgConfig.compliancePoints[hoveredTrendIndex].val}%
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-300">Completitud:</span>
                    <span className="font-mono font-bold text-blue-300">
                      {svgConfig.compliancePoints[hoveredTrendIndex].completitud}%
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-300">KPIs Reportados:</span>
                    <span className="font-mono text-slate-200">
                      {svgConfig.compliancePoints[hoveredTrendIndex].reported} de {applicableMonthlyKpis.length}
                    </span>
                  </div>
                  {svgConfig.compliancePoints[hoveredTrendIndex].missingProcessCount > 0 && (
                    <div className="flex justify-between gap-4 text-rose-300 font-medium">
                      <span>Procesos sin datos:</span>
                      <span className="font-mono">
                        {svgConfig.compliancePoints[hoveredTrendIndex].missingProcessCount}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 10-Month Quick Selector Bar */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-4 mt-2 border-t border-slate-100">
          {historicalTrend.map(h => (
            <button
              key={h.period}
              type="button"
              onClick={() => onPeriodChange(h.period)}
              className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${
                selectedPeriod === h.period
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-600'
                  : 'border-slate-100 bg-slate-50/70 hover:bg-slate-100/90 text-slate-600'
              }`}
            >
              <span className="block text-[11px] uppercase tracking-wide font-semibold">
                {h.label}
              </span>
              <span className="block text-base font-extrabold font-mono tabular-nums my-0.5 text-slate-900">
                {h.compliance}%
              </span>
              <span className={`block text-[10px] font-mono ${h.missingProcessCount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-400'}`}>
                {h.missingProcessCount > 0 ? `${h.missingProcessCount} sin datos` : '100% al día'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN ESPECIAL: ALERTA DE PROCESOS CON OMISIÓN DE DATOS EN EL PERÍODO */}
      <div id="seccion-omision-datos">
        {stats.missingProcesses.length > 0 ? (
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-rose-200">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-700 mt-0.5">
                  <FileWarning className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-rose-950">
                    Alerta de Omisión de Carga por Dueño de Proceso ({selectedPeriod})
                  </h3>
                  <p className="text-xs text-rose-800 mt-0.5">
                    Se detectaron <span className="font-bold">{stats.missingProcesses.length} procesos</span> que no han entregado datos para este período. En el libro de monitoreo oficial de Limones Piuranos, estas celdas generan fórmulas no evaluadas como <span className="font-mono font-semibold bg-rose-100 px-1 py-0.5 rounded">#¡DIV/0!</span> o <span className="font-mono font-semibold bg-rose-100 px-1 py-0.5 rounded">#¡VALOR!</span>.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold whitespace-nowrap self-start sm:self-auto">
                <UserX className="w-3.5 h-3.5" />
                <span>{stats.missingKpis.length} Indicadores Afectados</span>
              </span>
            </div>

            {/* List of Affected Processes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {stats.missingProcesses.map((proc) => (
                <div
                  key={proc.processId}
                  className="bg-white border border-rose-200 rounded-xl p-4 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-rose-700 uppercase tracking-wider text-[10px]">
                        {proc.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        #¡DIV/0! / Sin Carga
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      {proc.processName}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <UserX className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="font-medium text-slate-800">{proc.responsible}</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                        KPIs sin información brindada ({proc.kpis.length}):
                      </span>
                      {proc.kpis.map(k => (
                        <div
                          key={k.id}
                          onClick={() => onOpenRecordDetail(k)}
                          className="p-2 rounded bg-rose-50/50 hover:bg-rose-100/60 border border-rose-100 flex items-center justify-between text-xs cursor-pointer transition-colors"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-mono font-bold text-rose-900 block">{k.code}</span>
                            <span className="text-slate-700 truncate block text-[11px]">{k.name}</span>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-rose-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="italic">Pendiente de regularización</span>
                    <span className="font-mono text-rose-600 font-bold">Meta: {proc.kpis[0]?.operator} {proc.kpis[0]?.targetValue}{proc.kpis[0]?.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 sm:p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  Cumplimiento Total de Entrega de Información ({selectedPeriod})
                </h4>
                <p className="text-xs text-emerald-800">
                  Todos los dueños de proceso han reportado oportunamente sus evidencias e indicadores para este período sin errores #¡DIV/0!.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
              100% Carga Completa
            </span>
          </div>
        )}
      </div>

      {/* Desviaciones Relevantes Alert Box (Amarillo / Rojo) */}
      {stats.deviations.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Indicadores que requieren atención prioritaria ({selectedPeriod})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.deviations.map(({ kpi, record, processName }) => (
              <div
                key={kpi.id}
                onClick={() => onOpenRecordDetail(kpi, record)}
                className="bg-white border border-amber-200 rounded-lg p-3 hover:shadow-xs transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-mono font-semibold text-slate-700">{kpi.code}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      record.complianceStatus === 'ROJO'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {record.complianceStatus === 'ROJO' ? 'CORRECTIVA' : 'EN ALERTA'}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{kpi.name}</h4>
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100 text-slate-600">
                  <span>Meta: {kpi.operator} {kpi.targetValue}{kpi.unit}</span>
                  <span className="font-bold text-slate-900 font-mono">
                    Real: {record.calculatedResult !== null ? `${record.calculatedResult}${kpi.unit}` : '-'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1 truncate">{processName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Matriz de Cumplimiento por Proceso ({selectedPeriod})
            </h3>
            <span className="text-xs text-slate-500">
              Mostrando {filteredKpis.length} de {applicableMonthlyKpis.length} indicadores mensuales
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar código o indicador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none w-44"
              />
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as any);
                setSelectedProcessId('ALL');
              }}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todas las Categorías</option>
              <option value="ESTRATEGICO">Estratégicos</option>
              <option value="OPERATIVO">Operativos</option>
              <option value="SOPORTE">Soporte</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-emerald-600 focus:outline-none cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="VERDE">Cumple Meta (Verde)</option>
              <option value="AMARILLO">En Alerta (Amarillo)</option>
              <option value="ROJO">Acción Correctiva (Rojo)</option>
              <option value="SIN_DATO">Sin Dato (#¡DIV/0!)</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-28">Código</th>
                <th className="py-3 px-4 w-44">Proceso / Línea</th>
                <th className="py-3 px-4">Indicador</th>
                <th className="py-3 px-4 w-24 text-right">Meta</th>
                <th className="py-3 px-4 w-24 text-right">Resultado</th>
                <th className="py-3 px-4 w-32 text-center">Estado</th>
                <th className="py-3 px-4 w-24 text-center">Registro</th>
                <th className="py-3 px-4 w-16 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredKpis.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron indicadores con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredKpis.map(k => {
                  const proc = processes.find(p => p.id === k.processId);
                  const rec = records.find(r => r.kpiId === k.id && r.period === selectedPeriod);
                  const status = rec ? rec.complianceStatus : 'SIN_DATO';

                  return (
                    <tr
                      key={k.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onOpenRecordDetail(k, rec)}
                    >
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {k.code}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600">
                        <span className="font-medium text-slate-900 block truncate">{proc?.name}</span>
                        {k.operationalLineId && (
                          <span className="text-[10px] text-emerald-800 font-medium">
                            {k.operationalLineId.replace('_', ' ')}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-slate-800 font-medium">
                        {k.name}
                        {k.notes && (
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                            {k.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-600 whitespace-nowrap">
                        {k.operator} {k.targetValue}{k.unit}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold whitespace-nowrap">
                        {rec && rec.calculatedResult !== null ? (
                          <span className="text-slate-900">{rec.calculatedResult}{k.unit}</span>
                        ) : (
                          <span className="text-rose-500 font-medium text-[11px] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            #¡DIV/0!
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        {status === 'VERDE' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Cumple Meta</span>
                          </span>
                        )}
                        {status === 'AMARILLO' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3 h-3" />
                            <span>En Alerta</span>
                          </span>
                        )}
                        {status === 'ROJO' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800">
                            <AlertOctagon className="w-3 h-3" />
                            <span>Correctiva</span>
                          </span>
                        )}
                        {status === 'SIN_DATO' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <FileWarning className="w-3 h-3" />
                            <span>Sin Datos (#¡DIV/0!)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {rec?.recordStatus === 'VALIDADO' && (
                            <span className="text-[10px] font-medium text-emerald-700">Validado</span>
                          )}
                          {rec?.recordStatus === 'REGISTRADO' && (
                            <span className="text-[10px] font-medium text-blue-700">En revisión</span>
                          )}
                          {rec?.recordStatus === 'BORRADOR' && (
                            <span className="text-[10px] font-medium text-slate-500">Borrador</span>
                          )}
                          {rec?.recordStatus === 'DEVUELTO' && (
                            <span className="text-[10px] font-medium text-red-600">Observado</span>
                          )}
                          {!rec && <span className="text-[10px] text-slate-400">Pendiente</span>}
                          {rec?.evidenceFiles && rec.evidenceFiles.length > 0 && (
                            <span
                              className="inline-flex items-center gap-0.5 text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1 py-0.2 rounded font-medium"
                              title={`${rec.evidenceFiles.length} archivo(s) de evidencia adjunto(s)`}
                            >
                              <Paperclip className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{rec.evidenceFiles.length}</span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenRecordDetail(k, rec);
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                          title="Ver detalle del indicador"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend Footer matching document */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 text-slate-600 font-medium">
            <span className="font-semibold text-slate-800">Leyenda Oficial Semáforo:</span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span>Verde: Cumple Meta</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span>Amarillo: En Alerta</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span>Rojo: Acción Correctiva</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span>Sin Datos brindados (#¡DIV/0!)</span>
            </span>
          </div>

          <div className="text-slate-400 text-[11px] font-mono">
            Formato LP-SIG-FR-011 V.04 · Limones Piuranos S.A.C.
          </div>
        </div>
      </div>
    </div>
  );
};
