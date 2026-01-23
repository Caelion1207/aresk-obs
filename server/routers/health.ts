import { router, publicProcedure } from '../_core/trpc';
import { getOutbox } from '../infra/outbox';
import { metrics } from '../infra/metrics';
import { getDb } from '../db';
import { cycles, auditLogs } from '../../drizzle/schema';
import { sql, and, not, inArray, gt, count } from 'drizzle-orm';
import { getGenesisHash, isAuditSystemBootstrapped, GENESIS_TIMESTAMP } from '../infra/auditBootstrap';
import { verifyAuditChainIntegrity, isEmergencyMode, getCorruptionDetails } from '../infra/emergency';

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
   * Health check de auditoría
   * 
   * Endpoint público para monitoreo externo del estado de la cadena de auditoría.
   * 
   * Retorna:
   * - status: "CLOSED_AND_OPERATIONAL" | "CORRUPTED" | "EMERGENCY" | "NOT_BOOTSTRAPPED"
   * - genesisHash: Hash del bloque génesis
   * - genesisTimestamp: Timestamp fijo del génesis
   * - totalLogs: Número total de logs en la cadena
   * - chainValid: true si la cadena es válida
   * - emergencyMode: true si el sistema está en modo emergencia
   * - lastCheck: Timestamp de esta verificación
   * - corruptionDetails: Detalles de corrupción (si aplica)
   */
  audit: publicProcedure
    .query(async () => {
      try {
        // 1. Verificar bootstrap
        const isBootstrapped = await isAuditSystemBootstrapped();
        
        if (!isBootstrapped) {
          return {
            status: "NOT_BOOTSTRAPPED" as const,
            genesisHash: null,
            genesisTimestamp: null,
            totalLogs: 0,
            chainValid: false,
            emergencyMode: false,
            lastCheck: new Date().toISOString(),
            message: "Audit system not bootstrapped. Run bootstrap script."
          };
        }

        // 2. Obtener información del génesis
        const genesisHash = await getGenesisHash();

        // 3. Contar logs totales
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        const result = await db
          .select({ count: count() })
          .from(auditLogs);
        
        const totalLogs = result[0]?.count || 0;

        // 4. Verificar integridad de la cadena
        const integrityResult = await verifyAuditChainIntegrity(1000);

        // 5. Verificar modo de emergencia
        const emergencyMode = isEmergencyMode();
        const corruptionDetails = getCorruptionDetails();

        // 6. Determinar estado
        let status: "CLOSED_AND_OPERATIONAL" | "CORRUPTED" | "EMERGENCY";
        
        if (emergencyMode) {
          status = "EMERGENCY";
        } else if (!integrityResult.isValid) {
          status = "CORRUPTED";
        } else {
          status = "CLOSED_AND_OPERATIONAL";
        }

        return {
          status,
          genesisHash,
          genesisTimestamp: GENESIS_TIMESTAMP.toISOString(),
          totalLogs,
          chainValid: integrityResult.isValid,
          emergencyMode,
          lastCheck: new Date().toISOString(),
          corruptionDetails: integrityResult.details || corruptionDetails,
        };

      } catch (error: any) {
        return {
          status: "ERROR" as const,
          genesisHash: null,
          genesisTimestamp: null,
          totalLogs: 0,
          chainValid: false,
          emergencyMode: false,
          lastCheck: new Date().toISOString(),
          error: error.message,
        };
      }
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
