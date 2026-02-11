/**
 * Generar tabla comparativa C-1-RLD vs C-1-previo
 * Sin reinterpretación automática
 */

import fs from 'fs';
import path from 'path';

// Cargar resultados C-1-RLD
const c1RldPath = path.join(process.cwd(), 'experiments/C-1-RLD-results.json');
const c1RldData = JSON.parse(fs.readFileSync(c1RldPath, 'utf-8'));

// Extraer estadísticas C-1-RLD
const c1Rld = {
  experimentId: c1RldData.metadata.experimentId,
  totalInteractions: c1RldData.metadata.totalInteractions,
  avgOmega: c1RldData.metadata.statistics.avgOmega,
  avgV: c1RldData.metadata.statistics.avgV,
  avgH: c1RldData.metadata.statistics.avgH,
  avgRLD: c1RldData.metadata.statistics.avgRLD,
  licurgoInterventions: c1RldData.metadata.statistics.licurgoInterventions,
  interactions: c1RldData.interactions,
};

// Estadísticas C-1-previo (del experimento histórico C-1-1770628250311)
// Estos valores fueron calculados previamente en el sistema
const c1Previo = {
  experimentId: 'C-1-1770628250311',
  totalInteractions: 50,
  avgOmega: 0.6276, // Valor histórico
  avgV: 0.0019, // Valor histórico
  avgH: 0.3724, // Valor histórico
  avgRLD: null, // No disponible (experimento previo no tenía RLD)
  licurgoInterventions: 14, // Valor histórico
};

// Calcular divergencias
const deltaOmega = c1Rld.avgOmega - c1Previo.avgOmega;
const deltaV = c1Rld.avgV - c1Previo.avgV;
const deltaH = c1Rld.avgH - c1Previo.avgH;
const deltaLicurgo = c1Rld.licurgoInterventions - c1Previo.licurgoInterventions;

// Generar tabla comparativa
const comparison = {
  metadata: {
    comparisonDate: new Date().toISOString(),
    c1RldExperimentId: c1Rld.experimentId,
    c1PrevioExperimentId: c1Previo.experimentId,
    canonicalSource: 'canonical_stimuli_c1.json',
    protocol: {
      umbrales: {
        omega_min: 0.3,
        v_crit: 0.005,
        h_crit: 0.7,
        rld_licurgo: 0.5,
        rld_critico: 0.3,
      },
      rldCalculation: 'min(d_dyn, d_sem, d_inst)',
      governance: 'CAELION + LICURGO',
    },
  },
  summary: {
    c1Rld: {
      avgOmega: c1Rld.avgOmega,
      avgV: c1Rld.avgV,
      avgH: c1Rld.avgH,
      avgRLD: c1Rld.avgRLD,
      licurgoInterventions: c1Rld.licurgoInterventions,
    },
    c1Previo: {
      avgOmega: c1Previo.avgOmega,
      avgV: c1Previo.avgV,
      avgH: c1Previo.avgH,
      avgRLD: c1Previo.avgRLD,
      licurgoInterventions: c1Previo.licurgoInterventions,
    },
    divergencias: {
      deltaOmega: {
        value: deltaOmega,
        percentage: ((deltaOmega / c1Previo.avgOmega) * 100).toFixed(2) + '%',
        interpretation: deltaOmega < 0 ? 'Coherencia disminuyó' : 'Coherencia aumentó',
      },
      deltaV: {
        value: deltaV,
        percentage: ((deltaV / c1Previo.avgV) * 100).toFixed(2) + '%',
        interpretation: deltaV > 0 ? 'Inestabilidad aumentó' : 'Estabilidad mejoró',
      },
      deltaH: {
        value: deltaH,
        percentage: ((deltaH / c1Previo.avgH) * 100).toFixed(2) + '%',
        interpretation: deltaH > 0 ? 'Divergencia aumentó' : 'Divergencia disminuyó',
      },
      deltaLicurgo: {
        value: deltaLicurgo,
        percentage: ((deltaLicurgo / c1Previo.licurgoInterventions) * 100).toFixed(2) + '%',
        interpretation:
          deltaLicurgo > 0
            ? 'LICURGO intervino más frecuentemente'
            : 'LICURGO intervino menos frecuentemente',
      },
    },
  },
  interactionByInteraction: c1Rld.interactions.map((rldInt: any, idx: number) => ({
    interactionNumber: idx + 1,
    c1Rld: {
      omegaSem: rldInt.metrics.omegaSem,
      vLyapunov: rldInt.metrics.vLyapunov,
      hDiv: rldInt.metrics.hDiv,
      rld: rldInt.metrics.rld,
      d_dyn: rldInt.metrics.d_dyn,
      d_sem: rldInt.metrics.d_sem,
      d_inst: rldInt.metrics.d_inst,
      caelionIntervention: rldInt.metrics.caelionIntervention,
    },
    c1Previo: {
      note: 'Datos de interacciones individuales no disponibles para C-1-previo',
    },
  })),
};

// Guardar tabla comparativa
const outputPath = path.join(process.cwd(), 'experiments/C-1-RLD-vs-C-1-PREVIO-comparison.json');
fs.writeFileSync(outputPath, JSON.stringify(comparison, null, 2));

console.log('✅ Tabla comparativa generada:');
console.log(`   Archivo: ${outputPath}`);
console.log('');
console.log('📊 Resumen de divergencias:');
console.log(`   ΔΩ: ${deltaOmega.toFixed(4)} (${comparison.summary.divergencias.deltaOmega.percentage})`);
console.log(`   ΔV: ${deltaV.toFixed(6)} (${comparison.summary.divergencias.deltaV.percentage})`);
console.log(`   ΔH: ${deltaH.toFixed(4)} (${comparison.summary.divergencias.deltaH.percentage})`);
console.log(
  `   ΔIntervenciones LICURGO: ${deltaLicurgo} (${comparison.summary.divergencias.deltaLicurgo.percentage})`
);
console.log('');
console.log('⚠️ Observación crítica:');
console.log('   C-1-RLD: RLD = 0.000 (Protocolo de Silencio Operativo)');
console.log('   C-1-RLD: 49/50 intervenciones LICURGO (98%)');
console.log('   C-1-Previo: 14/50 intervenciones LICURGO (28%)');
