/**
 * scripts/test_failclosed_manual.ts
 * 
 * Test manual de fail-closed: genera tráfico real a procedimientos con rate limiting
 * para verificar que el sistema rechaza requests cuando Redis falla en staging/production
 */

import { TEST_USER } from "../server/test-helpers/auth.js";

async function testFailClosed() {
  console.log("🧪 Test Manual de Fail-Closed");
  console.log("================================\n");
  
  console.log("📍 NODE_ENV:", process.env.NODE_ENV);
  console.log("🔴 REDIS_URL:", process.env.REDIS_URL);
  console.log("");
  
  try {
    // 1. Importar tRPC router
    console.log("1️⃣ Importando tRPC router...");
    const { appRouter } = await import("../server/routers.js");
    const { createCallerFactory } = await import("@trpc/server");
    console.log("   ✅ Router importado\n");
    
    // 2. Crear caller con contexto autenticado
    console.log("2️⃣ Creando caller autenticado...");
    const createCaller = createCallerFactory(appRouter);
    const caller = createCaller({
      user: {
        id: TEST_USER.id,
        openId: TEST_USER.openId,
        name: TEST_USER.name,
        email: TEST_USER.email,
        loginMethod: TEST_USER.loginMethod,
        role: TEST_USER.role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });
    console.log("   ✅ Caller creado\n");
    
    // 3. Intentar llamar a procedimiento con rate limiting
    console.log("3️⃣ Llamando a session.list (con rate limiting)...");
    console.log("   ⏳ Esperando respuesta...\n");
    
    try {
      const sessions = await caller.session.list();
      console.log("   ❌ FALLO: Request NO fue rechazada");
      console.log(`   📊 Sesiones retornadas: ${sessions.length}`);
      console.log("   ⚠️  Esto indica que fallback en memoria está activo o rate limiting no está aplicado\n");
    } catch (error: any) {
      if (error.code === "INTERNAL_SERVER_ERROR" && error.message && error.message.includes("Rate limiting service unavailable")) {
        console.log("   ✅ ÉXITO: Request rechazada correctamente (fail-closed)");
        console.log(`   📛 Error code: ${error.code}`);
        console.log(`   💬 Error message: ${error.message}\n`);
      } else {
        console.log("   ❓ Error inesperado:");
        console.log(`   📛 Error code: ${error.code || "N/A"}`);
        console.log(`   💬 Error message: ${error.message || error}\n`);
      }
    }
    
    // 4. Verificar health check
    console.log("4️⃣ Verificando health check de Redis...");
    try {
      // Health check requiere rol admin, crear caller admin
      const adminCaller = createCaller({
        user: {
          id: TEST_USER.id,
          openId: TEST_USER.openId,
          name: "Test Admin",
          email: TEST_USER.email,
          loginMethod: TEST_USER.loginMethod,
          role: "admin" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
      });
      
      const health = await adminCaller.admin.healthCheck();
      console.log(`   📊 Redis status: ${health.redis.status}`);
      console.log(`   📊 Total errors: ${health.redis.metrics.totalErrors}`);
      console.log(`   📊 Last error: ${health.redis.metrics.lastError || "N/A"}`);
      console.log(`   📊 Using fallback: ${health.redis.metrics.usingFallback}\n`);
      
      if (health.redis.status === "down" && health.redis.metrics.totalErrors > 0) {
        console.log("   ✅ Redis correctamente detectado como down\n");
      }
    } catch (error: any) {
      console.log(`   ⚠️  No se pudo obtener health check: ${error.message}\n`);
    }
    
  } catch (error: any) {
    console.error("❌ Error en test:", error.message);
    console.error(error.stack);
  }
  
  console.log("================================");
  console.log("✅ Test completado");
}

// Ejecutar test
testFailClosed().catch(console.error);
