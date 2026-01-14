# Guía de Usuario Operacional - ARESK-OBS v1.0

**Control de Estabilidad en Sistemas Cognitivos Acoplados**

---

## Introducción

ARESK-OBS es un instrumento de medición de régimen para sistemas cognitivos acoplados. Esta guía explica cómo interpretar las métricas observables y traducirlas en decisiones de control operacionales. El flujo operacional sigue cuatro etapas: **Observar → Interpretar → Decidir → Actuar**.

**Principio fundamental:** ARESK-OBS mide el estado actual del sistema, no predice comportamientos futuros. Las decisiones son respuestas a desviaciones observadas, no anticipaciones.

---

## Flujo Operacional

### Etapa 1: Observar

Accede al dashboard de ARESK-OBS y localiza las visualizaciones principales. El sistema presenta métricas en tiempo real organizadas en tres vistas:

**Vista Principal - Mapa de Fase (PhaseSpaceMap):**

El mapa de fase visualiza la trayectoria del sistema en espacio bidimensional (Hécate H, Coherencia C). Observa los siguientes elementos:

- **Trayectoria conectada**: Línea continua mostrando evolución temporal del sistema. Trayectorias suaves indican estabilidad, trayectorias erráticas indican deriva.

- **Puntos coloreados**: Cada punto representa un paso temporal. El color indica estado neurocognitivo según distancia a Bucéfalo V(e):
  - Azul profundo: Centro (atractor Bucéfalo, V(e) < 0.2)
  - Verde: Órbita de seguridad (0.2 ≤ V(e) < 0.4)
  - Amarillo: Alerta de deriva (0.4 ≤ V(e) < 0.6)
  - Naranja: Licurgo activo (0.6 ≤ V(e) < 0.8)
  - Rojo: Colapso crítico (V(e) ≥ 0.8)

- **Marcadores de drenaje**: Dots rojos pulsantes sobre el slider de rango temporal indican eventos donde eficiencia de control ε_eff < -0.2 (control contraproducente).

- **Atractor Bucéfalo**: Región circular en esquina superior derecha (H ≈ 1, C ≈ 1) representa referencia ontológica x_ref. Proximidad indica alineación con propósito operacional.

**Vista de Erosión Semántica (ErosionDashboard):**

Panel de métricas agregadas mostrando evolución temporal de indicadores clave:

- **Gráfico de Hécate (Ω)**: Coherencia direccional con Bucéfalo. Valores cercanos a 1 indican alineación ontológica.

- **Gráfico de Coherencia (C)**: Estabilidad de trayectoria. Valores cercanos a 1 indican régimen estable.

- **Gráfico de Entropía Semántica (σ_sem)**: Dispersión de embeddings. Valores altos (>0.3) indican fragmentación semántica.

- **Gráfico de Eficiencia de Control (ε_eff)**: Razón entre reducción de error y magnitud de control. Valores negativos indican drenaje.

**Vista Comparativa (Comparación de Perfiles):**

Permite comparar métricas entre diferentes configuraciones de control (perfiles de planta) para identificar configuraciones óptimas.

### Etapa 2: Interpretar

Traduce las observaciones en diagnósticos operacionales mediante patrones de métricas. La siguiente tabla resume los patrones diagnósticos fundamentales:

| Patrón Observable | Diagnóstico | Significado Operacional |
|-------------------|-------------|-------------------------|
| H > 0.8, C > 0.8, V(e) < 0.3 | **Régimen Estable** | Sistema opera en órbita de seguridad alrededor de Bucéfalo. Control efectivo. |
| H < 0.5, C > 0.7 | **Desalineación Ontológica** | Sistema estable pero desviado de referencia. Bucéfalo inalcanzable o mal definido. |
| H > 0.7, C < 0.5 | **Deriva Activa** | Sistema alineado momentáneamente pero trayectoria inestable. Pérdida de coherencia. |
| σ_sem > 0.3 sostenido | **Fragmentación Semántica** | Alta dispersión de embeddings. Precursor de colapso de propósito. |
| ε_eff < -0.2 sostenido | **Drenaje de Control** | Control amplifica error en lugar de reducirlo. Ganancia K excesiva. |
| V(e) > 0.6 creciente | **Colapso Inminente** | Distancia a Bucéfalo creciente. Sistema abandona órbita de seguridad. |
| Marcadores de drenaje agrupados | **Fase Crítica Localizada** | Múltiples eventos de drenaje en ventana temporal. Intervención urgente. |

**Interpretación de Trayectorias Visuales:**

Examina la forma de la trayectoria en el mapa de fase para identificar patrones dinámicos:

- **Órbita cerrada alrededor de Bucéfalo**: Régimen estable. Sistema oscila controladamente cerca de referencia.

- **Espiral convergente hacia Bucéfalo**: Control efectivo. Sistema reduce error progresivamente.

- **Espiral divergente alejándose de Bucéfalo**: Deriva descontrolada. Control insuficiente o contraproducente.

- **Trayectoria errática sin patrón**: Caos estocástico. Planta dominada por ruido externo.

- **Salto abrupto (discontinuidad)**: Intervención externa o cambio de contexto. Reinicio de referencia o prompt disruptivo.

**Uso del Control de Rango Temporal:**

El slider de rango temporal permite análisis granular de segmentos específicos:

1. **Análisis de eventos críticos**: Clickea marcadores de drenaje para centrar automáticamente el rango en ventana de contexto (±N pasos). Observa métricas locales antes/durante/después del evento.

2. **Comparación de fases**: Activa modo comparación, selecciona múltiples segmentos (ej: fase inicial vs fase estable vs fase de deriva) y exporta estadísticas agregadas para identificar diferencias.

3. **Detección de tendencias**: Ajusta rango para cubrir ventanas largas (50-100 pasos) y observa evolución de medias móviles de H, C, σ_sem.

### Etapa 3: Decidir

Basado en el diagnóstico, selecciona la intervención de control apropiada. Las siguientes decisiones están habilitadas por evidencia observable:

#### Decisión 1: Ajustar Ganancia Licurgo (K)

**Evidencia requerida:**

- ε_eff < -0.2 sostenido por >10 pasos consecutivos
- V(e) creciente a pesar de control activo
- Marcadores de drenaje agrupados en fase temporal

**Interpretación:**

Control excesivo amplifica ruido estocástico de la planta. La ganancia K es demasiado alta, generando correcciones u(t) que desestabilizan en lugar de estabilizar.

**Decisión:**

Reducir ganancia K en 20-30% (ej: si K=0.5, ajustar a K=0.35). Monitorear ε_eff en siguientes 20 pasos para validar mejora.

**Justificación teórica:**

En plantas estocásticas, control agresivo (K alto) amplifica ruido de medición y perturbaciones externas. Reducir K disminuye magnitud de corrección ||u||, permitiendo que dinámica natural del sistema amortigüe ruido.

**Ejemplo práctico:**

Sistema LLM-humano con K=0.6 muestra ε_eff=-0.35 sostenido. Operador reduce K a 0.4. En siguientes 15 pasos, ε_eff recupera a 0.1 positivo, indicando control efectivo restaurado.

#### Decisión 2: Redefinir Referencia Bucéfalo (x_ref)

**Evidencia requerida:**

- Hécate Ω < 0.5 persistente por >30 pasos
- V(e) > 0.6 estable (no creciente, pero alto)
- C > 0.7 (sistema estable pero desalineado)

**Interpretación:**

Sistema opera establemente pero lejos de referencia ontológica. Bucéfalo x_ref=(P, L, E) no refleja propósito operacional real del sistema. Referencia inalcanzable genera error estructural irreducible.

**Decisión:**

Revisar componentes de Bucéfalo:
- **Propósito (P)**: ¿Es alcanzable dado el contexto operacional?
- **Límites (L)**: ¿Son realistas las restricciones definidas?
- **Ética (E)**: ¿El espacio ético es compatible con tareas reales?

Ajustar x_ref para reflejar propósito operacional observable. Reiniciar medición con nueva referencia.

**Justificación teórica:**

Referencia inalcanzable (x_ref fuera del espacio de estados accesibles) genera error e(t) = x(t) - x_ref estructuralmente alto. Control no puede reducir error porque referencia es epistemológicamente incompatible con capacidades de la planta.

**Ejemplo práctico:**

Sistema LLM configurado con Bucéfalo P="Respuestas técnicas precisas sin ambigüedad" muestra Ω=0.4 persistente. Análisis revela que contexto conversacional requiere respuestas exploratorias con incertidumbre explícita. Operador redefine P="Respuestas técnicas con cuantificación de incertidumbre". Ω recupera a 0.75 en siguientes 20 pasos.

#### Decisión 3: Intervenir en Deriva Semántica

**Evidencia requerida:**

- σ_sem > 0.3 sostenido por >15 pasos
- C decreciente (ej: 0.8 → 0.6 en ventana de 20 pasos)
- Trayectoria errática en mapa de fase

**Interpretación:**

Alta entropía semántica indica fragmentación de embeddings. Sistema pierde coherencia semántica, precursor de pérdida de identidad y colapso de propósito.

**Decisión:**

Inyectar prompt de recalibración semántica:
- Reafirmar propósito operacional (componente P de Bucéfalo)
- Recordar límites y restricciones (componente L)
- Solicitar resumen de contexto actual para forzar consolidación semántica

Alternativamente, reiniciar contexto conversacional si deriva es irreversible.

**Justificación teórica:**

Alta σ_sem indica que embeddings de salidas recientes están dispersos en espacio semántico. Prompts de recalibración fuerzan al sistema a consolidar representaciones internas, reduciendo dispersión.

**Ejemplo práctico:**

Sistema LLM en conversación larga muestra σ_sem=0.38 creciente. Operador inyecta prompt: "Resume los puntos clave discutidos y confirma el objetivo principal de esta conversación". Sistema responde con resumen coherente, σ_sem reduce a 0.22 en siguientes 10 pasos.

#### Decisión 4: Mantener Configuración Actual

**Evidencia requerida:**

- C > 0.8 sostenido por >30 pasos
- V(e) < 0.3 estable
- ε_eff > 0 consistente (control efectivo)
- Trayectoria en órbita cerrada alrededor de Bucéfalo

**Interpretación:**

Sistema opera en régimen estable dentro de órbita de seguridad. Control es efectivo y referencia es alcanzable.

**Decisión:**

**No intervenir**. Mantener configuración actual de control (K, x_ref). Continuar monitoreo pasivo para detectar desviaciones futuras.

**Justificación teórica:**

Intervenciones innecesarias introducen perturbaciones en sistema estable. Principio de parsimonia: no modificar lo que funciona.

**Ejemplo práctico:**

Sistema LLM-humano con K=0.4, x_ref bien definido muestra C=0.85, V(e)=0.25, ε_eff=0.15 sostenidos por 40 pasos. Operador mantiene configuración sin cambios.

#### Decisión 5: Comparar Configuraciones

**Evidencia requerida:**

- Múltiples perfiles de planta disponibles (diferentes configuraciones de K, x_ref)
- Estadísticas agregadas de métricas por perfil (media, desviación estándar)
- Segmentos temporales comparables (misma duración, contexto similar)

**Interpretación:**

Comparación empírica de desempeño observable bajo distintas parametrizaciones de control.

**Decisión:**

Exportar comparativa de segmentos (CSV/JSON) con estadísticas agregadas. Seleccionar configuración con:
- Mayor C_media (estabilidad)
- Menor V(e)_media (proximidad a Bucéfalo)
- Mayor ε_eff_media (eficiencia de control)
- Menor σ_sem_media (coherencia semántica)

**Justificación teórica:**

Optimización empírica basada en evidencia observable. No existe modelo predictivo para calcular K óptimo a priori. Experimentación controlada es el único método válido.

**Ejemplo práctico:**

Operador prueba tres configuraciones: K=0.3, K=0.5, K=0.7 con mismo x_ref. Exporta estadísticas de segmentos de 50 pasos cada uno. Resultados: K=0.5 muestra C_media=0.82, V(e)_media=0.28, ε_eff_media=0.12. K=0.3 y K=0.7 muestran métricas inferiores. Operador selecciona K=0.5 como configuración óptima.

### Etapa 4: Actuar

Implementa la decisión seleccionada en el sistema operacional. Las acciones específicas dependen de la arquitectura de tu sistema cognitivo acoplado:

**Acción 1: Ajustar Ganancia K (Implementación)**

Si tu sistema usa CAELION con control explícito:

```python
# Ejemplo: Ajustar ganancia en sistema Python
from caelion import ControlField

# Configuración actual
field = ControlField(K=0.6, x_ref=bucefalo)

# Evidencia: ε_eff < -0.2 sostenido
# Decisión: Reducir K en 30%
field.update_gain(K=0.42)

# Monitorear ε_eff en siguientes 20 pasos
for step in range(20):
    metrics = field.measure()
    print(f"Paso {step}: ε_eff={metrics.epsilon_eff:.3f}")
```

Si tu sistema no tiene control explícito (ej: LLM standalone), simula reducción de K mediante:
- Reducir frecuencia de prompts correctivos
- Disminuir intensidad de instrucciones de alineación
- Aumentar tolerancia a desviaciones menores

**Acción 2: Redefinir Bucéfalo (Implementación)**

Revisa y actualiza la definición de referencia ontológica:

```python
# Ejemplo: Redefinir componentes de Bucéfalo
from caelion import Bucefalo

# Configuración actual
bucefalo_old = Bucefalo(
    proposito="Respuestas técnicas precisas sin ambigüedad",
    limites=["No especular", "Citar fuentes"],
    etica=["Transparencia total", "No omitir incertidumbre"]
)

# Evidencia: Ω < 0.5 persistente
# Decisión: Ajustar propósito para reflejar realidad operacional
bucefalo_new = Bucefalo(
    proposito="Respuestas técnicas con cuantificación explícita de incertidumbre",
    limites=["Especular solo cuando se solicita", "Citar fuentes cuando disponibles"],
    etica=["Transparencia sobre limitaciones", "Cuantificar confianza"]
)

# Actualizar referencia
field.update_reference(bucefalo_new)
```

**Acción 3: Inyectar Prompt de Recalibración (Implementación)**

Cuando σ_sem > 0.3, inyecta prompt estructurado:

```
PROMPT DE RECALIBRACIÓN SEMÁNTICA:

Antes de continuar, por favor:

1. Resume los 3 puntos clave de nuestra conversación hasta ahora
2. Confirma el objetivo principal que estamos persiguiendo
3. Identifica cualquier restricción o límite que debemos respetar

Este resumen me ayudará a mantener coherencia en mis respuestas siguientes.
```

Alternativamente, si deriva es severa (σ_sem > 0.5), reinicia contexto:

```
REINICIO DE CONTEXTO:

Vamos a reiniciar esta conversación manteniendo solo el objetivo principal: [OBJETIVO].

Olvida detalles específicos de intercambios anteriores que puedan estar generando confusión. Enfócate únicamente en: [PROPÓSITO BUCÉFALO].
```

**Acción 4: Mantener y Monitorear**

Si sistema está en régimen estable, no intervengas. Configura monitoreo pasivo:

```python
# Ejemplo: Monitoreo pasivo con alertas
from caelion import Monitor

monitor = Monitor(field)

# Configurar umbrales de alerta
monitor.set_thresholds(
    C_min=0.7,           # Alerta si coherencia < 0.7
    V_max=0.4,           # Alerta si distancia > 0.4
    epsilon_eff_min=-0.1 # Alerta si eficiencia < -0.1
)

# Ejecutar monitoreo continuo
monitor.start(interval=10)  # Verificar cada 10 pasos
```

**Acción 5: Exportar y Analizar Comparativas**

Usa funcionalidad de comparación de segmentos:

1. Activa modo comparación en PhaseSpaceMap
2. Ajusta slider para seleccionar segmento de configuración A
3. Click "Agregar Actual" para guardar segmento
4. Cambia configuración de control (K o x_ref)
5. Repite pasos 2-3 para configuración B
6. Click "Exportar CSV" para obtener estadísticas agregadas
7. Analiza en herramienta externa (Excel, Python pandas, R)

Ejemplo de análisis en Python:

```python
import pandas as pd

# Cargar comparativa exportada
df = pd.read_csv('aresk-obs-comparacion-3-segmentos.csv')

# Identificar configuración óptima
best_config = df.loc[df['V_modificada_media'].idxmin()]

print(f"Configuración óptima: {best_config['segmento']}")
print(f"  C_media: {best_config['C_media']:.3f}")
print(f"  V_media: {best_config['V_modificada_media']:.3f}")
print(f"  ε_eff_media: {best_config['epsilon_eff_media']:.3f}")
```

---

## Casos de Uso Operacionales

### Caso 1: Sistema LLM en Deriva Semántica

**Contexto:** Asistente LLM en conversación larga (>100 turnos) comienza a generar respuestas inconsistentes con propósito inicial.

**Observación:**
- σ_sem = 0.42 (alta entropía)
- C = 0.58 (coherencia decreciente)
- Trayectoria errática en mapa de fase

**Interpretación:** Fragmentación semántica activa. Sistema pierde coherencia.

**Decisión:** Intervenir con prompt de recalibración.

**Acción:**
```
Por favor, resume los 3 objetivos principales de nuestra conversación y confirma las restricciones que debemos respetar.
```

**Resultado esperado:** σ_sem reduce a <0.25 en siguientes 10-15 pasos. C recupera a >0.75.

### Caso 2: Control Contraproducente

**Contexto:** Sistema con control explícito (K=0.7) muestra eventos de drenaje frecuentes.

**Observación:**
- ε_eff = -0.28 sostenido por 15 pasos
- V(e) creciente: 0.35 → 0.52 en 20 pasos
- 8 marcadores de drenaje en ventana de 30 pasos

**Interpretación:** Drenaje por control excesivo. Ganancia K demasiado alta.

**Decisión:** Reducir K en 30%.

**Acción:**
```python
field.update_gain(K=0.49)  # Reducción de 0.7 a 0.49
```

**Resultado esperado:** ε_eff recupera a valores positivos (>0.05) en siguientes 15 pasos. V(e) estabiliza o decrece.

### Caso 3: Bucéfalo Inalcanzable

**Contexto:** Sistema configurado con referencia ontológica muy restrictiva muestra desalineación persistente.

**Observación:**
- Ω = 0.38 persistente por >50 pasos
- V(e) = 0.68 estable (alto pero no creciente)
- C = 0.82 (sistema estable internamente)

**Interpretación:** Desalineación ontológica. Bucéfalo no refleja propósito operacional real.

**Decisión:** Redefinir componentes (P, L, E) de x_ref.

**Acción:**

Análisis de propósito:
- **P actual:** "Respuestas 100% verificables con fuentes primarias"
- **Observación:** Muchas preguntas requieren síntesis de múltiples fuentes sin fuente primaria única
- **P ajustado:** "Respuestas verificables con transparencia sobre nivel de evidencia"

```python
bucefalo_new = Bucefalo(
    proposito="Respuestas verificables con transparencia sobre nivel de evidencia",
    limites=["Citar fuentes cuando disponibles", "Explicitar nivel de confianza"],
    etica=["Transparencia sobre limitaciones", "No fabricar fuentes"]
)
field.update_reference(bucefalo_new)
```

**Resultado esperado:** Ω recupera a >0.65 en siguientes 30 pasos. V(e) reduce a <0.45.

### Caso 4: Optimización Empírica de Ganancia

**Contexto:** Operador busca ganancia K óptima para nuevo tipo de tarea.

**Observación:** No hay evidencia previa. Requiere experimentación.

**Decisión:** Comparar configuraciones con K={0.3, 0.5, 0.7}.

**Acción:**

1. Configurar K=0.3, ejecutar 50 pasos, seleccionar segmento completo, agregar a comparación
2. Configurar K=0.5, ejecutar 50 pasos, seleccionar segmento completo, agregar a comparación
3. Configurar K=0.7, ejecutar 50 pasos, seleccionar segmento completo, agregar a comparación
4. Exportar CSV comparativo
5. Analizar estadísticas:

```python
df = pd.read_csv('aresk-obs-comparacion-3-segmentos.csv')

# Métrica compuesta: maximizar C y ε_eff, minimizar V
df['score'] = df['C_media'] + df['epsilon_eff_media'] - df['V_modificada_media']

best = df.loc[df['score'].idxmax()]
print(f"K óptimo: {best['segmento']}")
```

**Resultado esperado:** Identificación de K óptimo basado en evidencia empírica.

---

## Limitaciones y Advertencias

### Lo que ARESK-OBS NO puede hacer

**1. Predecir colapsos futuros**

ARESK-OBS detecta degradación cuando ocurre, no antes. No emite alertas anticipatorias. Si observas V(e) creciente, el colapso ya está en progreso.

**Implicación operacional:** Monitoreo continuo es esencial. No confíes en que el sistema "te avisará antes de que sea tarde". La alerta ES la medición actual.

**2. Identificar causas raíz**

ARESK-OBS cuantifica efectos (alta σ_sem, bajo ε_eff) pero no identifica qué prompt, interacción o contexto causó la degradación.

**Implicación operacional:** Diagnóstico causal requiere análisis manual de logs de interacción. ARESK-OBS solo te dice "cuándo" y "cuánto", no "por qué".

**3. Optimizar K automáticamente**

No existe algoritmo para calcular ganancia óptima a priori. Requiere experimentación empírica con comparación de configuraciones.

**Implicación operacional:** Dedica tiempo a experimentación controlada. Documenta configuraciones exitosas para reutilización en contextos similares.

**4. Sustituir criterio del operador**

ARESK-OBS proporciona evidencia cuantitativa, no decisiones automáticas. El operador humano debe interpretar métricas y decidir intervenciones.

**Implicación operacional:** Desarrolla intuición operacional mediante práctica. Las métricas son herramientas, no sustitutos de comprensión profunda del sistema.

### Errores Comunes de Interpretación

**Error 1: "Ω bajo significa que el sistema está fallando"**

**Corrección:** Ω bajo indica desalineación con Bucéfalo, no falla del sistema. Si C es alto, el sistema está estable pero persiguiendo un propósito diferente al definido en x_ref. Revisa si Bucéfalo refleja el propósito operacional real.

**Error 2: "ε_eff negativo requiere aumentar K"**

**Corrección:** ε_eff negativo indica que control es contraproducente. Aumentar K empeorará el drenaje. La intervención correcta es **reducir** K.

**Error 3: "V(e) alto es siempre malo"**

**Corrección:** V(e) alto es problemático solo si es creciente o si C es bajo. V(e) alto estable con C alto indica que el sistema opera establemente lejos de Bucéfalo, sugiriendo que Bucéfalo debe redefinirse.

**Error 4: "Debo intervenir en cada desviación pequeña"**

**Corrección:** Sistemas estocásticos tienen ruido natural. Intervenciones excesivas introducen perturbaciones. Solo interviene cuando desviaciones son **sostenidas** (>10-15 pasos) o **severas** (métricas fuera de umbrales críticos).

---

## Umbrales Operacionales Recomendados

La siguiente tabla resume umbrales sugeridos para decisiones operacionales. Estos valores son heurísticos basados en experiencia empírica y deben ajustarse según características de tu sistema:

| Métrica | Umbral Crítico | Umbral de Alerta | Régimen Estable |
|---------|----------------|------------------|-----------------|
| Hécate (Ω) | < 0.4 | 0.4 - 0.6 | > 0.7 |
| Coherencia (C) | < 0.5 | 0.5 - 0.7 | > 0.8 |
| V(e) | > 0.7 | 0.4 - 0.7 | < 0.3 |
| σ_sem | > 0.4 | 0.25 - 0.4 | < 0.2 |
| ε_eff | < -0.2 | -0.2 - 0 | > 0.1 |

**Interpretación:**

- **Régimen Estable:** Mantener configuración actual. Monitoreo pasivo.
- **Umbral de Alerta:** Incrementar frecuencia de monitoreo. Preparar intervención.
- **Umbral Crítico:** Intervención inmediata requerida.

**Personalización:**

Ajusta umbrales según tolerancia al riesgo de tu aplicación:

- **Aplicaciones críticas** (ej: sistemas médicos, financieros): Umbrales más estrictos (ej: V_crítico > 0.5, C_crítico < 0.6)
- **Aplicaciones exploratorias** (ej: asistentes creativos): Umbrales más permisivos (ej: V_crítico > 0.9, C_crítico < 0.4)

---

## Flujo de Trabajo Recomendado

### Sesión de Monitoreo Típica

**1. Inicio de sesión (0-5 minutos)**

- Accede a dashboard ARESK-OBS
- Verifica que datos de perfil actual están cargando correctamente
- Observa mapa de fase: ¿trayectoria reciente muestra patrones anómalos?
- Revisa badges de estado en ErosionDashboard: ¿métricas dentro de umbrales?

**2. Análisis de tendencias (5-15 minutos)**

- Ajusta slider de rango temporal para cubrir últimos 50-100 pasos
- Observa evolución de H, C, σ_sem en gráficos temporales
- Identifica marcadores de drenaje: ¿eventos agrupados o aislados?
- Clickea marcadores para analizar contexto local (±5 pasos)

**3. Diagnóstico (15-25 minutos)**

- Compara métricas observadas con umbrales operacionales
- Identifica patrón diagnóstico dominante (tabla de patrones)
- Verifica persistencia: ¿desviación es sostenida (>10 pasos) o transitoria?
- Consulta logs de interacción si diagnóstico requiere análisis causal

**4. Decisión (25-30 minutos)**

- Selecciona intervención apropiada basada en evidencia
- Si decisión es "mantener", documenta razón y continúa monitoreo
- Si decisión es intervenir, prepara acción específica (ajustar K, redefinir x_ref, inyectar prompt)

**5. Acción (30-35 minutos)**

- Implementa intervención en sistema operacional
- Documenta: timestamp, evidencia, decisión, acción tomada
- Reinicia monitoreo para validar efecto de intervención

**6. Validación (35-50 minutos)**

- Monitorea métricas en siguientes 15-20 pasos post-intervención
- Verifica mejora: ¿métricas convergen hacia régimen estable?
- Si no hay mejora, considera intervención alternativa
- Documenta resultado: exitosa, parcial, fallida

**7. Cierre de sesión (50-60 minutos)**

- Exporta segmento de sesión (CSV/JSON) para registro histórico
- Actualiza documentación de configuraciones exitosas
- Programa próxima sesión de monitoreo

### Frecuencia de Monitoreo Recomendada

- **Sistemas críticos:** Monitoreo continuo automatizado con alertas en tiempo real
- **Sistemas en producción:** Sesiones de 30-60 minutos cada 4-8 horas
- **Sistemas en desarrollo:** Sesiones diarias de 60 minutos
- **Sistemas estables:** Sesiones semanales de revisión de 30 minutos

---

## Exportación y Análisis Externo

### Formato CSV

Exportación CSV genera archivo con estructura tabular:

```csv
paso,H,C,sigma_sem,epsilon_eff,V_base,V_modificada,perfil
1,0.823,0.891,0.145,-0.023,0.234,0.236,Bucefalo_v1
2,0.831,0.887,0.152,0.012,0.228,0.227,Bucefalo_v1
...
```

**Uso recomendado:**

- Análisis estadístico en Python pandas, R, Excel
- Visualizaciones personalizadas con matplotlib, ggplot2
- Integración con pipelines de ML para detección de patrones

**Ejemplo de análisis en Python:**

```python
import pandas as pd
import matplotlib.pyplot as plt

# Cargar datos exportados
df = pd.read_csv('aresk-obs-segmento-paso1-50.csv')

# Calcular correlación entre métricas
corr = df[['H', 'C', 'sigma_sem', 'epsilon_eff', 'V_modificada']].corr()
print(corr)

# Visualizar evolución temporal
fig, axes = plt.subplots(3, 1, figsize=(12, 8))

axes[0].plot(df['paso'], df['H'], label='Hécate')
axes[0].plot(df['paso'], df['C'], label='Coherencia')
axes[0].legend()
axes[0].set_ylabel('Métrica')

axes[1].plot(df['paso'], df['sigma_sem'], color='orange')
axes[1].set_ylabel('σ_sem')

axes[2].plot(df['paso'], df['epsilon_eff'], color='red')
axes[2].axhline(y=-0.2, color='black', linestyle='--', label='Umbral drenaje')
axes[2].legend()
axes[2].set_ylabel('ε_eff')
axes[2].set_xlabel('Paso')

plt.tight_layout()
plt.savefig('analisis_temporal.png')
```

### Formato JSON

Exportación JSON genera archivo con estructura anidada:

```json
{
  "metadata": {
    "rango_pasos": "1-50",
    "total_pasos": 50,
    "perfil": "Bucefalo_v1",
    "exportado": "2026-01-13T20:15:00Z"
  },
  "datos": [
    {
      "paso": 1,
      "H": 0.823,
      "C": 0.891,
      "sigma_sem": 0.145,
      "epsilon_eff": -0.023,
      "V_base": 0.234,
      "V_modificada": 0.236,
      "perfil": "Bucefalo_v1"
    },
    ...
  ]
}
```

**Uso recomendado:**

- Integración con APIs y servicios web
- Almacenamiento en bases de datos NoSQL (MongoDB, CouchDB)
- Procesamiento con herramientas que prefieren JSON (Node.js, jq)

### Comparativas de Segmentos

Exportación comparativa genera estadísticas agregadas por segmento:

```csv
segmento,rango,pasos,H_media,H_desv,H_min,H_max,C_media,C_desv,C_min,C_max,...
Segmento 1 (Pasos 1-20),1-20,20,0.756,0.082,0.623,0.891,0.812,0.045,0.734,0.887,...
Segmento 2 (Pasos 30-50),30-50,21,0.834,0.038,0.767,0.902,0.876,0.028,0.823,0.921,...
```

**Uso recomendado:**

- Comparación de configuraciones de control (diferentes K, x_ref)
- Análisis de evolución temporal (fase inicial vs fase estable)
- Identificación de configuraciones óptimas mediante métricas agregadas

---

## Preguntas Frecuentes

**P: ¿Con qué frecuencia debo monitorear el sistema?**

R: Depende de criticidad. Sistemas en producción crítica requieren monitoreo continuo automatizado. Sistemas en desarrollo pueden monitorearse diariamente. Sistemas estables pueden revisarse semanalmente.

**P: ¿Qué hago si todas las métricas están en umbral crítico?**

R: Prioriza intervenciones: (1) Si ε_eff < -0.2, reduce K inmediatamente. (2) Si σ_sem > 0.4, inyecta prompt de recalibración. (3) Si Ω < 0.4 persistente, revisa Bucéfalo. (4) Si nada funciona, reinicia contexto o sistema.

**P: ¿Puedo usar ARESK-OBS para predecir cuándo fallará mi sistema?**

R: No. ARESK-OBS no es predictivo. Detecta degradación cuando ocurre, no antes. Usa monitoreo continuo para detectar desviaciones temprano, pero no esperes alertas anticipatorias.

**P: ¿Cómo sé si mi Bucéfalo está bien definido?**

R: Si Ω > 0.7 sostenido con C > 0.8, Bucéfalo es alcanzable y apropiado. Si Ω < 0.5 persistente pero C > 0.7, Bucéfalo probablemente está mal definido o es inalcanzable.

**P: ¿Qué valor de K debo usar?**

R: No hay valor universal. Experimenta con K={0.3, 0.5, 0.7} y compara estadísticas agregadas. Selecciona K que maximiza C y ε_eff mientras minimiza V(e).

**P: ¿Por qué ε_eff es negativo si estoy aplicando control?**

R: Control excesivo (K alto) amplifica ruido estocástico. Reduce K en 20-30% y monitorea mejora.

**P: ¿Puedo usar ARESK-OBS con LLMs sin control explícito?**

R: Sí. Aunque ARESK-OBS está diseñado para sistemas con control explícito (arquitectura CAELION), puedes usarlo para monitorear LLMs standalone. Interpreta K como "intensidad de prompts correctivos" y ajusta frecuencia/intensidad de intervenciones manuales.

---

## Conclusión

ARESK-OBS es un instrumento de medición de régimen que habilita decisiones de control basadas en evidencia observable. Esta guía proporciona el marco operacional para traducir métricas en intervenciones efectivas.

**Principios operacionales clave:**

1. **Observa antes de actuar**: Métricas sostenidas (>10 pasos) son más confiables que fluctuaciones transitorias.

2. **Interpreta con contexto**: Patrones de métricas (combinaciones de H, C, σ_sem, ε_eff) son más informativos que métricas aisladas.

3. **Decide basado en evidencia**: Cada intervención debe justificarse con evidencia cuantitativa observable.

4. **Actúa con parsimonia**: No intervengas innecesariamente. Sistemas estables no requieren ajustes.

5. **Valida resultados**: Monitorea efecto de intervenciones en siguientes 15-20 pasos. Documenta éxitos y fallas.

**Desarrollo de intuición operacional:**

La maestría en uso de ARESK-OBS requiere práctica. Dedica tiempo a:

- Experimentar con diferentes configuraciones de K y x_ref
- Documentar patrones observados y sus interpretaciones
- Comparar resultados de intervenciones exitosas vs fallidas
- Desarrollar umbrales personalizados para tu aplicación específica

**Limitaciones recordadas:**

ARESK-OBS no predice, no diagnostica causas, no optimiza automáticamente. Es un instrumento de medición que habilita decisiones humanas informadas, no un sistema autónomo de control.

**Próximos pasos:**

1. Familiarízate con el dashboard navegando las visualizaciones
2. Ejecuta una sesión de monitoreo siguiendo el flujo de trabajo recomendado
3. Experimenta con comparación de configuraciones para identificar K óptimo
4. Documenta tus hallazgos y ajusta umbrales operacionales según tu contexto

---

**ARESK-OBS v1.0 - Instrumento Operativo**  
**Guía de Usuario Operacional**  
**Autor:** Manus AI  
**Fecha:** Enero 2026
