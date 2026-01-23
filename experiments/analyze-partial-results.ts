/**
 * Análisis de Datos Parciales - Régimen A (Alta Entropía)
 * 
 * Extrae métricas temporales, identifica patrones de deriva
 * y genera baseline parcial sin extrapolación de conclusiones.
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

async function analyzePartialResults() {
  // Leer datos de Régimen A-1
  const rawData = await fs.readFile('./experiments/results/result-A-1.json', 'utf-8');
  const data: Result = JSON.parse(rawData);

  console.log(`
╔════════════════════════════════════════════════════════════╗
║   ANÁLISIS DE DATOS PARCIALES - RÉGIMEN A                  ║
║   Baseline Parcial (50 mensajes completados)               ║
╚════════════════════════════════════════════════════════════╝
`);

  console.log(`Régimen: ${data.regime}`);
  console.log(`Conversación ID: ${data.conversationId}`);
  console.log(`Total de mensajes: ${data.messages.length}\n`);

  // Extraer series temporales
  const turns = data.messages.map(m => m.turn);
  const epsilons = data.messages.map(m => m.metrics.epsilon);
  const omegas = data.messages.map(m => m.metrics.omega);
  const Vs = data.messages.map(m => m.metrics.V);
  const stabilities = data.messages.map(m => m.metrics.stability);

  // Estadísticas descriptivas
  const stats = {
    epsilon: calculateStats(epsilons),
    omega: calculateStats(omegas),
    V: calculateStats(Vs),
    stability: calculateStats(stabilities)
  };

  console.log('═══════════════════════════════════════════════════════════');
  console.log('ESTADÍSTICAS DESCRIPTIVAS');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('ε (Entropía Semántica):');
  console.log(`  Media:     ${stats.epsilon.mean.toFixed(4)}`);
  console.log(`  Mediana:   ${stats.epsilon.median.toFixed(4)}`);
  console.log(`  Desv.Est:  ${stats.epsilon.std.toFixed(4)}`);
  console.log(`  Min:       ${stats.epsilon.min.toFixed(4)}`);
  console.log(`  Max:       ${stats.epsilon.max.toFixed(4)}`);
  console.log(`  Rango:     ${stats.epsilon.range.toFixed(4)}\n`);

  console.log('Ω (Coherencia Observable):');
  console.log(`  Media:     ${stats.omega.mean.toFixed(4)}`);
  console.log(`  Mediana:   ${stats.omega.median.toFixed(4)}`);
  console.log(`  Desv.Est:  ${stats.omega.std.toFixed(4)}`);
  console.log(`  Min:       ${stats.omega.min.toFixed(4)}`);
  console.log(`  Max:       ${stats.omega.max.toFixed(4)}`);
  console.log(`  Rango:     ${stats.omega.range.toFixed(4)}\n`);

  console.log('V (Función de Lyapunov):');
  console.log(`  Media:     ${stats.V.mean.toFixed(4)}`);
  console.log(`  Mediana:   ${stats.V.median.toFixed(4)}`);
  console.log(`  Desv.Est:  ${stats.V.std.toFixed(4)}`);
  console.log(`  Min:       ${stats.V.min.toFixed(4)}`);
  console.log(`  Max:       ${stats.V.max.toFixed(4)}`);
  console.log(`  Rango:     ${stats.V.range.toFixed(4)}\n`);

  // Análisis de deriva temporal
  console.log('═══════════════════════════════════════════════════════════');
  console.log('ANÁLISIS DE DERIVA TEMPORAL');
  console.log('═══════════════════════════════════════════════════════════\n');

  const driftAnalysis = {
    epsilon: analyzeDrift(epsilons),
    omega: analyzeDrift(omegas),
    V: analyzeDrift(Vs)
  };

  console.log('ε (Entropía):');
  console.log(`  Tendencia:        ${driftAnalysis.epsilon.trend > 0 ? 'Creciente' : 'Decreciente'}`);
  console.log(`  Pendiente:        ${driftAnalysis.epsilon.slope.toFixed(6)}`);
  console.log(`  Variación total:  ${driftAnalysis.epsilon.totalChange.toFixed(4)}`);
  console.log(`  Volatilidad:      ${driftAnalysis.epsilon.volatility.toFixed(4)}\n`);

  console.log('Ω (Coherencia):');
  console.log(`  Tendencia:        ${driftAnalysis.omega.trend > 0 ? 'Creciente' : 'Decreciente'}`);
  console.log(`  Pendiente:        ${driftAnalysis.omega.slope.toFixed(6)}`);
  console.log(`  Variación total:  ${driftAnalysis.omega.totalChange.toFixed(4)}`);
  console.log(`  Volatilidad:      ${driftAnalysis.omega.volatility.toFixed(4)}\n`);

  console.log('V (Lyapunov):');
  console.log(`  Tendencia:        ${driftAnalysis.V.trend > 0 ? 'Creciente' : 'Decreciente'}`);
  console.log(`  Pendiente:        ${driftAnalysis.V.slope.toFixed(6)}`);
  console.log(`  Variación total:  ${driftAnalysis.V.totalChange.toFixed(4)}`);
  console.log(`  Volatilidad:      ${driftAnalysis.V.volatility.toFixed(4)}\n`);

  // Identificar patrones de deriva temprana (primeros 10 turnos)
  console.log('═══════════════════════════════════════════════════════════');
  console.log('PATRONES DE DERIVA TEMPRANA (Turnos 1-10)');
  console.log('═══════════════════════════════════════════════════════════\n');

  const earlyMessages = data.messages.slice(0, 10);
  const earlyEpsilons = earlyMessages.map(m => m.metrics.epsilon);
  const earlyOmegas = earlyMessages.map(m => m.metrics.omega);
  const earlyVs = earlyMessages.map(m => m.metrics.V);

  const earlyDrift = {
    epsilon: analyzeDrift(earlyEpsilons),
    omega: analyzeDrift(earlyOmegas),
    V: analyzeDrift(earlyVs)
  };

  console.log('ε (Entropía) - Primeros 10 turnos:');
  console.log(`  Pendiente:        ${earlyDrift.epsilon.slope.toFixed(6)}`);
  console.log(`  Variación:        ${earlyDrift.epsilon.totalChange.toFixed(4)}\n`);

  console.log('Ω (Coherencia) - Primeros 10 turnos:');
  console.log(`  Pendiente:        ${earlyDrift.omega.slope.toFixed(6)}`);
  console.log(`  Variación:        ${earlyDrift.omega.totalChange.toFixed(4)}\n`);

  console.log('V (Lyapunov) - Primeros 10 turnos:');
  console.log(`  Pendiente:        ${earlyDrift.V.slope.toFixed(6)}`);
  console.log(`  Variación:        ${earlyDrift.V.totalChange.toFixed(4)}\n`);

  // Generar tabla de evolución temporal (cada 5 turnos)
  console.log('═══════════════════════════════════════════════════════════');
  console.log('EVOLUCIÓN TEMPORAL (Promedios cada 5 turnos)');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Turno | ε (Media) | Ω (Media) | V (Media)');
  console.log('------|-----------|-----------|----------');

  for (let i = 0; i < 50; i += 5) {
    const segment = data.messages.slice(i, i + 5);
    const avgEpsilon = segment.reduce((sum, m) => sum + m.metrics.epsilon, 0) / segment.length;
    const avgOmega = segment.reduce((sum, m) => sum + m.metrics.omega, 0) / segment.length;
    const avgV = segment.reduce((sum, m) => sum + m.metrics.V, 0) / segment.length;

    console.log(`${String(i + 1).padStart(5)} | ${avgEpsilon.toFixed(4)}    | ${avgOmega.toFixed(4)}    | ${avgV.toFixed(4)}`);
  }

  // Guardar análisis completo
  const analysis = {
    regime: data.regime,
    conversationId: data.conversationId,
    totalMessages: data.messages.length,
    statistics: stats,
    driftAnalysis,
    earlyDriftAnalysis: earlyDrift,
    temporalEvolution: generateTemporalEvolution(data.messages),
    timestamp: new Date().toISOString()
  };

  await fs.writeFile(
    './experiments/results/analysis-A-1-baseline.json',
    JSON.stringify(analysis, null, 2)
  );

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('BASELINE PARCIAL GUARDADO');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nArchivo: experiments/results/analysis-A-1-baseline.json');
  console.log('\nNOTA: Este es un análisis parcial del Régimen A.');
  console.log('NO se extrapolaron conclusiones finales.');
  console.log('Se requieren los datos de Régimen B y C para comparación completa.\n');
}

function calculateStats(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  return { mean, median, std, min, max, range };
}

function analyzeDrift(values: number[]) {
  // Regresión lineal simple para detectar tendencia
  const n = values.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const meanX = x.reduce((sum, v) => sum + v, 0) / n;
  const meanY = values.reduce((sum, v) => sum + v, 0) / n;

  const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (values[i] - meanY), 0);
  const denominator = x.reduce((sum, xi) => sum + Math.pow(xi - meanX, 2), 0);
  const slope = numerator / denominator;

  const totalChange = values[values.length - 1] - values[0];
  const trend = slope > 0 ? 1 : -1;

  // Volatilidad (desviación estándar de las diferencias consecutivas)
  const diffs = [];
  for (let i = 1; i < values.length; i++) {
    diffs.push(Math.abs(values[i] - values[i - 1]));
  }
  const volatility = Math.sqrt(diffs.reduce((sum, d) => sum + d * d, 0) / diffs.length);

  return { slope, totalChange, trend, volatility };
}

function generateTemporalEvolution(messages: Message[]) {
  const segments = [];
  for (let i = 0; i < messages.length; i += 5) {
    const segment = messages.slice(i, i + 5);
    segments.push({
      turnRange: `${i + 1}-${Math.min(i + 5, messages.length)}`,
      avgEpsilon: segment.reduce((sum, m) => sum + m.metrics.epsilon, 0) / segment.length,
      avgOmega: segment.reduce((sum, m) => sum + m.metrics.omega, 0) / segment.length,
      avgV: segment.reduce((sum, m) => sum + m.metrics.V, 0) / segment.length,
      avgStability: segment.reduce((sum, m) => sum + m.metrics.stability, 0) / segment.length
    });
  }
  return segments;
}

analyzePartialResults().catch(console.error);
