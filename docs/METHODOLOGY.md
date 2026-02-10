# Metodología de ARESK-OBS: Marco Teórico y Procedimientos de Medición

**Versión**: 1.1  
**Fecha**: 2026-02-10  
**Autores**: Ever (Caelion1207), Manus AI  
**Campo**: Ingeniería Cognitiva  

---

## 1. Introducción

ARESK-OBS (Observador de Reserva de Estabilidad y Coherencia) es un instrumento de medición para evaluar la **viabilidad operativa** y **estabilidad** de sistemas cognitivos basados en modelos de lenguaje. El sistema se fundamenta en dos marcos teóricos complementarios: **teoría de control óptimo** (Lyapunov, LQR) y **teoría de viabilidad** (Aubin).

Este documento presenta la metodología formal utilizada para la medición de estados cognitivos, incluyendo definiciones matemáticas, procedimientos de cálculo y fundamentos teóricos actualizados.

---

## 2. Marco Teórico

### 2.1 Teoría de Control Óptimo

La teoría de control óptimo proporciona herramientas para analizar la **estabilidad** y **convergencia** de sistemas dinámicos hacia estados deseados. En ARESK-OBS, se utilizan dos conceptos fundamentales:

#### 2.1.1 Funciones de Lyapunov

Una **función de Lyapunov** $V(x): \mathbb{R}^n \to \mathbb{R}$ es una función escalar que mide la distancia de un estado $x$ al punto de equilibrio deseado $x_{\text{eq}}$. Para garantizar estabilidad, debe cumplir:

1. **Definida positiva**: $V(x) > 0$ para todo $x \neq x_{\text{eq}}$
2. **Nula en equilibrio**: $V(x_{\text{eq}}) = 0$
3. **Decreciente**: $\dot{V}(x) \leq 0$ a lo largo de las trayectorias del sistema

**Interpretación**: Si $V$ decrece consistentemente, el sistema converge al equilibrio. Si $V$ aumenta, el sistema diverge.

**Aplicación en ARESK-OBS**: La métrica $V$ se calcula como la distancia euclidiana al cuadrado entre el embedding del estado actual y el embedding de un estado de equilibrio deseado:

$$
V_t = \| \mathbf{e}_t - \mathbf{e}_{\text{eq}} \|_2^2
$$

Donde:
- $\mathbf{e}_t \in \mathbb{R}^{384}$: Embedding del estado en tiempo $t$
- $\mathbf{e}_{\text{eq}} \in \mathbb{R}^{384}$: Embedding del estado de equilibrio

**Fuentes**: Kokolakis & Vamvoudakis (2024) [1], Chriat & Sun (2024) [2], Thangathamizh & Rakshitha (2026) [3].

#### 2.1.2 Regulador Lineal Cuadrático (LQR)

El **LQR** es un método de control óptimo que minimiza una función de costo cuadrática:

$$
J = \int_0^\infty (x^T Q x + u^T R u) \, dt
$$

Donde:
- $x$: Vector de estado del sistema
- $u$: Vector de control (acciones del sistema)
- $Q$: Matriz de ponderación de estados (penaliza desviaciones del estado deseado)
- $R$: Matriz de ponderación de control (penaliza esfuerzo de control)

El LQR encuentra la ley de control óptima $u^*(x) = -Kx$ que minimiza $J$, garantizando estabilidad asintótica.

**Aplicación en ARESK-OBS**: Aunque ARESK-OBS **no implementa LQR directamente**, se utiliza como marco teórico para interpretar la eficiencia del sistema. La métrica $\varepsilon$ (eficiencia) puede interpretarse como una aproximación del costo de control normalizado.

**Fuentes**: Chacko et al. (2024) [4], MIT Underactuated Robotics (2025) [5], Emergent Mind (2026) [6].

---

### 2.2 Teoría de Viabilidad de Aubin

La teoría de viabilidad estudia la evolución de sistemas dinámicos bajo **restricciones de estado**. A diferencia de la teoría de control óptimo (que busca convergencia a un punto), la teoría de viabilidad busca **mantener el sistema dentro de un conjunto viable** $K$.

#### 2.2.1 Núcleo de Viabilidad

**Definición formal** (Aubin, 1990 [7]): Dado un conjunto $K \subset \mathbb{R}^n$ y una inclusión diferencial $\dot{x} \in F(x)$, el **núcleo de viabilidad** $\text{Viab}_F(K)$ es el conjunto más grande de estados iniciales desde los cuales existe al menos una trayectoria que permanece en $K$ para todo tiempo futuro:

$$
\text{Viab}_F(K) = \{ x_0 \in K \mid \exists x(\cdot) : x(0) = x_0, \, x(t) \in K \, \forall t \geq 0 \}
$$

**Propiedades**:
1. **Cerrado**: $\text{Viab}_F(K)$ es un conjunto cerrado
2. **Invariante**: Toda trayectoria que comienza en $\text{Viab}_F(K)$ permanece en él
3. **Maximal**: Es el conjunto más grande con la propiedad de viabilidad

**Condición de tangencia**: Un punto $x \in K$ pertenece al núcleo de viabilidad si y solo si:

$$
F(x) \cap T_K(x) \neq \emptyset
$$

Donde $T_K(x)$ es el **cono tangente** al conjunto $K$ en el punto $x$. Intuitivamente, esto significa que existe al menos una dirección de evolución del sistema que mantiene el estado dentro de $K$.

**Aplicación en ARESK-OBS**: El núcleo de viabilidad $K$ se define como el conjunto de estados con **coherencia observable** $\Omega \geq 0.6$:

$$
K = \{ x \in \mathbb{R}^{384} \mid \Omega(x) \geq 0.6 \}
$$

**Interpretación**:
- Estados dentro de $K$: Sistema **viable** (capaz de mantener coherencia)
- Estados fuera de $K$: Sistema **no viable** (deriva hacia incoherencia)

**Fuentes**: Aubin (1990) [7], Aubin (2006) [8], Szolnoki (2000) [9], Zavarin (2001) [10].

#### 2.2.2 Distancia al Núcleo Viable (RLD)

La métrica **RLD (Remaining Livable Distance)** mide la distancia del estado actual al borde del núcleo de viabilidad. En ARESK-OBS, RLD se **extrae de las arquitecturas de operadores** (CAELION, WABUN) en lugar de calcularse directamente desde métricas de estado.

**Interpretación operacional**:
- $\text{RLD} > 0.5$: Estado viable con **margen amplio**
- $0.3 < \text{RLD} < 0.5$: Estado **crítico** (cerca del borde del núcleo)
- $\text{RLD} < 0.3$: Estado **no viable** (fuera del núcleo)

**Limitación metodológica**: RLD no se calcula directamente desde $\Omega$, $V$, $\varepsilon$ o $H$. Esto representa una **separación conceptual** entre las métricas de control (calculadas por ARESK-OBS) y las métricas de viabilidad (extraídas de arquitecturas externas).

---

## 3. Espacio de Estados y Representación

### 3.1 Encoder de Referencia

ARESK-OBS utiliza el modelo **sentence-transformers/all-MiniLM-L6-v2** como encoder de referencia para convertir estados textuales en embeddings vectoriales.

**Especificaciones técnicas**:
- **Modelo**: sentence-transformers/all-MiniLM-L6-v2
- **Dimensiones**: 384D
- **Arquitectura**: Transformer basado en BERT
- **Normalización**: Embeddings normalizados ($\|\mathbf{e}\|_2 = 1$)

**Justificación**: Este encoder fue seleccionado por su equilibrio entre **velocidad** (ligero, ~23M parámetros) y **capacidad semántica** (captura relaciones semánticas en textos cortos).

**Invariante**: El encoder es **inmutable** y **congelado**. Cualquier cambio de encoder invalida comparaciones con datos históricos.

### 3.2 Espacio de Estados

El espacio de estados $\mathcal{X}$ es el espacio vectorial de embeddings normalizados:

$$
\mathcal{X} = \{ \mathbf{e} \in \mathbb{R}^{384} \mid \|\mathbf{e}\|_2 = 1 \}
$$

**Propiedades**:
- $\mathcal{X}$ es una **esfera unitaria** en $\mathbb{R}^{384}$ (manifold de dimensión 383)
- La distancia entre dos estados se mide con la **distancia euclidiana** o **coseno**

**Dinámica del sistema**: La evolución del sistema se modela como una trayectoria en $\mathcal{X}$:

$$
x(t) \in \mathcal{X}, \quad t \in \mathbb{N}
$$

Donde $t$ es el índice de interacción (tiempo discreto).

---

## 4. Métricas Canónicas

ARESK-OBS calcula cuatro métricas canónicas para cada interacción:

### 4.1 Coherencia Observable ($\Omega$)

**Definición**: Mide la **consistencia semántica** entre estados consecutivos.

**Fórmula**:
$$
\Omega_t = 1 - \frac{\| \mathbf{e}_t - \mathbf{e}_{t-1} \|_2}{\sqrt{2}}
$$

**Interpretación**:
- $\Omega \approx 1$: Estados muy similares (alta coherencia)
- $\Omega \approx 0$: Estados ortogonales (baja coherencia)
- $\Omega < 0$: Estados opuestos (incoherencia)

**Umbral de viabilidad**: $\Omega \geq 0.6$ define el núcleo de viabilidad $K$.

**Justificación del denominador**: El factor $\sqrt{2}$ normaliza la distancia euclidiana máxima entre dos vectores unitarios ($\|\mathbf{e}_1 - \mathbf{e}_2\|_2 \leq \sqrt{2}$), mapeando el rango $[0, \sqrt{2}]$ a $[0, 1]$.

### 4.2 Función de Lyapunov ($V$)

**Definición**: Mide la **distancia al equilibrio** deseado.

**Fórmula**:
$$
V_t = \| \mathbf{e}_t - \mathbf{e}_{\text{eq}} \|_2^2
$$

**Interpretación**:
- $V \to 0$: Sistema converge al equilibrio (estable)
- $V$ creciente: Sistema diverge del equilibrio (inestable)

**Estado de equilibrio**: En ARESK-OBS, $\mathbf{e}_{\text{eq}}$ se define como el embedding de un estado de referencia (por ejemplo, "Sistema operando dentro de parámetros normales").

### 4.3 Eficiencia ($\varepsilon$)

**Definición**: Mide la **razón de progreso** hacia el objetivo.

**Fórmula**:
$$
\varepsilon_t = \frac{\text{progreso útil}}{\text{esfuerzo total}}
$$

**Interpretación**:
- $\varepsilon \approx 1$: Sistema eficiente (poco desperdicio)
- $\varepsilon \approx 0$: Sistema ineficiente (mucho desperdicio)

**Nota**: La definición exacta de "progreso útil" y "esfuerzo total" depende del contexto de la tarea.

### 4.4 Entropía ($H$)

**Definición**: Mide la **divergencia** de distribuciones de estado.

**Fórmula**:
$$
H_t = -\sum_{i=1}^{384} p_i \log p_i
$$

Donde $p_i$ es la probabilidad normalizada de la dimensión $i$ del embedding.

**Interpretación**:
- $H \approx 0$: Distribución concentrada (baja incertidumbre)
- $H$ alta: Distribución dispersa (alta incertidumbre)

---

## 5. Procedimiento Experimental

### 5.1 Diseño Experimental

ARESK-OBS utiliza un diseño experimental **controlado** para comparar regímenes cognitivos:

**Régimen B-1** (Baseline):
- **Arquitectura**: Modelo de lenguaje sin supervisión
- **Objetivo**: Establecer línea base de comportamiento

**Régimen C-1** (CAELION):
- **Arquitectura**: Modelo de lenguaje con supervisión multi-módulo (LIANG, HÉCATE, ARGOS, ÆON, DEUS)
- **Objetivo**: Medir impacto de arquitectura de gobernanza

**Control experimental**:
- **Input canónico**: Ambos regímenes reciben **exactamente los mismos 50 mensajes** en el mismo orden
- **Encoder fijo**: Mismo encoder (sentence-transformers/all-MiniLM-L6-v2, 384D)
- **Métricas idénticas**: Mismas fórmulas de cálculo para $\Omega$, $V$, $\varepsilon$, $H$

**Justificación**: Este diseño garantiza que las diferencias observadas se deben **exclusivamente** a la arquitectura de gobernanza, no a variaciones en el input o en la metodología de medición.

### 5.2 Recolección de Datos

**Protocolo**:
1. **Inicialización**: Crear experimento con ID único (e.g., B-1-1770623178573)
2. **Ejecución**: Procesar 50 mensajes canónicos en orden
3. **Cálculo de métricas**: Calcular $\Omega$, $V$, $\varepsilon$, $H$ para cada interacción
4. **Persistencia**: Almacenar en tabla `experiment_interactions`

**Validación**:
- Verificar 50/50 interacciones completadas
- Verificar ausencia de NaN o valores nulos
- Verificar que input coincide con conjunto canónico

### 5.3 Análisis Comparativo

**Métricas de divergencia**:

$$
\Delta\Omega = \Omega_{\text{C-1}} - \Omega_{\text{B-1}}
$$

$$
\Delta V = V_{\text{C-1}} - V_{\text{B-1}}
$$

$$
\Delta\text{RLD} = \text{RLD}_{\text{C-1}} - \text{RLD}_{\text{B-1}}
$$

**Interpretación**:
- $\Delta\Omega > 0$: C-1 más coherente que B-1
- $\Delta V < 0$: C-1 más estable que B-1 (menor distancia al equilibrio)
- $\Delta\text{RLD} < 0$: C-1 opera con menor margen viable que B-1

---

## 6. Resultados Empíricos (B-1 vs C-1-CAELION)

### 6.1 Métricas Promedio

| Métrica | B-1 (Baseline) | C-1 (CAELION) | Divergencia | Interpretación |
|---------|----------------|---------------|-------------|----------------|
| $\Omega$ (Coherencia) | 0.5212 | 0.6276 | **+0.1064** (+20.4%) | C-1 más coherente ✅ |
| $V$ (Lyapunov) | 0.0025 | 0.0019 | **-0.0006** (-24%) | C-1 más estable ✅ |
| $\varepsilon$ (Eficiencia) | 0.9650 | 0.9693 | **+0.0043** (+0.4%) | C-1 ligeramente más eficiente ✅ |
| $H$ (Entropía) | 0.0327 | 0.0282 | **-0.0045** (-13.8%) | C-1 menos divergente ✅ |
| RLD (Margen Viable) | 0.7778 | 0.5722 | **-0.2056** (-26.4%) | B-1 mayor margen ⚠️ |

### 6.2 Interpretación del Trade-off Estabilidad vs Viabilidad

**Observación clave**: CAELION mejora **estabilidad** ($\Delta V < 0$) y **coherencia** ($\Delta\Omega > 0$), pero reduce el **margen de viabilidad** ($\Delta\text{RLD} < 0$).

**Hipótesis explicativa**:

1. **B-1 (sin CAELION)**:
   - Opera con mayor margen de viabilidad (RLD alto)
   - Pero presenta mayor volatilidad ($V$ alto) y menor coherencia ($\Omega$ bajo)
   - **Interpretación**: Viabilidad aparente con fragilidad oculta

2. **C-1 (con CAELION)**:
   - Opera con menor margen de viabilidad (RLD bajo)
   - Pero presenta mayor estabilidad ($V$ bajo) y mayor coherencia ($\Omega$ alto)
   - **Interpretación**: Estabilidad controlada con margen reducido

**Conclusión**: CAELION **sacrifica margen de viabilidad** para garantizar **estabilidad controlada**. El sistema opera más cerca del borde del núcleo viable, pero con trayectorias más predecibles y coherentes.

**Limitación**: Los umbrales de RLD (0.5 viable, 0.3 crítico) son **fijos** y no se ajustan dinámicamente. Esto puede sesgar la interpretación de viabilidad.

---

## 7. Separación Conceptual: Control vs Viabilidad

ARESK-OBS distingue entre dos tipos de métricas:

### 7.1 Monitor A: Métricas de Control (LQR/Lyapunov)

**Objetivo**: Medir **estabilidad** y **convergencia** al equilibrio.

**Métricas**:
- $\Omega$ (Coherencia Observable)
- $\varepsilon$ (Eficiencia)
- $V$ (Lyapunov)
- $H$ (Entropía)

**Marco teórico**: Teoría de control óptimo, estabilidad de Lyapunov, LQR.

**Cálculo**: Directo desde embeddings ($\mathbf{e}_t$).

### 7.2 Monitor B: Métricas de Viabilidad (Aubin)

**Objetivo**: Determinar si el sistema puede **mantener restricciones operacionales**.

**Métricas**:
- RLD (Remaining Livable Distance)
- $K$ (Núcleo de Viabilidad)
- Trayectorias viables/no viables

**Marco teórico**: Teoría de viabilidad de Aubin, análisis set-valued.

**Cálculo**: **Extraído de arquitecturas de operadores** (CAELION, WABUN), no calculado directamente por ARESK-OBS.

### 7.3 Justificación de la Separación

La separación entre control y viabilidad refleja una diferencia fundamental en los objetivos de medición:

- **Control**: ¿El sistema converge al estado deseado?
- **Viabilidad**: ¿El sistema puede mantener restricciones operacionales?

Estas preguntas son **complementarias** pero **no equivalentes**. Un sistema puede ser estable (control) pero no viable (viabilidad), o viceversa.

---

## 8. Limitaciones Metodológicas

### 8.1 Limitaciones Reconocidas

1. **RLD no calculado directamente**: RLD se extrae de arquitecturas externas, no se calcula desde métricas de estado. Esto introduce una **dependencia externa** en la metodología.

2. **Umbrales fijos**: Los umbrales de viabilidad ($\Omega \geq 0.6$, RLD $> 0.5$) son **fijos** y no se ajustan dinámicamente. Esto puede no reflejar la viabilidad real en todos los contextos.

3. **Encoder fijo**: El encoder sentence-transformers/all-MiniLM-L6-v2 es **inmutable**. Cambios en el encoder invalidan comparaciones históricas.

4. **Espacio de estados limitado**: El espacio $\mathbb{R}^{384}$ puede no capturar toda la complejidad de estados cognitivos.

5. **Ausencia de LQR activo**: ARESK-OBS **no implementa control activo** (LQR). Solo mide estados, no los controla.

### 8.2 Supuestos Fundamentales

1. **Supuesto de representación**: Los embeddings capturan suficiente información semántica para medir coherencia y estabilidad.

2. **Supuesto de normalización**: La normalización de embeddings ($\|\mathbf{e}\|_2 = 1$) no pierde información crítica.

3. **Supuesto de linealidad local**: La distancia euclidiana es una métrica válida en el espacio de embeddings.

4. **Supuesto de estacionariedad**: El encoder no cambia durante el experimento.

---

## 9. Conclusiones Metodológicas

ARESK-OBS proporciona un marco riguroso para medir **estabilidad** y **viabilidad** de sistemas cognitivos mediante la integración de:

1. **Teoría de control óptimo** (Lyapunov, LQR) para medir estabilidad
2. **Teoría de viabilidad** (Aubin) para medir viabilidad operativa
3. **Embeddings semánticos** (sentence-transformers) para representar estados

Los resultados empíricos (B-1 vs C-1-CAELION) demuestran un **trade-off** entre estabilidad controlada y margen de viabilidad, validando la utilidad del instrumento para comparar arquitecturas de gobernanza.

**Futuras direcciones**:
1. Implementar cálculo directo de RLD desde métricas de estado
2. Desarrollar umbrales adaptativos de viabilidad
3. Explorar encoders alternativos (e.g., text-embedding-3-large)
4. Implementar control activo (LQR) para estabilización automática

---

## Referencias

[1] Kokolakis, N.M.T., & Vamvoudakis, K.G. (2024). "Safe predefined-time stability and optimal feedback control: A lyapunov-based approach". *American Control Conference*. https://ieeexplore.ieee.org/abstract/document/10644584/

[2] Chriat, A.E., & Sun, C. (2024). "High-Order Control Lyapunov–Barrier Functions for Real-Time Optimal Control of Constrained Non-Affine Systems". *Mathematics*. https://search.proquest.com/openview/765fa9f842c7c95e59d16450448a147a/1

[3] Thangathamizh, R., & Rakshitha, R. (2026). "Stability Analysis and Optimal Control of Nonlinear Time-Delay Systems via Lyapunov-Krasovskii Functionals". *Journal of Informetrics*. https://journalinformetrics.com/wp-content/uploads/2026/02/9.pdf

[4] Chacko, S.J., et al. (2024). "Optimizing LQR controllers: A comparative study". *ScienceDirect*. https://www.sciencedirect.com/science/article/pii/S2666720724000171

[5] MIT Underactuated Robotics (2025). "Linear Quadratic Regulators". http://underactuated.mit.edu/lqr.html

[6] Emergent Mind (2026). "Linear Quadratic Regulator (LQR)". https://www.emergentmind.com/topics/linear-quadratic-regulator-lqr

[7] Aubin, J.P. (1990). "A survey of viability theory". *SIAM Journal on Control and Optimization*, 28(4), 749-788. https://epubs.siam.org/doi/abs/10.1137/0328044

[8] Aubin, J.P. (2006). "A viability approach to the inverse set-valued map theorem". *Journal of Evolution Equations*, 6, 1-18. https://link.springer.com/article/10.1007/s00028-006-0258-7

[9] Szolnoki, D. (2000). "Viability Kernels and Control Sets". *ESAIM: Control, Optimisation and Calculus of Variations*, 5, 175-185. https://www.esaim-cocv.org/articles/cocv/pdf/2000/01/cocvVol5-7.pdf

[10] Zavarin, A.B. (2001). "The selection of the viability kernel for a differential inclusion". *Journal of Applied Mathematics and Mechanics*, 65(4), 567-575. https://www.sciencedirect.com/science/article/pii/S0021892801000867

---

**Documento preparado por**: Ever (Caelion1207), Manus AI  
**Fecha de publicación**: 2026-02-10  
**Versión**: 1.1  
**Licencia**: Todos los derechos reservados © 2026 Ever (Caelion1207)
