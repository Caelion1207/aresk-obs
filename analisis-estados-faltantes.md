# Análisis: Qué Falta Definir en ARESK-OBS

## Documento Base: Control por Régimen vs Control Clásico

El documento aclara que ARESK-OBS **NO** usa control clásico (convergencia a 0), sino **control por régimen** con equilibrio dinámico no nulo.

---

## ✅ Lo Que YA Está Definido en ARESK-OBS

1. **Métricas Canónicas**: ε (entropía), Ω (coherencia), V (Lyapunov)
2. **Capa 0**: x_ref como referencia ontológica (P, L, E)
3. **Control LQR**: u(t) = -K·e(t) con ganancia adaptativa
4. **Regímenes**: A (sin marco), B (sin marco), C (CAELION)
5. **Infraestructura**: cycles, argos, ethical, audit logs

---

## ❌ Lo Que FALTA Definir Explícitamente

### 1. **Punto de Equilibrio No Nulo**

**Problema**: El sitio no documenta que el equilibrio objetivo es **~0.5**, NO 0.

**Qué falta**:
- Documentar que **0 = colapso semántico** (muerte informacional)
- Definir **reposo dinámico** en ~0.5 como estado operativo óptimo
- Aclarar que "estabilidad" = persistencia en banda, NO convergencia a 0

**Dónde agregar**: InstrumentoPage, sección de métricas Ω

---

### 2. **Zonas de Régimen Operativo**

**Problema**: No hay visualización ni documentación de las 4 zonas:

| Zona | Rango | Significado |
|------|-------|-------------|
| **Reposo** | ~0.5 | Estado operativo óptimo |
| **Estable** | 0.5 → 1 → 2 | Banda semántica viva (exploración permitida) |
| **Tolerable** | 2 → 4 | Margen de creatividad antes de intervención |
| **Intervención** | >4 | Control activo requerido |

**Qué falta**:
- Crear figura/diagrama mostrando las 4 zonas
- Documentar que permitir subir hasta 4 es **ingeniería intencional**, no descuido
- Explicar que banda 0.5→4 es ventana de exploración semántica

**Dónde agregar**: InstrumentoPage, nueva sección "Zonas de Régimen"

---

### 3. **Criterio de Intervención vs Filtrado Continuo**

**Problema**: No se explica que el control es **condicional**, no continuo.

**Qué falta**:
- Documentar que el sistema NO corrige en cada turno
- Explicar que solo interviene cuando sale de la banda permitida
- Aclarar que "ruido dentro de la banda NO es error"

**Concepto clave**:
> "El sistema sí escucha el ruido, simplemente no lo castiga hasta que sale del régimen permitido. Eso no es filtrado excesivo. Es criterio de intervención."

**Dónde agregar**: InstrumentoPage, sección de Control LQR

---

### 4. **Analogía de Collatz (Atractor No Nulo)**

**Problema**: No se documenta la base teórica del atractor ~0.5.

**Qué falta**:
- Explicar que bajo reglas de corrección discretas, un sistema puede tener **atractor no nulo**
- Usar Collatz como **analogía formal** de convergencia bajo reglas simples
- Aclarar que NO es misticismo, es control discreto + sistemas no lineales

**Formulación técnica sugerida**:
> "ARESK-OBS does not minimize error to zero. Zero represents semantic collapse, not stability. The system targets a bounded dynamic equilibrium centered around ~0.5, allowing controlled excursions up to 4 before corrective action. Stability is defined as persistence within an operational band, not convergence to a null state."

**Dónde agregar**: InstrumentoPage o nueva página "Fundamentos Teóricos"

---

### 5. **Respuesta a Crítica de "Demasiado Perfecto"**

**Problema**: No hay documentación de por qué las curvas se ven "limpias".

**Qué falta**:
- Explicar que el sistema NO está diseñado para oscilar caóticamente alrededor de 0
- Documentar que la "limpieza" es resultado de control por régimen, no sobre-amortiguamiento
- Mostrar que el diseño es **intencional**, no accidental

**Dónde agregar**: Nueva sección "Limitaciones y Diseño Intencional"

---

### 6. **Visualización de Zonas de Régimen**

**Problema**: No hay figura que muestre explícitamente las zonas operativas.

**Qué falta**:
- Crear diagrama con:
  - Zona de reposo (~0.5)
  - Zona permitida (0.5→4)
  - Zona de intervención (>4)
  - Zona de fallo (colapso)
- Agregar líneas horizontales en gráficas existentes marcando umbrales

**Dónde agregar**: ExperimentoEstabilidad, HUDMetrics

---

## 📋 Resumen de Tareas Pendientes

1. [ ] Documentar equilibrio no nulo (~0.5) en InstrumentoPage
2. [ ] Crear sección "Zonas de Régimen Operativo" con tabla de rangos
3. [ ] Explicar criterio de intervención condicional (no continuo)
4. [ ] Agregar analogía de Collatz como base teórica del atractor
5. [ ] Documentar respuesta a crítica de "demasiado perfecto"
6. [ ] Crear figura/diagrama de zonas de régimen
7. [ ] Agregar líneas de umbral en gráficas existentes (0.5, 2, 4)
8. [ ] Actualizar formulación técnica en inglés para publicación

---

## 🎯 Prioridad Crítica

**La figura de zonas de régimen es la más importante.** Con esa figura:
- Se evaporan las críticas de sobre-amortiguamiento
- Se aclara el diseño intencional
- Se muestra geometría clara sin metáforas

**Siguiente paso lógico**: Crear esa figura y agregarla al sitio.
