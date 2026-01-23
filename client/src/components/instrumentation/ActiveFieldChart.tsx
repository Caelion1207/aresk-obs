import React from 'react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';
import { MetricFrame } from '../../types/instrumentation';

interface ActiveFieldProps {
  data: MetricFrame[];
  label: string;
  law: string; // ej: "Estabilidad V(e)"
}

export const ActiveFieldChart: React.FC<ActiveFieldProps> = ({ data, label, law }) => {
  // 1. OBTENER LA VERDAD (No calcularla)
  const currentFrame = data[data.length - 1] || { value: 0, state: 'NOMINAL' };
  const currentState = currentFrame.state;

  // 2. MAPEO DE ESTADO A COLOR (Solo presentación)
  const stateColor = {
    'NOMINAL': '#22C55E', // Verde esmeralda (coherencia/estabilidad)
    'DRIFT':   '#FBBF24', // Amarillo ámbar (advertencia)
    'CRITICAL':'#EF4444'  // Rojo intenso (peligro)
  }[currentState];

  return (
    <div className="relative h-64 w-full bg-void overflow-hidden rounded-sm border border-structure shadow-inner group">
      
      {/* CAPA 1: EL VACÍO FÍSICO (Fondo Absoluto) */}
      <div className="absolute inset-0 bg-void z-0" />

      {/* CAPA 2: ESTRUCTURA LATENTE (Grid No-Cartesiano) */}
      {/* Patrón radial que sugiere campo, no cuadrícula cartesiana */}
      <div className="absolute inset-0 z-10 opacity-[0.05]" 
           style={{ 
             backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 0.5px, transparent 0.5px)', 
             backgroundSize: '24px 24px',
             backgroundPosition: 'center center'
           }} />
      <div className="absolute inset-0 z-10 opacity-[0.02]" 
           style={{ 
             backgroundImage: 'radial-gradient(ellipse at center, transparent 30%, rgba(255,255,255,0.05) 70%, transparent 100%)'
           }} />

      {/* CAPA 3: LAS LEYES (Regiones Físicas) */}
      {/* Estas zonas son invariantes. El gráfico vive dentro de ellas. */}
      <div className="absolute inset-0 flex flex-col z-20 pointer-events-none">
         {/* Zona de Veto (Invariante ETH-01) - V(e) > 4ε² */}
         <div className="h-[15%] w-full bg-gradient-to-b from-[#EF4444]/[0.12] to-[#EF4444]/[0.03] border-b border-[#EF4444]/30" />
         {/* Zona de Deriva (Tolerancia) - ε² < V(e) < 4ε² */}
         <div className="h-[25%] w-full bg-gradient-to-b from-[#FBBF24]/[0.08] to-[#FBBF24]/[0.02] border-b border-[#FBBF24]/25" />
         {/* Zona Nominal (Espacio Seguro) - V(e) ≤ ε² */}
         <div className="flex-1 w-full bg-gradient-to-b from-transparent to-[#22C55E]/[0.02]" />
      </div>

      {/* CAPA 4: LA DINÁMICA (Datos) */}
      <div className="absolute inset-0 z-30">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`fade-${currentState}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={stateColor} stopOpacity={0.1}/>
                <stop offset="100%" stopColor={stateColor} stopOpacity={1}/>
              </linearGradient>
              <linearGradient id={`fill-${currentState}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stateColor} stopOpacity={0.15}/>
                <stop offset="100%" stopColor={stateColor} stopOpacity={0}/>
              </linearGradient>
            </defs>

            <YAxis domain={[0, 1]} hide /> 

            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={`url(#fade-${currentState})`}
              strokeWidth={2}
              fill={`url(#fill-${currentState})`}
              isAnimationActive={false} // Cero interpolación falsa
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* CAPA 5: VIGNETTE & UI (Cristal Frontal) */}
      <div className="absolute inset-0 z-40 bg-[radial-gradient(circle_at_center,transparent_50%,#000000_100%)] opacity-40 pointer-events-none" />

      {/* CAPA 6: HUD (Heads-Up Display) con transiciones suaves */}
      <div className="absolute top-3 right-4 z-50 text-right transition-all duration-300">
        <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">{label}</div>
        <div className="text-lg font-bold tracking-tight transition-colors duration-300" style={{ color: stateColor, textShadow: `0 0 10px ${stateColor}40` }}>
          {currentState} <span className="text-sm opacity-70 ml-1">[{currentFrame.value.toFixed(3)}]</span>
        </div>
        <div className="text-[10px] text-gray-500 mt-1 font-mono">{law}</div>
      </div>
      
      {/* PUNTO DE PRESENCIA (Beacon) */}
      {/* Solo un pulso sutil en el borde derecho para indicar 'Sistema Vivo' */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white to-transparent opacity-10" />

    </div>
  );
};
