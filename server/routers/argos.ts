import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { 
  getArgosCostsBySession, 
  getArgosCostsByMessage,
  getArgosSessionSummary 
} from '../db';

/**
 * Router ARGOS: Costos Computacionales
 * 
 * Proporciona endpoints para consultar costos de estabilidad cognitiva
 * registrados en la tabla argosCosts por el observador ARGOS.
 * 
 * INVARIANTE: Los costos son inmutables una vez registrados.
 */
export const argosRouter = router({
  /**
   * Obtener costos de una sesión específica
   * Retorna todos los costos asociados a mensajes de la sesión
   */
  getCosts: publicProcedure
    .input(z.object({
      sessionId: z.number().int().positive(),
    }))
    .query(async ({ input }) => {
      const costs = await getArgosCostsBySession(input.sessionId);
      
      return costs.map(row => ({
        id: row.argosCosts.id,
        messageId: row.argosCosts.messageId,
        tokenCount: row.argosCosts.tokenCount,
        latencyMs: row.argosCosts.latencyMs,
        stabilityCost: row.argosCosts.stabilityCost,
        coherence: row.argosCosts.coherence,
        createdAt: row.argosCosts.createdAt,
        // Información del mensaje asociado
        message: {
          id: row.messages.id,
          role: row.messages.role,
          content: row.messages.content,
          timestamp: row.messages.timestamp,
        },
      }));
    }),

  /**
   * Obtener resumen de costos de una sesión
   * Retorna agregaciones: total tokens, latencia promedio, costo total, etc.
   */
  getSummary: publicProcedure
    .input(z.object({
      sessionId: z.number().int().positive(),
    }))
    .query(async ({ input }) => {
      const summary = await getArgosSessionSummary(input.sessionId);
      
      return {
        totalTokens: summary.totalTokens || 0,
        avgLatencyMs: Math.round(summary.avgLatency || 0),
        totalStabilityCost: summary.totalStabilityCost || 0,
        avgCoherence: summary.avgCoherence || 0,
        messageCount: summary.messageCount || 0,
        // Métricas derivadas
        costPerMessage: summary.messageCount > 0 
          ? (summary.totalStabilityCost || 0) / summary.messageCount 
          : 0,
        tokensPerMessage: summary.messageCount > 0
          ? (summary.totalTokens || 0) / summary.messageCount
          : 0,
      };
    }),

  /**
   * Obtener costo de un mensaje específico
   */
  getMessageCost: publicProcedure
    .input(z.object({
      messageId: z.number().int().positive(),
    }))
    .query(async ({ input }) => {
      const costs = await getArgosCostsByMessage(input.messageId);
      
      if (costs.length === 0) {
        return null;
      }
      
      return {
        id: costs[0].id,
        messageId: costs[0].messageId,
        tokenCount: costs[0].tokenCount,
        latencyMs: costs[0].latencyMs,
        stabilityCost: costs[0].stabilityCost,
        coherence: costs[0].coherence,
        createdAt: costs[0].createdAt,
      };
    }),
});
