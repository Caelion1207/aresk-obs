import { SystemEvents, type EventMap } from './events';

export class TransactionalOutbox {
  private pendingEvents: Array<{
    event: keyof EventMap;
    payload: any;
  }> = [];
  
  schedule<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.pendingEvents.push({ event, payload });
  }
  
  flush(): void {
    const events = [...this.pendingEvents];
    this.pendingEvents = [];
    
    events.forEach(({ event, payload }) => {
      try {
        SystemEvents.emit(event as any, payload);
      } catch (error) {
        console.error(`Failed to emit ${event}:`, error);
      }
    });
  }
  
  clear(): void {
    this.pendingEvents = [];
  }
}

export function getOutbox(): TransactionalOutbox {
  return new TransactionalOutbox();
}
