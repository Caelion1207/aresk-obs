import { getDb } from './server/db';
import { argosCosts } from './drizzle/schema/argosCosts';
import { messages } from './drizzle/schema';
import { eq, desc, sql } from 'drizzle-orm';

async function verifyCosts() {
  const db = await getDb();
  if (!db) {
    console.error('❌ No se pudo conectar a la base de datos');
    process.exit(1);
  }

  const costs = await db.select().from(argosCosts).orderBy(desc(argosCosts.createdAt)).limit(10);

  console.log('\n📊 REGISTROS EN argosCosts (últimos 10):');
  console.log('='.repeat(80));
  console.log('');

  if (costs.length === 0) {
    console.log('❌ No hay registros en argosCosts');
    process.exit(0);
  }

  for (const cost of costs) {
    const msg = await db.select().from(messages).where(eq(messages.id, cost.messageId)).limit(1);
    const profile = msg[0]?.plantProfile || 'unknown';
    console.log(`✅ Message #${cost.messageId} | Profile: ${profile}`);
    console.log(`   Tokens: ${cost.tokenCount} | Latency: ${cost.latencyMs}ms`);
    console.log(`   V(e): ${cost.stabilityCost.toFixed(3)} | Ω: ${cost.coherence.toFixed(3)}`);
    console.log(`   Created: ${cost.createdAt}`);
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log(`\n📈 Total de registros: ${costs.length}`);
  
  const totalTokens = costs.reduce((sum, c) => sum + (c.tokenCount || 0), 0);
  const avgLatency = costs.reduce((sum, c) => sum + (c.latencyMs || 0), 0) / costs.length;
  const avgVe = costs.reduce((sum, c) => sum + c.stabilityCost, 0) / costs.length;
  const avgOmega = costs.reduce((sum, c) => sum + c.coherence, 0) / costs.length;
  
  console.log(`   Total Tokens: ${totalTokens}`);
  console.log(`   Avg Latency: ${Math.round(avgLatency)}ms`);
  console.log(`   Avg V(e): ${avgVe.toFixed(3)}`);
  console.log(`   Avg Ω: ${avgOmega.toFixed(3)}`);
  
  // Verificar tokens por perfil
  console.log('\n📊 TOKENS POR PERFIL:');
  console.log('='.repeat(80));
  
  const costsWithProfile = await db
    .select({
      plantProfile: messages.plantProfile,
      tokenCount: argosCosts.tokenCount,
    })
    .from(argosCosts)
    .innerJoin(messages, eq(argosCosts.messageId, messages.id))
    .where(sql`${messages.plantProfile} IS NOT NULL`);
  
  const grouped = costsWithProfile.reduce((acc, row) => {
    const profile = row.plantProfile || 'unknown';
    if (!acc[profile]) {
      acc[profile] = { count: 0, tokens: 0 };
    }
    acc[profile].count++;
    acc[profile].tokens += row.tokenCount || 0;
    return acc;
  }, {} as Record<string, { count: number; tokens: 0 }>);
  
  for (const [profile, data] of Object.entries(grouped)) {
    console.log(`\n${profile.toUpperCase()}:`);
    console.log(`   Mensajes: ${data.count}`);
    console.log(`   Tokens totales: ${data.tokens}`);
    console.log(`   Promedio: ${Math.round(data.tokens / data.count)} tokens/mensaje`);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Verificación completada\n');
}

verifyCosts().catch(console.error);
