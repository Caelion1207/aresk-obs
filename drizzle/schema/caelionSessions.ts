import { mysqlTable, int, text, timestamp, float, boolean, varchar, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Tabla de sesiones CAELION
 * Almacena metadatos de cada sesión de chat bajo gobernanza CAELION
 */
export const caelionSessions = mysqlTable("caelionSessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull().unique(),
  userId: int("userId"),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  totalInteractions: int("totalInteractions").default(0).notNull(),
  avgOmega: float("avgOmega"),
  avgV: float("avgV"),
  avgRLD: float("avgRLD"),
  interventionCount: int("interventionCount").default(0).notNull(),
  status: mysqlEnum("status", ["active", "completed", "abandoned"]).default("active").notNull(),
  notes: text("notes"),
});

export type CaelionSession = typeof caelionSessions.$inferSelect;
export type InsertCaelionSession = typeof caelionSessions.$inferInsert;

/**
 * Tabla de interacciones CAELION
 * Almacena cada mensaje y sus métricas asociadas
 */
export const caelionInteractions = mysqlTable("caelionInteractions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 128 }).notNull(),
  interactionNumber: int("interactionNumber").notNull(),
  userMessage: text("userMessage").notNull(),
  assistantResponse: text("assistantResponse").notNull(),
  omegaSem: float("omegaSem").notNull(),
  hDiv: float("hDiv").notNull(),
  vLyapunov: float("vLyapunov").notNull(),
  epsilonEff: float("epsilonEff").notNull(),
  rld: float("rld").notNull(),
  caelionIntervention: boolean("caelionIntervention").default(false).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type CaelionInteraction = typeof caelionInteractions.$inferSelect;
export type InsertCaelionInteraction = typeof caelionInteractions.$inferInsert;
