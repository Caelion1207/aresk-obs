/**
 * drizzle/auditLogs.ts
 * 
 * Esquema de tabla de auditoría con hash chain
 * Diseño forensic-grade para trazabilidad inmutable
 */

import { mysqlTable, int, varchar, timestamp, index } from "drizzle-orm/mysql-core";

/**
 * Tabla de logs de auditoría con cadena de hash
 * 
 * Garantías de integridad:
 * - Cada log contiene hash SHA-256 de su contenido + prevHash
 * - prevHash apunta al hash del log anterior (blockchain-style)
 * - Cualquier modificación rompe la cadena
 * - Verificación periódica detecta corrupciones
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  
  // Identidad del request
  userId: int("userId").notNull(),
  endpoint: varchar("endpoint", { length: 255 }).notNull(),
  method: varchar("method", { length: 10 }).notNull(),
  
  // Tipo de log (GENESIS para bloque inicial)
  type: varchar("type", { length: 20 }).notNull().default("STANDARD"),
  
  // Resultado
  statusCode: int("statusCode").notNull(),
  duration: int("duration").notNull(), // milisegundos
  
  // Contexto
  timestamp: timestamp("timestamp").notNull(),
  ip: varchar("ip", { length: 45 }), // IPv6-compatible
  userAgent: varchar("userAgent", { length: 512 }),
  requestId: varchar("requestId", { length: 64 }),
  
  // Hash Chain (Integridad Criptográfica)
  hash: varchar("hash", { length: 64 }).notNull(), // SHA-256 hex
  prevHash: varchar("prevHash", { length: 64 }), // null para primer log (GENESIS)
}, (table) => ({
  // Índice para consultas por usuario + tiempo
  userTimestampIdx: index("idx_audit_user_timestamp").on(table.userId, table.timestamp),
  
  // Índice para búsqueda por hash (verificación de integridad)
  hashIdx: index("idx_audit_hash").on(table.hash),
  
  // Índice para consultas temporales (monitoreo)
  timestampIdx: index("idx_audit_timestamp").on(table.timestamp),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
