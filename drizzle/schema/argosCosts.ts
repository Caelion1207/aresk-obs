import { mysqlTable, int, float, datetime, index } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { messages } from '../schema';

export const argosCosts = mysqlTable('argosCosts', {
  id: int('id').autoincrement().primaryKey(),
  
  // Vínculo con el evento cognitivo
  messageId: int('messageId')
    .notNull()
    .references(() => messages.id, { onDelete: 'cascade' }),
    
  // Costos Brutos (Infraestructura)
  tokenCount: int('tokenCount').notNull().default(0),
  latencyMs: int('latencyMs').notNull().default(0),
  
  // Costos Cognitivos (Estabilidad - Los 5 Regímenes)
  stabilityCost: float('v_e'),       // V(e): Costo de Lyapunov
  coherence: float('omega'),         // Ω: Coherencia Narrativa
  
  // Timestamp de registro
  createdAt: datetime('createdAt')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
    
}, (table) => ({
  // Índices simples
  msgIdx: index('idx_argos_message').on(table.messageId),
  
  // CRÍTICO: Índice compuesto para análisis de costo por sesión/mensaje
  // Permite responder rápido: "¿Cuáles fueron los mensajes más caros?"
  compositeSessionCost: index('idx_argos_composite_analysis')
    .on(table.messageId, table.stabilityCost),
}));

export type ArgosCost = typeof argosCosts.$inferSelect;
export type InsertArgosCost = typeof argosCosts.$inferInsert;
