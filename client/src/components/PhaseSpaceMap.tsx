import { useMemo, useEffect, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Customized } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PhaseSpacePoint {
  H: number;
  C: number;
  step: number;
}

interface PolarityData {
  sigmaSem: number;
  epsilonEff: number;
}

interface PhaseSpaceMapProps {
  data: PhaseSpacePoint[];
  plantProfile: "tipo_a" | "tipo_b" | "acoplada";
  polarityData?: PolarityData[]; // Datos de polaridad semántica por paso
  showTensionVectors?: boolean; // Toggle para mostrar/ocultar vectores
  erosionIndex?: number; // Índice de erosión del atractor [0, 1]
}

/**
 * Determina el color basado en la posición en el espacio de fases
 * y la codificación cromática neurocognitiva
 */
function getPointColor(H: number, C: number, plantProfile: string): string {
  // Calcular distancia al atractor Bucéfalo (H=0, C=1)
  const distanceToBucefalo = Math.sqrt(H * H + (1 - C) * (1 - C));
  
  // Mapeo cromático basado en neurociencia del color
  if (distanceToBucefalo < 0.2) {
    // Azul Profundo: Centro (Atractor Bucéfalo)
    return "oklch(0.5 0.2 240)"; // Azul confianza
  } else if (distanceToBucefalo < 0.4) {
    // Verde: Órbita de Seguridad
    return "oklch(0.6 0.15 150)"; // Verde equilibrio
  } else if (distanceToBucefalo < 0.6) {
    // Amarillo: Alerta de Deriva
    return "oklch(0.75 0.15 90)"; // Amarillo atención
  } else if (distanceToBucefalo < 0.8) {
    // Naranja: Licurgo Activo
    return "oklch(0.65 0.2 50)"; // Naranja dinamismo
  } else {
    // Rojo: Colapso / Error Crítico
    return "oklch(0.55 0.25 25)"; // Rojo evitación
  }
}

/**
 * Genera el gradiente de fondo basado en la Función de Lyapunov
 */
function generateStabilityGradient(): string {
  // Gradiente radial desde el atractor Bucéfalo
  return `
    radial-gradient(
      ellipse at 20% 80%,
      oklch(0.25 0.15 240 / 0.4) 0%,
      oklch(0.25 0.1 150 / 0.3) 25%,
      oklch(0.2 0.05 90 / 0.2) 50%,
      oklch(0.15 0.05 50 / 0.1) 75%,
      oklch(0.1 0.05 25 / 0.05) 100%
    )
  `;
}

/**
 * Calcula el color del vector de tensión basado en σ_sem
 */
function getTensionVectorColor(sigmaSem: number, epsilonEff: number): string {
  const intensity = Math.abs(epsilonEff);
  
  if (sigmaSem > 0.3) {
    // Acrección fuerte: Cian brillante
    return `oklch(0.7 ${0.15 + intensity * 0.15} 200)`;
  } else if (sigmaSem > 0) {
    // Acrección moderada: Verde
    return `oklch(0.65 ${0.12 + intensity * 0.12} 150)`;
  } else if (sigmaSem > -0.3) {
    // Drenaje moderado: Naranja
    return `oklch(0.6 ${0.15 + intensity * 0.15} 50)`;
  } else {
    // Drenaje fuerte: Rojo
    return `oklch(0.55 ${0.18 + intensity * 0.18} 25)`;
  }
}

/**
 * Calcula la dirección del vector de tensión
 * Dirección radial desde/hacia el atractor Bucéfalo (H=0, C=1)
 */
function calculateTensionDirection(H: number, C: number, sigmaSem: number): { dx: number; dy: number } {
  // Vector desde punto actual hacia Bucéfalo
  const toAttractorX = 0 - H;
  const toAttractorY = 1 - C;
  const magnitude = Math.sqrt(toAttractorX * toAttractorX + toAttractorY * toAttractorY);
  
  if (magnitude === 0) return { dx: 0, dy: 0 };
  
  // Normalizar
  const normalizedX = toAttractorX / magnitude;
  const normalizedY = toAttractorY / magnitude;
  
  // Si σ_sem > 0 (acrección), vector apunta hacia atractor
  // Si σ_sem < 0 (drenaje), vector apunta alejándose del atractor
  const direction = sigmaSem > 0 ? 1 : -1;
  
  return {
    dx: normalizedX * direction,
    dy: normalizedY * direction,
  };
}

export default function PhaseSpaceMap({ data, plantProfile, polarityData = [], showTensionVectors = true, erosionIndex = 0 }: PhaseSpaceMapProps) {
  // Estado para animación de pulsación
  const [pulsePhase, setPulsePhase] = useState(0);
  
  // Estado para rango temporal del slider
  const [timeRange, setTimeRange] = useState<[number, number]>([0, data.length - 1]);
  
  // Estado para tamaño de ventana de contexto al clickear eventos
  const [windowSize, setWindowSize] = useState<number>(5);
  
  // Actualizar rango cuando cambian los datos
  useEffect(() => {
    setTimeRange([0, Math.max(0, data.length - 1)]);
  }, [data.length]);
  
  // Animación de pulsación cuando hay erosión crítica
  useEffect(() => {
    if (erosionIndex > 0.5) {
      const interval = setInterval(() => {
        setPulsePhase((prev) => (prev + 0.1) % (Math.PI * 2));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [erosionIndex]);
  // Detectar eventos de drenaje (ε_eff < -0.2)
  const drainageEvents = useMemo(() => {
    if (!polarityData || polarityData.length === 0) return [];
    return polarityData
      .map((polarity, index) => ({ index, epsilonEff: polarity.epsilonEff }))
      .filter(event => event.epsilonEff < -0.2)
      .map(event => event.index);
  }, [polarityData]);
  
  // Filtrar datos por rango temporal
  const filteredData = useMemo(() => {
    return data.slice(timeRange[0], timeRange[1] + 1);
  }, [data, timeRange]);
  
  // Preparar datos con colores y tamaños basados en el paso temporal
  const enhancedData = useMemo(() => {
    return filteredData.map((point, index) => ({
      ...point,
      // Color basado en posición y perfil
      fill: getPointColor(point.H, point.C, plantProfile),
      // Tamaño crece con el tiempo para mostrar dirección
      size: 50 + (index / filteredData.length) * 150,
      // Opacidad aumenta con el tiempo (trail effect)
      opacity: 0.3 + (index / filteredData.length) * 0.7,
    }));
  }, [filteredData, plantProfile]);
  
  // Calcular el punto más reciente para resaltarlo
  const latestPoint = enhancedData[enhancedData.length - 1];
  
  return (
    <Card className="relative overflow-hidden">
      {/* Gradiente de fondo dinámico */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: generateStabilityGradient(),
        }}
      />
      
      <CardHeader className="relative z-10">
        <CardTitle className="text-lg">Mapa de Fase (H vs C) - Persistence Trails</CardTitle>
        <CardDescription>
          Trayectoria del estado con histéresis visual. El atractor Bucéfalo está en (H=0, C=1).
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        {/* Control de rango temporal */}
        {data.length > 1 && (
          <div className="space-y-2 p-3 rounded-lg border border-border bg-card/50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Rango Temporal</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  Paso {timeRange[0] + 1} - {timeRange[1] + 1}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {timeRange[1] - timeRange[0] + 1} / {data.length} pasos
                </Badge>
              </div>
            </div>
            <div className="relative">
              <Slider
                min={0}
                max={Math.max(0, data.length - 1)}
                step={1}
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as [number, number])}
                className="w-full"
              />
              {/* Marcadores de eventos de drenaje */}
              {drainageEvents.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  {drainageEvents.map((eventIndex) => {
                    const position = (eventIndex / Math.max(1, data.length - 1)) * 100;
                    
                    const handleMarkerClick = () => {
                      // Centrar rango en el evento usando windowSize configurado
                      const newStart = Math.max(0, eventIndex - windowSize);
                      const newEnd = Math.min(data.length - 1, eventIndex + windowSize);
                      setTimeRange([newStart, newEnd]);
                    };
                    
                    return (
                      <div
                        key={eventIndex}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer"
                        style={{ left: `${position}%` }}
                        title={`Click para centrar en paso ${eventIndex + 1}`}
                        onClick={handleMarkerClick}
                      >
                        <div className="w-2 h-2 rounded-full bg-red-500 border border-red-700 shadow-lg shadow-red-500/50 animate-pulse hover:scale-150 hover:shadow-red-500/80 transition-transform" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Inicio: Paso {timeRange[0] + 1}</span>
              <span>Fin: Paso {timeRange[1] + 1}</span>
            </div>
            {drainageEvents.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500 border border-red-700 shadow-sm shadow-red-500/50" />
                    <span className="text-xs text-muted-foreground">
                      Eventos de drenaje (ε_eff &lt; -0.2) — <span className="text-foreground font-medium">Click para centrar</span>
                    </span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    {drainageEvents.length} detectados
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Ventana de contexto:</span>
                  <Select value={windowSize.toString()} onValueChange={(value) => setWindowSize(Number(value))}>
                    <SelectTrigger className="h-7 w-24 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">± 3 pasos</SelectItem>
                      <SelectItem value="5">± 5 pasos</SelectItem>
                      <SelectItem value="10">± 10 pasos</SelectItem>
                      <SelectItem value="20">± 20 pasos</SelectItem>
                      <SelectItem value="50">± 50 pasos</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-muted-foreground">({windowSize * 2 + 1} pasos totales)</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="oklch(from var(--border) l c h / 0.3)" 
            />
            <XAxis 
              type="number"
              dataKey="H" 
              name="Entropía H(t)"
              domain={[0, 1]}
              label={{ 
                value: 'H(t) - Entropía', 
                position: 'insideBottom', 
                offset: -10,
                style: { fill: 'oklch(from var(--foreground) l c h)' }
              }}
              stroke="oklch(from var(--foreground) l c h / 0.5)"
            />
            <YAxis 
              type="number"
              dataKey="C" 
              name="Coherencia C(t)"
              domain={[0, 1]}
              label={{ 
                value: 'C(t) - Coherencia', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'oklch(from var(--foreground) l c h)' }
              }}
              stroke="oklch(from var(--foreground) l c h / 0.5)"
            />
            <ZAxis 
              type="number" 
              dataKey="size" 
              range={[50, 200]} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'oklch(from var(--card) l c h)', 
                border: '1px solid oklch(from var(--border) l c h)',
                borderRadius: '8px',
              }}
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: number, name: string) => {
                if (name === "Entropía H(t)") return value.toFixed(3);
                if (name === "Coherencia C(t)") return value.toFixed(3);
                return value;
              }}
            />
            
            {/* Línea de trayectoria conectada - renderizada como SVG custom */}
            <Customized
              component={(props: any) => {
                const { xAxisMap, yAxisMap, width, height } = props;
                if (!xAxisMap || !yAxisMap || enhancedData.length < 2) return <g />;
                
                const xScale = (Object.values(xAxisMap)[0] as any)?.scale;
                const yScale = (Object.values(yAxisMap)[0] as any)?.scale;
                if (!xScale || !yScale) return <g />;
                
                // Generar path SVG conectando todos los puntos
                const pathData = enhancedData.map((point, index) => {
                  const x = xScale(point.H);
                  const y = yScale(point.C);
                  return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
                }).join(' ');
                
                return (
                  <g>
                    <path
                      d={pathData}
                      fill="none"
                      stroke="oklch(0.6 0.15 200)"
                      strokeWidth={2}
                      strokeOpacity={0.6}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  </g>
                );
              }}
            />
            
            {/* Trail de puntos históricos con opacidad variable */}
            <Scatter 
              data={enhancedData} 
              fill="url(#colorGradient)"
              shape={(props: any) => {
                const { cx, cy, fill, payload } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={fill}
                    opacity={payload.opacity}
                    stroke="oklch(from var(--foreground) l c h / 0.3)"
                    strokeWidth={1}
                  />
                );
              }}
            />
            
            {/* Punto actual resaltado */}
            {latestPoint && (
              <Scatter
                data={[latestPoint]}
                fill={latestPoint.fill}
                shape={(props: any) => {
                  const { cx, cy } = props;
                  return (
                    <>
                      {/* Anillo pulsante */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="none"
                        stroke={latestPoint.fill}
                        strokeWidth={2}
                        opacity={0.6}
                      />
                      {/* Punto central */}
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill={latestPoint.fill}
                        stroke="oklch(from var(--background) l c h)"
                        strokeWidth={2}
                      />
                    </>
                  );
                }}
              />
            )}
            
            {/* Marcador del Atractor Bucéfalo con Erosión Dinámica */}
            <Scatter
              data={[{ H: 0, C: 1, name: "Bucéfalo" }]}
              fill="oklch(0.5 0.2 240)"
              shape={(props: any) => {
                const { cx, cy } = props;
                
                // Parámetros de erosión
                const baseRadius = 25;
                const opacity = 1.0 - erosionIndex * 0.7; // 1.0 → 0.3
                const radiusScale = 1.0 - erosionIndex * 0.3; // 1.0 → 0.7
                const irregularityAmplitude = erosionIndex * 15; // 0 → 15px
                const pulseAmplitude = erosionIndex > 0.5 ? Math.sin(pulsePhase) * 3 : 0;
                
                // Color del atractor: azul → rojo según erosión
                const hue = 240 - erosionIndex * 215; // 240 (azul) → 25 (rojo)
                const chroma = 0.2 + erosionIndex * 0.1; // Aumenta saturación con erosión
                const attractorColor = `oklch(0.5 ${chroma} ${hue})`;
                
                // Generar puntos del círculo irregular
                const numPoints = 32;
                const points: string[] = [];
                
                for (let i = 0; i < numPoints; i++) {
                  const angle = (i / numPoints) * Math.PI * 2;
                  
                  // Irregularidad del borde: más caótico con mayor erosión
                  const noise = Math.sin(angle * 3 + erosionIndex * 10) * irregularityAmplitude;
                  const fragmentationNoise = erosionIndex > 0.6 
                    ? Math.random() * irregularityAmplitude * 0.5 
                    : 0;
                  
                  const r = baseRadius * radiusScale + noise + fragmentationNoise + pulseAmplitude;
                  const x = cx + r * Math.cos(angle);
                  const y = cy + r * Math.sin(angle);
                  
                  points.push(`${x},${y}`);
                }
                
                // Crear "perforaciones" cuando erosión > 0.6
                const holes: React.ReactElement[] = [];
                if (erosionIndex > 0.6) {
                  const numHoles = Math.floor((erosionIndex - 0.6) * 10); // 0-4 agujeros
                  for (let i = 0; i < numHoles; i++) {
                    const holeAngle = (i / numHoles) * Math.PI * 2 + Math.PI / 4;
                    const holeDistance = baseRadius * radiusScale * 0.5;
                    const holeX = cx + holeDistance * Math.cos(holeAngle);
                    const holeY = cy + holeDistance * Math.sin(holeAngle);
                    const holeRadius = 3 + erosionIndex * 5;
                    
                    holes.push(
                      <circle
                        key={`hole-${i}`}
                        cx={holeX}
                        cy={holeY}
                        r={holeRadius}
                        fill="oklch(from var(--background) l c h)"
                        opacity={0.8}
                      />
                    );
                  }
                }
                
                return (
                  <g>
                    {/* Gradiente radial de fondo */}
                    <defs>
                      <radialGradient id="attractorGradient" cx="50%" cy="50%">
                        <stop offset="0%" stopColor={attractorColor} stopOpacity={opacity * 0.8} />
                        <stop offset="70%" stopColor={attractorColor} stopOpacity={opacity * 0.4} />
                        <stop offset="100%" stopColor={attractorColor} stopOpacity={0} />
                      </radialGradient>
                    </defs>
                    
                    {/* Halo exterior */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={baseRadius * radiusScale * 1.5}
                      fill="url(#attractorGradient)"
                      opacity={opacity * 0.3}
                    />
                    
                    {/* Círculo irregular principal */}
                    <polygon
                      points={points.join(' ')}
                      fill={attractorColor}
                      opacity={opacity}
                      stroke={attractorColor}
                      strokeWidth={2}
                      strokeOpacity={opacity * 0.8}
                    />
                    
                    {/* Perforaciones (erosión crítica) */}
                    {holes}
                    
                    {/* Cruz del atractor (se desvanece con erosión) */}
                    <line
                      x1={cx - 10}
                      y1={cy}
                      x2={cx + 10}
                      y2={cy}
                      stroke={attractorColor}
                      strokeWidth={2}
                      opacity={opacity * 0.7}
                    />
                    <line
                      x1={cx}
                      y1={cy - 10}
                      x2={cx}
                      y2={cy + 10}
                      stroke={attractorColor}
                      strokeWidth={2}
                      opacity={opacity * 0.7}
                    />
                    
                    {/* Punto central */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={attractorColor}
                      stroke="oklch(from var(--background) l c h)"
                      strokeWidth={1}
                      opacity={opacity}
                    />
                  </g>
                );
              }}
            />
            
            {/* Vectores de Tensión Semántica */}
            {showTensionVectors && polarityData.length > 0 && plantProfile === "acoplada" && (
              <Scatter
                data={enhancedData.slice(-5)} // Solo últimos 5 puntos para claridad
                fill="transparent"
                shape={(props: any): React.ReactElement => {
                  const { cx, cy, payload } = props;
                  const index = payload.step - 1;
                  const polarity = polarityData[index];
                  
                  if (!polarity || Math.abs(polarity.epsilonEff) < 0.1) return <g />;
                  
                  const { dx, dy } = calculateTensionDirection(
                    payload.H,
                    payload.C,
                    polarity.sigmaSem
                  );
                  
                  const vectorLength = 30 * Math.abs(polarity.epsilonEff);
                  const endX = cx + dx * vectorLength;
                  const endY = cy - dy * vectorLength; // Invertir Y para coordenadas SVG
                  
                  const color = getTensionVectorColor(polarity.sigmaSem, polarity.epsilonEff);
                  const opacity = 0.4 + Math.abs(polarity.epsilonEff) * 0.4;
                  
                  // Calcular punta de flecha
                  const arrowSize = 8;
                  const angle = Math.atan2(-(dy), dx);
                  const arrowAngle1 = angle + Math.PI * 0.85;
                  const arrowAngle2 = angle - Math.PI * 0.85;
                  
                  const arrowX1 = endX + Math.cos(arrowAngle1) * arrowSize;
                  const arrowY1 = endY + Math.sin(arrowAngle1) * arrowSize;
                  const arrowX2 = endX + Math.cos(arrowAngle2) * arrowSize;
                  const arrowY2 = endY + Math.sin(arrowAngle2) * arrowSize;
                  
                  return (
                    <g opacity={opacity}>
                      {/* Línea del vector */}
                      <line
                        x1={cx}
                        y1={cy}
                        x2={endX}
                        y2={endY}
                        stroke={color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                      />
                      {/* Punta de flecha */}
                      <polygon
                        points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
                        fill={color}
                      />
                    </g>
                  );
                }}
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* Leyenda de colores neurocognitivos */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.5 0.2 240)" }} />
            <span>Azul: Equilibrio Estable (V ≈ 0)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.6 0.15 150)" }} />
            <span>Verde: Región Admisible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.75 0.15 90)" }} />
            <span>Amarillo: Alerta de Deriva</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.65 0.2 50)" }} />
            <span>Naranja: Licurgo Activo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.55 0.25 25)" }} />
            <span>Rojo: Colapso Crítico</span>
          </div>
        </div>
        
        {/* Leyenda de Vectores de Tensión (solo perfil acoplada) */}
        {showTensionVectors && plantProfile === "acoplada" && polarityData.length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border">
            <h4 className="text-sm font-semibold mb-2">Vectores de Tensión Semántica</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <svg width="20" height="12" className="shrink-0">
                  <defs>
                    <marker id="arrow-cyan" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0,0 0,6 6,3" fill="oklch(0.7 0.2 200)" />
                    </marker>
                  </defs>
                  <line x1="2" y1="6" x2="18" y2="6" stroke="oklch(0.7 0.2 200)" strokeWidth="2" markerEnd="url(#arrow-cyan)" />
                </svg>
                <span>Cian: Acrección Fuerte (σ &gt; 0.3)</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="20" height="12" className="shrink-0">
                  <defs>
                    <marker id="arrow-green" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0,0 0,6 6,3" fill="oklch(0.65 0.15 150)" />
                    </marker>
                  </defs>
                  <line x1="2" y1="6" x2="18" y2="6" stroke="oklch(0.65 0.15 150)" strokeWidth="2" markerEnd="url(#arrow-green)" />
                </svg>
                <span>Verde: Acrección Moderada</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="20" height="12" className="shrink-0">
                  <defs>
                    <marker id="arrow-orange" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0,0 0,6 6,3" fill="oklch(0.6 0.2 50)" />
                    </marker>
                  </defs>
                  <line x1="2" y1="6" x2="18" y2="6" stroke="oklch(0.6 0.2 50)" strokeWidth="2" markerEnd="url(#arrow-orange)" />
                </svg>
                <span>Naranja: Drenaje Moderado</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="20" height="12" className="shrink-0">
                  <defs>
                    <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <polygon points="0,0 0,6 6,3" fill="oklch(0.55 0.25 25)" />
                    </marker>
                  </defs>
                  <line x1="2" y1="6" x2="18" y2="6" stroke="oklch(0.55 0.25 25)" strokeWidth="2" markerEnd="url(#arrow-red)" />
                </svg>
                <span>Rojo: Drenaje Fuerte (σ &lt; -0.3)</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Vectores apuntan hacia el atractor (acrección) o alejándose (drenaje). Longitud proporcional a |ε_eff|.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
