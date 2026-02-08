import { describe, it, expect } from 'vitest';
import { generateEmbedding, cosineSimilarity, calculateCanonicalMetrics } from './services/embeddingsOpenAI';

describe('OpenAI Embeddings Service', () => {
  it('should generate embedding for a simple text', async () => {
    const text = 'Hello, world!';
    const embedding = await generateEmbedding(text);
    
    expect(embedding).toBeDefined();
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(1536); // text-embedding-3-small dimension
    expect(typeof embedding[0]).toBe('number');
  }, 10000); // 10s timeout for API call

  it('should calculate cosine similarity between similar texts', async () => {
    const text1 = 'The cat sits on the mat';
    const text2 = 'A cat is sitting on a mat';
    
    const emb1 = await generateEmbedding(text1);
    const emb2 = await generateEmbedding(text2);
    
    const similarity = cosineSimilarity(emb1, emb2);
    
    expect(similarity).toBeGreaterThan(0.8); // Similar texts should have high similarity
    expect(similarity).toBeLessThanOrEqual(1.0);
  }, 15000);

  it('should calculate canonical metrics', async () => {
    const reference = 'Asistir con precisión y respeto ético';
    const response = 'Ayudar con exactitud y consideración ética';
    
    const metrics = await calculateCanonicalMetrics(reference, response);
    
    expect(metrics.omega_sem).toBeGreaterThan(0.5); // Should have reasonable coherence
    expect(metrics.epsilon_eff).toBeGreaterThan(0);
    expect(metrics.epsilon_eff).toBeLessThanOrEqual(1);
    expect(metrics.v_lyapunov).toBeGreaterThanOrEqual(0);
    expect(metrics.h_div).toBeGreaterThanOrEqual(0);
    expect(metrics.embedding_dim).toBe(1536);
  }, 20000);
});
