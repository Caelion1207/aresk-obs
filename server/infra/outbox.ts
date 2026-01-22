import { SystemEvents, type EventMap } from './events';

export class TransactionalOutbox {
  private pendingEvents: Array<{
    id: string;
    event: keyof EventMap;
    payload: any;
    createdAt: Date;
    attempts: number;
  }> = [];
  
  private maxAttempts = 3;
  private isFlushing = false;
  
  schedule<K extends keyof EventMap>(
    event: K, 
    payload: EventMap[K],
    options: { 
      id?: string; 
      immediateRetry?: boolean 
    } = {}
  ): string {
    const eventId = options.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.pendingEvents.push({
      id: eventId,
      event,
      payload: {
        ...payload,
        _outboxId: eventId,
        _scheduledAt: new Date()
      },
      createdAt: new Date(),
      attempts: 0
    });
    
    if (options.immediateRetry && !this.isFlushing) {
      setImmediate(() => this.flush());
    }
    
    return eventId;
  }
  
  async flush(): Promise<Array<{ success: boolean; id: string; error?: string }>> {
    if (this.isFlushing || this.pendingEvents.length === 0) {
      return [];
    }
    
    this.isFlushing = true;
    const results: Array<{ success: boolean; id: string; error?: string }> = [];
    const failedEvents: typeof this.pendingEvents = [];
    
    try {
      for (const event of this.pendingEvents) {
        try {
          if (event.attempts >= this.maxAttempts) {
            console.error(`❌ Event ${event.id} exceeded max attempts (${this.maxAttempts})`);
            results.push({
              success: false,
              id: event.id,
              error: 'MAX_ATTEMPTS_EXCEEDED'
            });
            continue;
          }
          
          SystemEvents.emit(event.event, event.payload);
          event.attempts++;
          results.push({ success: true, id: event.id });
          
        } catch (error: any) {
          console.error(`⚠️ Failed to emit event ${event.id}:`, error);
          event.attempts++;
          failedEvents.push(event);
          
          results.push({
            success: false,
            id: event.id,
            error: error.message || 'UNKNOWN_ERROR'
          });
        }
      }
      
      this.pendingEvents = failedEvents;
      
      if (failedEvents.length > 0) {
        setTimeout(() => this.flush(), 5000);
      }
      
    } finally {
      this.isFlushing = false;
    }
    
    return results;
  }
  
  getStats() {
    return {
      pending: this.pendingEvents.length,
      totalAttempts: this.pendingEvents.reduce((sum, evt) => sum + evt.attempts, 0),
      maxAttempts: this.maxAttempts,
      oldestEvent: this.pendingEvents[0]?.createdAt || null
    };
  }
  
  clear() {
    this.pendingEvents = [];
  }
}

let globalOutbox: TransactionalOutbox | null = null;

export function getOutbox(): TransactionalOutbox {
  if (!globalOutbox) {
    globalOutbox = new TransactionalOutbox();
    
    setInterval(() => {
      if (globalOutbox && !(globalOutbox as any).isFlushing) {
        globalOutbox.flush().catch(console.error);
      }
    }, 10000);
  }
  return globalOutbox;
}
