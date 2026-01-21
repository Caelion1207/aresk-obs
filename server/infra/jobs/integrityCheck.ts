/**
 * server/infra/jobs/integrityCheck.ts
 * 
 * Job de verificación de integridad de audit logs
 * 
 * Ejecuta verificación horaria de la cadena de hash
 * Alerta al owner si detecta corrupción
 */

import cron from "node-cron";
import { verifyAuditChainIntegrity, activateEmergencyMode } from "../emergency";
import { notifyOwner } from "../../_core/notification";

/**
 * Job de verificación de integridad
 * 
 * Ejecuta cada hora (0 minutos de cada hora)
 */
export function startIntegrityCheckJob(): void {
  console.log("[INTEGRITY_JOB] Starting hourly integrity check job");
  
  // Cron: "0 * * * *" = cada hora en el minuto 0
  cron.schedule("0 * * * *", async () => {
    console.log("[INTEGRITY_JOB] Running integrity check...");
    
    try {
      // Verificar últimos 1000 logs
      const result = await verifyAuditChainIntegrity(1000);
      
      if (!result.isValid) {
        console.error("[INTEGRITY_JOB] Corruption detected:", result.details);
        
        // Activar modo de emergencia
        activateEmergencyMode(result.details || "Unknown corruption");
        
        // Alertar al owner
        await notifyOwner({
          title: "🚨 AUDIT LOG CORRUPTION DETECTED",
          content: `
**CRITICAL ALERT: Audit Chain Integrity Compromised**

**Details:**
${result.details}

**Corrupted Log ID:** ${result.corruptedLogId}

**Actions Taken:**
- System entered emergency mode
- Write operations blocked
- Manual intervention required

**Next Steps:**
1. Review audit logs in database
2. Investigate potential security breach
3. Restore from backup if necessary
4. Contact security team

**Timestamp:** ${new Date().toISOString()}
          `.trim(),
        });
        
        console.error("[INTEGRITY_JOB] Emergency mode activated, owner notified");
      } else {
        console.log("[INTEGRITY_JOB] Integrity check passed");
      }
    } catch (error: any) {
      console.error("[INTEGRITY_JOB] Error during integrity check:", error.message);
      
      // Alertar al owner sobre el error
      await notifyOwner({
        title: "⚠️ Integrity Check Failed",
        content: `
**WARNING: Integrity Check Job Failed**

**Error:** ${error.message}

**Timestamp:** ${new Date().toISOString()}

This may indicate a system issue. Please investigate.
        `.trim(),
      });
    }
  });
  
  console.log("[INTEGRITY_JOB] Job scheduled (runs every hour)");
}

/**
 * Job de verificación inmediata (para testing)
 */
export async function runIntegrityCheckNow(): Promise<{
  success: boolean;
  details?: string;
}> {
  console.log("[INTEGRITY_JOB] Running immediate integrity check...");
  
  try {
    const result = await verifyAuditChainIntegrity(1000);
    
    if (!result.isValid) {
      activateEmergencyMode(result.details || "Unknown corruption");
      
      await notifyOwner({
        title: "🚨 AUDIT LOG CORRUPTION DETECTED",
        content: `Corruption detected during manual check: ${result.details}`,
      });
      
      return {
        success: false,
        details: result.details,
      };
    }
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      details: error.message,
    };
  }
}
