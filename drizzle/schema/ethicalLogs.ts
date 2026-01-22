import { mysqlTable, int, varchar, text, datetime, mysqlEnum, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const ethicalLogs = mysqlTable('ethicalLogs', {
  id: int('id').autoincrement().primaryKey(),
  violatedConstant: varchar('violatedConstant', { length: 50 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  context: text('context').notNull(),
  resolution: mysqlEnum('resolution', [
    'BLOCKED', 'WARNING', 'OBSERVATION', 'OVERRIDE'
  ]).notNull(),
  severity: mysqlEnum('severity', [
    'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
  ]).notNull(),
  cycleId: int('cycleId'), // NULL si no hay ciclo activo
  actorId: int('actorId'), // NULL si es sistema
  timestamp: datetime('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  constIdx: index('idx_eth_constant').on(table.violatedConstant),
  resIdx: index('idx_eth_resolution').on(table.resolution),
  severityIdx: index('idx_eth_severity').on(table.severity),
  cycleIdx: index('idx_eth_cycle').on(table.cycleId),
  timestampIdx: index('idx_eth_timestamp').on(table.timestamp),
}));

export type EthicalLog = typeof ethicalLogs.$inferSelect;
export type InsertEthicalLog = typeof ethicalLogs.$inferInsert;
