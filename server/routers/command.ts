import { z } from 'zod';
import { CmdEngine } from '../core/cmd01/engine';
import { getDb } from '../db';
import { cycles } from '../../drizzle/schema';
import { sql } from 'drizzle-orm';
import { getOutbox } from '../infra/outbox';
import { EVENTS } from '../infra/events';
import { metrics } from '../infra/metrics';
import { v4 as uuidv4 } from 'uuid';
import { TRPCError } from '@trpc/server';
import { protectedProcedure, router } from '../_core/trpc';

const CommandInputSchema = z.object({
  text: z.string()
    .min(1, 'Command cannot be empty')
    .max(500, 'Command too long (max 500 chars)')
    .regex(/^[a-zA-Z0-9\s.,;:!?\-_()\[\]{}"']+$/, 'Invalid characters in command')
    .trim(),
  metadata: z.object({
    source: z.enum(['MANUS', 'API', 'WEB', 'INTERNAL']).default('MANUS'),
    priority: z.number().min(1).max(10).default(5),
    traceId: z.string().optional()
  }).optional().default({ source: 'MANUS', priority: 5 }),
});

export const commandRouter = router({
  dispatch: protectedProcedure
    .input(CommandInputSchema)
    .mutation(async ({ ctx, input }) => {
      const startTime = Date.now();
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Database unavailable'
        });
      }
      
      const outbox = getOutbox();
      const traceId = input.metadata?.traceId || `cmd_${Date.now()}_${uuidv4().substr(0, 8)}`;
      
      console.log(`🚀 Command dispatch started`, {
        traceId,
        userId: ctx.user.id,
        textPreview: input.text.substring(0, 50) + (input.text.length > 50 ? '...' : ''),
        source: input.metadata?.source
      });
      
      try {
        // Obtener ciclo activo con bloqueo FOR UPDATE WAIT 5
        const lockQuery = sql`
          SELECT * FROM cycles 
          WHERE status NOT IN ('CLOSED', 'FAILED')
            AND scheduledEndAt > NOW()
          ORDER BY id DESC 
          LIMIT 1
          FOR UPDATE WAIT 5
        `;
        
        let activeCycle;
        try {
          const cycleResults = await db.execute(lockQuery);
          const rows = Array.isArray(cycleResults[0]) ? cycleResults[0] : [];
          activeCycle = rows.length > 0 ? rows[0] : undefined;
        } catch (lockError: any) {
          if (lockError.code === 'ER_LOCK_WAIT_TIMEOUT' || lockError.code === 'ER_LOCK_DEADLOCK') {
            metrics.increment('commands.rejected');
            throw new TRPCError({
              code: 'TIMEOUT',
              message: 'SYSTEM_BUSY: Could not acquire lock on active cycle. Please retry.'
            });
          }
          throw lockError;
        }
        
        // Procesar comando
        const cmdResult = await CmdEngine.process({
          rawInput: input.text,
          actor: { 
            id: ctx.user.id, 
            role: ctx.user.role || 'user'
          }
        }, activeCycle);
        
        // Registrar métricas
        const latency = Date.now() - startTime;
        metrics.recordLatency('command.processing', latency);
        
        if (cmdResult.status === 'DISPATCHED') {
          metrics.increment('commands.dispatched');
          
          // Programar evento post-commit
          outbox.schedule(EVENTS.COMMAND_DISPATCHED, {
            commandId: uuidv4(),
            intent: cmdResult.intent!,
            protocol: cmdResult.protocol!,
            userId: ctx.user.id,
            timestamp: new Date()
          }, { immediateRetry: true });
          
          console.log(`✅ Command dispatched`, {
            traceId,
            protocol: cmdResult.protocol,
            intent: cmdResult.intent,
            latencyMs: latency
          });
        } else {
          metrics.increment('commands.rejected');
          
          console.log(`❌ Command rejected`, {
            traceId,
            reason: cmdResult.reason,
            latencyMs: latency
          });
        }
        
        return {
          ...cmdResult,
          traceId,
          latencyMs: latency
        };
        
      } catch (error: any) {
        metrics.increment('commands.rejected');
        const latency = Date.now() - startTime;
        
        console.error(`💥 Command dispatch failed`, {
          traceId,
          error: error.message,
          latencyMs: latency
        });
        
        throw error;
      }
    })
});
