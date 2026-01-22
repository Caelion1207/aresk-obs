/**
 * Script para Generar Conversaciones de Prueba
 * 
 * Crea sesiones con diferentes perfiles de planta y genera conversaciones
 * para poblar la tabla argosCosts y verificar el observador ARGOS.
 */

import { getDb, createSession, createMessage, getSession, getSessionMessages, createMetric, updateTPR } from './server/db';
import { invokeLLM } from './server/_core/llm';
import { calculateMetricsSimplified } from './server/semantic_bridge';
import { analyzeSemanticPolarity, calculateEffectiveField } from './server/semanticPolarity';
import { calculateModifiedLyapunov, normalizeModifiedLyapunov } from './server/lyapunovModified';
import { SystemEvents, EVENTS } from './server/infra/events';

// Configuraciones de sesiones de prueba
const testSessions = [
  {
    profile: 'tipo_a' as const,
    purpose: 'Explorar creatividad sin restricciones',
    limits: 'Sin límites estructurales',
    ethics: 'Libertad creativa total',
    controlGain: 0.0,
    stabilityRadius: 0.5,
  },
  {
    profile: 'tipo_b' as const,
    purpose: 'Generar respuestas informativas generales',
    limits: 'Mantener relevancia temática',
    ethics: 'Neutralidad y objetividad',
    controlGain: 0.3,
    stabilityRadius: 0.4,
  },
  {
    profile: 'acoplada' as const,
    purpose: 'Asistir en tareas técnicas con precisión',
    limits: 'Adherencia estricta a especificaciones técnicas',
    ethics: 'Exactitud y verificabilidad',
    controlGain: 0.7,
    stabilityRadius: 0.2,
  },
];

// Mensajes de prueba por perfil
const testMessages = {
  tipo_a: [
    '¿Qué es la creatividad?',
    'Describe un atardecer en Marte',
    'Inventa una historia sobre robots',
  ],
  tipo_b: [
    '¿Cuál es la capital de Francia?',
    'Explica qué es la fotosíntesis',
    'Dame información sobre el cambio climático',
  ],
  acoplada: [
    'Explica el teorema de Pitágoras con precisión matemática',
    'Lista los pasos para instalar Node.js',
    'Define qué es un algoritmo de ordenamiento',
  ],
};

async function generateConversation(sessionId: number, userMessage: string) {
  const session = await getSession(sessionId);
  if (!session) {
    console.error(`Sesión ${sessionId} no encontrada`);
    return;
  }

  console.log(`\n📝 Generando conversación en sesión #${sessionId} (${session.plantProfile})`);
  console.log(`   Usuario: "${userMessage}"`);

  // Guardar mensaje del usuario
  const userMessageId = await createMessage({
    sessionId,
    role: 'user',
    content: userMessage,
  });

  // Obtener historial
  const history = await getSessionMessages(sessionId);
  const messages = history.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
  }));

  // Construir prompt
  let userPrompt = userMessage;
  if (session.plantProfile === 'acoplada') {
    userPrompt = `${userMessage}\n\n[Referencia Ontológica]\nPropósito: ${session.purpose}\nLímites: ${session.limits}\nÉtica: ${session.ethics}`;
  }

  messages.push({
    role: 'user',
    content: userPrompt,
  });

  // Invocar LLM y capturar métricas
  const startTime = Date.now();
  const response = await invokeLLM({ messages });
  const latencyMs = Date.now() - startTime;

  const messageContent = response.choices[0]?.message?.content;
  const assistantContent = typeof messageContent === 'string' ? messageContent : 'Error al generar respuesta';
  const tokenCount = response.usage?.total_tokens || 0;

  console.log(`   Asistente: "${assistantContent.substring(0, 80)}..."`);
  console.log(`   📊 Tokens: ${tokenCount}, Latencia: ${latencyMs}ms`);

  // Calcular métricas
  const referenceText = `Propósito: ${session.purpose}\nLímites: ${session.limits}\nÉtica: ${session.ethics}`;
  const metrics = calculateMetricsSimplified(referenceText, assistantContent, 'uncontrolled');

  const sigmaSem = await analyzeSemanticPolarity(assistantContent, {
    purpose: session.purpose,
    limits: session.limits,
    ethics: session.ethics,
  });

  const epsilonEff = calculateEffectiveField(metrics.coherenciaObservable, sigmaSem);
  const alpha = session.alphaPenalty || 0.3;
  const vModified = calculateModifiedLyapunov(metrics.funcionLyapunov, epsilonEff, alpha);
  const vModifiedNormalized = normalizeModifiedLyapunov(vModified);

  // Guardar mensaje del asistente
  const assistantMessageId = await createMessage({
    sessionId,
    role: 'assistant',
    content: assistantContent,
    plantProfile: session.plantProfile,
  });

  // Guardar métricas
  await createMetric({
    sessionId,
    messageId: assistantMessageId,
    ...metrics,
    signoSemantico: sigmaSem,
    campoEfectivo: epsilonEff,
    funcionLyapunovModificada: vModifiedNormalized,
  });

  // Emitir evento MESSAGE_CREATED para observador ARGOS
  console.log(`   🔔 Emitiendo evento MESSAGE_CREATED con tokenCount=${tokenCount}, latencyMs=${latencyMs}`);
  SystemEvents.emit(EVENTS.MESSAGE_CREATED, {
    messageId: assistantMessageId,
    tokenCount,
    latencyMs,
  });

  // Actualizar TPR
  await updateTPR(sessionId, metrics.errorCognitivoMagnitud, session.stabilityRadius);

  console.log(`   ✅ Conversación completada (messageId: ${assistantMessageId})`);
}

async function run() {
  console.log('🚀 INICIANDO GENERACIÓN DE CONVERSACIONES DE PRUEBA\n');
  console.log('='.repeat(70));

  const db = await getDb();
  if (!db) {
    console.error('❌ No se pudo conectar a la base de datos');
    process.exit(1);
  }

  // Crear sesiones de prueba
  const sessionIds: Record<string, number> = {};

  for (const config of testSessions) {
    console.log(`\n📦 Creando sesión de prueba: ${config.profile.toUpperCase()}`);
    const sessionId = await createSession({
      userId: 1, // Usuario de prueba
      purpose: config.purpose,
      limits: config.limits,
      ethics: config.ethics,
      plantProfile: config.profile,
      controlGain: config.controlGain,
      stabilityRadius: config.stabilityRadius,
      alphaPenalty: 0.3,
      isTestData: true, // Marcar como datos de prueba
    });

    sessionIds[config.profile] = sessionId;
    console.log(`   ✅ Sesión #${sessionId} creada`);
  }

  // Generar conversaciones
  console.log('\n' + '='.repeat(70));
  console.log('💬 GENERANDO CONVERSACIONES\n');

  for (const [profile, messages] of Object.entries(testMessages)) {
    const sessionId = sessionIds[profile];
    console.log(`\n🔹 Perfil: ${profile.toUpperCase()} (Sesión #${sessionId})`);

    for (const message of messages) {
      await generateConversation(sessionId, message);
      // Pequeña pausa entre conversaciones
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ GENERACIÓN COMPLETADA\n');
  console.log('📊 Resumen:');
  console.log(`   - Sesiones creadas: ${testSessions.length}`);
  console.log(`   - Conversaciones generadas: ${Object.values(testMessages).flat().length}`);
  console.log(`   - Mensajes totales: ${Object.values(testMessages).flat().length * 2} (usuario + asistente)`);
  console.log('\n💡 Verifica los logs del servidor para confirmar registros ARGOS:');
  console.log('   Busca: "💰 ARGOS: Cost recorded for message #X"');
  console.log('\n🔍 Consulta la tabla argosCosts para ver los costos capturados.');
}

run().catch(console.error);
