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
 * Configuración de penalizaciones por tipo de evento
 */
const PENALTIES: Record<FrictionEvent, number> = {
  COHERENCE_VIOLATION: 0.05,   // Penalización por violación de coherencia
  STABILITY_VIOLATION: 0.10,   // Penalización por violación de estabilidad
  RESOURCE_VIOLATION: 0.03,    // Penalización por violación de recursos
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
 */
function getRLDStatus(rld: number): RLDState['status'] {
  if (rld === THRESHOLDS.PLENA) return 'PLENA';
  if (rld >= THRESHOLDS.VIGILADA_MIN && rld < THRESHOLDS.VIGILADA_MAX) return 'VIGILADA';
  if (rld === THRESHOLDS.INTERVENCION) return 'INTERVENCION';
  if (rld > THRESHOLDS.PASIVA && rld < THRESHOLDS.INTERVENCION) return 'PASIVA';
  return 'RETIRO';
}

/**
 * Calcula penalización total por eventos
 */
function calculatePenalties(events: FrictionEventRecord[]): number {
  return events.reduce((total, event) => {
    const basePenalty = PENALTIES[event.type];
    const severityMultiplier = event.severity;
    return total + (basePenalty * severityMultiplier);
  }, 0);
}

/**
 * Calcula recuperación condicionada
 * 
 * Recuperación solo ocurre si:
 * - No hay eventos de fricción en las últimas X interacciones
 * - No hay patrón recurrente
 * - Supervisores validan régimen (por ahora simplificado)
 */
function calculateRecovery(
  currentRLD: number,
  recentEvents: FrictionEventRecord[],
  interactionsSinceLastEvent: number
): number {
  // No hay recuperación si RLD ya está en máximo
  if (currentRLD >= THRESHOLDS.PLENA) return 0;

  // No hay recuperación si hay eventos recientes (últimas 10 interacciones)
  if (interactionsSinceLastEvent < 10) return 0;

  // No hay recuperación si hay patrón recurrente
  // (más de 3 eventos del mismo tipo en las últimas 20 interacciones)
  const eventCounts: Record<string, number> = {};
  recentEvents.forEach(event => {
    eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
  });
  
  const hasRecurrentPattern = Object.values(eventCounts).some(count => count >= 3);
  if (hasRecurrentPattern) return 0;

  // Recuperación gradual: +0.01 por cada 10 interacciones sin fricción
  const recoveryRate = 0.01;
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
 */
export function detectFrictionEvents(metrics: {
  omegaSem: number;
  vLyapunov: number;
  hDiv: number;
  epsilonEff: number;
}): FrictionEventRecord[] {
  const events: FrictionEventRecord[] = [];
  const timestamp = Date.now();

  // Umbral de coherencia: Ω < 0.3
  if (metrics.omegaSem < 0.3) {
    events.push({
      type: 'COHERENCE_VIOLATION',
      timestamp,
      severity: 1 - (metrics.omegaSem / 0.3), // Más bajo = más severo
      context: `Ω = ${metrics.omegaSem.toFixed(4)} < 0.3`
    });
  }

  // Umbral de estabilidad: V > 0.005
  if (metrics.vLyapunov > 0.005) {
    events.push({
      type: 'STABILITY_VIOLATION',
      timestamp,
      severity: Math.min(1, metrics.vLyapunov / 0.01), // Normalizado
      context: `V = ${metrics.vLyapunov.toFixed(6)} > 0.005`
    });
  }

  // Umbral de eficiencia: ε < 0.5 (violación de recursos)
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
