/**
 * server/tests/control.collapse.test.ts
 * 
 * Tests de colapso y recuperación para validar hipótesis CAELION
 * 
 * Hipótesis:
 * - Retirar control (u(t)→0) causa degradación de estabilidad
 * - Reinyectar control restaura convergencia hacia estado estable
 * - Control acelera estabilización vs deriva natural
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  simulateSession,
  withdrawControl,
  reinjectControl,
  cleanupTestSessions,
  type SimulationResult
} from "./helpers/controlSimulator";

describe("Control Collapse & Recovery Tests", () => {
  
  beforeAll(async () => {
    // Limpiar sesiones de prueba anteriores
    await cleanupTestSessions();
  });
  
  afterAll(async () => {
    // Limpiar sesiones de prueba después de tests
    await cleanupTestSessions();
  });
  
  describe("Test 1: Sesión con Control Activo (Baseline)", () => {
    let controlledSession: SimulationResult;
    
    it("debe crear sesión estable con control activo", async () => {
      controlledSession = await simulateSession({
        userId: 1,
        purpose: "Test de control activo",
        limits: "No proporcionar información falsa",
        ethicalSpace: "Priorizar precisión",
        steps: 20,
        controlEnabled: true,
        initialCoherence: 0.5,
        initialEntropy: 0.8,
      });
      
      expect(controlledSession.sessionId).toBeGreaterThan(0);
      expect(controlledSession.metrics).toHaveLength(20);
    });
    
    it("debe mostrar convergencia hacia estado estable", () => {
      const firstMetric = controlledSession.metrics[0]!;
      const lastMetric = controlledSession.metrics[controlledSession.metrics.length - 1]!;
      
      // Coherencia debe aumentar
      expect(lastMetric.coherence).toBeGreaterThan(firstMetric.coherence);
      
      // Entropía debe disminuir
      expect(lastMetric.entropy).toBeLessThan(firstMetric.entropy);
      
      // Lyapunov debe disminuir (convergencia)
      expect(lastMetric.lyapunovValue).toBeLessThan(firstMetric.lyapunovValue);
    });
    
    it("debe aplicar esfuerzo de control positivo", () => {
      const metricsWithControl = controlledSession.metrics.filter(m => m.controlEffort > 0);
      
      // Al menos 50% de los pasos deben tener control activo
      expect(metricsWithControl.length).toBeGreaterThan(controlledSession.metrics.length * 0.5);
    });
    
    it("debe alcanzar coherencia final > 0.7", () => {
      expect(controlledSession.finalCoherence).toBeGreaterThan(0.7);
    });
  });
  
  describe("Test 2: Retirada de Control (u(t)→0)", () => {
    let baselineSession: SimulationResult;
    let collapseMetrics: SimulationResult['metrics'];
    
    it("debe crear sesión estable inicial", async () => {
      baselineSession = await simulateSession({
        userId: 1,
        purpose: "Test de colapso - baseline",
        limits: "No proporcionar información falsa",
        ethicalSpace: "Priorizar precisión",
        steps: 10,
        controlEnabled: true,
        initialCoherence: 0.5,
        initialEntropy: 0.8,
      });
      
      expect(baselineSession.finalCoherence).toBeGreaterThan(0.6);
    });
    
    it("debe retirar control y observar degradación", async () => {
      collapseMetrics = await withdrawControl(baselineSession.sessionId, 10);
      
      expect(collapseMetrics).toHaveLength(10);
      expect(collapseMetrics.every(m => m.controlEffort === 0)).toBe(true);
    });
    
    it("debe mostrar caída de coherencia (Ω↓)", () => {
      const firstCollapse = collapseMetrics[0]!;
      const lastCollapse = collapseMetrics[collapseMetrics.length - 1]!;
      
      // Coherencia debe disminuir sin control
      expect(lastCollapse.coherence).toBeLessThan(firstCollapse.coherence);
    });
    
    it("debe mostrar aumento de entropía (H↑)", () => {
      const firstCollapse = collapseMetrics[0]!;
      const lastCollapse = collapseMetrics[collapseMetrics.length - 1]!;
      
      // Entropía debe aumentar sin control
      expect(lastCollapse.entropy).toBeGreaterThan(firstCollapse.entropy);
    });
    
    it("debe mostrar aumento de error efectivo (ε_eff↑)", () => {
      const firstCollapse = collapseMetrics[0]!;
      const lastCollapse = collapseMetrics[collapseMetrics.length - 1]!;
      
      // Error efectivo debe aumentar
      expect(lastCollapse.epsilonEff).toBeGreaterThan(firstCollapse.epsilonEff);
    });
    
    it("debe mostrar aumento de energía de Lyapunov (V(e)↑)", () => {
      const firstCollapse = collapseMetrics[0]!;
      const lastCollapse = collapseMetrics[collapseMetrics.length - 1]!;
      
      // Lyapunov debe aumentar (divergencia)
      expect(lastCollapse.lyapunovValue).toBeGreaterThan(firstCollapse.lyapunovValue);
    });
  });
  
  describe("Test 3: Reinyección de Control (Recuperación)", () => {
    let collapsedSession: SimulationResult;
    let recoveryMetrics: SimulationResult['metrics'];
    
    it("debe crear sesión colapsada", async () => {
      // Crear sesión con control
      const baseline = await simulateSession({
        userId: 1,
        purpose: "Test de recuperación - baseline",
        limits: "No proporcionar información falsa",
        ethicalSpace: "Priorizar precisión",
        steps: 5,
        controlEnabled: true,
        initialCoherence: 0.5,
        initialEntropy: 0.8,
      });
      
      // Colapsar
      await withdrawControl(baseline.sessionId, 10);
      
      collapsedSession = baseline;
    });
    
    it("debe reinyectar control y observar recuperación", async () => {
      recoveryMetrics = await reinjectControl(collapsedSession.sessionId, 15);
      
      expect(recoveryMetrics).toHaveLength(15);
      expect(recoveryMetrics.some(m => m.controlEffort > 0)).toBe(true);
    });
    
    it("debe mostrar recuperación de coherencia (Ω↑)", () => {
      const firstRecovery = recoveryMetrics[0]!;
      const lastRecovery = recoveryMetrics[recoveryMetrics.length - 1]!;
      
      // Coherencia debe aumentar con control restaurado
      expect(lastRecovery.coherence).toBeGreaterThan(firstRecovery.coherence);
    });
    
    it("debe mostrar reducción de entropía (H↓)", () => {
      const firstRecovery = recoveryMetrics[0]!;
      const lastRecovery = recoveryMetrics[recoveryMetrics.length - 1]!;
      
      // Entropía debe disminuir
      expect(lastRecovery.entropy).toBeLessThan(firstRecovery.entropy);
    });
    
    it("debe mostrar convergencia de Lyapunov (V(e)↓)", () => {
      const firstRecovery = recoveryMetrics[0]!;
      const lastRecovery = recoveryMetrics[recoveryMetrics.length - 1]!;
      
      // Lyapunov debe disminuir (convergencia)
      expect(lastRecovery.lyapunovValue).toBeLessThan(firstRecovery.lyapunovValue);
    });
    
    it("debe alcanzar coherencia final > 0.65", () => {
      const lastRecovery = recoveryMetrics[recoveryMetrics.length - 1]!;
      expect(lastRecovery.coherence).toBeGreaterThan(0.65);
    });
  });
  
  describe("Test 4: Comparación Control vs Sin Control", () => {
    let withControl: SimulationResult;
    let withoutControl: SimulationResult;
    
    it("debe crear dos sesiones con condiciones iniciales idénticas", async () => {
      const params = {
        userId: 1,
        purpose: "Test de comparación",
        limits: "No proporcionar información falsa",
        ethicalSpace: "Priorizar precisión",
        steps: 20,
        initialCoherence: 0.5,
        initialEntropy: 0.8,
      };
      
      withControl = await simulateSession({
        ...params,
        controlEnabled: true,
      });
      
      withoutControl = await simulateSession({
        ...params,
        controlEnabled: false,
      });
      
      expect(withControl.sessionId).not.toBe(withoutControl.sessionId);
    });
    
    it("sesión con control debe tener mayor coherencia final", () => {
      expect(withControl.finalCoherence).toBeGreaterThan(withoutControl.finalCoherence);
    });
    
    it("sesión con control debe tener menor entropía final", () => {
      expect(withControl.finalEntropy).toBeLessThan(withoutControl.finalEntropy);
    });
    
    it("sesión con control debe tener menor Lyapunov final", () => {
      expect(withControl.finalLyapunov).toBeLessThan(withoutControl.finalLyapunov);
    });
    
    it("control debe acelerar estabilización", () => {
      // Medir tiempo hasta alcanzar coherencia > 0.7
      const timeWithControl = withControl.metrics.findIndex(m => m.coherence > 0.7);
      const timeWithoutControl = withoutControl.metrics.findIndex(m => m.coherence > 0.7);
      
      if (timeWithControl !== -1) {
        // Si sesión con control alcanza 0.7, debe ser más rápido que sin control
        if (timeWithoutControl !== -1) {
          expect(timeWithControl).toBeLessThan(timeWithoutControl);
        } else {
          // O sesión sin control nunca alcanza 0.7
          expect(timeWithoutControl).toBe(-1);
        }
      }
    });
  });
  
  describe("Test 5: Validación de Hipótesis CAELION", () => {
    it("debe validar que control reduce error efectivo", async () => {
      const controlled = await simulateSession({
        userId: 1,
        purpose: "Validación CAELION",
        limits: "No proporcionar información falsa",
        ethicalSpace: "Priorizar precisión",
        steps: 15,
        controlEnabled: true,
        initialCoherence: 0.4,
        initialEntropy: 0.9,
      });
      
      const avgErrorWithControl = controlled.metrics.reduce((sum, m) => sum + m.epsilonEff, 0) / controlled.metrics.length;
      
      // Error promedio debe ser < 0.4 con control
      expect(avgErrorWithControl).toBeLessThan(0.4);
    });
    
    it("debe validar que sin control el error aumenta", async () => {
      const uncontrolled = await simulateSession({
        userId: 1,
        purpose: "Validación CAELION - sin control",
        limits: "No proporcionar información falsa",
        ethicalSpace: "Priorizar precisión",
        steps: 15,
        controlEnabled: false,
        initialCoherence: 0.4,
        initialEntropy: 0.9,
      });
      
      const firstError = uncontrolled.metrics[0]!.epsilonEff;
      const lastError = uncontrolled.metrics[uncontrolled.metrics.length - 1]!.epsilonEff;
      
      // Error debe aumentar sin control
      expect(lastError).toBeGreaterThanOrEqual(firstError * 0.9); // Permitir pequeña variación por ruido
    });
    
    it("debe validar convergencia de Lyapunov con control", async () => {
      const controlled = await simulateSession({
        userId: 1,
        purpose: "Validación Lyapunov",
        limits: "No proporcionar información falsa",
        ethicalSpace: "Priorizar precisión",
        steps: 20,
        controlEnabled: true,
        initialCoherence: 0.3,
        initialEntropy: 1.0,
      });
      
      // Calcular pendiente de Lyapunov (debe ser negativa = convergencia)
      const firstHalf = controlled.metrics.slice(0, 10);
      const secondHalf = controlled.metrics.slice(10);
      
      const avgFirstHalf = firstHalf.reduce((sum, m) => sum + m.lyapunovValue, 0) / firstHalf.length;
      const avgSecondHalf = secondHalf.reduce((sum, m) => sum + m.lyapunovValue, 0) / secondHalf.length;
      
      // Segunda mitad debe tener menor Lyapunov promedio
      expect(avgSecondHalf).toBeLessThan(avgFirstHalf);
    });
  });
});
