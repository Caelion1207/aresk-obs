/**
 * Governance Router - Endpoints para monitoreo de gobernanza
 */

import { publicProcedure, router } from '../_core/trpc';
import { calculateRLD, type RLDCalculation } from '../infra/rldCalculator';

export const governanceRouter = router({
  /**
   * Obtiene el estado actual de RLD y módulos de gobernanza
   */
  getStatus: publicProcedure
    .query(async (): Promise<RLDCalculation> => {
      const current = await calculateRLD();
      return current;
    }),

  /**
   * Obtiene historial de RLD (últimas 24 horas)
   * TODO: Implementar almacenamiento de snapshots en BD
   */
  getHistory: publicProcedure
    .query(async () => {
      const current = await calculateRLD();
      
      // Por ahora retornar solo snapshot actual
      // TODO: Consultar tabla de snapshots históricos
      return {
        snapshots: [{
          timestamp: new Date(),
          rld: current.rld,
          inLegitimacyDomain: current.inLegitimacyDomain,
          operationalStatus: current.operationalStatus
        }]
      };
    })
});
