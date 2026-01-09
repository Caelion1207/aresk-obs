# ARESK-OBS - Plan de Desarrollo

## Backend - Sistema de Medición de Estados Semánticos

- [x] Endpoint POST /reference para definir x_ref (Propósito, Límites, Ética)
- [x] Endpoint POST /measure para calcular x(t), e(t), V(e) y Ω(t)
- [x] Endpoint POST /interact para simulación de conversación
- [x] Sistema de embeddings con SentenceTransformers
- [x] Cálculo de similitud del coseno para coherencia observable
- [x] Implementación de la Función de Lyapunov V(e)
- [x] Implementación del control LQR u(t) = -K * e(t)
- [x] Integración con LLM (invokeLLM) como planta estocástica
- [x] Modo Controlado vs Sin Control en simulador
- [x] Almacenamiento de historial de conversación y métricas

## Frontend - Visualización y Panel de Control

- [x] Diseño de layout principal con tema científico/técnico
- [x] Panel de definición de referencia ontológica (x_ref)
- [x] Panel de control para alternar modo Controlado/Sin Control
- [x] Visualización en tiempo real de Función de Lyapunov V(t)
- [x] Gráfico de Coherencia Observable Ω(t) vs tiempo
- [x] Mapa de Fase (H vs C) con trayectoria de estado
- [x] Área de conversación interactiva con el LLM
- [x] Dashboard de métricas en tiempo real
- [x] Indicadores visuales de estado del sistema
- [x] Historial de mensajes y estados semánticos

## Integración y Testing

- [x] Pruebas de endpoints del backend
- [x] Validación de cálculos matemáticos (embeddings, similitud)
- [x] Pruebas de integración LLM
- [x] Validación de visualizaciones en tiempo real
- [x] Pruebas de alternancia entre modos de control
- [x] Verificación de decaimiento monótono de V(t) en modo controlado

## Despliegue y Documentación

- [x] Configuración de dependencias Python (sentence-transformers)
- [x] Optimización de rendimiento para cálculos en tiempo real
- [x] Documentación de API endpoints
- [x] Guía de uso del sistema
- [x] Checkpoint final del proyecto
