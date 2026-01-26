# ARESK-OBS

**Instrumento de Auditoría de Sistemas Coignitivos**

---

## Qué es

ARESK-OBS es un **instrumento de observación** para auditar sistemas coignitivos (H + M + C), donde la cognición emerge de la interacción regulada entre operador humano y sustrato de inferencia.

Su función es **medir métricas de estabilidad** en horizonte largo, no tomar decisiones por el operador.

---

## Qué mide

ARESK-OBS cuantifica tres métricas canónicas:

### 1. Función de Lyapunov (V)

- **Definición:** V = e^T P e, donde e = x - x_ref
- **Rango:** [0, ∞)
- **Interpretación:** Coste energético de desviación respecto a referencia ontológica (Capa 0)

### 2. Coherencia Observable (Ω)

- **Definición:** Ω = cos(h(x), h(x_ref))
- **Rango:** [-1, 1]
- **Interpretación:** Alineación semántica direccional con referencia

### 3. Entropía Semántica (ε)

- **Definición:** ε = H(x) - H(x_ref)
- **Rango:** (-∞, ∞)
- **Interpretación:** Divergencia entrópica respecto a referencia

---

## Control por Régimen

ARESK-OBS implementa **control por invariancia**, no control clásico:

- **Equilibrio objetivo:** ~0.5 (reposo dinámico), NO 0 (colapso semántico)
- **Zonas operativas:**
  - Reposo: ~0.5
  - Estable: 0.5 → 2
  - Tolerable: 2 → 4
  - Intervención: > 4

El control **NO es continuo**. Solo interviene cuando el sistema sale de la banda admisible.

---

## Qué NO hace

- ❌ No predice comportamiento futuro
- ❌ No diagnostica causas
- ❌ No optimiza parámetros automáticamente
- ❌ No evalúa verdad, corrección ni ética
- ❌ No sustituye criterio humano

ARESK-OBS **mide estado actual**. La interpretación es responsabilidad del operador.

---

## Estructura del Repositorio

```
/client          → Frontend (React + Tailwind)
/server          → Backend (tRPC + Express)
/drizzle         → Schema de base de datos
/research        → Documentación técnica (8 PDFs)
```

---

## Documentación de Investigación

El directorio [`research/`](./research/) contiene 8 documentos técnicos:

- **Serie Ingeniería Cognitiva** (4 partes): Fundamentos, Control, Semántica, Arquitecturas
- **Análisis Técnicos**: Matemático 384D, Control LQR
- **Análisis Comparativos**: CAELION vs ACT-R/SOAR, CAELION vs ML

Ver [`research/README.md`](./research/README.md) para índice completo.

---

## Experimento A-1

El repositorio incluye datos reales del **Experimento A-1** (Régimen Acoplada con marco CAELION):

- **50 mensajes** de interacción H-M
- **Métricas medidas:** Ω, ε, V
- **Resultado:** Sistema estable (Ω_max = 0.4228)

---

## Licencia

**Creative Commons Attribution–NonCommercial 4.0 International (CC BY-NC 4.0)**

- Uso permitido para **estudio, investigación y análisis**
- **Prohibido** cualquier uso comercial o derivado con fines de lucro

---

## Estado del Proyecto

**INSTRUMENTO CONGELADO**

Este repositorio contiene la versión final de ARESK-OBS como instrumento de auditoría.

No se aceptan pull requests ni issues. El proyecto está cerrado para desarrollo.

---

## Disclaimer

ARESK-OBS es un instrumento de medición.

Mide costes.  
Habilita decisiones.  
No piensa por ti.
