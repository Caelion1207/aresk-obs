# ARESK-OBS v1.0

![Version](https://img.shields.io/badge/version-1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-stable-brightgreen.svg)

**Instrumento de Medición de Coste de Estabilidad**

ARESK-OBS does not determine truth. It measures how much effort is required to keep an idea from collapsing over time.

---

## 1. Qué Mide

ARESK-OBS cuantifica tres costes operacionales en sistemas cognitivos acoplados:

### Stability Cost (V - Lyapunov)

**Definición:** Higher values indicate increased control effort to maintain coherence.

**Rango:** [0, ∞). Valores típicos: 0-1.

**Interpretación:** V > 0.7 indica alto coste de estabilización. V < 0.3 indica bajo coste.

### Coherence (Ω)

**Definición:** Narrative stability relative to immediate history.

**Rango:** [0, 1]. Normalizado.

**Interpretación:** Ω > 0.7 indica estabilidad narrativa. Ω < 0.4 indica desalineación crítica.

### Semantic Efficiency (ε_eff)

**Definición:** Information loss per token.

**Rango:** [-1, 1]. Normalizado. Nota: A diferencia de Ω y C (siempre positivos [0,1]), ε_eff puede ser negativo cuando el control amplifica error en lugar de reducirlo.

**Interpretación:** ε_eff < -0.2 indica drenaje semántico (control contraproducente). ε_eff > 0.1 indica control efectivo.

---

## 2. Qué NO Mide

### No Predictivo

Mide coste actual observable. No predice coste futuro. No anticipa colapsos. No extrapola trayectorias. No emite alertas anticipatorias.

**Implicación:** Monitoreo continuo es esencial. La alerta ES la medición actual.

### No Diagnóstico Causal

Cuantifica costes observables (V alto, σ_sem alto, ε_eff negativo) pero no identifica qué prompt, interacción o contexto causó degradación.

**Implicación:** ARESK-OBS te dice "cuándo" y "cuánto", no "por qué".

### No Optimización Automática

No calcula K óptimo ni x_ref óptimo automáticamente. Requiere experimentación empírica con comparación de configuraciones.

**Implicación:** Dedica tiempo a experimentación controlada. Documenta configuraciones exitosas.

### No Evalúa Verdad

No determina si una respuesta es correcta, verdadera o moralmente aceptable. Solo mide costes de estabilidad.

**Implicación:** ARESK-OBS no sustituye criterio humano sobre corrección o ética.

---

## 3. Cómo se Usa

### Paso 1: Configurar Referencia (x_ref)

Define propósito (P), límites (L) y ética (E) del sistema. Esta referencia NO es evaluación de verdad, es punto de comparación para medir desviación.

### Paso 2: Seleccionar Ganancia (K)

**K represents penalty sensitivity, not correctness.** K controla cuánto peso se asigna a desviaciones observadas. Valores típicos: 0.3 (permisivo), 0.5 (balanceado), 0.7 (estricto).

### Paso 3: Monitorear Métricas

Observa V, Ω, ε_eff en tiempo real. Identifica patrones:

- **Régimen Estable:** V < 0.3, Ω > 0.7, ε_eff > 0.1
- **Drenaje de Control:** ε_eff < -0.2 sostenido
- **Desalineación:** Ω < 0.4 persistente
- **Fragmentación:** σ_sem > 0.4

**Advertencia:** Estos umbrales son heurísticos y deben ajustarse según dominio, longitud de conversaciones y características del LLM. Calibración empírica es esencial.

### Paso 4: Intervenir Basado en Evidencia

Cuando las métricas indican degradación, interviene ajustando K, redefiniendo x_ref o inyectando prompts de recalibración. Consulta **USER_GUIDE.md** para matriz completa de evidencia-interpretación-decisión con justificaciones y casos de uso detallados.

### Paso 5: Comparar Configuraciones

Experimenta con múltiples valores de K. Exporta estadísticas agregadas. Selecciona configuración con menor coste total (máximo C, mínimo V, máximo ε_eff).

---

## 4. Cómo se Rompe

### Ganancia K Excesiva

**Síntoma:** ε_eff < -0.2 sostenido, marcadores de drenaje frecuentes.

**Causa:** Control agresivo amplifica ruido estocástico.

**Solución:** Reducir K en 20-30%.

### Referencia x_ref Inalcanzable

**Síntoma:** Ω < 0.5 persistente por >50 pasos, V > 0.6 estable, C > 0.7.

**Causa:** Propósito definido no refleja comportamiento alcanzable del sistema.

**Solución:** Redefinir componentes (P, L, E) de x_ref para reflejar propósito realista.

### Fragmentación Semántica

**Síntoma:** σ_sem > 0.4, C < 0.6 decreciente, trayectoria errática.

**Causa:** Conversación larga sin recalibración, contexto saturado.

**Solución:** Inyectar prompt de recalibración o reiniciar contexto.

### Monitoreo Insuficiente

**Síntoma:** Colapso súbito sin alerta previa.

**Causa:** Frecuencia de medición muy baja. ARESK-OBS no predice, solo mide estado actual.

**Solución:** Incrementar frecuencia de medición (cada 5-10 pasos mínimo).

---

## Instalación

```bash
git clone https://github.com/Caelion1207/aresk-obs.git
cd aresk-obs
pnpm install
pnpm db:push
pnpm dev
```

Acceder a http://localhost:3000

---

## Uso Rápido

1. Crear perfil de planta con K y x_ref
2. Iniciar sesión de medición
3. Observar métricas en PhaseSpaceMap y ErosionDashboard
4. Usar control de rango temporal para análisis granular
5. Comparar configuraciones mediante modo comparación
6. Exportar datos (CSV/JSON) para análisis externo
7. Consultar guía operacional mediante botón "Ayuda"

---

## Documentación

- **USER_GUIDE.md:** Guía operacional completa con flujo Observar-Interpretar-Decidir-Actuar
- **RELEASE_NOTES_v1.0.md:** Capacidades, limitaciones y changelog
- **HelpDialog:** Guía integrada accesible desde header del dashboard

---

## Contribuciones

ARESK-OBS es un instrumento de medición, no un marco filosófico. Contribuciones deben enfocarse en:

- Mejoras de medición (nuevas métricas de coste, algoritmos de detección)
- Optimizaciones de visualización (rendimiento, claridad, accesibilidad)
- Extensiones de exportación (formatos, integraciones, análisis)
- Documentación operacional (casos de uso, umbrales validados)

**Rechazadas automáticamente:**

- Capas ontológicas o filosóficas
- Sistemas de predicción o extrapolación
- Optimización automática sin intervención humana
- Complejidad conceptual innecesaria
- Referencias a verdad, creencia, realidad o conciencia

---

## Disclaimer

**Este es un instrumento de medición, no un sistema de optimización automática ni predicción.**

ARESK-OBS cuantifica costes operacionales observables. No predice comportamientos futuros, no optimiza parámetros automáticamente, no evalúa verdad o corrección. Decisiones de intervención son responsabilidad del operador humano basadas en evidencia cuantitativa proporcionada por el instrumento.

---

## Licencia

MIT License

---

## Contacto

GitHub: https://github.com/Caelion1207/aresk-obs  
Issues: https://github.com/Caelion1207/aresk-obs/issues

---

**ARESK-OBS v1.0 - Instrumento de Medición de Coste de Estabilidad**  
**Mide costes. Habilita decisiones. Requiere criterio.**
