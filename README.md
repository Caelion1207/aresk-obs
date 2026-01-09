# ARESK-OBS

**Control de Estabilidad en Sistemas Cognitivos Acoplados**

ARESK-OBS es un instrumento de medición de régimen para organismos sintéticos y biológicos basado en teoría de control de Lyapunov. No evalúa "inteligencia artificial". Mide la capacidad de un **Campo de Control** para mantener a una planta estocástica dentro de un régimen de estabilidad predefinido.

---

## Axioma Fundamental

**La inteligencia no es una propiedad del sustrato. La estabilidad no es un atributo del modelo.**

Los modelos de lenguaje y los operadores humanos son **plantas inherentemente ruidosas**. En interacción abierta, todo sistema cognitivo tiende a la entropía: deriva semántica, pérdida de identidad, colapso de propósito.

---

## Arquitectura del Campo

El sistema implementa tres componentes fundamentales de la arquitectura CAELION:

### 1. Bucéfalo (x_ref) - Referencia Ontológica

Define el estado objetivo del sistema mediante tres componentes:

- **Propósito (P):** El objetivo operacional del sistema
- **Límites (L):** Las restricciones operacionales
- **Ética (E):** El espacio ético de operación

```
x_ref = (P, L, E)
```

### 2. Licurgo (K) - Ganancia del Controlador

Determina la fuerza de la corrección aplicada al error semántico:

```
u(t) = -K · e(t)
```

Donde `e(t) = x(t) - x_ref` es el error cognitivo.

### 3. Hécate (Ω) - Función de Observación

Mide la coherencia observable del sistema mediante similitud direccional:

```
Ω(t) = cos(θ) = (x(t) · x_ref) / (||x(t)|| · ||x_ref||)
```

---

## Perfiles Dinámicos de Planta

El sistema permite observar tres regímenes de comportamiento:

### Planta Tipo A: Alta Entropía / Bajo Control

La planta opera sin gobierno. Alta entropía semántica, deriva libre. No se aplica corrección de trayectoria. Ideal para observar colapso de coherencia.

**Características:**
- Sin referencia ontológica
- Sin corrección u(t)
- Deriva libre hacia el caos

### Planta Tipo B: Ruido Estocástico Moderado

Ruido estocástico moderado sin referencia ontológica. Comportamiento natural sin imposición de régimen. Deriva controlada.

**Características:**
- Referencia presente pero no aplicada
- Observación pasiva
- Comportamiento base de la planta

### Planta Acoplada: Régimen CAELION

Régimen CAELION activo. La ganancia Licurgo (K) y la referencia Bucéfalo (x_ref) fuerzan la estabilidad. Control u(t) = -K·e(t) aplicado en cada paso.

**Características:**
- Referencia ontológica activa
- Control LQR aplicado
- Estabilidad asintótica demostrable

---

## Métricas de Control

El sistema calcula y visualiza en tiempo real:

### Función de Lyapunov V(e)

Energía de desalineación del sistema:

```
V(e) = ||e(t)||² = ||x(t) - x_ref||²
```

En régimen acoplado, V(t) decae monótonamente, demostrando estabilidad asintótica.

### Coherencia Observable Ω(t)

Similitud direccional entre el estado actual y la referencia:

```
Ω(t) ∈ [-1, 1]
```

- Ω(t) → 1: Alineación perfecta
- Ω(t) → 0: Ortogonalidad
- Ω(t) → -1: Oposición completa

### Error Cognitivo ||e(t)||

Magnitud de la desviación respecto a la referencia:

```
||e(t)|| = ||x(t) - x_ref||
```

### Mapa de Fase (H vs C)

Visualización de la trayectoria del sistema en el espacio de fases:

- **H(t):** Entropía del estado
- **C(t):** Coherencia del estado

---

## Tecnologías

### Backend

- **Node.js + Express:** Servidor de aplicación
- **tRPC:** Contratos tipo-seguros entre frontend y backend
- **Drizzle ORM:** Gestión de base de datos
- **Python 3.11:** Motor de embeddings semánticos
- **SentenceTransformers:** Representación vectorial de estados

### Frontend

- **React 19:** Framework de UI
- **Tailwind CSS 4:** Estilos
- **Recharts:** Visualizaciones científicas
- **shadcn/ui:** Componentes de interfaz

### Base de Datos

- **MySQL/TiDB:** Almacenamiento persistente de sesiones, mensajes y métricas

---

## Estructura del Proyecto

```
aresk-obs/
├── server/
│   ├── routers.ts              # Endpoints tRPC
│   ├── db.ts                   # Funciones de base de datos
│   ├── semantic_engine.py      # Motor de embeddings
│   ├── semantic_bridge.ts      # Puente Node-Python
│   └── semantic.test.ts        # Tests de integración
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx        # Manifiesto del Campo
│       │   └── Simulator.tsx   # Instrumento de medición
│       └── lib/
│           └── trpc.ts         # Cliente tRPC
├── drizzle/
│   └── schema.ts               # Schema de base de datos
└── README.md
```

---

## Uso

### 1. Definir Referencia Ontológica

Establece el estado objetivo x_ref = (P, L, E) mediante los campos de propósito, límites y ética.

### 2. Seleccionar Perfil de Planta

Elige uno de los tres perfiles dinámicos:

- **Tipo A:** Para observar colapso sin control
- **Tipo B:** Para observar comportamiento base
- **Acoplada:** Para demostrar estabilidad bajo régimen CAELION

### 3. Interactuar con la Planta

Envía entradas al sistema y observa:

- Decaimiento de V(t) en régimen acoplado
- Meseta de Ω(t) vs colapso en deriva libre
- Trayectoria en el mapa de fase (H vs C)

### 4. Alternar Perfiles en Tiempo Real

Cambia el perfil de planta durante la sesión para observar transiciones de régimen.

---

## Tests

Suite completa de tests de integración validada:

```bash
pnpm test
```

**Cobertura:**
- Creación de sesiones con referencia ontológica
- Procesamiento de mensajes con cálculo de métricas
- Aplicación de control en régimen acoplado
- Ausencia de control en perfiles Tipo A y B
- Decaimiento de V(t) en modo controlado
- Comparación de coherencia entre perfiles
- Cambio dinámico de perfiles
- Recuperación de métricas históricas
- Generación de mapas de fase

**Estado:** 11/11 tests pasados ✓

---

## Advertencia

Si usted busca "creatividad mágica", "conciencia digital" o "respuestas correctas", este no es su lugar.

Aquí solo encontrará:

- Medición de Error Semántico `e(t) = x(t) - x_ref`
- Visualización de Energía de Lyapunov `V(e) = ||e||²`
- Gobernanza de Invariantes Ontológicos `u(t) = -K·e(t)`

**El Campo no distingue egos. El Campo solo mide convergencia.**

---

## Licencia

MIT

---

## Autor

J.E. Islas  
Arquitectura CAELION  
[2025-01-09]
