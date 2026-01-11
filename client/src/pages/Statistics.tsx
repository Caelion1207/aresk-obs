import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Bookmark, Activity, ArrowUp, ArrowDown, Minus } from "lucide-react";

type Period = "week" | "month" | "quarter";

export default function Statistics() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("week");
  
  const { data: tprTrends, isLoading: loadingTpr } = trpc.stats.getTprTrends.useQuery();
  const { data: markerDist, isLoading: loadingMarkers } = trpc.stats.getMarkerDistribution.useQuery();
  const { data: metricsEvolution, isLoading: loadingEvolution } = trpc.stats.getMetricsEvolution.useQuery();
  const { data: comparison, isLoading: loadingComparison } = trpc.stats.getTemporalComparison.useQuery(
    { period: selectedPeriod }
  );

  const getProfileLabel = (profile: string): string => {
    switch (profile) {
      case "tipo_a": return "Tipo A (Alta Entropía)";
      case "tipo_b": return "Tipo B (Ruido Moderado)";
      case "acoplada": return "Acoplada (CAELION)";
      default: return profile;
    }
  };

  const getMarkerTypeLabel = (type: string): string => {
    switch (type) {
      case "colapso_semantico": return "Colapso Semántico";
      case "recuperacion": return "Recuperación";
      case "transicion": return "Transición";
      case "observacion": return "Observación";
      default: return type;
    }
  };

  const getProfileColor = (profile: string): string => {
    switch (profile) {
      case "tipo_a": return "#ef4444"; // rojo
      case "tipo_b": return "#eab308"; // amarillo
      case "acoplada": return "#10b981"; // verde
      default: return "#6b7280";
    }
  };

  const MARKER_COLORS = ["#ef4444", "#10b981", "#3b82f6", "#a855f7"];

  const getPeriodLabel = (period: Period): string => {
    switch (period) {
      case "week": return "Última Semana";
      case "month": return "Último Mes";
      case "quarter": return "Últimos 3 Meses";
    }
  };
  
  const getTrendIcon = (delta: number) => {
    if (delta > 5) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (delta < -5) return <ArrowDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };
  
  const getTrendColor = (delta: number, inverse = false): string => {
    const threshold = 5;
    if (inverse) {
      if (delta < -threshold) return "text-green-500";
      if (delta > threshold) return "text-red-500";
    } else {
      if (delta > threshold) return "text-green-500";
      if (delta < -threshold) return "text-red-500";
    }
    return "text-muted-foreground";
  };

  if (loadingTpr || loadingMarkers || loadingEvolution || loadingComparison) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  const tprChartData = tprTrends?.map(t => ({
    ...t,
    name: getProfileLabel(t.profile),
  })) || [];

  const markerChartData = markerDist?.map(m => ({
    name: getMarkerTypeLabel(m.type),
    value: m.count,
  })).filter(m => m.value > 0) || [];

  const totalMarkers = markerDist?.reduce((sum, m) => sum + m.count, 0) || 0;

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Estadísticas Globales</h1>
          <p className="text-muted-foreground mt-2">
            Análisis agregado de todas las sesiones del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Período:</span>
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Última Semana</SelectItem>
              <SelectItem value="month">Último Mes</SelectItem>
              <SelectItem value="quarter">Últimos 3 Meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Comparación Temporal */}
      {comparison && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Comparación: {getPeriodLabel(selectedPeriod)}</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* TPR Promedio */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>TPR Promedio</CardDescription>
                <CardTitle className="text-3xl">{comparison.current.avgTpr}%</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(comparison.deltas.avgTpr)}
                  <span className={getTrendColor(comparison.deltas.avgTpr)}>
                    {comparison.deltas.avgTpr > 0 ? "+" : ""}{comparison.deltas.avgTpr.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Sesiones */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Sesiones Realizadas</CardDescription>
                <CardTitle className="text-3xl">{comparison.current.sessionCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(comparison.deltas.sessionCount)}
                  <span className={getTrendColor(comparison.deltas.sessionCount)}>
                    {comparison.deltas.sessionCount > 0 ? "+" : ""}{comparison.deltas.sessionCount.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
            
            {/* V(e) Promedio */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>V(e) Promedio</CardDescription>
                <CardTitle className="text-3xl">{comparison.current.avgLyapunov.toFixed(3)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(comparison.deltas.avgLyapunov)}
                  <span className={getTrendColor(comparison.deltas.avgLyapunov, true)}>
                    {comparison.deltas.avgLyapunov > 0 ? "+" : ""}{comparison.deltas.avgLyapunov.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Ω(t) Promedio */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Ω(t) Promedio</CardDescription>
                <CardTitle className="text-3xl">{comparison.current.avgOmega.toFixed(3)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(comparison.deltas.avgOmega)}
                  <span className={getTrendColor(comparison.deltas.avgOmega)}>
                    {comparison.deltas.avgOmega > 0 ? "+" : ""}{comparison.deltas.avgOmega.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
            
            {/* ||e(t)|| Promedio */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>||e(t)|| Promedio</CardDescription>
                <CardTitle className="text-3xl">{comparison.current.avgError.toFixed(3)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(comparison.deltas.avgError)}
                  <span className={getTrendColor(comparison.deltas.avgError, true)}>
                    {comparison.deltas.avgError > 0 ? "+" : ""}{comparison.deltas.avgError.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
            
            {/* Marcadores */}
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Marcadores Añadidos</CardDescription>
                <CardTitle className="text-3xl">{comparison.current.markerCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(comparison.deltas.markerCount)}
                  <span className={getTrendColor(comparison.deltas.markerCount)}>
                    {comparison.deltas.markerCount > 0 ? "+" : ""}{comparison.deltas.markerCount.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs. período anterior</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TPR por Perfil */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              TPR Promedio por Perfil
            </CardTitle>
            <CardDescription>
              Tiempo de Permanencia en Régimen (Ω &gt; 0.7)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tprChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tprChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" label={{ value: "TPR (%)", angle: -90, position: "insideLeft" }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    formatter={(value: number) => [`${value.toFixed(2)}%`, "TPR Promedio"]}
                  />
                  <Bar dataKey="averageTpr" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px]">
                <p className="text-muted-foreground">No hay datos de TPR disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de Estadísticas */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen por Perfil</CardTitle>
            <CardDescription>
              Número de sesiones y TPR promedio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tprTrends && tprTrends.length > 0 ? (
                tprTrends.map((trend) => (
                  <div key={trend.profile} className="flex items-center justify-between p-3 rounded border border-border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: getProfileColor(trend.profile) }}
                      />
                      <div>
                        <p className="font-medium">{getProfileLabel(trend.profile)}</p>
                        <p className="text-sm text-muted-foreground">{trend.sessionCount} sesiones</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{trend.averageTpr}%</p>
                      <p className="text-xs text-muted-foreground">TPR promedio</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay datos disponibles</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribución de Marcadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Distribución de Marcadores Temporales
          </CardTitle>
          <CardDescription>
            Frecuencia de tipos de eventos anotados ({totalMarkers} marcadores totales)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {markerChartData.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={markerChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {markerChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={MARKER_COLORS[index % MARKER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="space-y-3">
                {markerChartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded border border-border">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: MARKER_COLORS[index % MARKER_COLORS.length] }}
                      />
                      <p className="font-medium">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold">{item.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {((item.value / totalMarkers) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px]">
              <p className="text-muted-foreground">No hay marcadores registrados aún</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evolución Temporal de Métricas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Evolución Temporal de Métricas Promedio
          </CardTitle>
          <CardDescription>
            Promedios diarios de V(e), Ω(t) y ||e(t)|| entre todas las sesiones
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metricsEvolution && metricsEvolution.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={metricsEvolution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis 
                  dataKey="date" 
                  stroke="#888"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('es-ES')}
                />
                <Legend />
                <Line type="monotone" dataKey="avgLyapunov" stroke="#ef4444" strokeWidth={2} dot={false} name="V(e) promedio" />
                <Line type="monotone" dataKey="avgOmega" stroke="#10b981" strokeWidth={2} dot={false} name="Ω(t) promedio" />
                <Line type="monotone" dataKey="avgError" stroke="#3b82f6" strokeWidth={2} dot={false} name="||e(t)|| promedio" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[400px]">
              <p className="text-muted-foreground">No hay datos de evolución temporal disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
