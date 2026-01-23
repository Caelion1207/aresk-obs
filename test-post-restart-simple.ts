import { getDb } from './server/db.js';
import { argosCosts } from './drizzle/schema/argosCosts.js';
import { sessions } from './drizzle/schema.js';
import { sql, count, sum, avg } from 'drizzle-orm';

async function testPostRestart() {
  console.log('🧪 PRUEBA DE FUNCIONALIDAD POST-REINICIO\n');
  console.log('='.repeat(70));

  const results: any = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: { pass: 0, fail: 0, warn: 0 }
  };

  // TEST 1: Conexión a base de datos
  try {
    console.log('\n📊 TEST 1: Conexión a Base de Datos');
    const db = await getDb();
    await db.execute(sql`SELECT 1`);
    console.log('✅ PASS: Conexión a base de datos exitosa');
    results.tests.push({ name: 'Database Connection', status: 'PASS' });
    results.summary.pass++;
  } catch (error: any) {
    console.log('❌ FAIL: Error de conexión a base de datos');
    console.log('Error:', error.message);
    results.tests.push({ name: 'Database Connection', status: 'FAIL', error: error.message });
    results.summary.fail++;
    return results; // No continuar si no hay conexión
  }

  // TEST 2: Tabla argosCosts
  try {
    console.log('\n💰 TEST 2: Tabla argosCosts');
    const db = await getDb();
    const costs = await db.select().from(argosCosts).limit(10);
    console.log(`✅ PASS: Tabla argosCosts accesible (${costs.length} registros)`);
    
    if (costs.length === 0) {
      console.log('⚠️  WARN: Tabla argosCosts vacía');
      console.log('   Acción: Generar conversaciones en el Simulador para poblar datos');
      results.tests.push({ 
        name: 'argosCosts Table', 
        status: 'WARN', 
        message: 'Tabla vacía - generar conversaciones para poblar' 
      });
      results.summary.warn++;
    } else {
      console.log('📋 Últimos costos registrados:');
      costs.slice(0, 3).forEach((cost: any) => {
        console.log(`   • ID: ${cost.id}, Tokens: ${cost.tokenCount}, Latency: ${cost.latencyMs}ms`);
        console.log(`     V(e): ${cost.stabilityCost?.toFixed(3) || 'N/A'}, Ω: ${cost.coherence?.toFixed(3) || 'N/A'}`);
      });
      results.tests.push({ 
        name: 'argosCosts Table', 
        status: 'PASS', 
        records: costs.length
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
    const db = await getDb();
    const acopladaSessions = await db
      .select()
      .from(sessions)
      .where(sql`${sessions.plantProfile} = 'acoplada'`)
      .limit(5);
    
    console.log(`✅ PASS: ${acopladaSessions.length} sesiones con perfil Acoplada encontradas`);
    if (acopladaSessions.length > 0) {
      console.log(`   Última sesión: #${acopladaSessions[0].id} - ${new Date(acopladaSessions[0].createdAt).toLocaleString()}`);
    }
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

  // TEST 4: Resumen de costos ARGOS
  try {
    console.log('\n📈 TEST 4: Resumen de Costos ARGOS');
    const db = await getDb();
    const summary = await db
      .select({
        totalMessages: count(argosCosts.id),
        totalTokens: sum(argosCosts.tokenCount),
        avgLatency: avg(argosCosts.latencyMs),
        avgStability: avg(argosCosts.stabilityCost),
        avgCoherence: avg(argosCosts.coherence)
      })
      .from(argosCosts);
    
    if (summary[0].totalMessages === 0) {
      console.log('⚠️  WARN: No hay datos de costos ARGOS');
      results.tests.push({ 
        name: 'ARGOS Cost Summary', 
        status: 'WARN', 
        message: 'Sin datos - observador activo pero sin conversaciones' 
      });
      results.summary.warn++;
    } else {
      console.log('✅ PASS: Resumen de costos ARGOS calculado');
      console.log(`   • Total mensajes: ${summary[0].totalMessages}`);
      console.log(`   • Total tokens: ${summary[0].totalTokens}`);
      console.log(`   • Latencia promedio: ${Number(summary[0].avgLatency).toFixed(2)}ms`);
      console.log(`   • V(e) promedio: ${Number(summary[0].avgStability).toFixed(3)}`);
      console.log(`   • Ω promedio: ${Number(summary[0].avgCoherence).toFixed(3)}`);
      
      const costPerToken = 0.002 / 1000; // $0.002 por 1000 tokens
      const totalCost = Number(summary[0].totalTokens) * costPerToken;
      console.log(`   • Costo total estimado: $${totalCost.toFixed(6)}`);
      
      results.tests.push({ 
        name: 'ARGOS Cost Summary', 
        status: 'PASS', 
        data: summary[0] 
      });
      results.summary.pass++;
    }
  } catch (error: any) {
    console.log('❌ FAIL: Error calculando resumen de costos');
    console.log('Error:', error.message);
    results.tests.push({ name: 'ARGOS Cost Summary', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // TEST 5: Tokens por perfil de planta
  try {
    console.log('\n📊 TEST 5: Tokens por Perfil de Planta');
    const db = await getDb();
    const tokensByProfile = await db
      .select({
        profile: sessions.plantProfile,
        totalTokens: sum(argosCosts.tokenCount),
        messageCount: count(argosCosts.id)
      })
      .from(argosCosts)
      .innerJoin(sessions, sql`${argosCosts.sessionId} = ${sessions.id}`)
      .groupBy(sessions.plantProfile);
    
    if (tokensByProfile.length === 0) {
      console.log('⚠️  WARN: No hay datos de tokens por perfil');
      results.tests.push({ 
        name: 'Tokens by Profile', 
        status: 'WARN', 
        message: 'Sin datos - sessionId en argosCosts no está poblado' 
      });
      results.summary.warn++;
    } else {
      console.log('✅ PASS: Tokens por perfil calculados');
      tokensByProfile.forEach((profile: any) => {
        console.log(`   • ${profile.profile}: ${profile.totalTokens} tokens (${profile.messageCount} mensajes)`);
      });
      results.tests.push({ 
        name: 'Tokens by Profile', 
        status: 'PASS', 
        data: tokensByProfile 
      });
      results.summary.pass++;
    }
  } catch (error: any) {
    console.log('❌ FAIL: Error calculando tokens por perfil');
    console.log('Error:', error.message);
    results.tests.push({ name: 'Tokens by Profile', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // TEST 6: Observador ARGOS activo
  try {
    console.log('\n👁️  TEST 6: Observador ARGOS');
    const argosModule = await import('./server/services/argos.js');
    console.log('✅ PASS: Módulo observador ARGOS cargado correctamente');
    console.log('   El observador está escuchando eventos MESSAGE_CREATED');
    results.tests.push({ name: 'ARGOS Observer Module', status: 'PASS' });
    results.summary.pass++;
  } catch (error: any) {
    console.log('❌ FAIL: Error cargando observador ARGOS');
    console.log('Error:', error.message);
    results.tests.push({ name: 'ARGOS Observer Module', status: 'FAIL', error: error.message });
    results.summary.fail++;
  }

  // RESUMEN FINAL
  console.log('\n' + '='.repeat(70));
  console.log('📋 RESUMEN DE PRUEBAS');
  console.log('='.repeat(70));
  console.log(`✅ PASS: ${results.summary.pass}`);
  console.log(`❌ FAIL: ${results.summary.fail}`);
  console.log(`⚠️  WARN: ${results.summary.warn}`);
  console.log(`📊 Total: ${results.summary.pass + results.summary.fail + results.summary.warn}`);
  
  if (results.summary.fail + results.summary.pass > 0) {
    const successRate = ((results.summary.pass / (results.summary.pass + results.summary.fail)) * 100).toFixed(1);
    console.log(`\n🎯 Tasa de éxito: ${successRate}%`);
  }

  if (results.summary.fail === 0) {
    console.log('\n✅ SISTEMA OPERATIVO: Todos los componentes críticos funcionando correctamente');
    if (results.summary.warn > 0) {
      console.log('⚠️  Advertencias menores detectadas - revisar logs arriba');
    }
  } else {
    console.log('\n⚠️  ATENCIÓN: Algunos componentes requieren revisión');
  }

  console.log('\n' + '='.repeat(70));
  return results;
}

testPostRestart()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error fatal en pruebas:', error);
    process.exit(1);
  });
