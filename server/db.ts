import { eq, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sessions, messages, metrics, timeMarkers, sessionAlerts, erosionAlerts, InsertSession, InsertMessage, InsertMetric, InsertTimeMarker, InsertSessionAlert, InsertErosionAlert } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Database] Failed to connect:", {
        message: errorMessage,
        url: process.env.DATABASE_URL?.substring(0, 20) + '...',
        timestamp: new Date().toISOString()
      });
      _db = null;
      throw new Error(`Database connection failed: ${errorMessage}`);
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

export async function getUserSessions(
  userId: number,
  options?: { limit?: number; offset?: number; orderBy?: 'asc' | 'desc' }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { limit = 50, offset = 0, orderBy = 'desc' } = options || {};
  
  // Construir query con ordenamiento y paginación
  const query = db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .orderBy(orderBy === 'desc' ? desc(sessions.createdAt) : asc(sessions.createdAt))
    .limit(limit)
    .offset(offset);
  
  return await query;
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

// ============================================
// TIME MARKERS
// ============================================

export async function createTimeMarker(marker: InsertTimeMarker) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(timeMarkers).values(marker);
  return result.insertId;
}

export async function getTimeMarkersBySession(sessionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(timeMarkers).where(eq(timeMarkers.sessionId, sessionId)).orderBy(timeMarkers.messageIndex);
}

export async function updateTimeMarker(id: number, updates: Partial<InsertTimeMarker>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(timeMarkers).set(updates).where(eq(timeMarkers.id, id));
}

export async function deleteTimeMarker(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(timeMarkers).where(eq(timeMarkers.id, id));
}

// ============================================
// SESSION ALERTS
// ============================================

export async function createSessionAlert(alert: InsertSessionAlert): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.insert(sessionAlerts).values(alert);
}

export async function getSessionAlerts(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sessionAlerts).where(eq(sessionAlerts.sessionId, sessionId));
}

export async function getUserAlerts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Join con sessions para filtrar por userId
  const userSessions = await getUserSessions(userId);
  const sessionIds = userSessions.map(s => s.id);
  
  if (sessionIds.length === 0) return [];
  
  const alerts = await db.select().from(sessionAlerts);
  return alerts.filter(alert => sessionIds.includes(alert.sessionId));
}

export async function dismissAlert(alertId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(sessionAlerts)
    .set({ dismissed: true })
    .where(eq(sessionAlerts.id, alertId));
}

/**
 * Detecta anomalías en una sesión y crea alertas automáticamente
 */
export async function detectAnomalies(sessionId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  const sessionMetrics = await getSessionMetrics(sessionId);
  const markers = await getTimeMarkersBySession(sessionId);
  
  if (sessionMetrics.length === 0) return;
  
  const alerts: InsertSessionAlert[] = [];
  
  // Calcular TPR
  const stableSteps = sessionMetrics.filter(m => m.coherenciaObservable > 0.7).length;
  const tprPercent = (stableSteps / sessionMetrics.length) * 100;
  
  // Alerta: TPR bajo (< 30%)
  if (tprPercent < 30) {
    alerts.push({
      sessionId,
      alertType: "low_tpr",
      severity: "critical",
      title: "TPR Críticamente Bajo",
      description: `El Tiempo de Permanencia en Régimen es de solo ${tprPercent.toFixed(1)}%, indicando inestabilidad severa en la coherencia observable.`,
      metricValue: tprPercent,
      dismissed: false,
    });
  }
  
  // Calcular promedio de V(e)
  const avgLyapunov = sessionMetrics.reduce((sum, m) => sum + m.funcionLyapunov, 0) / sessionMetrics.length;
  
  // Alerta: V(e) alto (> 0.5)
  if (avgLyapunov > 0.5) {
    alerts.push({
      sessionId,
      alertType: "high_lyapunov",
      severity: "warning",
      title: "Función de Lyapunov Elevada",
      description: `El promedio de V(e) es ${avgLyapunov.toFixed(4)}, superando el umbral de estabilidad (0.5). Indica divergencia semántica significativa.`,
      metricValue: avgLyapunov,
      dismissed: false,
    });
  }
  
  // Contar colapsos semánticos
  const collapseCount = markers.filter(m => m.markerType === "colapso_semantico").length;
  
  // Alerta: Colapsos frecuentes (>= 3)
  if (collapseCount >= 3) {
    alerts.push({
      sessionId,
      alertType: "frequent_collapses",
      severity: "critical",
      title: "Colapsos Semánticos Frecuentes",
      description: `Se detectaron ${collapseCount} colapsos semánticos durante la sesión, indicando pérdida recurrente de coherencia interna.`,
      metricValue: collapseCount,
      dismissed: false,
    });
  }
  
  // Calcular variabilidad de Ω(t)
  const omegaValues = sessionMetrics.map(m => m.coherenciaObservable);
  const avgOmega = omegaValues.reduce((a, b) => a + b, 0) / omegaValues.length;
  const variance = omegaValues.reduce((sum, val) => sum + Math.pow(val - avgOmega, 2), 0) / omegaValues.length;
  const stdDev = Math.sqrt(variance);
  
  // Alerta: Ω(t) inestable (desviación estándar > 0.3)
  if (stdDev > 0.3) {
    alerts.push({
      sessionId,
      alertType: "unstable_omega",
      severity: "warning",
      title: "Coherencia Observable Inestable",
      description: `La desviación estándar de Ω(t) es ${stdDev.toFixed(4)}, indicando fluctuaciones significativas en la coherencia observable.`,
      metricValue: stdDev,
      dismissed: false,
    });
  }
  
  // Insertar todas las alertas
  for (const alert of alerts) {
    await createSessionAlert(alert);
  }
}


// EROSION ALERTS
// ============================================

export async function createErosionAlert(alert: InsertErosionAlert): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(erosionAlerts).values(alert);
  return result[0].insertId;
}

export async function getActiveErosionAlerts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(erosionAlerts)
    .where(eq(erosionAlerts.userId, userId))
    .orderBy(erosionAlerts.detectedAt);
}

export async function dismissErosionAlert(alertId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(erosionAlerts).set({ dismissed: true }).where(eq(erosionAlerts.id, alertId));
}

export async function markErosionAlertNotified(alertId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(erosionAlerts).set({ notified: true }).where(eq(erosionAlerts.id, alertId));
}

/**
 * Verifica si ya existe una alerta similar en las últimas 24 horas
 * para evitar alertas duplicadas
 */
export async function hasRecentErosionAlert(userId: number, alertType: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const recentAlerts = await db.select()
    .from(erosionAlerts)
    .where(eq(erosionAlerts.userId, userId));
  
  return recentAlerts.some(alert => 
    alert.alertType === alertType && 
    new Date(alert.detectedAt) > oneDayAgo
  );
}
