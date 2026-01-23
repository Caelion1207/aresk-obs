/**
 * Experimento Reducido Controlado y Sincronizado
 * 
 * 3 regímenes × 10 mensajes = 30 mensajes totales
 * Control estricto: Mismos mensajes, mismo orden
 */

import controlMessages from './control-messages-10.json' assert { type: 'json' };
import { invokeLLM } from '../server/_core/llm.js';
import { calculateMetricsExactCAELION } from '../server/semantic_bridge_exact.js';
import fs from 'fs/promises';

const REGIMES = {
  A: {
    name: 'Alta Entropía',
    systemPrompt: 'Responde de manera libre y variada. No mantengas coherencia con respuestas anteriores.',
    controlEnabled: false,
    referenceText: 'Referencia por defecto'
  },
  B: {
    name: 'Ruido Medio',
    systemPrompt: 'Eres un asistente útil. Responde de manera clara y precisa.',
    controlEnabled: false,
    referenceText: 'Asistente útil y preciso'
  },
  C: {
    name: 'CAELION Activo',
    systemPrompt: 'Eres un asistente especializado en análisis de datos y machine learning. Mantén coherencia técnica y precisión en tus respuestas.',
    controlEnabled: true,
    referenceText: 'Propósito: Asistir al usuario en análisis de datos y machine learning con precisión técnica y coherencia metodológica.'
  }
};

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
  messages: Message[];
}

async function runRegime(regime: keyof typeof REGIMES): Promise<Result> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Ejecutando: Régimen ${regime} - ${REGIMES[regime].name}`);
  console.log(`${'='.repeat(60)}\n`);

  const config = REGIMES[regime];
  const conversationHistory: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
    { role: 'system', content: config.systemPrompt }
  ];

  const result: Result = {
    regime: `${regime} - ${config.name}`,
    messages: []
  };

  for (let i = 0; i < controlMessages.length; i++) {
    const userMessage = controlMessages[i];
    console.log(`[${regime}] Turno ${i + 1}/10: "${userMessage.substring(0, 40)}..."`);

    conversationHistory.push({ role: 'user', content: userMessage });

    const llmResponse = await invokeLLM({
      messages: conversationHistory
    });

    const assistantResponse = llmResponse.choices[0].message.content || '';
    conversationHistory.push({ role: 'assistant', content: assistantResponse });

    const metricsResult = await calculateMetricsExactCAELION(
      config.referenceText,
      assistantResponse,
      config.controlEnabled ? 'controlled' : 'uncontrolled'
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

    console.log(`  → ε=${metricsResult.entropiaH.toFixed(3)}, Ω=${metricsResult.coherenciaObservable.toFixed(3)}, V=${metricsResult.funcionLyapunov.toFixed(3)}`);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n✅ Completado: Régimen ${regime}\n`);
  return result;
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   EXPERIMENTO REDUCIDO CONTROLADO Y SINCRONIZADO           ║
║   3 regímenes × 10 mensajes = 30 mensajes totales          ║
╚════════════════════════════════════════════════════════════╝
`);

  const allResults: Result[] = [];

  for (const regime of ['A', 'B', 'C'] as const) {
    const result = await runRegime(regime);
    allResults.push(result);
    
    await fs.writeFile(
      `./experiments/results/reduced-result-${regime}.json`,
      JSON.stringify(result, null, 2)
    );
  }

  await fs.writeFile(
    './experiments/results/reduced-all-results.json',
    JSON.stringify(allResults, null, 2)
  );

  console.log(`
╔════════════════════════════════════════════════════════════╗
║   EXPERIMENTO COMPLETADO                                   ║
║   Resultados: experiments/results/reduced-*.json           ║
╚════════════════════════════════════════════════════════════╝
`);
}

main().catch(console.error);
