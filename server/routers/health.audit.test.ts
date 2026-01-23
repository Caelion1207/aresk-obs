/**
 * Tests para endpoint de health check de auditoría
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from '../routers';
import { bootstrapAuditSystem } from '../infra/auditBootstrap';

describe('Health Check de Auditoría', () => {
  beforeAll(async () => {
    // Asegurar que el sistema esté inicializado
    await bootstrapAuditSystem();
  });

  it('debe retornar estado CLOSED_AND_OPERATIONAL', async () => {
    const caller = appRouter.createCaller({} as any);
    const result = await caller.health.audit();

    expect(result.status).toBe('CLOSED_AND_OPERATIONAL');
    expect(result.chainValid).toBe(true);
    expect(result.emergencyMode).toBe(false);
  });

  it('debe retornar hash del génesis', async () => {
    const caller = appRouter.createCaller({} as any);
    const result = await caller.health.audit();

    expect(result.genesisHash).toBeTruthy();
    expect(typeof result.genesisHash).toBe('string');
    expect(result.genesisHash?.length).toBe(64); // SHA-256 hex
  });

  it('debe retornar timestamp fijo del génesis', async () => {
    const caller = appRouter.createCaller({} as any);
    const result = await caller.health.audit();

    expect(result.genesisTimestamp).toBe('2026-01-23T00:00:00.000Z');
  });

  it('debe retornar número total de logs', async () => {
    const caller = appRouter.createCaller({} as any);
    const result = await caller.health.audit();

    expect(result.totalLogs).toBeGreaterThan(0);
    expect(typeof result.totalLogs).toBe('number');
  });

  it('debe retornar timestamp de última verificación', async () => {
    const caller = appRouter.createCaller({} as any);
    const result = await caller.health.audit();

    expect(result.lastCheck).toBeTruthy();
    
    // Verificar que es un timestamp válido
    const checkDate = new Date(result.lastCheck);
    expect(checkDate.toString()).not.toBe('Invalid Date');
    
    // Verificar que es reciente (menos de 1 minuto)
    const now = new Date();
    const diff = now.getTime() - checkDate.getTime();
    expect(diff).toBeLessThan(60000); // 60 segundos
  });

  it('no debe tener detalles de corrupción en estado operacional', async () => {
    const caller = appRouter.createCaller({} as any);
    const result = await caller.health.audit();

    if (result.status === 'CLOSED_AND_OPERATIONAL') {
      expect(result.corruptionDetails).toBeNull();
    }
  });
});
