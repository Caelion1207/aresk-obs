import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  ArrowLeft,
  Calendar,
  Activity,
  Zap,
  TrendingDown,
  GitBranch
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ScatterChart,
  Scatter,
  ReferenceLine,
  AreaChart,
  Area
} from "recharts";

export default function Lab() {
  return (
    <TooltipProvider>
      <LabContent />
    </TooltipProvider>
  );
}

function LabContent() {
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);

  // Queries
  const { data: sessions } = trpc.session.list.useQuery();
  const { data: erosionHistory, isLoading: loadingHistory } = trpc.erosion.getSessionErosionHistory.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId }
  );

  // Filtrar solo sesiones acopladas
  const acopladaSessions = useMemo(() => {
    return sessions?.filter((s: any) => s.plantProfile === "acoplada") || [];
  }, [sessions]);

  // Preparar datos para visualizaciones
  const chartData = useMemo(() => {
    if (!erosionHistory) return [];
    
    return erosionHistory.map((point: any, index: number) => {
      const prev = index > 0 ? erosionHistory[index - 1] : point;
      
      return {
        step: index + 1,
        timestamp: point.timestamp,
        // Métricas primarias
        V: point.lyapunovValue,
        coherence: point.coherence,
        entropy: point.entropy,
        epsilon_eff: point.epsilonEff,
        sigma_sem: point.sigmaSem,
        // Derivadas (velocidad de cambio)
        dV: point.lyapunovValue - prev.lyapunovValue,
        dEpsilon: point.epsilonEff - prev.epsilonEff,
        dCoherence: point.coherence - prev.coherence,
        // Energía de Lyapunov (V²)
        energy: Math.pow(point.lyapunovValue, 2),
      };
    });
  }, [erosionHistory]);

  // Datos para retrato de fase (H vs C)
  const phaseData = useMemo(() => {
    if (!erosionHistory) return [];
    
    return erosionHistory.map((point: any, index: number) => ({
      entropy: point.entropy,
      coherence: point.coherence,
      step: index + 1,
      epsilon_eff: point.epsilonEff,
      V: point.lyapunovValue,
    }));
  }, [erosionHistory]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Inicio
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Activity className="h-6 w-6 text-purple-500" />
                LAB | Dynamics Monitor
              </h1>
              <p className="text-sm text-slate-400">
                Phase portraits, Lyapunov energy, and error dynamics
              </p>
            </div>
          </div>
        </div>
      </div>

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
                      Sesión #{session.id} - {new Date(session.createdAt).toLocaleDateString()} - Acoplada
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </CardContent>
        </Card>

        {selectedSessionId && (
          <>
            {/* Estadísticas básicas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Pasos Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{chartData.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Turnos de conversación</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">V(e) Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {chartData.length > 0 ? chartData[chartData.length - 1].V.toFixed(3) : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Stability cost</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Ω Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {chartData.length > 0 ? chartData[chartData.length - 1].coherence.toFixed(3) : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Narrative stability</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">ε_eff Actual</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {chartData.length > 0 ? chartData[chartData.length - 1].epsilon_eff.toFixed(3) : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Information loss/token</p>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-6" />

            {/* Grid de visualizaciones dinámicas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. RETRATO DE FASE (Phase Portrait) */}
              <Card className="border-purple-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5 text-purple-500" />
                    Phase Portrait (H vs C)
                  </CardTitle>
                  <CardDescription>
                    Trajectory in entropy-coherence space. Origin convergence indicates stability.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="h-[350px] flex items-center justify-center">
                      <p className="text-muted-foreground">Cargando datos...</p>
                    </div>
                  ) : (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            type="number" 
                            dataKey="entropy" 
                            name="Entropy (H)"
                            domain={[0, 'auto']}
                            label={{ value: 'Entropy H', position: 'insideBottom', offset: -10 }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <YAxis 
                            type="number" 
                            dataKey="coherence" 
                            name="Coherence (C)"
                            domain={[0, 1]}
                            label={{ value: 'Coherence C', angle: -90, position: 'insideLeft' }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ 
                              backgroundColor: 'oklch(from var(--card) l c h)', 
                              border: '1px solid oklch(from var(--border) l c h)',
                              borderRadius: '6px'
                            }}
                            formatter={(value: any) => (typeof value === 'number' ? value.toFixed(3) : value)}
                          />
                          <Legend />
                          {/* Trayectoria temporal con gradiente de color */}
                          <Scatter 
                            name="Trajectory" 
                            data={phaseData} 
                            fill="#a855f7"
                            line={{ stroke: '#a855f7', strokeWidth: 2 }}
                            lineType="joint"
                          />
                          {/* Punto actual (último) */}
                          {phaseData.length > 0 && (
                            <Scatter
                              name="Current"
                              data={[phaseData[phaseData.length - 1]]}
                              fill="#10b981"
                              shape="circle"
                            />
                          )}
                          {/* Líneas de referencia */}
                          <ReferenceLine y={0.5} stroke="#ef4444" strokeDasharray="3 3" label="C = 0.5" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 2. ENERGÍA DE LYAPUNOV (V²) */}
              <Card className="border-blue-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-500" />
                    Lyapunov Energy V²(t)
                  </CardTitle>
                  <CardDescription>
                    Squared stability cost. Convergence to zero indicates stable control.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="h-[350px] flex items-center justify-center">
                      <p className="text-muted-foreground">Cargando datos...</p>
                    </div>
                  ) : (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            dataKey="step" 
                            label={{ value: 'Temporal Step', position: 'insideBottom', offset: -5 }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <YAxis 
                            domain={[0, 'auto']}
                            label={{ value: 'Energy V²', angle: -90, position: 'insideLeft' }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'oklch(from var(--card) l c h)', 
                              border: '1px solid oklch(from var(--border) l c h)',
                              borderRadius: '6px'
                            }}
                            formatter={(value: any) => (typeof value === 'number' ? value.toFixed(4) : value)}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="energy" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            fill="url(#energyGradient)" 
                            name="V² Energy"
                          />
                          <ReferenceLine y={0} stroke="#10b981" strokeDasharray="3 3" label="Target (0)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 3. ERROR DYNAMICS (ε_eff vs Δε_eff) */}
              <Card className="border-amber-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-amber-500" />
                    Error Dynamics (ε_eff vs Δε_eff)
                  </CardTitle>
                  <CardDescription>
                    Semantic efficiency vs rate of change. Quadrant analysis reveals drainage patterns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="h-[350px] flex items-center justify-center">
                      <p className="text-muted-foreground">Cargando datos...</p>
                    </div>
                  ) : (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            type="number" 
                            dataKey="epsilon_eff" 
                            name="ε_eff"
                            domain={[-1, 1]}
                            label={{ value: 'ε_eff', position: 'insideBottom', offset: -10 }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <YAxis 
                            type="number" 
                            dataKey="dEpsilon" 
                            name="Δε_eff"
                            domain={['auto', 'auto']}
                            label={{ value: 'Δε_eff (rate)', angle: -90, position: 'insideLeft' }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <Tooltip 
                            cursor={{ strokeDasharray: '3 3' }}
                            contentStyle={{ 
                              backgroundColor: 'oklch(from var(--card) l c h)', 
                              border: '1px solid oklch(from var(--border) l c h)',
                              borderRadius: '6px'
                            }}
                            formatter={(value: any) => (typeof value === 'number' ? value.toFixed(4) : value)}
                          />
                          <Legend />
                          {/* Trayectoria de error */}
                          <Scatter 
                            name="Error Trajectory" 
                            data={chartData} 
                            fill="#f59e0b"
                            line={{ stroke: '#f59e0b', strokeWidth: 2 }}
                            lineType="joint"
                          />
                          {/* Punto actual */}
                          {chartData.length > 0 && (
                            <Scatter
                              name="Current"
                              data={[chartData[chartData.length - 1]]}
                              fill="#10b981"
                              shape="circle"
                            />
                          )}
                          {/* Líneas de referencia (cuadrantes) */}
                          <ReferenceLine x={0} stroke="#64748b" strokeDasharray="3 3" />
                          <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                          <ReferenceLine x={-0.2} stroke="#ef4444" strokeDasharray="3 3" label="Drainage" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 4. CONTROL EFFORT (ΔV temporal) */}
              <Card className="border-emerald-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    Control Effort ΔV(t)
                  </CardTitle>
                  <CardDescription>
                    Rate of change in stability cost. Spikes indicate control interventions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingHistory ? (
                    <div className="h-[350px] flex items-center justify-center">
                      <p className="text-muted-foreground">Cargando datos...</p>
                    </div>
                  ) : (
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            dataKey="step" 
                            label={{ value: 'Temporal Step', position: 'insideBottom', offset: -5 }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <YAxis 
                            domain={['auto', 'auto']}
                            label={{ value: 'ΔV (effort)', angle: -90, position: 'insideLeft' }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'oklch(from var(--card) l c h)', 
                              border: '1px solid oklch(from var(--border) l c h)',
                              borderRadius: '6px'
                            }}
                            formatter={(value: any) => (typeof value === 'number' ? value.toFixed(4) : value)}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="dV" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            dot={{ r: 2 }}
                            name="ΔV Control Effort"
                          />
                          <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" label="Baseline" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Nota explicativa */}
            <Card className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-sm">Interpretación de Visualizaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong className="text-purple-400">Phase Portrait:</strong> Trayectoria en espacio (H, C). Convergencia hacia origen indica estabilidad estructural.
                </p>
                <p>
                  <strong className="text-blue-400">Lyapunov Energy:</strong> V² → 0 indica control efectivo. Divergencia señala pérdida de estabilidad.
                </p>
                <p>
                  <strong className="text-amber-400">Error Dynamics:</strong> Cuadrante inferior izquierdo (ε_eff &lt; -0.2, Δε_eff &lt; 0) indica drenaje activo.
                </p>
                <p>
                  <strong className="text-emerald-400">Control Effort:</strong> Picos en ΔV revelan momentos de intervención correctiva del sistema LICURGO.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
