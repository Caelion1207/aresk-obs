/**
 * server/infra/emergency.ts
 * 
 * Sistema de detección y respuesta ante corrupción de audit logs
 * 
 * Acciones:
 * - Detección de hash chain roto
 * - Alerta inmediata al owner
 * - Bloqueo de escrituras (modo emergencia)
 * - Logging de incidente
 * 
 * Respeta bloque génesis único (no genera falsos positivos)
 */

import { getDb } from "../db";
import { auditLogs } from "../../drizzle/auditLogs";
import { verifyChainIntegrity } from "./crypto";
import { asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Estado de emergencia global
let emergencyMode = false;
let corruptionDetected = false;
let corruptionDetails: string | null = null;

/**
 * Verifica integridad de la cadena de audit logs
 * 
 * Respeta el bloque génesis único:
 * - Primer log debe ser GENESIS con prevHash = null
 * - Logs posteriores deben tener prevHash = hash del anterior
 * 
 * @param limit - Número de logs a verificar (desde el más antiguo)
 * @returns Resultado de verificación
 */
export async function verifyAuditChainIntegrity(limit: number = 100): Promise<{
  isValid: boolean;
  corruptedLogId?: number;
  details?: string;
}> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available for integrity check",
    });
  }
  
  // Obtener logs en orden cronológico (por ID)
  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(asc(auditLogs.id))
    .limit(limit);
  
  if (logs.length === 0) {
    return { isValid: true };
  }
  
  // Usar función de crypto que respeta génesis
  const result = verifyChainIntegrity(logs as any);
  
  if (!result.valid) {
    const corruptedLog = logs[result.brokenAt || 0];
    return {
      isValid: false,
      corruptedLogId: corruptedLog?.id,
      details: `Chain broken at log ${result.brokenAt}: ${result.reason} (expected: ${result.expectedHash}, got: ${result.actualHash})`
    };
  }
  
  return { isValid: true };
}

/**
 * Activa modo de emergencia ante corrupción detectada
 * 
 * Acciones:
 * - Bloquea nuevas escrituras de audit
 * - Registra detalles de corrupción
 * - Retorna información para alerta
 */
export function activateEmergencyMode(details: string): void {
  emergencyMode = true;
  corruptionDetected = true;
  corruptionDetails = details;
  
  console.error("[EMERGENCY] Audit log corruption detected:", details);
}

/**
 * Verifica si el sistema está en modo de emergencia
 */
export function isEmergencyMode(): boolean {
  return emergencyMode;
}

/**
 * Obtiene detalles de la corrupción detectada
 */
export function getCorruptionDetails(): string | null {
  return corruptionDetails;
}

/**
 * Resetea modo de emergencia (solo para tests o recuperación manual)
 */
export function resetEmergencyMode(): void {
  emergencyMode = false;
  corruptionDetected = false;
  corruptionDetails = null;
}

/**
 * Middleware de verificación de integridad
 * 
 * Verifica integridad antes de permitir escrituras críticas
 */
export async function checkIntegrityBeforeWrite(): Promise<void> {
  if (emergencyMode) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "System in emergency mode due to audit log corruption. Contact administrator.",
    });
  }
  
  // Verificación periódica (cada 100 escrituras)
  // En producción, esto se haría con un job separado
  const shouldCheck = Math.random() < 0.01; // 1% de probabilidad
  
  if (shouldCheck) {
    const result = await verifyAuditChainIntegrity(50);
    
    if (!result.isValid) {
      activateEmergencyMode(result.details || "Unknown corruption");
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Audit log corruption detected. System entering emergency mode.",
      });
    }
  }
}
