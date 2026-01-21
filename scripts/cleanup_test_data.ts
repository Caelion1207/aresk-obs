#!/usr/bin/env tsx
/**
 * Script de limpieza automática de datos de prueba
 * 
 * Elimina sesiones y datos relacionados marcados como prueba o antiguos
 * 
 * Uso:
 *   pnpm exec tsx scripts/cleanup_test_data.ts [--dry-run] [--days=30]
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq, lt, and, or } from "drizzle-orm";
import { sessions, messages, metrics, timeMarkers } from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está configurada");
  process.exit(1);
}

// Parsear argumentos
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const daysArg = args.find(arg => arg.startsWith("--days="));
const daysOld = daysArg ? parseInt(daysArg.split("=")[1]) : 30;

async function cleanupTestData() {
  const db = drizzle(DATABASE_URL!);
  
  console.log("🧹 Iniciando limpieza de datos de prueba...\n");
  console.log(`Configuración:`);
  console.log(`  - Modo: ${dryRun ? "DRY RUN (sin cambios)" : "EJECUCIÓN REAL"}`);
  console.log(`  - Días de antigüedad: ${daysOld}`);
  console.log("");

  try {
    // Calcular fecha límite
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    console.log(`📅 Fecha límite: ${cutoffDate.toISOString()}\n`);

    // 1. Identificar sesiones de prueba (usando campo isTestData)
    const testSessions = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.isTestData, true),
          lt(sessions.createdAt, cutoffDate)
        )
      );

    console.log(`🔍 Sesiones de prueba encontradas: ${testSessions.length}`);
    
    if (testSessions.length === 0) {
      console.log("✅ No hay sesiones de prueba para limpiar");
      return;
    }

    // Mostrar detalles
    testSessions.forEach(session => {
      console.log(`  - Sesión #${session.id} (${session.plantProfile}) - ${session.createdAt.toISOString()}`);
    });
    console.log("");

    const sessionIds = testSessions.map(s => s.id);

    // 2. Contar datos relacionados
    const messageCount = await db
      .select()
      .from(messages)
      .where(eq(messages.sessionId, sessionIds[0])); // Simplificado para ejemplo
    
    const metricCount = await db
      .select()
      .from(metrics)
      .where(eq(metrics.sessionId, sessionIds[0]));
    
    const markerCount = await db
      .select()
      .from(timeMarkers)
      .where(eq(timeMarkers.sessionId, sessionIds[0]));

    console.log(`📊 Datos relacionados a eliminar:`);
    console.log(`  - Mensajes: ~${messageCount.length * testSessions.length}`);
    console.log(`  - Métricas: ~${metricCount.length * testSessions.length}`);
    console.log(`  - Marcadores: ~${markerCount.length * testSessions.length}`);
    console.log("");

    if (dryRun) {
      console.log("🔒 DRY RUN: No se realizarán cambios");
      console.log("   Ejecuta sin --dry-run para aplicar la limpieza");
      return;
    }

    // 3. Eliminar datos relacionados (en orden inverso de dependencias)
    console.log("🗑️  Eliminando datos relacionados...");
    
    for (const sessionId of sessionIds) {
      await db.delete(timeMarkers).where(eq(timeMarkers.sessionId, sessionId));
      await db.delete(metrics).where(eq(metrics.sessionId, sessionId));
      await db.delete(messages).where(eq(messages.sessionId, sessionId));
    }
    
    console.log("   ✓ Datos relacionados eliminados");

    // 4. Eliminar sesiones
    console.log("🗑️  Eliminando sesiones de prueba...");
    
    for (const sessionId of sessionIds) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    
    console.log("   ✓ Sesiones eliminadas");

    console.log("");
    console.log(`✅ Limpieza completada exitosamente`);
    console.log(`   - ${testSessions.length} sesiones eliminadas`);
    console.log(`   - Datos relacionados limpiados`);

  } catch (error) {
    console.error("❌ Error durante la limpieza:", error);
    process.exit(1);
  }
}

cleanupTestData()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
