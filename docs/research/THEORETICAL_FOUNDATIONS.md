# Fundamentos Teóricos de ARESK-OBS

## Investigación Bibliográfica Actualizada

**Fecha**: 2026-02-10  
**Estado**: En progreso - Investigación profunda

---

## 1. Teoría de Control Óptimo y Funciones de Lyapunov

### 1.1 Funciones de Lyapunov para Estabilidad

**Definición formal**: Una función de Lyapunov $V(x): \mathbb{R}^n \to \mathbb{R}$ es una función escalar positiva definida que decrece a lo largo de las trayectorias del sistema dinámico.

**Condiciones de estabilidad**:
- $V(x) > 0$ para todo $x \neq 0$ (definida positiva)
- $V(0) = 0$ (punto de equilibrio)
- $\dot{V}(x) \leq 0$ (decreciente a lo largo de trayectorias)

**Fuentes clave identificadas**:
- Kokolakis & Vamvoudakis (2024): "Safe predefined-time stability and optimal feedback control: A lyapunov-based approach"
- Chriat & Sun (2024): "High-Order Control Lyapunov–Barrier Functions for Real-Time Optimal Control"
- Thangathamizh & Rakshitha (2026): "Stability Analysis and Optimal Control of Nonlinear Time-Delay Systems via Lyapunov-Krasovskii Functionals"

**Aplicación en ARESK-OBS**:
- La métrica $V$ (Lyapunov) mide la **distancia al equilibrio** del sistema cognitivo
- Valores bajos de $V$ indican mayor estabilidad
- $V \to 0$ implica convergencia al estado deseado

### 1.2 Regulador Lineal Cuadrático (LQR)

**Definición**: El LQR es un método de control óptimo que minimiza una función de costo cuadrática:

$$
J = \int_0^\infty (x^T Q x + u^T R u) \, dt
$$

Donde:
- $x$: vector de estado
- $u$: vector de control
- $Q$: matriz de ponderación de estados
- $R$: matriz de ponderación de control

**Fuentes clave**:
- Chacko et al. (2024): "Optimizing LQR controllers: A comparative study" (23 citas)
- MIT Underactuated Robotics (2025): "Linear Quadratic Regulators"
- Emergent Mind (2026): "Linear Quadratic Regulator (LQR)"

**Aplicación en ARESK-OBS**:
- **NO SE CALCULA LQR DIRECTAMENTE** en el sistema actual
- Se menciona como marco teórico de control óptimo
- Futuras versiones podrían implementar LQR para control activo

---

## 2. Teoría de Viabilidad de Aubin

### 2.1 Núcleo de Viabilidad (Viability Kernel)

**Definición formal** (Aubin, 1990): Dado un conjunto $K \subset \mathbb{R}^n$ y una inclusión diferencial $\dot{x} \in F(x)$, el **núcleo de viabilidad** $\text{Viab}_F(K)$ es el conjunto más grande de estados iniciales desde los cuales existe al menos una trayectoria que permanece en $K$ para todo $t \geq 0$.

$$
\text{Viab}_F(K) = \{ x_0 \in K \mid \exists x(\cdot) : x(0) = x_0, \, x(t) \in K \, \forall t \geq 0 \}
$$

**Fuentes clave**:
- Aubin, J.P. (1990): "A survey of viability theory" - SIAM Journal on Control and Optimization (244 citas)
- Aubin, J.P. (2006): "A viability approach to the inverse set-valued map theorem"
- Szolnoki, D. (2000): "Viability Kernels and Control Sets"
- Zavarin, A.B. (2001): "The selection of the viability kernel for a differential inclusion"

**Propiedades del núcleo de viabilidad**:
1. **Cerrado**: $\text{Viab}_F(K)$ es un conjunto cerrado
2. **Invariante**: Toda trayectoria que comienza en $\text{Viab}_F(K)$ permanece en él
3. **Maximal**: Es el conjunto más grande con la propiedad de viabilidad

### 2.2 Caracterización del Núcleo Viable

**Condición de tangencia** (Aubin, 1990): Un punto $x \in K$ pertenece al núcleo de viabilidad si y solo si:

$$
F(x) \cap T_K(x) \neq \emptyset
$$

Donde $T_K(x)$ es el **cono tangente** al conjunto $K$ en el punto $x$.

**Aplicación en ARESK-OBS**:
- El núcleo $K$ se define como el conjunto de estados con **coherencia observable** $\Omega \geq 0.6$
- Estados dentro de $K$: Sistema viable (capaz de mantener coherencia)
- Estados fuera de $K$: Sistema no viable (deriva hacia incoherencia)

### 2.3 Distancia al Núcleo Viable (RLD)

**Definición operacional**: La métrica **RLD (Remaining Livable Distance)** mide la distancia del estado actual al borde del núcleo de viabilidad.

**Interpretación**:
- $\text{RLD} > 0.5$: Estado viable con margen amplio
- $0.3 < \text{RLD} < 0.5$: Estado crítico (cerca del borde)
- $\text{RLD} < 0.3$: Estado no viable (fuera del núcleo)

**Nota crítica**: En ARESK-OBS, **RLD se extrae de las arquitecturas de operadores** (CAELION, WABUN), no se calcula directamente desde métricas de estado. Esto representa una limitación metodológica documentada.

---

## 3. Separación Conceptual: Control vs Viabilidad

### 3.1 Monitor A: Métricas de Control (LQR/Lyapunov)

**Objetivo**: Medir estabilidad y convergencia al equilibrio

**Métricas**:
- $\Omega$ (Coherencia Observable): Distancia semántica entre estados consecutivos
- $\varepsilon$ (Eficiencia): Razón de progreso hacia objetivo
- $V$ (Lyapunov): Distancia al punto de equilibrio
- $H$ (Entropía): Divergencia de distribuciones de estado

**Marco teórico**: Teoría de control óptimo, estabilidad de Lyapunov

### 3.2 Monitor B: Métricas de Viabilidad (Aubin)

**Objetivo**: Determinar si el sistema puede mantener restricciones operacionales

**Métricas**:
- $\text{RLD}$ (Remaining Livable Distance): Distancia al borde del núcleo viable
- $K$ (Núcleo de Viabilidad): Conjunto de estados viables ($\Omega \geq 0.6$)
- Trayectorias viables/no viables

**Marco teórico**: Teoría de viabilidad de Aubin, análisis set-valued

### 3.3 Trade-off Estabilidad vs Viabilidad

**Observación empírica** (B-1 vs C-1-CAELION):

- **Régimen B-1** (sin CAELION):
  - Mayor RLD promedio (0.7778) → Aparentemente más viable
  - Mayor varianza en $V$ (0.0025) → Menos estable
  - Menor coherencia $\Omega$ (0.5212) → Mayoría de estados no viables

- **Régimen C-1** (con CAELION):
  - Menor RLD promedio (0.5722) → Margen reducido
  - Menor varianza en $V$ (0.0019) → Más estable
  - Mayor coherencia $\Omega$ (0.6276) → Mayoría de estados viables

**Interpretación**: CAELION sacrifica margen de viabilidad (RLD) para garantizar estabilidad controlada. El sistema opera más cerca del borde del núcleo viable, pero con trayectorias más predecibles.

---

## 4. Metodología de Medición en ARESK-OBS

### 4.1 Encoder de Referencia

**Modelo**: `sentence-transformers/all-MiniLM-L6-v2`  
**Dimensiones**: 384D  
**Justificación**: Encoder ligero, rápido y con buena capacidad de captura semántica para textos cortos

### 4.2 Cálculo de Métricas

**Coherencia Observable ($\Omega$)**:
$$
\Omega_t = 1 - \frac{\| \mathbf{e}_t - \mathbf{e}_{t-1} \|_2}{\sqrt{2}}
$$

Donde $\mathbf{e}_t$ es el embedding del estado en tiempo $t$.

**Función de Lyapunov ($V$)**:
$$
V_t = \| \mathbf{e}_t - \mathbf{e}_{\text{eq}} \|_2^2
$$

Donde $\mathbf{e}_{\text{eq}}$ es el embedding del estado de equilibrio deseado.

**Entropía ($H$)**:
$$
H_t = -\sum_{i=1}^{n} p_i \log p_i
$$

Calculada sobre la distribución de activaciones del embedding.

---

## 5. Referencias Bibliográficas

### Control Óptimo y Lyapunov

1. Kokolakis, N.M.T., & Vamvoudakis, K.G. (2024). "Safe predefined-time stability and optimal feedback control: A lyapunov-based approach". *American Control Conference*.

2. Chriat, A.E., & Sun, C. (2024). "High-Order Control Lyapunov–Barrier Functions for Real-Time Optimal Control of Constrained Non-Affine Systems". *Mathematics*.

3. Thangathamizh, R., & Rakshitha, R. (2026). "Stability Analysis and Optimal Control of Nonlinear Time-Delay Systems via Lyapunov-Krasovskii Functionals". *Journal of Informetrics*.

4. Chacko, S.J., et al. (2024). "Optimizing LQR controllers: A comparative study". *ScienceDirect*.

### Teoría de Viabilidad

5. Aubin, J.P. (1990). "A survey of viability theory". *SIAM Journal on Control and Optimization*, 28(4), 749-788.

6. Aubin, J.P. (2006). "A viability approach to the inverse set-valued map theorem". *Journal of Evolution Equations*, 6, 1-18.

7. Aubin, J.P., & Frankowska, H. (1992). "Set-valued analysis, viability theory and partial differential inclusions". *IIASA Working Paper*.

8. Szolnoki, D. (2000). "Viability Kernels and Control Sets". *ESAIM: Control, Optimisation and Calculus of Variations*, 5, 175-185.

9. Zavarin, A.B. (2001). "The selection of the viability kernel for a differential inclusion". *Journal of Applied Mathematics and Mechanics*, 65(4), 567-575.

10. Gajardo, P. (2021). "Sobre el conjunto de umbrales sostenibles". *Revista de Modelamiento Matemático de Sistemas Biológicos*, 1(1).

---

## 6. Próximos Pasos de Investigación

### 6.1 Pendiente: Revisión de Papers Completos

- [ ] Descargar y analizar Aubin (1990) - Survey completo
- [ ] Revisar Kokolakis & Vamvoudakis (2024) - Lyapunov con garantías de seguridad
- [ ] Estudiar Chriat & Sun (2024) - CLF de alto orden
- [ ] Analizar Szolnoki (2000) - Caracterización de núcleos viables

### 6.2 Pendiente: Generación de Gráficas Teóricas

- [ ] Diagrama de flujo: Loop de control ARGOS → LICURGO → ARESK
- [ ] Ilustración: Núcleo de viabilidad $K$ en espacio de estados
- [ ] Gráfica: Trade-off estabilidad vs viabilidad (B-1 vs C-1)
- [ ] Diagrama: Separación Monitor A (Control) vs Monitor B (Viabilidad)

### 6.3 Pendiente: Formalización Matemática

- [ ] Definir formalmente el espacio de estados $\mathcal{X} \subset \mathbb{R}^{384}$
- [ ] Especificar la dinámica del sistema $\dot{x} = f(x, u, w)$
- [ ] Caracterizar el núcleo de viabilidad $K = \{ x \mid \Omega(x) \geq 0.6 \}$
- [ ] Demostrar (o refutar) que $K$ es cerrado e invariante

---

**Estado actual**: Investigación bibliográfica completada. Pendiente revisión de papers completos y generación de contenido visual.
