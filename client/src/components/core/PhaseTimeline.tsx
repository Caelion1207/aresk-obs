export type CyclePhase = 'INIT' | 'EXECUTION' | 'REVIEW' | 'CLOSED';

interface PhaseTimelineProps {
  currentPhase: CyclePhase;
  cycleId: number;
  timeRemaining?: string;
}

/**
 * PhaseTimeline - Reloj COM-72
 * 
 * Ley Constitucional de Visualización:
 * - Barra horizontal segmentada en 3 (Init, Exec, Review)
 * - Sin animación de carga
 * - Solo el segmento activo está iluminado (Opacidad 100%), el resto apagado (Opacidad 20%)
 */
export function PhaseTimeline({ 
  currentPhase, 
  cycleId, 
  timeRemaining 
}: PhaseTimelineProps) {
  const phases: CyclePhase[] = ['INIT', 'EXECUTION', 'REVIEW'];
  const currentIndex = phases.indexOf(currentPhase);

  return (
    <div className="space-y-3">
      {/* Información del Ciclo */}
      <div className="flex justify-between items-center">
        <span className="text-technical">
          Ciclo #{cycleId}
        </span>
        {timeRemaining && (
          <span className="text-technical">
            {timeRemaining}
          </span>
        )}
      </div>

      {/* Barra de Fases */}
      <div className="flex gap-1">
        {phases.map((phase, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          
          return (
            <div
              key={phase}
              className={`
                flex-1 h-2 rounded-sm
                transition-opacity duration-200
                ${isActive ? 'bg-state-nominal opacity-100' : ''}
                ${isPast ? 'bg-gray-600 opacity-40' : ''}
                ${!isActive && !isPast ? 'bg-gray-800 opacity-20' : ''}
              `}
            />
          );
        })}
      </div>

      {/* Etiquetas de Fases */}
      <div className="flex justify-between">
        {phases.map((phase, index) => {
          const isActive = index === currentIndex;
          
          return (
            <span
              key={phase}
              className={`
                text-xs font-mono
                ${isActive ? 'text-state-nominal font-bold' : 'text-gray-600'}
              `}
            >
              {phase}
            </span>
          );
        })}
      </div>
    </div>
  );
}
