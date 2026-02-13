/**
 * CAELION Orchestrator - tRPC Router
 * 
 * Expone orquestador CAELION via tRPC
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { orchestrate, type OrchestrationContext } from "../orchestrator";
import * as Wabun from "../modules/wabun";

export const caelionOrchestratorRouter = router({
  /**
   * Ejecuta solicitud a través del orquestador CAELION
   */
  execute: protectedProcedure
    .input(z.object({
      sessionId: z.number(),
      request: z.object({
        type: z.string(),
        content: z.string(),
        context: z.record(z.string(), z.unknown()).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
      }),
      operationalMode: z.enum([
        "normal",
        "sigilo",
        "debate_constitucional",
        "restriccion_explicita",
        "critical",
        "lockdown"
      ]).optional(),
    }))
    .mutation(async ({ input }) => {
      const context: OrchestrationContext = {
        sessionId: input.sessionId,
        request: input.request,
        operationalMode: input.operationalMode,
      };
      
      const result = await orchestrate(context);
      
      return result;
    }),
  
  /**
   * Obtiene historial de Wabun
   */
  getHistory: protectedProcedure
    .input(z.object({
      sessionId: z.number().optional(),
      eventType: z.enum([
        "plan_generated",
        "argos_evaluation",
        "hecate_validation",
        "execution_result",
        "metrics_update",
        "constitutional_event",
        "mode_change",
        "decree_modification",
        "founder_authentication",
        "lockdown_triggered"
      ]).optional(),
      limit: z.number().default(100),
    }))
    .query(async ({ input }) => {
      const history = await Wabun.getHistory(
        input.sessionId,
        input.eventType,
        input.limit
      );
      
      return history;
    }),
  
  /**
   * Verifica integridad de la cadena Wabun
   */
  verifyIntegrity: protectedProcedure
    .query(async () => {
      const isValid = await Wabun.verifyChainIntegrity();
      
      return { valid: isValid };
    }),
  
  /**
   * Ejecuta consolidación de Wabun
   */
  consolidate: protectedProcedure
    .mutation(async () => {
      await Wabun.consolidate();
      
      return { success: true };
    }),
});
