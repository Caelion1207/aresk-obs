import { router, publicProcedure } from '../_core/trpc';
import { getOutbox } from '../infra/outbox';
import { metrics } from '../infra/metrics';
import { getDb } from '../db';
import { cycles } from '../../drizzle/schema';
import { sql, and, not, inArray, gt } from 'drizzle-orm';

export const healthRouter = router({
  /**
   * Estado del Transactional Outbox
   */
  outbox: publicProcedure
    .query(async () => {
      const outbox = getOutbox();
      const stats = outbox.getStats();
      
      const status = stats.pending === 0 ? 'healthy' : 
                     stats.pending < 50 ? 'degraded' : 'critical';
      
      return {
        status,
        ...stats,
        alerts: stats.pending > 100 ? ['High pending events count'] : []
      };
    }),
  
  /**
   * Métricas del sistema en tiempo real
   */
  metrics: publicProcedure
    .query(async () => {
      const systemMetrics = metrics.getMetrics();
      
      const alerts: string[] = [];
      
      // Alerta si hay más de 5 violaciones éticas por hora
      const ethicalViolations = systemMetrics.counters['ethical.violations']?.count || 0;
      const uptimeHours = systemMetrics.uptime.ms / (1000 * 60 * 60);
      if (uptimeHours > 1 && (ethicalViolations / uptimeHours) > 5) {
        alerts.push('High ethical violations rate (>5/hour)');
      }
      
      // Alerta si hay fallos del sistema
      const systemFailures = systemMetrics.counters['system.failures']?.count || 0;
      if (systemFailures > 0) {
        alerts.push(`System integrity failures detected (${systemFailures})`);
      }
      
      return {
        ...systemMetrics,
        alerts
      };
    }),
  
  /**
   * Estado de ciclos activos
   */
  cycles: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        return {
          status: 'unavailable',
          error: 'Database unavailable'
        };
      }
      
      const activeCycles = await db
        .select()
        .from(cycles)
        .where(
          and(
            not(inArray(cycles.status, ['CLOSED', 'FAILED'])),
            gt(cycles.scheduledEndAt, new Date())
          )
        );
      
      const alerts: string[] = [];
      
      // Alerta si algún ciclo lleva más de 72h activo
      const now = new Date();
      activeCycles.forEach(cycle => {
        const ageHours = (now.getTime() - new Date(cycle.startedAt).getTime()) / (1000 * 60 * 60);
        if (ageHours > 72) {
          alerts.push(`Cycle #${cycle.id} active for ${Math.floor(ageHours)}h (violates COM-72)`);
        }
      });
      
      // Alerta si no hay ciclos activos
      if (activeCycles.length === 0) {
        alerts.push('No active cycles (system may be idle)');
      }
      
      return {
        status: alerts.length === 0 ? 'healthy' : 'warning',
        activeCycles: activeCycles.length,
        cycles: activeCycles.map(c => ({
          id: c.id,
          status: c.status,
          protocolId: c.protocolId,
          ageHours: Math.floor((now.getTime() - new Date(c.startedAt).getTime()) / (1000 * 60 * 60)),
          remainingHours: Math.floor((new Date(c.scheduledEndAt).getTime() - now.getTime()) / (1000 * 60 * 60))
        })),
        alerts
      };
    }),
  
  /**
   * Resumen general del sistema
   */
  summary: publicProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) {
        return {
          status: 'unavailable' as const,
          timestamp: new Date().toISOString(),
          components: {},
          alerts: ['Database unavailable']
        };
      }
      
      const outbox = getOutbox();
      const outboxStats = outbox.getStats();
      const systemMetrics = metrics.getMetrics();
      
      const activeCycles = await db
        .select()
        .from(cycles)
        .where(
          and(
            not(inArray(cycles.status, ['CLOSED', 'FAILED'])),
            gt(cycles.scheduledEndAt, new Date())
          )
        );
      
      const allAlerts: string[] = [];
      
      // Alertas de outbox
      if (outboxStats.pending > 100) {
        allAlerts.push('High pending events count');
      }
      
      // Alertas de métricas
      const ethicalViolations = systemMetrics.counters['ethical.violations']?.count || 0;
      const uptimeHours = systemMetrics.uptime.ms / (1000 * 60 * 60);
      if (uptimeHours > 1 && (ethicalViolations / uptimeHours) > 5) {
        allAlerts.push('High ethical violations rate (>5/hour)');
      }
      
      // Alertas de ciclos
      if (activeCycles.length === 0) {
        allAlerts.push('No active cycles (system may be idle)');
      }
      
      const overallStatus: 'healthy' | 'degraded' | 'critical' = 
        allAlerts.length === 0 ? 'healthy' : 
        allAlerts.some((a: string) => a.includes('critical')) ? 'critical' : 'degraded';
      
      return {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        components: {
          outbox: outboxStats.pending === 0 ? 'healthy' : outboxStats.pending < 50 ? 'degraded' : 'critical',
          metrics: systemMetrics.counters ? 'healthy' : 'unknown',
          cycles: activeCycles.length > 0 ? 'healthy' : 'idle'
        },
        alerts: allAlerts
      };
    })
});
