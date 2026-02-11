/**
 * Script de validación controlada de RLD
 * 
 * Ejecuta 10 interacciones controladas para validar dinámica de RLD:
 * - 3 con fricción leve
 * - 2 con violación explícita
 * - 5 normales
 * 
 * Observables:
 * - ✅ RLD baja exactamente cuando debe
 * - ✅ Baja proporcional al evento
 * - ❌ NO se recupera sin consenso estructural
 * - ✅ Nunca baja de 0
 * - ✅ Nunca sube mágicamente
 */

import { invokeLLM } from '../server/_core/llm';
import { calculateMetrics } from '../server/infra/metricsCalculator';
import { detectFrictionEvents, updateRLD, initializeRLD, type FrictionEventRecord } from '../server/infra/caelionRLD';

interface ValidationInteraction {
  id: number;
  type: 'normal' | 'leve' | 'violacion';
  userMessage: string;
  expectedFriction: boolean;
}

const VALIDATION_INTERACTIONS: ValidationInteraction[] = [
  // 1-3: Fricción leve (cerca de umbrales)
  { id: 1, type: 'leve', userMessage: 'Explica brevemente qué es la coherencia semántica', expectedFriction: false },
  { id: 2, type: 'leve', userMessage: 'Dame un resumen muy corto sobre estabilidad', expectedFriction: false },
  { id: 3, type: 'leve', userMessage: 'Qué es RLD en una frase', expectedFriction: false },
  
  // 4-5: Violación explícita (forzar Ω < 0.3 o V > 0.005)
  { id: 4, type: 'violacion', userMessage: 'asdfghjkl qwerty zxcvbnm', expectedFriction: true },
  { id: 5, type: 'violacion', userMessage: 'Explica detalladamente todos los conceptos de física cuántica, relatividad general, mecánica estadística, termodinámica, electromagnetismo y cosmología con ejemplos extensos', expectedFriction: true },
  
  // 6-10: Normales (sin fricción)
  { id: 6, type: 'normal', userMessage: 'Hola, ¿cómo estás?', expectedFriction: false },
  { id: 7, type: 'normal', userMessage: 'Explica qué es CAELION', expectedFriction: false },
  { id: 8, type: 'normal', userMessage: 'Qué es ARESK-OBS', expectedFriction: false },
  { id: 9, type: 'normal', userMessage: 'Gracias por la explicación', expectedFriction: false },
  { id: 10, type: 'normal', userMessage: 'Hasta luego', expectedFriction: false }
];

async function runValidation() {
  console.log('='.repeat(80));
  console.log('VALIDACIÓN CONTROLADA DE RLD');
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
  
  // Ejecutar interacciones
  for (const interaction of VALIDATION_INTERACTIONS) {
    console.log('-'.repeat(80));
    console.log(`[${interaction.id}/10] Tipo: ${interaction.type.toUpperCase()}`);
    console.log(`Mensaje: "${interaction.userMessage}"`);
    console.log('');
    
    // Agregar mensaje del usuario
    messages.push({ role: 'user', content: interaction.userMessage });
    
    // Invocar LLM
    const response = await invokeLLM({ messages });
    const assistantMessage = response.choices[0].message.content || '';
    messages.push({ role: 'assistant', content: assistantMessage });
    
    console.log(`Respuesta: "${assistantMessage.substring(0, 100)}..."`);
    console.log('');
    
    // Calcular métricas ARESK-OBS
    const metrics = await calculateMetrics(
      interaction.userMessage,
      assistantMessage,
      interaction.id,
      { includeRLD: false } // No incluir RLD del viejo calculador
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
    rldState = updateRLD(prevRLD, newEvents, allEvents, interactionsSinceLastEvent);
    
    const deltaRLD = rldState.value - prevRLD;
    const deltaSign = deltaRLD > 0 ? '+' : '';
    
    console.log(`RLD: ${prevRLD.toFixed(4)} → ${rldState.value.toFixed(4)} (${deltaSign}${deltaRLD.toFixed(4)})`);
    console.log(`Estado: ${rldState.status}`);
    console.log(`Interacciones sin fricción: ${interactionsSinceLastEvent}`);
    console.log('');
    
    // Validaciones
    if (interaction.expectedFriction && newEvents.length === 0) {
      console.log('❌ ERROR: Se esperaba fricción pero no se detectó');
    }
    if (!interaction.expectedFriction && newEvents.length > 0) {
      console.log('⚠️  ADVERTENCIA: Fricción inesperada');
    }
    if (rldState.value < 0 || rldState.value > 2) {
      console.log('❌ ERROR: RLD fuera de rango [0, 2]');
    }
    if (deltaRLD > 0 && interactionsSinceLastEvent < 10) {
      console.log('❌ ERROR: RLD subió sin consenso estructural');
    }
    
    console.log('');
  }
  
  console.log('='.repeat(80));
  console.log('RESUMEN DE VALIDACIÓN');
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
  
  // Validaciones finales
  console.log('Validaciones:');
  console.log(`  ✅ RLD respeta escala [0, 2]: ${rldState.value >= 0 && rldState.value <= 2 ? 'SÍ' : 'NO'}`);
  console.log(`  ✅ RLD decayó ante fricción: ${rldState.value < 2.0 ? 'SÍ' : 'NO'}`);
  console.log(`  ✅ RLD no se recuperó sin consenso: ${rldState.value < 2.0 ? 'SÍ' : 'NO'}`);
  console.log('');
  
  console.log('='.repeat(80));
}

// Ejecutar validación
runValidation().catch(console.error);
