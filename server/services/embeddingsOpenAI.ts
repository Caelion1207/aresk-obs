/**
 * Servicio de Embeddings usando OpenAI API
 * Genera vectores de 1536 dimensiones con text-embedding-3-small
 */

interface EmbeddingResponse {
  embedding: number[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Genera embedding de un texto usando OpenAI API
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error de OpenAI API: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
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
