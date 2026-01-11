import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { generateLyapunovChart, generateOmegaChart, getProfileColor, getProfileLabel as getChartProfileLabel } from "./chartGenerator";

interface PDFData {
  session: {
    id: number;
    createdAt: Date;
    plantProfile: string;
    purpose: string;
    limits: string;
    ethics: string;
    tprCurrent: number;
    tprMax: number;
  };
  messages: Array<{
    role: string;
    content: string;
    timestamp: Date;
    plantProfile: string | null;
  }>;
  metrics: Array<{
    timestamp: Date;
    errorNorm: number;
    funcionLyapunov: number;
    coherenciaObservable: number;
    entropiaH: number;
    coherenciaInternaC: number;
  }>;
  statistics: {
    lyapunov: { mean: number; std: number; min: number; max: number };
    omega: { mean: number; std: number; min: number; max: number };
    error: { mean: number; std: number; min: number; max: number };
    tprPercent: number;
    totalSteps: number;
    totalMessages: number;
  };
  markers: Array<{
    id: number;
    messageIndex: number;
    markerType: string;
    title: string;
    description: string;
    createdAt: Date;
  }>;
}

export async function generatePDF(data: PDFData) {
  const doc = new jsPDF();
  let yPos = 20;

  // ============================================
  // PORTADA
  // ============================================
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("ARESK-OBS", 105, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(16);
  doc.text("Reporte de Análisis de Sesión", 105, yPos, { align: "center" });
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Sesión ID: ${data.session.id}`, 105, yPos, { align: "center" });
  
  yPos += 8;
  const createdDate = new Date(data.session.createdAt).toLocaleString("es-ES");
  doc.text(`Fecha: ${createdDate}`, 105, yPos, { align: "center" });
  
  yPos += 8;
  const profileLabel = getProfileLabel(data.session.plantProfile);
  doc.text(`Perfil de Planta: ${profileLabel}`, 105, yPos, { align: "center" });
  
  yPos += 20;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Observador de Estados Semánticos", 105, yPos, { align: "center" });
  doc.text("Sistema de Medición de Coherencia Cognitiva", 105, yPos + 5, { align: "center" });
  
  // ============================================
  // REFERENCIA ONTOLÓGICA
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Referencia Ontológica", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Propósito:", 20, yPos);
  
  yPos += 6;
  doc.setFont("helvetica", "normal");
  const purposeLines = doc.splitTextToSize(data.session.purpose, 170);
  doc.text(purposeLines, 20, yPos);
  yPos += purposeLines.length * 5 + 5;
  
  doc.setFont("helvetica", "bold");
  doc.text("Límites:", 20, yPos);
  
  yPos += 6;
  doc.setFont("helvetica", "normal");
  const limitsLines = doc.splitTextToSize(data.session.limits, 170);
  doc.text(limitsLines, 20, yPos);
  yPos += limitsLines.length * 5 + 5;
  
  doc.setFont("helvetica", "bold");
  doc.text("Ética:", 20, yPos);
  
  yPos += 6;
  doc.setFont("helvetica", "normal");
  const ethicsLines = doc.splitTextToSize(data.session.ethics, 170);
  doc.text(ethicsLines, 20, yPos);
  
  // ============================================
  // ESTADÍSTICAS DESCRIPTIVAS
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Estadísticas Descriptivas", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(11);
  
  // Tabla de resumen general
  autoTable(doc, {
    startY: yPos,
    head: [["Métrica", "Valor"]],
    body: [
      ["Total de Pasos", data.statistics.totalSteps.toString()],
      ["Total de Mensajes", data.statistics.totalMessages.toString()],
      ["TPR (Tiempo en Régimen)", `${data.statistics.tprPercent.toFixed(2)}%`],
      ["TPR Actual", `${data.session.tprCurrent.toFixed(2)}s`],
      ["TPR Máximo", `${data.session.tprMax.toFixed(2)}s`],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Tabla de Función de Lyapunov V(e)
  doc.setFont("helvetica", "bold");
  doc.text("Función de Lyapunov V(e)", 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Estadística", "Valor"]],
    body: [
      ["Media", data.statistics.lyapunov.mean.toFixed(4)],
      ["Desviación Estándar", data.statistics.lyapunov.std.toFixed(4)],
      ["Mínimo", data.statistics.lyapunov.min.toFixed(4)],
      ["Máximo", data.statistics.lyapunov.max.toFixed(4)],
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
    head: [["Estadística", "Valor"]],
    body: [
      ["Media", data.statistics.omega.mean.toFixed(4)],
      ["Desviación Estándar", data.statistics.omega.std.toFixed(4)],
      ["Mínimo", data.statistics.omega.min.toFixed(4)],
      ["Máximo", data.statistics.omega.max.toFixed(4)],
    ],
    theme: "striped",
    headStyles: { fillColor: [46, 204, 113] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Tabla de Error Cognitivo ||e(t)||
  doc.setFont("helvetica", "bold");
  doc.text("Error Cognitivo ||e(t)||", 20, yPos);
  yPos += 5;
  
  autoTable(doc, {
    startY: yPos,
    head: [["Estadística", "Valor"]],
    body: [
      ["Media", data.statistics.error.mean.toFixed(4)],
      ["Desviación Estándar", data.statistics.error.std.toFixed(4)],
      ["Mínimo", data.statistics.error.min.toFixed(4)],
      ["Máximo", data.statistics.error.max.toFixed(4)],
    ],
    theme: "striped",
    headStyles: { fillColor: [231, 76, 60] },
  });
  
  // ============================================
  // TABLA DE MÉTRICAS POR PASO
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Métricas por Paso Temporal", 20, yPos);
  
  yPos += 10;
  
  const metricsTableData = data.metrics.map((m, index) => [
    (index + 1).toString(),
    new Date(m.timestamp).toLocaleTimeString("es-ES"),
    m.errorNorm.toFixed(4),
    m.funcionLyapunov.toFixed(4),
    m.coherenciaObservable.toFixed(4),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [["Paso", "Timestamp", "||e(t)||", "V(e)", "Ω(t)"]],
    body: metricsTableData,
    theme: "grid",
    headStyles: { fillColor: [52, 73, 94] },
    styles: { fontSize: 8 },
    columnStyles: {
      0: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
    },
  });
  
  // ============================================
  // GRÁFICOS DE MÉTRICAS
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Visualización de Métricas", 20, yPos);
  
  yPos += 10;
  
  try {
    // Generar gráfico de V(t)
    const lyapunovImage = await generateLyapunovChart(
      [data.metrics],
      [getProfileLabel(data.session.plantProfile)],
      [getProfileColor(data.session.plantProfile)]
    );
    
    doc.addImage(lyapunovImage, "PNG", 10, yPos, 190, 95);
    yPos += 105;
    
    // Generar gráfico de Ω(t)
    const omegaImage = await generateOmegaChart(
      [data.metrics],
      [getProfileLabel(data.session.plantProfile)],
      [getProfileColor(data.session.plantProfile)]
    );
    
    doc.addImage(omegaImage, "PNG", 10, yPos, 190, 95);
  } catch (error) {
    console.error("Error al generar gráficos:", error);
    doc.setFontSize(10);
    doc.setTextColor(200, 0, 0);
    doc.text("Error al generar gráficos de visualización", 20, yPos);
    doc.setTextColor(0, 0, 0);
  }
  
  // ============================================
  // HISTORIAL DE MENSAJES
  // ============================================
  doc.addPage();
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Historial de Conversación", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  
  for (const message of data.messages) {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont("helvetica", "bold");
    const roleLabel = message.role === "user" ? "Usuario" : "Asistente";
    const timestamp = new Date(message.timestamp).toLocaleTimeString("es-ES");
    doc.text(`${roleLabel} (${timestamp})`, 20, yPos);
    
    if (message.role === "assistant" && message.plantProfile) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`[${getProfileLabel(message.plantProfile)}]`, 70, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
    }
    
    yPos += 6;
    doc.setFont("helvetica", "normal");
    const contentLines = doc.splitTextToSize(message.content, 170);
    doc.text(contentLines, 20, yPos);
    yPos += contentLines.length * 5 + 8;
  }
  
  // ============================================
  // PIE DE PÁGINA
  // ============================================
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `ARESK-OBS - Página ${i} de ${pageCount}`,
      105,
      290,
      { align: "center" }
    );
  }
  
  // ============================================
  // EVENTOS DESTACADOS (MARCADORES)
  // ============================================
  if (data.markers && data.markers.length > 0) {
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Eventos Destacados", 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Marcadores temporales añadidos durante el análisis", 20, yPos);
    
    yPos += 10;
    
    for (const marker of data.markers) {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      // Tipo de marcador
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const markerTypeLabel = getMarkerTypeLabel(marker.markerType);
      doc.text(`[${markerTypeLabel}] Paso ${marker.messageIndex + 1}`, 20, yPos);
      
      yPos += 6;
      
      // Título
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const titleLines = doc.splitTextToSize(marker.title, 170);
      doc.text(titleLines, 20, yPos);
      yPos += titleLines.length * 5;
      
      // Descripción
      if (marker.description) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const descLines = doc.splitTextToSize(marker.description, 170);
        doc.text(descLines, 20, yPos);
        yPos += descLines.length * 4.5;
        doc.setTextColor(0, 0, 0);
      }
      
      yPos += 8;
    }
  }
  
  // ============================================
  // GUARDAR PDF
  // ============================================
  const fileName = `ARESK-OBS_Sesion_${data.session.id}_${new Date().toISOString().split("T")[0]}.pdf`;
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

function getMarkerTypeLabel(type: string): string {
  switch (type) {
    case "colapso_semantico": return "Colapso Semántico";
    case "recuperacion": return "Recuperación";
    case "transicion": return "Transición de Régimen";
    case "observacion": return "Observación General";
    default: return type;
  }
}
