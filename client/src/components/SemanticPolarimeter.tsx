import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface PolarityDataPoint {
  step: number;
  sigmaSem: number;
  epsilonEff: number;
}

interface SemanticPolarimeterProps {
  data: PolarityDataPoint[];
  currentSigmaSem: number;
  currentEpsilonEff: number;
  controlEventsCount?: number;
  lastControlType?: "none" | "position" | "structure" | "combined";
}

/**
 * Componente de Polarímetro Semántico
 * Visualiza σ_sem(t) y ε_eff en tiempo real con alertas de drenaje
 */
export default function SemanticPolarimeter({
  data,
  currentSigmaSem,
  currentEpsilonEff,
  controlEventsCount = 0,
  lastControlType = "none",
}: SemanticPolarimeterProps) {
  
  // Determinar estado de polaridad
  const polarityState = useMemo(() => {
    if (currentSigmaSem > 0.3) return "accretion";
    if (currentSigmaSem < -0.3) return "drainage";
    return "neutral";
  }, [currentSigmaSem]);
  
  // Determinar nivel de alerta
  const alertLevel = useMemo(() => {
    if (currentEpsilonEff < -0.5) return "critical";
    if (currentEpsilonEff < -0.3) return "warning";
    return "normal";
  }, [currentEpsilonEff]);
  
  // Color del gauge basado en polaridad
  const gaugeColor = useMemo(() => {
    if (polarityState === "accretion") return "oklch(0.7 0.2 150)"; // Verde
    if (polarityState === "drainage") return "oklch(0.6 0.25 25)"; // Rojo
    return "oklch(0.65 0.15 90)"; // Amarillo
  }, [polarityState]);
  
  // Texto descriptivo de polaridad
  const polarityLabel = useMemo(() => {
    if (polarityState === "accretion") return "Acreción Semántica";
    if (polarityState === "drainage") return "Drenaje Semántico";
    return "Polaridad Neutra";
  }, [polarityState]);
  
  // Icono de tendencia
  const TrendIcon = polarityState === "accretion" ? TrendingUp : polarityState === "drainage" ? TrendingDown : Minus;
  
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Polarímetro Semántico
              {alertLevel !== "normal" && (
                <AlertTriangle className="h-5 w-5 text-orange-500 animate-pulse" />
              )}
            </CardTitle>
            <CardDescription>
              Análisis de polaridad semántica σ_sem(t) y campo efectivo ε_eff
            </CardDescription>
          </div>
          
          {/* Contador de eventos de control */}
          {controlEventsCount > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <span className="text-xs">Control LICURGO:</span>
              <span className="font-bold">{controlEventsCount}</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Gauge de Polaridad Actual */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Polaridad Actual (σ_sem)</span>
            <div className="flex items-center gap-2">
              <TrendIcon className="h-4 w-4" style={{ color: gaugeColor }} />
              <span className="text-sm font-mono" style={{ color: gaugeColor }}>
                {currentSigmaSem >= 0 ? "+" : ""}{currentSigmaSem.toFixed(3)}
              </span>
            </div>
          </div>
          
          {/* Barra de gauge */}
          <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
            {/* Marcador central */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border z-10" />
            
            {/* Barra de polaridad */}
            <div
              className="absolute top-0 bottom-0 transition-all duration-500"
              style={{
                left: currentSigmaSem >= 0 ? "50%" : `${50 + currentSigmaSem * 50}%`,
                right: currentSigmaSem >= 0 ? `${50 - currentSigmaSem * 50}%` : "50%",
                backgroundColor: gaugeColor,
                opacity: 0.8,
              }}
            />
            
            {/* Etiquetas de rango */}
            <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-muted-foreground">
              <span>-1</span>
              <span>0</span>
              <span>+1</span>
            </div>
          </div>
          
          {/* Etiqueta de estado */}
          <div className="flex items-center justify-between">
            <Badge variant={polarityState === "drainage" ? "destructive" : "secondary"}>
              {polarityLabel}
            </Badge>
            {lastControlType !== "none" && (
              <Badge variant="outline" className="text-xs">
                Control: {lastControlType === "position" ? "Posición" : lastControlType === "structure" ? "Estructura" : "Combinado"}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Indicador de Campo Efectivo */}
        <div className="space-y-2 p-3 rounded-lg border" style={{
          borderColor: alertLevel === "critical" ? "oklch(0.6 0.25 25)" : alertLevel === "warning" ? "oklch(0.65 0.2 50)" : "oklch(0.3 0.05 240)",
          backgroundColor: alertLevel !== "normal" ? "oklch(0.2 0.05 25 / 0.3)" : "transparent",
        }}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Campo Efectivo (ε_eff)</span>
            <span className="text-sm font-mono font-bold">
              {currentEpsilonEff >= 0 ? "+" : ""}{currentEpsilonEff.toFixed(3)}
            </span>
          </div>
          
          {alertLevel !== "normal" && (
            <div className="flex items-center gap-2 text-xs text-orange-500">
              <AlertTriangle className="h-3 w-3" />
              <span>
                {alertLevel === "critical" 
                  ? "Drenaje crítico detectado - Control LICURGO activo" 
                  : "Drenaje moderado - Monitoreo activo"}
              </span>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            ε_eff = Ω(t) × σ_sem(t)
          </div>
        </div>
        
        {/* Gráfico de Evolución Temporal */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Evolución Temporal de σ_sem(t)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0.05 240)" />
              <XAxis 
                dataKey="step" 
                stroke="oklch(0.6 0.05 240)"
                label={{ value: "Paso Temporal", position: "insideBottom", offset: -5 }}
              />
              <YAxis 
                stroke="oklch(0.6 0.05 240)"
                domain={[-1, 1]}
                ticks={[-1, -0.5, 0, 0.5, 1]}
                label={{ value: "σ_sem", angle: -90, position: "insideLeft" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.2 0.05 240)",
                  border: "1px solid oklch(0.3 0.05 240)",
                  borderRadius: "8px",
                }}
                labelFormatter={(value) => `Paso ${value}`}
                formatter={(value: number) => [value.toFixed(3), "σ_sem"]}
              />
              
              {/* Línea de referencia en 0 */}
              <ReferenceLine y={0} stroke="oklch(0.5 0.05 240)" strokeDasharray="3 3" />
              
              {/* Zonas de alerta */}
              <ReferenceLine 
                y={-0.3} 
                stroke="oklch(0.65 0.2 50)" 
                strokeDasharray="5 5" 
                label={{ value: "Umbral Drenaje", position: "right", fill: "oklch(0.65 0.2 50)", fontSize: 10 }}
              />
              <ReferenceLine 
                y={0.3} 
                stroke="oklch(0.7 0.2 150)" 
                strokeDasharray="5 5" 
                label={{ value: "Umbral Acreción", position: "right", fill: "oklch(0.7 0.2 150)", fontSize: 10 }}
              />
              
              {/* Línea de σ_sem */}
              <Line
                type="monotone"
                dataKey="sigmaSem"
                stroke={gaugeColor}
                strokeWidth={2}
                dot={{ r: 3, fill: gaugeColor }}
                activeDot={{ r: 5 }}
              />
              
              {/* Brush para zoom */}
              <Brush 
                dataKey="step" 
                height={30} 
                stroke="oklch(0.5 0.1 240)"
                fill="oklch(0.15 0.05 240)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Leyenda de interpretación */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-2 p-2 rounded border border-green-500/30 bg-green-500/10">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <div>
              <div className="font-medium">Acreción</div>
              <div className="text-muted-foreground">σ_sem {">"} 0.3</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded border border-yellow-500/30 bg-yellow-500/10">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div>
              <div className="font-medium">Neutro</div>
              <div className="text-muted-foreground">-0.3 ≤ σ_sem ≤ 0.3</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded border border-red-500/30 bg-red-500/10">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div>
              <div className="font-medium">Drenaje</div>
              <div className="text-muted-foreground">σ_sem {"<"} -0.3</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
