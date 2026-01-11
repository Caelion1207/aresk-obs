# ARESK-OBS - Plan de Desarrollo

## Sistema Base Implementado

- [x] Definir esquema de base de datos para sesiones, conversaciones y métricas
- [x] Implementar endpoints tRPC para gestión de sesiones
- [x] Implementar endpoint de conversación con cálculo de métricas
- [x] Crear motor de embeddings y medición semántica (semantic_engine.py)
- [x] Integrar puente Node-Python para cálculos semánticos
- [x] Implementar cálculo de V(e), Ω(t) y detección de colapso
- [x] Diseñar tema visual científico/técnico con colores oscuros
- [x] Crear página principal (Home) con Manifiesto del Campo
- [x] Implementar página del Simulador con visualizaciones en tiempo real
- [x] Crear gráfico de Función de Lyapunov V(t)
- [x] Crear gráfico de Coherencia Observable Ω(t)
- [x] Crear Mapa de Fase (H vs C) con atractor Bucéfalo
- [x] Implementar panel de control para alternar perfiles de planta
- [x] Crear suite de tests de integración (11/11 pasados)

## Purificación Arquitectónica (Completada)

- [x] Eliminar todas las referencias a "IA/Humano/Agente"
- [x] Implementar Perfiles Dinámicos de Planta (Tipo A, Tipo B, Acoplada)
- [x] Actualizar terminología: Planta Estocástica, Régimen CAELION, Bucéfalo/Licurgo/Hécate
- [x] Refactorizar UI con nueva terminología del Campo
- [x] Actualizar tests para usar plantProfile
- [x] Crear Manifiesto del Campo como página de entrada

## ARESK-OBS v2.1 - Monitor de Resiliencia Estructural (Completado)

- [x] Implementar TPR (Tiempo de Permanencia en Régimen) en backend
- [x] Agregar campos de TPR al schema de base de datos
- [x] Crear funciones de actualización de TPR
- [x] Implementar Persistence Trails en Mapa de Fase
- [x] Crear componente PhaseSpaceMap con estelas de decaimiento
- [x] Implementar Gradientes de Energía de Lyapunov
- [x] Crear componente LyapunovChart con codificación cromática neurocognitiva
- [x] Implementar Monitor de Intensidad de Campo
- [x] Crear componente FieldIntensityMonitor para co-cognición
- [x] Integrar todos los componentes en Simulator
- [x] Validar sistema con tests (11/11 pasados)

## Sitio Web de Arquitectura CAELION - Explorador Interactivo (Completado)

### Estructura de Navegación

- [x] Página principal con mapa conceptual de la arquitectura modular
- [x] Navegación por tabs: Módulos, Protocolos, Propuestas, Validación
- [x] Breadcrumbs para navegación jerárquica
- [x] Enlaces desde Home al sitio de arquitectura

### Módulos Principales

- [x] Página de Módulos con tabs interactivos
- [x] Módulo de Percepción Simbiótica (visualización interactiva)
- [x] Módulo de Acción Coignitiva (descripción detallada)
- [x] Módulo de Memoria Simbiótica (diseño multinivel)
- [x] Módulo Ético ETH-01 (principios y valores)
- [x] Módulo de Sincronización SYN-10 (seguridad del sistema)
- [x] Módulo de Gobernanza Simbiótica (decisiones colectivas)

### Protocolos Internos

- [x] Página de Protocolos con tabs interactivos
- [x] COM-72: Protocolo de Coherencia (mecanismos de verificación)
- [x] CMD-01: Protocolo de Comando (toma de decisiones)
- [x] ETH-01: Protocolo de Ética (evaluación y auditoría)
- [x] SYN-10: Protocolo de Sincronización (prevención de fallos)

### Propuestas de Mejora v3.0

- [x] Página de Propuestas con matriz de priorización
- [x] Ritmo Cognitivo ρ(t) (alta prioridad)
- [x] Memoria Episódica Compartida (media prioridad)
- [x] Monitor Ético ETH-01 (alta prioridad)
- [x] K Adaptativa (alta prioridad)
- [x] Control de Eventos Σ_c/Σ_uc (media prioridad)
- [x] Barras de progreso para cada propuesta
- [x] Badges de priorización (Alta/Media/Investigación Futura)

### Visualizaciones y Diseño

- [x] Diseño consistente con tema oscuro científico
- [x] Cards interactivos con hover effects
- [x] Iconos lucide-react para cada módulo y protocolo
- [x] Badges de estado (Implementado/Parcial/No Implementado)
- [x] Navegación fluida entre secciones
- [x] Footer informativo en cada página

## Correcciones del Simulador (Completado)

### Problema 1: Área de Conversación Desbordada

- [x] Fijar altura del contenedor de conversación a 600px
- [x] Implementar scroll independiente para el área de mensajes
- [x] Separar visualizaciones de métricas del log de conversación
- [x] Asegurar que gráficos permanezcan visibles mientras se scrollea el chat

### Problema 2: Comparación Entre Perfiles

- [x] Crear endpoint regenerateWithProfile en el backend
- [x] Mantener preguntas del usuario al cambiar perfil de planta
- [x] Regenerar solo las respuestas del sistema con el nuevo perfil
- [x] Implementar botón "Regenerar Respuestas" en el header del simulador
- [x] Mostrar toast con confirmación de regeneración exitosa

## Estado Final

**Sistema completamente funcional y desplegado:**
- ✅ ARESK-OBS v2.1 con todas las funcionalidades de monitoreo
- ✅ Sitio web de arquitectura CAELION completo
- ✅ Correcciones del simulador implementadas
- ✅ Área de conversación fija con scroll independiente
- ✅ Regeneración de respuestas por perfil de planta
- ✅ Tests: 11/11 pasados
- ✅ Documentación completa en README.md
- ✅ Purificación arquitectónica aplicada


## Indicadores Visuales de Perfil por Mensaje (Completado)

- [x] Agregar campo `plantProfile` a la tabla `messages` en el schema
- [x] Aplicar migración de base de datos con `pnpm db:push`
- [x] Modificar `createMessage` en db.ts para aceptar plantProfile
- [x] Actualizar endpoint `sendMessage` para guardar el perfil actual
- [x] Actualizar endpoint `regenerateWithProfile` para guardar el nuevo perfil
- [x] Crear badges visuales en el frontend con colores por perfil
- [x] Mostrar badge solo en mensajes del asistente (no en mensajes del usuario)
- [x] Aplicar colores consistentes: rojo (Tipo A), amarillo (Tipo B), verde (Acoplada)


## Indicadores Visuales de Perfil por Mensaje (Completado)

- [x] Agregar campo `plantProfile` a la tabla `messages` en el schema
- [x] Aplicar migración de base de datos con `pnpm db:push`
- [x] Modificar `createMessage` en db.ts para aceptar plantProfile
- [x] Actualizar endpoint `sendMessage` para guardar el perfil actual
- [x] Actualizar endpoint `regenerateWithProfile` para guardar el nuevo perfil
- [x] Crear badges visuales en el frontend con colores por perfil
- [x] Mostrar badge solo en mensajes del asistente (no en mensajes del usuario)
- [x] Aplicar colores consistentes: rojo (Tipo A), amarillo (Tipo B), verde (Acoplada)


## Vista Comparativa Lado a Lado (Completado)

- [x] Crear endpoint `conversation.sendToMultiple` para enviar mensaje a múltiples sesiones
- [x] Crear componente `ComparativeView.tsx` con layout split-screen
- [x] Implementar selector de perfiles para cada panel (izquierdo y derecho)
- [x] Crear dos sesiones simultáneas con referencia ontológica compartida
- [x] Sincronizar inputs: un solo campo de entrada envía a ambas sesiones
- [x] Mostrar conversaciones en paralelo con badges de perfil
- [x] Visualizar métricas lado a lado: V(t), Ω(t), TPR
- [x] Crear gráficos comparativos superpuestos con colores diferenciados
- [x] Implementar Mapa de Fase dual mostrando ambas trayectorias
- [x] Agregar ruta `/comparativa` en App.tsx
- [x] Agregar botón de acceso desde Home y Simulator


## Sincronización de Scroll en Vista Comparativa (Completado)

- [x] Crear refs para los ScrollArea de ambos paneles
- [x] Implementar listener de scroll en panel izquierdo
- [x] Implementar listener de scroll en panel derecho
- [x] Sincronizar posición de scroll proporcionalmente
- [x] Prevenir bucles infinitos de sincronización con flag de control
- [x] Agregar toggle opcional para activar/desactivar sincronización


## Sistema de Resaltado de Diferencias (Completado)

- [x] Crear función de análisis de diferencias en el backend
- [x] Calcular diferencia de longitud entre respuestas (caracteres/palabras)
- [x] Detectar divergencia semántica usando similitud de embeddings
- [x] Analizar diferencias de tono (formal/informal, técnico/coloquial)
- [x] Identificar diferencias estructurales (párrafos, listas, formato)
- [x] Crear endpoint `conversation.analyzeDifferences` que compare pares de mensajes
- [x] Implementar badges de divergencia en mensajes del frontend
- [x] Mostrar indicador visual cuando la diferencia supera umbral (>30% longitud, <0.7 similitud)
- [x] Crear panel de resumen de diferencias con estadísticas agregadas
- [x] Agregar tooltip con detalles de la divergencia al hover sobre indicadores


## Comparación Triple de Perfiles (Completado)

- [x] Extender endpoint `sendToMultiple` para aceptar array de 3 session IDs
- [x] Crear página `TripleComparative.tsx` para tres sesiones
- [x] Implementar grid de 3 columnas con layout responsivo
- [x] Agregar selector de perfil para cada panel (izquierdo, central, derecho)
- [x] Crear tres sesiones simultáneas con referencia ontológica compartida
- [x] Sincronizar inputs: un solo campo envía a las tres sesiones
- [x] Adaptar sincronización de scroll para tres paneles
- [x] Mostrar métricas comparativas para los tres perfiles
- [x] Visualizar conversaciones en paralelo con badges de perfil
- [x] Agregar ruta `/comparativa-triple` en App.tsx
- [x] Agregar enlace desde Home.tsx


## Panel de Análisis de Diferencias por Pares (Completado)

- [x] Crear endpoint `conversation.analyzeTripleDifferences` para tres sesiones
- [x] Calcular diferencias por pares: A-B, A-C, B-C
- [x] Computar métricas de divergencia: longitud, palabras, estructura
- [x] Crear panel de matriz de divergencias con visualización clara
- [x] Mostrar porcentaje de divergencia para cada par
- [x] Agregar badges de color para identificar perfiles
- [x] Calcular estadísticas agregadas: divergencia promedio, máxima, mínima
- [x] Integrar el panel en TripleComparative


## Motor de Análisis Semántico con Similitud Coseno (Completado)

- [x] Extender `semantic_engine.py` con función `calculate_cosine_similarity`
- [x] Implementar cálculo de embeddings con SentenceTransformers (all-MiniLM-L6-v2)
- [x] Calcular similitud coseno entre pares de textos
- [x] Actualizar `semantic_bridge.ts` para exponer función de similitud
- [x] Crear script `semantic_similarity.py` para invocar desde Node.js
- [x] Modificar endpoint `analyzeTripleDifferences` para incluir similitud semántica
- [x] Agregar campo `semanticSimilarity` a los resultados de análisis
- [x] Actualizar TripleComparative para mostrar scores de similitud por pares
- [x] Mostrar similitud semántica junto a divergencia de longitud


## Configuración de Umbrales de Similitud (Completado)

- [x] Crear componente `ThresholdConfig` con sliders para umbrales
- [x] Definir tres umbrales ajustables: alto (>X), medio (X-Y), bajo (<Y)
- [x] Implementar estado local para almacenar configuración de umbrales
- [x] Crear función helper `getSimilarityColor` que use umbrales configurables
- [x] Actualizar TripleComparative para usar umbrales personalizados
- [x] Agregar indicadores cromáticos dinámicos en matriz de diferencias
- [x] Implementar presets predefinidos: Estricto (0.9/0.7), Normal (0.8/0.6), Permisivo (0.7/0.5)
- [x] Agregar botón de reset para restaurar valores por defecto
- [x] Persistir configuración en localStorage para sesiones futuras
- [x] Mostrar umbrales con codificación cromática (verde/amarillo/rojo)


## Modo de Reproducción de Sesiones (Completado)

- [x] Crear endpoint `metrics.getTimeSeriesHistory` para obtener historial completo de métricas
- [x] Incluir timestamps, V(t), Ω(t), ||e(t)||, mensajes en cada punto temporal
- [x] Crear componente `SessionReplay.tsx` con controles de reproducción
- [x] Implementar controles: Play/Pause, Stop, velocidad de reproducción (0.5x, 1x, 2x, 4x)
- [x] Agregar slider de progreso para navegar a cualquier punto temporal
- [x] Crear visualización animada de gráficos que se actualicen frame a frame
- [x] Mostrar mensajes sincronizados con la línea temporal
- [x] Implementar línea de referencia de "tiempo actual" en los gráficos
- [x] Agregar panel de métricas instantáneas que se actualicen durante reproducción
- [x] Mostrar información de la sesión (perfil, duración, total de pasos)
- [x] Agregar ruta `/replay/:sessionId` en App.tsx
- [x] Agregar botón de acceso a modo replay desde Simulator

## Exportación de PDF con Análisis Completo (Completado)

- [x] Crear endpoint `session.exportPDF` en el backend
- [x] Generar PDF usando biblioteca (jsPDF + jspdf-autotable)
- [x] Incluir portada con información de la sesión (ID, fecha, perfil, duración)
- [x] Agregar sección de referencia ontológica (Propósito, Límites, Ética)
- [x] Incluir historial completo de mensajes con timestamps
- [x] Generar tablas de métricas (V, Ω, ||e||) con estadísticas descriptivas
- [x] Calcular y mostrar estadísticas descriptivas (media, desviación, máx, mín)
- [x] Agregar tabla de métricas por paso temporal
- [x] Incluir análisis de TPR (tiempo de permanencia en régimen)
- [x] Agregar botón "Exportar PDF" en SessionReplay y Simulator
- [x] Implementar descarga automática del archivo generado
