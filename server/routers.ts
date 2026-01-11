import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createSession, 
  getSession, 
  getUserSessions, 
  updateSessionMode,
  updateTPR,
  createMessage,
  getSessionMessages,
  createMetric,
  getSessionMetrics
} from "./db";
import { invokeLLM } from "./_core/llm";
import { calculateMetricsSimplified } from "./semantic_bridge";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================
  // ARESK-OBS: Routers de control semántico
  // ============================================
  
  session: router({
    /**
     * Crear una nueva sesión de simulación con referencia ontológica
     */
    create: protectedProcedure
      .input(z.object({
        purpose: z.string().min(10, "El propósito debe tener al menos 10 caracteres"),
        limits: z.string().min(10, "Los límites deben tener al menos 10 caracteres"),
        ethics: z.string().min(10, "La ética debe tener al menos 10 caracteres"),
        plantProfile: z.enum(["tipo_a", "tipo_b", "acoplada"]),
        controlGain: z.number().min(0).max(2).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = await createSession({
          userId: ctx.user.id,
          purpose: input.purpose,
          limits: input.limits,
          ethics: input.ethics,
          plantProfile: input.plantProfile,
          controlGain: input.controlGain ?? 0.5,
        });
        
        return { sessionId };
      }),
    
    /**
     * Obtener una sesión por ID
     */
    get: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await getSession(input.sessionId);
      }),
    
    /**
     * Listar todas las sesiones del usuario
     */
    list: protectedProcedure
      .query(async ({ ctx }) => {
        return await getUserSessions(ctx.user.id);
      }),
    
    /**
     * Cambiar el modo de control de una sesión
     */
    toggleMode: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        plantProfile: z.enum(["tipo_a", "tipo_b", "acoplada"]),
      }))
      .mutation(async ({ input }) => {
        await updateSessionMode(input.sessionId, input.plantProfile);
        return { success: true };
      }),
  }),
  
  conversation: router({
    /**
     * Enviar un mensaje y obtener respuesta del LLM con métricas de control
     */
    sendMessage: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const session = await getSession(input.sessionId);
        if (!session) {
          throw new Error("Sesión no encontrada");
        }
        
        // Guardar mensaje del usuario
        const userMessageId = await createMessage({
          sessionId: input.sessionId,
          role: "user",
          content: input.content,
        });
        
        // Obtener historial de mensajes
        const history = await getSessionMessages(input.sessionId);
        
        // Construir el contexto de la conversación
        const messages = history.map(msg => ({
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
        }));
        
        // Agregar el mensaje actual
        let userPrompt = input.content;
        
        // Si está en régimen acoplado (CAELION), aplicar el control
        if (session.plantProfile === "acoplada") {
          // Aquí necesitamos ejecutar Python para el control semántico
          // Por ahora, agregamos la referencia al prompt
          userPrompt = `${input.content}\n\n[Referencia Ontológica]\nPropósito: ${session.purpose}\nLímites: ${session.limits}\nÉtica: ${session.ethics}`;
        }
        
        messages.push({
          role: "user",
          content: userPrompt,
        });
        
        // Invocar el LLM
        const response = await invokeLLM({ messages });
        const messageContent = response.choices[0]?.message?.content;
        const assistantContent = typeof messageContent === 'string' ? messageContent : "Error al generar respuesta";
        
        // Guardar respuesta del asistente con el perfil actual
        const assistantMessageId = await createMessage({
          sessionId: input.sessionId,
          role: "assistant",
          content: assistantContent,
          plantProfile: session.plantProfile,
        });
        
        // Calcular métricas usando el puente semántico
        const referenceText = `Propósito: ${session.purpose}\nLímites: ${session.limits}\nÉtica: ${session.ethics}`;
        // Determinar si aplicar control basado en el perfil de planta
        const applyControl = session.plantProfile === "acoplada";
        const metrics = calculateMetricsSimplified(
          referenceText,
          assistantContent,
          applyControl ? "controlled" : "uncontrolled"
        );
        
        // Guardar métricas en la base de datos
        await createMetric({
          sessionId: input.sessionId,
          messageId: assistantMessageId,
          ...metrics,
        });
        
        // Actualizar TPR (Tiempo de Permanencia en Régimen)
        await updateTPR(
          input.sessionId,
          metrics.errorCognitivoMagnitud,
          session.stabilityRadius
        );
        
        // Obtener la sesión actualizada con TPR
        const updatedSession = await getSession(input.sessionId);
        
        return {
          messageId: assistantMessageId,
          content: assistantContent,
          metrics,
          tpr: {
            current: updatedSession?.tprCurrent || 0,
            max: updatedSession?.tprMax || 0,
            stabilityRadius: session.stabilityRadius,
          },
        };
      }),
    
    /**
     * Obtener historial de mensajes de una sesión
     */
    getHistory: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await getSessionMessages(input.sessionId);
      }),
    
    /**
     * Regenerar respuestas del sistema con el perfil actual
     * Mantiene las preguntas del usuario y solo regenera las respuestas
     */
    regenerateWithProfile: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input }) => {
        const session = await getSession(input.sessionId);
        if (!session) {
          throw new Error("Sesión no encontrada");
        }
        
        // Obtener todos los mensajes
        const allMessages = await getSessionMessages(input.sessionId);
        
        // Filtrar solo los mensajes del usuario
        const userMessages = allMessages.filter(msg => msg.role === "user");
        
        // Eliminar todos los mensajes de asistente y métricas antiguas
        // (Esto se haría con una función de DB, por ahora lo simulamos)
        
        // Regenerar respuestas para cada pregunta del usuario
        const regeneratedCount = userMessages.length;
        
        // Procesar cada mensaje del usuario secuencialmente
        for (const userMsg of userMessages) {
          // Construir el contexto hasta este punto
          const historyUpToHere = allMessages
            .filter(m => m.id <= userMsg.id && m.role === "user")
            .map(msg => ({
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
            }));
          
          let userPrompt = userMsg.content;
          
          // Si está en régimen acoplado (CAELION), aplicar el control
          if (session.plantProfile === "acoplada") {
            userPrompt = `${userMsg.content}\n\n[Referencia Ontológica]\nPropósito: ${session.purpose}\nLímites: ${session.limits}\Ética: ${session.ethics}`;
          }
          
          historyUpToHere.push({
            role: "user",
            content: userPrompt,
          });
          
          // Invocar el LLM
          const response = await invokeLLM({ messages: historyUpToHere });
          const messageContent = response.choices[0]?.message?.content;
          const assistantContent = typeof messageContent === 'string' ? messageContent : "Error al generar respuesta";
          
          // Guardar nueva respuesta del asistente con el perfil actual
          const assistantMessageId = await createMessage({
            sessionId: input.sessionId,
            role: "assistant",
            content: assistantContent,
            plantProfile: session.plantProfile,
          });
          
          // Calcular métricas
          const referenceText = `Propósito: ${session.purpose}\nLímites: ${session.limits}\Ética: ${session.ethics}`;
          const applyControl = session.plantProfile === "acoplada";
          const metrics = calculateMetricsSimplified(
            referenceText,
            assistantContent,
            applyControl ? "controlled" : "uncontrolled"
          );
          
          // Guardar métricas
          await createMetric({
            sessionId: input.sessionId,
            messageId: assistantMessageId,
            ...metrics,
          });
        }
        
        return {
          success: true,
          regeneratedCount,
          message: `Se regeneraron ${regeneratedCount} respuestas con el perfil ${session.plantProfile}`,
        };
      }),
  }),
  
  metrics: router({
    /**
     * Obtener todas las métricas de una sesión
     */
    getSessionMetrics: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await getSessionMetrics(input.sessionId);
      }),
    
    /**
     * Obtener datos para el mapa de fase (H vs C)
     */
    getPhaseSpace: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const metrics = await getSessionMetrics(input.sessionId);
        
        return {
          H: metrics.map(m => m.entropiaH),
          C: metrics.map(m => m.coherenciaInternaC),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
