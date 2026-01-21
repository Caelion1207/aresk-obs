import EventEmitter from 'events';

class ARESKEventEmitter extends EventEmitter {
  constructor() {
    super();
    // Aumentamos límite para soportar múltiples observadores (WABUN, ARGOS, Logging)
    this.setMaxListeners(20);
  }
}

/**
 * Bus de Eventos del Sistema (Singleton).
 * Desacopla el núcleo transaccional de los observadores analíticos.
 */
export const SystemEvents = new ARESKEventEmitter();

export const EVENTS = {
  // Disparado por ARESK tras commit en SQL + Auditoría
  MESSAGE_CREATED: 'message:created',
  
  /**
   * COST_RECORDED
   * Disparado por ARGOS tras persistir la factura computacional.
   * USO RESERVADO PARA:
   * 1. Dashboards de consumo en tiempo real.
   * 2. Alertas de "Pensamiento Caro" (Drenaje Crítico).
   * 3. Futuros controladores adaptativos (no bloqueantes).
   * NO ELIMINAR AUNQUE NO TENGA LISTENERS ACTIVOS HOY.
   */
  COST_RECORDED: 'cost:recorded',
  
  // Eventos de ciclo de vida
  SESSION_UPDATED: 'session:updated',
} as const;
