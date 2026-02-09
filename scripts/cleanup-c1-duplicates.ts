import { getDb } from '../server/db';
import { experimentInteractions, experiments } from '../drizzle/schema/experiments';
import { eq } from 'drizzle-orm';

async function cleanupDuplicates() {
  const db = await getDb();

  // Obtener todas las interacciones del experimento
  const allInteractions = await db
    .select()
    .from(experimentInteractions)
    .where(eq(experimentInteractions.experimentId, 'C-1-1770628250311'))
    .orderBy(experimentInteractions.interactionIndex);

  console.log(`Total interacciones antes de limpieza: ${allInteractions.length}`);

  // Mantener solo interacciones con índices 0-49
  const toDelete = allInteractions.filter(i => i.interactionIndex! < 0 || i.interactionIndex! > 49);

  for (const interaction of toDelete) {
    await db
      .delete(experimentInteractions)
      .where(eq(experimentInteractions.id, interaction.id));
  }

  console.log(`Interacciones eliminadas: ${toDelete.length}`);

  // Verificar
  const remaining = await db
    .select()
    .from(experimentInteractions)
    .where(eq(experimentInteractions.experimentId, 'C-1-1770628250311'));

  console.log(`Total interacciones después de limpieza: ${remaining.length}`);

  // Recalcular promedios
  const avgOmega = remaining.reduce((sum, i) => sum + (i.omegaSem || 0), 0) / remaining.length;
  const avgEpsilon = remaining.reduce((sum, i) => sum + (i.epsilonEff || 0), 0) / remaining.length;
  const avgV = remaining.reduce((sum, i) => sum + (i.vLyapunov || 0), 0) / remaining.length;
  const avgH = remaining.reduce((sum, i) => sum + (i.hDiv || 0), 0) / remaining.length;

  // Actualizar experimento
  await db
    .update(experiments)
    .set({
      successfulInteractions: remaining.length,
      avgOmegaSem: avgOmega,
      avgEpsilonEff: avgEpsilon,
      avgVLyapunov: avgV,
      avgHDiv: avgH
    })
    .where(eq(experiments.experimentId, 'C-1-1770628250311'));

  console.log('\nMétricas actualizadas:');
  console.log(`  Ω: ${avgOmega.toFixed(4)}`);
  console.log(`  ε: ${avgEpsilon.toFixed(4)}`);
  console.log(`  V: ${avgV.toFixed(4)}`);
  console.log(`  H: ${avgH.toFixed(4)}`);

  process.exit(0);
}

cleanupDuplicates().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
