/**
 * drizzle/auditLogsLegacy.ts
 * 
 * Esquema de tabla de auditoría legacy (dev-corrupted)
 * Congelada como referencia forense de la fase de desarrollo
 */

import { mysqlTable, int, varchar, timestamp, index } from "drizzle-orm/mysql-core";

/**
 * Tabla de logs de auditoría LEGACY (dev-corrupted)
 * 
 * Estado: CONGELADO
 * Razón: Cadena de hash rota durante fase de desarrollo
 * Propósito: Referencia forense, NO operativa
 * 
 * NO usar esta tabla para auditoría activa.
 * Usar auditLogs (audit_v2) para operaciones actuales.
 */
export const auditLogsDevCorrupted = mysqlTable("auditLogs_dev_corrupted", {
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
  
  // Hash Chain (CORRUPTO - NO CONFIAR)
  hash: varchar("hash", { length: 64 }).notNull(), // SHA-256 hex
  prevHash: varchar("prevHash", { length: 64 }), // null para primer log (GENESIS)
  
  // Metadatos de congelamiento
  frozenAt: timestamp("frozen_at").notNull().defaultNow(),
  frozenReason: varchar("frozen_reason", { length: 255 }).notNull()
    .default("Development phase audit chain corruption - isolated for forensic reference"),
}, (table) => ({
  // Índice para consultas por usuario + tiempo
  userTimestampIdx: index("idx_audit_legacy_user_timestamp").on(table.userId, table.timestamp),
  
  // Índice para búsqueda por hash (verificación de integridad)
  hashIdx: index("idx_audit_legacy_hash").on(table.hash),
  
  // Índice para consultas temporales (monitoreo)
  timestampIdx: index("idx_audit_legacy_timestamp").on(table.timestamp),
}));

export type AuditLogLegacy = typeof auditLogsDevCorrupted.$inferSelect;
