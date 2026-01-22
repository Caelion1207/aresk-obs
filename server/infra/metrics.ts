import { SystemEvents, EVENTS } from './events';

interface MetricCounter {
  count: number;
  lastIncrement: Date | null;
}

interface LatencyHistogram {
  samples: number[];
  maxSamples: number;
}

export class MetricsCollector {
  private static instance: MetricsCollector;
  
  private counters: Map<string, MetricCounter> = new Map();
  private latencies: Map<string, LatencyHistogram> = new Map();
  private startTime: Date = new Date();
  
  private constructor() {
    this.initializeCounters();
    this.attachEventListeners();
  }
  
  static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }
  
  private initializeCounters() {
    this.counters.set('commands.dispatched', { count: 0, lastIncrement: null });
    this.counters.set('commands.rejected', { count: 0, lastIncrement: null });
    this.counters.set('ethical.violations', { count: 0, lastIncrement: null });
    this.counters.set('cycle.transitions', { count: 0, lastIncrement: null });
    this.counters.set('system.failures', { count: 0, lastIncrement: null });
    
    this.latencies.set('command.processing', { samples: [], maxSamples: 100 });
  }
  
  private attachEventListeners() {
    SystemEvents.on(EVENTS.COMMAND_DISPATCHED, () => {
      this.increment('commands.dispatched');
    });
    
    SystemEvents.on(EVENTS.ETHICAL_VIOLATION, () => {
      this.increment('ethical.violations');
    });
    
    SystemEvents.on(EVENTS.CYCLE_TRANSITION, () => {
      this.increment('cycle.transitions');
    });
    
    SystemEvents.on(EVENTS.SYSTEM_INTEGRITY_FAILURE, () => {
      this.increment('system.failures');
    });
  }
  
  increment(metric: string, amount: number = 1) {
    const counter = this.counters.get(metric);
    if (counter) {
      counter.count += amount;
      counter.lastIncrement = new Date();
    } else {
      this.counters.set(metric, { count: amount, lastIncrement: new Date() });
    }
  }
  
  recordLatency(metric: string, latencyMs: number) {
    let histogram = this.latencies.get(metric);
    if (!histogram) {
      histogram = { samples: [], maxSamples: 100 };
      this.latencies.set(metric, histogram);
    }
    
    histogram.samples.push(latencyMs);
    if (histogram.samples.length > histogram.maxSamples) {
      histogram.samples.shift();
    }
  }
  
  getMetrics() {
    const uptime = Date.now() - this.startTime.getTime();
    
    const metrics: any = {
      uptime: {
        ms: uptime,
        human: this.formatUptime(uptime)
      },
      counters: {}
    };
    
    this.counters.forEach((value, key) => {
      metrics.counters[key] = {
        count: value.count,
        lastIncrement: value.lastIncrement?.toISOString() || null
      };
    });
    
    metrics.latencies = {};
    this.latencies.forEach((histogram, key) => {
      if (histogram.samples.length > 0) {
        const sorted = [...histogram.samples].sort((a, b) => a - b);
        metrics.latencies[key] = {
          count: histogram.samples.length,
          min: sorted[0],
          max: sorted[sorted.length - 1],
          avg: sorted.reduce((a, b) => a + b, 0) / sorted.length,
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)]
        };
      }
    });
    
    return metrics;
  }
  
  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
  
  reset() {
    this.counters.forEach(counter => {
      counter.count = 0;
      counter.lastIncrement = null;
    });
    this.latencies.forEach(histogram => {
      histogram.samples = [];
    });
  }
}

export const metrics = MetricsCollector.getInstance();
