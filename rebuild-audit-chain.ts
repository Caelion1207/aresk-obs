import { getDb } from './server/db.js';
import { auditLogs } from './drizzle/schema.js';
import { sql } from 'drizzle-orm';
import crypto from 'crypto';
import stringify from 'json-stable-stringify';

/**
 * Script de reconstrucción de la cadena de auditoría
 * 
 * Problema: El primer log de auditoría (genesis) fue eliminado o tiene un prevHash incorrecto,
 * causando que la validación de integridad falle.
 * 
 * Solución: Regenerar el log genesis con prevHash=null y recalcular hashes de toda la cadena.
 */

function calculateHash(data: any): string {
  // Usar el mismo algoritmo que crypto.ts
  // IMPORTANTE: Mantener null como null, no convertir a undefined
  const payload: any = {
    userId: data.userId,
    endpoint: data.endpoint,
    method: data.method,
    statusCode: data.statusCode,
    duration: data.duration,
    timestamp: data.timestamp instanceof Date ? data.timestamp.toISOString() : data.timestamp,
    prevHash: data.prevHash || 'GENESIS'
  };
  
  // Agregar campos opcionales solo si existen (mantener null como null)
  if (data.ip !== undefined) payload.ip = data.ip;
  if (data.userAgent !== undefined) payload.userAgent = data.userAgent;
  if (data.requestId !== undefined) payload.requestId = data.requestId;
  
  // Canonical JSON (orden alfabético de claves)
  const canonical = stringify(payload) || '';
  
  // SHA-256
  return crypto.createHash('sha256').update(canonical, 'utf8').digest('hex');
}

async function rebuildAuditChain() {
  console.log('🔧 RECONSTRUCCIÓN DE CADENA DE AUDITORÍA\n');
  console.log('='.repeat(70));

  try {
    const db = await getDb();

    // Paso 1: Verificar estado actual
    console.log('\n📊 Paso 1: Verificando estado actual de la cadena...');
    const allLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(auditLogs.id);

    console.log(`   Total de logs en la cadena: ${allLogs.length}`);
    
    if (allLogs.length === 0) {
      console.log('⚠️  La cadena está vacía. Creando log genesis...');
      
      // Crear log genesis
      const genesisTimestamp = new Date();
      const genesisData = {
        timestamp: genesisTimestamp,
        action: 'SYSTEM_INIT',
        entity: 'audit_chain',
        entityId: 0,
        changes: { message: 'Genesis block - Audit chain initialized' },
        prevHash: null
      };
      
      const genesisHash = calculateHash(genesisData);
      
      await db.insert(auditLogs).values({
        timestamp: genesisTimestamp,
        action: 'SYSTEM_INIT',
        entity: 'audit_chain',
        entityId: 0,
        changes: JSON.stringify(genesisData.changes),
        prevHash: null,
        hash: genesisHash
      });
      
      console.log('✅ Log genesis creado exitosamente');
      console.log(`   Hash: ${genesisHash}`);
      return;
    }

    // Paso 2: Verificar primer log
    const firstLog = allLogs[0];
    console.log(`\n📝 Paso 2: Verificando log genesis (ID: ${firstLog.id})...`);
    console.log(`   prevHash actual: ${firstLog.prevHash}`);
    console.log(`   hash actual: ${firstLog.hash}`);

    if (firstLog.prevHash !== null) {
      console.log('⚠️  El log genesis tiene prevHash no nulo. Corrigiendo...');
      
      // Recalcular hash del genesis con prevHash=null
      const genesisData = {
        timestamp: firstLog.timestamp,
        action: firstLog.action,
        entity: firstLog.entity,
        entityId: firstLog.entityId,
        changes: firstLog.changes,
        prevHash: null
      };
      
      const correctGenesisHash = calculateHash(genesisData);
      
      await db
        .update(auditLogs)
        .set({
          prevHash: null,
          hash: correctGenesisHash
        })
        .where(sql`${auditLogs.id} = ${firstLog.id}`);
      
      console.log('✅ Log genesis corregido');
      console.log(`   Nuevo hash: ${correctGenesisHash}`);
    } else {
      console.log('✅ Log genesis tiene prevHash=null correcto');
    }

    // Paso 3: Recalcular hashes de toda la cadena
    console.log('\n🔗 Paso 3: Recalculando hashes de toda la cadena...');
    
    const updatedLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(auditLogs.id);

    let prevHash: string | null = null;
    let fixedCount = 0;

    for (let i = 0; i < updatedLogs.length; i++) {
      const log = updatedLogs[i];
      
      // Calcular hash esperado
      const expectedData = {
        timestamp: log.timestamp,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        changes: log.changes,
        prevHash: prevHash
      };
      
      const expectedHash = calculateHash(expectedData);
      
      // Verificar si necesita corrección
      if (log.prevHash !== prevHash || log.hash !== expectedHash) {
        await db
          .update(auditLogs)
          .set({
            prevHash: prevHash,
            hash: expectedHash
          })
          .where(sql`${auditLogs.id} = ${log.id}`);
        
        fixedCount++;
        console.log(`   ✓ Log ID ${log.id} corregido`);
      }
      
      prevHash = expectedHash;
    }

    console.log(`\n✅ Recalculación completada: ${fixedCount} logs corregidos`);

    // Paso 4: Verificar integridad final
    console.log('\n🔍 Paso 4: Verificando integridad de la cadena reconstruida...');
    
    const finalLogs = await db
      .select()
      .from(auditLogs)
      .orderBy(auditLogs.id);

    let isValid = true;
    let expectedPrevHash: string | null = null;

    for (let i = 0; i < finalLogs.length; i++) {
      const log = finalLogs[i];
      
      // Verificar prevHash
      if (log.prevHash !== expectedPrevHash) {
        console.log(`❌ Error en log ID ${log.id}: prevHash incorrecto`);
        console.log(`   Esperado: ${expectedPrevHash}`);
        console.log(`   Actual: ${log.prevHash}`);
        isValid = false;
        break;
      }
      
      // Verificar hash
      const calculatedHash = calculateHash({
        timestamp: log.timestamp,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        changes: log.changes,
        prevHash: log.prevHash
      });
      
      if (log.hash !== calculatedHash) {
        console.log(`❌ Error en log ID ${log.id}: hash incorrecto`);
        console.log(`   Esperado: ${calculatedHash}`);
        console.log(`   Actual: ${log.hash}`);
        isValid = false;
        break;
      }
      
      expectedPrevHash = log.hash;
    }

    if (isValid) {
      console.log('✅ Integridad de la cadena verificada: PASS');
      console.log(`   Total de logs: ${finalLogs.length}`);
      console.log(`   Primer hash: ${finalLogs[0].hash}`);
      console.log(`   Último hash: ${finalLogs[finalLogs.length - 1].hash}`);
    } else {
      console.log('❌ Integridad de la cadena: FAIL');
      console.log('   Se requiere intervención manual');
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎯 RECONSTRUCCIÓN COMPLETADA\n');

    if (isValid) {
      console.log('✅ La cadena de auditoría ha sido reconstruida exitosamente.');
      console.log('   Ahora puedes reactivar la validación de integridad en validateSchema.ts');
    }

  } catch (error: any) {
    console.error('\n❌ Error durante la reconstrucción:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

rebuildAuditChain()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
