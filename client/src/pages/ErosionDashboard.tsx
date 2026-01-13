import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Shield, 
  Activity,
  ArrowLeft,
  Calendar,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush, ReferenceLine } from "recharts";
import { calculateErosionIndex, getErosionSeverity } from "@/lib/erosionCalculator";

export default function ErosionDashboard() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [compareSessionIds, setCompareSessionIds] = useState<number[]>([]);
  const [trendsGranularity, setTrendsGranularity] = useState<"week" | "month">("week");

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
  const { data: comparativeData } = trpc.erosion.getComparativeErosion.useQuery(
    { sessionIds: compareSessionIds },
    { enabled: compareSessionIds.length > 0 }
  );
  const { data: trendsData } = trpc.erosion.getTemporalTrends.useQuery(
    { granularity: trendsGranularity }
  );

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
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Inicio
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Dashboard de Erosión Estructural</h1>
                <p className="text-sm text-muted-foreground">
                  Análisis temporal de drenaje semántico y efectividad de control LICURGO
                </p>
              </div>
            </div>
            
            {/* Indicador de erosión actual */}
            {selectedSessionId && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Índice de Erosión</p>
                  <p className="text-2xl font-bold">{(currentErosionIndex * 100).toFixed(1)}%</p>
                </div>
                <Badge 
                  variant={
                    erosionSeverity.level === "critical" ? "destructive" :
                    erosionSeverity.level === "high" ? "destructive" :
                    erosionSeverity.level === "moderate" ? "default" :
                    "secondary"
                  }
                  className="text-sm"
                >
                  {erosionSeverity.label}
                </Badge>
              </div>
            )}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Eventos de Drenaje
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
                    Intervenciones LICURGO
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
                    Mejora Promedio
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
                  <div className="h-[300px] flex items-center justify-center">
                    <p className="text-muted-foreground">Cargando datos...</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
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
                <ResponsiveContainer width="100%" height={300}>
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
              </CardContent>
            </Card>

            {/* Gráfico comparativo V_base vs V_modificada */}
            <Card>
              <CardHeader>
                <CardTitle>Función de Lyapunov: V_base vs V_modificada</CardTitle>
                <CardDescription>
                  V_modificada = V_base - α×ε_eff. Valores más bajos indican mayor estabilidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
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
                      <p className="text-xs text-muted-foreground">Tendencia</p>
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
                      <ResponsiveContainer width="100%" height={350}>
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
                              <th className="text-right p-2 text-sm font-medium">Sesiones</th>
                              <th className="text-right p-2 text-sm font-medium">Erosión Promedio</th>
                              <th className="text-right p-2 text-sm font-medium">Eventos de Drenaje</th>
                              <th className="text-left p-2 text-sm font-medium">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {trendsData.periods.slice().reverse().map((period, index) => {
                              const isHighErosion = period.avgErosion > 0.5;
                              return (
                                <tr key={index} className="border-b border-border">
                                  <td className="p-2 text-sm">{period.label}</td>
                                  <td className="p-2 text-sm text-right">{period.sessionCount}</td>
                                  <td className="p-2 text-sm text-right font-mono">
                                    {(period.avgErosion * 100).toFixed(1)}%
                                  </td>
                                  <td className="p-2 text-sm text-right">{period.totalDrainageEvents}</td>
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

                {(!trendsData || trendsData.periods.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay suficientes datos para mostrar tendencias temporales
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
