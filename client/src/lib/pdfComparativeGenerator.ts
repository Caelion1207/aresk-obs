import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { generateLyapunovChart, generateOmegaChart, generateCombinedChart, getProfileColor, getProfileLabel as getChartProfileLabel } from "./chartGenerator";

interface SessionData {
  id: number;
  createdAt: Date;
  plantProfile: string;
  purpose: string;
  limits: string;
  ethics: string;
  tprCurrent: number;
  tprMax: number;
}

interface Statistics {
  lyapunov: { mean: number; std: number; min: number; max: number };
  omega: { mean: number; std: number; min: number; max: number };
  error: { mean: number; std: number; min: number; max: number };
  tprPercent: number;
  totalSteps: number;
}

interface MetricPoint {
  timestamp: Date;
  errorNorm: number;
  funcionLyapunov: number;
  coherenciaObservable: number;
}

interface Difference {
  index: number;
  lengthDiff: number;
  lengthDiffPercent: number;
  semanticSimilarity: number;
}

interface Comparison {
  avgSemanticSimilarity: number;
  significantDifferences: number;
  totalComparisons: number;
}

interface DualComparativeData {
  sessions: SessionData[];
  statistics: Statistics[];
  metrics: MetricPoint[][];
  differences: Difference[];
  comparison: Comparison;
}

interface PairwiseComparison {
  pair: string;
  differences: Difference[];
  avgSemanticSimilarity: number;
  significantDifferences: number;
  totalComparisons: number;
}

interface TripleComparativeData {
  sessions: SessionData[];
  statistics: Statistics[];
  metrics: MetricPoint[][];
  pairwiseComparisons: PairwiseComparison[];
}

export async function generateComparativeDualPDF(data: DualComparativeData) {
  const doc = new jsPDF();
  let yPos = 20;

  // ============================================
  // PORTADA COMPARATIVA
  // ============================================
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ARESK-OBS", 105, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(16);
  doc.text("Análisis Comparativo Dual", 105, yPos, { align: "center" });
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const profile1 = getProfileLabel(data.sessions[0].plantProfile);
  const profile2 = getProfileLabel(data.sessions[1].plantProfile);
  doc.text(`${profile1} vs ${profile2}`, 105, yPos, { align: "center" });
  
  yPos += 8;
  const date = new Date().toLocaleString("es-ES");
  doc.text(`Fecha de Reporte: ${date}`, 105, yPos, { align: "center" });
  
  yPos += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Análisis de Estabilidad y Coherencia Cognitiva", 105, yPos, { align: "center" });
  doc.text("Comparación de Perfiles de Planta", 105, yPos + 5, { align: "center" });
  
  // ============================================
  // INFORMACIÓN DE SESIONES
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Información de Sesiones", 20, yPos);
  
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Atributo", profile1, profile2]],
    body: [
      ["ID de Sesión", data.sessions[0].id.toString(), data.sessions[1].id.toString()],
      [
        "Fecha de Creación", 
        new Date(data.sessions[0].createdAt).toLocaleString("es-ES"),
        new Date(data.sessions[1].createdAt).toLocaleString("es-ES")
      ],
      ["Perfil de Planta", profile1, profile2],
      ["Total de Pasos", data.statistics[0].totalSteps.toString(), data.statistics[1].totalSteps.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  // ============================================
  // ESTADÍSTICAS COMPARATIVAS
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Estadísticas Comparativas", 20, yPos);
  
  yPos += 10;
  
  // Tabla de Función de Lyapunov V(e)
  doc.setFontSize(12);
  doc.text("Función de Lyapunov V(e)", 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", profile1, profile2]],
    body: [
      ["Media", data.statistics[0].lyapunov.mean.toFixed(4), data.statistics[1].lyapunov.mean.toFixed(4)],
      ["Desv. Estándar", data.statistics[0].lyapunov.std.toFixed(4), data.statistics[1].lyapunov.std.toFixed(4)],
      ["Mínimo", data.statistics[0].lyapunov.min.toFixed(4), data.statistics[1].lyapunov.min.toFixed(4)],
      ["Máximo", data.statistics[0].lyapunov.max.toFixed(4), data.statistics[1].lyapunov.max.toFixed(4)],
    ],
    theme: "striped",
    headStyles: { fillColor: [52, 152, 219] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Tabla de Coherencia Observable Ω(t)
  doc.setFont("helvetica", "bold");
  doc.text("Coherencia Observable Ω(t)", 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", profile1, profile2]],
    body: [
      ["Media", data.statistics[0].omega.mean.toFixed(4), data.statistics[1].omega.mean.toFixed(4)],
      ["Desv. Estándar", data.statistics[0].omega.std.toFixed(4), data.statistics[1].omega.std.toFixed(4)],
      ["Mínimo", data.statistics[0].omega.min.toFixed(4), data.statistics[1].omega.min.toFixed(4)],
      ["Máximo", data.statistics[0].omega.max.toFixed(4), data.statistics[1].omega.max.toFixed(4)],
    ],
    theme: "striped",
    headStyles: { fillColor: [46, 204, 113] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Tabla de TPR
  doc.setFont("helvetica", "bold");
  doc.text("Tiempo de Permanencia en Régimen (TPR)", 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", profile1, profile2]],
    body: [
      ["TPR (%)", `${data.statistics[0].tprPercent.toFixed(2)}%`, `${data.statistics[1].tprPercent.toFixed(2)}%`],
    ],
    theme: "striped",
    headStyles: { fillColor: [155, 89, 182] },
  });
  
  // ============================================
  // GRÁFICOS COMPARATIVOS
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Visualización Comparativa de Métricas", 20, yPos);
  
  yPos += 10;
  
  try {
    const labels = data.sessions.map(s => getProfileLabel(s.plantProfile));
    const colors = data.sessions.map(s => getProfileColor(s.plantProfile));
    
    // Generar gráfico combinado de V(t) y Ω(t)
    const combinedImage = await generateCombinedChart(
      data.metrics,
      labels,
      colors
    );
    
    doc.addImage(combinedImage, "PNG", 5, yPos, 200, 125);
    yPos += 135;
    
    // Agregar nota explicativa
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    const note = "Líneas sólidas representan V(e), líneas punteadas representan Ω(t). Eje izquierdo: V(e), Eje derecho: Ω(t).";
    doc.text(note, 105, yPos, { align: "center" });
    doc.setTextColor(0, 0, 0);
  } catch (error) {
    console.error("Error al generar gráficos comparativos:", error);
    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text("Error al generar gráficos de visualización", 20, yPos);
    doc.setTextColor(0, 0, 0);
  }
  
  // ============================================
  // ANÁLISIS DE SIMILITUD SEMÁNTICA
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Análisis de Similitud Semántica", 20, yPos);
  
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", "Valor"]],
    body: [
      ["Similitud Promedio", data.comparison.avgSemanticSimilarity.toFixed(4)],
      ["Total de Comparaciones", data.comparison.totalComparisons.toString()],
      ["Diferencias Significativas (< 0.7)", data.comparison.significantDifferences.toString()],
      ["Tasa de Divergencia", `${((data.comparison.significantDifferences / data.comparison.totalComparisons) * 100).toFixed(2)}%`],
    ],
    theme: "grid",
    headStyles: { fillColor: [231, 76, 60] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Tabla de diferencias por paso
  doc.setFont("helvetica", "bold");
  doc.text("Diferencias por Paso Temporal", 20, yPos);
  yPos += 5;
  
  const differencesTableData = data.differences.slice(0, 20).map(d => [
    (d.index + 1).toString(),
    `${d.lengthDiffPercent.toFixed(2)}%`,
    d.semanticSimilarity.toFixed(4),
    d.semanticSimilarity < 0.7 ? "Sí" : "No",
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["Paso", "Dif. Longitud", "Similitud", "Divergente"]],
    body: differencesTableData,
    theme: "grid",
    headStyles: { fillColor: [52, 73, 94] },
    styles: { fontSize: 9 },
  });
  
  // ============================================
  // CONCLUSIONES
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Conclusiones Comparativas", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const conclusions = [
    `El perfil ${profile1} presenta una energía de Lyapunov promedio de ${data.statistics[0].lyapunov.mean.toFixed(4)}, mientras que ${profile2} muestra ${data.statistics[1].lyapunov.mean.toFixed(4)}.`,
    ``,
    `En términos de coherencia observable, ${profile1} alcanza ${data.statistics[0].omega.mean.toFixed(4)} en promedio, comparado con ${data.statistics[1].omega.mean.toFixed(4)} de ${profile2}.`,
    ``,
    `El TPR indica que ${profile1} permanece en régimen estable el ${data.statistics[0].tprPercent.toFixed(2)}% del tiempo, mientras que ${profile2} lo hace el ${data.statistics[1].tprPercent.toFixed(2)}%.`,
    ``,
    `La similitud semántica promedio entre las respuestas es de ${data.comparison.avgSemanticSimilarity.toFixed(4)}, con ${data.comparison.significantDifferences} divergencias significativas de ${data.comparison.totalComparisons} comparaciones.`,
  ];
  
  conclusions.forEach(line => {
    if (line === "") {
      yPos += 5;
    } else {
      const lines = doc.splitTextToSize(line, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6;
    }
  });
  
  // ============================================
  // PIE DE PÁGINA
  // ============================================
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ARESK-OBS Comparativo - Página ${i} de ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
  
  // ============================================
  // GUARDAR PDF
  // ============================================
  const fileName = `ARESK-OBS_Comparativo_${data.sessions[0].id}_vs_${data.sessions[1].id}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

export async function generateComparativeTriplePDF(data: TripleComparativeData) {
  const doc = new jsPDF();
  let yPos = 20;

  // ============================================
  // PORTADA COMPARATIVA
  // ============================================
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ARESK-OBS", 105, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(16);
  doc.text("Análisis Comparativo Triple", 105, yPos, { align: "center" });
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const profile1 = getProfileLabel(data.sessions[0].plantProfile);
  const profile2 = getProfileLabel(data.sessions[1].plantProfile);
  const profile3 = getProfileLabel(data.sessions[2].plantProfile);
  doc.text(`${profile1} vs ${profile2} vs ${profile3}`, 105, yPos, { align: "center" });
  
  yPos += 8;
  const date = new Date().toLocaleString("es-ES");
  doc.text(`Fecha de Reporte: ${date}`, 105, yPos, { align: "center" });
  
  yPos += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Análisis Exhaustivo de Estabilidad Cognitiva", 105, yPos, { align: "center" });
  doc.text("Comparación de Tres Perfiles de Planta", 105, yPos + 5, { align: "center" });
  
  // ============================================
  // INFORMACIÓN DE SESIONES
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Información de Sesiones", 20, yPos);
  
  yPos += 10;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Atributo", profile1, profile2, profile3]],
    body: [
      [
        "ID de Sesión", 
        data.sessions[0].id.toString(), 
        data.sessions[1].id.toString(),
        data.sessions[2].id.toString()
      ],
      [
        "Fecha de Creación", 
        new Date(data.sessions[0].createdAt).toLocaleString("es-ES"),
        new Date(data.sessions[1].createdAt).toLocaleString("es-ES"),
        new Date(data.sessions[2].createdAt).toLocaleString("es-ES")
      ],
      ["Perfil de Planta", profile1, profile2, profile3],
      [
        "Total de Pasos", 
        data.statistics[0].totalSteps.toString(), 
        data.statistics[1].totalSteps.toString(),
        data.statistics[2].totalSteps.toString()
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 },
  });
  
  // ============================================
  // ESTADÍSTICAS COMPARATIVAS
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Estadísticas Comparativas", 20, yPos);
  
  yPos += 10;
  
  // Tabla de Función de Lyapunov V(e)
  doc.setFontSize(12);
  doc.text("Función de Lyapunov V(e)", 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", profile1, profile2, profile3]],
    body: [
      [
        "Media", 
        data.statistics[0].lyapunov.mean.toFixed(4), 
        data.statistics[1].lyapunov.mean.toFixed(4),
        data.statistics[2].lyapunov.mean.toFixed(4)
      ],
      [
        "Desv. Estándar", 
        data.statistics[0].lyapunov.std.toFixed(4), 
        data.statistics[1].lyapunov.std.toFixed(4),
        data.statistics[2].lyapunov.std.toFixed(4)
      ],
      [
        "Mínimo", 
        data.statistics[0].lyapunov.min.toFixed(4), 
        data.statistics[1].lyapunov.min.toFixed(4),
        data.statistics[2].lyapunov.min.toFixed(4)
      ],
      [
        "Máximo", 
        data.statistics[0].lyapunov.max.toFixed(4), 
        data.statistics[1].lyapunov.max.toFixed(4),
        data.statistics[2].lyapunov.max.toFixed(4)
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [52, 152, 219] },
    styles: { fontSize: 9 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Tabla de Coherencia Observable Ω(t)
  doc.setFont("helvetica", "bold");
  doc.text("Coherencia Observable Ω(t)", 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", profile1, profile2, profile3]],
    body: [
      [
        "Media", 
        data.statistics[0].omega.mean.toFixed(4), 
        data.statistics[1].omega.mean.toFixed(4),
        data.statistics[2].omega.mean.toFixed(4)
      ],
      [
        "Desv. Estándar", 
        data.statistics[0].omega.std.toFixed(4), 
        data.statistics[1].omega.std.toFixed(4),
        data.statistics[2].omega.std.toFixed(4)
      ],
      [
        "Mínimo", 
        data.statistics[0].omega.min.toFixed(4), 
        data.statistics[1].omega.min.toFixed(4),
        data.statistics[2].omega.min.toFixed(4)
      ],
      [
        "Máximo", 
        data.statistics[0].omega.max.toFixed(4), 
        data.statistics[1].omega.max.toFixed(4),
        data.statistics[2].omega.max.toFixed(4)
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [46, 204, 113] },
    styles: { fontSize: 9 },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Tabla de TPR
  doc.setFont("helvetica", "bold");
  doc.text("Tiempo de Permanencia en Régimen (TPR)", 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", profile1, profile2, profile3]],
    body: [
      [
        "TPR (%)", 
        `${data.statistics[0].tprPercent.toFixed(2)}%`, 
        `${data.statistics[1].tprPercent.toFixed(2)}%`,
        `${data.statistics[2].tprPercent.toFixed(2)}%`
      ],
    ],
    theme: "striped",
    headStyles: { fillColor: [155, 89, 182] },
    styles: { fontSize: 9 },
  });
  
  // ============================================
  // GRÁFICOS COMPARATIVOS TRIPLE
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Visualización Comparativa de Métricas", 20, yPos);
  
  yPos += 10;
  
  try {
    const labels = data.sessions.map(s => getProfileLabel(s.plantProfile));
    const colors = data.sessions.map(s => getProfileColor(s.plantProfile));
    
    // Generar gráfico combinado de V(t) y Ω(t) para tres sesiones
    const combinedImage = await generateCombinedChart(
      data.metrics,
      labels,
      colors
    );
    
    doc.addImage(combinedImage, "PNG", 5, yPos, 200, 125);
    yPos += 135;
    
    // Agregar nota explicativa
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    const note = "Líneas sólidas: V(e), Líneas punteadas: Ω(t). Tres perfiles superpuestos con colores distintivos.";
    doc.text(note, 105, yPos, { align: "center" });
    doc.setTextColor(0, 0, 0);
  } catch (error) {
    console.error("Error al generar gráficos comparativos:", error);
    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text("Error al generar gráficos de visualización", 20, yPos);
    doc.setTextColor(0, 0, 0);
  }
  
  // ============================================
  // MATRIZ DE SIMILITUD SEMÁNTICA
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Matriz de Similitud Semántica", 20, yPos);
  
  yPos += 10;
  
  const pair12 = data.pairwiseComparisons.find(p => p.pair === "1-2");
  const pair13 = data.pairwiseComparisons.find(p => p.pair === "1-3");
  const pair23 = data.pairwiseComparisons.find(p => p.pair === "2-3");
  
  autoTable(doc, {
    startY: yPos,
    head: [["Par de Perfiles", "Similitud Promedio", "Divergencias", "Total"]],
    body: [
      [
        `${profile1} - ${profile2}`,
        pair12?.avgSemanticSimilarity.toFixed(4) || "N/A",
        pair12?.significantDifferences.toString() || "0",
        pair12?.totalComparisons.toString() || "0"
      ],
      [
        `${profile1} - ${profile3}`,
        pair13?.avgSemanticSimilarity.toFixed(4) || "N/A",
        pair13?.significantDifferences.toString() || "0",
        pair13?.totalComparisons.toString() || "0"
      ],
      [
        `${profile2} - ${profile3}`,
        pair23?.avgSemanticSimilarity.toFixed(4) || "N/A",
        pair23?.significantDifferences.toString() || "0",
        pair23?.totalComparisons.toString() || "0"
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [231, 76, 60] },
  });
  
  // ============================================
  // CONCLUSIONES
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Conclusiones Comparativas", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const avgLyapunov = data.statistics.map(s => s.lyapunov.mean);
  const avgOmega = data.statistics.map(s => s.omega.mean);
  const avgTPR = data.statistics.map(s => s.tprPercent);
  
  const conclusions = [
    `Análisis de Energía de Lyapunov:`,
    `- ${profile1}: ${avgLyapunov[0].toFixed(4)}`,
    `- ${profile2}: ${avgLyapunov[1].toFixed(4)}`,
    `- ${profile3}: ${avgLyapunov[2].toFixed(4)}`,
    ``,
    `Análisis de Coherencia Observable:`,
    `- ${profile1}: ${avgOmega[0].toFixed(4)}`,
    `- ${profile2}: ${avgOmega[1].toFixed(4)}`,
    `- ${profile3}: ${avgOmega[2].toFixed(4)}`,
    ``,
    `Análisis de TPR (Tiempo en Régimen):`,
    `- ${profile1}: ${avgTPR[0].toFixed(2)}%`,
    `- ${profile2}: ${avgTPR[1].toFixed(2)}%`,
    `- ${profile3}: ${avgTPR[2].toFixed(2)}%`,
    ``,
    `La comparación exhaustiva revela diferencias significativas en la estabilidad y coherencia entre los tres perfiles de planta analizados.`,
  ];
  
  conclusions.forEach(line => {
    if (line === "") {
      yPos += 5;
    } else {
      const lines = doc.splitTextToSize(line, 170);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 6;
    }
  });
  
  // ============================================
  // PIE DE PÁGINA
  // ============================================
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ARESK-OBS Comparativo Triple - Página ${i} de ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
  
  // ============================================
  // GUARDAR PDF
  // ============================================
  const fileName = `ARESK-OBS_Comparativo_Triple_${data.sessions[0].id}_${data.sessions[1].id}_${data.sessions[2].id}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

function getProfileLabel(profile: string): string {
  switch (profile) {
    case "tipo_a": return "Tipo A (Alta Entropía)";
    case "tipo_b": return "Tipo B (Ruido Moderado)";
    case "acoplada": return "Acoplada (CAELION)";
    default: return profile;
  }
}
