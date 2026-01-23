import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Info } from 'lucide-react';
import { useLocation } from 'wouter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Registrar componentes de Chart.js
Chart.register(...registerables);

// Datos de los tres regímenes (actualmente solo tenemos A-1 completo)
const REGIMES_DATA = {
  A: {
    name: 'Régimen A - Alta Entropía',
    description: 'Sin estructura, sin control, respuestas libres y variadas',
    color: 'rgb(59, 130, 246)', // blue
    data: [
      0.3474, 0.3817, 0.3969, 0.3713, 0.3285, 0.3403, 0.3652, 0.3534, 0.3588, 0.3348,
      0.2465, 0.2516, 0.4228, 0.3591, 0.3504, 0.3537, 0.3399, 0.3833, 0.3672, 0.4131,
      0.4134, 0.3484, 0.3136, 0.2561, 0.2194, 0.2199, 0.3008, 0.2403, 0.3646, 0.4072,
      0.3960, 0.3363, 0.3699, 0.3172, 0.3626, 0.3932, 0.3605, 0.3993, 0.3850, 0.3361,
      0.4007, 0.3569, 0.2690, 0.3600, 0.3876, 0.3494, 0.2390, 0.3321, 0.3635, 0.2883
    ],
    stats: {
      mean: 0.3430,
      max: 0.4228,
      min: 0.2194,
      std: 0.0523
    }
  },
  B: {
    name: 'Régimen B - Ruido Medio',
    description: 'LLM estándar sin CAELION, coherencia natural del modelo',
    color: 'rgb(168, 85, 247)', // purple
    data: [
      // Datos simulados para demostración (pendiente experimento real)
      0.2845, 0.3012, 0.2756, 0.2934, 0.3123, 0.2867, 0.3045, 0.2789, 0.2956, 0.3134,
      0.2878, 0.3001, 0.2923, 0.3156, 0.2834, 0.3067, 0.2912, 0.3189, 0.2845, 0.3078,
      0.2967, 0.3123, 0.2856, 0.3045, 0.2934, 0.3089, 0.2878, 0.3012, 0.2945, 0.3101,
      0.2889, 0.3034, 0.2967, 0.3123, 0.2901, 0.3056, 0.2978, 0.3145, 0.2912, 0.3067,
      0.2989, 0.3156, 0.2923, 0.3078, 0.3001, 0.3167, 0.2934, 0.3089, 0.3012, 0.3178
    ],
    stats: {
      mean: 0.2989,
      max: 0.3189,
      min: 0.2756,
      std: 0.0112
    }
  },
  C: {
    name: 'Régimen C - CAELION Activo',
    description: 'Control semántico completo con referencia ética (Bucéfalo)',
    color: 'rgb(34, 197, 94)', // green
    data: [
      // Datos simulados para demostración (pendiente experimento real)
      0.2134, 0.2245, 0.2089, 0.2178, 0.2267, 0.2123, 0.2234, 0.2101, 0.2189, 0.2278,
      0.2145, 0.2256, 0.2112, 0.2201, 0.2289, 0.2156, 0.2267, 0.2123, 0.2212, 0.2301,
      0.2167, 0.2278, 0.2134, 0.2223, 0.2312, 0.2178, 0.2289, 0.2145, 0.2234, 0.2323,
      0.2189, 0.2301, 0.2156, 0.2245, 0.2334, 0.2201, 0.2312, 0.2167, 0.2256, 0.2345,
      0.2212, 0.2323, 0.2178, 0.2267, 0.2356, 0.2223, 0.2334, 0.2189, 0.2278, 0.2367
    ],
    stats: {
      mean: 0.2234,
      max: 0.2367,
      min: 0.2089,
      std: 0.0078
    }
  }
};

export default function ExperimentoComparar() {
  const [, setLocation] = useLocation();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'omega'>('omega');

  useEffect(() => {
    if (!chartRef.current) return;

    // Destruir instancia anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: Array.from({ length: 50 }, (_, i) => i + 1),
        datasets: [
          {
            label: REGIMES_DATA.A.name,
            data: REGIMES_DATA.A.data,
            borderColor: REGIMES_DATA.A.color,
            backgroundColor: REGIMES_DATA.A.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: REGIMES_DATA.A.color,
            pointBorderColor: '#fff',
            pointBorderWidth: 1
          },
          {
            label: REGIMES_DATA.B.name,
            data: REGIMES_DATA.B.data,
            borderColor: REGIMES_DATA.B.color,
            backgroundColor: REGIMES_DATA.B.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: REGIMES_DATA.B.color,
            pointBorderColor: '#fff',
            pointBorderWidth: 1
          },
          {
            label: REGIMES_DATA.C.name,
            data: REGIMES_DATA.C.data,
            borderColor: REGIMES_DATA.C.color,
            backgroundColor: REGIMES_DATA.C.color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: REGIMES_DATA.C.color,
            pointBorderColor: '#fff',
            pointBorderWidth: 1
          },
          // Línea de umbral crítico
          {
            label: 'Umbral Crítico (0.5)',
            data: Array(50).fill(0.5),
            borderColor: 'rgb(220, 38, 38)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'rgb(156, 163, 175)',
              font: {
                size: 12
              },
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgb(75, 85, 99)',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              title: (tooltipItems) => {
                return `Turno ${tooltipItems[0].label}`;
              },
              label: (context) => {
                if (context.datasetIndex === 3) {
                  return 'Umbral Crítico';
                }
                const value = context.parsed.y?.toFixed(4) || '0.0000';
                return `${context.dataset.label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Turno de Conversación',
              color: 'rgb(156, 163, 175)',
              font: {
                size: 13,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: 'rgb(156, 163, 175)',
              maxTicksLimit: 10
            }
          },
          y: {
            title: {
              display: true,
              text: 'Ω (Coste de Control)',
              color: 'rgb(156, 163, 175)',
              font: {
                size: 13,
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(75, 85, 99, 0.2)'
            },
            ticks: {
              color: 'rgb(156, 163, 175)'
            },
            beginAtZero: false,
            suggestedMin: 0.15,
            suggestedMax: 0.55
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [selectedMetric]);

  const handleDownloadData = () => {
    const dataStr = JSON.stringify(REGIMES_DATA, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'comparative-regimes-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Comparación de Regímenes Experimentales</h1>
          <p className="text-muted-foreground text-lg">
            Análisis comparativo de Ω (Coste de Control) entre tres regímenes cognitivos
          </p>
        </div>

        {/* Advertencia sobre datos simulados */}
        <Alert className="mb-6 border-amber-500/50 bg-amber-500/5">
          <Info className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Datos Parciales</AlertTitle>
          <AlertDescription>
            <strong>Régimen A:</strong> Datos reales de 50 mensajes completados. <br />
            <strong>Regímenes B y C:</strong> Datos simulados para demostración. El experimento completo está pendiente de créditos de API.
          </AlertDescription>
        </Alert>

        {/* Descripción de regímenes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Régimen A
              </CardTitle>
              <CardDescription className="text-xs">
                {REGIMES_DATA.A.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Media Ω:</span>
                <span className="font-mono">{REGIMES_DATA.A.stats.mean.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Máximo:</span>
                <span className="font-mono text-amber-500">{REGIMES_DATA.A.stats.max.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desv. Est.:</span>
                <span className="font-mono">{REGIMES_DATA.A.stats.std.toFixed(4)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                Régimen B
              </CardTitle>
              <CardDescription className="text-xs">
                {REGIMES_DATA.B.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Media Ω:</span>
                <span className="font-mono">{REGIMES_DATA.B.stats.mean.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Máximo:</span>
                <span className="font-mono text-amber-500">{REGIMES_DATA.B.stats.max.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desv. Est.:</span>
                <span className="font-mono">{REGIMES_DATA.B.stats.std.toFixed(4)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                Régimen C
              </CardTitle>
              <CardDescription className="text-xs">
                {REGIMES_DATA.C.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Media Ω:</span>
                <span className="font-mono">{REGIMES_DATA.C.stats.mean.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Máximo:</span>
                <span className="font-mono text-amber-500">{REGIMES_DATA.C.stats.max.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Desv. Est.:</span>
                <span className="font-mono">{REGIMES_DATA.C.stats.std.toFixed(4)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráfica comparativa */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Evolución Temporal Comparativa</CardTitle>
                <CardDescription>
                  Superposición de Ω (Coste de Control) en los tres regímenes experimentales
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadData}
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar datos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div style={{ height: '500px' }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </CardContent>
        </Card>

        {/* Hallazgos comparativos */}
        <Card>
          <CardHeader>
            <CardTitle>Hallazgos Comparativos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-blue-500">Régimen A - Alta Entropía</h3>
              <p className="text-sm text-muted-foreground">
                Mayor variabilidad (σ = 0.0523) con picos de Ω hasta 0.4228. No supera umbral crítico de 0.5 pero muestra oscilaciones significativas entre 0.22-0.42, indicando inestabilidad moderada sin control activo.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-purple-500">Régimen B - Ruido Medio (Simulado)</h3>
              <p className="text-sm text-muted-foreground">
                Variabilidad reducida (σ = 0.0112) con Ω estable entre 0.28-0.32. LLM estándar mantiene coherencia natural sin intervención externa, mostrando menor dispersión que Régimen A.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-green-500">Régimen C - CAELION Activo (Simulado)</h3>
              <p className="text-sm text-muted-foreground">
                Mínima variabilidad (σ = 0.0078) con Ω consistente entre 0.21-0.24. Control semántico con referencia ética (Bucéfalo) mantiene estabilidad máxima y menor coste de control promedio.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
