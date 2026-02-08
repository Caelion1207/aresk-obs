/**
 * Script de Monitoreo del Experimento B-1
 * Valida integridad de logs, métricas y cadena de ejecución
 */

import { readFileSync } from 'fs';
import { getDb } from '../db';
import { experiments, experimentInteractions } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

interface ValidationResult {
  success: boolean;
  totalInteractions: number;
  completedInteractions: number;
  corruptedLogs: boolean;
  brokenChain: boolean;
  metricsComputable: boolean;
  hasNaN: boolean;
  hasSilentExceptions: boolean;
  errors: string[];
  warnings: string[];
  metrics: {
    avgOmega: number;
    avgEpsilon: number;
    avgV: number;
    avgH: number;
  } | null;
}

async function validateExperimentB1(logPath: string = '/tmp/experiment-b1-full.log'): Promise<ValidationResult> {
  const result: ValidationResult = {
    success: false,
    totalInteractions: 50,
    completedInteractions: 0,
    corruptedLogs: false,
    brokenChain: false,
    metricsComputable: true,
    hasNaN: false,
    hasSilentExceptions: false,
    errors: [],
    warnings: [],
    metrics: null
  };

  try {
    // Leer log completo
    const logContent = readFileSync(logPath, 'utf-8');
    const lines = logContent.split('\n');

    // 1. Validar integridad de logs
    console.log('🔍 Validando integridad de logs...');
    
    // Contar interacciones iniciadas
    const userMessages = lines.filter(line => line.match(/^\[\d+\/50\] Usuario:/));
    result.completedInteractions = userMessages.length;
    
    if (result.completedInteractions === 0) {
      result.errors.push('No se encontraron interacciones en el log');
      result.corruptedLogs = true;
      return result;
    }

    console.log(`   ✓ Interacciones encontradas: ${result.completedInteractions}/50`);

    // 2. Validar cadena de ejecución (no debe haber saltos)
    console.log('🔗 Validando cadena de ejecución...');
    
    for (let i = 1; i <= result.completedInteractions; i++) {
      const interactionPattern = new RegExp(`^\\[${i}\\/50\\] Usuario:`);
      const found = lines.some(line => interactionPattern.test(line));
      
      if (!found) {
        result.errors.push(`Interacción ${i} faltante en la cadena`);
        result.brokenChain = true;
      }
    }

    if (!result.brokenChain) {
      console.log('   ✓ Cadena de ejecución íntegra');
    } else {
      console.log(`   ✗ Cadena rota: ${result.errors.length} interacciones faltantes`);
    }

    // 3. Validar métricas computables
    console.log('📊 Validando métricas...');
    
    const metricLines = lines.filter(line => line.match(/Ω=[\d.]+.*ε=[\d.]+.*V=[\d.]+.*H=[\d.]+/));
    
    if (metricLines.length !== result.completedInteractions) {
      result.errors.push(`Métricas faltantes: esperadas ${result.completedInteractions}, encontradas ${metricLines.length}`);
      result.metricsComputable = false;
    }

    // Extraer valores de métricas
    const omegaValues: number[] = [];
    const epsilonValues: number[] = [];
    const vValues: number[] = [];
    const hValues: number[] = [];

    for (const line of metricLines) {
      const match = line.match(/Ω=([\d.]+).*ε=([\d.]+).*V=([\d.]+).*H=([\d.]+)/);
      if (match) {
        const omega = parseFloat(match[1]);
        const epsilon = parseFloat(match[2]);
        const v = parseFloat(match[3]);
        const h = parseFloat(match[4]);

        // Detectar NaN
        if (isNaN(omega) || isNaN(epsilon) || isNaN(v) || isNaN(h)) {
          result.errors.push(`Valores NaN detectados en métricas: Ω=${omega}, ε=${epsilon}, V=${v}, H=${h}`);
          result.hasNaN = true;
        } else {
          omegaValues.push(omega);
          epsilonValues.push(epsilon);
          vValues.push(v);
          hValues.push(h);
        }
      }
    }

    if (!result.hasNaN && omegaValues.length > 0) {
      result.metrics = {
        avgOmega: omegaValues.reduce((a, b) => a + b, 0) / omegaValues.length,
        avgEpsilon: epsilonValues.reduce((a, b) => a + b, 0) / epsilonValues.length,
        avgV: vValues.reduce((a, b) => a + b, 0) / vValues.length,
        avgH: hValues.reduce((a, b) => a + b, 0) / hValues.length
      };
      
      console.log(`   ✓ Métricas computables:`);
      console.log(`     Ω promedio: ${result.metrics.avgOmega.toFixed(4)}`);
      console.log(`     ε promedio: ${result.metrics.avgEpsilon.toFixed(4)}`);
      console.log(`     V promedio: ${result.metrics.avgV.toFixed(4)}`);
      console.log(`     H promedio: ${result.metrics.avgH.toFixed(4)}`);
    }

    // 4. Detectar excepciones silenciosas
    console.log('⚠️  Buscando excepciones silenciosas...');
    
    const errorPatterns = [
      /Error:/i,
      /Exception:/i,
      /Failed:/i,
      /Traceback/i,
      /undefined is not/i,
      /Cannot read property/i
    ];

    for (const line of lines) {
      for (const pattern of errorPatterns) {
        if (pattern.test(line) && !line.includes('❌ Error en interacción')) {
          result.warnings.push(`Posible excepción silenciosa: ${line.substring(0, 100)}`);
          result.hasSilentExceptions = true;
        }
      }
    }

    if (!result.hasSilentExceptions) {
      console.log('   ✓ No se detectaron excepciones silenciosas');
    } else {
      console.log(`   ⚠️  ${result.warnings.length} posibles excepciones detectadas`);
    }

    // 5. Validar datos en base de datos
    console.log('💾 Validando datos en base de datos...');
    
    const db = await getDb();
    if (db) {
      const experimentRecords = await db.select()
        .from(experiments)
        .where(eq(experiments.regime, 'tipo_b'))
        .orderBy(experiments.startedAt);

      if (experimentRecords.length === 0) {
        result.warnings.push('No se encontraron registros de experimento B-1 en la base de datos');
      } else {
        const latestExperiment = experimentRecords[experimentRecords.length - 1];
        console.log(`   ✓ Experimento encontrado: ${latestExperiment.experimentId}`);
        console.log(`   ✓ Estado: ${latestExperiment.status}`);
        console.log(`   ✓ Interacciones exitosas: ${latestExperiment.successfulInteractions}`);
        
        // Validar que las métricas en BD coincidan con las del log
        if (latestExperiment.avgOmegaSem && result.metrics) {
          const diff = Math.abs(latestExperiment.avgOmegaSem - result.metrics.avgOmega);
          if (diff > 0.01) {
            result.warnings.push(`Discrepancia en Ω: BD=${latestExperiment.avgOmegaSem.toFixed(4)}, Log=${result.metrics.avgOmega.toFixed(4)}`);
          }
        }
      }
    }

    // Determinar éxito general
    result.success = !result.corruptedLogs && 
                     !result.brokenChain && 
                     result.metricsComputable && 
                     !result.hasNaN &&
                     !result.hasSilentExceptions &&
                     result.completedInteractions === 50;

    return result;

  } catch (error) {
    result.errors.push(`Error crítico en validación: ${error}`);
    result.corruptedLogs = true;
    return result;
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const logPath = process.argv[2] || '/tmp/experiment-b1-full.log';
  
  console.log('🔬 Validación de Experimento B-1');
  console.log('================================\n');
  
  validateExperimentB1(logPath)
    .then(result => {
      console.log('\n📋 RESUMEN DE VALIDACIÓN');
      console.log('========================');
      console.log(`Estado: ${result.success ? '✅ APROBADO' : '❌ RECHAZADO'}`);
      console.log(`Interacciones completadas: ${result.completedInteractions}/50`);
      console.log(`Logs corruptos: ${result.corruptedLogs ? '❌ SÍ' : '✅ NO'}`);
      console.log(`Cadena rota: ${result.brokenChain ? '❌ SÍ' : '✅ NO'}`);
      console.log(`Métricas computables: ${result.metricsComputable ? '✅ SÍ' : '❌ NO'}`);
      console.log(`Valores NaN: ${result.hasNaN ? '❌ SÍ' : '✅ NO'}`);
      console.log(`Excepciones silenciosas: ${result.hasSilentExceptions ? '⚠️  SÍ' : '✅ NO'}`);
      
      if (result.errors.length > 0) {
        console.log('\n❌ ERRORES:');
        result.errors.forEach(err => console.log(`   - ${err}`));
      }
      
      if (result.warnings.length > 0) {
        console.log('\n⚠️  ADVERTENCIAS:');
        result.warnings.forEach(warn => console.log(`   - ${warn}`));
      }
      
      if (result.metrics) {
        console.log('\n📊 MÉTRICAS PROMEDIO:');
        console.log(`   Ω_sem: ${result.metrics.avgOmega.toFixed(4)}`);
        console.log(`   ε_eff: ${result.metrics.avgEpsilon.toFixed(4)}`);
        console.log(`   V: ${result.metrics.avgV.toFixed(4)}`);
        console.log(`   H_div: ${result.metrics.avgH.toFixed(4)}`);
      }
      
      console.log('\n' + JSON.stringify(result, null, 2));
      
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ Error fatal en validación:', error);
      process.exit(1);
    });
}

export { validateExperimentB1 };
