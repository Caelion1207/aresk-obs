# ARESK-OBS v1.0

**Instrumento de Medición de Coste de Estabilidad Cognitiva**

ARESK-OBS **no determina verdad**.  
**No predice**, **no diagnostica**, **no optimiza automáticamente**.

Mide cuánta energía, control y coherencia requiere un sistema cognitivo para **no colapsar** a lo largo del tiempo.

---

## Qué es

ARESK-OBS es un **instrumento de observación** para sistemas cognitivos acoplados (LLMs, arquitecturas híbridas, sistemas simbióticos).

Su función es **medir costes operacionales observables**, no tomar decisiones por el operador.

Este repositorio se publica con fines de **estudio, análisis técnico y validación empírica**.

---

## Qué mide

ARESK-OBS cuantifica tres métricas principales:

### 1. Stability Cost (V — Lyapunov)

- **Definición:** Esfuerzo de control necesario para mantener coherencia.
- **Rango:** [0, ∞)
- **Interpretación:**
  - V > 0.7 → Alto coste de estabilización
  - V < 0.3 → Régimen estable

---

### 2. Coherence (Ω)

- **Definición:** Estabilidad narrativa relativa al historial inmediato.
- **Rango:** [0, 1]
- **Interpretación:**
  - Ω > 0.7 → Coherencia estable
  - Ω < 0.4 → Desalineación crítica

---

### 3. Semantic Efficiency (ε_eff)

- **Definición:** Pérdida o ganancia de información por token.
- **Rango:** [-1, 1]
- **Interpretación:**
  - ε_eff < -0.2 → Drenaje semántico
  - ε_eff > 0.1 → Control efectivo

---

## Qué NO hace

- ❌ No predice comportamiento futuro
- ❌ No diagnostica causas
- ❌ No optimiza parámetros automáticamente
- ❌ No evalúa verdad, corrección ni ética
- ❌ No sustituye criterio humano

ARESK-OBS **mide estado actual**.  
La interpretación y la decisión **son responsabilidad del operador humano**.

---

## Uso básico

1. Definir referencia de propósito (`x_ref`)
2. Seleccionar ganancia de control (`K`)
3. Monitorear métricas V, Ω, ε_eff
4. Intervenir **solo cuando la evidencia lo justifique**
5. Comparar configuraciones empíricamente

---

## LAB | Dynamics Monitor

Incluye visualizaciones avanzadas:

- Phase Portrait (Entropía vs Coherencia)
- Lyapunov Energy V²(t)
- Error Dynamics (ε_eff vs Δε_eff)
- Control Effort ΔV(t)

Estas gráficas **no decoran datos**: representan dinámica de sistemas.

---

## Estado del proyecto

Este repositorio se encuentra en **fase de instrumentación activa**.

Algunos componentes están en transición y no representan una versión final ni un producto comercial.

Las tareas pendientes están documentadas en `todo.md`.

---

## Licencia

Este proyecto se distribuye bajo la licencia  
**Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)**.

- Uso permitido para **estudio, investigación y análisis**
- **Prohibido** cualquier uso comercial o derivado con fines de lucro

Ver archivo `LICENSE` para detalles completos.

---

## Disclaimer

ARESK-OBS es un instrumento de medición.

Mide costes.  
Habilita decisiones.  
No piensa por ti.

---

## Repository Status

**This repository is frozen at v1.0.0-AUDIT-CLOSED.**

Any further development will occur in a separate branch or project.
