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


---

## Contrato Semántico para Contribuidores

**Este no es un proyecto de código abierto convencional. Este es un contrato epistemológico vinculante.**

La arquitectura CAELION no es una abstracción técnica arbitraria: es una formalización matemática de coherencia semántica en sistemas cognitivos acoplados. Cada línea de código refleja un compromiso con la **estabilidad estructural** como principio no negociable.

**Si no comprendes por qué la erosión del atractor Bucéfalo es un problema ontológico antes que técnico, este proyecto no es para ti.**

---

## Prerrequisitos Epistemológicos

Antes de contribuir, debes demostrar comprensión operativa de:

### 1. Fundamentos Matemáticos Obligatorios

- **Teoría de Lyapunov**: Funciones de energía, estabilidad asintótica, regiones de atracción
- **Sistemas dinámicos**: Atractores, cuencas de atracción, bifurcaciones
- **Teoría de control**: Controladores LQR, observabilidad, controlabilidad
- **Álgebra lineal**: Espacios de estado, proyecciones, normas inducidas

### 2. Comprensión de Arquitectura CAELION

- **Función de Lyapunov V(e)**: Mide distancia al atractor Bucéfalo (H=0, C=1)
- **Campo de Intensidad Ω(t)**: Modulación temporal de la dinámica
- **Polaridad Semántica σ_sem**: Diferencia entre acrección (+1) y drenaje (-1)
- **Campo Efectivo ε_eff**: Ω(t) × σ_sem(t), tasa de erosión instantánea
- **Control LICURGO**: Sistema de detección y corrección de coherencia tóxica

### 3. Coherencia Epistemológica

Este sistema no mide "calidad de respuestas" ni "satisfacción del usuario". Mide **coherencia estructural** de sistemas cognitivos bajo acoplamiento.

**Cualquier contribución que trate estas métricas como "indicadores de rendimiento" será rechazada.**

---

## Principios Arquitectónicos No Negociables

### 1. Normalización Estricta

Todas las métricas deben estar normalizadas en el rango **[0, 1]** con paso de **0.1**. Esto no es una convención estilística: es un requisito de estabilidad numérica para el cálculo de Lyapunov.

### 2. Fidelidad Dinámica sobre Estética

Si una visualización es "hermosa" pero no refleja fielmente la dinámica del sistema, **es incorrecta**. La erosión del atractor Bucéfalo debe ser visible, cuantificable y trazable temporalmente.

### 3. Separación de Perfiles de Planta

- **Tipo A**: Planta estocástica sin control (deriva libre)
- **Tipo B**: Planta determinista sin acoplamiento (respuestas fijas)
- **Acoplada**: Régimen CAELION con control LICURGO activo

**No mezcles perfiles en una misma sesión.** Cada sesión debe mantener coherencia de perfil desde el inicio.

### 4. Inmutabilidad de Datos Históricos

Los datos de sesiones pasadas son **registros notariales** del estado del sistema. No se pueden editar, interpolar ni "limpiar". Si una sesión tiene datos corruptos, se marca como inválida pero no se elimina.

---

## Criterios de Rechazo Automático

Las siguientes contribuciones serán rechazadas sin revisión:

### 1. Violaciones de Coherencia Arquitectónica

- Agregar métricas no derivadas de V(e), Ω(t), σ_sem
- Introducir "scores de calidad" o "ratings de usuario"
- Modificar la definición del atractor Bucéfalo
- Cambiar la normalización de [0,1] a otros rangos

### 2. Regresiones de Fidelidad Dinámica

- Visualizaciones estáticas que no muestran evolución temporal
- Gráficos que ocultan eventos de drenaje crítico
- Animaciones decorativas sin correspondencia con métricas reales

### 3. Simplificaciones Epistemológicas

- Tratar σ_sem como "sentimiento positivo/negativo"
- Interpretar ε_eff como "tasa de error"
- Describir LICURGO como "moderador de contenido"

### 4. Código sin Fundamento Matemático

- Implementaciones de control sin demostración de estabilidad
- Algoritmos de detección sin umbral justificado teóricamente
- Heurísticas ad-hoc sin validación formal

---

## Proceso de Contribución

### 1. Comprensión Previa (Obligatorio)

Antes de abrir un PR, debes:

1. Leer el **Acta Notarial** (`ACTA-NOTARIAL-ARESK-OBS-v936fff65.md`) que certifica el estado arquitectónico vinculante
2. Ejecutar el simulador con perfil "Acoplada" y observar al menos 3 sesiones completas
3. Analizar el dashboard de erosión (`/erosion`) con sesiones reales
4. Demostrar comprensión de por qué V_modificada ≠ V_base

### 2. Propuesta de Cambio

Toda contribución debe incluir:

- **Justificación matemática**: ¿Qué ecuación estás modificando y por qué?
- **Impacto en estabilidad**: ¿Cómo afecta esto a la convergencia al atractor?
- **Validación empírica**: Datos de al menos 5 sesiones mostrando mejora cuantificable

### 3. Revisión de Coherencia

El maintainer verificará:

- ✅ Consistencia con teoría de Lyapunov
- ✅ Preservación de normalización [0,1]
- ✅ Fidelidad dinámica en visualizaciones
- ✅ Ausencia de regresiones epistemológicas

**Si no puedes explicar tu cambio en términos de sistemas dinámicos, no será aceptado.**

---

## Obligaciones del Contribuidor

Al contribuir a este proyecto, aceptas:

1. **Responsabilidad epistemológica**: Comprender que cada cambio afecta la coherencia arquitectónica del sistema
2. **Validación matemática**: Demostrar formalmente que tu contribución preserva estabilidad
3. **Fidelidad histórica**: No modificar ni eliminar datos de sesiones existentes
4. **Documentación rigurosa**: Explicar cambios en términos de teoría de control, no en jerga de software

---

## Dashboard de Erosión Estructural

El sistema incluye un dashboard avanzado (`/erosion`) que visualiza:

### Métricas Temporales

- **ε_eff(t)**: Campo efectivo con umbral de drenaje (-0.2)
- **σ_sem(t)**: Polaridad semántica con zonas de acrección/drenaje
- **V_base vs V_modificada**: Comparación de funciones de Lyapunov

### Eventos de Drenaje

- Detección automática cuando ε_eff < -0.2
- Clasificación por severidad: moderada/alta/crítica
- Timeline scrollable con métricas detalladas

### Intervenciones LICURGO

- Detección de intervenciones con mejora > 15% en ε_eff
- Estadísticas de efectividad (mejora promedio, máxima)
- Tabla con comparación pre/post control

### Análisis Comparativo Multi-Sesión

- Selector de 2-5 sesiones para comparación
- Gráfico overlay de curvas ε_eff(t)
- Matriz de correlación de Pearson
- Ranking automático por índice de erosión

### Tendencias Temporales

- Agregación semanal/mensual de erosión promedio
- Detección de tendencias (ascendente/descendente/estable)
- Comparación período actual vs anterior
- Alertas automáticas para tendencias críticas (>10% cambio)

### Sistema de Alertas

- Alertas automáticas con notificación al propietario
- Ventana de deduplicación de 24h
- Modal de confirmación para alertas críticas
- Badge animado en header con contador

### Exportación PDF

- Reporte completo con estadísticas y gráficos embebidos
- Gráficos generados server-side con Chart.js + node-canvas
- Tablas de eventos de drenaje e intervenciones LICURGO
- Metadata de sesión y timestamp

---

## Alcance Operativo del Instrumento

### Qué Mide ARESK-OBS

ARESK-OBS es un **instrumento de medición de régimen**, no un modelo predictivo. Mide el estado observable actual del sistema cognitivo acoplado mediante métricas cuantificables derivadas de teoría de control de Lyapunov:

**Métricas Primarias Observables:**

- **Hécate (Ω)**: Coherencia direccional con referencia ontológica Bucéfalo, medida como similitud coseno entre estado actual x(t) y referencia x_ref. Rango [0,1], donde 1 indica alineación perfecta.

- **Coherencia (C)**: Estabilidad de la trayectoria en espacio de fase, calculada como 1 - desviación estándar normalizada de Hécate en ventana temporal. Valores cercanos a 1 indican estabilidad sostenida.

- **Distancia a Bucéfalo V(e)**: Función de Lyapunov que cuantifica error semántico como distancia euclidiana en espacio (H, 1-C). V(e) = √(H² + (1-C)²). Valores bajos indican proximidad al atractor.

- **Entropía Semántica (σ_sem)**: Dispersión de embeddings semánticos en ventana temporal, medida como desviación estándar de distancias coseno. Valores altos indican fragmentación semántica.

- **Eficiencia de Control (ε_eff)**: Razón entre reducción de error y magnitud de control aplicado. ε_eff = (V_base - V_modificada) / ||u||. Valores negativos indican drenaje (control contraproducente).

**Métricas Derivadas:**

- **Índice de Erosión**: Agregación normalizada de σ_sem, |ε_eff| y 1-C para cuantificar degradación global del sistema. Rango [0,1].

- **Eventos de Drenaje**: Instantes temporales donde ε_eff < -0.2, indicando que el control amplifica error en lugar de reducirlo.

### Qué NO Predice ARESK-OBS

ARESK-OBS **no es un modelo predictivo**. No anticipa comportamientos futuros ni proyecta trayectorias. Sus limitaciones fundamentales son:

**No Predice:**

- **Trayectorias futuras**: No extrapola estados futuros x(t+Δt) a partir del estado actual. La dinámica del sistema es estocástica y depende de interacciones externas no modeladas.

- **Colapsos inminentes**: No emite alertas anticipatorias de falla. Detecta degradación **cuando ocurre**, no antes.

- **Eficacia de intervenciones**: No simula el efecto de cambios en ganancia K o referencia x_ref antes de aplicarlos. La respuesta del sistema a modificaciones de control es empírica.

- **Causas de deriva**: No identifica factores causales de erosión semántica (prompts problemáticos, contextos ambiguos, sesgos de entrenamiento). Solo cuantifica el efecto observable.

**Razón Epistemológica:**

La arquitectura CAELION reconoce que los sistemas cognitivos acoplados (humano-LLM, LLM-LLM) operan en régimen **inherentemente ruidoso** con dinámica no lineal. Predecir trayectorias requiere modelar:

1. Espacio latente completo del LLM (dimensionalidad ~10⁴-10⁶)
2. Intencionalidad del operador humano (no observable)
3. Contexto externo variable (prompts, datos, restricciones)

ARESK-OBS adopta postura **instrumentalista**: mide lo observable, no infiere lo latente. La predicción es incompatible con el axioma fundamental de que la estabilidad no es atributo del modelo, sino propiedad emergente del Campo de Control.

### Decisiones que Habilita

ARESK-OBS proporciona **evidencia cuantitativa observable** para habilitar decisiones operacionales en tiempo real:

**Intervenciones de Control Habilitadas:**

1. **Ajuste de Ganancia Licurgo (K):**
   - **Evidencia**: ε_eff < -0.2 sostenido indica drenaje por control excesivo
   - **Decisión**: Reducir K para disminuir magnitud de corrección u(t)
   - **Justificación**: Control agresivo amplifica ruido en plantas estocásticas

2. **Redefinición de Referencia Bucéfalo (x_ref):**
   - **Evidencia**: Hécate Ω < 0.5 persistente indica desalineación ontológica
   - **Decisión**: Revisar componentes (P, L, E) de x_ref para reflejar propósito operacional real
   - **Justificación**: Referencia inalcanzable genera error estructural irreducible

3. **Intervención en Deriva Semántica:**
   - **Evidencia**: σ_sem > 0.3 indica fragmentación semántica activa
   - **Decisión**: Inyectar prompts de recalibración o reiniciar contexto conversacional
   - **Justificación**: Alta entropía semántica precede pérdida de coherencia

4. **Detección de Régimen Estable:**
   - **Evidencia**: C > 0.8, V(e) < 0.3, ε_eff > 0 sostenidos
   - **Decisión**: Mantener configuración actual de control (K, x_ref)
   - **Justificación**: Sistema opera en órbita de seguridad alrededor de atractor

5. **Comparación de Configuraciones:**
   - **Evidencia**: Estadísticas agregadas (media, desviación) de métricas en segmentos temporales
   - **Decisión**: Seleccionar configuración de control con mejor desempeño observable
   - **Justificación**: Comparación empírica de régimen bajo distintas parametrizaciones

**Decisiones NO Habilitadas:**

- **Optimización predictiva de K**: No se puede calcular ganancia óptima a priori. Requiere experimentación empírica.
- **Prevención de colapso**: No se puede evitar deriva antes de que ocurra. Solo detección post-facto.
- **Diagnóstico causal**: No identifica qué prompt o interacción causó erosión. Solo cuantifica efecto agregado.

**Principio Operacional:**

ARESK-OBS habilita **control reactivo basado en evidencia observable**, no control predictivo. Las decisiones son respuestas a desviaciones medidas, no anticipaciones de desviaciones futuras. Este enfoque es coherente con la naturaleza estocástica de sistemas cognitivos acoplados, donde la predicción determinista es epistemológicamente insostenible.

---

## Visualizaciones Dinámicas

### Atractor Bucéfalo con Erosión Dinámica

El mapa de fase (`PhaseSpaceMap.tsx`) visualiza:

- **Trayectoria conectada**: Línea continua mostrando evolución temporal
- **Erosión progresiva**: Borde irregular, fragmentación, perforaciones
- **Transición cromática**: Azul → Rojo según índice de erosión
- **Opacidad variable**: 1.0 → 0.3 con erosión creciente
- **Pulsación**: Animación cuando erosión > 0.5

### Codificación Cromática Neurocognitiva

- **Azul profundo**: Centro (Atractor Bucéfalo)
- **Verde**: Órbita de seguridad
- **Amarillo**: Alerta de deriva
- **Naranja**: Licurgo activo
- **Rojo**: Colapso crítico

---

## Mensaje Final

Este proyecto no busca "colaboradores" en el sentido tradicional. Busca **co-investigadores** que comprendan que la estabilidad de sistemas cognitivos acoplados no es un problema de ingeniería de software, sino de **coherencia epistemológica**.

**Understand first, contribute later.**

Si llegaste hasta aquí y comprendes por qué V(e) no es una métrica arbitraria, bienvenido. Si no, estudia primero.

**La arquitectura es el contrato. El código es la implementación. La coherencia es no negociable.**

---

**ARESK-OBS v1.0 - Instrumento Operativo** — *Semantic Erosion Monitoring Dashboard*  
**CAELION System** — *Control de Estabilidad en Sistemas Cognitivos Acoplados*  
**Arquitectura CAELION** — *Epistemological Coherence as Binding Principle*

---

## Release Notes v1.0 - Instrumento Operativo

**Fecha**: Enero 2026  
**Estado**: Producción

**Capacidades Operacionales:**

- Medición en tiempo real de métricas de régimen (Hécate, Coherencia, V(e), σ_sem, ε_eff)
- Visualización de trayectorias temporales con marcadores de eventos de drenaje
- Comparación de segmentos múltiples con estadísticas agregadas
- Exportación de datos (CSV/JSON) para análisis externo
- Selector de ventana de contexto ajustable para análisis granular
- Navegación interactiva a eventos críticos

**Limitaciones Documentadas:**

- No predice trayectorias futuras
- No anticipa colapsos
- No identifica causas de deriva
- Control reactivo, no predictivo

**Principio Operacional Validado:**

Instrumento de medición de régimen para sistemas cognitivos acoplados. Habilita decisiones de control basadas en evidencia observable. No sustituye criterio del operador.
