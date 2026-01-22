import { useEffect, useState } from 'react';
import { trpc } from '../lib/trpc';
import { DeepCard } from '../components/core/DeepCard';
import { StateMetric, SystemState } from '../components/core/StateMetric';
import { InterpretationTooltip } from '../components/core/InterpretationTooltip';
import { PhaseTimeline, CyclePhase } from '../components/core/PhaseTimeline';
import { ArgosMonitor } from '../components/core/ArgosMonitor';
import { EthicalStatus } from '../components/core/EthicalStatus';
import {
  getOmegaStatus,
  getLyapunovStatus,
  getArgosCostStatus,
  getEthicalStatus,
  generateSparkline,
  calculateTimeRemaining,
  getLastNMetrics,
} from '../lib/dashboardHelpers';

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
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Consultas tRPC con auto-refresh
  const { data: cycleData, refetch: refetchCycles } = trpc.cycles.listActive.useQuery();
  const { data: healthSummary, refetch: refetchHealth } = trpc.health.summary.useQuery();
  const { data: metricsData, refetch: refetchMetrics } = trpc.health.metrics.useQuery();
  
  // Obtener sesión activa más reciente para métricas ARESK
  const { data: userSessions } = trpc.session.list.useQuery();
  const activeSession = userSessions?.[0];
  const { data: sessionMetrics } = trpc.metrics.getSessionMetrics.useQuery(
    { sessionId: activeSession?.id || 0 },
    { enabled: !!activeSession }
  );

  // Auto-refresh cada 5 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchCycles();
      refetchHealth();
      refetchMetrics();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refetchCycles, refetchHealth, refetchMetrics]);

  // Datos del ciclo activo
  const activeCycle = cycleData?.[0];
  const cyclePhase: CyclePhase = (activeCycle?.status as CyclePhase) || 'INIT';
  const timeRemaining = activeCycle 
    ? calculateTimeRemaining(new Date(activeCycle.scheduledEndAt))
    : 'N/A';

  // Métricas de estabilidad ARESK
  const lastMetrics = sessionMetrics?.slice(-6) || [];
  const omegaValues = lastMetrics.map((m: any) => m.coherenciaObservable || 0);
  const veValues = lastMetrics.map((m: any) => m.funcionLyapunov || 0);
  
  const currentOmega = omegaValues[omegaValues.length - 1] || 0;
  const currentVe = veValues[veValues.length - 1] || 0;
  
  const omegaStatus = getOmegaStatus(currentOmega);
  const veStatus = getLyapunovStatus(currentVe);
  
  const omegaSparkline = generateSparkline(omegaValues);
  const veSparkline = generateSparkline(veValues);

  // Datos de costos ARGOS
  const totalCommands = metricsData?.commands.total || 0;
  const avgCostPerMessage = 0.000042; // Placeholder - necesita endpoint de argosCosts
  const argosCost = {
    totalCost: totalCommands * avgCostPerMessage,
    avgCostPerMessage,
    status: getArgosCostStatus(avgCostPerMessage),
  };

  // Estado ético
  const ethicalViolations = metricsData?.counters['ethical.violations']?.count || 0;
  const ethicalStatus = getEthicalStatus(ethicalViolations, 0);

  return (
    <div className="min-h-screen bg-void p-6 font-mono text-gray-400">
      {/* Header con controles */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-verdict text-2xl text-gray-300">CORE DASHBOARD</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`
              px-4 py-2 rounded border text-xs font-mono
              ${autoRefresh 
                ? 'border-state-nominal text-state-nominal' 
                : 'border-gray-600 text-gray-600'}
            `}
          >
            AUTO-REFRESH: {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <span className="text-technical">
            {new Date().toLocaleTimeString('es-ES')}
          </span>
        </div>
      </div>

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
              {healthSummary?.alerts && healthSummary.alerts.length > 0 ? (
                <div className="space-y-2">
                  {healthSummary.alerts
                    .filter(a => a.includes('COM-72'))
                    .map((alert, idx) => (
                      <div key={idx} className="text-left text-state-drift">
                        {alert}
                      </div>
                    ))}
                </div>
              ) : (
                'Sin violaciones COM-72 registradas'
              )}
            </div>
          </DeepCard>
        </section>

        {/* COLUMNA 2: ESTABILIDAD SEMÁNTICA (ARESK) */}
        <section className="flex flex-col gap-4">
          <InterpretationTooltip
            law="ARESK Coherencia (Ω)"
            value={currentOmega.toFixed(3)}
            interpretation="La coherencia Ω mide la estabilidad narrativa del sistema. Valores >0.85 indican operación nominal. Valores <0.6 señalan deriva semántica crítica que requiere intervención."
          >
            <DeepCard title="COHERENCIA (Ω)">
              <StateMetric
                value={currentOmega}
                type="STABILITY"
                status={omegaStatus}
                unit="Ω"
                sparkline={omegaSparkline}
              />
            </DeepCard>
          </InterpretationTooltip>

          <InterpretationTooltip
            law="ARESK Resiliencia V(e)"
            value={currentVe.toFixed(3)}
            interpretation="La función de Lyapunov V(e) cuantifica el coste de estabilidad. Valores <0.2 indican control efectivo. Valores >0.5 señalan crisis de estabilidad con alto coste energético."
          >
            <DeepCard title="RESILIENCIA (V(e))">
              <StateMetric
                value={currentVe}
                type="RESISTANCE"
                status={veStatus}
                unit="V(e)"
                sparkline={veSparkline}
              />
            </DeepCard>
          </InterpretationTooltip>

          {!activeSession && (
            <div className="text-technical text-center py-4 border border-subtle rounded">
              No hay sesión activa. Inicia una sesión en el Simulador para ver métricas ARESK.
            </div>
          )}
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
