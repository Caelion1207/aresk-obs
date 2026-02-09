# Verificación Visual: Vista Split-Screen v1.1

## Fecha
2026-02-09 00:19 UTC

## Funcionalidad Implementada

### Toggle Split-Screen
✅ Botón "Vista Split-Screen" / "Vista Simple" funcional
✅ Cambio de color del botón según estado (amber cuando activo, slate cuando inactivo)
✅ Selector de régimen oculto en modo split-screen

### Layout de Dos Columnas
✅ Columna izquierda: Régimen B-1 (sin CAELION) - Borde rojo
✅ Columna derecha: Régimen C-1 (con CAELION) - Borde verde
✅ Títulos diferenciados por color

### Charts Sincronizados

#### Phase Portrait (H vs Ω)
✅ B-1: Puntos rojos, núcleo de viabilidad K visible
✅ C-1: Puntos verdes, núcleo de viabilidad K visible, triángulos amarillos para intervenciones CAELION
✅ Escalas sincronizadas (mismo rango de Ω y H en ambos gráficos)

#### Lyapunov V(t)
✅ B-1: Línea roja, evolución temporal
✅ C-1: Línea verde, evolución temporal
✅ Escalas sincronizadas (mismo rango de V en ambos gráficos)
✅ Eje temporal (t) sincronizado (1-50 interacciones)

#### RLD(t) - Reserva de Legitimidad Dinámica
✅ B-1: Línea roja con área rellena, umbrales viable (0.5) y crítico (0.3) visibles
✅ C-1: Línea verde con área rellena, umbrales viable (0.5) y crítico (0.3) visibles
✅ Escalas sincronizadas (RLD 0-1 en ambos gráficos)
✅ Eje temporal (t) sincronizado

#### Fase Error-Control (RLD vs V)
✅ B-1: Puntos rojos dispersos
✅ C-1: Puntos verdes con triángulos amarillos para intervenciones CAELION
✅ Escalas sincronizadas (mismo rango de V y RLD en ambos gráficos)

### Sincronización de Escalas
✅ Función `getGlobalScales()` calcula min/max globales para Ω, H, V, RLD
✅ Todos los charts usan las mismas escalas para comparación directa
✅ Márgenes de padding consistentes (+/-0.05 para Ω, +/-0.01 para H y V)

### Observaciones Visuales

**Diferencias Claras entre B-1 y C-1:**
- B-1 muestra mayor dispersión en phase portrait (puntos más alejados del núcleo K)
- C-1 muestra trayectoria más concentrada cerca del núcleo de viabilidad
- RLD(t) de C-1 es notablemente más alto y estable que B-1
- Lyapunov V(t) de C-1 muestra menor energía de error que B-1
- Intervenciones CAELION (triángulos amarillos) visibles en C-1

**Coherencia Visual:**
- Colores consistentes: rojo para B-1, verde para C-1, amarillo para CAELION
- Bordes de cards diferenciados por régimen
- Tipografía reducida (font-size: 9-10px) para optimizar espacio en split-screen

## Estado Final
✅ Vista split-screen completamente funcional
✅ Comparación B-1 vs C-1 lado a lado operativa
✅ Escalas sincronizadas verificadas visualmente
✅ Todos los charts renderizando correctamente

## Próximo Paso
Congelar UI base como v1.1 y crear checkpoint final.
