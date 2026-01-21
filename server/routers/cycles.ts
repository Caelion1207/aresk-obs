import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import { getAllCycles, getActiveCycles, getCycleById, createCycle, updateCycleStatus } from '../db';
import { TRPCError } from '@trpc/server';

export const cyclesRouter = router({
  /**
   * Listar todos los ciclos
   */
  list: protectedProcedure
    .query(async () => {
      return await getAllCycles();
    }),
  
  /**
   * Listar solo ciclos activos (no cerrados ni fallidos, no expirados)
   */
  listActive: protectedProcedure
    .query(async () => {
      return await getActiveCycles();
    }),
  
  /**
   * Obtener un ciclo por ID
   */
  get: protectedProcedure
    .input(z.object({ cycleId: z.number() }))
    .query(async ({ input }) => {
      const cycle = await getCycleById(input.cycleId);
      if (!cycle) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Cycle not found' });
      }
      return cycle;
    }),
  
  /**
   * Crear un nuevo ciclo
   */
  create: protectedProcedure
    .input(z.object({
      protocolId: z.string().default('COM-72-01'),
      triggerType: z.enum(['FOUNDER', 'COMMAND', 'SYSTEM', 'EXTERNAL']),
      objective: z.string().min(10),
      durationHours: z.number().min(1).max(168), // 1 hora a 7 días
    }))
    .mutation(async ({ input }) => {
      const scheduledEndAt = new Date(Date.now() + input.durationHours * 60 * 60 * 1000);
      const cycleId = await createCycle({
        protocolId: input.protocolId,
        triggerType: input.triggerType,
        objective: input.objective,
        scheduledEndAt,
      });
      return { cycleId };
    }),
  
  /**
   * Actualizar estado de un ciclo
   */
  updateStatus: protectedProcedure
    .input(z.object({
      cycleId: z.number(),
      status: z.enum(['INIT', 'EXECUTION', 'REVIEW', 'CLOSED', 'FAILED']),
      outcome: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      await updateCycleStatus(input.cycleId, input.status, input.outcome);
      return { success: true };
    }),
});
