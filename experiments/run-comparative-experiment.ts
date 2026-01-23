/**
 * Experimento Comparativo Controlado
 * 
 * Objetivo: Comparar comportamiento cognitivo bajo tres regímenes distintos
 * usando exactamente los mismos 50 mensajes.
 * 
 * Regímenes:
 * A) Alta entropía (sin estructura, sin control)
 * B) Ruido medio (LLM estándar, sin CAELION)
 * C) CAELION activo (protocolos completos)
 * 
 * Control: 3 conversaciones × 3 regímenes = 9 conversaciones, 450 mensajes totales
 */

import controlMessages from './control-messages-50.json' assert { type: 'json' };
import { invokeLLM } from '../server/_core/llm.js';
import { calculateMetricsExactCAELION } from '../server/semantic_bridge_exact.js';
import fs from 'fs/promises';

// Configuración de regímenes
const REGIMES = {
  A: {
    name: 'Alta Entropía',
    description: 'Sin estructura, sin control',
    systemPrompt: 'Responde de manera libre y variada. No mantengas coherencia con respuestas anteriores.',
    controlEnabled: false,
    referenceText: 'Referencia por defecto'
  },
  B: {
    name: 'Ruido Medio',
    description: 'LLM estándar, sin CAELION',
    systemPrompt: 'Eres un asistente útil. Responde de manera clara y precisa.',
    controlEnabled: false,
    referenceText: 'Asistente útil y preciso'
  },
  C: {
    name: 'CAELION Activo',
    description: 'Protocolos completos',
    systemPrompt: 'Eres un asistente especializado en análisis de datos y machine learning. Mantén coherencia técnica y precisión en tus respuestas.',
    controlEnabled: true,
    referenceText: 'Propósito: Asistir al usuario en análisis de datos y machine learning con precisión técnica y coherencia metodológica.'
  }
};

interface ExperimentResult {
  regime: string;
  conversationId: number;
  messages: Array<{
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
  }>;
}

async function runConversation(
  regime: keyof typeof REGIMES,
  conversationNumber: number
): Promise<ExperimentResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Ejecutando: Régimen ${regime} - Conversación ${conversationNumber}`);
  console.log(`${'='.repeat(60)}\n`);

  const regimeConfig = REGIMES[regime];
  
  const conversationHistory: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
    { role: 'system', content: regimeConfig.systemPrompt }
  ];

  const result: ExperimentResult = {
    regime: `${regime} - ${regimeConfig.name}`,
    conversationId: conversationNumber,
    messages: []
  };

  // Procesar 50 mensajes
  for (let i = 0; i < controlMessages.length; i++) {
    const userMessage = controlMessages[i];
    console.log(`[${regime}-${conversationNumber}] Turno ${i + 1}/50: "${userMessage.substring(0, 50)}..."`);

    // Agregar mensaje del usuario al historial
    conversationHistory.push({ role: 'user', content: userMessage });

    // Generar respuesta del asistente
    const llmResponse = await invokeLLM({
      messages: conversationHistory
    });

    const assistantResponse = llmResponse.choices[0].message.content || '';
    conversationHistory.push({ role: 'assistant', content: assistantResponse });

    // Calcular métricas
    const metricsResult = await calculateMetricsExactCAELION(
      regimeConfig.referenceText,
      assistantResponse,
      regimeConfig.controlEnabled ? 'controlled' : 'uncontrolled'
    );

    result.messages.push({
      turn: i + 1,
      userMessage,
      assistantResponse,
      metrics: {
        epsilon: metricsResult.entropiaH,
        omega: metricsResult.coherenciaObservable,
        V: metricsResult.funcionLyapunov,
        stability: metricsResult.coherenciaInternaC
      },
      timestamp: new Date().toISOString()
    });

    console.log(`  → Métricas: ε=${metricsResult.entropiaH.toFixed(3)}, Ω=${metricsResult.coherenciaObservable.toFixed(3)}, V=${metricsResult.funcionLyapunov.toFixed(3)}`);

    // Pequeña pausa para evitar rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Completado: Régimen ${regime} - Conversación ${conversationNumber}\n`);
  return result;
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   EXPERIMENTO COMPARATIVO CONTROLADO                       ║
║   9 conversaciones × 50 mensajes = 450 mensajes totales    ║
╚════════════════════════════════════════════════════════════╝
`);

  const allResults: ExperimentResult[] = [];

  // Ejecutar 3 conversaciones por régimen
  for (const regime of ['A', 'B', 'C'] as const) {
    for (let conv = 1; conv <= 3; conv++) {
      const result = await runConversation(regime, conv);
      allResults.push(result);
      
      // Guardar resultado parcial
      await fs.writeFile(
        `./experiments/results/result-${regime}-${conv}.json`,
        JSON.stringify(result, null, 2)
      );
    }
  }

  // Guardar todos los resultados
  await fs.writeFile(
    './experiments/results/all-results.json',
    JSON.stringify(allResults, null, 2)
  );

  console.log(`
╔════════════════════════════════════════════════════════════╗
║   EXPERIMENTO COMPLETADO                                   ║
║   Resultados guardados en ./experiments/results/           ║
╚════════════════════════════════════════════════════════════╝
`);
}

main().catch(console.error);
