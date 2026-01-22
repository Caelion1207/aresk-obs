import { ReactNode, useState } from 'react';

interface InterpretationTooltipProps {
  law: string;
  value: string;
  interpretation: string;
  children: ReactNode;
}

/**
 * InterpretationTooltip - La Verdad
 * 
 * Ley Constitucional de Visualización:
 * - Trigger: Hover sobre la DeepCard
 * - Apariencia: Backdrop blur, borde fino, fondo negro al 90%
 * - Contenido Estricto:
 *   1. Ley (Ej: "ETH-01 Propósito")
 *   2. Valor (Ej: "0.45")
 *   3. Interpretación (Texto estático que explica qué significa ese valor)
 */
export function InterpretationTooltip({
  law,
  value,
  interpretation,
  children,
}: InterpretationTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className="absolute z-50 top-0 left-0 w-full h-full pointer-events-none">
          <div 
            className="
              absolute inset-0
              backdrop-blur-sm
              bg-black/90
              border border-subtle
              rounded-lg
              p-4
              flex flex-col justify-center
            "
          >
            {/* Ley */}
            <div className="text-verdict text-xs mb-2 text-gray-400">
              {law}
            </div>

            {/* Valor */}
            <div className="font-mono text-2xl font-bold mb-3 text-white">
              {value}
            </div>

            {/* Interpretación */}
            <div className="text-sm text-gray-300 leading-relaxed">
              {interpretation}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
