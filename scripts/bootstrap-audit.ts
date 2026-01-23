/**
 * scripts/bootstrap-audit.ts
 * 
 * Script de bootstrap manual para sistema de auditoría
 * 
 * Uso:
 *   pnpm tsx scripts/bootstrap-audit.ts
 * 
 * Este script:
 * 1. Verifica si el génesis existe
 * 2. Crea el bloque génesis si no existe
 * 3. Valida la integridad de la cadena
 * 4. Reporta el estado del sistema
 */

import { bootstrapAuditSystem, genesisExists, getGenesisHash, isAuditSystemBootstrapped } from "../server/infra/auditBootstrap";
import { verifyAuditChainIntegrity } from "../server/infra/emergency";

async function main() {
  console.log("=".repeat(60));
  console.log("ARESK-OBS Audit System Bootstrap");
  console.log("=".repeat(60));
  console.log();

  try {
    // 1. Verificar estado actual
    console.log("📊 Checking current status...");
    const exists = await genesisExists();
    
    if (exists) {
      console.log("✅ Genesis block already exists");
      const genesisHash = await getGenesisHash();
      console.log("   Hash:", genesisHash);
    } else {
      console.log("⚠️  Genesis block does not exist");
    }
    console.log();

    // 2. Bootstrap del sistema
    console.log("🚀 Bootstrapping audit system...");
    await bootstrapAuditSystem();
    console.log();

    // 3. Verificar bootstrap
    console.log("🔍 Verifying bootstrap...");
    const isBootstrapped = await isAuditSystemBootstrapped();
    
    if (isBootstrapped) {
      console.log("✅ Audit system is correctly bootstrapped");
    } else {
      console.log("❌ Audit system bootstrap failed");
      process.exit(1);
    }
    console.log();

    // 4. Validar integridad de la cadena
    console.log("🔐 Validating chain integrity...");
    const integrityResult = await verifyAuditChainIntegrity(1000);
    
    if (integrityResult.isValid) {
      console.log("✅ Audit chain is valid");
    } else {
      console.log("❌ Audit chain is corrupted");
      console.log("   Details:", integrityResult.details);
      process.exit(1);
    }
    console.log();

    // 5. Resumen final
    console.log("=".repeat(60));
    console.log("✅ AUDIT SYSTEM READY");
    console.log("=".repeat(60));
    console.log();
    console.log("Genesis block:");
    const finalGenesisHash = await getGenesisHash();
    console.log("  Hash:", finalGenesisHash);
    console.log("  Timestamp: 2026-01-23T00:00:00.000Z");
    console.log();
    console.log("The audit system is now operational.");
    console.log("All future audit logs will be chained to this genesis block.");
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
