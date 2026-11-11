/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * SIG KPI — Limones Piuranos S.A.C.
 * Aplicación Web Empresarial de Monitoreo de Indicadores de Gestión ISO 9001:2015 & BASC
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MonthlyEntryView } from './components/MonthlyEntryView';
import { MasterMatrixView } from './components/MasterMatrixView';
import { CompletenessView } from './components/CompletenessView';
import { AuditView } from './components/AuditView';
import { UserManagementView } from './components/UserManagementView';
import { StorageManagerView } from './components/StorageManagerView';
import { RecordDetailModal } from './components/RecordDetailModal';
import { LoginView } from './components/LoginView';
import { generateExecutivePDF } from './utils/pdfGenerator';
import {
  KPIDefinition,
  MonthlyRecord,
  ProcessDefinition,
  OperationalLineDefinition,
  UserAccount,
  AuditLogEntry,
  OperationalLineId,
  EvidenceFile
} from './types/sig';
import {
  KPIS as CLIENT_KPIS,
  PROCESSES as CLIENT_PROCESSES,
  OPERATIONAL_LINES as CLIENT_LINES,
  INITIAL_USERS as CLIENT_USERS,
  buildInitialMonthlyRecords,
  INITIAL_AUDIT_LOGS
} from './data/seedData';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'entry' | 'matrix' | 'completeness' | 'audit' | 'users' | 'storage'>('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10');
  const [activeProcessIdForEntry, setActiveProcessIdForEntry] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Core domain state
  const [kpis, setKpis] = useState<KPIDefinition[]>(CLIENT_KPIS);
  const [processes, setProcesses] = useState<ProcessDefinition[]>(CLIENT_PROCESSES);
  const [lines, setLines] = useState<OperationalLineDefinition[]>(CLIENT_LINES);
  const [records, setRecords] = useState<MonthlyRecord[]>(buildInitialMonthlyRecords());
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [users, setUsers] = useState<UserAccount[]>(CLIENT_USERS);
  const [currentUser, setCurrentUser] = useState<UserAccount>(CLIENT_USERS[0]); // Default admin: siglimonespiuranos@gmail.com

  // Modal detail
  const [detailModal, setDetailModal] = useState<{ kpi: KPIDefinition; record?: MonthlyRecord } | null>(null);

  // Fetch initial state from server
  const loadData = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          const d = payload.data;
          // Merge computeResult back into KPIs
          const mergedKpis: KPIDefinition[] = CLIENT_KPIS.map(localKpi => {
            const serverKpi = d.kpis?.find((sk: any) => sk.id === localKpi.id);
            if (serverKpi) {
              return {
                ...localKpi,
                targetValue: serverKpi.targetValue,
                warningTolerance: serverKpi.warningTolerance,
                notes: serverKpi.notes
              };
            }
            return localKpi;
          });

          setKpis(mergedKpis);
          if (d.records) setRecords(d.records);
          if (d.auditLogs) setAuditLogs(d.auditLogs);
          if (d.users) {
            setUsers(d.users);
            // Ensure currentUser reference stays up to date
            const refreshedCurrent = d.users.find((u: UserAccount) => u.id === currentUser.id);
            if (refreshedCurrent) setCurrentUser(refreshedCurrent);
          }
        }
      }
    } catch (err) {
      console.warn('Backend not responding yet or in static preview, using local memory state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save or submit record
  const handleSaveRecord = async (payload: {
    kpiId: string;
    period: string;
    inputs: Record<string, number>;
    observations?: string;
    evidenceRef?: string;
    evidenceFiles?: EvidenceFile[];
    submitForValidation: boolean;
  }) => {
    try {
      const res = await fetch('/api/records/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          userEmail: currentUser.email,
          userName: currentUser.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.record) {
          setRecords(prev => {
            const idx = prev.findIndex(r => r.kpiId === payload.kpiId && r.period === payload.period);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = data.record;
              return copy;
            }
            return [...prev, data.record];
          });
          if (data.audit) {
            setAuditLogs(prev => [data.audit, ...prev]);
          }
        }
      }
    } catch (err) {
      console.error('Error saving record:', err);
    }
  };

  // Admin Review (Validate or Return)
  const handleReviewRecord = async (recordId: string, action: 'VALIDATE' | 'RETURN', reason?: string) => {
    try {
      const res = await fetch('/api/records/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          action,
          rejectionReason: reason,
          userEmail: currentUser.email,
          userName: currentUser.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.record) {
          setRecords(prev => prev.map(r => r.id === recordId ? data.record : r));
          // Refresh audit
          loadData();
        }
      }
    } catch (err) {
      console.error('Error reviewing record:', err);
    }
  };

  // Admin Delete Individual File to liberate workspace space
  const handleDeleteFile = async (recordId: string, fileId: string) => {
    try {
      const res = await fetch('/api/records/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          fileId,
          userEmail: currentUser.email,
          userName: currentUser.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.record) {
          setRecords(prev => prev.map(r => r.id === recordId ? data.record : r));
          if (detailModal && detailModal.record?.id === recordId) {
            setDetailModal(prev => prev ? { ...prev, record: data.record } : null);
          }
          loadData();
        }
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  // Admin Bulk Delete Files to liberate workspace space
  const handleBulkDeleteFiles = async (fileIds: string[]) => {
    try {
      const res = await fetch('/api/admin/clean-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds,
          userEmail: currentUser.email,
          userName: currentUser.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.records) {
          setRecords(data.records);
          loadData();
        }
      }
    } catch (err) {
      console.error('Error cleaning files:', err);
    }
  };

  // Admin update KPI parameters
  const handleUpdateKpi = async (payload: {
    kpiId: string;
    targetValue: number;
    warningTolerance: number;
    notes?: string;
  }) => {
    try {
      const res = await fetch('/api/kpis/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          userEmail: currentUser.email,
          userName: currentUser.name
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.kpi) {
          setKpis(prev => prev.map(k => k.id === payload.kpiId ? { ...k, ...data.kpi } : k));
          loadData();
        }
      }
    } catch (err) {
      console.error('Error updating KPI:', err);
    }
  };

  // Admin update User permissions
  const handleUpdateUser = async (payload: {
    userId: string;
    processIds: string[];
    operationalLineId?: OperationalLineId;
    active: boolean;
  }) => {
    const res = await fetch('/api/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        userEmail: currentUser.email,
        userName: currentUser.name
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'No se pudo actualizar el usuario.');
    }

    if (data.users) {
      setUsers(data.users);
      const updatedCurrent = data.users.find((u: UserAccount) => u.id === currentUser.id);
      if (updatedCurrent) setCurrentUser(updatedCurrent);
    }
  };

  // Reset to original PDF seed
  const handleResetData = async () => {
    if (!window.confirm('¿Desea restablecer todos los datos del sistema a los valores originales del PDF 2026?')) {
      return;
    }
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await loadData();
        alert('Datos restablecidos con éxito al formato original LP-SIG-FR-011 V.04.');
      }
    } catch (err) {
      console.error('Error resetting:', err);
    }
  };

  // Generate Executive PDF
  const handleExportPDF = () => {
    const periodLabels: Record<string, string> = {
      '2026-01': 'Enero 2026',
      '2026-02': 'Febrero 2026',
      '2026-03': 'Marzo 2026',
      '2026-04': 'Abril 2026',
      '2026-05': 'Mayo 2026',
      '2026-06': 'Junio 2026',
      '2026-07': 'Julio 2026',
      '2026-08': 'Agosto 2026',
      '2026-09': 'Setiembre 2026',
      '2026-10': 'Octubre 2026',
      '2026-11': 'Noviembre 2026',
      '2026-12': 'Diciembre 2026'
    };

    generateExecutivePDF({
      period: selectedPeriod,
      periodLabel: periodLabels[selectedPeriod] || selectedPeriod,
      processes,
      kpis,
      records
    });
  };

  // Handle Login Success from LoginView
  const handleLoginSuccess = (user: UserAccount, targetView: 'dashboard' | 'entry', targetProcessId?: string) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setCurrentView(targetView);
    setActiveProcessIdForEntry(targetProcessId);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // If user is not yet logged in, show the Corporate Login Screen
  if (!isAuthenticated && !isLoading) {
    return (
      <LoginView
        users={users}
        processes={processes}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Header with Top Bar Contract & Role Switcher */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        currentUser={currentUser}
        allUsers={users}
        onSwitchUser={(u) => {
          setCurrentUser(u);
          if (u.role !== 'ADMIN' && u.processIds.length > 0) {
            setActiveProcessIdForEntry(u.processIds[0]);
          }
        }}
        onExportPDF={handleExportPDF}
        onResetData={handleResetData}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
            <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
            <span className="text-xs font-semibold text-slate-600">
              Cargando Sistema de Monitoreo SIG...
            </span>
          </div>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <DashboardView
                kpis={kpis}
                records={records}
                processes={processes}
                lines={lines}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                onOpenRecordDetail={(kpi, rec) => setDetailModal({ kpi, record: rec })}
              />
            )}

            {currentView === 'entry' && (
              <MonthlyEntryView
                kpis={kpis}
                records={records}
                processes={processes}
                lines={lines}
                currentUser={currentUser}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                onSaveRecord={handleSaveRecord}
                onReviewRecord={handleReviewRecord}
                onDeleteFile={handleDeleteFile}
                onNavigateToStorage={() => setCurrentView('storage')}
                initialProcessId={activeProcessIdForEntry}
              />
            )}

            {currentView === 'matrix' && (
              <MasterMatrixView
                kpis={kpis}
                processes={processes}
                currentUser={currentUser}
                onUpdateKpi={handleUpdateKpi}
              />
            )}

            {currentView === 'completeness' && (
              <CompletenessView
                kpis={kpis}
                records={records}
                processes={processes}
                users={users}
                selectedPeriod={selectedPeriod}
                onPeriodChange={setSelectedPeriod}
                currentUser={currentUser}
              />
            )}

            {currentView === 'audit' && (
              <AuditView auditLogs={auditLogs} />
            )}

            {currentView === 'users' && (
              <UserManagementView
                users={users}
                processes={processes}
                lines={lines}
                currentUser={currentUser}
                onUpdateUser={handleUpdateUser}
              />
            )}

            {currentView === 'storage' && (
              <StorageManagerView
                kpis={kpis}
                records={records}
                processes={processes}
                currentUser={currentUser}
                onDeleteFile={handleDeleteFile}
                onBulkDeleteFiles={handleBulkDeleteFiles}
              />
            )}
          </>
        )}
      </main>

      {/* Drill-down Record Detail Modal */}
      {detailModal && (
        <RecordDetailModal
          kpi={detailModal.kpi}
          record={detailModal.record}
          allRecords={records}
          processes={processes}
          period={selectedPeriod}
          currentUser={currentUser}
          onDeleteFile={handleDeleteFile}
          onClose={() => setDetailModal(null)}
          onGoToEntry={(kpiId) => {
            setCurrentView('entry');
          }}
        />
      )}

      {/* Corporate Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Limones Piuranos S.A.C.</span>
            <span>·</span>
            <span>Sistema Integrado de Gestión (ISO 9001:2015 / BASC)</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>LP-SIG-FR-011 V.04</span>
            <span>·</span>
            <span>Carretera Piura - Sullana Km 1025</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
