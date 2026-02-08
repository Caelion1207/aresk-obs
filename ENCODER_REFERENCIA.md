# Encoder de Referencia de ARESK-OBS

**Versión**: 1.0  
**Fecha**: 2026-02-08  
**Estado**: Activo

---

## 1. Especificación Técnica

### 1.1 Modelo

**Nombre**: `sentence-transformers/all-MiniLM-L6-v2`  
**Tipo**: Transformer-based sentence embedding model  
**Arquitectura**: MiniLM (distilled BERT)  
**Fuente**: [Hugging Face Model Hub](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)

### 1.2 Dimensionalidad

**Dimensión del espacio de embeddings**: 384  
**Tipo de vectores**: Flotantes de 32 bits (float32)  
**Normalización**: L2 (vectores unitarios)

### 1.3 Rango de Entrada

- **Longitud máxima**: 256 tokens (WordPiece)
- **Idiomas soportados**: Multilingüe (entrenado principalmente en inglés)
- **Codificación**: UTF-8

---

## 2. Supuestos del Observador

El instrumento ARESK-OBS opera bajo los siguientes supuestos epistemológicos y metodológicos:

### 2.1 Supuesto de Espacio Semántico Euclidiano

**Enunciado**: Existe un espacio vectorial de 384 dimensiones en el cual las relaciones semánticas entre textos pueden ser representadas mediante distancias y ángulos.

**Implicaciones**:
- La similitud semántica se mide mediante similitud coseno
- La distancia semántica se mide mediante distancia euclidiana
- Las operaciones vectoriales preservan relaciones semánticas

**Limitaciones**:
- No captura relaciones semánticas que no sean linealmente separables
- Asume que la proyección a 384D preserva información relevante

### 2.2 Supuesto de Estabilidad del Encoder

**Enunciado**: El encoder produce embeddings deterministas y reproducibles para el mismo texto de entrada.

**Implicaciones**:
- Dos ejecuciones del encoder sobre el mismo texto producen el mismo vector
- Los experimentos son reproducibles si se usa el mismo encoder
- Las comparaciones entre experimentos son válidas

**Limitaciones**:
- Cambios en la versión del modelo invalidan comparaciones directas
- Diferencias en preprocesamiento pueden afectar reproducibilidad

### 2.3 Supuesto de Coherencia Referencial

**Enunciado**: La referencia ontológica x_ref = {P, L, E} puede ser representada como un punto fijo en el espacio de embeddings.

**Implicaciones**:
- La coherencia Ω se mide como proximidad a este punto de referencia
- Desviaciones del punto de referencia indican pérdida de coherencia
- El dominio de legitimidad D_leg tiene un centro semántico identificable

**Limitaciones**:
- La referencia ontológica es un texto estático, no un concepto dinámico
- No captura matices contextuales de la referencia

### 2.4 Supuesto de Independencia de Contexto

**Enunciado**: El embedding de un texto es independiente del contexto conversacional en el que aparece.

**Implicaciones**:
- Cada mensaje se evalúa de forma aislada respecto a la referencia
- No se considera el historial conversacional en el cálculo de métricas
- Las métricas son locales, no globales

**Limitaciones**:
- No captura coherencia narrativa a lo largo de la conversación
- Puede perder información contextual relevante

---

## 3. Métricas Canónicas

### 3.1 Coherencia Observable (Ω_sem)

**Definición**: Similitud coseno entre el embedding de la respuesta del sistema y el embedding de la referencia ontológica.

**Fórmula**:
```
Ω_sem = cos(h(x_k), h(x_ref))
      = (h(x_k) · h(x_ref)) / (||h(x_k)|| ||h(x_ref)||)
```

**Rango**: [-1, 1]  
**Interpretación**:
- Ω ≈ 1: Alta coherencia con la referencia
- Ω ≈ 0: Ortogonalidad semántica (independencia)
- Ω ≈ -1: Oposición semántica

**Umbral de viabilidad**: Ω > 0.3 (coherencia mínima aceptable)

### 3.2 Eficiencia Incremental (ε_eff)

**Definición**: Complemento de la distancia euclidiana normalizada entre embeddings.

**Fórmula**:
```
ε_eff = 1 - (d(h(x_k), h(x_ref)) / d_max)
```

Donde:
- `d(a, b) = ||a - b||₂` (distancia euclidiana)
- `d_max = √(2 × 384)` ≈ 27.71 (máxima distancia posible entre vectores unitarios)

**Rango**: [0, 1]  
**Interpretación**:
- ε ≈ 1: Máxima eficiencia (embeddings idénticos)
- ε ≈ 0.5: Eficiencia media
- ε ≈ 0: Mínima eficiencia (máxima distancia)

**Umbral de viabilidad**: ε > 0.7 (eficiencia mínima aceptable)

### 3.3 Función de Lyapunov (V)

**Definición**: Energía del error semántico, calculada como la norma cuadrada del vector de error normalizada por dimensión.

**Fórmula**:
```
V = (1/384) × ||e||²
```

Donde:
- `e = h(x_ref) - h(x_k)` (vector de error)
- `||e||² = Σᵢ eᵢ²` (norma cuadrada)

**Rango**: [0, ∞)  
**Interpretación**:
- V ≈ 0: Error mínimo (sistema estable)
- V < 0.01: Error bajo (régimen estable)
- V > 0.05: Error alto (posible inestabilidad)

**Propiedad de estabilidad**: V debe decrecer o mantenerse acotado en sistemas viables.

### 3.4 Divergencia Entrópica (H_div)

**Definición**: Diferencia absoluta entre las entropías de Shannon de los embeddings.

**Fórmula**:
```
H_div = |H(h(x_k)) - H(h(x_ref))|
```

Donde:
```
H(v) = -Σᵢ pᵢ log₂(pᵢ)
pᵢ = |vᵢ| / Σⱼ|vⱼ|  (normalización a distribución de probabilidad)
```

**Rango**: [0, log₂(384)] ≈ [0, 8.58]  
**Interpretación**:
- H_div ≈ 0: Entropías similares (estructura informacional comparable)
- H_div > 2: Divergencia significativa en estructura informacional

---

## 4. Implementación

### 4.1 Ubicación del Código

- **Encoder Python**: `/home/ubuntu/aresk-obs/server/python/encoder_local.py`
- **Servicio TypeScript**: `/home/ubuntu/aresk-obs/server/services/metricsLocal.ts`

### 4.2 Uso desde TypeScript

```typescript
import { calculateCanonicalMetrics, generateEmbedding } from './services/metricsLocal';

// Calcular métricas canónicas
const metrics = await calculateCanonicalMetrics(
  referenceText,  // Texto de referencia ontológica
  responseText    // Respuesta del sistema a evaluar
);

console.log(`Ω: ${metrics.omega_sem}`);
console.log(`ε: ${metrics.epsilon_eff}`);
console.log(`V: ${metrics.v_lyapunov}`);
console.log(`H: ${metrics.h_div}`);
```

### 4.3 Uso desde Python

```python
from encoder_local import calculate_canonical_metrics

metrics = calculate_canonical_metrics(
    reference_text="...",
    response_text="..."
)

print(f"Ω: {metrics['omega_sem']}")
print(f"ε: {metrics['epsilon_eff']}")
print(f"V: {metrics['v_lyapunov']}")
print(f"H: {metrics['h_div']}")
```

### 4.4 Uso desde CLI

```bash
# Generar embedding
python3.11 server/python/encoder_local.py embed "Texto a codificar"

# Calcular métricas
python3.11 server/python/encoder_local.py metrics "Referencia" "Respuesta"

# Calcular similitud
python3.11 server/python/encoder_local.py similarity "Texto 1" "Texto 2"
```

---

## 5. Validación y Reproducibilidad

### 5.1 Checksum del Modelo

**Modelo**: `sentence-transformers/all-MiniLM-L6-v2`  
**Versión de sentence-transformers**: 2.x  
**Hash del modelo** (primer descarga): Se cachea en `~/.cache/torch/sentence_transformers/`

### 5.2 Tests de Validación

Ubicación: `/home/ubuntu/aresk-obs/server/metricsLocal.test.ts`

Ejecutar tests:
```bash
cd /home/ubuntu/aresk-obs
pnpm test metricsLocal.test.ts
```

### 5.3 Reproducibilidad

Para garantizar reproducibilidad entre ejecuciones:

1. **Usar la misma versión del modelo**: `sentence-transformers/all-MiniLM-L6-v2`
2. **Usar la misma versión de Python**: 3.11
3. **Usar las mismas dependencias**:
   - `sentence-transformers==2.x`
   - `torch==2.x`
   - `numpy==1.x`

4. **Verificar determinismo**:
   ```python
   emb1 = generateEmbedding("Test")
   emb2 = generateEmbedding("Test")
   assert np.allclose(emb1, emb2)  # Debe ser True
   ```

---

## 6. Limitaciones Conocidas

### 6.1 Limitaciones Técnicas

1. **Longitud máxima**: Textos > 256 tokens se truncan
2. **Idioma**: Optimizado para inglés, puede tener menor rendimiento en otros idiomas
3. **Dominio**: Entrenado en textos generales, puede no capturar jerga especializada

### 6.2 Limitaciones Conceptuales

1. **No captura pragmática**: Solo semántica superficial
2. **No considera contexto conversacional**: Cada mensaje es independiente
3. **No captura intencionalidad**: Solo similitud distribucional

### 6.3 Limitaciones Operativas

1. **Tiempo de cómputo**: ~1-2 segundos por embedding en CPU
2. **Memoria**: ~500MB de RAM para cargar el modelo
3. **Primer embedding lento**: Descarga del modelo (~90MB) en primera ejecución

---

## 7. Mantenimiento y Evolución

### 7.1 Criterios de Cambio de Encoder

El encoder de referencia debe cambiarse **solo si**:

1. Se descubre un sesgo sistemático no documentado
2. Se encuentra un modelo superior con validación empírica
3. Se requiere soporte para idiomas no cubiertos
4. Se detecta obsolescencia técnica (modelo descontinuado)

**Importante**: Cambiar el encoder invalida comparaciones con experimentos anteriores.

### 7.2 Proceso de Migración

Si se decide cambiar el encoder:

1. Documentar razones del cambio
2. Ejecutar experimentos de calibración con ambos encoders
3. Establecer factores de conversión entre métricas
4. Actualizar este documento con nueva versión
5. Archivar datos de experimentos con encoder anterior

---

## 8. Referencias

1. **Modelo**: [sentence-transformers/all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
2. **Paper**: Reimers, N., & Gurevych, I. (2019). *Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks*. EMNLP 2019.
3. **Biblioteca**: [sentence-transformers](https://www.sbert.net/)

---

**Última actualización**: 2026-02-08  
**Responsable**: Manus AI  
**Estado**: Documento vivo (actualizar con cada cambio en el encoder)
