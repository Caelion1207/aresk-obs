import { ChartJSNodeCanvas } from 'chartjs-node-canvas';

const width = 800;
const height = 400;

const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

export interface ChartDataPoint {
  x: number;
  y: number;
}

/**
 * Generar gráfico de línea como imagen PNG base64
 */
export async function generateLineChart(
  data: ChartDataPoint[],
  options: {
    title: string;
    xLabel: string;
    yLabel: string;
    lineColor?: string;
    threshold?: number;
    thresholdLabel?: string;
  }
): Promise<Buffer> {
  const configuration = {
    type: 'line' as const,
    data: {
      datasets: [
        {
          label: options.title,
          data: data,
          borderColor: options.lineColor || 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.1,
        },
        ...(options.threshold !== undefined
          ? [
              {
                label: options.thresholdLabel || 'Umbral',
                data: data.map((d) => ({ x: d.x, y: options.threshold })),
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
              },
            ]
          : []),
      ],
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: options.title,
          font: {
            size: 16,
          },
        },
        legend: {
          display: true,
          position: 'top' as const,
        },
      },
      scales: {
        x: {
          type: 'linear' as const,
          title: {
            display: true,
            text: options.xLabel,
          },
        },
        y: {
          title: {
            display: true,
            text: options.yLabel,
          },
        },
      },
    },
  };

  return chartJSNodeCanvas.renderToBuffer(configuration as any);
}

/**
 * Generar gráfico de línea múltiple para comparación
 */
export async function generateMultiLineChart(
  datasets: Array<{
    label: string;
    data: ChartDataPoint[];
    color: string;
  }>,
  options: {
    title: string;
    xLabel: string;
    yLabel: string;
  }
): Promise<Buffer> {
  const configuration = {
    type: 'line' as const,
    data: {
      datasets: datasets.map((ds) => ({
        label: ds.label,
        data: ds.data,
        borderColor: ds.color,
        backgroundColor: ds.color + '33',
        borderWidth: 2,
        pointRadius: 1,
        tension: 0.1,
      })),
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: options.title,
          font: {
            size: 16,
          },
        },
        legend: {
          display: true,
          position: 'top' as const,
        },
      },
      scales: {
        x: {
          type: 'linear' as const,
          title: {
            display: true,
            text: options.xLabel,
          },
        },
        y: {
          title: {
            display: true,
            text: options.yLabel,
          },
        },
      },
    },
  };

  return chartJSNodeCanvas.renderToBuffer(configuration as any);
}
