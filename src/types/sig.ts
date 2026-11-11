/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sistema de Monitoreo de Indicadores de Gestión ISO 9001 / BASC
 * Limones Piuranos S.A.C. — LP-SIG-FR-011 V.04
 */

export type ProcessCategory = 'ESTRATEGICO' | 'OPERATIVO' | 'SOPORTE';

export type OperationalLineId = 'JUGOS_TROPICALES' | 'CITRICOS' | 'FRUTA_FRESCA' | 'GENERAL';

export type UserRole = 'ADMIN' | 'STRATEGIC_USER' | 'OPERATIONAL_USER' | 'SUPPORT_USER';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  pin: string; // 4-digit access pin (e.g. "9001")
  processIds: string[]; // Assigned process IDs
  operationalLineId?: OperationalLineId; // For operational users
  active: boolean;
  avatarUrl?: string;
}

export interface ProcessDefinition {
  id: string;
  name: string;
  category: ProcessCategory;
  description: string;
  defaultResponsible: string;
  hasOperationalLines?: boolean;
}

export interface OperationalLineDefinition {
  id: OperationalLineId;
  name: string;
  description: string;
  maxUsers: number;
}

export type KPIFrequency = 'MENSUAL' | 'ANUAL';
export type ComparisonOperator = '>=' | '<=' | '>' | '<' | '==' | 'RANGE';

export interface KPIVariable {
  key: string;
  label: string;
  unit: string;
  defaultValue?: number;
}

export interface KPIDefinition {
  id: string;
  code: string;
  processId: string;
  operationalLineId?: OperationalLineId;
  name: string;
  objective: string;
  formulaDescription: string;
  unit: string;
  targetValue: number;
  operator: ComparisonOperator;
  warningTolerance: number; // Delta or threshold where status is AMARILLO
  frequency: KPIFrequency;
  sourceOfData: string;
  responsibleTitle: string;
  variables: KPIVariable[];
  computeResult: (inputs: Record<string, number>) => number;
  notes?: string;
}

export type ComplianceStatus = 'VERDE' | 'AMARILLO' | 'ROJO' | 'SIN_DATO';
export type RecordStatus = 'BORRADOR' | 'REGISTRADO' | 'VALIDADO' | 'DEVUELTO';

export interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string; // 'application/pdf' | 'image/png'
  dataUrl?: string; // base64 representation for preview & download
  uploadedAt: string;
  uploadedBy?: string;
}

export interface MonthlyRecord {
  id: string;
  kpiId: string;
  period: string; // YYYY-MM (e.g. "2026-08")
  inputs: Record<string, number>;
  calculatedResult: number | null;
  complianceStatus: ComplianceStatus;
  recordStatus: RecordStatus;
  observations?: string;
  evidenceRef?: string;
  evidenceFiles?: EvidenceFile[];
  updatedBy: string;
  updatedAt: string;
  validatedBy?: string;
  validatedAt?: string;
  rejectionReason?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userEmail: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'VALIDATE' | 'RETURN' | 'REOPEN' | 'CONFIG_CHANGE' | 'IMPORT';
  entity: 'RECORD' | 'KPI' | 'USER' | 'PERIOD';
  entityId: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface ReminderSimulation {
  currentDateInLima: string;
  targetPeriod: string;
  isInNotificationWindow: boolean;
  daysRemainingInWindow: number;
  pendingProcesses: {
    processId: string;
    processName: string;
    responsibleEmails: string[];
    pendingCount: number;
  }[];
}
