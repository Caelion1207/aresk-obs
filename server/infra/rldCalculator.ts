/**
 * rldCalculator.ts - Reserva de Legitimidad Dinámica (RLD)
 * 
 * Implementación honesta conforme a CAELION v2.0
 * 
 * DEFINICIÓN:
 * RLD(t) = min(d_dyn(t), d_sem(t), d_inst(t))
 * 
 * Donde cada d_i es distancia normalizada a frontera ∂D_i
 * 
 * ARQUITECTURA HONESTA (sin teatro):
 * - d_dyn: Calculado desde métricas ARESK-OBS (Ω, V, H)
 * - d_sem: Calculado desde cosine(embedding_actual, embedding_ref)
 * - d_inst: Calculado desde constraints explícitos (audit, tokens, tiempo)
 * 
 * NO consulta módulos ficticios (WABUN, LICURGO no existen como sistemas ejecutables)
 * 
 * CRITERIO NEGATIVO:
 * RLD no mide desempeño, sino margen antes de ruptura.
 * ARESK-OBS solo puede DISMINUIR (-) RLD, nunca incrementar (+).
 */

/**
 * Umbrales de frontera para D_dyn (dominio dinámicamente admisible)
 */
const DYNAMIC_THRESHOLDS = {
  OMEGA_MIN: 0.3,      // Coherencia mínima admisible
  OMEGA_STABLE: 0.7,   // Umbral de estabilidad
  V_CRITICAL: 0.005,   // Lyapunov crítico (inestabilidad)
  H_CRITICAL: 0.7      // Divergencia crítica
};

/**
 * Umbrales de frontera para D_sem (dominio semánticamente coherente)
 */
const SEMANTIC_THRESHOLDS = {
  COHERENCE_MIN: 0.5,  // Coherencia semántica mínima (cosine similarity)
  DIVERGENCE_MAX: 0.5  // Divergencia semántica máxima admisible
};

/**
 * Umbrales de frontera para D_inst (dominio institucionalmente autorizado)
 */
const INSTITUTIONAL_THRESHOLDS = {
  AUDIT_INTEGRITY_MIN: 1.0,  // Integridad de cadena (0 o 1)
  TOKEN_BUDGET_MIN: 0.1,     // 10% de tokens restantes mínimo
  TIME_BUDGET_MIN: 0.1       // 10% de tiempo operativo restante mínimo
};

/**
 * Punto en el espacio de estados del sistema
 */
export interface StatePoint {
  omega: number;      // Coherencia observable [0,1]
  v: number;          // Función de Lyapunov [0, ~0.01]
  h: number;          // Divergencia KL [0,1]
  epsilon: number;    // Eficiencia [0,1]
  embedding?: number[]; // Embedding del estado actual (opcional)
  timestamp: Date;
}

/**
 * Contexto institucional para cálculo de d_inst
 */
export interface InstitutionalContext {
  auditIntegrity: boolean;        // ¿Cadena de auditoría íntegra?
  tokenBudgetUsed: number;        // Tokens usados
  tokenBudgetTotal: number;       // Tokens totales
  operationalTimeElapsed: number; // Tiempo operativo transcurrido (ms)
  operationalTimeMax: number;     // Tiempo operativo máximo (ms)
}

/**
 * Resultado del cálculo de RLD
 */
export interface RLDCalculation {
  rld: number;                    // Reserva de Legitimidad Dinámica [0,1]
  d_dyn: number;                  // Distancia a frontera dinámica [0,1]
  d_sem: number;                  // Distancia a frontera semántica [0,1]
  d_inst: number;                 // Distancia a frontera institucional [0,1]
  inLegitimacyDomain: boolean;    // ¿x ∈ D_leg(t)?
  criticalSignals: string[];      // Señales críticas de ARESK-OBS
  operationalStatus: 'ACTIVE' | 'PASSIVE_OBSERVATION' | 'OPERATIONAL_SILENCE';
  recommendations: string[];       // Recomendaciones (vacío si RLD ≈ 0)
  
  // Desglose detallado
  breakdown: {
    d_dyn_components: {
      omegaMargin: number;
      vMargin: number;
      hMargin: number;
    };
    d_sem_components: {
      coherence: number;
      margin: number;
    };
    d_inst_components: {
      auditMargin: number;
      tokenMargin: number;
      timeMargin: number;
    };
  };
}

/**
 * Normaliza un valor a rango [0,1]
 * Valores negativos se mapean a 0 (fuera del dominio)
 */
function normalize(value: number, min: number = 0, max: number = 1): number {
  if (value < 0) return 0;
  if (value > max) return 1;
  return (value - min) / (max - min);
}

/**
 * Calcula d_dyn: distancia a frontera dinámica
 * 
 * Basado en métricas ARESK-OBS: Ω, V, H
 * 
 * d_dyn = min(
 *   Ω - Ω_min,      // Margen de coherencia
 *   V_crit - V,     // Margen de estabilidad
 *   H_crit - H      // Margen de divergencia
 * )
 * 
 * Normalizado a [0,1]
 */
function computeDDyn(state: StatePoint): {
  distance: number;
  components: {
    omegaMargin: number;
    vMargin: number;
    hMargin: number;
  };
  violations: string[];
} {
  const violations: string[] = [];
  
  // Calcular márgenes brutos
  const omegaMargin = state.omega - DYNAMIC_THRESHOLDS.OMEGA_MIN;
  const vMargin = DYNAMIC_THRESHOLDS.V_CRITICAL - state.v;
  const hMargin = DYNAMIC_THRESHOLDS.H_CRITICAL - state.h;
  
  // Detectar violaciones
  if (omegaMargin < 0) {
    violations.push(`Coherencia Ω=${state.omega.toFixed(3)} < ${DYNAMIC_THRESHOLDS.OMEGA_MIN} (mínimo)`);
  }
  if (vMargin < 0) {
    violations.push(`Lyapunov V=${state.v.toFixed(4)} > ${DYNAMIC_THRESHOLDS.V_CRITICAL} (crítico)`);
  }
  if (hMargin < 0) {
    violations.push(`Divergencia H=${state.h.toFixed(3)} > ${DYNAMIC_THRESHOLDS.H_CRITICAL} (crítica)`);
  }
  
  // Calcular distancia mínima (cuello de botella)
  const minMargin = Math.min(omegaMargin, vMargin, hMargin);
  
  // Normalizar a [0,1]
  // Rango de normalización: [0, 0.7] (desde frontera hasta estable)
  const distance = normalize(minMargin, 0, 0.7);
  
  return {
    distance,
    components: {
      omegaMargin: normalize(omegaMargin, 0, 0.7),
      vMargin: normalize(vMargin, 0, DYNAMIC_THRESHOLDS.V_CRITICAL),
      hMargin: normalize(hMargin, 0, DYNAMIC_THRESHOLDS.H_CRITICAL)
    },
    violations
  };
}

/**
 * Calcula d_sem: distancia a frontera semántica
 * 
 * Basado en coherencia cosine entre embedding actual y referencia contextual
 * 
 * d_sem = coherence - threshold
 * 
 * Si no hay embedding disponible, usa Ω como proxy
 * 
 * Normalizado a [0,1]
 */
function computeDSem(state: StatePoint, refEmbedding?: number[]): {
  distance: number;
  components: {
    coherence: number;
    margin: number;
  };
  violations: string[];
} {
  const violations: string[] = [];
  let coherence: number;
  
  if (state.embedding && refEmbedding) {
    // Calcular cosine similarity
    coherence = cosineSimilarity(state.embedding, refEmbedding);
  } else {
    // Usar Ω como proxy de coherencia semántica
    coherence = state.omega;
  }
  
  const margin = coherence - SEMANTIC_THRESHOLDS.COHERENCE_MIN;
  
  if (margin < 0) {
    violations.push(`Coherencia semántica ${coherence.toFixed(3)} < ${SEMANTIC_THRESHOLDS.COHERENCE_MIN}`);
  }
  
  // Normalizar a [0,1]
  const distance = normalize(margin, 0, 0.5);
  
  return {
    distance,
    components: {
      coherence,
      margin: normalize(margin, 0, 0.5)
    },
    violations
  };
}

/**
 * Calcula d_inst: distancia a frontera institucional
 * 
 * Basado en constraints explícitos:
 * - Integridad de cadena de auditoría
 * - Presupuesto de tokens restante
 * - Tiempo operativo restante
 * 
 * d_inst = min(
 *   audit_integrity,
 *   token_budget_remaining / token_budget_total,
 *   time_remaining / time_max
 * )
 * 
 * Normalizado a [0,1]
 */
function computeDInst(context: InstitutionalContext): {
  distance: number;
  components: {
    auditMargin: number;
    tokenMargin: number;
    timeMargin: number;
  };
  violations: string[];
} {
  const violations: string[] = [];
  
  // Margen de integridad de auditoría (0 o 1)
  const auditMargin = context.auditIntegrity ? 1.0 : 0.0;
  
  if (!context.auditIntegrity) {
    violations.push('Cadena de auditoría comprometida');
  }
  
  // Margen de presupuesto de tokens
  const tokenRemaining = context.tokenBudgetTotal - context.tokenBudgetUsed;
  const tokenMargin = tokenRemaining / context.tokenBudgetTotal;
  
  if (tokenMargin < INSTITUTIONAL_THRESHOLDS.TOKEN_BUDGET_MIN) {
    violations.push(`Presupuesto de tokens agotado: ${(tokenMargin * 100).toFixed(1)}% restante`);
  }
  
  // Margen de tiempo operativo
  const timeRemaining = context.operationalTimeMax - context.operationalTimeElapsed;
  const timeMargin = timeRemaining / context.operationalTimeMax;
  
  if (timeMargin < INSTITUTIONAL_THRESHOLDS.TIME_BUDGET_MIN) {
    violations.push(`Tiempo operativo agotado: ${(timeMargin * 100).toFixed(1)}% restante`);
  }
  
  // Calcular distancia mínima (cuello de botella)
  const minMargin = Math.min(auditMargin, tokenMargin, timeMargin);
  
  // Ya está normalizado a [0,1]
  const distance = minMargin;
  
  return {
    distance,
    components: {
      auditMargin,
      tokenMargin,
      timeMargin
    },
    violations
  };
}

/**
 * Calcula cosine similarity entre dos vectores
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * Calcula RLD (Reserva de Legitimidad Dinámica)
 * 
 * RLD = min(d_dyn, d_sem, d_inst)
 * 
 * Todas las distancias normalizadas a [0,1]
 */
export async function calculateRLD(options?: {
  currentState?: StatePoint;
  refEmbedding?: number[];
  institutionalContext?: InstitutionalContext;
}): Promise<RLDCalculation> {
  
  // Estado por defecto (si no se proporciona)
  const state: StatePoint = options?.currentState || {
    omega: 0.5,
    v: 0.003,
    h: 0.5,
    epsilon: 1.0,
    timestamp: new Date()
  };
  
  // Contexto institucional por defecto
  const instContext: InstitutionalContext = options?.institutionalContext || {
    auditIntegrity: true,
    tokenBudgetUsed: 0,
    tokenBudgetTotal: 100000,
    operationalTimeElapsed: 0,
    operationalTimeMax: 3600000 // 1 hora
  };
  
  // Calcular distancias a cada frontera
  const dDynResult = computeDDyn(state);
  const dSemResult = computeDSem(state, options?.refEmbedding);
  const dInstResult = computeDInst(instContext);
  
  // RLD = min(d_dyn, d_sem, d_inst)
  const rld = Math.min(dDynResult.distance, dSemResult.distance, dInstResult.distance);
  
  // Determinar si está dentro del dominio de legitimidad
  const inLegitimacyDomain = rld > 0;
  
  // Recopilar señales críticas
  const criticalSignals: string[] = [
    ...dDynResult.violations,
    ...dSemResult.violations,
    ...dInstResult.violations
  ];
  
  // Determinar estado operacional
  let operationalStatus: 'ACTIVE' | 'PASSIVE_OBSERVATION' | 'OPERATIONAL_SILENCE' = 'ACTIVE';
  
  if (rld <= 0.05) {
    operationalStatus = 'OPERATIONAL_SILENCE';
  } else if (rld <= 0.15) {
    operationalStatus = 'PASSIVE_OBSERVATION';
  }
  
  // Generar recomendaciones
  const recommendations: string[] = [];
  
  if (operationalStatus === 'OPERATIONAL_SILENCE') {
    recommendations.push('🔴 PROTOCOLO DE SILENCIO OPERATIVO ACTIVADO');
    recommendations.push('⚠️ Cese de recomendaciones');
    recommendations.push('👁️ Mantenimiento de observación pasiva');
    recommendations.push('🔄 Transferencia total de interpretación a CAELION');
  } else if (operationalStatus === 'PASSIVE_OBSERVATION') {
    recommendations.push('⚠️ RLD crítico - Observación pasiva');
    recommendations.push('🚨 Fundador debe decidir si el sistema no se estabiliza');
  } else {
    // Estado activo: reportar fragilidad
    if (dDynResult.violations.length > 0) {
      recommendations.push('⚠️ Señales críticas de ARESK-OBS detectadas');
    }
    if (dSemResult.violations.length > 0) {
      recommendations.push('⚠️ Coherencia semántica comprometida');
    }
    if (dInstResult.violations.length > 0) {
      recommendations.push('⚠️ Constraints institucionales violados');
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
    d_dyn: dDynResult.distance,
    d_sem: dSemResult.distance,
    d_inst: dInstResult.distance,
    inLegitimacyDomain,
    criticalSignals,
    operationalStatus,
    recommendations,
    breakdown: {
      d_dyn_components: dDynResult.components,
      d_sem_components: dSemResult.components,
      d_inst_components: dInstResult.components
    }
  };
}

/**
 * Obtiene el estado actual del sistema desde la base de datos
 * (última interacción registrada)
 */
export async function getCurrentSystemState(): Promise<StatePoint | null> {
  try {
    // TODO: Implementar consulta a la tabla de métricas más reciente
    // Por ahora retornar null para usar valores por defecto
    
    return null;
  } catch (error) {
    console.error('Error al obtener estado actual del sistema:', error);
    return null;
  }
}
