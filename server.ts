/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Servidor Express Full-Stack con integración Vite para AI Studio
 * SIG KPI — Limones Piuranos S.A.C.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import {
  PROCESSES,
  OPERATIONAL_LINES,
  INITIAL_USERS,
  KPIS,
  buildInitialMonthlyRecords,
  INITIAL_AUDIT_LOGS,
  evaluateKPICompliance
} from './src/data/seedData.ts';
import {
  MonthlyRecord,
  AuditLogEntry,
  UserAccount,
  KPIDefinition,
  ComplianceStatus
} from './src/types/sig.ts';

const PORT = Number(process.env.PORT) || 3000;
const DB_FILE = path.resolve(process.cwd(), 'data_sig_kpi.json');

// Memory cache of application state
interface DatabaseState {
  users: UserAccount[];
  kpis: KPIDefinition[];
  records: MonthlyRecord[];
  auditLogs: AuditLogEntry[];
}

let dbState: DatabaseState = {
  users: [...INITIAL_USERS],
  kpis: [...KPIS],
  records: buildInitialMonthlyRecords(),
  auditLogs: [...INITIAL_AUDIT_LOGS]
};

// Try loading persisted file if available
function loadPersistedState() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.records && Array.isArray(parsed.records)) {
        // Re-attach compute functions to KPIs
        dbState.records = parsed.records;
        dbState.auditLogs = parsed.auditLogs || dbState.auditLogs;
        if (parsed.users) dbState.users = parsed.users;
        console.log('[SIG KPI] Estado persistido cargado exitosamente desde', DB_FILE);
      }
    }
  } catch (err) {
    console.warn('[SIG KPI] No se pudo leer archivo persistido, usando semillero inicial:', err);
  }
}

function saveState() {
  try {
    const toSave = {
      users: dbState.users,
      records: dbState.records,
      auditLogs: dbState.auditLogs,
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(toSave, null, 2), 'utf-8');
  } catch (err) {
    console.error('[SIG KPI] Error al guardar estado en disco:', err);
  }
}

loadPersistedState();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ limit: '100mb', extended: true }));

  // === REST API ENDPOINTS ===

  // 1. Bootstrap full application data
  app.get('/api/bootstrap', (_req: Request, res: Response) => {
    // Current date in America/Lima
    const limaDateStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    res.json({
      success: true,
      data: {
        company: 'Limones Piuranos S.A.C.',
        standard: 'ISO 9001:2015 & BASC',
        documentCode: 'LP-SIG-FR-011',
        version: '04',
        responsible: 'Ing. Mario Armijos Llontop',
        processes: PROCESSES,
        operationalLines: OPERATIONAL_LINES,
        users: dbState.users,
        kpis: dbState.kpis.map(k => ({
          ...k,
          computeResult: undefined // Strip function for JSON serialization
        })),
        records: dbState.records,
        auditLogs: dbState.auditLogs.slice(0, 100),
        currentDateInLima: limaDateStr
      }
    });
  });

  // 2. Save monthly KPI entry (Draft or Submitted for validation)
  app.post('/api/records/save', (req: Request, res: Response) => {
    const {
      kpiId,
      period,
      inputs,
      observations,
      evidenceRef,
      evidenceFiles,
      userEmail,
      userName,
      submitForValidation
    } = req.body;

    if (!kpiId || !period || !inputs) {
      res.status(400).json({ success: false, error: 'Faltan parámetros obligatorios (kpiId, period, inputs).' });
      return;
    }

    const kpi = KPIS.find(k => k.id === kpiId);
    if (!kpi) {
      res.status(404).json({ success: false, error: 'Indicador no encontrado.' });
      return;
    }

    // Compute result safely on backend
    const num = Number(inputs.numerador ?? 0);
    const den = Number(inputs.denominador ?? 1);

    let calculated: number;
    if (kpi.variables.length >= 2) {
      if (den === 0) {
        calculated = 0;
      } else {
        calculated = Number(((num / den) * 100).toFixed(1));
      }
    } else {
      calculated = num;
    }

    const compliance: ComplianceStatus = evaluateKPICompliance(kpi, calculated);
    const status = submitForValidation ? 'REGISTRADO' : 'BORRADOR';

    const existingIdx = dbState.records.findIndex(r => r.kpiId === kpiId && r.period === period);
    const recordId = existingIdx >= 0 ? dbState.records[existingIdx].id : `rec_${kpiId}_${period}`;

    const prevResult = existingIdx >= 0 ? dbState.records[existingIdx].calculatedResult : null;

    const record: MonthlyRecord = {
      id: recordId,
      kpiId,
      period,
      inputs: {
        numerador: num,
        denominador: den
      },
      calculatedResult: calculated,
      complianceStatus: compliance,
      recordStatus: status,
      observations: observations || '',
      evidenceRef: evidenceRef || '',
      evidenceFiles: Array.isArray(evidenceFiles)
        ? evidenceFiles
        : (existingIdx >= 0 && dbState.records[existingIdx].evidenceFiles ? dbState.records[existingIdx].evidenceFiles : []),
      updatedBy: userEmail || 'siglimonespiuranos@gmail.com',
      updatedAt: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      dbState.records[existingIdx] = record;
    } else {
      dbState.records.push(record);
    }

    // Add Audit log entry
    const audit: AuditLogEntry = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: userEmail || 'siglimonespiuranos@gmail.com',
      userName: userName || 'Usuario SIG',
      action: existingIdx >= 0 ? 'UPDATE' : 'CREATE',
      entity: 'RECORD',
      entityId: `${kpi.code} (${period})`,
      description: submitForValidation
        ? `Envío de registro mensual para validación: ${calculated}${kpi.unit} [${compliance}]`
        : `Guardado en borrador: ${calculated}${kpi.unit}`,
      previousValue: prevResult !== null ? `${prevResult}${kpi.unit}` : undefined,
      newValue: `${calculated}${kpi.unit}`
    };

    dbState.auditLogs.unshift(audit);
    saveState();

    res.json({ success: true, record, audit });
  });

  // 3. Admin Review & Approval / Return
  app.post('/api/records/review', (req: Request, res: Response) => {
    const { recordId, action, rejectionReason, userEmail, userName } = req.body;

    const record = dbState.records.find(r => r.id === recordId);
    if (!record) {
      res.status(404).json({ success: false, error: 'Registro no encontrado.' });
      return;
    }

    const kpi = KPIS.find(k => k.id === record.kpiId);
    const kpiCode = kpi ? kpi.code : record.kpiId;

    if (action === 'VALIDATE') {
      record.recordStatus = 'VALIDADO';
      record.validatedBy = userEmail;
      record.validatedAt = new Date().toISOString();
      record.rejectionReason = undefined;

      dbState.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userEmail: userEmail || 'siglimonespiuranos@gmail.com',
        userName: userName || 'Administrador SIG',
        action: 'VALIDATE',
        entity: 'RECORD',
        entityId: `${kpiCode} (${record.period})`,
        description: `Validación y aprobación definitiva de registro mensual por Gerencia SIG.`
      });
    } else if (action === 'RETURN') {
      record.recordStatus = 'DEVUELTO';
      record.rejectionReason = rejectionReason || 'Observado para corrección de datos de origen.';

      dbState.auditLogs.unshift({
        id: `aud_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userEmail: userEmail || 'siglimonespiuranos@gmail.com',
        userName: userName || 'Administrador SIG',
        action: 'RETURN',
        entity: 'RECORD',
        entityId: `${kpiCode} (${record.period})`,
        description: `Devolución de registro para subsanación. Motivo: ${record.rejectionReason}`
      });
    }

    saveState();
    res.json({ success: true, record });
  });

  // 3b. Admin Delete Individual File to liberate workspace space
  app.post('/api/records/delete-file', (req: Request, res: Response) => {
    const { recordId, fileId, userEmail, userName } = req.body;

    const record = dbState.records.find(r => r.id === recordId);
    if (!record || !record.evidenceFiles) {
      res.status(404).json({ success: false, error: 'Registro o archivos no encontrados.' });
      return;
    }

    const fileIndex = record.evidenceFiles.findIndex(f => f.id === fileId);
    if (fileIndex === -1) {
      res.status(404).json({ success: false, error: 'Archivo no encontrado en el registro.' });
      return;
    }

    const removedFile = record.evidenceFiles[fileIndex];
    record.evidenceFiles.splice(fileIndex, 1);

    const kpi = KPIS.find(k => k.id === record.kpiId);
    const kpiCode = kpi ? kpi.code : record.kpiId;

    // Register Audit Log
    dbState.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: userEmail || 'siglimonespiuranos@gmail.com',
      userName: userName || 'Administrador SIG',
      action: 'UPDATE',
      entity: 'RECORD',
      entityId: `${kpiCode} (${record.period})`,
      description: `Liberación de espacio de trabajo: Se eliminó el archivo de evidencia "${removedFile.name}" (${(removedFile.size / 1024).toFixed(1)} KB).`
    });

    saveState();
    res.json({
      success: true,
      record,
      freedBytes: removedFile.size,
      removedFileName: removedFile.name
    });
  });

  // 3c. Admin Bulk Delete Files to liberate workspace space
  app.post('/api/admin/clean-files', (req: Request, res: Response) => {
    const { fileIds, userEmail, userName } = req.body;
    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      res.status(400).json({ success: false, error: 'Lista de archivos vacía.' });
      return;
    }

    let totalFreedBytes = 0;
    let deletedCount = 0;
    const targetSet = new Set(fileIds);

    dbState.records.forEach(rec => {
      if (rec.evidenceFiles && rec.evidenceFiles.length > 0) {
        const remaining = rec.evidenceFiles.filter(f => {
          if (targetSet.has(f.id)) {
            totalFreedBytes += f.size;
            deletedCount++;
            return false;
          }
          return true;
        });
        rec.evidenceFiles = remaining;
      }
    });

    dbState.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: userEmail || 'siglimonespiuranos@gmail.com',
      userName: userName || 'Administrador SIG',
      action: 'UPDATE',
      entity: 'RECORD',
      entityId: 'ALMACENAMIENTO',
      description: `Limpieza administrativa de almacenamiento: Se eliminaron ${deletedCount} archivos liberando ${(totalFreedBytes / (1024 * 1024)).toFixed(2)} MB.`
    });

    saveState();
    res.json({
      success: true,
      deletedCount,
      freedBytes: totalFreedBytes,
      records: dbState.records
    });
  });

  // 4. Update KPI targets / tolerances
  app.post('/api/kpis/update', (req: Request, res: Response) => {
    const { kpiId, targetValue, warningTolerance, notes, userEmail, userName } = req.body;

    const kpi = dbState.kpis.find(k => k.id === kpiId);
    if (!kpi) {
      res.status(404).json({ success: false, error: 'KPI no encontrado.' });
      return;
    }

    const prevTarget = kpi.targetValue;
    if (typeof targetValue === 'number') kpi.targetValue = targetValue;
    if (typeof warningTolerance === 'number') kpi.warningTolerance = warningTolerance;
    if (typeof notes === 'string') kpi.notes = notes;

    dbState.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: userEmail || 'siglimonespiuranos@gmail.com',
      userName: userName || 'Administrador SIG',
      action: 'CONFIG_CHANGE',
      entity: 'KPI',
      entityId: kpi.code,
      description: `Actualización de meta y parámetros del indicador.`,
      previousValue: `Meta: ${prevTarget}${kpi.unit}`,
      newValue: `Meta: ${kpi.targetValue}${kpi.unit}, Tolerancia: ${kpi.warningTolerance}`
    });

    saveState();
    res.json({ success: true, kpi });
  });

  // 5. Update user assignment & line limits
  app.post('/api/users/update', (req: Request, res: Response) => {
    const { userId, processIds, operationalLineId, active, userEmail, userName } = req.body;

    const targetUser = dbState.users.find(u => u.id === userId);
    if (!targetUser) {
      res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
      return;
    }

    // Check line limit (max 3 users per operational line)
    if (operationalLineId && operationalLineId !== 'GENERAL') {
      const activeLineUsers = dbState.users.filter(
        u => u.id !== userId && u.operationalLineId === operationalLineId && u.active
      );
      if (activeLineUsers.length >= 3) {
        res.status(400).json({
          success: false,
          error: `Se ha alcanzado el límite máximo de 3 usuarios activos para la línea operativa ${operationalLineId}.`
        });
        return;
      }
    }

    if (Array.isArray(processIds)) targetUser.processIds = processIds;
    if (operationalLineId !== undefined) targetUser.operationalLineId = operationalLineId;
    if (typeof active === 'boolean') targetUser.active = active;

    dbState.auditLogs.unshift({
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userEmail: userEmail || 'siglimonespiuranos@gmail.com',
      userName: userName || 'Administrador SIG',
      action: 'CONFIG_CHANGE',
      entity: 'USER',
      entityId: targetUser.email,
      description: `Modificación de asignación de procesos y línea operativa.`
    });

    saveState();
    res.json({ success: true, users: dbState.users });
  });

  // 6. Simulate Notification & Reminders Engine (Rule: 29th of current month to 2nd of next month, America/Lima)
  app.post('/api/reminders/simulate', (req: Request, res: Response) => {
    const { simulatedDateStr, period } = req.body; // e.g. "2026-08-30", "2026-08"

    const dateToUse = simulatedDateStr ? new Date(`${simulatedDateStr}T12:00:00Z`) : new Date();

    const day = dateToUse.getDate();
    // Last day of month
    const year = dateToUse.getFullYear();
    const month = dateToUse.getMonth(); // 0-indexed
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();

    // Notification window is from day 29 (or lastDayOfMonth if month < 29) to day 2 of next month
    const isInWindow = (day >= Math.min(29, lastDayOfMonth) && day <= lastDayOfMonth) || (day >= 1 && day <= 2);

    const targetPeriod = period || `${year}-${String(month + 1).padStart(2, '0')}`;

    // Find incomplete KPIs for targetPeriod
    const pendingByProcess: Record<string, { count: number; processName: string; responsible: string[] }> = {};

    PROCESSES.forEach(proc => {
      const procKpis = KPIS.filter(k => k.processId === proc.id && k.frequency === 'MENSUAL');
      let pendingCount = 0;

      procKpis.forEach(k => {
        const rec = dbState.records.find(r => r.kpiId === k.id && r.period === targetPeriod);
        if (!rec || rec.recordStatus === 'BORRADOR' || rec.recordStatus === 'DEVUELTO') {
          pendingCount++;
        }
      });

      if (pendingCount > 0) {
        const assignedUsers = dbState.users.filter(u => u.processIds.includes(proc.id) && u.active);
        pendingByProcess[proc.id] = {
          count: pendingCount,
          processName: proc.name,
          responsible: assignedUsers.map(u => u.email)
        };
      }
    });

    res.json({
      success: true,
      simulation: {
        evaluatedDate: dateToUse.toISOString().split('T')[0],
        targetPeriod,
        isInNotificationWindow: isInWindow,
        windowRule: 'Día 29 de cada mes hasta el día 2 del mes siguiente (America/Lima)',
        pendingProcessesCount: Object.keys(pendingByProcess).length,
        pendingProcesses: Object.entries(pendingByProcess).map(([procId, val]) => ({
          processId: procId,
          processName: val.processName,
          pendingCount: val.count,
          recipientEmails: val.responsible.length > 0 ? val.responsible : ['siglimonespiuranos@gmail.com']
        }))
      }
    });
  });

  // 7. Reset to initial official seed from LP-SIG-FR-011 V.04
  app.post('/api/reset', (_req: Request, res: Response) => {
    dbState = {
      users: [...INITIAL_USERS],
      kpis: [...KPIS],
      records: buildInitialMonthlyRecords(),
      auditLogs: [
        {
          id: `aud_${Date.now()}`,
          timestamp: new Date().toISOString(),
          userEmail: 'siglimonespiuranos@gmail.com',
          userName: 'Leslie Gianella Agurto Castro',
          action: 'REOPEN',
          entity: 'PERIOD',
          entityId: 'ALL',
          description: 'Restablecimiento oficial de datos históricos desde documento LP-SIG-FR-011 V.04.'
        },
        ...INITIAL_AUDIT_LOGS
      ]
    };
    saveState();
    res.json({ success: true, message: 'Datos restablecidos exitosamente al semillero oficial.' });
  });

  // Mount Vite development middlewares
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SIG KPI] Servidor empresarial escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[SIG KPI] Error al iniciar servidor:', err);
  process.exit(1);
});
