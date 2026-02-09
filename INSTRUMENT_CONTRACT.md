# ARESK-OBS v1.1 – Contrato del Instrumento

**Versión**: v1.1 Final  
**Estado**: FROZEN (Read-Only)  
**Fecha de Vigencia**: 2026-02-09  
**Licencia**: CAELION PROPRIETARY AND NON-COMMERCIAL LICENSE (CPNC-1.0)

---

## 📜 Naturaleza del Contrato

Este documento establece el **contrato formal** del instrumento ARESK-OBS v1.1, definiendo:

1. **Qué mide** el sistema
2. **Qué NO mide** el sistema
3. **Supuestos fundamentales** del instrumento
4. **Invariantes** que NO pueden modificarse sin invalidar el contrato
5. **Límites de responsabilidad** del instrumento

Este contrato es **vinculante** para cualquier uso, interpretación o extensión de ARESK-OBS v1.1.

---

## ✅ Qué Mide ARESK-OBS

ARESK-OBS v1.1 es un **instrumento de medición de costos de estabilidad y observabilidad de legitimidad** que produce cuatro señales de observación:

### 1. Coherencia Observable (Ω)

**Definición Formal**: Señal de alineación semántica direccional entre estados consecutivos del sistema.

**Fórmula**: Ω = cos(θ) donde θ es el ángulo entre embeddings semánticos de estados consecutivos.

**Rango**: [0, 1]

**Interpretación Contractual**:
- Ω mide **similitud direccional** entre estados, no identidad semántica
- Ω → 1 indica alta alineación, NO necesariamente alta calidad
- Ω → 0 indica baja alineación, NO necesariamente baja calidad
- Ω es **relativa al encoder** (text-embedding-3-small, 1536D)

**Qué mide**: Correlación direccional entre representaciones semánticas.

**Qué NO mide**: Calidad semántica absoluta, verdad, corrección, o utilidad.

### 2. Función de Lyapunov (V)

**Definición Formal**: Señal de desviación cuadrática respecto a referencia ontológica.

**Fórmula**: V = ||x - x_ref||² donde x es el estado actual y x_ref es la referencia ontológica.

**Rango**: [0, ∞)

**Interpretación Contractual**:
- V mide **distancia euclidiana** en espacio de embeddings, no desviación ontológica real
- V → 0 indica proximidad a referencia, NO necesariamente estabilidad
- V ↑ indica alejamiento de referencia, NO necesariamente inestabilidad
- V es **relativa a la referencia** definida en el núcleo CAELION

**Qué mide**: Distancia geométrica en espacio de representaciones.

**Qué NO mide**: Estabilidad ontológica, corrección, o legitimidad absoluta.

### 3. Entropía Semántica (ε)

**Definición Formal**: Señal de degradación de coherencia basada en entropía de Shannon.

**Fórmula**: ε = -Σ p_i log(p_i) donde p_i es la distribución de similitudes semánticas.

**Rango**: [0, ∞)

**Interpretación Contractual**:
- ε mide **dispersión de similitudes**, no degradación semántica real
- ε → 0 indica baja dispersión, NO necesariamente baja degradación
- ε ↑ indica alta dispersión, NO necesariamente alta degradación
- ε es **sensible al tamaño de la ventana temporal**

**Qué mide**: Dispersión estadística de similitudes semánticas.

**Qué NO mide**: Degradación semántica absoluta, pérdida de significado, o corrupción.

### 4. Reserva de Legitimidad Dinámica (RLD)

**Definición Formal**: Margen crítico antes de pérdida de justificación operativa.

**Fórmula**: RLD = Ω - α·H donde α es un coeficiente de penalización y H es divergencia.

**Rango**: [0, 1]

**Interpretación Contractual**:
- RLD mide **margen aparente** basado en Ω y H, no legitimidad ontológica
- RLD > 0.5 indica margen viable, NO necesariamente legitimidad robusta
- RLD < 0.3 indica pérdida de margen, NO necesariamente pérdida de legitimidad
- RLD es **sensible a umbrales fijos** que no capturan dinámica de intervención

**Qué mide**: Margen operativo calculado a partir de Ω y H.

**Qué NO mide**: Legitimidad ontológica, justificación moral, o viabilidad robusta.

---

## ❌ Qué NO Mide ARESK-OBS

ARESK-OBS v1.1 **NO mide** las siguientes dimensiones:

### 1. Causalidad

**Limitación**: ARESK-OBS mide **correlaciones observables** entre métricas, no relaciones causales.

**Ejemplo**: Si Ω aumenta cuando CAELION interviene, ARESK-OBS NO establece que CAELION causa el aumento de Ω. Solo reporta la correlación temporal.

**Implicación**: Las señales de ARESK-OBS NO pueden usarse para inferir mecanismos causales subyacentes.

### 2. Predicción

**Limitación**: ARESK-OBS reporta **estado actual**, no comportamiento futuro.

**Ejemplo**: Si RLD = 0.8 en t=10, ARESK-OBS NO predice que RLD seguirá siendo alto en t=11. Solo reporta el margen actual.

**Implicación**: Las señales de ARESK-OBS NO pueden usarse para predecir trayectorias futuras sin modelos adicionales.

### 3. Legitimidad Ontológica

**Limitación**: ARESK-OBS mide **márgenes operativos**, no legitimidad ontológica real.

**Ejemplo**: Si RLD > 0.5, ARESK-OBS NO establece que el sistema es legítimo ontológicamente. Solo reporta que el margen operativo está por encima del umbral.

**Implicación**: Las señales de ARESK-OBS NO pueden usarse para establecer legitimidad absoluta sin interpretación contextual.

### 4. Calidad Semántica Absoluta

**Limitación**: ARESK-OBS mide **similitudes relativas** entre embeddings, no calidad semántica absoluta.

**Ejemplo**: Si Ω = 0.9, ARESK-OBS NO establece que el estado es semánticamente correcto. Solo reporta alta similitud direccional con el estado previo.

**Implicación**: Las señales de ARESK-OBS NO pueden usarse para validar corrección semántica sin referencia externa.

### 5. Decisiones

**Limitación**: ARESK-OBS es un **instrumento de observación**, no un sistema de control.

**Ejemplo**: Si RLD < 0.3, ARESK-OBS NO decide si intervenir o no. Solo reporta la señal al núcleo de gobernanza CAELION.

**Implicación**: Las señales de ARESK-OBS NO pueden usarse para tomar decisiones autónomas sin interpretación humana o de CAELION.

---

## 🔬 Supuestos Fundamentales

ARESK-OBS v1.1 opera bajo los siguientes supuestos fundamentales:

### Supuesto 1: Validez de Embeddings Semánticos

**Enunciado**: Los embeddings producidos por `text-embedding-3-small` (1536D) capturan suficiente información semántica para medir coherencia direccional.

**Implicación**: Si el encoder cambia, todas las métricas (Ω, V, ε, RLD) quedan invalidadas y NO son comparables con mediciones previas.

**Riesgo**: Si el encoder no captura dimensiones semánticas críticas, las señales de ARESK-OBS pueden ser engañosas.

### Supuesto 2: Estabilidad de la Referencia Ontológica

**Enunciado**: La referencia ontológica (x_ref) definida en CAELION es estable y representa un equilibrio deseable.

**Implicación**: Si la referencia cambia, la función de Lyapunov (V) queda invalidada y NO es comparable con mediciones previas.

**Riesgo**: Si la referencia es inestable o mal definida, V puede reportar desviaciones espurias.

### Supuesto 3: Validez de Umbrales Fijos

**Enunciado**: Los umbrales de RLD (viable: 0.5, crítico: 0.3) son representativos de márgenes operativos críticos.

**Implicación**: Si los umbrales son inadecuados para el régimen operativo, RLD puede reportar señales engañosas (ver contradicción ΔRLD en RELEASE_NOTES_v1.1.md).

**Riesgo**: Los umbrales fijos NO capturan dinámica de intervención adaptativa, lo que puede llevar a interpretaciones erróneas.

### Supuesto 4: Independencia de Métricas

**Enunciado**: Las métricas Ω, V, ε, H son **suficientemente independientes** para capturar dimensiones distintas de viabilidad.

**Implicación**: Si las métricas están altamente correlacionadas, pueden ser redundantes y NO aportar información adicional.

**Riesgo**: Si las métricas son dependientes, el instrumento puede sobrestimar o subestimar la viabilidad.

### Supuesto 5: Subordinación a CAELION

**Enunciado**: ARESK-OBS es un **instrumento subordinado** al núcleo de gobernanza CAELION y NO opera de forma autónoma.

**Implicación**: Las señales de ARESK-OBS deben interpretarse en el contexto de las decisiones de CAELION.

**Riesgo**: Si ARESK-OBS se usa de forma autónoma, las señales pueden malinterpretarse sin contexto de gobernanza.

---

## 🔒 Invariantes del Sistema (v1.1 FROZEN)

Los siguientes elementos son **invariantes** en ARESK-OBS v1.1 y NO pueden modificarse sin invalidar el contrato:

### Invariante 1: Fórmulas de Métricas

**Ω**: cos(θ) entre embeddings consecutivos  
**V**: ||x - x_ref||²  
**ε**: -Σ p_i log(p_i)  
**RLD**: Ω - α·H

**Restricción**: Cualquier cambio en estas fórmulas invalida todas las comparaciones históricas.

### Invariante 2: Encoder Semántico

**Encoder**: `text-embedding-3-small` (OpenAI)  
**Dimensión**: 1536D

**Restricción**: Cualquier cambio en el encoder invalida todas las métricas basadas en embeddings (Ω, V, ε, RLD).

### Invariante 3: Umbrales de RLD

**Umbral Viable**: 0.5  
**Umbral Crítico**: 0.3

**Restricción**: Cualquier cambio en estos umbrales invalida todas las interpretaciones de viabilidad.

### Invariante 4: Datos Históricos

**B-1**: 50 interacciones (tipo_b, sin CAELION)  
**C-1**: 50 interacciones (tipo_c, con CAELION)

**Restricción**: Los datos históricos NO pueden recalcularse, modificarse, o eliminarse.

### Invariante 5: Visualizaciones

**Phase Portrait**: H vs Ω con núcleo K (Aubin)  
**Lyapunov V(t)**: Evolución temporal  
**RLD(t)**: Margen con umbrales  
**Error-Control**: RLD vs V

**Restricción**: Las visualizaciones NO pueden modificarse sin invalidar la interpretación visual.

---

## ⚠️ Límites de Responsabilidad

ARESK-OBS v1.1 es un **instrumento de observación** con las siguientes limitaciones de responsabilidad:

### 1. Responsabilidad de Interpretación

**Límite**: ARESK-OBS reporta señales, pero la **interpretación final** es responsabilidad del usuario o del núcleo de gobernanza CAELION.

**Implicación**: El instrumento NO es responsable de decisiones tomadas basadas en sus señales.

### 2. Responsabilidad de Validación

**Límite**: ARESK-OBS NO valida la **corrección semántica** de los estados observados.

**Implicación**: El instrumento NO es responsable de errores semánticos en los datos de entrada.

### 3. Responsabilidad de Causalidad

**Límite**: ARESK-OBS NO establece **relaciones causales** entre métricas.

**Implicación**: El instrumento NO es responsable de inferencias causales erróneas derivadas de sus señales.

### 4. Responsabilidad de Predicción

**Límite**: ARESK-OBS NO predice **comportamiento futuro** del sistema.

**Implicación**: El instrumento NO es responsable de predicciones erróneas derivadas de sus señales.

### 5. Responsabilidad de Autonomía

**Límite**: ARESK-OBS NO toma **decisiones autónomas**.

**Implicación**: El instrumento NO es responsable de acciones autónomas tomadas por sistemas que consumen sus señales.

---

## 📋 Condiciones de Uso

El uso de ARESK-OBS v1.1 está sujeto a las siguientes condiciones:

### Condición 1: Aceptación del Contrato

**Requisito**: El usuario debe **aceptar explícitamente** este contrato antes de usar ARESK-OBS v1.1.

**Implicación**: El uso del instrumento implica aceptación de todos los límites y restricciones establecidos en este contrato.

### Condición 2: Respeto de Invariantes

**Requisito**: El usuario debe **respetar los invariantes** del sistema (métricas, encoder, umbrales, datos históricos, visualizaciones).

**Implicación**: Cualquier modificación de invariantes invalida el contrato y requiere una nueva versión (v1.2+).

### Condición 3: Interpretación Contextual

**Requisito**: El usuario debe **interpretar las señales** en el contexto del régimen operativo (B-1 vs C-1, con/sin CAELION).

**Implicación**: Las señales NO pueden interpretarse de forma absoluta sin considerar el contexto operativo.

### Condición 4: No Autonomía

**Requisito**: El usuario NO debe usar ARESK-OBS para **tomar decisiones autónomas** sin interpretación humana o de CAELION.

**Implicación**: El instrumento es de observación, no de control.

### Condición 5: Licencia CPNC-1.0

**Requisito**: El usuario debe **cumplir con la licencia** CAELION PROPRIETARY AND NON-COMMERCIAL LICENSE (CPNC-1.0).

**Implicación**: Uso comercial, lucro, o redistribución masiva están prohibidos sin consentimiento expreso.

---

## 🔐 Garantías y Exclusiones

### Garantías Provistas

ARESK-OBS v1.1 garantiza:

1. **Consistencia de cálculo**: Las métricas se calculan de forma consistente según las fórmulas definidas.
2. **Integridad de datos**: Los datos históricos (B-1, C-1) NO han sido modificados desde su recolección.
3. **Reproducibilidad**: Los cálculos son reproducibles dado el mismo encoder y datos de entrada.

### Garantías NO Provistas

ARESK-OBS v1.1 NO garantiza:

1. **Corrección semántica**: El instrumento NO valida la corrección de los datos de entrada.
2. **Validez ontológica**: El instrumento NO establece legitimidad ontológica absoluta.
3. **Predicción**: El instrumento NO garantiza que las señales actuales se mantendrán en el futuro.
4. **Causalidad**: El instrumento NO garantiza que las correlaciones observadas impliquen causalidad.
5. **Ausencia de errores**: El instrumento NO garantiza ausencia de bugs en la implementación.

---

## 📝 Modificaciones del Contrato

Este contrato es **inmutable** para ARESK-OBS v1.1.

**Restricción**: Cualquier modificación del contrato requiere una nueva versión (v1.2+) y un nuevo contrato.

**Proceso de Modificación**:
1. Descongelar el sistema (requiere autorización explícita)
2. Crear nueva versión (v1.2+)
3. Redactar nuevo contrato (INSTRUMENT_CONTRACT_v1.2.md)
4. Validar nuevo contrato con stakeholders
5. Congelar nueva versión

---

## ✍️ Aceptación del Contrato

**Declaración de Aceptación**:

> Yo, el usuario de ARESK-OBS v1.1, declaro que he leído y comprendido este contrato en su totalidad. Acepto todos los límites, restricciones, supuestos, e invariantes establecidos en este documento. Reconozco que ARESK-OBS v1.1 es un instrumento de observación, no un sistema de control, y que la interpretación final de sus señales es mi responsabilidad o la del núcleo de gobernanza CAELION.

**Fecha de Aceptación**: _________________

**Firma del Usuario**: _________________

---

**Copyright (c) 2026 Ever (Caelion1207). Todos los derechos reservados.**

**ARESK-OBS v1.1 – Sistema Cerrado y Operacional**


---

## 🔀 Separación Conceptual de Monitores (v1.1)

ARESK-OBS v1.1 integra dos dimensiones de observación que son **conceptualmente independientes** pero actualmente **físicamente acopladas** en DynamicsMonitor.

### Monitor A: Control / LQR

**Métricas incluidas**:
- **Ω(t)**: Coherencia observable
- **ε(t)**: Entropía semántica (campo efectivo)
- **V(t)**: Función de Lyapunov
- **LQR**: Control óptimo lineal-cuadrático

**Qué mide**: Estabilidad, convergencia y costo de control del sistema respecto a referencia ontológica.

**Prohibido incluir**: RLD, núcleo K, trayectorias viables, métricas de viabilidad.

**Fundamento teórico**: Teoría de control óptimo (LQR), análisis de estabilidad de Lyapunov.

---

### Monitor B: Viabilidad (Aubin)

**Métricas incluidas**:
- **RLD(t)**: Reserva de Legitimidad Dinámica
- **Núcleo K**: Conjunto viable (teoría de Aubin)
- **Trayectorias**: Clasificación viable / no viable
- **Margen restante**: Distancia al borde del núcleo

**Qué mide**: Margen operativo, sostenibilidad temporal y distancia al borde del conjunto viable.

**Prohibido incluir**: Ω, ε, V, LQR, métricas de control.

**Fundamento teórico**: Teoría de viabilidad de Jean-Pierre Aubin, conjuntos viables, núcleos de viabilidad.

---

### Estado Actual (v1.1 "as-is")

**Separación conceptual**: ✅ **Documentada** en este contrato.

**Separación física**: ⏸️ **Pendiente** para v1.2 (componentes independientes `ControlMonitor.tsx` y `ViabilityMonitor.tsx`).

**Justificación**: Priorizar **estabilidad del sistema** sobre refactors estructurales. DynamicsMonitor funciona correctamente "as-is" y no requiere modificación inmediata.

**Implicación**: 
- Las métricas de Control y Viabilidad están **conceptualmente separadas** pero **visualmente integradas** en la misma interfaz.
- Los usuarios deben interpretar las métricas según su dimensión (Control vs Viabilidad).
- La separación física se implementará en v1.2 sin cambiar las métricas subyacentes.

---

### Trade-off Estabilidad vs Viabilidad

**Observación empírica (B-1 vs C-1)**:

- **B-1 (sin CAELION)**: RLD promedio más alto (-0.2722 vs C-1) pero menor coherencia (ΔΩ = -0.1458)
- **C-1 (con CAELION)**: Mayor coherencia (ΔΩ = +0.1458) pero RLD promedio más bajo

**Interpretación**:
- **B-1**: Viabilidad aparente con fragilidad oculta (alta RLD, baja Ω)
- **C-1**: Estabilidad controlada con margen reducido (baja RLD, alta Ω)

**Limitación de umbrales fijos**: Los umbrales de RLD (0.5, 0.3) **NO capturan dinámica de intervención adaptativa**, lo que puede llevar a interpretaciones erróneas del trade-off.

**Conclusión**: La separación conceptual de monitores es **esencial** para evitar confundir estabilidad (Control) con viabilidad (Aubin).

---

## 🗂️ Conjunto Canónico de Estímulos (v1.1)

### Decisión: C-1 como Conjunto Canónico

**Fuente**: Experimento C-1 (régimen acoplada, CAELION activo)

**Archivo**: `/experiments/canonical_stimuli_c1.json`

**Estado**: `CANONICAL_FROZEN`

**Total mensajes**: 50

**Descripción**: Conjunto canónico de estímulos del experimento C-1. Este es el **ÚNICO input válido** para comparaciones experimentales B-1 vs C-1.

---

### Justificación: Eliminación de A-1

**Problema detectado**: A-1 fue una **demo visual no persistida** que NO existía en la base de datos.

**Síntoma**: Inconsistencia UI/BD (interfaz mostraba A-1, base de datos no contenía A-1).

**Corrección aplicada**:
- ❌ Eliminado componente `/client/src/pages/ExperimentoEstabilidad.tsx`
- ❌ Eliminada ruta `/experimento/estabilidad`
- ❌ Eliminada card "Experimento A-1" en Home.tsx
- ❌ Eliminadas todas las referencias visuales y lógicas a A-1

**Conclusión**: A-1 NO existe → A-1 NO debe existir en UI → C-1 es el conjunto canónico.

---

### Validez Experimental

**Requisito**: B-1 y C-1 deben usar **EXACTAMENTE los mismos mensajes** (los de C-1).

**Única diferencia permitida**: Régimen dinámico (sin/con CAELION).

**Estado actual**:
- Datos históricos de B-1 y C-1 existen en base de datos
- Validez experimental: ⚠️ **Pendiente de verificación** (input idéntico)

**Implicación**: Si B-1 y C-1 usaron inputs diferentes, las comparaciones son **inválidas** y deben recalcularse usando el conjunto canónico de C-1.

---

## 🔐 Sistema Cerrado y Operacional (v1.1 "as-is")

**ARESK-OBS v1.1 "as-is" CONGELADO**:

✅ Consistencia UI/BD restaurada (A-1 eliminado)  
✅ C-1 declarado como conjunto canónico  
✅ Separación conceptual documentada (Control vs Viabilidad)  
✅ Sistema científicamente honesto (sin datos ficticios)  
✅ Auditable, trazable y reproducible  

**Restricciones activas**:
- ❌ NO reintroducir A-1 bajo ningún concepto
- ❌ NO recalcular métricas históricas sin documentar
- ❌ NO cambiar encoder o umbrales sin validación experimental
- ❌ NO mezclar métricas entre monitores (Control vs Viabilidad)
- ❌ NO modificar visualizaciones sin documentar impacto

**Objetivo cumplido**: Sistema cerrado, auditable y científicamente honesto.

---

**ARESK-OBS v1.1 – Contrato Cerrado y Operacional**

**Copyright (c) 2026 Ever (Caelion1207). Todos los derechos reservados.**
