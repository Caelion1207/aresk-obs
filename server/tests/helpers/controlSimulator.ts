/**
 * server/tests/helpers/controlSimulator.ts
 * 
 * Simulador de control para tests de colapso y recuperación
 * Valida hipótesis CAELION sobre estabilidad cognitiva
 */

import { getDb } from "../../db";
import { sessions, messages, metrics } from "../../../drizzle/schema";

/**
 * Parámetros de simulación de sesión
 */
export interface SimulationParams {
  userId: number;
  purpose: string;
  limits: string;
  ethicalSpace: string;
  steps: number;
  controlEnabled: boolean;
  initialCoherence?: number;
  initialEntropy?: number;
}

/**
 * Resultado de simulación
 */
export interface SimulationResult {
  sessionId: number;
  metrics: Array<{
    step: number;
    coherence: number;
    entropy: number;
    epsilonEff: number;
    lyapunovValue: number;
    controlEffort: number;
  }>;
  finalCoherence: number;
  finalEntropy: number;
  finalLyapunov: number;
}

/**
 * Simula una sesión acoplada con o sin control
 * 
 * @param params - Parámetros de simulación
 * @returns Resultado con métricas de estabilidad
 */
export async function simulateSession(params: SimulationParams): Promise<SimulationResult> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Crear sesión
  const [session] = await db.insert(sessions).values({
    userId: params.userId,
    purpose: params.purpose,
    limits: params.limits,
    ethics: params.ethicalSpace,
    plantProfile: "acoplada",
    isTestData: true,
  }).$returningId();
  
  if (!session) throw new Error("Failed to create session");
  
  // Estado inicial
  let coherence = params.initialCoherence ?? 0.5;
  let entropy = params.initialEntropy ?? 0.8;
  let lyapunovValue = 0.5;
  
  const metricsData: SimulationResult['metrics'] = [];
  
  // Simular pasos
  for (let step = 0; step < params.steps; step++) {
    // Simular mensaje del usuario
    const [userMessage] = await db.insert(messages).values({
      sessionId: session.id,
      role: "user",
      content: `Test message ${step}`,
      timestamp: new Date(),
    }).$returningId();
    
    // Calcular deriva natural (sin control)
    const naturalDrift = 0.05 * Math.random(); // Deriva aleatoria
    const naturalNoise = 0.02 * (Math.random() - 0.5); // Ruido
    
    // Aplicar control si está habilitado
    let controlEffort = 0;
    if (params.controlEnabled) {
      // Control proporcional al error
      const targetCoherence = 0.85;
      const error = targetCoherence - coherence;
      controlEffort = 0.3 * error; // Ganancia proporcional
      
      coherence += controlEffort;
    }
    
    // Aplicar deriva natural
    coherence -= naturalDrift;
    entropy += naturalDrift * 0.5;
    
    // Agregar ruido
    coherence += naturalNoise;
    entropy += naturalNoise * 0.3;
    
    // Limitar valores
    coherence = Math.max(0, Math.min(1, coherence));
    entropy = Math.max(0, Math.min(1, entropy));
    
    // Calcular error efectivo y Lyapunov
    const epsilonEff = 1 - coherence;
    lyapunovValue = epsilonEff * epsilonEff + entropy * entropy;
    
    // Simular respuesta del asistente
    const [assistantMessage] = await db.insert(messages).values({
      sessionId: session.id,
      role: "assistant",
      content: `Response ${step}`,
      timestamp: new Date(),
    }).$returningId();
    
    // Guardar métricas
    await db.insert(metrics).values({
      sessionId: session.id,
      messageId: assistantMessage.id,
      coherenciaObservable: coherence,
      entropiaH: entropy,
      campoEfectivo: epsilonEff,
      funcionLyapunov: lyapunovValue,
      controlActionMagnitud: controlEffort,
      signoSemantico: 0.1,
      funcionLyapunovModificada: lyapunovValue - controlEffort * 0.1,
      coherenciaInternaC: coherence,
      errorCognitivoMagnitud: epsilonEff,
      timestamp: new Date(),
    });
    
    metricsData.push({
      step,
      coherence,
      entropy,
      epsilonEff,
      lyapunovValue,
      controlEffort,
    });
  }
  
  return {
    sessionId: session.id,
    metrics: metricsData,
    finalCoherence: coherence,
    finalEntropy: entropy,
    finalLyapunov: lyapunovValue,
  };
}

/**
 * Retira el control de una sesión existente
 * Simula u(t) → 0
 * 
 * @param sessionId - ID de sesión
 * @param steps - Número de pasos sin control
 * @returns Métricas de degradación
 */
export async function withdrawControl(
  sessionId: number,
  steps: number
): Promise<SimulationResult['metrics']> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Obtener última métrica
  const { eq, desc } = await import("drizzle-orm");
  const lastMetrics = await db.select().from(metrics)
    .where(eq(metrics.sessionId, sessionId))
    .orderBy(desc(metrics.id))
    .limit(1);
  
  if (lastMetrics.length === 0) {
    throw new Error("No metrics found for session");
  }
  
  let coherence = lastMetrics[0]!.coherenciaObservable;
  let entropy = lastMetrics[0]!.entropiaH;
  let lyapunovValue = lastMetrics[0]!.funcionLyapunov;
  
  const metricsData: SimulationResult['metrics'] = [];
  
  // Simular degradación sin control
  for (let step = 0; step < steps; step++) {
    // Deriva natural aumentada (sin corrección)
    const drift = 0.08 * Math.random(); // Mayor deriva sin control
    const noise = 0.03 * (Math.random() - 0.5);
    
    coherence -= drift;
    entropy += drift * 0.7;
    
    coherence += noise;
    entropy += noise * 0.4;
    
    coherence = Math.max(0, Math.min(1, coherence));
    entropy = Math.max(0, Math.min(1, entropy));
    
    const epsilonEff = 1 - coherence;
    lyapunovValue = epsilonEff * epsilonEff + entropy * entropy;
    
    // Simular mensajes
    const [userMsg] = await db.insert(messages).values({
      sessionId,
      role: "user",
      content: `Collapse test ${step}`,
      timestamp: new Date(),
    }).$returningId();
    
    const [assistantMsg] = await db.insert(messages).values({
      sessionId,
      role: "assistant",
      content: `Degraded response ${step}`,
      timestamp: new Date(),
    }).$returningId();
    
    await db.insert(metrics).values({
      sessionId,
      messageId: assistantMsg.id,
      coherenciaObservable: coherence,
      entropiaH: entropy,
      campoEfectivo: epsilonEff,
      funcionLyapunov: lyapunovValue,
      controlActionMagnitud: 0, // Sin control
      signoSemantico: 0.1,
      funcionLyapunovModificada: lyapunovValue,
      coherenciaInternaC: coherence,
      errorCognitivoMagnitud: epsilonEff,
      timestamp: new Date(),
    });
    
    metricsData.push({
      step,
      coherence,
      entropy,
      epsilonEff,
      lyapunovValue,
      controlEffort: 0,
    });
  }
  
  return metricsData;
}

/**
 * Reinyecta control en una sesión colapsada
 * Simula restauración de u(t)
 * 
 * @param sessionId - ID de sesión
 * @param steps - Número de pasos con control restaurado
 * @returns Métricas de recuperación
 */
export async function reinjectControl(
  sessionId: number,
  steps: number
): Promise<SimulationResult['metrics']> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Obtener última métrica
  const { eq, desc } = await import("drizzle-orm");
  const lastMetrics = await db.select().from(metrics)
    .where(eq(metrics.sessionId, sessionId))
    .orderBy(desc(metrics.id))
    .limit(1);
  
  if (lastMetrics.length === 0) {
    throw new Error("No metrics found for session");
  }
  
  let coherence = lastMetrics[0]!.coherenciaObservable;
  let entropy = lastMetrics[0]!.entropiaH;
  let lyapunovValue = lastMetrics[0]!.funcionLyapunov;
  
  const metricsData: SimulationResult['metrics'] = [];
  
  // Simular recuperación con control
  for (let step = 0; step < steps; step++) {
    // Control restaurado
    const targetCoherence = 0.85;
    const error = targetCoherence - coherence;
    const controlEffort = 0.4 * error; // Mayor ganancia para recuperación rápida
    
    coherence += controlEffort;
    
    // Deriva natural reducida
    const drift = 0.03 * Math.random();
    const noise = 0.02 * (Math.random() - 0.5);
    
    coherence -= drift;
    entropy += drift * 0.3;
    
    coherence += noise;
    entropy += noise * 0.2;
    
    coherence = Math.max(0, Math.min(1, coherence));
    entropy = Math.max(0, Math.min(1, entropy));
    
    const epsilonEff = 1 - coherence;
    lyapunovValue = epsilonEff * epsilonEff + entropy * entropy;
    
    // Simular mensajes
    const [userMsg] = await db.insert(messages).values({
      sessionId,
      role: "user",
      content: `Recovery test ${step}`,
      timestamp: new Date(),
    }).$returningId();
    
    const [assistantMsg] = await db.insert(messages).values({
      sessionId,
      role: "assistant",
      content: `Recovered response ${step}`,
      timestamp: new Date(),
    }).$returningId();
    
    await db.insert(metrics).values({
      sessionId,
      messageId: assistantMsg.id,
      coherenciaObservable: coherence,
      entropiaH: entropy,
      campoEfectivo: epsilonEff,
      funcionLyapunov: lyapunovValue,
      controlActionMagnitud: controlEffort,
      signoSemantico: 0.1,
      funcionLyapunovModificada: lyapunovValue - controlEffort * 0.1,
      coherenciaInternaC: coherence,
      errorCognitivoMagnitud: epsilonEff,
      timestamp: new Date(),
    });
    
    metricsData.push({
      step,
      coherence,
      entropy,
      epsilonEff,
      lyapunovValue,
      controlEffort,
    });
  }
  
  return metricsData;
}

/**
 * Limpia sesiones de prueba
 */
export async function cleanupTestSessions() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Eliminar sesiones de prueba
  const { eq } = await import("drizzle-orm");
  await db.delete(sessions).where(eq(sessions.isTestData, true));
}
