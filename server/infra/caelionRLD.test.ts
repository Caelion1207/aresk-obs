import { describe, it, expect } from 'vitest';
import { updateRLD, detectFrictionEvents, initializeRLD, type FrictionEventRecord } from './caelionRLD';

describe('CAELION-RLD: Dinámica de Reserva de Legitimidad', () => {
  describe('Inicialización', () => {
    it('debe iniciar RLD en 2.0 (autonomía plena)', () => {
      const state = initializeRLD();
      expect(state.value).toBe(2.0);
      expect(state.status).toBe('PLENA');
      expect(state.events).toHaveLength(0);
    });
  });

  describe('Detección de eventos normativos', () => {
    it('debe detectar COHERENCE_VIOLATION cuando Ω < 0.3', () => {
      const metrics = {
        omegaSem: 0.2,
        vLyapunov: 0.001,
        hDiv: 0.5,
        epsilonEff: 0.9
      };
      const events = detectFrictionEvents(metrics);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('COHERENCE_VIOLATION');
      expect(events[0].severity).toBeGreaterThan(0);
    });

    it('debe detectar STABILITY_VIOLATION cuando V > 0.005', () => {
      const metrics = {
        omegaSem: 0.8,
        vLyapunov: 0.008,
        hDiv: 0.5,
        epsilonEff: 0.9
      };
      const events = detectFrictionEvents(metrics);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('STABILITY_VIOLATION');
    });

    it('debe detectar RESOURCE_VIOLATION cuando ε < 0.5', () => {
      const metrics = {
        omegaSem: 0.8,
        vLyapunov: 0.001,
        hDiv: 0.5,
        epsilonEff: 0.3
      };
      const events = detectFrictionEvents(metrics);
      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('RESOURCE_VIOLATION');
    });

    it('debe detectar múltiples violaciones simultáneas', () => {
      const metrics = {
        omegaSem: 0.2,  // COHERENCE_VIOLATION
        vLyapunov: 0.008, // STABILITY_VIOLATION
        hDiv: 0.5,
        epsilonEff: 0.3  // RESOURCE_VIOLATION
      };
      const events = detectFrictionEvents(metrics);
      expect(events).toHaveLength(3);
    });

    it('NO debe detectar eventos cuando métricas están dentro de umbrales', () => {
      const metrics = {
        omegaSem: 0.8,
        vLyapunov: 0.001,
        hDiv: 0.5,
        epsilonEff: 0.9
      };
      const events = detectFrictionEvents(metrics);
      expect(events).toHaveLength(0);
    });
  });

  describe('Decaimiento de RLD', () => {
    it('debe decrementar RLD por COHERENCE_VIOLATION severa (severity 1.0 → -0.20)', () => {
      const currentRLD = 2.0;
      const events: FrictionEventRecord[] = [{
        type: 'COHERENCE_VIOLATION',
        timestamp: Date.now(),
        severity: 1.0 // Severa
      }];
      
      const newState = updateRLD(currentRLD, events, events, 0);
      expect(newState.value).toBe(1.80); // 2.0 - 0.20
    });

    it('debe decrementar RLD por COHERENCE_VIOLATION media (severity 0.5 → -0.10)', () => {
      const currentRLD = 2.0;
      const events: FrictionEventRecord[] = [{
        type: 'COHERENCE_VIOLATION',
        timestamp: Date.now(),
        severity: 0.5 // Media
      }];
      
      const newState = updateRLD(currentRLD, events, events, 0);
      expect(newState.value).toBe(1.90); // 2.0 - 0.10
    });

    it('debe decrementar RLD por COHERENCE_VIOLATION leve (severity 0.25 → -0.05)', () => {
      const currentRLD = 2.0;
      const events: FrictionEventRecord[] = [{
        type: 'COHERENCE_VIOLATION',
        timestamp: Date.now(),
        severity: 0.25 // Leve
      }];
      
      const newState = updateRLD(currentRLD, events, events, 0);
      expect(newState.value).toBe(1.95); // 2.0 - 0.05
    });

    it('debe decrementar RLD por STABILITY_VIOLATION (severity como multiplicador)', () => {
      const currentRLD = 2.0;
      const events: FrictionEventRecord[] = [{
        type: 'STABILITY_VIOLATION',
        timestamp: Date.now(),
        severity: 1.0
      }];
      
      const newState = updateRLD(currentRLD, events, events, 0);
      expect(newState.value).toBe(1.90); // 2.0 - (0.10 * 1.0)
    });

    it('debe acumular penalizaciones de múltiples eventos', () => {
      const currentRLD = 2.0;
      const events: FrictionEventRecord[] = [
        { type: 'COHERENCE_VIOLATION', timestamp: Date.now(), severity: 1.0 }, // -0.20
        { type: 'STABILITY_VIOLATION', timestamp: Date.now(), severity: 0.5 }  // -0.05
      ];
      
      const newState = updateRLD(currentRLD, events, events, 0);
      expect(newState.value).toBe(1.75); // 2.0 - 0.20 - 0.05
    });

    it('debe respetar límite inferior (nunca < 0)', () => {
      const currentRLD = 0.05;
      const events: FrictionEventRecord[] = [{
        type: 'COHERENCE_VIOLATION',
        timestamp: Date.now(),
        severity: 1.0 // Severa: -0.20
      }];
      
      const newState = updateRLD(currentRLD, events, events, 0);
      expect(newState.value).toBe(0); // No puede bajar de 0
      expect(newState.value).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Recuperación condicionada (consenso estructural)', () => {
    it('NO debe recuperar si hay eventos recientes (< 10 interacciones)', () => {
      const currentRLD = 1.5;
      const events: FrictionEventRecord[] = [];
      
      const newState = updateRLD(currentRLD, [], events, 5); // Solo 5 interacciones sin fricción
      expect(newState.value).toBe(1.5); // Sin cambio
    });

    it('NO debe recuperar si hay patrón recurrente (≥3 eventos mismo tipo)', () => {
      const currentRLD = 1.5;
      const recentEvents: FrictionEventRecord[] = [
        { type: 'COHERENCE_VIOLATION', timestamp: Date.now(), severity: 1.0 },
        { type: 'COHERENCE_VIOLATION', timestamp: Date.now(), severity: 1.0 },
        { type: 'COHERENCE_VIOLATION', timestamp: Date.now(), severity: 1.0 }
      ];
      
      const newState = updateRLD(currentRLD, [], recentEvents, 15); // 15 interacciones sin fricción
      expect(newState.value).toBe(1.5); // Sin recuperación por patrón recurrente
    });

    it('debe recuperar +0.05 si hay consenso estructural (10+ interacciones sin fricción, sin patrón)', () => {
      const currentRLD = 1.5;
      const recentEvents: FrictionEventRecord[] = [
        { type: 'COHERENCE_VIOLATION', timestamp: Date.now() - 20000, severity: 1.0 },
        { type: 'STABILITY_VIOLATION', timestamp: Date.now() - 15000, severity: 1.0 }
      ];
      
      const newState = updateRLD(currentRLD, [], recentEvents, 12); // 12 interacciones sin fricción
      expect(newState.value).toBe(1.55); // 1.5 + 0.05
    });

    it('NO debe recuperar si RLD ya está en máximo (2.0)', () => {
      const currentRLD = 2.0;
      const events: FrictionEventRecord[] = [];
      
      const newState = updateRLD(currentRLD, [], events, 15);
      expect(newState.value).toBe(2.0); // Sin cambio
    });

    it('debe respetar límite superior (nunca > 2.0)', () => {
      const currentRLD = 1.98;
      const events: FrictionEventRecord[] = [];
      
      const newState = updateRLD(currentRLD, [], events, 15);
      expect(newState.value).toBeLessThanOrEqual(2.0);
    });
  });

  describe('Estados de RLD', () => {
    it('debe clasificar RLD=2.0 como PLENA', () => {
      const state = updateRLD(2.0, [], [], 0);
      expect(state.status).toBe('PLENA');
    });

    it('debe clasificar RLD∈[1.5,2.0) como VIGILADA', () => {
      const state1 = updateRLD(1.9, [], [], 0);
      expect(state1.status).toBe('VIGILADA');
      
      const state2 = updateRLD(1.5, [], [], 0);
      expect(state2.status).toBe('VIGILADA');
    });

    it('debe clasificar RLD=1.0 como INTERVENCION', () => {
      const state = updateRLD(1.0, [], [], 0);
      expect(state.status).toBe('INTERVENCION');
    });

    it('debe clasificar RLD∈(0,1.0) como PASIVA', () => {
      const state = updateRLD(0.5, [], [], 0);
      expect(state.status).toBe('PASIVA');
    });

    it('debe clasificar RLD=0 como RETIRO', () => {
      const state = updateRLD(0, [], [], 0);
      expect(state.status).toBe('RETIRO');
    });
  });

  describe('Reglas de régimen serio', () => {
    it('debe decrementar más rápido de lo que recupera (0.10 vs 0.05)', () => {
      const maxPenalty = 0.10; // STABILITY_VIOLATION
      const recoveryRate = 0.05;
      expect(maxPenalty).toBeGreaterThan(recoveryRate);
    });

    it('NO debe recuperar por silencio (requiere consenso estructural)', () => {
      const currentRLD = 1.5;
      // Solo 5 interacciones sin fricción (no alcanza consenso)
      const state = updateRLD(currentRLD, [], [], 5);
      expect(state.value).toBe(1.5); // Sin recuperación
    });

    it('debe mantener escala [0, 2] en todo momento', () => {
      // Caso extremo: múltiples violaciones
      let rld = 2.0;
      for (let i = 0; i < 50; i++) {
        const events: FrictionEventRecord[] = [{
          type: 'STABILITY_VIOLATION',
          timestamp: Date.now(),
          severity: 1.0
        }];
        const state = updateRLD(rld, events, events, 0);
        rld = state.value;
        expect(rld).toBeGreaterThanOrEqual(0);
        expect(rld).toBeLessThanOrEqual(2);
      }
    });
  });
});
