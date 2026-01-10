import { useMemo } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PhaseSpacePoint {
  H: number;
  C: number;
  step: number;
}

interface PhaseSpaceMapProps {
  data: PhaseSpacePoint[];
  plantProfile: "tipo_a" | "tipo_b" | "acoplada";
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

export default function PhaseSpaceMap({ data, plantProfile }: PhaseSpaceMapProps) {
  // Preparar datos con colores y tamaños basados en el paso temporal
  const enhancedData = useMemo(() => {
    return data.map((point, index) => ({
      ...point,
      // Color basado en posición y perfil
      fill: getPointColor(point.H, point.C, plantProfile),
      // Tamaño crece con el tiempo para mostrar dirección
      size: 50 + (index / data.length) * 150,
      // Opacidad aumenta con el tiempo (trail effect)
      opacity: 0.3 + (index / data.length) * 0.7,
    }));
  }, [data, plantProfile]);
  
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
      <CardContent className="relative z-10">
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
            
            {/* Marcador del Atractor Bucéfalo */}
            <Scatter
              data={[{ H: 0, C: 1, name: "Bucéfalo" }]}
              fill="oklch(0.5 0.2 240)"
              shape={(props: any) => {
                const { cx, cy } = props;
                return (
                  <>
                    {/* Cruz del atractor */}
                    <line
                      x1={cx - 10}
                      y1={cy}
                      x2={cx + 10}
                      y2={cy}
                      stroke="oklch(0.5 0.2 240)"
                      strokeWidth={2}
                    />
                    <line
                      x1={cx}
                      y1={cy - 10}
                      x2={cx}
                      y2={cy + 10}
                      stroke="oklch(0.5 0.2 240)"
                      strokeWidth={2}
                    />
                    {/* Círculo central */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="oklch(0.5 0.2 240)"
                      stroke="oklch(from var(--background) l c h)"
                      strokeWidth={1}
                    />
                  </>
                );
              }}
            />
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
      </CardContent>
    </Card>
  );
}
