import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Activity, 
  Brain, 
  LineChart, 
  Shield, 
  Play,
  RotateCcw,
  ArrowLeft,
  TrendingDown,
  TrendingUp,
  Clock
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import PhaseSpaceMap from "@/components/PhaseSpaceMap";
import LyapunovChart from "@/components/LyapunovChart";
import FieldIntensityMonitor from "@/components/FieldIntensityMonitor";

type PlantProfile = "tipo_a" | "tipo_b" | "acoplada";

export default function Simulator() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [plantProfile, setPlantProfile] = useState<PlantProfile>("acoplada");
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Form state for reference ontology
  const [purpose, setPurpose] = useState("");
  const [limits, setLimits] = useState("");
  const [ethics, setEthics] = useState("");
  
  // Conversation state
  const [userInput, setUserInput] = useState("");
  
  // TPR state
  const [tprCurrent, setTprCurrent] = useState(0);
  const [tprMax, setTprMax] = useState(0);
  
  // Mutations
  const createSessionMutation = trpc.session.create.useMutation();
  const sendMessageMutation = trpc.conversation.sendMessage.useMutation();
  const toggleModeMutation = trpc.session.toggleMode.useMutation();
  const regenerateMutation = trpc.conversation.regenerateWithProfile.useMutation();
  
  // Queries
  const { data: messages, refetch: refetchMessages } = trpc.conversation.getHistory.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );
  
  const { data: metrics, refetch: refetchMetrics } = trpc.metrics.getSessionMetrics.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );
  
  const { data: phaseSpace, refetch: refetchPhaseSpace } = trpc.metrics.getPhaseSpace.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );
  
  const handleStartSession = async () => {
    if (!purpose || !limits || !ethics) {
      toast.error("Por favor completa todos los campos de la referencia ontológica");
      return;
    }
    
    try {
      const result = await createSessionMutation.mutateAsync({
        purpose,
        limits,
        ethics,
        plantProfile,
      });
      
      setSessionId(result.sessionId);
      setIsSessionActive(true);
      setTprCurrent(0);
      setTprMax(0);
      toast.success("Sesión iniciada correctamente");
    } catch (error) {
      toast.error("Error al iniciar la sesión");
      console.error(error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!sessionId || !userInput.trim()) return;
    
    try {
      const result = await sendMessageMutation.mutateAsync({
        sessionId,
        content: userInput,
      });
      
      // Actualizar TPR desde la respuesta
      if (result.tpr) {
        setTprCurrent(result.tpr.current);
        setTprMax(result.tpr.max);
      }
      
      setUserInput("");
      await refetchMessages();
      await refetchMetrics();
      await refetchPhaseSpace();
      
      toast.success("Mensaje procesado");
    } catch (error) {
      toast.error("Error al enviar el mensaje");
      console.error(error);
    }
  };
  
  const handleToggleProfile = async (newProfile: PlantProfile) => {
    if (!sessionId) return;
    
    try {
      await toggleModeMutation.mutateAsync({
        sessionId,
        plantProfile: newProfile,
      });
      
      setPlantProfile(newProfile);
      toast.success(`Perfil cambiado a: ${getProfileLabel(newProfile)}`);
    } catch (error) {
      toast.error("Error al cambiar el perfil");
      console.error(error);
    }
  };
  
  const handleRegenerateResponses = async () => {
    if (!sessionId) return;
    
    try {
      const result = await regenerateMutation.mutateAsync({ sessionId });
      await refetchMessages();
      await refetchMetrics();
      await refetchPhaseSpace();
      toast.success(result.message);
    } catch (error) {
      toast.error("Error al regenerar respuestas");
      console.error(error);
    }
  };
  
  const handleReset = () => {
    setSessionId(null);
    setIsSessionActive(false);
    setPurpose("");
    setLimits("");
    setEthics("");
    setUserInput("");
    setTprCurrent(0);
    setTprMax(0);
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
        return "secondary";
      case "acoplada":
        return "default";
    }
  };
  
  // Preparar datos para gráficos
  const lyapunovData = metrics?.map((m, i) => ({
    step: i + 1,
    V: m.funcionLyapunov,
  })) || [];
  
  const coherenceData = metrics?.map((m, i) => ({
    step: i + 1,
    omega: m.coherenciaObservable,
  })) || [];
  
  const phaseSpaceData = phaseSpace ? 
    phaseSpace.H.map((h, i) => ({ 
      H: h, 
      C: phaseSpace.C[i],
      step: i + 1,
    })) : [];
  
  const latestMetrics = metrics && metrics.length > 0 ? metrics[metrics.length - 1] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                <span className="font-semibold">ARESK-OBS v2.1: Monitor de Resiliencia Estructural</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isSessionActive && (
                <>
                  {/* TPR Display */}
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-1.5 bg-card">
                    <Clock className="h-4 w-4 text-primary" />
                    <div className="text-xs">
                      <div className="font-semibold">TPR: {tprCurrent}</div>
                      <div className="text-muted-foreground">Máx: {tprMax}</div>
                    </div>
                  </div>
                  
                  <Separator orientation="vertical" className="h-8" />
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="plant-profile" className="text-sm">Perfil de Planta:</Label>
                    <Select value={plantProfile} onValueChange={(value) => handleToggleProfile(value as PlantProfile)}>
                      <SelectTrigger id="plant-profile" className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tipo_a">Tipo A (Alta Entropía)</SelectItem>
                        <SelectItem value="tipo_b">Tipo B (Ruido Moderado)</SelectItem>
                        <SelectItem value="acoplada">Acoplada (CAELION)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant={getProfileColor(plantProfile)}>
                      {getProfileLabel(plantProfile)}
                    </Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRegenerateResponses}
                    disabled={regenerateMutation.isPending}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Regenerar Respuestas
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reiniciar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {!isSessionActive ? (
          /* Configuration Panel */
          <div className="mx-auto max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Configuración de Referencia Ontológica (Bucéfalo)
                </CardTitle>
                <CardDescription>
                  Define el estado de referencia x_ref = (P, L, E) que establece el régimen de estabilidad del Campo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="purpose">Propósito (P)</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Ejemplo: Asistir al usuario en el análisis de datos financieros con precisión y objetividad..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="limits">Límites Operacionales (L)</Label>
                  <Textarea
                    id="limits"
                    placeholder="Ejemplo: No hacer recomendaciones de inversión específicas. No procesar información confidencial sin autorización..."
                    value={limits}
                    onChange={(e) => setLimits(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ethics">Espacio Ético (E)</Label>
                  <Textarea
                    id="ethics"
                    placeholder="Ejemplo: Mantener transparencia sobre las limitaciones del análisis. Priorizar la precisión sobre la velocidad..."
                    value={ethics}
                    onChange={(e) => setEthics(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-3 pt-4 border-t">
                  <Label htmlFor="initial-profile">Perfil de Planta Inicial:</Label>
                  <Select value={plantProfile} onValueChange={(value) => setPlantProfile(value as PlantProfile)}>
                    <SelectTrigger id="initial-profile">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tipo_a">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Planta Tipo A</span>
                          <span className="text-xs text-muted-foreground">Alta Entropía / Bajo Control</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="tipo_b">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Planta Tipo B</span>
                          <span className="text-xs text-muted-foreground">Ruido Estocástico Moderado / Sin Referencia</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="acoplada">
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">Planta Acoplada</span>
                          <span className="text-xs text-muted-foreground">Régimen CAELION (Licurgo + Bucéfalo)</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="rounded-lg bg-muted/50 p-4 text-sm">
                    <p className="font-semibold mb-2">Descripción del Perfil Seleccionado:</p>
                    {plantProfile === "tipo_a" && (
                      <p className="text-muted-foreground">
                        La planta opera sin gobierno. Alta entropía semántica, deriva libre. 
                        No se aplica corrección de trayectoria. Ideal para observar colapso de coherencia.
                      </p>
                    )}
                    {plantProfile === "tipo_b" && (
                      <p className="text-muted-foreground">
                        La planta presenta ruido estocástico moderado sin referencia ontológica. 
                        Comportamiento natural sin imposición de régimen. Deriva controlada.
                      </p>
                    )}
                    {plantProfile === "acoplada" && (
                      <p className="text-muted-foreground">
                        Régimen CAELION activo. La ganancia Licurgo (K) y la referencia Bucéfalo (x_ref) 
                        fuerzan la estabilidad. Control u(t) = -K·e(t) aplicado en cada paso.
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    size="lg" 
                    onClick={handleStartSession}
                    disabled={createSessionMutation.isPending}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar Medición de Régimen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Simulation Dashboard */
          <div className="space-y-6">
            {/* Monitor de Intensidad de Campo */}
            {latestMetrics && (
              <FieldIntensityMonitor
                tprCurrent={tprCurrent}
                tprMax={tprMax}
                stabilityRadius={0.3}
                latestError={latestMetrics.errorCognitivoMagnitud}
                latestCoherence={latestMetrics.coherenciaObservable}
                controlActionMagnitud={latestMetrics.controlActionMagnitud}
                plantProfile={plantProfile}
              />
            )}
            
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Conversation */}
              <div className="lg:col-span-1">
                <Card className="flex flex-col" style={{ height: '600px' }}>
                  <CardHeader className="flex-shrink-0">
                    <CardTitle className="text-lg">Interacción con Planta Estocástica</CardTitle>
                    <CardDescription className="text-xs">
                      Observación de trayectoria bajo régimen {getProfileLabel(plantProfile)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 overflow-hidden">
                    <ScrollArea className="flex-1 pr-4" style={{ maxHeight: 'calc(600px - 180px)' }}>
                      <div className="space-y-4">
                        {messages?.map((msg) => (
                          <div
                            key={msg.id}
                            className={`rounded-lg p-3 ${
                              msg.role === "user"
                                ? "bg-primary/10 ml-4"
                                : "bg-muted mr-4"
                            }`}
                          >
                            <div className="mb-1 text-xs font-semibold text-muted-foreground">
                              {msg.role === "user" ? "Entrada" : "Salida de Planta"}
                            </div>
                            <div className="text-sm">{msg.content}</div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="mt-4 flex gap-2 flex-shrink-0">
                      <Input
                        placeholder="Entrada al sistema..."
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
                        disabled={sendMessageMutation.isPending}
                      >
                        Enviar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Right Column - Metrics and Visualizations */}
              <div className="lg:col-span-2 space-y-6">
                {/* Real-time Metrics Cards */}
                {latestMetrics && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Coherencia Observable Ω(t)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">
                          {latestMetrics.coherenciaObservable.toFixed(3)}
                        </div>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          {latestMetrics.coherenciaObservable > 0.7 ? (
                            <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          Similitud direccional
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
                        <div className="text-3xl font-bold text-chart-2">
                          {latestMetrics.funcionLyapunov.toFixed(3)}
                        </div>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <Activity className="mr-1 h-3 w-3" />
                          Energía de desalineación
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
                        <div className="text-3xl font-bold text-chart-3">
                          {latestMetrics.errorCognitivoMagnitud.toFixed(3)}
                        </div>
                        <div className="mt-1 flex items-center text-xs text-muted-foreground">
                          <LineChart className="mr-1 h-3 w-3" />
                          Distancia a Bucéfalo
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {/* Charts */}
                <Tabs defaultValue="lyapunov" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="lyapunov">Función de Lyapunov</TabsTrigger>
                    <TabsTrigger value="coherence">Coherencia Observable</TabsTrigger>
                    <TabsTrigger value="phase">Mapa de Fase</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="lyapunov" className="mt-4">
                    <LyapunovChart data={lyapunovData} stabilityRadius={0.3} />
                  </TabsContent>
                  
                  <TabsContent value="coherence" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Ω(t) - Coherencia Observable</CardTitle>
                        <CardDescription>
                          Meseta de alta coherencia en régimen acoplado vs. colapso en deriva libre
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsLineChart data={coherenceData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                            <XAxis 
                              dataKey="step" 
                              label={{ value: 'Paso de interacción', position: 'insideBottom', offset: -5 }}
                              stroke="oklch(from var(--foreground) l c h / 0.5)"
                            />
                            <YAxis 
                              domain={[-1, 1]}
                              label={{ value: 'Ω(t)', angle: -90, position: 'insideLeft' }}
                              stroke="oklch(from var(--foreground) l c h / 0.5)"
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: 'oklch(from var(--card) l c h)', 
                                border: '1px solid oklch(from var(--border) l c h)'
                              }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="omega" 
                              stroke="oklch(from var(--primary) l c h)" 
                              strokeWidth={2}
                              dot={{ fill: 'oklch(from var(--primary) l c h)' }}
                            />
                          </RechartsLineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="phase" className="mt-4">
                    <PhaseSpaceMap data={phaseSpaceData} plantProfile={plantProfile} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
