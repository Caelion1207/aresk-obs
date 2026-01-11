import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeftRight, Send, Activity } from "lucide-react";
import { ThresholdConfig, getSimilarityColor, type SimilarityThresholds } from "@/components/ThresholdConfig";

type PlantProfile = "tipo_a" | "tipo_b" | "acoplada";

export default function TripleComparative() {
  // Estado de configuración
  const [purpose, setPurpose] = useState("");
  const [limits, setLimits] = useState("");
  const [ethics, setEthics] = useState("");
  const [isConfigured, setIsConfigured] = useState(false);
  
  // Estados de sesiones
  const [sessionLeftId, setSessionLeftId] = useState<number | null>(null);
  const [sessionCenterId, setSessionCenterId] = useState<number | null>(null);
  const [sessionRightId, setSessionRightId] = useState<number | null>(null);
  
  // Perfiles seleccionados
  const [profileLeft, setProfileLeft] = useState<PlantProfile>("tipo_a");
  const [profileCenter, setProfileCenter] = useState<PlantProfile>("tipo_b");
  const [profileRight, setProfileRight] = useState<PlantProfile>("acoplada");
  
  // Input de mensaje
  const [userInput, setUserInput] = useState("");
  
  // Umbrales de similitud
  const [thresholds, setThresholds] = useState<SimilarityThresholds>({ high: 0.8, medium: 0.6 });
  
  // Mutations
  const createSessionMutation = trpc.session.create.useMutation();
  const sendToMultipleMutation = trpc.conversation.sendToMultiple.useMutation();
  
  // Queries para sesión izquierda
  const { data: messagesLeft, refetch: refetchMessagesLeft } = trpc.conversation.getHistory.useQuery(
    { sessionId: sessionLeftId! },
    { enabled: !!sessionLeftId }
  );
  
  const { data: metricsLeft } = trpc.metrics.getSessionMetrics.useQuery(
    { sessionId: sessionLeftId! },
    { enabled: !!sessionLeftId }
  );
  
  // Queries para sesión central
  const { data: messagesCenter, refetch: refetchMessagesCenter } = trpc.conversation.getHistory.useQuery(
    { sessionId: sessionCenterId! },
    { enabled: !!sessionCenterId }
  );
  
  const { data: metricsCenter } = trpc.metrics.getSessionMetrics.useQuery(
    { sessionId: sessionCenterId! },
    { enabled: !!sessionCenterId }
  );
  
  // Queries para sesión derecha
  const { data: messagesRight, refetch: refetchMessagesRight } = trpc.conversation.getHistory.useQuery(
    { sessionId: sessionRightId! },
    { enabled: !!sessionRightId }
  );
  
  const { data: metricsRight } = trpc.metrics.getSessionMetrics.useQuery(
    { sessionId: sessionRightId! },
    { enabled: !!sessionRightId }
  );
  
  // Query para análisis de diferencias por pares
  const { data: tripleDifferences } = trpc.conversation.analyzeTripleDifferences.useQuery(
    {
      sessionId1: sessionLeftId!,
      sessionId2: sessionCenterId!,
      sessionId3: sessionRightId!,
    },
    { enabled: !!sessionLeftId && !!sessionCenterId && !!sessionRightId }
  );
  
  // Refs para sincronización de scroll
  const scrollLeftRef = useRef<HTMLDivElement>(null);
  const scrollCenterRef = useRef<HTMLDivElement>(null);
  const scrollRightRef = useRef<HTMLDivElement>(null);
  const isSyncing = useRef(false);
  
  // Sincronización de scroll entre los tres paneles
  useEffect(() => {
    const leftViewport = scrollLeftRef.current;
    const centerViewport = scrollCenterRef.current;
    const rightViewport = scrollRightRef.current;
    
    if (!leftViewport || !centerViewport || !rightViewport) return;
    
    const syncScroll = (source: HTMLDivElement, targets: HTMLDivElement[]) => {
      return () => {
        if (isSyncing.current) return;
        isSyncing.current = true;
        
        const scrollRatio = source.scrollTop / (source.scrollHeight - source.clientHeight);
        targets.forEach(target => {
          target.scrollTop = scrollRatio * (target.scrollHeight - target.clientHeight);
        });
        
        setTimeout(() => { isSyncing.current = false; }, 10);
      };
    };
    
    const handleLeftScroll = syncScroll(leftViewport, [centerViewport, rightViewport]);
    const handleCenterScroll = syncScroll(centerViewport, [leftViewport, rightViewport]);
    const handleRightScroll = syncScroll(rightViewport, [leftViewport, centerViewport]);
    
    leftViewport.addEventListener('scroll', handleLeftScroll);
    centerViewport.addEventListener('scroll', handleCenterScroll);
    rightViewport.addEventListener('scroll', handleRightScroll);
    
    return () => {
      leftViewport.removeEventListener('scroll', handleLeftScroll);
      centerViewport.removeEventListener('scroll', handleCenterScroll);
      rightViewport.removeEventListener('scroll', handleRightScroll);
    };
  }, [sessionLeftId, sessionCenterId, sessionRightId]);
  
  const handleStartComparison = async () => {
    if (!purpose || !limits || !ethics) {
      toast.error("Por favor completa todos los campos de referencia ontológica");
      return;
    }
    
    try {
      // Crear tres sesiones con la misma referencia ontológica
      const [left, center, right] = await Promise.all([
        createSessionMutation.mutateAsync({
          purpose,
          limits,
          ethics,
          plantProfile: profileLeft,
        }),
        createSessionMutation.mutateAsync({
          purpose,
          limits,
          ethics,
          plantProfile: profileCenter,
        }),
        createSessionMutation.mutateAsync({
          purpose,
          limits,
          ethics,
          plantProfile: profileRight,
        }),
      ]);
      
      setSessionLeftId(left.sessionId);
      setSessionCenterId(center.sessionId);
      setSessionRightId(right.sessionId);
      setIsConfigured(true);
      toast.success("Comparación triple iniciada");
    } catch (error) {
      toast.error("Error al iniciar la comparación");
      console.error(error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!userInput.trim() || !sessionLeftId || !sessionCenterId || !sessionRightId) return;
    
    try {
      await sendToMultipleMutation.mutateAsync({
        sessionIds: [sessionLeftId, sessionCenterId, sessionRightId],
        content: userInput,
      });
      
      setUserInput("");
      
      // Refetch de todas las sesiones
      await Promise.all([
        refetchMessagesLeft(),
        refetchMessagesCenter(),
        refetchMessagesRight(),
      ]);
      
      toast.success("Mensaje enviado a los tres perfiles");
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
  
  const getProfileColor = (profile: PlantProfile) => {
    switch (profile) {
      case "tipo_a":
        return "destructive";
      case "tipo_b":
        return "default";
      case "acoplada":
        return "default";
    }
  };
  
  const latestMetricsLeft = metricsLeft?.[metricsLeft.length - 1];
  const latestMetricsCenter = metricsCenter?.[metricsCenter.length - 1];
  const latestMetricsRight = metricsRight?.[metricsRight.length - 1];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Activity className="h-10 w-10" />
          Comparación Triple de Perfiles
        </h1>
        <p className="text-muted-foreground">
          Análisis exhaustivo de tres perfiles de planta en paralelo
        </p>
      </div>
      
      {/* Configuración Inicial */}
      {!isConfigured && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configuración de Referencia Ontológica</CardTitle>
            <CardDescription>
              Define la referencia compartida x_ref = (P, L, E) para las tres sesiones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Perfil Izquierdo</Label>
                <Select value={profileLeft} onValueChange={(v) => setProfileLeft(v as PlantProfile)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tipo_a">Tipo A (Alta Entropía)</SelectItem>
                    <SelectItem value="tipo_b">Tipo B (Ruido Moderado)</SelectItem>
                    <SelectItem value="acoplada">Acoplada (CAELION)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Perfil Central</Label>
                <Select value={profileCenter} onValueChange={(v) => setProfileCenter(v as PlantProfile)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tipo_a">Tipo A (Alta Entropía)</SelectItem>
                    <SelectItem value="tipo_b">Tipo B (Ruido Moderado)</SelectItem>
                    <SelectItem value="acoplada">Acoplada (CAELION)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Perfil Derecho</Label>
                <Select value={profileRight} onValueChange={(v) => setProfileRight(v as PlantProfile)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tipo_a">Tipo A (Alta Entropía)</SelectItem>
                    <SelectItem value="tipo_b">Tipo B (Ruido Moderado)</SelectItem>
                    <SelectItem value="acoplada">Acoplada (CAELION)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="purpose">Propósito (P)</Label>
              <Textarea
                id="purpose"
                placeholder="Define el propósito de la interacción..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="limits">Límites (L)</Label>
              <Textarea
                id="limits"
                placeholder="Establece los límites operacionales..."
                value={limits}
                onChange={(e) => setLimits(e.target.value)}
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="ethics">Ética (E)</Label>
              <Textarea
                id="ethics"
                placeholder="Define los principios éticos..."
                value={ethics}
                onChange={(e) => setEthics(e.target.value)}
                rows={2}
              />
            </div>
            
            <Button onClick={handleStartComparison} className="w-full">
              Iniciar Comparación Triple
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Métricas Comparativas */}
      {isConfigured && latestMetricsLeft && latestMetricsCenter && latestMetricsRight && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Error Cognitivo ||e(t)||</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileLeft)}</span>
                  <span className="text-lg font-bold text-chart-1">
                    {latestMetricsLeft.errorCognitivoMagnitud.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileCenter)}</span>
                  <span className="text-lg font-bold text-chart-3">
                    {latestMetricsCenter.errorCognitivoMagnitud.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileRight)}</span>
                  <span className="text-lg font-bold text-chart-2">
                    {latestMetricsRight.errorCognitivoMagnitud.toFixed(3)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Función de Lyapunov V(e)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileLeft)}</span>
                  <span className="text-lg font-bold text-chart-1">
                    {latestMetricsLeft.funcionLyapunov.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileCenter)}</span>
                  <span className="text-lg font-bold text-chart-3">
                    {latestMetricsCenter.funcionLyapunov.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileRight)}</span>
                  <span className="text-lg font-bold text-chart-2">
                    {latestMetricsRight.funcionLyapunov.toFixed(4)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Coherencia Observable Ω(t)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileLeft)}</span>
                  <span className="text-lg font-bold text-chart-1">
                    {latestMetricsLeft.coherenciaObservable.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileCenter)}</span>
                  <span className="text-lg font-bold text-chart-3">
                    {latestMetricsCenter.coherenciaObservable.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{getProfileLabel(profileRight)}</span>
                  <span className="text-lg font-bold text-chart-2">
                    {latestMetricsRight.coherenciaObservable.toFixed(3)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Configuración de Umbrales */}
      {isConfigured && (
        <div className="mb-6">
          <ThresholdConfig onThresholdsChange={setThresholds} />
        </div>
      )}
      
      {/* Panel de Análisis de Diferencias por Pares */}
      {isConfigured && tripleDifferences && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5" />
              Análisis de Diferencias por Pares
            </CardTitle>
            <CardDescription>
              Comparación cuantitativa de divergencias entre perfiles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              {/* Resumen Agregado */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Resumen Global</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Divergencia Promedio</span>
                    <span className="font-bold">{tripleDifferences.summary.avgDivergence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Divergencia Máxima</span>
                    <span className="font-bold">{tripleDifferences.summary.maxDivergence}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Divergencia Mínima</span>
                    <span className="font-bold">{tripleDifferences.summary.minDivergence}%</span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Matriz de Comparaciones */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Matriz de Divergencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[10px]">A</Badge>
                        <span className="text-xs">↔</span>
                        <Badge variant="default" className="text-[10px]">B</Badge>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{tripleDifferences.pair1_2.significantPercent}%</span>
                          <span className="text-xs text-muted-foreground">({tripleDifferences.pair1_2.avgLengthDiff} chars)</span>
                        </div>
                        {tripleDifferences.pair1_2.avgSemanticSimilarity !== undefined && (
                          <span className={`text-xs font-bold ${getSimilarityColor(tripleDifferences.pair1_2.avgSemanticSimilarity, thresholds)}`}>
                            Similitud: {tripleDifferences.pair1_2.avgSemanticSimilarity.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive" className="text-[10px]">A</Badge>
                        <span className="text-xs">↔</span>
                        <Badge variant="default" className="text-[10px] bg-green-600">C</Badge>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{tripleDifferences.pair1_3.significantPercent}%</span>
                          <span className="text-xs text-muted-foreground">({tripleDifferences.pair1_3.avgLengthDiff} chars)</span>
                        </div>
                        {tripleDifferences.pair1_3.avgSemanticSimilarity !== undefined && (
                          <span className={`text-xs font-bold ${getSimilarityColor(tripleDifferences.pair1_3.avgSemanticSimilarity, thresholds)}`}>
                            Similitud: {tripleDifferences.pair1_3.avgSemanticSimilarity.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-[10px]">B</Badge>
                        <span className="text-xs">↔</span>
                        <Badge variant="default" className="text-[10px] bg-green-600">C</Badge>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold">{tripleDifferences.pair2_3.significantPercent}%</span>
                          <span className="text-xs text-muted-foreground">({tripleDifferences.pair2_3.avgLengthDiff} chars)</span>
                        </div>
                        {tripleDifferences.pair2_3.avgSemanticSimilarity !== undefined && (
                          <span className={`text-xs font-bold ${getSimilarityColor(tripleDifferences.pair2_3.avgSemanticSimilarity, thresholds)}`}>
                            Similitud: {tripleDifferences.pair2_3.avgSemanticSimilarity.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Layout de Tres Columnas */}
      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        {/* Panel Izquierdo */}
        <Card className="flex flex-col" style={{ height: '500px' }}>
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-base">{getProfileLabel(profileLeft)}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div ref={scrollLeftRef} className="h-full overflow-y-auto px-4 pb-4">
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
                      {msg.role === "assistant" && msg.plantProfile && (
                        <Badge 
                          variant={getProfileColor(msg.plantProfile)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {getProfileLabel(msg.plantProfile)}
                        </Badge>
                      )}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Panel Central */}
        <Card className="flex flex-col" style={{ height: '500px' }}>
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-base">{getProfileLabel(profileCenter)}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div ref={scrollCenterRef} className="h-full overflow-y-auto px-4 pb-4">
              <div className="space-y-3">
                {messagesCenter?.map((msg) => (
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
                      {msg.role === "assistant" && msg.plantProfile && (
                        <Badge 
                          variant={getProfileColor(msg.plantProfile)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {getProfileLabel(msg.plantProfile)}
                        </Badge>
                      )}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Panel Derecho */}
        <Card className="flex flex-col" style={{ height: '500px' }}>
          <CardHeader className="flex-shrink-0 pb-3">
            <CardTitle className="text-base">{getProfileLabel(profileRight)}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div ref={scrollRightRef} className="h-full overflow-y-auto px-4 pb-4">
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
                      {msg.role === "assistant" && msg.plantProfile && (
                        <Badge 
                          variant={getProfileColor(msg.plantProfile)}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {getProfileLabel(msg.plantProfile)}
                        </Badge>
                      )}
                    </div>
                    <div>{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Input de Mensaje */}
      {isConfigured && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="Escribe un mensaje para enviar a los tres perfiles..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!userInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
