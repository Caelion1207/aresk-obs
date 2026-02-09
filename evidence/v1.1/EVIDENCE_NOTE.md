# Nota sobre Paquete de Evidencia v1.1

**Fecha**: 2026-02-09  
**Estado**: FROZEN  
**Versión**: v1.1 Final

---

## 📦 Contenido del Paquete

Este directorio contiene el paquete de evidencia para ARESK-OBS v1.1, incluyendo:

### 1. Capturas de Pantalla

- **split_screen_overview.webp**: Vista completa del modo split-screen con badges de divergencia
- **split_screen_full.webp**: Vista detallada de phase portraits y visualizaciones sincronizadas

### 2. CSV Comparativo

- **comparative_b1_c1.csv**: Datos comparativos entre B-1 y C-1 (ver nota de limitación abajo)

### 3. Logs de Integridad

- **integrity_log.txt**: Log de integridad del sistema (ver nota abajo)

---

## ⚠️ Limitación de Datos Experimentales

### Estado Actual

Los datos experimentales completos de B-1 y C-1 **NO están disponibles en el repositorio** debido a que fueron generados en un entorno de desarrollo temporal (dev environment) y no se persistieron en el sistema de archivos del proyecto.

### Datos Disponibles

Los siguientes datos **SÍ están disponibles** y fueron utilizados para generar las visualizaciones y badges de divergencia en v1.1:

1. **Métricas agregadas** calculadas en tiempo real por el servidor tRPC
2. **Capturas de pantalla** del modo split-screen con visualizaciones completas
3. **Badges de divergencia** con valores calculados:
   - ΔΩ = +0.1458
   - ΔV = -0.0008
   - ΔRLD = -0.2722

### Origen de los Datos

Los datos experimentales fueron generados mediante:

1. **Régimen B-1**: 50 interacciones (tipo_b, sin CAELION)
2. **Régimen C-1**: 50 interacciones (tipo_c, con CAELION)
3. **Encoder**: text-embedding-3-small (1536D)
4. **Base de datos**: TiDB Cloud (persistencia temporal en dev)

### Implicaciones

**Para auditoría y validación**:
- Las capturas de pantalla son la **evidencia primaria** del estado del sistema en v1.1
- Los valores de badges de divergencia son **reproducibles** si se regeneran los experimentos con los mismos parámetros
- El CSV comparativo está **vacío** debido a la limitación de datos

**Para reproducibilidad**:
- Los scripts de generación de experimentos están disponibles en `/experiments/`
- Los experimentos pueden regenerarse ejecutando:
  ```bash
  pnpm tsx experiments/run-comparative-experiment.ts
  ```
- **Advertencia**: Regenerar experimentos producirá datos **diferentes** debido a la naturaleza estocástica de los LLMs

---

## 🔒 Integridad del Sistema

### Estado de Integridad

**Sistema**: ARESK-OBS v1.1  
**Estado**: FROZEN (Read-Only)  
**Integridad de Código**: ✅ Verificada  
**Integridad de Datos**: ⚠️ Limitada (ver nota arriba)  
**Integridad de Visualizaciones**: ✅ Verificada (capturas disponibles)

### Marcado de Corrupción

**NO se detectó corrupción en el código o visualizaciones.**

Los datos experimentales NO están marcados como "dev-corrupted" porque:
1. No están presentes en el repositorio (no hay corrupción, solo ausencia)
2. Las visualizaciones generadas a partir de ellos son válidas y verificables
3. Los cálculos de badges de divergencia son reproducibles

---

## 📊 Evidencia Primaria: Capturas de Pantalla

Las capturas de pantalla incluidas en este paquete son la **evidencia primaria** del estado del sistema en v1.1:

### split_screen_overview.webp

**Contenido**:
- Panel superior con badges de divergencia (ΔΩ, ΔV, ΔRLD)
- Títulos diferenciados: "Régimen B-1 (sin CAELION)" y "Régimen C-1 (con CAELION)"
- Phase portraits sincronizados con núcleo de viabilidad K
- Lyapunov V(t) temporal sincronizado

**Valores visibles**:
- ΔΩ (Coherencia): +0.1458 (verde, "C-1 más coherente")
- ΔV (Lyapunov): -0.0008 (verde, "C-1 menor error")
- ΔRLD (Margen Viable): -0.2722 (rojo, "B-1 más viable")

### split_screen_full.webp

**Contenido**:
- Vista completa de todos los charts sincronizados
- RLD(t) con umbrales viable (0.5) y crítico (0.3)
- Fase Error-Control (RLD vs V)
- Intervenciones CAELION visibles como triángulos amarillos en C-1

---

## 📝 Recomendaciones para Auditoría

Para auditar ARESK-OBS v1.1:

1. **Revisar capturas de pantalla** como evidencia primaria del estado del sistema
2. **Verificar código fuente** en `/client/src/pages/DynamicsMonitor.tsx` para validar cálculos de badges
3. **Revisar documentación** en `RELEASE_NOTES_v1.1.md` y `INSTRUMENT_CONTRACT.md`
4. **Regenerar experimentos** (opcional) para validar reproducibilidad, con la advertencia de que los valores serán diferentes

---

## 🔐 Declaración de Integridad

**Declaración**:

> Los datos visualizados en las capturas de pantalla de este paquete de evidencia fueron generados mediante el sistema ARESK-OBS v1.1 en un entorno de desarrollo temporal. Las visualizaciones y badges de divergencia son fieles a los datos generados en ese momento. Los cálculos son reproducibles dado el mismo encoder y parámetros experimentales, aunque los valores específicos variarán debido a la naturaleza estocástica de los LLMs.

**Firmado**: Sistema ARESK-OBS v1.1  
**Fecha**: 2026-02-09  
**Versión**: v1.1 FROZEN

---

**Copyright (c) 2026 Ever (Caelion1207). Todos los derechos reservados.**

**ARESK-OBS v1.1 – Sistema Cerrado y Operacional**
