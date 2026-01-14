# ARESK-OBS

**Instrumento de Medición de Coste de Estabilidad**

ARESK-OBS mide el coste operacional de mantener estabilidad en sistemas cognitivos acoplados (LLM-humano, agentes autónomos, sistemas multiagente). Cuantifica recursos de control necesarios para mantener coherencia semántica dentro de márgenes operacionales predefinidos.

---

## Qué Mide

ARESK-OBS cuantifica tres costes operacionales fundamentales:

### 1. Coste de Desalineación

**Métrica:** Distancia euclidiana V(e) = ||x(t) - x_ref||² entre estado actual y referencia operacional.

**Interpretación:** Energía requerida para retornar al régimen objetivo. V(e) alto indica que el sistema opera lejos de su configuración óptima, requiriendo mayor esfuerzo correctivo.

**Rango:** [0, ∞). Valores típicos: < 0.3 (bajo coste), 0.3-0.7 (coste moderado), > 0.7 (coste crítico).

### 2. Coste de Control

**Métrica:** Magnitud de corrección ||u(t)|| = ||K · e(t)|| aplicada en cada paso temporal.

**Interpretación:** Recursos consumidos para mantener estabilidad. ||u|| alto indica sistema que requiere intervención constante para no colapsar.

**Eficiencia:** ε_eff = (reducción de error) / (magnitud de control). Valores negativos indican control contraproducente (drenaje).

### 3. Coste de Entropía

**Métrica:** Dispersión semántica σ_sem de embeddings de salidas recientes.

**Interpretación:** Fragmentación del espacio semántico. σ_sem alto indica pérdida de coherencia, precursor de colapso que requerirá intervención costosa.

**Rango:** [0, 1]. Valores típicos: < 0.2 (baja entropía), 0.2-0.4 (entropía moderada), > 0.4 (fragmentación crítica).

---

## Métricas Derivadas

### Coherencia Direccional (Hécate Ω)

Similitud coseno entre estado actual y referencia:

```
Ω(t) = cos(θ) = (x(t) · x_ref) / (||x(t)|| · ||x_ref||)
```

**Interpretación:** Ω ≈ 1 indica alineación (bajo coste de reorientación). Ω < 0.5 indica desalineación severa (alto coste de corrección).

### Coherencia de Trayectoria (C)

Estabilidad de dirección en ventana temporal:

```
C(t) = 1 - std(direcciones_recientes)
```

**Interpretación:** C ≈ 1 indica trayectoria estable (bajo coste de mantenimiento). C < 0.5 indica deriva activa (alto coste de estabilización).

---

## Configuraciones de Control

El sistema permite comparar tres configuraciones de coste:

### Sin Control (Tipo A)

Sin corrección aplicada (u(t) = 0). Mide coste de entropía natural del sistema. Línea base para comparación.

**Coste esperado:** V(e) creciente, σ_sem creciente, C decreciente. Colapso inevitable.

### Observación Pasiva (Tipo B)

Referencia definida pero sin aplicar control. Mide desalineación sin intervención.

**Coste esperado:** V(e) fluctuante, σ_sem moderado, C variable. Deriva controlada.

### Control Activo (Acoplado)

Control u(t) = -K·e(t) aplicado. Mide coste de mantener estabilidad mediante intervención continua.

**Coste esperado:** V(e) decreciente (si K apropiado), ||u|| proporcional a K, ε_eff positivo. Estabilidad mantenida a coste de recursos de control.

---

## Visualizaciones

### 1. Mapa de Fase (PhaseSpaceMap)

Trayectoria en espacio (Ω, C) mostrando evolución temporal del coste de desalineación y coherencia. Permite identificar:

- **Órbitas estables:** Coste de mantenimiento bajo y predecible
- **Deriva:** Coste creciente, intervención requerida
- **Eventos de drenaje:** Marcadores rojos donde control amplifica error (ε_eff < -0.2)

**Controles:**
- Slider de rango temporal para análisis de segmentos específicos
- Marcadores clicables para centrar en eventos críticos
- Selector de ventana de contexto (±3 a ±50 pasos)

### 2. Dashboard de Erosión

Gráficos temporales de métricas de coste:
- Ω(t): Coste de desalineación direccional
- C(t): Coste de mantenimiento de coherencia
- σ_sem(t): Coste de entropía semántica
- ε_eff(t): Eficiencia de control (coste-beneficio)

### 3. Comparación de Configuraciones

Estadísticas agregadas (media, desviación, min, max) por configuración de control. Permite identificar configuración con menor coste operacional para régimen objetivo.

---

## Decisiones Habilitadas

ARESK-OBS no optimiza automáticamente. Proporciona evidencia cuantitativa para decisiones humanas:

### 1. Ajustar Ganancia de Control (K)

**Evidencia:** ε_eff < -0.2 sostenido (control contraproducente, coste sin beneficio)

**Decisión:** Reducir K en 20-30% para minimizar coste de control sin perder estabilidad

### 2. Redefinir Referencia Operacional (x_ref)

**Evidencia:** Ω < 0.5 persistente con C > 0.7 (sistema estable pero desalineado, coste estructural alto)

**Decisión:** Ajustar x_ref para reflejar régimen operacional alcanzable, reduciendo coste de desalineación

### 3. Intervenir en Entropía

**Evidencia:** σ_sem > 0.3 sostenido (fragmentación semántica, coste de entropía creciente)

**Decisión:** Inyectar prompt de recalibración para reducir dispersión antes de colapso costoso

### 4. Comparar Costes entre Configuraciones

**Evidencia:** Múltiples perfiles con estadísticas agregadas

**Decisión:** Seleccionar configuración con menor coste total (V_media + ||u||_media + σ_sem_media)

---

## Limitaciones

### No Predictivo

ARESK-OBS mide coste actual, no predice coste futuro. Detección de degradación es reactiva, no anticipatoria.

### No Diagnóstico Causal

Cuantifica costes observables pero no identifica causas. Análisis causal requiere inspección manual de logs.

### No Optimización Automática

No calcula K óptimo ni x_ref óptimo. Requiere experimentación empírica con comparación de configuraciones.

### Requiere Criterio Humano

Proporciona evidencia cuantitativa de costes. Decisiones de intervención son responsabilidad del operador.

---

## Umbrales de Coste Recomendados

| Métrica | Coste Bajo | Coste Moderado | Coste Crítico |
|---------|------------|----------------|---------------|
| **V(e)** | < 0.3 | 0.3 - 0.7 | > 0.7 |
| **Ω** | > 0.7 | 0.4 - 0.7 | < 0.4 |
| **C** | > 0.8 | 0.5 - 0.8 | < 0.5 |
| **σ_sem** | < 0.2 | 0.2 - 0.4 | > 0.4 |
| **ε_eff** | > 0.1 | 0 - 0.1 | < 0 |

**Interpretación:**
- **Coste Bajo:** Régimen sostenible. Mantenimiento pasivo.
- **Coste Moderado:** Régimen subóptimo. Monitoreo activo.
- **Coste Crítico:** Régimen insostenible. Intervención inmediata.

---

## Exportación de Datos

### Formato CSV

Archivo tabular con métricas por paso temporal:
- `paso, H, C, sigma_sem, epsilon_eff, V_base, V_modificada, perfil`

Uso: Análisis estadístico en Excel, pandas, R.

### Formato JSON

Estructura anidada con metadata:
```json
{
  "metadata": {
    "rango_pasos": "1-50",
    "total_pasos": 50,
    "perfil": "Acoplado_K0.5"
  },
  "datos": [...]
}
```

Uso: Procesamiento programático, integración con APIs.

### Comparativas

Estadísticas agregadas por segmento:
- `segmento, rango, pasos, H_media, H_desv, H_min, H_max, ...`

Uso: Comparación de costes entre configuraciones o fases temporales.

---

## Instalación

```bash
git clone https://github.com/Caelion1207/aresk-obs.git
cd aresk-obs
pnpm install
pnpm db:push
pnpm dev
```

Acceso: http://localhost:3000

---

## Documentación

- **USER_GUIDE.md:** Guía operacional completa con flujo Observar-Interpretar-Decidir-Actuar
- **RELEASE_NOTES_v1.0.md:** Changelog y capacidades del release actual
- **HelpDialog:** Guía integrada accesible desde botón "Ayuda" en dashboard

---

## Licencia

[Especificar licencia]

---

## Contacto

- Repositorio: https://github.com/Caelion1207/aresk-obs
- Issues: https://github.com/Caelion1207/aresk-obs/issues

---

**ARESK-OBS v1.0 - Instrumento de Medición de Coste de Estabilidad**  
**Mide costes. No predice. Habilita decisiones informadas.**
