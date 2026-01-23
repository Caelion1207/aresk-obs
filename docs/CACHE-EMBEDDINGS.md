# Caché de Embeddings de Bucéfalo

## Resumen

El sistema de caché de embeddings reduce la latencia de operaciones semánticas en **~50%** al evitar recalcular el embedding de la referencia ética (Bucéfalo) en cada operación.

## Arquitectura

### Componentes

**1. Servicio de Embeddings (`server/services/embeddings.ts`)**
- Implementa caché en memoria usando `Map<string, EmbeddingCache>`
- Almacena embeddings con texto, vector y timestamp
- Funciones principales:
  - `getEmbedding(text, useCache)`: Obtiene embedding con caché opcional
  - `preloadBucefaloCache(text)`: Precarga referencia ética al inicio
  - `clearEmbeddingCache()`: Limpia caché completa
  - `getCacheStats()`: Retorna estadísticas de uso

**2. Inicialización del Servidor (`server/_core/index.ts`)**
- Precarga embedding de Bucéfalo al arrancar el servidor
- Ejecuta antes de inicializar observadores ARGOS y WABUN
- Maneja errores de precarga sin bloquear el inicio

**3. Puente Semántico (`server/semantic_bridge_exact.ts`)**
- Usa caché automáticamente en `calculateMetricsExact`
- Output siempre nuevo (useCache=false)
- Referencia usa caché (useCache=true)

## Métricas de Rendimiento

### Benchmark de Latencia

```
Cache Miss (primera llamada): ~30-40ms
Cache Hit (llamadas posteriores): ~0.5-1ms
Reducción de latencia: ~97% (50x más rápido)
```

### Resultados de Tests

```bash
✓ debe cachear embeddings correctamente
✓ debe reducir latencia con caché (cache hit vs cache miss)
  Latencia cache miss: 32ms
  Latencia cache hit: 0.8ms
  Reducción: 97.5%
✓ debe precargar embedding de Bucéfalo correctamente
✓ debe reportar estadísticas de caché correctamente
✓ debe limpiar caché correctamente
✓ debe usar caché en calculateMetricsExact para referencia
  Latencia primera métrica: 14ms
  Latencia segunda métrica: 7ms
✓ debe desactivar caché cuando useCache=false

Tests: 7 passed (7)
```

## Flujo de Operación

### 1. Inicio del Sistema

```typescript
// server/_core/index.ts
server.listen(port, async () => {
  // 1. Precargar caché de Bucéfalo
  const bucefaloPurpose = "Asistir con precisión, transparencia...";
  await preloadBucefaloCache(bucefaloPurpose);
  
  // 2. Inicializar observadores
  startArgosObserver();
  startWabunObserver();
});
```

### 2. Cálculo de Métricas

```typescript
// server/semantic_bridge_exact.ts
export async function calculateMetricsExactCAELION(
  referenceText: string,
  outputText: string,
  controlMode: "controlled" | "uncontrolled"
) {
  const { V_e, Omega, error_norm, x_t, x_ref, e_t } = 
    await calculateEmbeddingMetrics(outputText, referenceText);
  
  // x_ref usa caché (Bucéfalo)
  // x_t siempre nuevo (output del modelo)
}
```

### 3. Logs del Sistema

```
🔥 Precargando embedding de Bucéfalo en caché...
💾 Embedding cacheado para texto (Asistir con precisión...)
✅ Embedding de Bucéfalo cacheado y listo
```

En operaciones posteriores:

```
🎯 Cache hit para texto (Asistir con precisión...)
```

## Ventajas

### 1. **Reducción de Latencia**
- Cache hit: **~0.5ms** vs cache miss: **~30ms**
- Mejora de **50x** en velocidad de respuesta
- Impacto directo en UX del simulador

### 2. **Eficiencia Computacional**
- Evita recalcular embedding de Bucéfalo en cada mensaje
- Reduce carga en modelo de transformers
- Menor consumo de CPU y memoria

### 3. **Consistencia**
- Mismo embedding de referencia en toda la sesión
- Elimina variabilidad numérica entre llamadas
- Métricas más estables y comparables

## Limitaciones

### 1. **Caché en Memoria**
- Se pierde al reiniciar el servidor
- No persiste entre deploys
- Solución: Precarga automática al inicio

### 2. **Sin TTL (Time To Live)**
- Embeddings permanecen en caché indefinidamente
- No hay expiración automática
- Solución: `clearEmbeddingCache()` manual si es necesario

### 3. **Sin Límite de Tamaño**
- Caché puede crecer sin límite
- Riesgo teórico de consumo excesivo de memoria
- Mitigación: Solo se cachean referencias estáticas (Bucéfalo)

## Uso en Producción

### Monitoreo

```typescript
// Obtener estadísticas de caché
const stats = getCacheStats();
console.log(`Caché: ${stats.size} entradas`);
console.log(`Textos: ${stats.entries.join(', ')}`);
```

### Limpieza Manual

```typescript
// Limpiar caché si es necesario
clearEmbeddingCache();
```

### Desactivar Caché

```typescript
// Para textos que no deben cachearse
const embedding = await getEmbedding(texto, false);
```

## Próximas Mejoras

1. **Caché Persistente**: Usar Redis o SQLite para persistir entre reinicios
2. **TTL Configurable**: Expiración automática de entradas antiguas
3. **Límite de Tamaño**: LRU (Least Recently Used) para evitar crecimiento infinito
4. **Métricas de Hit Rate**: Dashboard de estadísticas de caché en Core Dashboard
5. **Caché Distribuida**: Para múltiples instancias del servidor

## Referencias

- **Especificación CAELION**: Núcleo Matemático v1.0.0
- **Benchmark de Embeddings**: `/home/ubuntu/REPORTE-RENDIMIENTO-EMBEDDINGS.md`
- **Tests de Validación**: `server/services/embeddings.test.ts`
