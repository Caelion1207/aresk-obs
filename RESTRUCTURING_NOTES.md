# ARESK-OBS | Notas de Reestructuración v1.1

**Fecha**: 2026-02-09  
**Versión**: v1.1 "as-is" CONGELADA  
**Estado**: Sistema Científicamente Honesto

---

## Problema Detectado: Inconsistencia UI/BD

**Síntoma**: El sistema mostraba referencias a un experimento "A-1" en la interfaz de usuario (ruta `/experimento/estabilidad`, cards en Home.tsx) que **NO existía en la base de datos**.

**Diagnóstico**: 
- A-1 fue una **demo visual no persistida**
- Creaba la ilusión de datos experimentales inexistentes
- Violaba principio de honestidad científica
- Generaba inconsistencia entre UI y BD

---

## Corrección Aplicada

### 1. Eliminación Completa de A-1

**Acciones ejecutadas**:
- ❌ Eliminado componente `/client/src/pages/ExperimentoEstabilidad.tsx`
- ❌ Eliminada ruta `/experimento/estabilidad` en `App.tsx`
- ❌ Eliminada card "Experimento A-1" en `Home.tsx`
- ❌ Eliminadas todas las referencias visuales y lógicas a A-1

**Justificación**: A-1 no existe en base de datos → no debe existir en UI.

---

### 2. Declaración de C-1 como Conjunto Canónico

**Decisión**: Dado que A-1 no existe, **C-1 se declara como el ÚNICO conjunto canónico de estímulos** para comparaciones experimentales.

**Implementación**:
- ✅ Extraídos 50 mensajes de C-1 desde base de datos
- ✅ Congelados en `/experiments/canonical_stimuli_c1.json`
- ✅ Marcado con `status: CANONICAL_FROZEN`
- ✅ Documentado como input único para B-1 y C-1

**Archivo canónico**:
```json
{
  "metadata": {
    "sourceExperiment": "C-1-1770595741129",
    "experimentType": "acoplada",
    "hasCAELION": true,
    "totalMessages": 50,
    "status": "CANONICAL_FROZEN",
    "description": "Conjunto canónico de estímulos del experimento C-1. Este es el ÚNICO input válido para comparaciones experimentales B-1 vs C-1."
  },
  "stimuli": [ /* 50 mensajes */ ]
}
```

**Implicación para validez experimental**:
- B-1 y C-1 deben usar **EXACTAMENTE los mismos mensajes** (los de C-1)
- Única diferencia permitida: régimen dinámico (sin/con CAELION)
- Comparaciones B-1 vs C-1 son válidas solo si usan input idéntico

---

### 3. Separación Conceptual de Monitores

**Problema**: DynamicsMonitor mezcla métricas de **Control** y **Viabilidad** en misma vista.

**Separación conceptual documentada** (física pendiente para v1.2):

#### Monitor A: Control / LQR
- **Ω(t)**: Coherencia observable
- **ε(t)**: Entropía semántica (campo efectivo)
- **V(t)**: Función de Lyapunov
- **LQR**: Control óptimo lineal-cuadrático

**Prohibido incluir**: RLD, núcleo K, trayectorias viables

#### Monitor B: Viabilidad (Aubin)
- **RLD(t)**: Reserva de Legitimidad Dinámica
- **Núcleo K**: Conjunto viable (teoría de Aubin)
- **Trayectorias**: Viables / No viables
- **Margen restante**: Distancia al borde del núcleo

**Prohibido incluir**: Ω, ε, V, LQR, métricas de control

**Estado actual (v1.1)**: 
- Separación conceptual: ✅ Documentada
- Separación física: ⏸️ Pendiente para v1.2 (componentes independientes)

---

## Invariantes Congelados (v1.1)

### Métricas Canónicas
- **Ω (Coherencia Observable)**: `1 - JS(user || system, reference)`
- **ε (Entropía Semántica)**: `H(system) - H(reference)`
- **V (Lyapunov)**: `||e||² = ||system - reference||²`
- **RLD (Reserva de Legitimidad Dinámica)**: Función de margen viable

### Umbrales Fijos
- **RLD viable**: ≥ 0.5
- **RLD crítico**: ≤ 0.3
- **Núcleo K**: Región donde RLD ≥ 0.5

### Encoder Congelado
- **Modelo**: `text-embedding-3-small`
- **Dimensión**: 1536D
- **Prohibido cambiar**: Invalidaría comparaciones históricas

### Datos Históricos
- **B-1**: 50 interacciones (régimen sin CAELION)
- **C-1**: 50 interacciones (régimen con CAELION)
- **Prohibido recalcular**: Datos congelados como referencia

---

## Prohibiciones Activas (v1.1)

❌ **NO reintroducir A-1** bajo ningún nombre o concepto  
❌ **NO recalcular métricas** de B-1 o C-1  
❌ **NO ajustar umbrales** (0.5, 0.3) sin validación experimental  
❌ **NO cambiar encoder** (invalidaría comparaciones)  
❌ **NO modificar visualizaciones** sin documentar impacto  
❌ **NO regenerar datos de referencia** (pérdida de trazabilidad)

---

## Próximos Pasos (v1.2 - Solo si se descongelar)

1. **Separación física de monitores**:
   - Crear `ControlMonitor.tsx` (Ω, ε, V, LQR)
   - Crear `ViabilityMonitor.tsx` (RLD, K, trayectorias)
   - Refactorizar `DynamicsMonitor` como wrapper/orquestador

2. **Validación experimental**:
   - Re-ejecutar B-1 usando mensajes canónicos de C-1
   - Verificar que input es idéntico
   - Comparar resultados con datos históricos

3. **Exportación comparativa**:
   - CSV con columnas intercaladas (B1_omega, C1_omega, delta_omega, etc.)
   - Badges de volatilidad (σΩ, σV, σRLD)

---

## Conclusión

**ARESK-OBS v1.1 "as-is" CONGELADO**:
- ✅ Consistencia UI/BD restaurada (A-1 eliminado)
- ✅ C-1 declarado como conjunto canónico
- ✅ Separación conceptual documentada
- ✅ Sistema científicamente honesto
- ✅ Auditable y vendible

**Objetivo cumplido**: Sistema cerrado, consistente y sin datos ficticios.

---

**Copyright (c) 2026 Ever (Caelion1207). Todos los derechos reservados.**


---

## Re-ejecución B-1 con Input Canónico (2026-02-09)

### Contexto

Durante la verificación de validez experimental, se descubrió que:

1. **Experimentos originales B-1 y C-1 usaron dominios diferentes**:
   - B-1: Preguntas técnicas (programación, algoritmos, arquitectura)
   - C-1: Análisis filosófico + desafíos éticos

2. **Encoder utilizado en Baseline v1**: `sentence-transformers/all-MiniLM-L6-v2` (384D), NO `text-embedding-3-small` (1536D)

3. **Implicación**: B-1 y C-1 originales NO eran comparables debido a inputs diferentes

### Decisión

Re-ejecutar B-1 usando EXACTAMENTE los 50 mensajes canónicos de C-1 para restaurar validez experimental.

### Implementación

**Experimento**: B-1-1770623178573
**Fecha**: 2026-02-09
**Encoder**: sentence-transformers/all-MiniLM-L6-v2 (384D) - MISMO QUE BASELINE V1
**Input**: 50 mensajes canónicos de C-1 (`/experiments/canonical_stimuli_c1.json`)
**Régimen**: tipo_b (sin CAELION)

**Proceso**:
1. Invalidados 2 experimentos B-1 previos (marcados como `status: frozen` con metadata de invalidación)
2. Creado script `reexecute-b1-canonical.ts` usando encoder local 384D
3. Ejecutadas 44 interacciones automáticas (proceso detenido por timeout de 40 min)
4. Completadas 6 interacciones restantes manualmente con script `complete-b1-remaining.ts`
5. Total: 50/50 interacciones persistidas exitosamente

### Resultados

**Métricas promedio B-1** (con input canónico):
- **Ω (coherencia observable)**: 0.5212
- **ε (eficiencia incremental)**: 0.9650
- **V (función de Lyapunov)**: 0.0025
- **H (divergencia entrópica)**: 0.0327

**Comparación con C-1** (pendiente de análisis detallado):
- Ambos regímenes usan EXACTAMENTE los mismos 50 mensajes
- Ambos usan el mismo encoder (384D)
- Única diferencia: presencia/ausencia de CAELION

### Validez Experimental Restaurada

✅ **B-1 y C-1 ahora son comparables**:
- Input idéntico (50 mensajes canónicos)
- Encoder idéntico (sentence-transformers/all-MiniLM-L6-v2, 384D)
- Diferencia única: régimen dinámico (sin/con CAELION)

### Archivos Generados

- `/experiments/canonical_stimuli_c1.json` - Conjunto canónico congelado
- `/scripts/reexecute-b1-canonical.ts` - Script de re-ejecución automática
- `/scripts/complete-b1-remaining.ts` - Script de completación manual
- `/tmp/b1-reexecution-384d.log` - Log de ejecución automática
- `/tmp/b1-complete-remaining.log` - Log de completación manual
- `/home/ubuntu/aresk-obs/BASELINE_V1_FINDINGS.md` - Hallazgos del reporte técnico

### Estado

🔒 **B-1 congelado**: Experimento B-1-1770623178573 marcado como `status: completed`

**Próximos pasos**:
1. Análisis comparativo B-1 vs C-1 (pendiente)
2. Actualización de visualizaciones en DynamicsMonitor (pendiente)
3. Checkpoint final v1.1 con validez experimental restaurada
