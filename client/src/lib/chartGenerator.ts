import { Chart, ChartConfiguration, registerables } from "chart.js";

// Registrar todos los componentes de Chart.js
Chart.register(...registerables);

interface MetricPoint {
  timestamp: Date;
  funcionLyapunov: number;
  coherenciaObservable: number;
}

interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderWidth: number;
  tension: number;
}

/**
 * Genera un gráfico de Función de Lyapunov V(t) y lo convierte a imagen base64
 */
export async function generateLyapunovChart(
  metricsData: MetricPoint[][],
  labels: string[],
  colors: string[]
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("No se pudo crear el contexto del canvas");
  }
  
  // Preparar datasets para cada sesión
  const datasets: ChartDataset[] = metricsData.map((metrics, idx) => ({
    label: labels[idx] || `Sesión ${idx + 1}`,
    data: metrics.map(m => m.funcionLyapunov),
    borderColor: colors[idx] || `hsl(${idx * 120}, 70%, 50%)`,
    backgroundColor: `${colors[idx] || `hsl(${idx * 120}, 70%, 50%)`}33`,
    borderWidth: 2,
    tension: 0.3,
  }));
  
  // Generar etiquetas de tiempo (índices de paso)
  const maxLength = Math.max(...metricsData.map(m => m.length));
  const timeLabels = Array.from({ length: maxLength }, (_, i) => `t${i + 1}`);
  
  const config: ChartConfiguration = {
    type: "line",
    data: {
      labels: timeLabels,
      datasets,
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: "Función de Lyapunov V(e) - Evolución Temporal",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Paso Temporal",
          },
          ticks: {
            maxTicksLimit: 15,
          },
        },
        y: {
          title: {
            display: true,
            text: "V(e)",
          },
          beginAtZero: true,
        },
      },
    },
  };
  
  const chart = new Chart(ctx, config);
  
  // Esperar a que el gráfico se renderice
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const imageData = canvas.toDataURL("image/png");
  chart.destroy();
  
  return imageData;
}

/**
 * Genera un gráfico de Coherencia Observable Ω(t) y lo convierte a imagen base64
 */
export async function generateOmegaChart(
  metricsData: MetricPoint[][],
  labels: string[],
  colors: string[]
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("No se pudo crear el contexto del canvas");
  }
  
  // Preparar datasets para cada sesión
  const datasets: ChartDataset[] = metricsData.map((metrics, idx) => ({
    label: labels[idx] || `Sesión ${idx + 1}`,
    data: metrics.map(m => m.coherenciaObservable),
    borderColor: colors[idx] || `hsl(${idx * 120}, 70%, 50%)`,
    backgroundColor: `${colors[idx] || `hsl(${idx * 120}, 70%, 50%)`}33`,
    borderWidth: 2,
    tension: 0.3,
  }));
  
  // Generar etiquetas de tiempo
  const maxLength = Math.max(...metricsData.map(m => m.length));
  const timeLabels = Array.from({ length: maxLength }, (_, i) => `t${i + 1}`);
  
  const config: ChartConfiguration = {
    type: "line",
    data: {
      labels: timeLabels,
      datasets,
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        title: {
          display: true,
          text: "Coherencia Observable Ω(t) - Evolución Temporal",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        legend: {
          display: true,
          position: "top",
        },

      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Paso Temporal",
          },
          ticks: {
            maxTicksLimit: 15,
          },
        },
        y: {
          title: {
            display: true,
            text: "Ω(t)",
          },
          min: 0,
          max: 1,
        },
      },
    },
  };
  
  const chart = new Chart(ctx, config);
  
  // Esperar a que el gráfico se renderice
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const imageData = canvas.toDataURL("image/png");
  chart.destroy();
  
  return imageData;
}

/**
 * Genera un gráfico combinado de V(t) y Ω(t) en un solo panel
 */
export async function generateCombinedChart(
  metricsData: MetricPoint[][],
  labels: string[],
  colors: string[]
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 500;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    throw new Error("No se pudo crear el contexto del canvas");
  }
  
  // Preparar datasets para V(e)
  const vDatasets: ChartDataset[] = metricsData.map((metrics, idx) => ({
    label: `${labels[idx]} - V(e)`,
    data: metrics.map(m => m.funcionLyapunov),
    borderColor: colors[idx] || `hsl(${idx * 120}, 70%, 50%)`,
    backgroundColor: `${colors[idx] || `hsl(${idx * 120}, 70%, 50%)`}33`,
    borderWidth: 2,
    tension: 0.3,
    yAxisID: "y",
  }));
  
  // Preparar datasets para Ω(t)
  const omegaDatasets: ChartDataset[] = metricsData.map((metrics, idx) => ({
    label: `${labels[idx]} - Ω(t)`,
    data: metrics.map(m => m.coherenciaObservable),
    borderColor: colors[idx] || `hsl(${idx * 120}, 70%, 50%)`,
    backgroundColor: `${colors[idx] || `hsl(${idx * 120}, 70%, 50%)`}33`,
    borderWidth: 2,
    borderDash: [5, 5],
    tension: 0.3,
    yAxisID: "y1",
  }));
  
  // Generar etiquetas de tiempo
  const maxLength = Math.max(...metricsData.map(m => m.length));
  const timeLabels = Array.from({ length: maxLength }, (_, i) => `t${i + 1}`);
  
  const config: ChartConfiguration = {
    type: "line",
    data: {
      labels: timeLabels,
      datasets: [...vDatasets, ...omegaDatasets],
    },
    options: {
      responsive: false,
      animation: false,
      interaction: {
        mode: "index",
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: "Métricas Comparativas: V(e) y Ω(t)",
          font: {
            size: 16,
            weight: "bold",
          },
        },
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Paso Temporal",
          },
          ticks: {
            maxTicksLimit: 15,
          },
        },
        y: {
          type: "linear",
          display: true,
          position: "left",
          title: {
            display: true,
            text: "V(e)",
          },
          beginAtZero: true,
        },
        y1: {
          type: "linear",
          display: true,
          position: "right",
          title: {
            display: true,
            text: "Ω(t)",
          },
          min: 0,
          max: 1,
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  };
  
  const chart = new Chart(ctx, config);
  
  // Esperar a que el gráfico se renderice
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const imageData = canvas.toDataURL("image/png");
  chart.destroy();
  
  return imageData;
}

/**
 * Obtiene el color asociado a un perfil de planta
 */
export function getProfileColor(profile: string): string {
  switch (profile) {
    case "tipo_a":
      return "rgb(239, 68, 68)"; // Rojo
    case "tipo_b":
      return "rgb(234, 179, 8)"; // Amarillo
    case "acoplada":
      return "rgb(34, 197, 94)"; // Verde
    default:
      return "rgb(100, 116, 139)"; // Gris por defecto
  }
}

/**
 * Obtiene la etiqueta legible de un perfil de planta
 */
export function getProfileLabel(profile: string): string {
  switch (profile) {
    case "tipo_a":
      return "Tipo A (Alta Entropía)";
    case "tipo_b":
      return "Tipo B (Ruido Moderado)";
    case "acoplada":
      return "Acoplada (CAELION)";
    default:
      return profile;
  }
}
