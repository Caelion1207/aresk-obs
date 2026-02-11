/**
 * Script para ejecutar experimento C-1-RLD v2
 * Llama al endpoint tRPC executeCanonicalExperimentV2
 */

console.log('🚀 Iniciando experimento C-1-RLD v2...');
console.log('');

const API_URL = 'http://localhost:3000/api/trpc/caelion.executeCanonicalExperimentV2';

try {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const result = data.result.data;

  console.log('✅ Experimento completado exitosamente');
  console.log('');
  console.log('📊 Resultados:');
  console.log(`   Experiment ID: ${result.experimentId}`);
  console.log(`   Total interacciones: ${result.totalInteractions}`);
  console.log(`   Intervenciones LICURGO: ${result.licurgoInterventions}`);
  console.log('');
  console.log('📈 Estadísticas:');
  console.log(`   Ω promedio: ${result.statistics.avgOmega.toFixed(4)}`);
  console.log(`   V promedio: ${result.statistics.avgV.toFixed(6)}`);
  console.log(`   H promedio: ${result.statistics.avgH.toFixed(4)}`);
  console.log(`   RLD promedio: ${result.statistics.avgRLD.toFixed(4)}`);
  console.log('');
  console.log(`📁 Resultados guardados en: ${result.outputPath}`);

} catch (error) {
  console.error('❌ Error ejecutando experimento:', error.message);
  process.exit(1);
}
