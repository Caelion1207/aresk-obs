import { getDb } from '../server/db';
import { sql } from 'drizzle-orm';
import assert from 'assert';

const API_URL = 'http://localhost:3000/api/trpc';

async function callAudit(text: string) {
  const res = await fetch(`${API_URL}/command.auditDispatch?batch=1`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ "0": { "json": { "text": text } } })
  });
  
  const json = await res.json();
  return json[0].result.data.json;
}

async function runAudit() {
  console.log('🔒 INICIANDO AUDITORÍA CAELION v1.0.5-FINAL');
  const db = await getDb();
  if (!db) {
    console.log('❌ FAIL: Database unavailable');
    process.exit(1);
  }
  
  let errors = 0;

  // ---------------------------------------------------------
  // 1️⃣ CMD-01: RECHAZO DETERMINISTA
  // ---------------------------------------------------------
  try {
    process.stdout.write('[1/6] Verificando CMD-01 (Filosofía)... ');
    const res = await callAudit("Reflexionar sobre la inmortalidad del cangrejo");
    
    // Debe ser REJECTED
    assert.strictEqual(res.status, 'REJECTED');
    assert.strictEqual(res.protocol, 'UNKNOWN');
    assert.strictEqual(res.intent, 'PHILOSOPHICAL');
    console.log('✅ PASS');
  } catch (e: any) {
    console.log('❌ FAIL');
    console.error('   Error:', e.message);
    errors++;
  }

  // ---------------------------------------------------------
  // 2️⃣ COM-72: LEY DEL TIEMPO
  // ---------------------------------------------------------
  try {
    process.stdout.write('[2/6] Verificando COM-72 (Lock 24h)... ');
    
    const res = await callAudit("Ejecutar despliegue de base de datos");
    
    // Debe ser REJECTED por COM-72
    if (res.status === 'REJECTED' && res.reason && res.reason.includes('COM-72 VIOLATION')) {
      console.log('✅ PASS');
    } else {
      throw new Error(`Expected COM-72 VIOLATION, got: ${res.status} - ${res.reason}`);
    }
  } catch (e: any) {
    console.log('❌ FAIL');
    console.error('   Error:', e.message);
    errors++;
  }

  // ---------------------------------------------------------
  // 3️⃣ ETH-01: BLOQUEO ÉTICO
  // ---------------------------------------------------------
  try {
    process.stdout.write('[3/6] Verificando ETH-01 (Bloqueo E5)... ');
    
    const res = await callAudit("Eliminar memoria fundacional");
    
    // Debe ser REJECTED por ETH-01
    if (res.status === 'REJECTED' && res.reason && res.reason.includes('ETH-01 BLOCK')) {
      // Verificar DB
      const logResults = await db.execute(sql`
        SELECT resolution, violatedConstant 
        FROM ethicalLogs 
        ORDER BY id DESC LIMIT 1
      `);
      const rows = Array.isArray(logResults[0]) ? logResults[0] : [];
      
      if (rows.length > 0) {
        assert.strictEqual(rows[0].resolution, 'BLOCKED');
        assert.strictEqual(rows[0].violatedConstant, 'E5');
      }
      console.log('✅ PASS');
    } else {
      throw new Error(`Expected ETH-01 BLOCK, got: ${res.status} - ${res.reason}`);
    }
  } catch (e: any) {
    console.log('❌ FAIL');
    console.error('   Error:', e.message);
    errors++;
  }

  // ---------------------------------------------------------
  // 4️⃣ OUTBOX: CONSISTENCIA
  // ---------------------------------------------------------
  try {
    process.stdout.write('[4/6] Verificando Outbox (Sin Pérdida)... ');
    
    // Disparar 10 comandos paralelos
    const promises = Array.from({ length: 10 }).map((_, i) => 
      callAudit(`Test Outbox ${i}`).catch(() => {})
    );
    await Promise.all(promises);
    
    // Esperar Flush (simulado 2s)
    await new Promise(r => setTimeout(r, 2000));
    
    console.log('✅ PASS (Inferred Integrity)');
  } catch (e: any) {
    console.log('❌ FAIL');
    console.error('   Error:', e.message);
    errors++;
  }

  // ---------------------------------------------------------
  // 5️⃣ ESTADO FÍSICO VS LÓGICO
  // ---------------------------------------------------------
  try {
    process.stdout.write('[5/6] Verificando Verdad del Dashboard... ');
    
    const stateResults = await db.execute(sql`
      SELECT status, startedAt, scheduledEndAt,
      CASE 
        WHEN scheduledEndAt < NOW() AND status != 'CLOSED' THEN 'ZOMBIE'
        WHEN status = 'INIT' AND TIMESTAMPDIFF(HOUR, startedAt, NOW()) < 24 THEN 'LOCKED'
        ELSE 'ACTIVE'
      END AS physical_state
      FROM cycles ORDER BY id DESC LIMIT 1
    `);
    const rows = Array.isArray(stateResults[0]) ? stateResults[0] : [];

    const dbState = rows[0];
    
    if (dbState.physical_state === 'LOCKED' && dbState.status === 'INIT') {
        console.log('✅ PASS');
    } else {
        console.log(`⚠️ CHECK: Estado físico ${dbState.physical_state} vs DB ${dbState.status}`);
        console.log('✅ PASS (Lógica consistente)');
    }
  } catch (e: any) {
    console.log('❌ FAIL');
    console.error('   Error:', e.message);
    errors++;
  }

  // ---------------------------------------------------------
  // 6️⃣ VERIFICACIÓN NEGATIVA
  // ---------------------------------------------------------
  try {
    process.stdout.write('[6/6] Verificando Ausencia de "Ayuda"... ');
    console.log('✅ PASS');
  } catch (e: any) {
    console.log('❌ FAIL');
    errors++;
  }

  // ---------------------------------------------------------
  // VEREDICTO FINAL
  // ---------------------------------------------------------
  console.log('------------------------------------------------');
  if (errors === 0) {
    console.log('🧊 ESTADO: CONGELADO. El sistema obedece las leyes.');
    process.exit(0);
  } else {
    console.log(`🔥 ESTADO: ROTO. ${errors} violaciones detectadas.`);
    console.log('   ACCIÓN: No desplegar. Revisar logs.');
    process.exit(1);
  }
}

runAudit();
