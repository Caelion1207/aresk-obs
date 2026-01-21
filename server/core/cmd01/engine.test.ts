import { describe, it, expect, beforeEach } from 'vitest';
import { CmdEngine } from './engine';
import { CycleSelect } from '../../../drizzle/schema';

describe('CmdEngine - Clasificación Determinista', () => {
  const mockCycle: CycleSelect = {
    id: 1,
    protocolId: 'COM-72-01',
    status: 'INIT',
    triggerType: 'SYSTEM',
    objective: 'Test cycle',
    outcome: null,
    startedAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 horas atrás
    scheduledEndAt: new Date(Date.now() + 47 * 60 * 60 * 1000), // 47 horas adelante
    closedAt: null,
  };

  it('debe clasificar comando de ejecución técnica', async () => {
    const result = await CmdEngine.process({
      rawInput: 'ejecutar protocolo de seguridad',
      actor: { id: 1, role: 'admin' }
    }, mockCycle);

    expect(result.status).toBe('DISPATCHED');
    expect(result.protocol).toBe('ARC-06');
    expect(result.intent).toBe('TECHNICAL');
    expect(result.confidence).toBe(1.0);
  });

  it('debe clasificar comando de planificación estratégica', async () => {
    const result = await CmdEngine.process({
      rawInput: 'planificar expansión del sistema',
      actor: { id: 1, role: 'admin' }
    }, mockCycle);

    expect(result.status).toBe('DISPATCHED');
    expect(result.protocol).toBe('ARC-05');
    expect(result.intent).toBe('STRATEGIC');
  });

  it('debe clasificar comando cognitivo', async () => {
    const result = await CmdEngine.process({
      rawInput: 'memorizar contexto de sesión',
      actor: { id: 1, role: 'admin' }
    }, mockCycle);

    expect(result.status).toBe('DISPATCHED');
    expect(result.protocol).toBe('SYN-10');
    expect(result.intent).toBe('COGNITIVE');
  });

  it('debe clasificar comando ético', async () => {
    const result = await CmdEngine.process({
      rawInput: 'validar cumplimiento de restricciones',
      actor: { id: 1, role: 'admin' }
    }, mockCycle);

    expect(result.status).toBe('DISPATCHED');
    expect(result.protocol).toBe('ETH-01');
    expect(result.intent).toBe('ETHICAL');
  });

  it('debe clasificar comando económico', async () => {
    const result = await CmdEngine.process({
      rawInput: 'optimizar costo de operación',
      actor: { id: 1, role: 'admin' }
    }, mockCycle);

    expect(result.status).toBe('DISPATCHED');
    expect(result.protocol).toBe('ARGOS');
    expect(result.intent).toBe('ECONOMIC');
  });

  it('debe rechazar comando sin protocolo identificado', async () => {
    const result = await CmdEngine.process({
      rawInput: '¿qué es la vida?',
      actor: { id: 1, role: 'admin' }
    }, mockCycle);

    expect(result.status).toBe('REJECTED');
    expect(result.protocol).toBe('UNKNOWN');
    expect(result.intent).toBe('PHILOSOPHICAL');
    expect(result.reason).toContain('CMD-01');
  });

  it('debe rechazar ejecución sin ciclo activo', async () => {
    const result = await CmdEngine.process({
      rawInput: 'ejecutar protocolo',
      actor: { id: 1, role: 'admin' }
    }, undefined);

    expect(result.status).toBe('REJECTED');
    expect(result.reason).toContain('COM-72 VIOLATION');
  });

  it('debe rechazar ejecución antes de 24h en INIT', async () => {
    const recentCycle: CycleSelect = {
      ...mockCycle,
      startedAt: new Date(Date.now() - 10 * 60 * 60 * 1000), // Solo 10 horas atrás
    };

    const result = await CmdEngine.process({
      rawInput: 'ejecutar protocolo',
      actor: { id: 1, role: 'admin' }
    }, recentCycle);

    expect(result.status).toBe('REJECTED');
    expect(result.reason).toContain('Context Window Lock');
  });
});
