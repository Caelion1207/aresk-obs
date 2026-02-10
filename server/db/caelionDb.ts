import { eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import { caelionSessions, caelionInteractions, InsertCaelionSession, InsertCaelionInteraction } from "../../drizzle/schema";

// ============================================
// CAELION Sessions
// ============================================

export async function createCaelionSession(data: InsertCaelionSession) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [session] = await db.insert(caelionSessions).values(data);
  return session;
}

export async function getCaelionSession(sessionId: string) {
  const db = await getDb();
  if (!db) return null;
  const [session] = await db
    .select()
    .from(caelionSessions)
    .where(eq(caelionSessions.sessionId, sessionId));
  return session;
}

export async function getAllCaelionSessions(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(caelionSessions).orderBy(desc(caelionSessions.startedAt));
  
  if (userId) {
    query = query.where(eq(caelionSessions.userId, userId)) as any;
  }
  
  return await query;
}

export async function updateCaelionSession(
  sessionId: string,
  data: Partial<InsertCaelionSession>
) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(caelionSessions)
    .set(data)
    .where(eq(caelionSessions.sessionId, sessionId));
}

export async function completeCaelionSession(sessionId: string) {
  const db = await getDb();
  if (!db) return;
  
  // Calcular promedios de métricas
  const interactions = await getCaelionInteractions(sessionId);
  
  if (interactions.length === 0) {
    return;
  }
  
  const avgOmega = interactions.reduce((sum, i) => sum + i.omegaSem, 0) / interactions.length;
  const avgV = interactions.reduce((sum, i) => sum + i.vLyapunov, 0) / interactions.length;
  const avgRLD = interactions.reduce((sum, i) => sum + i.rld, 0) / interactions.length;
  const interventionCount = interactions.filter(i => i.caelionIntervention).length;
  
  await db
    .update(caelionSessions)
    .set({
      status: 'completed',
      completedAt: new Date(),
      totalInteractions: interactions.length,
      avgOmega,
      avgV,
      avgRLD,
      interventionCount
    })
    .where(eq(caelionSessions.sessionId, sessionId));
}

// ============================================
// CAELION Interactions
// ============================================

export async function createCaelionInteraction(data: InsertCaelionInteraction) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const [interaction] = await db.insert(caelionInteractions).values(data);
  return interaction;
}

export async function getCaelionInteractions(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(caelionInteractions)
    .where(eq(caelionInteractions.sessionId, sessionId))
    .orderBy(caelionInteractions.interactionNumber);
}

export async function getCaelionInteractionCount(sessionId: string) {
  const db = await getDb();
  if (!db) return 0;
  const interactions = await db
    .select()
    .from(caelionInteractions)
    .where(eq(caelionInteractions.sessionId, sessionId));
  return interactions.length;
}
