/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Especificación de Evidencia Documental Requerida por Indicador (LP-SIG-FR-011 V.04)
 * Limones Piuranos S.A.C. · ISO 9001:2015 & BASC
 */

import { KPIDefinition } from '../types/sig';

export interface EvidenceRequirement {
  shortPrompt: string; // Brief requirement title
  detailedInstruction: string; // What the process owner MUST upload
  mandatoryItemName: string; // Exact evidence item (e.g. "Acta de simulacro BASC")
  recommendedFormats: string; // e.g. "PDF o PNG"
}

// Precise mapping of evidence requested per KPI code
const EVIDENCE_MAP: Record<string, EvidenceRequirement> = {
  // SEGURIDAD FÍSICA Y BASC
  'SOP-SEG-02': {
    shortPrompt: 'Evidencia obligatoria de simulacros realizados',
    detailedInstruction: 'Cargue obligatoriamente el Acta de Simulacro BASC firmada por los participantes, el informe de evaluación de tiempos de respuesta y el reporte fotográfico de ejecución.',
    mandatoryItemName: 'Acta de simulacro BASC y reporte fotográfico',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-SEG-03': {
    shortPrompt: 'Evidencia obligatoria de capacitaciones BASC realizadas',
    detailedInstruction: 'Cargue obligatoriamente las listas de asistencia firmadas por el personal capacitado, constancias de evaluación de entendimiento y material didáctico impartido.',
    mandatoryItemName: 'Listas de asistencia y evaluaciones BASC',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-SEG-01': {
    shortPrompt: 'Evidencia de incidentes de seguridad física',
    detailedInstruction: 'Cargue el reporte consolidado de control de accesos, cuaderno de ocurrencias patrimoniales o informe de investigación de incidencias de seguridad física.',
    mandatoryItemName: 'Informe de incidentes de seguridad',
    recommendedFormats: 'PDF o PNG'
  },

  // GESTIÓN SIG
  'EST-SIG-01': {
    shortPrompt: 'Evidencia de auditorías internas SIG realizadas',
    detailedInstruction: 'Cargue obligatoriamente los Informes Finales de Auditoría Interna, listas de verificación suscritas por el auditor líder y registro de no conformidades detectadas.',
    mandatoryItemName: 'Informe final de auditoría interna',
    recommendedFormats: 'PDF o PNG'
  },
  'EST-SIG-02': {
    shortPrompt: 'Evidencia de gestión ambiental de residuos sólidos',
    detailedInstruction: 'Cargue obligatoriamente los Manifiestos de Manejo de Residuos Sólidos autorizados, Guías de Remisión de la Empresa Operadora (EO-RS) y bitácora ambiental.',
    mandatoryItemName: 'Manifiesto de residuos y guía EO-RS',
    recommendedFormats: 'PDF o PNG'
  },
  'EST-SIG-03': {
    shortPrompt: 'Evidencia de capacitaciones SST realizadas',
    detailedInstruction: 'Cargue obligatoriamente las listas de asistencia firmadas correspondientes al Plan Anual de Capacitación en Seguridad y Salud en el Trabajo.',
    mandatoryItemName: 'Listas de asistencia de capacitación SST',
    recommendedFormats: 'PDF o PNG'
  },

  // ALTA DIRECCIÓN
  'EST-AD-01': {
    shortPrompt: 'Evidencia de cumplimiento de objetivos SIG de Alta Dirección',
    detailedInstruction: 'Cargue obligatoriamente las Actas de Reunión de Revisión por la Dirección, minutas de comités ejecutivos y matriz de seguimiento de metas estratégicas firmadas.',
    mandatoryItemName: 'Acta de revisión por la dirección',
    recommendedFormats: 'PDF o PNG'
  },

  // COMERCIAL
  'EST-GC-01': {
    shortPrompt: 'Evidencia de validación de clientes seguros BASC',
    detailedInstruction: 'Cargue obligatoriamente las Fichas de Validación de Asociados de Negocio, consultas en listas restrictivas y expedientes de debida diligencia de clientes críticos.',
    mandatoryItemName: 'Ficha de validación BASC de clientes',
    recommendedFormats: 'PDF o PNG'
  },
  'EST-GC-02': {
    shortPrompt: 'Evidencia de encuestas de satisfacción de clientes',
    detailedInstruction: 'Cargue las encuestas de satisfacción diligenciadas por clientes internacionales y el informe mensual de análisis de reclamos y oportunidades de mejora.',
    mandatoryItemName: 'Encuestas de satisfacción de clientes',
    recommendedFormats: 'PDF o PNG'
  },

  // INVESTIGACIÓN Y DESARROLLO
  'EST-ID-01': {
    shortPrompt: 'Evidencia de eficacia de desarrollos de I&D',
    detailedInstruction: 'Cargue los informes técnicos de validación de nuevos productos, formulaciones piloto y dictámenes de conformidad organoléptica / físico-química.',
    mandatoryItemName: 'Informe de validación de desarrollos',
    recommendedFormats: 'PDF o PNG'
  },
  'EST-ID-02': {
    shortPrompt: 'Evidencia de proyectos I&D con impacto comercial',
    detailedInstruction: 'Cargue las fichas técnicas de lanzamiento al mercado comercial y actas de cierre de proyecto con evaluación de rentabilidad.',
    mandatoryItemName: 'Ficha de lanzamiento comercial',
    recommendedFormats: 'PDF o PNG'
  },
  'EST-ID-03': {
    shortPrompt: 'Evidencia de productos elaborados conforme',
    detailedInstruction: 'Cargue los reportes de control de calidad de lotes piloto elaborados y certificados de análisis de laboratorio.',
    mandatoryItemName: 'Certificado de análisis de lote piloto',
    recommendedFormats: 'PDF o PNG'
  },

  // ACOPIO
  'OPE-ACO-01': {
    shortPrompt: 'Evidencia de materia prima conforme en acopio',
    detailedInstruction: 'Cargue obligatoriamente las Guías de Recepción de Fruta, boletas de pesaje de balanza y hojas de control de calidad de limón en tolva de ingreso.',
    mandatoryItemName: 'Guía de recepción y boleta de balanza',
    recommendedFormats: 'PDF o PNG'
  },
  'OPE-ACO-02': {
    shortPrompt: 'Evidencia de concientización a proveedores de fruta',
    detailedInstruction: 'Cargue las listas de asistencia firmadas de capacitaciones o charlas técnicas brindadas a los agricultores y productores de limón.',
    mandatoryItemName: 'Lista de asistencia de proveedores',
    recommendedFormats: 'PDF o PNG'
  },

  // INDUSTRIAL CÍTRICOS Y JUGOS
  'OPE-CIT-ACE': {
    shortPrompt: 'Evidencia de rendimiento de Aceite Esencial de Limón',
    detailedInstruction: 'Cargue el Parte Diario de Producción / Destilación con las boletas de pesaje de tambores de aceite y kilos de fruta ingresada a línea.',
    mandatoryItemName: 'Parte diario de destilación de aceite',
    recommendedFormats: 'PDF o PNG'
  },
  'OPE-CIT-CAS': {
    shortPrompt: 'Evidencia de rendimiento de Cáscara Deshidratada',
    detailedInstruction: 'Cargue el Parte Diario de Secado y Embolsado de cáscara deshidratada con liquidación de pesaje en balanza industrial.',
    mandatoryItemName: 'Parte de secado de cáscara',
    recommendedFormats: 'PDF o PNG'
  },
  'OPE-CIT-JUG': {
    shortPrompt: 'Evidencia de rendimiento de Jugo Simple de Limón',
    detailedInstruction: 'Cargue las liquidaciones de molienda y prensado con los registros de volumen de jugo extraído y análisis de acidez titulable.',
    mandatoryItemName: 'Liquidación de molienda de jugo',
    recommendedFormats: 'PDF o PNG'
  },
  'OPE-JUG-MAR-NFC': {
    shortPrompt: 'Evidencia de rendimiento Jugo de Maracuyá NFC',
    detailedInstruction: 'Cargue la orden de producción de extracción de maracuyá NFC y balance de materia prima ingresada.',
    mandatoryItemName: 'Orden de producción maracuyá NFC',
    recommendedFormats: 'PDF o PNG'
  },
  'OPE-JUG-MAR-CONC': {
    shortPrompt: 'Evidencia de rendimiento Concentrado de Maracuyá',
    detailedInstruction: 'Cargue los reportes de evaporación/concentración con lectura de grados Brix y pesaje de cilindros obtenidos.',
    mandatoryItemName: 'Parte de concentración de maracuyá',
    recommendedFormats: 'PDF o PNG'
  },

  // FRUTA FRESCA
  'OPE-FF-01': {
    shortPrompt: 'Evidencia de rendimiento de empaque de fruta fresca',
    detailedInstruction: 'Cargue las planillas de liquidación de empaque de fruta fresca de exportación y pesaje de descarte por calibres.',
    mandatoryItemName: 'Planilla de liquidación de empaque',
    recommendedFormats: 'PDF o PNG'
  },
  'OPE-FF-02': {
    shortPrompt: 'Evidencia de conformidad de materia prima fruta fresca',
    detailedInstruction: 'Cargue las actas de inspección de recepción de fruta y certificados fitosanitarios de ingreso a planta.',
    mandatoryItemName: 'Acta de inspección fitosanitaria',
    recommendedFormats: 'PDF o PNG'
  },

  // EMBARQUE Y CALIDAD
  'OPE-EMB-01': {
    shortPrompt: 'Evidencia de inspección de contenedores de exportación',
    detailedInstruction: 'Cargue la Lista de Chequeo de Inspección de Contenedores BASC de 7/17 puntos y acta de colocación de precintos de seguridad.',
    mandatoryItemName: 'Inspección de contenedores BASC',
    recommendedFormats: 'PDF o PNG'
  },
  'OPE-CAL-01': {
    shortPrompt: 'Evidencia de liberación de producto terminado conforme',
    detailedInstruction: 'Cargue los certificados de análisis físico-químico y microbiológico de liberación de lotes de producto terminado.',
    mandatoryItemName: 'Certificado de liberación de producto',
    recommendedFormats: 'PDF o PNG'
  },
  'OPE-CAL-02': {
    shortPrompt: 'Evidencia de atención a reclamos de clientes',
    detailedInstruction: 'Cargue el registro de reclamos de clientes, informe de causa raíz y comunicación de cierre de reclamo emitida.',
    mandatoryItemName: 'Informe de atención a reclamos',
    recommendedFormats: 'PDF o PNG'
  },

  // RECURSOS HUMANOS
  'SOP-RRHH-01': {
    shortPrompt: 'Evidencia de capacitaciones de personal RRHH',
    detailedInstruction: 'Cargue las listas de asistencia suscritas por los participantes del Plan Anual de Capacitaciones y evaluaciones de competencia.',
    mandatoryItemName: 'Lista de asistencia de capacitaciones',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-RRHH-02': {
    shortPrompt: 'Evidencia de índice de rotación de personal',
    detailedInstruction: 'Cargue el reporte mensual consolidado de altas, bajas y headcount activo emitido por el sistema de nómina (T-Registro SUNAT).',
    mandatoryItemName: 'Reporte de altas y bajas (T-Registro)',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-RRHH-03': {
    shortPrompt: 'Evidencia de evaluaciones de desempeño laboral',
    detailedInstruction: 'Cargue las cédulas de evaluación de desempeño suscritas por jefaturas y personal operativo.',
    mandatoryItemName: 'Cédulas de evaluación de desempeño',
    recommendedFormats: 'PDF o PNG'
  },

  // MANTENIMIENTO Y PROYECTOS
  'SOP-MAN-01': {
    shortPrompt: 'Evidencia de cumplimiento de Mantenimiento Preventivo',
    detailedInstruction: 'Cargue las Órdenes de Trabajo (OT) de mantenimiento preventivo ejecutadas, firmadas por el técnico responsable y supervisor de planta.',
    mandatoryItemName: 'Órdenes de Trabajo preventivas cerradas',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-MAN-02': {
    shortPrompt: 'Evidencia de eficacia de intervenciones de mantenimiento',
    detailedInstruction: 'Cargue las hojas de vida de maquinaria intervenida, bitácoras de parada de planta y verificación de cero fallas recurrentes.',
    mandatoryItemName: 'Bitácora de fallas y paradas de planta',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-MAN-03': {
    shortPrompt: 'Evidencia de conformidad de Órdenes de Trabajo (OT)',
    detailedInstruction: 'Cargue las Órdenes de Trabajo con la firma de conformidad y visto bueno del área usuaria solicitante.',
    mandatoryItemName: 'OT con conformidad de área usuaria',
    recommendedFormats: 'PDF o PNG'
  },

  // LOGÍSTICA Y COMPRAS
  'SOP-LOG-01': {
    shortPrompt: 'Evidencia de evaluación de proveedores críticos BASC',
    detailedInstruction: 'Cargue las fichas de evaluación y selección de proveedores críticos, homologaciones y verificación en listas BASC.',
    mandatoryItemName: 'Evaluación y homologación de proveedor',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-LOG-02': {
    shortPrompt: 'Evidencia de atención a requerimientos de compras',
    detailedInstruction: 'Cargue el reporte del sistema ERP con el seguimiento de órdenes de compra emitidas a tiempo vs solicitudes de pedido.',
    mandatoryItemName: 'Reporte de atención de requerimientos',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-LOG-03': {
    shortPrompt: 'Evidencia de concientización a proveedores de compras',
    detailedInstruction: 'Cargue los cargos de recepción de políticas SIG/BASC y compromisos firmados por los proveedores de bienes y servicios.',
    mandatoryItemName: 'Cargos de política firmados por proveedor',
    recommendedFormats: 'PDF o PNG'
  },

  // TECNOLOGÍAS DE LA INFORMACIÓN
  'SOP-TI-01': {
    shortPrompt: 'Evidencia de mantenimiento preventivo y backups TI',
    detailedInstruction: 'Cargue las actas de mantenimiento preventivo a servidores, switches y las bitácoras de verificación de respaldos (backups).',
    mandatoryItemName: 'Acta de mantenimiento y bitácora de backups',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-TI-02': {
    shortPrompt: 'Evidencia de atención de requerimientos y tickets TI',
    detailedInstruction: 'Cargue el reporte consolidado de la mesa de ayuda con los tickets resueltos oportunamente y encuestas de servicio.',
    mandatoryItemName: 'Reporte de tickets resueltos TI',
    recommendedFormats: 'PDF o PNG'
  },

  // CONTABILIDAD Y TRIBUTACIÓN
  'SOP-CON-01': {
    shortPrompt: 'Evidencia de declaración y pago de impuestos SUNAT',
    detailedInstruction: 'Cargue las constancias de presentación y pago electrónico de declaraciones juradas mensuales SUNAT (PDT / SIRE).',
    mandatoryItemName: 'Constancias de presentación SUNAT',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-CON-02': {
    shortPrompt: 'Evidencia de presentación de Estados Financieros',
    detailedInstruction: 'Cargue el cargo de entrega de los Estados Financieros mensuales firmados por el Contador General y Gerencia.',
    mandatoryItemName: 'Estados Financieros firmados',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-CON-03': {
    shortPrompt: 'Evidencia de tomas de inventario físico',
    detailedInstruction: 'Cargue las actas de toma de inventario físico de almacenes de repuestos y PT suscritas por la comisión verificadora.',
    mandatoryItemName: 'Acta de inventario físico firmado',
    recommendedFormats: 'PDF o PNG'
  },

  // GESTIÓN LEGAL
  'SOP-LEG-01': {
    shortPrompt: 'Evidencia de cumplimiento de matriz legal',
    detailedInstruction: 'Cargue la matriz de evaluación y cumplimiento de requisitos legales ambientales, laborales y de seguridad actualizada.',
    mandatoryItemName: 'Matriz de requisitos legales actualizada',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-LEG-02': {
    shortPrompt: 'Evidencia de atención a requerimientos de autoridades',
    detailedInstruction: 'Cargue los cargos de respuesta oficial a notificaciones o requerimientos de entidades fiscalizadoras (SUNAFIL, OEFA, etc.).',
    mandatoryItemName: 'Cargos de respuesta a autoridades',
    recommendedFormats: 'PDF o PNG'
  },
  'SOP-LEG-03': {
    shortPrompt: 'Evidencia de resolución de controversias legales',
    detailedInstruction: 'Cargue los acuerdos transaccionales, resoluciones de cierre o actas de conciliación de controversias legales resueltas.',
    mandatoryItemName: 'Acta de resolución o conciliación legal',
    recommendedFormats: 'PDF o PNG'
  }
};

/**
 * Returns customized requirement instructions for any KPI
 */
export function getEvidenceRequirement(kpi: KPIDefinition): EvidenceRequirement {
  if (EVIDENCE_MAP[kpi.code]) {
    return EVIDENCE_MAP[kpi.code];
  }

  // Fallback derived from KPI definition
  const variableLabel = kpi.variables[0]?.label || kpi.name;
  return {
    shortPrompt: `Evidencia obligatoria de ${variableLabel}`,
    detailedInstruction: `Cargue la documentación oficial de respaldo correspondiente a ${variableLabel}, conforme a la fuente técnica establecida: ${kpi.sourceOfData}.`,
    mandatoryItemName: `Respaldo documental de ${kpi.code}`,
    recommendedFormats: 'PDF o PNG'
  };
}
