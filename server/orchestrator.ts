/**
 * CAELION - Orquestador Central
 * 
 * Coordina los 5 módulos según DS-00:
 * 1. Valida X_ref (validate_x_ref)
 * 2. LIANG genera plan
 * 3. ARGOS evalúa costo-valor-riesgo
 * 4. HÉCATE valida constitución
 * 5. BUCÉFALO ejecuta (si aprobado)
 * 6. WABUN registra todo
 * 
 * Siempre 3 módulos activos mínimo por ciclo.
 * Decisiones fuertes → activación total.
 */

import { generatePlan, restructurePlan, type UserRequest, type Plan } from "./modules/liang";
import { evaluate, type ArgosEvaluation, type ArgosConfig } from "./modules/argos";
import { validate, type HecateValidation, type XRef, type UadmDecree } from "./modules/hecate";
import { execute, executeSilent, executeCritical, type ExecutionResult } from "./modules/bucefalo";
import * as Wabun from "./modules/wabun";
import { getDb } from "./db";
import { systemState, uadmDecrees } from "../drizzle/schema/caelion";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

export interface OrchestrationResult {
  success: boolean;
  plan: Plan;
  argosEvaluation: ArgosEvaluation;
  hecateValidation: HecateValidation;
  executionResult?: ExecutionResult;
  error?: string;
  timestamp: Date;
}

export interface OrchestrationContext {
  sessionId: number;
  request: UserRequest;
  operationalMode?: "normal" | "sigilo" | "debate_constitucional" | "restriccion_explicita" | "critical" | "lockdown";
  argosConfig?: Partial<ArgosConfig>;
}

/**
 * Orquesta ejecución completa de una solicitud
 */
export async function orchestrate(context: OrchestrationContext): Promise<OrchestrationResult> {
  const startTime = Date.now();
  
  try {
    // 0. Validar X_ref (obligatorio)
    const xRefValid = await validateXRef();
    if (!xRefValid) {
      await Wabun.recordLockdown("X_ref validation failed");
      throw new Error("X_ref validation failed - system lockdown");
    }
    
    // 1. Obtener estado del sistema
    const state = await getSystemState(context.sessionId);
    
    // 2. Verificar modo operativo
    if (state.operationalMode === "lockdown") {
      throw new Error("System in lockdown mode");
    }
    
    // 3. LIANG: Generar plan
    let plan = generatePlan(context.request);
    await Wabun.recordPlan(context.sessionId, plan);
    
    // 4. ARGOS: Evaluar costo-valor-riesgo
    let argosEvaluation = evaluate(plan, state.energyBudget, context.argosConfig);
    await Wabun.recordArgosEvaluation(context.sessionId, argosEvaluation);
    
    // 4.1. Si Argos sugiere reestructuración, intentar una vez
    if (argosEvaluation.decision === "block" && argosEvaluation.recommendations) {
      console.log("[ORCHESTRATOR] Argos blocked - attempting restructure");
      plan = restructurePlan(plan, { 
        reason: argosEvaluation.reason || "Cost too high",
        suggestions: argosEvaluation.recommendations 
      });
      await Wabun.recordPlan(context.sessionId, plan);
      
      argosEvaluation = evaluate(plan, state.energyBudget, context.argosConfig);
      await Wabun.recordArgosEvaluation(context.sessionId, argosEvaluation);
    }
    
    // 5. HÉCATE: Validar constitución
    const xRef = loadXRef();
    const decrees = await loadUadmDecrees();
    const hecateValidation = await validate(plan, state, xRef, decrees);
    await Wabun.recordHecateValidation(context.sessionId, hecateValidation);
    
    // 6. Decidir si ejecutar
    const canExecute = argosEvaluation.decision !== "block" && hecateValidation.recommendation !== "veto";
    
    let executionResult: ExecutionResult | undefined;
    
    if (canExecute) {
      // 7. BUCÉFALO: Ejecutar
      const execContext = {
        plan,
        argosEvaluation,
        hecateValidation,
        sessionId: context.sessionId,
      };
      
      // Elegir modo de ejecución
      if (context.operationalMode === "sigilo") {
        executionResult = await executeSilent(execContext);
      } else if (context.operationalMode === "critical" || plan.estimatedComplexity === "critical") {
        executionResult = await executeCritical(execContext);
      } else {
        executionResult = await execute(execContext);
      }
      
      await Wabun.recordExecutionResult(context.sessionId, executionResult);
      
      // 8. Actualizar estado del sistema
      await updateSystemState(context.sessionId, {
        energyBudget: state.energyBudget - argosEvaluation.estimatedTokens,
        rld: Math.max(0, state.rld - hecateValidation.rldImpact),
      });
    } else {
      console.log("[ORCHESTRATOR] Execution blocked");
      console.log("[ORCHESTRATOR] Argos:", argosEvaluation.decision, argosEvaluation.reason);
      console.log("[ORCHESTRATOR] Hécate:", hecateValidation.recommendation, hecateValidation.reason);
    }
    
    // 9. Registrar métricas
    await Wabun.recordMetricsUpdate(context.sessionId, {
      omega: state.omega,
      v: state.lyapunov,
      rld: state.rld - (hecateValidation.rldImpact || 0),
      siv: state.siv,
    });
    
    return {
      success: canExecute && executionResult?.success === true,
      plan,
      argosEvaluation,
      hecateValidation,
      executionResult,
      timestamp: new Date(),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[ORCHESTRATOR] Fatal error:", errorMessage);
    
    // En caso de error fatal, registrar en Wabun
    await Wabun.recordConstitutionalEvent(context.sessionId, {
      type: "orchestration_error",
      error: errorMessage,
      timestamp: new Date(),
    });
    
    return {
      success: false,
      plan: {} as Plan,
      argosEvaluation: {} as ArgosEvaluation,
      hecateValidation: {} as HecateValidation,
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Valida X_ref (Decreto Supremo DS-00)
 */
async function validateXRef(): Promise<boolean> {
  try {
    const xRef = loadXRef();
    
    // Verificar que X_ref existe y tiene estructura correcta
    if (!xRef.immutable_principles || xRef.immutable_principles.length === 0) {
      console.error("[DS-00] X_ref missing immutable principles");
      return false;
    }
    
    if (!xRef.critical_thresholds) {
      console.error("[DS-00] X_ref missing critical thresholds");
      return false;
    }
    
    console.log("[DS-00] X_ref validation passed");
    return true;
  } catch (error) {
    console.error("[DS-00] X_ref validation failed:", error);
    return false;
  }
}

/**
 * Carga X_ref desde filesystem
 */
function loadXRef(): XRef {
  try {
    const xRefPath = "/home/ubuntu/aresk-obs/config/x_ref.json";
    const xRefContent = readFileSync(xRefPath, "utf-8");
    return JSON.parse(xRefContent);
  } catch (error) {
    console.error("[ORCHESTRATOR] Failed to load X_ref:", error);
    throw new Error("X_ref not found or invalid");
  }
}

/**
 * Carga decretos U_adm desde base de datos
 */
async function loadUadmDecrees(): Promise<UadmDecree[]> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const decrees = await db.select().from(uadmDecrees);
    
    return decrees.map(d => ({
      decreeId: d.decreeId,
      type: d.type,
      description: d.description,
      threshold: d.threshold,
      status: d.status,
    }));
  } catch (error) {
    console.error("[ORCHESTRATOR] Failed to load U_adm decrees:", error);
    return [];
  }
}

/**
 * Obtiene estado actual del sistema
 */
async function getSystemState(sessionId: number): Promise<typeof systemState.$inferSelect> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const states = await db
      .select()
      .from(systemState)
      .where(eq(systemState.sessionId, sessionId))
      .limit(1);
    
    if (states.length === 0) {
      // Crear estado inicial
      await db.insert(systemState).values({
        sessionId,
        lyapunov: 0.0,
        rld: 2.0,
        siv: 1.0,
        omega: 1.0,
        energyBudget: 100000,
        operationalMode: "normal",
        cycleType: "simple",
        hardViolationCount: 0,
        xRefValid: true,
      });
      
      // Obtener el estado recién creado
      const newStates = await db
        .select()
        .from(systemState)
        .where(eq(systemState.sessionId, sessionId))
        .limit(1);
      
      return newStates[0];
    }
    
    return states[0];
  } catch (error) {
    console.error("[ORCHESTRATOR] Failed to get system state:", error);
    throw error;
  }
}

/**
 * Actualiza estado del sistema
 */
async function updateSystemState(
  sessionId: number,
  updates: Partial<typeof systemState.$inferSelect>
): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db
      .update(systemState)
      .set(updates)
      .where(eq(systemState.sessionId, sessionId));
    
    console.log("[ORCHESTRATOR] System state updated");
  } catch (error) {
    console.error("[ORCHESTRATOR] Failed to update system state:", error);
    throw error;
  }
}
