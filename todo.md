# ARESK-OBS - Plan de Desarrollo

## Sistema Base - COMPLETADO ✓

- [x] Configurar estructura del proyecto y entorno de desarrollo
- [x] Implementar backend Flask con Sistema de Medición de Estados Semánticos
- [x] Crear endpoints `/reference` y `/interact` con cálculo de métricas
- [x] Desarrollar frontend con visualizaciones en tiempo real
- [x] Integrar sistema de embeddings usando SentenceTransformers
- [x] Implementar simulador de conversación con modo Controlado vs Sin Control
- [x] Crear visualización de Función de Lyapunov V(t)
- [x] Crear gráfico de Coherencia Observable Ω(t)
- [x] Implementar Mapa de Fase (H vs C)
- [x] Crear panel de control interactivo para alternar modos
- [x] Integrar LLM como planta estocástica
- [x] Crear dashboard de auditoría con métricas en tiempo real
- [x] Implementar tests de integración completos
- [x] Validar suite de tests (11/11 pasados)

## Purificación Arquitectónica - COMPLETADO ✓

- [x] Eliminar todas las referencias a "IA", "Humano", "Agente" de la UI
- [x] Implementar Perfiles Dinámicos de Planta en el backend
- [x] Crear Planta Tipo A (Alta Entropía / Bajo Control)
- [x] Crear Planta Tipo B (Ruido Estocástico Moderado / Sin Referencia)
- [x] Crear Planta Acoplada (Régimen CAELION con Licurgo y Bucéfalo)
- [x] Refactorizar UI para mostrar "Parámetros de Planta" en lugar de "Modo Controlado"
- [x] Crear página del Manifiesto del Campo como entrada principal
- [x] Actualizar terminología: "LLM" → "Planta Estocástica"
- [x] Implementar visualización de "Perfiles de Ruido" en graficador
- [x] Actualizar README con la nueva terminología del Campo
- [x] Migrar schema de base de datos de controlMode a plantProfile
- [x] Actualizar todos los tests para usar la nueva terminología
- [x] Validar tests después de purificación (11/11 pasados)

## Estado del Sistema

**Fase actual:** Purificación Arquitectónica Completada

**Funcionalidades operativas:**
- Backend con endpoints de sesión, conversación y métricas
- Frontend con Manifiesto del Campo y visualizaciones científicas
- Sistema de referencia ontológica Bucéfalo (x_ref)
- Tres perfiles dinámicos de planta (Tipo A, Tipo B, Acoplada)
- Medición en tiempo real de V(t), Ω(t), e(t)
- Integración completa con LLM y cálculo de métricas de control
- Suite de tests validada: **11/11 pasados**

**Terminología purificada:**
- ❌ "IA" / "Inteligencia Artificial"
- ❌ "Humano vs Máquina"
- ❌ "Agente" / "Modo Controlado"
- ✅ "Planta Estocástica"
- ✅ "Perfil Dinámico de Planta"
- ✅ "Régimen CAELION"
- ✅ "Campo de Control"
- ✅ "Bucéfalo" (referencia), "Licurgo" (ganancia), "Hécate" (observación)

**Próximas mejoras potenciales:**
- Implementar control adaptativo con K(t) variable
- Agregar comparación lado a lado de perfiles
- Integrar motor Python real con SentenceTransformers completo
- Exportar datos de sesión para análisis externo
