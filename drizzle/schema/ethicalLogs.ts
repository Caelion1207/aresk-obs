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
  timestamp: datetime('timestamp').notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  constIdx: index('idx_eth_constant').on(table.violatedConstant),
  resIdx: index('idx_eth_resolution').on(table.resolution),
}));

export type EthicalLog = typeof ethicalLogs.$inferSelect;
export type InsertEthicalLog = typeof ethicalLogs.$inferInsert;
