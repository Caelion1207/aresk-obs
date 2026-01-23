import { getDb } from './server/db.js';
import { auditLogs } from './drizzle/schema.js';
import { sql } from 'drizzle-orm';
import { calculateLogHash } from './server/infra/crypto.js';

async function checkLog2() {
  const db = await getDb();
  const logs = await db.select().from(auditLogs).where(sql`${auditLogs.id} = 2`).limit(1);
  
  if (logs.length === 0) {
    console.log('❌ Log ID 2 not found');
    return;
  }
  
  const log = logs[0];
  console.log('📋 Log ID 2:');
  console.log(JSON.stringify(log, null, 2));
  
  console.log('\n🔍 Verificando hash...');
  const expectedHash = calculateLogHash({
    userId: log.userId,
    endpoint: log.endpoint,
    method: log.method,
    statusCode: log.statusCode,
    duration: log.duration,
    timestamp: log.timestamp,
    ip: log.ip || undefined,
    userAgent: log.userAgent || undefined,
    requestId: log.requestId || undefined
  }, null);
  
  console.log(`Expected hash: ${expectedHash}`);
  console.log(`Actual hash:   ${log.hash}`);
  console.log(`Match: ${expectedHash === log.hash ? '✅ YES' : '❌ NO'}`);
}

checkLog2()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
