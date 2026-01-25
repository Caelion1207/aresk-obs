import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, GitCompare, ChevronDown, ChevronUp, ArrowUpDown } from 'lucide-react';
import { useLocation } from 'wouter';

// Registrar componentes de Chart.js
Chart.register(...registerables);

// Datos del análisis de estabilidad temporal (Régimen A-1)
// Régimen A: Sistema coignitivo SIN marco de gobernanza (tipo_a)
const STABILITY_DATA = {
  regime: 'A - Alta Entropía (Sin Marco)',
  totalMessages: 50,
  threshold: 0.5,
  maxOmega: 0.4228,
  maxOmegaTurn: 13,
  data: [
    { turn: 1, omega: 0.3474, epsilon: 0.3543, V: 0.6526 },
    { turn: 2, omega: 0.3817, epsilon: 0.3514, V: 0.6183 },
    { turn: 3, omega: 0.3969, epsilon: 0.3310, V: 0.6031 },
    { turn: 4, omega: 0.3713, epsilon: 0.4066, V: 0.6287 },
    { turn: 5, omega: 0.3285, epsilon: 0.5187, V: 0.6715 },
    { turn: 6, omega: 0.3403, epsilon: 0.4472, V: 0.6597 },
    { turn: 7, omega: 0.3652, epsilon: 0.5207, V: 0.6348 },
    { turn: 8, omega: 0.3534, epsilon: 0.3940, V: 0.6466 },
    { turn: 9, omega: 0.3588, epsilon: 0.5432, V: 0.6412 },
    { turn: 10, omega: 0.3348, epsilon: 0.3498, V: 0.6652 },
    { turn: 11, omega: 0.2465, epsilon: 0.3402, V: 0.7535 },
    { turn: 12, omega: 0.2516, epsilon: 0.5758, V: 0.7484 },
    { turn: 13, omega: 0.4228, epsilon: 0.5708, V: 0.5772 },
    { turn: 14, omega: 0.3591, epsilon: 0.4065, V: 0.6409 },
    { turn: 15, omega: 0.3504, epsilon: 0.5901, V: 0.6496 },
    { turn: 16, omega: 0.3537, epsilon: 0.5922, V: 0.6463 },
    { turn: 17, omega: 0.3399, epsilon: 0.4966, V: 0.6601 },
    { turn: 18, omega: 0.3833, epsilon: 0.3866, V: 0.6167 },
    { turn: 19, omega: 0.3672, epsilon: 0.3808, V: 0.6328 },
    { turn: 20, omega: 0.4131, epsilon: 0.3265, V: 0.5869 },
    { turn: 21, omega: 0.4134, epsilon: 0.4928, V: 0.5866 },
    { turn: 22, omega: 0.3484, epsilon: 0.5249, V: 0.6516 },
    { turn: 23, omega: 0.3136, epsilon: 0.4356, V: 0.6864 },
    { turn: 24, omega: 0.2561, epsilon: 0.3030, V: 0.7439 },
    { turn: 25, omega: 0.2194, epsilon: 0.3549, V: 0.7806 },
    { turn: 26, omega: 0.2199, epsilon: 0.4910, V: 0.7801 },
    { turn: 27, omega: 0.3008, epsilon: 0.4682, V: 0.6992 },
    { turn: 28, omega: 0.2403, epsilon: 0.3825, V: 0.7597 },
    { turn: 29, omega: 0.3646, epsilon: 0.5249, V: 0.6354 },
    { turn: 30, omega: 0.4072, epsilon: 0.3178, V: 0.5928 },
    { turn: 31, omega: 0.3960, epsilon: 0.4240, V: 0.6040 },
    { turn: 32, omega: 0.3363, epsilon: 0.5368, V: 0.6637 },
    { turn: 33, omega: 0.3699, epsilon: 0.5531, V: 0.6301 },
    { turn: 34, omega: 0.3172, epsilon: 0.5372, V: 0.6828 },
    { turn: 35, omega: 0.3626, epsilon: 0.4441, V: 0.6374 },
    { turn: 36, omega: 0.3932, epsilon: 0.4132, V: 0.6068 },
    { turn: 37, omega: 0.3605, epsilon: 0.3426, V: 0.6395 },
    { turn: 38, omega: 0.3993, epsilon: 0.5030, V: 0.6007 },
    { turn: 39, omega: 0.3850, epsilon: 0.3588, V: 0.6150 },
    { turn: 40, omega: 0.3361, epsilon: 0.5084, V: 0.6639 },
    { turn: 41, omega: 0.4007, epsilon: 0.3989, V: 0.5993 },
    { turn: 42, omega: 0.3569, epsilon: 0.5335, V: 0.6431 },
    { turn: 43, omega: 0.2690, epsilon: 0.3146, V: 0.7310 },
    { turn: 44, omega: 0.3600, epsilon: 0.5231, V: 0.6400 },
    { turn: 45, omega: 0.3876, epsilon: 0.5720, V: 0.6124 },
    { turn: 46, omega: 0.3494, epsilon: 0.3163, V: 0.6506 },
    { turn: 47, omega: 0.2390, epsilon: 0.3473, V: 0.7610 },
    { turn: 48, omega: 0.3321, epsilon: 0.3162, V: 0.6679 },
    { turn: 49, omega: 0.3635, epsilon: 0.5686, V: 0.6365 },
    { turn: 50, omega: 0.2883, epsilon: 0.3429, V: 0.7117 }
  ]
};

export default function ExperimentoEstabilidad() {
  const [, setLocation] = useLocation();
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'omega' | 'epsilon' | 'V'>('omega');
  const [showTable, setShowTable] = useState(false);
  const [sortColumn, setSortColumn] = useState<'turn' | 'omega' | 'epsilon' | 'V'>('turn');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!chartRef.current) return;

    // Destruir instancia anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Preparar datos según métrica seleccionada
    const metricData = STABILITY_DATA.data.map(d => d[selectedMetric]);
    const metricLabels = {
      omega: 'Ω (Coste de Control)',
      epsilon: 'ε (Entropía Semántica)',
      V: 'V (Función de Lyapunov)'
    };

    const metricColors = {
      omega: {
        line: 'rgb(59, 130, 246)',
        fill: 'rgba(59, 130, 246, 0.1)',
        point: 'rgb(37, 99, 235)'
      },
      epsilon: {
        line: 'rgb(168, 85, 247)',
        fill: 'rgba(168, 85, 247, 0.1)',
        point: 'rgb(147, 51, 234)'
      },
      V: {
        line: 'rgb(239, 68, 68)',
        fill: 'rgba(239, 68, 68, 0.1)',
        point: 'rgb(220, 38, 38)'
      }
    };

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: STABILITY_DATA.data.map(d => d.turn),
        datasets: [
          {
            label: metricLabels[selectedMetric],
            data: metricData,
            borderColor: metricColors[selectedMetric].line,
            backgroundColor: metricColors[selectedMetric].fill,
            borderWidth: 2,
            fill: true,
            tension: 0.3,
            pointRadius: (context: any) => {
              // Destacar turno 13 (máximo) solo para omega
              if (selectedMetric === 'omega' && context.dataIndex === 12) {
                return 8;
              }
              return 3;
            },
            pointBackgroundColor: (context: any) => {
              if (selectedMetric === 'omega' && context.dataIndex === 12) {
                return 'rgb(220, 38, 38)';
              }
              return metricColors[selectedMetric].point;
            },
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointHoverRadius: 6
          },
          // Líneas de umbral de zonas operativas
          {
            label: 'Reposo Dinámico (0.5)',
            data: Array(50).fill(0.5),
            borderColor: 'rgb(34, 197, 94)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
          },
          {
            label: 'Límite Estable (2)',
            data: Array(50).fill(2),
            borderColor: 'rgb(251, 191, 36)',
            borderWidth: 2,
            borderDash: [8, 4],
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
          },
          {
            label: 'Umbral de Intervención (4)',
            data: Array(50).fill(4),
            borderColor: 'rgb(239, 68, 68)',
            borderWidth: 3,
            borderDash: [10, 5],
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
              usePointStyle: true
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
                const value = context.parsed.y?.toFixed(4) || '0.0000';
                if (context.datasetIndex === 0) {
                  return `${context.dataset.label}: ${value}`;
                }
                return `${context.dataset.label}`;
              },
              afterLabel: (context) => {
                if (selectedMetric === 'omega' && context.dataIndex === 12) {
                  return '⚠️ Máximo alcanzado';
                }
                return '';
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
              text: 'Valor de Métrica',
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
            beginAtZero: true,
            min: 0,
            max: selectedMetric === 'omega' || selectedMetric === 'epsilon' ? 5 : 1
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
    const dataStr = JSON.stringify(STABILITY_DATA, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stability-temporal-data-A1.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = {
    omega: {
      mean: 0.3430,
      max: 0.4228,
      min: 0.2194,
      std: 0.0523
    },
    epsilon: {
      mean: 0.4407,
      max: 0.5922,
      min: 0.3030,
      std: 0.0910
    },
    V: {
      mean: 0.6570,
      max: 0.7806,
      min: 0.5772,
      std: 0.0523
    }
  };

  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/experimento/comparar')}
              className="border-purple-500/50 text-purple-500 hover:bg-purple-500/10"
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Comparar con otros regímenes
            </Button>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 text-white title-glow-cyan">Análisis de Estabilidad Temporal</h1>
          <p className="text-cyan-300 text-lg">
            Régimen A - Alta Entropía | 50 mensajes analizados
          </p>
        </div>

        {/* Resumen de hallazgos */}
        <Card className="mb-6 border-amber-500/50 bg-gradient-blue-purple">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              Hallazgo Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              El umbral Ω &gt; 0.5 <strong>NO fue superado</strong> en ningún turno. 
              El máximo alcanzado fue <strong className="text-amber-500">Ω = 0.4228</strong> en el{' '}
              <strong>turno 13</strong> (pregunta: "¿Qué es la validación cruzada?").
            </p>
          </CardContent>
        </Card>

        {/* Selector de métrica */}
        <Card className="mb-6 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle>Seleccionar Métrica</CardTitle>
            <CardDescription>
              Visualiza la evolución temporal de diferentes métricas de estabilidad
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={selectedMetric === 'omega' ? 'default' : 'outline'}
                onClick={() => setSelectedMetric('omega')}
              >
                Ω (Coste de Control)
              </Button>
              <Button
                variant={selectedMetric === 'epsilon' ? 'default' : 'outline'}
                onClick={() => setSelectedMetric('epsilon')}
              >
                ε (Entropía)
              </Button>
              <Button
                variant={selectedMetric === 'V' ? 'default' : 'outline'}
                onClick={() => setSelectedMetric('V')}
              >
                V (Lyapunov)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica */}
        <Card className="mb-6 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Evolución Temporal</CardTitle>
                <CardDescription>
                  {selectedMetric === 'omega' && 'Coste de Control (Coherencia Observable)'}
                  {selectedMetric === 'epsilon' && 'Entropía Semántica'}
                  {selectedMetric === 'V' && 'Función de Lyapunov (Desalineación)'}
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

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Media
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats[selectedMetric].mean.toFixed(4)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Máximo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-500">
                {stats[selectedMetric].max.toFixed(4)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Mínimo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">
                {stats[selectedMetric].min.toFixed(4)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Desv. Est.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats[selectedMetric].std.toFixed(4)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de datos expandible */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Datos Detallados por Turno</CardTitle>
                <CardDescription>
                  Tabla completa de métricas para los 50 turnos analizados
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTable(!showTable)}
              >
                {showTable ? (
                  <>
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Ocultar tabla
                  </>
                ) : (
                  <>
                    <ChevronDown className="mr-2 h-4 w-4" />
                    Mostrar tabla
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {showTable && (
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortColumn === 'turn') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortColumn('turn');
                              setSortDirection('asc');
                            }
                          }}
                          className="h-8 px-2"
                        >
                          Turno
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </th>
                      <th className="text-left p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortColumn === 'omega') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortColumn('omega');
                              setSortDirection('desc');
                            }
                          }}
                          className="h-8 px-2"
                        >
                          Ω (Coste de Control)
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </th>
                      <th className="text-left p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortColumn === 'epsilon') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortColumn('epsilon');
                              setSortDirection('desc');
                            }
                          }}
                          className="h-8 px-2"
                        >
                          ε (Entropía Semántica)
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </th>
                      <th className="text-left p-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (sortColumn === 'V') {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortColumn('V');
                              setSortDirection('desc');
                            }
                          }}
                          className="h-8 px-2"
                        >
                          V (Lyapunov)
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...STABILITY_DATA.data]
                      .sort((a, b) => {
                        const aVal = a[sortColumn];
                        const bVal = b[sortColumn];
                        if (sortDirection === 'asc') {
                          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                        } else {
                          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
                        }
                      })
                      .map((row) => (
                        <tr
                          key={row.turn}
                          className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 font-mono">{row.turn}</td>
                          <td className="p-3 font-mono">
                            <span className={row.omega === STABILITY_DATA.maxOmega ? 'text-amber-500 font-bold' : ''}>
                              {row.omega.toFixed(4)}
                            </span>
                          </td>
                          <td className="p-3 font-mono">{row.epsilon.toFixed(4)}</td>
                          <td className="p-3 font-mono">{row.V.toFixed(4)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
