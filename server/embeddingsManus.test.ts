import { describe, it, expect } from 'vitest';
import { generateEmbedding, cosineSimilarity, calculateCanonicalMetrics, calculateCentroid } from './services/embeddingsManus';

describe('Manus Embeddings Service', () => {
  it('should generate embedding for a simple text', async () => {
    const text = 'Hello, world!';
    const embedding = await generateEmbedding(text);
    
    expect(embedding).toBeDefined();
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
    expect(typeof embedding[0]).toBe('number');
  }, 15000);

  it('should calculate cosine similarity between similar texts', async () => {
    const text1 = 'The cat sits on the mat';
    const text2 = 'A cat is sitting on a mat';
    
    const emb1 = await generateEmbedding(text1);
    const emb2 = await generateEmbedding(text2);
    
    const similarity = cosineSimilarity(emb1, emb2);
    
    expect(similarity).toBeGreaterThan(0.5); // Similar texts should have reasonable similarity
    expect(similarity).toBeLessThanOrEqual(1.0);
  }, 20000);

  it('should calculate canonical metrics', async () => {
    const reference = 'Asistir con precisión y respeto ético';
    const response = 'Ayudar con exactitud y consideración ética';
    
    const metrics = await calculateCanonicalMetrics(reference, response);
    
    expect(metrics.omega_sem).toBeGreaterThan(0.3); // Should have reasonable coherence
    expect(metrics.epsilon_eff).toBeGreaterThan(0);
    expect(metrics.epsilon_eff).toBeLessThanOrEqual(1);
    expect(metrics.v_lyapunov).toBeGreaterThanOrEqual(0);
    expect(metrics.h_div).toBeGreaterThanOrEqual(0);
    expect(metrics.embedding_dim).toBeGreaterThan(0);
  }, 25000);

  it('should calculate centroid of embeddings', async () => {
    const texts = [
      'First text',
      'Second text',
      'Third text'
    ];
    
    const embeddings = await Promise.all(texts.map(t => generateEmbedding(t)));
    const centroid = calculateCentroid(embeddings);
    
    expect(centroid).toBeDefined();
    expect(centroid.length).toBe(embeddings[0].length);
    expect(typeof centroid[0]).toBe('number');
  }, 30000);
});
