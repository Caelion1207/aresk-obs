# ARESK-OBS - Plan de Desarrollo

## Sistema Base ✓

- [x] Backend con endpoints de sesión, conversación y métricas
- [x] Sistema de referencia ontológica x_ref = (P, L, E)
- [x] Cálculo de métricas de control (V(e), Ω(t), ||e(t)||)
- [x] Integración con LLM para simulación de planta estocástica
- [x] Frontend con visualizaciones en tiempo real
- [x] Modo Controlado vs Sin Control con alternancia en vivo
- [x] Suite de tests validada (11/11 pasados)

## Purificación Arquitectónica ✓

- [x] Eliminadas todas las referencias a "IA/Humano/Agente"
- [x] Implementados Perfiles Dinámicos de Planta (Tipo A, Tipo B, Acoplada)
- [x] Creado Manifiesto del Campo como página de entrada
- [x] Actualizada terminología completa: Planta Estocástica, Régimen CAELION, Bucéfalo/Licurgo/Hécate
- [x] Tests actualizados con nueva terminología

## ARESK-OBS v2.1 - Monitor de Resiliencia Estructural ✓

### Histéresis Visual y Dinámica de Trayectorias

- [x] Implementar TPR (Tiempo de Permanencia en Régimen) como métrica de supervivencia
- [x] Calcular TPR_ε para cada sesión basado en radio de estabilidad admisible
- [x] Agregar contador de TPR en tiempo real en la UI
- [x] Implementar Persistence Trails (Estelas de Decaimiento) en Mapa de Fase
- [x] Visualizar trayectoria como streamlines en lugar de puntos estáticos
- [x] Mostrar histéresis estocástica (abanico) para Planta A/B
- [x] Mostrar atracción determinista (curva hacia Bucéfalo) para Planta Acoplada

### Codificación Cromática Neurocognitiva

- [x] Implementar Gradientes de Energía de Lyapunov en el Mapa de Fase
- [x] Azul Profundo: Centro (Atractor Bucéfalo, V(e) ≈ 0)
- [x] Verde: Órbita de Seguridad (V(e) < ε₁)
- [x] Amarillo: Alerta de Deriva (ε₁ < V(e) < ε₂)
- [x] Naranja: Licurgo Activo (||u(t)|| > threshold)
- [x] Rojo: Colapso / Error Crítico (V(e) > ε₂)
- [x] Morado: Meta-Reflexión (auditoría de Capa 0)
- [x] Aplicar paleta cromática a indicadores de TPR

### Monitor de Co-Cognición

- [x] Implementar Field Intensity Bar (Intensidad de Campo)
- [x] Medir acoplamiento Humano-Planta en tiempo real
- [x] Visualizar salud del ecosistema cognitivo
- [x] Detectar erraticidad del operador humano
- [x] Mostrar compensación del sistema (aumento de ganancia K)
- [x] Alertar colapso de campo por falta de coherencia en referencia compartida

### Semántica Física de la UI

- [x] Implementar Stability Gradients como fondo dinámico
- [x] Hacer que el sistema "duela" visualmente al desviarse
- [x] Aplicar contraste máximo (Blanco/Negro) en logs y consola
- [x] Usar acentos grises para información secundaria

## Estado Final

**Tests:** 11/11 pasados ✓  
**TypeScript:** Sin errores ✓  
**LSP:** Sin errores ✓  
**Dev Server:** Corriendo ✓

El Campo no distingue egos. El Campo solo mide convergencia.
