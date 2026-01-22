export type SystemState = 'NOMINAL' | 'DRIFT' | 'CRITICAL';

export interface MetricFrame {
  timestamp: number;
  value: number;       // El dato crudo (0.0 - 1.0)
  state: SystemState;  // El veredicto de ARESK (Inyectado)
  context?: string;    // "ETH-01 Warning", etc.
}
