import { getDb, getArgosCostsSummary, getTokensByProfile } from './server/db.js';
import { argosCosts } from './drizzle/schema/argosCosts.js';
import { sessions } from './drizzle/schema.js';
import { sql } from 'drizzle-orm';

async function testPostRestart() {
  console.log('🧪 PRUEBA DE FUNCIONALIDAD POST-REINICIO\n');
  console.log('='.repeat(60));

  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { pass: 0, fail: 0, warn: 0 }
  };

  // TEST 1: Conexión a base de datos
  try {
    console.log('\n📊 TEST 1: Conexión a Base de Datos');
    const dbInstance = await getDb();
    await dbInstance.execute(sql`SELECT 1`);
    console.log('✅ PASS: Conexión a base de datos exitosa');
    results.tests.push({ name: 'Database Connection', status: 'PASS' });
    results.summary.pass++;
  } catch (error: any) {
    console.log('❌ FAIL: Error de conexión a base de datos');
    console.log('Error:', error.message);
    results.tests.push({ name: 'Database Connection', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // TEST 2: Tabla argosCosts
  try {
    console.log('\n💰 TEST 2: Tabla argosCosts');
    const dbInstance = await getDb();
    const costs = await dbInstance.select().from(argosCosts).limit(10);
    console.log(`✅ PASS: Tabla argosCosts accesible (${costs.length} registros)`);
    
    if (costs.length === 0) {
      console.log('⚠️  WARN: Tabla argosCosts vacía (esperado si no hay conversaciones recientes)');
      results.tests.push({ 
        name: 'argosCosts Table', 
        status: 'WARN', 
        message: 'Tabla vacía - generar conversaciones para poblar' 
      });
      results.summary.warn++;
    } else {
      console.log('Últimos costos registrados:');
      costs.slice(0, 3).forEach((cost: any) => {
        console.log(`  - ID: ${cost.id}, Tokens: ${cost.tokenCount}, Latency: ${cost.latencyMs}ms, V(e): ${cost.stabilityCost}, Ω: ${cost.coherence}`);
      });
      results.tests.push({ 
        name: 'argosCosts Table', 
        status: 'PASS', 
        records: costs.length,
        sample: costs[0]
      });
      results.summary.pass++;
    }
  } catch (error: any) {
    console.log('❌ FAIL: Error accediendo tabla argosCosts');
    console.log('Error:', error.message);
    results.tests.push({ name: 'argosCosts Table', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // TEST 3: Sesiones con perfil Acoplada
  try {
    console.log('\n🔗 TEST 3: Sesiones con Perfil Acoplada');
    const dbInstance = await getDb();
    const acopladaSessions = await dbInstance
      .select()
      .from(sessions)
      .where(sql`${sessions.plantProfile} = 'acoplada'`)
      .limit(5);
    
    console.log(`✅ PASS: ${acopladaSessions.length} sesiones con perfil Acoplada encontradas`);
    results.tests.push({ 
      name: 'Acoplada Sessions', 
      status: 'PASS', 
      count: acopladaSessions.length 
    });
    results.summary.pass++;
  } catch (error: any) {
    console.log('❌ FAIL: Error consultando sesiones');
    console.log('Error:', error.message);
    results.tests.push({ name: 'Acoplada Sessions', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // TEST 4: Observador ARGOS activo
  try {
    console.log('\n👁️  TEST 4: Observador ARGOS');
    // Verificar que el módulo de observador existe y está cargado
    const argosModule = await import('./server/services/argos.js');
    console.log('✅ PASS: Módulo observador ARGOS cargado correctamente');
    results.tests.push({ name: 'ARGOS Observer Module', status: 'PASS' });
    results.summary.pass++;
  } catch (error: any) {
    console.log('❌ FAIL: Error cargando observador ARGOS');
    console.log('Error:', error.message);
    results.tests.push({ name: 'ARGOS Observer Module', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // TEST 5: Endpoint argos.getSummary
  try {
    console.log('\n📡 TEST 5: Endpoint argos.getSummary');
    const summary = await getArgosCostsSummary();
    console.log('✅ PASS: Endpoint argos.getSummary funcional');
    console.log(`  - Total de mensajes: ${summary.totalMessages}`);
    console.log(`  - Tokens totales: ${summary.totalTokens}`);
    console.log(`  - Costo por mensaje: $${summary.costPerMessage.toFixed(6)}`);
    console.log(`  - Costo total de estabilidad: $${summary.totalStabilityCost.toFixed(6)}`);
    results.tests.push({ 
      name: 'argos.getSummary Endpoint', 
      status: 'PASS', 
      data: summary 
    });
    results.summary.pass++;
  } catch (error: any) {
    console.log('❌ FAIL: Error en endpoint argos.getSummary');
    console.log('Error:', error.message);
    results.tests.push({ name: 'argos.getSummary Endpoint', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // TEST 6: Endpoint argos.getTokensByProfile
  try {
    console.log('\n📊 TEST 6: Endpoint argos.getTokensByProfile');
    const tokensByProfile = await getTokensByProfile();
    console.log('✅ PASS: Endpoint argos.getTokensByProfile funcional');
    tokensByProfile.forEach((profile: any) => {
      console.log(`  - ${profile.profile}: ${profile.totalTokens} tokens`);
    });
    results.tests.push({ 
      name: 'argos.getTokensByProfile Endpoint', 
      status: 'PASS', 
      data: tokensByProfile 
    });
    results.summary.pass++;
  } catch (error: any) {
    console.log('❌ FAIL: Error en endpoint argos.getTokensByProfile');
    console.log('Error:', error.message);
    results.tests.push({ name: 'argos.getTokensByProfile Endpoint', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // RESUMEN FINAL
  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));
  console.log(`✅ PASS: ${results.summary.pass}`);
  console.log(`❌ FAIL: ${results.summary.fail}`);
  console.log(`⚠️  WARN: ${results.summary.warn}`);
  console.log(`📊 Total: ${results.summary.pass + results.summary.fail + results.summary.warn}`);
  
  const successRate = ((results.summary.pass / (results.summary.pass + results.summary.fail)) * 100).toFixed(1);
  console.log(`\n🎯 Tasa de éxito: ${successRate}%`);

  if (results.summary.fail === 0) {
    console.log('\n✅ SISTEMA OPERATIVO: Todos los componentes críticos funcionando correctamente');
  } else {
    console.log('\n⚠️  ATENCIÓN: Algunos componentes requieren revisión');
  }

  return results;
}

testPostRestart()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error fatal en pruebas:', error);
    process.exit(1);
  });
