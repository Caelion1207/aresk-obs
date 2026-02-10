import { getDb } from '../server/db.ts';
import { experimentInteractions } from '../drizzle/schema/experiments.ts';
import { eq } from 'drizzle-orm';

async function main() {
  const db = await getDb();
  const interactions = await db.select().from(experimentInteractions).where(eq(experimentInteractions.experimentId, 'B-1-1770623178573'));
  console.log('Total interacciones B-1-1770623178573:', interactions.length);
  console.log('Índices:', interactions.map(i => i.interactionIndex).sort((a,b) => a-b));
  
  // Verificar si hay gaps en índices
  const indices = interactions.map(i => i.interactionIndex).sort((a,b) => a-b);
  for (let i = 0; i < indices.length - 1; i++) {
    if (indices[i+1] - indices[i] > 1) {
      console.log(`GAP detectado entre índice ${indices[i]} y ${indices[i+1]}`);
    }
  }
  
  process.exit(0);
}

main();
