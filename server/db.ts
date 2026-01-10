import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sessions, messages, metrics, InsertSession, InsertMessage, InsertMetric } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================
// ARESK-OBS: Funciones de sesiones y métricas
// ============================================

export async function createSession(session: InsertSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(sessions).values(session);
  return result[0].insertId;
}

export async function getSession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSessions(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(sessions).where(eq(sessions.userId, userId));
}

export async function updateSessionMode(sessionId: number, plantProfile: "tipo_a" | "tipo_b" | "acoplada") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(sessions).set({ plantProfile }).where(eq(sessions.id, sessionId));
}

export async function updateTPR(sessionId: number, errorMagnitud: number, stabilityRadius: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Obtener la sesión actual
  const sessionResult = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
  if (sessionResult.length === 0) throw new Error("Session not found");
  
  const session = sessionResult[0];
  
  // Verificar si el sistema está dentro del conjunto de estabilidad admisible
  const isStable = errorMagnitud <= stabilityRadius;
  
  if (isStable) {
    // Incrementar TPR actual
    const newTprCurrent = session.tprCurrent + 1;
    const newTprMax = Math.max(newTprCurrent, session.tprMax);
    
    await db.update(sessions)
      .set({ 
        tprCurrent: newTprCurrent,
        tprMax: newTprMax
      })
      .where(eq(sessions.id, sessionId));
  } else {
    // Resetear TPR actual (el sistema salió del régimen)
    await db.update(sessions)
      .set({ tprCurrent: 0 })
      .where(eq(sessions.id, sessionId));
  }
}

export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(message);
  return result[0].insertId;
}

export async function getSessionMessages(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(messages).where(eq(messages.sessionId, sessionId));
}

export async function createMetric(metric: InsertMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(metrics).values(metric);
}

export async function getSessionMetrics(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(metrics).where(eq(metrics.sessionId, sessionId));
}
