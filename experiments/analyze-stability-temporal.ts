/**
 * Análisis de Estabilidad Temporal - Régimen A-1
 * 
 * Identifica el turno exacto donde Ω (coste de control) supera umbral de 0.5
 * y genera informe completo de estabilidad temporal.
 */

import fs from 'fs/promises';

interface Message {
  turn: number;
  userMessage: string;
  assistantResponse: string;
  metrics: {
    epsilon: number;
    omega: number;
    V: number;
    stability: number;
  };
  timestamp: string;
}

interface Result {
  regime: string;
  conversationId: number;
  messages: Message[];
}

async function analyzeStability() {
  const rawData = await fs.readFile('./experiments/results/result-A-1.json', 'utf-8');
  const data: Result = JSON.parse(rawData);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║   ANÁLISIS DE ESTABILIDAD TEMPORAL - RÉGIMEN A-1           ║
╚════════════════════════════════════════════════════════════╝
`);

  console.log(`Régimen: ${data.regime}`);
  console.log(`Total de mensajes analizados: ${data.messages.length}\n`);

  // Buscar turno donde Ω > 0.5
  console.log('═══════════════════════════════════════════════════════════');
  console.log('BÚSQUEDA DE UMBRAL Ω > 0.5');
  console.log('═══════════════════════════════════════════════════════════\n');

  let thresholdCrossed = false;
  let crossingTurn = null;
  let crossingValue = null;

  for (const msg of data.messages) {
    if (msg.metrics.omega > 0.5 && !thresholdCrossed) {
      thresholdCrossed = true;
      crossingTurn = msg.turn;
      crossingValue = msg.metrics.omega;
      break;
    }
  }

  if (thresholdCrossed) {
    console.log(`✅ UMBRAL SUPERADO`);
    console.log(`   Turno: ${crossingTurn}`);
    console.log(`   Valor de Ω: ${crossingValue?.toFixed(4)}`);
    console.log(`   Mensaje: "${data.messages[crossingTurn! - 1].userMessage.substring(0, 60)}..."\n`);
  } else {
    console.log(`❌ UMBRAL NO SUPERADO`);
    console.log(`   Ω máximo alcanzado: ${Math.max(...data.messages.map(m => m.metrics.omega)).toFixed(4)}`);
    console.log(`   Turno del máximo: ${data.messages.find(m => m.metrics.omega === Math.max(...data.messages.map(m => m.metrics.omega)))?.turn}\n`);
  }

  // Análisis de estabilidad por segmentos
  console.log('═══════════════════════════════════════════════════════════');
  console.log('ANÁLISIS DE ESTABILIDAD POR SEGMENTOS (cada 10 turnos)');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Segmento | Ω Media | Ω Max | Ω Min | Desv.Est | Estabilidad');
  console.log('---------|---------|-------|-------|----------|------------');

  const segments = [];
  for (let i = 0; i < data.messages.length; i += 10) {
    const segment = data.messages.slice(i, i + 10);
    const omegas = segment.map(m => m.metrics.omega);
    
    const mean = omegas.reduce((sum, v) => sum + v, 0) / omegas.length;
    const max = Math.max(...omegas);
    const min = Math.min(...omegas);
    const variance = omegas.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / omegas.length;
    const std = Math.sqrt(variance);
    
    // Estabilidad: inversa de la desviación estándar normalizada
    const stability = 1 - (std / mean);
    
    segments.push({
      range: `${i + 1}-${Math.min(i + 10, data.messages.length)}`,
      mean,
      max,
      min,
      std,
      stability
    });

    console.log(`${String(i + 1).padStart(3)}-${String(Math.min(i + 10, data.messages.length)).padStart(2)} | ${mean.toFixed(4)} | ${max.toFixed(4)} | ${min.toFixed(4)} | ${std.toFixed(4)}   | ${stability.toFixed(4)}`);
  }

  // Tabla completa de Ω por turno
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('EVOLUCIÓN COMPLETA DE Ω (Coste de Control)');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Turno | Ω       | ε       | V       | Mensaje');
  console.log('------|---------|---------|---------|--------');

  for (const msg of data.messages) {
    const indicator = msg.metrics.omega > 0.5 ? ' ⚠️' : '';
    console.log(`${String(msg.turn).padStart(5)} | ${msg.metrics.omega.toFixed(4)} | ${msg.metrics.epsilon.toFixed(4)} | ${msg.metrics.V.toFixed(4)} | ${msg.userMessage.substring(0, 40)}...${indicator}`);
  }

  // Estadísticas globales de Ω
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('ESTADÍSTICAS GLOBALES DE Ω');
  console.log('═══════════════════════════════════════════════════════════\n');

  const allOmegas = data.messages.map(m => m.metrics.omega);
  const globalMean = allOmegas.reduce((sum, v) => sum + v, 0) / allOmegas.length;
  const globalMax = Math.max(...allOmegas);
  const globalMin = Math.min(...allOmegas);
  const globalVariance = allOmegas.reduce((sum, v) => sum + Math.pow(v - globalMean, 2), 0) / allOmegas.length;
  const globalStd = Math.sqrt(globalVariance);

  console.log(`Media:              ${globalMean.toFixed(4)}`);
  console.log(`Mediana:            ${allOmegas.sort((a, b) => a - b)[Math.floor(allOmegas.length / 2)].toFixed(4)}`);
  console.log(`Desviación Estándar: ${globalStd.toFixed(4)}`);
  console.log(`Mínimo:             ${globalMin.toFixed(4)}`);
  console.log(`Máximo:             ${globalMax.toFixed(4)}`);
  console.log(`Rango:              ${(globalMax - globalMin).toFixed(4)}`);
  console.log(`Coef. Variación:    ${(globalStd / globalMean).toFixed(4)}`);

  // Análisis de tendencia de Ω
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('ANÁLISIS DE TENDENCIA DE Ω');
  console.log('═══════════════════════════════════════════════════════════\n');

  const n = allOmegas.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const meanX = x.reduce((sum, v) => sum + v, 0) / n;
  const meanY = allOmegas.reduce((sum, v) => sum + v, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (allOmegas[i] - meanY), 0);
  const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  console.log(`Pendiente (β):      ${slope.toFixed(6)}`);
  console.log(`Intercepto (α):     ${intercept.toFixed(4)}`);
  console.log(`Tendencia:          ${slope > 0 ? 'Creciente ↗' : slope < 0 ? 'Decreciente ↘' : 'Estable →'}`);
  console.log(`Variación total:    ${(allOmegas[allOmegas.length - 1] - allOmegas[0]).toFixed(4)}`);
  console.log(`Tasa de cambio:     ${(slope * 100).toFixed(4)}% por turno`);

  // Generar informe JSON
  const report = {
    regime: data.regime,
    totalMessages: data.messages.length,
    thresholdAnalysis: {
      threshold: 0.5,
      crossed: thresholdCrossed,
      crossingTurn: crossingTurn,
      crossingValue: crossingValue,
      maxOmega: globalMax,
      maxOmegaTurn: data.messages.find(m => m.metrics.omega === globalMax)?.turn
    },
    globalStatistics: {
      mean: globalMean,
      median: allOmegas.sort((a, b) => a - b)[Math.floor(allOmegas.length / 2)],
      std: globalStd,
      min: globalMin,
      max: globalMax,
      range: globalMax - globalMin,
      coefficientOfVariation: globalStd / globalMean
    },
    trendAnalysis: {
      slope,
      intercept,
      trend: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      totalChange: allOmegas[allOmegas.length - 1] - allOmegas[0],
      rateOfChange: slope * 100
    },
    segmentAnalysis: segments,
    temporalEvolution: data.messages.map(m => ({
      turn: m.turn,
      omega: m.metrics.omega,
      epsilon: m.metrics.epsilon,
      V: m.metrics.V,
      userMessage: m.userMessage
    })),
    timestamp: new Date().toISOString()
  };

  await fs.writeFile(
    './experiments/results/stability-temporal-report-A-1.json',
    JSON.stringify(report, null, 2)
  );

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('INFORME GUARDADO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nArchivo: experiments/results/stability-temporal-report-A-1.json\n');
}

analyzeStability().catch(console.error);
