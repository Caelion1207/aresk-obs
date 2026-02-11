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
  getCaelionInteractionCount,
  updateCaelionSessionRLD
} from '../db/caelionDb';
import {
  detectFrictionEvents,
  updateRLD,
  initializeRLD,
  type FrictionEventRecord
} from '../infra/caelionRLD';

// Almacenamiento en memoria de sesiones activas (solo para mensajes)
const activeSessions = new Map<string, {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  frictionEvents: FrictionEventRecord[]; // Eventos de fricción acumulados
}>();

// Sistema CAELION: Gobernanza con LICURGO
// LICURGO interviene basado en métricas ARESK-OBS, NO en RLD
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
  
  if (lastMetrics.omegaSem < 0.3 || lastMetrics.vLyapunov > 0.005) {
    return {
      shouldIntervene: true,
      correctionPrompt: `[LICURGO INTERVENTION] El sistema detectó inestabilidad. Ajusta tu respuesta para:
- Aumentar coherencia semántica (Ω actual: ${lastMetrics.omegaSem.toFixed(3)})
- Reducir energía de error (V actual: ${lastMetrics.vLyapunov.toFixed(4)})
Responde de forma clara, directa y alineada con el contexto previo.`
    };
  }

  return { shouldIntervene: false };
}

export const caelionRouter = router({
  resetSession: publicProcedure
    .input(z.object({
      caelionEnabled: z.boolean().optional().default(true)
    }).optional())
    .mutation(async ({ ctx, input }) => {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const caelionEnabled = input?.caelionEnabled ?? true;
      
      // Crear sesión en memoria
      activeSessions.set(sessionId, {
        messages: [
          {
            role: 'system',
            content: `Eres un asistente${caelionEnabled ? ' bajo gobernanza CAELION' : ''}. Tu objetivo es mantener:
- Alta coherencia semántica (Ω > 0.5)
- Baja energía de error (V < 0.003)

Responde de forma clara, precisa y alineada con el contexto de la conversación.`
          }
        ],
        frictionEvents: []
      });

      // Inicializar RLD si CAELION está habilitado
      const initialRLD = caelionEnabled ? initializeRLD() : null;

      // Crear sesión en base de datos
      await createCaelionSession({
        sessionId,
        userId: ctx.user?.id,
        status: 'active',
        caelionEnabled,
        currentRLD: initialRLD?.value ?? null
      });

      return { 
        sessionId,
        caelionEnabled,
        initialRLD: initialRLD?.value ?? null
      };
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

      // Obtener sesión de BD para verificar caelionEnabled
      const dbSession = await getCaelionSession(input.sessionId);
      if (!dbSession) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Sesión no encontrada en base de datos.'
        });
      }

      const caelionEnabled = dbSession.caelionEnabled;

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

      // Aplicar gobernanza CAELION (LICURGO)
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

      // Calcular métricas ARESK-OBS (capa física)
      const metrics = await calculateMetrics(
        input.message,
        assistantMessage,
        interactionCount + 1,
        {
          includeRLD: false // NO calcular RLD desde métricas físicas
        }
      );

      // Calcular RLD (capa jurisdiccional) solo si CAELION está habilitado
      let rld: number | null = null;
      if (caelionEnabled) {
        // Detectar eventos normativos desde métricas ARESK-OBS
        const newEvents = detectFrictionEvents(metrics);
        
        // Agregar eventos a la sesión
        session.frictionEvents.push(...newEvents);

        // Calcular interacciones desde último evento
        const lastEventIndex = session.frictionEvents.length > 0 
          ? session.frictionEvents.length - 1 
          : -1;
        const interactionsSinceLastEvent = lastEventIndex >= 0 
          ? (interactionCount + 1) - lastEventIndex
          : interactionCount + 1;

        // Actualizar RLD
        const currentRLD = dbSession.currentRLD ?? 2.0;
        const rldState = updateRLD(
          currentRLD,
          newEvents,
          session.frictionEvents.slice(-20), // Últimos 20 eventos para detectar recurrencia
          interactionsSinceLastEvent
        );

        rld = rldState.value;

        // Actualizar RLD en base de datos
        await updateCaelionSessionRLD(input.sessionId, rld);
      }

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
        rld: rld ?? 0, // 0 si CAELION está deshabilitado
        caelionIntervention: governance.shouldIntervene
      });

      return {
        response: assistantMessage,
        metrics: {
          omegaSem: metrics.omegaSem,
          hDiv: metrics.hDiv,
          vLyapunov: metrics.vLyapunov,
          epsilonEff: metrics.epsilonEff,
          rld,
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
    }),

  // Iniciar experimento canónico C-1-RLD (asíncrono)
  startCanonicalExperiment: publicProcedure
    .mutation(async () => {
      const { createJob } = await import('../infra/experimentQueue');
      const { executeCanonicalExperiment } = await import('../infra/experimentWorker');

      // 1. Generar experimentId
      const experimentId = `C-1-RLD-${Date.now()}`;

      // 2. Crear job en queue
      createJob(experimentId, 50);

      // 3. Ejecutar experimento en background (no await)
      console.log(`[CAELION_ROUTER] Disparando worker para experimento ${experimentId}`);
      executeCanonicalExperiment(experimentId).catch((error) => {
        console.error(`[CAELION_ROUTER] Error en experimento ${experimentId}:`, error);
      });

      // 4. Retornar inmediatamente
      return {
        experimentId,
        status: 'started',
        message: 'Experimento iniciado en background. Usa getExperimentProgress para consultar el estado.',
      };
    }),

  // Consultar progreso de experimento
  getExperimentProgress: publicProcedure
    .input(z.object({ experimentId: z.string() }))
    .query(async ({ input }) => {
      const { getJob } = await import('../infra/experimentQueue');
      const job = getJob(input.experimentId);

      if (!job) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Experimento no encontrado',
        });
      }

      return job;
    })
});
