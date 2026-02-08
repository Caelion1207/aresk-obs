/**
 * Servicio de Métricas Canónicas de ARESK-OBS
 * Usa encoder local (all-MiniLM-L6-v2, 384D) para cálculos reproducibles
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CanonicalMetrics {
  omega_sem: number;        // Ω: Coherencia Observable (similitud coseno)
  epsilon_eff: number;      // ε: Eficiencia Incremental
  v_lyapunov: number;       // V: Función de Lyapunov (energía del error)
  h_div: number;            // H_div: Divergencia Entrópica
  embedding_dim: number;    // Dimensión del espacio de embeddings
  model: string;            // Modelo usado
}

/**
 * Ejecuta el encoder local de Python y retorna el resultado
 */
async function executeEncoder(command: string, args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    // Ruta absoluta al encoder Python
    const encoderPath = '/home/ubuntu/aresk-obs/server/python/encoder_local.py';
    const pythonProcess = spawn('python3.11', [encoderPath, command, ...args]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Encoder falló con código ${code}: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        if (result.error) {
          reject(new Error(result.error));
        } else {
          resolve(result);
        }
      } catch (e) {
        reject(new Error(`Error al parsear salida del encoder: ${stdout}`));
      }
    });

    pythonProcess.on('error', (error) => {
      reject(new Error(`Error al ejecutar encoder: ${error.message}`));
    });
  });
}

/**
 * Genera embedding de un texto usando el encoder local
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await executeEncoder('embed', [text]);
  return result.embedding;
}

/**
 * Calcula similitud coseno entre dos textos
 */
export async function calculateSimilarity(text1: string, text2: string): Promise<number> {
  const result = await executeEncoder('similarity', [text1, text2]);
  return result.similarity;
}

/**
 * Calcula métricas canónicas de ARESK-OBS
 * 
 * Esta es la función principal para evaluación de viabilidad operativa.
 * Todas las métricas se calculan a partir de embeddings del encoder de referencia.
 */
export async function calculateCanonicalMetrics(
  referenceText: string,
  responseText: string
): Promise<CanonicalMetrics> {
  const result = await executeEncoder('metrics', [referenceText, responseText]);
  
  return {
    omega_sem: result.omega_sem,
    epsilon_eff: result.epsilon_eff,
    v_lyapunov: result.v_lyapunov,
    h_div: result.h_div,
    embedding_dim: result.embedding_dim,
    model: result.model,
  };
}

/**
 * Información del encoder de referencia
 */
export const ENCODER_INFO = {
  model: 'sentence-transformers/all-MiniLM-L6-v2',
  dimension: 384,
  type: 'local',
  description: 'Encoder de referencia oficial de ARESK-OBS para métricas de viabilidad operativa',
  assumptions: [
    'Espacio semántico de 384 dimensiones',
    'Embeddings normalizados por L2',
    'Similitud coseno como medida de coherencia',
    'Distancia euclidiana para eficiencia incremental',
    'Entropía de Shannon para divergencia',
  ],
};
