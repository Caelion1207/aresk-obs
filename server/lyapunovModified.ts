/**
 * Módulo de cálculo de la Función de Lyapunov Modificada
 * Integra polaridad semántica para detectar "coherencia tóxica"
 * 
 * V_modificada(e, ε_eff) = V_base(e) - α × ε_eff
 * 
 * Donde:
 * - V_base(e): Función de Lyapunov canónica normalizada [0,1]
 * - ε_eff: Campo efectivo = Ω(t) × σ_sem(t)
 * - α: Factor de penalización semántica (configurable por sesión)
 * 
 * Comportamiento:
 * - Si ε_eff < 0 (drenaje): V_modificada aumenta → inestabilidad oculta
 * - Si ε_eff > 0 (acreción): V_modificada disminuye → construcción recompensada
 */

/**
 * Calcula la función de Lyapunov modificada
 * @param vBase - V_base(e): función de Lyapunov canónica [0,1]
 * @param epsilonEff - ε_eff: campo efectivo de polaridad semántica
 * @param alpha - α: factor de penalización (típicamente 0.2-0.5)
 * @returns V_modificada sin normalizar
 */
export function calculateModifiedLyapunov(
  vBase: number,
  epsilonEff: number,
  alpha: number
): number {
  // V_modificada = V_base - α × ε_eff
  // Nota: ε_eff negativo (drenaje) aumenta V_modificada
  const vModified = vBase - alpha * epsilonEff;
  
  return vModified;
}

/**
 * Normaliza V_modificada al rango [0,1] para visualización
 * Usa soft clipping para preservar información de valores extremos
 * @param vModified - V_modificada sin normalizar
 * @returns V_modificada normalizada [0,1]
 */
export function normalizeModifiedLyapunov(vModified: number): number {
  // Soft clipping con función sigmoide desplazada
  // Mapea [-0.5, 1.5] → [0, 1] con transición suave
  const k = 4; // Factor de suavidad
  const center = 0.5;
  
  const normalized = 1 / (1 + Math.exp(-k * (vModified - center)));
  
  return Math.max(0, Math.min(1, normalized));
}

/**
 * Detecta "coherencia tóxica": alta coherencia con drenaje semántico
 * @param omega - Coherencia observable Ω(t)
 * @param sigmaSem - Signo semántico σ_sem(t)
 * @param vModified - V_modificada
 * @returns true si se detecta coherencia tóxica
 */
export function detectToxicCoherence(
  omega: number,
  sigmaSem: number,
  vModified: number
): boolean {
  // Coherencia tóxica: Ω alto, σ_sem negativo, V_modificada alto
  const highCoherence = omega > 0.7;
  const negativeSemantic = sigmaSem < -0.3;
  const highModifiedV = vModified > 0.5;
  
  return highCoherence && negativeSemantic && highModifiedV;
}

/**
 * Calcula el "índice de erosión estructural"
 * Mide qué tan rápido se está degradando la base ontológica
 * @param epsilonEff - Campo efectivo actual
 * @param vBase - V_base actual
 * @returns Índice de erosión [0,1], donde 1 es erosión crítica
 */
export function calculateErosionIndex(
  epsilonEff: number,
  vBase: number
): number {
  if (epsilonEff >= 0) return 0; // Sin erosión si hay acreción
  
  // Erosión proporcional al drenaje y a la cercanía al atractor
  // Más peligroso cuando V_base es bajo (cerca del atractor) pero hay drenaje
  const drainageFactor = Math.abs(epsilonEff);
  const proximityFactor = 1 - vBase; // Mayor cuando V_base es bajo
  
  const erosionIndex = drainageFactor * (0.5 + 0.5 * proximityFactor);
  
  return Math.min(1, erosionIndex);
}

/**
 * Determina el nivel de alerta basado en V_modificada y erosión
 * @param vModified - V_modificada normalizada
 * @param erosionIndex - Índice de erosión [0,1]
 * @returns Nivel de alerta
 */
export function getAlertLevel(
  vModified: number,
  erosionIndex: number
): "none" | "info" | "warning" | "critical" {
  if (erosionIndex > 0.7 || vModified > 0.8) return "critical";
  if (erosionIndex > 0.4 || vModified > 0.6) return "warning";
  if (erosionIndex > 0.2 || vModified > 0.4) return "info";
  return "none";
}
