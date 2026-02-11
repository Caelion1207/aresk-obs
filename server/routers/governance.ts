import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { calculateRLD, getModuleStatus } from '../infra/rldCalculator';

export const governanceRouter = router({
  /**
   * Obtener estado completo de RLD con desglose por módulos
   */
  getRLDStatus: publicProcedure
    .query(async () => {
      const rldCalculation = await calculateRLD();
      return rldCalculation;
    }),

  /**
   * Obtener estado de un módulo específico
   */
  getModuleStatus: publicProcedure
    .input(z.object({
      module: z.enum(['ARGOS', 'LICURGO', 'WABUN', 'AUDIT_INTEGRITY'])
    }))
    .query(async ({ input }) => {
      const status = await getModuleStatus(input.module);
      return status;
    }),

  /**
   * Obtener historial de RLD (últimas 24 horas)
   * Para gráfica de evolución temporal
   */
  getRLDHistory: publicProcedure
    .query(async () => {
      // TODO: Implementar almacenamiento de snapshots de RLD en BD
      // Por ahora retornar cálculo actual
      const current = await calculateRLD();
      return {
        snapshots: [{
          timestamp: new Date(),
          rld: current.rld,
          governanceCapacity: current.governanceCapacity,
          transferRisk: current.transferRisk,
          collapseRisk: current.collapseRisk
        }]
      };
    })
});
