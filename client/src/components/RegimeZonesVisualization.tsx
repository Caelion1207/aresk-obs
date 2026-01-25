import { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

export default function RegimeZonesVisualization() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Generar trayectoria de ejemplo que oscila entre zonas
    const turns = Array.from({ length: 51 }, (_, i) => i);
    const trajectory = [
      0.5, 0.6, 0.8, 1.2, 1.5, 1.8, 2.1, 2.5, 3.0, 3.5,
      3.8, 4.2, 4.5, 4.8, 3.5, 2.8, 2.0, 1.5, 1.0, 0.8,
      0.6, 0.5, 0.7, 1.0, 1.3, 1.6, 1.9, 2.2, 2.5, 2.8,
      3.1, 3.4, 3.7, 4.0, 3.5, 3.0, 2.5, 2.0, 1.5, 1.0,
      0.8, 0.6, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.2, 0.9, 0.6
    ];

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: turns,
        datasets: [
          // Zona de Fallo (>4)
          {
            label: 'Zona de Fallo (>4)',
            data: turns.map(() => 6),
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderColor: 'rgba(239, 68, 68, 0)',
            borderWidth: 0,
            fill: { value: 4 },
            pointRadius: 0,
            order: 5
          },
          // Zona Tolerable (2→4)
          {
            label: 'Zona Tolerable (2→4)',
            data: turns.map(() => 4),
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            borderColor: 'rgba(251, 191, 36, 0)',
            borderWidth: 0,
            fill: { value: 2 },
            pointRadius: 0,
            order: 4
          },
          // Zona Estable (0.5→2)
          {
            label: 'Zona Estable (0.5→2)',
            data: turns.map(() => 2),
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            borderColor: 'rgba(34, 197, 94, 0)',
            borderWidth: 0,
            fill: { value: 0.5 },
            pointRadius: 0,
            order: 3
          },
          // Zona de Colapso (<0.5)
          {
            label: 'Colapso Semántico (<0.5)',
            data: turns.map(() => 0.5),
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            borderColor: 'rgba(168, 85, 247, 0)',
            borderWidth: 0,
            fill: { value: 0 },
            pointRadius: 0,
            order: 2
          },
          // Línea de Reposo (~0.5)
          {
            label: 'Reposo Dinámico (~0.5)',
            data: turns.map(() => 0.5),
            borderColor: 'rgba(34, 197, 94, 1)',
            backgroundColor: 'rgba(34, 197, 94, 0)',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            pointRadius: 0,
            order: 1
          },
          // Umbral de Intervención (4)
          {
            label: 'Umbral de Intervención (4)',
            data: turns.map(() => 4),
            borderColor: 'rgba(239, 68, 68, 1)',
            backgroundColor: 'rgba(239, 68, 68, 0)',
            borderWidth: 3,
            borderDash: [10, 5],
            fill: false,
            pointRadius: 0,
            order: 1
          },
          // Trayectoria Ejemplo
          {
            label: 'Trayectoria Ejemplo',
            data: trajectory,
            borderColor: 'rgba(34, 211, 238, 1)',
            backgroundColor: 'rgba(34, 211, 238, 0.3)',
            borderWidth: 3,
            tension: 0.4,
            fill: false,
            pointRadius: 3,
            pointBackgroundColor: 'rgba(34, 211, 238, 1)',
            order: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 11 },
              padding: 10,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Zonas de Régimen Operativo - Control por Régimen',
            color: 'rgba(34, 211, 238, 1)',
            font: { size: 16, weight: 'bold' },
            padding: { bottom: 20 }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const value = context.parsed.y !== null ? context.parsed.y.toFixed(2) : '0';
                return `${label}: ${value}`;
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Turno de Interacción',
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 13 }
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              maxTicksLimit: 10
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Métrica de Estabilidad',
              color: 'rgba(255, 255, 255, 0.7)',
              font: { size: 13 }
            },
            min: 0,
            max: 6,
            ticks: {
              color: 'rgba(255, 255, 255, 0.6)',
              stepSize: 1,
              callback: function(value) {
                if (value === 0.5) return '0.5 (Reposo)';
                if (value === 4) return '4 (Intervención)';
                return value;
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-[550px] bg-gradient-blue-purple border border-cyan-500/30 rounded-lg p-6">
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
