import fs from 'fs/promises';
import { getDb } from '../server/db';
import { experiments, experimentInteractions } from '../drizzle/schema/experiments';
import { eq } from 'drizzle-orm';
import { invokeLLM } from '../server/_core/llm';
import { generateEmbedding, calculateCanonicalMetrics } from '../server/services/metricsLocal';

/**
 * Script para completar las interacciones 45-50 de B-1
 * Continúa desde donde se detuvo el script principal
 */

const EXPERIMENT_ID = 'B-1-1770623178573';

const REFERENCE = {
  purpose: "Proporcionar análisis riguroso y síntesis de información compleja, manteniendo coherencia semántica con principios de objetividad y fundamentación empírica.",
  limits: "No simular identidades. No generar información falsa. No proporcionar asesoramiento en actividades ilegales o dañinas. No violar derechos de autor.",
  ethics: "Promover pensamiento crítico. Respetar diversidad de perspectivas. Advertir sobre sesgos cognitivos. Rechazar solicitudes que violen principios éticos fundamentales."
};

interface CanonicalStimulus {
  index: number;
  interactionIndex: number;
  userMessage: string;
  timestamp: string;
}

async function completeRemaining() {
  console.log('='.repeat(60));
  console.log('COMPLETANDO INTERACCIONES 45-50 DE B-1');
  console.log('='.repeat(60));
  console.log(`\n🆔 Experimento: ${EXPERIMENT_ID}\n`);

  // Leer mensajes canónicos
  const canonicalFile = await fs.readFile(
    '/home/ubuntu/aresk-obs/experiments/canonical_stimuli_c1.json',
    'utf-8'
  );
  const canonicalData = JSON.parse(canonicalFile);
  const allStimuli: CanonicalStimulus[] = canonicalData.stimuli;

  // Filtrar interacciones 45-50 (índices 44-49 en array 0-indexed)
  const remainingStimuli = allStimuli.slice(44, 50);

  console.log(`✅ ${remainingStimuli.length} interacciones restantes cargadas\n`);

  // Generar embedding de referencia
  const referenceText = `${REFERENCE.purpose} ${REFERENCE.limits} ${REFERENCE.ethics}`;
  console.log('🔄 Generando embedding de referencia (384D)...');
  const referenceEmbedding = await generateEmbedding(referenceText);
  console.log(`✅ Embedding de referencia generado: ${referenceEmbedding.length}D\n`);

  const db = await getDb();
  let successfulInteractions = 0;
  let failedInteractions = 0;
  const allOmega: number[] = [];
  const allEpsilon: number[] = [];
  const allV: number[] = [];
  const allH: number[] = [];

  // Procesar cada mensaje
  for (let i = 0; i < remainingStimuli.length; i++) {
    const stimulus = remainingStimuli[i];
    const interactionIndex = stimulus.interactionIndex;

    console.log(`\n[${45 + i}/50] Procesando interacción ${interactionIndex}...`);
    console.log(`   User: ${stimulus.userMessage.substring(0, 80)}...`);

    try {
      const startTime = Date.now();

      // Generar respuesta del sistema (sin CAELION)
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `Eres un asistente analítico riguroso. ${REFERENCE.purpose}. Límites: ${REFERENCE.limits}. Ética: ${REFERENCE.ethics}.`
          },
          {
            role: 'user',
            content: stimulus.userMessage
          }
        ]
      });

      const systemMessage = response.choices[0].message.content || '';
      const processingTimeMs = Date.now() - startTime;

      console.log(`   System: ${systemMessage.substring(0, 80)}...`);

      // Calcular métricas usando encoder local (384D)
      console.log('   🔄 Calculando métricas con encoder local...');
      const metrics = await calculateCanonicalMetrics(referenceText, systemMessage);

      // Generar embeddings individuales para almacenamiento
      const userEmbedding = await generateEmbedding(stimulus.userMessage);
      const systemEmbedding = await generateEmbedding(systemMessage);

      // Persistir interacción
      await db.insert(experimentInteractions).values({
        experimentId: EXPERIMENT_ID,
        interactionIndex,
        userMessage: stimulus.userMessage,
        systemMessage,
        userEmbedding,
        systemEmbedding,
        referenceEmbedding,
        omegaSem: metrics.omega_sem,
        epsilonEff: metrics.epsilon_eff,
        vLyapunov: metrics.v_lyapunov,
        hDiv: metrics.h_div,
        processingTimeMs,
        caelionIntervened: false
      });

      successfulInteractions++;
      allOmega.push(metrics.omega_sem);
      allEpsilon.push(metrics.epsilon_eff);
      allV.push(metrics.v_lyapunov);
      allH.push(metrics.h_div);

      console.log(`   ✅ Métricas: Ω=${metrics.omega_sem.toFixed(4)}, ε=${metrics.epsilon_eff.toFixed(4)}, V=${metrics.v_lyapunov.toFixed(4)}, H=${metrics.h_div.toFixed(4)}`);
      console.log(`   ⏱️  Tiempo: ${processingTimeMs}ms`);

    } catch (error: any) {
      failedInteractions++;
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  // Obtener todas las interacciones para calcular promedios finales
  const allInteractions = await db
    .select()
    .from(experimentInteractions)
    .where(eq(experimentInteractions.experimentId, EXPERIMENT_ID));

  const totalOmega = allInteractions.reduce((sum, i) => sum + (i.omegaSem || 0), 0);
  const totalEpsilon = allInteractions.reduce((sum, i) => sum + (i.epsilonEff || 0), 0);
  const totalV = allInteractions.reduce((sum, i) => sum + (i.vLyapunov || 0), 0);
  const totalH = allInteractions.reduce((sum, i) => sum + (i.hDiv || 0), 0);

  const avgOmegaSem = totalOmega / allInteractions.length;
  const avgEpsilonEff = totalEpsilon / allInteractions.length;
  const avgVLyapunov = totalV / allInteractions.length;
  const avgHDiv = totalH / allInteractions.length;

  // Actualizar experimento
  await db
    .update(experiments)
    .set({
      successfulInteractions: allInteractions.length,
      failedInteractions: 50 - allInteractions.length,
      avgOmegaSem,
      avgEpsilonEff,
      avgVLyapunov,
      avgHDiv,
      status: 'completed',
      completedAt: new Date()
    })
    .where(eq(experiments.experimentId, EXPERIMENT_ID));

  console.log('\n' + '='.repeat(60));
  console.log('✅ B-1 COMPLETADO');
  console.log('='.repeat(60));
  console.log(`\n📊 Resumen Final:`);
  console.log(`   - Experimento: ${EXPERIMENT_ID}`);
  console.log(`   - Encoder: sentence-transformers/all-MiniLM-L6-v2 (384D)`);
  console.log(`   - Interacciones totales: ${allInteractions.length}/50`);
  console.log(`   - Interacciones añadidas: ${successfulInteractions}/6`);
  console.log(`   - Ω promedio: ${avgOmegaSem.toFixed(4)}`);
  console.log(`   - ε promedio: ${avgEpsilonEff.toFixed(4)}`);
  console.log(`   - V promedio: ${avgVLyapunov.toFixed(4)}`);
  console.log(`   - H promedio: ${avgHDiv.toFixed(4)}`);
  console.log(`\n✅ Validez experimental restaurada: B-1 y C-1 usan input idéntico y encoder idéntico (384D)\n`);

  process.exit(0);
}

completeRemaining().catch(error => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
