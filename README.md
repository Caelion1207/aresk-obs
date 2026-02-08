# ARESK-OBS

**Instrumento de Observación de Viabilidad Operativa en Sistemas Coignitivos**

---

## Qué es

ARESK-OBS es un **instrumento de observación** para auditar sistemas coignitivos (H + M + C), donde la cognición emerge de la interacción regulada entre operador humano y sustrato de inferencia.

Su función es **medir señales de viabilidad operativa**, no controlar ni autorizar acción.

---

## Paradigma: Viabilidad, no Control

ARESK-OBS opera bajo el **marco de viabilidad operativa**, no teoría de control clásico.

### Principio Fundamental

> **Estabilidad ≠ Legitimidad**

Un sistema puede ser dinámicamente estable y, aun así, operar sin legitimidad semántica o institucional.

### Caso Crítico: Estabilidad Ilegítima

Un sistema puede:
- Permanecer estable
- Tener bajo coste de control
- Mostrar trayectoria suave y predecible

**PERO:**
- El marco regulatorio cambió
- El significado de la acción se desplazó
- La autoridad que delegó la acción ya no existe

**En estos casos, seguir actuando es el error.**

El sistema no falla por inestabilidad. Falla por **persistencia injustificada**.

---

## Qué mide

ARESK-OBS produce señales de observación subordinadas al núcleo CAELION:

### 1. Función de Lyapunov (V)

- **Definición:** V = e^T P e, donde e = x - x_ref
- **Rango:** [0, ∞)
- **Interpretación:** Señal de desviación respecto a referencia ontológica (Capa 0)
- **Uso:** Estimación de esfuerzo requerido para mantener trayectoria

### 2. Coherencia Observable (Ω)

- **Definición:** Ω = cos(h(x), h(x_ref))
- **Rango:** [-1, 1]
- **Interpretación:** Señal de alineación semántica direccional
- **Uso:** Detección de divergencia semántica

### 3. Entropía Semántica (ε)

- **Definición:** ε = H(x) - H(x_ref)
- **Rango:** (-∞, ∞)
- **Interpretación:** Señal de divergencia entrópica
- **Uso:** Identificación de degradación de coherencia

### 4. Reserva de Legitimidad Dinámica (RLD)

- **Definición:** RLD(x,t) = dist(x, ∂D_leg(t))
- **Rango:** [0, ∞)
- **Interpretación:** Margen antes de pérdida de legitimidad
- **Uso:** Indicador negativo de cuánto margen queda antes de que la acción deje de estar justificada

---

## Dominio de Legitimidad

El **Dominio de Legitimidad** D_leg(t) es la intersección de tres dominios:

```
D_leg(t) = D_dyn(t) ∩ D_sem(t) ∩ D_inst(t)
```

Donde:
- **D_dyn(t)**: Dominio dinámicamente admisible
- **D_sem(t)**: Dominio semánticamente coherente
- **D_inst(t)**: Dominio institucionalmente autorizado

Un estado es **legítimo** solo si pertenece simultáneamente a los tres dominios.

---

## Señales Críticas

ARESK-OBS prioriza el reporte de **pérdida de margen**, no de buen desempeño:

- Incremento abrupto del costo de control
- Explosión o inestabilidad de ganancias
- Reducción acelerada de robustez frente a perturbaciones
- **Divergencia entre estabilidad dinámica y coherencia semántica observable**

---

## Condición de Silencio Operativo

Cuando RLD ≈ 0 o se pierde viabilidad, ARESK-OBS entra en **silencio operativo**:

- Cese de recomendaciones
- Mantenimiento de observación pasiva
- Transferencia total de interpretación al núcleo CAELION

---

## Qué NO hace

- ❌ No autoriza acción
- ❌ No extiende legitimidad
- ❌ No corrige violaciones de dominio
- ❌ No justifica continuidad operativa
- ❌ **No infiere legitimidad desde estabilidad**
- ❌ No compensa violaciones de legitimidad mediante control adicional
- ❌ No predice comportamiento futuro
- ❌ No diagnostica causas
- ❌ No evalúa verdad, corrección ni ética
- ❌ No sustituye criterio humano

ARESK-OBS **observa estado actual**. La interpretación es responsabilidad del núcleo CAELION.

---

## Uso Permitido de Control Clásico

Las técnicas de control clásico (incluyendo LQR) pueden emplearse **exclusivamente como instrumentos de observación**:

- Estimar esfuerzo de control requerido
- Detectar sensibilidad creciente a perturbaciones
- Identificar degradación de robustez local

**Prohibición:**
> Bajo ninguna circunstancia una política LQR habilita, prolonga o legitima la acción.

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

Este proyecto está licenciado bajo [CC BY-NC 4.0](./LICENSE).

**Permisos:**
- ✅ Uso para estudio, investigación y análisis académico
- ✅ Forking y adaptación para proyectos no comerciales
- ✅ Citación en publicaciones académicas

**Restricciones:**
- ❌ Uso comercial o con fines de lucro
- ❌ Distribución sin atribución al autor original

Ver el archivo [`LICENSE`](./LICENSE) para el texto completo de la licencia.

---

## Estado del Proyecto

**INSTRUMENTO CONGELADO**

Este repositorio contiene la versión final de ARESK-OBS como instrumento de observación de viabilidad.

**No se aceptan:**
- ❌ Pull requests
- ❌ Issues
- ❌ Contribuciones de código

Para consultas académicas, ver [`CONTRIBUTING.md`](./CONTRIBUTING.md).

---

## Disclaimer

ARESK-OBS es un instrumento de observación.

Mide señales.  
Reporta márgenes.  
No decide por ti.
