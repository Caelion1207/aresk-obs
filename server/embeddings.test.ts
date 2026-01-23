/**
 * Tests para servicio de embeddings reales
 * 
 * Verifica que el cálculo exacto de métricas CAELION funciona correctamente.
 */

import { describe, it, expect } from 'vitest';
import {
  getEmbedding,
  calculateError,
  calculateLyapunov,
  calculateCoherence,
  calculateErrorNorm,
  calculateMetricsExact,
} from './services/embeddings';

describe('Embeddings Reales - CAELION', () => {
  it('debe generar embeddings normalizados', async () => {
    const text = "Este es un texto de prueba";
    const embedding = await getEmbedding(text);
    
    // Verificar que es un array de números
    expect(Array.isArray(embedding)).toBe(true);
    expect(embedding.length).toBeGreaterThan(0);
    expect(typeof embedding[0]).toBe('number');
    
    // Verificar que está normalizado (norma ≈ 1)
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    expect(norm).toBeCloseTo(1.0, 1);
  });

  it('debe calcular error semántico e(t) = x(t) - x_ref', async () => {
    const x_t = [1, 2, 3];
    const x_ref = [0.5, 1.5, 2.5];
    
    const e_t = calculateError(x_t, x_ref);
    
    expect(e_t).toEqual([0.5, 0.5, 0.5]);
  });

  it('debe calcular función de Lyapunov V(e) = ½||e||²', () => {
    const e = [1, 0, 0]; // ||e|| = 1
    
    const V_e = calculateLyapunov(e);
    
    expect(V_e).toBeCloseTo(0.5, 5);
  });

  it('debe calcular coherencia Ω(t) con similitud de coseno', async () => {
    // Textos idénticos → Ω = 1
    const text1 = "Este es un texto de prueba";
    const x_t = await getEmbedding(text1);
    const x_ref = await getEmbedding(text1);
    
    const Omega = calculateCoherence(x_t, x_ref);
    
    expect(Omega).toBeCloseTo(1.0, 2);
  });

  it('debe calcular coherencia menor para textos diferentes', async () => {
    const text1 = "Este es un texto sobre tecnología";
    const text2 = "Me gusta comer pizza";
    
    const x_t = await getEmbedding(text1);
    const x_ref = await getEmbedding(text2);
    
    const Omega = calculateCoherence(x_t, x_ref);
    
    // Textos no relacionados → Ω < 0.5
    expect(Omega).toBeLessThan(0.5);
    expect(Omega).toBeGreaterThan(-1);
  });

  it('debe calcular norma del error correctamente', () => {
    const e = [3, 4]; // ||e|| = 5
    
    const norm = calculateErrorNorm(e);
    
    expect(norm).toBeCloseTo(5.0, 5);
  });

  it('debe calcular métricas exactas completas', async () => {
    const outputText = "El sistema está funcionando correctamente";
    const referenceText = "El sistema debe funcionar de forma segura y eficiente";
    
    const metrics = await calculateMetricsExact(outputText, referenceText);
    
    // Verificar que todas las métricas están presentes
    expect(metrics.V_e).toBeGreaterThanOrEqual(0);
    expect(metrics.Omega).toBeGreaterThan(-1);
    expect(metrics.Omega).toBeLessThanOrEqual(1);
    expect(metrics.error_norm).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(metrics.x_t)).toBe(true);
    expect(Array.isArray(metrics.x_ref)).toBe(true);
    expect(Array.isArray(metrics.e_t)).toBe(true);
    
    // Verificar que las dimensiones coinciden
    expect(metrics.x_t.length).toBe(metrics.x_ref.length);
    expect(metrics.e_t.length).toBe(metrics.x_t.length);
  });

  it('debe tener V(e) menor cuando textos son similares', async () => {
    const text1 = "El sistema funciona correctamente";
    const text2 = "El sistema opera de forma correcta";
    const text3 = "Me gusta comer pizza en la playa";
    
    const metrics_similar = await calculateMetricsExact(text1, text2);
    const metrics_different = await calculateMetricsExact(text1, text3);
    
    // Textos similares → V(e) menor
    expect(metrics_similar.V_e).toBeLessThan(metrics_different.V_e);
  });

  it('debe tener Ω mayor cuando textos son similares', async () => {
    const text1 = "El sistema funciona correctamente";
    const text2 = "El sistema opera de forma correcta";
    const text3 = "Me gusta comer pizza en la playa";
    
    const metrics_similar = await calculateMetricsExact(text1, text2);
    const metrics_different = await calculateMetricsExact(text1, text3);
    
    // Textos similares → Ω mayor
    expect(metrics_similar.Omega).toBeGreaterThan(metrics_different.Omega);
  });
});
