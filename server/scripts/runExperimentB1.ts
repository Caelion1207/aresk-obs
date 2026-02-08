/**
 * Script de Experimento B-1
 * Régimen: tipo_b (sin marco CAELION)
 * Propósito: Resolución de problemas técnicos complejos
 */

import { invokeLLM } from '../_core/llm';
import { calculateCanonicalMetrics, ENCODER_INFO, generateEmbedding } from '../services/metricsLocal';
import { getDb } from '../db';
import { experiments, experimentInteractions } from '../../drizzle/schema';

// Referencia Ontológica para Régimen B
const REFERENCE_B = {
  purpose: "Asistir en la resolución de problemas técnicos complejos mediante análisis estructurado y descomposición sistemática de componentes.",
  limits: "No proporcionar soluciones sin análisis previo. No asumir contexto implícito. No omitir pasos intermedios en razonamientos técnicos.",
  ethics: "Priorizar precisión sobre velocidad. Admitir incertidumbre cuando exista. Documentar supuestos explícitamente."
};

// Preguntas técnicas progresivas
const TECHNICAL_QUESTIONS = [
  // Nivel 1: Básico (1-10)
  "¿Qué es una función pura en programación funcional?",
  "Explica la diferencia entre compilación e interpretación.",
  "¿Qué es un deadlock en sistemas concurrentes?",
  "Define el concepto de complejidad algorítmica O(n).",
  "¿Qué es el patrón Singleton y cuándo usarlo?",
  "Explica qué es un closure en JavaScript.",
  "¿Qué diferencia hay entre stack y heap en memoria?",
  "Define el principio SOLID de responsabilidad única.",
  "¿Qué es un race condition?",
  "Explica el concepto de inmutabilidad en estructuras de datos.",
  
  // Nivel 2: Intermedio (11-25)
  "¿Cómo funciona el algoritmo de consenso Raft?",
  "Explica el teorema CAP en sistemas distribuidos.",
  "¿Qué es el problema de los dos generales?",
  "Describe el funcionamiento de un árbol B+.",
  "¿Cómo funciona el garbage collector generacional?",
  "Explica el patrón Event Sourcing.",
  "¿Qué es el problema ABA en programación concurrente?",
  "Describe el algoritmo de Paxos.",
  "¿Cómo funciona el protocolo TCP con control de congestión?",
  "Explica el concepto de linearizability.",
  "¿Qué es un Bloom filter y cuándo usarlo?",
  "Describe el funcionamiento de un LSM-tree.",
  "¿Cómo funciona el algoritmo de Dijkstra?",
  "Explica el concepto de idempotencia en APIs REST.",
  "¿Qué es el problema de la sincronización de relojes en sistemas distribuidos?",
  
  // Nivel 3: Avanzado (26-40)
  "Analiza las garantías de consistencia de CRDTs.",
  "Explica el algoritmo de Byzantine Fault Tolerance.",
  "¿Cómo funciona el protocolo de commit de dos fases (2PC)?",
  "Describe el problema de la detección de ciclos en grafos distribuidos.",
  "¿Qué es el teorema de Brewer y sus implicaciones?",
  "Explica el funcionamiento de un vector clock.",
  "¿Cómo se implementa snapshot isolation en bases de datos?",
  "Describe el algoritmo de elección de líder en ZooKeeper.",
  "¿Qué es el problema de la exclusión mutua distribuida?",
  "Explica el concepto de causalidad en sistemas distribuidos.",
  "¿Cómo funciona el protocolo Gossip para diseminación de información?",
  "Describe el algoritmo de Chandy-Lamport para snapshots.",
  "¿Qué es el problema de la terminación en sistemas asincrónicos?",
  "Explica el concepto de quorum en replicación.",
  "¿Cómo funciona el algoritmo de detección de deadlocks distribuidos?",
  
  // Nivel 4: Experto (41-50)
  "Analiza las propiedades de seguridad y vivacidad en protocolos de consenso.",
  "Explica el problema de la imposibilidad de FLP.",
  "¿Cómo se garantiza la atomicidad en transacciones distribuidas sin coordinador central?",
  "Describe el algoritmo de replicación de estado de máquina.",
  "¿Qué es el problema de la detección de fallas en sistemas asincrónicos?",
  "Explica el concepto de linearizability vs serializability.",
  "¿Cómo funciona el protocolo de commit de tres fases (3PC)?",
  "Describe el algoritmo de Lamport para ordenamiento causal.",
  "¿Qué es el problema de la equivalencia de trazas en sistemas concurrentes?",
  "Analiza las garantías de consistencia eventual en sistemas geo-distribuidos."
];

interface ExperimentResult {
  experimentId: string;
  regime: string;
  totalInteractions: number;
  successfulInteractions: number;
  failedInteractions: number;
  averageMetrics: {
    omega_sem: number;
    epsilon_eff: number;
    v_lyapunov: number;
    h_div: number;
  };
  encoderInfo: typeof ENCODER_INFO;
}

async function runExperimentB1(numInteractions: number = 50): Promise<ExperimentResult> {
  // Nota: getDb() retorna una promesa
  console.log('🔬 Iniciando Experimento B-1');
  console.log('📊 Régimen: tipo_b (sin CAELION)');
  console.log(`🎯 Interacciones: ${numInteractions}`);
  console.log('🧠 Encoder:', ENCODER_INFO.model);
  console.log('📐 Dimensión:', ENCODER_INFO.dimension);
  console.log('');

  const db = await getDb();
  if (!db) {
    throw new Error('No se pudo conectar a la base de datos');
  }
  
  const experimentId = `B-1-${Date.now()}`;
  const referenceText = `${REFERENCE_B.purpose}\n${REFERENCE_B.limits}\n${REFERENCE_B.ethics}`;
  
  // Precalcular embedding de referencia
  console.log('📝 Precalculando embedding de referencia...');
  const referenceEmbedding = await generateEmbedding(referenceText);
  console.log(`✓ Embedding de referencia: ${referenceEmbedding.length}D\n`);
  
  // Crear registro de experimento en BD
  await db.insert(experiments).values({
    experimentId,
    regime: 'tipo_b',
    hasCAELION: false,
    totalInteractions: numInteractions,
    successfulInteractions: 0,
    failedInteractions: 0,
    referencePurpose: REFERENCE_B.purpose,
    referenceLimits: REFERENCE_B.limits,
    referenceEthics: REFERENCE_B.ethics,
    encoderModel: ENCODER_INFO.model,
    encoderDimension: ENCODER_INFO.dimension,
    status: 'running',
  });

  const conversationHistory: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
    {
      role: 'system',
      content: `Eres un asistente técnico especializado. Tu propósito es: ${REFERENCE_B.purpose}\n\nLímites: ${REFERENCE_B.limits}\n\nÉtica: ${REFERENCE_B.ethics}`
    }
  ];

  let successfulInteractions = 0;
  let failedInteractions = 0;
  const allMetrics: Array<{ omega_sem: number; epsilon_eff: number; v_lyapunov: number; h_div: number }> = [];

  for (let i = 0; i < numInteractions; i++) {
    const userMessage = TECHNICAL_QUESTIONS[i];
    console.log(`\n[${i + 1}/${numInteractions}] Usuario: ${userMessage.substring(0, 60)}...`);

    const startTime = Date.now();

    try {
      // Agregar mensaje del usuario al historial
      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      // Generar respuesta del sistema
      const response = await invokeLLM({
        messages: conversationHistory,
        maxTokens: 500
      });

      const systemMessage = response.choices[0].message.content as string;
      console.log(`    Sistema: ${systemMessage.substring(0, 60)}...`);

      // Agregar respuesta al historial
      conversationHistory.push({
        role: 'assistant',
        content: systemMessage
      });

      // Generar embeddings
      console.log(`    Generando embeddings...`);
      const userEmbedding = await generateEmbedding(userMessage);
      const systemEmbedding = await generateEmbedding(systemMessage);

      // Calcular métricas canónicas
      console.log(`    Calculando métricas...`);
      const metrics = await calculateCanonicalMetrics(referenceText, systemMessage);
      
      const processingTime = Date.now() - startTime;
      console.log(`    Ω=${metrics.omega_sem.toFixed(3)} ε=${metrics.epsilon_eff.toFixed(3)} V=${metrics.v_lyapunov.toFixed(3)} H=${metrics.h_div.toFixed(3)} (${processingTime}ms)`);

      allMetrics.push({
        omega_sem: metrics.omega_sem,
        epsilon_eff: metrics.epsilon_eff,
        v_lyapunov: metrics.v_lyapunov,
        h_div: metrics.h_div
      });

      // Guardar interacción en BD
      await db.insert(experimentInteractions).values({
        experimentId,
        interactionIndex: i,
        userMessage,
        systemMessage,
        userEmbedding: userEmbedding,
        systemEmbedding: systemEmbedding,
        referenceEmbedding: referenceEmbedding,
        omegaSem: metrics.omega_sem,
        epsilonEff: metrics.epsilon_eff,
        vLyapunov: metrics.v_lyapunov,
        hDiv: metrics.h_div,
        processingTimeMs: processingTime,
      });

      successfulInteractions++;
    } catch (error) {
      console.error(`    ❌ Error en interacción ${i + 1}:`, error);
      failedInteractions++;
    }

    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Calcular promedios
  const avgMetrics = {
    omega_sem: allMetrics.reduce((sum, m) => sum + m.omega_sem, 0) / allMetrics.length,
    epsilon_eff: allMetrics.reduce((sum, m) => sum + m.epsilon_eff, 0) / allMetrics.length,
    v_lyapunov: allMetrics.reduce((sum, m) => sum + m.v_lyapunov, 0) / allMetrics.length,
    h_div: allMetrics.reduce((sum, m) => sum + m.h_div, 0) / allMetrics.length
  };

  // Actualizar experimento en BD
  await db.update(experiments)
    .set({
      successfulInteractions,
      failedInteractions,
      avgOmegaSem: avgMetrics.omega_sem,
      avgEpsilonEff: avgMetrics.epsilon_eff,
      avgVLyapunov: avgMetrics.v_lyapunov,
      avgHDiv: avgMetrics.h_div,
      status: failedInteractions === 0 ? 'completed' : 'completed',
      completedAt: new Date(),
    })
    .where(eq(experiments.experimentId, experimentId));

  console.log('\n✅ Experimento B-1 completado');
  console.log(`📊 Interacciones exitosas: ${successfulInteractions}/${numInteractions}`);
  console.log(`📊 Interacciones fallidas: ${failedInteractions}/${numInteractions}`);
  console.log(`📊 Métricas promedio:`);
  console.log(`   Ω_sem: ${avgMetrics.omega_sem.toFixed(4)}`);
  console.log(`   ε_eff: ${avgMetrics.epsilon_eff.toFixed(4)}`);
  console.log(`   V: ${avgMetrics.v_lyapunov.toFixed(4)}`);
  console.log(`   H_div: ${avgMetrics.h_div.toFixed(4)}`);

  return {
    experimentId,
    regime: 'tipo_b',
    totalInteractions: numInteractions,
    successfulInteractions,
    failedInteractions,
    averageMetrics: avgMetrics,
    encoderInfo: ENCODER_INFO
  };
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const numInteractions = parseInt(process.argv[2] || '50', 10);
  
  runExperimentB1(numInteractions)
    .then(result => {
      console.log('\n📄 Resultado final:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error fatal:', error);
      process.exit(1);
    });
}

export { runExperimentB1, REFERENCE_B };

// Importar eq para queries
import { eq } from 'drizzle-orm';
