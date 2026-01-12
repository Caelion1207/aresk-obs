import { useMemo } from "react";

interface TensionVectorsProps {
  /** Signo semántico σ_sem en rango [-1, 1] */
  sigmaSem: number;
  /** Magnitud de coherencia Ω(t) */
  omega: number;
  /** Posición del estado en el espacio de fase [x, y] normalizado [0,1] */
  position: [number, number];
  /** Tamaño del canvas SVG */
  size?: number;
}

/**
 * Componente de visualización de vectores de tensión semántica
 * 
 * Muestra flechas que indican si el discurso está:
 * - **Acreción (Cian/Verde)**: Construyendo estructura ontológica
 * - **Drenaje (Naranja/Rojo)**: Erosionando base conceptual
 * 
 * La dirección y curvatura del vector indican el tipo de tensión
 */
export function TensionVectors({
  sigmaSem,
  omega,
  position,
  size = 400,
}: TensionVectorsProps) {
  const vectorData = useMemo(() => {
    const [x, y] = position;
    const centerX = size / 2;
    const centerY = size / 2;
    
    // Posición actual en coordenadas SVG
    const currentX = x * size;
    const currentY = y * size;
    
    // Vector hacia el centro (atractor)
    const toCenter = {
      x: centerX - currentX,
      y: centerY - currentY,
    };
    const distanceToCenter = Math.sqrt(toCenter.x ** 2 + toCenter.y ** 2);
    
    // Normalizar vector
    const normalized = {
      x: toCenter.x / (distanceToCenter || 1),
      y: toCenter.y / (distanceToCenter || 1),
    };
    
    // Magnitud del vector basada en Ω y σ_sem
    const magnitude = Math.abs(omega * sigmaSem) * 60; // Escalar para visualización
    
    // Determinar tipo de tensión
    const isAccretion = sigmaSem > 0.1;
    const isDrainage = sigmaSem < -0.1;
    
    // Calcular punto final del vector
    let endX, endY, color, strokeWidth, curvature;
    
    if (isAccretion) {
      // Acreción: Vector recto hacia el centro (construcción)
      endX = currentX + normalized.x * magnitude;
      endY = currentY + normalized.y * magnitude;
      
      // Color: Cian a Verde según intensidad
      const intensity = Math.min(1, sigmaSem);
      color = `rgb(${Math.round(0 + (34 - 0) * intensity)}, ${Math.round(211 + (197 - 211) * intensity)}, ${Math.round(255 + (94 - 255) * intensity)})`;
      strokeWidth = 2 + sigmaSem * 2;
      curvature = 0; // Sin curvatura
      
    } else if (isDrainage) {
      // Drenaje: Vector con rotación de vórtice (erosión)
      const drainageIntensity = Math.abs(sigmaSem);
      
      // Añadir componente tangencial (rotación)
      const tangent = {
        x: -normalized.y,
        y: normalized.x,
      };
      
      const radialComponent = 0.6; // Menos componente radial
      const tangentialComponent = 0.4 * drainageIntensity; // Más rotación con mayor drenaje
      
      endX = currentX + (normalized.x * radialComponent + tangent.x * tangentialComponent) * magnitude;
      endY = currentY + (normalized.y * radialComponent + tangent.y * tangentialComponent) * magnitude;
      
      // Color: Naranja a Rojo según intensidad
      color = `rgb(${Math.round(255)}, ${Math.round(165 - 100 * drainageIntensity)}, ${Math.round(0)})`;
      strokeWidth = 2 + drainageIntensity * 3;
      curvature = drainageIntensity * 20; // Curvatura para efecto vórtice
      
    } else {
      // Neutro: Sin vector significativo
      return null;
    }
    
    return {
      startX: currentX,
      startY: currentY,
      endX,
      endY,
      color,
      strokeWidth,
      curvature,
      type: isAccretion ? "accretion" : "drainage",
      intensity: Math.abs(sigmaSem),
    };
  }, [sigmaSem, omega, position, size]);
  
  if (!vectorData) return null;
  
  const { startX, startY, endX, endY, color, strokeWidth, curvature, type, intensity } = vectorData;
  
  // Calcular punto de control para curva cuadrática
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;
  
  // Perpendicular para curvatura
  const dx = endX - startX;
  const dy = endY - startY;
  const perpX = -dy;
  const perpY = dx;
  const perpLength = Math.sqrt(perpX ** 2 + perpY ** 2);
  
  const controlX = midX + (perpX / (perpLength || 1)) * curvature;
  const controlY = midY + (perpY / (perpLength || 1)) * curvature;
  
  // Calcular ángulo para la punta de flecha
  const angle = Math.atan2(endY - controlY, endX - controlX);
  const arrowSize = 8 + intensity * 4;
  
  const arrowPoint1X = endX - arrowSize * Math.cos(angle - Math.PI / 6);
  const arrowPoint1Y = endY - arrowSize * Math.sin(angle - Math.PI / 6);
  const arrowPoint2X = endX - arrowSize * Math.cos(angle + Math.PI / 6);
  const arrowPoint2Y = endY - arrowSize * Math.sin(angle + Math.PI / 6);
  
  return (
    <g className="tension-vector" opacity={0.8}>
      {/* Línea del vector (curva si hay curvatura) */}
      {curvature > 0 ? (
        <path
          d={`M ${startX} ${startY} Q ${controlX} ${controlY} ${endX} ${endY}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          filter="url(#glow)"
        />
      ) : (
        <line
          x1={startX}
          y1={startY}
          x2={endX}
          y2={endY}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter="url(#glow)"
        />
      )}
      
      {/* Punta de flecha */}
      <polygon
        points={`${endX},${endY} ${arrowPoint1X},${arrowPoint1Y} ${arrowPoint2X},${arrowPoint2Y}`}
        fill={color}
        filter="url(#glow)"
      />
      
      {/* Filtro de brillo */}
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Etiqueta de tipo (opcional, para debug) */}
      {process.env.NODE_ENV === "development" && (
        <text
          x={startX}
          y={startY - 10}
          fontSize="10"
          fill={color}
          textAnchor="middle"
        >
          {type === "accretion" ? "↑ Acreción" : "↓ Drenaje"} ({intensity.toFixed(2)})
        </text>
      )}
    </g>
  );
}
