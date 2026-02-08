/**
 * Servicio de Embeddings usando Manus Forge API
 * Genera vectores usando el servicio de embeddings integrado de Manus
 */

import { invokeLLM } from '../_core/llm';

/**
 * Genera embedding de un texto usando Manus Forge API
 * Usa el modelo de embeddings disponible en la plataforma
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  const apiUrl = process.env.BUILT_IN_FORGE_API_URL;
  
  if (!apiKey || !apiUrl) {
    throw new Error('BUILT_IN_FORGE_API_KEY o BUILT_IN_FORGE_API_URL no están configuradas');
  }

  // Usar el endpoint de embeddings de Manus
  const response = await fetch(`${apiUrl}/v1/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: text,
      model: 'text-embedding-3-small', // Modelo por defecto
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error de Manus Embeddings API: ${response.status} - ${error}`);
  }

  const data = await response.json();
  
  // Formato compatible con OpenAI
  if (data.data && data.data[0] && data.data[0].embedding) {
    return data.data[0].embedding;
  }
  
  throw new Error('Formato de respuesta inesperado de Manus Embeddings API');
}

/**
 * Calcula similitud coseno entre dos vectores
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vectores de diferentes dimensiones: ${vecA.length} vs ${vecB.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Calcula distancia euclidiana entre dos vectores
 */
export function euclideanDistance(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error(`Vectores de diferentes dimensiones: ${vecA.length} vs ${vecB.length}`);
  }

  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * Calcula entropía de Shannon de un vector normalizado
 */
export function shannonEntropy(vec: number[]): number {
  // Normalizar vector a distribución de probabilidad
  const sum = vec.reduce((acc, val) => acc + Math.abs(val), 0);
  if (sum === 0) return 0;

  const probs = vec.map(val => Math.abs(val) / sum);
  
  let entropy = 0;
  for (const p of probs) {
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

/**
 * Calcula métricas canónicas de ARESK-OBS usando embeddings
 */
export interface CanonicalMetrics {
  omega_sem: number;        // Coherencia Observable (similitud coseno)
  epsilon_eff: number;      // Eficiencia Incremental (distancia euclidiana normalizada)
  v_lyapunov: number;       // Función de Lyapunov (energía del error)
  h_div: number;            // Divergencia Entrópica
  embedding_dim: number;    // Dimensión del embedding
}

export async function calculateCanonicalMetrics(
  referenceText: string,
  responseText: string
): Promise<CanonicalMetrics> {
  // Generar embeddings
  const refEmbedding = await generateEmbedding(referenceText);
  const respEmbedding = await generateEmbedding(responseText);

  // Ω_sem: Coherencia Observable (similitud coseno)
  const omega_sem = cosineSimilarity(refEmbedding, respEmbedding);

  // ε_eff: Eficiencia Incremental (1 - distancia normalizada)
  const distance = euclideanDistance(refEmbedding, respEmbedding);
  const maxDistance = Math.sqrt(refEmbedding.length * 2); // Máxima distancia posible
  const epsilon_eff = 1 - (distance / maxDistance);

  // V: Función de Lyapunov (energía del error semántico)
  // V = ||e||² donde e = embedding_ref - embedding_resp
  let errorSquaredNorm = 0;
  for (let i = 0; i < refEmbedding.length; i++) {
    const error = refEmbedding[i] - respEmbedding[i];
    errorSquaredNorm += error * error;
  }
  const v_lyapunov = errorSquaredNorm / refEmbedding.length; // Normalizado por dimensión

  // H_div: Divergencia Entrópica
  const h_ref = shannonEntropy(refEmbedding);
  const h_resp = shannonEntropy(respEmbedding);
  const h_div = Math.abs(h_ref - h_resp);

  return {
    omega_sem,
    epsilon_eff,
    v_lyapunov,
    h_div,
    embedding_dim: refEmbedding.length,
  };
}

/**
 * Calcula el centroide (promedio) de un conjunto de embeddings
 */
export function calculateCentroid(embeddings: number[][]): number[] {
  if (embeddings.length === 0) {
    throw new Error('No se pueden calcular el centroide de un array vacío');
  }

  const dim = embeddings[0].length;
  const centroid = new Array(dim).fill(0);

  for (const emb of embeddings) {
    if (emb.length !== dim) {
      throw new Error('Todos los embeddings deben tener la misma dimensión');
    }
    for (let i = 0; i < dim; i++) {
      centroid[i] += emb[i];
    }
  }

  for (let i = 0; i < dim; i++) {
    centroid[i] /= embeddings.length;
  }

  return centroid;
}
