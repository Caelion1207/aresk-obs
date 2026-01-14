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

## Exportación PDF Comparativa de Múltiples Perfiles (Completado)

- [x] Crear endpoint `session.exportComparativeDual` para análisis de 2 sesiones
- [x] Crear endpoint `session.exportComparativeTriple` para análisis de 3 sesiones
- [x] Incluir portada comparativa con información de todas las sesiones
- [x] Crear tabla comparativa de estadísticas descriptivas lado a lado
- [x] Incluir matriz de similitud semántica entre perfiles
- [x] Agregar análisis de divergencias con porcentajes y métricas
- [x] Generar tabla de diferencias por paso temporal
- [x] Incluir sección de conclusiones comparativas (TPR, estabilidad, coherencia)
- [x] Crear generador de PDF comparativo en cliente (pdfComparativeGenerator.ts)
- [x] Agregar botón "Exportar PDF Comparativo" en ComparativeView
- [x] Agregar botón "Exportar PDF Comparativo" en TripleComparative
- [x] Implementar descarga automática con nombre descriptivo

## Integración de Gráficos Chart.js en PDFs (Completado)

- [x] Instalar Chart.js para generación de gráficos en cliente
- [x] Crear módulo chartGenerator.ts para generar gráficos estáticos
- [x] Implementar función generateLyapunovChart para V(t) con líneas superpuestas
- [x] Implementar función generateOmegaChart para Ω(t) con líneas superpuestas
- [x] Implementar función generateCombinedChart para V(t) y Ω(t) en un solo panel
- [x] Integrar gráficos en pdfGenerator.ts (sesión individual)
- [x] Integrar gráficos en pdfComparativeGenerator.ts (dual)
- [x] Integrar gráficos en pdfComparativeGenerator.ts (triple)
- [x] Ajustar layout de PDF para acomodar gráficos de página completa
- [x] Configurar colores distintivos por perfil (rojo, amarillo, verde)
- [x] Agregar leyendas y etiquetas de ejes en los gráficos
- [x] Optimizar resolución de imágenes para calidad de impresión (800x400px)

## Sistema de Marcadores Temporales en SessionReplay (Completado)

- [x] Crear tabla `timeMarkers` en esquema de base de datos
- [x] Implementar endpoint `marker.create` para crear marcadores
- [x] Implementar endpoint `marker.list` para listar marcadores de una sesión
- [x] Implementar endpoint `marker.update` para editar marcadores
- [x] Implementar endpoint `marker.delete` para eliminar marcadores
- [x] Crear componente MarkerDialog para añadir/editar anotaciones
- [x] Agregar botón "Añadir Marcador" en controles de SessionReplay
- [x] Mostrar marcadores visuales en la línea de tiempo de reproducción
- [x] Implementar lista de marcadores con navegación rápida
- [x] Permitir edición y eliminación de marcadores existentes
- [x] Agregar tipos de marcador (colapso semántico, recuperación, transición, observación)
- [x] Incluir sección "Eventos Destacados" en PDF con marcadores
- [x] Sincronizar reproducción al hacer clic en marcador

## Vista de Estadísticas Globales (Completado)

- [x] Crear endpoint `stats.getTprTrends` para tendencias de TPR por perfil
- [x] Crear endpoint `stats.getMarkerDistribution` para distribución de tipos de marcadores
- [x] Crear endpoint `stats.getMetricsEvolution` para evolución temporal de métricas promedio
- [x] Crear página `/estadisticas` con layout y estructura base
- [x] Implementar gráfico de barras de TPR promedio por perfil
- [x] Implementar tabla de estadísticas descriptivas por perfil
- [x] Implementar gráfico circular de distribución de tipos de marcadores
- [x] Agregar gráfico de evolución temporal de V(e), Ω(t) y ||e(t)|| promedio
- [x] Agregar enlace a `/estadisticas` en navegación principal
- [x] Implementar estado de carga y manejo de errores

## Comparación Temporal de Métricas (Completado)

- [x] Crear endpoint `stats.getTemporalComparison` para comparar períodos
- [x] Implementar lógica de cálculo de rangos (última semana, último mes, últimos 3 meses)
- [x] Calcular deltas porcentuales entre período actual y anterior
- [x] Agregar selector de período en página de estadísticas
- [x] Crear tarjetas de comparación para mostrar métricas con deltas
- [x] Implementar indicadores visuales de tendencia (↑ ascendente, ↓ descendente, → estable)
- [x] Agregar tarjetas de comparación para TPR promedio
- [x] Agregar tarjetas de comparación para métricas V(e), Ω(t), ||e(t)||
- [x] Agregar tarjeta de comparación para actividad de marcadores
- [x] Agregar tarjeta de comparación para sesiones realizadas
- [x] Implementar código de colores (verde para mejora, rojo para deterioro)

## Sistema de Alertas de Anomalías (Completado)

- [x] Crear tabla `sessionAlerts` en esquema de base de datos
- [x] Definir criterios de detección (TPR < 30%, V(e) > 0.5, colapsos >= 3, σ(Ω) > 0.3)
- [x] Implementar función `detectAnomalies` en backend para análisis automático
- [x] Crear endpoint `alert.list` para listar alertas activas
- [x] Crear endpoint `alert.dismiss` para descartar alertas
- [x] Crear endpoint `alert.getBySession` para obtener alertas de una sesión específica
- [x] Crear endpoint `alert.detectAnomalies` para ejecutar detección manual
- [x] Ejecutar detección automática al finalizar cada sesión en Simulator
- [x] Crear componente AlertPanel para mostrar alertas activas
- [x] Agregar AlertPanel en página de estadísticas
- [x] Agregar indicadores visuales de severidad (crítico, advertencia, info)
- [x] Implementar botón de descartar alerta y enlace a sesión


## Exportación CSV de Métricas Agregadas (Completado)

- [x] Crear endpoint `stats.exportCSV` para generar CSV de métricas agregadas
- [x] Incluir columnas: ID, fecha, perfil, TPR, duración, avg(V), avg(Ω), avg(||e||), marcadores, alertas
- [x] Formatear fechas en formato ISO 8601
- [x] Calcular promedios de métricas por sesión
- [x] Contar número de marcadores por sesión
- [x] Contar número de alertas por sesión
- [x] Agregar botón "Exportar CSV" en página /estadisticas
- [x] Implementar descarga automática del archivo CSV generado
- [x] Usar nombre descriptivo para archivo (aresk-obs-metricas-YYYY-MM-DD.csv)


## Gráficos Interactivos con Zoom y Panorámica (Completado)

- [x] Agregar componente Brush de Recharts en gráficos de evolución temporal
- [x] Implementar estado para controlar series visibles en gráficos
- [x] Crear leyenda interactiva con toggle de series (clic para ocultar/mostrar) en /estadisticas
- [x] Mejorar tooltips con formato de valores exactos (4 decimales para métricas)
- [x] Agregar labelFormatter en tooltips para mejor contexto
- [x] Aplicar Brush en gráfico de evolución de métricas en /estadisticas
- [x] Aplicar Brush y tooltips mejorados en gráficos de Simulator
- [x] Aplicar Brush y tooltips mejorados en gráficos de SessionReplay
- [x] Aumentar altura de gráficos para acomodar Brush (300-450px)


## Comparación de Sesiones Históricas Específicas (Completado)

- [x] Crear endpoint `session.getMultipleSessions` para obtener datos de varias sesiones
- [x] Crear página `/comparar-sesiones` con selector múltiple de sesiones
- [x] Implementar filtro por perfil de planta en selector de sesiones
- [x] Mostrar lista de sesiones disponibles con metadatos (ID, fecha, perfil, TPR)
- [x] Permitir selección de 2-5 sesiones para comparación con checkboxes
- [x] Generar gráficos superpuestos de V(t) y Ω(t) con colores distintivos
- [x] Crear tabla comparativa de métricas (TPR, promedios, duración, marcadores, alertas)
- [x] Agregar botón "Exportar PDF Comparativo" para 2-3 sesiones seleccionadas
- [x] Implementar estado de carga y manejo de errores
- [x] Agregar enlace a `/comparar-sesiones` en navegación principal
- [x] Agregar Brush para zoom en gráficos comparativos


## Análisis de Correlación de Pearson (Completado)

- [x] Crear función `calculatePearsonCorrelation` para calcular coeficiente de Pearson
- [x] Crear función `calculateCorrelationMatrix` para matrices completas
- [x] Calcular correlaciones entre V(t) de diferentes sesiones
- [x] Calcular correlaciones entre Ω(t) de diferentes sesiones
- [x] Crear matriz de correlación visual con mapa de calor
- [x] Implementar tabla de coeficientes de Pearson con valores numéricos (3 decimales)
- [x] Agregar interpretación estadística (muy fuerte/fuerte/moderada/débil/muy débil)
- [x] Agregar sección de análisis de correlación en `/comparar-sesiones`
- [x] Implementar colores en mapa de calor (rojo negativo, verde positivo, intensidad por magnitud)
- [x] Agregar guía de interpretación de coeficientes


## Sistema de Polaridad Semántica (σ_sem) - En Progreso

- [ ] Actualizar esquema de base de datos para almacenar σ_sem en métricas
- [ ] Implementar función de análisis LLM para calcular σ_sem de cada mensaje
- [ ] Calcular campo efectivo ε_eff = Ω(t) × σ_sem(t)
- [ ] Actualizar función de Lyapunov V(e) para considerar polaridad semántica
- [ ] Crear componente TensionVectors para visualizar vectores de acreción/drenaje
- [ ] Implementar vectores cian/verde para acreción (σ_sem > 0)
- [ ] Implementar vectores naranja/rojo para drenaje (σ_sem < 0)
- [ ] Agregar erosión visual del atractor cuando σ_sem < -0.3
- [ ] Implementar "Polarímetro Semántico" en HUD del Simulator
- [ ] Actualizar control LICURGO para detectar drenaje semántico
- [ ] Implementar inyección de proposiciones afirmativas cuando ε_eff < 0
- [ ] Agregar gráfico de ε_eff(t) en visualizaciones
- [ ] Incluir σ_sem y ε_eff en PDFs exportados
- [ ] Actualizar alertas para detectar "coherencia tóxica" (Ω alto, σ_sem negativo)


## Sistema de Polaridad Semántica (σ_sem) y Control LICURGO v2.0 (Completado)

- [x] Actualizar esquema de base de datos para almacenar σ_sem, ε_eff y V_modificada
- [x] Agregar campo alphaPenalty (α) configurable en tabla de sesiones (default 0.3)
- [x] Crear módulo semanticPolarity.ts para análisis LLM de polaridad
- [x] Implementar función analyzeSemanticPolarity que devuelve σ_sem en [-1, 1]
- [x] Implementar función calculateEffectiveField para ε_eff = Ω(t) × σ_sem(t)
- [x] Crear módulo lyapunovModified.ts para V_modificada
- [x] Implementar calculateModifiedLyapunov: V_modificada = V_base - α × ε_eff
- [x] Implementar normalizeModifiedLyapunov para rango [0,1] con soft clipping
- [x] Implementar detectToxicCoherence para detectar coherencia tóxica
- [x] Implementar calculateErosionIndex para medir erosión estructural
- [x] Integrar cálculo de σ_sem en endpoint sendMessage
- [x] Integrar cálculo de V_modificada en endpoint sendMessage
- [x] Crear módulo licurgoControl.ts para control v2.0
- [x] Implementar requiresControl para decidir tipo de control (posición/estructura)
- [x] Implementar applyLicurgoControl con inyección de estructura anti-drenaje
- [x] Implementar validateMetrics para verificar rangos [0,1] y coherencia
- [x] Integrar control LICURGO en endpoint sendMessage (solo perfil acoplada)
- [x] Crear componente TensionVectors para visualización de vectores de tensión
- [x] Validar que V_base permanece en [0,1]
- [x] Validar que V_modificada normalizada permanece en [0,1]
- [x] Validar que σ_sem detecta semántica negativa correctamente


## Polarímetro Semántico en Tiempo Real (Completado)

- [x] Crear componente SemanticPolarimeter.tsx
- [x] Implementar gauge visual de polaridad σ_sem con rango [-1, 1]
- [x] Agregar gráfico de línea de σ_sem(t) con Recharts y Brush
- [x] Mostrar indicador de campo efectivo ε_eff con código de colores
- [x] Implementar sistema de alertas cuando ε_eff < -0.3 (DrainageAlert)
- [x] Agregar contador de eventos de control LICURGO aplicados
- [x] Mostrar tipo de control aplicado (posición/estructura/combinado)
- [x] Integrar Polarímetro en Simulator junto a métricas existentes
- [x] Actualizar estado de métricas para incluir σ_sem y ε_eff
- [x] Agregar animación de transición en cambios de polaridad (gauge con transition)
- [x] Mostrar solo en perfil "acoplada" (control LICURGO activo)
- [x] Incluir guía de interpretación de valores (acrección/neutro/drenaje)


## Vectores de Tensión Semántica en Mapa de Fase (Completado)

- [x] Modificar PhaseSpaceMap para recibir datos de σ_sem y ε_eff
- [x] Calcular dirección de vectores basada en gradiente hacia/desde atractor Bucéfalo
- [x] Implementar renderizado de flechas SVG superpuestas en mapa de fase
- [x] Aplicar código de colores: cian/verde (acrección σ_sem > 0), naranja/rojo (drenaje σ_sem < 0)
- [x] Escalar magnitud de flechas proporcionalmente a |ε_eff|
- [x] Agregar opacidad variable según intensidad de campo efectivo (0.4 + |ε_eff| * 0.4)
- [x] Integrar vectores en Simulator con datos en tiempo real
- [x] Mostrar solo últimos 5 puntos para claridad visual
- [x] Agregar leyenda explicativa de vectores de tensión con ejemplos visuales
- [x] Implementar toggle showTensionVectors (default true)
- [x] Renderizar solo en perfil "acoplada" donde control LICURGO está activo
- [x] Filtrar vectores con |ε_eff| < 0.1 para evitar ruido visual


## Erosión Dinámica del Atractor Bucéfalo (Completado)

- [x] Calcular índice de erosión acumulado basado en historial de ε_eff
- [x] Implementar función de regeneración cuando ε_eff > 0
- [x] Crear renderizado SVG dinámico del atractor con borde irregular
- [x] Implementar fragmentación progresiva del círculo proporcional a erosión
- [x] Sincronizar opacidad del atractor con V_modificada normalizada
- [x] Agregar efecto de "perforación" cuando erosión > 0.6
- [x] Implementar animación de pulsación cuando ε_eff < -0.5 (crítico)
- [x] Crear gradiente radial que refleje intensidad de drenaje
- [x] Integrar cálculo de erosión en Simulator con estado persistente
- [x] Actualizar PhaseSpaceMap para recibir índice de erosión
- [x] Mantener normalización en [0,1] para todas las métricas
- [x] Priorizar fidelidad dinámica sobre refinamiento estético


## Dashboard de Erosión Estructural (Completado)

### Backend - Endpoints de Datos
- [x] Crear endpoint `erosion.getSessionErosionHistory` para historial de ε_eff por sesión
- [x] Crear endpoint `erosion.getComparativeErosion` para comparar erosión entre sesiones
- [x] Crear endpoint `erosion.getDrainageEvents` para eventos de drenaje (ε_eff < -0.2)
- [x] Crear endpoint `erosion.getLicurgoEffectiveness` para estadísticas de control
- [x] Calcular índice de erosión acumulado por sesión
- [x] Identificar eventos de drenaje con timestamps y severidad

### Frontend - Página /erosion
- [x] Crear página ErosionDashboard.tsx con layout de dashboard
- [x] Implementar selector de sesión con filtros por perfil y fecha
- [x] Crear gráfico de historial temporal de ε_eff(t) con línea de umbral -0.2
- [x] Crear gráfico de historial temporal de σ_sem(t) con zona de polaridad
- [x] Crear gráfico de V_modificada(t) vs V_base(t) comparativo
- [x] Implementar timeline de eventos de drenaje con marcadores visuales
- [x] Crear panel de estadísticas de erosión acumulada por sesión
- [x] Implementar tabla de intervenciones LICURGO con timestamps
- [x] Crear gráfico de efectividad del control (reducción de ε_eff post-intervención)
- [x] Agregar panel de comparación multi-sesión con overlay de métricas
- [x] Implementar indicadores de severidad de erosión (leve/moderada/crítica)
- [x] Mantener normalización [0,1] para todas las métricas

### Navegación
- [x] Agregar ruta `/erosion` en App.tsx
- [x] Agregar enlace en header de Home.tsx
- [x] Agregar acceso rápido desde Simulator y SessionReplay


## Análisis de Tendencias Temporales de Erosión (Completado)

### Backend
- [x] Crear endpoint `erosion.getTemporalTrends` para evolución temporal de erosión
- [x] Agrupar sesiones por semana (últimas 12 semanas)
- [x] Agrupar sesiones por mes (últimos 6 meses)
- [x] Calcular erosión promedio por período
- [x] Detectar períodos de alta erosión (clustering temporal)
- [x] Calcular tendencia (ascendente/descendente/estable)
- [x] Comparar período actual vs período anterior

### Frontend
- [x] Crear sección "Tendencias Temporales" en ErosionDashboard
- [x] Implementar selector de granularidad (semana/mes)
- [x] Crear gráfico de barras de erosión promedio por período
- [x] Agregar línea de tendencia en gráfico
- [x] Implementar indicadores de dirección de tendencia (↑↓→)
- [x] Crear tarjetas de comparación período actual vs anterior
- [x] Agregar alertas visuales cuando tendencia supera umbral crítico
- [x] Mostrar períodos de alta erosión con badges destacados
- [x] Implementar tooltip con detalles por período (sesiones, eventos de drenaje)


## Sistema de Alertas Automáticas de Tendencia Crítica (Completado)

### Base de Datos
- [x] Crear tabla `erosion_alerts` con campos (id, userId, alertType, severity, trendChange, detectedAt, notified, message)
- [x] Agregar índices para consultas eficientes por userId y detectedAt
- [x] Ejecutar migración con `pnpm db:push`

### Backend
- [x] Crear endpoint `erosion.getActiveAlerts` para consultar alertas activas
- [x] Crear endpoint `erosion.dismissAlert` para marcar alerta como leída
- [x] Implementar función `detectCriticalTrend` que analice cambio de tendencia
- [x] Integrar detección en endpoint `getTemporalTrends` (ejecutar después de calcular tendencia)
- [x] Registrar alerta en BD cuando cambio >10% ascendente
- [x] Enviar notificación al propietario vía `notifyOwner` cuando se detecte alerta
- [x] Evitar alertas duplicadas (verificar última alerta en últimas 24h)

### Frontend
- [x] Agregar badge "Alerta de Tendencia" en header de `/erosion` cuando hay alertas activas
- [x] Crear panel "Alertas Activas" en ErosionDashboard
- [x] Mostrar lista de alertas con timestamp, severidad, y cambio porcentual
- [x] Implementar botón "Marcar como leída" por alerta
- [x] Agregar indicador visual (ícono de campana con contador) en header
- [x] Mostrar toast notification cuando se detecta nueva alerta


## Consolidación y Endurecimiento de Vistas Existentes (Completado)

### Backend - Validaciones y Robustez
- [x] Agregar validación de sessionIds en endpoints de erosión (verificar que pertenecen al usuario)
- [x] Validar rangos de granularidad en getTemporalTrends (solo 'week' o 'month')
- [x] Agregar manejo de errores en cálculos de correlación (divisiones por cero, arrays vacíos)
- [x] Validar que sessionIds en comparación sean de sesiones acopladas
- [x] Agregar límite máximo de sesiones en comparación (máx 5)
- [x] Mejorar mensajes de error con contexto específico

### Frontend - Estados de Carga y Error
- [x] Agregar estados de loading en todos los gráficos de ErosionDashboard
- [x] Implementar mensajes de error específicos cuando queries fallan
- [x] Agregar estados vacíos cuando no hay datos (sin sesiones, sin métricas)
- [x] Mejorar feedback visual durante mutations (dismissAlert, etc)
- [x] Agregar skeleton loaders en lugar de spinners genéricos
- [x] Validar selección de sesiones antes de queries (evitar queries con arrays vacíos)

### Optimización y UX
- [x] Deshabilitar botones de comparación cuando no hay suficientes sesiones
- [x] Agregar tooltips explicativos en métricas complejas (correlación, tendencia)
- [x] Mejorar responsive design en tablas y gráficos
- [x] Agregar confirmación antes de descartar alertas críticas
- [ ] Optimizar re-renders innecesarios con useMemo en cálculos pesados


## Panel de Comparación Multi-Sesión en Dashboard (Completado)

- [x] Agregar selector múltiple de sesiones con checkboxes
- [x] Implementar validación de 2-5 sesiones seleccionadas
- [x] Agregar botón "Comparar" con estado disabled condicional (implícito: carga automática)
- [x] Mostrar tooltip explicativo cuando botón está deshabilitado (mensaje de validación)
- [x] Crear gráfico overlay de curvas ε_eff(t) con colores diferenciados
- [x] Implementar matriz de correlación visual con mapa de calor
- [x] Agregar tabla comparativa con ranking de erosión
- [x] Mostrar estadísticas agregadas (promedio, máxima, mínima)
- [x] Agregar leyenda dinámica con identificación de sesiones
- [x] Implementar mensaje de ayuda "(Selecciona 2-5 sesiones)"


## Exportación PDF del Dashboard de Erosión (Completado)

### Backend
- [x] Crear endpoint `erosion.exportDashboardPDF` con input sessionId
- [x] Generar PDF con PDFKit incluyendo metadata (título, fecha, sesión)
- [x] Incluir sección de estadísticas clave (eventos drenaje, intervenciones, mejora promedio)
- [x] Agregar tabla de eventos de drenaje con timestamps y severidad
- [x] Agregar tabla de intervenciones LICURGO con mejora pre/post
- [x] Incluir análisis de tendencias temporales (si disponible)
- [x] Agregar matriz de correlación (si hay comparación activa)
- [x] Generar gráficos como texto descriptivo o usar biblioteca de charts

### Frontend
- [x] Agregar botón "Exportar PDF" en header de ErosionDashboard
- [x] Implementar mutation para llamar endpoint de exportación
- [x] Descargar PDF generado automáticamente
- [x] Mostrar estado de loading durante generación
- [x] Manejar errores de exportación con toast


## Mejora de PDF con Gráficos Visuales (Completado)

### Backend
- [x] Instalar chart.js, chartjs-node-canvas para generación de gráficos
- [x] Crear función helper generateChartImage para convertir datos a PNG base64
- [x] Generar gráfico de ε_eff(t) con línea de umbral -0.2
- [x] Generar gráfico de σ_sem(t) con zonas de polaridad
- [x] Generar gráfico de V_modificada(t) vs V_base(t)
- [x] Embeder imágenes PNG en PDF usando doc.image()
- [ ] Agregar logo del proyecto en header del PDF
- [ ] Mejorar tipografía con fuentes más legibles
- [x] Mantener tablas de eventos con mejor formato visual
- [x] Ajustar layout para que gráficos y tablas no se superpongan


## Reestructuración de Header del Dashboard de Erosión (Completado)

### Problema Detectado
- Header sin grid/flex disciplinado: elementos se pisan cuando contenido crece
- Altura fija causa clipping visual
- Acciones primarias mezcladas con estado (semánticamente incorrecto)
- Selector de perfil compite visualmente con botones de acción

### Solución: Grid Tripartito
- [x] Dividir header en 3 zonas explícitas con grid-template-columns: auto 1fr auto
- [x] Zona izquierda: navegación/contexto (botón "Inicio")
- [x] Zona centro: estado del sistema (perfil, régimen, índice de erosión)
- [x] Zona derecha: acciones (Exportar PDF)
- [x] Implementar altura automática con min-height: 56px
- [x] Agregar gap: 12px y padding: 8px 16px (gap: 3, py: 3)
- [x] Convertir estado a badges informativos (no interactivos)
- [x] Implementar wrap controlado con overflow: hidden, text-overflow: ellipsis (truncate)
- [x] Alinear items con align-items: center
- [x] Separar visualmente estado de acciones (estado pasivo, acciones activas)


## Mejoras de Visualización y Documentación (Completado)

- [x] Arreglar visualización de trayectorias en PhaseSpaceMap (líneas conectadas con gradiente de opacidad)
- [x] Crear README.md como contrato semántico con prerrequisitos explícitos y criterios de rechazo


## Control de Rango Temporal en Visualizaciones (Completado)

- [x] Implementar slider de rango temporal en PhaseSpaceMap para filtrar trayectoria por segmento de pasos


## Marcadores de Eventos Críticos en Timeline (Completado)

- [x] Agregar marcadores visuales de eventos de drenaje (ε_eff < -0.2) en slider de rango temporal


## Interacción con Marcadores de Eventos (Completado)

- [x] Implementar click en marcadores de drenaje para centrar automáticamente el rango del slider en el evento seleccionado


## Personalización de Ventana de Contexto (Completado)

- [x] Agregar selector de tamaño de ventana de contexto ajustable (±N pasos) para eventos de drenaje


## Exportación de Datos de Segmentos (Completado)

- [x] Implementar función de exportación de datos del segmento visible (CSV/JSON) con todas las métricas


## Comparación de Segmentos Múltiples (Completado)

- [x] Implementar selección de múltiples segmentos de trayectoria
- [x] Calcular estadísticas agregadas (media, desviación, min/max) por segmento
- [x] Exportar comparativa de segmentos con métricas agregadas
