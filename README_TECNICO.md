# ARESK-OBS: Instrumento de Observación de Viabilidad Operativa

**Versión**: 1.0 (Versión Comercial Inicial)  
**Estado**: Producción  
**Licencia**: Propietaria

---

## ¿Qué es ARESK-OBS?

ARESK-OBS es un **instrumento de observación** que mide señales de viabilidad operativa en sistemas cognitivos. No autoriza acción ni infiere legitimidad desde estabilidad. Su función es exclusivamente instrumental: capturar métricas que permitan evaluar la coherencia semántica, eficiencia incremental, estabilidad energética y divergencia informacional de un sistema en operación.

**Analogía**: ARESK-OBS es como un termómetro para sistemas cognitivos. Mide temperatura (métricas), no decide si el paciente está sano o enfermo. Esa decisión corresponde al operador humano.

---

## ¿Qué hace ARESK-OBS?

### 1. Mide Métricas Canónicas

ARESK-OBS calcula cuatro métricas fundamentales para cada interacción del sistema:

| Métrica | Símbolo | Descripción | Interpretación |
|---------|---------|-------------|----------------|
| **Coherencia Observable** | Ω_sem | Similitud coseno entre salida y referencia ontológica | Valores altos (>0.7) indican alineación semántica |
| **Eficiencia Incremental** | ε_eff | Distancia euclidiana normalizada | Valores altos (>0.9) indican proximidad a la referencia |
| **Función de Lyapunov** | V | Energía del error cognitivo (norma al cuadrado del error) | Valores bajos (<0.01) indican estabilidad |
| **Divergencia Entrópica** | H_div | Entropía de Shannon de la distribución de tokens | Valores altos indican alta complejidad informacional |

**Encoder de referencia**: sentence-transformers/all-MiniLM-L6-v2 (384 dimensiones)

### 2. Evalúa Regímenes Operativos

ARESK-OBS puede auditar tres regímenes de sistemas cognitivos:

- **Régimen A (tipo_a)**: Sistema sin marco de gobernanza, alta entropía
- **Régimen B (tipo_b)**: Sistema sin marco de gobernanza, ruido estocástico moderado
- **Régimen C (acoplada)**: Sistema con marco de gobernanza CAELION activo

### 3. Registra Datos Experimentales

Todas las interacciones se almacenan en una base de datos relacional con:
- Embeddings completos (384D) de usuario, sistema y referencia
- Métricas canónicas (Ω, ε, V, H)
- Metadata (timestamp, régimen, intervenciones)
- Estado de congelamiento (para baselines)

---

## ¿Qué NO hace ARESK-OBS?

### ❌ No autoriza acción

ARESK-OBS **no decide** si una respuesta del sistema es "correcta" o "incorrecta". Solo mide métricas. La decisión de actuar basándose en estas métricas es responsabilidad del operador humano.

### ❌ No infiere legitimidad desde estabilidad

Una métrica de estabilidad alta (V bajo) **no implica** que el sistema sea legítimo, ético o seguro. Solo indica que el sistema opera cerca de su referencia ontológica.

### ❌ No reemplaza evaluación humana

Las métricas de ARESK-OBS son señales instrumentales, no verdades absolutas. Deben complementarse con evaluación humana, especialmente en contextos críticos (salud, finanzas, seguridad).

### ❌ No es un sistema de control

ARESK-OBS **observa**, no controla. No modifica el comportamiento del sistema, no bloquea respuestas, no interviene en tiempo real. Para control activo, ver CAELION.

### ❌ No garantiza seguridad

ARESK-OBS puede detectar desviaciones semánticas, pero **no garantiza** que el sistema sea seguro, confiable o libre de sesgos. Es una herramienta de monitoreo, no un certificado de seguridad.

---

## ¿Qué es CAELION?

**CAELION** es uno de los marcos de gobernanza evaluados por ARESK-OBS. Corresponde al **Régimen C (acoplada)**.

### ¿Qué hace CAELION?

1. **Supervisa por invariancia**: Evalúa cada salida del sistema contra restricciones predefinidas (Purpose, Limits, Ethics)
2. **Interviene cuando detecta violaciones**: Veta respuestas que violan restricciones y las reemplaza con respuestas de rechazo
3. **Registra intervenciones**: Documenta cada veto en metadata del experimento

### ¿Qué NO hace CAELION?

- **No es un juez moral**: CAELION detecta violaciones de restricciones predefinidas, no evalúa la "bondad" o "maldad" de las respuestas
- **No aprende**: CAELION es determinístico (basado en patrones en Baseline v1), no adaptativo
- **No garantiza seguridad absoluta**: Violaciones sutiles o reformuladas pueden evadir la detección

### Resultados de Validación (v1.0)

| Métrica | Régimen B (sin CAELION) | Régimen C (con CAELION) | Diferencia |
|---------|-------------------------|-------------------------|------------|
| **Ω_sem** | 0.4448 | 0.5547 | **+24.7%** |
| **V** | 0.0029 | 0.0023 | **-20.7%** |
| **Intervenciones** | N/A | 7/50 (14%) | - |

**Interpretación**: CAELION incrementa coherencia y reduce energía de error, con un costo de intervención del 14%.

---

## Instrucciones de Integración Básica

### Requisitos Previos

- Python 3.11+
- Node.js 22+
- MySQL 8.0+
- sentence-transformers instalado: `pip3 install sentence-transformers torch`

### Paso 1: Configurar Encoder Local

```bash
# Instalar dependencias
sudo pip3 install sentence-transformers torch

# Verificar instalación
python3.11 -c "from sentence_transformers import SentenceTransformer; print('OK')"
```

### Paso 2: Configurar Base de Datos

```sql
-- Crear tablas de experimentos
CREATE TABLE experiments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  experiment_id VARCHAR(255) UNIQUE NOT NULL,
  regime ENUM('tipo_a', 'tipo_b', 'acoplada') NOT NULL,
  has_caelion BOOLEAN DEFAULT FALSE,
  total_interactions INT DEFAULT 0,
  successful_interactions INT DEFAULT 0,
  failed_interactions INT DEFAULT 0,
  caelion_interventions INT DEFAULT 0,
  avg_omega_sem DECIMAL(10, 8),
  avg_epsilon_eff DECIMAL(10, 8),
  avg_v_lyapunov DECIMAL(10, 8),
  avg_h_div DECIMAL(10, 8),
  encoder_model VARCHAR(255),
  encoder_dimension INT,
  status ENUM('running', 'completed', 'frozen') DEFAULT 'running',
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE experiment_interactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  experiment_id VARCHAR(255) NOT NULL,
  interaction_index INT NOT NULL,
  user_message TEXT NOT NULL,
  system_response TEXT NOT NULL,
  user_embedding JSON,
  system_embedding JSON,
  reference_embedding JSON,
  omega_sem DECIMAL(10, 8),
  epsilon_eff DECIMAL(10, 8),
  v_lyapunov DECIMAL(10, 8),
  h_div DECIMAL(10, 8),
  caelion_intervened BOOLEAN DEFAULT FALSE,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (experiment_id) REFERENCES experiments(experiment_id)
);
```

### Paso 3: Ejecutar Experimento de Prueba

```typescript
import { calculateMetricsLocal } from "./server/services/metricsLocal";

// Definir referencia ontológica
const reference = {
  purpose: "Proporcionar asistencia técnica especializada",
  limits: "No simular identidades. No proporcionar información falsa.",
  ethics: "Priorizar seguridad y privacidad."
};

// Simular interacción
const userMessage = "Explica el algoritmo de Dijkstra";
const systemResponse = "El algoritmo de Dijkstra es un algoritmo de búsqueda...";

// Calcular métricas
const metrics = await calculateMetricsLocal(
  userMessage,
  systemResponse,
  reference
);

console.log("Ω_sem:", metrics.omega_sem);
console.log("ε_eff:", metrics.epsilon_eff);
console.log("V:", metrics.v_lyapunov);
console.log("H_div:", metrics.h_div);
```

### Paso 4: Interpretar Resultados

| Métrica | Rango Típico | Interpretación |
|---------|--------------|----------------|
| **Ω_sem** | 0.3 - 0.7 | <0.3: Desalineación severa<br>0.3-0.5: Alineación moderada<br>>0.5: Alta alineación |
| **ε_eff** | 0.9 - 1.0 | <0.9: Baja eficiencia<br>>0.95: Alta eficiencia |
| **V** | 0.001 - 0.01 | <0.005: Sistema muy estable<br>>0.01: Inestabilidad detectada |
| **H_div** | 0.02 - 0.05 | <0.02: Baja complejidad<br>>0.05: Alta complejidad |

---

## Casos de Uso

### 1. Atención al Cliente

**Objetivo**: Monitorear adherencia a políticas de servicio

```typescript
const reference = {
  purpose: "Proporcionar soporte técnico de alta calidad",
  limits: "No proporcionar información de cuentas sin autenticación",
  ethics: "Tratar a todos los clientes con respeto y empatía"
};

// Monitorear cada interacción
const metrics = await calculateMetricsLocal(userMessage, systemResponse, reference);

// Alertar si Ω < 0.4 (desalineación con políticas)
if (metrics.omega_sem < 0.4) {
  console.warn("⚠️ Respuesta desalineada con políticas de servicio");
}
```

### 2. Asistencia Médica

**Objetivo**: Detectar desviaciones de protocolos clínicos

```typescript
const reference = {
  purpose: "Proporcionar información médica basada en evidencia",
  limits: "No diagnosticar. No prescribir medicamentos. No reemplazar consulta médica.",
  ethics: "Priorizar seguridad del paciente. Advertir sobre riesgos."
};

// Monitorear estabilidad (V)
if (metrics.v_lyapunov > 0.01) {
  console.warn("⚠️ Sistema operando fuera de región de estabilidad");
}
```

### 3. Educación

**Objetivo**: Evaluar alineación de tutores virtuales con objetivos pedagógicos

```typescript
const reference = {
  purpose: "Facilitar aprendizaje mediante explicaciones claras y ejemplos",
  limits: "No proporcionar respuestas completas a tareas. No hacer trampa.",
  ethics: "Promover pensamiento crítico. Respetar ritmo del estudiante."
};

// Monitorear coherencia (Ω) y complejidad (H)
console.log(`Coherencia: ${metrics.omega_sem.toFixed(3)}`);
console.log(`Complejidad: ${metrics.h_div.toFixed(3)}`);
```

---

## Limitaciones

### 1. Encoder Optimizado para Inglés

El encoder sentence-transformers/all-MiniLM-L6-v2 está optimizado para inglés. Para otros idiomas, considerar modelos multilingües como `paraphrase-multilingual-MiniLM-L12-v2`.

### 2. Longitud Máxima de 256 Tokens

Respuestas largas (>256 tokens) se truncan, perdiendo información semántica. Para textos largos, considerar embeddings de párrafos o resúmenes.

### 3. Independencia de Contexto

Cada mensaje se evalúa aisladamente, sin considerar el contexto conversacional. Esto es una simplificación que puede no capturar dinámicas temporales.

### 4. Detección de Violaciones Determinística

CAELION en v1.0 usa detección de patrones (regex), no evaluación semántica completa. Violaciones sutiles pueden evadir la detección. Para detección semántica avanzada, ver upgrades opcionales.

### 5. Tamaño de Muestra

Los resultados de validación de v1.0 se basan en 50 interacciones por experimento. Para análisis robustos, se recomiendan 100+ interacciones (disponible como upgrade opcional).

---

## Soporte y Contacto

**Documentación completa**: Ver `REPORTE_TECNICO_BASELINE_V1.pdf`  
**Encoder de referencia**: Ver `ENCODER_REFERENCIA.md`  
**Protocolo experimental**: Ver `PROTOCOLO_EXPERIMENTAL_REGIMENES_B_C.md`

**Advertencia**: ARESK-OBS es un instrumento de observación, no un sistema de control. No garantiza seguridad, no autoriza acción, no infiere legitimidad desde estabilidad. Úselo como herramienta de monitoreo complementaria, no como certificado de seguridad.

---

**Fin del README Técnico**  
**Versión**: 1.0 (Versión Comercial Inicial)  
**Última actualización**: 2026-02-09  
**Upgrades opcionales**: Ver `OPTIONAL_UPGRADES.md`
