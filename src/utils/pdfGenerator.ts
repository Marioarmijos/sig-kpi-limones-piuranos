/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Generador de Reporte Ejecutivo PDF Oficial
 * Limones Piuranos S.A.C. · LP-SIG-FR-011 V.04
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { KPIDefinition, MonthlyRecord, ProcessDefinition, ComplianceStatus } from '../types/sig';

interface PDFReportOptions {
  period: string; // e.g. "2026-07"
  periodLabel: string; // e.g. "Julio 2026"
  processes: ProcessDefinition[];
  kpis: KPIDefinition[];
  records: MonthlyRecord[];
  categoryFilter?: string; // "ALL" | "ESTRATEGICO" | "OPERATIVO" | "SOPORTE"
  processFilter?: string; // "ALL" | processId
}

export function generateExecutivePDF(options: PDFReportOptions) {
  const { period, periodLabel, processes, kpis, records, categoryFilter, processFilter } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [21, 128, 61]; // #15803D (Verde Cítrico Limones Piuranos)
  const darkTextColor = [15, 23, 42]; // #0F172A
  const mutedTextColor = [100, 116, 139]; // #64748B

  // Filter applicable KPIs
  let applicableKpis = kpis.filter(k => k.frequency === 'MENSUAL');
  if (categoryFilter && categoryFilter !== 'ALL') {
    const validProcIds = processes.filter(p => p.category === categoryFilter).map(p => p.id);
    applicableKpis = applicableKpis.filter(k => validProcIds.includes(k.processId));
  }
  if (processFilter && processFilter !== 'ALL') {
    applicableKpis = applicableKpis.filter(k => k.processId === processFilter);
  }

  // Calculate statistics for this period
  let completedCount = 0;
  let verdeCount = 0;
  let amarilloCount = 0;
  let rojoCount = 0;
  let sinDatoCount = 0;

  applicableKpis.forEach(k => {
    const rec = records.find(r => r.kpiId === k.id && r.period === period);
    if (rec && rec.calculatedResult !== null && !isNaN(rec.calculatedResult)) {
      completedCount++;
      if (rec.complianceStatus === 'VERDE') verdeCount++;
      else if (rec.complianceStatus === 'AMARILLO') amarilloCount++;
      else if (rec.complianceStatus === 'ROJO') rojoCount++;
      else sinDatoCount++;
    } else {
      sinDatoCount++;
    }
  });

  const totalKpis = applicableKpis.length;
  const completitudPct = totalKpis > 0 ? ((completedCount / totalKpis) * 100).toFixed(1) : '0';
  const cumplimientoPct = completedCount > 0 ? ((verdeCount / completedCount) * 100).toFixed(1) : '0';

  // --- HEADER OFICIAL ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(14, 12, 182, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('LIMONES PIURANOS S.A.C.', 14, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('Sistema Integrado de Gestión | ISO 9001:2015 · BRCGs · BASC', 14, 27);
  doc.text('Formato Oficial: LP-SIG-FR-011 · Versión: 04', 14, 32);

  // Box on the right with period info
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(120, 16, 76, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`PERIODO: ${periodLabel.toUpperCase()}`, 124, 22);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`Fecha Emisión: ${new Date().toLocaleDateString('es-PE')}`, 124, 27);
  doc.text(`Responsable SIG: Ing. Mario Armijos Llontop`, 124, 31);

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.line(14, 38, 196, 38);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text('INFORME EJECUTIVO DE MONITOREO DE INDICADORES (KPI)', 14, 46);

  // --- RESUMEN DE CONTROL EJECUTIVO (METRIC BOXES) ---
  const boxWidth = 42;
  const boxHeight = 20;
  const startY = 51;

  // Box 1: Completitud de Carga
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, startY, boxWidth, boxHeight, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(mutedTextColor[0], mutedTextColor[1], mutedTextColor[2]);
  doc.text('COMPLETITUD CARGA', 18, startY + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(`${completitudPct}%`, 18, startY + 14);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${completedCount} de ${totalKpis} reportados`, 18, startY + 18);

  // Box 2: Cumplimiento de Metas
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(60, startY, boxWidth, boxHeight, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('CUMPLIMIENTO METAS', 64, startY + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${cumplimientoPct}%`, 64, startY + 14);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`${verdeCount} cumplen meta`, 64, startY + 18);

  // Box 3: En Alerta
  doc.setFillColor(254, 252, 232);
  doc.roundedRect(106, startY, boxWidth, boxHeight, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('EN ALERTA', 110, startY + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 83, 9);
  doc.text(`${amarilloCount}`, 110, startY + 14);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Requiere seguimiento', 110, startY + 18);

  // Box 4: Acción Correctiva (Rojo)
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(152, startY, boxWidth, boxHeight, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text('ACCIÓN CORRECTIVA', 156, startY + 6);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text(`${rojoCount}`, 156, startY + 14);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Desviaciones críticas', 156, startY + 18);

  // --- TABLA DETALLADA DE INDICADORES ---
  const tableData = applicableKpis.map(k => {
    const proc = processes.find(p => p.id === k.processId);
    const rec = records.find(r => r.kpiId === k.id && r.period === period);
    const val = rec && rec.calculatedResult !== null ? `${rec.calculatedResult}${k.unit}` : 'Sin Dato';
    const status = rec ? rec.complianceStatus : 'SIN_DATO';

    return [
      k.code,
      proc ? proc.name : '',
      k.name,
      `${k.operator} ${k.targetValue}${k.unit}`,
      val,
      status === 'VERDE' ? 'CONFORME' : status === 'AMARILLO' ? 'EN ALERTA' : status === 'ROJO' ? 'CORRECTIVA' : 'PENDIENTE',
      rec?.observations || '-'
    ];
  });

  autoTable(doc, {
    startY: 77,
    head: [['Código', 'Proceso', 'Indicador', 'Meta', 'Real', 'Estado', 'Observación']],
    body: tableData,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      font: 'helvetica'
    },
    headStyles: {
      fillColor: [21, 128, 61],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 32 },
      2: { cellWidth: 50 },
      3: { cellWidth: 18, halign: 'right' },
      4: { cellWidth: 18, halign: 'right', fontStyle: 'bold' },
      5: { cellWidth: 20, halign: 'center' },
      6: { cellWidth: 24 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 5) {
        const txt = data.cell.raw as string;
        if (txt === 'CONFORME') {
          data.cell.styles.textColor = [22, 101, 52];
          data.cell.styles.fillColor = [220, 252, 231];
        } else if (txt === 'EN ALERTA') {
          data.cell.styles.textColor = [154, 52, 18];
          data.cell.styles.fillColor = [254, 240, 138];
        } else if (txt === 'CORRECTIVA') {
          data.cell.styles.textColor = [153, 27, 27];
          data.cell.styles.fillColor = [254, 226, 226];
        } else {
          data.cell.styles.textColor = [100, 116, 139];
          data.cell.styles.fillColor = [241, 245, 249];
        }
      }
    }
  });

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    doc.text(
      `Limones Piuranos S.A.C. · Carretera Piura-Sullana Km 1025 · Documento Confidencial SIG`,
      14,
      287
    );
    doc.text(`Página ${i} de ${pageCount}`, 180, 287);
  }

  // Trigger browser download
  doc.save(`SIG_KPI_Limones_Piuranos_${period}.pdf`);
}
