import { mysqlTable, int, varchar, text, timestamp, decimal, index } from "drizzle-orm/mysql-core";

/**
 * Tabla: protocolEvents
 * 
 * Registra eventos de los protocolos CAELION (COM-72, ETH-01, CMD-01)
 * para auditoría y análisis histórico.
 */
export const protocolEvents = mysqlTable("protocolEvents", {
  id: int("id").primaryKey().autoincrement(),
  
  // Identificación del protocolo
  protocol: varchar("protocol", { length: 10 }).notNull(), // 'COM-72', 'ETH-01', 'CMD-01'
  eventType: varchar("eventType", { length: 50 }).notNull(), // 'coherence_check', 'ethical_violation', 'decision_made'
  
  // Contexto
  sessionId: int("sessionId").notNull(),
  messageId: int("messageId"), // Opcional, puede ser null para eventos globales
  
  // Datos del evento (JSON)
  eventData: text("eventData").notNull(), // JSON con datos específicos del evento
  
  // Métricas asociadas
  coherenceScore: decimal("coherenceScore", { precision: 5, scale: 3 }), // Ω(t) para COM-72
  stabilityScore: decimal("stabilityScore", { precision: 5, scale: 3 }), // V(e) para COM-72
  ethicalScore: decimal("ethicalScore", { precision: 5, scale: 3 }), // Distancia a E para ETH-01
  
  // Resultado
  status: varchar("status", { length: 20 }).notNull(), // 'PASS', 'FAIL', 'WARNING'
  severity: varchar("severity", { length: 20 }), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  
  // Metadata
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index("idx_protocol_session").on(table.sessionId),
  protocolIdx: index("idx_protocol_type").on(table.protocol),
  statusIdx: index("idx_protocol_status").on(table.status),
  timestampIdx: index("idx_protocol_timestamp").on(table.timestamp),
}));

export type ProtocolEvent = typeof protocolEvents.$inferSelect;
export type InsertProtocolEvent = typeof protocolEvents.$inferInsert;
