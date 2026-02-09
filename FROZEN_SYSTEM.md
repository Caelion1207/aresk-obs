# ARESK-OBS v1.1 – Sistema Congelado

**Versión**: v1.1 Final  
**Estado**: FROZEN (Read-Only)  
**Fecha de Congelamiento**: 2026-02-09  
**Licencia**: CAELION PROPRIETARY AND NON-COMMERCIAL LICENSE (CPNC-1.0)

---

## 🔒 Estado de Congelamiento

ARESK-OBS v1.1 está **CONGELADO** como release final.

### Restricciones Activas

- ✅ **Sistema cerrado y operacional**
- ✅ **Auditable y vendible**
- ✅ **Read-only**: No se aceptan modificaciones sin autorización explícita
- ❌ **NO recalcular métricas**
- ❌ **NO ajustar umbrales**
- ❌ **NO modificar visualizaciones**
- ❌ **NO abrir v1.2 sin validación de estabilidad visual**

---

## 🚫 Scripts de Mutación Automática Deshabilitados

Los siguientes scripts y funcionalidades que podrían mutar el sistema están **DESHABILITADOS**:

### 1. Scripts de Generación de Experimentos

**Ubicación**: `/experiments/run-comparative-experiment.ts`, `/experiments/run-reduced-experiment.ts`

**Estado**: ⚠️ **ADVERTENCIA ACTIVA**

**Restricción**: Estos scripts pueden ejecutarse para **regenerar experimentos**, pero:
- Los datos generados serán **diferentes** debido a la naturaleza estocástica de los LLMs
- Los nuevos datos **NO deben reemplazar** los datos de referencia de v1.1
- Los nuevos datos **NO deben usarse** para recalcular badges de divergencia en v1.1

**Uso permitido**: Solo para validación de reproducibilidad en entornos de desarrollo separados.

### 2. Mutaciones de Base de Datos

**Ubicación**: `/drizzle/schema.ts`, `pnpm db:push`

**Estado**: 🔒 **CONGELADO**

**Restricción**: El esquema de base de datos está congelado. Cualquier cambio requiere:
1. Descongelar el sistema (autorización explícita)
2. Crear nueva versión (v1.2+)
3. Migrar datos con trazabilidad completa

**Uso permitido**: Solo lectura de datos existentes.

### 3. Modificaciones de Métricas

**Ubicación**: `/server/db.ts`, `/server/routers.ts`

**Estado**: 🔒 **CONGELADO**

**Restricción**: Las fórmulas de métricas (Ω, V, ε, RLD) están congeladas. Cualquier cambio invalida:
- Todas las comparaciones históricas
- El contrato del instrumento (INSTRUMENT_CONTRACT.md)
- La validez de RELEASE_NOTES_v1.1.md

**Uso permitido**: Solo lectura y cálculo con fórmulas existentes.

### 4. Modificaciones de Visualizaciones

**Ubicación**: `/client/src/pages/DynamicsMonitor.tsx`

**Estado**: 🔒 **CONGELADO**

**Restricción**: Las visualizaciones (Phase Portrait, Lyapunov, RLD, Error-Control, Split-Screen, Badges) están congeladas. Cualquier cambio invalida:
- La evidencia visual de v1.1
- La interpretación de resultados en RELEASE_NOTES_v1.1.md

**Uso permitido**: Solo lectura y renderizado con código existente.

### 5. Modificaciones de Umbrales

**Ubicación**: Código hardcodeado en `/client/src/pages/DynamicsMonitor.tsx`

**Umbrales Congelados**:
- RLD viable: 0.5
- RLD crítico: 0.3

**Estado**: 🔒 **CONGELADO**

**Restricción**: Los umbrales están congelados. Cualquier cambio invalida:
- La interpretación de viabilidad en v1.1
- El contrato del instrumento

**Uso permitido**: Solo lectura y uso con valores existentes.

---

## ✅ Funcionalidades Permitidas

Las siguientes funcionalidades están **PERMITIDAS** en el sistema congelado:

### 1. Lectura de Datos

**Permitido**: Consultar datos existentes en la base de datos sin modificarlos.

**Uso**: Auditoría, validación, análisis retrospectivo.

### 2. Visualización de Resultados

**Permitido**: Renderizar visualizaciones con datos existentes.

**Uso**: Demostración, presentación, auditoría visual.

### 3. Exportación de Datos

**Permitido**: Exportar datos existentes a CSV u otros formatos sin modificarlos.

**Uso**: Análisis externo, auditoría, archivo.

### 4. Documentación

**Permitido**: Leer documentación existente (README, RELEASE_NOTES, INSTRUMENT_CONTRACT).

**Uso**: Comprensión del sistema, auditoría, referencia.

---

## 🔓 Proceso de Descongelamiento

Si se requiere descongelar el sistema para v1.2, el proceso es:

### Paso 1: Autorización Explícita

**Requisito**: Autorización explícita del propietario (Ever / Caelion1207).

**Documentación**: Registrar motivo del descongelamiento y cambios planificados.

### Paso 2: Creación de Nueva Versión

**Acción**: Crear branch `v1.2-dev` desde `main` (v1.1 FROZEN).

**Restricción**: `main` permanece congelado como v1.1.

### Paso 3: Actualización de Documentación

**Acción**: Crear nuevos documentos:
- `RELEASE_NOTES_v1.2.md`
- `INSTRUMENT_CONTRACT_v1.2.md` (si el contrato cambia)
- Actualizar `README.md` con estado de v1.2

### Paso 4: Migración de Datos (si aplica)

**Acción**: Si se modifican esquemas o métricas, migrar datos con trazabilidad completa.

**Documentación**: Registrar todas las transformaciones aplicadas.

### Paso 5: Validación y Congelamiento de v1.2

**Acción**: Una vez validada v1.2, congelarla siguiendo el mismo proceso de v1.1.

**Resultado**: `main` se actualiza a v1.2 FROZEN, v1.1 queda archivado.

---

## 📋 Checklist de Congelamiento

### Documentación

- [x] README.md marcado como FROZEN
- [x] RELEASE_NOTES_v1.1.md creado
- [x] INSTRUMENT_CONTRACT.md creado
- [x] FROZEN_SYSTEM.md creado (este archivo)
- [x] Paquete de evidencia exportado

### Restricciones Técnicas

- [x] Métricas congeladas (Ω, V, ε, RLD)
- [x] Umbrales congelados (RLD: 0.5, 0.3)
- [x] Visualizaciones congeladas
- [x] Esquema de base de datos congelado
- [x] Encoder congelado (text-embedding-3-small, 1536D)

### Evidencia

- [x] Capturas de split-screen exportadas
- [x] CSV comparativo generado (con limitación documentada)
- [x] Logs de integridad documentados

### Comunicación

- [x] Estado FROZEN comunicado en README.md
- [x] Badges de estado agregados
- [x] Proceso de descongelamiento documentado

---

## ⚠️ Advertencias Críticas

### Advertencia 1: No Modificar sin Descongelar

**Riesgo**: Modificar el sistema sin seguir el proceso de descongelamiento invalida:
- El contrato del instrumento
- La evidencia de v1.1
- La trazabilidad de cambios

**Consecuencia**: Pérdida de integridad del sistema y validez de auditoría.

### Advertencia 2: No Regenerar Datos de Referencia

**Riesgo**: Regenerar experimentos B-1 y C-1 y reemplazar datos de referencia invalida:
- Los badges de divergencia de v1.1
- Las capturas de pantalla de evidencia
- La interpretación en RELEASE_NOTES_v1.1.md

**Consecuencia**: Pérdida de reproducibilidad y validez de resultados publicados.

### Advertencia 3: No Cambiar Encoder

**Riesgo**: Cambiar el encoder (text-embedding-3-small) invalida:
- Todas las métricas basadas en embeddings (Ω, V, ε, RLD)
- Todas las comparaciones históricas
- El contrato del instrumento

**Consecuencia**: Pérdida total de comparabilidad con v1.1.

---

## 🔐 Declaración de Congelamiento

**Declaración**:

> ARESK-OBS v1.1 está CONGELADO como release final. Todas las métricas, umbrales, visualizaciones, y datos de referencia están protegidos contra modificaciones. Cualquier cambio requiere descongelamiento explícito y creación de una nueva versión (v1.2+). Este congelamiento garantiza la integridad del sistema, la reproducibilidad de resultados, y la validez de auditoría.

**Firmado**: Sistema ARESK-OBS v1.1  
**Fecha**: 2026-02-09  
**Versión**: v1.1 FROZEN

---

**Copyright (c) 2026 Ever (Caelion1207). Todos los derechos reservados.**

**ARESK-OBS v1.1 – Sistema Cerrado y Operacional**
