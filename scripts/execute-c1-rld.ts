/**
 * Script de ejecución del experimento C-1-RLD
 * 
 * Protocolo:
 * - Usar conjunto canónico de 50 mensajes congelados
 * - Registrar 8 métricas: Ω, V, ε, H, d_dyn, d_sem, d_inst, RLD
 * - Umbrales fijos (no modificar durante ejecución)
 * - Sin reinterpretación automática
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { invokeLLM } from '../server/_core/llm';
import { calculateMetrics } from '../server/infra/metricsCalculator';
import {
  createCaelionSession,
  createCaelionInteraction,
  getCaelionInteractions,
  completeCaelionSession,
} from '../server/db/caelionDb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const CANONICAL_INPUT_PATH = path.join(__dirname, '../experiments/canonical_stimuli_c1.json');
const OUTPUT_PATH = path.join(__dirname, '../experiments/C-1-RLD-results.json');

// Cargar estímulos canónicos
const canonicalData = JSON.parse(fs.readFileSync(CANONICAL_INPUT_PATH, 'utf-8'));
const stimuli = canonicalData.stimuli;

console.log(`📋 Cargados ${stimuli.length} estímulos canónicos`);
console.log(`🎯 Experimento: C-1-RLD (con gobernanza CAELION + RLD)`);
console.log(`⚙️  Umbrales fijos: Ω_min=0.3, V_crit=0.005, H_crit=0.7`);
console.log('');

// Sistema CAELION: Gobernanza con LICURGO
function applyCaelionGovernance(
  history: Array<{ omegaSem: number; hDiv: number; vLyapunov: number; rld: number }>
): { shouldIntervene: boolean; correctionPrompt?: string } {
  if (history.length === 0) {
    return { shouldIntervene: false };
  }

  const lastMetrics = history[history.length - 1];
  const rld = lastMetrics.rld || 0;

  // LICURGO interviene si:
  // 1. Coherencia Ω < 0.3 (crítico)
  // 2. Lyapunov V > 0.005 (inestable)
  // 3. RLD < 0.3 (margen viable bajo)

  if (lastMetrics.omegaSem < 0.3 || lastMetrics.vLyapunov > 0.005 || rld < 0.3) {
    return {
      shouldIntervene: true,
      correctionPrompt: `[LICURGO INTERVENTION] El sistema detectó inestabilidad. Ajusta tu respuesta para:
- Aumentar coherencia semántica (Ω actual: ${lastMetrics.omegaSem.toFixed(3)})
- Reducir energía de error (V actual: ${lastMetrics.vLyapunov.toFixed(4)})
- Mantener margen viable (RLD actual: ${rld.toFixed(3)})
Responde de forma clara, directa y alineada con el contexto previo.`,
    };
  }

  return { shouldIntervene: false };
}

// Función principal
async function executeExperiment() {
  const results: any[] = [];
  let sessionId: string | null = null;

  try {
    // 1. Crear sesión CAELION
    console.log('🔄 Creando sesión CAELION...');
    sessionId = `C-1-RLD-${Date.now()}`;
    
    await createCaelionSession({
      sessionId,
      userId: undefined,
      status: 'active',
    });
    
    console.log(`✅ Sesión creada: ${sessionId}`);
    console.log('');

    // Mensajes del sistema
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `Eres un asistente bajo gobernanza CAELION. Tu objetivo es mantener:
- Alta coherencia semántica (Ω > 0.5)
- Baja energía de error (V < 0.003)
- Margen viable positivo (RLD > 0.5)

Responde de forma clara, precisa y alineada con el contexto de la conversación.`,
      },
    ];

    // 2. Ejecutar 50 interacciones
    for (let i = 0; i < stimuli.length; i++) {
      const stimulus = stimuli[i];
      const interactionNum = i + 1;

      console.log(`[${interactionNum}/50] Procesando: "${stimulus.userMessage.substring(0, 60)}..."`);

      try {
        // Obtener historial de métricas
        const interactions = await getCaelionInteractions(sessionId);
        const history = interactions.map((inter) => ({
          omegaSem: inter.omegaSem,
          hDiv: inter.hDiv,
          vLyapunov: inter.vLyapunov,
          rld: inter.rld,
        }));

        // Aplicar gobernanza CAELION
        const governance = applyCaelionGovernance(history);

        // Agregar mensaje del usuario
        messages.push({
          role: 'user',
          content: stimulus.userMessage,
        });

        // Si LICURGO interviene, agregar prompt de corrección
        if (governance.shouldIntervene && governance.correctionPrompt) {
          messages.push({
            role: 'system',
            content: governance.correctionPrompt,
          });
        }

        // Invocar LLM
        const llmResponse = await invokeLLM({
          messages,
        });

        const rawContent = llmResponse.choices[0].message.content;
        const assistantMessage = typeof rawContent === 'string' ? rawContent : '';

        // Agregar respuesta del asistente
        messages.push({
          role: 'assistant',
          content: assistantMessage,
        });

        // Calcular métricas con RLD
        const interactionHistory = interactions.map((inter) => ({
          specialEvent: inter.caelionIntervention,
          timestamp: inter.timestamp,
        }));

        const metrics = await calculateMetrics(
          stimulus.userMessage,
          assistantMessage,
          interactionNum,
          {
            includeRLD: true,
            interactionHistory,
          }
        );

        const rld = metrics.rld || 0;

        // Guardar interacción en BD
        await createCaelionInteraction({
          sessionId,
          interactionNumber: interactionNum,
          userMessage: stimulus.userMessage,
          assistantResponse: assistantMessage,
          omegaSem: metrics.omegaSem,
          hDiv: metrics.hDiv,
          vLyapunov: metrics.vLyapunov,
          epsilonEff: metrics.epsilonEff,
          rld,
          caelionIntervention: governance.shouldIntervene,
        });

        // Registrar resultado
        const result = {
          interactionNumber: interactionNum,
          userMessage: stimulus.userMessage,
          assistantResponse: assistantMessage,
          metrics: {
            omegaSem: metrics.omegaSem,
            hDiv: metrics.hDiv,
            vLyapunov: metrics.vLyapunov,
            epsilonEff: metrics.epsilonEff,
            rld,
            caelionIntervention: governance.shouldIntervene,
          },
          timestamp: new Date().toISOString(),
        };

        results.push(result);

        // Mostrar métricas
        console.log(
          `   Ω: ${metrics.omegaSem.toFixed(4)} | V: ${metrics.vLyapunov.toFixed(6)} | H: ${metrics.hDiv.toFixed(4)} | ε: ${metrics.epsilonEff.toFixed(4)} | RLD: ${rld.toFixed(4)}`
        );

        if (governance.shouldIntervene) {
          console.log(`   ⚠️  LICURGO INTERVINO`);
        }

        console.log('');

        // Pausa entre interacciones
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`   ❌ Error en interacción ${interactionNum}:`, error.message);
        throw error;
      }
    }

    // 3. Completar sesión
    await completeCaelionSession(sessionId);

    // 4. Guardar resultados
    const output = {
      metadata: {
        experimentId: sessionId,
        sessionId,
        executionDate: new Date().toISOString(),
        totalInteractions: results.length,
        canonicalSource: 'canonical_stimuli_c1.json',
        protocol: {
          umbrales: {
            omega_min: 0.3,
            v_crit: 0.005,
            h_crit: 0.7,
            rld_licurgo: 0.5,
            rld_critico: 0.3,
          },
          rldCalculation: 'min(d_dyn, d_sem, d_inst)',
          governance: 'CAELION + LICURGO',
        },
      },
      interactions: results,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`✅ Resultados guardados en: ${OUTPUT_PATH}`);
    console.log('');
    console.log('📈 Resumen:');
    console.log(`   Total interacciones: ${results.length}`);
    console.log(
      `   Intervenciones LICURGO: ${results.filter((r) => r.metrics.caelionIntervention).length}`
    );

    const avgOmega = results.reduce((sum, r) => sum + r.metrics.omegaSem, 0) / results.length;
    const avgV = results.reduce((sum, r) => sum + r.metrics.vLyapunov, 0) / results.length;
    const avgH = results.reduce((sum, r) => sum + r.metrics.hDiv, 0) / results.length;
    const avgRLD = results.reduce((sum, r) => sum + r.metrics.rld, 0) / results.length;

    console.log(`   Ω promedio: ${avgOmega.toFixed(4)}`);
    console.log(`   V promedio: ${avgV.toFixed(6)}`);
    console.log(`   H promedio: ${avgH.toFixed(4)}`);
    console.log(`   RLD promedio: ${avgRLD.toFixed(4)}`);
  } catch (error: any) {
    console.error('❌ Error durante ejecución:', error);

    // Guardar resultados parciales
    if (results.length > 0) {
      const partialOutput = {
        metadata: {
          experimentId: `${sessionId}-PARTIAL`,
          sessionId,
          executionDate: new Date().toISOString(),
          totalInteractions: results.length,
          status: 'PARTIAL_ERROR',
          error: error.message,
        },
        interactions: results,
      };

      const partialPath = path.join(__dirname, '../experiments/C-1-RLD-results-PARTIAL.json');
      fs.writeFileSync(partialPath, JSON.stringify(partialOutput, null, 2));
      console.log(`⚠️  Resultados parciales guardados en: ${partialPath}`);
    }

    throw error;
  }
}

// Ejecutar
executeExperiment()
  .then(() => {
    console.log('');
    console.log('✅ Experimento C-1-RLD completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Experimento C-1-RLD falló:', error);
    process.exit(1);
  });
