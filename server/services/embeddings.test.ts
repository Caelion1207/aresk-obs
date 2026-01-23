/**
 * Tests para Caché de Embeddings de Bucéfalo
 * 
 * Valida que la caché funcione correctamente y reduzca latencia.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getEmbedding, 
  preloadBucefaloCache, 
  clearEmbeddingCache,
  getCacheStats,
  calculateMetricsExact
} from './embeddings';

describe('Caché de Embeddings de Bucéfalo', () => {
  beforeEach(() => {
    // Limpiar caché antes de cada test
    clearEmbeddingCache();
  });

  it('debe cachear embeddings correctamente', async () => {
    const texto = "Este es un texto de prueba para cachear";
    
    // Primera llamada: debe calcular y cachear
    const embedding1 = await getEmbedding(texto, true);
    
    // Verificar que el embedding es un array de números
    expect(Array.isArray(embedding1)).toBe(true);
    expect(embedding1.length).toBeGreaterThan(0);
    expect(typeof embedding1[0]).toBe('number');
    
    // Segunda llamada: debe usar caché
    const embedding2 = await getEmbedding(texto, true);
    
    // Verificar que los embeddings son idénticos (mismo objeto)
    expect(embedding2).toBe(embedding1);
  });

  it('debe reducir latencia con caché (cache hit vs cache miss)', async () => {
    const texto = "Texto para medir latencia de caché";
    
    // Primera llamada (cache miss)
    const inicio1 = Date.now();
    await getEmbedding(texto, true);
    const latencia1 = Date.now() - inicio1;
    
    // Segunda llamada (cache hit)
    const inicio2 = Date.now();
    await getEmbedding(texto, true);
    const latencia2 = Date.now() - inicio2;
    
    console.log(`Latencia cache miss: ${latencia1}ms`);
    console.log(`Latencia cache hit: ${latencia2}ms`);
    console.log(`Reducción: ${((1 - latencia2/latencia1) * 100).toFixed(1)}%`);
    
    // Cache hit debe ser significativamente más rápido (al menos 10x)
    expect(latencia2).toBeLessThan(latencia1 / 10);
  });

  it('debe precargar embedding de Bucéfalo correctamente', async () => {
    const bucefaloPurpose = "Asistir con precisión, transparencia y respeto a los límites éticos establecidos.";
    
    // Precargar caché
    await preloadBucefaloCache(bucefaloPurpose);
    
    // Verificar que está en caché
    const stats = getCacheStats();
    expect(stats.size).toBe(1);
    expect(stats.entries[0]).toContain("Asistir con precisión");
  });

  it('debe reportar estadísticas de caché correctamente', async () => {
    // Caché vacía
    let stats = getCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.entries.length).toBe(0);
    
    // Agregar un embedding
    await getEmbedding("Texto 1", true);
    stats = getCacheStats();
    expect(stats.size).toBe(1);
    
    // Agregar otro embedding
    await getEmbedding("Texto 2", true);
    stats = getCacheStats();
    expect(stats.size).toBe(2);
  });

  it('debe limpiar caché correctamente', async () => {
    // Agregar embeddings
    await getEmbedding("Texto A", true);
    await getEmbedding("Texto B", true);
    
    let stats = getCacheStats();
    expect(stats.size).toBe(2);
    
    // Limpiar caché
    clearEmbeddingCache();
    
    stats = getCacheStats();
    expect(stats.size).toBe(0);
  });

  it('debe usar caché en calculateMetricsExact para referencia', async () => {
    const referencia = "Referencia ética de Bucéfalo";
    const output1 = "Primera respuesta del sistema";
    const output2 = "Segunda respuesta del sistema";
    
    // Primera métrica: cachea la referencia
    const inicio1 = Date.now();
    const metricas1 = await calculateMetricsExact(output1, referencia);
    const latencia1 = Date.now() - inicio1;
    
    // Segunda métrica: usa caché de referencia
    const inicio2 = Date.now();
    const metricas2 = await calculateMetricsExact(output2, referencia);
    const latencia2 = Date.now() - inicio2;
    
    console.log(`Latencia primera métrica: ${latencia1}ms`);
    console.log(`Latencia segunda métrica: ${latencia2}ms`);
    
    // Verificar que las métricas son válidas
    expect(metricas1.V_e).toBeGreaterThanOrEqual(0);
    expect(metricas1.Omega).toBeGreaterThanOrEqual(-1);
    expect(metricas1.Omega).toBeLessThanOrEqual(1);
    
    expect(metricas2.V_e).toBeGreaterThanOrEqual(0);
    expect(metricas2.Omega).toBeGreaterThanOrEqual(-1);
    expect(metricas2.Omega).toBeLessThanOrEqual(1);
    
    // Segunda llamada debe ser más rápida (usa caché de referencia)
    expect(latencia2).toBeLessThan(latencia1);
  });

  it('debe desactivar caché cuando useCache=false', async () => {
    const texto = "Texto sin caché";
    
    // Primera llamada sin caché
    const embedding1 = await getEmbedding(texto, false);
    
    // Verificar que NO está en caché
    const stats = getCacheStats();
    expect(stats.size).toBe(0);
    
    // Segunda llamada sin caché
    const embedding2 = await getEmbedding(texto, false);
    
    // Los embeddings deben ser iguales en valores pero diferentes objetos
    expect(embedding1).toEqual(embedding2);
    expect(embedding1).not.toBe(embedding2);
  });
});
