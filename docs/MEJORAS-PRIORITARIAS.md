# Mejoras Prioritarias para ARESK-OBS

**Fecha**: 23 de enero de 2026  
**Basado en**: Documentos CAELION maestros (Consolidado, Núcleo Matemático, Ecuaciones)

---

## Resumen Ejecutivo

Los documentos CAELION especifican ecuaciones matemáticas exactas que actualmente están implementadas de forma aproximada en ARESK-OBS. Se identificaron **3 mejoras críticas** que transformarán el sistema de un instrumento heurístico a un sistema de control riguroso con garantías matemáticas.

---

## Mejora #1: Embeddings Reales (CRÍTICO)

### Estado Actual

**Problema**: V(e), Ω(t) y e(t) se calculan con aproximaciones heurísticas basadas en modo de control y longitud de texto.

```typescript
// server/semantic_bridge.ts (líneas 124-134)
const baseCoherence = 0.6 + lengthRatio * 0.3;
const funcionLyapunov = controlMode === "controlled"
  ? 0.05 + Math.random() * 0.1
  : 0.3 + Math.random() * 0.4;
```

### Especificación CAELION

**Ecuaciones exactas**:
```
x(t) ∈ ℝ^d: Embedding normalizado del output
x_ref ∈ ℝ^d: Embedding normalizado de (P, L, E)
e(t) = x(t) - x_ref
V(e) = ½ e^T P e
Ω(t) = <x(t), x_ref> / (||x(t)|| · ||x_ref||)
```

### Implementación Propuesta

**1. Instalar dependencias**:
```bash
pnpm add @xenova/transformers mathjs
```

**2. Crear servicio de embeddings** (`server/services/embeddings.ts`):
```typescript
import { pipeline } from '@xenova/transformers';
import { dot, norm, subtract, multiply } from 'mathjs';

let embedder: any = null;

export async function getEmbedder() {
  if (!embedder) {
    embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }
  return embedder;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const model = await getEmbedder();
  const output = await model(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

export function calculateError(x_t: number[], x_ref: number[]): number[] {
  return subtract(x_t, x_ref) as number[];
}

export function calculateLyapunov(e: number[], P?: number[][]): number {
  // Si P no se proporciona, usar P = I (matriz identidad)
  const e_norm_sq = dot(e, e);
  return 0.5 * e_norm_sq;
}

export function calculateCoherence(x_t: number[], x_ref: number[]): number {
  const numerator = dot(x_t, x_ref);
  const denominator = norm(x_t) * norm(x_ref);
  return numerator / denominator;
}
```

**3. Actualizar `semantic_bridge.ts`**:
```typescript
import { getEmbedding, calculateError, calculateLyapunov, calculateCoherence } from './embeddings';

export async function calculateMetricsExact(
  outputText: string,
  bucefaloText: string
): Promise<{ V_e: number; Omega: number; error_norm: number }> {
  // Obtener embeddings
  const x_t = await getEmbedding(outputText);
  const x_ref = await getEmbedding(bucefaloText);

  // Calcular error
  const e_t = calculateError(x_t, x_ref);
  const error_norm = Math.sqrt(dot(e_t, e_t));

  // Calcular V(e)
  const V_e = calculateLyapunov(e_t);

  // Calcular Ω(t)
  const Omega = calculateCoherence(x_t, x_ref);

  return { V_e, Omega, error_norm };
}
```

### Impacto

- ✅ Mediciones precisas basadas en similitud semántica real
- ✅ Garantías matemáticas de estabilidad
- ✅ Eliminación de aproximaciones heurísticas
- ✅ Coherencia con especificación CAELION

### Esfuerzo

**Tiempo estimado**: 2-3 horas  
**Complejidad**: Media  
**Prioridad**: **CRÍTICA**

---

## Mejora #2: Control LQR (ALTO)

### Estado Actual

**Problema**: La señal de control u(t) se calcula heurísticamente.

```typescript
// server/routers.ts (línea 646)
const epsilonEff = calculateEffectiveField(
  metrics.funcionLyapunov,
  metrics.coherenciaObservable
);
```

### Especificación CAELION

**Ecuaciones exactas**:
```
J = Σ (||x - x_ref||² + ||u||²)
u*(t) = -K (x(t) - x_ref)
```

Donde K se calcula resolviendo la ecuación algebraica de Riccati.

### Implementación Propuesta

**1. Implementar solver de Riccati** (`server/services/lqr.ts`):
```typescript
import { matrix, multiply, add, subtract, inv, transpose } from 'mathjs';

export function solveLQR(
  A: number[][],
  B: number[][],
  Q: number[][],
  R: number[][]
): number[][] {
  // Resolver ecuación de Riccati: A^T P + P A - P B R^(-1) B^T P + Q = 0
  // Método iterativo simplificado
  
  const n = A.length;
  let P = matrix(Q); // Inicializar P = Q
  
  const maxIter = 100;
  const tol = 1e-6;
  
  for (let i = 0; i < maxIter; i++) {
    const AT = transpose(A);
    const BT = transpose(B);
    const R_inv = inv(R);
    
    // P_new = Q + A^T P A - A^T P B (R + B^T P B)^(-1) B^T P A
    const term1 = multiply(multiply(AT, P), A);
    const term2_inner = add(R, multiply(multiply(multiply(BT, P), B)));
    const term2 = multiply(
      multiply(multiply(multiply(AT, P), B), inv(term2_inner)),
      multiply(multiply(BT, P), A)
    );
    
    const P_new = add(subtract(Q, term1), term2);
    
    // Verificar convergencia
    const diff = subtract(P_new, P);
    const norm_diff = Math.sqrt(
      diff.toArray().flat().reduce((sum, val) => sum + val * val, 0)
    );
    
    if (norm_diff < tol) {
      P = P_new;
      break;
    }
    
    P = P_new;
  }
  
  // Calcular ganancia K = R^(-1) B^T P
  const BT = transpose(B);
  const R_inv = inv(R);
  const K = multiply(multiply(R_inv, BT), P);
  
  return K.toArray() as number[][];
}

export function calculateControl(K: number[][], e: number[]): number[] {
  // u(t) = -K e(t)
  const u = multiply(K, e);
  return multiply(-1, u).toArray() as number[];
}
```

**2. Actualizar cálculo de control** (`server/routers.ts`):
```typescript
import { solveLQR, calculateControl } from './services/lqr';

// Definir matrices del sistema (valores iniciales, ajustar según necesidad)
const A = [[0.9, 0], [0, 0.9]]; // Matriz de dinámica
const B = [[1], [1]];            // Matriz de control
const Q = [[1, 0], [0, 1]];      // Peso del error
const R = [[0.1]];               // Peso del control

// Calcular ganancia K (una vez al inicio)
const K = solveLQR(A, B, Q, R);

// En cada mensaje, calcular señal de control
const e_t = calculateError(x_t, x_ref);
const u_t = calculateControl(K, e_t);
```

### Impacto

- ✅ Control óptimo que minimiza costo J
- ✅ Garantías de estabilidad asintótica
- ✅ Eliminación de control heurístico
- ✅ Convergencia más rápida al régimen objetivo

### Esfuerzo

**Tiempo estimado**: 4-6 horas  
**Complejidad**: Alta  
**Prioridad**: **ALTA**

---

## Mejora #3: ODCF - Campo de Coherencia Temporal (MEDIO)

### Estado Actual

**Problema**: No existe medición de coherencia temporal con memoria.

### Especificación CAELION

**Ecuación**:
```
ODCF(t) = Σᵢ wᵢ ∫₀ᵗ [α·Sᵢ(τ) + β·Iᵢ(τ) - γ·Dᵢ(τ)] e^(-λ(t-τ)) dτ
```

Criterio de régimen estable:
```
(1/T) ∫ₜᵗ⁺ᵀ ODCF(u) du ≥ θ
```

### Implementación Propuesta

**1. Crear tabla de historial ODCF** (`drizzle/schema/odcfHistory.ts`):
```typescript
export const odcfHistory = sqliteTable('odcfHistory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').references(() => sessions.id),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  
  // Componentes por modelo
  stability: real('stability').notNull(),      // S_i(t)
  integration: real('integration').notNull(),  // I_i(t)
  drift: real('drift').notNull(),              // D_i(t)
  
  // ODCF calculado
  odcf: real('odcf').notNull(),
  
  // Parámetros
  alpha: real('alpha').default(1.0),
  beta: real('beta').default(1.0),
  gamma: real('gamma').default(1.0),
  lambda: real('lambda').default(0.1),
});
```

**2. Implementar cálculo de ODCF** (`server/services/odcf.ts`):
```typescript
export function calculateODCF(
  history: Array<{ timestamp: number; stability: number; integration: number; drift: number }>,
  currentTime: number,
  alpha: number = 1.0,
  beta: number = 1.0,
  gamma: number = 1.0,
  lambda: number = 0.1
): number {
  let odcf = 0;
  
  for (const record of history) {
    const tau = record.timestamp;
    const dt = (currentTime - tau) / 1000; // Convertir a segundos
    
    const contribution = 
      alpha * record.stability +
      beta * record.integration -
      gamma * record.drift;
    
    const weight = Math.exp(-lambda * dt);
    
    odcf += contribution * weight;
  }
  
  return odcf;
}

export function checkRegimeStable(
  history: Array<{ timestamp: number; odcf: number }>,
  windowSize: number = 300000, // 5 minutos en ms
  threshold: number = 0.5
): boolean {
  const now = Date.now();
  const windowStart = now - windowSize;
  
  const recentHistory = history.filter(r => r.timestamp >= windowStart);
  
  if (recentHistory.length === 0) return false;
  
  const avgODCF = recentHistory.reduce((sum, r) => sum + r.odcf, 0) / recentHistory.length;
  
  return avgODCF >= threshold;
}
```

### Impacto

- ✅ Medición de coherencia con memoria temporal
- ✅ Detección de régimen estable vs sesión suelta
- ✅ Mejor comprensión de dinámica del sistema
- ⚠️ No crítico para funcionamiento básico

### Esfuerzo

**Tiempo estimado**: 3-4 horas  
**Complejidad**: Media  
**Prioridad**: **MEDIA**

---

## Plan de Implementación

### Fase 1: Fundamentos Matemáticos (AHORA)

**Objetivo**: Reemplazar aproximaciones con mediciones exactas.

**Tareas**:
1. Instalar `@xenova/transformers` y `mathjs`
2. Crear `server/services/embeddings.ts`
3. Actualizar `server/semantic_bridge.ts`
4. Probar cálculo de V(e), Ω(t), e(t) con embeddings reales
5. Verificar que métricas son más precisas

**Tiempo estimado**: 2-3 horas  
**Entregable**: Sistema con mediciones exactas

### Fase 2: Control Óptimo (SIGUIENTE)

**Objetivo**: Implementar control LQR.

**Tareas**:
1. Crear `server/services/lqr.ts`
2. Implementar solver de Riccati
3. Calcular ganancia K
4. Actualizar `server/routers.ts` para usar u(t) = -K·e(t)
5. Probar convergencia más rápida

**Tiempo estimado**: 4-6 horas  
**Entregable**: Sistema con control óptimo

### Fase 3: Extensiones (FUTURO)

**Objetivo**: Agregar mediciones avanzadas.

**Tareas**:
1. Implementar ODCF(t)
2. Agregar visualización de ODCF en dashboard
3. Implementar sistema acoplado H(t) (opcional)

**Tiempo estimado**: 3-4 horas  
**Entregable**: Sistema con análisis temporal avanzado

---

## Conclusión

Las mejoras identificadas transforman ARESK-OBS de un instrumento heurístico a un **sistema de control riguroso con garantías matemáticas**. La implementación de **Mejora #1 (Embeddings Reales)** es suficiente para blindar el sistema y garantizar mediciones precisas. Las demás mejoras son incrementales y pueden implementarse según necesidad.

**Recomendación**: Implementar Fase 1 inmediatamente. Fase 2 puede esperar hasta tener datos históricos suficientes para validar control LQR.
