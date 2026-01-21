import { SystemEvents, EVENTS } from '../infra/events';
import { safeIndexMessage } from '../infra/vector';
import { getDb } from '../db';
import { messages, sessions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

let isObserving = false;

export function startWabunObserver() {
  if (isObserving) return;
  isObserving = true;
  
  console.log('👁️ WABUN-SIDECAR: Online. Semantic memory active.');

  SystemEvents.on(EVENTS.MESSAGE_CREATED, async (payload: { messageId: number }) => {
    setImmediate(async () => {
      try {
        const db = await getDb();
        if (!db) return;
        
        const msgResult = await db.select().from(messages).where(eq(messages.id, payload.messageId)).limit(1);
        const msg = msgResult.length > 0 ? msgResult[0] : null;
        
        if (!msg) return;

        const sessionResult = await db.select().from(sessions).where(eq(sessions.id, msg.sessionId)).limit(1);
        const session = sessionResult.length > 0 ? sessionResult[0] : null;
        
        if (!session) return;

        // NOTA DE ARQUITECTURA (v1.1 Roadmap):
        // Actualmente WABUN lee costos estimados desde la tabla 'messages'.
        // En el futuro, debería cruzar datos con 'argosCosts' (validated costs).
        
        const metadata = {
          sessionId: msg.sessionId,
          role: msg.role,
          timestamp: msg.timestamp.getTime(),
          isTestData: session.isTestData || false,
          
          // Métricas inyectadas para búsqueda
          v_e: (msg as any).v_e || 0.0,
          omega: (msg as any).omega || 1.0,
          tokens: (msg as any).tokenCount || 0
        };

        await safeIndexMessage(msg.id, msg.content, metadata);

      } catch (error) {
        console.error('⚠️ WABUN: Observer error', error);
      }
    });
  });
}
