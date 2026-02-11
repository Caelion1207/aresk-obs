/**
 * Experiment Worker
 * Ejecuta experimentos C-1-RLD en background
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { invokeLLM } from '../_core/llm';
import { calculateMetrics } from './metricsCalculator';
import {
  createCaelionSession,
  createCaelionInteraction,
  getCaelionInteractions,
  completeCaelionSession,
} from '../db/caelionDb';
import { updateJobProgress, completeJob, failJob } from './experimentQueue';

// Función de gobernanza CAELION (copiada de caelion.ts)
function applyCaelionGovernance(
  userMessage: string,
  history: Array<{ omegaSem: number; hDiv: number; vLyapunov: number; rld?: number }>
): { shouldIntervene: boolean; correctionPrompt?: string } {
  if (history.length === 0) {
    return { shouldIntervene: false };
  }

  const lastMetrics = history[history.length - 1];
  const rld = lastMetrics.rld || 0;

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

export async function executeCanonicalExperiment(experimentId: string): Promise<void> {
  console.log(`[EXPERIMENT_WORKER] Iniciando experimento ${experimentId}`);
  try {
    // 1. Cargar conjunto canónico
    const canonicalPath = path.join(process.cwd(), 'experiments/canonical_stimuli_c1.json');
    const canonicalData = JSON.parse(fs.readFileSync(canonicalPath, 'utf-8'));
    const stimuli = canonicalData.stimuli;

    if (stimuli.length !== 50) {
      throw new Error(`Conjunto canónico inválido: esperados 50 mensajes, encontrados ${stimuli.length}`);
    }

    // Verificar hash
    const canonicalHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(stimuli))
      .digest('hex');

    // 2. Crear sesión CAELION
    await createCaelionSession({
      sessionId: experimentId,
      userId: undefined,
      status: 'active',
    });

    // 3. Inicializar mensajes del sistema
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

    // 4. Ejecutar 50 interacciones secuenciales
    const results: any[] = [];
    let licurgoInterventions = 0;

    for (let i = 0; i < stimuli.length; i++) {
      const stimulus = stimuli[i];
      const interactionNum = i + 1;

      // Actualizar progreso
      updateJobProgress(experimentId, interactionNum);

      // Obtener historial de métricas
      const interactions = await getCaelionInteractions(experimentId);
      const history = interactions.map((inter) => ({
        omegaSem: inter.omegaSem,
        hDiv: inter.hDiv,
        vLyapunov: inter.vLyapunov,
        rld: inter.rld,
      }));

      // Aplicar gobernanza CAELION
      const governance = applyCaelionGovernance(stimulus.userMessage, history);

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
        licurgoInterventions++;
      }

      // Invocar LLM
      const llmResponse = await invokeLLM({ messages });
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

      const metrics = await calculateMetrics(stimulus.userMessage, assistantMessage, interactionNum, {
        includeRLD: true,
        interactionHistory,
      });

      const rld = metrics.rld || 0;

      // Guardar interacción en BD
      await createCaelionInteraction({
        sessionId: experimentId,
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
      results.push({
        interactionNumber: interactionNum,
        metrics: {
          omegaSem: metrics.omegaSem,
          hDiv: metrics.hDiv,
          vLyapunov: metrics.vLyapunov,
          epsilonEff: metrics.epsilonEff,
          rld,
          d_dyn: metrics.rldDetails?.d_dyn || 0,
          d_sem: metrics.rldDetails?.d_sem || 0,
          d_inst: metrics.rldDetails?.d_inst || 0,
          caelionIntervention: governance.shouldIntervene,
        },
      });
    }

    // 5. Completar sesión
    await completeCaelionSession(experimentId);

    // 6. Calcular estadísticas finales
    const avgOmega = results.reduce((sum, r) => sum + r.metrics.omegaSem, 0) / results.length;
    const avgV = results.reduce((sum, r) => sum + r.metrics.vLyapunov, 0) / results.length;
    const avgH = results.reduce((sum, r) => sum + r.metrics.hDiv, 0) / results.length;
    const avgRLD = results.reduce((sum, r) => sum + r.metrics.rld, 0) / results.length;

    // 7. Guardar resultados en archivo
    const outputPath = path.join(process.cwd(), 'experiments/C-1-RLD-results.json');
    const output = {
      metadata: {
        experimentId,
        executionDate: new Date().toISOString(),
        totalInteractions: results.length,
        canonicalSource: 'canonical_stimuli_c1.json',
        canonicalHash,
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
        statistics: {
          avgOmega,
          avgV,
          avgH,
          avgRLD,
          licurgoInterventions,
        },
      },
      interactions: results,
    };

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    // 8. Marcar job como completado
    completeJob(experimentId, {
      avgOmega,
      avgV,
      avgH,
      avgRLD,
      licurgoInterventions,
    });
  } catch (error: any) {
    console.error(`[EXPERIMENT_WORKER] Error en experimento ${experimentId}:`, error);
    failJob(experimentId, error.message);
  }
}
