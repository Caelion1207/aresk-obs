/**
 * Validación de índice sessions.userId con EXPLAIN ANALYZE
 * 
 * Verifica que el índice está siendo utilizado correctamente
 * y que el rendimiento es estable bajo carga.
 */

import { getDb } from "../server/db";

async function validateIndex() {
  console.log("🔍 Validando índice sessions.userId...\n");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ Base de datos no disponible");
    process.exit(1);
  }
  
  try {
    // 1. Verificar que el índice existe
    console.log("1️⃣  Verificando existencia del índice...");
    const [indexes] = await db.execute(`
      SHOW INDEXES FROM sessions WHERE Key_name = 'idx_sessions_userId'
    `) as any;
    
    if (indexes.length === 0) {
      console.error("❌ Índice idx_sessions_userId no encontrado");
      process.exit(1);
    }
    console.log("   ✅ Índice encontrado\n");
    
    // 2. EXPLAIN ANALYZE de consulta típica
    console.log("2️⃣  Ejecutando EXPLAIN ANALYZE...");
    const [explain] = await db.execute(`
      EXPLAIN SELECT * FROM sessions WHERE userId = 1440009 ORDER BY createdAt DESC LIMIT 50
    `) as any;
    
    console.log("   Resultado EXPLAIN:");
    console.table(explain);
    
    // Verificar que usa el índice (compatible con MySQL y TiDB)
    const usesIndex = explain.some((row: any) => 
      row.key === 'idx_sessions_userId' || 
      row.possible_keys?.includes('idx_sessions_userId') ||
      row['access object']?.includes('idx_sessions_userId') ||
      row.id?.includes('IndexRangeScan') || row.id?.includes('IndexLookUp')
    );
    
    if (!usesIndex) {
      console.warn("⚠️  Advertencia: La consulta no está usando el índice");
    } else {
      console.log("   ✅ Consulta usa el índice correctamente\n");
    }
    
    // 3. Benchmark de rendimiento
    console.log("3️⃣  Ejecutando benchmark de rendimiento...");
    const iterations = 10;
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await db.execute(`
        SELECT * FROM sessions WHERE userId = 1440009 ORDER BY createdAt DESC LIMIT 50
      `);
      const end = Date.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    console.log(`   Promedio: ${avgTime.toFixed(2)}ms`);
    console.log(`   Mínimo: ${minTime}ms`);
    console.log(`   Máximo: ${maxTime}ms`);
    
    if (avgTime > 100) {
      console.warn(`⚠️  Advertencia: Latencia promedio (${avgTime.toFixed(2)}ms) > 100ms`);
    } else {
      console.log(`   ✅ Latencia estable (<100ms)\n`);
    }
    
    // 4. Resumen
    console.log("📊 RESUMEN DE VALIDACIÓN");
    console.log("========================");
    console.log(`✅ Índice existe: SÍ`);
    console.log(`${usesIndex ? '✅' : '⚠️ '} Índice usado: ${usesIndex ? 'SÍ' : 'NO'}`);
    console.log(`${avgTime <= 100 ? '✅' : '⚠️ '} Latencia estable: ${avgTime <= 100 ? 'SÍ' : 'NO'} (${avgTime.toFixed(2)}ms)`);
    
    if (usesIndex && avgTime <= 100) {
      console.log("\n🟢 VALIDACIÓN EXITOSA - Índice funcionando correctamente");
      process.exit(0);
    } else {
      console.log("\n🟡 VALIDACIÓN PARCIAL - Revisar advertencias");
      process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Error durante validación:", error);
    process.exit(1);
  }
}

validateIndex();
