# ARESK-OBS v1.0 - Disponible para Pruebas Técnicas

**Fecha:** 2026-01-14  
**Estado:** Fase de exposición y estrés  
**Audiencia:** Primeros usuarios técnicos

---

## Disponibilidad

ARESK-OBS v1.0 está disponible para uso inmediato:

**Repositorio:** https://github.com/Caelion1207/aresk-obs  
**Demo en vivo:** [URL de despliegue público]  
**Documentación:** README.md, QUICKSTART.md, USER_GUIDE.md

El sistema compila sin dependencias nativas y está desplegado en entorno público. No requiere instalación local para evaluación inicial.

---

## Qué Mide

ARESK-OBS cuantifica tres costes operacionales en sistemas cognitivos acoplados (humano-LLM):

**Stability Cost (V):** Magnitud de corrección aplicada para mantener coherencia. Valores típicos [0, 1]. V > 0.7 indica alto coste de estabilización.

**Coherence (Ω):** Estabilidad narrativa relativa a historial inmediato. Rango [0, 1]. Ω < 0.4 indica desalineación crítica con régimen objetivo.

**Semantic Efficiency (ε_eff):** Pérdida de información por token. Rango [-1, 1]. ε_eff < -0.2 indica drenaje semántico (control contraproducente).

El instrumento mide coste actual observable. No predice coste futuro. No anticipa colapsos. No optimiza parámetros automáticamente.

---

## Qué NO Mide

**No es predictivo.** No extrapola trayectorias. No emite alertas anticipatorias. La alerta ES la medición actual.

**No evalúa corrección.** No determina si una respuesta es "correcta" o "verdadera". Mide coste de mantener estabilidad respecto a un régimen objetivo definido por el operador.

**No optimiza automáticamente.** Decisiones de intervención (ajustar K, modificar x_ref, reiniciar sesión) son responsabilidad del operador humano.

---

## Arquitectura Técnica

**Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + Drizzle ORM + MySQL  
**Visualizaciones:** Recharts (client-side)  
**Exportación:** CSV/JSON funcional. PDF removido (dependencia nativa incompatible con deploy serverless).

**Componentes clave:**
- PhaseSpaceMap: Trayectorias (H, C) con slider temporal, marcadores de drenaje clicables, comparación de segmentos
- ErosionDashboard: Métricas históricas (V, Ω, ε_eff) por sesión
- Simulador: Generación de mediciones con configuración K y x_ref personalizable

---

## Limitaciones Documentadas

### Umbrales Heurísticos

Los umbrales documentados (V > 0.7, Ω < 0.4, ε_eff < -0.2) son heurísticos iniciales derivados de simulaciones controladas. **Requieren calibración por dominio.** No han sido validados con casos de uso reales a escala.

### Validación Empírica Pendiente

El sistema no ha sido sometido a estrés real con usuarios externos. Limitaciones adicionales pueden emerger de:
- Configuraciones K extremas (K < 0.1, K > 1.0)
- Regímenes objetivo x_ref con alta dimensionalidad o contradicciones internas
- Sesiones prolongadas (> 100 interacciones)
- Dominios no contemplados en diseño inicial (críticos, tiempo real, multiagente)

### Exportación PDF Removida

Funcionalidad temporalmente deshabilitada para compatibilidad de despliegue. Alternativas actuales: CSV/JSON, capturas manuales. Si usuarios reales lo solicitan, se implementará client-side (jsPDF + html2canvas).

---

## Solicitud de Feedback: Ruptura, Fricción, Caos Límite

Este instrumento entra en fase de exposición y estrés. **No buscamos validación de funcionalidad básica.** Buscamos identificar:

### 1. Ruptura Operacional

¿En qué configuraciones el instrumento produce mediciones incoherentes, divergentes o no interpretables?

**Casos de interés:**
- K extremos que colapsan métricas
- x_ref que generan oscilaciones sin convergencia
- Dominios donde umbrales documentados son completamente incorrectos

**Formato de reporte:** Configuración exacta (K, x_ref, perfil), capturas de PhaseSpaceMap, datos exportados (CSV/JSON), descripción de comportamiento inesperado.

### 2. Fricción de Uso

¿Qué flujos de trabajo son innecesariamente complejos o requieren pasos manuales repetitivos?

**Casos de interés:**
- Necesidad de exportar/reimportar datos para análisis externo
- Comparación de sesiones requiriendo múltiples navegaciones
- Interpretación de métricas requiriendo consulta constante de documentación

**Formato de reporte:** Descripción del flujo, pasos actuales, propuesta de simplificación (si aplica).

### 3. Caos Límite

¿Qué escenarios de uso real no fueron contemplados en diseño y requieren extensión arquitectónica?

**Casos de interés:**
- Monitoreo de múltiples agentes simultáneos
- Integración con pipelines CI/CD para testing de LLMs
- Análisis retrospectivo de logs históricos (no generados por ARESK-OBS)
- Comparación de configuraciones K para optimización de parámetros

**Formato de reporte:** Descripción del caso de uso, limitación actual, impacto si no se resuelve.

---

## Cómo Reportar

**GitHub Issues:** https://github.com/Caelion1207/aresk-obs/issues

Usar plantilla de bug report. Incluir:
- Versión (v1.0)
- Configuración completa (K, x_ref con P/L/E, perfil)
- Métricas observadas (V, Ω, ε_eff) en momento de ruptura
- Datos exportados (CSV/JSON) si aplica
- Capturas de PhaseSpaceMap mostrando trayectoria problemática

---

## Expectativas

**No hay roadmap predefinido.** Desarrollo futuro depende exclusivamente de feedback de usuarios reales. Si nadie reporta necesidad de exportación PDF, no se implementará. Si múltiples usuarios reportan ruptura con K < 0.2, se investigará.

**No hay soporte garantizado.** Este es un instrumento experimental en fase de validación. Respuestas a issues pueden tardar días o semanas.

**No hay estabilidad de API.** Cambios breaking pueden ocurrir en v1.x si emergen limitaciones arquitectónicas críticas.

---

## Principio Operacional

**ARESK-OBS mide costes. Habilita decisiones. Requiere criterio.**

El instrumento no reemplaza juicio humano. Cuantifica evidencia observable para informar intervenciones. Operadores deben desarrollar intuición mediante práctica iterativa.

---

## Licencia

MIT License. Código abierto. Sin restricciones de uso comercial o académico.

---

**ARESK-OBS v1.0**  
**Instrumento de Medición de Coste de Estabilidad**  
**Fase de Exposición y Estrés Iniciada**
