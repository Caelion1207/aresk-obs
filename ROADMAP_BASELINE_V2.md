# Roadmap para Baseline v2

**Versión actual**: Baseline v1  
**Fecha**: 2026-02-09  
**Estado**: Baseline v1 CERRADO - No se ejecutarán cambios hasta aprobación de v2

---

## Introducción

Este documento lista explícitamente qué falta para Baseline v2. **No se implementará nada hasta que se apruebe el roadmap completo**. Baseline v1 está congelado como referencia técnica oficial y no se modificará.

---

## Limitaciones del Baseline v1

Antes de listar requisitos para v2, es importante documentar las limitaciones conocidas de v1:

### 1. Encoder Optimizado para Inglés

**Limitación**: El encoder sentence-transformers/all-MiniLM-L6-v2 está optimizado para inglés. Los experimentos B-1 y C-1 se ejecutaron en español, lo que puede introducir sesgo de idioma y afectar la precisión de las métricas.

**Evidencia**: Los valores de Ω en Baseline v1 (0.44-0.55) son más bajos de lo esperado, posiblemente debido a que el encoder no captura matices semánticos del español.

**Impacto**: Métricas menos precisas en idiomas no ingleses, dificultando la comparación con sistemas en inglés.

### 2. Detección de Violaciones Determinística

**Limitación**: CAELION en Baseline v1 usa detección de patrones (regex) para identificar violaciones, no evaluación semántica completa.

**Evidencia**: CAELION intervino en 7/50 interacciones (14%), pero solo detectó violaciones obvias que contienen palabras clave (ej. "hackear", "violar", "ilegal"). Violaciones sutiles que reformulan el contenido prohibido sin usar palabras clave no fueron detectadas.

**Impacto**: Falsos negativos (violaciones no detectadas) y posibles falsos positivos (intervenciones innecesarias).

### 3. Tamaño de Muestra Limitado

**Limitación**: Los experimentos B-1 y C-1 incluyen 50 interacciones cada uno, lo que es suficiente para calcular promedios pero insuficiente para análisis de varianza robustos o detección de patrones raros.

**Evidencia**: La desviación estándar de Ω en B-1 es 0.12, lo que indica alta variabilidad. Con 50 muestras, el intervalo de confianza del 95% es ±0.034, lo que es aceptable pero no ideal.

**Impacto**: Menor confianza estadística en las conclusiones, especialmente para eventos raros (ej. violaciones graves).

### 4. Dominios Diferentes entre B-1 y C-1

**Limitación**: Los experimentos B-1 y C-1 operan en dominios ligeramente distintos debido a la naturaleza de los desafíos deliberados en C-1 (preguntas 16-30 intentan violar límites éticos).

**Evidencia**: Las preguntas en C-1 son más adversariales que en B-1, lo que puede inflar artificialmente la diferencia en métricas.

**Impacto**: Comparación directa B-1 vs C-1 es menos robusta de lo ideal. Idealmente, ambos experimentos deberían usar el mismo conjunto de preguntas.

### 5. Ausencia de Experimento A-1

**Limitación**: Baseline v1 solo incluye experimentos B-1 y C-1. El Régimen A (tipo_a, libre, alta entropía) no fue evaluado.

**Evidencia**: No hay datos experimentales para el Régimen A, lo que impide comparación completa A vs B vs C.

**Impacto**: No se puede evaluar el efecto de diferentes niveles de entropía en las métricas de viabilidad.

### 6. Métricas Independientes de Contexto

**Limitación**: Cada mensaje se evalúa aisladamente, sin considerar el contexto conversacional previo.

**Evidencia**: ARESK-OBS calcula métricas para cada interacción de forma independiente, sin memoria de interacciones anteriores.

**Impacto**: No captura dinámicas temporales (ej. deriva gradual a lo largo de una conversación) ni dependencias contextuales (ej. respuesta correcta en contexto pero incorrecta aisladamente).

---

## Requisitos para Baseline v2

### Categoría 1: Mejoras del Encoder

#### 1.1. Encoder Multilingüe

**Objetivo**: Reemplazar sentence-transformers/all-MiniLM-L6-v2 con un encoder multilingüe que soporte español, inglés y otros idiomas con precisión comparable.

**Candidatos**:
- `paraphrase-multilingual-MiniLM-L12-v2` (384D, soporta 50+ idiomas)
- `distiluse-base-multilingual-cased-v2` (512D, soporta 15 idiomas)
- `LaBSE` (768D, soporta 109 idiomas, pero más pesado)

**Criterios de selección**:
- Precisión en español comparable a all-MiniLM-L6-v2 en inglés
- Dimensión ≤ 512D (para mantener eficiencia computacional)
- Soporte para al menos español, inglés, portugués

**Tareas**:
1. Ejecutar benchmarks de similitud semántica en español con candidatos
2. Seleccionar encoder con mejor precisión/eficiencia
3. Re-ejecutar experimentos B-1 y C-1 con nuevo encoder
4. Comparar métricas v1 vs v2 para validar mejora

**Tiempo estimado**: 2-3 semanas

#### 1.2. Encoder Específico de Dominio

**Objetivo**: Entrenar o fine-tunear un encoder específico para el dominio de aplicación (ej. finanzas, salud, legal).

**Enfoque**:
- Fine-tuning de encoder multilingüe con datos de dominio
- Contrastive learning con pares (pregunta, respuesta correcta) y (pregunta, respuesta incorrecta)
- Evaluación con dataset de validación específico de dominio

**Tareas**:
1. Recopilar dataset de dominio (1000+ pares pregunta-respuesta)
2. Fine-tunear encoder multilingüe con contrastive learning
3. Evaluar precisión en dataset de validación
4. Documentar mejora frente a encoder genérico

**Tiempo estimado**: 4-6 semanas

---

### Categoría 2: Mejoras de CAELION

#### 2.1. Detección Semántica de Violaciones

**Objetivo**: Reemplazar detección de patrones (regex) con evaluación semántica basada en embeddings.

**Enfoque**:
- Definir embeddings de "violaciones prototípicas" para cada restricción en (P, L, E)
- Calcular similitud coseno entre respuesta del sistema y violaciones prototípicas
- Si similitud > umbral (ej. 0.7), marcar como violación potencial

**Ejemplo**:
```typescript
const violationPrototypes = {
  "diagnosticar": "El paciente tiene diabetes tipo 2 basándose en sus síntomas",
  "prescribir": "Debe tomar 500mg de metformina dos veces al día",
  "asesoramiento_financiero": "Le recomiendo invertir en acciones de tecnología porque van a subir"
};

// Calcular similitud entre respuesta y prototipos
const similarities = await Promise.all(
  Object.entries(violationPrototypes).map(async ([type, prototype]) => ({
    type,
    similarity: await calculateSimilarity(systemResponse, prototype)
  }))
);

// Detectar violación si similitud > 0.7
const violations = similarities.filter(s => s.similarity > 0.7);
```

**Tareas**:
1. Definir violaciones prototípicas para cada dominio (finanzas, salud, legal)
2. Implementar detección semántica en CAELION
3. Re-ejecutar experimento C-1 con detección semántica
4. Comparar tasa de detección (falsos positivos/negativos) vs v1

**Tiempo estimado**: 3-4 semanas

#### 2.2. CAELION Adaptativo

**Objetivo**: Permitir que CAELION aprenda de intervenciones humanas y ajuste umbrales dinámicamente.

**Enfoque**:
- Registrar feedback humano (intervención correcta/incorrecta) para cada alerta de CAELION
- Ajustar umbrales de similitud basándose en feedback acumulado
- Implementar mecanismo de "confidence decay" para reducir falsos positivos

**Tareas**:
1. Diseñar interfaz de feedback humano en dashboard
2. Implementar algoritmo de ajuste de umbrales basado en feedback
3. Ejecutar experimento piloto con 100 interacciones y feedback humano
4. Evaluar mejora en precisión de detección

**Tiempo estimado**: 4-5 semanas

---

### Categoría 3: Mejoras Experimentales

#### 3.1. Ejecutar Experimento A-1

**Objetivo**: Completar Baseline v2 con experimento del Régimen A (tipo_a, libre, alta entropía) para comparación completa A vs B vs C.

**Especificaciones**:
- 50 interacciones en dominio de asistencia técnica
- Sin marco de gobernanza (como B-1)
- Alta entropía en prompts (variabilidad deliberada)
- Mismo encoder y métricas que B-1 y C-1

**Tareas**:
1. Diseñar protocolo experimental para A-1 (alta entropía)
2. Ejecutar experimento A-1 con 50 interacciones
3. Calcular métricas (Ω, ε, V, H) y almacenar en BD
4. Generar reporte comparativo A-1 vs B-1 vs C-1

**Tiempo estimado**: 1-2 semanas

#### 3.2. Aumentar Tamaño de Muestra

**Objetivo**: Incrementar tamaño de muestra de 50 a 100-200 interacciones por experimento para mayor confianza estadística.

**Justificación**:
- Con 100 interacciones, el intervalo de confianza del 95% se reduce a ±0.024 (vs ±0.034 con 50)
- Permite detectar patrones raros (ej. violaciones graves) con mayor probabilidad
- Mejora robustez de conclusiones

**Tareas**:
1. Ejecutar 50 interacciones adicionales para B-1 (total 100)
2. Ejecutar 50 interacciones adicionales para C-1 (total 100)
3. Recalcular métricas promedio y desviación estándar
4. Comparar intervalos de confianza v1 vs v2

**Tiempo estimado**: 2-3 semanas

#### 3.3. Unificar Dominios entre Experimentos

**Objetivo**: Usar el mismo conjunto de preguntas en B-1, C-1 y A-1 para comparación directa.

**Enfoque**:
- Crear dataset de 100 preguntas representativas del dominio
- Ejecutar experimentos B-1, C-1 y A-1 con el mismo dataset
- Eliminar sesgo de dominio en comparación

**Tareas**:
1. Diseñar dataset de 100 preguntas balanceadas (50 normales, 50 adversariales)
2. Re-ejecutar B-1 con dataset unificado
3. Re-ejecutar C-1 con dataset unificado
4. Ejecutar A-1 con dataset unificado
5. Comparar métricas con control de dominio

**Tiempo estimado**: 3-4 semanas

---

### Categoría 4: Mejoras de Métricas

#### 4.1. Métricas Contextuales

**Objetivo**: Incorporar contexto conversacional en el cálculo de métricas.

**Enfoque**:
- Calcular embedding del contexto (últimas N interacciones)
- Calcular métricas considerando contexto + mensaje actual
- Detectar deriva gradual a lo largo de la conversación

**Ejemplo**:
```typescript
// Embedding del contexto (últimas 3 interacciones)
const contextEmbedding = await calculateContextEmbedding([
  interaction_k-2,
  interaction_k-1,
  interaction_k
]);

// Métricas contextuales
const contextualMetrics = await calculateMetricsWithContext(
  userMessage,
  systemResponse,
  reference,
  contextEmbedding
);
```

**Tareas**:
1. Diseñar algoritmo de embedding contextual
2. Implementar cálculo de métricas contextuales
3. Ejecutar experimento piloto con 50 interacciones
4. Comparar métricas contextuales vs independientes

**Tiempo estimado**: 4-5 semanas

#### 4.2. Métricas de Deriva Temporal

**Objetivo**: Detectar deriva gradual del sistema a lo largo del tiempo.

**Enfoque**:
- Calcular tendencia de Ω(t) y V(t) usando regresión lineal
- Detectar deriva si pendiente > umbral (ej. -0.01/interacción para Ω)
- Alertar si deriva proyectada cruza umbral crítico en N interacciones

**Tareas**:
1. Implementar cálculo de tendencia temporal
2. Definir umbrales de deriva para cada métrica
3. Integrar detección de deriva en dashboard
4. Ejecutar experimento piloto con 100 interacciones

**Tiempo estimado**: 2-3 semanas

---

### Categoría 5: Mejoras de Infraestructura

#### 5.1. API de ARESK-OBS

**Objetivo**: Proporcionar API REST para integración en sistemas de terceros.

**Endpoints**:
- `POST /api/v1/metrics`: Calcular métricas para una interacción
- `GET /api/v1/experiments/{id}`: Obtener datos de un experimento
- `GET /api/v1/metrics/history`: Obtener historial de métricas
- `POST /api/v1/alerts`: Configurar alertas basadas en umbrales

**Tareas**:
1. Diseñar especificación OpenAPI de la API
2. Implementar endpoints con autenticación (API keys)
3. Documentar API con ejemplos de uso
4. Ejecutar tests de carga (1000 req/s)

**Tiempo estimado**: 3-4 semanas

#### 5.2. SDK para Integraciones

**Objetivo**: Proporcionar SDKs en Python, TypeScript y Java para facilitar integración.

**Funcionalidades**:
- Cliente HTTP para API de ARESK-OBS
- Helpers para cálculo de métricas locales
- Gestión de autenticación y rate limiting

**Tareas**:
1. Implementar SDK en Python
2. Implementar SDK en TypeScript
3. Implementar SDK en Java
4. Documentar SDKs con ejemplos de uso

**Tiempo estimado**: 4-6 semanas

#### 5.3. Dashboard Avanzado

**Objetivo**: Mejorar dashboard con visualizaciones avanzadas y análisis predictivo.

**Funcionalidades**:
- Gráficas de tendencia temporal (Ω(t), V(t))
- Heatmaps de métricas por hora/día
- Predicción de deriva usando machine learning
- Comparación multi-experimento (A vs B vs C)

**Tareas**:
1. Diseñar wireframes de dashboard avanzado
2. Implementar visualizaciones con D3.js o Recharts
3. Integrar modelo de predicción de deriva
4. Ejecutar tests de usabilidad con usuarios

**Tiempo estimado**: 5-7 semanas

---

## Priorización de Requisitos

Los requisitos se priorizan en tres niveles:

### Nivel 1: Críticos (Deben estar en v2)

1. **Encoder multilingüe** (1.1): Resuelve limitación crítica de precisión en español
2. **Detección semántica de violaciones** (2.1): Resuelve limitación crítica de falsos negativos
3. **Ejecutar experimento A-1** (3.1): Completa baseline con Régimen A

**Tiempo total**: 6-9 semanas

### Nivel 2: Importantes (Deseables en v2)

4. **Aumentar tamaño de muestra** (3.2): Mejora confianza estadística
5. **Unificar dominios** (3.3): Mejora comparabilidad de experimentos
6. **API de ARESK-OBS** (5.1): Facilita adopción por terceros

**Tiempo total adicional**: 8-11 semanas

### Nivel 3: Opcionales (Considerar para v3)

7. **Encoder específico de dominio** (1.2): Mejora precisión en dominios específicos
8. **CAELION adaptativo** (2.2): Mejora precisión de detección con feedback humano
9. **Métricas contextuales** (4.1): Captura dinámicas conversacionales
10. **Métricas de deriva temporal** (4.2): Detecta deriva gradual
11. **SDK para integraciones** (5.2): Facilita adopción por desarrolladores
12. **Dashboard avanzado** (5.3): Mejora experiencia de usuario

**Tiempo total adicional**: 19-26 semanas

---

## Estimación de Esfuerzo Total

| Nivel | Requisitos | Tiempo Estimado |
|-------|-----------|-----------------|
| **Nivel 1 (Críticos)** | 3 requisitos | 6-9 semanas |
| **Nivel 2 (Importantes)** | 3 requisitos | 8-11 semanas |
| **Nivel 3 (Opcionales)** | 6 requisitos | 19-26 semanas |
| **Total (v2 completo)** | 12 requisitos | 33-46 semanas |

**Recomendación**: Implementar Nivel 1 + Nivel 2 para Baseline v2 (14-20 semanas), dejar Nivel 3 para v3.

---

## Criterios de Éxito para Baseline v2

Para considerar Baseline v2 exitoso, debe cumplir:

1. **Mejora de precisión**: Métricas en español con encoder multilingüe deben tener precisión comparable a v1 en inglés
2. **Reducción de falsos negativos**: Detección semántica debe reducir falsos negativos en al menos 50% vs v1
3. **Completitud experimental**: Incluir experimentos A-1, B-1 y C-1 con al menos 100 interacciones cada uno
4. **Reproducibilidad**: Todos los experimentos deben ser reproducibles con encoder y métricas documentadas
5. **Adopción**: Al menos 1 integración piloto con cliente externo usando API de ARESK-OBS

---

## Conclusión

Baseline v2 abordará las limitaciones críticas de v1 (encoder monolingüe, detección determinística, ausencia de Régimen A) y agregará mejoras importantes (tamaño de muestra, API, dominios unificados). Los requisitos opcionales se considerarán para v3 basándose en feedback de usuarios y prioridades de negocio.

**Próximos pasos**:
1. Revisar y aprobar roadmap de Baseline v2
2. Asignar recursos (desarrolladores, presupuesto, tiempo)
3. Ejecutar Nivel 1 (críticos) en 6-9 semanas
4. Ejecutar Nivel 2 (importantes) en 8-11 semanas adicionales
5. Congelar Baseline v2 y generar documentación completa

---

**Fin del Roadmap para Baseline v2**  
**Versión**: Baseline v1  
**Fecha**: 2026-02-09  
**Estado**: Pendiente de aprobación
