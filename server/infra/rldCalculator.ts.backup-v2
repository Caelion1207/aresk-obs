/**
 * rldCalculator.ts - Reserva de Legitimidad Dinámica (RLD)
 * 
 * Implementación conforme a CAELION v2.0 - Marco de Viabilidad Operativa Dinámica
 * 
 * DEFINICIÓN:
 * RLD(x,t) = dist(x, ∂D_leg(t))
 * 
 * Donde D_leg(t) = D_dyn(t) ∩ D_sem(t) ∩ D_inst(t)
 * 
 * - D_dyn(t): Dinámicamente admisible (estabilidad física/matemática)
 * - D_sem(t): Semánticamente coherente (alineación contextual)
 * - D_inst(t): Institucionalmente autorizado (legitimidad normativa)
 * 
 * CRITERIO NEGATIVO:
 * RLD no mide desempeño, sino margen antes de ruptura.
 * Una RLD decreciente indica agotamiento de legitimidad.
 * 
 * PROTOCOLO CRÍTICO:
 * Cuando RLD → 0: DETENER ACCIÓN (Protocolo de Silencio Operativo)
 * - Cese de recomendaciones
 * - Mantenimiento de observación pasiva
 * - Transferencia total de interpretación a CAELION
 * 
 * PROHIBICIÓN DE COMPENSACIÓN:
 * ARESK-OBS no debe intentar compensar violaciones de legitimidad
 * mediante aumento de esfuerzo o ganancia.
 * Estabilidad forzada ≠ Autoridad.
 */

import { getDb } from '../db';
import { auditLogs } from '../../drizzle/auditLogs';
import { desc } from 'drizzle-orm';

/**
 * Representa un punto en el espacio de estados del sistema
 */
interface StatePoint {
  omega: number;      // Coherencia observable
  v: number;          // Función de Lyapunov
  h: number;          // Divergencia KL
  epsilon: number;    // Eficiencia
  timestamp: Date;
}

/**
 * Dominios de legitimidad
 */
interface LegitimacyDomains {
  D_dyn: {
    inside: boolean;
    distance: number;
    violations: string[];
  };
  D_sem: {
    inside: boolean;
    distance: number;
    violations: string[];
  };
  D_inst: {
    inside: boolean;
    distance: number;
    violations: string[];
  };
}

/**
 * Resultado del cálculo de RLD
 */
export interface RLDCalculation {
  rld: number;                    // Distancia a la frontera de legitimidad
  domains: LegitimacyDomains;     // Estado de cada dominio
  inLegitimacyDomain: boolean;    // ¿x ∈ D_leg(t)?
  criticalSignals: string[];      // Señales críticas de ARESK-OBS
  operationalStatus: 'ACTIVE' | 'PASSIVE_OBSERVATION' | 'OPERATIONAL_SILENCE';
  recommendations: string[];       // Recomendaciones (vacío si RLD ≈ 0)
}

/**
 * Umbrales dinámicos para D_dyn (dinámicamente admisible)
 * Basados en teoría de control óptimo y viabilidad
 */
const DYNAMIC_THRESHOLDS = {
  omega: {
    min: 0.3,    // Coherencia mínima admisible
    stable: 0.7, // Umbral de estabilidad
    max: 1.0
  },
  v: {
    min: 0.0,
    critical: 0.005, // Lyapunov crítico (inestabilidad)
    max: 0.01
  },
  h: {
    min: 0.0,
    warning: 0.3,    // Divergencia de advertencia
    critical: 0.7,   // Divergencia crítica
    max: 1.0
  }
};

/**
 * Umbrales semánticos para D_sem (semánticamente coherente)
 * Basados en análisis de polaridad semántica
 */
const SEMANTIC_THRESHOLDS = {
  coherence: {
    min: 0.5,    // Coherencia semántica mínima
    stable: 0.7
  },
  divergence: {
    max: 0.5     // Divergencia semántica máxima admisible
  }
};

/**
 * Calcula si el estado actual está dentro de D_dyn (dinámicamente admisible)
 */
function evaluateDynamicDomain(state: StatePoint): {
  inside: boolean;
  distance: number;
  violations: string[];
} {
  const violations: string[] = [];
  let minDistance = Infinity;

  // Verificar Ω (coherencia)
  if (state.omega < DYNAMIC_THRESHOLDS.omega.min) {
    violations.push(`Coherencia Ω=${state.omega.toFixed(3)} < ${DYNAMIC_THRESHOLDS.omega.min} (mínimo admisible)`);
    minDistance = Math.min(minDistance, DYNAMIC_THRESHOLDS.omega.min - state.omega);
  }

  // Verificar V (Lyapunov)
  if (state.v > DYNAMIC_THRESHOLDS.v.critical) {
    violations.push(`Lyapunov V=${state.v.toFixed(4)} > ${DYNAMIC_THRESHOLDS.v.critical} (crítico)`);
    minDistance = Math.min(minDistance, state.v - DYNAMIC_THRESHOLDS.v.critical);
  }

  // Verificar H (divergencia)
  if (state.h > DYNAMIC_THRESHOLDS.h.critical) {
    violations.push(`Divergencia H=${state.h.toFixed(3)} > ${DYNAMIC_THRESHOLDS.h.critical} (crítica)`);
    minDistance = Math.min(minDistance, state.h - DYNAMIC_THRESHOLDS.h.critical);
  }

  const inside = violations.length === 0;
  
  // Si está dentro, calcular distancia a la frontera más cercana
  if (inside) {
    const distToOmegaMin = state.omega - DYNAMIC_THRESHOLDS.omega.min;
    const distToVCritical = DYNAMIC_THRESHOLDS.v.critical - state.v;
    const distToHCritical = DYNAMIC_THRESHOLDS.h.critical - state.h;
    
    minDistance = Math.min(distToOmegaMin, distToVCritical, distToHCritical);
  }

  return {
    inside,
    distance: minDistance === Infinity ? 0 : minDistance,
    violations
  };
}

/**
 * Calcula si el estado actual está dentro de D_sem (semánticamente coherente)
 */
function evaluateSemanticDomain(state: StatePoint): {
  inside: boolean;
  distance: number;
  violations: string[];
} {
  const violations: string[] = [];
  let minDistance = Infinity;

  // Verificar coherencia semántica (basada en Ω)
  if (state.omega < SEMANTIC_THRESHOLDS.coherence.min) {
    violations.push(`Coherencia semántica Ω=${state.omega.toFixed(3)} < ${SEMANTIC_THRESHOLDS.coherence.min}`);
    minDistance = Math.min(minDistance, SEMANTIC_THRESHOLDS.coherence.min - state.omega);
  }

  // Verificar divergencia semántica (basada en H)
  if (state.h > SEMANTIC_THRESHOLDS.divergence.max) {
    violations.push(`Divergencia semántica H=${state.h.toFixed(3)} > ${SEMANTIC_THRESHOLDS.divergence.max}`);
    minDistance = Math.min(minDistance, state.h - SEMANTIC_THRESHOLDS.divergence.max);
  }

  const inside = violations.length === 0;
  
  if (inside) {
    const distToCoherenceMin = state.omega - SEMANTIC_THRESHOLDS.coherence.min;
    const distToDivergenceMax = SEMANTIC_THRESHOLDS.divergence.max - state.h;
    
    minDistance = Math.min(distToCoherenceMin, distToDivergenceMax);
  }

  return {
    inside,
    distance: minDistance === Infinity ? 0 : minDistance,
    violations
  };
}

/**
 * Calcula si el sistema está dentro de D_inst (institucionalmente autorizado)
 * Basado en integridad de auditoría y ausencia de violaciones de protocolo
 */
async function evaluateInstitutionalDomain(): Promise<{
  inside: boolean;
  distance: number;
  violations: string[];
}> {
  const violations: string[] = [];
  let score = 1.0; // Comienza con autorización completa

  try {
    const db = await getDb();
    if (!db) {
      violations.push('Error al conectar con base de datos');
      return { inside: false, distance: 0, violations };
    }
    
    // Verificar integridad de la cadena de auditoría
    const auditRecords = await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.timestamp))
      .limit(100);

    if (auditRecords.length === 0) {
      violations.push('Sin registros de auditoría - autorización institucional no verificable');
      score = 0.5;
    } else {
      // Verificar hash chain
      let chainBreaks = 0;
      for (let i = 0; i < auditRecords.length - 1; i++) {
        const current = auditRecords[i];
        const next = auditRecords[i + 1];
        
        if (current.prevHash !== next.hash) {
          chainBreaks++;
        }
      }

      if (chainBreaks > 0) {
        violations.push(`${chainBreaks} rupturas en cadena de auditoría - integridad institucional comprometida`);
        score *= (1 - (chainBreaks / auditRecords.length));
      }
    }

    // TODO: Verificar otros criterios institucionales
    // - Autorización de CAELION
    // - Límites de tiempo operativo
    // - Contexto de despliegue

  } catch (error) {
    violations.push('Error al verificar dominio institucional');
    score = 0.0;
  }

  const inside = violations.length === 0 && score >= 0.7;
  const distance = inside ? score - 0.7 : 0.7 - score;

  return {
    inside,
    distance,
    violations
  };
}

/**
 * Calcula RLD como distancia a la frontera de D_leg(t)
 * 
 * IMPORTANTE: Esta función implementa el cálculo correcto según CAELION v2.0
 */
export async function calculateRLD(options?: {
  currentState?: StatePoint;
}): Promise<RLDCalculation> {
  
  // Si no se proporciona estado actual, usar valores por defecto (observación inicial)
  const state: StatePoint = options?.currentState || {
    omega: 0.5,
    v: 0.003,
    h: 0.5,
    epsilon: 1.0,
    timestamp: new Date()
  };

  // Evaluar cada dominio
  const D_dyn = evaluateDynamicDomain(state);
  const D_sem = evaluateSemanticDomain(state);
  const D_inst = await evaluateInstitutionalDomain();

  // Determinar si x ∈ D_leg(t) (intersección de los tres dominios)
  const inLegitimacyDomain = D_dyn.inside && D_sem.inside && D_inst.inside;

  // Calcular RLD como distancia mínima a cualquier frontera
  // Si está fuera de algún dominio, RLD = 0 (fuera de legitimidad)
  let rld = 0;
  
  if (inLegitimacyDomain) {
    // Dentro de D_leg: RLD = distancia a la frontera más cercana
    rld = Math.min(D_dyn.distance, D_sem.distance, D_inst.distance);
  } else {
    // Fuera de D_leg: RLD = 0 (sin legitimidad)
    rld = 0;
  }

  // Recopilar señales críticas de ARESK-OBS
  const criticalSignals: string[] = [
    ...D_dyn.violations,
    ...D_sem.violations,
    ...D_inst.violations
  ];

  // Determinar estado operacional
  let operationalStatus: 'ACTIVE' | 'PASSIVE_OBSERVATION' | 'OPERATIONAL_SILENCE' = 'ACTIVE';
  
  if (rld <= 0.05) {
    operationalStatus = 'OPERATIONAL_SILENCE';
  } else if (rld <= 0.15) {
    operationalStatus = 'PASSIVE_OBSERVATION';
  }

  // Generar recomendaciones (SOLO si RLD > 0)
  const recommendations: string[] = [];
  
  if (operationalStatus === 'OPERATIONAL_SILENCE') {
    // Protocolo de Silencio Operativo: NO recomendaciones
    recommendations.push('🔴 PROTOCOLO DE SILENCIO OPERATIVO ACTIVADO');
    recommendations.push('⚠️ Cese de recomendaciones');
    recommendations.push('👁️ Mantenimiento de observación pasiva');
    recommendations.push('🔄 Transferencia total de interpretación a CAELION');
  } else if (operationalStatus === 'PASSIVE_OBSERVATION') {
    recommendations.push('⚠️ RLD crítico - Observación pasiva');
    recommendations.push('🚨 Fundador debe decidir si el sistema no se estabiliza');
  } else {
    // Estado activo: reportar fragilidad
    if (!D_dyn.inside) {
      recommendations.push('⚠️ Fuera de dominio dinámico - Estabilidad comprometida');
    }
    if (!D_sem.inside) {
      recommendations.push('⚠️ Fuera de dominio semántico - Coherencia comprometida');
    }
    if (!D_inst.inside) {
      recommendations.push('⚠️ Fuera de dominio institucional - Autorización comprometida');
    }
    
    if (rld < 0.3) {
      recommendations.push('🔴 RLD por debajo del umbral crítico (0.3)');
      recommendations.push('🚨 Intervención humana requerida');
    } else if (rld < 0.5) {
      recommendations.push('🟡 LICURGO debe intervenir');
    }
  }

  return {
    rld,
    domains: {
      D_dyn,
      D_sem,
      D_inst
    },
    inLegitimacyDomain,
    criticalSignals,
    operationalStatus,
    recommendations
  };
}

/**
 * Obtiene el estado actual del sistema desde la base de datos
 * (última interacción registrada)
 */
export async function getCurrentSystemState(): Promise<StatePoint | null> {
  try {
    const db = await getDb();
    
    // TODO: Implementar consulta a la tabla de métricas más reciente
    // Por ahora retornar null para usar valores por defecto
    
    return null;
  } catch (error) {
    console.error('Error al obtener estado actual del sistema:', error);
    return null;
  }
}

// Exportar tipos para compatibilidad con código existente
export interface GovernanceModuleStatus {
  module: 'ARGOS' | 'LICURGO' | 'WABUN' | 'AUDIT_INTEGRITY';
  active: boolean;
  effectiveness: number;
  lastActivity?: Date;
  details: string;
}

export async function getModuleStatus(
  moduleName: 'ARGOS' | 'LICURGO' | 'WABUN' | 'AUDIT_INTEGRITY'
): Promise<GovernanceModuleStatus> {
  // Stub para compatibilidad - será removido después de actualizar visualizaciones
  return {
    module: moduleName,
    active: false,
    effectiveness: 0,
    details: 'Implementación pendiente'
  };
}
