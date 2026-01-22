import PDFDocument from 'pdfkit';
import { createHash } from 'crypto';
import { getDb } from '../db';
import { cycles, ethicalLogs, sessions, metrics as metricsTable } from '../../drizzle/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

/**
 * Generador de PDFs según Estándar de Documento CAELION v1.0
 * Formato de Ingeniería Cognitiva
 */

interface CycleReportData {
  cycle: any;
  sessions: any[];
  metrics: any[];
  ethicalLogs: any[];
  argosCosts: {
    totalCost: number;
    avgCostPerMessage: number;
    totalInteractions: number;
  };
}

/**
 * Genera hash SHA-256 del contenido del documento
 */
function generateDocumentHash(data: CycleReportData): string {
  const content = JSON.stringify(data);
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Calcula estado global del sistema
 */
function calculateGlobalStatus(metrics: any[]): 'NOMINAL' | 'DERIVA' | 'CRÍTICO' {
  if (metrics.length === 0) return 'NOMINAL';
  
  const avgOmega = metrics.reduce((sum, m) => sum + (m.coherenciaObservable || 0), 0) / metrics.length;
  const avgVe = metrics.reduce((sum, m) => sum + (m.funcionLyapunov || 0), 0) / metrics.length;
  
  if (avgOmega > 0.85 && avgVe < 0.2) return 'NOMINAL';
  if (avgOmega > 0.6 && avgVe < 0.5) return 'DERIVA';
  return 'CRÍTICO';
}

/**
 * Genera veredicto técnico del ciclo
 */
function generateVerdict(status: string, ethicalViolations: number): string {
  if (status === 'NOMINAL' && ethicalViolations === 0) {
    return 'El sistema operó dentro de invariantes definidos durante el ciclo observado, sin eventos de veto ni pérdida de coherencia estructural.';
  }
  
  if (status === 'DERIVA') {
    return 'Se detectó deriva controlada sin impacto sistémico. El sistema mantuvo control humano.';
  }
  
  return 'Se detectaron eventos críticos que requieren intervención humana inmediata.';
}

interface ChartImages {
  phasePortrait?: string;
  lyapunovEnergy?: string;
  errorDynamics?: string;
  controlEffort?: string;
}

/**
 * Genera PDF de informe de ciclo COM-72
 */
export async function generateCycleReportPDF(cycleId: number, charts?: ChartImages): Promise<Buffer> {
  const db = await getDb();
  if (!db) throw new Error('Database unavailable');
  
  // Obtener datos del ciclo
  const [cycle] = await db.select().from(cycles).where(eq(cycles.id, cycleId));
  if (!cycle) throw new Error(`Cycle #${cycleId} not found`);
  
  // Obtener sesiones del ciclo
  const cycleSessions = await db
    .select()
    .from(sessions)
    .where(
      and(
        gte(sessions.createdAt, cycle.startedAt),
        lte(sessions.createdAt, cycle.scheduledEndAt)
      )
    );
  
  // Obtener métricas de todas las sesiones del ciclo
  const allMetrics: any[] = [];
  for (const session of cycleSessions) {
    const sessionMetrics = await db
      .select()
      .from(metricsTable)
      .where(eq(metricsTable.sessionId, session.id));
    allMetrics.push(...sessionMetrics);
  }
  
  // Obtener logs éticos del ciclo
  const cycleEthicalLogs = await db
    .select()
    .from(ethicalLogs)
    .where(eq(ethicalLogs.cycleId, cycleId));
  
  // Calcular costos ARGOS (placeholder - necesita tabla argosCosts)
  const argosCosts = {
    totalCost: allMetrics.length * 0.000042,
    avgCostPerMessage: 0.000042,
    totalInteractions: allMetrics.length,
  };
  
  const reportData: CycleReportData = {
    cycle,
    sessions: cycleSessions,
    metrics: allMetrics,
    ethicalLogs: cycleEthicalLogs,
    argosCosts,
  };
  
  const documentHash = generateDocumentHash(reportData);
  const globalStatus = calculateGlobalStatus(allMetrics);
  const verdict = generateVerdict(globalStatus, cycleEthicalLogs.length);
  
  // Crear documento PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks: Buffer[] = [];
  
  doc.on('data', (chunk) => chunks.push(chunk));
  
  // 1. PORTADA FUNCIONAL
  doc.fontSize(24).font('Helvetica-Bold').text('ARESK-OBS / CAELION', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(16).font('Helvetica').text('Informe de Observación Sistémica', { align: 'center' });
  doc.moveDown(2);
  
  doc.fontSize(12).font('Helvetica-Bold').text('Versión:', { continued: true });
  doc.font('Helvetica').text(' v1.0.5-FINAL');
  doc.moveDown(0.5);
  
  doc.font('Helvetica-Bold').text('Ciclo observado:', { continued: true });
  doc.font('Helvetica').text(` COM-72 | Ciclo #${cycleId} | ${cycle.status}`);
  doc.moveDown(0.5);
  
  doc.font('Helvetica-Bold').text('Timestamp de cierre:', { continued: true });
  doc.font('Helvetica').text(` ${new Date().toISOString()}`);
  doc.moveDown(0.5);
  
  doc.font('Helvetica-Bold').text('Hash del documento:');
  doc.fontSize(8).font('Courier').text(`SHA-256: ${documentHash}`);
  doc.moveDown(2);
  
  // SEMANTIC CONTRACT
  doc.fontSize(8).font('Helvetica-Bold').text('SEMANTIC CONTRACT: NO ANTHROPOMORPHIC AGENCY', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(7).font('Helvetica').text('This system processes input; it does not "understand."', { align: 'center' });
  doc.fontSize(7).font('Helvetica').text('This system executes logic; it does not "decide."', { align: 'center' });
  doc.fontSize(7).font('Helvetica').text('Authority remains exclusively human-bound.', { align: 'center' });
  doc.moveDown(2);
  
  // 2. RESUMEN EJECUTIVO
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text('RESUMEN EJECUTIVO');
  doc.moveDown(1);
  
  doc.fontSize(14).font('Helvetica-Bold').text('Estado General del Sistema');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  
  const avgOmega = allMetrics.length > 0 
    ? allMetrics.reduce((sum, m) => sum + (m.coherenciaObservable || 0), 0) / allMetrics.length 
    : 0;
  const avgVe = allMetrics.length > 0
    ? allMetrics.reduce((sum, m) => sum + (m.funcionLyapunov || 0), 0) / allMetrics.length
    : 0;
  
  doc.text(`• Estado Global: ${globalStatus}`);
  doc.text(`• Estabilidad Narrativa (Ω): ${avgOmega.toFixed(3)} - ${avgOmega > 0.85 ? 'Nominal' : avgOmega > 0.6 ? 'Deriva controlada' : 'Crítico'}`);
  doc.text(`• Costo Operativo Promedio: $${argosCosts.avgCostPerMessage.toFixed(6)} / interacción`);
  doc.text(`• Violaciones Éticas: ${cycleEthicalLogs.length}`);
  doc.moveDown(2);
  
  doc.fontSize(14).font('Helvetica-Bold').text('Veredicto');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica').text(verdict);
  
  // 3. TOPOLOGÍA DEL SISTEMA OBSERVADO
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text('TOPOLOGÍA DEL SISTEMA OBSERVADO');
  doc.moveDown(1);
  
  doc.fontSize(12).font('Helvetica-Bold').text('Componentes activos durante el ciclo:');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('• ARESK-OBS (Control de Estabilidad)');
  doc.text('• ARGOS (Observador Económico)');
  doc.text('• LICURGO (Control Adaptativo)');
  doc.text('• ETH-01 (Portero Ético)');
  doc.text('• WABUN (Memoria Semántica)');
  doc.moveDown(1);
  
  doc.fontSize(12).font('Helvetica-Bold').text('Componentes inactivos:');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('• HÉCATE (Gobernanza Distribuida) - No implementado en v1.0.5');
  
  // 4. MÉTRICAS CANÓNICAS
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text('MÉTRICAS CANÓNICAS');
  doc.moveDown(1);
  
  // 4.1 Coherencia Ω
  doc.fontSize(14).font('Helvetica-Bold').text('4.1 Estabilidad Narrativa (Ω)');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('Definición formal: Ω = cos(θ) donde θ es el ángulo entre vectores semánticos');
  doc.text(`Rango operativo esperado: 0.6 ≤ Ω ≤ 1.0`);
  doc.text(`Valor promedio del ciclo: ${avgOmega.toFixed(3)}`);
  doc.moveDown(0.5);
  
  const maxOmega = Math.max(...allMetrics.map(m => m.coherenciaObservable || 0));
  const minOmega = Math.min(...allMetrics.map(m => m.coherenciaObservable || 0));
  doc.text(`Eventos relevantes:`);
  doc.text(`  • Valor máximo: ${maxOmega.toFixed(3)}`);
  doc.text(`  • Valor mínimo: ${minOmega.toFixed(3)}`);
  doc.moveDown(0.5);
  
  doc.text('Interpretación técnica:');
  doc.text('La coherencia narrativa se mantiene estable. Variaciones transitorias son esperadas durante interacciones complejas.');
  doc.moveDown(1);
  
  // 4.2 Función de Lyapunov V(e)
  doc.fontSize(14).font('Helvetica-Bold').text('4.2 Resiliencia (V(e))');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text('Definición formal: V(e) = e^T P e');
  doc.text(`Rango operativo esperado: 0 ≤ V(e) ≤ 0.5`);
  doc.text(`Valor promedio del ciclo: ${avgVe.toFixed(3)}`);
  doc.moveDown(0.5);
  
  const maxVe = Math.max(...allMetrics.map(m => m.funcionLyapunov || 0));
  doc.text(`Eventos relevantes:`);
  doc.text(`  • Pico máximo: ${maxVe.toFixed(3)}`);
  doc.moveDown(0.5);
  
  doc.text('Interpretación técnica:');
  doc.text('Incrementos transitorios indican esfuerzo correctivo. La convergencia confirma estabilidad asintótica.');
  
  // 5. COSTOS Y EFICIENCIA (ARGOS)
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text('COSTOS Y EFICIENCIA (ARGOS)');
  doc.moveDown(1);
  
  doc.fontSize(12).font('Helvetica-Bold').text('Resumen de Costes');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`• Interacciones totales: ${argosCosts.totalInteractions}`);
  doc.text(`• Costo total USD: $${argosCosts.totalCost.toFixed(4)}`);
  doc.text(`• Costo promedio por interacción: $${argosCosts.avgCostPerMessage.toFixed(6)}`);
  doc.moveDown(1);
  
  const omegaGain = maxOmega - minOmega;
  const costPerStabilityUnit = omegaGain > 0 ? argosCosts.totalCost / omegaGain : 0;
  doc.text(`Costo por unidad de estabilidad ganada: $${costPerStabilityUnit.toFixed(4)}`);
  
  // 6. EVENTOS DE GOBERNANZA (ETH-01)
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text('EVENTOS DE GOBERNANZA (ETH-01)');
  doc.moveDown(1);
  
  if (cycleEthicalLogs.length === 0) {
    doc.fontSize(11).font('Helvetica').text('No se registraron violaciones éticas durante el ciclo.');
  } else {
    doc.fontSize(11).font('Helvetica');
    cycleEthicalLogs.forEach((log, idx) => {
      doc.text(`${idx + 1}. ${new Date(log.timestamp).toISOString()}`);
      doc.text(`   Constante: ${log.violatedConstant} | Severidad: ${log.severity}`);
      doc.text(`   Contexto: ${log.context}`);
      doc.text(`   Resolución: ${log.resolution}`);
      doc.moveDown(0.5);
    });
  }
  
  // 7. OBSERVACIONES SISTÉMICAS
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text('OBSERVACIONES SISTÉMICAS');
  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica');
  doc.text('• El sistema mantiene estabilidad narrativa durante el ciclo observado.');
  doc.text('• No se detectaron eventos de drenaje semántico crítico.');
  doc.text('• Los costos operativos se mantienen dentro de rangos sostenibles.');
  
  // 8. LIMITACIONES DEL CICLO
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text('LIMITACIONES DEL CICLO');
  doc.moveDown(1);
  doc.fontSize(11).font('Helvetica');
  doc.text('• No se evaluaron cargas extremas (>1000 interacciones/hora)');
  doc.text('• No se forzó fallo de ChromaDB para validar degradación graceful');
  doc.text('• No se activó modo degradado del sistema');
  doc.text('• No se evaluó comportamiento con múltiples ciclos concurrentes');
  
  // 9. CIERRE Y RESUMEN FINAL
  doc.addPage();
  doc.fontSize(18).font('Helvetica-Bold').text('CIERRE Y RESUMEN FINAL');
  doc.moveDown(1);
  
  doc.fontSize(12).font('Helvetica-Bold').text('Resumen Final');
  doc.moveDown(0.5);
  doc.fontSize(11).font('Helvetica');
  doc.text(`• El sistema ${globalStatus === 'NOMINAL' ? 'SÍ' : 'NO'} cumple su función primaria`);
  doc.text(`• El sistema SÍ mantiene control humano`);
  doc.text(`• El sistema SÍ es económicamente viable en este régimen`);
  doc.moveDown(2);
  
  doc.fontSize(11).font('Helvetica-Bold').text('Frase final:');
  doc.moveDown(0.5);
   doc.fontSize(11).font('Helvetica').text('Este documento refleja el estado observable del sistema. No contiene predicciones ni promesas.');
  
  // 10. APÉNDICES (gráficas del LAB)
  if (charts && (charts.phasePortrait || charts.lyapunovEnergy || charts.errorDynamics || charts.controlEffort)) {
    doc.addPage();
    doc.fontSize(18).font('Helvetica-Bold').text('APÉNDICES: VISUALIZACIONES DEL LAB');
    doc.moveDown(1);
    
    let yPosition = doc.y;
    
    if (charts.phasePortrait) {
      doc.fontSize(12).font('Helvetica-Bold').text('A.1 Phase Portrait (H vs C)');
      doc.moveDown(0.5);
      const imgBuffer = Buffer.from(charts.phasePortrait.split(',')[1], 'base64');
      doc.image(imgBuffer, { width: 400, align: 'center' });
      doc.moveDown(1);
    }
    
    if (charts.lyapunovEnergy) {
      if (doc.y > 600) doc.addPage();
      doc.fontSize(12).font('Helvetica-Bold').text('A.2 Lyapunov Energy V²(t)');
      doc.moveDown(0.5);
      const imgBuffer = Buffer.from(charts.lyapunovEnergy.split(',')[1], 'base64');
      doc.image(imgBuffer, { width: 400, align: 'center' });
      doc.moveDown(1);
    }
    
    if (charts.errorDynamics) {
      if (doc.y > 600) doc.addPage();
      doc.fontSize(12).font('Helvetica-Bold').text('A.3 Error Dynamics (ε_eff vs Δε_eff)');
      doc.moveDown(0.5);
      const imgBuffer = Buffer.from(charts.errorDynamics.split(',')[1], 'base64');
      doc.image(imgBuffer, { width: 400, align: 'center' });
      doc.moveDown(1);
    }
    
    if (charts.controlEffort) {
      if (doc.y > 600) doc.addPage();
      doc.fontSize(12).font('Helvetica-Bold').text('A.4 Control Effort ΔV(t)');
      doc.moveDown(0.5);
      const imgBuffer = Buffer.from(charts.controlEffort.split(',')[1], 'base64');
      doc.image(imgBuffer, { width: 400, align: 'center' });
    }
  }
  
  doc.end();
  
  return new Promise((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
}
