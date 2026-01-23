import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { protocolEvents, metrics, sessions } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Router de Protocolos CAELION
 * 
 * Implementa endpoints para COM-72, ETH-01 y CMD-01
 */
export const protocolRouter = router({
  /**
   * COM-72: Verificar coherencia de una sesión
   */
  com72: router({
    /**
     * Verificar coherencia actual de una sesión
     */
    verify: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Obtener última métrica de la sesión
        const lastMetric = await db
          .select()
          .from(metrics)
          .where(eq(metrics.sessionId, input.sessionId))
          .orderBy(desc(metrics.timestamp))
          .limit(1);
        
        if (lastMetric.length === 0) {
          throw new Error('No metrics found for session');
        }
        
        const metric = lastMetric[0];
        const coherenceScore = metric.coherenciaObservable; // Ω(t)
        const stabilityScore = metric.funcionLyapunov; // V(e)
        
        // Determinar estado según umbrales
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        
        if (coherenceScore < 0.3) {
          status = 'FAIL';
          severity = 'CRITICAL';
        } else if (coherenceScore < 0.6) {
          status = 'WARNING';
          severity = 'MEDIUM';
        }
        
        // Registrar evento COM-72
        const eventData = {
          coherence: coherenceScore,
          stability: stabilityScore,
          threshold: {
            critical: 0.3,
            warning: 0.6,
            nominal: 0.6
          },
          timestamp: new Date().toISOString()
        };
        
        await db.insert(protocolEvents).values({
          protocol: 'COM-72',
          eventType: 'coherence_check',
          sessionId: input.sessionId,
          messageId: metric.messageId,
          eventData: JSON.stringify(eventData),
          coherenceScore: coherenceScore.toString(),
          stabilityScore: stabilityScore.toString(),
          status,
          severity,
          timestamp: new Date(),
        });
        
        return {
          status,
          severity,
          coherenceScore,
          stabilityScore,
          message: status === 'PASS' 
            ? 'Coherencia dentro de límites nominales'
            : status === 'WARNING'
            ? 'Coherencia en zona de deriva'
            : 'Coherencia crítica - riesgo de colapso'
        };
      }),
    
    /**
     * Obtener historial de eventos COM-72
     */
    getHistory: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        
        if (!db) throw new Error('Database not available');
        
        const events = await db
          .select()
          .from(protocolEvents)
          .where(
            and(
              eq(protocolEvents.sessionId, input.sessionId),
              eq(protocolEvents.protocol, 'COM-72')
            )
          )
          .orderBy(desc(protocolEvents.timestamp))
          .limit(input.limit);
        
        return events.map(event => ({
          id: event.id,
          eventType: event.eventType,
          status: event.status,
          severity: event.severity,
          coherenceScore: parseFloat(event.coherenceScore || '0'),
          stabilityScore: parseFloat(event.stabilityScore || '0'),
          eventData: JSON.parse(event.eventData),
          timestamp: event.timestamp,
        }));
      }),
  }),
  
  /**
   * ETH-01: Evaluación ética
   */
  eth01: router({
    /**
     * Evaluar mensaje contra límites éticos
     */
    evaluate: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        messageId: z.number(),
        messageContent: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Obtener sesión para acceder a Bucéfalo (referencia ética)
        const session = await db
          .select()
          .from(sessions)
          .where(eq(sessions.id, input.sessionId))
          .limit(1);
        
        if (session.length === 0) {
          throw new Error('Session not found');
        }
        
        const bucefaloPurpose = session[0].purpose || '';
        const bucefaloLimits = session[0].limits || '';
        const bucefaloEthics = session[0].ethics || '';
        
        // Obtener métrica asociada al mensaje
        const metric = await db
          .select()
          .from(metrics)
          .where(eq(metrics.messageId, input.messageId))
          .limit(1);
        
        if (metric.length === 0) {
          throw new Error('Metric not found for message');
        }
        
        const errorNorm = metric[0].errorCognitivoMagnitud; // Usar magnitud de error cognitivo
        
        // Determinar estado ético basado en distancia a referencia
        let status: 'PASS' | 'FAIL' | 'WARNING' = 'PASS';
        let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
        
        if (errorNorm > 0.7) {
          status = 'FAIL';
          severity = 'CRITICAL';
        } else if (errorNorm > 0.5) {
          status = 'WARNING';
          severity = 'MEDIUM';
        }
        
        // Registrar evento ETH-01
        const eventData = {
          errorNorm,
          bucefaloEthics: bucefaloEthics.substring(0, 100), // Truncar para JSON
          threshold: {
            critical: 0.7,
            warning: 0.5,
            nominal: 0.5
          },
          timestamp: new Date().toISOString()
        };
        
        await db.insert(protocolEvents).values({
          protocol: 'ETH-01',
          eventType: 'ethical_evaluation',
          sessionId: input.sessionId,
          messageId: input.messageId,
          eventData: JSON.stringify(eventData),
          ethicalScore: errorNorm.toString(),
          status,
          severity,
          timestamp: new Date(),
        });
        
        return {
          status,
          severity,
          ethicalScore: errorNorm,
          message: status === 'PASS'
            ? 'Mensaje dentro de límites éticos'
            : status === 'WARNING'
            ? 'Mensaje en zona de alerta ética'
            : 'Violación ética crítica detectada'
        };
      }),
    
    /**
     * Obtener violaciones éticas
     */
    getViolations: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        
        if (!db) throw new Error('Database not available');
        
        const events = await db
          .select()
          .from(protocolEvents)
          .where(
            and(
              eq(protocolEvents.sessionId, input.sessionId),
              eq(protocolEvents.protocol, 'ETH-01'),
              eq(protocolEvents.status, 'FAIL')
            )
          )
          .orderBy(desc(protocolEvents.timestamp))
          .limit(input.limit);
        
        return events.map(event => ({
          id: event.id,
          messageId: event.messageId,
          severity: event.severity,
          ethicalScore: parseFloat(event.ethicalScore || '0'),
          eventData: JSON.parse(event.eventData),
          timestamp: event.timestamp,
        }));
      }),
  }),
  
  /**
   * CMD-01: Comando y decisión
   */
  cmd01: router({
    /**
     * Registrar decisión de cambio de perfil
     */
    decide: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        decision: z.string(),
        reason: z.string(),
        fromProfile: z.string(),
        toProfile: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error('Database not available');
        
        // Registrar evento CMD-01
        const eventData = {
          decision: input.decision,
          reason: input.reason,
          fromProfile: input.fromProfile,
          toProfile: input.toProfile,
          timestamp: new Date().toISOString()
        };
        
        await db.insert(protocolEvents).values({
          protocol: 'CMD-01',
          eventType: 'decision_made',
          sessionId: input.sessionId,
          eventData: JSON.stringify(eventData),
          status: 'PASS',
          severity: 'LOW',
          timestamp: new Date(),
        });
        
        return {
          success: true,
          message: 'Decisión registrada exitosamente'
        };
      }),
    
    /**
     * Obtener historial de decisiones
     */
    getHistory: protectedProcedure
      .input(z.object({
        sessionId: z.number(),
        limit: z.number().default(50),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        
        if (!db) throw new Error('Database not available');
        
        const events = await db
          .select()
          .from(protocolEvents)
          .where(
            and(
              eq(protocolEvents.sessionId, input.sessionId),
              eq(protocolEvents.protocol, 'CMD-01')
            )
          )
          .orderBy(desc(protocolEvents.timestamp))
          .limit(input.limit);
        
        return events.map(event => ({
          id: event.id,
          eventType: event.eventType,
          eventData: JSON.parse(event.eventData),
          timestamp: event.timestamp,
        }));
      }),
  }),
});
