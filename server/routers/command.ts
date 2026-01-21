import { z } from 'zod';
import { CmdEngine } from '../core/cmd01/engine';
import { getDb } from '../db';
import { cycles } from '../../drizzle/schema';
import { sql, desc } from 'drizzle-orm';
import { getOutbox } from '../infra/outbox';
import { EVENTS } from '../infra/events';
import { v4 as uuidv4 } from 'uuid';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../_core/trpc';

const CommandSchema = z.object({
  text: z.string().min(1).max(500).trim()
});

export const commandRouter = router({
  dispatch: protectedProcedure
    .input(CommandSchema)
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database unavailable'
        });
      }
      
      const outbox = getOutbox();
      
      // Obtener ciclo activo sin transacción primero (para evitar bloqueos largos)
      const activeCycles = await db.select()
        .from(cycles)
        .where(sql`status NOT IN ('CLOSED', 'FAILED') AND scheduledEndAt > NOW()`)
        .orderBy(desc(cycles.id))
        .limit(1);
      
      const activeCycle = activeCycles.length > 0 ? activeCycles[0] : undefined;
      
      // Procesar comando
      const result = await CmdEngine.process({
        rawInput: input.text,
        actor: { id: ctx.user.id, role: ctx.user.role }
      }, activeCycle);
      
      // Programar evento post-commit
      if (result.status === 'DISPATCHED') {
        outbox.schedule(EVENTS.COMMAND_DISPATCHED, {
          commandId: uuidv4(),
          intent: result.intent!,
          protocol: result.protocol!,
          userId: ctx.user.id,
          timestamp: new Date()
        });
        
        // Flush eventos inmediatamente (en producción esto debería ser post-commit)
        outbox.flush();
      }
      
      return result;
    })
});
