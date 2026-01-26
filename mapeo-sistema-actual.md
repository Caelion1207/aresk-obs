# Mapeo del Sistema ARESK-OBS Actual
## Identificación de Funcionalidad vs Jerga Innecesaria

**Fecha**: 26 de Enero de 2026  
**Checkpoint Actual**: e64751b2  
**Objetivo**: Identificar qué funciona, qué es jerga, y qué realmente aporta

---

## 1. Estado del Backend (Base de Datos y Lógica)

### 1.1 Schema Actual (`drizzle/schema.ts`)

**Tablas implementadas**:
```typescript
// TABLA: sessions
- id, userId, perfilPlanta (tipo_a, tipo_b, acoplada)
- purpose, limits, ethics (Capa 0)
- isTestData, timestamp

// TABLA: messages  
- id, sessionId, role, content, timestamp

// TABLA: metrics
- id, sessionId, messageId
- coherenciaObservable    // ← Métrica Ω
- entropiaH               // ← Métrica ε
- funcionLyapunov         // ← Métrica V
- timestamp

// TABLA: cycles (Gobernanza)
- id, sessionId, cycleNumber, protocolId
- status, startedAt, completedAt

// TABLA: argosCosts (Costes de control)
- id, cycleId, costType, amount, timestamp

// TABLA: ethicalLogs (Logs éticos)
- id, sessionId, eventType, severity, resolution
- description, timestamp

// TABLA: auditLogs (Auditoría)
- id, sessionId, eventType, actor
- dataSnapshot, previousHash, currentHash
- timestamp

// TABLA: protocolEvents
- id, sessionId, protocolId, eventType
- payload, timestamp
```

**Análisis**:
- ✅ **Funcional**: sessions, messages, metrics (3 métricas básicas)
- ⚠️ **Gobernanza**: cycles, argosCosts, ethicalLogs, auditLogs, protocolEvents
  - **Pregunta**: ¿Estas tablas tienen datos reales o son estructura vacía?
  - **Pregunta**: ¿Son necesarias para el instrumento de medición?

### 1.2 Routers Actual (`server/routers.ts`)

**Endpoints implementados**:
```typescript
// Auth
- auth.me
- auth.logout

// Sessions
- sessions.list
- sessions.create
- sessions.getById

// Messages
- messages.list
- messages.create

// Metrics
- metrics.list
- metrics.getBySession

// System (?)
- system.notifyOwner
```

**Análisis**:
- ✅ **Funcional**: auth, sessions, messages, metrics
- ❓ **Cuestionable**: system.notifyOwner (¿se usa?)

### 1.3 Datos Reales

**Experimento A-1**:
- ✅ 50 mensajes
- ✅ 50 registros de métricas (coherenciaObservable, entropiaH, funcionLyapunov)
- ❓ ¿Hay datos en cycles, argosCosts, ethicalLogs, auditLogs?

---

## 2. Estado del Frontend (Páginas y Componentes)

### 2.1 Páginas Principales

**Estructura actual**:
```
/                    → Home.tsx
/campo               → CampoPage.tsx
/marco               → MarcoPage.tsx
/instrumento         → InstrumentoPage.tsx
/investigacion       → ResearchPage.tsx
/sistema/flujo       → SystemFlow.tsx
/experimento/estabilidad → ExperimentoEstabilidad.tsx
/experimento/comparar    → ExperimentoComparar.tsx
/dashboard           → CoreDashboard.tsx
/hud                 → HUDMetrics.tsx
```

**Análisis por página**:

#### Home.tsx
- ✅ **Funcional**: Hero section, 3 pilares (Campo/Marco/Instrumento)
- ✅ **Funcional**: Botones a páginas clave
- ⚠️ **Revisar**: ¿Texto es claro o tiene jerga innecesaria?

#### CampoPage.tsx
- ✅ **Funcional**: Define Ingeniería Coignitiva
- ✅ **Funcional**: Sistema S=(H,M,C,Ω,Π)
- ✅ **Funcional**: Capa 0 (purpose, limits, ethics)
- ⚠️ **Revisar**: ¿Hay jerga de "locus de inteligencia" innecesaria?

#### MarcoPage.tsx
- ✅ **Funcional**: Define CAELION
- ✅ **Funcional**: 5 módulos supervisores
- ✅ **Funcional**: Protocolos operativos
- ⚠️ **Revisar**: ¿Diagrama unificado está o es promesa vacía?

#### InstrumentoPage.tsx
- ✅ **Funcional**: Define ARESK-OBS como instrumento
- ✅ **Funcional**: 3 métricas canónicas (ε, Ω, V)
- ✅ **Funcional**: Zonas de régimen (0.5, 2, 4)
- ✅ **Funcional**: Control por régimen
- ⚠️ **Revisar**: ¿Hay secciones con jerga innecesaria?

#### ExperimentoEstabilidad.tsx
- ✅ **Funcional**: Muestra datos reales de A-1 (50 mensajes)
- ✅ **Funcional**: Gráficas con líneas de umbral
- ✅ **Funcional**: Tabla de métricas
- ✅ **Funcional**: Descarga CSV
- ⚠️ **Revisar**: ¿Texto es claro o confuso?

#### ExperimentoComparar.tsx
- ❌ **NO FUNCIONAL**: Datos simulados (B y C no existen)
- ❓ **Cuestionable**: ¿Mantener o eliminar?

#### CoreDashboard.tsx
- ⚠️ **Revisar**: ¿Muestra datos reales o es UI vacía?

#### HUDMetrics.tsx
- ⚠️ **Revisar**: ¿Muestra datos reales o es UI vacía?

#### ResearchPage.tsx
- ✅ **Funcional**: Lista 8 PDFs de investigación
- ✅ **Funcional**: Botones de descarga
- ⚠️ **Revisar**: ¿PDFs están en public/research/?

#### SystemFlow.tsx
- ❓ **Cuestionable**: ¿Muestra diagrama real o genérico?

### 2.2 Componentes Clave

**RegimeZonesVisualization.tsx**:
- ✅ **Funcional**: Gráfica de zonas operativas
- ✅ **Funcional**: 5 zonas (Colapso, Reposo, Estable, Tolerable, Intervención)

**HelpDialog.tsx**:
- ⚠️ **Revisar**: ¿Contiene jerga innecesaria?

---

## 3. Identificación de Jerga Innecesaria

### 3.1 Términos Sospechosos

Buscar en todo el código:
- "locus de inteligencia"
- "emergente"
- "ontológico"
- "paradigma"
- "revolucionario"
- "disruptivo"
- "transformador"

### 3.2 Secciones Sospechosas

- Cualquier sección que hable de "futuro" sin datos
- Cualquier sección que hable de "validación" sin experimentos
- Cualquier sección que hable de "comparación" sin datos de B y C

---

## 4. Historial de Checkpoints

**Checkpoints disponibles**:
```
e64751b2 - Limpieza de evidencia externa (actual)
5d2e7615 - Agregar líneas de umbral en gráficas
fe91727d - Implementar control por régimen
98650e00 - Reestructuración conceptual completa
7074c969 - Aplicar diseño visual del PDF
b9568281 - Agregar página de documentación de investigación
e643939a - Proyecto inicial
```

**Análisis**:
- **e643939a**: Proyecto inicial (¿punto estable?)
- **b9568281**: Agregó ResearchPage (funcional)
- **7074c969**: Aplicó diseño visual (funcional)
- **98650e00**: Reestructuración conceptual (¿agregó jerga?)
- **fe91727d**: Control por régimen (funcional)
- **5d2e7615**: Líneas de umbral (funcional)
- **e64751b2**: Limpieza evidencia (actual)

**Hipótesis**: La jerga se agregó en **98650e00** (reestructuración conceptual)

---

## 5. Qué del Documento Formal Realmente Aporta

### 5.1 Aportes Reales

Del documento "Ingeniería Coignitiva: Un Marco Formal e Instrumental":

**✅ Aporta (clarifica lo existente)**:
1. Separación explícita: Campo / Artefacto / Instrumento
2. Notación formal: x_k (bruto) vs x̂_k (consolidado)
3. Definición precisa de Capa 0: x_ref = {P, L, E}
4. Definición precisa de L₀: lenguaje admisible
5. Axioma: ∀k, x̂_k ∈ L₀
6. CAELION como supervisor de invariancia (no optimizador)
7. ARESK-OBS como instrumento de diagnóstico (no controlador)

**❌ NO aporta (ya está o es jerga)**:
1. "Locus de inteligencia" → Jerga innecesaria
2. "Emergente" → Jerga innecesaria
3. "Paradigma" → Jerga innecesaria
4. Metodología experimental → No tenemos datos para grupos B y C
5. Criterios de éxito → No tenemos horizonte largo (>100 turnos)

### 5.2 Métricas Canónicas

**Documento formal define 4 métricas**:
1. V (Coste de Estabilidad): V_k = e_kᵀ P e_k
2. Ω (Coherencia Observable): Ω_k = cos(x̂_k, x_ref)
3. ε_eff (Eficiencia Semántica): ε_effₖ = ΔH / tokens_k
4. C (Coste de Gobernanza): C_k = N_intervenciones / ||e_k||²

**Implementación actual tiene 3 métricas**:
1. funcionLyapunov → V ✅
2. coherenciaObservable → Ω ✅
3. entropiaH → ε ⚠️ (nombre incorrecto, pero concepto correcto)

**Análisis**:
- ✅ V y Ω están bien
- ⚠️ ε tiene nombre incorrecto pero funciona
- ❌ C (Coste de Gobernanza) falta

**Decisión**:
- **NO cambiar** nombres de métricas en DB (rompe datos existentes)
- **SÍ aclarar** en documentación qué mide cada una
- **NO agregar** métrica C si no tenemos datos de intervenciones

---

## 6. Plan de Limpieza

### 6.1 Qué MANTENER (Funcional)

**Backend**:
- ✅ Tablas: sessions, messages, metrics
- ✅ Endpoints: auth, sessions, messages, metrics
- ✅ Métricas: coherenciaObservable, entropiaH, funcionLyapunov

**Frontend**:
- ✅ Home, CampoPage, MarcoPage, InstrumentoPage
- ✅ ExperimentoEstabilidad (datos reales A-1)
- ✅ ResearchPage
- ✅ RegimeZonesVisualization

**Datos**:
- ✅ Experimento A-1 (50 mensajes)

### 6.2 Qué REVISAR (Posible Jerga)

**Páginas**:
- ⚠️ CampoPage: Buscar "locus", "emergente", "paradigma"
- ⚠️ MarcoPage: Buscar jerga innecesaria
- ⚠️ InstrumentoPage: Buscar jerga innecesaria
- ⚠️ Home: Buscar jerga innecesaria

**Componentes**:
- ⚠️ HelpDialog: Revisar contenido

### 6.3 Qué ELIMINAR o MARCAR COMO FUTURO

**Backend**:
- ❓ Tablas de gobernanza (cycles, argosCosts, ethicalLogs, auditLogs) si están vacías
- ❓ system.notifyOwner si no se usa

**Frontend**:
- ❌ ExperimentoComparar (datos simulados)
- ❓ CoreDashboard si no tiene datos reales
- ❓ HUDMetrics si no tiene datos reales
- ❓ SystemFlow si es diagrama genérico

### 6.4 Qué ACLARAR (Documentación)

**En InstrumentoPage**:
- ✅ Aclarar que coherenciaObservable = Ω
- ✅ Aclarar que entropiaH = ε (o ε_eff)
- ✅ Aclarar que funcionLyapunov = V
- ✅ Aclarar que x̂_k es estado consolidado (post-CAELION)

**En CampoPage**:
- ✅ Aclarar que S = (H, M, C, Ω, Π)
- ✅ Aclarar que Capa 0 = {P, L, E}
- ✅ Aclarar que L₀ es lenguaje admisible
- ❌ Eliminar jerga de "locus de inteligencia" si existe

**En MarcoPage**:
- ✅ Aclarar que CAELION es supervisor de invariancia
- ✅ Aclarar axioma: ∀k, x̂_k ∈ L₀
- ❌ Eliminar jerga innecesaria

---

## 7. Próximos Pasos

### Paso 1: Buscar Jerga
Buscar en todo el código:
```bash
grep -r "locus de inteligencia" client/src/
grep -r "emergente" client/src/
grep -r "paradigma" client/src/
grep -r "ontológico" client/src/
```

### Paso 2: Revisar Checkpoint Estable
Comparar con checkpoint **7074c969** (antes de reestructuración)

### Paso 3: Identificar Qué Eliminar
- Páginas sin datos reales
- Secciones con promesas vacías
- Jerga innecesaria

### Paso 4: Consolidar
- Mantener solo lo funcional
- Aclarar documentación
- Eliminar jerga

---

## 8. Resumen Ejecutivo

### Estado Actual
- ✅ **Backend funcional**: 3 métricas, experimento A-1
- ✅ **Frontend funcional**: Páginas clave con diseño coherente
- ⚠️ **Posible jerga**: En CampoPage, MarcoPage, InstrumentoPage
- ❌ **Datos simulados**: ExperimentoComparar (B y C no existen)

### Hipótesis
La jerga se agregó en checkpoint **98650e00** (reestructuración conceptual)

### Recomendación
1. Buscar jerga en páginas clave
2. Comparar con checkpoint **7074c969** (punto estable)
3. Eliminar jerga innecesaria
4. Mantener solo lo funcional
5. Aclarar documentación sin cambiar nombres de métricas

---

**Mapeo generado automáticamente**  
**Fecha**: 26 de Enero de 2026  
**Versión**: 1.0
