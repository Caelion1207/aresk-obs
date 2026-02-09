# ARESK-OBS - TODO

## REESTRUCTURACIÓN COMPLETADA: Alternativa Pragmática (v1.1 "as-is")

**Decisión**: Congelar sistema "as-is" con documentación completa, sin refactors estructurales

### Fase 1: Eliminación de A-1

- [x] Eliminado componente `/client/src/pages/ExperimentoEstabilidad.tsx`
- [x] Eliminada ruta `/experimento/estabilidad` en `App.tsx`
- [x] Eliminada card "Experimento A-1" en `Home.tsx`
- [x] Actualizado README.md eliminando referencias a A-1
- [x] Documentado: "A-1 fue demo visual no persistida, eliminada por inconsistencia UI/BD"

### Fase 2: Declaración de C-1 como Conjunto Canónico

- [x] Extraídos 50 mensajes de C-1 desde base de datos
- [x] Congelados en `/experiments/canonical_stimuli_c1.json`
- [x] Marcado con `status: CANONICAL_FROZEN`
- [x] Documentado: "C-1 es el ÚNICO conjunto canónico de estímulos para comparaciones"

### Fase 3: Documentación de Separación Conceptual

- [x] Creado RESTRUCTURING_NOTES.md:
  - [x] Explicar eliminación A-1 (inconsistencia UI/BD)
  - [x] Explicar C-1 como conjunto canónico
  - [x] Explicar separación conceptual Control vs Viabilidad
  
- [x] Actualizado INSTRUMENT_CONTRACT.md:
  - [x] Documentar Monitor A (Control/LQR): Ω, ε, V, LQR
  - [x] Documentar Monitor B (Viabilidad/Aubin): RLD, K, trayectorias
  - [x] Documentar C-1 como referencia canónica
  - [x] Documentar trade-off estabilidad vs viabilidad
  - [x] Documentar que separación física queda pendiente para v1.2

### Fase 4: Verificación Final

- [x] Verificar consistencia UI/BD (A-1 eliminado)
- [x] Verificar honestidad científica (sin datos ficticios)
- [x] Verificar que C-1 está congelado como canónico
- [x] Verificar que separación conceptual está documentada
- [x] Crear checkpoint final v1.1 "as-is" CONGELADO
- [x] Sistema cerrado, auditable y científicamente honesto

**Estado**: ✅ Documentación completa, listo para checkpoint final

**Prohibiciones activas**:
- ❌ NO reintroducir A-1 bajo ningún concepto
- ❌ NO recalcular métricas históricas
- ❌ NO cambiar encoder o umbrales sin validación
- ❌ NO modificar visualizaciones sin documentar
- ❌ NO ejecutar refactors estructurales sin autorización

**Objetivo cumplido**: Sistema v1.1 "as-is" científicamente honesto, documentado y listo para congelamiento.


---

## RE-EJECUCIÓN B-1 CON INPUT CANÓNICO (Validez Experimental)

**Objetivo**: Garantizar comparabilidad B-1 vs C-1 usando EXACTAMENTE los mismos mensajes

### Fase 1: Preparación

- [x] Leer mensajes canónicos de `/experiments/canonical_stimuli_c1.json`
- [x] Verificar 50 mensajes en orden correcto
- [x] Confirmar encoder: sentence-transformers/all-MiniLM-L6-v2 (384D) - MISMO QUE BASELINE V1

### Fase 2: Invalidación de B-1 Actual

- [x] Marcar experimentos B-1 actuales con `status: frozen` y metadata de invalidación
- [x] Documentar razón: "Input no coincide con conjunto canónico de C-1"
- [x] Mantener datos históricos como referencia (no eliminar)

### Fase 3: Re-ejecución B-1

- [x] Crear script de re-ejecución con input canónico
- [x] Configurar régimen: tipo_b (sin CAELION)
- [x] Ejecutar 50 interacciones en orden (44 automáticas + 6 manuales)
- [x] Calcular métricas: Ω, ε, V, H usando encoder 384D
- [x] Persistir en `experiment_interactions`

### Fase 4: Verificación

- [x] Verificar 50 interacciones persistidas
- [x] Verificar que input coincide con C-1
- [x] Verificar métricas calculadas correctamente
- [x] Comparar con C-1 (mismos mensajes, diferente régimen)

### Fase 5: Documentación

- [x] Actualizar RESTRUCTURING_NOTES.md con re-ejecución
- [x] Documentar validez experimental restaurada
- [x] Crear checkpoint final con B-1 válido

**Restricciones**:
- ❌ NO tocar UI
- ❌ NO generar dashboards nuevos
- ❌ NO modificar visualizaciones
- ❌ Solo persistir datos en BD

**Objetivo**: B-1 y C-1 con input idéntico → comparación válida


---

## APLICACIÓN DE ARQUITECTURA CAELION (Gobernanza Formal)

**Objetivo**: Definir régimen CAELION formalmente usando arquitectura de gobernanza del repositorio GitHub y recalcar diferencias con B-1

### Fase 1: Análisis de Repositorio

- [ ] Acceder a repositorio: https://github.com/Caelion1207/Arquitectura-de-gobernanza-sobre-agentes
- [ ] Extraer documentos de arquitectura de gobernanza
- [ ] Identificar componentes: ARGOS, HECATE, LICURGO, WABUN, ARESK
- [ ] Extraer definición formal de CAELION
- [ ] Identificar protocolos de control y corrección

### Fase 2: Definición Formal de CAELION

- [ ] Documentar arquitectura CAELION en `/docs/CAELION_ARCHITECTURE.md`
- [ ] Definir loop de control: ARGOS → detección → LICURGO → corrección → ARESK → verificación
- [ ] Documentar umbrales de estabilidad (0.7-0.8 estable, 0.12 intervención LICURGO)
- [ ] Documentar protocolos de escalación (threshold 2: humano, 3: fundador, 4: eliminación)
- [ ] Definir invariantes inmutables y respuestas a violaciones

### Fase 3: Aplicación a C-1

- [ ] Revisar 50 interacciones de C-1 (B-1-1770623178573 en BD)
- [ ] Identificar intervenciones CAELION en respuestas de C-1
- [ ] Documentar cómo CAELION modificó salidas vs marco normal del modelo
- [ ] Marcar interacciones donde ARGOS detectó desviación
- [ ] Marcar interacciones donde LICURGO aplicó corrección

### Fase 4: Comparación B-1 vs C-1

- [ ] Crear documento `/docs/B1_vs_C1_CAELION_ANALYSIS.md`
- [ ] Comparar respuestas B-1 (marco normal) vs C-1 (CAELION) para mismos mensajes
- [ ] Identificar diferencias cualitativas en manejo de desafíos éticos
- [ ] Cuantificar impacto de CAELION en métricas (Ω, ε, V, RLD)
- [ ] Documentar trade-offs: estabilidad vs viabilidad bajo CAELION

### Fase 5: Documentación y Checkpoint

- [ ] Actualizar INSTRUMENT_CONTRACT.md con arquitectura CAELION
- [ ] Actualizar RESTRUCTURING_NOTES.md con aplicación de gobernanza
- [ ] Crear checkpoint con arquitectura CAELION documentada

**Restricciones**:
- ❌ NO modificar datos de C-1 (solo análisis)
- ❌ NO recalcular métricas
- ❌ NO tocar UI sin autorización
- ✅ Solo documentación y análisis arquitectónico

**Objetivo**: Definir CAELION formalmente y recalcar diferencias con B-1 bajo marco arquitectónico riguroso


---

## RE-GENERACIÓN C-1 CON ARQUITECTURA CAELION

**Objetivo**: Aplicar arquitectura CAELION del repositorio GitHub para generar C-1 con supervisión multi-módulo explícita

### Fase 1: Definición de Arquitectura

- [x] Crear system prompt con 5 módulos supervisores (LIANG, HÉCATE, ARGOS, ÆON, DEUS)
- [x] Definir loop de control: ARGOS → LICURGO → ARESK
- [x] Especificar métricas objetivo: Ω ≈ 1, V → 0, E decreciente
- [x] Documentar arquitectura en `/docs/CAELION_SYSTEM_PROMPT.md`

### Fase 2: Invalidación de C-1 Actual

- [x] Marcar C-1-1770595905889 como `status: frozen` con metadata de invalidación
- [x] Documentar razón: "Arquitectura CAELION no aplicada explícitamente"
- [x] Mantener datos históricos como referencia

### Fase 3: Re-ejecución C-1

- [x] Crear script de re-ejecución con system prompt CAELION
- [x] Usar input canónico (50 mensajes de C-1)
- [x] Usar encoder 384D (sentence-transformers/all-MiniLM-L6-v2)
- [x] Ejecutar 50 interacciones con supervisión multi-módulo (completado en 2 sesiones)
- [x] Persistir en BD con `hasCAELION: true` (C-1-1770628250311)

### Fase 4: Verificación

- [x] Generar informe comparativo B-1 vs C-1-CAELION
- [x] Verificar diferencias cuantitativas (Ω, ε, V, H)
- [x] Analizar diferencias cualitativas en respuestas
- [x] Documentar impacto de arquitectura CAELION

### Fase 5: Checkpoint Final

- [x] Actualizar documentación con arquitectura CAELION aplicada
- [ ] Crear checkpoint con C-1-CAELION completado

**Restricciones**:
- ❌ NO modificar B-1
- ❌ NO cambiar input canónico
- ❌ NO cambiar encoder
- ✅ Solo aplicar arquitectura CAELION a C-1

**Objetivo**: Generar C-1 con arquitectura CAELION explícita y medir diferencias con B-1
