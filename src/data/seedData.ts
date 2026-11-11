/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Datos maestros y semillero histórico extraído de:
 * LIMONES PIURANOS S.A.C. · PLAN DE MONITOREO DE PROCESOS 2026 · LP-SIG-FR-011 V.04
 * Responsable de Seguimiento: Ing. Mario Armijos Llontop
 */

import {
  ProcessDefinition,
  OperationalLineDefinition,
  UserAccount,
  KPIDefinition,
  MonthlyRecord,
  ComplianceStatus,
  AuditLogEntry
} from '../types/sig';
import { REAL_EVIDENCE_INPUTS } from './realEvidenceData';

export const OPERATIONAL_LINES: OperationalLineDefinition[] = [
  {
    id: 'JUGOS_TROPICALES',
    name: 'Jugos Tropicales',
    description: 'Procesamiento de Mango, Maracuyá y Piña en presentaciones NFC y Concentrado.',
    maxUsers: 3
  },
  {
    id: 'CITRICOS',
    name: 'Cítricos (Limón)',
    description: 'Extracción de Jugo, Aceite Esencial y Cáscara de Limón sutil.',
    maxUsers: 3
  },
  {
    id: 'FRUTA_FRESCA',
    name: 'Fruta Fresca',
    description: 'Selección, empaque y despacho de fruta fresca para exportación.',
    maxUsers: 3
  }
];

export const PROCESSES: ProcessDefinition[] = [
  // ESTRATÉGICOS
  {
    id: 'proc_alta_direccion',
    name: 'Alta Dirección',
    category: 'ESTRATEGICO',
    description: 'Dirección estratégica institucional y cumplimiento de objetivos integrados.',
    defaultResponsible: 'Lic. Miguel Fossa Villar'
  },
  {
    id: 'proc_comercial',
    name: 'Gestión Comercial',
    category: 'ESTRATEGICO',
    description: 'Satisfacción del cliente internacional y requisitos de seguridad BASC.',
    defaultResponsible: 'Ing. Lissy Robles Taboada'
  },
  {
    id: 'proc_sig',
    name: 'Gestión SIG',
    category: 'ESTRATEGICO',
    description: 'Gestión integral de Calidad ISO 9001, BRCGs, Gestión Ambiental y SST.',
    defaultResponsible: 'Ing. Mario Armijos Llontop'
  },
  {
    id: 'proc_id',
    name: 'Gestión de Investigación y Desarrollo',
    category: 'ESTRATEGICO',
    description: 'Desarrollo de nuevos productos, formulaciones y optimización de valor.',
    defaultResponsible: 'Ing. Víctor Batallanos Condori'
  },

  // OPERATIVOS
  {
    id: 'proc_acopio',
    name: 'Gestión de Acopio',
    category: 'OPERATIVO',
    description: 'Recepción, evaluación de calidad y concientización SIG de proveedores agrícolas.',
    defaultResponsible: 'Ing. Paúl Carmen Burgos'
  },
  {
    id: 'proc_citricos_jugos',
    name: 'Gestión de Cítricos y Jugos Tropicales',
    category: 'OPERATIVO',
    description: 'Operación de líneas de producción industrial (Jugos Tropicales y Cítricos).',
    defaultResponsible: 'Ing. Edwin J Gomero Farías / Ing. Jesús Quicaña Torres',
    hasOperationalLines: true
  },
  {
    id: 'proc_fruta_fresca',
    name: 'Fruto Fresco',
    category: 'OPERATIVO',
    description: 'Rendimiento y conformidad de línea de empaque de fruta fresca.',
    defaultResponsible: 'Ing. Néstor Santamaría Ato',
    hasOperationalLines: true
  },
  {
    id: 'proc_calidad',
    name: 'Aseguramiento de la Calidad',
    category: 'OPERATIVO',
    description: 'Control de producto conforme, inocuidad alimentaria y gestión de reclamos.',
    defaultResponsible: 'Aseguramiento de la Calidad'
  },
  {
    id: 'proc_almacen_pt',
    name: 'Almacenamiento de Producto Terminado',
    category: 'OPERATIVO',
    description: 'Condiciones de custodia segura, inocuidad y control de stock de PT.',
    defaultResponsible: 'Almacén de Producto Terminado'
  },
  {
    id: 'proc_envasado',
    name: 'Envasado y Etiquetado',
    category: 'OPERATIVO',
    description: 'Inspección de rotulado, hermeticidad y conformidad de envasado.',
    defaultResponsible: 'Envasado y Etiquetado'
  },
  {
    id: 'proc_embarque',
    name: 'Gestión del Embarque',
    category: 'OPERATIVO',
    description: 'Inspección de contenedores, precintos de seguridad BASC y despacho conforme.',
    defaultResponsible: 'Gestión del Embarque'
  },

  // SOPORTE
  {
    id: 'proc_rrhh',
    name: 'Gestión de Recursos Humanos',
    category: 'SOPORTE',
    description: 'Competencias, retención de personal, evaluación de desempeño y seguridad laboral.',
    defaultResponsible: 'Jorge Núñez Mendoza'
  },
  {
    id: 'proc_seg_fisica',
    name: 'Gestión de Seguridad Física',
    category: 'SOPORTE',
    description: 'Control de accesos, inspecciones patrimoniales y simulacros de contingencia BASC.',
    defaultResponsible: 'Jorge Infante Pollack'
  },
  {
    id: 'proc_mantenimiento',
    name: 'Gestión de Mantenimientos y Proyectos',
    category: 'SOPORTE',
    description: 'Mantenimiento preventivo, correctivo y eficacia de órdenes de trabajo (OT).',
    defaultResponsible: 'Ing. Guillermo Robles Rangel'
  },
  {
    id: 'proc_logistica',
    name: 'Gestión de Logística, Compras y Almacén',
    category: 'SOPORTE',
    description: 'Evaluación de proveedores seguros, atención de requerimientos e inventarios.',
    defaultResponsible: 'Sebastián Jara Ramos'
  },
  {
    id: 'proc_legal',
    name: 'Gestión Legal',
    category: 'SOPORTE',
    description: 'Monitoreo de requisitos legales, atención a autoridades y resolución de controversias.',
    defaultResponsible: 'Lic. Mayra López Castillo'
  },
  {
    id: 'proc_ti',
    name: 'Gestión de TI',
    category: 'SOPORTE',
    description: 'Copias de seguridad de datos, infraestructura informática y actualización de software.',
    defaultResponsible: 'Ing. Alex Díaz Sipion'
  },
  {
    id: 'proc_contabilidad',
    name: 'Gestión de Contabilidad y Tributación',
    category: 'SOPORTE',
    description: 'Declaraciones juradas a tiempo, auditoría tributaria y estados financieros.',
    defaultResponsible: 'CPC Pedro Mendieta Inga'
  }
];

export const INITIAL_USERS: UserAccount[] = [
  // ADMINISTRADOR GENERAL & GESTIÓN SIG (Acceso Total y Gestión de SIG)
  {
    id: 'usr_admin',
    email: 'siglimonespiuranos@gmail.com',
    name: 'Ing. Mario Armijos Llontop (Gestión SIG)',
    role: 'ADMIN',
    pin: '9001',
    processIds: PROCESSES.map(p => p.id),
    active: true
  },

  // ESTRATÉGICOS
  {
    id: 'usr_alta_direccion',
    email: 'altadireccion@gmail.com',
    name: 'Lic. Miguel Fossa Villar (Alta Dirección)',
    role: 'STRATEGIC_USER',
    pin: '9002',
    processIds: ['proc_alta_direccion'],
    active: true
  },
  {
    id: 'usr_comercial',
    email: 'comercial@limonespiuranos.com',
    name: 'Ing. Lissy Robles Taboada (Gestión Comercial)',
    role: 'STRATEGIC_USER',
    pin: '9003',
    processIds: ['proc_comercial'],
    active: true
  },
  {
    id: 'usr_id',
    email: 'id@limonespiuranos.com',
    name: 'Ing. Víctor Batallanos Condori (Gestión I&D)',
    role: 'STRATEGIC_USER',
    pin: '9004',
    processIds: ['proc_id'],
    active: true
  },

  // OPERATIVOS: PROCESO ACOPIO Y LAS 3 LÍNEAS OPERATIVAS INTERCONECTADAS
  {
    id: 'usr_acopio',
    email: 'acopio@limonespiuranos.com',
    name: 'Ing. Paúl Carmen Burgos (Gestión de Acopio)',
    role: 'OPERATIONAL_USER',
    pin: '9005',
    processIds: ['proc_acopio'],
    active: true
  },
  {
    id: 'usr_jugostropicales',
    email: 'jugostropicales@limonespiuranos.com',
    name: 'Ing. Edwin J Gomero Farías (Jugos Tropicales)',
    role: 'OPERATIONAL_USER',
    pin: '9006',
    processIds: ['proc_citricos_jugos', 'proc_calidad', 'proc_envasado', 'proc_almacen_pt', 'proc_embarque'],
    operationalLineId: 'JUGOS_TROPICALES',
    active: true
  },
  {
    id: 'usr_citricos',
    email: 'citricos@limonespiuranos.com',
    name: 'Ing. Jesús Quicaña Torres (Cítricos)',
    role: 'OPERATIONAL_USER',
    pin: '9007',
    processIds: ['proc_citricos_jugos', 'proc_calidad', 'proc_envasado', 'proc_almacen_pt', 'proc_embarque'],
    operationalLineId: 'CITRICOS',
    active: true
  },
  {
    id: 'usr_frutafresca',
    email: 'frutafresca@limonespiuranos.com',
    name: 'Ing. Néstor Santamaría Ato (Fruto Fresco)',
    role: 'OPERATIONAL_USER',
    pin: '9008',
    processIds: ['proc_fruta_fresca', 'proc_calidad', 'proc_envasado', 'proc_almacen_pt', 'proc_embarque'],
    operationalLineId: 'FRUTA_FRESCA',
    active: true
  },

  // SOPORTE
  {
    id: 'usr_rrhh',
    email: 'rrhh@limonespiuranos.com',
    name: 'Jorge Núñez Mendoza (Gestión de RRHH)',
    role: 'SUPPORT_USER',
    pin: '9009',
    processIds: ['proc_rrhh'],
    active: true
  },
  {
    id: 'usr_seg_fisica',
    email: 'seguridad@limonespiuranos.com',
    name: 'Jorge Infante Pollack (Gestión Seguridad Física)',
    role: 'SUPPORT_USER',
    pin: '9010',
    processIds: ['proc_seg_fisica'],
    active: true
  },
  {
    id: 'usr_mantenimiento',
    email: 'mantenimiento@limonespiuranos.com',
    name: 'Ing. Guillermo Robles Rangel (Gestión Mtto y Proyectos)',
    role: 'SUPPORT_USER',
    pin: '9011',
    processIds: ['proc_mantenimiento'],
    active: true
  },
  {
    id: 'usr_logistica',
    email: 'logistica@limonespiuranos.com',
    name: 'Sebastián Jara Ramos (Logística, Compras y Almacén)',
    role: 'SUPPORT_USER',
    pin: '9012',
    processIds: ['proc_logistica'],
    active: true
  },
  {
    id: 'usr_legal',
    email: 'legal@limonespiuranos.com',
    name: 'Lic. Mayra López Castillo (Gestión Legal)',
    role: 'SUPPORT_USER',
    pin: '9013',
    processIds: ['proc_legal'],
    active: true
  },
  {
    id: 'usr_ti',
    email: 'ti@limonespiuranos.com',
    name: 'Ing. Alex Díaz Sipion (Gestión de la TI)',
    role: 'SUPPORT_USER',
    pin: '9014',
    processIds: ['proc_ti'],
    active: true
  },
  {
    id: 'usr_contabilidad',
    email: 'contabilidad@limonespiuranos.com',
    name: 'CPC Pedro Mendieta Inga (Contabilidad y Tributación)',
    role: 'SUPPORT_USER',
    pin: '9015',
    processIds: ['proc_contabilidad'],
    active: true
  }
];

// Helper to compute standard ratio x 100
const standardRatioTimes100 = (inputs: Record<string, number>): number => {
  const num = inputs.numerador ?? 0;
  const den = inputs.denominador ?? 0;
  if (den === 0) return 0;
  return Number(((num / den) * 100).toFixed(1));
};

export const KPIS: KPIDefinition[] = [
  // ESTRATÉGICOS: ALTA DIRECCIÓN
  {
    id: 'kpi_ad_01',
    code: 'EST-AD-01',
    processId: 'proc_alta_direccion',
    name: '% Cumplimiento de objetivos de todas las áreas',
    objective: 'Evaluar el logro de las metas institucionales de todos los procesos del SIG.',
    formulaDescription: '(# metas cumplidas / # metas planteadas) x 100',
    unit: '%',
    targetValue: 90.0,
    operator: '>=',
    warningTolerance: 5.0, // 85% a 89.9% es amarillo
    frequency: 'MENSUAL',
    sourceOfData: 'Reportes de desempeño de procesos y actas de revisión gerencial',
    responsibleTitle: 'Gerencia General / SIG',
    variables: [
      { key: 'numerador', label: 'Metas cumplidas en el mes', unit: 'metas' },
      { key: 'denominador', label: 'Total de metas planteadas en el mes', unit: 'metas' }
    ],
    computeResult: standardRatioTimes100
  },

  // ESTRATÉGICOS: GESTIÓN COMERCIAL
  {
    id: 'kpi_gc_01',
    code: 'EST-GC-01',
    processId: 'proc_comercial',
    name: '% Clientes satisfechos',
    objective: 'Medir el nivel de satisfacción y fidelidad de los clientes de exportación y locales.',
    formulaDescription: '(# Clientes satisfechos / # total clientes) x 100',
    unit: '%',
    targetValue: 85.0,
    operator: '>',
    warningTolerance: 5.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Encuestas y evaluaciones semestrales/mensuales de satisfacción de clientes',
    responsibleTitle: 'Jefatura Comercial',
    variables: [
      { key: 'numerador', label: 'N° de clientes satisfechos', unit: 'clientes' },
      { key: 'denominador', label: 'Total de clientes encuestados/evaluados', unit: 'clientes' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_gc_02',
    code: 'EST-GC-02',
    processId: 'proc_comercial',
    name: '% Clientes Seguros (BASC)',
    objective: 'Garantizar la verificación de requisitos de seguridad en la cadena de suministro BASC.',
    formulaDescription: '(# clientes críticos con req. seguridad / # total clientes críticos) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Fichas de validación de asociados de negocio y debida diligencia BASC',
    responsibleTitle: 'Jefatura Comercial / Oficial BASC',
    variables: [
      { key: 'numerador', label: 'Clientes críticos con requisitos de seguridad', unit: 'clientes' },
      { key: 'denominador', label: 'Total clientes críticos de la cartera', unit: 'clientes' }
    ],
    computeResult: standardRatioTimes100
  },

  // ESTRATÉGICOS: GESTIÓN SIG
  {
    id: 'kpi_sig_01',
    code: 'EST-SIG-01',
    processId: 'proc_sig',
    name: '% Cumplimiento Prog. Auditorías',
    objective: 'Monitorear la ejecución del programa anual de auditorías internas de calidad y seguridad.',
    formulaDescription: '(N° auditorías ejecutadas / N° auditorías programadas) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 10.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Programa anual de auditorías internas y registros de ejecución SIG',
    responsibleTitle: 'Ing. Mario Armijos Llontop (Líder SIG)',
    variables: [
      { key: 'numerador', label: 'Auditorías ejecutadas en el periodo', unit: 'auditorías' },
      { key: 'denominador', label: 'Auditorías programadas en el periodo', unit: 'auditorías' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_sig_02',
    code: 'EST-SIG-02',
    processId: 'proc_sig',
    name: 'Índice de Residuos gestionados correctamente',
    objective: 'Garantizar el manejo ambiental responsable de residuos sólidos generados en planta.',
    formulaDescription: '(# total de residuo gestionado correctamente / # total de residuo generado) x 100',
    unit: '%',
    targetValue: 95.0, // Corregido: la errata de PDF dice "< 95%" pero 100% cumple meta verde
    operator: '>=',
    warningTolerance: 5.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Manifiestos de residuos sólidos, guías EO-RS y bitácora ambiental',
    responsibleTitle: 'Supervisor SIG - Ambiental',
    notes: 'Nota: En el formato físico figura "< 95%" por errata de edición; el estándar de gestión ambiental de Limones Piuranos exige ≥ 95%.',
    variables: [
      { key: 'numerador', label: 'Residuos gestionados correctamente', unit: 'kg / m3' },
      { key: 'denominador', label: 'Total de residuos generados', unit: 'kg / m3' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_sig_03',
    code: 'EST-SIG-03',
    processId: 'proc_sig',
    name: 'Cumplimiento plan capacitación SST',
    objective: 'Asegurar la capacitación obligatoria en Seguridad y Salud en el Trabajo.',
    formulaDescription: '(N° capacitaciones realizadas / N° programadas) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 10.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Plan Anual de Capacitación SST y listas de asistencia registradas',
    responsibleTitle: 'Supervisor SIG - SST',
    variables: [
      { key: 'numerador', label: 'Capacitaciones SST realizadas', unit: 'sesiones' },
      { key: 'denominador', label: 'Capacitaciones programadas en el plan', unit: 'sesiones' }
    ],
    computeResult: standardRatioTimes100
  },

  // ESTRATÉGICOS: INVESTIGACIÓN Y DESARROLLO (I&D)
  {
    id: 'kpi_id_01',
    code: 'EST-ID-01',
    processId: 'proc_id',
    name: 'Eficacia del diseño',
    objective: 'Verificar la conformidad de los nuevos desarrollos agroindustriales y de proceso.',
    formulaDescription: '(N° desarrollos conformes / N° total desarrollos evaluados) x 100',
    unit: '%',
    targetValue: 95.0,
    operator: '>=',
    warningTolerance: 5.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Informes de validación de nuevos productos y ensayos piloto',
    responsibleTitle: 'Jefatura de I&D',
    variables: [
      { key: 'numerador', label: 'Desarrollos conformes aprobados', unit: 'proyectos' },
      { key: 'denominador', label: 'Total desarrollos evaluados', unit: 'proyectos' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_id_02',
    code: 'EST-ID-02',
    processId: 'proc_id',
    name: 'Índice de innovación',
    objective: 'Monitorear la participación de ventas provenientes de productos nuevos.',
    formulaDescription: '(% de Ventas anuales provenientes de productos nuevos)',
    unit: '%',
    targetValue: 5.0,
    operator: '>=',
    warningTolerance: 1.0,
    frequency: 'ANUAL',
    sourceOfData: 'Reporte financiero anual de ventas por línea de producto',
    responsibleTitle: 'Jefatura de I&D / Comercial',
    variables: [
      { key: 'numerador', label: 'Ventas de productos nuevos', unit: 'USD' },
      { key: 'denominador', label: 'Ventas anuales totales', unit: 'USD' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_id_03',
    code: 'EST-ID-03',
    processId: 'proc_id',
    name: 'Cumplimiento de tiempo de desarrollo',
    objective: 'Asegurar que los proyectos de desarrollo se concluyan dentro del cronograma previsto.',
    formulaDescription: '(N° de proyectos cerrados dentro del plazo objetivo / N° total de proyectos cerrados) × 100',
    unit: '%',
    targetValue: 80.0,
    operator: '>',
    warningTolerance: 5.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Cronogramas de proyectos I&D en actas de cierre',
    responsibleTitle: 'Jefatura de I&D',
    variables: [
      { key: 'numerador', label: 'Proyectos cerrados a tiempo', unit: 'proyectos' },
      { key: 'denominador', label: 'Total de proyectos concluidos', unit: 'proyectos' }
    ],
    computeResult: standardRatioTimes100
  },

  // OPERATIVOS: GESTIÓN DE ACOPIO
  {
    id: 'kpi_aco_01',
    code: 'OPE-ACO-01',
    processId: 'proc_acopio',
    name: '% Materia prima conforme',
    objective: 'Garantizar que la materia prima recibida (limón, maracuyá, mango, piña) cumpla las especificaciones técnicas.',
    formulaDescription: '(MP conforme / MP recibida) x 100',
    unit: '%',
    targetValue: 98.0,
    operator: '>=',
    warningTolerance: 2.0, // 96.0% a 97.9% en amarillo
    frequency: 'MENSUAL',
    sourceOfData: 'Boletas de recepción y control de calidad en balanza / mesa de inspección',
    responsibleTitle: 'Jefatura de Acopio',
    variables: [
      { key: 'numerador', label: 'Materia prima conforme (kg/ton)', unit: 'kg' },
      { key: 'denominador', label: 'Total de materia prima recibida', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_aco_02',
    code: 'OPE-ACO-02',
    processId: 'proc_acopio',
    name: '% Proveedores concientizados SIG',
    objective: 'Asegurar la capacitación y concientización en normas SIG y BASC a los proveedores agrícolas.',
    formulaDescription: '(Proveedores conc. en SIG / Total proveedores aprobados) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 5.0, // 95% a 99.9% en alerta
    frequency: 'MENSUAL',
    sourceOfData: 'Padrón de proveedores agrícolas aprobados y listas de concientización',
    responsibleTitle: 'Jefatura de Acopio',
    variables: [
      { key: 'numerador', label: 'Proveedores concientizados en SIG', unit: 'proveedores' },
      { key: 'denominador', label: 'Total de proveedores aprobados activos', unit: 'proveedores' }
    ],
    computeResult: standardRatioTimes100
  },

  // OPERATIVOS: GESTIÓN DEL EMBARQUE
  {
    id: 'kpi_emb_01',
    code: 'OPE-EMB-01',
    processId: 'proc_embarque',
    name: 'Despachos seguros y conformes al cliente',
    objective: 'Asegurar la integridad de la carga marítima/terrestre, precintado y cero contaminación.',
    formulaDescription: '(Despachos seguros y conformes / Total despachos) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 1.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Listas de inspección de contenedores de exportación y reportes de precintado',
    responsibleTitle: 'Jefatura de Embarque y Exportaciones',
    variables: [
      { key: 'numerador', label: 'Despachos seguros y conformes', unit: 'despachos' },
      { key: 'denominador', label: 'Total de despachos del periodo', unit: 'despachos' }
    ],
    computeResult: standardRatioTimes100
  },

  // OPERATIVOS: LÍNEA FRUTA FRESCA
  {
    id: 'kpi_ff_01',
    code: 'OPE-FF-01',
    processId: 'proc_fruta_fresca',
    operationalLineId: 'FRUTA_FRESCA',
    name: 'Rendimiento de materia prima (Fruta Fresca)',
    objective: 'Maximizar el aprovechamiento de fruta fresca apta para exportación sobre la fruta recibida.',
    formulaDescription: '(T producto terminado / T recibidas) x 100',
    unit: '%',
    targetValue: 95.0,
    operator: '>',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Reportes de pesaje de empaque de fruta fresca y kardex de producción',
    responsibleTitle: 'Supervisor de Línea Fruta Fresca',
    variables: [
      { key: 'numerador', label: 'Toneladas de producto terminado empacado', unit: 'TM' },
      { key: 'denominador', label: 'Toneladas recibidas en planta', unit: 'TM' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_ff_02',
    code: 'OPE-FF-02',
    processId: 'proc_fruta_fresca',
    operationalLineId: 'FRUTA_FRESCA',
    name: 'Producto conforme y seguro (Fruta Fresca)',
    objective: 'Garantizar que los lotes de fruta fresca cumplan los estándares de exportación fitosanitarios y de inocuidad.',
    formulaDescription: '(T producto conforme / Total PT) x 100',
    unit: '%',
    targetValue: 95.0,
    operator: '>',
    warningTolerance: 3.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Certificados de inspección de calidad final y despachos liberados',
    responsibleTitle: 'Control de Calidad / Fruta Fresca',
    variables: [
      { key: 'numerador', label: 'Toneladas de producto conforme liberado', unit: 'TM' },
      { key: 'denominador', label: 'Total toneladas de producto terminado', unit: 'TM' }
    ],
    computeResult: standardRatioTimes100
  },

  // OPERATIVOS: LÍNEA JUGOS TROPICALES
  {
    id: 'kpi_jug_mango_nfc',
    code: 'OPE-JUG-01',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'JUGOS_TROPICALES',
    name: 'Rendimiento pulpa Mango NFC',
    objective: 'Monitorear la eficiencia de extracción de pulpa de Mango no concentrado (NFC).',
    formulaDescription: '(Kg pulpa / Kg fruta procesada) x 100 (MANGO NFC)',
    unit: '%',
    targetValue: 50.0,
    operator: '>=',
    warningTolerance: 3.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Partes diarios de producción industrial de jugos y extracción',
    responsibleTitle: 'Jefe de Planta / Supervisor Jugos Tropicales',
    variables: [
      { key: 'numerador', label: 'Kg de pulpa obtenida Mango NFC', unit: 'kg' },
      { key: 'denominador', label: 'Kg de fruta procesada', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_jug_mango_conc',
    code: 'OPE-JUG-02',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'JUGOS_TROPICALES',
    name: 'Rendimiento pulpa Mango Conc.',
    objective: 'Monitorear el rendimiento de evaporación y concentración de Mango.',
    formulaDescription: '(Kg pulpa / Kg fruta procesada) x 100 (MANGO CONC.)',
    unit: '%',
    targetValue: 30.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Partes de concentración y evaporación industrial',
    responsibleTitle: 'Supervisor Jugos Tropicales',
    variables: [
      { key: 'numerador', label: 'Kg de pulpa Mango Concentrado', unit: 'kg' },
      { key: 'denominador', label: 'Kg de fruta procesada', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_jug_maracuya_nfc',
    code: 'OPE-JUG-03',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'JUGOS_TROPICALES',
    name: 'Rendimiento pulpa Maracuyá NFC',
    objective: 'Evaluar el ratio de despulpadora en la línea de Maracuyá simple.',
    formulaDescription: '(Kg pulpa / Kg fruta procesada) x 100 (MARACUYÁ NFC)',
    unit: '%',
    targetValue: 28.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Balance de masa de despulpado en planta',
    responsibleTitle: 'Supervisor Jugos Tropicales',
    variables: [
      { key: 'numerador', label: 'Kg pulpa Maracuyá NFC', unit: 'kg' },
      { key: 'denominador', label: 'Kg fruta ingresada a proceso', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_jug_maracuya_conc',
    code: 'OPE-JUG-04',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'JUGOS_TROPICALES',
    name: 'Rendimiento de pulpa/jugo - Maracuyá Conc.',
    objective: 'Monitorear la obtención de Maracuyá Concentrado conforme a especificaciones Brix.',
    formulaDescription: '(Kg pulpa / Kg fruta procesada) x 100 (MARACUYÁ CONC.)',
    unit: '%',
    targetValue: 6.0,
    operator: '>=',
    warningTolerance: 0.5,
    frequency: 'MENSUAL',
    sourceOfData: 'Partes de producción y evaporación de maracuyá',
    responsibleTitle: 'Supervisor Jugos Tropicales',
    variables: [
      { key: 'numerador', label: 'Kg concentrado de maracuyá', unit: 'kg' },
      { key: 'denominador', label: 'Kg fruta procesada', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_jug_pina_nfc',
    code: 'OPE-JUG-05',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'JUGOS_TROPICALES',
    name: 'Rendimiento pulpa Piña NFC',
    objective: 'Evaluar el rendimiento en la línea de despulpado de Piña.',
    formulaDescription: '(Kg pulpa / Kg fruta procesada) x 100 (PIÑA NFC)',
    unit: '%',
    targetValue: 41.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Balance de materia prima en despulpado de piña',
    responsibleTitle: 'Supervisor Jugos Tropicales',
    variables: [
      { key: 'numerador', label: 'Kg pulpa Piña NFC', unit: 'kg' },
      { key: 'denominador', label: 'Kg piña procesada', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_jug_pina_conc',
    code: 'OPE-JUG-06',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'JUGOS_TROPICALES',
    name: 'Rendimiento pulpa Piña Conc.',
    objective: 'Evaluar el concentrado de Piña obtenido.',
    formulaDescription: '(Kg pulpa / Kg fruta procesada) x 100 (PIÑA CONC.)',
    unit: '%',
    targetValue: 8.0,
    operator: '>=',
    warningTolerance: 0.5,
    frequency: 'MENSUAL',
    sourceOfData: 'Partes de producción de evaporación de piña',
    responsibleTitle: 'Supervisor Jugos Tropicales',
    variables: [
      { key: 'numerador', label: 'Kg piña concentrada', unit: 'kg' },
      { key: 'denominador', label: 'Kg fruta procesada', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },

  // OPERATIVOS: LÍNEA CÍTRICOS (LIMÓN)
  {
    id: 'kpi_cit_aceite',
    code: 'OPE-CIT-01',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'CITRICOS',
    name: 'Rendimiento Aceite Esencial (Limón)',
    objective: 'Monitorear la extracción y centrifugado de Aceite Esencial de Limón sutil.',
    formulaDescription: '(Kg Aceite / Kg fruta procesada) x 100 (ACEITE)',
    unit: '%',
    targetValue: 0.3,
    operator: '>=',
    warningTolerance: 0.05,
    frequency: 'MENSUAL',
    sourceOfData: 'Kardex de extracción y centrifugación de aceites cítricos',
    responsibleTitle: 'Supervisor Línea Cítricos',
    variables: [
      { key: 'numerador', label: 'Kg de aceite esencial destilado/centrifugado', unit: 'kg' },
      { key: 'denominador', label: 'Kg de limón procesado en molienda', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_cit_cascara',
    code: 'OPE-CIT-02',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'CITRICOS',
    name: 'Rendimiento Cáscara Deshidratada (Limón)',
    objective: 'Monitorear la recuperación de cáscara para secado y exportación de pectina.',
    formulaDescription: '(Kg Cáscara / Kg fruta procesada) x 100 (CÁSCARA)',
    unit: '%',
    targetValue: 6.0,
    operator: '>=',
    warningTolerance: 0.3,
    frequency: 'MENSUAL',
    sourceOfData: 'Partes de prensado y secado de cáscara de limón',
    responsibleTitle: 'Supervisor Línea Cítricos',
    variables: [
      { key: 'numerador', label: 'Kg cáscara obtenida', unit: 'kg' },
      { key: 'denominador', label: 'Kg de limón ingresado a proceso', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_cit_jugo',
    code: 'OPE-CIT-03',
    processId: 'proc_citricos_jugos',
    operationalLineId: 'CITRICOS',
    name: 'Rendimiento Jugo de Limón',
    objective: 'Monitorear el rendimiento de prensas y filtros de jugo clarificado/turbio de limón.',
    formulaDescription: '(Kg jugo / Kg fruta procesada) x 100 (JUGO)',
    unit: '%',
    targetValue: 3.5,
    operator: '>=',
    warningTolerance: 0.5,
    frequency: 'MENSUAL',
    sourceOfData: 'Partes de extracción de jugo y almacenamiento en tanques',
    responsibleTitle: 'Supervisor Línea Cítricos',
    variables: [
      { key: 'numerador', label: 'Kg jugo de limón obtenido', unit: 'kg' },
      { key: 'denominador', label: 'Kg limón procesado', unit: 'kg' }
    ],
    computeResult: standardRatioTimes100
  },

  // OPERATIVOS: ASEGURAMIENTO DE LA CALIDAD
  {
    id: 'kpi_cal_01',
    code: 'OPE-CAL-01',
    processId: 'proc_calidad',
    name: 'Índice de Producto Conforme',
    objective: 'Garantizar que todo el producto terminado liberado cumpla con los estándares de calidad.',
    formulaDescription: '(Cantidad producto conforme / Total PT) x 100',
    unit: '%',
    targetValue: 98.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Registros de liberación de lotes por Control de Calidad',
    responsibleTitle: 'Jefe de Control de Calidad',
    variables: [
      { key: 'numerador', label: 'Volumen/peso de producto conforme', unit: 'TM' },
      { key: 'denominador', label: 'Total de producto terminado inspeccionado', unit: 'TM' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_cal_02',
    code: 'OPE-CAL-02',
    processId: 'proc_calidad',
    name: 'Eficacia de Inocuidad (Reclamos)',
    objective: 'Monitorear reclamos de clientes relacionados con inocuidad o especificaciones.',
    formulaDescription: '(N° reclamos / Total pedidos entregados) x 100',
    unit: '%',
    targetValue: 1.0,
    operator: '<=',
    warningTolerance: 0.5,
    frequency: 'MENSUAL',
    sourceOfData: 'Libro de Reclamaciones y registros del Comité de Quejas',
    responsibleTitle: 'Jefe de Aseguramiento de Calidad',
    variables: [
      { key: 'numerador', label: 'N° de reclamos recibidos en el mes', unit: 'reclamos' },
      { key: 'denominador', label: 'Total pedidos despachados/entregados', unit: 'pedidos' }
    ],
    computeResult: standardRatioTimes100
  },

  // OPERATIVOS: ALMACENAMIENTO DE PRODUCTO TERMINADO
  {
    id: 'kpi_alm_01',
    code: 'OPE-ALM-01',
    processId: 'proc_almacen_pt',
    name: '% PT almacenado seguro y conforme',
    objective: 'Garantizar el estibado correcto, cadena de frío y seguridad en cámaras y almacenes.',
    formulaDescription: '(PT almacenado seguro / Total PT almacenado) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 1.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Checklist de inspección diaria de cámaras y bodegas de PT',
    responsibleTitle: 'Jefe de Almacén de PT',
    variables: [
      { key: 'numerador', label: 'Paletas/lotes de PT en condiciones seguras y conformes', unit: 'paletas' },
      { key: 'denominador', label: 'Total de paletas almacenadas en el periodo', unit: 'paletas' }
    ],
    computeResult: standardRatioTimes100
  },

  // OPERATIVOS: ENVASADO Y ETIQUETADO
  {
    id: 'kpi_env_01',
    code: 'OPE-ENV-01',
    processId: 'proc_envasado',
    name: '% Producto envasado/etiquetado conforme',
    objective: 'Verificar la precisión de rotulado, loteado y cierre hermético de cilindros y cajas.',
    formulaDescription: '(# producto conforme / # total envasado y etiquetado) x 100',
    unit: '%',
    targetValue: 98.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Inspecciones de línea de rotulado y envasado',
    responsibleTitle: 'Supervisor de Envasado y Etiquetado',
    variables: [
      { key: 'numerador', label: 'Unidades envasadas y etiquetadas conformes', unit: 'unid' },
      { key: 'denominador', label: 'Total unidades envasadas y rotuladas', unit: 'unid' }
    ],
    computeResult: standardRatioTimes100
  },

  // SOPORTE: RECURSOS HUMANOS
  {
    id: 'kpi_rrhh_01',
    code: 'SOP-RRHH-01',
    processId: 'proc_rrhh',
    name: '% Personal que cumple req. de seguridad',
    objective: 'Asegurar que el 100% del personal cuente con inducción de seguridad, EPP y verificación de antecedentes.',
    formulaDescription: '(N° trabajadores con req. seguridad / N° total trabajadores) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Legajos de personal, control de EPPs y verificación BASC',
    responsibleTitle: 'Jefatura de Gestión Humana',
    variables: [
      { key: 'numerador', label: 'Trabajadores con requisitos de seguridad al día', unit: 'personas' },
      { key: 'denominador', label: 'Total de trabajadores en planilla', unit: 'personas' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_rrhh_02',
    code: 'SOP-RRHH-02',
    processId: 'proc_rrhh',
    name: 'Índice de Rotación de Personal',
    objective: 'Mantener la estabilidad laboral del talento humano clave.',
    formulaDescription: '(N° trabajadores retirados / N° total trabajadores) x 100',
    unit: '%',
    targetValue: 5.0,
    operator: '<=',
    warningTolerance: 2.0, // 5.1% a 7.0% en amarillo
    frequency: 'MENSUAL',
    sourceOfData: 'Reportes de bajas y altas de personal en planilla',
    responsibleTitle: 'Jefatura de Gestión Humana',
    variables: [
      { key: 'numerador', label: 'Trabajadores retirados en el mes', unit: 'personas' },
      { key: 'denominador', label: 'Dotación total de trabajadores', unit: 'personas' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_rrhh_03',
    code: 'SOP-RRHH-03',
    processId: 'proc_rrhh',
    name: 'Cumplimiento de Desempeño',
    objective: 'Evaluar el rendimiento laboral y cumplimiento de competencias del personal.',
    formulaDescription: '(N° trabajadores evaluación satisfactoria / Total evaluados) x 100',
    unit: '%',
    targetValue: 90.0,
    operator: '>=',
    warningTolerance: 5.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Evaluaciones semestrales/mensuales de desempeño',
    responsibleTitle: 'Jefatura de Gestión Humana',
    variables: [
      { key: 'numerador', label: 'Trabajadores con evaluación satisfactoria', unit: 'personas' },
      { key: 'denominador', label: 'Total de trabajadores evaluados', unit: 'personas' }
    ],
    computeResult: standardRatioTimes100
  },

  // SOPORTE: SEGURIDAD FÍSICA
  {
    id: 'kpi_seg_01',
    code: 'SOP-SEG-01',
    processId: 'proc_seg_fisica',
    name: 'Eficacia de Controles de Seguridad',
    objective: 'Monitorear la no ocurrencia de incidentes patrimoniales o brechas de seguridad.',
    formulaDescription: 'Método cualitativo: listado de controles en matriz de riesgos (incidentes)',
    unit: 'incidentes',
    targetValue: 0.0,
    operator: '<=',
    warningTolerance: 1.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Cuaderno de ocurrencias de garita y reportes de seguridad patrimonial',
    responsibleTitle: 'Jefe de Seguridad y Control Patrimonial',
    variables: [
      { key: 'numerador', label: 'N° de incidentes de seguridad registrados', unit: 'incidentes' },
      { key: 'denominador', label: 'Factor base (1)', unit: 'constante', defaultValue: 1 }
    ],
    computeResult: (inputs) => inputs.numerador ?? 0
  },
  {
    id: 'kpi_seg_02',
    code: 'SOP-SEG-02',
    processId: 'proc_seg_fisica',
    name: 'Ejecución de inspecciones planificadas',
    objective: 'Cumplir con las rondas e inspecciones perimetrales y de CCTV planificadas.',
    formulaDescription: '(N° inspecciones realizadas / N° inspecciones programadas) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 5.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Cronograma de patrullaje e informes de guardia patrimonial',
    responsibleTitle: 'Jefe de Seguridad',
    variables: [
      { key: 'numerador', label: 'Inspecciones ejecutadas', unit: 'inspecciones' },
      { key: 'denominador', label: 'Inspecciones programadas', unit: 'inspecciones' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_seg_03',
    code: 'SOP-SEG-03',
    processId: 'proc_seg_fisica',
    name: 'Preparación de respuesta a emergencias y eventos críticos',
    objective: 'Ejecución de simulacros de contingencia BASC e incendios/sismos.',
    formulaDescription: '(N° de simulacros realizados / N° de simulacros programados) x100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 10.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Informes de evaluación de simulacros de la brigada de emergencia',
    responsibleTitle: 'Jefe de Seguridad Física / Brigada',
    variables: [
      { key: 'numerador', label: 'Simulacros ejecutados', unit: 'simulacros' },
      { key: 'denominador', label: 'Simulacros programados', unit: 'simulacros' }
    ],
    computeResult: standardRatioTimes100
  },

  // SOPORTE: MANTENIMIENTO
  {
    id: 'kpi_man_01',
    code: 'SOP-MAN-01',
    processId: 'proc_mantenimiento',
    name: 'Cumplimiento Programa de Mantenimiento',
    objective: 'Asegurar la ejecución de las órdenes preventivas en maquinaria crítica.',
    formulaDescription: '(N° OT realizadas / N° OT programadas) x 100',
    unit: '%',
    targetValue: 95.0,
    operator: '>=',
    warningTolerance: 3.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Software / Planilla de órdenes de trabajo de mantenimiento',
    responsibleTitle: 'Jefe de Mantenimiento',
    variables: [
      { key: 'numerador', label: 'Órdenes de trabajo ejecutadas a tiempo', unit: 'OT' },
      { key: 'denominador', label: 'Total de órdenes de trabajo programadas', unit: 'OT' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_man_02',
    code: 'SOP-MAN-02',
    processId: 'proc_mantenimiento',
    name: 'Eficacia de Atención de Solicitudes',
    objective: 'Medir la satisfacción de las áreas operativas con el servicio de mantenimiento.',
    formulaDescription: '(Solicitudes atendidas satisfact. / Total solicitudes) x 100',
    unit: '%',
    targetValue: 90.0,
    operator: '>=',
    warningTolerance: 4.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Encuestas de conformidad de entrega de máquinas intervenidas',
    responsibleTitle: 'Jefe de Mantenimiento',
    variables: [
      { key: 'numerador', label: 'Solicitudes atendidas satisfactoriamente', unit: 'solicitudes' },
      { key: 'denominador', label: 'Total solicitudes de mantenimiento recibidas', unit: 'solicitudes' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_man_03',
    code: 'SOP-MAN-03',
    processId: 'proc_mantenimiento',
    name: 'Calidad del Mantenimiento',
    objective: 'Garantizar que las reparaciones no presenten reincidencia por mala ejecución.',
    formulaDescription: '(Trabajos bien ejecutados / Total trabajos ejecutados) x 100',
    unit: '%',
    targetValue: 90.0,
    operator: '>=',
    warningTolerance: 4.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Reportes de post-inspección técnica de planta',
    responsibleTitle: 'Jefe de Mantenimiento',
    variables: [
      { key: 'numerador', label: 'Trabajos ejecutados sin fallas reincidentes', unit: 'trabajos' },
      { key: 'denominador', label: 'Total de trabajos de mantenimiento ejecutados', unit: 'trabajos' }
    ],
    computeResult: standardRatioTimes100
  },

  // SOPORTE: LOGÍSTICA / COMPRAS / ALMACÉN
  {
    id: 'kpi_log_01',
    code: 'SOP-LOG-01',
    processId: 'proc_logistica',
    name: 'Nivel de Proveedores Seguros',
    objective: 'Evaluar proveedores críticos de bienes y servicios bajo requisitos BASC.',
    formulaDescription: '(N° proveedores seguros / Total proveedores) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 3.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Padrón de proveedores evaluados en seguridad logística',
    responsibleTitle: 'Jefe de Logística y Compras',
    variables: [
      { key: 'numerador', label: 'Proveedores que cumplen estándar de seguridad BASC', unit: 'proveedores' },
      { key: 'denominador', label: 'Total de proveedores contratados/activos', unit: 'proveedores' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_log_02',
    code: 'SOP-LOG-02',
    processId: 'proc_logistica',
    name: 'Eficacia en Atención de Requerimientos OT',
    objective: 'Atender las compras y requerimientos de repuestos e insumos dentro del plazo acordado.',
    formulaDescription: '(OT atendidas en plazo / Total OT aprobadas) x 100',
    unit: '%',
    targetValue: 90.0,
    operator: '>=',
    warningTolerance: 5.0, // 85% a 89.9% en amarillo
    frequency: 'MENSUAL',
    sourceOfData: 'Sistema de compras y registro de órdenes de atención',
    responsibleTitle: 'Jefe de Logística y Compras',
    variables: [
      { key: 'numerador', label: 'Requerimientos atendidos en plazo', unit: 'órdenes' },
      { key: 'denominador', label: 'Total de requerimientos aprobados', unit: 'órdenes' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_log_03',
    code: 'SOP-LOG-03',
    processId: 'proc_logistica',
    name: 'Cumplimiento de inventarios',
    objective: 'Garantizar la exactitud de inventarios de almacén general y repuestos.',
    formulaDescription: 'N° de inventarios programados/N° de inventarios ejecutados×100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'ANUAL',
    sourceOfData: 'Actas de toma de inventario físico anual de almacenes',
    responsibleTitle: 'Jefe de Almacén General / Contabilidad',
    variables: [
      { key: 'numerador', label: 'Inventarios ejecutados', unit: 'inventarios' },
      { key: 'denominador', label: 'Inventarios programados', unit: 'inventarios' }
    ],
    computeResult: standardRatioTimes100
  },

  // SOPORTE: GESTIÓN LEGAL
  {
    id: 'kpi_leg_01',
    code: 'SOP-LEG-01',
    processId: 'proc_legal',
    name: 'Índice Requisitos Legales Cumplidos',
    objective: 'Verificar el cumplimiento normativo aplicable a la industria y exportación.',
    formulaDescription: '(N° req. legales cumplidos / N° req. legales aplicables) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Matriz de identificación y evaluación de requisitos legales',
    responsibleTitle: 'Asesor Legal / SIG',
    variables: [
      { key: 'numerador', label: 'Requisitos legales cumplidos', unit: 'normas' },
      { key: 'denominador', label: 'Total requisitos legales identificados', unit: 'normas' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_leg_02',
    code: 'SOP-LEG-02',
    processId: 'proc_legal',
    name: 'Eficacia en Atención de Requerimientos de Autoridades',
    objective: 'Responder sin observaciones a requerimientos de SUNAFIL, SENASA, OEFA, SUNAT, etc.',
    formulaDescription: '(Actuaciones cerradas sin observaciones / Total de actuaciones de autoridades) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 10.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Expedientes de inspección y descargos legales',
    responsibleTitle: 'Asesoría Jurídica',
    variables: [
      { key: 'numerador', label: 'Actuaciones cerradas favorablemente', unit: 'expedientes' },
      { key: 'denominador', label: 'Total de requerimientos de autoridades', unit: 'expedientes' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_leg_03',
    code: 'SOP-LEG-03',
    processId: 'proc_legal',
    name: 'Tasa de Resolución de Conflictos/Casos',
    objective: 'Solución favorable de controversias judiciales, laborales o arbitrales.',
    formulaDescription: '(Casos cerrados o resueltos favorablemente / Total de casos activos) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 15.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Informe mensual de litigios y contingencias legales',
    responsibleTitle: 'Asesoría Jurídica',
    notes: 'Nota técnica: En el libro Excel de 2026, los periodos con 0 casos cerrados se registraron con error numérico -100%. El sistema permite ingreso formal de casos activos y cerrados para evitar anomalías de división por cero.',
    variables: [
      { key: 'numerador', label: 'Casos cerrados favorablemente', unit: 'casos' },
      { key: 'denominador', label: 'Total de casos activos en seguimiento', unit: 'casos' }
    ],
    computeResult: standardRatioTimes100
  },

  // SOPORTE: GESTIÓN TI
  {
    id: 'kpi_ti_01',
    code: 'SOP-TI-01',
    processId: 'proc_ti',
    name: 'Eficacia de Respaldo de Información (Backup)',
    objective: 'Garantizar la disponibilidad de copias de respaldo de bases de datos y sistemas críticos.',
    formulaDescription: '(N° Backups exitosos / N° Backups programados) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 2.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Logs de copias de seguridad de servidores locales y nube',
    responsibleTitle: 'Jefatura de TI',
    variables: [
      { key: 'numerador', label: 'Backups completados y verificados', unit: 'backups' },
      { key: 'denominador', label: 'Backups programados en la política', unit: 'backups' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_ti_02',
    code: 'SOP-TI-02',
    processId: 'proc_ti',
    name: 'Eficacia Actualización de Equipos',
    objective: 'Mantener actualizados parches de seguridad, antivirus y licencias de software.',
    formulaDescription: '(Equipos con software actualizado / N° Total equipos) x 100',
    unit: '%',
    targetValue: 90.0,
    operator: '>',
    warningTolerance: 5.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Inventario de activos informáticos y consola de antivirus/OS',
    responsibleTitle: 'Jefatura de TI',
    variables: [
      { key: 'numerador', label: 'Equipos con software y parches al día', unit: 'computadoras' },
      { key: 'denominador', label: 'Total equipos informáticos en inventario', unit: 'computadoras' }
    ],
    computeResult: standardRatioTimes100
  },

  // SOPORTE: CONTABILIDAD Y TRIBUTACIÓN
  {
    id: 'kpi_con_01',
    code: 'SOP-CON-01',
    processId: 'proc_contabilidad',
    name: 'Cumplimiento Obligaciones Tributarias',
    objective: 'Presentación oportuna de declaraciones mensuales ante SUNAT sin contingencias.',
    formulaDescription: '(N° declaraciones a tiempo / N° declaraciones programadas) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 1.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Constancias de presentación PDT / Declaraciones SUNAT',
    responsibleTitle: 'Contador General',
    variables: [
      { key: 'numerador', label: 'Declaraciones juradas presentadas a tiempo', unit: 'declaraciones' },
      { key: 'denominador', label: 'Total declaraciones programadas según cronograma', unit: 'declaraciones' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_con_02',
    code: 'SOP-CON-02',
    processId: 'proc_contabilidad',
    name: 'Índice de Contingencia Tributaria',
    objective: 'Aprovechamiento integral de beneficios tributarios (Drawback, saldo a favor exportador).',
    formulaDescription: '(Beneficios tributarios utilizados / Beneficios tributarios disponibles) × 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 5.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Expedientes de Drawback y devoluciones de IGV ante SUNAT',
    responsibleTitle: 'Contador General',
    variables: [
      { key: 'numerador', label: 'Beneficios tributarios efectivamente gestionados', unit: 'expedientes' },
      { key: 'denominador', label: 'Total beneficios tributarios disponibles', unit: 'expedientes' }
    ],
    computeResult: standardRatioTimes100
  },
  {
    id: 'kpi_con_03',
    code: 'SOP-CON-03',
    processId: 'proc_contabilidad',
    name: 'Cumplimiento de Obligaciones Contables/Tributarias',
    objective: 'Cierre de balances mensuales, conciliaciones y obligaciones en fecha límite.',
    formulaDescription: '(Obligaciones cumplidas en fecha / Total de obligaciones del periodo) x 100',
    unit: '%',
    targetValue: 100.0,
    operator: '>=',
    warningTolerance: 1.0,
    frequency: 'MENSUAL',
    sourceOfData: 'Cronograma interno de cierres contables y estados financieros',
    responsibleTitle: 'Contador General',
    variables: [
      { key: 'numerador', label: 'Obligaciones contables cumplidas en fecha', unit: 'obligaciones' },
      { key: 'denominador', label: 'Total obligaciones contables del periodo', unit: 'obligaciones' }
    ],
    computeResult: standardRatioTimes100
  }
];

// Helper to determine compliance status accurately
export function evaluateKPICompliance(kpi: KPIDefinition, result: number | null): ComplianceStatus {
  if (result === null || isNaN(result)) return 'SIN_DATO';

  const target = kpi.targetValue;
  const tol = kpi.warningTolerance;

  switch (kpi.operator) {
    case '>=':
      if (result >= target) return 'VERDE';
      if (result >= target - tol) return 'AMARILLO';
      return 'ROJO';

    case '>':
      if (result > target) return 'VERDE';
      if (result >= target - tol) return 'AMARILLO';
      return 'ROJO';

    case '<=':
      if (result <= target) return 'VERDE';
      if (result <= target + tol) return 'AMARILLO';
      return 'ROJO';

    case '<':
      if (result < target) return 'VERDE';
      if (result <= target + tol) return 'AMARILLO';
      return 'ROJO';

    case '==':
      if (result === target) return 'VERDE';
      return 'ROJO';

    default:
      return result >= target ? 'VERDE' : 'ROJO';
  }
}

// Exact historical numbers from document LP-SIG-FR-011 V.04 (Pages 1, 2, 3)
// Months: 2026-01 (ENE) to 2026-10 (OCT)
export interface HistoricalEntry {
  kpiId: string;
  monthlyValues: (number | null)[]; // 10 values for ENE to OCT
}

export const HISTORICAL_PDF_MATRIX: HistoricalEntry[] = [
  // Page 1 (Estratégicos y Operativos 1)
  { kpiId: 'kpi_ad_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_gc_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, null, null] }, // Set & Oct: #¡DIV/0!
  { kpiId: 'kpi_gc_02', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, null] }, // Oct: #¡DIV/0!
  { kpiId: 'kpi_sig_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_sig_02', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_sig_03', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_id_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_id_02', monthlyValues: [null, null, null, null, null, null, null, 0.0, 0.0, 0.0] }, // Anual (0.0% registrado)
  { kpiId: 'kpi_id_03', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_aco_01', monthlyValues: [98.0, 97.1, 97.2, 99.9, 100.1, 100.0, 100.0, 100.2, 100.0, 100.2] }, // Set: 100.0%, Oct: 100.2%
  { kpiId: 'kpi_aco_02', monthlyValues: [95.7, 97.1, 98.5, 97.1, 97.1, 97.1, 97.1, 97.1, 95.8, 95.8] }, // Set & Oct: 95.8% (Amarillo)
  { kpiId: 'kpi_emb_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_ff_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] }, // Rendimiento MP
  { kpiId: 'kpi_ff_02', monthlyValues: [96.3, 97.4, 96.9, 95.6, 96.2, 97.7, 97.2, 97.8, 97.6, 97.6] }, // Set & Oct: 97.6%
  { kpiId: 'kpi_jug_mango_nfc', monthlyValues: [null, null, null, null, null, null, null, null, null, null] },
  { kpiId: 'kpi_jug_mango_conc', monthlyValues: [null, null, null, null, null, null, null, null, null, null] },
  { kpiId: 'kpi_jug_maracuya_nfc', monthlyValues: [31.2, null, null, null, null, null, null, null, 28.9, 25.1] }, // Set: 28.9%, Oct: 25.1%
  { kpiId: 'kpi_jug_maracuya_conc', monthlyValues: [null, 6.6, 6.1, 7.6, null, 5.0, 6.7, 5.6, 6.3, 5.6] }, // Set: 6.3%, Oct: 5.6%

  // Page 2 (Operativos 2 y Soporte 1)
  { kpiId: 'kpi_jug_pina_nfc', monthlyValues: [45.5, null, null, null, null, null, null, null, null, null] },
  { kpiId: 'kpi_jug_pina_conc', monthlyValues: [null, null, null, null, null, null, null, null, null, null] },
  { kpiId: 'kpi_cit_aceite', monthlyValues: [0.4, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.4, 0.4] }, // Set: 0.4%, Oct: 0.4%
  { kpiId: 'kpi_cit_cascara', monthlyValues: [6.0, 5.9, 5.8, 5.8, 6.5, 6.2, 5.7, 5.9, 6.2, 6.1] }, // Set: 6.2%, Oct: 6.1%
  { kpiId: 'kpi_cit_jugo', monthlyValues: [3.5, 3.1, 2.9, 3.1, 3.4, 4.4, 3.6, 3.1, 3.2, 3.1] }, // Set: 3.2%, Oct: 3.1%
  { kpiId: 'kpi_cal_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_cal_02', monthlyValues: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] },
  { kpiId: 'kpi_alm_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_env_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_rrhh_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_rrhh_02', monthlyValues: [0.8, 1.2, 1.5, 0.7, 4.5, 1.6, 0.8, 5.5, 0.4, 0.4] }, // Set: 0.4%, Oct: 0.4%
  { kpiId: 'kpi_rrhh_03', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_seg_01', monthlyValues: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0] }, // 0 incidentes
  { kpiId: 'kpi_seg_02', monthlyValues: [null, 100.0, 100.0, null, 100.0, null, null, 100.0, null, 100.0] }, // Set: -, Oct: 100.0%
  { kpiId: 'kpi_seg_03', monthlyValues: [null, 100.0, 100.0, null, 100.0, null, null, 100.0, null, 100.0] }, // Set: -, Oct: 100.0%
  { kpiId: 'kpi_man_01', monthlyValues: [96.6, 96.5, 95.8, 96.5, 97.3, 97.3, 100.0, 95.8, null, null] }, // Set & Oct: #¡DIV/0!

  // Page 3 (Soporte 2)
  { kpiId: 'kpi_man_02', monthlyValues: [96.7, 96.3, 95.1, 95.0, 97.6, 96.4, 95.5, 98.3, null, null] }, // Set & Oct: #¡DIV/0!
  { kpiId: 'kpi_man_03', monthlyValues: [94.7, 99.1, 96.7, 94.2, 99.1, 99.0, 100.0, 100.0, 100.0, 100.0] }, // Set & Oct: 100.0%
  { kpiId: 'kpi_log_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_log_02', monthlyValues: [93.3, 90.0, 90.9, 97.1, 88.9, 85.4, 83.3, 82.4, null, null] }, // Set & Oct: #¡DIV/0!
  { kpiId: 'kpi_log_03', monthlyValues: [100.0, null, null, null, null, null, null, null, null, null] },
  { kpiId: 'kpi_leg_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_leg_02', monthlyValues: [null, null, null, null, null, null, null, null, null, null] }, // #¡VALOR!
  { kpiId: 'kpi_leg_03', monthlyValues: [-100.0, null, null, null, null, -100.0, null, null, null, null] },
  { kpiId: 'kpi_ti_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_ti_02', monthlyValues: [100.0, 98.3, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_con_01', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_con_02', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0] },
  { kpiId: 'kpi_con_03', monthlyValues: [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, null, null] } // Semestral
];

export function buildInitialMonthlyRecords(): MonthlyRecord[] {
  const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
  const records: MonthlyRecord[] = [];

  for (const hist of HISTORICAL_PDF_MATRIX) {
    const kpi = KPIS.find(k => k.id === hist.kpiId);
    if (!kpi) continue;

    hist.monthlyValues.forEach((val, idx) => {
      const period = months[idx];
      const hasValue = val !== null;

      // Extract real evidence inputs from ficha técnica if available
      let inputs: Record<string, number> = {};
      const realKpiEvidence = REAL_EVIDENCE_INPUTS[kpi.id];
      if (realKpiEvidence && realKpiEvidence[period]) {
        inputs = { ...realKpiEvidence[period] };
      } else if (hasValue) {
        if (kpi.variables.length >= 2) {
          inputs = { numerador: Number(val.toFixed(2)), denominador: 100 };
        } else {
          inputs = { numerador: val };
        }
      }

      const compliance = evaluateKPICompliance(kpi, val);

      let observation: string | undefined = undefined;
      if (!hasValue) {
        observation = 'Sin datos brindados por el dueño del proceso en este período (#¡DIV/0! en Excel de monitoreo)';
      } else if (val === -100) {
        observation = 'Valor registrado en Excel de monitoreo (0 casos resueltos en el periodo)';
      }

      records.push({
        id: `rec_${kpi.id}_${period}`,
        kpiId: kpi.id,
        period,
        inputs,
        calculatedResult: val,
        complianceStatus: compliance,
        recordStatus: hasValue ? 'VALIDADO' : 'BORRADOR',
        observations: observation,
        updatedBy: 'siglimonespiuranos@gmail.com',
        updatedAt: `${period}-28T16:00:00Z`,
        validatedBy: hasValue ? 'siglimonespiuranos@gmail.com' : undefined,
        validatedAt: hasValue ? `${period}-29T10:00:00Z` : undefined
      });
    });
  }

  return records;
}

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud_001',
    timestamp: '2026-01-05T09:00:00Z',
    userEmail: 'siglimonespiuranos@gmail.com',
    userName: 'Ing. Mario Armijos Llontop',
    action: 'CONFIG_CHANGE',
    entity: 'KPI',
    entityId: 'LP-SIG-FR-011',
    description: 'Aprobación oficial del Plan de Monitoreo de Procesos 2026 Versión 04 (ISO 9001:2015 & BASC).'
  },
  {
    id: 'aud_002',
    timestamp: '2026-07-29T18:00:00Z',
    userEmail: 'siglimonespiuranos@gmail.com',
    userName: 'Ing. Mario Armijos Llontop',
    action: 'VALIDATE',
    entity: 'PERIOD',
    entityId: '2026-07',
    description: 'Cierre y validación ejecutiva del periodo mensual Julio 2026 para presentación de auditoría interna.'
  }
];
