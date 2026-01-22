# Exportación de Visualizaciones del LAB

## Resumen

El sistema ARESK-OBS soporta la inclusión de visualizaciones del LAB en los PDFs de ingeniería CAELION. Las gráficas se generan en el frontend usando Chart.js y se envían al backend como imágenes base64.

## Arquitectura

```
Frontend (Chart.js)  →  Backend (pdfGenerator.ts)  →  PDF con Apéndices
```

### Backend (Implementado ✅)

El endpoint `pdf.generateCycleReport` acepta un parámetro opcional `charts`:

```typescript
{
  cycleId: number;
  charts?: {
    phasePortrait?: string;      // base64 image
    lyapunovEnergy?: string;      // base64 image
    errorDynamics?: string;       // base64 image
    controlEffort?: string;       // base64 image
  };
}
```

El generador de PDF (`pdfGenerator.ts`) incluye una sección de Apéndices (Sección 10) que renderiza las gráficas si están presentes.

### Frontend (Pendiente)

Para capturar las gráficas del LAB como imágenes base64:

1. **Obtener referencia al canvas de Chart.js:**
   ```typescript
   const chartInstance = chartRef.current;
   if (!chartInstance) return;
   ```

2. **Convertir a base64:**
   ```typescript
   const base64Image = chartInstance.toBase64Image();
   ```

3. **Enviar al endpoint:**
   ```typescript
   const result = await generatePDF.mutateAsync({
     cycleId,
     charts: {
       phasePortrait: phasePortraitBase64,
       lyapunovEnergy: lyapunovEnergyBase64,
       errorDynamics: errorDynamicsBase64,
       controlEffort: controlEffortBase64,
     },
   });
   ```

## Ejemplo de Integración

```typescript
// En la página LAB o CyclesDashboard
const exportPDFWithCharts = async (cycleId: number) => {
  // 1. Capturar gráficas
  const charts = {
    phasePortrait: phasePortraitChartRef.current?.toBase64Image(),
    lyapunovEnergy: lyapunovEnergyChartRef.current?.toBase64Image(),
    errorDynamics: errorDynamicsChartRef.current?.toBase64Image(),
    controlEffort: controlEffortChartRef.current?.toBase64Image(),
  };
  
  // 2. Generar PDF con gráficas
  const result = await trpc.pdf.generateCycleReport.mutateAsync({
    cycleId,
    charts,
  });
  
  // 3. Descargar PDF
  downloadPDF(result.pdf, result.filename);
};
```

## Estado Actual

- ✅ Backend preparado para recibir gráficas base64
- ✅ Generador de PDF con sección de Apéndices
- ✅ Endpoint tRPC actualizado
- ⏳ Frontend: captura de gráficas pendiente (requiere acceso a instancias de Chart.js)

## Próximos Pasos

1. Agregar refs a los componentes de gráficas en la página LAB
2. Implementar función `captureCharts()` que obtenga base64 de cada gráfica
3. Actualizar `handleExportPDF` en CyclesDashboard para incluir gráficas
4. Probar generación de PDF con Apéndices completos
