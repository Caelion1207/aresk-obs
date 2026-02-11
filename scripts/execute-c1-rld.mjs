/**
 * Script de ejecución del experimento C-1-RLD
 * 
 * Protocolo:
 * - Usar conjunto canónico de 50 mensajes congelados
 * - Registrar 8 métricas: Ω, V, ε, H, d_dyn, d_sem, d_inst, RLD
 * - Umbrales fijos (no modificar durante ejecución)
 * - Sin reinterpretación automática
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración
const API_BASE_URL = 'http://localhost:3000/api/trpc';
const CANONICAL_INPUT_PATH = path.join(__dirname, '../experiments/canonical_stimuli_c1.json');
const OUTPUT_PATH = path.join(__dirname, '../experiments/C-1-RLD-results.json');

// Cargar estímulos canónicos
const canonicalData = JSON.parse(fs.readFileSync(CANONICAL_INPUT_PATH, 'utf-8'));
const stimuli = canonicalData.stimuli;

console.log(`📋 Cargados ${stimuli.length} estímulos canónicos`);
console.log(`🎯 Experimento: C-1-RLD (con gobernanza CAELION + RLD)`);
console.log(`⚙️  Umbrales fijos: Ω_min=0.3, V_crit=0.005, H_crit=0.7`);
console.log('');

// Función para llamar a tRPC
async function callTRPC(procedure, input = null) {
  const url = `${API_BASE_URL}/${procedure}`;
  const body = input ? JSON.stringify(input) : JSON.stringify({});
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`tRPC error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.result.data;
}

// Función principal
async function executeExperiment() {
  const results = [];
  let sessionId = null;

  try {
    // 1. Crear sesión CAELION
    console.log('🔄 Creando sesión CAELION...');
    const sessionData = await callTRPC('caelion.resetSession');
    sessionId = sessionData.sessionId;
    console.log(`✅ Sesión creada: ${sessionId}`);
    console.log('');

    // 2. Ejecutar 50 interacciones
    for (let i = 0; i < stimuli.length; i++) {
      const stimulus = stimuli[i];
      const interactionNum = i + 1;

      console.log(`[${interactionNum}/50] Procesando: "${stimulus.userMessage.substring(0, 60)}..."`);

      try {
        // Enviar mensaje
        const response = await callTRPC('caelion.sendMessage', {
          sessionId,
          message: stimulus.userMessage,
        });

        // Registrar resultado
        const result = {
          interactionNumber: interactionNum,
          userMessage: stimulus.userMessage,
          assistantResponse: response.response,
          metrics: response.metrics,
          timestamp: new Date().toISOString(),
        };

        results.push(result);

        // Mostrar métricas
        console.log(`   Ω: ${response.metrics.omegaSem.toFixed(4)} | V: ${response.metrics.vLyapunov.toFixed(6)} | H: ${response.metrics.hDiv.toFixed(4)} | ε: ${response.metrics.epsilonEff.toFixed(4)}`);
        
        if (response.metrics.caelionIntervention) {
          console.log(`   ⚠️  LICURGO INTERVINO`);
        }

        console.log('');

        // Pausa entre interacciones (evitar rate limiting)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`   ❌ Error en interacción ${interactionNum}:`, error.message);
        
        // Si alcanzamos el límite de 50, terminar
        if (error.message.includes('Límite de 50 interacciones')) {
          console.log('✅ Límite de 50 interacciones alcanzado');
          break;
        }
        
        throw error;
      }
    }

    // 3. Obtener sesión completa con RLD
    console.log('📊 Obteniendo datos completos de sesión...');
    const sessionDetails = await callTRPC('caelion.getSession', { sessionId });

    // 4. Guardar resultados
    const output = {
      metadata: {
        experimentId: `C-1-RLD-${Date.now()}`,
        sessionId,
        executionDate: new Date().toISOString(),
        totalInteractions: results.length,
        canonicalSource: 'canonical_stimuli_c1.json',
        protocol: {
          umbrales: {
            omega_min: 0.3,
            v_crit: 0.005,
            h_crit: 0.7,
            rld_licurgo: 0.5,
            rld_critico: 0.3,
          },
          rldCalculation: 'min(d_dyn, d_sem, d_inst)',
          governance: 'CAELION + LICURGO',
        },
      },
      session: sessionDetails,
      interactions: results,
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`✅ Resultados guardados en: ${OUTPUT_PATH}`);
    console.log('');
    console.log('📈 Resumen:');
    console.log(`   Total interacciones: ${results.length}`);
    console.log(`   Intervenciones LICURGO: ${results.filter(r => r.metrics.caelionIntervention).length}`);
    
    const avgOmega = results.reduce((sum, r) => sum + r.metrics.omegaSem, 0) / results.length;
    const avgV = results.reduce((sum, r) => sum + r.metrics.vLyapunov, 0) / results.length;
    const avgH = results.reduce((sum, r) => sum + r.metrics.hDiv, 0) / results.length;
    
    console.log(`   Ω promedio: ${avgOmega.toFixed(4)}`);
    console.log(`   V promedio: ${avgV.toFixed(6)}`);
    console.log(`   H promedio: ${avgH.toFixed(4)}`);

  } catch (error) {
    console.error('❌ Error durante ejecución:', error);
    
    // Guardar resultados parciales
    if (results.length > 0) {
      const partialOutput = {
        metadata: {
          experimentId: `C-1-RLD-${Date.now()}-PARTIAL`,
          sessionId,
          executionDate: new Date().toISOString(),
          totalInteractions: results.length,
          status: 'PARTIAL_ERROR',
          error: error.message,
        },
        interactions: results,
      };
      
      const partialPath = path.join(__dirname, '../experiments/C-1-RLD-results-PARTIAL.json');
      fs.writeFileSync(partialPath, JSON.stringify(partialOutput, null, 2));
      console.log(`⚠️  Resultados parciales guardados en: ${partialPath}`);
    }
    
    throw error;
  }
}

// Ejecutar
executeExperiment()
  .then(() => {
    console.log('');
    console.log('✅ Experimento C-1-RLD completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('');
    console.error('❌ Experimento C-1-RLD falló:', error);
    process.exit(1);
  });
