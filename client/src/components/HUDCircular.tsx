import { useEffect, useRef } from 'react';

interface HUDCircularProps {
  value: number; // 0-1
  label: string;
  color?: 'cyan' | 'green' | 'purple' | 'amber';
  size?: number;
  threshold?: number;
}

export function HUDCircular({ 
  value, 
  label, 
  color = 'cyan', 
  size = 200,
  threshold 
}: HUDCircularProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colorMap = {
    cyan: { main: '#22D3EE', glow: 'rgba(34, 211, 238, 0.6)' },
    green: { main: '#10B981', glow: 'rgba(16, 185, 129, 0.6)' },
    purple: { main: '#A855F7', glow: 'rgba(168, 85, 247, 0.6)' },
    amber: { main: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)' }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 20;

    // Limpiar canvas
    ctx.clearRect(0, 0, size, size);

    // Círculos concéntricos de fondo
    for (let i = 3; i > 0; i--) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * (i / 3), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(34, 211, 238, ${0.05 * i})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Arco de progreso con glow
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (Math.PI * 2 * value);

    // Glow exterior
    ctx.shadowBlur = 20;
    ctx.shadowColor = colorMap[color].glow;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = colorMap[color].main;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Línea de umbral si existe
    if (threshold !== undefined) {
      const thresholdAngle = startAngle + (Math.PI * 2 * threshold);
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(
        centerX + Math.cos(thresholdAngle) * (radius - 15),
        centerY + Math.sin(thresholdAngle) * (radius - 15)
      );
      ctx.lineTo(
        centerX + Math.cos(thresholdAngle) * (radius + 5),
        centerY + Math.sin(thresholdAngle) * (radius + 5)
      );
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Valor central
    ctx.shadowBlur = 15;
    ctx.shadowColor = colorMap[color].glow;
    ctx.fillStyle = colorMap[color].main;
    ctx.font = `bold ${size / 5}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toFixed(3), centerX, centerY);

    // Label
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = `${size / 15}px sans-serif`;
    ctx.fillText(label, centerX, centerY + size / 6);

  }, [value, label, color, size, threshold]);

  return (
    <div className="relative inline-block">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="animate-pulse-glow"
      />
      {/* Decoraciones HUD */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50" />
    </div>
  );
}
