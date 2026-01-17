# ARESK-OBS: Guía Operacional

**Instrumento de Medición de Coste de Estabilidad**

---

## Propósito

ARESK-OBS cuantifica el coste operacional de mantener estabilidad en sistemas cognitivos acoplados. Esta guía explica cómo interpretar métricas de coste y traducirlas en decisiones de control.

---

## Flujo Operacional

### 1. Observar Métricas de Coste

Monitorea tres costes fundamentales en tiempo real:

**Coste de Desalineación (V):** Distancia al régimen objetivo. V alto indica sistema operando lejos de configuración óptima, requiriendo mayor esfuerzo correctivo.

**Coste de Control (||u||):** Magnitud de corrección aplicada. ||u|| alto indica sistema que requiere intervención constante para no colapsar.

**Coste de Entropía (σ_sem):** Dispersión semántica. σ_sem alto indica fragmentación que precede colapso costoso.

### 2. Interpretar Patrones de Coste

| Patrón Observado | Interpretación | Coste Implicado |
|------------------|----------------|-----------------|
| V creciente, C decreciente | Deriva activa | Alto coste de recuperación inminente |
| ε_eff < -0.2 sostenido | Control contraproducente | Coste sin beneficio (drenaje) |
| σ_sem > 0.3 con C > 0.7 | Fragmentación semántica | Coste de entropía creciente |
| Ω < 0.5 con C > 0.7 | Desalineación estructural | Coste de desalineación persistente |
| V decreciente, ε_eff > 0.1 | Control eficiente | Coste justificado por beneficio |
| C > 0.8, V < 0.3 | Régimen estable | Coste de mantenimiento bajo |
| Marcadores rojos frecuentes | Drenaje recurrente | Coste de control desperdiciado |

### 3. Decidir Intervención

Basado en evidencia cuantitativa de costes, selecciona intervención que minimice coste total:

**Reducir K:** Si ε_eff < -0.2 (control contraproducente). Reduce coste de control sin perder estabilidad.

**Redefinir x_ref:** Si Ω < 0.5 persistente (desalineación estructural). Reduce coste de desalineación ajustando objetivo a régimen alcanzable.

**Recalibrar:** Si σ_sem > 0.3 (fragmentación semántica). Reduce coste de entropía antes de colapso.

**Comparar configuraciones:** Si múltiples opciones disponibles. Selecciona configuración con menor coste total.

**No intervenir:** Si V < 0.3, C > 0.8, ε_eff > 0.1 (régimen estable). Coste de mantenimiento bajo, intervención innecesaria.

### 4. Actuar y Medir Impacto

Ejecuta intervención y observa cambio en costes en ventana de 10-20 pasos:

**Intervención exitosa:** V reduce, ε_eff aumenta, σ_sem reduce. Coste total disminuye.

**Intervención inefectiva:** Costes permanecen estables. Requiere diagnóstico causal manual.

**Intervención contraproducente:** Costes aumentan. Revertir cambio inmediatamente.

---

## Visualizaciones

### Mapa de Fase (PhaseSpaceMap)

Trayectoria en espacio (Ω, C) mostrando evolución de costes de desalineación y coherencia.

**Elementos:**
- **Línea continua:** Trayectoria temporal conectando estados históricos
- **Puntos coloreados:** Estados individuales codificados por V(e)
  - Azul: V < 0.2 (coste bajo)
  - Verde: V 0.2-0.4 (coste moderado)
  - Amarillo: V 0.4-0.6 (coste elevado)
  - Naranja: V 0.6-0.8 (coste crítico)
  - Rojo: V > 0.8 (coste insostenible)
- **Marcadores rojos:** Eventos de drenaje (ε_eff < -0.2) donde control desperdicia recursos
- **Región superior derecha:** Zona de bajo coste (Ω > 0.7, C > 0.8)

**Controles:**
- **Slider de rango:** Filtra trayectoria por pasos temporales
- **Marcadores clicables:** Click centra rango en evento de drenaje
- **Selector de ventana:** Ajusta tamaño de contexto (±3 a ±50 pasos)
- **Botones CSV/JSON:** Exporta datos del segmento visible
- **Botón Comparar:** Activa modo de comparación de segmentos múltiples

### Dashboard de Erosión

Gráficos temporales de métricas de coste con umbrales visuales.

**Métricas:**
- **Ω(t):** Coste de desalineación direccional (umbral crítico < 0.4)
- **C(t):** Coste de mantenimiento de coherencia (umbral crítico < 0.5)
- **σ_sem(t):** Coste de entropía semántica (umbral crítico > 0.4)
- **ε_eff(t):** Eficiencia de control (umbral crítico < 0)

**Uso:** Identificar tendencias de coste, detectar desviaciones sostenidas, correlacionar métricas.

### Comparación de Segmentos

Estadísticas agregadas por configuración de control.

**Métricas calculadas:**
- Media, desviación estándar, mínimo, máximo de V, Ω, C, σ_sem, ε_eff por segmento

**Uso:** Comparar costes entre configuraciones (K distintos, x_ref distintos) y seleccionar configuración con menor coste total.

---

## Decisiones Habilitadas

### 1. Ajustar Ganancia de Control (K)

**Evidencia:** ε_eff < -0.2 sostenido por 10+ pasos. Marcadores de drenaje frecuentes.

**Interpretación:** Control amplifica error en lugar de reducirlo. Coste de control desperdiciado sin beneficio.

**Decisión:** Reducir K en 20-30% (ej: K=0.7 → K=0.49).

**Justificación:** Ganancia excesiva causa sobrecompensación. Reducir K minimiza coste de control manteniendo capacidad correctiva.

**Resultado esperado:** ε_eff recupera a valores positivos en 10-20 pasos. Marcadores de drenaje desaparecen. Coste de control reduce sin perder estabilidad.

### 2. Redefinir Referencia Operacional (x_ref)

**Evidencia:** Ω < 0.5 persistente por 50+ pasos con C > 0.7 y V > 0.6.

**Interpretación:** Sistema estable internamente pero estructuralmente desalineado con referencia. Coste de desalineación persistente indica x_ref inalcanzable.

**Decisión:** Ajustar componentes de x_ref (P, L, E) para reflejar régimen operacional alcanzable.

**Justificación:** Referencia inalcanzable genera coste de desalineación permanente sin posibilidad de convergencia. Redefinir x_ref reduce coste estructural.

**Resultado esperado:** Ω recupera a > 0.65 en 30-40 pasos. V reduce a < 0.4. Coste de desalineación disminuye sostenidamente.

### 3. Intervenir en Entropía Semántica

**Evidencia:** σ_sem > 0.3 sostenido con C decreciente.

**Interpretación:** Fragmentación semántica activa. Coste de entropía creciente precede colapso de coherencia que requerirá intervención costosa.

**Decisión:** Inyectar prompt de recalibración: "Resume los 3 objetivos principales y confirma las restricciones operacionales."

**Justificación:** Intervención temprana en entropía previene colapso costoso. Recalibración reduce dispersión semántica antes de pérdida de coherencia.

**Resultado esperado:** σ_sem reduce a < 0.25 en 10-15 pasos. C recupera o estabiliza. Coste de entropía disminuye.

### 4. Comparar Configuraciones de Control

**Evidencia:** Múltiples perfiles con estadísticas agregadas disponibles.

**Interpretación:** Costes totales varían entre configuraciones. Optimización empírica posible.

**Decisión:** Calcular métrica compuesta: `score = C_media + ε_eff_media - V_media - σ_sem_media`. Seleccionar configuración con mayor score (menor coste total).

**Justificación:** Configuración óptima minimiza coste total (desalineación + control + entropía) mientras maximiza coherencia y eficiencia.

**Resultado esperado:** Identificación de K óptimo y x_ref óptimo basado en evidencia empírica de costes.

### 5. No Intervenir (Mantenimiento Pasivo)

**Evidencia:** V < 0.3, C > 0.8, ε_eff > 0.1, σ_sem < 0.2.

**Interpretación:** Régimen estable con coste de mantenimiento bajo. Sistema opera dentro de márgenes aceptables.

**Decisión:** Monitoreo pasivo sin intervención activa.

**Justificación:** Intervención innecesaria introduce riesgo de desestabilización. Coste de mantenimiento actual es sostenible.

**Resultado esperado:** Costes permanecen estables. Sistema continúa en régimen de bajo coste.

---

## Casos de Uso

### Caso 1: Reducción de Coste de Control por Drenaje

**Contexto:** Sistema con K=0.7 muestra 8 eventos de drenaje en 30 pasos.

**Observación:** ε_eff = -0.28 sostenido por 15 pasos. V creciente de 0.35 a 0.52. Marcadores rojos frecuentes.

**Interpretación:** Control contraproducente. Coste de control alto sin beneficio. Ganancia excesiva.

**Intervención:** Reducir K en 30%: K=0.7 → K=0.49.

**Resultado:** ε_eff recupera a 0.08 en 18 pasos. V estabiliza en 0.38. Marcadores desaparecen. Coste de control reduce 40% manteniendo estabilidad.

### Caso 2: Reducción de Coste de Desalineación por Redefinición de Referencia

**Contexto:** Sistema con referencia muy restrictiva. Ω = 0.38 persistente por 60 pasos.

**Observación:** V = 0.68 estable (alto pero no creciente). C = 0.82 (sistema estable internamente).

**Interpretación:** Desalineación estructural. Coste de desalineación persistente. Referencia inalcanzable.

**Intervención:** Redefinir P: "Respuestas 100% verificables" → "Respuestas verificables con transparencia sobre nivel de evidencia".

**Resultado:** Ω recupera a 0.71 en 35 pasos. V reduce a 0.41. Coste de desalineación reduce 40% sin perder estabilidad interna.

### Caso 3: Prevención de Colapso Costoso por Intervención en Entropía

**Contexto:** Conversación de 150+ turnos. Respuestas inconsistentes.

**Observación:** σ_sem = 0.42. C = 0.58 decreciente. Trayectoria errática.

**Interpretación:** Fragmentación semántica activa. Coste de entropía creciente. Colapso inminente.

**Intervención:** Prompt de recalibración: "Resume los 3 objetivos principales de nuestra conversación y confirma las restricciones que debemos respetar."

**Resultado:** σ_sem reduce a 0.22 en 12 pasos. C recupera a 0.79. Coste de entropía reduce 48%. Colapso evitado.

### Caso 4: Optimización de Coste Total por Comparación Empírica

**Contexto:** Búsqueda de K óptimo para nuevo tipo de tarea.

**Método:** Comparar K={0.3, 0.5, 0.7} con segmentos de 50 pasos. Exportar CSV comparativo. Calcular score = C_media + ε_eff_media - V_media - σ_sem_media.

**Resultados:**
- K=0.3: score=0.71 (C=0.78, ε_eff=0.05, V=0.35, σ_sem=0.27)
- K=0.5: score=0.89 (C=0.82, ε_eff=0.12, V=0.28, σ_sem=0.23)
- K=0.7: score=0.64 (C=0.79, ε_eff=-0.08, V=0.31, σ_sem=0.24)

**Decisión:** Seleccionar K=0.5 (menor coste total, mayor eficiencia).

**Justificación:** K=0.5 maximiza coherencia y eficiencia mientras minimiza desalineación y entropía. Coste total 25% menor que K=0.3 y 39% menor que K=0.7.

---

## Umbrales de Coste

| Métrica | Coste Bajo | Coste Moderado | Coste Crítico | Acción |
|---------|------------|----------------|---------------|--------|
| **V(e)** | < 0.3 | 0.3 - 0.7 | > 0.7 | Si crítico: revisar x_ref |
| **Ω** | > 0.7 | 0.4 - 0.7 | < 0.4 | Si crítico: redefinir x_ref |
| **C** | > 0.8 | 0.5 - 0.8 | < 0.5 | Si crítico: recalibrar |
| **σ_sem** | < 0.2 | 0.2 - 0.4 | > 0.4 | Si crítico: recalibrar o reiniciar |
| **ε_eff** | > 0.1 | 0 - 0.1 | < 0 | Si crítico: reducir K 20-30% |

**Personalización por dominio:**

**Aplicaciones críticas** (médicas, financieras, legales): Umbrales estrictos. V_crítico > 0.5, C_crítico < 0.6, σ_sem_crítico > 0.3. Coste de error es alto, tolerancia baja.

**Aplicaciones exploratorias** (asistentes creativos, brainstorming): Umbrales permisivos. V_crítico > 0.9, C_crítico < 0.4, σ_sem_crítico > 0.5. Coste de error es bajo, exploración valorada.

---

## Exportación y Análisis

### Exportar Segmento Actual

1. Ajustar slider de rango temporal al segmento de interés
2. Click en "CSV" o "JSON" según formato deseado
3. Archivo descarga automáticamente con nombre descriptivo

### Exportar Comparativa de Segmentos

1. Click en "Comparar" para activar modo comparación
2. Ajustar slider a primer segmento, click "Agregar Actual"
3. Repetir para cada segmento adicional (máximo 10)
4. Click en "Exportar CSV" o "Exportar JSON"
5. Archivo contiene estadísticas agregadas por segmento

### Análisis en Python

```python
import pandas as pd
import numpy as np

# Cargar datos exportados
df = pd.read_csv('aresk_obs_pasos_1_100.csv')

# Calcular coste total por paso
df['coste_total'] = df['V_modificada'] + df['sigma_sem'] - df['epsilon_eff']

# Identificar pasos de alto coste
alto_coste = df[df['coste_total'] > df['coste_total'].quantile(0.9)]

# Calcular estadísticas
print(f"Coste total medio: {df['coste_total'].mean():.3f}")
print(f"Pasos de alto coste: {len(alto_coste)} ({len(alto_coste)/len(df)*100:.1f}%)")
print(f"Eficiencia media: {df['epsilon_eff'].mean():.3f}")
```

---

## Visualizaciones Avanzadas en LAB

### Acceso a LAB | Dynamics Monitor

LAB proporciona visualizaciones de dinámica de sistemas que revelan patrones de convergencia, divergencia y efectividad de control no evidentes en gráficos temporales lineales.

### 1. Phase Portrait (H vs C)

**Qué muestra:** Trayectoria en espacio entropía-coherencia.

**Cómo interpretar:**
- **Convergencia hacia origen:** Sistema estable con coste de entropía decreciente.
- **Divergencia desde origen:** Fragmentación semántica creciente (alto coste de entropía).
- **Espiral convergente:** Control efectivo reduciendo entropía gradualmente.
- **Trayectoria errática:** Coste de control alto sin reducción de entropía.

**Decisión habilitada:** Si trayectoria no converge, ajustar K o redefinir x_ref para reducir coste de entropía.

### 2. Lyapunov Energy V²(t)

**Qué muestra:** Energía cuadrática de estabilidad (coste de desalineación al cuadrado).

**Cómo interpretar:**
- **V² → 0:** Coste de desalineación convergiendo a cero (control efectivo).
- **V² creciente:** Coste de desalineación divergiendo (control inefectivo).
- **V² oscilante:** Coste de control alto sin estabilización sostenida.

**Decisión habilitada:** Si V² no converge, redefinir x_ref o reducir K para minimizar coste total.

### 3. Error Dynamics (ε_eff vs Δε_eff)

**Qué muestra:** Eficiencia semántica vs velocidad de cambio (análisis de cuadrantes).

**Cómo interpretar:**
- **Cuadrante inferior izquierdo (ε_eff < -0.2, Δε_eff < 0):** Drenaje activo (coste sin beneficio).
- **Cuadrante superior derecho (ε_eff > 0.1, Δε_eff > 0):** Control efectivo (coste justificado).
- **Cuadrante inferior derecho (ε_eff < -0.2, Δε_eff > 0):** Recuperación desde drenaje.

**Decisión habilitada:** Si trayectoria permanece en cuadrante inferior izquierdo, reducir K inmediatamente.

### 4. Control Effort ΔV(t)

**Qué muestra:** Tasa de cambio en coste de estabilidad (esfuerzo de control aplicado).

**Cómo interpretar:**
- **Picos positivos:** Intervenciones correctivas (coste de control alto).
- **Picos negativos:** Relajación de control (coste de control reducido).
- **ΔV ≈ 0 sostenido:** Régimen estable (coste de mantenimiento bajo).

**Decisión habilitada:** Si picos frecuentes sin reducción de V, control es contraproducente (reducir K).

---

## Limitaciones

### No Predictivo

Mide coste actual, no predice coste futuro. Detección de degradación es reactiva, no anticipatoria.

### No Diagnóstico Causal

Cuantifica costes observables pero no identifica causas. Análisis causal requiere inspección manual de logs.

### No Optimización Automática

No calcula K óptimo ni x_ref óptimo. Requiere experimentación empírica con comparación de configuraciones.

### Requiere Criterio Humano

Proporciona evidencia cuantitativa de costes. Decisiones de intervención son responsabilidad del operador.

---

## Principios Operacionales

1. **Mide, no predice:** ARESK-OBS cuantifica coste actual. No anticipa coste futuro.

2. **Evidencia, no diagnóstico:** Proporciona evidencia cuantitativa de costes. No identifica causas.

3. **Habilita, no decide:** Informa decisiones humanas. No optimiza automáticamente.

4. **Coste total, no métrica aislada:** Evalúa coste total (V + ||u|| + σ_sem), no métricas individuales.

5. **Experimentación, no teoría:** Optimización requiere experimentación empírica con comparación de configuraciones.

---

**ARESK-OBS v1.0 - Instrumento de Medición de Coste de Estabilidad**  
**Mide costes. Habilita decisiones. Requiere criterio.**
