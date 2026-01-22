import { SystemState } from './StateMetric';

interface ArgosCostData {
  totalCost: number;
  avgCostPerMessage: number;
  status: SystemState;
}

interface ArgosMonitorProps {
  cost: ArgosCostData;
}

/**
 * ArgosMonitor - Régimen Energético
 * 
 * Muestra costos computacionales y cognitivos del sistema.
 */
export function ArgosMonitor({ cost }: ArgosMonitorProps) {
  const stateClass = {
    NOMINAL: 'state-nominal',
    DRIFT: 'state-drift',
    CRITICAL: 'state-critical',
  }[cost.status];

  return (
    <div className="space-y-3">
      {/* Estado del Régimen */}
      <div className={`text-verdict text-xs ${stateClass}`}>
        {cost.status}
      </div>

      {/* Métricas de Costo */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-technical">Costo Total</span>
          <span className="font-mono text-sm text-gray-300">
            ${cost.totalCost.toFixed(4)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-technical">Promedio/Mensaje</span>
          <span className="font-mono text-sm text-gray-300">
            ${cost.avgCostPerMessage.toFixed(6)}
          </span>
        </div>
      </div>

      {/* Barra de Intensidad */}
      <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${stateClass === 'state-nominal' ? 'bg-state-nominal' : stateClass === 'state-drift' ? 'bg-state-drift' : 'bg-state-critical'}`}
          style={{ width: `${Math.min(cost.avgCostPerMessage * 10000, 100)}%` }}
        />
      </div>
    </div>
  );
}
