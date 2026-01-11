import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Play, Send, ArrowLeftRight, TrendingUp, TrendingDown, Activity, LineChart } from "lucide-react";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type PlantProfile = "tipo_a" | "tipo_b" | "acoplada";

export default function ComparativeView() {
  // Estado de configuración
  const [isConfigured, setIsConfigured] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [limits, setLimits] = useState("");
  const [ethics, setEthics] = useState("");
  
  // Perfiles seleccionados para cada panel
  const [profileLeft, setProfileLeft] = useState<PlantProfile>("tipo_a");
  const [profileRight, setProfileRight] = useState<PlantProfile>("acoplada");
  
  // IDs de sesiones
  const [sessionLeftId, setSessionLeftId] = useState<number | null>(null);
  const [sessionRightId, setSessionRightId] = useState<number | null>(null);
  
  // Input de usuario
  const [userInput, setUserInput] = useState("");
  
  // Refs para sincronización de scroll
  const scrollLeftRef = useRef<HTMLDivElement>(null);
  const scrollRightRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);
  
  // Mutations
  const createSessionMutation = trpc.session.create.useMutation();
  const sendToMultipleMutation = trpc.conversation.sendToMultiple.useMutation();
  
  // Queries para sesión izquierda
  const { data: messagesLeft, refetch: refetchMessagesLeft } = trpc.conversation.getHistory.useQuery(
    { sessionId: sessionLeftId! },
    { enabled: !!sessionLeftId }
  );
  
  const { data: metricsLeft, refetch: refetchMetricsLeft } = trpc.metrics.getSessionMetrics.useQuery(
    { sessionId: sessionLeftId! },
    { enabled: !!sessionLeftId }
  );
  
  // Queries para sesión derecha
  const { data: messagesRight, refetch: refetchMessagesRight } = trpc.conversation.getHistory.useQuery(
    { sessionId: sessionRightId! },
    { enabled: !!sessionRightId }
  );
  
  const { data: metricsRight, refetch: refetchMetricsRight } = trpc.metrics.getSessionMetrics.useQuery(
    { sessionId: sessionRightId! },
    { enabled: !!sessionRightId }
  );
  
  // Query para análisis de diferencias
  const { data: differencesData } = trpc.conversation.analyzeDifferences.useQuery(
    { sessionLeftId: sessionLeftId!, sessionRightId: sessionRightId! },
    { enabled: !!sessionLeftId && !!sessionRightId && isConfigured }
  );
  
  const handleStartComparison = async () => {
    if (!purpose || !limits || !ethics) {
      toast.error("Por favor completa todos los campos de referencia ontológica");
      return;
    }
    
    try {
      // Crear sesión izquierda
      const leftResult = await createSessionMutation.mutateAsync({
        purpose,
        limits,
        ethics,
        plantProfile: profileLeft,
        controlGain: 0.5,
      });
      
      // Crear sesión derecha
      const rightResult = await createSessionMutation.mutateAsync({
        purpose,
        limits,
        ethics,
        plantProfile: profileRight,
        controlGain: 0.5,
      });
      
      setSessionLeftId(leftResult.sessionId);
      setSessionRightId(rightResult.sessionId);
      setIsConfigured(true);
      
      toast.success("Comparación iniciada con ambos perfiles");
    } catch (error) {
      toast.error("Error al iniciar la comparación");
      console.error(error);
    }
  };
  
  // Sincronización de scroll
  useEffect(() => {
    const leftViewport = scrollLeftRef.current;
    const rightViewport = scrollRightRef.current;
    
    if (!leftViewport || !rightViewport) return;
    
    const handleLeftScroll = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      rightViewport.scrollTop = leftViewport.scrollTop;
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 50);
    };
    
    const handleRightScroll = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      leftViewport.scrollTop = rightViewport.scrollTop;
      setTimeout(() => {
        isSyncingRef.current = false;
      }, 50);
    };
    
    leftViewport.addEventListener('scroll', handleLeftScroll);
    rightViewport.addEventListener('scroll', handleRightScroll);
    
    return () => {
      leftViewport.removeEventListener('scroll', handleLeftScroll);
      rightViewport.removeEventListener('scroll', handleRightScroll);
    };
  }, [isConfigured]);
  
  const handleSendMessage = async () => {
    if (!userInput.trim() || !sessionLeftId || !sessionRightId) return;
    
    try {
      await sendToMultipleMutation.mutateAsync({
        sessionIds: [sessionLeftId, sessionRightId],
        content: userInput,
      });
      
      setUserInput("");
      
      // Refetch ambas sesiones
      await Promise.all([
        refetchMessagesLeft(),
        refetchMessagesRight(),
        refetchMetricsLeft(),
        refetchMetricsRight(),
      ]);
      
      toast.success("Mensaje enviado a ambas sesiones");
    } catch (error) {
      toast.error("Error al enviar mensaje");
      console.error(error);
    }
  };
  
  const getProfileLabel = (profile: PlantProfile) => {
    switch (profile) {
      case "tipo_a":
        return "Tipo A (Alta Entropía)";
      case "tipo_b":
        return "Tipo B (Ruido Moderado)";
      case "acoplada":
        return "Acoplada (Régimen CAELION)";
    }
  };
  
  // Helper para obtener diferencia de un mensaje específico
  const getDifferenceForMessage = (messageId: number) => {
    if (!differencesData?.differences) return null;
    return differencesData.differences.find(
      d => d.messageIdLeft === messageId || d.messageIdRight === messageId
    );
  };
  
  const getProfileColor = (profile: PlantProfile) => {
    switch (profile) {
      case "tipo_a":
        return "destructive";
      case "tipo_b":
        return "secondary";
      case "acoplada":
        return "default";
    }
  };
  
  // Preparar datos comparativos para gráficos
  const comparativeData = metricsLeft && metricsRight ? 
    metricsLeft.map((metricL: any, i: number) => {
      const metricR = metricsRight[i];
      return {
        step: i + 1,
        vLeft: metricL.funcionLyapunov,
        vRight: metricR?.funcionLyapunov || 0,
        omegaLeft: metricL.coherenciaObservable,
        omegaRight: metricR?.coherenciaObservable || 0,
      };
    }) : [];
  
  // Métricas más recientes
  const latestMetricsLeft = metricsLeft && metricsLeft.length > 0 ? metricsLeft[metricsLeft.length - 1] : null;
  const latestMetricsRight = metricsRight && metricsRight.length > 0 ? metricsRight[metricsRight.length - 1] : null;
  
  if (!isConfigured) {
    return (
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Vista Comparativa</h1>
          <p className="text-muted-foreground">
            Análisis lado a lado de dos perfiles de planta con la misma referencia ontológica
          </p>
        </div>
        
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Configuración de Comparación</CardTitle>
            <CardDescription>
              Define la referencia ontológica compartida y selecciona los perfiles a comparar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Referencia Ontológica */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="purpose">Propósito (P)</Label>
                <Textarea
                  id="purpose"
                  placeholder="Define el objetivo fundamental del sistema..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="limits">Límites (L)</Label>
                <Textarea
                  id="limits"
                  placeholder="Establece las restricciones operacionales..."
                  value={limits}
                  onChange={(e) => setLimits(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="ethics">Ética (E)</Label>
                <Textarea
                  id="ethics"
                  placeholder="Define los principios éticos y valores..."
                  value={ethics}
                  onChange={(e) => setEthics(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            
            {/* Selección de Perfiles */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <Label className="mb-3 block">Panel Izquierdo</Label>
                <div className="space-y-2">
                  {(["tipo_a", "tipo_b", "acoplada"] as PlantProfile[]).map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setProfileLeft(profile)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        profileLeft === profile
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Badge variant={getProfileColor(profile)} className="mb-1">
                        {getProfileLabel(profile)}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="mb-3 block">Panel Derecho</Label>
                <div className="space-y-2">
                  {(["tipo_a", "tipo_b", "acoplada"] as PlantProfile[]).map((profile) => (
                    <button
                      key={profile}
                      onClick={() => setProfileRight(profile)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        profileRight === profile
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Badge variant={getProfileColor(profile)} className="mb-1">
                        {getProfileLabel(profile)}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button 
                size="lg" 
                onClick={handleStartComparison}
                disabled={createSessionMutation.isPending}
              >
                <Play className="mr-2 h-5 w-5" />
                Iniciar Comparación
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Análisis Comparativo</h1>
          <p className="text-sm text-muted-foreground">
            Observación paralela de trayectorias bajo diferentes regímenes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getProfileColor(profileLeft)}>
            {getProfileLabel(profileLeft)}
          </Badge>
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          <Badge variant={getProfileColor(profileRight)}>
            {getProfileLabel(profileRight)}
          </Badge>
        </div>
      </div>
      
      {/* Métricas Comparativas */}
      {latestMetricsLeft && latestMetricsRight && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Coherencia Observable Ω(t)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-chart-1">
                    {latestMetricsLeft.coherenciaObservable.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">{getProfileLabel(profileLeft)}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-chart-2">
                    {latestMetricsRight.coherenciaObservable.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">{getProfileLabel(profileRight)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Función de Lyapunov V(e)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-chart-1">
                    {latestMetricsLeft.funcionLyapunov.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">{getProfileLabel(profileLeft)}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-chart-2">
                    {latestMetricsRight.funcionLyapunov.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">{getProfileLabel(profileRight)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Error Cognitivo ||e(t)||
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-chart-1">
                    {latestMetricsLeft.errorCognitivoMagnitud.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">{getProfileLabel(profileLeft)}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-chart-2">
                    {latestMetricsRight.errorCognitivoMagnitud.toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">{getProfileLabel(profileRight)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Panel de Resumen de Diferencias */}
      {differencesData && differencesData.summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Análisis de Divergencias
            </CardTitle>
            <CardDescription>
              Comparación automática de respuestas entre {getProfileLabel(profileLeft)} y {getProfileLabel(profileRight)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{differencesData.summary.totalPairs}</div>
                  <p className="text-xs text-muted-foreground">Pares analizados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-destructive">
                    {differencesData.summary.significantDifferences}
                  </div>
                  <p className="text-xs text-muted-foreground">Divergencias significativas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {differencesData.summary.significantPercent}%
                  </div>
                  <p className="text-xs text-muted-foreground">Tasa de divergencia</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {differencesData.summary.avgLengthDiff}
                  </div>
                  <p className="text-xs text-muted-foreground">Diferencia promedio (caracteres)</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Layout Split-Screen */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* Panel Izquierdo */}
        <Card className="flex flex-col" style={{ height: '500px' }}>
          <CardHeader className="flex-shrink-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {getProfileLabel(profileLeft)}
              </CardTitle>
              <Badge variant={getProfileColor(profileLeft)} className="text-xs">
                Sesión {sessionLeftId}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden" ref={scrollLeftRef}>
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {messagesLeft?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary/10 ml-4"
                        : "bg-muted mr-4"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-xs font-semibold text-muted-foreground">
                        {msg.role === "user" ? "Entrada" : "Salida"}
                      </div>
                      <div className="flex items-center gap-1">
                        {msg.role === "assistant" && (() => {
                          const diff = getDifferenceForMessage(msg.id);
                          return (
                            <>
                              {diff && diff.isSignificant && (
                                <Badge 
                                  variant="destructive"
                                  className="text-[10px] px-1.5 py-0"
                                  title={`Divergencia: ${diff.lengthDiffPercent}% longitud, ${diff.wordsDiff} palabras`}
                                >
                                  Δ {diff.lengthDiffPercent}%
                                </Badge>
                              )}
                              {msg.plantProfile && (
                                <Badge 
                                  variant={getProfileColor(msg.plantProfile)}
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {getProfileLabel(msg.plantProfile)}
                                </Badge>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div>{msg.content}</div>
                  </div>
                 ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
        
        {/* Panel Derecho */}
        <Card className="flex flex-col" style={{ height: '500px' }}>
          <CardHeader className="flex-shrink-0 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {getProfileLabel(profileRight)}
              </CardTitle>
              <Badge variant={getProfileColor(profileRight)} className="text-xs">
                Sesión {sessionRightId}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-hidden" ref={scrollRightRef}>
              <ScrollArea className="h-full pr-4">
                <div className="space-y-3">
                  {messagesRight?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-3 text-sm ${
                      msg.role === "user"
                        ? "bg-primary/10 ml-4"
                        : "bg-muted mr-4"
                    }`}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <div className="text-xs font-semibold text-muted-foreground">
                        {msg.role === "user" ? "Entrada" : "Salida"}
                      </div>
                      <div className="flex items-center gap-1">
                        {msg.role === "assistant" && (() => {
                          const diff = getDifferenceForMessage(msg.id);
                          return (
                            <>
                              {diff && diff.isSignificant && (
                                <Badge 
                                  variant="destructive"
                                  className="text-[10px] px-1.5 py-0"
                                  title={`Divergencia: ${diff.lengthDiffPercent}% longitud, ${diff.wordsDiff} palabras`}
                                >
                                  Δ {diff.lengthDiffPercent}%
                                </Badge>
                              )}
                              {msg.plantProfile && (
                                <Badge 
                                  variant={getProfileColor(msg.plantProfile)}
                                  className="text-[10px] px-1.5 py-0"
                                >
                                  {getProfileLabel(msg.plantProfile)}
                                </Badge>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Input Sincronizado */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Entrada sincronizada para ambas sesiones..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={sendToMultipleMutation.isPending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Gráficos Comparativos */}
      <Tabs defaultValue="lyapunov" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lyapunov">Función de Lyapunov V(t)</TabsTrigger>
          <TabsTrigger value="coherence">Coherencia Observable Ω(t)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lyapunov">
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Energía de Lyapunov</CardTitle>
              <CardDescription>
                Decaimiento monótono vs deriva estocástica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={comparativeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" label={{ value: "Turno", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "V(e)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="vLeft" 
                    stroke="hsl(var(--chart-1))" 
                    name={getProfileLabel(profileLeft)}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="vRight" 
                    stroke="hsl(var(--chart-2))" 
                    name={getProfileLabel(profileRight)}
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="coherence">
          <Card>
            <CardHeader>
              <CardTitle>Comparación de Coherencia Observable</CardTitle>
              <CardDescription>
                Persistencia de alineación semántica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={comparativeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" label={{ value: "Turno", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Ω(t)", angle: -90, position: "insideLeft" }} domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="omegaLeft" 
                    stroke="hsl(var(--chart-1))" 
                    name={getProfileLabel(profileLeft)}
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="omegaRight" 
                    stroke="hsl(var(--chart-2))" 
                    name={getProfileLabel(profileRight)}
                    strokeWidth={2}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
