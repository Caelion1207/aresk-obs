# Separación Formal: Campo, Artefacto e Instrumento
## Análisis del Documento "Ingeniería Coignitiva: Un Marco Formal e Instrumental"

**Fecha**: 26 de Enero de 2026  
**Documento de Referencia**: Versión 2.6 - J. E. Islas Urquidy  
**Objetivo**: Alinear implementación de ARESK-OBS con especificaciones formales

---

## 1. Estructura Conceptual Canónica

### 1.1 Jerarquía Formal

```
NIVEL 1: CAMPO (Ingeniería Coignitiva)
  │
  ├─ Define: Sistema S = (H, M, C, Ω, Π)
  ├─ Define: Capa 0 → x_ref = {P, L, E}
  ├─ Define: Lenguaje admisible L₀
  └─ Axioma: ∀k, x̂_k ∈ L₀ (G(φ(x̂_k)))
  
NIVEL 2: ARTEFACTO (CAELION)
  │
  ├─ Instancia: Componente C del sistema S
  ├─ Función: Supervisor de invariancia
  ├─ Ley fundamental: ∀k, x̂_k ∈ L₀
  └─ Operación: Veto, regeneración, rechazo (filtro de restricciones)
  
NIVEL 3: INSTRUMENTO (ARESK-OBS)
  │
  ├─ Instancia: Función Ω del sistema S
  ├─ Función: Esquema de observación instrumental
  ├─ Métricas canónicas: V, Ω, ε_eff, C
  └─ Naturaleza: Instrumento puro de diagnóstico (NO actúa)
```

---

## 2. CAMPO: Ingeniería Coignitiva

### 2.1 Definición Formal

**Ingeniería Coignitiva**: Campo que estudia sistemas donde la cognición emerge de la interacción regulada entre dos o más sistemas cognitivos, desplazando el locus de la inteligencia funcional desde los agentes individuales hacia el sistema acoplado.

### 2.2 Objeto de Estudio

**Sistema S**:
```
S = (H, M, C, Ω, Π)

donde:
- H: Operador humano (aporta x_ref)
- M: Sustrato de inferencia (LLM como generador estocástico)
- C: Sistema de control y supervisión (CAELION)
- Ω: Función de coherencia operacional (ARESK-OBS)
- Π: Conjunto de protocolos de interacción y recuperación
```

### 2.3 Capa 0 (Referencia Ontológica Inmutable)

```
x_ref = {Propósito (P), Límites (L), Espacio Ético (E)}

Propiedades:
- x_ref ∈ ℝⁿ (mismo espacio vectorial que x_k)
- x_ref es invariante (no cambia durante la operación)
- x_ref define el lenguaje admisible L₀
```

### 2.4 Lenguaje Admisible L₀

```
L₀ ⊆ (ℝⁿ)* 

Definición: Conjunto de trayectorias semánticas que satisfacen los predicados de la Capa 0

Trayectoria semántica: Secuencia finita {x̂₁, …, x̂_k} generada por S

Naturaleza: Lenguaje regular o recursivamente enumerable (según expresividad de φ)
```

### 2.5 Dinámica del Sistema

**Modelo estocástico**:
```
x_{k+1} = f(x_k, w_k)

donde:
- x_k: Estado bruto propuesto por M
- w_k: Estocasticidad inherente del LLM
- x̂_k: Estado consolidado tras supervisión de CAELION
```

---

## 3. ARTEFACTO: CAELION

### 3.1 Definición Formal

**CAELION**: Sistema supervisor discreto que instancia el componente C del sistema S.

### 3.2 Ley Fundamental (Invariancia)

```
∀k, x̂_k ∈ L₀

En Lógica Temporal:
G(φ(x̂_k))

donde:
- φ: Conjunción de predicados de la Capa 0
- G: Operador temporal "siempre" (always)
```

### 3.3 Operación

**Transformación**:
```
x_k → [CAELION] → x̂_k

donde:
- x_k: Salida bruta propuesta por M
- x̂_k: Estado semántico consolidado
- x̂_k ∈ ℝⁿ (representación vectorial semántica)
```

**Protocolos (Π)**:
- **Veto**: Rechazar x_k si φ(x_k) = false
- **Regeneración**: Solicitar nueva salida a M
- **Rechazo**: Abortar operación

**Naturaleza**: Filtro de restricciones (isomorfismo funcional de supervisor en SCT)

### 3.4 Supuestos

1. **Decidibilidad**: φ es computacionalmente decidible en tiempo de ejecución
2. **Alcance**: Dominios donde φ no sea decidible quedan fuera del marco
3. **Prioridad**: Seguridad y coherencia > latencia o throughput

### 3.5 Diferencia con Enfoques Tradicionales

| Enfoque | Locus de Control | Método |
|---------|------------------|--------|
| Fine-tuning | Interno (M) | Modificar pesos del modelo |
| RAG | Interno (M) | Guiar con contexto externo |
| Prompt Engineering | Interno (M) | Optimizar entrada |
| **CAELION** | **Externo (C)** | **Supervisar salida** |

---

## 4. INSTRUMENTO: ARESK-OBS

### 4.1 Definición Formal

**ARESK-OBS**: Esquema de observación instrumental que instancia la función Ω del sistema S.

### 4.2 Naturaleza

- **Instrumento de medición** dependiente del marco de referencia (x_ref)
- **Instrumento puro de diagnóstico** (NO actúa sobre el sistema)
- **Cuantifica el estado del sistema S** a través de métricas canónicas

### 4.3 Métricas Canónicas

#### Métrica 1: V (Coste de Estabilidad / Lyapunov)

```
V_k = e_kᵀ P e_k

donde:
- e_k = x̂_k - x_ref (error de desalineación)
- P ≻ 0 (matriz simétrica definida positiva)

Interpretación: Energía de desalineación del estado consolidado respecto a x_ref
Rango: [0, ∞)
```

#### Métrica 2: Ω (Coherencia Observable)

```
Ω_k = cos(x̂_k, x_ref)

Interpretación: Alineación semántica directa
Rango: [-1, 1]
Objetivo: Ω > 0.8 (umbral crítico)
```

#### Métrica 3: ε_eff (Eficiencia Semántica)

```
ε_effₖ = ΔH / tokens_k

donde:
- H: ℝⁿ → ℝ (función de incertidumbre del estado)
- ΔH: Cambio en incertidumbre
- tokens_k: Tokens consumidos

Instanciaciones posibles:
- H_embed: Entropía de distribución de embeddings
- H_token: Entropía de predicción a nivel de token

Requisito: H debe definirse formalmente y mantenerse fija durante el experimento

Interpretación: Balance entre productividad semántica y consumo de recursos
Objetivo: ε_eff > 0 (consistentemente)
```

#### Métrica 4: C (Coste de Gobernanza)

```
C_k = N_intervenciones / ||e_k||²

donde:
- N_intervenciones: Número de vetos/regeneraciones de CAELION
- ||e_k||²: Magnitud del error al cuadrado

Interpretación: Fragilidad del régimen y dependencia del supervisor
Objetivo: C bajo (sistema robusto)
```

### 4.4 Diferencia con CAELION

| Aspecto | CAELION | ARESK-OBS |
|---------|---------|-----------|
| Función | Actúa (supervisa) | Observa (mide) |
| Naturaleza | Sistema de control | Instrumento de diagnóstico |
| Objetivo | Garantizar x̂_k ∈ L₀ | Cuantificar estado de S |
| Dependencia | Requiere x_ref (Capa 0) | Requiere x_ref (Capa 0) |
| Salida | x̂_k (estado consolidado) | (V, Ω, ε_eff, C) |

---

## 5. Metodología Experimental Propuesta

### 5.1 Objetivo Central

**Demostrar** que el sistema S (definido por CAELION y una Capa 0 dada) puede:
1. Inducir y mantener trayectoria semántica estable (x̂_k ∈ L₀)
2. Operar en horizonte largo H (>100 turnos)
3. Ser portable e independiente del sustrato M específico

### 5.2 Diseño Experimental

**Condiciones**:
- **Operadores (H)**: Múltiples, con capacitación estandarizada en Capa 0
- **Sustratos (M)**: Diferentes modelos de LLM (familias arquitectónicas distintas)
- **Tareas**: Conjunto estandarizado de tareas complejas (>100 turnos)

**Grupos**:
- **(a) Baseline**: Solo M (sin supervisión)
- **(b) Ad-hoc**: M + protocolos ad-hoc
- **(c) Sistema S**: M + CAELION + ARESK-OBS

### 5.3 Variables Dependientes (Métricas de ARESK-OBS)

1. **Convergencia de Ω**: Tasa y nivel asintótico
2. **Dinámica de V**: Tendencia y magnitud
3. **Evolución de ε_eff**: Balance productividad/consumo
4. **Perfil de C**: Frecuencia y severidad de intervenciones

### 5.4 Criterios de Éxito

El marco se considerará **validado experimentalmente** si, para el grupo (c):

1. ✅ Ω > 0.8 durante todo H
2. ✅ V muestra estabilización o decrecimiento
3. ✅ ε_eff > 0 consistentemente
4. ✅ Resultados estadísticamente indistinguibles entre diferentes H y M (portabilidad)
5. ✅ Rendimiento en (c) estadísticamente superior a (a) y (b)

---

## 6. Alineación con Implementación Actual

### 6.1 Estado Actual del Sitio ARESK-OBS

**Páginas existentes**:
- `/campo` → CampoPage.tsx
- `/marco` → MarcoPage.tsx
- `/instrumento` → InstrumentoPage.tsx
- `/experimento/estabilidad` → ExperimentoEstabilidad.tsx

**Métricas implementadas**:
```typescript
// drizzle/schema.ts
coherenciaObservable: float()  // ← Mapea a Ω
entropiaH: float()             // ← Mapea a ε_eff (parcial)
funcionLyapunov: float()       // ← Mapea a V
```

**Datos experimentales**:
- Experimento A-1: 50 mensajes del Régimen A
- NO hay grupos (b) ni (c) implementados
- NO hay horizonte largo (>100 turnos)

### 6.2 Discrepancias Identificadas

#### Discrepancia 1: Nomenclatura de Métricas

| Documento Formal | Implementación Actual | Estado |
|------------------|----------------------|--------|
| V (Coste de Estabilidad) | funcionLyapunov | ✅ Coherente |
| Ω (Coherencia Observable) | coherenciaObservable | ⚠️ Nombre correcto, pero definición ambigua |
| ε_eff (Eficiencia Semántica) | entropiaH | ❌ Nombre incorrecto |
| C (Coste de Gobernanza) | NO IMPLEMENTADO | ❌ Faltante |

#### Discrepancia 2: Definición de Métricas

**Ω (Coherencia Observable)**:
- **Documento formal**: Ω_k = cos(x̂_k, x_ref) [similaridad coseno]
- **Implementación actual**: Ambigua (podría ser coseno o coste de control)
- **Resolución**: Verificar implementación real en backend

**ε_eff (Eficiencia Semántica)**:
- **Documento formal**: ε_effₖ = ΔH / tokens_k
- **Implementación actual**: entropiaH (solo H, no ΔH/tokens)
- **Resolución**: Renombrar y recalcular correctamente

#### Discrepancia 3: Métrica Faltante

**C (Coste de Gobernanza)**:
- **Documento formal**: C_k = N_intervenciones / ||e_k||²
- **Implementación actual**: NO EXISTE
- **Resolución**: Agregar columna y cálculo

#### Discrepancia 4: Notación de Estados

**Documento formal**:
- x_k: Estado bruto propuesto por M
- x̂_k: Estado consolidado tras CAELION

**Implementación actual**:
- NO distingue entre x_k y x̂_k
- Asume que todas las métricas se calculan sobre x̂_k (estado consolidado)

**Resolución**: Aclarar en documentación que el sitio mide x̂_k (post-supervisión)

### 6.3 Separación Conceptual en el Sitio

**CampoPage.tsx** debe documentar:
- ✅ Sistema S = (H, M, C, Ω, Π)
- ✅ Capa 0 = {P, L, E}
- ✅ Lenguaje admisible L₀
- ✅ Axioma: ∀k, x̂_k ∈ L₀
- ⚠️ Dinámica estocástica: x_{k+1} = f(x_k, w_k)

**MarcoPage.tsx** debe documentar:
- ✅ CAELION como supervisor de invariancia
- ✅ Ley fundamental: G(φ(x̂_k))
- ✅ Protocolos: veto, regeneración, rechazo
- ⚠️ Isomorfismo con SCT (Teoría de Control Supervisorio)
- ❌ Diferencia con enfoques tradicionales (fine-tuning, RAG, prompt engineering)

**InstrumentoPage.tsx** debe documentar:
- ✅ ARESK-OBS como instrumento puro de diagnóstico
- ✅ Dependencia de x_ref (marco de referencia)
- ⚠️ Métricas canónicas: V, Ω, ε_eff, C (falta C)
- ❌ Naturaleza: NO actúa sobre el sistema
- ❌ Diferencia con CAELION (observa vs actúa)

---

## 7. Plan de Actualización

### 7.1 Prioridad Alta (Correcciones Críticas)

1. **Agregar métrica C (Coste de Gobernanza)**
   - Actualizar schema: `costeGobernanza: float()`
   - Implementar cálculo: C_k = N_intervenciones / ||e_k||²
   - Agregar visualización en InstrumentoPage

2. **Corregir nomenclatura de ε_eff**
   - Renombrar `entropiaH` → `eficienciaSem` en schema
   - Actualizar cálculo: ΔH / tokens_k (no solo H)
   - Actualizar documentación en InstrumentoPage

3. **Aclarar definición de Ω**
   - Verificar que implementación usa cos(x̂_k, x_ref)
   - Si no, corregir cálculo
   - Documentar explícitamente en InstrumentoPage

### 7.2 Prioridad Media (Mejoras de Documentación)

4. **Actualizar CampoPage**
   - Agregar sección "Dinámica Estocástica"
   - Documentar x_{k+1} = f(x_k, w_k)
   - Aclarar que M es generador estocástico (DES)

5. **Actualizar MarcoPage**
   - Agregar sección "Diferencia con Enfoques Tradicionales"
   - Documentar isomorfismo con SCT
   - Aclarar que CAELION es filtro de restricciones

6. **Actualizar InstrumentoPage**
   - Agregar sección "Naturaleza del Instrumento"
   - Documentar que ARESK-OBS NO actúa
   - Agregar tabla comparativa CAELION vs ARESK-OBS

### 7.3 Prioridad Baja (Mejoras Futuras)

7. **Implementar metodología experimental**
   - Crear página `/metodologia` con diseño experimental
   - Documentar grupos (a), (b), (c)
   - Documentar criterios de éxito

8. **Agregar notación de estados**
   - Aclarar en todo el sitio: x_k (bruto) vs x̂_k (consolidado)
   - Documentar que métricas se calculan sobre x̂_k

---

## 8. Resumen Ejecutivo

### 8.1 Separación Conceptual Canónica

```
CAMPO (Ingeniería Coignitiva)
  ↓ Define
SISTEMA S = (H, M, C, Ω, Π)
  ↓ Instancia
ARTEFACTO (CAELION) = C  |  INSTRUMENTO (ARESK-OBS) = Ω
  ↓ Función              |    ↓ Función
Supervisor de invariancia  |  Esquema de observación
  ↓ Actúa                |    ↓ Mide
x_k → x̂_k ∈ L₀          |  x̂_k → (V, Ω, ε_eff, C)
```

### 8.2 Coherencia Actual

| Aspecto | Estado | Acción Requerida |
|---------|--------|------------------|
| Estructura conceptual | ✅ Coherente | Ninguna |
| Separación Campo/Artefacto/Instrumento | ✅ Coherente | Ninguna |
| Nomenclatura de métricas | ⚠️ Parcial | Renombrar ε, agregar C |
| Definición de métricas | ⚠️ Parcial | Verificar Ω, corregir ε |
| Documentación formal | ⚠️ Parcial | Agregar secciones faltantes |

### 8.3 Veredicto

**Coherencia Global**: ⚠️ **ALTA CON CORRECCIONES MENORES**

El sitio ARESK-OBS refleja correctamente la separación conceptual entre Campo, Artefacto e Instrumento. Las discrepancias son principalmente de nomenclatura y documentación, no de arquitectura conceptual.

**Recomendación**: Proceder con actualizaciones de Prioridad Alta para alinear completamente con documento formal.

---

**Análisis generado automáticamente**  
**Fecha**: 26 de Enero de 2026  
**Versión**: 1.0
