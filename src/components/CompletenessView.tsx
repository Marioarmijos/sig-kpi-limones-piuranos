/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Control de Completitud, Cierre Mensual y Motor de Recordatorios (Día 29 al 2 America/Lima)
 * Limones Piuranos S.A.C.
 */

import React, { useState, useMemo } from 'react';
import {
  KPIDefinition,
  MonthlyRecord,
  ProcessDefinition,
  UserAccount
} from '../types/sig';
import {
  Calendar,
  Mail,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  Send,
  BellRing,
  ShieldAlert
} from 'lucide-react';

interface CompletenessViewProps {
  kpis: KPIDefinition[];
  records: MonthlyRecord[];
  processes: ProcessDefinition[];
  users: UserAccount[];
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  currentUser: UserAccount;
}

export const CompletenessView: React.FC<CompletenessViewProps> = ({
  kpis,
  records,
  processes,
  users,
  selectedPeriod,
  onPeriodChange,
  currentUser
}) => {
  // Test date simulation state for America/Lima reminder rules
  const [simulatedDate, setSimulatedDate] = useState<string>('2026-08-30');
  const [simulationResult, setSimulationResult] = useState<any | null>(null);
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);

  // Filter applicable monthly KPIs
  const monthlyKpis = useMemo(() => {
    return kpis.filter(k => k.frequency === 'MENSUAL');
  }, [kpis]);

  // Process-by-process completeness data
  const processStats = useMemo(() => {
    return processes.map(proc => {
      const procKpis = monthlyKpis.filter(k => k.processId === proc.id);
      const total = procKpis.length;

      let completados = 0;
      let enRevision = 0;
      let borradores = 0;
      let devueltos = 0;
      let pendientes = 0;

      procKpis.forEach(k => {
        const rec = records.find(r => r.kpiId === k.id && r.period === selectedPeriod);
        if (!rec) {
          pendientes++;
        } else if (rec.recordStatus === 'VALIDADO') {
          completados++;
        } else if (rec.recordStatus === 'REGISTRADO') {
          enRevision++;
        } else if (rec.recordStatus === 'DEVUELTO') {
          devueltos++;
        } else {
          borradores++;
        }
      });

      const pct = total > 0 ? Number(((completados / total) * 100).toFixed(1)) : 100;
      const assignedUsers = users.filter(u => u.processIds.includes(proc.id) && u.active);

      return {
        process: proc,
        total,
        completados,
        enRevision,
        borradores,
        devueltos,
        pendientes,
        pct,
        assignedUsers
      };
    });
  }, [processes, monthlyKpis, records, selectedPeriod, users]);

  // Global period totals
  const globalTotal = processStats.reduce((acc, p) => acc + p.total, 0);
  const globalCompletados = processStats.reduce((acc, p) => acc + p.completados, 0);
  const globalEnRevision = processStats.reduce((acc, p) => acc + p.enRevision, 0);
  const globalPendientes = processStats.reduce((acc, p) => acc + p.pendientes + p.borradores + p.devueltos, 0);
  const globalPct = globalTotal > 0 ? Number(((globalCompletados / globalTotal) * 100).toFixed(1)) : 0;

  // Run Notification Simulation on API
  const handleRunSimulation = async () => {
    setIsRunningSim(true);
    try {
      const res = await fetch('/api/reminders/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulatedDateStr: simulatedDate,
          period: selectedPeriod
        })
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult(data.simulation);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningSim(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
            Gobernanza del Cierre Mensual ISO 9001
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Control de Completitud y Cierre de Periodo
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Seguimiento de la carga de datos por proceso, auditoría de estados y motor programado de recordatorios.
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-3">
          <label htmlFor="comp-period-select" className="text-xs font-semibold text-slate-600 whitespace-nowrap">
            Periodo a evaluar:
          </label>
          <select
            id="comp-period-select"
            value={selectedPeriod}
            onChange={(e) => onPeriodChange(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none cursor-pointer"
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
          </select>
        </div>
      </div>

      {/* Global Status Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">Total Indicadores Programados:</span>
            <span className="text-2xl font-bold font-mono text-slate-900">{globalTotal} KPIs</span>
          </div>
          <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
            <span className="text-xs text-emerald-800 block">Validados y Aprobados:</span>
            <span className="text-2xl font-bold font-mono text-emerald-800">{globalCompletados} KPIs</span>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <span className="text-xs text-blue-800 block">En Revisión / Por Validar:</span>
            <span className="text-2xl font-bold font-mono text-blue-800">{globalEnRevision} KPIs</span>
          </div>
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
            <span className="text-xs text-amber-800 block">Pendientes de Completar:</span>
            <span className="text-2xl font-bold font-mono text-amber-800">{globalPendientes} KPIs</span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">Completitud Global del Periodo {selectedPeriod}:</span>
            <span className="font-mono text-slate-900 text-sm">{globalPct}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${globalPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Table: Process-by-Process Completeness */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="text-sm font-bold text-slate-900">
            Estado de Carga por Proceso Responsable ({selectedPeriod})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Proceso</th>
                <th className="py-3 px-4 w-32">Categoría</th>
                <th className="py-3 px-4 w-20 text-center">Total</th>
                <th className="py-3 px-4 w-20 text-center">Validados</th>
                <th className="py-3 px-4 w-20 text-center">En Revisión</th>
                <th className="py-3 px-4 w-20 text-center">Borradores</th>
                <th className="py-3 px-4 w-20 text-center">Pendientes</th>
                <th className="py-3 px-4 w-32 text-right">Avance</th>
                <th className="py-3 px-4 w-44">Responsable Notificación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {processStats.map(({ process, total, completados, enRevision, borradores, devueltos, pendientes, pct, assignedUsers }) => (
                <tr key={process.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {process.name}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {process.category}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-800 font-bold">
                    {total}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-emerald-700 font-bold">
                    {completados}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-blue-700 font-bold">
                    {enRevision}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-500">
                    {borradores}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-red-600 font-bold">
                    {pendientes + devueltos}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="font-mono font-bold text-slate-800">{pct}%</span>
                      <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full ${
                            pct === 100 ? 'bg-emerald-600' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] truncate">
                    {assignedUsers.length > 0
                      ? assignedUsers.map(u => u.email).join(', ')
                      : process.defaultResponsible}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulator: Automated Reminder Engine (Days 29 to 2 America/Lima) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-emerald-700" />
              <span>Simulador del Motor de Recordatorios Automáticos (Cron / America/Lima)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Regla obligatoria: Se envían correos desde el día 29 de cada mes hasta el día 2 del mes siguiente (America/Lima). Si un proceso completa sus KPIs, deja de recibir alertas inmediatamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={simulatedDate}
              onChange={(e) => setSimulatedDate(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
            />
            <button
              disabled={isRunningSim}
              onClick={handleRunSimulation}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Evaluar Regla</span>
            </button>
          </div>
        </div>

        {/* Simulation Output */}
        {simulationResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs bg-slate-50">
              <div>
                <span className="text-slate-500 block">Fecha evaluada (Zona Horaria America/Lima):</span>
                <strong className="text-slate-900 text-sm font-mono">{simulationResult.evaluatedDate}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">Ventana de notificación (Día 29 al 2):</span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded text-xs inline-block mt-0.5 ${
                    simulationResult.isInNotificationWindow
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {simulationResult.isInNotificationWindow ? 'ACTIVA (Dentro de ventana)' : 'INACTIVA (Fuera de ventana)'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Procesos con recordatorios requeridos:</span>
                <strong className="text-slate-900 text-sm font-mono">
                  {simulationResult.pendingProcessesCount} de {processes.length} procesos
                </strong>
              </div>
            </div>

            {/* List of generated reminder emails */}
            {simulationResult.pendingProcesses.length > 0 ? (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 block">
                  Notificaciones calculadas para despacho automático:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {simulationResult.pendingProcesses.map((p: any) => (
                    <div key={p.processId} className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-800">
                        <span>{p.processName}</span>
                        <span className="text-red-600 font-mono font-bold">
                          {p.pendingCount} KPI pendiente{p.pendingCount > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        <span>Destinatarios: </span>
                        <strong className="text-slate-700 font-mono">{p.recipientEmails.join(', ')}</strong>
                      </div>
                      <div className="text-slate-400 text-[10px] pt-1">
                        Asunto: Recordatorio de Carga SIG — Periodo {simulationResult.targetPeriod} (Limones Piuranos S.A.C.)
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Todos los procesos han completado sus registros para este periodo. No se emitirán recordatorios por correo.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
