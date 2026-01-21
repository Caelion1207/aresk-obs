import { mysqlTable, int, varchar, datetime, json, mysqlEnum, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

export const cycles = mysqlTable('cycles', {
  id: int('id').autoincrement().primaryKey(),
  protocolId: varchar('protocolId', { length: 20 }).notNull().default('COM-72-01'),
  status: mysqlEnum('status', [
    'INIT', 'EXECUTION', 'REVIEW', 'CLOSED', 'FAILED'
  ]).notNull().default('INIT'),
  triggerType: mysqlEnum('triggerType', [
    'FOUNDER', 'COMMAND', 'SYSTEM', 'EXTERNAL'
  ]).notNull(),
  objective: varchar('objective', { length: 255 }).notNull(),
  outcome: json('outcome'),
  startedAt: datetime('startedAt').notNull().default(sql`CURRENT_TIMESTAMP`),
  scheduledEndAt: datetime('scheduledEndAt').notNull(),
  closedAt: datetime('closedAt'),
}, (table) => ({
  statusIdx: index('idx_cycles_status').on(table.status),
  timeIdx: index('idx_cycles_timing').on(table.startedAt, table.scheduledEndAt),
  activeIdx: index('idx_cycles_active').on(table.status, table.scheduledEndAt, table.id),
}));

export type CycleSelect = typeof cycles.$inferSelect;
export type InsertCycle = typeof cycles.$inferInsert;
