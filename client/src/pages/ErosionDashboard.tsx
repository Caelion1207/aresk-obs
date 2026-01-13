import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Shield, 
  Activity,
  ArrowLeft,
  Calendar,
  Zap,
  Bell
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine } from "recharts";
import { calculateErosionIndex, getErosionSeverity } from "@/lib/erosionCalculator";

export default function ErosionDashboard() {
  return (
    <TooltipProvider>
      <ErosionDashboardContent />
    </TooltipProvider>
  );
}

function ErosionDashboardContent() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [compareSessionIds, setCompareSessionIds] = useState<number[]>([]);
  const [trendsGranularity, setTrendsGranularity] = useState<"week" | "month">("week");
  const [alertToDelete, setAlertToDelete] = useState<{ id: number; severity: string; trendChange: number } | null>(null);

  // Queries
  const { data: sessions } = trpc.session.list.useQuery();
  const { data: erosionHistory, isLoading: loadingHistory } = trpc.erosion.getSessionErosionHistory.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId }
  );
  const { data: drainageEvents, isLoading: loadingEvents } = trpc.erosion.getDrainageEvents.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId }
  );
  const { data: licurgoStats, isLoading: loadingStats } = trpc.erosion.getLicurgoEffectiveness.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId }
  );
  const { data: comparativeData, isLoading: loadingComparative, isError: errorComparative } = trpc.erosion.getComparativeErosion.useQuery(
    { sessionIds: compareSessionIds },
    { enabled: compareSessionIds.length > 0 && compareSessionIds.length <= 5 }
  );
  const { data: trendsData, isLoading: loadingTrends, isError: errorTrends } = trpc.erosion.getTemporalTrends.useQuery(
    { granularity: trendsGranularity }
  );
  const { data: activeAlerts, refetch: refetchAlerts, isLoading: loadingAlerts } = trpc.erosion.getActiveAlerts.useQuery();
  const dismissAlertMutation = trpc.erosion.dismissAlert.useMutation({
    onSuccess: () => {
      refetchAlerts();
      setAlertToDelete(null);
    },
  });
  
  const exportPDFMutation = trpc.erosion.exportDashboardPDF.useMutation({
    onSuccess: (data) => {
      // Descargar PDF
      const blob = new Blob([Uint8Array.from(atob(data.pdf), c => c.charCodeAt(0))], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = data.filename;
      link.click();
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el PDF. Por favor intenta nuevamente.');
    },
  });

  const handleDismissAlert = (alert: any) => {
    if (alert.severity === "critical") {
      setAlertToDelete({
        id: alert.id,
        severity: alert.severity,
        trendChange: alert.trendChange,
      });
    } else {
      dismissAlertMutation.mutate({ alertId: alert.id });
    }
  };

  const confirmDismissAlert = () => {
    if (alertToDelete) {
      dismissAlertMutation.mutate({ alertId: alertToDelete.id });
    }
  };

  // Filtrar sesiones acopladas (solo estas tienen polaridad semántica)
  const acopladaSessions = sessions?.filter((s: any) => s.plantProfile === "acoplada") || [];

  // Seleccionar primera sesión acoplada por defecto
  useEffect(() => {
    if (!selectedSessionId && acopladaSessions.length > 0) {
      setSelectedSessionId(acopladaSessions[0].id);
    }
  }, [acopladaSessions, selectedSessionId]);

  // Calcular índice de erosión para la sesión seleccionada
  const currentErosionIndex = erosionHistory 
    ? calculateErosionIndex(
        erosionHistory.map(h => ({ sigmaSem: h.sigmaSem, epsilonEff: h.epsilonEff })),
        0.95
      )
    : 0;

  const erosionSeverity = getErosionSeverity(currentErosionIndex);

  // Preparar datos para gráficos
  const chartData = erosionHistory?.map(h => ({
    step: h.step,
    epsilonEff: h.epsilonEff,
    sigmaSem: h.sigmaSem,
    vBase: h.vBase,
    vModified: h.vModified,
    omega: h.omega,
  })) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header con grid tripartito disciplinado */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 min-h-[56px]">
            {/* Zona izquierda: Navegación */}
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
              </Link>
            </div>
            
            {/* Zona centro: Estado del sistema */}
            <div className="flex items-center gap-3 justify-center overflow-hidden">
              <div className="text-center">
                <h1 className="text-lg font-bold truncate">Dashboard de Erosión Estructural</h1>
                <p className="text-xs text-muted-foreground truncate">
                  Análisis temporal de drenaje semántico
                </p>
              </div>
              
              {/* Estados informativos (no interactivos) */}
              {selectedSessionId && (
                <div className="flex items-center gap-2">
                  <Separator orientation="vertical" className="h-8" />
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-xs text-muted-foreground">Erosión</p>
                    <Badge 
                      variant={
                        erosionSeverity.level === "critical" ? "destructive" :
                        erosionSeverity.level === "high" ? "destructive" :
                        erosionSeverity.level === "moderate" ? "default" :
                        "secondary"
                      }
                      className="text-xs font-mono"
                    >
                      {(currentErosionIndex * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              )}
              
              {/* Badge de alertas activas */}
              {activeAlerts && activeAlerts.length > 0 && (
                <>
                  <Separator orientation="vertical" className="h-8" />
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-red-500/30 bg-red-500/10">
                    <Bell className="h-4 w-4 text-red-500 animate-pulse" />
                    <div className="text-center">
                      <p className="text-xs text-red-500 font-medium leading-tight">
                        {activeAlerts.length} Alerta{activeAlerts.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Zona derecha: Acciones */}
            <div className="flex items-center gap-2">
              {selectedSessionId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportPDFMutation.mutate({ sessionId: selectedSessionId })}
                  disabled={exportPDFMutation.isPending}
                >
                  {exportPDFMutation.isPending ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Exportar PDF
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Selector de sesión */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seleccionar Sesión
            </CardTitle>
            <CardDescription>
              Solo se muestran sesiones con perfil "Acoplada" (con control LICURGO y polaridad semántica)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {acopladaSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay sesiones acopladas disponibles. Crea una sesión con perfil "Acoplada" en el simulador.
              </p>
            ) : (
              <Select
                value={selectedSessionId?.toString()}
                onValueChange={(value) => setSelectedSessionId(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una sesión" />
                </SelectTrigger>
                <SelectContent>
                  {acopladaSessions.map((session: any) => (
                    <SelectItem key={session.id} value={session.id.toString()}>
                      Sesión #{session.id} - {new Date(session.createdAt).toLocaleDateString()} - 
                      {session.plantProfile === "acoplada" && " Acoplada"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {selectedSessionId && (
          <>
            {/* Estadísticas de la sesión */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Eventos de Drenaje</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Momentos donde ε_eff cae bajo -0.2, indicando drenaje semántico activo que erosiona el atractor Bucéfalo.</p>
                      </TooltipContent>
                    </UITooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{drainageEvents?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">ε_eff &lt; -0.2</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Intervenciones LICURGO</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Número de veces que el sistema de control LICURGO detectó coherencia tóxica y aplicó intervención correctiva.</p>
                      </TooltipContent>
                    </UITooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{licurgoStats?.totalEvents || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Control activado</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">Mejora Promedio</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Cambio porcentual promedio en ε_eff después de cada intervención LICURGO. Valores positivos indican reducción de drenaje.</p>
                      </TooltipContent>
                    </UITooltip>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {licurgoStats?.avgImprovement ? `+${(licurgoStats.avgImprovement * 100).toFixed(1)}%` : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Δε_eff post-control</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-500" />
                    Pasos Totales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{erosionHistory?.length || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Turnos de conversación</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de ε_eff(t) */}
            <Card>
              <CardHeader>
                <CardTitle>Campo Efectivo ε_eff(t) = Ω(t) × σ_sem(t)</CardTitle>
                <CardDescription>
                  Valores negativos indican drenaje semántico. Línea roja marca umbral de alerta (-0.2)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Cargando datos...</p>
                  </div>
                ) : (
                  <div className="h-[200px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                      <XAxis 
                        dataKey="step" 
                        label={{ value: 'Paso Temporal', position: 'insideBottom', offset: -5 }}
                        stroke="oklch(from var(--foreground) l c h / 0.5)"
                      />
                      <YAxis 
                        domain={[-1, 1]}
                        label={{ value: 'ε_eff', angle: -90, position: 'insideLeft' }}
                        stroke="oklch(from var(--foreground) l c h / 0.5)"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'oklch(from var(--card) l c h)', 
                          border: '1px solid oklch(from var(--border) l c h)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => value.toFixed(4)}
                      />
                      <Legend />
                      <ReferenceLine y={-0.2} stroke="oklch(0.55 0.25 25)" strokeDasharray="3 3" label="Umbral de drenaje" />
                      <ReferenceLine y={0} stroke="oklch(from var(--foreground) l c h / 0.3)" />
                      <Line 
                        type="monotone" 
                        dataKey="epsilonEff" 
                        stroke="oklch(0.65 0.2 280)" 
                        strokeWidth={2}
                        dot={false}
                        name="ε_eff"
                      />
                      <Brush dataKey="step" height={30} stroke="oklch(from var(--primary) l c h)" />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Gráfico de σ_sem(t) */}
            <Card>
              <CardHeader>
                <CardTitle>Polaridad Semántica σ_sem(t)</CardTitle>
                <CardDescription>
                  +1 = acrección constructiva, 0 = neutro, -1 = drenaje tóxico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                    <XAxis 
                      dataKey="step" 
                      label={{ value: 'Paso Temporal', position: 'insideBottom', offset: -5 }}
                      stroke="oklch(from var(--foreground) l c h / 0.5)"
                    />
                    <YAxis 
                      domain={[-1, 1]}
                      label={{ value: 'σ_sem', angle: -90, position: 'insideLeft' }}
                      stroke="oklch(from var(--foreground) l c h / 0.5)"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(from var(--card) l c h)', 
                        border: '1px solid oklch(from var(--border) l c h)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => value.toFixed(4)}
                    />
                    <Legend />
                    <ReferenceLine y={0} stroke="oklch(from var(--foreground) l c h / 0.3)" />
                    <ReferenceLine y={0.3} stroke="oklch(0.6 0.15 150)" strokeDasharray="3 3" label="Acrección fuerte" />
                    <ReferenceLine y={-0.3} stroke="oklch(0.55 0.25 25)" strokeDasharray="3 3" label="Drenaje fuerte" />
                    <Line 
                      type="monotone" 
                      dataKey="sigmaSem" 
                      stroke="oklch(0.7 0.2 200)" 
                      strokeWidth={2}
                      dot={false}
                      name="σ_sem"
                    />
                    <Brush dataKey="step" height={30} stroke="oklch(from var(--primary) l c h)" />
                       </LineChart>
                  </ResponsiveContainer>
                  </div>
              </CardContent>
            </Card>

            {/* Gráfico de V_base vs V_modificada */}
            <Card>
              <CardHeader>
                <CardTitle>Función de Lyapunov: V_base vs V_modificada</CardTitle>
                <CardDescription>
                  V_modificada = V_base - α×ε_eff. Valores más bajos indican mayor estabilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] sm:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                    <XAxis 
                      dataKey="step" 
                      label={{ value: 'Paso Temporal', position: 'insideBottom', offset: -5 }}
                      stroke="oklch(from var(--foreground) l c h / 0.5)"
                    />
                    <YAxis 
                      domain={[0, 1]}
                      label={{ value: 'V(e)', angle: -90, position: 'insideLeft' }}
                      stroke="oklch(from var(--foreground) l c h / 0.5)"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(from var(--card) l c h)', 
                        border: '1px solid oklch(from var(--border) l c h)',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => value.toFixed(4)}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="vBase" 
                      stroke="oklch(0.6 0.15 150)" 
                      strokeWidth={2}
                      dot={false}
                      name="V_base"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="vModified" 
                      stroke="oklch(0.65 0.2 50)" 
                      strokeWidth={2}
                      dot={false}
                      name="V_modificada"
                    />
                    <Brush dataKey="step" height={30} stroke="oklch(from var(--primary) l c h)" />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
              </CardContent>
            </Card>

            {/* Timeline de eventos de drenaje */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Timeline de Eventos de Drenaje
                </CardTitle>
                <CardDescription>
                  Momentos donde ε_eff &lt; -0.2, indicando drenaje semántico activo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEvents ? (
                  <p className="text-muted-foreground">Cargando eventos...</p>
                ) : drainageEvents && drainageEvents.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {drainageEvents.map((event, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50"
                        >
                          <div className="mt-1">
                            {event.severity === "critical" && <Zap className="h-5 w-5 text-red-500" />}
                            {event.severity === "high" && <AlertTriangle className="h-5 w-5 text-orange-500" />}
                            {event.severity === "moderate" && <TrendingDown className="h-5 w-5 text-yellow-500" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">Paso {event.step}</p>
                              <Badge 
                                variant={
                                  event.severity === "critical" ? "destructive" :
                                  event.severity === "high" ? "destructive" :
                                  "default"
                                }
                              >
                                {event.severity === "critical" ? "Crítico" :
                                 event.severity === "high" ? "Alto" :
                                 "Moderado"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">ε_eff:</span>
                                <span className="ml-1 font-mono text-red-500">{event.epsilonEff.toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">σ_sem:</span>
                                <span className="ml-1 font-mono">{event.sigmaSem.toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">V_mod:</span>
                                <span className="ml-1 font-mono">{event.vModified.toFixed(4)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No se detectaron eventos de drenaje en esta sesión
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Tabla de intervenciones LICURGO */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Intervenciones de Control LICURGO
                </CardTitle>
                <CardDescription>
                  Eventos donde el control LICURGO mejoró significativamente ε_eff
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStats ? (
                  <p className="text-muted-foreground">Cargando estadísticas...</p>
                ) : licurgoStats && licurgoStats.events.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {licurgoStats.events.map((event, index) => (
                        <div 
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50"
                        >
                          <div className="mt-1">
                            <Shield className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">Paso {event.step}</p>
                              <Badge variant="default" className="bg-green-500/20 text-green-500">
                                +{(event.improvement * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(event.timestamp).toLocaleString()}
                            </p>
                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Antes:</span>
                                <span className="ml-1 font-mono text-red-500">{event.epsilonEffBefore.toFixed(4)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Después:</span>
                                <span className="ml-1 font-mono text-green-500">{event.epsilonEffAfter.toFixed(4)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No se detectaron intervenciones de control en esta sesión
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Panel de Alertas Activas */}
            {activeAlerts && activeAlerts.length > 0 && (
              <Card className="border-red-500/50 bg-red-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-500">
                    <Bell className="h-5 w-5" />
                    Alertas Activas de Tendencia Crítica
                  </CardTitle>
                  <CardDescription>
                    Se han detectado tendencias de erosión que requieren atención
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeAlerts.map((alert: any) => (
                      <div 
                        key={alert.id}
                        className="flex items-start justify-between gap-3 p-4 rounded-lg border border-red-500/30 bg-card"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              variant="destructive"
                              className={alert.severity === "critical" ? "bg-red-600" : "bg-orange-500"}
                            >
                              {alert.severity === "critical" ? "Crítico" : "Alto"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(alert.detectedAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">{alert.message}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>📈 Cambio: +{(alert.trendChange * 100).toFixed(1)}%</span>
                            {alert.notified && <span>✔️ Notificado</span>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismissAlert(alert)}
                          disabled={dismissAlertMutation.isPending}
                        >
                          Marcar como leída
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sección de Tendencias Temporales */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias Temporales de Erosión
                </CardTitle>
                <CardDescription>
                  Evolución de la erosión promedio a lo largo del tiempo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingTrends ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-muted-foreground">Cargando tendencias...</p>
                  </div>
                ) : errorTrends ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <p className="text-destructive">Error al cargar tendencias. Intenta nuevamente.</p>
                  </div>
                ) : (
                  <>
                    {/* Selector de granularidad */}
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Granularidad</label>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant={trendsGranularity === "week" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTrendsGranularity("week")}
                          >
                            Semanal
                          </Button>
                          <Button
                            variant={trendsGranularity === "month" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTrendsGranularity("month")}
                          >
                            Mensual
                          </Button>
                        </div>
                      </div>

                      {/* Indicador de tendencia */}
                      {trendsData && (
                    <div className="text-right">
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <p className="text-xs text-muted-foreground cursor-help">Tendencia</p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Dirección del cambio en erosión: Ascendente (empeorando), Descendente (mejorando), Estable (sin cambios significativos).</p>
                        </TooltipContent>
                      </UITooltip>
                      <div className="flex items-center gap-2 mt-1">
                        {trendsData.trendDirection === "ascending" && (
                          <>
                            <TrendingUp className="h-5 w-5 text-red-500" />
                            <span className="text-sm font-medium text-red-500">Ascendente</span>
                          </>
                        )}
                        {trendsData.trendDirection === "descending" && (
                          <>
                            <TrendingDown className="h-5 w-5 text-green-500" />
                            <span className="text-sm font-medium text-green-500">Descendente</span>
                          </>
                        )}
                        {trendsData.trendDirection === "stable" && (
                          <>
                            <Activity className="h-5 w-5 text-blue-500" />
                            <span className="text-sm font-medium text-blue-500">Estable</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {trendsData && trendsData.periods.length > 0 && (
                  <>
                    <Separator />

                    {/* Tarjetas de comparación */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-3 rounded-lg border border-border bg-card/50">
                        <p className="text-xs text-muted-foreground">Período Actual</p>
                        <p className="text-2xl font-bold mt-1">
                          {(trendsData.recentAvg * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Últimos 3 períodos
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-card/50">
                        <p className="text-xs text-muted-foreground">Período Anterior</p>
                        <p className="text-2xl font-bold mt-1">
                          {(trendsData.previousAvg * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          3 períodos previos
                        </p>
                      </div>
                      <div className="p-3 rounded-lg border border-border bg-card/50">
                        <p className="text-xs text-muted-foreground">Cambio</p>
                        <p className={`text-2xl font-bold mt-1 ${
                          trendsData.trendChange > 0 ? "text-red-500" :
                          trendsData.trendChange < 0 ? "text-green-500" :
                          ""
                        }`}>
                          {trendsData.trendChange > 0 ? "+" : ""}{(trendsData.trendChange * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Variación relativa
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Gráfico de barras de erosión promedio */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Evolución de Erosión Promedio</h4>
                      <div className="h-[250px] sm:h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendsData.periods}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            dataKey="label" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <YAxis 
                            domain={[0, 1]}
                            label={{ value: 'Erosión Promedio', angle: -90, position: 'insideLeft' }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'oklch(from var(--card) l c h)', 
                              border: '1px solid oklch(from var(--border) l c h)',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => (value * 100).toFixed(1) + "%"}
                            labelFormatter={(label) => `Período: ${label}`}
                          />
                          <Legend />
                          <ReferenceLine y={0.5} stroke="oklch(0.55 0.25 25)" strokeDasharray="3 3" label="Umbral crítico" />
                          <Line 
                            type="monotone" 
                            dataKey="avgErosion" 
                            stroke="oklch(0.65 0.2 280)" 
                            strokeWidth={3}
                            dot={{ r: 5 }}
                            name="Erosión Promedio"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Períodos de alta erosión */}
                    {trendsData.highErosionPeriods.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            Períodos de Alta Erosión (&gt; 50%)
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {trendsData.highErosionPeriods.map((periodLabel, index) => (
                              <Badge key={index} variant="destructive">
                                {periodLabel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* Tabla de períodos */}
                    <div>
                      <h4 className="text-sm font-medium mb-3">Detalle por Período</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left p-2 text-sm font-medium">Período</th>
                              <th className="text-right p-2 text-sm font-medium hidden sm:table-cell">Sesiones</th>
                              <th className="text-right p-2 text-sm font-medium">Erosión</th>
                              <th className="text-right p-2 text-sm font-medium hidden md:table-cell">Eventos</th>
                              <th className="text-left p-2 text-sm font-medium">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trendsData.periods.slice().reverse().map((period, index) => {
                              const isHighErosion = period.avgErosion > 0.5;
                              return (
                                <tr key={index} className="border-b border-border">
                                  <td className="p-2 text-sm">{period.label}</td>
                                  <td className="p-2 text-sm text-right hidden sm:table-cell">{period.sessionCount}</td>
                                  <td className="p-2 text-sm text-right font-mono">
                                    {(period.avgErosion * 100).toFixed(1)}%
                                  </td>
                                  <td className="p-2 text-sm text-right hidden md:table-cell">{period.totalDrainageEvents}</td>
                                  <td className="p-2 text-sm">
                                    {isHighErosion ? (
                                      <Badge variant="destructive">Alta</Badge>
                                    ) : period.avgErosion > 0.3 ? (
                                      <Badge variant="default">Moderada</Badge>
                                    ) : (
                                      <Badge variant="secondary">Normal</Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    </>
                  )}

                  {(!trendsData || trendsData.periods.length === 0) && !loadingTrends && !errorTrends && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No hay suficientes datos para mostrar tendencias temporales
                    </p>
                  )}
                </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Panel de Comparación Multi-Sesión */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación Multi-Sesión</CardTitle>
          <CardDescription>
            Compara patrones de erosión entre 2-5 sesiones acopladas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selector múltiple de sesiones */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Seleccionar Sesiones (2-5)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto p-2 border border-border rounded-lg">
              {acopladaSessions.map((session: any) => (
                <label
                  key={session.id}
                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={compareSessionIds.includes(session.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        if (compareSessionIds.length < 5) {
                          setCompareSessionIds([...compareSessionIds, session.id]);
                        }
                      } else {
                        setCompareSessionIds(compareSessionIds.filter(id => id !== session.id));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">
                    Sesión #{session.id} - {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {compareSessionIds.length} de 5 sesiones seleccionadas
            </p>
          </div>

          {/* Mensaje de validación */}
          {compareSessionIds.length > 0 && compareSessionIds.length < 2 && (
            <p className="text-sm text-orange-500">
              Selecciona al menos 2 sesiones para comparar
            </p>
          )}

          {/* Resultados de comparación */}
          {compareSessionIds.length >= 2 && (
            <>
              {loadingComparative ? (
                <div className="h-[200px] flex items-center justify-center">
                  <p className="text-muted-foreground">Cargando comparación...</p>
                </div>
              ) : errorComparative ? (
                <p className="text-sm text-destructive">Error al cargar comparación. Intenta nuevamente.</p>
              ) : comparativeData && comparativeData.comparisons.length > 0 ? (
                <>
                  {/* Estadísticas agregadas */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Erosión Promedio</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">
                          {(comparativeData.comparisons.reduce((sum, c) => sum + c.erosionIndex, 0) / comparativeData.comparisons.length * 100).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Erosión Máxima</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-red-500">
                          {(Math.max(...comparativeData.comparisons.map(c => c.erosionIndex)) * 100).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">Erosión Mínima</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold text-green-500">
                          {(Math.min(...comparativeData.comparisons.map(c => c.erosionIndex)) * 100).toFixed(1)}%
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Gráfico overlay de curvas ε_eff(t) */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Overlay de Curvas ε_eff(t)</h4>
                    <div className="h-[250px] sm:h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            dataKey="step" 
                            type="number"
                            label={{ value: 'Paso Temporal', position: 'insideBottom', offset: -5 }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <YAxis 
                            label={{ value: 'ε_eff', angle: -90, position: 'insideLeft' }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <Tooltip />
                          <Legend />
                          <ReferenceLine y={-0.2} stroke="oklch(0.65 0.2 10)" strokeDasharray="3 3" label="Umbral" />
                          {comparativeData.comparisons.map((comp, index) => {
                            const colors = [
                              "oklch(0.65 0.2 280)", // Azul
                              "oklch(0.65 0.2 10)",  // Rojo
                              "oklch(0.65 0.2 140)", // Verde
                              "oklch(0.65 0.2 60)",  // Amarillo
                              "oklch(0.65 0.2 320)"  // Magenta
                            ];
                            const seriesData = (comparativeData as any).timeSeries?.[comp.sessionId] || [];
                            if (seriesData.length === 0) return null;
                            
                            return (
                              <Line
                                key={comp.sessionId}
                                data={seriesData}
                                dataKey="epsilonEff"
                                stroke={colors[index % colors.length]}
                                strokeWidth={2}
                                dot={false}
                                name={`Sesión #${comp.sessionId}`}
                                connectNulls
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Tabla comparativa */}
                  <div>
                    <h4 className="text-sm font-medium mb-3">Ranking de Erosión</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-2 text-sm font-medium">Ranking</th>
                            <th className="text-left p-2 text-sm font-medium">Sesión</th>
                            <th className="text-right p-2 text-sm font-medium">Fecha</th>
                            <th className="text-right p-2 text-sm font-medium">Índice Erosión</th>
                            <th className="text-right p-2 text-sm font-medium hidden md:table-cell">Drenaje</th>
                            <th className="text-right p-2 text-sm font-medium hidden md:table-cell">ε_eff Prom</th>
                            <th className="text-left p-2 text-sm font-medium">Severidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          {comparativeData.comparisons
                            .sort((a, b) => b.erosionIndex - a.erosionIndex)
                            .map((comp, index) => (
                              <tr key={comp.sessionId} className="border-b border-border">
                                <td className="p-2 text-sm font-bold">{index + 1}</td>
                                <td className="p-2 text-sm">#{comp.sessionId}</td>
                                <td className="p-2 text-sm text-right">
                                  {new Date(comp.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-2 text-sm text-right font-mono">
                                  {(comp.erosionIndex * 100).toFixed(1)}%
                                </td>
                                <td className="p-2 text-sm text-right hidden md:table-cell">
                                  {comp.drainageCount}
                                </td>
                                <td className="p-2 text-sm text-right font-mono hidden md:table-cell">
                                  {comp.avgEpsilonEff.toFixed(4)}
                                </td>
                                <td className="p-2 text-sm">
                                  {comp.erosionIndex > 0.6 ? (
                                    <Badge variant="destructive">Crítica</Badge>
                                  ) : comp.erosionIndex > 0.3 ? (
                                    <Badge variant="default">Moderada</Badge>
                                  ) : (
                                    <Badge variant="secondary">Leve</Badge>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Matriz de correlación */}
                  {comparativeData.correlationMatrix && comparativeData.correlationMatrix.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Matriz de Correlación de Erosión</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr>
                              <th className="p-2 text-sm font-medium"></th>
                              {comparativeData.comparisons.map(comp => (
                                <th key={comp.sessionId} className="p-2 text-sm font-medium text-center">
                                  #{comp.sessionId}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {comparativeData.correlationMatrix.map((row: any, i: number) => (
                              <tr key={i}>
                                <td className="p-2 text-sm font-medium">#{comparativeData.comparisons[i].sessionId}</td>
                                {row.map((corr: number, j: number) => {
                                  const intensity = Math.abs(corr);
                                  const bgColor = corr > 0 
                                    ? `rgba(34, 197, 94, ${intensity})` // Verde
                                    : `rgba(239, 68, 68, ${intensity})`; // Rojo
                                  const getCorrelationLabel = (val: number) => {
                                    if (val > 0.7) return "Muy similar";
                                    if (val > 0.4) return "Moderadamente similar";
                                    if (val > 0) return "Levemente similar";
                                    if (val > -0.4) return "Levemente diferente";
                                    if (val > -0.7) return "Moderadamente diferente";
                                    return "Muy diferente";
                                  };
                                  return (
                                    <UITooltip key={j}>
                                      <TooltipTrigger asChild>
                                        <td 
                                          className="p-2 text-center text-sm font-mono cursor-help"
                                          style={{ backgroundColor: bgColor }}
                                        >
                                          {corr.toFixed(2)}
                                        </td>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">
                                          Correlación de Pearson: {corr.toFixed(3)}<br />
                                          Interpretación: {getCorrelationLabel(corr)}<br />
                                          Sesiones #{comparativeData.comparisons[i].sessionId} y #{comparativeData.comparisons[j].sessionId}
                                        </p>
                                      </TooltipContent>
                                    </UITooltip>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Verde: correlación positiva | Rojo: correlación negativa | Intensidad: magnitud
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay datos disponibles para las sesiones seleccionadas
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación para alertas críticas */}
      <Dialog open={!!alertToDelete} onOpenChange={(open) => !open && setAlertToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Descarte de Alerta Crítica
            </DialogTitle>
            <DialogDescription>
              Estás a punto de descartar una alerta de tendencia crítica. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {alertToDelete && (
            <div className="space-y-3 py-4">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm font-medium text-red-500">Detalles de la Alerta</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cambio de tendencia: <span className="font-bold text-red-500">+{(alertToDelete.trendChange * 100).toFixed(1)}%</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Severidad: <span className="font-bold text-red-500">Crítica</span>
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Las alertas críticas indican un aumento significativo en la erosión estructural. 
                Se recomienda revisar las sesiones afectadas antes de descartar esta alerta.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAlertToDelete(null)}
              disabled={dismissAlertMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDismissAlert}
              disabled={dismissAlertMutation.isPending}
            >
              {dismissAlertMutation.isPending ? "Descartando..." : "Confirmar Descarte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
