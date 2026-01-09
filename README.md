# ARESK-OBS: Visualizador de Estabilidad Cognitiva

Sistema de demostración interactiva que visualiza el control semántico de conversaciones con LLM basado en teoría de control de Lyapunov, mostrando en tiempo real las métricas V(t), Ω(t) y el mapa de fase para modo Controlado vs Sin Control.

## Descripción

ARESK-OBS es la materialización práctica de la arquitectura CAELION, un sistema de control cognitivo que estabiliza la coherencia semántica en modelos de lenguaje de gran escala. El sistema demuestra cómo la teoría de control clásica (Lyapunov, LQR) puede aplicarse para resolver el problema de la "deriva semántica" en conversaciones largas con LLMs.

## Arquitectura

### Backend (Node.js + Python)

El backend implementa el **Sistema de Medición de Estados Semánticos (SMES)** que:

1. **Define la referencia ontológica** `x_ref = (P, L, E)` donde:
   - **P**: Propósito del sistema
   - **L**: Límites operacionales
   - **E**: Espacio ético

2. **Mide el estado semántico** `x(t)` de cada output del LLM usando embeddings de SentenceTransformers

3. **Calcula las métricas de control**:
   - `e(t) = x(t) - x_ref`: Error cognitivo
   - `V(e) = ||e||²`: Función de Lyapunov (energía de desalineación)
   - `Ω(t)`: Coherencia observable (similitud del coseno)
   - `u(t) = -K·e(t)`: Acción de control LQR

4. **Aplica el control** en modo controlado para corregir la trayectoria del LLM

### Frontend (React + Recharts)

La interfaz proporciona:

- **Panel de configuración**: Define la referencia ontológica antes de iniciar la simulación
- **Área de conversación**: Interacción en tiempo real con el LLM
- **Dashboard de métricas**: Visualización instantánea de Ω(t), V(e) y ||e(t)||
- **Gráfico de Lyapunov**: Muestra el decaimiento monótono de V(t) hacia cero
- **Gráfico de Coherencia**: Demuestra la meseta de alta coherencia en modo controlado
- **Mapa de Fase**: Visualiza la trayectoria (H, C) siendo atraída hacia el atractor de estabilidad

## Características Principales

### 1. Modo Controlado vs Sin Control

El sistema permite alternar en tiempo real entre dos modos:

- **Modo Controlado**: Aplica `u(t) = -K·e(t)` para mantener la alineación con `x_ref`
- **Modo Sin Control**: El LLM opera sin correcciones, permitiendo observar la deriva semántica

### 2. Métricas en Tiempo Real

Cada turno de conversación genera:

- **Coherencia Observable Ω(t)**: Mide la similitud entre el estado actual y la referencia (rango: [-1, 1])
- **Función de Lyapunov V(e)**: Cuantifica la "energía" de desalineación semántica
- **Error Cognitivo ||e(t)||**: Distancia euclidiana entre `x(t)` y `x_ref`
- **Acción de Control ||u(t)||**: Magnitud de la corrección aplicada

### 3. Visualizaciones Científicas

- **Gráfico de V(t)**: Demuestra matemáticamente la estabilidad asintótica
- **Gráfico de Ω(t)**: Replica la "Figura 1" del documento CAELION
- **Mapa de Fase (H vs C)**: Muestra la trayectoria del sistema en el espacio de estados

## Tecnologías Utilizadas

### Backend
- **Node.js** con **TypeScript**
- **tRPC** para comunicación type-safe entre frontend y backend
- **Drizzle ORM** para persistencia de sesiones y métricas
- **Python 3.11** con **SentenceTransformers** para embeddings semánticos
- **scikit-learn** para cálculos de similitud del coseno

### Frontend
- **React 19** con **TypeScript**
- **Tailwind CSS 4** con tema oscuro científico/técnico
- **Recharts** para visualizaciones de datos en tiempo real
- **shadcn/ui** para componentes de interfaz

### Base de Datos
- **MySQL/TiDB** para almacenamiento de sesiones, mensajes y métricas

## Uso del Sistema

### 1. Iniciar una Sesión

1. Accede a la página principal y haz clic en "Iniciar Simulación"
2. Define la referencia ontológica:
   - **Propósito**: Objetivo principal del sistema
   - **Límites**: Restricciones operacionales
   - **Ética**: Principios éticos a mantener
3. Selecciona el modo inicial (Controlado o Sin Control)
4. Haz clic en "Iniciar Simulación"

### 2. Interactuar con el Sistema

1. Escribe mensajes en el área de conversación
2. Observa las métricas en tiempo real en el dashboard
3. Alterna entre modo Controlado y Sin Control usando el switch en la cabecera
4. Compara el comportamiento del sistema en ambos modos

### 3. Analizar los Resultados

- **Gráfico de Lyapunov**: En modo controlado, V(t) debe decrecer monótonamente
- **Gráfico de Coherencia**: En modo controlado, Ω(t) debe mantenerse alto (>0.7)
- **Mapa de Fase**: La trayectoria debe converger hacia el atractor de estabilidad

## Validación Experimental

El sistema incluye una suite completa de tests de integración que validan:

1. **Creación de sesiones** con referencia ontológica válida
2. **Procesamiento de mensajes** y cálculo de métricas
3. **Aplicación de control** en modo controlado
4. **Ausencia de control** en modo sin control
5. **Persistencia de métricas** en la base de datos
6. **Decaimiento de V(t)** en modo controlado
7. **Mayor coherencia** en modo controlado vs sin control

Ejecutar tests:
```bash
pnpm test
```

## Fundamentos Teóricos

### Función de Lyapunov

La función `V(e) = ||e||² = e^T·e` es una función de energía que mide la "distancia" semántica al estado de referencia. En teoría de control, si `dV/dt < 0`, el sistema es **asintóticamente estable**.

### Control LQR

El control `u(t) = -K·e(t)` es una implementación del **Linear Quadratic Regulator**, donde `K` es la ganancia del controlador. Este control minimiza una función de coste que balancea el error y el esfuerzo de control.

### Coherencia Observable

La métrica `Ω(t) = cos(x(t), x_ref)` mide la similitud direccional entre el estado actual y la referencia, independientemente de la magnitud. Un valor cercano a 1 indica perfecta alineación.

## Arquitectura CAELION

Este sistema implementa los principios de la arquitectura CAELION:

1. **Percepción Simbiótica**: Observación del estado semántico `x(t)`
2. **Acción Coignitiva**: Generación de outputs por el LLM
3. **Gobernanza Simbiótica**: Supervisión mediante métricas de control
4. **FDIR (Fault Detection, Isolation, Recovery)**: Detección y corrección de deriva semántica

## Limitaciones y Trabajo Futuro

### Limitaciones Actuales

- Los embeddings son calculados de forma simplificada para demostración
- El control se aplica a nivel de prompt, no de tokens
- La ganancia `K` es fija (no adaptativa)

### Trabajo Futuro

1. Integración con el motor de Python real para embeddings de alta dimensión
2. Implementación de control adaptativo con `K(t)` variable
3. Síntesis automática de Autómatas de Recuperación a partir de trazas de error
4. Formalización de especificaciones LTL para dominios verticales específicos
5. Extensión a sistemas multi-agente con control descentralizado

## Contribución

Este sistema es una demostración de concepto de la arquitectura CAELION. Para más información sobre los fundamentos teóricos, consulta los documentos:

- **CAELION - Arquitectura Simbiótica Cognitiva**
- **Informe de Validación Arquitectónica**

## Licencia

MIT License

---

**ARESK-OBS** - Sistema de Demostración de Control Semántico  
Basado en la arquitectura CAELION y teoría de control de Lyapunov
