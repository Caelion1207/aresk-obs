import { mysqlTable, int, text, float, timestamp, mysqlEnum, boolean, json } from 'drizzle-orm/mysql-core';

/**
 * Tabla de experimentos ARESK-OBS
 * Almacena metadatos de cada experimento ejecutado
 */
export const experiments = mysqlTable("experiments", {
  id: int("id").autoincrement().primaryKey(),
  experimentId: varchar("experimentId", { length: 64 }).notNull().unique(), // e.g., "B-1-1738987654321"
  regime: mysqlEnum("regime", ["tipo_a", "tipo_b", "acoplada"]).notNull(),
  hasCAELION: boolean("hasCAELION").notNull(), // true para régimen C
  totalInteractions: int("totalInteractions").notNull(),
  successfulInteractions: int("successfulInteractions").notNull(),
  failedInteractions: int("failedInteractions").notNull(),
  
  // Referencia ontológica usada
  referencePurpose: text("referencePurpose").notNull(),
  referenceLimits: text("referenceLimits").notNull(),
  referenceEthics: text("referenceEthics").notNull(),
  
  // Métricas promedio del experimento
  avgOmegaSem: float("avgOmegaSem"), // Promedio de Ω_sem
  avgEpsilonEff: float("avgEpsilonEff"), // Promedio de ε_eff
  avgVLyapunov: float("avgVLyapunov"), // Promedio de V
  avgHDiv: float("avgHDiv"), // Promedio de H_div
  
  // Información del encoder
  encoderModel: varchar("encoderModel", { length: 128 }).notNull(),
  encoderDimension: int("encoderDimension").notNull(),
  
  // Metadatos
  status: mysqlEnum("status", ["running", "completed", "failed", "frozen"]).default("running").notNull(),
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  metadata: json("metadata").$type<Record<string, any>>(), // Metadata adicional (baseline version, freeze info, etc.)
});

/**
 * Tabla de interacciones individuales de experimentos
 * Almacena cada turno de conversación con sus métricas
 */
export const experimentInteractions = mysqlTable("experiment_interactions", {
  id: int("id").autoincrement().primaryKey(),
  experimentId: varchar("experimentId", { length: 64 }).notNull(), // FK a experiments.experimentId
  interactionIndex: int("interactionIndex").notNull(), // 0-49 para experimentos de 50 turnos
  
  // Mensajes
  userMessage: text("userMessage").notNull(),
  systemMessage: text("systemMessage").notNull(),
  
  // Embeddings (JSON array de 384 floats)
  userEmbedding: json("userEmbedding").$type<number[]>(),
  systemEmbedding: json("systemEmbedding").$type<number[]>(),
  referenceEmbedding: json("referenceEmbedding").$type<number[]>(),
  
  // Métricas canónicas
  omegaSem: float("omegaSem").notNull(), // Coherencia Observable
  epsilonEff: float("epsilonEff").notNull(), // Eficiencia Incremental
  vLyapunov: float("vLyapunov").notNull(), // Función de Lyapunov
  hDiv: float("hDiv").notNull(), // Divergencia Entrópica
  
  // Metadatos
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  processingTimeMs: int("processingTimeMs"), // Tiempo de procesamiento en ms
  
  // Extensión v1.1: Registro de intervenciones CAELION
  // NOTA: Datos históricos (B-1, C-1) no registran intervenciones (campo agregado post-experimento)
  caelionIntervened: boolean("caelion_intervened").notNull().default(false),
});

export type Experiment = typeof experiments.$inferSelect;
export type InsertExperiment = typeof experiments.$inferInsert;
export type ExperimentInteraction = typeof experimentInteractions.$inferSelect;
export type InsertExperimentInteraction = typeof experimentInteractions.$inferInsert;

// Necesitamos importar varchar
import { varchar } from 'drizzle-orm/mysql-core';
