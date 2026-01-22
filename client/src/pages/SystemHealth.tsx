import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, XCircle, Activity, Clock, TrendingUp, AlertCircle } from 'lucide-react';

type ComponentStatus = 'healthy' | 'degraded' | 'critical' | 'idle' | 'unavailable' | 'unknown';

const STATUS_CONFIG: Record<ComponentStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any; color: string }> = {
  healthy: { label: 'Saludable', variant: 'default', icon: CheckCircle2, color: 'text-green-500' },
  degraded: { label: 'Degradado', variant: 'outline', icon: AlertTriangle, color: 'text-orange-500' },
  critical: { label: 'Crítico', variant: 'destructive', icon: XCircle, color: 'text-red-500' },
  idle: { label: 'Inactivo', variant: 'secondary', icon: Clock, color: 'text-gray-500' },
  unavailable: { label: 'No disponible', variant: 'destructive', icon: XCircle, color: 'text-red-500' },
  unknown: { label: 'Desconocido', variant: 'secondary', icon: AlertCircle, color: 'text-gray-500' },
};

export function SystemHealth() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = trpc.health.summary.useQuery();
  const { data: metricsData, refetch: refetchMetrics } = trpc.health.metrics.useQuery();
  const { data: outboxData, refetch: refetchOutbox } = trpc.health.outbox.useQuery();
  const { data: cyclesData, refetch: refetchCycles } = trpc.health.cycles.useQuery();

  // Auto-refresh cada 5 segundos
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refetchSummary();
      refetchMetrics();
      refetchOutbox();
      refetchCycles();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refetchSummary, refetchMetrics, refetchOutbox, refetchCycles]);

  if (summaryLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando estado del sistema...</div>
        </div>
      </div>
    );
  }

  const overallStatus = (summary?.status || 'unknown') as ComponentStatus;
  const OverallIcon = STATUS_CONFIG[overallStatus].icon;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Salud del Sistema</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real de componentes CAELION
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={STATUS_CONFIG[overallStatus].variant}
            className="text-lg px-4 py-2"
          >
            <OverallIcon className="w-5 h-5 mr-2" />
            {STATUS_CONFIG[overallStatus].label}
          </Badge>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-md text-sm ${
              autoRefresh ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
            }`}
          >
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>
        </div>
      </div>

      {/* Alertas Activas */}
      {summary && summary.alerts && summary.alerts.length > 0 && (
        <Card className="border-orange-500/50 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="w-5 h-5" />
              Alertas Activas ({summary.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.alerts.map((alert, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500 shrink-0" />
                  <span className="text-sm">{alert}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Estado de Componentes */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Estado de Componentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Outbox */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transactional Outbox</CardTitle>
              <CardDescription>Sistema de eventos post-commit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge variant={STATUS_CONFIG[(summary?.components?.outbox || 'unknown') as ComponentStatus].variant}>
                  {STATUS_CONFIG[(summary?.components?.outbox || 'unknown') as ComponentStatus].label}
                </Badge>
              </div>
              {outboxData && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Eventos pendientes:</span>
                    <span className="font-mono font-bold">{outboxData.pending}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Intentos totales:</span>
                    <span className="font-mono">{outboxData.totalAttempts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Máx. intentos:</span>
                    <span className="font-mono">{outboxData.maxAttempts}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Métricas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sistema de Métricas</CardTitle>
              <CardDescription>Contadores y latencias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge variant={STATUS_CONFIG[(summary?.components?.metrics || 'unknown') as ComponentStatus].variant}>
                  {STATUS_CONFIG[(summary?.components?.metrics || 'unknown') as ComponentStatus].label}
                </Badge>
              </div>
              {metricsData && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Uptime:</span>
                    <span className="font-mono">{metricsData.uptime?.human || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Comandos despachados:</span>
                    <span className="font-mono font-bold text-green-500">
                      {metricsData.counters?.['commands.dispatched']?.count || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Comandos rechazados:</span>
                    <span className="font-mono font-bold text-red-500">
                      {metricsData.counters?.['commands.rejected']?.count || 0}
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ciclos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ciclos COM-72</CardTitle>
              <CardDescription>Máquina de estados temporal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge variant={STATUS_CONFIG[(summary?.components?.cycles || 'unknown') as ComponentStatus].variant}>
                  {STATUS_CONFIG[(summary?.components?.cycles || 'unknown') as ComponentStatus].label}
                </Badge>
              </div>
              {cyclesData && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ciclos activos:</span>
                    <span className="font-mono font-bold">{cyclesData.activeCycles}</span>
                  </div>
                  {cyclesData.cycles && cyclesData.cycles.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-2">Ciclos en ejecución:</div>
                      {cyclesData.cycles.slice(0, 2).map((cycle: any) => (
                        <div key={cycle.id} className="text-xs space-y-1 mb-2">
                          <div className="flex justify-between">
                            <span>Ciclo #{cycle.id}</span>
                            <Badge variant="outline" className="text-xs">{cycle.status}</Badge>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Edad: {cycle.ageHours}h</span>
                            <span>Restante: {cycle.remainingHours}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Métricas Detalladas */}
      {metricsData && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Métricas Detalladas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contadores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Contadores de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(metricsData.counters || {}).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm">{key.replace(/\./g, ' › ')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">{value.count}</span>
                        {value.lastIncrement && (
                          <span className="text-xs text-muted-foreground">
                            (último: {new Date(value.lastIncrement).toLocaleTimeString('es')})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Latencias */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Histogramas de Latencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {metricsData.latencies && Object.keys(metricsData.latencies).length > 0 ? (
                  <div className="space-y-4">
                    {Object.entries(metricsData.latencies).map(([key, stats]: [string, any]) => (
                      <div key={key} className="space-y-2">
                        <div className="text-sm font-medium">{key.replace(/\./g, ' › ')}</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Min</div>
                            <div className="font-mono">{stats.min?.toFixed(0)}ms</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Avg</div>
                            <div className="font-mono">{stats.avg?.toFixed(0)}ms</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Max</div>
                            <div className="font-mono">{stats.max?.toFixed(0)}ms</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">p50</div>
                            <div className="font-mono">{stats.p50?.toFixed(0)}ms</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">p95</div>
                            <div className="font-mono">{stats.p95?.toFixed(0)}ms</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">p99</div>
                            <div className="font-mono">{stats.p99?.toFixed(0)}ms</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No hay datos de latencia disponibles
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
