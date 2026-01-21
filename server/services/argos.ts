import { SystemEvents, EVENTS } from '../infra/events';
import { getDb } from '../db';
import { messages, argosCosts } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

let isRunning = false;

export function startArgosObserver() {
  if (isRunning) return;
  isRunning = true;

  console.log('💰 ARGOS-SIDECAR: Online. Cost observer active.');

  SystemEvents.on(EVENTS.MESSAGE_CREATED, ({ messageId }: { messageId: number }) => {
    setImmediate(async () => {
      try {
        const db = await getDb();
        if (!db) return;
        
        const result = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
        const msg = result.length > 0 ? result[0] : null;

        if (!msg) return;

        // Normalización de costos
        const costData = {
          messageId,
          tokenCount: (msg as any).tokenCount || 0,
          latencyMs: (msg as any).latencyMs || 0,
          // Lectura de métricas crudas desde el mensaje
          stabilityCost: (msg as any).v_e || 0.0, 
          coherence: (msg as any).omega || 1.0,
        };

        // Persistir Costo (MySQL)
        await db.insert(argosCosts).values(costData);

        // Emitir evento reservado
        SystemEvents.emit(EVENTS.COST_RECORDED, {
          messageId,
          cost: costData
        });

      } catch (err) {
        console.warn('⚠️ ARGOS: Cost capture failed', err);
      }
    });
  });
}
