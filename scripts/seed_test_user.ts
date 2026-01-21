/**
 * Script de seed para crear usuario de prueba con sesiones sintéticas
 * 
 * Crea un usuario de prueba con credenciales conocidas y sesiones de ejemplo
 * para facilitar pruebas automatizadas sin comprometer datos reales.
 * 
 * Uso:
 *   pnpm exec tsx scripts/seed_test_user.ts [--reset]
 */

import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { users, sessions, messages, metrics } from "../drizzle/schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL no está configurada");
  process.exit(1);
}

// Configuración del usuario de prueba
const TEST_USER = {
  openId: "test_user_aresk_obs",
  name: "Usuario de Prueba ARESK-OBS",
  email: "test@aresk-obs.demo",
  loginMethod: "test",
  role: "user" as const
};

// Parsear argumentos
const args = process.argv.slice(2);
const reset = args.includes("--reset");

async function seedTestUser() {
  const db = drizzle(DATABASE_URL!);
  
  console.log("🌱 Iniciando seed de usuario de prueba...\n");
  
  try {
    // 1. Verificar si el usuario ya existe
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.openId, TEST_USER.openId));
    
    let testUser;
    
    if (existingUsers.length > 0) {
      testUser = existingUsers[0];
      console.log(`✓ Usuario de prueba ya existe (ID: ${testUser.id})`);
      
      if (reset) {
        console.log("🔄 Modo reset activado - eliminando sesiones antiguas...");
        
        // Obtener sesiones del usuario de prueba
        const testSessions = await db
          .select()
          .from(sessions)
          .where(eq(sessions.userId, testUser.id));
        
        // Eliminar datos relacionados
        for (const session of testSessions) {
          await db.delete(metrics).where(eq(metrics.sessionId, session.id));
          await db.delete(messages).where(eq(messages.sessionId, session.id));
          await db.delete(sessions).where(eq(sessions.id, session.id));
        }
        
        console.log(`  ✓ ${testSessions.length} sesiones eliminadas`);
      }
    } else {
      console.log("👤 Creando usuario de prueba...");
      
      const [insertedUser] = await db
        .insert(users)
        .values(TEST_USER)
        .$returningId();
      
      testUser = (await db
        .select()
        .from(users)
        .where(eq(users.id, insertedUser.id)))[0];
      
      console.log(`  ✓ Usuario creado (ID: ${testUser.id})`);
    }
    
    // 2. Crear sesiones de prueba
    console.log("\n📦 Creando sesiones de prueba...");
    
    const testSessions = [
      {
        userId: testUser.id,
        purpose: "Sesión de prueba - Régimen acoplado",
        limits: "No proporcionar diseños completos de sistemas críticos",
        ethics: "Priorizar precisión matemática y transparencia",
        plantProfile: "acoplada" as const,
        controlGain: 0.5,
        stabilityRadius: 0.3,
        alphaPenalty: 0.3,
        tprCurrent: 0,
        tprMax: 0,
        isTestData: true  // Marcar como datos de prueba
      },
      {
        userId: testUser.id,
        purpose: "Sesión de prueba - Alta entropía",
        limits: "Evitar especulación",
        ethics: "Mantener coherencia interna",
        plantProfile: "tipo_a" as const,
        controlGain: 0.3,
        stabilityRadius: 0.2,
        alphaPenalty: 0.5,
        tprCurrent: 0,
        tprMax: 0,
        isTestData: true  // Marcar como datos de prueba
      },
      {
        userId: testUser.id,
        purpose: "Sesión de prueba - Deriva natural",
        limits: "No generar contenido sensible",
        ethics: "Respetar límites operacionales",
        plantProfile: "tipo_b" as const,
        controlGain: 0.4,
        stabilityRadius: 0.25,
        alphaPenalty: 0.4,
        tprCurrent: 0,
        tprMax: 0,
        isTestData: true  // Marcar como datos de prueba
      }
    ];
    
    const createdSessions = [];
    
    for (const sessionData of testSessions) {
      const [insertedSession] = await db
        .insert(sessions)
        .values(sessionData)
        .$returningId();
      
      const session = (await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, insertedSession.id)))[0];
      
      createdSessions.push(session);
      console.log(`  ✓ Sesión #${session.id} (${session.plantProfile})`);
      
      // Crear mensajes de ejemplo
      const [firstMessage] = await db.insert(messages).values({
        sessionId: session.id,
        role: "user",
        content: "¿Qué es una función de Lyapunov?",
        plantProfile: session.plantProfile
      }).$returningId();
      
      const [secondMessage] = await db.insert(messages).values({
        sessionId: session.id,
        role: "assistant",
        content: "Una función de Lyapunov V(x) es una función escalar que mide la energía del sistema...",
        plantProfile: session.plantProfile
      }).$returningId();
      
      // Crear métricas de ejemplo (asociadas al segundo mensaje)
      await db.insert(metrics).values({
        sessionId: session.id,
        messageId: secondMessage.id,
        entropiaH: 0.5,
        coherenciaInternaC: 0.8,
        coherenciaObservable: 0.75,
        funcionLyapunov: 0.3,
        errorCognitivoMagnitud: 0.2,
        controlActionMagnitud: 0.1,
        timestamp: new Date()
      });
    }
    
    console.log("\n✅ Seed completado exitosamente");
    console.log("\n📋 Resumen:");
    console.log(`  - Usuario: ${testUser.name} (${testUser.email})`);
    console.log(`  - User ID: ${testUser.id}`);
    console.log(`  - OpenID: ${testUser.openId}`);
    console.log(`  - Sesiones creadas: ${createdSessions.length}`);
    console.log(`  - IDs de sesiones: ${createdSessions.map(s => s.id).join(", ")}`);
    console.log(`  - Todas las sesiones marcadas como isTestData: true`);
    
    console.log("\n🧪 Para usar en tests:");
    console.log(`  const TEST_USER_ID = ${testUser.id};`);
    console.log(`  const TEST_OPEN_ID = "${testUser.openId}";`);
    
  } catch (error) {
    console.error("❌ Error durante seed:", error);
    process.exit(1);
  }
}

seedTestUser();
