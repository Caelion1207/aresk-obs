import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LyapunovDataPoint {
  step: number;
  V: number;
}

interface LyapunovChartProps {
  data: LyapunovDataPoint[];
  stabilityRadius: number;
}

/**
 * Determina el color basado en el valor de V(e) y la codificación neurocognitiva
 */
function getColorForV(V: number, stabilityRadius: number): string {
  const threshold1 = stabilityRadius * stabilityRadius; // ε²
  const threshold2 = threshold1 * 4; // 4ε²
  
  if (V <= threshold1) {
    // Azul: Equilibrio Estable
    return "oklch(0.5 0.2 240)";
  } else if (V <= threshold2) {
    // Verde: Región Admisible
    return "oklch(0.6 0.15 150)";
  } else if (V <= threshold2 * 2) {
    // Amarillo: Alerta de Deriva
    return "oklch(0.75 0.15 90)";
  } else if (V <= threshold2 * 4) {
    // Naranja: Licurgo Activo
    return "oklch(0.65 0.2 50)";
  } else {
    // Rojo: Colapso Crítico
    return "oklch(0.55 0.25 25)";
  }
}

/**
 * Componente de Tooltip personalizado con codificación cromática
 */
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const V = payload[0].value;
    const step = payload[0].payload.step;
    const color = payload[0].payload.color;
    
    return (
      <div 
        className="rounded-lg border p-3 shadow-lg"
        style={{
          backgroundColor: 'oklch(from var(--card) l c h)',
          borderColor: color,
        }}
      >
        <p className="text-sm font-semibold">Paso {step}</p>
        <p className="text-sm">
          V(e) = <span className="font-mono" style={{ color }}>{V.toFixed(4)}</span>
        </p>
      </div>
    );
  }
  return null;
}

export default function LyapunovChart({ data, stabilityRadius }: LyapunovChartProps) {
  // Enriquecer datos con información de color
  const enhancedData = useMemo(() => {
    return data.map(point => ({
      ...point,
      color: getColorForV(point.V, stabilityRadius),
    }));
  }, [data, stabilityRadius]);
  
  // Calcular el valor máximo para el dominio del eje Y
  const maxV = Math.max(...data.map(d => d.V), stabilityRadius * stabilityRadius * 4);
  
  // Calcular líneas de referencia
  const threshold1 = stabilityRadius * stabilityRadius;
  const threshold2 = threshold1 * 4;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">V(t) - Función de Lyapunov con Gradientes de Energía</CardTitle>
        <CardDescription>
          Decaimiento monótono demuestra estabilidad asintótica. Color indica estado neurocognitivo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={enhancedData}>
            <defs>
              {/* Gradiente de fondo basado en zonas de estabilidad */}
              <linearGradient id="stabilityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.55 0.25 25)" stopOpacity={0.3} />
                <stop offset="25%" stopColor="oklch(0.65 0.2 50)" stopOpacity={0.2} />
                <stop offset="50%" stopColor="oklch(0.75 0.15 90)" stopOpacity={0.15} />
                <stop offset="75%" stopColor="oklch(0.6 0.15 150)" stopOpacity={0.1} />
                <stop offset="100%" stopColor="oklch(0.5 0.2 240)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="oklch(from var(--border) l c h / 0.3)" 
            />
            
            <XAxis 
              dataKey="step" 
              label={{ 
                value: 'Paso de interacción', 
                position: 'insideBottom', 
                offset: -5,
                style: { fill: 'oklch(from var(--foreground) l c h)' }
              }}
              stroke="oklch(from var(--foreground) l c h / 0.5)"
            />
            
            <YAxis 
              domain={[0, maxV * 1.1]}
              label={{ 
                value: 'V(e)', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'oklch(from var(--foreground) l c h)' }
              }}
              stroke="oklch(from var(--foreground) l c h / 0.5)"
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Área de fondo con gradiente */}
            <Area
              type="monotone"
              dataKey="V"
              stroke="none"
              fill="url(#stabilityGradient)"
            />
            
            {/* Línea principal con segmentos de color */}
            <Line 
              type="monotone" 
              dataKey="V" 
              stroke="oklch(from var(--chart-2) l c h)" 
              strokeWidth={3}
              dot={(props: any) => {
                const { cx, cy, payload } = props;
                return (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill={payload.color}
                    stroke="oklch(from var(--background) l c h)"
                    strokeWidth={2}
                  />
                );
              }}
              activeDot={{
                r: 8,
                stroke: "oklch(from var(--primary) l c h)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Leyenda de umbrales */}
        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Umbral de Equilibrio (ε²):</span>
            <span className="font-mono">{threshold1.toFixed(4)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Umbral de Alerta (4ε²):</span>
            <span className="font-mono">{threshold2.toFixed(4)}</span>
          </div>
        </div>
        
        {/* Leyenda de colores neurocognitivos */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-t pt-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.5 0.2 240)" }} />
            <span>Azul: Confianza (V ≤ ε²)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.6 0.15 150)" }} />
            <span>Verde: Seguridad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.75 0.15 90)" }} />
            <span>Amarillo: Precaución</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.65 0.2 50)" }} />
            <span>Naranja: Dinamismo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "oklch(0.55 0.25 25)" }} />
            <span>Rojo: Evitación</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
