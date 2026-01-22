import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export type SystemState = 'NOMINAL' | 'DRIFT' | 'CRITICAL';

interface StateMetricProps {
  value: number;
  type: 'STABILITY' | 'RESISTANCE' | 'COST' | 'ETHICAL';
  status: SystemState;
  unit?: string;
  sparkline?: number[];
}

/**
 * StateMetric - El Juez
 * 
 * Ley Constitucional de Visualización:
 * - Header: Muestra el ESTADO, no el número
 * - Body: Gráfica minimalista (Sparkline) sin ejes
 * - Footer: Valor técnico pequeño alineado a la derecha
 * - Trigger: Flash de 100ms en el borde si prevProps.status !== props.status
 */
export function StateMetric({ 
  value, 
  type, 
  status, 
  unit = '', 
  sparkline = [] 
}: StateMetricProps) {
  const prevStatusRef = useRef<SystemState>(status);
  const shouldFlash = prevStatusRef.current !== status;

  useEffect(() => {
    prevStatusRef.current = status;
  }, [status]);

  const stateClass = {
    NOMINAL: 'state-nominal border-state-nominal',
    DRIFT: 'state-drift border-state-drift',
    CRITICAL: 'state-critical border-state-critical',
  }[status];

  return (
    <motion.div
      className={`
        border rounded
        p-3
        ${stateClass}
      `}
      animate={shouldFlash ? {
        borderColor: ['rgba(255,255,255,0.8)', stateClass],
      } : {}}
      transition={{ duration: 0.1 }}
    >
      {/* Header: ESTADO */}
      <div className={`text-verdict text-xs mb-2 ${stateClass}`}>
        {status}
      </div>

      {/* Body: Sparkline */}
      {sparkline.length > 0 && (
        <div className="h-12 mb-2 relative">
          <svg className="w-full h-full" preserveAspectRatio="none">
            <polyline
              points={sparkline
                .map((val, idx) => {
                  const x = (idx / (sparkline.length - 1)) * 100;
                  const y = 100 - (val * 100);
                  return `${x},${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={stateClass}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      )}

      {/* Footer: Valor Técnico */}
      <div className="text-technical text-right">
        {value.toFixed(3)} {unit}
      </div>
    </motion.div>
  );
}
