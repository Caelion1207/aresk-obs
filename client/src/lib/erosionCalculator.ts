/**
 * Módulo para calcular el índice de erosión del atractor Bucéfalo
 * basado en el historial de ε_eff (campo efectivo).
 * 
 * Fidelidad dinámica: el atractor se erosiona cuando hay drenaje sostenido
 * y se regenera cuando hay acrección sostenida.
 */

interface PolarityDataPoint {
  sigmaSem: number;
  epsilonEff: number;
}

/**
 * Calcula el índice de erosión acumulado normalizado en [0, 1]
 * 
 * Lógica:
 * - ε_eff < 0 (drenaje) incrementa erosión
 * - ε_eff > 0 (acrección) reduce erosión (regeneración)
 * - La erosión acumula con memoria temporal (decay)
 * - Normalizado en [0, 1] donde 1 = erosión máxima
 * 
 * @param polarityHistory Historial completo de datos de polaridad
 * @param decayFactor Factor de decaimiento temporal (0-1), default 0.95
 * @returns Índice de erosión normalizado [0, 1]
 */
export function calculateErosionIndex(
  polarityHistory: PolarityDataPoint[],
  decayFactor: number = 0.95
): number {
  if (polarityHistory.length === 0) return 0;

  let erosionAccumulator = 0;
  const drainageWeight = 1.0; // Peso del drenaje
  const regenerationWeight = 0.8; // Peso de la regeneración (ligeramente menor)

  // Iterar sobre el historial aplicando decay temporal
  for (let i = 0; i < polarityHistory.length; i++) {
    const { epsilonEff } = polarityHistory[i];
    
    // Aplicar decay a la erosión acumulada
    erosionAccumulator *= decayFactor;
    
    if (epsilonEff < 0) {
      // Drenaje: incrementa erosión proporcionalmente
      erosionAccumulator += Math.abs(epsilonEff) * drainageWeight;
    } else if (epsilonEff > 0) {
      // Acrección: reduce erosión (regeneración)
      erosionAccumulator -= epsilonEff * regenerationWeight;
    }
    
    // Mantener en rango [0, +∞)
    erosionAccumulator = Math.max(0, erosionAccumulator);
  }

  // Normalizar a [0, 1] usando función sigmoide suave
  // Umbral de saturación en erosionAccumulator ≈ 3.0
  const normalized = erosionAccumulator / (erosionAccumulator + 3.0);
  
  return Math.min(1, Math.max(0, normalized));
}

/**
 * Calcula el nivel de erosión instantáneo basado en ventana deslizante
 * Útil para detectar drenaje reciente sin considerar historia completa
 * 
 * @param polarityHistory Historial completo
 * @param windowSize Tamaño de ventana temporal (últimos N pasos)
 * @returns Erosión instantánea [0, 1]
 */
export function calculateInstantaneousErosion(
  polarityHistory: PolarityDataPoint[],
  windowSize: number = 5
): number {
  if (polarityHistory.length === 0) return 0;

  // Tomar últimos N puntos
  const recentData = polarityHistory.slice(-windowSize);
  
  // Promedio de ε_eff en ventana
  const avgEpsilonEff = recentData.reduce((sum, p) => sum + p.epsilonEff, 0) / recentData.length;
  
  // Convertir a índice de erosión
  // ε_eff = -1 → erosión = 1
  // ε_eff = 0 → erosión = 0.5
  // ε_eff = +1 → erosión = 0
  const erosion = 0.5 - avgEpsilonEff * 0.5;
  
  return Math.min(1, Math.max(0, erosion));
}

/**
 * Determina el nivel de severidad de la erosión
 */
export function getErosionSeverity(erosionIndex: number): {
  level: "none" | "low" | "moderate" | "high" | "critical";
  label: string;
  color: string;
} {
  if (erosionIndex < 0.2) {
    return {
      level: "none",
      label: "Sin erosión",
      color: "oklch(0.6 0.15 150)", // Verde
    };
  } else if (erosionIndex < 0.4) {
    return {
      level: "low",
      label: "Erosión leve",
      color: "oklch(0.75 0.15 90)", // Amarillo
    };
  } else if (erosionIndex < 0.6) {
    return {
      level: "moderate",
      label: "Erosión moderada",
      color: "oklch(0.65 0.2 50)", // Naranja
    };
  } else if (erosionIndex < 0.8) {
    return {
      level: "high",
      label: "Erosión alta",
      color: "oklch(0.55 0.25 25)", // Rojo
    };
  } else {
    return {
      level: "critical",
      label: "Erosión crítica",
      color: "oklch(0.45 0.3 15)", // Rojo oscuro
    };
  }
}

/**
 * Calcula parámetros de renderizado del atractor erosionado
 */
export function getAttractorRenderParams(erosionIndex: number): {
  opacity: number;
  fragmentationLevel: number; // 0-1, cuánto fragmentar el borde
  pulseIntensity: number; // 0-1, intensidad de pulsación
  radiusScale: number; // Factor de escala del radio
  irregularityAmplitude: number; // Amplitud de irregularidad del borde
} {
  // Opacidad: 1.0 sin erosión → 0.3 con erosión máxima
  const opacity = 1.0 - erosionIndex * 0.7;
  
  // Fragmentación: 0 sin erosión → 1 con erosión máxima
  const fragmentationLevel = erosionIndex;
  
  // Pulsación: aumenta con erosión, máxima cuando crítica
  const pulseIntensity = Math.min(1, erosionIndex * 1.5);
  
  // Escala de radio: reduce ligeramente con erosión
  const radiusScale = 1.0 - erosionIndex * 0.3;
  
  // Irregularidad del borde: aumenta con erosión
  const irregularityAmplitude = erosionIndex * 15; // Máximo 15px de desplazamiento
  
  return {
    opacity,
    fragmentationLevel,
    pulseIntensity,
    radiusScale,
    irregularityAmplitude,
  };
}
