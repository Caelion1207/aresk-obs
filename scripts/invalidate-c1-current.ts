import { getDb } from '../server/db';
import { experiments } from '../drizzle/schema/experiments';
import { eq } from 'drizzle-orm';

/**
 * Script para invalidar C-1 actual (sin arquitectura CAELION explícita)
 */

async function invalidateC1() {
  console.log('Invalidando C-1 actual...\n');

  const db = await getDb();

  // Buscar experimentos C-1 con status completed
  const c1Experiments = await db
    .select()
    .from(experiments)
    .where(eq(experiments.regime, 'acoplada'));

  console.log(`Encontrados ${c1Experiments.length} experimentos C-1\n`);

  for (const exp of c1Experiments) {
    if (exp.status === 'completed') {
      console.log(`Invalidando: ${exp.experimentId}`);
      
      await db
        .update(experiments)
        .set({
          status: 'frozen',
          metadata: JSON.stringify({
            ...(exp.metadata ? JSON.parse(exp.metadata as string) : {}),
            invalidation_reason: 'invalid_architecture_mismatch',
            invalidation_date: new Date().toISOString(),
            note: 'Arquitectura CAELION no aplicada explícitamente. Re-generado con system prompt CAELION.'
          })
        })
        .where(eq(experiments.id, exp.id));

      console.log(`  ✅ Marcado como frozen con metadata de invalidación\n`);
    }
  }

  console.log('✅ Invalidación completada');
  process.exit(0);
}

invalidateC1().catch(error => {
  console.error('\n❌ Error:', error);
  process.exit(1);
});
