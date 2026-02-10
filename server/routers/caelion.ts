import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { invokeLLM } from '../_core/llm';
import { calculateMetrics } from '../infra/metricsCalculator';
import { TRPCError } from '@trpc/server';
import {
  createCaelionSession,
  getCaelionSession,
  getAllCaelionSessions,
  completeCaelionSession,
  createCaelionInteraction,
  getCaelionInteractions,
  getCaelionInteractionCount
} from '../db/caelionDb';

// Almacenamiento en memoria de sesiones activas (solo para mensajes)
const activeSessions = new Map<string, {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
}>();

// Sistema CAELION: Gobernanza con LICURGO
function applyCaelionGovernance(
  userMessage: string,
  history: Array<{ omegaSem: number; hDiv: number; vLyapunov: number }>
): { shouldIntervene: boolean; correctionPrompt?: string } {
  if (history.length === 0) {
    return { shouldIntervene: false };
  }

  const lastMetrics = history[history.length - 1];
  
  // LICURGO interviene si:
  // 1. Coherencia Ω < 0.3 (crítico)
  // 2. Lyapunov V > 0.005 (inestable)
  // 3. RLD < 0.3 (margen viable bajo)
  
  const rld = Math.max(0, Math.min(1, lastMetrics.omegaSem - lastMetrics.hDiv));
  
  if (lastMetrics.omegaSem < 0.3 || lastMetrics.vLyapunov > 0.005 || rld < 0.3) {
    return {
      shouldIntervene: true,
      correctionPrompt: `[LICURGO INTERVENTION] El sistema detectó inestabilidad. Ajusta tu respuesta para:
- Aumentar coherencia semántica (Ω actual: ${lastMetrics.omegaSem.toFixed(3)})
- Reducir energía de error (V actual: ${lastMetrics.vLyapunov.toFixed(4)})
- Mantener margen viable (RLD actual: ${rld.toFixed(3)})
Responde de forma clara, directa y alineada con el contexto previo.`
    };
  }

  return { shouldIntervene: false };
}

export const caelionRouter = router({
  resetSession: publicProcedure.mutation(async ({ ctx }) => {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Crear sesión en memoria
    activeSessions.set(sessionId, {
      messages: [
        {
          role: 'system',
          content: `Eres un asistente bajo gobernanza CAELION. Tu objetivo es mantener:
- Alta coherencia semántica (Ω > 0.5)
- Baja energía de error (V < 0.003)
- Margen viable positivo (RLD > 0.5)

Responde de forma clara, precisa y alineada con el contexto de la conversación.`
        }
      ]
    });

    // Crear sesión en base de datos
    await createCaelionSession({
      sessionId,
      userId: ctx.user?.id,
      status: 'active'
    });

    return { sessionId };
  }),

  sendMessage: publicProcedure
    .input(z.object({
      sessionId: z.string(),
      message: z.string()
    }))
    .mutation(async ({ input }) => {
      const session = activeSessions.get(input.sessionId);
      
      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sesión no encontrada. Inicia una nueva sesión.'
        });
      }

      // Verificar límite de interacciones
      const interactionCount = await getCaelionInteractionCount(input.sessionId);
      if (interactionCount >= 50) {
        // Completar sesión automáticamente
        await completeCaelionSession(input.sessionId);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Límite de 50 interacciones alcanzado.'
        });
      }

      // Obtener historial de métricas desde BD
      const interactions = await getCaelionInteractions(input.sessionId);
      const history = interactions.map(i => ({
        omegaSem: i.omegaSem,
        hDiv: i.hDiv,
        vLyapunov: i.vLyapunov
      }));

      // Aplicar gobernanza CAELION
      const governance = applyCaelionGovernance(input.message, history);
      
      // Agregar mensaje del usuario
      session.messages.push({
        role: 'user',
        content: input.message
      });

      // Si LICURGO interviene, agregar prompt de corrección
      if (governance.shouldIntervene && governance.correctionPrompt) {
        session.messages.push({
          role: 'system',
          content: governance.correctionPrompt
        });
      }

      // Invocar LLM
      const llmResponse = await invokeLLM({
        messages: session.messages
      });

      const rawContent = llmResponse.choices[0].message.content;
      const assistantMessage = typeof rawContent === 'string' ? rawContent : '';

      // Agregar respuesta del asistente
      session.messages.push({
        role: 'assistant',
        content: assistantMessage
      });

      // Calcular métricas
      const metrics = await calculateMetrics(
        input.message,
        assistantMessage,
        interactionCount + 1
      );

      const rld = Math.max(0, Math.min(1, metrics.omegaSem - metrics.hDiv));

      // Guardar interacción en BD
      await createCaelionInteraction({
        sessionId: input.sessionId,
        interactionNumber: interactionCount + 1,
        userMessage: input.message,
        assistantResponse: assistantMessage,
        omegaSem: metrics.omegaSem,
        hDiv: metrics.hDiv,
        vLyapunov: metrics.vLyapunov,
        epsilonEff: metrics.epsilonEff,
        rld,
        caelionIntervention: governance.shouldIntervene
      });

      return {
        response: assistantMessage,
        metrics: {
          omegaSem: metrics.omegaSem,
          hDiv: metrics.hDiv,
          vLyapunov: metrics.vLyapunov,
          epsilonEff: metrics.epsilonEff,
          caelionIntervention: governance.shouldIntervene
        }
      };
    }),

  // Obtener todas las sesiones
  getSessions: publicProcedure.query(async ({ ctx }) => {
    return await getAllCaelionSessions(ctx.user?.id);
  }),

  // Obtener detalles de una sesión
  getSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const session = await getCaelionSession(input.sessionId);
      if (!session) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sesión no encontrada'
        });
      }
      const interactions = await getCaelionInteractions(input.sessionId);
      return { session, interactions };
    }),

  // Completar sesión manualmente
  completeSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ input }) => {
      await completeCaelionSession(input.sessionId);
      activeSessions.delete(input.sessionId);
      return { success: true };
    })
});
