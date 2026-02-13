/**
 * BUCÉFALO - Módulo de Ejecución
 * 
 * Responsabilidades:
 * - Ejecuta plan SI y SOLO SI:
 *   - Liang generó plan
 *   - Argos aprobó (o advirtió pero no bloqueó)
 *   - Hécate validó (no vetó)
 * - Registra resultado en Wabun
 * - Actualiza métricas del sistema
 * 
 * NO planifica.
 * NO evalúa.
 * NO valida.
 * Solo ejecuta.
 */

import type { Plan } from "./liang";
import type { ArgosEvaluation } from "./argos";
import type { HecateValidation } from "./hecate";

export interface ExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  tokensConsumed: number;
  latency: number; // segundos
  timestamp: Date;
}

export interface ExecutionContext {
  plan: Plan;
  argosEvaluation: ArgosEvaluation;
  hecateValidation: HecateValidation;
  sessionId: number;
}

/**
 * Ejecuta plan si todas las validaciones pasaron
 */
export async function execute(context: ExecutionContext): Promise<ExecutionResult> {
  const startTime = Date.now();
  
  try {
    // 1. Verificar que se puede ejecutar
    if (!canExecute(context)) {
      return {
        success: false,
        error: "Execution blocked by validation",
        tokensConsumed: 0,
        latency: 0,
        timestamp: new Date(),
      };
    }
    
    // 2. Ejecutar pasos del plan
    const output = await executePlan(context.plan);
    
    // 3. Calcular métricas
    const latency = (Date.now() - startTime) / 1000;
    const tokensConsumed = context.argosEvaluation.estimatedTokens;
    
    return {
      success: true,
      output,
      tokensConsumed,
      latency,
      timestamp: new Date(),
    };
  } catch (error) {
    const latency = (Date.now() - startTime) / 1000;
    
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      tokensConsumed: 0,
      latency,
      timestamp: new Date(),
    };
  }
}

/**
 * Verifica si el plan puede ejecutarse
 */
function canExecute(context: ExecutionContext): boolean {
  // Argos bloqueó
  if (context.argosEvaluation.decision === "block") {
    return false;
  }
  
  // Hécate vetó
  if (context.hecateValidation.recommendation === "veto") {
    return false;
  }
  
  return true;
}

/**
 * Ejecuta pasos del plan secuencialmente
 */
async function executePlan(plan: Plan): Promise<unknown> {
  const results: Record<string, unknown> = {};
  
  for (const step of plan.steps) {
    // Verificar dependencias
    const dependenciesMet = step.dependencies.every(depId => depId in results);
    if (!dependenciesMet) {
      throw new Error(`Dependencies not met for step ${step.id}`);
    }
    
    // Ejecutar paso
    const result = await executeStep(step, results);
    results[step.id] = result;
  }
  
  return results;
}

/**
 * Ejecuta un paso individual
 */
async function executeStep(
  step: Plan["steps"][0],
  previousResults: Record<string, unknown>
): Promise<unknown> {
  // Implementación simplificada para MVP
  // En producción, esto debería:
  // - Llamar al LLM si requiresLLM
  // - Ejecutar tool calls si requiresToolCall
  // - Manejar errores y reintentos
  
  console.log(`[BUCÉFALO] Executing step: ${step.id} - ${step.action}`);
  
  // Simulación de ejecución
  await new Promise(resolve => setTimeout(resolve, 100));
  
  return {
    stepId: step.id,
    action: step.action,
    status: "completed",
    timestamp: new Date(),
  };
}

/**
 * Ejecuta en modo sigilo (sin logs visibles)
 */
export async function executeSilent(context: ExecutionContext): Promise<ExecutionResult> {
  // Temporalmente deshabilitar logs
  const originalLog = console.log;
  console.log = () => {};
  
  try {
    return await execute(context);
  } finally {
    console.log = originalLog;
  }
}

/**
 * Ejecuta en modo crítico (con validaciones extra)
 */
export async function executeCritical(context: ExecutionContext): Promise<ExecutionResult> {
  // En modo crítico, requerir confirmación explícita
  if (!context.plan.request.context?.explicitConfirmation) {
    return {
      success: false,
      error: "Critical execution requires explicit confirmation",
      tokensConsumed: 0,
      latency: 0,
      timestamp: new Date(),
    };
  }
  
  // Ejecutar con logging extra
  console.log("[BUCÉFALO] CRITICAL EXECUTION START");
  console.log("[BUCÉFALO] Plan:", context.plan.id);
  console.log("[BUCÉFALO] Argos:", context.argosEvaluation.decision);
  console.log("[BUCÉFALO] Hécate:", context.hecateValidation.recommendation);
  
  const result = await execute(context);
  
  console.log("[BUCÉFALO] CRITICAL EXECUTION END");
  console.log("[BUCÉFALO] Result:", result.success ? "SUCCESS" : "FAILURE");
  
  return result;
}
