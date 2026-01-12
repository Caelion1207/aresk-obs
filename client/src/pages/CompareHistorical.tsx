import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush } from "recharts";
import { GitCompare, Calendar, Activity, AlertTriangle, Bookmark, FileDown } from "lucide-react";
import { toast } from "sonner";
import { generateComparativeDualPDF, generateComparativeTriplePDF } from "@/lib/pdfComparativeGenerator";

type PlantProfile = "all" | "tipo_a" | "tipo_b" | "acoplada";

const PROFILE_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export default function CompareHistorical() {
  const [selectedProfile, setSelectedProfile] = useState<PlantProfile>("all");
  const [selectedSessions, setSelectedSessions] = useState<Set<number>>(new Set());
  const [isExporting, setIsExporting] = useState(false);
  
  const exportDualMutation = trpc.session.exportComparativeDual.useMutation();
  const exportTripleMutation = trpc.session.exportComparativeTriple.useMutation();
  
  const { data: sessions, isLoading } = trpc.session.list.useQuery();
  const { data: comparisonData, isLoading: loadingComparison } = trpc.session.getMultipleSessions.useQuery(
    { sessionIds: Array.from(selectedSessions) },
    { enabled: selectedSessions.size >= 2 }
  );
  
  const getProfileLabel = (profile: string): string => {
    switch (profile) {
      case "tipo_a": return "Tipo A (Alta Entropía)";
      case "tipo_b": return "Tipo B (Ruido Moderado)";
      case "acoplada": return "Acoplada (CAELION)";
      default: return profile;
    }
  };
  
  const filteredSessions = sessions?.filter(s => 
    selectedProfile === "all" || s.plantProfile === selectedProfile
  ) || [];
  
  const toggleSession = (sessionId: number) => {
    setSelectedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        if (newSet.size >= 5) {
          toast.error("Máximo 5 sesiones para comparación");
          return prev;
        }
        newSet.add(sessionId);
      }
      return newSet;
    });
  };
  
  const handleExportPDF = async () => {
    if (!comparisonData || comparisonData.length < 2) {
      toast.error("Selecciona al menos 2 sesiones para exportar");
      return;
    }
    
    setIsExporting(true);
    try {
      if (comparisonData.length === 2) {
        const result = await exportDualMutation.mutateAsync({
          sessionId1: comparisonData[0]!.session.id,
          sessionId2: comparisonData[1]!.session.id,
        });
        await generateComparativeDualPDF(result);
      } else if (comparisonData.length === 3) {
        const result = await exportTripleMutation.mutateAsync({
          sessionId1: comparisonData[0]!.session.id,
          sessionId2: comparisonData[1]!.session.id,
          sessionId3: comparisonData[2]!.session.id,
        });
        await generateComparativeTriplePDF(result);
      } else {
        toast.error("Exportación PDF solo soporta 2 o 3 sesiones");
      }
      toast.success("PDF exportado exitosamente");
    } catch (error) {
      console.error("Error al exportar PDF:", error);
      toast.error("Error al exportar PDF");
    } finally {
      setIsExporting(false);
    }
  };
  
  // Preparar datos para gráficos superpuestos
  const chartData = comparisonData?.map((sessionData, idx) => ({
    sessionId: sessionData.session.id,
    sessionLabel: `Sesión ${sessionData.session.id} (${getProfileLabel(sessionData.session.plantProfile)})`,
    color: PROFILE_COLORS[idx % PROFILE_COLORS.length],
    metrics: sessionData.metrics.map((m, step) => ({
      step: step + 1,
      v: m.funcionLyapunov,
      omega: m.coherenciaObservable,
      error: m.errorCognitivoMagnitud,
    })),
  })) || [];
  
  // Combinar métricas para gráfico superpuesto
  const maxSteps = Math.max(...chartData.map(d => d.metrics.length), 0);
  const combinedData = Array.from({ length: maxSteps }, (_, i) => {
    const dataPoint: any = { step: i + 1 };
    chartData.forEach((session, idx) => {
      const metric = session.metrics[i];
      if (metric) {
        dataPoint[`v_${idx}`] = metric.v;
        dataPoint[`omega_${idx}`] = metric.omega;
        dataPoint[`error_${idx}`] = metric.error;
      }
    });
    return dataPoint;
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <p className="text-center text-muted-foreground">Cargando sesiones...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitCompare className="h-8 w-8" />
            Comparar Sesiones Históricas
          </h1>
          <p className="text-muted-foreground mt-2">
            Selecciona 2-5 sesiones para comparar métricas y visualizar diferencias
          </p>
        </div>
        <div className="flex items-center gap-4">
          {selectedSessions.size >= 2 && (
            <Button
              variant="outline"
              onClick={handleExportPDF}
              disabled={isExporting || selectedSessions.size > 3}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          )}
          <Select value={selectedProfile} onValueChange={(v) => setSelectedProfile(v as PlantProfile)}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los perfiles</SelectItem>
              <SelectItem value="tipo_a">Tipo A (Alta Entropía)</SelectItem>
              <SelectItem value="tipo_b">Tipo B (Ruido Moderado)</SelectItem>
              <SelectItem value="acoplada">Acoplada (CAELION)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Selector de Sesiones */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Sesiones Disponibles</CardTitle>
            <CardDescription>
              {selectedSessions.size} de 5 sesiones seleccionadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay sesiones disponibles con este filtro
              </p>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-start gap-3 p-3 rounded border cursor-pointer transition-colors ${
                    selectedSessions.has(session.id) 
                      ? "border-primary bg-primary/5" 
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleSession(session.id)}
                >
                  <Checkbox
                    checked={selectedSessions.has(session.id)}
                    onCheckedChange={() => toggleSession(session.id)}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Sesión #{session.id}</p>
                      <Badge variant="outline">
                        {getProfileLabel(session.plantProfile)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(session.createdAt).toLocaleDateString('es-ES')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        
        {/* Visualización Comparativa */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSessions.size < 2 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-2">
                  <GitCompare className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Selecciona al menos 2 sesiones para comenzar la comparación
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : loadingComparison ? (
            <Card>
              <CardContent className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">Cargando datos de comparación...</p>
              </CardContent>
            </Card>
          ) : comparisonData && comparisonData.length > 0 ? (
            <>
              {/* Tabla Comparativa */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Métricas Comparativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Sesión</th>
                          <th className="text-right p-2">TPR (%)</th>
                          <th className="text-right p-2">V(e) Prom.</th>
                          <th className="text-right p-2">Ω(t) Prom.</th>
                          <th className="text-right p-2">||e(t)|| Prom.</th>
                          <th className="text-right p-2">Duración</th>
                          <th className="text-center p-2">Marcadores</th>
                          <th className="text-center p-2">Alertas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.map((data, idx) => (
                          <tr key={data.session.id} className="border-b">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: PROFILE_COLORS[idx % PROFILE_COLORS.length] }}
                                />
                                <span className="font-medium">#{data.session.id}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getProfileLabel(data.session.plantProfile)}
                                </Badge>
                              </div>
                            </td>
                            <td className="text-right p-2">{data.stats.tpr}%</td>
                            <td className="text-right p-2">{data.stats.avgV}</td>
                            <td className="text-right p-2">{data.stats.avgOmega}</td>
                            <td className="text-right p-2">{data.stats.avgError}</td>
                            <td className="text-right p-2">{data.stats.duration} pasos</td>
                            <td className="text-center p-2">
                              <Badge variant="secondary" className="gap-1">
                                <Bookmark className="h-3 w-3" />
                                {data.stats.markerCount}
                              </Badge>
                            </td>
                            <td className="text-center p-2">
                              {data.stats.alertCount > 0 ? (
                                <Badge variant="destructive" className="gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  {data.stats.alertCount}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              {/* Gráfico de V(t) Superpuesto */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de V(t) - Comparación</CardTitle>
                  <CardDescription>
                    Función de Lyapunov superpuesta para todas las sesiones seleccionadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={combinedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="step" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                        formatter={(value: number) => value.toFixed(4)}
                        labelFormatter={(step) => `Paso ${step}`}
                      />
                      <Legend />
                      {chartData.map((session, idx) => (
                        <Line
                          key={session.sessionId}
                          type="monotone"
                          dataKey={`v_${idx}`}
                          stroke={session.color}
                          strokeWidth={2}
                          dot={false}
                          name={session.sessionLabel}
                        />
                      ))}
                      <Brush dataKey="step" height={30} stroke="#888" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Gráfico de Ω(t) Superpuesto */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolución de Ω(t) - Comparación</CardTitle>
                  <CardDescription>
                    Coherencia observable superpuesta para todas las sesiones seleccionadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={combinedData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="step" stroke="#888" />
                      <YAxis stroke="#888" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                        formatter={(value: number) => value.toFixed(4)}
                        labelFormatter={(step) => `Paso ${step}`}
                      />
                      <Legend />
                      {chartData.map((session, idx) => (
                        <Line
                          key={session.sessionId}
                          type="monotone"
                          dataKey={`omega_${idx}`}
                          stroke={session.color}
                          strokeWidth={2}
                          dot={false}
                          name={session.sessionLabel}
                        />
                      ))}
                      <Brush dataKey="step" height={30} stroke="#888" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
