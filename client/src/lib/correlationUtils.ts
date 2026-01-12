/**
 * Calcula el coeficiente de correlación de Pearson entre dos arrays de números
 * @param x - Primer array de valores
 * @param y - Segundo array de valores
 * @returns Coeficiente de Pearson (-1 a 1) o null si no se puede calcular
 */
export function calculatePearsonCorrelation(x: number[], y: number[]): number | null {
  const n = Math.min(x.length, y.length);
  
  if (n < 2) {
    return null; // No hay suficientes datos
  }
  
  // Calcular medias
  const meanX = x.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.slice(0, n).reduce((sum, val) => sum + val, 0) / n;
  
  // Calcular covarianza y desviaciones estándar
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  
  for (let i = 0; i < n; i++) {
    const dx = x[i]! - meanX;
    const dy = y[i]! - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }
  
  // Evitar división por cero
  if (varianceX === 0 || varianceY === 0) {
    return null;
  }
  
  const correlation = covariance / Math.sqrt(varianceX * varianceY);
  
  // Asegurar que esté en el rango [-1, 1] (por errores de redondeo)
  return Math.max(-1, Math.min(1, correlation));
}

/**
 * Interpreta el coeficiente de correlación de Pearson
 * @param r - Coeficiente de Pearson
 * @returns Interpretación textual
 */
export function interpretCorrelation(r: number | null): string {
  if (r === null) {
    return "No calculable";
  }
  
  const absR = Math.abs(r);
  
  if (absR >= 0.9) {
    return r > 0 ? "Muy fuerte positiva" : "Muy fuerte negativa";
  } else if (absR >= 0.7) {
    return r > 0 ? "Fuerte positiva" : "Fuerte negativa";
  } else if (absR >= 0.5) {
    return r > 0 ? "Moderada positiva" : "Moderada negativa";
  } else if (absR >= 0.3) {
    return r > 0 ? "Débil positiva" : "Débil negativa";
  } else {
    return "Muy débil o nula";
  }
}

/**
 * Obtiene el color para el mapa de calor basado en el coeficiente
 * @param r - Coeficiente de Pearson
 * @returns Color en formato HSL
 */
export function getCorrelationColor(r: number | null): string {
  if (r === null) {
    return "hsl(0, 0%, 50%)"; // Gris para no calculable
  }
  
  // Rojo para negativo, verde para positivo
  if (r < 0) {
    const intensity = Math.abs(r) * 100;
    return `hsl(0, ${intensity}%, ${50 - intensity / 4}%)`;
  } else {
    const intensity = r * 100;
    return `hsl(142, ${intensity}%, ${50 - intensity / 4}%)`;
  }
}

/**
 * Calcula matriz de correlación para múltiples series de datos
 * @param dataSeries - Array de objetos con label y data
 * @returns Matriz de correlaciones
 */
export function calculateCorrelationMatrix(
  dataSeries: Array<{ label: string; data: number[] }>
): Array<Array<{ value: number | null; interpretation: string; color: string }>> {
  const n = dataSeries.length;
  const matrix: Array<Array<{ value: number | null; interpretation: string; color: string }>> = [];
  
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i === j) {
        // Diagonal: correlación perfecta consigo mismo
        matrix[i]![j] = {
          value: 1.0,
          interpretation: "Perfecta",
          color: getCorrelationColor(1.0),
        };
      } else {
        const correlation = calculatePearsonCorrelation(
          dataSeries[i]!.data,
          dataSeries[j]!.data
        );
        matrix[i]![j] = {
          value: correlation,
          interpretation: interpretCorrelation(correlation),
          color: getCorrelationColor(correlation),
        };
      }
    }
  }
  
  return matrix;
}
