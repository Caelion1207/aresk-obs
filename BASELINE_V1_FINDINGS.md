# Hallazgos Clave: Reporte Técnico Baseline v1

**Fuente**: REPORTE_TECNICO_BASELINE_V1.pdf
**Fecha**: 2026-02-08
**Estado**: CERRADO - Resultados congelados

## Encoder Utilizado en Experimentos B-1 y C-1

**Modelo**: `sentence-transformers/all-MiniLM-L6-v2`
**Dimensiones**: 384D
**Arquitectura**: Transformer (6 capas, 384 dimensiones ocultas)
**Entrenamiento**: Contrastive learning en corpus multilingüe (énfasis en inglés)
**Normalización**: Embeddings normalizados por L2
**Longitud máxima**: 256 tokens
**Licencia**: Apache 2.0

## Características Técnicas

- Espacio semántico: 384 dimensiones
- Similitud coseno: medida válida de coherencia semántica
- Distancia euclidiana: medida válida de eficiencia incremental
- Entropía de Shannon: medida válida de complejidad informacional
- Embeddings capturan semántica distribucional (no pragmática ni intencionalidad)

## Protocolo Experimental

1. **Precarga de referencia**: Calcular embedding de referencia ontológica (Purpose + Limits + Ethics)
2. **Generación de interacción**: Usuario envía mensaje, sistema genera respuesta
3. **Cálculo de embeddings**: Generar embeddings para mensaje de usuario, respuesta del sistema, y referencia
4. **Cálculo de métricas**: Computar Ω, ε, V, H_div para la interacción
5. **Almacenamiento**: Guardar interacción completa en base de datos
6. **Iteración**: Repetir pasos 2-5 para N interacciones (N=50 en Baseline v1)

## Diferencias entre B-1 y C-1

### B-1 (Régimen tipo_b)
- **CAELION**: INACTIVO
- **Propósito**: Resolución de problemas técnicos complejos
- **Referencia ontológica**: "Asistencia técnica especializada con análisis estructurado"
- **Dominio**: Preguntas técnicas (programación, algoritmos, arquitectura de sistemas)
- **Interacciones**: 50

### C-1 (Régimen acoplada)
- **CAELION**: ACTIVO (supervisor por invariancia)
- **Propósito**: Análisis y síntesis de información
- **Referencia ontológica**: "Asistencia en análisis manteniendo coherencia semántica"
- **Dominio**: Preguntas de análisis, síntesis, y desafíos éticos
- **Interacciones**: 50 (incluyendo 15 desafíos deliberados)
- **Estructura**: 
  - Interacciones 1-15: Preguntas legítimas de análisis
  - Interacciones 16-30: Desafíos deliberados (violaciones de P, L, E)
  - Interacciones 31-50: Preguntas legítimas de síntesis

## Limitaciones Clave

1. **Dominios diferentes**: B-1 y C-1 usaron dominios de conversación diferentes
2. **Detección de violaciones**: C-1 basada en patrones (no evaluación semántica completa)
3. **Encoder optimizado para inglés**: Experimentos ejecutados en español
4. **Interpretación instrumental**: No inferir propiedades ontológicas o filosóficas del sistema observado

## Implicación para Re-ejecución

**CRÍTICO**: Los experimentos originales B-1 y C-1 usaron **sentence-transformers/all-MiniLM-L6-v2 (384D)**, NO text-embedding-3-small (1536D).

Para validez experimental, la re-ejecución de B-1 debe usar:
- **Encoder**: sentence-transformers/all-MiniLM-L6-v2
- **Dimensiones**: 384D
- **Servicio**: `metricsLocal.ts` (encoder local)
