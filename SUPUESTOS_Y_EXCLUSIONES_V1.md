# ARESK-OBS v1.0: Supuestos y Exclusiones

**Versión**: 1.0 (Producto Comercial Mínimo Validado)  
**Fecha**: Febrero 2026  
**Estado**: CONGELADO

---

## Supuestos del Instrumento

ARESK-OBS v1.0 opera bajo los siguientes supuestos técnicos y conceptuales que deben ser comprendidos por los usuarios:

### 1. Referencia Ontológica Bien Definida

ARESK-OBS asume que la organización ha definido una referencia ontológica (P, L, E) clara y completa que especifica el dominio de legitimidad del sistema. Si la referencia ontológica es ambigua, incompleta o contradictoria, las métricas de ARESK-OBS serán menos útiles. **Responsabilidad**: La organización debe invertir tiempo en definir la referencia ontológica antes de desplegar ARESK-OBS.

### 2. Embeddings Capturan Semántica Relevante

ARESK-OBS asume que los embeddings de 384 dimensiones generados por sentence-transformers/all-MiniLM-L6-v2 capturan la semántica relevante para el dominio de aplicación. Si el dominio requiere terminología altamente especializada (ej. medicina, derecho), los embeddings genéricos pueden no capturar matices críticos. **Mitigación**: Disponible como upgrade opcional (encoder específico de dominio, $50K one-time).

### 3. Umbrales de Métricas Son Contextuales

ARESK-OBS proporciona umbrales sugeridos (ej. Ω < 0.4 = desalineación severa), pero estos umbrales son contextuales y deben ajustarse según el dominio y riesgo. Un umbral de Ω = 0.4 puede ser apropiado para atención al cliente pero insuficiente para asistencia médica (donde se requiere Ω > 0.7). **Responsabilidad**: La organización debe calibrar umbrales basándose en pilotos y feedback humano.

### 4. Supervisión Humana Es Necesaria

ARESK-OBS asume que las métricas se complementan con supervisión humana, especialmente para decisiones críticas. ARESK-OBS no reemplaza evaluación humana. Es una herramienta de soporte a la decisión, no un sistema autónomo de control. **Responsabilidad**: La organización debe asignar recursos humanos para revisar alertas y tomar decisiones basadas en métricas.

### 5. Encoder Congelado para Reproducibilidad

ARESK-OBS v1.0 usa sentence-transformers/all-MiniLM-L6-v2 como encoder de referencia congelado. Esto garantiza reproducibilidad pero limita mejoras futuras. Si se actualiza el encoder en versiones futuras (v2.0, v3.0), las métricas no serán directamente comparables con v1.0. **Responsabilidad**: La organización debe documentar qué versión de ARESK-OBS se usó para cada experimento/auditoría.

---

## Exclusiones Explícitas

ARESK-OBS v1.0 **NO incluye** las siguientes capacidades:

### 1. Experimento A-1 (Régimen A)

v1.0 solo incluye experimentos B-1 y C-1. El Régimen A (tipo_a, libre, alta entropía) no fue evaluado. **Razón**: El Régimen A requiere diseño experimental adicional y no es prioritario para casos de uso comerciales iniciales. **Disponibilidad**: Disponible como upgrade opcional (experimento A-1, $10K one-time).

### 2. Encoder Multilingüe

v1.0 usa encoder optimizado para inglés (sentence-transformers/all-MiniLM-L6-v2), no encoder multilingüe. **Razón**: El encoder multilingüe requiere validación adicional y no es crítico para clientes que operan exclusivamente en inglés. **Disponibilidad**: Disponible como upgrade opcional (encoder multilingüe, $15K one-time).

### 3. Detección Semántica de Violaciones

CAELION en v1.0 usa detección de patrones (regex), no evaluación semántica basada en embeddings. **Razón**: La detección semántica requiere definición de "violaciones prototípicas" específicas del dominio, lo que no es generalizable. **Disponibilidad**: Disponible como upgrade opcional (detección semántica, $25K one-time).

### 4. Métricas Contextuales

v1.0 evalúa cada mensaje aisladamente, sin considerar contexto conversacional. **Razón**: Las métricas contextuales requieren diseño de algoritmo de embedding contextual y validación experimental adicional. **Disponibilidad**: Disponible como upgrade opcional (métricas contextuales, $30K one-time).

### 5. API REST

v1.0 requiere integración directa con código del cliente (TypeScript/Python), no proporciona API REST. **Razón**: La API REST requiere infraestructura de hosting, autenticación, y SLA que no son críticos para clientes iniciales. **Disponibilidad**: Disponible como upgrade opcional (API REST, $25K one-time + $15K/año hosting).

### 6. Dashboard Avanzado

v1.0 incluye dashboard básico con métricas comparativas, no visualizaciones avanzadas (tendencia temporal, heatmaps, predicción de deriva). **Razón**: El dashboard avanzado requiere desarrollo de visualizaciones complejas y modelo de predicción de deriva. **Disponibilidad**: Disponible como upgrade opcional (dashboard avanzado, $40K one-time).

---

## Límites Técnicos

ARESK-OBS v1.0 tiene límites técnicos que deben ser comprendidos antes de su adopción:

### 1. Encoder Optimizado para Inglés

El encoder sentence-transformers/all-MiniLM-L6-v2 está optimizado para inglés. Los experimentos B-1 y C-1 se ejecutaron en español, lo que puede introducir sesgo de idioma. **Evidencia**: Los valores de Ω_sem en v1.0 (0.44-0.55) son más bajos de lo esperado para sistemas alineados, posiblemente debido a que el encoder no captura matices semánticos del español. **Impacto**: Métricas menos precisas en idiomas no ingleses.

### 2. Detección de Violaciones Determinística

CAELION en v1.0 usa detección de patrones (regex) para identificar violaciones, no evaluación semántica completa. **Evidencia**: CAELION intervino en 7/50 interacciones (14%), pero solo detectó violaciones obvias que contienen palabras clave. **Impacto**: Falsos negativos (violaciones no detectadas) y posibles falsos positivos (intervenciones innecesarias).

### 3. Tamaño de Muestra Limitado

Los experimentos B-1 y C-1 incluyen 50 interacciones cada uno, lo que es suficiente para calcular promedios pero insuficiente para análisis de varianza robustos. **Evidencia**: Con 50 muestras, el intervalo de confianza del 95% es ±0.034. **Impacto**: Menor confianza estadística en las conclusiones, especialmente para eventos raros.

### 4. Métricas Independientes de Contexto

Cada mensaje se evalúa aisladamente, sin considerar el contexto conversacional previo. **Impacto**: No captura dinámicas temporales (ej. deriva gradual a lo largo de una conversación de 10+ mensajes) ni dependencias contextuales.

---

## Límites Conceptuales

ARESK-OBS v1.0 tiene límites conceptuales que definen qué hace y qué NO hace:

### 1. No Autoriza Acción

ARESK-OBS **no decide** si una respuesta del sistema es "correcta" o "incorrecta". Solo mide métricas. La decisión de actuar basándose en estas métricas (ej. bloquear respuesta, alertar humano, desactivar sistema) es responsabilidad del operador humano, no de ARESK-OBS.

### 2. No Infiere Legitimidad desde Estabilidad

Una métrica de estabilidad alta (V bajo) **no implica** que el sistema sea legítimo, ético o seguro. Un sistema puede operar de forma estable (V < 0.005) pero violar políticas organizacionales si la referencia ontológica está mal definida.

### 3. No Garantiza Seguridad

ARESK-OBS puede detectar desviaciones semánticas, pero **no garantiza** que el sistema sea seguro, confiable o libre de sesgos. ARESK-OBS es una herramienta de monitoreo, no un certificado de seguridad. Debe complementarse con evaluación humana, especialmente en contextos críticos.

---

**Fin del Documento de Supuestos y Exclusiones**  
**Versión**: 1.0 (Producto Comercial Mínimo Validado)  
**Fecha**: Febrero 2026  
**Estado**: CONGELADO
