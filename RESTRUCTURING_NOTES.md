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
