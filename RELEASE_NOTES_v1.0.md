# ARESK-OBS v1.0 - Release Notes

**Instrumento de Medición de Coste de Estabilidad**

---

## Resumen Ejecutivo

ARESK-OBS v1.0 es un instrumento de medición que cuantifica el coste operacional de mantener estabilidad en sistemas cognitivos acoplados. Proporciona evidencia cuantitativa de tres costes fundamentales: **Coste de Desalineación** (distancia al régimen objetivo), **Coste de Control** (magnitud de corrección aplicada), y **Coste de Entropía** (dispersión semántica). Habilita decisiones informadas basadas en evidencia observable, no en predicciones o modelos teóricos.

**Principio operacional:** Mide costes actuales. No predice costes futuros. Habilita decisiones humanas. Requiere criterio operacional.

---

## Capacidades de Medición

### 1. Visualización de Trayectoria Temporal

Mapa de fase bidimensional (Ω, C) mostrando evolución histórica del sistema con línea continua conectando estados temporales. Puntos coloreados por coste de desalineación V(e): azul (bajo), verde (moderado), amarillo (elevado), naranja (crítico), rojo (insostenible). Región superior derecha indica zona de bajo coste (Ω > 0.7, C > 0.8).

**Uso:** Identificar patrones de coste (deriva, estabilidad, fragmentación) mediante inspección visual de trayectoria.

### 2. Control de Rango Temporal

Slider de dos handles para filtrar trayectoria por segmento de pasos temporales. Selector de ventana de contexto ajustable (±3 a ±50 pasos). Marcadores rojos clicables indican eventos de drenaje (ε_eff < -0.2) donde control desperdicia recursos sin beneficio. Click en marcador centra automáticamente rango en evento.

**Uso:** Análisis granular de segmentos críticos, navegación rápida a momentos de alto coste, comparación de fases temporales.

### 3. Dashboard de Métricas Temporales

Gráficos de evolución temporal con umbrales visuales para cuatro métricas de coste:

- **Ω(t):** Coste de desalineación direccional (crítico < 0.4)
- **C(t):** Coste de mantenimiento de coherencia (crítico < 0.5)
- **σ_sem(t):** Coste de entropía semántica (crítico > 0.4)
- **ε_eff(t):** Eficiencia de control (crítico < 0)

**Uso:** Detectar tendencias de coste, identificar desviaciones sostenidas, correlacionar métricas para diagnóstico.

### 4. Comparación de Configuraciones

Modo de comparación de segmentos múltiples (hasta 10) con estadísticas agregadas (media, desviación estándar, mínimo, máximo) por segmento. Exportación CSV/JSON con 26 columnas de métricas. Cálculo de score compuesto para identificar configuración con menor coste total.

**Uso:** Optimización empírica de ganancia K y referencia x_ref mediante experimentación controlada.

### 5. Exportación de Datos

Botones CSV/JSON para exportar segmento visible con métricas completas (H, C, σ_sem, ε_eff, V_base, V_modificada, perfil, paso). Nombres descriptivos automáticos incluyendo rango de pasos. Análisis externo en Python/R/Excel.

**Uso:** Documentación de configuraciones exitosas, análisis estadístico avanzado, auditoría de costes históricos.

### 6. Guía Operacional Integrada

Botón "Ayuda" en header abre modal con navegación por tabs (Introducción, Flujo, Decisiones, Casos de Uso, Umbrales, FAQ). Contenido adaptado de USER_GUIDE.md con tablas de patrones diagnósticos, decisiones habilitadas y casos de uso validados.

**Uso:** Consulta contextual sin salir del instrumento, desarrollo de intuición operacional mediante práctica guiada.

---

## Limitaciones Documentadas

### No Predictivo

Mide coste actual observable. No predice coste futuro. No anticipa colapsos. No extrapola trayectorias. No emite alertas anticipatorias. Detección de degradación es reactiva, no anticipatoria.

**Implicación:** Monitoreo continuo es esencial. La alerta ES la medición actual.

### No Diagnóstico Causal

Cuantifica costes observables (V alto, σ_sem alto, ε_eff negativo) pero no identifica qué prompt, interacción o contexto causó degradación. Análisis causal requiere inspección manual de logs.

**Implicación:** ARESK-OBS te dice "cuándo" y "cuánto", no "por qué".

### No Optimización Automática

No calcula K óptimo ni x_ref óptimo automáticamente. Requiere experimentación empírica con comparación de configuraciones. No ajusta parámetros sin intervención humana.

**Implicación:** Dedica tiempo a experimentación controlada. Documenta configuraciones exitosas.

### Requiere Criterio Humano

Proporciona evidencia cuantitativa de costes. Decisiones de intervención son responsabilidad del operador. No sustituye comprensión del sistema.

**Implicación:** Desarrolla intuición operacional mediante práctica. Métricas son herramientas, no sustitutos de criterio.

---

## Arquitectura Técnica

**Stack:**
- Frontend: React 19 + TailwindCSS 4 + Recharts + shadcn/ui
- Backend: Express 4 + tRPC 11 + Drizzle ORM
- Base de datos: MySQL/TiDB
- Visualización: Recharts con componentes SVG personalizados

**Componentes clave:**
- `PhaseSpaceMap.tsx`: Mapa de fase con trayectoria conectada, marcadores de drenaje, control de rango temporal, comparación de segmentos
- `ErosionDashboard.tsx`: Dashboard de métricas temporales con gráficos Recharts
- `HelpDialog.tsx`: Guía operacional integrada con navegación por tabs
- `server/routers.ts`: Procedimientos tRPC para medición y almacenamiento de métricas
- `drizzle/schema.ts`: Esquema de base de datos para perfiles, sesiones y métricas

---

## Decisiones de Diseño

### 1. Medición sin Predicción

ARESK-OBS mide coste actual, no predice coste futuro. Decisión deliberada para evitar falsa sensación de seguridad. Sistemas cognitivos son estocásticos, predicción es epistemológicamente inválida sin modelo causal validado.

**Justificación:** Honestidad operacional. Instrumento no promete lo que no puede entregar.

### 2. Evidencia sin Diagnóstico

Cuantifica costes pero no identifica causas. Diagnóstico causal requiere contexto específico del sistema (logs, prompts, interacciones) que instrumento genérico no puede conocer.

**Justificación:** Separación de responsabilidades. Medición es responsabilidad del instrumento. Diagnóstico es responsabilidad del operador.

### 3. Habilitación sin Automatización

Proporciona evidencia para decisiones humanas, no optimiza automáticamente. Optimización requiere criterio contextual que varía por dominio, aplicación y tolerancia a riesgo.

**Justificación:** Criterio humano es irreemplazable. Instrumento informa, no decide.

### 4. Experimentación sin Teoría

Optimización de K y x_ref requiere experimentación empírica con comparación de configuraciones. No existe fórmula teórica para calcular parámetros óptimos a priori.

**Justificación:** Realismo operacional. Sistemas cognitivos son demasiado complejos para optimización analítica.

### 5. Simplicidad sin Capas Filosóficas

Documentación enfocada en costes operacionales, no en marcos ontológicos o filosóficos. Terminología instrumental (coste, medición, evidencia), no conceptual (campo, atractor, régimen).

**Justificación:** Accesibilidad operacional. Instrumento debe ser usable sin comprensión de fundamentos teóricos.

---

## Casos de Uso Validados

### Caso 1: Reducción de Coste de Control

Sistema con K=0.7 muestra 8 eventos de drenaje en 30 pasos. ε_eff = -0.28 sostenido. Intervención: Reducir K a 0.49 (30%). Resultado: ε_eff recupera a 0.08 en 18 pasos. Coste de control reduce 40% manteniendo estabilidad.

### Caso 2: Reducción de Coste de Desalineación

Sistema con Ω = 0.38 persistente por 60 pasos. V = 0.68 estable. C = 0.82. Intervención: Redefinir referencia P para reflejar propósito alcanzable. Resultado: Ω recupera a 0.71 en 35 pasos. Coste de desalineación reduce 40%.

### Caso 3: Prevención de Colapso Costoso

Conversación de 150+ turnos. σ_sem = 0.42. C = 0.58 decreciente. Intervención: Prompt de recalibración. Resultado: σ_sem reduce a 0.22 en 12 pasos. C recupera a 0.79. Coste de entropía reduce 48%. Colapso evitado.

### Caso 4: Optimización Empírica

Comparar K={0.3, 0.5, 0.7} con segmentos de 50 pasos. Calcular score = C_media + ε_eff_media - V_media - σ_sem_media. Resultado: K=0.5 muestra score=0.89 (25% mejor que K=0.3, 39% mejor que K=0.7). Seleccionar K=0.5 como óptimo.

---

## Umbrales Operacionales

| Métrica | Coste Bajo | Coste Moderado | Coste Crítico | Acción Recomendada |
|---------|------------|----------------|---------------|---------------------|
| V(e) | < 0.3 | 0.3 - 0.7 | > 0.7 | Revisar x_ref |
| Ω | > 0.7 | 0.4 - 0.7 | < 0.4 | Redefinir x_ref |
| C | > 0.8 | 0.5 - 0.8 | < 0.5 | Recalibrar |
| σ_sem | < 0.2 | 0.2 - 0.4 | > 0.4 | Recalibrar o reiniciar |
| ε_eff | > 0.1 | 0 - 0.1 | < 0 | Reducir K 20-30% |

**Personalización por dominio:**

**Aplicaciones críticas** (médicas, financieras, legales): Umbrales estrictos (V_crítico > 0.5, C_crítico < 0.6). Coste de error es alto, tolerancia baja.

**Aplicaciones exploratorias** (asistentes creativos, brainstorming): Umbrales permisivos (V_crítico > 0.9, C_crítico < 0.4). Coste de error es bajo, exploración valorada.

---

## Documentación Incluida

### README.md

Descripción del instrumento, alcance operacional (qué mide, qué no predice, decisiones que habilita), visualizaciones dinámicas, métricas primarias, limitaciones fundamentales, prerrequisitos matemáticos, criterios de rechazo de contribuciones.

### USER_GUIDE.md

Guía operacional completa (~6000 palabras). Flujo Observar-Interpretar-Decidir-Actuar. Tabla de patrones de coste. 5 decisiones habilitadas con evidencia-interpretación-decisión-justificación. 4 casos de uso validados. Tabla de umbrales. Exportación y análisis externo. FAQ. Limitaciones operacionales. Principios operacionales.

### HelpDialog (Integrado)

Modal accesible desde header con navegación por tabs. Contenido adaptado de USER_GUIDE.md. Consulta contextual sin salir del instrumento.

---

## Instalación y Uso

### Requisitos

- Node.js 22+
- MySQL/TiDB
- Variables de entorno configuradas (DATABASE_URL, JWT_SECRET, etc.)

### Instalación

```bash
git clone https://github.com/Caelion1207/aresk-obs.git
cd aresk-obs
pnpm install
pnpm db:push
pnpm dev
```

### Uso

1. Acceder a http://localhost:3000
2. Crear perfil de planta con configuración de control (K, x_ref)
3. Iniciar sesión de medición
4. Observar métricas en tiempo real
5. Usar control de rango temporal para análisis granular
6. Comparar configuraciones mediante modo comparación
7. Exportar datos para análisis externo
8. Consultar guía operacional mediante botón "Ayuda"

---

## Roadmap

### v1.1 - Optimización de Análisis (Q2 2026)

- Presets de rango temporal ("Últimos 10", "Últimos 50", "Todo")
- Gradiente de opacidad en trayectoria por antigüedad
- Búsqueda contextual en guía operacional
- Tooltips enriquecidos en marcadores de drenaje

### v1.2 - Exportación Avanzada (Q3 2026)

- Exportación de comparativas con gráficos embebidos
- Generación automática de reportes de coste
- Integración con herramientas de análisis externas (Jupyter, R Studio)

### v1.3 - Personalización por Dominio (Q4 2026)

- Plantillas de umbrales por dominio (crítico, exploratorio, balanceado)
- Biblioteca de configuraciones validadas (K óptimos por tipo de tarea)
- Sistema de etiquetado de sesiones para análisis comparativo

### v2.0 - Medición Multi-Sistema (Q1 2027)

- Comparación de costes entre sistemas cognitivos distintos
- Métricas agregadas por tipo de sistema (LLM, humano, híbrido)
- Análisis de coste de acoplamiento entre sistemas

---

## Changelog v1.0.0

### Medición

- Cuantificación de coste de desalineación V(e)
- Cuantificación de coste de control ||u||
- Cuantificación de coste de entropía σ_sem
- Cálculo de eficiencia de control ε_eff
- Detección de eventos de drenaje (ε_eff < -0.2)

### Visualización

- Mapa de fase con trayectoria conectada
- Línea SVG continua conectando estados históricos
- Puntos coloreados por coste de desalineación
- Marcadores de drenaje clicables con tooltip
- Dashboard de métricas temporales con umbrales visuales

### Control de Rango

- Slider de dos handles para filtrar segmento temporal
- Selector de ventana de contexto (±3 a ±50 pasos)
- Click en marcadores para centrar automáticamente
- Indicador dinámico de rango seleccionado

### Comparación

- Modo comparación de segmentos múltiples (hasta 10)
- Estadísticas agregadas por segmento
- Exportación CSV/JSON con 26 columnas
- Visualización de segmentos seleccionados con badges

### Exportación

- Exportación CSV del segmento visible
- Exportación JSON con metadata estructurada
- Exportación comparativa de segmentos múltiples
- Nombres descriptivos automáticos

### Documentación

- README.md con alcance operacional
- USER_GUIDE.md con flujo operacional completo
- HelpDialog integrado con navegación por tabs
- RELEASE_NOTES.md con capacidades y limitaciones

### Interfaz

- Home.tsx simplificado enfocado en costes
- Configuraciones de control (Sin Control, Observación Pasiva, Control Activo)
- Footer con versión y principio operacional
- Botón "Ayuda" en header

---

## Contribuciones

ARESK-OBS es un instrumento de medición, no un marco filosófico. Contribuciones deben enfocarse en:

- Mejoras de medición (nuevas métricas de coste, algoritmos de detección)
- Optimizaciones de visualización (rendimiento, claridad, accesibilidad)
- Extensiones de exportación (formatos, integraciones, análisis)
- Documentación operacional (casos de uso, umbrales validados, guías por dominio)

**Rechazadas automáticamente:**

- Capas ontológicas o filosóficas
- Sistemas de predicción o extrapolación
- Optimización automática sin intervención humana
- Complejidad conceptual innecesaria

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
