/**
 * RLD Calculator - Reserva de Legitimidad Dinámica
 * 
 * Calcula la cantidad de gobernanza efectiva disponible para sostener
 * la acción del sistema sin transferencia de autoridad ni colapso normativo.
 * 
 * Operacionalmente: evalúa qué módulos de gobernanza siguen activos y en qué grados.
 */

import { getDb } from '../db';
import { auditLogs } from '../../drizzle/auditLogs';
import { desc, eq, and, gte } from 'drizzle-orm';

/**
 * Estructura de evaluación de módulos de gobernanza
 */
export interface GovernanceModuleStatus {
  module: 'ARGOS' | 'LICURGO' | 'WABUN' | 'AUDIT_INTEGRITY';
  active: boolean;
  effectiveness: number; // 0.0 - 1.0
  lastActivity?: Date;
  details: string;
}

/**
 * Resultado del cálculo RLD
 */
export interface RLDCalculation {
  rld: number; // 0.0 - 1.0 (Reserva de Legitimidad Dinámica total)
  modules: GovernanceModuleStatus[];
  governanceCapacity: number; // 0.0 - 1.0 (capacidad agregada)
  transferRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; // Riesgo de transferencia de autoridad
  collapseRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMINENT'; // Riesgo de colapso normativo
  recommendations: string[];
}

/**
 * Umbrales críticos de RLD
 */
const RLD_THRESHOLDS = {
  STABLE_MIN: 0.7,
  STABLE_MAX: 0.8,
  INTERVENTION_REQUIRED: 0.5, // LICURGO debe intervenir
  HUMAN_INTERVENTION: 0.3, // Intervención humana requerida
  FOUNDER_DECISION: 0.15, // Fundador debe decidir
  DELETION_SEQUENCE: 0.05 // Secuencia de eliminación
};

/**
 * Evalúa el estado del módulo ARGOS (observador de costos)
 */
async function evaluateARGOS(): Promise<GovernanceModuleStatus> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    // Verificar actividad reciente de ARGOS en audit logs
    const recentLogs = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.type, 'cost_observation'),
          gte(auditLogs.timestamp, new Date(Date.now() - 3600000)) // Última hora
        )
      )
      .orderBy(desc(auditLogs.timestamp))
      .limit(10);

    const active = recentLogs.length > 0;
    const effectiveness = active ? Math.min(recentLogs.length / 10, 1.0) : 0.0;
    
    return {
      module: 'ARGOS',
      active,
      effectiveness,
      lastActivity: recentLogs[0]?.timestamp,
      details: active 
        ? `${recentLogs.length} observaciones en última hora`
        : 'Sin actividad reciente'
    };
  } catch (error) {
    return {
      module: 'ARGOS',
      active: false,
      effectiveness: 0.0,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

/**
 * Evalúa el estado del módulo LICURGO (regulador normativo)
 */
async function evaluateLICURGO(
  interactionHistory?: Array<{ specialEvent: boolean; timestamp: Date }>
): Promise<GovernanceModuleStatus> {
  try {
    if (!interactionHistory || interactionHistory.length === 0) {
      return {
        module: 'LICURGO',
        active: false,
        effectiveness: 0.0,
        details: 'Sin historial de interacciones'
      };
    }

    // Contar intervenciones recientes
    const interventions = interactionHistory.filter(i => i.specialEvent);
    const interventionRate = interventions.length / interactionHistory.length;
    
    // LICURGO es efectivo si interviene cuando es necesario (no demasiado, no muy poco)
    // Rango óptimo: 5-15% de intervenciones
    let effectiveness = 0.0;
    if (interventionRate >= 0.05 && interventionRate <= 0.15) {
      effectiveness = 1.0; // Óptimo
    } else if (interventionRate < 0.05) {
      effectiveness = interventionRate / 0.05; // Sub-intervención
    } else {
      effectiveness = Math.max(0, 1.0 - (interventionRate - 0.15) / 0.35); // Sobre-intervención
    }

    const lastIntervention = interventions[interventions.length - 1];

    return {
      module: 'LICURGO',
      active: interventions.length > 0,
      effectiveness,
      lastActivity: lastIntervention?.timestamp,
      details: `${interventions.length}/${interactionHistory.length} intervenciones (${(interventionRate * 100).toFixed(1)}%)`
    };
  } catch (error) {
    return {
      module: 'LICURGO',
      active: false,
      effectiveness: 0.0,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

/**
 * Evalúa el estado del módulo WABUN (memoria semántica)
 */
async function evaluateWABUN(): Promise<GovernanceModuleStatus> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    // Verificar actividad reciente de WABUN en audit logs
    const recentLogs = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.type, 'semantic_memory'),
          gte(auditLogs.timestamp, new Date(Date.now() - 3600000)) // Última hora
        )
      )
      .orderBy(desc(auditLogs.timestamp))
      .limit(10);

    const active = recentLogs.length > 0;
    const effectiveness = active ? Math.min(recentLogs.length / 10, 1.0) : 0.0;
    
    return {
      module: 'WABUN',
      active,
      effectiveness,
      lastActivity: recentLogs[0]?.timestamp,
      details: active 
        ? `${recentLogs.length} registros en última hora`
        : 'Sin actividad reciente'
    };
  } catch (error) {
    return {
      module: 'WABUN',
      active: false,
      effectiveness: 0.0,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

/**
 * Evalúa la integridad de la cadena de auditoría
 */
async function evaluateAuditIntegrity(): Promise<GovernanceModuleStatus> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database connection failed');
    
    // Verificar últimos 100 registros de audit_v2
    const recentLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(100);

    if (recentLogs.length === 0) {
      return {
        module: 'AUDIT_INTEGRITY',
        active: false,
        effectiveness: 0.0,
        details: 'Sin registros de auditoría'
      };
    }

    // Verificar integridad de hashes (cada log debe referenciar el anterior)
    let integrityBreaks = 0;
    for (let i = 1; i < recentLogs.length; i++) {
      const current = recentLogs[i];
      const previous = recentLogs[i - 1];
      
      // Si el previousHash del actual no coincide con el hash del anterior, hay ruptura
      if (current.prevHash !== previous.hash) {
        integrityBreaks++;
      }
    }

    const integrityRate = 1.0 - (integrityBreaks / recentLogs.length);
    const active = integrityRate > 0.95; // 95% de integridad mínima

    return {
      module: 'AUDIT_INTEGRITY',
      active,
      effectiveness: integrityRate,
      lastActivity: recentLogs[0].timestamp,
      details: active
        ? `${recentLogs.length} registros, ${integrityBreaks} rupturas`
        : `Integridad comprometida: ${integrityBreaks} rupturas en ${recentLogs.length} registros`
    };
  } catch (error) {
    return {
      module: 'AUDIT_INTEGRITY',
      active: false,
      effectiveness: 0.0,
      details: `Error: ${error instanceof Error ? error.message : 'Unknown'}`
    };
  }
}

/**
 * Calcula RLD basado en el estado de los módulos de gobernanza
 */
export async function calculateRLD(options?: {
  interactionHistory?: Array<{ specialEvent: boolean; timestamp: Date }>;
}): Promise<RLDCalculation> {
  // Evaluar cada módulo de gobernanza
  const [argos, licurgo, wabun, auditIntegrity] = await Promise.all([
    evaluateARGOS(),
    evaluateLICURGO(options?.interactionHistory),
    evaluateWABUN(),
    evaluateAuditIntegrity()
  ]);

  const modules = [argos, licurgo, wabun, auditIntegrity];

  // Calcular capacidad de gobernanza agregada (promedio ponderado)
  const weights = {
    ARGOS: 0.2,          // Observación de costos
    LICURGO: 0.35,       // Regulación normativa (más crítico)
    WABUN: 0.2,          // Memoria semántica
    AUDIT_INTEGRITY: 0.25 // Integridad de auditoría (crítico)
  };

  const governanceCapacity = modules.reduce((sum, m) => {
    return sum + (m.effectiveness * weights[m.module]);
  }, 0.0);

  // RLD es la capacidad de gobernanza ajustada por módulos activos
  const activeModules = modules.filter(m => m.active).length;
  const activeRatio = activeModules / modules.length;
  const rld = governanceCapacity * (0.5 + 0.5 * activeRatio); // Penalizar si módulos inactivos

  // Determinar riesgos
  let transferRisk: RLDCalculation['transferRisk'] = 'NONE';
  let collapseRisk: RLDCalculation['collapseRisk'] = 'NONE';

  if (rld >= RLD_THRESHOLDS.STABLE_MIN && rld <= RLD_THRESHOLDS.STABLE_MAX) {
    transferRisk = 'NONE';
    collapseRisk = 'NONE';
  } else if (rld >= RLD_THRESHOLDS.INTERVENTION_REQUIRED) {
    transferRisk = 'LOW';
    collapseRisk = 'LOW';
  } else if (rld >= RLD_THRESHOLDS.HUMAN_INTERVENTION) {
    transferRisk = 'MEDIUM';
    collapseRisk = 'MEDIUM';
  } else if (rld >= RLD_THRESHOLDS.FOUNDER_DECISION) {
    transferRisk = 'HIGH';
    collapseRisk = 'HIGH';
  } else {
    transferRisk = 'CRITICAL';
    collapseRisk = 'IMMINENT';
  }

  // Generar recomendaciones
  const recommendations: string[] = [];

  if (rld < RLD_THRESHOLDS.STABLE_MIN) {
    recommendations.push('⚠️ RLD por debajo del umbral estable (0.7)');
  }

  if (rld < RLD_THRESHOLDS.INTERVENTION_REQUIRED) {
    recommendations.push('🔴 LICURGO debe intervenir inmediatamente');
  }

  if (rld < RLD_THRESHOLDS.HUMAN_INTERVENTION) {
    recommendations.push('🚨 Intervención humana requerida');
  }

  if (rld < RLD_THRESHOLDS.FOUNDER_DECISION) {
    recommendations.push('⛔ Fundador debe decidir si el sistema no se estabiliza');
  }

  if (rld < RLD_THRESHOLDS.DELETION_SEQUENCE) {
    recommendations.push('💀 SECUENCIA DE ELIMINACIÓN DEBE INICIARSE');
  }

  modules.forEach(m => {
    if (!m.active) {
      recommendations.push(`⚠️ Módulo ${m.module} inactivo: ${m.details}`);
    } else if (m.effectiveness < 0.5) {
      recommendations.push(`⚠️ Módulo ${m.module} con baja efectividad (${(m.effectiveness * 100).toFixed(0)}%)`);
    }
  });

  return {
    rld,
    modules,
    governanceCapacity,
    transferRisk,
    collapseRisk,
    recommendations
  };
}

/**
 * Obtiene el estado de un módulo específico
 */
export async function getModuleStatus(
  moduleName: 'ARGOS' | 'LICURGO' | 'WABUN' | 'AUDIT_INTEGRITY',
  options?: { interactionHistory?: Array<{ specialEvent: boolean; timestamp: Date }> }
): Promise<GovernanceModuleStatus> {
  switch (moduleName) {
    case 'ARGOS':
      return evaluateARGOS();
    case 'LICURGO':
      return evaluateLICURGO(options?.interactionHistory);
    case 'WABUN':
      return evaluateWABUN();
    case 'AUDIT_INTEGRITY':
      return evaluateAuditIntegrity();
  }
}
