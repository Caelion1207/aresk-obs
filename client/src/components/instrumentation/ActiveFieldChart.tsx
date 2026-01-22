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
    'NOMINAL': '#00F0FF', // Cian Eléctrico
    'DRIFT':   '#FFD600', // Ámbar Industrial
    'CRITICAL':'#FF003C'  // Rojo Radiación
  }[currentState];

  return (
    <div className="relative h-64 w-full bg-void overflow-hidden rounded-sm border border-structure shadow-inner group">
      
      {/* CAPA 1: EL VACÍO FÍSICO (Fondo Absoluto) */}
      <div className="absolute inset-0 bg-void z-0" />

      {/* CAPA 2: ESTRUCTURA LATENTE (Grid No-Cartesiano) */}
      {/* Opacidad ultra-baja. Solo se siente, no se lee. */}
      <div className="absolute inset-0 z-10 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* CAPA 3: LAS LEYES (Regiones Físicas) */}
      {/* Estas zonas son invariantes. El gráfico vive dentro de ellas. */}
      <div className="absolute inset-0 flex flex-col z-20 pointer-events-none">
         {/* Zona de Veto (Invariante ETH-01) */}
         <div className="h-[15%] w-full bg-[#FF003C] opacity-[0.02] border-b border-[#FF003C]/10" />
         {/* Zona de Deriva (Tolerancia) */}
         <div className="h-[25%] w-full bg-[#FFD600] opacity-[0.015] border-b border-[#FFD600]/5" />
         {/* Zona Nominal (Espacio Seguro) */}
         <div className="flex-1 w-full" />
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

      {/* CAPA 6: HUD (Heads-Up Display) */}
      <div className="absolute top-3 right-4 z-50 text-right">
        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{label}</div>
        <div className="text-sm font-bold tracking-tighter" style={{ color: stateColor }}>
          {currentState} <span className="text-xs opacity-60 ml-1">[{currentFrame.value.toFixed(3)}]</span>
        </div>
        <div className="text-[9px] text-gray-600 mt-1 font-mono">{law}</div>
      </div>
      
      {/* PUNTO DE PRESENCIA (Beacon) */}
      {/* Solo un pulso sutil en el borde derecho para indicar 'Sistema Vivo' */}
      <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-white to-transparent opacity-10" />

    </div>
  );
};
