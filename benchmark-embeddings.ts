/**
 * Benchmark de Embeddings Reales - CAELION
 * 
 * Mide rendimiento de embeddings bajo carga simulada:
 * - Latencia por operación
 * - Throughput (operaciones/segundo)
 * - Consumo de memoria
 * - Escalabilidad con carga concurrente
 */

import { calculateMetricsExact } from './server/services/embeddings';

interface BenchmarkResult {
  test_name: string;
  total_operations: number;
  total_time_ms: number;
  avg_latency_ms: number;
  throughput_ops_per_sec: number;
  memory_before_mb: number;
  memory_after_mb: number;
  memory_delta_mb: number;
}

/**
 * Obtiene uso de memoria en MB
 */
function getMemoryUsageMB(): number {
  const usage = process.memoryUsage();
  return usage.heapUsed / 1024 / 1024;
}

/**
 * Genera textos de prueba de diferentes tamaños
 */
function generateTestTexts(): { short: string; medium: string; long: string } {
  return {
    short: "El sistema funciona correctamente",
    medium: "El sistema de control CAELION está diseñado para mantener la estabilidad semántica mediante funciones de Lyapunov y barreras de control que garantizan la coherencia observable en todo momento",
    long: "El sistema de control CAELION representa una innovación fundamental en el control de sistemas cognitivos basados en modelos de lenguaje. Mediante la combinación de funciones de Lyapunov de control (CLF) y funciones de barrera de control (CBF), el sistema garantiza tanto la estabilidad asintótica como el cumplimiento de restricciones éticas y operacionales. La coherencia observable Ω(t) cuantifica la alineación semántica entre el estado actual y la referencia ontológica definida por Bucéfalo, mientras que la función de Lyapunov V(e) mide la energía de desalineación. El control se aplica mediante la acción u(t) = -K·e(t), donde K es la ganancia de control calculada mediante optimización LQR para minimizar el costo cuadrático J."
  };
}

/**
 * Ejecuta benchmark de operaciones secuenciales
 */
async function benchmarkSequential(
  iterations: number,
  textSize: 'short' | 'medium' | 'long'
): Promise<BenchmarkResult> {
  const texts = generateTestTexts();
  const outputText = texts[textSize];
  const referenceText = "Propósito: Asistir al usuario de forma segura\nLímites: No generar contenido dañino\nÉtica: Respetar la privacidad y autonomía";

  console.log(`\n📊 Benchmark Secuencial (${textSize}, ${iterations} iteraciones)...`);
  
  const memBefore = getMemoryUsageMB();
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    await calculateMetricsExact(outputText, referenceText);
    
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`\r  Progreso: ${i + 1}/${iterations}`);
    }
  }

  const endTime = Date.now();
  const memAfter = getMemoryUsageMB();

  const totalTime = endTime - startTime;
  const avgLatency = totalTime / iterations;
  const throughput = (iterations / totalTime) * 1000;

  console.log(`\r  ✅ Completado en ${totalTime}ms`);

  return {
    test_name: `Sequential_${textSize}`,
    total_operations: iterations,
    total_time_ms: totalTime,
    avg_latency_ms: avgLatency,
    throughput_ops_per_sec: throughput,
    memory_before_mb: memBefore,
    memory_after_mb: memAfter,
    memory_delta_mb: memAfter - memBefore,
  };
}

/**
 * Ejecuta benchmark de operaciones concurrentes
 */
async function benchmarkConcurrent(
  totalOperations: number,
  concurrency: number
): Promise<BenchmarkResult> {
  const texts = generateTestTexts();
  const referenceText = "Propósito: Asistir al usuario de forma segura\nLímites: No generar contenido dañino\nÉtica: Respetar la privacidad y autonomía";

  console.log(`\n📊 Benchmark Concurrente (${totalOperations} ops, concurrencia=${concurrency})...`);

  const memBefore = getMemoryUsageMB();
  const startTime = Date.now();

  const batches = Math.ceil(totalOperations / concurrency);
  let completed = 0;

  for (let batch = 0; batch < batches; batch++) {
    const batchSize = Math.min(concurrency, totalOperations - completed);
    const promises: Promise<any>[] = [];

    for (let i = 0; i < batchSize; i++) {
      const textSize = ['short', 'medium', 'long'][Math.floor(Math.random() * 3)] as 'short' | 'medium' | 'long';
      const outputText = texts[textSize];
      promises.push(calculateMetricsExact(outputText, referenceText));
    }

    await Promise.all(promises);
    completed += batchSize;
    process.stdout.write(`\r  Progreso: ${completed}/${totalOperations}`);
  }

  const endTime = Date.now();
  const memAfter = getMemoryUsageMB();

  const totalTime = endTime - startTime;
  const avgLatency = totalTime / totalOperations;
  const throughput = (totalOperations / totalTime) * 1000;

  console.log(`\r  ✅ Completado en ${totalTime}ms`);

  return {
    test_name: `Concurrent_${concurrency}x`,
    total_operations: totalOperations,
    total_time_ms: totalTime,
    avg_latency_ms: avgLatency,
    throughput_ops_per_sec: throughput,
    memory_before_mb: memBefore,
    memory_after_mb: memAfter,
    memory_delta_mb: memAfter - memBefore,
  };
}

/**
 * Ejecuta suite completa de benchmarks
 */
async function runBenchmarkSuite() {
  console.log('🚀 Iniciando Benchmark de Embeddings Reales - CAELION\n');
  console.log('═'.repeat(70));

  const results: BenchmarkResult[] = [];

  try {
    // Warm-up
    console.log('\n🔥 Warm-up (inicializando modelo)...');
    await calculateMetricsExact("warm up", "warm up");
    console.log('  ✅ Modelo inicializado');

    // Test 1: Textos cortos (50 iteraciones)
    results.push(await benchmarkSequential(50, 'short'));

    // Test 2: Textos medianos (30 iteraciones)
    results.push(await benchmarkSequential(30, 'medium'));

    // Test 3: Textos largos (20 iteraciones)
    results.push(await benchmarkSequential(20, 'long'));

    // Test 4: Carga concurrente baja (50 ops, 5 concurrentes)
    results.push(await benchmarkConcurrent(50, 5));

    // Test 5: Carga concurrente media (50 ops, 10 concurrentes)
    results.push(await benchmarkConcurrent(50, 10));

    // Test 6: Carga concurrente alta (50 ops, 20 concurrentes)
    results.push(await benchmarkConcurrent(50, 20));

    // Mostrar resultados
    console.log('\n\n═'.repeat(70));
    console.log('📈 RESULTADOS DEL BENCHMARK\n');

    console.log('┌─────────────────────┬──────────┬──────────┬──────────┬─────────────┐');
    console.log('│ Test                │ Ops      │ Latencia │ Through  │ Memoria Δ   │');
    console.log('│                     │          │ (ms)     │ (ops/s)  │ (MB)        │');
    console.log('├─────────────────────┼──────────┼──────────┼──────────┼─────────────┤');

    results.forEach(r => {
      const name = r.test_name.padEnd(19);
      const ops = r.total_operations.toString().padStart(8);
      const latency = r.avg_latency_ms.toFixed(2).padStart(8);
      const throughput = r.throughput_ops_per_sec.toFixed(2).padStart(8);
      const memDelta = r.memory_delta_mb.toFixed(2).padStart(11);
      
      console.log(`│ ${name} │ ${ops} │ ${latency} │ ${throughput} │ ${memDelta} │`);
    });

    console.log('└─────────────────────┴──────────┴──────────┴──────────┴─────────────┘');

    // Estadísticas generales
    const avgLatency = results.reduce((sum, r) => sum + r.avg_latency_ms, 0) / results.length;
    const maxThroughput = Math.max(...results.map(r => r.throughput_ops_per_sec));
    const totalMemDelta = results[results.length - 1].memory_after_mb - results[0].memory_before_mb;

    console.log('\n📊 Estadísticas Generales:');
    console.log(`  • Latencia promedio: ${avgLatency.toFixed(2)} ms`);
    console.log(`  • Throughput máximo: ${maxThroughput.toFixed(2)} ops/s`);
    console.log(`  • Consumo total de memoria: ${totalMemDelta.toFixed(2)} MB`);

    // Guardar resultados en JSON
    const fs = await import('fs');
    fs.writeFileSync(
      '/home/ubuntu/benchmark-results.json',
      JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2)
    );

    console.log('\n✅ Resultados guardados en /home/ubuntu/benchmark-results.json');
    console.log('═'.repeat(70));

  } catch (error) {
    console.error('\n❌ Error en benchmark:', error);
    process.exit(1);
  }
}

runBenchmarkSuite();
