import { useRoute, Link } from 'wouter';
import { Home, ArrowLeft, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

export default function CaelionSessionDetail() {
  const [, params] = useRoute('/caelion/session/:sessionId');
  const sessionId = params?.sessionId || '';

  const { data, isLoading } = trpc.caelion.getSession.useQuery(
    { sessionId },
    { enabled: !!sessionId }
  );

  const handleExportCSV = () => {
    if (!data) return;

    const headers = ['Interacción', 'Mensaje Usuario', 'Respuesta Asistente', 'Ω', 'H', 'V', 'ε', 'RLD', 'Intervención LICURGO'];
    const rows = data.interactions.map(i => [
      i.interactionNumber,
      `"${i.userMessage.replace(/"/g, '""')}"`,
      `"${i.assistantResponse.replace(/"/g, '""')}"`,
      i.omegaSem.toFixed(4),
      i.hDiv.toFixed(4),
      i.vLyapunov.toFixed(4),
      i.epsilonEff.toFixed(4),
      i.rld.toFixed(4),
      i.caelionIntervention ? 'Sí' : 'No'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `caelion-session-${sessionId}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-deep-blue particles-bg">
        <div className="container mx-auto py-8">
          <Skeleton className="h-8 w-64 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-deep-blue particles-bg flex items-center justify-center">
        <Card className="p-8 bg-slate-900/50 border-cyan-500/30 text-center">
          <h2 className="text-xl font-bold text-slate-400">Sesión no encontrada</h2>
          <Link href="/caelion/history">
            <Button className="mt-4">Volver al historial</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { session, interactions } = data;

  // Preparar datos para gráficas
  const interactionNumbers = interactions.map(i => i.interactionNumber);
  const omegaData = interactions.map(i => i.omegaSem);
  const vData = interactions.map(i => i.vLyapunov);
  const rldData = interactions.map(i => i.rld);

  const phasePortraitData = interactions.map(i => ({
    x: i.omegaSem,
    y: i.hDiv,
    intervention: i.caelionIntervention
  }));

  const viablePoints = phasePortraitData.filter(p => !p.intervention);
  const interventionPoints = phasePortraitData.filter(p => p.intervention);

  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/caelion/history">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al historial
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-cyan-400 glow-text">
              Sesión CAELION
            </h1>
            <p className="text-slate-400 mt-2">
              {new Date(session.startedAt).toLocaleString('es-ES')}
            </p>
          </div>
          <Button onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>

        {/* Métricas resumen */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-slate-900/50 border-cyan-500/30">
            <div className="text-sm text-slate-400">Interacciones</div>
            <div className="text-2xl font-bold text-cyan-400">
              {session.totalInteractions}
            </div>
          </Card>
          <Card className="p-4 bg-slate-900/50 border-yellow-500/30">
            <div className="text-sm text-slate-400">Intervenciones</div>
            <div className="text-2xl font-bold text-yellow-400">
              {session.interventionCount}
            </div>
          </Card>
          <Card className="p-4 bg-slate-900/50 border-cyan-500/30">
            <div className="text-sm text-slate-400">Ω Promedio</div>
            <div className="text-2xl font-bold text-cyan-400">
              {session.avgOmega?.toFixed(3) || 'N/A'}
            </div>
          </Card>
          <Card className="p-4 bg-slate-900/50 border-green-500/30">
            <div className="text-sm text-slate-400">V Promedio</div>
            <div className="text-2xl font-bold text-green-400">
              {session.avgV?.toFixed(4) || 'N/A'}
            </div>
          </Card>
          <Card className="p-4 bg-slate-900/50 border-purple-500/30">
            <div className="text-sm text-slate-400">RLD Promedio</div>
            <div className="text-2xl font-bold text-purple-400">
              {session.avgRLD?.toFixed(3) || 'N/A'}
            </div>
          </Card>
        </div>

        {/* Gráficas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phase Portrait */}
          <Card className="p-6 bg-slate-900/50 border-cyan-500/30">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">
              Phase Portrait (H vs Ω)
            </h2>
            <Scatter
              data={{
                datasets: [
                  {
                    label: 'Trayectoria Viable',
                    data: viablePoints,
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    pointRadius: 6
                  },
                  {
                    label: 'Intervención LICURGO',
                    data: interventionPoints,
                    backgroundColor: 'rgba(251, 191, 36, 0.8)',
                    pointRadius: 8,
                    pointStyle: 'triangle'
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: { display: true, text: 'Ω (Coherencia)', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                  },
                  y: {
                    title: { display: true, text: 'H (Divergencia)', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                  }
                },
                plugins: {
                  legend: { display: true, labels: { color: '#94a3b8' } }
                }
              }}
              height={300}
            />
          </Card>

          {/* Coherencia Ω(t) */}
          <Card className="p-6 bg-slate-900/50 border-cyan-500/30">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">
              Coherencia Ω(t)
            </h2>
            <Line
              data={{
                labels: interactionNumbers,
                datasets: [
                  {
                    label: 'Ω - Coherencia Semántica',
                    data: omegaData,
                    borderColor: 'rgba(34, 197, 94, 0.8)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.3
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: { display: true, text: 'Interacción', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                  },
                  y: {
                    title: { display: true, text: 'Ω', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' },
                    min: 0,
                    max: 1
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }}
              height={300}
            />
          </Card>

          {/* Lyapunov V(t) */}
          <Card className="p-6 bg-slate-900/50 border-green-500/30">
            <h2 className="text-xl font-bold text-green-400 mb-4">
              Lyapunov V(t)
            </h2>
            <Line
              data={{
                labels: interactionNumbers,
                datasets: [
                  {
                    label: 'V - Energía de Error',
                    data: vData,
                    borderColor: 'rgba(34, 197, 94, 0.8)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.3
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: { display: true, text: 'Interacción', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                  },
                  y: {
                    title: { display: true, text: 'V (Lyapunov)', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }}
              height={300}
            />
          </Card>

          {/* RLD(t) */}
          <Card className="p-6 bg-slate-900/50 border-purple-500/30">
            <h2 className="text-xl font-bold text-purple-400 mb-4">
              RLD(t) - Margen Viable
            </h2>
            <Line
              data={{
                labels: interactionNumbers,
                datasets: [
                  {
                    label: 'RLD - Reserva de Legitimidad Dinámica',
                    data: rldData,
                    borderColor: 'rgba(168, 85, 247, 0.8)',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    tension: 0.3
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: {
                    title: { display: true, text: 'Interacción', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' }
                  },
                  y: {
                    title: { display: true, text: 'RLD (Margen Viable)', color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' },
                    ticks: { color: '#94a3b8' },
                    min: 0,
                    max: 1
                  }
                },
                plugins: {
                  legend: { display: false }
                }
              }}
              height={300}
            />
          </Card>
        </div>

        {/* Historial de interacciones */}
        <Card className="p-6 bg-slate-900/50 border-cyan-500/30">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            Historial de Interacciones
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {interactions.map(interaction => (
              <div
                key={interaction.id}
                className={`p-4 rounded border ${
                  interaction.caelionIntervention
                    ? 'bg-yellow-900/20 border-yellow-500/30'
                    : 'bg-slate-800/50 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-300">
                    Interacción #{interaction.interactionNumber}
                    {interaction.caelionIntervention && (
                      <span className="ml-2 text-yellow-400">🛡️ LICURGO</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Ω: {interaction.omegaSem.toFixed(3)} | V: {interaction.vLyapunov.toFixed(4)} | RLD: {interaction.rld.toFixed(3)}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-cyan-400 font-medium">Usuario:</span>
                    <span className="text-slate-300 ml-2">{interaction.userMessage}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-green-400 font-medium">Asistente:</span>
                    <span className="text-slate-300 ml-2">{interaction.assistantResponse}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
