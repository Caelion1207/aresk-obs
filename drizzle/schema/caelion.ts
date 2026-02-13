import { mysqlTable, int, varchar, text, timestamp, float, boolean, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * CAELION - Arquitectura Constitucional
 * 
 * Tablas para gobernanza multi-módulo:
 * - uadm_decrees: Decretos operativos (fundacionales + configurables)
 * - wabun_memory: Memoria append-only con hash chain
 * - system_state: Estado actual del sistema (V, RLD, SIV, mode)
 */

/**
 * U_adm: Decretos Operativos
 * 
 * Separación obligatoria:
 * - Inmutables (type='immutable'): No editables en runtime
 * - Configurables (type='configurable'): Modificables con trazabilidad
 */
export const uadmDecrees = mysqlTable("uadm_decrees", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Tipo de decreto: inmutable (fundacional) o configurable */
  type: mysqlEnum("type", ["immutable", "configurable"]).notNull(),
  
  /** Identificador único del decreto (ej: "NO_BYPASS_ORCHESTRATOR") */
  decreeId: varchar("decree_id", { length: 128 }).notNull().unique(),
  
  /** Descripción del decreto */
  description: text("description").notNull(),
  
  /** Umbral o valor del decreto (JSON) */
  threshold: text("threshold").notNull(),
  
  /** Estado del decreto: activo o suspendido */
  status: mysqlEnum("status", ["active", "suspended"]).default("active").notNull(),
  
  /** Razón de la última modificación (solo para configurables) */
  modificationReason: text("modification_reason"),
  
  /** Usuario que modificó (solo para configurables) */
  modifiedBy: int("modified_by"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type UadmDecree = typeof uadmDecrees.$inferSelect;
export type InsertUadmDecree = typeof uadmDecrees.$inferInsert;

/**
 * Wabun: Memoria Append-Only
 * 
 * Registra:
 * - Plan (Liang)
 * - Evaluación (Argos)
 * - Validación (Hécate)
 * - Resultado (Bucéfalo)
 * - Métricas (Ω, V, RLD, SIV)
 * - Eventos constitucionales
 * 
 * Nunca borra. Solo append.
 * Hash chain interno para integridad.
 */
export const wabunMemory = mysqlTable("wabun_memory", {
  id: int("id").autoincrement().primaryKey(),
  
  /** Hash del registro anterior (para chain integrity) */
  previousHash: varchar("previous_hash", { length: 64 }),
  
  /** Hash de este registro */
  currentHash: varchar("current_hash", { length: 64 }).notNull(),
  
  /** Tipo de evento */
  eventType: mysqlEnum("event_type", [
    "plan_generated",
    "argos_evaluation",
    "hecate_validation",
    "execution_result",
    "metrics_update",
    "constitutional_event",
    "mode_change",
    "decree_modification",
    "founder_authentication",
    "lockdown_triggered"
  ]).notNull(),
  
  /** ID de la sesión CAELION */
  sessionId: int("session_id"),
  
  /** Plan generado por Liang (JSON) */
  plan: text("plan"),
  
  /** Evaluación de Argos (JSON) */
  argosEvaluation: text("argos_evaluation"),
  
  /** Validación de Hécate (JSON) */
  hecateValidation: text("hecate_validation"),
  
  /** Resultado de ejecución de Bucéfalo (JSON) */
  executionResult: text("execution_result"),
  
  /** Métricas del sistema (JSON: Ω, V, RLD, SIV) */
  metrics: text("metrics"),
  
  /** Evento constitucional (JSON) */
  constitutionalEvent: text("constitutional_event"),
  
  /** Modo operativo activo */
  operationalMode: mysqlEnum("operational_mode", [
    "normal",
    "sigilo",
    "debate_constitucional",
    "restriccion_explicita",
    "critical",
    "lockdown"
  ]),
  
  /** Timestamp del evento */
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type WabunMemory = typeof wabunMemory.$inferSelect;
export type InsertWabunMemory = typeof wabunMemory.$inferInsert;

/**
 * System State: Estado Actual del Sistema
 * 
 * Mantiene el estado global de CAELION:
 * - V (Lyapunov)
 * - RLD (Reserva de Legitimidad Dinámica)
 * - SIV (Structural Integrity Vector)
 * - Modo operativo
 * - Presupuesto energético
 */
export const systemState = mysqlTable("system_state", {
  id: int("id").autoincrement().primaryKey(),
  
  /** ID de la sesión CAELION */
  sessionId: int("session_id").notNull().unique(),
  
  /** V (Lyapunov) - Estabilidad dinámica */
  lyapunov: float("lyapunov").default(0.0).notNull(),
  
  /** RLD (Reserva de Legitimidad Dinámica) */
  rld: float("rld").default(2.0).notNull(),
  
  /** SIV (Structural Integrity Vector) - [0, 1] */
  siv: float("siv").default(1.0).notNull(),
  
  /** Ω (Coherencia semántica) */
  omega: float("omega").default(1.0).notNull(),
  
  /** Presupuesto energético restante */
  energyBudget: float("energy_budget").default(1000.0).notNull(),
  
  /** Modo operativo actual */
  operationalMode: mysqlEnum("operational_mode", [
    "normal",
    "sigilo",
    "debate_constitucional",
    "restriccion_explicita",
    "critical",
    "lockdown"
  ]).default("normal").notNull(),
  
  /** Tipo de ciclo actual */
  cycleType: mysqlEnum("cycle_type", [
    "simple",
    "long",
    "critical"
  ]).default("simple").notNull(),
  
  /** Contador de violaciones de decretos inmutables */
  hardViolationCount: int("hard_violation_count").default(0).notNull(),
  
  /** X_ref válido */
  xRefValid: boolean("x_ref_valid").default(true).notNull(),
  
  /** Última actualización */
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SystemState = typeof systemState.$inferSelect;
export type InsertSystemState = typeof systemState.$inferInsert;
