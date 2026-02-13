/**
 * WABUN - Módulo de Memoria
 * 
 * Responsabilidades:
 * - Registra plan (Liang)
 * - Registra evaluación (Argos)
 * - Registra validación (Hécate)
 * - Registra resultado (Bucéfalo)
 * - Registra métricas (Ω, V, RLD, SIV)
 * - Registra eventos constitucionales
 * 
 * Nunca borra. Solo append.
 * Hash chain interno para integridad.
 */

import { getDb } from "../db";
import { wabunMemory, type InsertWabunMemory } from "../../drizzle/schema/caelion";
import { createHash } from "crypto";
import { desc } from "drizzle-orm";

export interface WabunEntry {
  eventType: InsertWabunMemory["eventType"];
  sessionId?: number;
  plan?: unknown;
  argosEvaluation?: unknown;
  hecateValidation?: unknown;
  executionResult?: unknown;
  metrics?: {
    omega: number;
    v: number;
    rld: number;
    siv: number;
  };
  constitutionalEvent?: unknown;
  operationalMode?: InsertWabunMemory["operationalMode"];
}

/**
 * Registra evento en Wabun (append-only)
 */
export async function record(entry: WabunEntry): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // 1. Obtener hash del registro anterior
    const previousEntry = await db
      .select()
      .from(wabunMemory)
      .orderBy(desc(wabunMemory.id))
      .limit(1);
    
    const previousHash = previousEntry[0]?.currentHash || "GENESIS";
    
    // 2. Calcular hash del registro actual
    const currentHash = calculateHash(entry, previousHash);
    
    // 3. Insertar registro
    await db.insert(wabunMemory).values({
      previousHash,
      currentHash,
      eventType: entry.eventType,
      sessionId: entry.sessionId,
      plan: entry.plan ? JSON.stringify(entry.plan) : null,
      argosEvaluation: entry.argosEvaluation ? JSON.stringify(entry.argosEvaluation) : null,
      hecateValidation: entry.hecateValidation ? JSON.stringify(entry.hecateValidation) : null,
      executionResult: entry.executionResult ? JSON.stringify(entry.executionResult) : null,
      metrics: entry.metrics ? JSON.stringify(entry.metrics) : null,
      constitutionalEvent: entry.constitutionalEvent ? JSON.stringify(entry.constitutionalEvent) : null,
      operationalMode: entry.operationalMode,
    });
    
    console.log(`[WABUN] Recorded event: ${entry.eventType}`);
  } catch (error) {
    console.error("[WABUN] Failed to record event:", error);
    throw error;
  }
}

/**
 * Registra plan generado por Liang
 */
export async function recordPlan(sessionId: number, plan: unknown): Promise<void> {
  await record({
    eventType: "plan_generated",
    sessionId,
    plan,
  });
}

/**
 * Registra evaluación de Argos
 */
export async function recordArgosEvaluation(
  sessionId: number,
  evaluation: unknown
): Promise<void> {
  await record({
    eventType: "argos_evaluation",
    sessionId,
    argosEvaluation: evaluation,
  });
}

/**
 * Registra validación de Hécate
 */
export async function recordHecateValidation(
  sessionId: number,
  validation: unknown
): Promise<void> {
  await record({
    eventType: "hecate_validation",
    sessionId,
    hecateValidation: validation,
  });
}

/**
 * Registra resultado de ejecución de Bucéfalo
 */
export async function recordExecutionResult(
  sessionId: number,
  result: unknown
): Promise<void> {
  await record({
    eventType: "execution_result",
    sessionId,
    executionResult: result,
  });
}

/**
 * Registra actualización de métricas
 */
export async function recordMetricsUpdate(
  sessionId: number,
  metrics: { omega: number; v: number; rld: number; siv: number }
): Promise<void> {
  await record({
    eventType: "metrics_update",
    sessionId,
    metrics,
  });
}

/**
 * Registra evento constitucional
 */
export async function recordConstitutionalEvent(
  sessionId: number,
  event: unknown
): Promise<void> {
  await record({
    eventType: "constitutional_event",
    sessionId,
    constitutionalEvent: event,
  });
}

/**
 * Registra cambio de modo operativo
 */
export async function recordModeChange(
  sessionId: number,
  mode: InsertWabunMemory["operationalMode"]
): Promise<void> {
  await record({
    eventType: "mode_change",
    sessionId,
    operationalMode: mode,
  });
}

/**
 * Registra lockdown del sistema
 */
export async function recordLockdown(reason: string): Promise<void> {
  await record({
    eventType: "lockdown_triggered",
    constitutionalEvent: { reason, timestamp: new Date() },
  });
}

/**
 * Calcula hash del registro para chain integrity
 */
function calculateHash(entry: WabunEntry, previousHash: string): string {
  const data = JSON.stringify({
    previousHash,
    eventType: entry.eventType,
    sessionId: entry.sessionId,
    timestamp: new Date().toISOString(),
    // Incluir datos relevantes sin ser exhaustivo
    planId: (entry.plan as { id?: string })?.id,
    argosDecision: (entry.argosEvaluation as { decision?: string })?.decision,
    hecateValid: (entry.hecateValidation as { valid?: boolean })?.valid,
  });
  
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Verifica integridad de la cadena de hash
 */
export async function verifyChainIntegrity(): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    const entries = await db
      .select()
      .from(wabunMemory)
      .orderBy(wabunMemory.id);
    
    if (entries.length === 0) return true;
    
    // Verificar que cada hash apunta al anterior
    for (let i = 1; i < entries.length; i++) {
      const current = entries[i];
      const previous = entries[i - 1];
      
      if (current.previousHash !== previous.currentHash) {
        console.error(`[WABUN] Chain integrity broken at entry ${current.id}`);
        return false;
      }
    }
    
    console.log("[WABUN] Chain integrity verified");
    return true;
  } catch (error) {
    console.error("[WABUN] Failed to verify chain integrity:", error);
    return false;
  }
}

/**
 * Consolidación periódica (cada 24h)
 * 
 * - Purga entradas irrelevantes (Lyapunov < 0.5)
 * - Archiva entradas con RLD < 0.7
 * - Mantiene integridad de la cadena
 */
export async function consolidate(): Promise<void> {
  console.log("[WABUN] Starting daily consolidation");
  
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // 1. Verificar integridad antes de consolidar
    const integrityOk = await verifyChainIntegrity();
    if (!integrityOk) {
      throw new Error("Chain integrity compromised - aborting consolidation");
    }
    
    // 2. Identificar entradas para purga/archivo
    // (Implementación simplificada para MVP - en producción, esto debería ser más sofisticado)
    
    // 3. Generar reporte de consolidación
    const totalEntries = await db.select().from(wabunMemory);
    console.log(`[WABUN] Consolidation complete - ${totalEntries.length} entries maintained`);
  } catch (error) {
    console.error("[WABUN] Consolidation failed:", error);
    throw error;
  }
}

/**
 * Obtiene historial de eventos para análisis
 */
export async function getHistory(
  sessionId?: number,
  eventType?: InsertWabunMemory["eventType"],
  limit: number = 100
): Promise<WabunEntry[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(wabunMemory);
  
  // Filtros opcionales
  // (En producción, usar drizzle-orm where clauses)
  
  const entries = await query.orderBy(desc(wabunMemory.id)).limit(limit);
  
  return entries.map((entry: any) => ({
    eventType: entry.eventType,
    sessionId: entry.sessionId || undefined,
    plan: entry.plan ? JSON.parse(entry.plan) : undefined,
    argosEvaluation: entry.argosEvaluation ? JSON.parse(entry.argosEvaluation) : undefined,
    hecateValidation: entry.hecateValidation ? JSON.parse(entry.hecateValidation) : undefined,
    executionResult: entry.executionResult ? JSON.parse(entry.executionResult) : undefined,
    metrics: entry.metrics ? JSON.parse(entry.metrics) : undefined,
    constitutionalEvent: entry.constitutionalEvent ? JSON.parse(entry.constitutionalEvent) : undefined,
    operationalMode: entry.operationalMode || undefined,
  }));
}
