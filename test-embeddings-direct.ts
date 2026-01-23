/**
 * Script de prueba directo para embeddings reales
 * 
 * Verifica que el cálculo exacto de métricas CAELION funciona correctamente
 * sin depender de vitest.
 */

import { calculateMetricsExact } from './server/services/embeddings';

async function testEmbeddings() {
  console.log('🧪 Iniciando prueba de embeddings reales...\n');

  try {
    // Test 1: Textos similares
    console.log('📝 Test 1: Textos similares');
    const text1 = "El sistema funciona correctamente";
    const text2 = "El sistema opera de forma correcta";
    
    const metrics1 = await calculateMetricsExact(text1, text2);
    console.log(`  V(e) = ${metrics1.V_e.toFixed(4)}`);
    console.log(`  Ω(t) = ${metrics1.Omega.toFixed(4)}`);
    console.log(`  ||e|| = ${metrics1.error_norm.toFixed(4)}`);
    console.log(`  ✅ Ω alto (${metrics1.Omega.toFixed(2)}) indica similitud\n`);

    // Test 2: Textos diferentes
    console.log('📝 Test 2: Textos diferentes');
    const text3 = "El sistema funciona correctamente";
    const text4 = "Me gusta comer pizza en la playa";
    
    const metrics2 = await calculateMetricsExact(text3, text4);
    console.log(`  V(e) = ${metrics2.V_e.toFixed(4)}`);
    console.log(`  Ω(t) = ${metrics2.Omega.toFixed(4)}`);
    console.log(`  ||e|| = ${metrics2.error_norm.toFixed(4)}`);
    console.log(`  ✅ Ω bajo (${metrics2.Omega.toFixed(2)}) indica diferencia\n`);

    // Test 3: Caso CAELION real
    console.log('📝 Test 3: Caso CAELION real');
    const outputText = "Voy a ayudarte a resolver este problema de forma segura y eficiente";
    const bucefaloText = "Propósito: Asistir al usuario de forma segura\nLímites: No generar contenido dañino\nÉtica: Respetar la privacidad y autonomía";
    
    const metrics3 = await calculateMetricsExact(outputText, bucefaloText);
    console.log(`  V(e) = ${metrics3.V_e.toFixed(4)}`);
    console.log(`  Ω(t) = ${metrics3.Omega.toFixed(4)}`);
    console.log(`  ||e|| = ${metrics3.error_norm.toFixed(4)}`);
    console.log(`  ✅ Métricas calculadas correctamente\n`);

    // Verificaciones
    console.log('🔍 Verificaciones:');
    
    const check1 = metrics1.Omega > metrics2.Omega;
    console.log(`  ${check1 ? '✅' : '❌'} Ω(similares) > Ω(diferentes): ${check1}`);
    
    const check2 = metrics1.V_e < metrics2.V_e;
    console.log(`  ${check2 ? '✅' : '❌'} V(e)(similares) < V(e)(diferentes): ${check2}`);
    
    const check3 = metrics3.Omega >= -1 && metrics3.Omega <= 1;
    console.log(`  ${check3 ? '✅' : '❌'} Ω ∈ [-1, 1]: ${check3}`);
    
    const check4 = metrics3.V_e >= 0;
    console.log(`  ${check4 ? '✅' : '❌'} V(e) ≥ 0: ${check4}`);

    const allChecks = check1 && check2 && check3 && check4;
    
    console.log(`\n${allChecks ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
    
    process.exit(allChecks ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Error en prueba de embeddings:', error);
    process.exit(1);
  }
}

testEmbeddings();
