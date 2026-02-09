import { getDb } from '../server/db';
import { experiments } from '../drizzle/schema/experiments';
import { eq, like } from 'drizzle-orm';

/**
 * Script para marcar experimentos B-1 actuales como invalidados
 * Razón: Input no coincide con conjunto canónico de C-1
 */

async function invalidateCurrentB1() {
  console.log('Marcando experimentos B-1 actuales como invalidados...\n');

  const db = await getDb();

  // Buscar todos los experimentos B-1
  const experimentsB1 = await db
    .select()
    .from(experiments)
    .where(like(experiments.experimentId, 'B-1%'));

  console.log(`Experimentos B-1 encontrados: ${experimentsB1.length}`);

  if (experimentsB1.length === 0) {
    console.log('\n⚠️  No se encontraron experimentos B-1 para invalidar');
    process.exit(0);
  }

  // Mostrar experimentos a invalidar
  experimentsB1.forEach(exp => {
    console.log(`  - ${exp.experimentId} (régimen: ${exp.regime}, CAELION: ${exp.hasCAELION})`);
  });

  // Marcar como invalidados
  for (const exp of experimentsB1) {
    await db
      .update(experiments)
      .set({
        status: 'frozen',
        metadata: {
          ...exp.metadata,
          invalidated: true,
          invalidationReason: 'Input no coincide con conjunto canónico de C-1',
          invalidationDate: new Date().toISOString(),
          note: 'Datos históricos mantenidos como referencia. NO usar para comparaciones con C-1.'
        }
      })
      .where(eq(experiments.id, exp.id));

    console.log(`\n✅ Experimento ${exp.experimentId} marcado como invalidado`);
  }

  console.log(`\n🔒 ${experimentsB1.length} experimentos B-1 invalidados`);
  console.log('📝 Datos históricos mantenidos en BD como referencia');
  console.log('⚠️  Estos experimentos NO deben usarse para comparaciones con C-1\n');

  process.exit(0);
}

invalidateCurrentB1().catch(error => {
  console.error('Error al invalidar B-1:', error);
  process.exit(1);
});
