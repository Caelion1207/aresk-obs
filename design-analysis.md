# Análisis de Diseño Visual - ARESK-OBS

## Fuente: ARESK-OBSInstrumentodeMedicióndeEstabilidadSemántica.pdf

### Esquema de Colores Principal

**Fondos:**
- Azul oscuro profundo: `#0a1628` a `#1a2744` (base)
- Gradiente azul-púrpura: de azul oscuro (#0f1b2d) a púrpura oscuro (#2d1b4e)
- Efecto de profundidad con gradientes sutiles

**Colores de Acento:**
- Cyan brillante: `#00d9ff` / `#00e5ff` (principal, para elementos interactivos y glow)
- Púrpura/Magenta: `#a855f7` / `#c084fc` (secundario, para títulos y acentos)
- Rojo/Coral: `#ff6b6b` / `#ff4444` (para alertas, crisis, deriva semántica)
- Amarillo/Amber: `#fbbf24` / `#f59e0b` (para warnings y umbrales)
- Verde esmeralda: `#10b981` / `#34d399` (para estabilidad y éxito)

**Texto:**
- Títulos principales: Blanco puro `#ffffff` con text-shadow cyan
- Subtítulos: Cyan claro `#67e8f9` / `#a5f3fc`
- Texto descriptivo: Gris claro `#cbd5e1` / `#e2e8f0`
- Labels técnicos: Cyan `#22d3ee`

### Tipografía

**Fuentes:**
- Títulos: Sans-serif bold, grande (48-72px), con espaciado amplio
- Subtítulos: Sans-serif medium (24-32px)
- Cuerpo: Sans-serif regular (16-18px)
- Código/técnico: Monospace para fórmulas matemáticas

**Estilo:**
- Títulos con mayúsculas y efectos de glow
- Uso de negritas para conceptos clave
- Espaciado generoso entre líneas

### Elementos Visuales Característicos

1. **Efectos de Glow/Resplandor:**
   - Cyan glow en elementos interactivos y líneas
   - Box-shadow con blur extenso: `0 0 20px rgba(0, 217, 255, 0.6)`
   - Text-shadow para títulos: `0 0 10px rgba(0, 217, 255, 0.8)`

2. **Partículas y Puntos:**
   - Pequeños puntos brillantes dispersos (estrellas/partículas)
   - Efecto de profundidad espacial

3. **Líneas y Conexiones:**
   - Líneas delgadas cyan conectando elementos
   - Flechas con glow
   - Trayectorias curvas suaves

4. **Visualizaciones 3D:**
   - Redes neuronales con nodos brillantes
   - Espacios vectoriales con mesh/grid
   - Esferas y formas geométricas con iluminación

5. **Bordes y Marcos:**
   - Bordes redondeados sutiles (border-radius: 8-16px)
   - Bordes con glow cyan: `border: 1px solid rgba(0, 217, 255, 0.5)`
   - Marcos tipo HUD con esquinas cortadas

6. **Gráficos Técnicos:**
   - Curvas de Lyapunov con glow cyan
   - Grid de fondo sutil (líneas muy tenues)
   - Zonas de color para estados (verde=estable, amarillo=drift, rojo=crisis)

### Layout y Composición

**Estructura:**
- Fondos full-screen con gradientes
- Contenido centrado o en grid de 3 columnas
- Espaciado amplio entre secciones
- Cards con fondo semi-transparente oscuro

**Cards/Contenedores:**
- Fondo: `rgba(15, 27, 45, 0.7)` con backdrop-blur
- Borde: `1px solid rgba(0, 217, 255, 0.3)`
- Padding generoso: 32-48px
- Border-radius: 12-16px

**Jerarquía Visual:**
- Título principal: Grande, blanco, centrado, con glow
- Subtítulo: Cyan, más pequeño, debajo del título
- Contenido: Organizado en cards o columnas
- Elementos interactivos: Destacados con hover glow

### Efectos y Animaciones Sugeridas

1. **Hover Effects:**
   - Incremento de glow intensity
   - Ligero scale (1.02-1.05)
   - Transición suave (300ms)

2. **Backgrounds:**
   - Gradientes animados sutiles
   - Partículas flotantes
   - Grid pulsante muy sutil

3. **Transiciones:**
   - Fade in/out con duración 400-600ms
   - Slide in desde abajo para cards
   - Glow pulsante para elementos activos

### Paleta de Colores Específica (Tailwind/CSS)

```css
/* Fondos */
--bg-primary: #0a1628;
--bg-secondary: #1a2744;
--bg-card: rgba(15, 27, 45, 0.8);

/* Acentos */
--accent-cyan: #00d9ff;
--accent-purple: #a855f7;
--accent-red: #ff6b6b;
--accent-amber: #fbbf24;
--accent-green: #10b981;

/* Texto */
--text-primary: #ffffff;
--text-secondary: #cbd5e1;
--text-cyan: #67e8f9;

/* Bordes */
--border-cyan: rgba(0, 217, 255, 0.3);
--border-purple: rgba(168, 85, 247, 0.3);

/* Glow */
--glow-cyan: 0 0 20px rgba(0, 217, 255, 0.6);
--glow-purple: 0 0 20px rgba(168, 85, 247, 0.6);
```

### Elementos Clave por Página

**Home/Landing:**
- Hero section con imagen de cerebro-red neuronal
- Título grande con glow
- Gradiente azul-púrpura de fondo
- Partículas flotantes

**Visualizaciones:**
- Gráficos con líneas cyan brillantes
- Grid de fondo tenue
- Zonas de color para estados
- Leyendas con iconos y colores

**Cards de Contenido:**
- Fondo semi-transparente
- Borde cyan con glow
- Iconos cyan en esquina superior
- Hover effect con incremento de glow
