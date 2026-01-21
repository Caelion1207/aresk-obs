/**
 * server/db/validateSchema.ts
 * 
 * Validación de esquema de base de datos al inicio
 * 
 * Verifica:
 * - Existencia de tablas críticas
 * - Índices requeridos
 * - Integridad de audit chain
 */

import { getDb } from "../db";
import { verifyAuditChainIntegrity } from "../infra/emergency";
import { TRPCError } from "@trpc/server";

/**
 * Tablas críticas que deben existir
 */
const REQUIRED_TABLES = [
  "users",
  "sessions",
  "messages",
  "metrics",
  "profiles",
  "auditLogs",
];

/**
 * Índices críticos que deben existir
 * Formato: { table: string, index: string }
 */
const REQUIRED_INDEXES = [
  { table: "sessions", index: "idx_sessions_userId" },
  { table: "auditLogs", index: "idx_audit_user_timestamp" },
  { table: "auditLogs", index: "idx_audit_hash" },
  { table: "auditLogs", index: "idx_audit_timestamp" },
];

/**
 * Verifica existencia de tablas críticas
 */
async function verifyTables(): Promise<{ success: boolean; missing: string[] }> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available for schema validation",
    });
  }
  
  const missing: string[] = [];
  
  for (const table of REQUIRED_TABLES) {
    try {
      // Intentar query simple para verificar existencia
      await db.execute(`SELECT 1 FROM \`${table}\` LIMIT 1`);
    } catch (error: any) {
      if (error.message?.includes("doesn't exist")) {
        missing.push(table);
      }
    }
  }
  
  return {
    success: missing.length === 0,
    missing,
  };
}

/**
 * Verifica existencia de índices críticos
 */
async function verifyIndexes(): Promise<{ success: boolean; missing: Array<{ table: string; index: string }> }> {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available for index validation",
    });
  }
  
  const missing: Array<{ table: string; index: string }> = [];
  
  for (const { table, index } of REQUIRED_INDEXES) {
    try {
      // Query para verificar existencia de índice
      const result = await db.execute(
        `SHOW INDEX FROM \`${table}\` WHERE Key_name = '${index}'`
      );
      
      // Verificar si el resultado está vacío
      const rows = Array.isArray(result) ? result : (result as any).rows || [];
      if (rows.length === 0) {
        missing.push({ table, index });
      }
    } catch (error: any) {
      console.error(`Error checking index ${index} on ${table}:`, error.message);
      missing.push({ table, index });
    }
  }
  
  return {
    success: missing.length === 0,
    missing,
  };
}

/**
 * Valida esquema completo al inicio
 * 
 * @throws TRPCError si la validación falla
 */
export async function validateSchemaOnStartup(): Promise<void> {
  console.log("[STARTUP] Validating database schema...");
  
  // 1. Verificar tablas
  const tablesResult = await verifyTables();
  if (!tablesResult.success) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required tables: ${tablesResult.missing.join(", ")}. Run migrations first.`,
    });
  }
  console.log("[STARTUP] ✓ All required tables exist");
  
  // 2. Verificar índices
  const indexesResult = await verifyIndexes();
  if (!indexesResult.success) {
    const missingList = indexesResult.missing.map(m => `${m.table}.${m.index}`).join(", ");
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Missing required indexes: ${missingList}. Run migrations first.`,
    });
  }
  console.log("[STARTUP] ✓ All required indexes exist");
  
  // 3. Verificar integridad de audit chain
  console.log("[STARTUP] Verifying audit chain integrity...");
  const integrityResult = await verifyAuditChainIntegrity(100);
  
  if (!integrityResult.isValid) {
    console.error("[STARTUP] ✗ Audit chain corruption detected:", integrityResult.details);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `Audit chain corruption detected: ${integrityResult.details}. Manual intervention required.`,
    });
  }
  console.log("[STARTUP] ✓ Audit chain integrity verified");
  
  console.log("[STARTUP] Schema validation complete");
}

/**
 * Valida esquema sin lanzar error (para health checks)
 */
export async function checkSchemaHealth(): Promise<{
  healthy: boolean;
  tables: { success: boolean; missing: string[] };
  indexes: { success: boolean; missing: Array<{ table: string; index: string }> };
  auditChain: { isValid: boolean; details?: string };
}> {
  try {
    const tables = await verifyTables();
    const indexes = await verifyIndexes();
    const auditChain = await verifyAuditChainIntegrity(50);
    
    return {
      healthy: tables.success && indexes.success && auditChain.isValid,
      tables,
      indexes,
      auditChain,
    };
  } catch (error: any) {
    return {
      healthy: false,
      tables: { success: false, missing: [] },
      indexes: { success: false, missing: [] },
      auditChain: { isValid: false, details: error.message },
    };
  }
}
