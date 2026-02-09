import { useEffect, useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Activity, TrendingUp, Zap, Target, Columns2 } from 'lucide-react';
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
  const [splitScreenMode, setSplitScreenMode] = useState<boolean>(false);
  const [experimentB1, setExperimentB1] = useState<string>('');
  const [experimentC1, setExperimentC1] = useState<string>('');
  
  // Queries para datos reales
  const { data: experiments } = trpc.experiments.getAll.useQuery();
  const { data: interactions } = trpc.experiments.getInteractions.useQuery({ experimentId: selectedExperiment }, {
    enabled: !!selectedExperiment && !splitScreenMode
  });
  
  // Queries para split-screen
  const { data: interactionsB1 } = trpc.experiments.getInteractions.useQuery({ experimentId: experimentB1 }, {
    enabled: !!experimentB1 && splitScreenMode
  });
  const { data: interactionsC1 } = trpc.experiments.getInteractions.useQuery({ experimentId: experimentC1 }, {
    enabled: !!experimentC1 && splitScreenMode
  });
  
  // Actualizar selectedExperiment cuando cambia el régimen
  useEffect(() => {
    if (experiments && experiments.length > 0) {
      const exp = experiments.find(e => e.experimentId.startsWith(selectedRegime));
      if (exp) {
        setSelectedExperiment(exp.experimentId);
      }
      
      // Inicializar experimentos para split-screen
      const expB1 = experiments.find(e => e.experimentId.startsWith('B-1'));
      const expC1 = experiments.find(e => e.experimentId.startsWith('C-1'));
      if (expB1) setExperimentB1(expB1.experimentId);
      if (expC1) setExperimentC1(expC1.experimentId);
    }
  }, [selectedRegime, experiments]);
  
  // Referencias para charts (modo single)
  const phasePortraitRef = useRef<HTMLCanvasElement>(null);
  const lyapunovRef = useRef<HTMLCanvasElement>(null);
  const rldRef = useRef<HTMLCanvasElement>(null);
  const errorControlRef = useRef<HTMLCanvasElement>(null);
  
  const phaseChartInstance = useRef<Chart | null>(null);
  const lyapunovChartInstance = useRef<Chart | null>(null);
  const rldChartInstance = useRef<Chart | null>(null);
  const errorControlChartInstance = useRef<Chart | null>(null);
  
  // Referencias para charts (split-screen B-1)
  const phasePortraitB1Ref = useRef<HTMLCanvasElement>(null);
  const lyapunovB1Ref = useRef<HTMLCanvasElement>(null);
  const rldB1Ref = useRef<HTMLCanvasElement>(null);
  const errorControlB1Ref = useRef<HTMLCanvasElement>(null);
  
  const phaseChartB1Instance = useRef<Chart | null>(null);
  const lyapunovChartB1Instance = useRef<Chart | null>(null);
  const rldChartB1Instance = useRef<Chart | null>(null);
  const errorControlChartB1Instance = useRef<Chart | null>(null);
  
  // Referencias para charts (split-screen C-1)
  const phasePortraitC1Ref = useRef<HTMLCanvasElement>(null);
  const lyapunovC1Ref = useRef<HTMLCanvasElement>(null);
  const rldC1Ref = useRef<HTMLCanvasElement>(null);
  const errorControlC1Ref = useRef<HTMLCanvasElement>(null);
  
  const phaseChartC1Instance = useRef<Chart | null>(null);
  const lyapunovChartC1Instance = useRef<Chart | null>(null);
  const rldChartC1Instance = useRef<Chart | null>(null);
  const errorControlChartC1Instance = useRef<Chart | null>(null);

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

  // ========== SPLIT-SCREEN CHARTS ==========
  
  // Calcular escalas globales para sincronización
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

  // Phase Portrait B-1 (split-screen)
  useEffect(() => {
    if (!splitScreenMode || !phasePortraitB1Ref.current || !interactionsB1) return;

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
      viable: calculateRLD(i.omegaSem, i.hDiv) > 0.5
    }));

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
            label: 'Núcleo K',
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
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: 'rgba(239, 68, 68, 1)',
            pointRadius: 4,
            order: 2
          },
          {
            label: 'No Viable',
            data: trajectoryData.filter(d => !d.viable).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            borderColor: 'rgba(239, 68, 68, 0.6)',
            pointRadius: 4,
            order: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
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
            title: { display: true, text: 'Ω', color: '#94a3b8', font: { size: 10 } },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8', font: { size: 9 } },
            min: scales.omega.min - 0.05,
            max: scales.omega.max + 0.05
          },
          y: {
            title: { display: true, text: 'H', color: '#94a3b8', font: { size: 10 } },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8', font: { size: 9 } },
            min: scales.h.min - 0.01,
            max: scales.h.max + 0.01
          }
        }
      }
    };

    phaseChartB1Instance.current = new Chart(ctx, config);
  }, [splitScreenMode, interactionsB1, interactionsC1]);

  // Phase Portrait C-1 (split-screen)
  useEffect(() => {
    if (!splitScreenMode || !phasePortraitC1Ref.current || !interactionsC1) return;

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
      viable: calculateRLD(i.omegaSem, i.hDiv) > 0.5,
      caelionIntervened: i.caelionIntervened || false
    }));

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
            label: 'Núcleo K',
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
            backgroundColor: 'rgba(34, 197, 94, 0.6)',
            borderColor: 'rgba(34, 197, 94, 1)',
            pointRadius: 4,
            order: 2
          },
          {
            label: 'No Viable',
            data: trajectoryData.filter(d => !d.viable).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(34, 197, 94, 0.3)',
            borderColor: 'rgba(34, 197, 94, 0.6)',
            pointRadius: 4,
            order: 2
          },
          {
            label: 'CAELION',
            data: trajectoryData.filter(d => d.caelionIntervened).map(d => ({ x: d.x, y: d.y })),
            backgroundColor: 'rgba(251, 191, 36, 1)',
            borderColor: 'rgba(251, 191, 36, 1)',
            pointRadius: 7,
            pointStyle: 'triangle',
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
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
            title: { display: true, text: 'Ω', color: '#94a3b8', font: { size: 10 } },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8', font: { size: 9 } },
            min: scales.omega.min - 0.05,
            max: scales.omega.max + 0.05
          },
          y: {
            title: { display: true, text: 'H', color: '#94a3b8', font: { size: 10 } },
            grid: { color: 'rgba(148, 163, 184, 0.1)' },
            ticks: { color: '#94a3b8', font: { size: 9 } },
            min: scales.h.min - 0.01,
            max: scales.h.max + 0.01
          }
        }
      }
    };

    phaseChartC1Instance.current = new Chart(ctx, config);
  }, [splitScreenMode, interactionsB1, interactionsC1]);

  // Lyapunov B-1 y C-1 (split-screen)
  useEffect(() => {
    if (!splitScreenMode || !lyapunovB1Ref.current || !lyapunovC1Ref.current || !interactionsB1 || !interactionsC1) return;

    const scales = getGlobalScales();
    if (!scales) return;

    // B-1
    if (lyapunovChartB1Instance.current) lyapunovChartB1Instance.current.destroy();
    const ctxB1 = lyapunovB1Ref.current.getContext('2d');
    if (ctxB1) {
      const labelsB1 = interactionsB1.map((_, i) => i + 1);
      const vDataB1 = interactionsB1.map(i => i.vLyapunov);

      lyapunovChartB1Instance.current = new Chart(ctxB1, {
        type: 'line',
        data: {
          labels: labelsB1,
          datasets: [{
            label: 'V(t)',
            data: vDataB1,
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: 't', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } }
            },
            y: {
              title: { display: true, text: 'V', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } },
              min: scales.v.min - 0.01,
              max: scales.v.max + 0.01
            }
          }
        }
      });
    }

    // C-1
    if (lyapunovChartC1Instance.current) lyapunovChartC1Instance.current.destroy();
    const ctxC1 = lyapunovC1Ref.current.getContext('2d');
    if (ctxC1) {
      const labelsC1 = interactionsC1.map((_, i) => i + 1);
      const vDataC1 = interactionsC1.map(i => i.vLyapunov);

      lyapunovChartC1Instance.current = new Chart(ctxC1, {
        type: 'line',
        data: {
          labels: labelsC1,
          datasets: [{
            label: 'V(t)',
            data: vDataC1,
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderWidth: 2,
            fill: false,
            tension: 0.1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: 't', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } }
            },
            y: {
              title: { display: true, text: 'V', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } },
              min: scales.v.min - 0.01,
              max: scales.v.max + 0.01
            }
          }
        }
      });
    }
  }, [splitScreenMode, interactionsB1, interactionsC1]);

  // RLD B-1 y C-1 (split-screen)
  useEffect(() => {
    if (!splitScreenMode || !rldB1Ref.current || !rldC1Ref.current || !interactionsB1 || !interactionsC1) return;

    const scales = getGlobalScales();
    if (!scales) return;

    // B-1
    if (rldChartB1Instance.current) rldChartB1Instance.current.destroy();
    const ctxB1 = rldB1Ref.current.getContext('2d');
    if (ctxB1) {
      const labelsB1 = interactionsB1.map((_, i) => i + 1);
      const rldDataB1 = interactionsB1.map(i => calculateRLD(i.omegaSem, i.hDiv));
      const thresholdViable = Array(interactionsB1.length).fill(0.5);
      const thresholdCritical = Array(interactionsB1.length).fill(0.3);

      rldChartB1Instance.current = new Chart(ctxB1, {
        type: 'line',
        data: {
          labels: labelsB1,
          datasets: [
            {
              label: 'RLD(t)',
              data: rldDataB1,
              borderColor: 'rgba(239, 68, 68, 1)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.2
            },
            {
              label: 'Umbral Viable',
              data: thresholdViable,
              borderColor: 'rgba(251, 191, 36, 0.6)',
              borderWidth: 1,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            },
            {
              label: 'Umbral Crítico',
              data: thresholdCritical,
              borderColor: 'rgba(239, 68, 68, 0.6)',
              borderWidth: 1,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: 't', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } }
            },
            y: {
              title: { display: true, text: 'RLD', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } },
              min: 0,
              max: 1
            }
          }
        }
      });
    }

    // C-1
    if (rldChartC1Instance.current) rldChartC1Instance.current.destroy();
    const ctxC1 = rldC1Ref.current.getContext('2d');
    if (ctxC1) {
      const labelsC1 = interactionsC1.map((_, i) => i + 1);
      const rldDataC1 = interactionsC1.map(i => calculateRLD(i.omegaSem, i.hDiv));
      const thresholdViable = Array(interactionsC1.length).fill(0.5);
      const thresholdCritical = Array(interactionsC1.length).fill(0.3);

      rldChartC1Instance.current = new Chart(ctxC1, {
        type: 'line',
        data: {
          labels: labelsC1,
          datasets: [
            {
              label: 'RLD(t)',
              data: rldDataC1,
              borderColor: 'rgba(34, 197, 94, 1)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.2
            },
            {
              label: 'Umbral Viable',
              data: thresholdViable,
              borderColor: 'rgba(251, 191, 36, 0.6)',
              borderWidth: 1,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            },
            {
              label: 'Umbral Crítico',
              data: thresholdCritical,
              borderColor: 'rgba(239, 68, 68, 0.6)',
              borderWidth: 1,
              borderDash: [5, 5],
              pointRadius: 0,
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: 't', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } }
            },
            y: {
              title: { display: true, text: 'RLD', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } },
              min: 0,
              max: 1
            }
          }
        }
      });
    }
  }, [splitScreenMode, interactionsB1, interactionsC1]);

  // Error-Control B-1 y C-1 (split-screen)
  useEffect(() => {
    if (!splitScreenMode || !errorControlB1Ref.current || !errorControlC1Ref.current || !interactionsB1 || !interactionsC1) return;

    const scales = getGlobalScales();
    if (!scales) return;

    // B-1
    if (errorControlChartB1Instance.current) errorControlChartB1Instance.current.destroy();
    const ctxB1 = errorControlB1Ref.current.getContext('2d');
    if (ctxB1) {
      const dataB1 = interactionsB1.map(i => ({
        x: i.vLyapunov,
        y: calculateRLD(i.omegaSem, i.hDiv)
      }));

      errorControlChartB1Instance.current = new Chart(ctxB1, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'RLD vs V',
            data: dataB1,
            backgroundColor: 'rgba(239, 68, 68, 0.6)',
            borderColor: 'rgba(239, 68, 68, 1)',
            pointRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: 'V', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } },
              min: scales.v.min - 0.01,
              max: scales.v.max + 0.01
            },
            y: {
              title: { display: true, text: 'RLD', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } },
              min: 0,
              max: 1
            }
          }
        }
      });
    }

    // C-1
    if (errorControlChartC1Instance.current) errorControlChartC1Instance.current.destroy();
    const ctxC1 = errorControlC1Ref.current.getContext('2d');
    if (ctxC1) {
      const dataC1 = interactionsC1.map(i => ({
        x: i.vLyapunov,
        y: calculateRLD(i.omegaSem, i.hDiv),
        caelionIntervened: i.caelionIntervened || false
      }));

      const regularData = dataC1.filter(d => !d.caelionIntervened).map(d => ({ x: d.x, y: d.y }));
      const interventionData = dataC1.filter(d => d.caelionIntervened).map(d => ({ x: d.x, y: d.y }));

      errorControlChartC1Instance.current = new Chart(ctxC1, {
        type: 'scatter',
        data: {
          datasets: [
            {
              label: 'RLD vs V',
              data: regularData,
              backgroundColor: 'rgba(34, 197, 94, 0.6)',
              borderColor: 'rgba(34, 197, 94, 1)',
              pointRadius: 4,
              order: 2
            },
            {
              label: 'CAELION',
              data: interventionData,
              backgroundColor: 'rgba(251, 191, 36, 1)',
              borderColor: 'rgba(251, 191, 36, 1)',
              pointRadius: 7,
              pointStyle: 'triangle',
              order: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: 'V', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } },
              min: scales.v.min - 0.01,
              max: scales.v.max + 0.01
            },
            y: {
              title: { display: true, text: 'RLD', color: '#94a3b8', font: { size: 10 } },
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94a3b8', font: { size: 9 } },
              min: 0,
              max: 1
            }
          }
        }
      });
    }
  }, [splitScreenMode, interactionsB1, interactionsC1]);

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

  // Condiciones de carga
  const isLoadingSingle = !splitScreenMode && (!interactions || !currentExperiment);
  const isLoadingSplit = splitScreenMode && (!interactionsB1 || !interactionsC1);
  
  if (isLoadingSingle || isLoadingSplit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-cyan-400 text-lg">Cargando datos experimentales...</div>
      </div>
    );
  }
  
  // Obtener experimentos para split-screen
  const experimentB1Data = experiments?.find(e => e.experimentId === experimentB1);
  const experimentC1Data = experiments?.find(e => e.experimentId === experimentC1);
  
  // Calcular divergencias promedio (C-1 - B-1)
  const calculateDivergences = () => {
    if (!interactionsB1 || !interactionsC1) return null;
    
    const avgOmegaB1 = interactionsB1.reduce((sum, i) => sum + i.omegaSem, 0) / interactionsB1.length;
    const avgOmegaC1 = interactionsC1.reduce((sum, i) => sum + i.omegaSem, 0) / interactionsC1.length;
    const deltaOmega = avgOmegaC1 - avgOmegaB1;
    
    const avgVB1 = interactionsB1.reduce((sum, i) => sum + i.vLyapunov, 0) / interactionsB1.length;
    const avgVC1 = interactionsC1.reduce((sum, i) => sum + i.vLyapunov, 0) / interactionsC1.length;
    const deltaV = avgVC1 - avgVB1;
    
    const avgRLDB1 = interactionsB1.reduce((sum, i) => sum + calculateRLD(i.omegaSem, i.hDiv), 0) / interactionsB1.length;
    const avgRLDC1 = interactionsC1.reduce((sum, i) => sum + calculateRLD(i.omegaSem, i.hDiv), 0) / interactionsC1.length;
    const deltaRLD = avgRLDC1 - avgRLDB1;
    
    return { deltaOmega, deltaV, deltaRLD };
  };
  
  const divergences = splitScreenMode ? calculateDivergences() : null;

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
            {!splitScreenMode && (
              <>
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
                
                {/* Selector de experimento específico */}
                <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
                  <SelectTrigger className="w-80 bg-slate-900/50 border-cyan-500/30 text-cyan-400">
                    <SelectValue placeholder="Seleccionar experimento..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-cyan-500/30">
                    {experiments?.filter(e => e.experimentId.startsWith(selectedRegime)).map(exp => (
                      <SelectItem key={exp.experimentId} value={exp.experimentId}>
                        {exp.experimentId} {exp.hasCAELION ? '(CAELION)' : ''} - {exp.successfulInteractions} interacciones
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            
            <Button
              onClick={() => setSplitScreenMode(!splitScreenMode)}
              className={`${
                splitScreenMode 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'bg-slate-700 hover:bg-slate-600'
              } text-white flex items-center gap-2`}
            >
              <Columns2 className="h-4 w-4" />
              {splitScreenMode ? 'Vista Simple' : 'Vista Split-Screen'}
            </Button>
            
            <Button
              onClick={() => exportToCSV()}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              Exportar CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Badges de Divergencia (solo en split-screen) */}
      {splitScreenMode && divergences && (
        <div className="max-w-7xl mx-auto mb-8">
          <div className="bg-slate-900/50 border border-amber-500/30 rounded-lg p-4">
            <h3 className="text-amber-400 font-semibold text-sm mb-3 text-center">
              Divergencias Promedio (C-1 - B-1)
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {/* ΔΩ */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">ΔΩ (Coherencia)</div>
                <div className={`text-2xl font-bold ${
                  divergences.deltaOmega > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {divergences.deltaOmega > 0 ? '+' : ''}{divergences.deltaOmega.toFixed(4)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {divergences.deltaOmega > 0 ? 'C-1 más coherente' : 'B-1 más coherente'}
                </div>
              </div>
              
              {/* ΔV */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">ΔV (Lyapunov)</div>
                <div className={`text-2xl font-bold ${
                  divergences.deltaV < 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {divergences.deltaV > 0 ? '+' : ''}{divergences.deltaV.toFixed(4)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {divergences.deltaV < 0 ? 'C-1 menor error' : 'B-1 menor error'}
                </div>
              </div>
              
              {/* ΔRLD */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-slate-400 mb-1">ΔRLD (Margen Viable)</div>
                <div className={`text-2xl font-bold ${
                  divergences.deltaRLD > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {divergences.deltaRLD > 0 ? '+' : ''}{divergences.deltaRLD.toFixed(4)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {divergences.deltaRLD > 0 ? 'C-1 más viable' : 'B-1 más viable'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas agregadas */}
      {!splitScreenMode && (
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
              {currentExperiment?.avgOmegaSem?.toFixed(4) || 'N/A'}
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
              {currentExperiment?.avgVLyapunov?.toFixed(4) || 'N/A'}
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
              {currentExperiment?.avgEpsilonEff?.toFixed(4) || 'N/A'}
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
              {currentExperiment?.avgHDiv?.toFixed(4) || 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>
      )}

      {/* Visualizaciones dinámicas */}
      {!splitScreenMode ? (
        /* Vista Simple */
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
      ) : (
        /* Vista Split-Screen: B-1 vs C-1 */
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-8">
            {/* Columna B-1 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-red-400 text-center mb-4">
                Régimen B-1 (sin CAELION)
              </h2>
              
              {/* Phase Portrait B-1 */}
              <Card className="bg-slate-900/50 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 text-sm">Phase Portrait B-1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <canvas ref={phasePortraitB1Ref}></canvas>
                  </div>
                </CardContent>
              </Card>
              
              {/* Lyapunov V(t) B-1 */}
              <Card className="bg-slate-900/50 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 text-sm">Lyapunov V(t) B-1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <canvas ref={lyapunovB1Ref}></canvas>
                  </div>
                </CardContent>
              </Card>
              
              {/* RLD(t) B-1 */}
              <Card className="bg-slate-900/50 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 text-sm">RLD(t) B-1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <canvas ref={rldB1Ref}></canvas>
                  </div>
                </CardContent>
              </Card>
              
              {/* Error-Control B-1 */}
              <Card className="bg-slate-900/50 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 text-sm">Fase Error-Control B-1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <canvas ref={errorControlB1Ref}></canvas>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Columna C-1 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-400 text-center mb-4">
                Régimen C-1 (con CAELION)
              </h2>
              
              {/* Phase Portrait C-1 */}
              <Card className="bg-slate-900/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 text-sm">Phase Portrait C-1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <canvas ref={phasePortraitC1Ref}></canvas>
                  </div>
                </CardContent>
              </Card>
              
              {/* Lyapunov V(t) C-1 */}
              <Card className="bg-slate-900/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 text-sm">Lyapunov V(t) C-1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <canvas ref={lyapunovC1Ref}></canvas>
                  </div>
                </CardContent>
              </Card>
              
              {/* RLD(t) C-1 */}
              <Card className="bg-slate-900/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 text-sm">RLD(t) C-1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <canvas ref={rldC1Ref}></canvas>
                  </div>
                </CardContent>
              </Card>
              
              {/* Error-Control C-1 */}
              <Card className="bg-slate-900/50 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-green-400 text-sm">Fase Error-Control C-1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <canvas ref={errorControlC1Ref}></canvas>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Información del experimento */}
      {!splitScreenMode && (
      <div className="max-w-7xl mx-auto mt-8">
        <Card className="bg-slate-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Información del Experimento</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-400">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-semibold">Régimen:</span> {currentExperiment?.regime}
              </div>
              <div>
                <span className="font-semibold">CAELION:</span> {hasCAELION ? 'Activo' : 'Inactivo'}
              </div>
              <div>
                <span className="font-semibold">Interacciones:</span> {currentExperiment?.totalInteractions}
              </div>
              <div>
                <span className="font-semibold">Encoder:</span> {currentExperiment?.encoderModel}
              </div>
              <div>
                <span className="font-semibold">Dimensión:</span> {currentExperiment?.encoderDimension}D
              </div>
              <div>
                <span className="font-semibold">Estado:</span> {currentExperiment?.status}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      )}
    </div>
  );
}
