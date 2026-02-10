// Calculador de métricas para ARESK-OBS
// Calcula Ω, H, V, ε desde embeddings semánticos

interface Metrics {
  omegaSem: number;
  hDiv: number;
  vLyapunov: number;
  epsilonEff: number;
}

// Función simplificada para calcular cosine similarity
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generar embedding simple (simulado - en producción usar modelo real)
function generateEmbedding(text: string): number[] {
  // Simulación: generar vector basado en características del texto
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  // Llenar embedding con características simples
  for (let i = 0; i < words.length && i < 384; i++) {
    const word = words[i];
    const hash = word.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    embedding[i % 384] += Math.sin(hash) * 0.1;
  }
  
  // Normalizar
  const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / (norm || 1));
}

export async function calculateMetrics(
  userMessage: string,
  assistantResponse: string,
  interactionNumber: number
): Promise<Metrics> {
  // Generar embeddings
  const userEmb = generateEmbedding(userMessage);
  const assistantEmb = generateEmbedding(assistantResponse);
  
  // Ω (Coherencia): Cosine similarity entre user y assistant
  const omegaSem = Math.max(0, Math.min(1, (cosineSimilarity(userEmb, assistantEmb) + 1) / 2));
  
  // H (Divergencia KL simplificada): 1 - Ω
  const hDiv = 1 - omegaSem;
  
  // V (Lyapunov): Energía de error basada en divergencia
  const vLyapunov = hDiv * hDiv * 0.01;
  
  // ε (Eficiencia): Basada en longitud de respuesta vs input
  const inputLength = userMessage.length;
  const outputLength = assistantResponse.length;
  const lengthRatio = Math.min(outputLength / (inputLength || 1), 2);
  const epsilonEff = Math.max(0, Math.min(1, lengthRatio / 2));
  
  return {
    omegaSem,
    hDiv,
    vLyapunov,
    epsilonEff
  };
}
