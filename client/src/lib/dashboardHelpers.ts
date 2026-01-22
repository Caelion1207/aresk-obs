import { SystemState } from '../components/core/StateMetric';

/**
 * Calcula el estado del sistema basado en coherencia Ω
 */
export function getOmegaStatus(omega: number): SystemState {
  if (omega > 0.85) return 'NOMINAL';
  if (omega > 0.6) return 'DRIFT';
  return 'CRITICAL';
}

/**
 * Calcula el estado del sistema basado en función de Lyapunov V(e)
 */
export function getLyapunovStatus(ve: number): SystemState {
  if (ve < 0.2) return 'NOMINAL';
  if (ve < 0.5) return 'DRIFT';
  return 'CRITICAL';
}

/**
 * Calcula el estado del sistema basado en costos ARGOS
 */
export function getArgosCostStatus(avgCostPerMessage: number): SystemState {
  if (avgCostPerMessage < 0.0001) return 'NOMINAL';
  if (avgCostPerMessage < 0.0005) return 'DRIFT';
  return 'CRITICAL';
}

/**
 * Calcula el estado ético basado en violaciones
 */
export function getEthicalStatus(violationsCount: number, criticalCount: number): SystemState {
  if (criticalCount > 0) return 'CRITICAL';
  if (violationsCount > 5) return 'DRIFT';
  return 'NOMINAL';
}

/**
 * Genera sparkline normalizada desde serie temporal
 */
export function generateSparkline(values: number[]): number[] {
  if (values.length === 0) return [];
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  if (range === 0) return values.map(() => 0.5);
  
  return values.map(v => (v - min) / range);
}

/**
 * Calcula tiempo restante formateado
 */
export function calculateTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expirado';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Extrae últimas N métricas de una sesión
 */
export function getLastNMetrics(metrics: any[], n: number = 6): number[] {
  return metrics.slice(-n).map(m => m.value || 0);
}
