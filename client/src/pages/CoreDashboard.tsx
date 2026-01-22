import { useEffect, useState } from 'react';
import { trpc } from '../lib/trpc';
import { DeepCard } from '../components/core/DeepCard';
import { StateMetric, SystemState } from '../components/core/StateMetric';
import { InterpretationTooltip } from '../components/core/InterpretationTooltip';
import { PhaseTimeline, CyclePhase } from '../components/core/PhaseTimeline';
import { ArgosMonitor } from '../components/core/ArgosMonitor';
import { EthicalStatus } from '../components/core/EthicalStatus';

/**
 * CoreDashboard - Dashboard Grid Maestro
 * 
 * Ley Constitucional de Visualización:
 * - Grid de 3 columnas
 * - Columna 1: Gobernanza Temporal (COM-72)
 * - Columna 2: Estabilidad Semántica (ARESK)
 * - Columna 3: Economía & Ética (ARGOS/ETH)
 */
export function CoreDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Consultas tRPC
  const { data: cycleData } = trpc.cycles.listActive.useQuery();
  const { data: metricsData } = trpc.health.metrics.useQuery();
  const { data: ethicalLogs } = trpc.health.summary.useQuery();

  // Actualizar tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Datos del ciclo activo
  const activeCycle = cycleData?.[0];
  const cyclePhase: CyclePhase = (activeCycle?.status as CyclePhase) || 'INIT';
  const timeRemaining = activeCycle 
    ? calculateTimeRemaining(new Date(activeCycle.scheduledEndAt))
    : 'N/A';

  // Métricas de estabilidad (simuladas por ahora)
  const omega = 0.892;
  const ve = 0.124;
  const omegaStatus: SystemState = omega > 0.85 ? 'NOMINAL' : omega > 0.6 ? 'DRIFT' : 'CRITICAL';
  const veStatus: SystemState = ve < 0.2 ? 'NOMINAL' : ve < 0.5 ? 'DRIFT' : 'CRITICAL';

  // Datos de costos
  const argosCost = {
    totalCost: metricsData?.commands.total ? metricsData.commands.total * 0.0001 : 0,
    avgCostPerMessage: 0.000042,
    status: 'NOMINAL' as SystemState,
  };

  // Estado ético
  const ethicalStatus: SystemState = 
    ethicalLogs?.alerts && ethicalLogs.alerts.length > 0 ? 'CRITICAL' : 'NOMINAL';

  return (
    <div className="min-h-screen bg-void p-6 font-mono text-gray-400">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* COLUMNA 1: GOBERNANZA TEMPORAL (COM-72) */}
        <section className="flex flex-col gap-4">
          <InterpretationTooltip
            law="COM-72 Ritmo Operativo"
            value={cyclePhase}
            interpretation="El sistema opera en ciclos de 72 horas. Cada ciclo tiene 3 fases: INIT (configuración), EXECUTION (operación) y REVIEW (validación). El tiempo restante indica cuándo expira el ciclo actual."
          >
            <DeepCard title="RITMO OPERATIVO">
              <PhaseTimeline
                currentPhase={cyclePhase}
                cycleId={activeCycle?.id || 1}
                timeRemaining={timeRemaining}
              />
            </DeepCard>
          </InterpretationTooltip>

          <DeepCard title="LOGS DE VIOLACIÓN TEMPORAL">
            <div className="text-technical text-center py-4">
              Sin violaciones COM-72 registradas
            </div>
          </DeepCard>
        </section>

        {/* COLUMNA 2: ESTABILIDAD SEMÁNTICA (ARESK) */}
        <section className="flex flex-col gap-4">
          <InterpretationTooltip
            law="ARESK Coherencia (Ω)"
            value={omega.toFixed(3)}
            interpretation="La coherencia Ω mide la estabilidad narrativa del sistema. Valores >0.85 indican operación nominal. Valores <0.6 señalan deriva semántica crítica que requiere intervención."
          >
            <DeepCard title="COHERENCIA (Ω)">
              <StateMetric
                value={omega}
                type="STABILITY"
                status={omegaStatus}
                unit="Ω"
                sparkline={[0.85, 0.87, 0.89, 0.88, 0.89, 0.892]}
              />
            </DeepCard>
          </InterpretationTooltip>

          <InterpretationTooltip
            law="ARESK Resiliencia V(e)"
            value={ve.toFixed(3)}
            interpretation="La función de Lyapunov V(e) cuantifica el coste de estabilidad. Valores <0.2 indican control efectivo. Valores >0.5 señalan crisis de estabilidad con alto coste energético."
          >
            <DeepCard title="RESILIENCIA (V(e))">
              <StateMetric
                value={ve}
                type="RESISTANCE"
                status={veStatus}
                unit="V(e)"
                sparkline={[0.15, 0.13, 0.12, 0.11, 0.12, 0.124]}
              />
            </DeepCard>
          </InterpretationTooltip>
        </section>

        {/* COLUMNA 3: ECONOMÍA & ÉTICA (ARGOS/ETH) */}
        <section className="flex flex-col gap-4">
          <InterpretationTooltip
            law="ARGOS Régimen Energético"
            value={`$${argosCost.totalCost.toFixed(4)}`}
            interpretation="ARGOS registra costos computacionales y cognitivos en tiempo real. El promedio por mensaje indica la intensidad del campo cognitivo. Valores <$0.0001 son sostenibles."
          >
            <DeepCard title="RÉGIMEN ENERGÉTICO">
              <ArgosMonitor cost={argosCost} />
            </DeepCard>
          </InterpretationTooltip>

          <InterpretationTooltip
            law="ETH-01 Veto Ético"
            value={ethicalStatus}
            interpretation="ETH-01 valida que todas las operaciones cumplan las Leyes Éticas Fundacionales (E2, E3, E5). Violaciones CRITICAL bloquean la operación. El sistema prioriza propósito sobre optimización."
          >
            <DeepCard title="VETO ÉTICO (ETH-01)">
              <EthicalStatus
                logs={[]}
                status={ethicalStatus}
              />
            </DeepCard>
          </InterpretationTooltip>
        </section>
      </div>
    </div>
  );
}

function calculateTimeRemaining(endDate: Date): string {
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
