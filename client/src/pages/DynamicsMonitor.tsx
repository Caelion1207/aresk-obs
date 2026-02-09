import { useEffect, useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Activity, TrendingUp, Zap, Target } from 'lucide-react';
import { useLocation } from 'wouter';

Chart.register(...registerables);

/**
 * ARESK-OBS | Dynamics Monitor
 * 
 * Centro de monitoreo dinámico con:
 * - Visualizaciones originales del LAB (phase portrait, Lyapunov, error-control)
 * - Capa de viabilidad (núcleo K, RLD(t), trayectorias viables)
 * - Datos reales de experiment_interactions (B-1, C-1)
 */

export default function DynamicsMonitor() {
  const [, setLocation] = useLocation();
  const [selectedRegime, setSelectedRegime] = useState<'B-1' | 'C-1'>('B-1');
  const [selectedExperiment, setSelectedExperiment] = useState<string>('');
  
  // Queries para datos reales
  const { data: experiments } = trpc.experiments.getAll.useQuery();
  const { data: interactions } = trpc.experiments.getInteractions.useQuery({ experimentId: selectedExperiment }, {
    enabled: !!selectedExperiment
  });
  
  // Actualizar selectedExperiment cuando cambia el régimen
  useEffect(() => {
    if (experiments && experiments.length > 0) {
      const exp = experiments.find(e => e.experimentId.startsWith(selectedRegime));
      if (exp) {
        setSelectedExperiment(exp.experimentId);
      }
    }
  }, [selectedRegime, experiments]);
  
  // Referencias para charts
  const phasePortraitRef = useRef<HTMLCanvasElement>(null);
  const lyapunovRef = useRef<HTMLCanvasElement>(null);
  const rldRef = useRef<HTMLCanvasElement>(null);
  const errorControlRef = useRef<HTMLCanvasElement>(null);
  
  const phaseChartInstance = useRef<Chart | null>(null);
  const lyapunovChartInstance = useRef<Chart | null>(null);
  const rldChartInstance = useRef<Chart | null>(null);
  const errorControlChartInstance = useRef<Chart | null>(null);

  // Obtener experimento actual
  const currentExperiment = experiments?.find(e => e.experimentId === selectedExperiment);
  const hasCAELION = currentExperiment?.hasCAELION || false;

  // Calcular RLD (Reserva de Legitimidad Dinámica) a partir de métricas
  // RLD = función de margen viable basada en Ω y H
  const calculateRLD = (omega: number, h: number): number => {
    // RLD = 1 - (distancia al núcleo de viabilidad)
    // Núcleo K definido por: Ω > 0.3 y H < 0.1
    const omegaMargin = Math.max(0, omega - 0.3);
    const hMargin = Math.max(0, 0.1 - h);
    const distance = Math.sqrt(omegaMargin ** 2 + hMargin ** 2);
    return Math.max(0, 1 - distance * 2);
  };

  // Phase Portrait: H vs Ω con núcleo de viabilidad
  useEffect(() => {
    if (!phasePortraitRef.current || !interactions) return;

    if (phaseChartInstance.current) {
      phaseChartInstance.current.destroy();
    }

    const ctx = phasePortraitRef.current.getContext('2d');
    if (!ctx) return;

    // Preparar datos de trayectoria
    const trajectoryData = interactions.map(i => ({
      x: i.omegaSem,
      y: i.hDiv,
      viable: calculateRLD(i.omegaSem, i.hDiv) > 0.5,
      caelionIntervened: i.caelionIntervened || false
    }));

    // Núcleo de viabilidad K (región rectangular)
    const viabilityCoreData = [
      { x: 0.3, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0.1 },
      { x: 0.3, y: 0.1 },
      { x: 0.3, y: 0 }
    ];

    const config: ChartConfiguration = {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Núcleo de Viabilidad K',
            data: viabilityCoreData,
            borderColor: 'rgba(34, 197, 94, 0.3)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            fill: true,
            order: 3
          },
          {
            label: 'Trayectoria Viable',
            data: trajectoryData.filter(d => d.viable).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            pointRadius: 5,
            pointHoverRadius: 7,
            order: 2
          },
          {
            label: 'Trayectoria No Viable',
            data: trajectoryData.filter(d => !d.viable).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: 'rgba(239, 68, 68, 1)',
            pointRadius: 5,
            pointHoverRadius: 7,
            order: 2
          },
          ...(hasCAELION ? [{
            label: 'Intervención CAELION',
            data: trajectoryData.filter(d => d.caelionIntervened).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(251, 191, 36, 1)',
            borderColor: 'rgba(251, 191, 36, 1)',
            pointRadius: 8,
            pointStyle: 'triangle',
            pointHoverRadius: 10,
            order: 1
          }] : [])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Phase Portrait: H vs Ω con Núcleo de Viabilidad',
            color: '#06b6d4',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            labels: { color: '#94a3b8' }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const point = context.parsed;
                if (point.x === null || point.y === null) return '';
                const rld = calculateRLD(point.x, point.y);
                return `Ω: ${point.x.toFixed(4)}, H: ${point.y.toFixed(4)}, RLD: ${rld.toFixed(3)}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Ω (Coherencia Observable)', color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            title: { display: true, text: 'H (Divergencia Entrópica)', color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    };

    phaseChartInstance.current = new Chart(ctx, config);
  }, [interactions, hasCAELION]);

  // Lyapunov V(t) temporal
  useEffect(() => {
    if (!lyapunovRef.current || !interactions) return;

    if (lyapunovChartInstance.current) {
      lyapunovChartInstance.current.destroy();
    }

    const ctx = lyapunovRef.current.getContext('2d');
    if (!ctx) return;

    const labels = interactions.map((_, i) => i + 1);
    const vData = interactions.map(i => i.vLyapunov);
    const v2Data = interactions.map(i => i.vLyapunov ** 2);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'V(t) - Función de Lyapunov',
            data: vData,
            borderColor: 'rgba(59, 130, 246, 1)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
          },
          {
            label: 'V²(t) - Energía de Error',
            data: v2Data,
            borderColor: 'rgba(168, 85, 247, 1)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Lyapunov V(t) y V²(t) Temporal',
            color: '#06b6d4',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            labels: { color: '#94a3b8' }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Interacción (t)', color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            title: { display: true, text: 'V / V²', color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    };

    lyapunovChartInstance.current = new Chart(ctx, config);
  }, [interactions]);

  // RLD(t) con umbrales de viabilidad
  useEffect(() => {
    if (!rldRef.current || !interactions) return;

    if (rldChartInstance.current) {
      rldChartInstance.current.destroy();
    }

    const ctx = rldRef.current.getContext('2d');
    if (!ctx) return;

    const labels = interactions.map((_, i) => i + 1);
    const rldData = interactions.map(i => calculateRLD(i.omegaSem, i.hDiv));
    
    // Umbrales de viabilidad
    const thresholdViable = Array(interactions.length).fill(0.5);
    const thresholdCritical = Array(interactions.length).fill(0.3);

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'RLD(t) - Reserva de Legitimidad Dinámica',
            data: rldData,
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.2
          },
          {
            label: 'Umbral Viable (0.5)',
            data: thresholdViable,
            borderColor: 'rgba(251, 191, 36, 0.6)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Umbral Crítico (0.3)',
            data: thresholdCritical,
            borderColor: 'rgba(239, 68, 68, 0.6)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'RLD(t) - Reserva de Legitimidad Dinámica con Umbrales',
            color: '#06b6d4',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            labels: { color: '#94a3b8' }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Interacción (t)', color: '#94a3b8' },
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
        }
      }
    };

    rldChartInstance.current = new Chart(ctx, config);
  }, [interactions]);

  // Error-Control Phase: RLD vs Costo V
  useEffect(() => {
    if (!errorControlRef.current || !interactions) return;

    if (errorControlChartInstance.current) {
      errorControlChartInstance.current.destroy();
    }

    const ctx = errorControlRef.current.getContext('2d');
    if (!ctx) return;

    const errorControlData = interactions.map(i => ({
      x: i.vLyapunov,
      y: calculateRLD(i.omegaSem, i.hDiv),
      caelionIntervened: i.caelionIntervened
    }));

    const config: ChartConfiguration = {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Trayectoria Error-Control',
            data: errorControlData.filter(d => !d.caelionIntervened).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            pointRadius: 5,
            pointHoverRadius: 7
          },
          ...(hasCAELION ? [{
            label: 'Intervención CAELION',
            data: errorControlData.filter(d => d.caelionIntervened).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(251, 191, 36, 1)',
            borderColor: 'rgba(251, 191, 36, 1)',
            pointRadius: 8,
            pointStyle: 'triangle',
            pointHoverRadius: 10
          }] : [])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Fase Error-Control: RLD vs Costo V',
            color: '#06b6d4',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            labels: { color: '#94a3b8' }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'V (Costo de Control)', color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            title: { display: true, text: 'RLD (Margen Viable)', color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    };

    errorControlChartInstance.current = new Chart(ctx, config);
  }, [interactions, hasCAELION]);

  // Función de exportación CSV
  const exportToCSV = () => {
    if (!interactions || interactions.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Calcular RLD para cada interacción
    const csvData = interactions.map((interaction, index) => {
      const rld = calculateRLD(interaction.omegaSem, interaction.hDiv);
      return {
        interactionIndex: index + 1,
        omega: interaction.omegaSem.toFixed(6),
        v: interaction.vLyapunov.toFixed(6),
        epsilon: interaction.epsilonEff.toFixed(6),
        h: interaction.hDiv.toFixed(6),
        rld: rld.toFixed(6),
        caelionIntervened: interaction.caelionIntervened ? '1' : '0',
      };
    });

    // Generar CSV
    const headers = ['Interaction', 'Omega(t)', 'V(t)', 'Epsilon(t)', 'H(t)', 'RLD(t)', 'CAELION_Intervened'];
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => `${row.interactionIndex},${row.omega},${row.v},${row.epsilon},${row.h},${row.rld},${row.caelionIntervened}`)
    ].join('\n');

    // Descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `aresk-obs-${selectedRegime}-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!interactions || !currentExperiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-lg">Cargando datos experimentales...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Button
          variant="ghost"
          onClick={() => setLocation('/')}
          className="mb-4 text-cyan-400 hover:text-cyan-300"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">
              ARESK-OBS | Dynamics Monitor
            </h1>
            <p className="text-slate-400">
              Monitoreo dinámico de estados, estabilidad y margen viable
            </p>
          </div>

          <div className="flex gap-4">
            <Select value={selectedRegime} onValueChange={(v) => setSelectedRegime(v as 'B-1' | 'C-1')}>
              <SelectTrigger className="w-64 bg-slate-900/50 border-cyan-500/30 text-cyan-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-cyan-500/30">
                <SelectItem value="B-1">
                  Régimen B-1 (tipo_b, sin CAELION)
                </SelectItem>
                <SelectItem value="C-1">
                  Régimen C-1 (acoplada, con CAELION)
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={() => exportToCSV()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Exportar CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Métricas agregadas */}
      <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4 mb-8">
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Coherencia Ω
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {currentExperiment.avgOmegaSem?.toFixed(4) || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Lyapunov V
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {currentExperiment.avgVLyapunov?.toFixed(4) || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Eficiencia ε
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {currentExperiment.avgEpsilonEff?.toFixed(4) || 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Divergencia H
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {currentExperiment.avgHDiv?.toFixed(4) || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualizaciones dinámicas */}
      <div className="max-w-7xl mx-auto grid grid-cols-2 gap-6">
        {/* Phase Portrait */}
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Phase Portrait</CardTitle>
            <CardDescription className="text-slate-400">
              Trayectoria H vs Ω con núcleo de viabilidad K (Aubin)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={phasePortraitRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Lyapunov V(t) */}
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Lyapunov V(t)</CardTitle>
            <CardDescription className="text-slate-400">
              Función de Lyapunov y energía de error temporal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={lyapunovRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* RLD(t) */}
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">RLD(t) - Reserva de Legitimidad Dinámica</CardTitle>
            <CardDescription className="text-slate-400">
              Margen viable con umbrales críticos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={rldRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Error-Control Phase */}
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Fase Error-Control</CardTitle>
            <CardDescription className="text-slate-400">
              RLD vs Costo V con intervenciones CAELION
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <canvas ref={errorControlRef}></canvas>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información del experimento */}
      <div className="max-w-7xl mx-auto mt-8">
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Información del Experimento</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-semibold">Régimen:</span> {currentExperiment.regime}
              </div>
              <div>
                <span className="font-semibold">CAELION:</span> {hasCAELION ? 'Activo' : 'Inactivo'}
              </div>
              <div>
                <span className="font-semibold">Interacciones:</span> {currentExperiment.totalInteractions}
              </div>
              <div>
                <span className="font-semibold">Encoder:</span> {currentExperiment.encoderModel}
              </div>
              <div>
                <span className="font-semibold">Dimensión:</span> {currentExperiment.encoderDimension}D
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {currentExperiment.status}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
