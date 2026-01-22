import EventEmitter from 'events';

export const EVENTS = {
  // Eventos ARESK-OBS (Twin Sidecars)
  MESSAGE_CREATED: 'message:created',
  COST_RECORDED: 'cost:recorded',
  SESSION_UPDATED: 'session:updated',
  
  // Eventos Marco Legal CAELION
  COMMAND_DISPATCHED: 'command:dispatched',
  ETHICAL_VIOLATION: 'ethical:violation',
  CYCLE_TRANSITION: 'cycle:transition',
  SYSTEM_INTEGRITY_FAILURE: 'system:integrity:failure'
} as const;

export type EventMap = {
  [EVENTS.MESSAGE_CREATED]: {
    messageId: number;
  };
  [EVENTS.COST_RECORDED]: {
    messageId: number;
    cost: any;
  };
  [EVENTS.SESSION_UPDATED]: {
    sessionId: number;
  };
  [EVENTS.COMMAND_DISPATCHED]: {
    commandId: string;
    intent: string;
    protocol: string;
    userId: number;
    timestamp: Date;
  };
  [EVENTS.ETHICAL_VIOLATION]: {
    logId: number;
    constant: string;
    resolution: 'BLOCKED' | 'WARNING' | 'OBSERVATION' | 'OVERRIDE';
    timestamp: Date;
  };
  [EVENTS.CYCLE_TRANSITION]: {
    cycleId: number;
    from: string;
    to: string;
    timestamp: Date;
  };
  [EVENTS.SYSTEM_INTEGRITY_FAILURE]: {
    component: string;
    error: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    timestamp: Date;
  };
};

class TypedEventEmitter extends EventEmitter {
  private static instance: TypedEventEmitter;
  
  private constructor() {
    super();
    this.setMaxListeners(50);
  }
  
  static getInstance(): TypedEventEmitter {
    if (!TypedEventEmitter.instance) {
      TypedEventEmitter.instance = new TypedEventEmitter();
    }
    return TypedEventEmitter.instance;
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): boolean {
    console.log(`🔊 EVENT: ${event}`, {
      ...payload,
      timestamp: new Date().toISOString()
    });
    return super.emit(event, payload);
  }
  
  on<K extends keyof EventMap>(event: K, listener: (payload: EventMap[K]) => void): this {
    return super.on(event, listener as any);
  }
  
  once<K extends keyof EventMap>(event: K, listener: (payload: EventMap[K]) => void): this {
    return super.once(event, listener as any);
  }
}

/**
 * Bus de Eventos del Sistema (Singleton).
 * Desacopla el núcleo transaccional de los observadores analíticos.
 */
export const SystemEvents = TypedEventEmitter.getInstance();
