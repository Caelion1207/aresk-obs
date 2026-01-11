import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Play, Pause, StopCircle, Rewind, FastForward, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

type PlaybackSpeed = 0.5 | 1 | 2 | 4;

export default function SessionReplay() {
  const [, params] = useRoute("/replay/:sessionId");
  const [, setLocation] = useLocation();
  const sessionId = params?.sessionId ? parseInt(params.sessionId) : null;
  
  // Estado de reproducción
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  
  // Ref para el intervalo de reproducción
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Query del historial
  const { data: historyData, isLoading } = trpc.metrics.getTimeSeriesHistory.useQuery(
    { sessionId: sessionId! },
    { enabled: !!sessionId }
  );
  
  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);
  
  // Control de reproducción
  useEffect(() => {
    if (isPlaying && historyData) {
      const interval = 1000 / playbackSpeed; // Intervalo en ms
      
      playbackIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= historyData.timeSeries.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
      
      return () => {
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current);
        }
      };
    }
  }, [isPlaying, playbackSpeed, historyData]);
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleStop = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };
  
  const handleRewind = () => {
    setCurrentStep(prev => Math.max(0, prev - 10));
  };
  
  const handleFastForward = () => {
    if (historyData) {
      setCurrentStep(prev => Math.min(historyData.timeSeries.length - 1, prev + 10));
    }
  };
  
  const handleSpeedChange = () => {
    const speeds: PlaybackSpeed[] = [0.5, 1, 2, 4];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]!);
  };
  
  if (!sessionId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>ID de sesión no válido</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Volver al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Cargando...</CardTitle>
            <CardDescription>Obteniendo historial de la sesión</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  if (!historyData || historyData.timeSeries.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Sin Datos</CardTitle>
            <CardDescription>No hay métricas disponibles para esta sesión</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")}>Volver al Inicio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const currentData = historyData.timeSeries[currentStep];
  const visibleData = historyData.timeSeries.slice(0, currentStep + 1);
  
  const getProfileLabel = (profile: string) => {
    switch (profile) {
      case "tipo_a": return "Tipo A (Alta Entropía)";
      case "tipo_b": return "Tipo B (Ruido Moderado)";
      case "acoplada": return "Acoplada (CAELION)";
      default: return profile;
    }
  };
  
  const getProfileBadgeVariant = (profile: string) => {
    switch (profile) {
      case "tipo_a": return "destructive";
      case "tipo_b": return "secondary";
      case "acoplada": return "default";
      default: return "outline";
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Activity className="h-10 w-10" />
          Reproducción de Sesión #{sessionId}
        </h1>
        <p className="text-muted-foreground">
          Visualización temporal de la evolución de métricas de control semántico
        </p>
      </div>
      
      {/* Información de la Sesión */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información de la Sesión</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div>
            <span className="text-xs text-muted-foreground">Perfil de Planta</span>
            <div className="mt-1">
              <Badge variant={getProfileBadgeVariant(historyData.plantProfile)}>
                {getProfileLabel(historyData.plantProfile)}
              </Badge>
            </div>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Total de Pasos</span>
            <p className="text-lg font-bold">{historyData.totalSteps}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Duración</span>
            <p className="text-lg font-bold">{Math.round(historyData.duration / 1000)}s</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Paso Actual</span>
            <p className="text-lg font-bold">{currentStep + 1} / {historyData.totalSteps}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Controles de Reproducción */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Controles de Reproducción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Button onClick={handleRewind} variant="outline" size="icon">
              <Rewind className="h-4 w-4" />
            </Button>
            <Button onClick={handlePlayPause} variant="default" size="icon">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button onClick={handleStop} variant="outline" size="icon">
              <StopCircle className="h-4 w-4" />
            </Button>
            <Button onClick={handleFastForward} variant="outline" size="icon">
              <FastForward className="h-4 w-4" />
            </Button>
            <Button onClick={handleSpeedChange} variant="outline" className="ml-4">
              {playbackSpeed}x
            </Button>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={[currentStep]}
              onValueChange={([value]) => {
                setIsPlaying(false);
                setCurrentStep(value);
              }}
              min={0}
              max={historyData.totalSteps - 1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Inicio</span>
              <span>Paso {currentStep + 1}</span>
              <span>Fin</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Métricas Instantáneas */}
      {currentData && (
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">||e(t)|| - Error Cognitivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currentData.errorNorm.toFixed(3)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">V(e) - Función de Lyapunov</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currentData.funcionLyapunov.toFixed(3)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Ω(t) - Coherencia Observable</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currentData.coherenciaObservable.toFixed(3)}</p>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Gráficos Animados */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolución de V(t)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={visibleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="step" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                <Legend />
                <Line type="monotone" dataKey="funcionLyapunov" stroke="#3b82f6" strokeWidth={2} dot={false} name="V(t)" />
                <ReferenceLine x={currentStep + 1} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolución de Ω(t)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={visibleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="step" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                <Legend />
                <Line type="monotone" dataKey="coherenciaObservable" stroke="#10b981" strokeWidth={2} dot={false} name="Ω(t)" />
                <ReferenceLine x={currentStep + 1} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Mensaje Actual */}
      {currentData?.message && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mensaje en Paso {currentStep + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              <div className="space-y-4">
                <div className={`p-3 rounded ${currentData.message.role === "user" ? "bg-blue-500/10" : "bg-green-500/10"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={currentData.message.role === "user" ? "secondary" : "default"}>
                      {currentData.message.role === "user" ? "Usuario" : "Asistente"}
                    </Badge>
                    {currentData.message.plantProfile && (
                      <Badge variant={getProfileBadgeVariant(currentData.message.plantProfile)} className="text-[10px]">
                        {currentData.message.plantProfile.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{currentData.message.content}</p>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
