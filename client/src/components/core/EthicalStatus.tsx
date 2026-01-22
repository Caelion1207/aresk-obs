import { SystemState } from './StateMetric';

interface EthicalLog {
  id: number;
  violatedConstant: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  resolution: string;
  timestamp: Date;
}

interface EthicalStatusProps {
  logs: EthicalLog[];
  status: SystemState;
}

/**
 * EthicalStatus - Veto Ético (ETH-01)
 * 
 * Muestra violaciones éticas recientes y estado de cumplimiento.
 */
export function EthicalStatus({ logs, status }: EthicalStatusProps) {
  const stateClass = {
    NOMINAL: 'state-nominal',
    DRIFT: 'state-drift',
    CRITICAL: 'state-critical',
  }[status];

  const recentViolations = logs.slice(0, 3);
  const criticalCount = logs.filter(l => l.severity === 'CRITICAL').length;

  return (
    <div className="space-y-3">
      {/* Estado Ético */}
      <div className={`text-verdict text-xs ${stateClass}`}>
        {status}
      </div>

      {/* Contador de Violaciones */}
      <div className="flex justify-between items-center">
        <span className="text-technical">Violaciones Totales</span>
        <span className="font-mono text-sm text-gray-300">
          {logs.length}
        </span>
      </div>

      {criticalCount > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-technical">Críticas</span>
          <span className="font-mono text-sm text-state-critical">
            {criticalCount}
          </span>
        </div>
      )}

      {/* Violaciones Recientes */}
      {recentViolations.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-subtle">
          {recentViolations.map((log) => (
            <div key={log.id} className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">
                {log.violatedConstant}
              </span>
              <span 
                className={`
                  text-xs font-mono
                  ${log.severity === 'CRITICAL' ? 'text-state-critical' : ''}
                  ${log.severity === 'HIGH' ? 'text-state-drift' : ''}
                  ${log.severity === 'MEDIUM' || log.severity === 'LOW' ? 'text-gray-400' : ''}
                `}
              >
                {log.severity}
              </span>
            </div>
          ))}
        </div>
      )}

      {logs.length === 0 && (
        <div className="text-technical text-center py-4">
          Sin violaciones registradas
        </div>
      )}
    </div>
  );
}
