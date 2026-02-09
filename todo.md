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
- [ ] Crear checkpoint final v1.1 "as-is" CONGELADO
- [ ] Sistema cerrado, auditable y científicamente honesto

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
- [ ] Crear checkpoint final con B-1 válido

**Restricciones**:
- ❌ NO tocar UI
- ❌ NO generar dashboards nuevos
- ❌ NO modificar visualizaciones
- ❌ Solo persistir datos en BD

**Objetivo**: B-1 y C-1 con input idéntico → comparación válida
