# Plan de Congelación: ARESK-OBS
## Eliminar lo que no aporta, congelar el instrumento

**Fecha**: 26 de Enero de 2026  
**Objetivo**: Dejar solo lo esencial para ARESK-OBS como instrumento de medición

---

## 1. Criterios de Eliminación

### ¿Qué MANTENER?

**✅ Aporta a ARESK-OBS como instrumento**:
- Páginas que explican el instrumento
- Páginas que muestran datos reales (experimento A-1)
- Componentes que visualizan métricas
- Backend que calcula métricas

**✅ Aporta al régimen CAELION para la prueba**:
- Documentación de CAELION como marco evaluado
- Experimento A-1 (régimen acoplada con CAELION)
- Métricas que evalúan CAELION

### ¿Qué ELIMINAR?

**❌ NO aporta**:
- Páginas legacy sin datos reales
- Páginas con datos simulados
- Componentes no usados
- Jerga innecesaria
- Promesas de funcionalidad futura

---

## 2. Inventario de Páginas

### Páginas en App.tsx

```typescript
// Rutas actuales
/ → Home.tsx
/campo → CampoPage.tsx
/marco → MarcoPage.tsx
/instrumento → InstrumentoPage.tsx
/investigacion → ResearchPage.tsx
/sistema/flujo → SystemFlow.tsx
/sistema/arquitectura → Architecture.tsx  // ❌ ELIMINAR
/sistema/modulos → Modules.tsx            // ❌ ELIMINAR
/experimento/estabilidad → ExperimentoEstabilidad.tsx
/experimento/comparar → ExperimentoComparar.tsx  // ❌ ELIMINAR
/dashboard → CoreDashboard.tsx            // ⚠️ REVISAR
/hud → HUDMetrics.tsx                     // ⚠️ REVISAR
```

### Decisiones

**✅ MANTENER (Esenciales)**:
1. **Home.tsx** - Página de entrada
2. **CampoPage.tsx** - Explica Ingeniería Coignitiva
3. **MarcoPage.tsx** - Explica CAELION (marco evaluado)
4. **InstrumentoPage.tsx** - Explica ARESK-OBS
5. **ExperimentoEstabilidad.tsx** - Datos reales A-1
6. **ResearchPage.tsx** - Documentación PDF

**❌ ELIMINAR (No aportan)**:
1. **Architecture.tsx** - Legacy, tiene "emergente"
2. **Modules.tsx** - Legacy, tiene "emergente"
3. **ExperimentoComparar.tsx** - Datos simulados (B y C no existen)

**⚠️ REVISAR (Decidir)**:
1. **SystemFlow.tsx** - ¿Tiene diagrama real o genérico?
2. **CoreDashboard.tsx** - ¿Tiene datos reales o UI vacía?
3. **HUDMetrics.tsx** - ¿Tiene datos reales o UI vacía?

---

## 3. Inventario de Componentes

### Componentes en client/src/components/

```
RegimeZonesVisualization.tsx  // ✅ MANTENER (usado en InstrumentoPage)
HelpDialog.tsx                // ✅ MANTENER (ayuda contextual)
TensionVectors.tsx            // ❓ ¿Se usa?
DashboardLayout.tsx           // ❓ ¿Se usa?
AIChatBox.tsx                 // ❓ ¿Se usa?
Map.tsx                       // ❓ ¿Se usa?
```

### Decisiones

**✅ MANTENER**:
- RegimeZonesVisualization.tsx
- HelpDialog.tsx (limpiar jerga)

**❓ REVISAR**:
- TensionVectors.tsx - ¿Se usa en alguna página?
- DashboardLayout.tsx - ¿Se usa en alguna página?
- AIChatBox.tsx - ¿Se usa?
- Map.tsx - ¿Se usa?

---

## 4. Limpieza de Jerga

### CampoPage.tsx
- ❌ Eliminar: "locus de inteligencia" (línea 81)
- ✅ Reemplazar: "LLM u otro sistema de inferencia (reemplazable)"

### HelpDialog.tsx
- ✅ Mantener: "referencia ontológica" (es término técnico correcto)

---

## 5. Plan de Ejecución

### Fase 1: Verificar Uso de Componentes

```bash
# Buscar si TensionVectors se usa
grep -r "TensionVectors" client/src/pages/

# Buscar si DashboardLayout se usa
grep -r "DashboardLayout" client/src/pages/

# Buscar si AIChatBox se usa
grep -r "AIChatBox" client/src/pages/

# Buscar si Map se usa
grep -r "Map" client/src/pages/
```

### Fase 2: Verificar Páginas Cuestionables

```bash
# Ver si SystemFlow tiene diagrama real
cat client/src/pages/SystemFlow.tsx | grep -A 10 "diagrama"

# Ver si CoreDashboard tiene datos reales
cat client/src/pages/CoreDashboard.tsx | grep -A 10 "trpc"

# Ver si HUDMetrics tiene datos reales
cat client/src/pages/HUDMetrics.tsx | grep -A 10 "trpc"
```

### Fase 3: Eliminar Páginas Innecesarias

1. Eliminar Architecture.tsx
2. Eliminar Modules.tsx
3. Eliminar ExperimentoComparar.tsx
4. Eliminar rutas en App.tsx

### Fase 4: Eliminar Componentes No Usados

(Después de verificar uso)

### Fase 5: Limpiar Jerga

1. CampoPage.tsx: Eliminar "locus de inteligencia"

### Fase 6: Actualizar Home.tsx

Eliminar botones a páginas eliminadas

### Fase 7: Verificar Navegación

Asegurar que no haya enlaces rotos

### Fase 8: Checkpoint Final

Crear checkpoint "ARESK-OBS: Instrumento Congelado"

---

## 6. Estado Final Esperado

### Páginas Finales (6)
1. Home
2. CampoPage (Ingeniería Coignitiva)
3. MarcoPage (CAELION)
4. InstrumentoPage (ARESK-OBS)
5. ExperimentoEstabilidad (A-1)
6. ResearchPage (PDFs)

### Componentes Finales
- RegimeZonesVisualization
- HelpDialog (limpio)
- (Otros si se usan)

### Backend Final
- sessions, messages, metrics
- Experimento A-1 (50 mensajes)

### Métricas Finales (3)
- coherenciaObservable (Ω)
- entropiaH (ε)
- funcionLyapunov (V)

---

## 7. Resumen

**Eliminar**:
- 3 páginas legacy (Architecture, Modules, ExperimentoComparar)
- Jerga: "locus de inteligencia"
- Componentes no usados (TBD)

**Mantener**:
- 6 páginas esenciales
- Experimento A-1 (datos reales)
- 3 métricas canónicas
- Documentación PDF

**Resultado**:
- Instrumento congelado
- Solo lo esencial
- Sin promesas vacías
- Sin datos simulados

---

**Plan generado automáticamente**  
**Fecha**: 26 de Enero de 2026  
**Versión**: 1.0
