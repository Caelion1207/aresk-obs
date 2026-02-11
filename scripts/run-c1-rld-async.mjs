/**
 * Script para ejecutar experimento C-1-RLD con patrón asíncrono
 * Inicia el experimento y consulta progreso hasta completar
 */

const API_BASE = 'http://localhost:3000/api/trpc';

console.log('🚀 Iniciando experimento C-1-RLD (asíncrono)...');
console.log('');

try {
  // 1. Iniciar experimento
  const startResponse = await fetch(`${API_BASE}/caelion.startCanonicalExperiment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!startResponse.ok) {
    throw new Error(`HTTP ${startResponse.status}: ${await startResponse.text()}`);
  }

  const startData = await startResponse.json();
  const experimentId = startData.result.data.json.experimentId;

  console.log(`✅ Experimento iniciado: ${experimentId}`);
  console.log('');
  console.log('⏳ Consultando progreso...');
  console.log('');

  // 2. Consultar progreso cada 10 segundos
  let completed = false;
  let lastProgress = -1;

  while (!completed) {
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const progressResponse = await fetch(
      `${API_BASE}/caelion.getExperimentProgress?input=${encodeURIComponent(
        JSON.stringify({ json: { experimentId } })
      )}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!progressResponse.ok) {
      throw new Error(`HTTP ${progressResponse.status}: ${await progressResponse.text()}`);
    }

    const progressData = await progressResponse.json();
    const job = progressData.result.data.json || progressData.result.data;

    if (job.progress !== lastProgress) {
      console.log(
        `📊 Progreso: ${job.currentInteraction}/${job.totalInteractions} (${job.progress}%) - Estado: ${job.status}`
      );
      lastProgress = job.progress;
    }

    if (job.status === 'completed') {
      completed = true;
      console.log('');
      console.log('✅ Experimento completado exitosamente');
      console.log('');
      console.log('📈 Estadísticas:');
      console.log(`   Ω promedio: ${job.results.avgOmega.toFixed(4)}`);
      console.log(`   V promedio: ${job.results.avgV.toFixed(6)}`);
      console.log(`   H promedio: ${job.results.avgH.toFixed(4)}`);
      console.log(`   RLD promedio: ${job.results.avgRLD.toFixed(4)}`);
      console.log(`   Intervenciones LICURGO: ${job.results.licurgoInterventions}`);
      console.log('');
      console.log(`📁 Resultados guardados en: experiments/C-1-RLD-results.json`);
    } else if (job.status === 'failed') {
      throw new Error(`Experimento falló: ${job.error}`);
    }
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
