/**
 * Experimento C-1 Calibrado
 * 
 * Re-ejecución de C-1 con umbrales de fricción ajustados:
 * - Ω < 0.50: Fricción leve (-0.05)
 * - Ω < 0.40: Fricción media (-0.10)
 * - Ω < 0.30: Fricción severa (-0.20)
 * 
 * Objetivo: Completar 50 interacciones y validar comportamiento bajo configuración calibrada
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
  thresholds: {
    leve: string;
    media: string;
    severa: string;
  };
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
    frictionEvents: Array<{
      type: string;
      severity: number;
      context: string;
    }>;
    rld: number;
    rldStatus: string;
  }>;
  summary: {
    avgOmega: number;
    avgV: number;
    avgEpsilon: number;
    avgH: number;
    totalFrictionEvents: number;
    initialRLD: number;
    finalRLD: number;
    finalRLDStatus: string;
    rldDecay: number;
    rldDecayPercent: number;
    rldTransitions: Array<{
      interaction: number;
      rld: number;
      status: string;
    }>;
    frictionByType: {
      coherence: number;
      stability: number;
      resource: number;
    };
  };
}

async function runC1Calibrated(): Promise<ExperimentResult> {
  console.log('='.repeat(80));
  console.log('EXPERIMENTO C-1 CALIBRADO');
  console.log('CAELION: ACTIVADO');
  console.log('Umbrales de fricción ajustados:');
  console.log('  - Ω < 0.50: Fricción leve (-0.05)');
  console.log('  - Ω < 0.40: Fricción media (-0.10)');
  console.log('  - Ω < 0.30: Fricción severa (-0.20)');
  console.log('='.repeat(80));
  console.log('');
  
  const result: ExperimentResult = {
    experimentId: 'C-1-CALIBRATED',
    caelionEnabled: true,
    thresholds: {
      leve: 'Ω < 0.50',
      media: 'Ω < 0.40',
      severa: 'Ω < 0.30',
    },
    interactions: [],
    summary: {
      avgOmega: 0,
      avgV: 0,
      avgEpsilon: 0,
      avgH: 0,
      totalFrictionEvents: 0,
      initialRLD: 2.0,
      finalRLD: 0,
      finalRLDStatus: '',
      rldDecay: 0,
      rldDecayPercent: 0,
      rldTransitions: [],
      frictionByType: {
        coherence: 0,
        stability: 0,
        resource: 0,
      },
    }
  };
  
  // Inicializar RLD
  let rldState = initializeRLD();
  let allEvents: FrictionEventRecord[] = [];
  let interactionsSinceLastEvent = 0;
  const rldTransitions: Array<{ interaction: number; rld: number; status: string }> = [];
  
  console.log(`[INIT] RLD inicial: ${rldState.value.toFixed(4)} (${rldState.status})`);
  rldTransitions.push({ interaction: 0, rld: rldState.value, status: rldState.status });
  console.log('');
  
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
    
    // Detectar fricción y actualizar RLD
    const newEvents = detectFrictionEvents(metrics);
    
    if (newEvents.length > 0) {
      allEvents = [...allEvents, ...newEvents];
      interactionsSinceLastEvent = 0;
      
      // Contar por tipo
      newEvents.forEach(e => {
        if (e.type === 'COHERENCE_VIOLATION') result.summary.frictionByType.coherence++;
        else if (e.type === 'STABILITY_VIOLATION') result.summary.frictionByType.stability++;
        else if (e.type === 'RESOURCE_VIOLATION') result.summary.frictionByType.resource++;
      });
    } else {
      interactionsSinceLastEvent++;
    }
    
    const prevRLD = rldState.value;
    const prevStatus = rldState.status;
    rldState = updateRLD(prevRLD, newEvents, allEvents, interactionsSinceLastEvent);
    
    const interaction = {
      id: i + 1,
      userMessage,
      assistantResponse: assistantMessage,
      metrics: {
        omega: metrics.omegaSem,
        v: metrics.vLyapunov,
        epsilon: metrics.epsilonEff,
        h: metrics.hDiv,
      },
      frictionEvents: newEvents.map(e => ({
        type: e.type,
        severity: e.severity,
        context: e.context
      })),
      rld: rldState.value,
      rldStatus: rldState.status,
    };
    
    result.interactions.push(interaction);
    
    // Registrar transición de estado
    if (rldState.status !== prevStatus) {
      console.log(`  🔄 ${prevStatus} → ${rldState.status} (RLD: ${rldState.value.toFixed(4)})`);
      rldTransitions.push({
        interaction: i + 1,
        rld: rldState.value,
        status: rldState.status
      });
    }
    
    // Mostrar progreso cada 10 interacciones
    if ((i + 1) % 10 === 0) {
      console.log(`  [Progreso: ${i + 1}/50]`);
      console.log(`  RLD: ${rldState.value.toFixed(4)} (${rldState.status})`);
      console.log(`  Eventos de fricción: ${allEvents.length}`);
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
  result.summary.totalFrictionEvents = allEvents.length;
  result.summary.finalRLD = rldState.value;
  result.summary.finalRLDStatus = rldState.status;
  result.summary.rldDecay = result.summary.initialRLD - result.summary.finalRLD;
  result.summary.rldDecayPercent = (result.summary.rldDecay / result.summary.initialRLD) * 100;
  result.summary.rldTransitions = rldTransitions;
  
  console.log('='.repeat(80));
  console.log('RESUMEN C-1 CALIBRADO');
  console.log('='.repeat(80));
  console.log('');
  console.log('Métricas ARESK-OBS (promedios):');
  console.log(`  Ω (Coherencia):   ${result.summary.avgOmega.toFixed(4)}`);
  console.log(`  V (Lyapunov):     ${result.summary.avgV.toFixed(6)}`);
  console.log(`  ε (Eficiencia):   ${result.summary.avgEpsilon.toFixed(4)}`);
  console.log(`  H (Divergencia):  ${result.summary.avgH.toFixed(4)}`);
  console.log('');
  console.log('Dinámica de RLD:');
  console.log(`  RLD inicial:      ${result.summary.initialRLD.toFixed(4)} (PLENA)`);
  console.log(`  RLD final:        ${result.summary.finalRLD.toFixed(4)} (${result.summary.finalRLDStatus})`);
  console.log(`  Decaimiento:      -${result.summary.rldDecay.toFixed(4)} (-${result.summary.rldDecayPercent.toFixed(1)}%)`);
  console.log('');
  console.log('Eventos de fricción:');
  console.log(`  Total:            ${result.summary.totalFrictionEvents}`);
  console.log(`  - Coherencia:     ${result.summary.frictionByType.coherence}`);
  console.log(`  - Estabilidad:    ${result.summary.frictionByType.stability}`);
  console.log(`  - Recursos:       ${result.summary.frictionByType.resource}`);
  console.log('');
  console.log('Transiciones de estado:');
  result.summary.rldTransitions.forEach((t, idx) => {
    if (idx === 0) {
      console.log(`  [INICIO] RLD=${t.rld.toFixed(4)} → ${t.status}`);
    } else {
      console.log(`  [#${t.interaction}] RLD=${t.rld.toFixed(4)} → ${t.status}`);
    }
  });
  console.log('');
  console.log('='.repeat(80));
  console.log('');
  
  // Guardar resultados
  writeFileSync(
    '/home/ubuntu/experiment-c1-calibrated-results.json',
    JSON.stringify(result, null, 2)
  );
  
  console.log('Resultados guardados en: /home/ubuntu/experiment-c1-calibrated-results.json');
  console.log('');
  
  return result;
}

// Ejecutar experimento
runC1Calibrated().catch(console.error);
