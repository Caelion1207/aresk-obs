import 'dotenv/config';
import { getDb } from '../db';
import { messages, sessions } from '../../drizzle/schema';
import { safeIndexMessage } from '../infra/vector';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('🔥 TWIN SIDECARS: Starting Lazarus Protocol (Full Re-index)...');
  const db = await getDb();
  if (!db) {
    console.error('❌ Database not available');
    process.exit(1);
  }
  
  const [{ count }] = await db.execute(sql`SELECT COUNT(*) as count FROM messages`) as any;
  console.log(`📊 Target: ${count} events.`);

  const BATCH_SIZE = 100;
  let offset = 0;
  let processed = 0;
  
  while (true) {
    const batch = await db.select().from(messages).limit(BATCH_SIZE).offset(offset);
    if (batch.length === 0) break;

    await Promise.all(batch.map(async (msg) => {
      const sessionResult = await db.select().from(sessions).where(sql`${sessions.id} = ${msg.sessionId}`).limit(1);
      const session = sessionResult.length > 0 ? sessionResult[0] : null;
      
      const metadata = {
        sessionId: msg.sessionId,
        role: msg.role,
        timestamp: msg.timestamp.getTime(),
        isTestData: session?.isTestData || false,
        v_e: (msg as any).v_e || 0.0,
        tokens: (msg as any).tokenCount || 0
      };
      return safeIndexMessage(msg.id, msg.content, metadata);
    }));

    processed += batch.length;
    offset += BATCH_SIZE;
    process.stdout.write(`\r⏳ Restoring: ${Math.round(processed/count*100)}%`);
  }
  console.log('\n✅ LAZARUS COMPLETE.');
  process.exit(0);
}
main();
