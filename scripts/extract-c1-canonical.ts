#!/usr/bin/env tsx
/**
 * Extrae los mensajes canónicos del experimento C-1
 * y los congela como conjunto de estímulos de referencia
 */

import { drizzle } from 'drizzle-orm/mysql2';
import { experiments } from '../drizzle/schema/experiments';
import { experimentInteractions } from '../drizzle/schema/experiments';
import { like, or, eq, and } from 'drizzle-orm';
import { asc } from 'drizzle-orm';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function extractC1Canonical() {
  console.log('Extrayendo mensajes canónicos de C-1...\n');

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL no está definida');
    process.exit(1);
  }

  const db = drizzle(process.env.DATABASE_URL);

  // Buscar experimento C-1 (régimen acoplada con CAELION)
  const experimentsFound = await db
    .select()
    .from(experiments)
    .where(
      and(
        eq(experiments.regime, 'acoplada'),
        eq(experiments.hasCAELION, true)
      )
    );

  console.log(`Experimentos C-1 encontrados: ${experimentsFound.length}`);
  experimentsFound.forEach(exp => {
    console.log(`  - ${exp.experimentId} (régimen: ${exp.regime}, CAELION: ${exp.hasCAELION})`);
  });

  if (experimentsFound.length === 0) {
    console.error('\n❌ No se encontró experimento C-1');
    process.exit(1);
  }

  // Tomar el primer experimento C-1 encontrado
  const experimentC1 = experimentsFound[0];
  console.log(`\nUsando experimento: ${experimentC1.experimentId}`);

  // Extraer interacciones
  const interactions = await db
    .select()
    .from(experimentInteractions)
    .where(eq(experimentInteractions.experimentId, experimentC1.experimentId))
    .orderBy(asc(experimentInteractions.interactionIndex));

  console.log(`\nInteracciones encontradas: ${interactions.length}`);

  if (interactions.length === 0) {
    console.error('\n❌ No se encontraron interacciones para C-1');
    process.exit(1);
  }

  // Extraer mensajes (userMessage)
  const canonicalStimuli = interactions.map((interaction, index) => ({
    index: index + 1,
    interactionIndex: interaction.interactionIndex,
    userMessage: interaction.userMessage,
    timestamp: interaction.timestamp
  }));

  console.log(`\nMensajes extraídos: ${canonicalStimuli.length}`);

  // Congelar como JSON
  const outputPath = join(process.cwd(), 'experiments', 'canonical_stimuli_c1.json');
  
  const canonicalData = {
    metadata: {
      sourceExperiment: experimentC1.experimentId,
      experimentType: experimentC1.regime,
      hasCAELION: experimentC1.hasCAELION,
      extractionDate: new Date().toISOString(),
      totalMessages: canonicalStimuli.length,
      status: 'CANONICAL_FROZEN',
      description: 'Conjunto canónico de estímulos del experimento C-1. Este es el ÚNICO input válido para comparaciones experimentales B-1 vs C-1. Los mismos mensajes deben aplicarse a B-1 (sin CAELION) para validez experimental.'
    },
    stimuli: canonicalStimuli
  };

  writeFileSync(outputPath, JSON.stringify(canonicalData, null, 2), 'utf-8');

  console.log(`\n✅ Mensajes canónicos congelados en: ${outputPath}`);
  console.log(`\n📋 Resumen:`);
  console.log(`   - Experimento fuente: ${experimentC1.experimentId}`);
  console.log(`   - Régimen: ${experimentC1.regime} (CAELION: ${experimentC1.hasCAELION})`);
  console.log(`   - Total de mensajes: ${canonicalStimuli.length}`);
  console.log(`   - Estado: CANONICAL_FROZEN`);
  console.log(`   - Uso: Input único para B-1 y C-1\n`);

  // Mostrar primeros 3 mensajes como muestra
  console.log(`📝 Muestra de mensajes (primeros 3):`);
  canonicalStimuli.slice(0, 3).forEach(msg => {
    console.log(`\n   [${msg.index}] ${msg.userMessage.substring(0, 80)}...`);
  });

  console.log(`\n🔒 C-1 declarado como CONJUNTO CANÓNICO DE ESTÍMULOS`);
  console.log(`⚠️  B-1 debe re-ejecutarse usando EXACTAMENTE estos mensajes`);
  
  process.exit(0);
}

extractC1Canonical().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
