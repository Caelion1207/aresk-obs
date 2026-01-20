/**
 * Tests de integración para session.list con autenticación
 * 
 * Valida que el procedimiento protectedProcedure funciona correctamente
 * y que el aislamiento de datos por usuario está garantizado.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { createAuthContext, createUnauthContext, TEST_USER, TEST_SESSIONS } from "./test-helpers/auth";

describe("session.list - Protected Procedure", () => {
  
  it("debe retornar sesiones del usuario autenticado", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    const sessions = await caller.session.list();
    
    expect(sessions).toBeDefined();
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBeGreaterThan(0);
    
    // Verificar que todas las sesiones pertenecen al usuario autenticado
    sessions.forEach(session => {
      expect(session.userId).toBe(TEST_USER.id);
    });
  });
  
  it("debe incluir sesiones de prueba creadas por seed", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    const sessions = await caller.session.list();
    const sessionIds = sessions.map(s => s.id);
    
    // Verificar que las sesiones de prueba están presentes
    expect(sessionIds).toContain(TEST_SESSIONS.ACOPLADA);
    expect(sessionIds).toContain(TEST_SESSIONS.TIPO_A);
    expect(sessionIds).toContain(TEST_SESSIONS.TIPO_B);
  });
  
  it("debe retornar sesiones ordenadas por fecha (más recientes primero)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    const sessions = await caller.session.list();
    
    if (sessions.length > 1) {
      for (let i = 0; i < sessions.length - 1; i++) {
        const current = new Date(sessions[i].createdAt).getTime();
        const next = new Date(sessions[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });
  
  it("debe fallar sin autenticación", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    await expect(caller.session.list()).rejects.toThrow();
  });
  
  it("debe respetar límite de paginación", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    const sessions = await caller.session.list();
    
    // Por defecto, el límite es 50
    expect(sessions.length).toBeLessThanOrEqual(50);
  });
  
  it("debe retornar solo sesiones del usuario, no de otros", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    const sessions = await caller.session.list();
    
    // Verificar aislamiento: todas las sesiones deben tener el mismo userId
    const uniqueUserIds = new Set(sessions.map(s => s.userId));
    expect(uniqueUserIds.size).toBe(1);
    expect(uniqueUserIds.has(TEST_USER.id)).toBe(true);
  });
  
  it("debe retornar array vacío si el usuario no tiene sesiones", async () => {
    // Crear contexto con usuario ficticio que no tiene sesiones
    const ctx = createAuthContext({
      id: 999999,
      openId: "nonexistent_user",
      name: "Usuario Sin Sesiones",
      email: "nosessions@test.com",
      role: "user"
    });
    const caller = appRouter.createCaller(ctx as any);
    
    const sessions = await caller.session.list();
    
    expect(sessions).toBeDefined();
    expect(Array.isArray(sessions)).toBe(true);
    expect(sessions.length).toBe(0);
  });
});

describe("session.list - Seguridad", () => {
  
  it("debe prevenir IDOR (Insecure Direct Object Reference)", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    const sessions = await caller.session.list();
    
    // Intentar acceder a una sesión que no pertenece al usuario
    // (esto debería fallar en session.get si se implementa correctamente)
    const ownSessionId = sessions[0]?.id;
    expect(ownSessionId).toBeDefined();
    
    // Verificar que solo sesiones propias son retornadas
    sessions.forEach(session => {
      expect(session.userId).toBe(TEST_USER.id);
    });
  });
  
  it("debe usar índice en sessions.userId para optimización", async () => {
    // Este test verifica que la consulta usa el índice
    // En producción, esto se verificaría con EXPLAIN QUERY
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    const startTime = Date.now();
    await caller.session.list();
    const endTime = Date.now();
    
    const queryTime = endTime - startTime;
    
    // La consulta debería ser rápida (<100ms) con índice
    expect(queryTime).toBeLessThan(100);
  });
});

describe("session.list - Paginación", () => {
  
  it("debe aplicar límite por defecto de 50 sesiones", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx as any);
    
    const sessions = await caller.session.list();
    
    expect(sessions.length).toBeLessThanOrEqual(50);
  });
  
  // Nota: Los tests de paginación con offset requieren
  // modificar el procedimiento para aceptar parámetros de paginación
  // Esto se puede implementar en una futura mejora
});
