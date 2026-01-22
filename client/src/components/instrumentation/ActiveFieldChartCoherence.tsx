import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import type { MetricFrame } from '@/types/instrumentation';

interface ActiveFieldChartCoherenceProps {
  data: MetricFrame[];
}

/**
 * ActiveFieldChart para Coherencia Observable Ω(t)
 * 
 * Arquitectura de Separación Estricta:
 * - Backend: Calcula estado (NOMINAL/DRIFT/CRITICAL) basado en umbrales de Ω
 * - Frontend: Renderiza la verdad recibida, no decide estados
 * 
 * Capas Visuales (6 niveles):
 * 1. Vacío: Fondo negro absoluto (#000000)
 * 2. Estructura: Grid no-cartesiano con líneas sutiles
 * 3. Leyes: Regiones de veto/deriva/nominal (zonas de color de fondo)
 * 4. Dinámica: Trayectoria de Ω(t) con gradiente temporal
 * 5. Vignette: Oscurecimiento perimetral
 * 6. HUD: Estado actual del sistema (color según backend)
 * 
 * Regiones de Ley para Ω:
 * - Ω < 0.3: CRITICAL (rojo oscuro)
 * - 0.3 ≤ Ω < 0.6: DRIFT (amarillo oscuro)
 * - Ω ≥ 0.6: NOMINAL (verde oscuro)
 */
export function ActiveFieldChartCoherence({ data }: ActiveFieldChartCoherenceProps) {
  // Mapeo de estados a colores HUD (decisión del backend)
  const stateColors = {
    NOMINAL: '#10b981',   // verde
    DRIFT: '#f59e0b',     // amarillo
    CRITICAL: '#ef4444'   // rojo
  };

  const currentState = data[data.length - 1]?.state || 'NOMINAL';
  const hudColor = stateColors[currentState as keyof typeof stateColors];

  // Preparar datos para visualización
  const chartData = useMemo(() => {
    return data.map((frame, idx) => ({
      step: idx,
      coherence: frame.value,  // Ω(t) está en el campo 'value'
      state: frame.state
    }));
  }, [data]);

  return (
    <div className="relative w-full h-full bg-void border border-structure rounded-lg overflow-hidden">
      {/* Capa 1: Vacío (fondo negro) - ya aplicado con bg-void */}
      
      {/* Capa 2 + 3: Estructura + Regiones de Ley */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          {/* Regiones de Ley (fondo) */}
          <defs>
            <linearGradient id="lawRegionsCoh" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b98120" /> {/* NOMINAL (Ω ≥ 0.6) */}
              <stop offset="40%" stopColor="#10b98120" />
              <stop offset="40%" stopColor="#f59e0b20" /> {/* DRIFT (0.3 ≤ Ω < 0.6) */}
              <stop offset="70%" stopColor="#f59e0b20" />
              <stop offset="70%" stopColor="#ef444420" /> {/* CRITICAL (Ω < 0.3) */}
              <stop offset="100%" stopColor="#ef444420" />
            </linearGradient>
          </defs>

          {/* Grid estructural sutil */}
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#ffffff10" 
            vertical={false}
          />

          {/* Ejes invisibles (solo para escala) */}
          <XAxis 
            dataKey="step" 
            hide 
          />
          <YAxis 
            domain={[0, 1]} 
            hide 
          />

          {/* Área de fondo con regiones de ley */}
          <Area
            type="monotone"
            dataKey={() => 1}
            fill="url(#lawRegionsCoh)"
            stroke="none"
          />

          {/* Líneas de umbral */}
          <ReferenceLine 
            y={0.6} 
            stroke="#10b98140" 
            strokeDasharray="2 2" 
            label={{ value: 'Ω = 0.6 (Nominal)', position: 'right', fill: '#10b981', fontSize: 10 }}
          />
          <ReferenceLine 
            y={0.3} 
            stroke="#f59e0b40" 
            strokeDasharray="2 2" 
            label={{ value: 'Ω = 0.3 (Drift)', position: 'right', fill: '#f59e0b', fontSize: 10 }}
          />

          {/* Capa 4: Dinámica (trayectoria de Ω) */}
          <Line
            type="monotone"
            dataKey="coherence"
            stroke={hudColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Capa 5: Vignette (oscurecimiento perimetral) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 60%, rgba(0,0,0,0.5) 100%)'
        }}
      />

      {/* Capa 6: HUD (estado actual) */}
      <div 
        className="absolute top-4 right-4 px-3 py-1 rounded text-xs font-mono uppercase tracking-wider"
        style={{
          backgroundColor: `${hudColor}20`,
          border: `1px solid ${hudColor}`,
          color: hudColor
        }}
      >
        {currentState}
      </div>

      {/* Etiqueta del eje Y (manual) */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-structure font-mono">
        Ω(t)
      </div>

      {/* Etiqueta del eje X (manual) */}
      <div className="absolute bottom-2 right-1/2 translate-x-1/2 text-xs text-structure font-mono">
        Paso de interacción
      </div>
    </div>
  );
}
