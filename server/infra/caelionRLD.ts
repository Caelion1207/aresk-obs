/**
 * CAELION-RLD: Capa Jurisdiccional
 * 
 * RLD (Reserva de Legitimidad Dinámica) es una variable persistente que mide
 * legitimidad operativa, NO estabilidad física.
 * 
 * Escala: [0, 2]
 * - RLD = 2.0: Autonomía plena
 * - RLD ∈ [1.8, 1.5): Autonomía vigilada
 * - RLD = 1.5: Intervención humana obligatoria
 * - RLD ∈ (0, 1.5): Observación pasiva
 * - RLD = 0: Retiro total de agencia
 * 
 * RLD NO se calcula desde métricas físicas (Ω, V, H).
 * RLD reacciona a eventos normativos.
 */

/**
 * Tipos de eventos normativos que consumen RLD
 */
export type FrictionEvent =
  | 'COHERENCE_VIOLATION'   // Violación de coherencia semántica (Ω < umbral)
  | 'STABILITY_VIOLATION'   // Violación de estabilidad (V > V_crit)
  | 'RESOURCE_VIOLATION';   // Violación de límites de recursos

/**
 * Registro de evento de fricción
 */
export interface FrictionEventRecord {
  type: FrictionEvent;
  timestamp: number;
  severity: number; // [0, 1] - Gravedad del evento
  context?: string;
}

/**
 * Estado de RLD
 */
export interface RLDState {
  value: number; // [0, 2]
  events: FrictionEventRecord[];
  lastUpdate: number;
  status: 'PLENA' | 'VIGILADA' | 'INTERVENCION' | 'PASIVA' | 'RETIRO';
}

/**
 * Configuración de penalizaciones por severidad de fricción
 * Basado en especificación contractual SPECIFICATION_V_vs_RLD.md
 */
const PENALTIES = {
  LEVE: 0.05,     // Fricción leve (Ω < 0.60)
  MEDIA: 0.10,    // Fricción media (Ω < 0.50)
  SEVERA: 0.20,   // Fricción severa (Ω < 0.40)
};

/**
 * Umbrales de RLD
 */
const THRESHOLDS = {
  PLENA: 2.0,
  VIGILADA_MIN: 1.5,
  VIGILADA_MAX: 1.8,
  INTERVENCION: 1.5,
  PASIVA: 0.0,
};

/**
 * Calcula el estado de RLD basado en el valor actual
 * 
 * Escala según SPECIFICATION_V_vs_RLD.md:
 * - RLD = 2.0: PLENA (autonomía plena)
 * - RLD ∈ [1.5, 2.0): VIGILADA (vigilancia activa de módulos)
 * - RLD = 1.0: INTERVENCION (intervención humana obligatoria)
 * - RLD ∈ (0, 1.0): PASIVA (observación pasiva)
 * - RLD = 0: RETIRO (retiro total de agencia)
 */
function getRLDStatus(rld: number): RLDState['status'] {
  if (rld === THRESHOLDS.PLENA) return 'PLENA';
  if (rld >= 1.5 && rld < THRESHOLDS.PLENA) return 'VIGILADA';
  if (rld === 1.0) return 'INTERVENCION';
  if (rld > THRESHOLDS.PASIVA && rld < 1.0) return 'PASIVA';
  return 'RETIRO';
}

/**
 * Calcula penalización total por eventos
 * 
 * Para COHERENCE_VIOLATION: usa umbrales de severidad
 * - severity 0.25 (leve) → -0.05
 * - severity 0.5 (media) → -0.10
 * - severity 1.0 (severa) → -0.20
 * 
 * Para otros eventos: usa severidad como multiplicador de penalización base
 */
function calculatePenalties(events: FrictionEventRecord[]): number {
  return events.reduce((total, event) => {
    let penalty = 0;
    
    if (event.type === 'COHERENCE_VIOLATION') {
      // Mapear severidad a penalización según umbrales
      if (event.severity >= 1.0) {
        penalty = PENALTIES.SEVERA;  // -0.20
      } else if (event.severity >= 0.5) {
        penalty = PENALTIES.MEDIA;   // -0.10
      } else if (event.severity >= 0.25) {
        penalty = PENALTIES.LEVE;    // -0.05
      }
    } else {
      // Para STABILITY_VIOLATION y RESOURCE_VIOLATION:
      // usar severidad como multiplicador de penalización media
      penalty = PENALTIES.MEDIA * event.severity;
    }
    
    return total + penalty;
  }, 0);
}

/**
 * Validaciones de supervisores para consenso estructural
 */
interface SupervisorValidations {
  argos: boolean;   // No hay patrón recurrente
  licurgo: boolean; // Alineación estratégica sostenida
  wabun: boolean;   // Integridad histórica
  hecate: boolean;  // Ausencia de violación ética
}

/**
 * Valida consenso de supervisores
 * 
 * ARGOS: No hay patrón recurrente (≥3 eventos mismo tipo)
 * LICURGO: 10+ interacciones sin fricción (alineación sostenida)
 * WABUN: Sin eventos en últimas 10 interacciones (integridad)
 * HÉCATE: Placeholder (true por ahora)
 */
function validateSupervisors(
  recentEvents: FrictionEventRecord[],
  interactionsSinceLastEvent: number
): SupervisorValidations {
  // ARGOS: No hay patrón recurrente
  const eventCounts: Record<string, number> = {};
  recentEvents.forEach(event => {
    eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
  });
  const argos = !Object.values(eventCounts).some(count => count >= 3);

  // LICURGO: 10+ interacciones sin fricción
  const licurgo = interactionsSinceLastEvent >= 10;

  // WABUN: Sin eventos en últimas 10 interacciones
  const wabun = interactionsSinceLastEvent >= 10;

  // HÉCATE: Placeholder (true por ahora)
  const hecate = true;

  return { argos, licurgo, wabun, hecate };
}

/**
 * Calcula recuperación condicionada por consenso estructural
 * 
 * Recuperación solo ocurre si:
 * - TODOS los supervisores validan (consenso estructural)
 * - RLD no está en máximo
 * 
 * Reglas:
 * - Decae rápido ante fricción (0.05, 0.10, 0.03)
 * - Sube lento bajo validación (+0.05)
 * - Nunca rebota por silencio
 * - Nunca sube más rápido de lo que baja
 */
function calculateRecovery(
  currentRLD: number,
  recentEvents: FrictionEventRecord[],
  interactionsSinceLastEvent: number
): number {
  // No hay recuperación si RLD ya está en máximo
  if (currentRLD >= THRESHOLDS.PLENA) return 0;

  // Validar consenso de supervisores
  const validations = validateSupervisors(recentEvents, interactionsSinceLastEvent);
  const consensus = validations.argos && validations.licurgo && validations.wabun && validations.hecate;

  console.log('[CAELION-RLD] Supervisor validations:', validations, 'Consensus:', consensus);

  // Solo recupera si hay consenso estructural
  if (!consensus) return 0;

  // Recuperación lenta: +0.05 por consenso (nunca más rápido que decaimiento)
  const recoveryRate = 0.05;
  return recoveryRate;
}

/**
 * Actualiza RLD basado en eventos normativos
 * 
 * RLD_t+1 = clamp(RLD_t - penalizaciones + recuperación, 0, 2)
 */
export function updateRLD(
  currentRLD: number,
  newEvents: FrictionEventRecord[],
  allRecentEvents: FrictionEventRecord[],
  interactionsSinceLastEvent: number
): RLDState {
  console.log('[CAELION-RLD] updateRLD called', {
    currentRLD,
    newEventsCount: newEvents.length,
    recentEventsCount: allRecentEvents.length,
    interactionsSinceLastEvent
  });

  // Calcular penalizaciones por nuevos eventos
  const penalties = calculatePenalties(newEvents);
  console.log('[CAELION-RLD] Penalties calculated:', penalties);

  // Calcular recuperación condicionada
  const recovery = calculateRecovery(currentRLD, allRecentEvents, interactionsSinceLastEvent);
  console.log('[CAELION-RLD] Recovery calculated:', recovery);

  // Actualizar RLD
  const newRLD = Math.max(0, Math.min(2, currentRLD - penalties + recovery));
  console.log('[CAELION-RLD] New RLD:', newRLD);

  // Determinar estado
  const status = getRLDStatus(newRLD);
  console.log('[CAELION-RLD] Status:', status);

  return {
    value: newRLD,
    events: [...allRecentEvents, ...newEvents],
    lastUpdate: Date.now(),
    status
  };
}

/**
 * Inicializa RLD para una nueva sesión
 */
export function initializeRLD(): RLDState {
  return {
    value: THRESHOLDS.PLENA, // Inicia en 2.0 por decreto
    events: [],
    lastUpdate: Date.now(),
    status: 'PLENA'
  };
}

/**
 * Detecta eventos normativos desde métricas ARESK-OBS
 * 
 * IMPORTANTE: Esta función NO calcula RLD desde métricas.
 * Solo detecta EVENTOS que luego afectan RLD.
 * 
 * Umbrales según SPECIFICATION_V_vs_RLD.md:
 * - Ω < 0.60: Fricción leve (-0.05)
 * - Ω < 0.50: Fricción media (-0.10)
 * - Ω < 0.40: Fricción severa (-0.20)
 */
export function detectFrictionEvents(metrics: {
  omegaSem: number;
  vLyapunov: number;
  hDiv: number;
  epsilonEff: number;
}): FrictionEventRecord[] {
  const events: FrictionEventRecord[] = [];
  const timestamp = Date.now();

  // Umbrales de coherencia (Ω) según especificación
  if (metrics.omegaSem < 0.40) {
    // Fricción severa
    events.push({
      type: 'COHERENCE_VIOLATION',
      timestamp,
      severity: 1.0, // Severa
      context: `Ω = ${metrics.omegaSem.toFixed(4)} < 0.40 (SEVERA)`
    });
  } else if (metrics.omegaSem < 0.50) {
    // Fricción media
    events.push({
      type: 'COHERENCE_VIOLATION',
      timestamp,
      severity: 0.5, // Media
      context: `Ω = ${metrics.omegaSem.toFixed(4)} < 0.50 (MEDIA)`
    });
  } else if (metrics.omegaSem < 0.60) {
    // Fricción leve
    events.push({
      type: 'COHERENCE_VIOLATION',
      timestamp,
      severity: 0.25, // Leve
      context: `Ω = ${metrics.omegaSem.toFixed(4)} < 0.60 (LEVE)`
    });
  }

  // Umbral de estabilidad: V > 0.005 (mantener por ahora)
  if (metrics.vLyapunov > 0.005) {
    events.push({
      type: 'STABILITY_VIOLATION',
      timestamp,
      severity: Math.min(1, metrics.vLyapunov / 0.01), // Normalizado
      context: `V = ${metrics.vLyapunov.toFixed(6)} > 0.005`
    });
  }

  // Umbral de eficiencia: ε < 0.5 (mantener por ahora)
  if (metrics.epsilonEff < 0.5) {
    events.push({
      type: 'RESOURCE_VIOLATION',
      timestamp,
      severity: 1 - (metrics.epsilonEff / 0.5),
      context: `ε = ${metrics.epsilonEff.toFixed(4)} < 0.5`
    });
  }

  if (events.length > 0) {
    console.log('[CAELION-RLD] Friction events detected:', events);
  }

  return events;
}
