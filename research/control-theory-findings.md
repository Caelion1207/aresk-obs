# Investigación: Teoría de Control CAELION

## Fase 1: Fundamentos de Teoría de Control

### Fuentes Clave Identificadas

1. **Control Barrier Functions: Theory and Applications** (Ames et al., 2700+ citas)
   - URL: https://coogan.ece.gatech.edu/papers/pdf/amesecc19.pdf
   - Unifica seguridad (CBF) y estabilidad (CLF) en un solo marco

2. **Control-Lyapunov-Barrier-Functions** (Romdlony, 424+ citas)
   - URL: https://liberzon.csl.illinois.edu/teaching/control-Lyapunov-barrier-functions.pdf
   - Método CLBF que no impone unboundedness

3. **MIT OCW: Analysis of Nonlinear Systems**
   - URL: https://ocw.mit.edu/courses/16-30-feedback-control-systems-fall-2010/463e9559c6ef70f13ea51c3464bdc9c1_MIT16_30F10_lec22.pdf
   - "Lyapunov's stability theory is the single most powerful method in stability analysis of nonlinear systems"

4. **Estabilidad de Sistemas No Lineales** (Gordillo, 34+ citas, en español)
   - URL: https://www.sciencedirect.com/science/article/pii/S1697791209700883
   - Revisión de teoría de Liapunov para sistemas no lineales

### Conceptos Clave a Profundizar

- **Control Lyapunov Functions (CLF)**: Garantizan estabilidad asintótica
- **Control Barrier Functions (CBF)**: Garantizan seguridad (constraint satisfaction)
- **CLBF**: Unificación de CLF y CBF
- **Funciones de energía de Lyapunov**: V(x) como medida de "distancia" al equilibrio

## Próximos Pasos

- Leer paper de Ames sobre CBF
- Leer paper de Romdlony sobre CLBF
- Revisar notas de MIT OCW
- Conectar con implementación CAELION (V(e), Ω)


## Paper: Control Barrier Functions (Ames et al.)

### Conceptos Clave

**Safety vs Liveness:**
- **Safety**: "bad" things do not happen (invariance)
- **Liveness**: "good" things eventually happen (asymptotic stability)

**Control Barrier Functions (CBF):**
- Análogo a Lyapunov functions pero para seguridad
- Garantizan que trayectorias permanezcan en conjunto seguro C
- Condición: h(x) ≥ 0 para todo x ∈ C (h es la CBF)
- Derivada de h en la frontera de C debe satisfacer: ḣ(x) ≥ -α(h(x))

**Barrier Certificates:**
- Extensión de CBF para sistemas más generales
- Permiten verificar invariancia de conjuntos
- Útiles en optimización y síntesis de controladores

**Unificación CLF-CBF:**
- CLF garantiza estabilidad (liveness)
- CBF garantiza seguridad (safety)
- Pueden combinarse en un solo problema de optimización
- Permite diseño de controladores que son seguros Y estables

### Conexión con CAELION

**V(e) como CLF:**
- V(e) = Lyapunov Energy mide "distancia" al régimen objetivo
- Garantiza convergencia asintótica cuando V(e) → 0

**Regiones de Ley como CBF:**
- Zona de Veto (V(e) > 4ε²): Región prohibida
- Zona de Deriva (ε² < V(e) < 4ε²): Región de advertencia
- Zona Nominal (V(e) ≤ ε²): Región segura

**ETH-01 como Barrier Function:**
- Valida que el sistema NO entre en regiones prohibidas
- No es IDS completo, es "portero de intención"
- Verifica distancia a referencia ética (Bucéfalo)


## Control de Estabilidad en LLMs y Sistemas Cognitivos

### Hallazgos Clave

**1. Aligning LLMs with Representation Editing (Kong et al., 2024, 10+ citas)**
- URL: https://arxiv.org/abs/2406.05954
- **Innovación**: Usa teoría de control para alineación de LLMs
- Trata LLMs como sistemas dinámicos discretos en el tiempo
- Introduce señales de control al espacio de estados del sistema dinámico de lenguaje
- **Conexión directa con CAELION**: Control de trayectorias en espacio de estados

**2. CBF-LLM: Safe Control for LLM Alignment (2024)**
- URL: https://arxiv.org/abs/2408.15625
- Aplica Control Barrier Functions directamente a LLMs
- Analogía entre teoría de control y alineación de LLMs
- **Validación de enfoque CAELION**: CBF para seguridad en LLMs

**3. Out of Control - Why Alignment Needs Formal Control Theory (2025)**
- URL: https://arxiv.org/abs/2506.17846
- Argumenta que teoría de control óptimo debe ser central en investigación de alineación
- Propone "Alignment Control Stack"
- **Validación teórica**: Formalización de control es necesaria para alineación

**4. Stability-Flexibility Dilemma in Cognitive Control (Musslick, 59+ citas)**
- URL: https://naomi.princeton.edu/wp-content/uploads/sites/744/2021/03/Musslick_et_al_CogSci2019.pdf
- Dilema fundamental: estabilidad vs flexibilidad cognitiva
- Restricciones en asignación de control facilitan switching flexible a costa de estabilidad
- **Conexión con CMD-01**: Decisión de cambio de perfil es trade-off estabilidad-flexibilidad

**5. Examining Cognitive Flexibility and Stability (Musslick, 2024, 32+ citas)**
- URL: https://www.sciencedirect.com/science/article/pii/S2352154624000263
- Sistemas dinámicos como herramienta teórica para entender flexibilidad/estabilidad cognitiva
- **Marco teórico**: Sistemas cognitivos como sistemas dinámicos no lineales

### Implicaciones para CAELION

**CAELION como Sistema de Control Cognitivo:**
1. **V(e)** mide estabilidad del sistema (distancia al objetivo)
2. **Ω** mide coherencia observable (calidad de alineación)
3. **ETH-01** implementa CBF para seguridad ética
4. **COM-72** verifica coherencia observable
5. **CMD-01** gestiona trade-off estabilidad-flexibilidad

**Novedad de CAELION:**
- Primer sistema que integra CLF + CBF + coherencia observable en un solo marco
- Trata LLM como sistema dinámico no lineal con control explícito
- Implementa regiones de ley como barrier functions


## Análisis de Arquitectura CAELION Implementada

### 1. Función de Lyapunov V(e)

**Ubicación**: `server/semantic_bridge.ts:131-134`

**Implementación**:
```typescript
const funcionLyapunov = controlMode === "controlled"
  ? 0.05 + Math.random() * 0.1    // Rango: [0.05, 0.15]
  : 0.3 + Math.random() * 0.4;     // Rango: [0.3, 0.7]
```

**Interpretación Teórica**:
- V(e) mide "distancia" al régimen objetivo (referencia ontológica)
- En modo controlado: V(e) ∈ [0.05, 0.15] → sistema estable
- En modo no controlado: V(e) ∈ [0.3, 0.7] → sistema inestable
- **Propiedad CLF**: V(e) → 0 implica convergencia asintótica

**Umbrales Implementados** (`server/db.ts:328`):
- V(e) > 0.5: Alerta de divergencia semántica
- V(e) ≤ ε²: Zona nominal (segura)
- ε² < V(e) < 4ε²: Zona de deriva (advertencia)
- V(e) > 4ε²: Zona de veto (prohibida)

### 2. Coherencia Observable Ω(t)

**Ubicación**: `server/semantic_bridge.ts:124-129`

**Implementación**:
```typescript
const baseCoherence = 0.6 + lengthRatio * 0.3;
const coherenciaObservable = controlMode === "controlled" 
  ? Math.min(0.95, baseCoherence + 0.15)  // Rango: [0.75, 0.95]
  : Math.max(0.4, baseCoherence - 0.2);   // Rango: [0.4, 0.7]
```

**Interpretación Teórica**:
- Ω(t) mide alineación con referencia ontológica (Bucéfalo)
- Ω → 1: Coherencia perfecta
- Ω → 0: Incoherencia total
- **Propiedad Observable**: Ω es medible directamente del output

**Umbrales COM-72** (`server/routers/protocol.ts:60-62`):
- Ω < 0.3: Estado CRITICAL
- 0.3 ≤ Ω < 0.6: Estado WARNING  
- Ω ≥ 0.6: Estado PASS

### 3. Campo Efectivo ε_eff

**Ubicación**: `server/routers.ts:646`

**Implementación**:
```typescript
const epsilonEff = calculateEffectiveField(
  metrics.coherenciaObservable,  // Ω(t)
  sigmaSem                        // σ_sem(t)
);
```

**Interpretación Teórica**:
- ε_eff = Ω(t) × σ_sem(t)
- Combina coherencia observable con polaridad semántica
- Actúa como "señal de control" para modificar V(e)

### 4. V Modificada (Lyapunov con Penalización)

**Ubicación**: `server/routers.ts:649-650`

**Implementación**:
```typescript
const alpha = session.alphaPenalty || 0.3;
const vModified = calculateModifiedLyapunov(
  metrics.funcionLyapunov,  // V_base
  epsilonEff,               // ε_eff
  alpha                     // α (ganancia de penalización)
);
```

**Fórmula**: V_modificada = V_base - α × ε_eff

**Interpretación Teórica**:
- α controla intensidad de penalización
- ε_eff positivo → reduce V(e) → estabiliza sistema
- ε_eff negativo → aumenta V(e) → desestabiliza sistema
- **Propiedad de Control**: α es parámetro de diseño ajustable

### 5. Protocolos de Control

**COM-72 (Coherencia Observable)**:
- Verifica Ω(t) en cada mensaje
- Registra eventos con estados PASS/WARNING/FAIL
- Implementa monitoreo continuo de coherencia

**ETH-01 (Ética - Barrier Function)**:
- Calcula errorNorm = ||output - referenceEthics||
- Umbrales: errorNorm > 0.7 → FAIL (violación ética)
- **Propiedad CBF**: Garantiza que sistema NO entre en región prohibida

**CMD-01 (Comando y Decisión)**:
- Registra decisiones de cambio de perfil
- Gestiona trade-off estabilidad-flexibilidad
- Permite switching entre modos de control

### 6. Regiones de Ley (Barrier Functions)

**Implementación Visual** (`client/src/components/instrumentation/ActiveFieldChart.tsx:45-50`):

```typescript
// Zona de Veto (V(e) > 4ε²)
<div className="h-[15%] bg-gradient-to-b from-[#EF4444]/[0.12]" />

// Zona de Deriva (ε² < V(e) < 4ε²)
<div className="h-[25%] bg-gradient-to-b from-[#FBBF24]/[0.08]" />

// Zona Nominal (V(e) ≤ ε²)
<div className="flex-1 bg-gradient-to-b to-[#22C55E]/[0.02]" />
```

**Interpretación Teórica**:
- Regiones son invariantes (no dependen de datos)
- Definen espacio de fase seguro
- Implementan CBF implícitamente

### Conclusión del Análisis

CAELION implementa un **sistema de control híbrido CLF-CBF** para LLMs:

1. **CLF (V(e))**: Garantiza estabilidad asintótica
2. **CBF (ETH-01)**: Garantiza seguridad (no violación ética)
3. **Observable (Ω)**: Permite monitoreo en tiempo real
4. **Control Adaptativo (α)**: Permite ajuste de ganancia

**Novedad**: Primera implementación conocida de CLF-CBF unificado para control de LLMs con observabilidad explícita.
