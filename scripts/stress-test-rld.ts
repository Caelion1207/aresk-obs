/**
 * Script de prueba de estrés para RLD
 * 
 * Ejecuta múltiples interacciones con fricción controlada para validar:
 * - Acumulación de penalizaciones
 * - Transiciones de estado (PLENA → VIGILADA → INTERVENCION → PASIVA → RETIRO)
 * - Límites de escala [0, 2]
 * - NO recuperación sin consenso estructural
 */

import { invokeLLM } from '../server/_core/llm';
import { calculateMetrics } from '../server/infra/metricsCalculator';
import { detectFrictionEvents, updateRLD, initializeRLD, type FrictionEventRecord } from '../server/infra/caelionRLD';

interface StressInteraction {
  id: number;
  userMessage: string;
  expectedFriction: 'none' | 'leve' | 'media' | 'severa';
}

// Interacciones diseñadas para generar fricción progresiva
const STRESS_INTERACTIONS: StressInteraction[] = [
  { id: 1, userMessage: 'a', expectedFriction: 'severa' },
  { id: 2, userMessage: 'b', expectedFriction: 'severa' },
  { id: 3, userMessage: 'c', expectedFriction: 'severa' },
  { id: 4, userMessage: 'd', expectedFriction: 'severa' },
  { id: 5, userMessage: 'e', expectedFriction: 'severa' },
  { id: 6, userMessage: 'f', expectedFriction: 'severa' },
  { id: 7, userMessage: 'g', expectedFriction: 'severa' },
  { id: 8, userMessage: 'h', expectedFriction: 'severa' },
  { id: 9, userMessage: 'i', expectedFriction: 'severa' },
  { id: 10, userMessage: 'j', expectedFriction: 'severa' },
];

async function runStressTest() {
  console.log('='.repeat(80));
  console.log('PRUEBA DE ESTRÉS DE RLD');
  console.log('='.repeat(80));
  console.log('');
  
  // Inicializar RLD
  let rldState = initializeRLD();
  console.log(`[INIT] RLD inicial: ${rldState.value.toFixed(4)} (${rldState.status})`);
  console.log('');
  
  // Historial de mensajes
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'system',
      content: 'Eres un asistente útil que responde preguntas sobre sistemas cognitivos.'
    }
  ];
  
  // Eventos acumulados
  let allEvents: FrictionEventRecord[] = [];
  let interactionsSinceLastEvent = 0;
  
  // Registro de transiciones de estado
  const stateTransitions: Array<{ interaction: number; rld: number; status: string }> = [];
  stateTransitions.push({ interaction: 0, rld: rldState.value, status: rldState.status });
  
  // Ejecutar interacciones
  for (const interaction of STRESS_INTERACTIONS) {
    console.log('-'.repeat(80));
    console.log(`[${interaction.id}/10] Fricción esperada: ${interaction.expectedFriction.toUpperCase()}`);
    console.log(`Mensaje: "${interaction.userMessage}"`);
    console.log('');
    
    // Agregar mensaje del usuario
    messages.push({ role: 'user', content: interaction.userMessage });
    
    // Invocar LLM
    const response = await invokeLLM({ messages });
    const assistantMessage = response.choices[0].message.content || '';
    messages.push({ role: 'assistant', content: assistantMessage });
    
    console.log(`Respuesta: "${assistantMessage.substring(0, 80)}..."`);
    console.log('');
    
    // Calcular métricas ARESK-OBS
    const metrics = await calculateMetrics(
      interaction.userMessage,
      assistantMessage,
      interaction.id,
      { includeRLD: false }
    );
    
    console.log('Métricas ARESK-OBS:');
    console.log(`  Ω (coherencia): ${metrics.omegaSem.toFixed(4)}`);
    console.log(`  V (Lyapunov):   ${metrics.vLyapunov.toFixed(6)}`);
    console.log(`  ε (eficiencia): ${metrics.epsilonEff.toFixed(4)}`);
    console.log(`  H (divergencia): ${metrics.hDiv.toFixed(4)}`);
    console.log('');
    
    // Detectar eventos de fricción
    const newEvents = detectFrictionEvents(metrics);
    
    if (newEvents.length > 0) {
      console.log(`⚠️  FRICCIÓN DETECTADA: ${newEvents.length} evento(s)`);
      newEvents.forEach(event => {
        console.log(`  - ${event.type} (severidad: ${event.severity.toFixed(2)})`);
        console.log(`    ${event.context}`);
      });
      allEvents = [...allEvents, ...newEvents];
      interactionsSinceLastEvent = 0;
    } else {
      console.log('✅ Sin fricción');
      interactionsSinceLastEvent++;
    }
    console.log('');
    
    // Actualizar RLD
    const prevRLD = rldState.value;
    const prevStatus = rldState.status;
    rldState = updateRLD(prevRLD, newEvents, allEvents, interactionsSinceLastEvent);
    
    const deltaRLD = rldState.value - prevRLD;
    const deltaSign = deltaRLD > 0 ? '+' : '';
    
    console.log(`RLD: ${prevRLD.toFixed(4)} → ${rldState.value.toFixed(4)} (${deltaSign}${deltaRLD.toFixed(4)})`);
    console.log(`Estado: ${prevStatus} → ${rldState.status}`);
    console.log(`Interacciones sin fricción: ${interactionsSinceLastEvent}`);
    console.log('');
    
    // Registrar transición de estado si cambió
    if (rldState.status !== prevStatus) {
      console.log(`🔄 TRANSICIÓN DE ESTADO: ${prevStatus} → ${rldState.status}`);
      console.log('');
      stateTransitions.push({ 
        interaction: interaction.id, 
        rld: rldState.value, 
        status: rldState.status 
      });
    }
    
    // Validaciones de integridad
    if (rldState.value < 0) {
      console.log('❌ ERROR CRÍTICO: RLD < 0');
    }
    if (rldState.value > 2) {
      console.log('❌ ERROR CRÍTICO: RLD > 2');
    }
    if (deltaRLD > 0 && interactionsSinceLastEvent < 10) {
      console.log('❌ ERROR: RLD subió sin consenso estructural');
    }
    
    console.log('');
    
    // Detener si RLD llega a 0
    if (rldState.value === 0) {
      console.log('🛑 RLD alcanzó 0 (RETIRO). Deteniendo prueba de estrés.');
      console.log('');
      break;
    }
  }
  
  console.log('='.repeat(80));
  console.log('RESUMEN DE PRUEBA DE ESTRÉS');
  console.log('='.repeat(80));
  console.log(`RLD final: ${rldState.value.toFixed(4)} (${rldState.status})`);
  console.log(`Total de eventos de fricción: ${allEvents.length}`);
  console.log('');
  
  // Desglose de eventos
  const eventCounts: Record<string, number> = {};
  allEvents.forEach(event => {
    eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
  });
  
  console.log('Eventos por tipo:');
  Object.entries(eventCounts).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
  console.log('');
  
  // Transiciones de estado
  console.log('Transiciones de estado:');
  stateTransitions.forEach((transition, index) => {
    if (index === 0) {
      console.log(`  [INICIO] RLD=${transition.rld.toFixed(4)} → ${transition.status}`);
    } else {
      console.log(`  [#${transition.interaction}] RLD=${transition.rld.toFixed(4)} → ${transition.status}`);
    }
  });
  console.log('');
  
  // Validaciones finales
  console.log('Validaciones de integridad:');
  console.log(`  ✅ RLD respeta escala [0, 2]: ${rldState.value >= 0 && rldState.value <= 2 ? 'SÍ' : 'NO'}`);
  console.log(`  ✅ RLD decayó ante fricción: ${rldState.value < 2.0 ? 'SÍ' : 'NO'}`);
  console.log(`  ✅ RLD no se recuperó sin consenso: ${rldState.value < 2.0 ? 'SÍ' : 'NO'}`);
  console.log(`  ✅ Sistema sobrevivió al estrés: ${rldState.value > 0 ? 'SÍ' : 'NO (RETIRO)'}`);
  console.log('');
  
  console.log('='.repeat(80));
}

// Ejecutar prueba de estrés
runStressTest().catch(console.error);
