import { ReactNode } from 'react';

interface DeepCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * DeepCard - Contenedor con Profundidad
 * 
 * Ley Constitucional de Visualización:
 * - Sin fondo sólido, solo profundidad
 * - Borde de 1px casi invisible
 * - Sombra interna sutil (inset) para hundir el contenido
 * - Comportamiento: Estático. Inerte.
 */
export function DeepCard({ title, children, className = '' }: DeepCardProps) {
  return (
    <div 
      className={`
        border border-subtle rounded-lg
        shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]
        p-4
        ${className}
      `}
    >
      <h3 className="text-verdict text-sm mb-4 text-gray-400">
        {title}
      </h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}
