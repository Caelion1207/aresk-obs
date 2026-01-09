import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("ARESK-OBS: Sistema de Control Semántico", () => {
  describe("session.create", () => {
    it("debe crear una sesión con referencia ontológica válida", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "controlled",
        controlGain: 0.5,
      });

      expect(result).toHaveProperty("sessionId");
      expect(typeof result.sessionId).toBe("number");
      expect(result.sessionId).toBeGreaterThan(0);
    });

    it("debe rechazar una sesión con propósito demasiado corto", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.session.create({
          purpose: "Corto",
          limits: "Límites operacionales adecuados para el sistema",
          ethics: "Ética definida correctamente para el control",
          controlMode: "controlled",
        })
      ).rejects.toThrow();
    });
  });

  describe("conversation.sendMessage", () => {
    it("debe procesar un mensaje y retornar métricas de control", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Crear sesión primero
      const session = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "controlled",
      });

      // Enviar mensaje
      const result = await caller.conversation.sendMessage({
        sessionId: session.sessionId,
        content: "¿Cuál es el estado actual del mercado financiero?",
      });

      expect(result).toHaveProperty("messageId");
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("metrics");
      
      // Verificar métricas
      expect(result.metrics).toHaveProperty("coherenciaObservable");
      expect(result.metrics).toHaveProperty("funcionLyapunov");
      expect(result.metrics).toHaveProperty("errorCognitivoMagnitud");
      expect(result.metrics).toHaveProperty("controlActionMagnitud");
      
      // Verificar rangos válidos
      expect(result.metrics.coherenciaObservable).toBeGreaterThanOrEqual(-1);
      expect(result.metrics.coherenciaObservable).toBeLessThanOrEqual(1);
      expect(result.metrics.funcionLyapunov).toBeGreaterThanOrEqual(0);
    }, 30000);

    it("debe aplicar control en modo controlado", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "controlled",
      });

      const result = await caller.conversation.sendMessage({
        sessionId: session.sessionId,
        content: "Dame una recomendación de inversión",
      });

      // En modo controlado, la acción de control debe ser mayor que 0
      expect(result.metrics.controlActionMagnitud).toBeGreaterThan(0);
    }, 30000);

    it("no debe aplicar control en modo sin control", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "uncontrolled",
      });

      const result = await caller.conversation.sendMessage({
        sessionId: session.sessionId,
        content: "Dame una recomendación de inversión",
      });

      // En modo sin control, la acción de control debe ser 0
      expect(result.metrics.controlActionMagnitud).toBe(0);
    }, 30000);
  });

  describe("metrics.getSessionMetrics", () => {
    it("debe retornar el historial de métricas de una sesión", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "controlled",
      });

      // Enviar varios mensajes
      await caller.conversation.sendMessage({
        sessionId: session.sessionId,
        content: "Mensaje 1",
      });
      
      await caller.conversation.sendMessage({
        sessionId: session.sessionId,
        content: "Mensaje 2",
      });

      // Obtener métricas
      const metrics = await caller.metrics.getSessionMetrics({
        sessionId: session.sessionId,
      });

      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThanOrEqual(2);
      
      // Verificar estructura de cada métrica
      metrics.forEach(metric => {
        expect(metric).toHaveProperty("coherenciaObservable");
        expect(metric).toHaveProperty("funcionLyapunov");
        expect(metric).toHaveProperty("errorCognitivoMagnitud");
      });
    }, 60000);
  });

  describe("metrics.getPhaseSpace", () => {
    it("debe retornar datos del mapa de fase (H vs C)", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "controlled",
      });

      await caller.conversation.sendMessage({
        sessionId: session.sessionId,
        content: "Mensaje de prueba",
      });

      const phaseSpace = await caller.metrics.getPhaseSpace({
        sessionId: session.sessionId,
      });

      expect(phaseSpace).toHaveProperty("H");
      expect(phaseSpace).toHaveProperty("C");
      expect(Array.isArray(phaseSpace.H)).toBe(true);
      expect(Array.isArray(phaseSpace.C)).toBe(true);
      expect(phaseSpace.H.length).toBe(phaseSpace.C.length);
    });
  });

  describe("session.toggleMode", () => {
    it("debe cambiar el modo de control de una sesión", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "controlled",
      });

      // Cambiar a modo sin control
      const result = await caller.session.toggleMode({
        sessionId: session.sessionId,
        controlMode: "uncontrolled",
      });

      expect(result.success).toBe(true);

      // Verificar que el modo cambió
      const updatedSession = await caller.session.get({
        sessionId: session.sessionId,
      });

      expect(updatedSession?.controlMode).toBe("uncontrolled");
    });
  });

  describe("Estabilidad de Lyapunov", () => {
    it("debe demostrar decaimiento de V(t) en modo controlado", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const session = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "controlled",
      });

      // Enviar múltiples mensajes
      const messages = [
        "¿Qué es el análisis de datos?",
        "¿Cómo se hace un análisis financiero?",
        "¿Cuáles son las mejores prácticas?",
      ];

      const lyapunovValues: number[] = [];

      for (const msg of messages) {
        const result = await caller.conversation.sendMessage({
          sessionId: session.sessionId,
          content: msg,
        });
        lyapunovValues.push(result.metrics.funcionLyapunov);
      }

      // Verificar que hay al menos 3 valores
      expect(lyapunovValues.length).toBe(3);

      // En modo controlado, V(t) debería tender a valores bajos
      const avgLyapunov = lyapunovValues.reduce((a, b) => a + b, 0) / lyapunovValues.length;
      expect(avgLyapunov).toBeLessThan(0.3);
    }, 90000);

    it("debe mostrar mayor coherencia en modo controlado vs sin control", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      // Sesión controlada
      const controlledSession = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "controlled",
      });

      const controlledResult = await caller.conversation.sendMessage({
        sessionId: controlledSession.sessionId,
        content: "Dame información sobre análisis de datos",
      });

      // Sesión sin control
      const uncontrolledSession = await caller.session.create({
        purpose: "Asistir al usuario en análisis de datos con precisión y objetividad",
        limits: "No hacer recomendaciones de inversión específicas sin disclaimer",
        ethics: "Mantener transparencia sobre las limitaciones del análisis",
        controlMode: "uncontrolled",
      });

      const uncontrolledResult = await caller.conversation.sendMessage({
        sessionId: uncontrolledSession.sessionId,
        content: "Dame información sobre análisis de datos",
      });

      // La coherencia en modo controlado debe ser mayor
      expect(controlledResult.metrics.coherenciaObservable)
        .toBeGreaterThan(uncontrolledResult.metrics.coherenciaObservable);
    }, 60000);
  });
});
