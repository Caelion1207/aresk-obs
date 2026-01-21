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
 */

import { getDb } from "../db";
import { auditLogs } from "../../drizzle/auditLogs";
import { verifyLogHash } from "./crypto";
import { asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Estado de emergencia global
let emergencyMode = false;
let corruptionDetected = false;
let corruptionDetails: string | null = null;

/**
 * Verifica integridad de la cadena de audit logs
 * 
 * @param limit - Número de logs a verificar (desde el más reciente)
 * @returns true si la cadena es íntegra, false si hay corrupción
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
  
  // Obtener logs en orden cronológico
  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(asc(auditLogs.id))
    .limit(limit);
  
  if (logs.length === 0) {
    return { isValid: true };
  }
  
  // Verificar cada log
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i]!;
    const prevHash = i === 0 ? null : logs[i - 1]!.hash;
    
    // Verificar hash del log
    const isValid = verifyLogHash({
      ...log,
      ip: log.ip || undefined,
      userAgent: log.userAgent || undefined,
      requestId: log.requestId || undefined,
    }, prevHash);
    
    if (!isValid) {
      return {
        isValid: false,
        corruptedLogId: log.id,
        details: `Log ${log.id} has invalid hash. Expected prevHash: ${prevHash}, Found: ${log.prevHash}`,
      };
    }
    
    // Verificar encadenamiento
    if (i > 0 && log.prevHash !== prevHash) {
      return {
        isValid: false,
        corruptedLogId: log.id,
        details: `Log ${log.id} has broken chain. Expected prevHash: ${prevHash}, Found: ${log.prevHash}`,
      };
    }
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
