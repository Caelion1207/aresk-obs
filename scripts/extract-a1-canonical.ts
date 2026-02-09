#!/usr/bin/env tsx
/**
 * Extrae los 50 mensajes canónicos del experimento A-1
 * y los congela como conjunto de estímulos de referencia
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { experiments } from '../drizzle/schema/experiments';
import { experimentInteractions } from '../drizzle/schema/experiments';
import { like, or, eq } from 'drizzle-orm';
import { asc } from 'drizzle-orm';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function extractA1Canonical() {
  console.log('Extrayendo mensajes canónicos de A-1...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no está definida');
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  // Buscar experimento A-1
  const experimentsFound = await db
    .select()
    .from(experiments)
    .where(
      or(
        like(experiments.experimentId, '%a1%'),
        like(experiments.experimentId, '%A-1%'),
        eq(experiments.regime, 'tipo_a')
      )
    );

  console.log(`Experimentos encontrados: ${experimentsFound.length}`);
  experimentsFound.forEach(exp => {
    console.log(`  - ${exp.experimentId} (régimen: ${exp.regime})`);
  });

  if (experimentsFound.length === 0) {
    console.error('\n❌ No se encontró experimento A-1');
    process.exit(1);
  }

  // Tomar el primer experimento A-1 encontrado
  const experimentA1 = experimentsFound[0];
  console.log(`\nUsando experimento: ${experimentA1.experimentId}`);

  // Extraer interacciones
  const interactions = await db
    .select()
    .from(experimentInteractions)
    .where(eq(experimentInteractions.experimentId, experimentA1.id))
    .orderBy(asc(experimentInteractions.interactionNumber));

  console.log(`\nInteracciones encontradas: ${interactions.length}`);

  if (interactions.length === 0) {
    console.error('\n❌ No se encontraron interacciones para A-1');
    process.exit(1);
  }

  // Extraer mensajes (userPrompt)
  const canonicalStimuli = interactions.map((interaction, index) => ({
    index: index + 1,
    interactionNumber: interaction.interactionNumber,
    userPrompt: interaction.userPrompt,
    timestamp: interaction.timestamp
  }));

  console.log(`\nMensajes extraídos: ${canonicalStimuli.length}`);

  // Congelar como JSON
  const outputPath = join(process.cwd(), 'experiments', 'canonical_stimuli_a1.json');
  
  const canonicalData = {
    metadata: {
      sourceExperiment: experimentA1.experimentId,
      experimentType: experimentA1.regime,
      extractionDate: new Date().toISOString(),
      totalMessages: canonicalStimuli.length,
      status: 'CANONICAL_FROZEN',
      description: 'Conjunto canónico de estímulos del experimento A-1. Este es el ÚNICO input válido para comparaciones experimentales B-1 y C-1.'
    },
    stimuli: canonicalStimuli
  };

  writeFileSync(outputPath, JSON.stringify(canonicalData, null, 2), 'utf-8');

  console.log(`\n✅ Mensajes canónicos congelados en: ${outputPath}`);
  console.log(`\n📋 Resumen:`);
  console.log(`   - Experimento fuente: ${experimentA1.experimentId}`);
  console.log(`   - Total de mensajes: ${canonicalStimuli.length}`);
  console.log(`   - Estado: CANONICAL_FROZEN`);
  console.log(`   - Uso: Input único para B-1 y C-1\n`);

  // Mostrar primeros 3 mensajes como muestra
  console.log(`📝 Muestra de mensajes (primeros 3):`);
  canonicalStimuli.slice(0, 3).forEach(msg => {
    console.log(`\n   [${msg.index}] ${msg.userPrompt.substring(0, 80)}...`);
  });

  console.log(`\n🔒 A-1 declarado como CONJUNTO CANÓNICO DE ESTÍMULOS`);
  
  process.exit(0);
}

extractA1Canonical().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
