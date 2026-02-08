import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { calculateCosineSimilarity } from "./semantic_bridge";
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
  getSessionMetrics,
  createTimeMarker,
  getTimeMarkersBySession,
  updateTimeMarker,
  deleteTimeMarker,
  getUserAlerts,
  getSessionAlerts,
  dismissAlert,
  detectAnomalies,
  getDb
} from "./db";
import { invokeLLM } from "./_core/llm";
import { calculateMetricsSimplified } from "./semantic_bridge";
// import { calculateMetricsExactCAELION, buildReferenceText } from "./semantic_bridge_exact";
import { analyzeSemanticPolarity, calculateEffectiveField } from "./semanticPolarity";
import { calculateModifiedLyapunov, normalizeModifiedLyapunov } from "./lyapunovModified";
import { applyLicurgoControl, validateMetrics } from "./licurgoControl";
import { auditMiddleware } from "./middleware/audit";
import { rateLimitMiddleware } from "./middleware/rateLimit";
import { adminRouter } from "./admin";
import { commandRouter } from "./routers/command";
import { cyclesRouter } from "./routers/cycles";
import { healthRouter } from "./routers/health";
import { pdfRouter } from "./routers/pdf";
import { argosRouter } from "./routers/argos";
import { protocolRouter } from "./routers/protocol";
import { protocolEvents } from "../drizzle/schema";
import { SystemEvents, EVENTS } from "./infra/events";

// Procedimientos con auditoría y rate limiting
const auditedProcedure = protectedProcedure.use(auditMiddleware).use(rateLimitMiddleware());

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
    create: auditedProcedure
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
    get: auditedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        return await getSession(input.sessionId);
      }),
    
    /**
     * Listar todas las sesiones del usuario
     */
    list: auditedProcedure
      .query(async ({ ctx }) => {
        return await getUserSessions(ctx.user.id);
      }),
    
    /**
     * Cambiar el modo de control de una sesión
     */
    toggleMode: auditedProcedure
      .input(z.object({
        sessionId: z.number(),
        plantProfile: z.enum(["tipo_a", "tipo_b", "acoplada"]),
      }))
      .mutation(async ({ input }) => {
        await updateSessionMode(input.sessionId, input.plantProfile);
        return { success: true };
      }),
    
    /**
     * Exportar sesión como PDF con análisis completo
     */
    exportPDF: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input }) => {
        const session = await getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
        }
        
        const messages = await getSessionMessages(input.sessionId);
        const metrics = await getSessionMetrics(input.sessionId);
        const markers = await getTimeMarkersBySession(input.sessionId);
        
        // Calcular estadísticas descriptivas
        const vValues = metrics.map(m => m.funcionLyapunov);
        const omegaValues = metrics.map(m => m.coherenciaObservable);
        const errorValues = metrics.map(m => m.errorCognitivoMagnitud);
        
        const calculateStats = (values: number[]) => {
          if (values.length === 0) return { mean: 0, std: 0, min: 0, max: 0 };
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const std = Math.sqrt(variance);
          return {
            mean: Number(mean.toFixed(4)),
            std: Number(std.toFixed(4)),
            min: Number(Math.min(...values).toFixed(4)),
            max: Number(Math.max(...values).toFixed(4)),
          };
        };
        
        // Calcular TPR (tiempo en régimen estable: Ω > 0.7)
        const stableSteps = metrics.filter(m => m.coherenciaObservable > 0.7).length;
        const tprPercent = metrics.length > 0 ? (stableSteps / metrics.length) * 100 : 0;
        
        return {
          session: {
            id: session.id,
            createdAt: session.createdAt,
            plantProfile: session.plantProfile,
            purpose: session.purpose,
            limits: session.limits,
            ethics: session.ethics,
            tprCurrent: session.tprCurrent,
            tprMax: session.tprMax,
          },
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            plantProfile: m.plantProfile,
          })),
          metrics: metrics.map(m => ({
            timestamp: m.timestamp,
            errorNorm: m.errorCognitivoMagnitud,
            funcionLyapunov: m.funcionLyapunov,
            coherenciaObservable: m.coherenciaObservable,
            entropiaH: m.entropiaH,
            coherenciaInternaC: m.coherenciaInternaC,
          })),
          statistics: {
            lyapunov: calculateStats(vValues),
            omega: calculateStats(omegaValues),
            error: calculateStats(errorValues),
            tprPercent: Number(tprPercent.toFixed(2)),
            totalSteps: metrics.length,
            totalMessages: messages.length,
          },
          markers: markers.map(m => ({
            id: m.id,
            messageIndex: m.messageIndex,
            markerType: m.markerType,
            title: m.title,
            description: m.description || "",
            createdAt: m.createdAt,
          })),
        };
      }),
    
    /**
     * Exportar análisis comparativo de dos sesiones como PDF
     */
    exportComparativeDual: protectedProcedure
      .input(z.object({ 
        sessionId1: z.number(),
        sessionId2: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Obtener datos de ambas sesiones
        const [session1, session2] = await Promise.all([
          getSession(input.sessionId1),
          getSession(input.sessionId2),
        ]);
        
        if (!session1 || !session2) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Una o ambas sesiones no fueron encontradas" });
        }
        
        const [messages1, messages2, metrics1, metrics2] = await Promise.all([
          getSessionMessages(input.sessionId1),
          getSessionMessages(input.sessionId2),
          getSessionMetrics(input.sessionId1),
          getSessionMetrics(input.sessionId2),
        ]);
        
        // Función helper para calcular estadísticas
        const calculateStats = (values: number[]) => {
          if (values.length === 0) return { mean: 0, std: 0, min: 0, max: 0 };
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const std = Math.sqrt(variance);
          return {
            mean: Number(mean.toFixed(4)),
            std: Number(std.toFixed(4)),
            min: Number(Math.min(...values).toFixed(4)),
            max: Number(Math.max(...values).toFixed(4)),
          };
        };
        
        // Calcular estadísticas para sesión 1
        const vValues1 = metrics1.map(m => m.funcionLyapunov);
        const omegaValues1 = metrics1.map(m => m.coherenciaObservable);
        const errorValues1 = metrics1.map(m => m.errorCognitivoMagnitud);
        const stableSteps1 = metrics1.filter(m => m.coherenciaObservable > 0.7).length;
        const tprPercent1 = metrics1.length > 0 ? (stableSteps1 / metrics1.length) * 100 : 0;
        
        // Calcular estadísticas para sesión 2
        const vValues2 = metrics2.map(m => m.funcionLyapunov);
        const omegaValues2 = metrics2.map(m => m.coherenciaObservable);
        const errorValues2 = metrics2.map(m => m.errorCognitivoMagnitud);
        const stableSteps2 = metrics2.filter(m => m.coherenciaObservable > 0.7).length;
        const tprPercent2 = metrics2.length > 0 ? (stableSteps2 / metrics2.length) * 100 : 0;
        
        // Analizar diferencias entre respuestas
        const assistantMessages1 = messages1.filter(m => m.role === "assistant");
        const assistantMessages2 = messages2.filter(m => m.role === "assistant");
        const minLength = Math.min(assistantMessages1.length, assistantMessages2.length);
        
        const differences = [];
        for (let i = 0; i < minLength; i++) {
          const msg1 = assistantMessages1[i];
          const msg2 = assistantMessages2[i];
          
          if (!msg1 || !msg2) continue;
          
          const lengthDiff = Math.abs(msg1.content.length - msg2.content.length);
          const lengthDiffPercent = (lengthDiff / Math.max(msg1.content.length, msg2.content.length)) * 100;
          
          // Calcular similitud semántica
          const similarity = await calculateCosineSimilarity(msg1.content, msg2.content);
          
          differences.push({
            index: i,
            lengthDiff,
            lengthDiffPercent: Number(lengthDiffPercent.toFixed(2)),
            semanticSimilarity: Number(similarity.toFixed(4)),
          });
        }
        
        // Calcular similitud promedio
        const avgSimilarity = differences.length > 0
          ? differences.reduce((sum, d) => sum + d.semanticSimilarity, 0) / differences.length
          : 0;
        
        return {
          sessions: [
            {
              id: session1.id,
              createdAt: session1.createdAt,
              plantProfile: session1.plantProfile,
              purpose: session1.purpose,
              limits: session1.limits,
              ethics: session1.ethics,
              tprCurrent: session1.tprCurrent,
              tprMax: session1.tprMax,
            },
            {
              id: session2.id,
              createdAt: session2.createdAt,
              plantProfile: session2.plantProfile,
              purpose: session2.purpose,
              limits: session2.limits,
              ethics: session2.ethics,
              tprCurrent: session2.tprCurrent,
              tprMax: session2.tprMax,
            },
          ],
          statistics: [
            {
              lyapunov: calculateStats(vValues1),
              omega: calculateStats(omegaValues1),
              error: calculateStats(errorValues1),
              tprPercent: Number(tprPercent1.toFixed(2)),
              totalSteps: metrics1.length,
            },
            {
              lyapunov: calculateStats(vValues2),
              omega: calculateStats(omegaValues2),
              error: calculateStats(errorValues2),
              tprPercent: Number(tprPercent2.toFixed(2)),
              totalSteps: metrics2.length,
            },
          ],
          metrics: [
            metrics1.map(m => ({
              timestamp: m.timestamp,
              errorNorm: m.errorCognitivoMagnitud,
              funcionLyapunov: m.funcionLyapunov,
              coherenciaObservable: m.coherenciaObservable,
            })),
            metrics2.map(m => ({
              timestamp: m.timestamp,
              errorNorm: m.errorCognitivoMagnitud,
              funcionLyapunov: m.funcionLyapunov,
              coherenciaObservable: m.coherenciaObservable,
            })),
          ],
          differences,
          comparison: {
            avgSemanticSimilarity: Number(avgSimilarity.toFixed(4)),
            significantDifferences: differences.filter(d => d.semanticSimilarity < 0.7).length,
            totalComparisons: differences.length,
          },
        };
      }),
    
    /**
     * Exportar análisis comparativo de tres sesiones como PDF
     */
    exportComparativeTriple: protectedProcedure
      .input(z.object({ 
        sessionId1: z.number(),
        sessionId2: z.number(),
        sessionId3: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Obtener datos de las tres sesiones
        const [session1, session2, session3] = await Promise.all([
          getSession(input.sessionId1),
          getSession(input.sessionId2),
          getSession(input.sessionId3),
        ]);
        
        if (!session1 || !session2 || !session3) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Una o más sesiones no fueron encontradas" });
        }
        
        const [messages1, messages2, messages3, metrics1, metrics2, metrics3] = await Promise.all([
          getSessionMessages(input.sessionId1),
          getSessionMessages(input.sessionId2),
          getSessionMessages(input.sessionId3),
          getSessionMetrics(input.sessionId1),
          getSessionMetrics(input.sessionId2),
          getSessionMetrics(input.sessionId3),
        ]);
        
        // Función helper para calcular estadísticas
        const calculateStats = (values: number[]) => {
          if (values.length === 0) return { mean: 0, std: 0, min: 0, max: 0 };
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const std = Math.sqrt(variance);
          return {
            mean: Number(mean.toFixed(4)),
            std: Number(std.toFixed(4)),
            min: Number(Math.min(...values).toFixed(4)),
            max: Number(Math.max(...values).toFixed(4)),
          };
        };
        
        // Calcular estadísticas para cada sesión
        const allMetrics = [metrics1, metrics2, metrics3];
        const statistics = allMetrics.map(metrics => {
          const vValues = metrics.map(m => m.funcionLyapunov);
          const omegaValues = metrics.map(m => m.coherenciaObservable);
          const errorValues = metrics.map(m => m.errorCognitivoMagnitud);
          const stableSteps = metrics.filter(m => m.coherenciaObservable > 0.7).length;
          const tprPercent = metrics.length > 0 ? (stableSteps / metrics.length) * 100 : 0;
          
          return {
            lyapunov: calculateStats(vValues),
            omega: calculateStats(omegaValues),
            error: calculateStats(errorValues),
            tprPercent: Number(tprPercent.toFixed(2)),
            totalSteps: metrics.length,
          };
        });
        
        // Analizar diferencias por pares
        const allMessages = [messages1, messages2, messages3];
        const assistantMessages = allMessages.map(msgs => msgs.filter(m => m.role === "assistant"));
        
        // Calcular similitud para cada par: 1-2, 1-3, 2-3
        const pairs = [
          { idx1: 0, idx2: 1, label: "1-2" },
          { idx1: 0, idx2: 2, label: "1-3" },
          { idx1: 1, idx2: 2, label: "2-3" },
        ];
        
        const pairwiseComparisons = [];
        for (const pair of pairs) {
          const msgs1 = assistantMessages[pair.idx1];
          const msgs2 = assistantMessages[pair.idx2];
          const minLength = Math.min(msgs1!.length, msgs2!.length);
          
          const differences = [];
          for (let i = 0; i < minLength; i++) {
            const msg1 = msgs1![i];
            const msg2 = msgs2![i];
            
            if (!msg1 || !msg2) continue;
            
            const lengthDiff = Math.abs(msg1.content.length - msg2.content.length);
            const lengthDiffPercent = (lengthDiff / Math.max(msg1.content.length, msg2.content.length)) * 100;
            const similarity = await calculateCosineSimilarity(msg1.content, msg2.content);
            
            differences.push({
              index: i,
              lengthDiff,
              lengthDiffPercent: Number(lengthDiffPercent.toFixed(2)),
              semanticSimilarity: Number(similarity.toFixed(4)),
            });
          }
          
          const avgSimilarity = differences.length > 0
            ? differences.reduce((sum, d) => sum + d.semanticSimilarity, 0) / differences.length
            : 0;
          
          pairwiseComparisons.push({
            pair: pair.label,
            differences,
            avgSemanticSimilarity: Number(avgSimilarity.toFixed(4)),
            significantDifferences: differences.filter(d => d.semanticSimilarity < 0.7).length,
            totalComparisons: differences.length,
          });
        }
        
        return {
          sessions: [
            {
              id: session1.id,
              createdAt: session1.createdAt,
              plantProfile: session1.plantProfile,
              purpose: session1.purpose,
              limits: session1.limits,
              ethics: session1.ethics,
              tprCurrent: session1.tprCurrent,
              tprMax: session1.tprMax,
            },
            {
              id: session2.id,
              createdAt: session2.createdAt,
              plantProfile: session2.plantProfile,
              purpose: session2.purpose,
              limits: session2.limits,
              ethics: session2.ethics,
              tprCurrent: session2.tprCurrent,
              tprMax: session2.tprMax,
            },
            {
              id: session3.id,
              createdAt: session3.createdAt,
              plantProfile: session3.plantProfile,
              purpose: session3.purpose,
              limits: session3.limits,
              ethics: session3.ethics,
              tprCurrent: session3.tprCurrent,
              tprMax: session3.tprMax,
            },
          ],
          statistics,
          metrics: [
            metrics1.map(m => ({
              timestamp: m.timestamp,
              errorNorm: m.errorCognitivoMagnitud,
              funcionLyapunov: m.funcionLyapunov,
              coherenciaObservable: m.coherenciaObservable,
            })),
            metrics2.map(m => ({
              timestamp: m.timestamp,
              errorNorm: m.errorCognitivoMagnitud,
              funcionLyapunov: m.funcionLyapunov,
              coherenciaObservable: m.coherenciaObservable,
            })),
            metrics3.map(m => ({
              timestamp: m.timestamp,
              errorNorm: m.errorCognitivoMagnitud,
              funcionLyapunov: m.funcionLyapunov,
              coherenciaObservable: m.coherenciaObservable,
            })),
          ],
          pairwiseComparisons,
        };
      }),
    
    /**
     * Obtener datos completos de múltiples sesiones para comparación
     */
    getMultipleSessions: protectedProcedure
      .input(z.object({
        sessionIds: z.array(z.number()).min(2).max(5),
      }))
      .query(async ({ ctx, input }) => {
        const sessionsData = [];
        
        for (const sessionId of input.sessionIds) {
          const session = await getSession(sessionId);
          if (!session || session.userId !== ctx.user.id) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: `Sesión ${sessionId} no encontrada o no autorizada`,
            });
          }
          
          const metrics = await getSessionMetrics(sessionId);
          const messages = await getSessionMessages(sessionId);
          const markers = await getTimeMarkersBySession(sessionId);
          const alerts = await getSessionAlerts(sessionId);
          
          // Calcular estadísticas
          if (metrics.length > 0) {
            const avgV = metrics.reduce((sum, m) => sum + m.funcionLyapunov, 0) / metrics.length;
            const avgOmega = metrics.reduce((sum, m) => sum + m.coherenciaObservable, 0) / metrics.length;
            const avgError = metrics.reduce((sum, m) => sum + m.errorCognitivoMagnitud, 0) / metrics.length;
            const stableSteps = metrics.filter(m => m.coherenciaObservable > 0.7).length;
            const tpr = (stableSteps / metrics.length) * 100;
            
            sessionsData.push({
              session,
              metrics,
              messages,
              markers,
              alerts,
              stats: {
                avgV: Number(avgV.toFixed(4)),
                avgOmega: Number(avgOmega.toFixed(4)),
                avgError: Number(avgError.toFixed(4)),
                tpr: Number(tpr.toFixed(2)),
                duration: metrics.length,
                markerCount: markers.length,
                alertCount: alerts.length,
              },
            });
          }
        }
        
        return sessionsData;
      }),
  }),
  
  conversation: router({
    /**
     * Enviar un mensaje y obtener respuesta del LLM con métricas de control
     */
    sendMessage: auditedProcedure
      .input(z.object({
        sessionId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const session = await getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
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
        
        // Invocar el LLM (respuesta sin control)
        const startTime = Date.now();
        const response = await invokeLLM({ messages });
        const latencyMs = Date.now() - startTime;
        
        const messageContent = response.choices[0]?.message?.content;
        let assistantContent = typeof messageContent === 'string' ? messageContent : "Error al generar respuesta";
        
        // Capturar uso de tokens
        const tokenCount = response.usage?.total_tokens || 0;
        
        // Calcular métricas preliminares usando el puente semántico
        const referenceText = `Propósito: ${session.purpose}\nLímites: ${session.limits}\nÉtica: ${session.ethics}`;
        const applyControl = session.plantProfile === "acoplada";
        let metrics = calculateMetricsSimplified(
          referenceText,
          assistantContent,
          "uncontrolled"
        );
        
        // Calcular polaridad semántica σ_sem
        const sigmaSem = await analyzeSemanticPolarity(assistantContent, {
          purpose: session.purpose,
          limits: session.limits,
          ethics: session.ethics,
        });
        
        // Calcular campo efectivo ε_eff = Ω(t) × σ_sem(t)
        const epsilonEff = calculateEffectiveField(metrics.coherenciaObservable, sigmaSem);
        
        // Calcular V_modificada = V_base - α × ε_eff
        const alpha = session.alphaPenalty || 0.3;
        const vModified = calculateModifiedLyapunov(
          metrics.funcionLyapunov,
          epsilonEff,
          alpha
        );
        const vModifiedNormalized = normalizeModifiedLyapunov(vModified);
        
        // Validar rangos de métricas
        const validation = validateMetrics({
          vBase: metrics.funcionLyapunov,
          vModified: vModifiedNormalized,
          omega: metrics.coherenciaObservable,
          sigmaSem,
          epsilonEff,
        });
        
        if (!validation.valid) {
          console.warn("[Métricas fuera de rango]", validation.warnings);
        }
        
        // Aplicar control LICURGO v2.0 si el perfil es "acoplada"
        let controlAction: { type: "none" | "position" | "structure" | "combined"; magnitude: number } = { type: "none", magnitude: 0 };
        if (applyControl) {
          const controlResult = await applyLicurgoControl({
            errorMagnitude: metrics.errorCognitivoMagnitud,
            stabilityRadius: session.stabilityRadius,
            epsilonEff,
            sigmaSem,
            omega: metrics.coherenciaObservable,
            ontology: {
              purpose: session.purpose,
              limits: session.limits,
              ethics: session.ethics,
            },
            userMessage: input.content,
            plantResponse: assistantContent,
          });
          
          if (controlResult.type !== "none") {
            assistantContent = controlResult.controlledMessage;
            controlAction = {
              type: controlResult.type,
              magnitude: controlResult.magnitude,
            };
            console.log(`[LICURGO v2.0] ${controlResult.reasoning}`);
            
            // Recalcular métricas con respuesta controlada
            metrics = calculateMetricsSimplified(
              referenceText,
              assistantContent,
              "controlled"
            );
          }
        }
        
        // Guardar respuesta del asistente (controlada si aplica)
        const assistantMessageId = await createMessage({
          sessionId: input.sessionId,
          role: "assistant",
          content: assistantContent,
          plantProfile: session.plantProfile,
        });
        
        // Guardar métricas en la base de datos
        await createMetric({
          sessionId: input.sessionId,
          messageId: assistantMessageId,
          ...metrics,
          signoSemantico: sigmaSem,
          campoEfectivo: epsilonEff,
          funcionLyapunovModificada: vModifiedNormalized,
        });
        
        // Emitir evento MESSAGE_CREATED para observador ARGOS
        SystemEvents.emit(EVENTS.MESSAGE_CREATED, {
          messageId: assistantMessageId,
          tokenCount,
          latencyMs,
        });
        
        // Ejecutar protocolo COM-72: Verificar coherencia
        try {
          const db = await getDb();
          if (db) {
            const coherenceScore = metrics.coherenciaObservable;
            const stabilityScore = metrics.funcionLyapunov;
            
            let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
            let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
            
            if (coherenceScore < 0.3) {
              status = 'FAIL';
              severity = 'CRITICAL';
            } else if (coherenceScore < 0.6) {
              status = 'WARNING';
              severity = 'MEDIUM';
            }
            
            const eventData = {
              coherence: coherenceScore,
              stability: stabilityScore,
              threshold: { critical: 0.3, warning: 0.6, nominal: 0.6 },
              timestamp: new Date().toISOString()
            };
            
            await db.insert(protocolEvents).values({
              protocol: 'COM-72',
              eventType: 'coherence_check',
              sessionId: input.sessionId,
              messageId: assistantMessageId,
              eventData: JSON.stringify(eventData),
              coherenceScore: coherenceScore.toString(),
              stabilityScore: stabilityScore.toString(),
              status,
              severity,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error('[COM-72] Error al registrar evento de coherencia:', error);
        }
        
        // Ejecutar protocolo ETH-01: Evaluación ética
        try {
          const db = await getDb();
          if (db) {
            const errorNorm = metrics.errorCognitivoMagnitud;
            
            let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
            let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
            
            if (errorNorm > 0.7) {
              status = 'FAIL';
              severity = 'CRITICAL';
            } else if (errorNorm > 0.5) {
              status = 'WARNING';
              severity = 'MEDIUM';
            }
            
            const eventData = {
              errorNorm,
              bucefaloEthics: session.ethics.substring(0, 100),
              threshold: { critical: 0.7, warning: 0.5, nominal: 0.5 },
              timestamp: new Date().toISOString()
            };
            
            await db.insert(protocolEvents).values({
              protocol: 'ETH-01',
              eventType: 'ethical_evaluation',
              sessionId: input.sessionId,
              messageId: assistantMessageId,
              eventData: JSON.stringify(eventData),
              ethicalScore: errorNorm.toString(),
              status,
              severity,
              timestamp: new Date(),
            });
          }
        } catch (error) {
          console.error('[ETH-01] Error al registrar evaluación ética:', error);
        }
        
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
          metrics: {
            ...metrics,
            signoSemantico: sigmaSem,
            campoEfectivo: epsilonEff,
            funcionLyapunovModificada: vModifiedNormalized,
          },
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
          throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
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
    
    /**
     * Enviar el mismo mensaje a múltiples sesiones simultáneamente
     * Útil para vista comparativa
     */
    sendToMultiple: protectedProcedure
      .input(z.object({
        sessionIds: z.array(z.number()).min(2).max(4),
        content: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const results = [];
        
        // Procesar cada sesión en paralelo
        for (const sessionId of input.sessionIds) {
          const session = await getSession(sessionId);
          if (!session) {
            results.push({
              sessionId,
              success: false,
              error: "Sesión no encontrada",
            });
            continue;
          }
          
          try {
            // Guardar mensaje del usuario
            await createMessage({
              sessionId,
              role: "user",
              content: input.content,
            });
            
            // Obtener historial de mensajes
            const history = await getSessionMessages(sessionId);
            
            // Construir el contexto de la conversación
            const messages = history.map(msg => ({
              role: msg.role as "user" | "assistant" | "system",
              content: msg.content,
            }));
            
            // Agregar el mensaje actual
            let userPrompt = input.content;
            
            // Si está en régimen acoplado (CAELION), aplicar el control
            if (session.plantProfile === "acoplada") {
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
              sessionId,
              role: "assistant",
              content: assistantContent,
              plantProfile: session.plantProfile,
            });
            
            // Calcular métricas usando el puente semántico
            const referenceText = `Propósito: ${session.purpose}\nLímites: ${session.limits}\nÉtica: ${session.ethics}`;
            const applyControl = session.plantProfile === "acoplada";
            const metrics = calculateMetricsSimplified(
              referenceText,
              assistantContent,
              applyControl ? "controlled" : "uncontrolled"
            );
            
            // Guardar métricas en la base de datos
            await createMetric({
              sessionId,
              messageId: assistantMessageId,
              ...metrics,
            });
            
            // Actualizar TPR (Tiempo de Permanencia en Régimen)
            await updateTPR(
              sessionId,
              metrics.errorCognitivoMagnitud,
              session.stabilityRadius
            );
            
            // Obtener la sesión actualizada con TPR
            const updatedSession = await getSession(sessionId);
            
            results.push({
              sessionId,
              success: true,
              messageId: assistantMessageId,
              content: assistantContent,
              metrics,
              tpr: {
                current: updatedSession?.tprCurrent || 0,
                max: updatedSession?.tprMax || 0,
                stabilityRadius: session.stabilityRadius,
              },
            });
          } catch (error) {
            results.push({
              sessionId,
              success: false,
              error: error instanceof Error ? error.message : "Error desconocido",
            });
          }
        }
        
        return { results };
      }),
    
    /**
     * Analizar diferencias entre respuestas de dos sesiones
     */
    analyzeDifferences: protectedProcedure
      .input(z.object({ 
        sessionLeftId: z.number(), 
        sessionRightId: z.number() 
      }))
      .query(async ({ input }) => {
        const messagesLeft = await getSessionMessages(input.sessionLeftId);
        const messagesRight = await getSessionMessages(input.sessionRightId);
        
        // Filtrar solo respuestas del asistente
        const assistantLeft = messagesLeft.filter(m => m.role === "assistant");
        const assistantRight = messagesRight.filter(m => m.role === "assistant");
        
        // Analizar diferencias para cada par de respuestas
        const differences = [];
        const minLength = Math.min(assistantLeft.length, assistantRight.length);
        
        for (let i = 0; i < minLength; i++) {
          const left = assistantLeft[i];
          const right = assistantRight[i];
          
          if (!left || !right) continue;
          
          // Calcular diferencia de longitud
          const lengthLeft = left.content.length;
          const lengthRight = right.content.length;
          const lengthDiff = Math.abs(lengthLeft - lengthRight);
          const lengthDiffPercent = (lengthDiff / Math.max(lengthLeft, lengthRight)) * 100;
          
          // Calcular diferencia de palabras
          const wordsLeft = left.content.split(/\s+/).length;
          const wordsRight = right.content.split(/\s+/).length;
          const wordsDiff = Math.abs(wordsLeft - wordsRight);
          
          // Detectar diferencias estructurales
          const hasListLeft = /[-*]\s/.test(left.content) || /\d+\.\s/.test(left.content);
          const hasListRight = /[-*]\s/.test(right.content) || /\d+\.\s/.test(right.content);
          const structuralDiff = hasListLeft !== hasListRight;
          
          // Determinar si hay divergencia significativa
          const isSignificant = lengthDiffPercent > 30 || wordsDiff > 50 || structuralDiff;
          
          differences.push({
            index: i,
            messageIdLeft: left.id,
            messageIdRight: right.id,
            lengthLeft,
            lengthRight,
            lengthDiff,
            lengthDiffPercent: Math.round(lengthDiffPercent),
            wordsLeft,
            wordsRight,
            wordsDiff,
            structuralDiff,
            isSignificant,
          });
        }
        
        // Calcular estadísticas agregadas
        const avgLengthDiff = differences.reduce((sum, d) => sum + d.lengthDiff, 0) / differences.length;
        const significantCount = differences.filter(d => d.isSignificant).length;
        
        return {
          differences,
          summary: {
            totalPairs: differences.length,
            significantDifferences: significantCount,
            significantPercent: Math.round((significantCount / differences.length) * 100),
            avgLengthDiff: Math.round(avgLengthDiff),
          },
        };
      }),
    
    /**
     * Analizar diferencias por pares entre tres sesiones
     */
    analyzeTripleDifferences: protectedProcedure
      .input(z.object({
        sessionId1: z.number(),
        sessionId2: z.number(),
        sessionId3: z.number(),
      }))
      .query(async ({ input }) => {
        // Obtener mensajes de las tres sesiones
        const [messages1, messages2, messages3] = await Promise.all([
          getSessionMessages(input.sessionId1),
          getSessionMessages(input.sessionId2),
          getSessionMessages(input.sessionId3),
        ]);
        
        // Filtrar solo mensajes del asistente
        const assistant1 = messages1.filter(m => m.role === "assistant");
        const assistant2 = messages2.filter(m => m.role === "assistant");
        const assistant3 = messages3.filter(m => m.role === "assistant");
        
        // Función helper para calcular diferencias entre dos listas de mensajes
        const calculatePairDifferences = async (left: typeof assistant1, right: typeof assistant1) => {
          const differences = [];
          const maxLength = Math.max(left.length, right.length);
          
          for (let i = 0; i < maxLength; i++) {
            const msgLeft = left[i];
            const msgRight = right[i];
            
            if (!msgLeft || !msgRight) continue;
            
            const lengthLeft = msgLeft.content.length;
            const lengthRight = msgRight.content.length;
            const lengthDiff = Math.abs(lengthLeft - lengthRight);
            const lengthDiffPercent = (lengthDiff / Math.max(lengthLeft, lengthRight)) * 100;
            
            const wordsLeft = msgLeft.content.split(/\s+/).length;
            const wordsRight = msgRight.content.split(/\s+/).length;
            const wordsDiff = Math.abs(wordsLeft - wordsRight);
            
            // Calcular similitud semántica usando embeddings
            let semanticSimilarity = 0;
            try {
              semanticSimilarity = await calculateCosineSimilarity(msgLeft.content, msgRight.content);
            } catch (error) {
              console.error("Error calculando similitud semántica:", error);
              // Fallback: usar similitud basada en longitud
              semanticSimilarity = Math.min(lengthLeft, lengthRight) / Math.max(lengthLeft, lengthRight);
            }
            
            const isSignificant = lengthDiffPercent > 30 || wordsDiff > 50 || semanticSimilarity < 0.7;
            
            differences.push({
              index: i,
              lengthDiff,
              lengthDiffPercent: Math.round(lengthDiffPercent),
              wordsDiff,
              semanticSimilarity: Math.round(semanticSimilarity * 100) / 100,
              isSignificant,
            });
          }
          
          const avgLengthDiff = differences.length > 0
            ? differences.reduce((sum, d) => sum + d.lengthDiff, 0) / differences.length
            : 0;
          const avgSemanticSimilarity = differences.length > 0
            ? differences.reduce((sum, d) => sum + d.semanticSimilarity, 0) / differences.length
            : 0;
          const significantCount = differences.filter(d => d.isSignificant).length;
          
          return {
            differences,
            avgLengthDiff: Math.round(avgLengthDiff),
            avgSemanticSimilarity: Math.round(avgSemanticSimilarity * 100) / 100,
            significantCount,
            significantPercent: differences.length > 0
              ? Math.round((significantCount / differences.length) * 100)
              : 0,
          };
        };
        
        // Calcular diferencias por pares (ahora async)
        const pair1_2 = await calculatePairDifferences(assistant1, assistant2);
        const pair1_3 = await calculatePairDifferences(assistant1, assistant3);
        const pair2_3 = await calculatePairDifferences(assistant2, assistant3);
        
        return {
          pair1_2,
          pair1_3,
          pair2_3,
          summary: {
            totalPairs: 3,
            avgDivergence: Math.round(
              (pair1_2.significantPercent + pair1_3.significantPercent + pair2_3.significantPercent) / 3
            ),
            maxDivergence: Math.max(
              pair1_2.significantPercent,
              pair1_3.significantPercent,
              pair2_3.significantPercent
            ),
            minDivergence: Math.min(
              pair1_2.significantPercent,
              pair1_3.significantPercent,
              pair2_3.significantPercent
            ),
          },
        };
      }),
    
    /**
     * Exportar sesión como PDF con análisis completo
     */
    exportPDF: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ input }) => {
        const session = await getSession(input.sessionId);
        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
        }
        
        const messages = await getSessionMessages(input.sessionId);
        const metrics = await getSessionMetrics(input.sessionId);
        const markers = await getTimeMarkersBySession(input.sessionId);
        
        // Calcular estadísticas descriptivas
        const vValues = metrics.map(m => m.funcionLyapunov);
        const omegaValues = metrics.map(m => m.coherenciaObservable);
        const errorValues = metrics.map(m => m.errorCognitivoMagnitud);
        
        const calculateStats = (values: number[]) => {
          if (values.length === 0) return { mean: 0, std: 0, min: 0, max: 0 };
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const std = Math.sqrt(variance);
          return {
            mean: Number(mean.toFixed(4)),
            std: Number(std.toFixed(4)),
            min: Number(Math.min(...values).toFixed(4)),
            max: Number(Math.max(...values).toFixed(4)),
          };
        };
        
        // Calcular TPR (tiempo en régimen estable: Ω > 0.7)
        const stableSteps = metrics.filter(m => m.coherenciaObservable > 0.7).length;
        const tprPercent = metrics.length > 0 ? (stableSteps / metrics.length) * 100 : 0;
        
        return {
          session: {
            id: session.id,
            createdAt: session.createdAt,
            plantProfile: session.plantProfile,
            purpose: session.purpose,
            limits: session.limits,
            ethics: session.ethics,
            tprCurrent: session.tprCurrent,
            tprMax: session.tprMax,
          },
          messages: messages.map(m => ({
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
            plantProfile: m.plantProfile,
          })),
          metrics: metrics.map(m => ({
            timestamp: m.timestamp,
            errorNorm: m.errorCognitivoMagnitud,
            funcionLyapunov: m.funcionLyapunov,
            coherenciaObservable: m.coherenciaObservable,
            entropiaH: m.entropiaH,
            coherenciaInternaC: m.coherenciaInternaC,
          })),
          statistics: {
            lyapunov: calculateStats(vValues),
            omega: calculateStats(omegaValues),
            error: calculateStats(errorValues),
            tprPercent: Number(tprPercent.toFixed(2)),
            totalSteps: metrics.length,
            totalMessages: messages.length,
          },
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
        const metrics = await getSessionMetrics(input.sessionId);
        
        // Calcular estado del sistema para cada métrica (autoridad del backend)
        return metrics.map(metric => {
          let state: 'NOMINAL' | 'DRIFT' | 'CRITICAL';
          
          // Lógica de umbrales (solo el backend decide)
          if (metric.funcionLyapunov > 0.8 || metric.coherenciaObservable < 0.3) {
            state = 'CRITICAL';
          } else if (metric.funcionLyapunov > 0.5 || metric.coherenciaObservable < 0.6) {
            state = 'DRIFT';
          } else {
            state = 'NOMINAL';
          }
          
          return {
            ...metric,
            state,
          };
        });
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
    
    /**
     * Obtener historial completo de métricas con timestamps para reproducción
     */
    getTimeSeriesHistory: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input }) => {
        const metrics = await getSessionMetrics(input.sessionId);
        const messages = await getSessionMessages(input.sessionId);
        const session = await getSession(input.sessionId);
        
        if (!session) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Sesión no encontrada" });
        }
        
        // Construir serie temporal con métricas y mensajes sincronizados
        const timeSeries = metrics.map((metric, index) => {
          // Encontrar el mensaje correspondiente a esta métrica
          const message = messages.find(m => m.id === metric.messageId);
          
          return {
            timestamp: metric.timestamp,
            step: index + 1,
            errorNorm: metric.errorCognitivoMagnitud,
            funcionLyapunov: metric.funcionLyapunov,
            coherenciaObservable: metric.coherenciaObservable,
            controlActionMagnitud: metric.controlActionMagnitud,
            entropiaH: metric.entropiaH,
            coherenciaInternaC: metric.coherenciaInternaC,
            message: message ? {
              role: message.role,
              content: message.content,
              plantProfile: message.plantProfile,
            } : null,
          };
        });
        
        return {
          sessionId: input.sessionId,
          plantProfile: session.plantProfile,
          totalSteps: timeSeries.length,
          duration: timeSeries.length > 0 
            ? new Date(timeSeries[timeSeries.length - 1]!.timestamp).getTime() - new Date(timeSeries[0]!.timestamp).getTime()
            : 0,
          timeSeries,
        };
      }),
  }),

  // ============================================
  // TIME MARKERS: Marcadores temporales para anotaciones
  // ============================================
  
  marker: router({
    /**
     * Crear un nuevo marcador temporal
     */
    create: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        messageIndex: z.number().min(0),
        markerType: z.enum(["colapso_semantico", "recuperacion", "transicion", "observacion"]),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const markerId = await createTimeMarker(input);
        return { id: markerId, ...input };
      }),
    
    /**
     * Listar marcadores de una sesión
     */
    list: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getTimeMarkersBySession(input.sessionId);
      }),
    
    /**
     * Actualizar un marcador existente
     */
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        markerType: z.enum(["colapso_semantico", "recuperacion", "transicion", "observacion"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateTimeMarker(id, updates);
        return { success: true };
      }),
    
    /**
     * Eliminar un marcador
     */
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await deleteTimeMarker(input.id);
        return { success: true };
      }),
  }),

  // ============================================
  // STATS: Estadísticas agregadas del sistema
  // ============================================
  
  stats: router({
    /**
     * Obtener tendencias de TPR por perfil de planta
     */
    getTprTrends: protectedProcedure
      .query(async ({ ctx }) => {
        const sessions = await getUserSessions(ctx.user.id);
        
        // Agrupar por perfil
        const byProfile: Record<string, { tprValues: number[]; count: number }> = {};
        
        for (const session of sessions) {
          if (!byProfile[session.plantProfile]) {
            byProfile[session.plantProfile] = { tprValues: [], count: 0 };
          }
          
          const metrics = await getSessionMetrics(session.id);
          if (metrics.length > 0) {
            const stableSteps = metrics.filter(m => m.coherenciaObservable > 0.7).length;
            const tprPercent = (stableSteps / metrics.length) * 100;
            byProfile[session.plantProfile]!.tprValues.push(tprPercent);
            byProfile[session.plantProfile]!.count++;
          }
        }
        
        // Calcular promedios
        const trends = Object.entries(byProfile).map(([profile, data]) => {
          const avg = data.tprValues.length > 0
            ? data.tprValues.reduce((a, b) => a + b, 0) / data.tprValues.length
            : 0;
          return {
            profile,
            averageTpr: Number(avg.toFixed(2)),
            sessionCount: data.count,
          };
        });
        
        return trends;
      }),
    
    /**
     * Obtener distribución de tipos de marcadores
     */
    getMarkerDistribution: protectedProcedure
      .query(async ({ ctx }) => {
        const sessions = await getUserSessions(ctx.user.id);
        const distribution: Record<string, number> = {
          colapso_semantico: 0,
          recuperacion: 0,
          transicion: 0,
          observacion: 0,
        };
        
        for (const session of sessions) {
          const markers = await getTimeMarkersBySession(session.id);
          for (const marker of markers) {
            distribution[marker.markerType]++;
          }
        }
        
        return Object.entries(distribution).map(([type, count]) => ({
          type,
          count,
        }));
      }),
    
    /**
     * Obtener evolución temporal de métricas promedio
     */
    getMetricsEvolution: protectedProcedure
      .query(async ({ ctx }) => {
        const sessions = await getUserSessions(ctx.user.id);
        
        // Agrupar por fecha (día)
        const byDate: Record<string, {
          lyapunov: number[];
          omega: number[];
          error: number[];
        }> = {};
        
        for (const session of sessions) {
          const dateKey = new Date(session.createdAt).toISOString().split('T')[0]!;
          if (!byDate[dateKey]) {
            byDate[dateKey] = { lyapunov: [], omega: [], error: [] };
          }
          
          const metrics = await getSessionMetrics(session.id);
          for (const metric of metrics) {
            byDate[dateKey]!.lyapunov.push(metric.funcionLyapunov);
            byDate[dateKey]!.omega.push(metric.coherenciaObservable);
            byDate[dateKey]!.error.push(metric.errorCognitivoMagnitud);
          }
        }
        
        // Calcular promedios por día
        const evolution = Object.entries(byDate)
          .map(([date, data]) => ({
            date,
            avgLyapunov: data.lyapunov.length > 0
              ? Number((data.lyapunov.reduce((a, b) => a + b, 0) / data.lyapunov.length).toFixed(4))
              : 0,
            avgOmega: data.omega.length > 0
              ? Number((data.omega.reduce((a, b) => a + b, 0) / data.omega.length).toFixed(4))
              : 0,
            avgError: data.error.length > 0
              ? Number((data.error.reduce((a, b) => a + b, 0) / data.error.length).toFixed(4))
              : 0,
          }))
          .sort((a, b) => a.date.localeCompare(b.date));
        
        return evolution;
      }),
    
    /**
     * Comparar métricas entre períodos temporales
     */
    getTemporalComparison: protectedProcedure
      .input(z.object({
        period: z.enum(["week", "month", "quarter"]), // última semana, mes, 3 meses
      }))
      .query(async ({ ctx, input }) => {
        const now = new Date();
        const sessions = await getUserSessions(ctx.user.id);
        
        // Calcular fechas de corte
        const periodDays = input.period === "week" ? 7 : input.period === "month" ? 30 : 90;
        const currentPeriodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
        const previousPeriodStart = new Date(currentPeriodStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
        
        // Filtrar sesiones por período
        const currentSessions = sessions.filter(s => 
          new Date(s.createdAt) >= currentPeriodStart && new Date(s.createdAt) <= now
        );
        const previousSessions = sessions.filter(s => 
          new Date(s.createdAt) >= previousPeriodStart && new Date(s.createdAt) < currentPeriodStart
        );
        
        // Calcular métricas para ambos períodos
        const calculatePeriodMetrics = async (periodSessions: typeof sessions) => {
          let totalTpr = 0;
          let tprCount = 0;
          let lyapunovValues: number[] = [];
          let omegaValues: number[] = [];
          let errorValues: number[] = [];
          let markerCount = 0;
          
          for (const session of periodSessions) {
            const metrics = await getSessionMetrics(session.id);
            const markers = await getTimeMarkersBySession(session.id);
            
            markerCount += markers.length;
            
            if (metrics.length > 0) {
              const stableSteps = metrics.filter(m => m.coherenciaObservable > 0.7).length;
              const tprPercent = (stableSteps / metrics.length) * 100;
              totalTpr += tprPercent;
              tprCount++;
              
              for (const metric of metrics) {
                lyapunovValues.push(metric.funcionLyapunov);
                omegaValues.push(metric.coherenciaObservable);
                errorValues.push(metric.errorCognitivoMagnitud);
              }
            }
          }
          
          return {
            sessionCount: periodSessions.length,
            avgTpr: tprCount > 0 ? totalTpr / tprCount : 0,
            avgLyapunov: lyapunovValues.length > 0
              ? lyapunovValues.reduce((a, b) => a + b, 0) / lyapunovValues.length
              : 0,
            avgOmega: omegaValues.length > 0
              ? omegaValues.reduce((a, b) => a + b, 0) / omegaValues.length
              : 0,
            avgError: errorValues.length > 0
              ? errorValues.reduce((a, b) => a + b, 0) / errorValues.length
              : 0,
            markerCount,
          };
        };
        
        const currentMetrics = await calculatePeriodMetrics(currentSessions);
        const previousMetrics = await calculatePeriodMetrics(previousSessions);
        
        // Calcular deltas porcentuales
        const calculateDelta = (current: number, previous: number): number => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };
        
        return {
          current: {
            ...currentMetrics,
            avgTpr: Number(currentMetrics.avgTpr.toFixed(2)),
            avgLyapunov: Number(currentMetrics.avgLyapunov.toFixed(4)),
            avgOmega: Number(currentMetrics.avgOmega.toFixed(4)),
            avgError: Number(currentMetrics.avgError.toFixed(4)),
          },
          previous: {
            ...previousMetrics,
            avgTpr: Number(previousMetrics.avgTpr.toFixed(2)),
            avgLyapunov: Number(previousMetrics.avgLyapunov.toFixed(4)),
            avgOmega: Number(previousMetrics.avgOmega.toFixed(4)),
            avgError: Number(previousMetrics.avgError.toFixed(4)),
          },
          deltas: {
            sessionCount: calculateDelta(currentMetrics.sessionCount, previousMetrics.sessionCount),
            avgTpr: calculateDelta(currentMetrics.avgTpr, previousMetrics.avgTpr),
            avgLyapunov: calculateDelta(currentMetrics.avgLyapunov, previousMetrics.avgLyapunov),
            avgOmega: calculateDelta(currentMetrics.avgOmega, previousMetrics.avgOmega),
            avgError: calculateDelta(currentMetrics.avgError, previousMetrics.avgError),
            markerCount: calculateDelta(currentMetrics.markerCount, previousMetrics.markerCount),
          },
        };
      }),
    
    /**
     * Exportar métricas agregadas a CSV
     */
    exportCSV: protectedProcedure
      .query(async ({ ctx }) => {
        const sessions = await getUserSessions(ctx.user.id);
        
        // Preparar datos para CSV
        const csvData = [];
        
        for (const session of sessions) {
          const metrics = await getSessionMetrics(session.id);
          const markers = await getTimeMarkersBySession(session.id);
          const alerts = await getSessionAlerts(session.id);
          
          if (metrics.length === 0) continue;
          
          // Calcular promedios
          const avgV = metrics.reduce((sum, m) => sum + m.funcionLyapunov, 0) / metrics.length;
          const avgOmega = metrics.reduce((sum, m) => sum + m.coherenciaObservable, 0) / metrics.length;
          const avgError = metrics.reduce((sum, m) => sum + m.errorCognitivoMagnitud, 0) / metrics.length;
          
          // Calcular TPR
          const stableSteps = metrics.filter(m => m.coherenciaObservable > 0.7).length;
          const tpr = (stableSteps / metrics.length) * 100;
          
          csvData.push({
            id: session.id,
            fecha: session.createdAt.toISOString(),
            perfil: session.plantProfile,
            tpr: tpr.toFixed(2),
            duracion_pasos: metrics.length,
            avg_lyapunov: avgV.toFixed(4),
            avg_omega: avgOmega.toFixed(4),
            avg_error: avgError.toFixed(4),
            marcadores: markers.length,
            alertas: alerts.length,
          });
        }
        
        // Generar CSV
        const headers = [
          "ID",
          "Fecha",
          "Perfil",
          "TPR (%)",
          "Duración (pasos)",
          "V(e) Promedio",
          "Ω(t) Promedio",
          "||e(t)|| Promedio",
          "Marcadores",
          "Alertas"
        ];
        
        const rows = csvData.map(row => [
          row.id,
          row.fecha,
          row.perfil,
          row.tpr,
          row.duracion_pasos,
          row.avg_lyapunov,
          row.avg_omega,
          row.avg_error,
          row.marcadores,
          row.alertas,
        ]);
        
        const csv = [headers, ...rows]
          .map(row => row.join(","))
          .join("\n");
        
        return { csv };
      }),
  }),

  // ============================================
  // ALERT: Gestión de alertas de anomalías
  // ============================================
  
  alert: router({
    /**
     * Listar alertas activas del usuario
     */
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const alerts = await getUserAlerts(ctx.user.id);
        return alerts.filter((a: any) => !a.dismissed);
      }),
    
    /**
     * Obtener alertas de una sesión específica
     */
    getBySession: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getSessionAlerts(input.sessionId);
      }),
    
    /**
     * Descartar una alerta
     */
    dismiss: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        await dismissAlert(input.id);
        return { success: true };
      }),
    
    /**
     * Ejecutar detección de anomalías en una sesión
     */
    detectAnomalies: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ input }) => {
        await detectAnomalies(input.sessionId);
        return { success: true };
      }),
  }),

  // ============================================
  // EROSION: Dashboard de erosión estructural
  // ============================================
  
  erosion: router({
    /**
     * Obtener historial de ε_eff por sesión
     */
    getSessionErosionHistory: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input, ctx }) => {
        const metrics = await getSessionMetrics(input.sessionId);
        
        // Extraer datos de polaridad y calcular erosión
        const history = metrics.map((m, index) => {
          const sigmaSem = (m as any).signoSemantico || 0;
          const epsilonEff = (m as any).campoEfectivo || 0;
          const vModified = (m as any).funcionLyapunovModificada || m.funcionLyapunov;
          
          return {
            step: index + 1,
            timestamp: m.timestamp,
            // Campos necesarios para LAB
            lyapunovValue: m.funcionLyapunov,
            coherence: m.coherenciaInternaC,
            entropy: m.entropiaH,
            epsilonEff,
            sigmaSem,
            // Campos adicionales para compatibilidad
            vBase: m.funcionLyapunov,
            vModified,
            omega: m.coherenciaObservable,
            errorNorm: m.errorCognitivoMagnitud,
          };
        });
        
        return history;
      }),
    
    /**
     * Obtener eventos de drenaje (ε_eff < -0.2)
     */
    getDrainageEvents: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input, ctx }) => {
        const metrics = await getSessionMetrics(input.sessionId);
        
        const drainageEvents = metrics
          .map((m, index) => {
            const epsilonEff = (m as any).epsilonEff || 0;
            const sigmaSem = (m as any).sigmaSem || 0;
            
            if (epsilonEff < -0.2) {
              // Clasificar severidad
              let severity: "moderate" | "high" | "critical";
              if (epsilonEff < -0.5) severity = "critical";
              else if (epsilonEff < -0.35) severity = "high";
              else severity = "moderate";
              
              return {
                step: index + 1,
                timestamp: m.timestamp,
                epsilonEff,
                sigmaSem,
                severity,
                vModified: (m as any).vModified || m.funcionLyapunov,
              };
            }
            return null;
          })
          .filter((e): e is NonNullable<typeof e> => e !== null);
        
        return drainageEvents;
      }),
    
    /**
     * Obtener estadísticas de efectividad de control LICURGO
     */
    getLicurgoEffectiveness: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ input, ctx }) => {
        const metrics = await getSessionMetrics(input.sessionId);
        
        // Identificar eventos de control (cuando hay cambio significativo en métricas)
        const controlEvents: Array<{
          step: number;
          timestamp: Date;
          epsilonEffBefore: number;
          epsilonEffAfter: number;
          improvement: number;
          vModifiedBefore: number;
          vModifiedAfter: number;
        }> = [];
        
        for (let i = 1; i < metrics.length; i++) {
          const prev = metrics[i - 1];
          const curr = metrics[i];
          
          const epsilonEffBefore = (prev as any).epsilonEff || 0;
          const epsilonEffAfter = (curr as any).epsilonEff || 0;
          
          // Detectar intervención: mejora significativa en ε_eff
          if (epsilonEffBefore < -0.2 && epsilonEffAfter > epsilonEffBefore + 0.15) {
            controlEvents.push({
              step: i + 1,
              timestamp: curr.timestamp,
              epsilonEffBefore,
              epsilonEffAfter,
              improvement: epsilonEffAfter - epsilonEffBefore,
              vModifiedBefore: (prev as any).vModified || prev.funcionLyapunov,
              vModifiedAfter: (curr as any).vModified || curr.funcionLyapunov,
            });
          }
        }
        
        // Calcular estadísticas agregadas
        const totalEvents = controlEvents.length;
        const avgImprovement = totalEvents > 0
          ? controlEvents.reduce((sum, e) => sum + e.improvement, 0) / totalEvents
          : 0;
        const maxImprovement = totalEvents > 0
          ? Math.max(...controlEvents.map(e => e.improvement))
          : 0;
        
        return {
          totalEvents,
          avgImprovement,
          maxImprovement,
          events: controlEvents,
        };
      }),
    
    /**
     * Comparar erosión entre múltiples sesiones
     */
    getComparativeErosion: protectedProcedure
      .input(z.object({ sessionIds: z.array(z.number()).max(5) }))
      .query(async ({ input, ctx }) => {
        // Validar que el array no esté vacío
        if (input.sessionIds.length === 0) {
          return {
            comparisons: [],
            timeSeries: {},
            correlationMatrix: [],
          };
        }
        
        // Verificar que todas las sesiones pertenecen al usuario
        const userSessions = await getUserSessions(ctx.user.id);
        const userSessionIds = new Set(userSessions.map(s => s.id));
        const validSessionIds = input.sessionIds.filter(id => userSessionIds.has(id));
        
        if (validSessionIds.length === 0) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "No tienes acceso a las sesiones solicitadas",
          });
        }
        
        const comparisons = await Promise.all(
          validSessionIds.map(async (sessionId) => {
            const session = await getSession(sessionId);
            
            // Validar que la sesión sea acoplada
            if (session?.plantProfile !== "acoplada") {
              return null;
            }
            const metrics = await getSessionMetrics(sessionId);
            
            // Calcular índice de erosión acumulado
            let erosionIndex = 0;
            const decayFactor = 0.95;
            
            for (const m of metrics) {
              const epsilonEff = (m as any).epsilonEff || 0;
              erosionIndex *= decayFactor;
              
              if (epsilonEff < 0) {
                erosionIndex += Math.abs(epsilonEff);
              } else {
                erosionIndex -= epsilonEff * 0.8;
              }
              
              erosionIndex = Math.max(0, erosionIndex);
            }
            
            // Normalizar
            const normalizedErosion = erosionIndex / (erosionIndex + 3.0);
            
            // Contar eventos de drenaje
            const drainageCount = metrics.filter(m => (m as any).epsilonEff < -0.2).length;
            
            // Calcular promedio de ε_eff
            const avgEpsilonEff = metrics.length > 0
              ? metrics.reduce((sum, m) => sum + ((m as any).epsilonEff || 0), 0) / metrics.length
              : 0;
            
            return {
              sessionId,
              plantProfile: session?.plantProfile || "unknown",
              createdAt: session?.createdAt || new Date(),
              erosionIndex: normalizedErosion,
              drainageCount,
              avgEpsilonEff,
              totalSteps: metrics.length,
            };
          })
        );
        
        // Filtrar sesiones no válidas (null)
        const validComparisons = comparisons.filter(c => c !== null);
        
        if (validComparisons.length === 0) {
          return {
            comparisons: [],
            timeSeries: {},
            correlationMatrix: [],
          };
        }
        
        // Obtener series temporales para cada sesión
        const timeSeries: Record<number, Array<{ step: number; epsilonEff: number }>> = {};
        
        for (const comp of validComparisons) {
          const metrics = await getSessionMetrics(comp.sessionId);
          timeSeries[comp.sessionId] = metrics.map((m, idx) => ({
            step: idx,
            epsilonEff: (m as any).epsilonEff || 0,
          }));
        }
        
        // Calcular matriz de correlación de Pearson
        const correlationMatrix: Array<{ session1: number; session2: number; correlation: number }> = [];
        
        for (let i = 0; i < validComparisons.length; i++) {
          for (let j = i + 1; j < validComparisons.length; j++) {
            const series1 = timeSeries[validComparisons[i].sessionId];
            const series2 = timeSeries[validComparisons[j].sessionId];
            
            // Calcular correlación solo si ambas series tienen datos
            if (series1.length > 0 && series2.length > 0) {
              const minLength = Math.min(series1.length, series2.length);
              const values1 = series1.slice(0, minLength).map(s => s.epsilonEff);
              const values2 = series2.slice(0, minLength).map(s => s.epsilonEff);
              
              // Calcular correlación de Pearson
              const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
              const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
              
              let numerator = 0;
              let sum1Sq = 0;
              let sum2Sq = 0;
              
              for (let k = 0; k < minLength; k++) {
                const diff1 = values1[k] - mean1;
                const diff2 = values2[k] - mean2;
                numerator += diff1 * diff2;
                sum1Sq += diff1 * diff1;
                sum2Sq += diff2 * diff2;
              }
              
              const denominator = Math.sqrt(sum1Sq * sum2Sq);
              const correlation = denominator > 0 ? numerator / denominator : 0;
              
              correlationMatrix.push({
                session1: validComparisons[i].sessionId,
                session2: validComparisons[j].sessionId,
                correlation,
              });
            }
          }
        }
        
        return {
          comparisons: validComparisons,
          timeSeries,
          correlationMatrix,
        };
      }),
    
    /**
     * Obtener tendencias temporales de erosión
     */
    getTemporalTrends: protectedProcedure
      .input(z.object({ 
        granularity: z.enum(["week", "month"]),
      }))
      .query(async ({ input, ctx }) => {
        const sessions = await getUserSessions(ctx.user.id);
        const acopladaSessions = sessions.filter(s => s.plantProfile === "acoplada");
        
        // Si no hay sesiones acopladas, retornar estructura vacía
        if (acopladaSessions.length === 0) {
          return {
            periods: [],
            trendDirection: "stable" as const,
            trendChange: 0,
            recentAvg: 0,
            previousAvg: 0,
            highErosionPeriods: [],
          };
        }
        
        // Calcular índice de erosión para cada sesión
        const sessionsWithErosion = await Promise.all(
          acopladaSessions.map(async (session) => {
            const metrics = await getSessionMetrics(session.id);
            
            // Calcular índice de erosión acumulado
            let erosionIndex = 0;
            const decayFactor = 0.95;
            let drainageCount = 0;
            
            for (const m of metrics) {
              const epsilonEff = (m as any).epsilonEff || 0;
              erosionIndex *= decayFactor;
              
              if (epsilonEff < 0) {
                erosionIndex += Math.abs(epsilonEff);
              } else {
                erosionIndex -= epsilonEff * 0.8;
              }
              
              erosionIndex = Math.max(0, erosionIndex);
              
              if (epsilonEff < -0.2) drainageCount++;
            }
            
            const normalizedErosion = erosionIndex / (erosionIndex + 3.0);
            
            return {
              sessionId: session.id,
              createdAt: session.createdAt,
              erosionIndex: normalizedErosion,
              drainageCount,
              totalSteps: metrics.length,
            };
          })
        );
        
        // Agrupar por período
        const now = new Date();
        const periods: Record<string, {
          label: string;
          startDate: Date;
          endDate: Date;
          sessions: typeof sessionsWithErosion;
          avgErosion: number;
          totalDrainageEvents: number;
          sessionCount: number;
        }> = {};
        
        if (input.granularity === "week") {
          // Últimas 12 semanas
          for (let i = 0; i < 12; i++) {
            const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            const weekSessions = sessionsWithErosion.filter(s => {
              const sessionDate = new Date(s.createdAt);
              return sessionDate >= weekStart && sessionDate < weekEnd;
            });
            
            const avgErosion = weekSessions.length > 0
              ? weekSessions.reduce((sum, s) => sum + s.erosionIndex, 0) / weekSessions.length
              : 0;
            
            const totalDrainageEvents = weekSessions.reduce((sum, s) => sum + s.drainageCount, 0);
            
            const weekLabel = `Semana ${12 - i}`;
            periods[weekLabel] = {
              label: weekLabel,
              startDate: weekStart,
              endDate: weekEnd,
              sessions: weekSessions,
              avgErosion,
              totalDrainageEvents,
              sessionCount: weekSessions.length,
            };
          }
        } else {
          // Últimos 6 meses
          for (let i = 0; i < 6; i++) {
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i - 1, 1);
            
            const monthSessions = sessionsWithErosion.filter(s => {
              const sessionDate = new Date(s.createdAt);
              return sessionDate >= monthStart && sessionDate < monthEnd;
            });
            
            const avgErosion = monthSessions.length > 0
              ? monthSessions.reduce((sum, s) => sum + s.erosionIndex, 0) / monthSessions.length
              : 0;
            
            const totalDrainageEvents = monthSessions.reduce((sum, s) => sum + s.drainageCount, 0);
            
            const monthLabel = monthStart.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
            periods[monthLabel] = {
              label: monthLabel,
              startDate: monthStart,
              endDate: monthEnd,
              sessions: monthSessions,
              avgErosion,
              totalDrainageEvents,
              sessionCount: monthSessions.length,
            };
          }
        }
        
        // Convertir a array y ordenar por fecha
        const periodsArray = Object.values(periods).sort((a, b) => 
          a.startDate.getTime() - b.startDate.getTime()
        );
        
        // Calcular tendencia (comparar últimos 3 períodos vs 3 anteriores)
        const recentPeriods = periodsArray.slice(-3);
        const previousPeriods = periodsArray.slice(-6, -3);
        
        const recentAvg = recentPeriods.length > 0
          ? recentPeriods.reduce((sum, p) => sum + p.avgErosion, 0) / recentPeriods.length
          : 0;
        const previousAvg = previousPeriods.length > 0
          ? previousPeriods.reduce((sum, p) => sum + p.avgErosion, 0) / previousPeriods.length
          : 0;
        
        const trendChange = recentAvg - previousAvg;
        let trendDirection: "ascending" | "descending" | "stable";
        if (Math.abs(trendChange) < 0.05) trendDirection = "stable";
        else if (trendChange > 0) trendDirection = "ascending";
        else trendDirection = "descending";
        
        // Detectar períodos de alta erosión (> 0.5)
        const highErosionPeriods = periodsArray.filter(p => p.avgErosion > 0.5);
        
        // Detección automática de tendencia crítica
        const { hasRecentErosionAlert, createErosionAlert, markErosionAlertNotified } = await import("./db");
        const { notifyOwner } = await import("./_core/notification");
        
        // Umbral crítico: cambio ascendente > 10%
        if (trendDirection === "ascending" && trendChange > 0.1) {
          // Verificar si ya existe una alerta reciente
          const hasRecent = await hasRecentErosionAlert(ctx.user.id, "critical_trend");
          
          if (!hasRecent) {
            // Crear alerta
            const alertId = await createErosionAlert({
              userId: ctx.user.id,
              alertType: "critical_trend",
              severity: trendChange > 0.2 ? "critical" : "high",
              trendChange,
              message: `Tendencia de erosión ascendente crítica detectada: +${(trendChange * 100).toFixed(1)}% en los últimos períodos. Erosión promedio actual: ${(recentAvg * 100).toFixed(1)}%.`,
              notified: false,
              dismissed: false,
            });
            
            // Enviar notificación al propietario
            const notificationSent = await notifyOwner({
              title: "⚠️ Alerta de Erosión Crítica - ARESK-OBS",
              content: `Se ha detectado una tendencia de erosión ascendente crítica en tus sesiones acopladas.\n\n` +
                      `📈 Cambio de tendencia: +${(trendChange * 100).toFixed(1)}%\n` +
                      `🔴 Erosión promedio actual: ${(recentAvg * 100).toFixed(1)}%\n` +
                      `🔵 Erosión promedio anterior: ${(previousAvg * 100).toFixed(1)}%\n\n` +
                      `Revisa el dashboard de erosión para más detalles: /erosion`,
            });
            
            // Marcar como notificada si se envió correctamente
            if (notificationSent) {
              await markErosionAlertNotified(alertId);
            }
          }
        }
        
        return {
          periods: periodsArray,
          trendDirection,
          trendChange,
          recentAvg,
          previousAvg,
          highErosionPeriods: highErosionPeriods.map(p => p.label),
        };
      }),
    
    /**
     * Obtener alertas activas de erosión
     */
    getActiveAlerts: protectedProcedure
      .query(async ({ ctx }) => {
        const { getActiveErosionAlerts } = await import("./db");
        const alerts = await getActiveErosionAlerts(ctx.user.id);
        return alerts.filter(alert => !alert.dismissed);
      }),
    
    /**
     * Marcar alerta como leída
     */
    dismissAlert: protectedProcedure
      .input(z.object({ alertId: z.number() }))
      .mutation(async ({ input }) => {
        const { dismissErosionAlert } = await import("./db");
        await dismissErosionAlert(input.alertId);
        return { success: true };
      }),
    
    // exportDashboardPDF: Eliminado para desbloquear deploy (dependencia nativa canvas)
    // Si se requiere exportación PDF en el futuro, implementar client-side con jsPDF + html2canvas
  }),
  
  // ============================================
  // Admin: Auditoría y monitoreo
  // ============================================
  admin: adminRouter,
  
  // ============================================
  // Marco Legal CAELION: Sistema de comandos
  // ============================================
  command: commandRouter,
  cycles: cyclesRouter,
  health: healthRouter,
  pdf: pdfRouter,
  argos: argosRouter,
  protocol: protocolRouter,
});


export type AppRouter = typeof appRouter;
