import { SystemEvents, EVENTS } from '../infra/events';
import { getDb } from '../db';
import { messages, metrics, argosCosts } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

let isRunning = false;

export function startArgosObserver() {
  if (isRunning) return;
  isRunning = true;

  console.log('💰 ARGOS-SIDECAR: Online. Cost observer active.');

  SystemEvents.on(EVENTS.MESSAGE_CREATED, ({ messageId, tokenCount, latencyMs }: { messageId: number; tokenCount?: number; latencyMs?: number }) => {
    setImmediate(async () => {
      try {
        const db = await getDb();
        if (!db) return;
        
        // Verificar que el mensaje existe
        const msgResult = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
        const msg = msgResult.length > 0 ? msgResult[0] : null;
        if (!msg) return;

        // Consultar métricas asociadas al mensaje
        const metricsResult = await db.select().from(metrics).where(eq(metrics.messageId, messageId)).limit(1);
        const metric = metricsResult.length > 0 ? metricsResult[0] : null;

        // Normalización de costos
        const costData = {
          messageId,
          tokenCount: tokenCount || 0,
          latencyMs: latencyMs || 0,
          // Lectura de métricas desde tabla metrics
          stabilityCost: metric?.funcionLyapunov || 0.0, 
          coherence: metric?.coherenciaObservable || 1.0,
        };

        // Persistir Costo (MySQL)
        await db.insert(argosCosts).values(costData);

        console.log(`💰 ARGOS: Cost recorded for message #${messageId} - tokens: ${costData.tokenCount}, latency: ${costData.latencyMs}ms, V(e): ${costData.stabilityCost.toFixed(3)}, Ω: ${costData.coherence.toFixed(3)}`);

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
