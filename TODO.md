# ARESK-OBS TODO

## Arquitectura Limpia CAELION

### Fase 1: Módulo CAELION-RLD
- [x] Crear `server/infra/caelionRLD.ts` con función `updateRLD(currentRLD, events)`
- [x] Definir 3 tipos de eventos normativos (COHERENCE_VIOLATION, STABILITY_VIOLATION, RESOURCE_VIOLATION)
- [x] Implementar función de penalización por eventos
- [x] Implementar función de recuperación condicionada
- [x] RLD como variable persistente en escala [0, 2]

### Fase 2: Flag caelionEnabled
- [x] Agregar campo `caelionEnabled` en tabla `caelionSessions`
- [x] Agregar campo `rld` en tabla `caelionSessions` (campo `currentRLD`)
- [x] Migrar esquema de base de datos
- [x] Actualizar router `caelion.ts` para soportar flag

### Fase 3: Integración de Eventos Normativos
- [x] Detectar eventos normativos desde métricas ARESK-OBS
- [x] Integrar detección en flujo de interacción (LLM → ARESK-OBS → Eventos → CAELION-RLD)
- [x] Guardar RLD en cada interacción si `caelionEnabled = true`

### Fase 4: Dashboard con Dos Paneles
- [ ] Panel 1: ARESK-OBS (siempre visible) - Ω, V, ε, H
- [ ] Panel 2: CAELION-RLD (visible solo si `caelionEnabled = true`) - RLD, eventos, estado
- [ ] Separación visual clara entre capas física y jurisdiccional

### Fase 5: Experimentos Comparativos
- [ ] Ejecutar B-1 con CAELION OFF (solo ARESK-OBS)
- [ ] Ejecutar C-1 con CAELION ON (ARESK-OBS + RLD)
- [ ] Generar tabla comparativa

### Fase 6: Checkpoint Final
- [ ] Crear checkpoint con arquitectura limpia implementada
- [ ] Documentar separación de capas
