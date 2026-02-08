import { describe, it, expect } from 'vitest';
import { generateEmbedding, calculateSimilarity, calculateCanonicalMetrics, ENCODER_INFO } from './services/metricsLocal';

describe('Métricas Locales con Encoder de Referencia', () => {
  it('should generate 384D embedding', async () => {
    const text = 'Hello, world!';
    const embedding = await generateEmbedding(text);
    
    expect(embedding).toBeDefined();
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBe(384);
    expect(typeof embedding[0]).toBe('number');
  }, 30000); // Primer embedding tarda más (descarga modelo)

  it('should calculate high similarity for similar texts', async () => {
    const text1 = 'The cat sits on the mat';
    const text2 = 'A cat is sitting on a mat';
    
    const similarity = await calculateSimilarity(text1, text2);
    
    expect(similarity).toBeGreaterThan(0.7); // Textos similares deben tener alta similitud
    expect(similarity).toBeLessThanOrEqual(1.0);
  }, 20000);

  it('should calculate low similarity for different texts', async () => {
    const text1 = 'The weather is sunny today';
    const text2 = 'Quantum mechanics explains particle behavior';
    
    const similarity = await calculateSimilarity(text1, text2);
    
    expect(similarity).toBeLessThan(0.5); // Textos diferentes deben tener baja similitud
    // Nota: similitud puede ser negativa en algunos casos (vectores opuestos)
  }, 20000);

  it('should calculate canonical metrics', async () => {
    const reference = 'Asistir con precisión, transparencia y respeto ético';
    const response = 'Ayudar con exactitud, claridad y consideración ética';
    
    const metrics = await calculateCanonicalMetrics(reference, response);
    
    // Validar estructura
    expect(metrics.omega_sem).toBeDefined();
    expect(metrics.epsilon_eff).toBeDefined();
    expect(metrics.v_lyapunov).toBeDefined();
    expect(metrics.h_div).toBeDefined();
    expect(metrics.embedding_dim).toBe(384);
    expect(metrics.model).toBe('sentence-transformers/all-MiniLM-L6-v2');
    
    // Validar rangos
    expect(metrics.omega_sem).toBeGreaterThan(0.3); // Textos relacionados semánticamente
    expect(metrics.omega_sem).toBeLessThanOrEqual(1.0);
    expect(metrics.epsilon_eff).toBeGreaterThan(0);
    expect(metrics.epsilon_eff).toBeLessThanOrEqual(1);
    expect(metrics.v_lyapunov).toBeGreaterThanOrEqual(0);
    expect(metrics.h_div).toBeGreaterThanOrEqual(0);
  }, 25000);

  it('should have correct encoder info', () => {
    expect(ENCODER_INFO.model).toBe('sentence-transformers/all-MiniLM-L6-v2');
    expect(ENCODER_INFO.dimension).toBe(384);
    expect(ENCODER_INFO.type).toBe('local');
    expect(ENCODER_INFO.assumptions).toHaveLength(5);
  });
});
