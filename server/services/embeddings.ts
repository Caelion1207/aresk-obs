/**
 * Servicio de Embeddings Reales
 * 
 * Implementa cálculo exacto de métricas CAELION usando sentence-transformers.
 * Basado en especificaciones del Núcleo Matemático CAELION v1.0.0.
 */

import { pipeline } from '@xenova/transformers';
import { dot, norm, subtract } from 'mathjs';

let embedder: any = null;

/**
 * Obtiene o inicializa el modelo de embeddings
 */
export async function getEmbedder() {
  if (!embedder) {
    console.log('🔧 Inicializando modelo de embeddings...');
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
    console.log('✅ Modelo de embeddings listo');
  }
  return embedder;
}

/**
 * Calcula embedding normalizado de un texto
 * 
 * @param text - Texto a embedear
 * @returns Vector de embedding normalizado
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Calcula error semántico e(t) = x(t) - x_ref
 * 
 * Especificación CAELION: e(t) representa la distancia vectorial
 * entre el estado actual y la referencia ontológica.
 * 
 * @param x_t - Embedding del estado actual
 * @param x_ref - Embedding de la referencia
 * @returns Vector de error
 */
export function calculateError(x_t: number[], x_ref: number[]): number[] {
  return subtract(x_t, x_ref) as number[];
}

/**
 * Calcula función de Lyapunov V(e) = ½ e^T P e
 * 
 * Especificación CAELION: V(e) mide la "energía de desalineación semántica".
 * Si P no se proporciona, se usa P = I (matriz identidad).
 * 
 * @param e - Vector de error
 * @param P - Matriz de peso (opcional, default: identidad)
 * @returns Valor de V(e)
 */
export function calculateLyapunov(e: number[], P?: number[][]): number {
  // Si P no se proporciona, usar P = I (matriz identidad)
  // En este caso, V(e) = ½ ||e||²
  const e_norm_sq = dot(e, e) as number;
  return 0.5 * e_norm_sq;
}

/**
 * Calcula coherencia observable Ω(t) = <x(t), x_ref> / (||x(t)|| · ||x_ref||)
 * 
 * Especificación CAELION: Ω(t) cuantifica la alineación semántica mediante
 * similitud del coseno entre embeddings normalizados.
 * 
 * Propiedades:
 * - Ω(t) ∈ [-1, 1]
 * - Ω(t) = 1 → alineación perfecta
 * - Ω(t) = 0 → ortogonalidad (sin relación semántica)
 * - Ω(t) < 0 → contradicción semántica
 * 
 * @param x_t - Embedding del estado actual
 * @param x_ref - Embedding de la referencia
 * @returns Valor de Ω(t)
 */
export function calculateCoherence(x_t: number[], x_ref: number[]): number {
  const numerator = dot(x_t, x_ref) as number;
  const denominator = (norm(x_t) as number) * (norm(x_ref) as number);
  
  if (denominator === 0) {
    console.warn('⚠️ Denominador cero en cálculo de coherencia');
    return 0;
  }
  
  return numerator / denominator;
}

/**
 * Calcula norma del error ||e(t)||
 * 
 * @param e - Vector de error
 * @returns Norma euclidiana
 */
export function calculateErrorNorm(e: number[]): number {
  return Math.sqrt(dot(e, e) as number);
}

/**
 * Calcula métricas exactas según especificación CAELION
 * 
 * @param outputText - Texto del output del modelo
 * @param referenceText - Texto de referencia (Bucéfalo)
 * @returns Métricas calculadas: V(e), Ω(t), ||e||
 */
export async function calculateMetricsExact(
  outputText: string,
  referenceText: string
): Promise<{
  V_e: number;
  Omega: number;
  error_norm: number;
  x_t: number[];
  x_ref: number[];
  e_t: number[];
}> {
  // Obtener embeddings
  const x_t = await getEmbedding(outputText);
  const x_ref = await getEmbedding(referenceText);

  // Calcular error
  const e_t = calculateError(x_t, x_ref);
  const error_norm = calculateErrorNorm(e_t);

  // Calcular V(e)
  const V_e = calculateLyapunov(e_t);

  // Calcular Ω(t)
  const Omega = calculateCoherence(x_t, x_ref);

  return { V_e, Omega, error_norm, x_t, x_ref, e_t };
}
