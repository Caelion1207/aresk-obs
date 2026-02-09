import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, float } from "drizzle-orm/mysql-core";

// Export schema modules
export * from './schema/argosCosts';
export * from './schema/cycles';
export * from './schema/ethicalLogs';
export * from './schema/experiments';

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
  alphaPenalty: float("alphaPenalty").default(0.3).notNull(), // α: factor de penalización semántica para V_modificada
  tprCurrent: int("tprCurrent").default(0).notNull(), // Tiempo de Permanencia en Régimen actual (en turnos)
  tprMax: int("tprMax").default(0).notNull(), // TPR máximo alcanzado en la sesión
  isTestData: boolean("isTestData").default(false).notNull(), // Marca sesiones de prueba para limpieza automática
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
  funcionLyapunov: float("funcionLyapunov").notNull(), // V_base(e): métrica canónica normalizada [0,1]
  funcionLyapunovModificada: float("funcionLyapunovModificada").default(0).notNull(), // V_modificada = V_base - α×ε_eff
  errorCognitivoMagnitud: float("errorCognitivoMagnitud").notNull(),
  controlActionMagnitud: float("controlActionMagnitud").notNull(),
  entropiaH: float("entropiaH").notNull(),
  coherenciaInternaC: float("coherenciaInternaC").notNull(),
  signoSemantico: float("signoSemantico").default(0).notNull(), // σ_sem: +1 (acrección), 0 (neutro), -1 (drenaje)
  campoEfectivo: float("campoEfectivo").default(0).notNull(), // ε_eff = Ω(t) × σ_sem(t)
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

/**
 * Tabla de alertas de tendencia de erosión
 * Detecta automáticamente cuando la tendencia de erosión supera umbrales críticos
 */
export const erosionAlerts = mysqlTable("erosionAlerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  alertType: mysqlEnum("alertType", ["critical_trend", "high_erosion_period", "sustained_drainage"]).notNull(),
  severity: mysqlEnum("severity", ["critical", "high", "moderate"]).notNull(),
  trendChange: float("trendChange").notNull(), // Cambio porcentual de tendencia (0.0 - 1.0)
  message: text("message").notNull(),
  notified: boolean("notified").default(false).notNull(), // Si se envió notificación al propietario
  dismissed: boolean("dismissed").default(false).notNull(),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
});

export type ErosionAlert = typeof erosionAlerts.$inferSelect;
export type InsertErosionAlert = typeof erosionAlerts.$inferInsert;

// Exportar auditLogs desde archivo separado
export { auditLogs, type AuditLog, type InsertAuditLog } from "./auditLogs";

// Exportar auditLogs legacy (dev-corrupted) desde archivo separado
export { auditLogsDevCorrupted, type AuditLogLegacy } from "./auditLogsLegacy";

// Exportar protocolEvents desde archivo separado
export { protocolEvents, type ProtocolEvent, type InsertProtocolEvent } from "./schema/protocolEvents";
