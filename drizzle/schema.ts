import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabla de sesiones de simulación ARESK-OBS
 * Almacena las configuraciones de referencia ontológica para cada sesión
 */
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  purpose: text("purpose").notNull(),
  limits: text("limits").notNull(),
  ethics: text("ethics").notNull(),
  plantProfile: mysqlEnum("plantProfile", ["tipo_a", "tipo_b", "acoplada"]).notNull(),
  controlGain: float("controlGain").default(0.5).notNull(),
  stabilityRadius: float("stabilityRadius").default(0.3).notNull(), // Radio ε del conjunto de estabilidad admisible
  tprCurrent: int("tprCurrent").default(0).notNull(), // Tiempo de Permanencia en Régimen actual (en turnos)
  tprMax: int("tprMax").default(0).notNull(), // TPR máximo alcanzado en la sesión
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

/**
 * Perfiles Dinámicos de Planta:
 * - tipo_a: Alta Entropía / Bajo Control (planta estocástica sin gobierno)
 * - tipo_b: Ruido Estocástico Moderado / Sin Referencia (deriva natural)
 * - acoplada: Régimen CAELION (ganancia Licurgo + referencia Bucéfalo)
 */

/**
 * Tabla de mensajes de conversación
 * Almacena cada turno de la conversación con el LLM
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  plantProfile: mysqlEnum("plantProfile", ["tipo_a", "tipo_b", "acoplada"]),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Tabla de métricas de control semántico
 * Almacena las mediciones de cada estado semántico
 */
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  messageId: int("messageId").notNull(),
  coherenciaObservable: float("coherenciaObservable").notNull(),
  funcionLyapunov: float("funcionLyapunov").notNull(),
  errorCognitivoMagnitud: float("errorCognitivoMagnitud").notNull(),
  controlActionMagnitud: float("controlActionMagnitud").notNull(),
  entropiaH: float("entropiaH").notNull(),
  coherenciaInternaC: float("coherenciaInternaC").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

/**
 * Tabla de marcadores temporales
 * Permite a los usuarios anotar momentos específicos durante la reproducción de sesiones
 */
export const timeMarkers = mysqlTable("timeMarkers", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  messageIndex: int("messageIndex").notNull(), // Índice del mensaje en la secuencia (0-based)
  markerType: mysqlEnum("markerType", ["colapso_semantico", "recuperacion", "transicion", "observacion"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimeMarker = typeof timeMarkers.$inferSelect;
export type InsertTimeMarker = typeof timeMarkers.$inferInsert;

/**
 * Tabla de alertas de anomalías en sesiones
 * Detecta automáticamente sesiones con rendimiento anómalo
 */
export const sessionAlerts = mysqlTable("sessionAlerts", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: int("sessionId").notNull(),
  alertType: mysqlEnum("alertType", ["low_tpr", "high_lyapunov", "frequent_collapses", "unstable_omega"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "warning", "info"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  metricValue: float("metricValue"), // Valor de la métrica que disparó la alerta
  dismissed: boolean("dismissed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionAlert = typeof sessionAlerts.$inferSelect;
export type InsertSessionAlert = typeof sessionAlerts.$inferInsert;
