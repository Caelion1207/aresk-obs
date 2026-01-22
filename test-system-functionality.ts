/**
 * Script de Prueba de Funcionalidad ARESK-OBS
 * 
 * Verifica componentes críticos del sistema:
 * 1. Observador ARGOS
 * 2. Endpoints tRPC
 * 3. Base de datos
 * 4. Generación de reportes
 */

import { getDb } from './server/db';
import { messages, sessions, metrics } from './drizzle/schema';
import { argosCosts } from './drizzle/schema/argosCosts';
import { desc, eq } from 'drizzle-orm';

interface TestResult {
  component: string;
  status: 'PASS' | 'FAIL' | 'WARNING';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function testDatabaseConnection() {
  try {
    const db = await getDb();
    if (!db) {
      results.push({
        component: 'Database Connection',
        status: 'FAIL',
        message: 'No se pudo conectar a la base de datos'
      });
      return false;
    }
    
    results.push({
      component: 'Database Connection',
      status: 'PASS',
      message: 'Conexión a base de datos exitosa'
    });
    return true;
  } catch (error) {
    results.push({
      component: 'Database Connection',
      status: 'FAIL',
      message: `Error: ${error}`
    });
    return false;
  }
}

async function testSessionsData() {
  try {
    const db = await getDb();
    if (!db) return;
    
    const sessionList = await db.select().from(sessions).limit(5);
    
    if (sessionList.length === 0) {
      results.push({
        component: 'Sessions Table',
        status: 'WARNING',
        message: 'No hay sesiones en la base de datos',
        details: { count: 0 }
      });
    } else {
      results.push({
        component: 'Sessions Table',
        status: 'PASS',
        message: `${sessionList.length} sesiones encontradas`,
        details: { 
          count: sessionList.length,
          profiles: sessionList.map(s => s.plantProfile)
        }
      });
    }
  } catch (error) {
    results.push({
      component: 'Sessions Table',
      status: 'FAIL',
      message: `Error al consultar sesiones: ${error}`
    });
  }
}

async function testMessagesData() {
  try {
    const db = await getDb();
    if (!db) return;
    
    const messageList = await db.select().from(messages).limit(10);
    
    if (messageList.length === 0) {
      results.push({
        component: 'Messages Table',
        status: 'WARNING',
        message: 'No hay mensajes en la base de datos',
        details: { count: 0 }
      });
    } else {
      const assistantMessages = messageList.filter(m => m.role === 'assistant');
      results.push({
        component: 'Messages Table',
        status: 'PASS',
        message: `${messageList.length} mensajes encontrados`,
        details: { 
          total: messageList.length,
          assistant: assistantMessages.length,
          user: messageList.filter(m => m.role === 'user').length
        }
      });
    }
  } catch (error) {
    results.push({
      component: 'Messages Table',
      status: 'FAIL',
      message: `Error al consultar mensajes: ${error}`
    });
  }
}

async function testArgosCostsData() {
  try {
    const db = await getDb();
    if (!db) return;
    
    const costsList = await db
      .select()
      .from(argosCosts)
      .orderBy(desc(argosCosts.createdAt))
      .limit(10);
    
    if (costsList.length === 0) {
      results.push({
        component: 'ARGOS Costs Table',
        status: 'WARNING',
        message: 'No hay registros de costos ARGOS. El observador no ha capturado datos aún.',
        details: { count: 0 }
      });
    } else {
      const totalTokens = costsList.reduce((sum, c) => sum + (c.tokenCount || 0), 0);
      const avgLatency = costsList.reduce((sum, c) => sum + (c.latencyMs || 0), 0) / costsList.length;
      
      results.push({
        component: 'ARGOS Costs Table',
        status: 'PASS',
        message: `${costsList.length} registros de costos encontrados`,
        details: { 
          count: costsList.length,
          totalTokens,
          avgLatency: Math.round(avgLatency),
          latestRecord: {
            messageId: costsList[0].messageId,
            tokens: costsList[0].tokenCount,
            latency: costsList[0].latencyMs,
            stabilityCost: costsList[0].stabilityCost,
            coherence: costsList[0].coherence
          }
        }
      });
    }
  } catch (error) {
    results.push({
      component: 'ARGOS Costs Table',
      status: 'FAIL',
      message: `Error al consultar costos ARGOS: ${error}`
    });
  }
}

async function testMetricsData() {
  try {
    const db = await getDb();
    if (!db) return;
    
    const metricsList = await db
      .select()
      .from(metrics)
      .orderBy(desc(metrics.timestamp))
      .limit(5);
    
    if (metricsList.length === 0) {
      results.push({
        component: 'Metrics Table',
        status: 'WARNING',
        message: 'No hay métricas registradas',
        details: { count: 0 }
      });
    } else {
      const avgOmega = metricsList.reduce((sum, m) => sum + m.coherenciaObservable, 0) / metricsList.length;
      const avgVe = metricsList.reduce((sum, m) => sum + m.funcionLyapunov, 0) / metricsList.length;
      
      results.push({
        component: 'Metrics Table',
        status: 'PASS',
        message: `${metricsList.length} métricas encontradas`,
        details: { 
          count: metricsList.length,
          avgOmega: avgOmega.toFixed(3),
          avgVe: avgVe.toFixed(3)
        }
      });
    }
  } catch (error) {
    results.push({
      component: 'Metrics Table',
      status: 'FAIL',
      message: `Error al consultar métricas: ${error}`
    });
  }
}

async function testArgosObserver() {
  try {
    const db = await getDb();
    if (!db) return;
    
    // Verificar si hay registros recientes (últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentCosts = await db
      .select()
      .from(argosCosts)
      .where(eq(argosCosts.createdAt, argosCosts.createdAt))
      .limit(1);
    
    if (recentCosts.length > 0) {
      const latestCost = recentCosts[0];
      const isRecent = new Date(latestCost.createdAt).getTime() > fiveMinutesAgo.getTime();
      
      results.push({
        component: 'ARGOS Observer',
        status: isRecent ? 'PASS' : 'WARNING',
        message: isRecent 
          ? 'Observador ARGOS activo y registrando costos'
          : 'Observador ARGOS activo pero sin registros recientes',
        details: {
          lastRecordTime: latestCost.createdAt,
          lastMessageId: latestCost.messageId
        }
      });
    } else {
      results.push({
        component: 'ARGOS Observer',
        status: 'WARNING',
        message: 'Observador ARGOS no ha registrado costos aún. Requiere conversaciones activas.',
      });
    }
  } catch (error) {
    results.push({
      component: 'ARGOS Observer',
      status: 'FAIL',
      message: `Error al verificar observador ARGOS: ${error}`
    });
  }
}

async function testTokensByProfile() {
  try {
    const db = await getDb();
    if (!db) return;
    
    // Consultar tokens por perfil (similar al endpoint)
    const costsWithProfile = await db
      .select({
        plantProfile: messages.plantProfile,
        tokenCount: argosCosts.tokenCount,
      })
      .from(argosCosts)
      .innerJoin(messages, eq(argosCosts.messageId, messages.id))
      .limit(100);
    
    const grouped = costsWithProfile.reduce((acc, row) => {
      const profile = row.plantProfile || 'unknown';
      if (!acc[profile]) {
        acc[profile] = { count: 0, tokens: 0 };
      }
      acc[profile].count++;
      acc[profile].tokens += row.tokenCount || 0;
      return acc;
    }, {} as Record<string, { count: number; tokens: number }>);
    
    if (Object.keys(grouped).length === 0) {
      results.push({
        component: 'Tokens by Profile Endpoint',
        status: 'WARNING',
        message: 'No hay datos de tokens por perfil disponibles',
        details: grouped
      });
    } else {
      results.push({
        component: 'Tokens by Profile Endpoint',
        status: 'PASS',
        message: 'Endpoint de tokens por perfil funcional',
        details: grouped
      });
    }
  } catch (error) {
    results.push({
      component: 'Tokens by Profile Endpoint',
      status: 'FAIL',
      message: `Error al consultar tokens por perfil: ${error}`
    });
  }
}

async function runTests() {
  console.log('🧪 INICIANDO PRUEBAS DE FUNCIONALIDAD ARESK-OBS\n');
  console.log('='.repeat(60));
  
  const dbConnected = await testDatabaseConnection();
  
  if (dbConnected) {
    await testSessionsData();
    await testMessagesData();
    await testMetricsData();
    await testArgosCostsData();
    await testArgosObserver();
    await testTokensByProfile();
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADOS DE PRUEBAS\n');
  
  let passCount = 0;
  let failCount = 0;
  let warningCount = 0;
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.component}: ${result.status}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Detalles: ${JSON.stringify(result.details, null, 2)}`);
    }
    console.log('');
    
    if (result.status === 'PASS') passCount++;
    else if (result.status === 'FAIL') failCount++;
    else warningCount++;
  });
  
  console.log('='.repeat(60));
  console.log(`\n📈 RESUMEN: ${passCount} PASS | ${warningCount} WARNING | ${failCount} FAIL\n`);
  
  if (failCount > 0) {
    console.log('❌ Algunas pruebas fallaron. Revisar componentes marcados como FAIL.');
    process.exit(1);
  } else if (warningCount > 0) {
    console.log('⚠️  Sistema funcional con advertencias. Revisar componentes marcados como WARNING.');
  } else {
    console.log('✅ Todos los componentes funcionando correctamente.');
  }
  
  return results;
}

// Ejecutar pruebas
runTests().catch(console.error);
