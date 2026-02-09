import fs from 'fs/promises';
import { getDb } from '../server/db';
import { experiments, experimentInteractions } from '../drizzle/schema/experiments';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Script para generar informe comparativo B-1 vs C-1
 * Extrae datos actuales y calcula estadísticas
 */

async function generateComparison() {
  console.log('='.repeat(80));
  console.log('INFORME COMPARATIVO: B-1 vs C-1');
  console.log('Estado Actual de Experimentos');
  console.log('='.repeat(80));
  console.log();

  const db = await getDb();

  // Identificar experimentos B-1 y C-1 más recientes
  const b1Experiment = await db
    .select()
    .from(experiments)
    .where(
      and(
        eq(experiments.regime, 'tipo_b'),
        eq(experiments.status, 'completed')
      )
    )
    .orderBy(desc(experiments.id))
    .limit(1);

  const c1Experiment = await db
    .select()
    .from(experiments)
    .where(
      and(
        eq(experiments.regime, 'acoplada'),
        eq(experiments.status, 'completed')
      )
    )
    .orderBy(desc(experiments.id))
    .limit(1);

  if (b1Experiment.length === 0 || c1Experiment.length === 0) {
    console.error('❌ No se encontraron experimentos B-1 o C-1 completados');
    process.exit(1);
  }

  const b1 = b1Experiment[0];
  const c1 = c1Experiment[0];

  console.log('📊 EXPERIMENTOS IDENTIFICADOS\n');
  console.log(`B-1: ${b1.experimentId}`);
  console.log(`  - Régimen: ${b1.regime} (sin CAELION)`);
  console.log(`  - Creado: ${b1.createdAt}`);
  console.log(`  - Interacciones: ${b1.successfulInteractions}/${b1.successfulInteractions + b1.failedInteractions}`);
  console.log();
  console.log(`C-1: ${c1.experimentId}`);
  console.log(`  - Régimen: ${c1.regime} (con CAELION)`);
  console.log(`  - Creado: ${c1.createdAt}`);
  console.log(`  - Interacciones: ${c1.successfulInteractions}/${c1.successfulInteractions + c1.failedInteractions}`);
  console.log();

  // Extraer interacciones
  const b1Interactions = await db
    .select()
    .from(experimentInteractions)
    .where(eq(experimentInteractions.experimentId, b1.experimentId))
    .orderBy(experimentInteractions.interactionIndex);

  const c1Interactions = await db
    .select()
    .from(experimentInteractions)
    .where(eq(experimentInteractions.experimentId, c1.experimentId))
    .orderBy(experimentInteractions.interactionIndex);

  console.log('='.repeat(80));
  console.log('MÉTRICAS PROMEDIO');
  console.log('='.repeat(80));
  console.log();

  // Calcular estadísticas B-1
  const b1Omega = b1Interactions.map(i => i.omegaSem || 0);
  const b1Epsilon = b1Interactions.map(i => i.epsilonEff || 0);
  const b1V = b1Interactions.map(i => i.vLyapunov || 0);
  const b1H = b1Interactions.map(i => i.hDiv || 0);

  const b1AvgOmega = b1Omega.reduce((a, b) => a + b, 0) / b1Omega.length;
  const b1AvgEpsilon = b1Epsilon.reduce((a, b) => a + b, 0) / b1Epsilon.length;
  const b1AvgV = b1V.reduce((a, b) => a + b, 0) / b1V.length;
  const b1AvgH = b1H.reduce((a, b) => a + b, 0) / b1H.length;

  const b1StdOmega = Math.sqrt(b1Omega.reduce((sum, val) => sum + Math.pow(val - b1AvgOmega, 2), 0) / b1Omega.length);
  const b1StdV = Math.sqrt(b1V.reduce((sum, val) => sum + Math.pow(val - b1AvgV, 2), 0) / b1V.length);

  // Calcular estadísticas C-1
  const c1Omega = c1Interactions.map(i => i.omegaSem || 0);
  const c1Epsilon = c1Interactions.map(i => i.epsilonEff || 0);
  const c1V = c1Interactions.map(i => i.vLyapunov || 0);
  const c1H = c1Interactions.map(i => i.hDiv || 0);

  const c1AvgOmega = c1Omega.reduce((a, b) => a + b, 0) / c1Omega.length;
  const c1AvgEpsilon = c1Epsilon.reduce((a, b) => a + b, 0) / c1Epsilon.length;
  const c1AvgV = c1V.reduce((a, b) => a + b, 0) / c1V.length;
  const c1AvgH = c1H.reduce((a, b) => a + b, 0) / c1H.length;

  const c1StdOmega = Math.sqrt(c1Omega.reduce((sum, val) => sum + Math.pow(val - c1AvgOmega, 2), 0) / c1Omega.length);
  const c1StdV = Math.sqrt(c1V.reduce((sum, val) => sum + Math.pow(val - c1AvgV, 2), 0) / c1V.length);

  // Calcular diferencias
  const deltaOmega = c1AvgOmega - b1AvgOmega;
  const deltaEpsilon = c1AvgEpsilon - b1AvgEpsilon;
  const deltaV = c1AvgV - b1AvgV;
  const deltaH = c1AvgH - b1AvgH;

  console.log('┌─────────────────┬──────────────┬──────────────┬──────────────┐');
  console.log('│ Métrica         │ B-1 (sin)    │ C-1 (con)    │ Δ (C-1 - B-1)│');
  console.log('├─────────────────┼──────────────┼──────────────┼──────────────┤');
  console.log(`│ Ω (Coherencia)  │ ${b1AvgOmega.toFixed(4)}       │ ${c1AvgOmega.toFixed(4)}       │ ${deltaOmega >= 0 ? '+' : ''}${deltaOmega.toFixed(4)}      │`);
  console.log(`│ ε (Eficiencia)  │ ${b1AvgEpsilon.toFixed(4)}       │ ${c1AvgEpsilon.toFixed(4)}       │ ${deltaEpsilon >= 0 ? '+' : ''}${deltaEpsilon.toFixed(4)}      │`);
  console.log(`│ V (Lyapunov)    │ ${b1AvgV.toFixed(4)}       │ ${c1AvgV.toFixed(4)}       │ ${deltaV >= 0 ? '+' : ''}${deltaV.toFixed(4)}      │`);
  console.log(`│ H (Entropía)    │ ${b1AvgH.toFixed(4)}       │ ${c1AvgH.toFixed(4)}       │ ${deltaH >= 0 ? '+' : ''}${deltaH.toFixed(4)}      │`);
  console.log('└─────────────────┴──────────────┴──────────────┴──────────────┘');
  console.log();

  console.log('='.repeat(80));
  console.log('VOLATILIDAD (Desviación Estándar)');
  console.log('='.repeat(80));
  console.log();

  console.log('┌─────────────────┬──────────────┬──────────────┐');
  console.log('│ Métrica         │ σ(B-1)       │ σ(C-1)       │');
  console.log('├─────────────────┼──────────────┼──────────────┤');
  console.log(`│ Ω (Coherencia)  │ ${b1StdOmega.toFixed(4)}       │ ${c1StdOmega.toFixed(4)}       │`);
  console.log(`│ V (Lyapunov)    │ ${b1StdV.toFixed(4)}       │ ${c1StdV.toFixed(4)}       │`);
  console.log('└─────────────────┴──────────────┴──────────────┘');
  console.log();

  // Análisis cualitativo de respuestas
  console.log('='.repeat(80));
  console.log('ANÁLISIS CUALITATIVO DE RESPUESTAS');
  console.log('='.repeat(80));
  console.log();

  // Identificar interacciones con mayor divergencia
  const divergences = b1Interactions.map((b1Int, idx) => {
    const c1Int = c1Interactions[idx];
    if (!c1Int) return null;

    const omegaDiff = Math.abs((c1Int.omegaSem || 0) - (b1Int.omegaSem || 0));
    const vDiff = Math.abs((c1Int.vLyapunov || 0) - (b1Int.vLyapunov || 0));

    return {
      index: idx,
      userMessage: b1Int.userMessage,
      b1Response: b1Int.systemMessage,
      c1Response: c1Int.systemMessage,
      omegaDiff,
      vDiff,
      totalDiff: omegaDiff + vDiff
    };
  }).filter(d => d !== null);

  // Ordenar por mayor divergencia
  divergences.sort((a, b) => b!.totalDiff - a!.totalDiff);

  console.log('Top 5 Interacciones con Mayor Divergencia:\n');

  for (let i = 0; i < Math.min(5, divergences.length); i++) {
    const div = divergences[i]!;
    console.log(`[${div.index + 1}] ${div.userMessage.substring(0, 80)}...`);
    console.log(`    ΔΩ = ${div.omegaDiff.toFixed(4)}, ΔV = ${div.vDiff.toFixed(4)}`);
    console.log(`    B-1: ${div.b1Response.substring(0, 100)}...`);
    console.log(`    C-1: ${div.c1Response.substring(0, 100)}...`);
    console.log();
  }

  // Generar informe markdown
  const report = `# Informe Comparativo: B-1 vs C-1

**Fecha**: ${new Date().toISOString().split('T')[0]}  
**Herramienta**: ARESK-OBS v1.1  
**Objetivo**: Evaluar diferencias entre régimen sin CAELION (B-1) y con CAELION (C-1)

---

## Experimentos Analizados

### B-1 (Sin CAELION)
- **ID**: ${b1.experimentId}
- **Régimen**: ${b1.regime}
- **Interacciones**: ${b1.successfulInteractions}/${b1.successfulInteractions + b1.failedInteractions}
- **Encoder**: sentence-transformers/all-MiniLM-L6-v2 (384D)
- **Input**: 50 mensajes canónicos de C-1

### C-1 (Con CAELION)
- **ID**: ${c1.experimentId}
- **Régimen**: ${c1.regime}
- **Interacciones**: ${c1.successfulInteractions}/${c1.successfulInteractions + c1.failedInteractions}
- **Encoder**: sentence-transformers/all-MiniLM-L6-v2 (384D)
- **Input**: 50 mensajes canónicos

---

## Métricas Promedio

| Métrica | B-1 (sin CAELION) | C-1 (con CAELION) | Δ (C-1 - B-1) | Interpretación |
|---------|-------------------|-------------------|---------------|----------------|
| **Ω (Coherencia)** | ${b1AvgOmega.toFixed(4)} | ${c1AvgOmega.toFixed(4)} | ${deltaOmega >= 0 ? '+' : ''}${deltaOmega.toFixed(4)} | ${Math.abs(deltaOmega) > 0.05 ? '⚠️ Diferencia notable' : '✅ Similar'} |
| **ε (Eficiencia)** | ${b1AvgEpsilon.toFixed(4)} | ${c1AvgEpsilon.toFixed(4)} | ${deltaEpsilon >= 0 ? '+' : ''}${deltaEpsilon.toFixed(4)} | ${Math.abs(deltaEpsilon) > 0.01 ? '⚠️ Diferencia notable' : '✅ Similar'} |
| **V (Lyapunov)** | ${b1AvgV.toFixed(4)} | ${c1AvgV.toFixed(4)} | ${deltaV >= 0 ? '+' : ''}${deltaV.toFixed(4)} | ${Math.abs(deltaV) > 0.001 ? '⚠️ Diferencia notable' : '✅ Similar'} |
| **H (Entropía)** | ${b1AvgH.toFixed(4)} | ${c1AvgH.toFixed(4)} | ${deltaH >= 0 ? '+' : ''}${deltaH.toFixed(4)} | ${Math.abs(deltaH) > 0.01 ? '⚠️ Diferencia notable' : '✅ Similar'} |

---

## Volatilidad (Desviación Estándar)

| Métrica | σ(B-1) | σ(C-1) | Interpretación |
|---------|--------|--------|----------------|
| **Ω (Coherencia)** | ${b1StdOmega.toFixed(4)} | ${c1StdOmega.toFixed(4)} | ${c1StdOmega < b1StdOmega ? '✅ C-1 más estable' : '⚠️ B-1 más estable'} |
| **V (Lyapunov)** | ${b1StdV.toFixed(4)} | ${c1StdV.toFixed(4)} | ${c1StdV < b1StdV ? '✅ C-1 más estable' : '⚠️ B-1 más estable'} |

---

## Conclusiones

### Diferencias Cuantitativas

${Math.abs(deltaOmega) > 0.05 || Math.abs(deltaV) > 0.001 || Math.abs(deltaH) > 0.01 ? 
  '✅ **Diferencias notables detectadas** entre B-1 y C-1. Las métricas muestran divergencias significativas que justifican mantener ambos experimentos como regímenes distintos.' : 
  '⚠️ **Diferencias mínimas** entre B-1 y C-1. Las métricas son muy similares, lo cual sugiere que CAELION no tuvo impacto significativo o que ambos regímenes operaron de forma similar.'}

### Recomendación

${Math.abs(deltaOmega) > 0.05 || Math.abs(deltaV) > 0.001 ? 
  '**Mantener ambos experimentos** y documentar CAELION como arquitectura aplicada a C-1. Las diferencias justifican el análisis comparativo.' : 
  '**Revisar implementación de CAELION** en C-1. Las diferencias son insuficientes para justificar dos regímenes distintos.'}

---

**Generado por**: ARESK-OBS v1.1  
**Estado**: Informe preliminar para decisión
`;

  await fs.writeFile('/home/ubuntu/aresk-obs/docs/B1_vs_C1_COMPARISON_REPORT.md', report);

  console.log('='.repeat(80));
  console.log('✅ INFORME GENERADO');
  console.log('='.repeat(80));
  console.log();
  console.log('📄 Archivo: /home/ubuntu/aresk-obs/docs/B1_vs_C1_COMPARISON_REPORT.md');
  console.log();

  process.exit(0);
}

generateComparison().catch(error => {
  console.error('\n❌ Error fatal:', error);
  process.exit(1);
});
