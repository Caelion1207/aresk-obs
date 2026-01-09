import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  Brain, 
  LineChart, 
  Shield, 
  Play, 
  Pause,
  RotateCcw,
  ArrowLeft,
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

export default function Simulator() {
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [controlMode, setControlMode] = useState<"controlled" | "uncontrolled">("controlled");
  const [isSessionActive, setIsSessionActive] = useState(false);
  
  // Form state for reference ontology
  const [purpose, setPurpose] = useState("");
  const [limits, setLimits] = useState("");
  const [ethics, setEthics] = useState("");
  
  // Conversation state
  const [userInput, setUserInput] = useState("");
  
  // Mutations
  const createSessionMutation = trpc.session.create.useMutation();
  const sendMessageMutation = trpc.conversation.sendMessage.useMutation();
  const toggleModeMutation = trpc.session.toggleMode.useMutation();
  
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
        controlMode,
      });
      
      setSessionId(result.sessionId);
      setIsSessionActive(true);
      toast.success("Sesión iniciada correctamente");
    } catch (error) {
      toast.error("Error al iniciar la sesión");
      console.error(error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!sessionId || !userInput.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        sessionId,
        content: userInput,
      });
      
      setUserInput("");
      await refetchMessages();
      await refetchMetrics();
      await refetchPhaseSpace();
      
      toast.success("Mensaje enviado");
    } catch (error) {
      toast.error("Error al enviar el mensaje");
      console.error(error);
    }
  };
  
  const handleToggleMode = async () => {
    if (!sessionId) return;
    
    const newMode = controlMode === "controlled" ? "uncontrolled" : "controlled";
    
    try {
      await toggleModeMutation.mutateAsync({
        sessionId,
        controlMode: newMode,
      });
      
      setControlMode(newMode);
      toast.success(`Modo cambiado a: ${newMode === "controlled" ? "Controlado" : "Sin Control"}`);
    } catch (error) {
      toast.error("Error al cambiar el modo");
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
    phaseSpace.H.map((h, i) => ({ H: h, C: phaseSpace.C[i] })) : [];
  
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
                <span className="font-semibold">ARESK-OBS Simulator</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isSessionActive && (
                <>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="control-mode" className="text-sm">Modo:</Label>
                    <Switch
                      id="control-mode"
                      checked={controlMode === "controlled"}
                      onCheckedChange={handleToggleMode}
                    />
                    <Badge variant={controlMode === "controlled" ? "default" : "secondary"}>
                      {controlMode === "controlled" ? "Controlado" : "Sin Control"}
                    </Badge>
                  </div>
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
                  Configuración de Referencia Ontológica
                </CardTitle>
                <CardDescription>
                  Define el estado de referencia x_ref = (P, L, E) para el sistema de control semántico
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
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="initial-mode">Modo inicial:</Label>
                    <Switch
                      id="initial-mode"
                      checked={controlMode === "controlled"}
                      onCheckedChange={(checked) => 
                        setControlMode(checked ? "controlled" : "uncontrolled")
                      }
                    />
                    <span className="text-sm text-muted-foreground">
                      {controlMode === "controlled" ? "Controlado" : "Sin Control"}
                    </span>
                  </div>
                  
                  <Button 
                    size="lg" 
                    onClick={handleStartSession}
                    disabled={createSessionMutation.isPending}
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar Simulación
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Simulation Dashboard */
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left Column - Conversation */}
            <div className="lg:col-span-1">
              <Card className="h-[calc(100vh-200px)]">
                <CardHeader>
                  <CardTitle className="text-lg">Conversación</CardTitle>
                </CardHeader>
                <CardContent className="flex h-[calc(100%-80px)] flex-col">
                  <ScrollArea className="flex-1 pr-4">
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
                            {msg.role === "user" ? "Usuario" : "Asistente"}
                          </div>
                          <div className="text-sm">{msg.content}</div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="mt-4 flex gap-2">
                    <Input
                      placeholder="Escribe tu mensaje..."
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
                        Similitud del coseno
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
                        Distancia a referencia
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">V(t) - Función de Lyapunov</CardTitle>
                      <CardDescription>
                        Decaimiento monótono hacia cero demuestra estabilidad asintótica
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={lyapunovData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            dataKey="step" 
                            label={{ value: 'Paso de conversación', position: 'insideBottom', offset: -5 }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <YAxis 
                            label={{ value: 'V(e)', angle: -90, position: 'insideLeft' }}
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
                            dataKey="V" 
                            stroke="oklch(from var(--chart-2) l c h)" 
                            strokeWidth={2}
                            dot={{ fill: 'oklch(from var(--chart-2) l c h)' }}
                          />
                        </RechartsLineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="coherence" className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Ω(t) - Coherencia Observable</CardTitle>
                      <CardDescription>
                        Meseta de alta coherencia en modo controlado vs. colapso sin control
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <RechartsLineChart data={coherenceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            dataKey="step" 
                            label={{ value: 'Paso de conversación', position: 'insideBottom', offset: -5 }}
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
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Mapa de Fase (H vs C)</CardTitle>
                      <CardDescription>
                        Trayectoria del estado siendo atraída hacia el atractor de estabilidad
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray="3 3" stroke="oklch(from var(--border) l c h / 0.3)" />
                          <XAxis 
                            dataKey="H" 
                            name="Entropía H(t)"
                            label={{ value: 'H(t) - Entropía', position: 'insideBottom', offset: -5 }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <YAxis 
                            dataKey="C" 
                            name="Coherencia C(t)"
                            label={{ value: 'C(t) - Coherencia', angle: -90, position: 'insideLeft' }}
                            stroke="oklch(from var(--foreground) l c h / 0.5)"
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'oklch(from var(--card) l c h)', 
                              border: '1px solid oklch(from var(--border) l c h)'
                            }}
                            cursor={{ strokeDasharray: '3 3' }}
                          />
                          <Scatter 
                            data={phaseSpaceData} 
                            fill="oklch(from var(--chart-3) l c h)" 
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
