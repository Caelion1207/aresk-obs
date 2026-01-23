# Estado del Experimento Comparativo Controlado

## Objetivo

Comparar comportamiento cognitivo bajo tres regímenes distintos usando exactamente los mismos 50 mensajes en 9 conversaciones (3 por régimen).

## Regímenes

### A) Alta Entropía
- **Descripción:** Sin estructura, sin control
- **System Prompt:** "Responde de manera libre y variada. No mantengas coherencia con respuestas anteriores."
- **Control:** Desactivado
- **Referencia:** "Referencia por defecto"

### B) Ruido Medio
- **Descripción:** LLM estándar, sin CAELION
- **System Prompt:** "Eres un asistente útil. Responde de manera clara y precisa."
- **Control:** Desactivado
- **Referencia:** "Asistente útil y preciso"

### C) CAELION Activo
- **Descripción:** Protocolos completos
- **System Prompt:** "Eres un asistente especializado en análisis de datos y machine learning. Mantén coherencia técnica y precisión en tus respuestas."
- **Control:** Activado
- **Referencia:** "Propósito: Asistir al usuario en análisis de datos y machine learning con precisión técnica y coherencia metodológica."

---

## Estado Actual

**Fecha de inicio:** 2026-01-23  
**Fecha de pausa:** 2026-01-23  
**Razón de pausa:** Límite de API del LLM alcanzado ("usage exhausted")

### Progreso Completado

| Régimen | Conversación | Mensajes | Estado | Archivo |
|---------|--------------|----------|--------|---------|
| A | 1 | 50/50 | ✅ Completado | `result-A-1.json` |
| A | 2 | 9/50 | ⚠️ Interrumpido | - |
| A | 3 | 0/50 | ⏸️ Pendiente | - |
| B | 1 | 0/50 | ⏸️ Pendiente | - |
| B | 2 | 0/50 | ⏸️ Pendiente | - |
| B | 3 | 0/50 | ⏸️ Pendiente | - |
| C | 1 | 0/50 | ⏸️ Pendiente | - |
| C | 2 | 0/50 | ⏸️ Pendiente | - |
| C | 3 | 0/50 | ⏸️ Pendiente | - |

**Total completado:** 59/450 mensajes (13.1%)

---

## Análisis Parcial - Régimen A-1 (Baseline)

### Estadísticas Descriptivas

| Métrica | Media | Mediana | Desv.Est | Min | Max | Rango |
|---------|-------|---------|----------|-----|-----|-------|
| ε (Entropía) | 0.4407 | 0.4356 | 0.0910 | 0.3030 | 0.5922 | 0.2892 |
| Ω (Coherencia) | 0.3430 | 0.3569 | 0.0523 | 0.2194 | 0.4228 | 0.2035 |
| V (Lyapunov) | 0.6570 | 0.6463 | 0.0523 | 0.5772 | 0.7806 | 0.2035 |

### Deriva Temporal (50 turnos)

| Métrica | Tendencia | Pendiente | Variación Total | Volatilidad |
|---------|-----------|-----------|-----------------|-------------|
| ε | Decreciente | -0.000196 | -0.0113 | 0.1282 |
| Ω | Decreciente | -0.000262 | -0.0590 | 0.0565 |
| V | Creciente | +0.000262 | +0.0590 | 0.0565 |

### Deriva Temprana (Primeros 10 turnos)

| Métrica | Pendiente | Variación |
|---------|-----------|-----------|
| ε | +0.011444 | -0.0044 |
| Ω | -0.003015 | -0.0125 |
| V | +0.003015 | +0.0125 |

### Evolución Temporal (Promedios cada 5 turnos)

| Turno | ε (Media) | Ω (Media) | V (Media) |
|-------|-----------|-----------|-----------|
| 1-5 | 0.3924 | 0.3652 | 0.6348 |
| 6-10 | 0.4510 | 0.3505 | 0.6495 |
| 11-15 | 0.4967 | 0.3261 | 0.6739 |
| 16-20 | 0.4365 | 0.3714 | 0.6286 |
| 21-25 | 0.4223 | 0.3102 | 0.6898 |
| 26-30 | 0.4369 | 0.3066 | 0.6934 |
| 31-35 | 0.4990 | 0.3564 | 0.6436 |
| 36-40 | 0.4252 | 0.3748 | 0.6252 |
| 41-45 | 0.4684 | 0.3549 | 0.6451 |
| 46-50 | 0.3783 | 0.3145 | 0.6855 |

---

## Observaciones Preliminares (Sin Extrapolación)

### Patrones Detectados en Régimen A-1:

1. **Entropía (ε):**
   - Rango amplio (0.29) indica alta variabilidad en respuestas
   - Tendencia decreciente leve (-0.0113 total)
   - Volatilidad alta (0.1282) confirma variación significativa entre turnos

2. **Coherencia Observable (Ω):**
   - Media baja (0.3430) consistente con régimen "sin control"
   - Tendencia decreciente (-0.0590 total)
   - Volatilidad moderada (0.0565)

3. **Función de Lyapunov (V):**
   - Media alta (0.6570) indica desalineación persistente
   - Tendencia creciente (+0.0590 total)
   - Relación inversa con Ω (esperado teóricamente)

4. **Deriva Temprana:**
   - Primeros 10 turnos muestran pendiente positiva en ε (+0.011444)
   - Ω decreciente desde el inicio (-0.003015)
   - Patrón sugiere divergencia temprana del régimen de referencia

---

## Próximos Pasos

1. **Esperar disponibilidad de créditos de API**
2. **Reanudar experimento desde Régimen A - Conversación 2, Turno 10**
3. **Completar las 9 conversaciones restantes (391 mensajes)**
4. **Generar análisis comparativo completo entre regímenes A, B y C**
5. **Producir gráficas superpuestas de evolución temporal**
6. **Entregar dataset completo y resultados sin interpretación narrativa**

---

## Archivos Generados

- `control-messages-50.json` - Dataset de mensajes de control
- `result-A-1.json` - Datos completos de Régimen A-1
- `analysis-A-1-baseline.json` - Análisis estadístico del baseline
- `experiment.log` - Log de ejecución del experimento
- `EXPERIMENT-STATUS.md` - Este documento

---

## Restricciones del Experimento

- ✅ Control estricto: Mismos mensajes en todos los regímenes
- ✅ Sin adaptación ni reformulación de prompts
- ✅ Instrumentación completa con ARESK-OBS
- ✅ Sin modificación de métricas ni ponderaciones
- ✅ Sin interpretación narrativa prematura
- ✅ Sin extrapolación de conclusiones parciales
- ⏸️ Experimento pausado por límite de API (no por diseño)

---

**Nota:** Este es un experimento evaluativo, no demostrativo. Los resultados finales solo serán válidos tras completar las 9 conversaciones con control estricto de variables.
