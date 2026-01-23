/**
 * scripts/reset-audit-genesis.ts
 * 
 * Script para resetear la tabla de auditoría y crear un génesis limpio
 * 
 * ADVERTENCIA: Este script elimina TODOS los logs de auditoría existentes.
 * Solo debe usarse para corregir problemas de bootstrap.
 * 
 * Uso:
 *   pnpm tsx scripts/reset-audit-genesis.ts
 */

import { getDb } from "../server/db";
import { auditLogs } from "../drizzle/auditLogs";
import { bootstrapAuditSystem } from "../server/infra/auditBootstrap";
import { verifyAuditChainIntegrity } from "../server/infra/emergency";
import { sql } from "drizzle-orm";

async function main() {
  console.log("=".repeat(60));
  console.log("⚠️  AUDIT SYSTEM RESET");
  console.log("=".repeat(60));
  console.log();
  console.log("This script will:");
  console.log("  1. DELETE all existing audit logs");
  console.log("  2. Create a fresh genesis block");
  console.log("  3. Verify chain integrity");
  console.log();
  console.log("⚠️  WARNING: This action cannot be undone!");
  console.log();

  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // 1. Eliminar todos los logs existentes
    console.log("🗑️  Deleting all existing audit logs...");
    await db.delete(auditLogs);
    console.log("✅ Audit logs deleted");
    console.log();

    // 2. Crear génesis limpio
    console.log("🌱 Creating fresh genesis block...");
    await bootstrapAuditSystem();
    console.log();

    // 3. Verificar integridad
    console.log("🔍 Verifying chain integrity...");
    const result = await verifyAuditChainIntegrity(1000);
    
    if (result.isValid) {
      console.log("✅ Chain integrity verified");
    } else {
      console.log("❌ Chain integrity check failed");
      console.log("   Details:", result.details);
      process.exit(1);
    }
    console.log();

    // 4. Resumen
    console.log("=".repeat(60));
    console.log("✅ AUDIT SYSTEM RESET COMPLETE");
    console.log("=".repeat(60));
    console.log();
    console.log("The audit system has been reset with a fresh genesis block.");
    console.log("All future audit logs will be chained to this new genesis.");
    console.log();

  } catch (error: any) {
    console.error();
    console.error("❌ ERROR:", error.message);
    console.error();
    console.error("Stack trace:");
    console.error(error.stack);
    process.exit(1);
  }
}

main();
