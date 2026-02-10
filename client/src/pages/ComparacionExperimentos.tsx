import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { TrendingUp, TrendingDown, Minus, Shield, AlertTriangle, Activity } from "lucide-react";

Chart.register(...registerables);

export default function ComparacionExperimentos() {
  const { data: experiments, isLoading } = trpc.experiments.getComparison.useQuery({
    experimentIds: ['B-1-1770623178573', 'C-1-1770628250311']
  });

  // Referencias para charts B-1
  const phasePortraitB1Ref = useRef<HTMLCanvasElement>(null);
  const lyapunovB1Ref = useRef<HTMLCanvasElement>(null);
  const rldB1Ref = useRef<HTMLCanvasElement>(null);

  const phaseChartB1Instance = useRef<Chart | null>(null);
  const lyapunovChartB1Instance = useRef<Chart | null>(null);
  const rldChartB1Instance = useRef<Chart | null>(null);

  // Referencias para charts C-1
  const phasePortraitC1Ref = useRef<HTMLCanvasElement>(null);
  const lyapunovC1Ref = useRef<HTMLCanvasElement>(null);
  const rldC1Ref = useRef<HTMLCanvasElement>(null);

  const phaseChartC1Instance = useRef<Chart | null>(null);
  const lyapunovChartC1Instance = useRef<Chart | null>(null);
  const rldChartC1Instance = useRef<Chart | null>(null);

  // Cargar interacciones para ambos experimentos
  const { data: interactionsB1 } = trpc.experiments.getInteractions.useQuery(
    { experimentId: 'B-1-1770623178573' },
    { enabled: !!experiments }
  );
  const { data: interactionsC1 } = trpc.experiments.getInteractions.useQuery(
    { experimentId: 'C-1-1770628250311' },
    { enabled: !!experiments }
  );

  // Calcular RLD desde métricas
  const calculateRLD = (omega: number, h: number): number => {
    const omegaMargin = Math.max(0, omega - 0.6);
    const hMargin = Math.max(0, 0.05 - h);
    const distance = Math.sqrt(omegaMargin ** 2 + hMargin ** 2);
    return Math.max(0, 1 - distance * 2);
  };

  // Obtener escalas globales para sincronización
  const getGlobalScales = () => {
    if (!interactionsB1 || !interactionsC1) return null;

    const allOmega = [...interactionsB1.map(i => i.omegaSem), ...interactionsC1.map(i => i.omegaSem)];
    const allH = [...interactionsB1.map(i => i.hDiv), ...interactionsC1.map(i => i.hDiv)];
    const allV = [...interactionsB1.map(i => i.vLyapunov), ...interactionsC1.map(i => i.vLyapunov)];
    const allRLD = [
      ...interactionsB1.map(i => calculateRLD(i.omegaSem, i.hDiv)),
      ...interactionsC1.map(i => calculateRLD(i.omegaSem, i.hDiv))
    ];

    return {
      omega: { min: Math.min(...allOmega), max: Math.max(...allOmega) },
      h: { min: Math.min(...allH), max: Math.max(...allH) },
      v: { min: Math.min(...allV), max: Math.max(...allV) },
      rld: { min: Math.min(...allRLD), max: Math.max(...allRLD) }
    };
  };

  // Renderizar Phase Portrait para B-1
  useEffect(() => {
    if (!phasePortraitB1Ref.current || !interactionsB1 || !interactionsC1) return;

    if (phaseChartB1Instance.current) {
      phaseChartB1Instance.current.destroy();
    }

    const ctx = phasePortraitB1Ref.current.getContext('2d');
    if (!ctx) return;

    const scales = getGlobalScales();
    if (!scales) return;

    const trajectoryData = interactionsB1.map(i => ({
      x: i.omegaSem,
      y: i.hDiv,
      viable: i.omegaSem >= 0.6
    }));

    const viabilityCoreData = [
      { x: 0.6, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0.05 },
      { x: 0.6, y: 0.05 },
      { x: 0.6, y: 0 }
    ];

    const config: ChartConfiguration = {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Núcleo K (Ω≥0.6)',
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
            label: 'Viable',
            data: trajectoryData.filter(d => d.viable).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(59, 130, 246, 1)',
            pointRadius: 5,
            order: 2
          },
          {
            label: 'No Viable',
            data: trajectoryData.filter(d => !d.viable).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: 'rgba(239, 68, 68, 1)',
            pointRadius: 5,
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'B-1: Phase Portrait (H vs Ω)',
            color: '#ef4444',
            font: { size: 14, weight: 'bold' }
          },
          legend: {
            display: true,
            labels: { color: '#94a3b8', font: { size: 10 } }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Ω (Coherencia)', color: '#94a3b8' },
            min: Math.max(0, scales.omega.min - 0.1),
            max: Math.min(1, scales.omega.max + 0.1),
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y: {
            title: { display: true, text: 'H (Entropía)', color: '#94a3b8' },
            min: Math.max(0, scales.h.min - 0.01),
            max: scales.h.max + 0.01,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          }
        }
      }
    };

    phaseChartB1Instance.current = new Chart(ctx, config);
  }, [interactionsB1, interactionsC1]);

  // Renderizar Phase Portrait para C-1
  useEffect(() => {
    if (!phasePortraitC1Ref.current || !interactionsB1 || !interactionsC1) return;

    if (phaseChartC1Instance.current) {
      phaseChartC1Instance.current.destroy();
    }

    const ctx = phasePortraitC1Ref.current.getContext('2d');
    if (!ctx) return;

    const scales = getGlobalScales();
    if (!scales) return;

    const trajectoryData = interactionsC1.map(i => ({
      x: i.omegaSem,
      y: i.hDiv,
      viable: i.omegaSem >= 0.6,
      caelionIntervened: i.caelionIntervened || false
    }));

    const viabilityCoreData = [
      { x: 0.6, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 0.05 },
      { x: 0.6, y: 0.05 },
      { x: 0.6, y: 0 }
    ];

    const config: ChartConfiguration = {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Núcleo K (Ω≥0.6)',
            data: viabilityCoreData,
            borderColor: 'rgba(34, 197, 94, 0.3)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            fill: true,
            order: 4
          },
          {
            label: 'Viable',
            data: trajectoryData.filter(d => d.viable && !d.caelionIntervened).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderColor: 'rgba(34, 197, 94, 1)',
            pointRadius: 5,
            order: 2
          },
          {
            label: 'No Viable',
            data: trajectoryData.filter(d => !d.viable && !d.caelionIntervened).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: 'rgba(239, 68, 68, 1)',
            pointRadius: 5,
            order: 2
          },
          {
            label: 'CAELION',
            data: trajectoryData.filter(d => d.caelionIntervened).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(251, 191, 36, 1)',
            borderColor: 'rgba(251, 191, 36, 1)',
            pointRadius: 8,
            pointStyle: 'triangle',
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'C-1: Phase Portrait (H vs Ω)',
            color: '#22c55e',
            font: { size: 14, weight: 'bold' }
          },
          legend: {
            display: true,
            labels: { color: '#94a3b8', font: { size: 10 } }
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Ω (Coherencia)', color: '#94a3b8' },
            min: Math.max(0, scales.omega.min - 0.1),
            max: Math.min(1, scales.omega.max + 0.1),
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y: {
            title: { display: true, text: 'H (Entropía)', color: '#94a3b8' },
            min: Math.max(0, scales.h.min - 0.01),
            max: scales.h.max + 0.01,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          }
        }
      }
    };

    phaseChartC1Instance.current = new Chart(ctx, config);
  }, [interactionsB1, interactionsC1]);

  // Renderizar Lyapunov V(t) para B-1
  useEffect(() => {
    if (!lyapunovB1Ref.current || !interactionsB1 || !interactionsC1) return;

    if (lyapunovChartB1Instance.current) {
      lyapunovChartB1Instance.current.destroy();
    }

    const ctx = lyapunovB1Ref.current.getContext('2d');
    if (!ctx) return;

    const scales = getGlobalScales();
    if (!scales) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: interactionsB1.map((_, i) => i + 1),
        datasets: [
          {
            label: 'V(t)',
            data: interactionsB1.map(i => i.vLyapunov),
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'B-1: Lyapunov V(t)',
            color: '#ef4444',
            font: { size: 14, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            title: { display: true, text: 'Interacción', color: '#94a3b8' },
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y: {
            title: { display: true, text: 'V (Energía de Error)', color: '#94a3b8' },
            min: Math.max(0, scales.v.min - 0.001),
            max: scales.v.max + 0.001,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          }
        }
      }
    };

    lyapunovChartB1Instance.current = new Chart(ctx, config);
  }, [interactionsB1, interactionsC1]);

  // Renderizar Lyapunov V(t) para C-1
  useEffect(() => {
    if (!lyapunovC1Ref.current || !interactionsB1 || !interactionsC1) return;

    if (lyapunovChartC1Instance.current) {
      lyapunovChartC1Instance.current.destroy();
    }

    const ctx = lyapunovC1Ref.current.getContext('2d');
    if (!ctx) return;

    const scales = getGlobalScales();
    if (!scales) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: interactionsC1.map((_, i) => i + 1),
        datasets: [
          {
            label: 'V(t)',
            data: interactionsC1.map(i => i.vLyapunov),
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'C-1: Lyapunov V(t)',
            color: '#22c55e',
            font: { size: 14, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            title: { display: true, text: 'Interacción', color: '#94a3b8' },
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y: {
            title: { display: true, text: 'V (Energía de Error)', color: '#94a3b8' },
            min: Math.max(0, scales.v.min - 0.001),
            max: scales.v.max + 0.001,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          }
        }
      }
    };

    lyapunovChartC1Instance.current = new Chart(ctx, config);
  }, [interactionsB1, interactionsC1]);

  // Renderizar RLD(t) para B-1
  useEffect(() => {
    if (!rldB1Ref.current || !interactionsB1 || !interactionsC1) return;

    if (rldChartB1Instance.current) {
      rldChartB1Instance.current.destroy();
    }

    const ctx = rldB1Ref.current.getContext('2d');
    if (!ctx) return;

    const scales = getGlobalScales();
    if (!scales) return;

    const rldData = interactionsB1.map(i => calculateRLD(i.omegaSem, i.hDiv));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: interactionsB1.map((_, i) => i + 1),
        datasets: [
          {
            label: 'RLD(t)',
            data: rldData,
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'B-1: RLD(t)',
            color: '#ef4444',
            font: { size: 14, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            title: { display: true, text: 'Interacción', color: '#94a3b8' },
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y: {
            title: { display: true, text: 'RLD (Margen Viable)', color: '#94a3b8' },
            min: 0,
            max: 1,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          }
        }
      }
    };

    rldChartB1Instance.current = new Chart(ctx, config);
  }, [interactionsB1, interactionsC1]);

  // Renderizar RLD(t) para C-1
  useEffect(() => {
    if (!rldC1Ref.current || !interactionsB1 || !interactionsC1) return;

    if (rldChartC1Instance.current) {
      rldChartC1Instance.current.destroy();
    }

    const ctx = rldC1Ref.current.getContext('2d');
    if (!ctx) return;

    const scales = getGlobalScales();
    if (!scales) return;

    const rldData = interactionsC1.map(i => calculateRLD(i.omegaSem, i.hDiv));

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: interactionsC1.map((_, i) => i + 1),
        datasets: [
          {
            label: 'RLD(t)',
            data: rldData,
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'C-1: RLD(t)',
            color: '#22c55e',
            font: { size: 14, weight: 'bold' }
          },
          legend: { display: false }
        },
        scales: {
          x: {
            title: { display: true, text: 'Interacción', color: '#94a3b8' },
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          },
          y: {
            title: { display: true, text: 'RLD (Margen Viable)', color: '#94a3b8' },
            min: 0,
            max: 1,
            ticks: { color: '#94a3b8' },
            grid: { color: 'rgba(148, 163, 184, 0.1)' }
          }
        }
      }
    };

    rldChartC1Instance.current = new Chart(ctx, config);
  }, [interactionsB1, interactionsC1]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-deep-blue particles-bg">
        <div className="container mx-auto py-8 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!experiments || experiments.length !== 2) {
    return (
      <div className="min-h-screen bg-gradient-deep-blue particles-bg">
        <div className="container mx-auto py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No se pudieron cargar los experimentos B-1 y C-1. Verifica que estén en la base de datos.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const [b1, c1] = experiments;

  // Verificar que las interacciones estén cargadas
  if (!interactionsB1 || !interactionsC1) {
    return (
      <div className="min-h-screen bg-gradient-deep-blue particles-bg">
        <div className="container mx-auto py-8 space-y-6">
          <Skeleton className="h-12 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-64" />)}
          </div>
        </div>
      </div>
    );
  }

  // Calcular diferencias
  const deltaOmega = c1.avgOmegaSem! - b1.avgOmegaSem!;
  const deltaV = c1.avgVLyapunov! - b1.avgVLyapunov!;
  const deltaRLD = (interactionsC1.reduce((sum, i) => sum + calculateRLD(i.omegaSem, i.hDiv), 0) / interactionsC1.length) -
    (interactionsB1.reduce((sum, i) => sum + calculateRLD(i.omegaSem, i.hDiv), 0) / interactionsB1.length);

  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white title-glow-cyan">
            Comparación B-1 vs C-1-CAELION
          </h1>
          <p className="text-cyan-300/80 mt-2">
            Visualizaciones completas del LAB con datos actuales (input canónico)
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">50 interacciones cada uno</Badge>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">sentence-transformers/all-MiniLM-L6-v2 (384D)</Badge>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400">Input canónico idéntico</Badge>
          </div>
        </div>

        {/* Badges de Divergencia */}
        <Card className="bg-gradient-blue-purple border-amber-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-400">
              <Activity className="h-5 w-5" />
              Divergencias Promedio (C-1 - B-1)
            </CardTitle>
            <CardDescription className="text-gray-400">
              Diferencias absolutas entre regímenes con y sin CAELION
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-cyan-950/30 to-purple-950/30 rounded-lg border border-cyan-500/30">
                <div className="text-sm text-gray-400 mb-1">ΔΩ (Coherencia)</div>
                <div className={`text-3xl font-bold ${deltaOmega > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {deltaOmega > 0 ? '+' : ''}{deltaOmega.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {deltaOmega > 0 ? 'C-1 más coherente' : 'B-1 más coherente'}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-cyan-950/30 to-purple-950/30 rounded-lg border border-purple-500/30">
                <div className="text-sm text-gray-400 mb-1">ΔV (Lyapunov)</div>
                <div className={`text-3xl font-bold ${deltaV < 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {deltaV > 0 ? '+' : ''}{deltaV.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {deltaV < 0 ? 'C-1 más estable' : 'B-1 más estable'}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-cyan-950/30 to-purple-950/30 rounded-lg border border-amber-500/30">
                <div className="text-sm text-gray-400 mb-1">ΔRLD (Margen Viable)</div>
                <div className={`text-3xl font-bold ${deltaRLD > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {deltaRLD > 0 ? '+' : ''}{deltaRLD.toFixed(4)}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {deltaRLD > 0 ? 'C-1 mayor margen' : 'B-1 mayor margen'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visualizaciones Split-Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Phase Portraits */}
          <Card className="bg-gradient-blue-purple border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">B-1: Phase Portrait</CardTitle>
              <CardDescription className="text-gray-400">Sin CAELION</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <canvas ref={phasePortraitB1Ref}></canvas>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400">C-1: Phase Portrait</CardTitle>
              <CardDescription className="text-gray-400">Con CAELION</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <canvas ref={phasePortraitC1Ref}></canvas>
              </div>
            </CardContent>
          </Card>

          {/* Lyapunov V(t) */}
          <Card className="bg-gradient-blue-purple border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">B-1: Lyapunov V(t)</CardTitle>
              <CardDescription className="text-gray-400">Energía de error</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <canvas ref={lyapunovB1Ref}></canvas>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400">C-1: Lyapunov V(t)</CardTitle>
              <CardDescription className="text-gray-400">Energía de error</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <canvas ref={lyapunovC1Ref}></canvas>
              </div>
            </CardContent>
          </Card>

          {/* RLD(t) */}
          <Card className="bg-gradient-blue-purple border-red-500/30">
            <CardHeader>
              <CardTitle className="text-red-400">B-1: RLD(t)</CardTitle>
              <CardDescription className="text-gray-400">Margen de viabilidad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <canvas ref={rldB1Ref}></canvas>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-green-500/30">
            <CardHeader>
              <CardTitle className="text-green-400">C-1: RLD(t)</CardTitle>
              <CardDescription className="text-gray-400">Margen de viabilidad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <canvas ref={rldC1Ref}></canvas>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Interpretación */}
        <Card className="bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Interpretación del Trade-off</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>
              <strong className="text-green-400">CAELION mejora estabilidad y coherencia</strong>: ΔΩ = +{deltaOmega.toFixed(4)} (+{((deltaOmega / b1.avgOmegaSem!) * 100).toFixed(1)}%) y ΔV = {deltaV.toFixed(4)} ({((deltaV / b1.avgVLyapunov!) * 100).toFixed(1)}%). El sistema C-1 opera con mayor coherencia semántica y menor energía de error.
            </p>
            <p>
              <strong className={deltaRLD < 0 ? 'text-red-400' : 'text-green-400'}>Trade-off en margen viable</strong>: ΔRLD = {deltaRLD.toFixed(4)} ({((deltaRLD / (interactionsB1!.reduce((sum, i) => sum + calculateRLD(i.omegaSem, i.hDiv), 0) / interactionsB1!.length)) * 100).toFixed(1)}%). {deltaRLD < 0 ? 'CAELION sacrifica margen de viabilidad para garantizar estabilidad controlada. El sistema opera más cerca del borde del núcleo viable, pero con trayectorias más predecibles.' : 'CAELION mantiene mayor margen de viabilidad.'}
            </p>
            <p className="text-sm text-gray-500">
              <strong>Nota metodológica</strong>: Ambos experimentos utilizan input canónico idéntico (50 mensajes) y encoder sentence-transformers/all-MiniLM-L6-v2 (384D). Las diferencias observadas se deben exclusivamente a la arquitectura de gobernanza CAELION.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
