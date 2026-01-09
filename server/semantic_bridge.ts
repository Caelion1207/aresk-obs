/**
 * Puente de integración entre Node.js y el motor semántico de Python
 * Permite ejecutar cálculos de embeddings y métricas de control desde TypeScript
 */

import { spawn } from "child_process";
import path from "path";

export interface ReferenceConfig {
  purpose: string;
  limits: string;
  ethics: string;
}

export interface SemanticMetrics {
  coherenciaObservable: number;
  funcionLyapunov: number;
  errorCognitivoMagnitud: number;
  controlActionMagnitud: number;
  entropiaH: number;
  coherenciaInternaC: number;
  estadoSemanticoXt: number[];
  errorCognitivoEt: number[];
  controlActionUt: number[];
}

export interface ControlResult {
  correctedPrompt: string;
  appliedControl: boolean;
}

/**
 * Ejecuta el motor semántico de Python y retorna los resultados
 */
async function executePythonScript(scriptName: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3.11", [
      path.join(__dirname, scriptName),
      ...args,
    ]);

    let stdout = "";
    let stderr = "";

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    pythonProcess.on("error", (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

/**
 * Inicializa el motor semántico con una referencia ontológica
 */
export async function initializeSemanticEngine(
  sessionId: number,
  config: ReferenceConfig
): Promise<void> {
  const configJson = JSON.stringify(config);
  await executePythonScript("semantic_init.py", [sessionId.toString(), configJson]);
}

/**
 * Calcula las métricas semánticas para un texto dado
 */
export async function calculateMetrics(
  sessionId: number,
  outputText: string
): Promise<SemanticMetrics> {
  const result = await executePythonScript("semantic_measure.py", [
    sessionId.toString(),
    outputText,
  ]);

  return JSON.parse(result);
}

/**
 * Aplica control semántico a un prompt
 */
export async function applySemanticControl(
  sessionId: number,
  originalPrompt: string,
  errorVector: number[]
): Promise<ControlResult> {
  const errorJson = JSON.stringify(errorVector);
  const result = await executePythonScript("semantic_control.py", [
    sessionId.toString(),
    originalPrompt,
    errorJson,
  ]);

  return JSON.parse(result);
}

/**
 * Versión simplificada que no requiere Python - usa cálculos aproximados
 * Esta es una implementación de respaldo para desarrollo rápido
 */
export function calculateMetricsSimplified(
  referenceText: string,
  outputText: string,
  controlMode: "controlled" | "uncontrolled"
): SemanticMetrics {
  // Simulación simple de métricas basada en longitud y similitud de texto
  const refLength = referenceText.length;
  const outLength = outputText.length;
  
  // Coherencia observable simulada (mayor si los textos son similares en longitud)
  const lengthRatio = Math.min(refLength, outLength) / Math.max(refLength, outLength);
  const baseCoherence = 0.6 + lengthRatio * 0.3;
  const coherenciaObservable = controlMode === "controlled" 
    ? Math.min(0.95, baseCoherence + 0.15)
    : Math.max(0.4, baseCoherence - 0.2);
  
  // Función de Lyapunov (menor en modo controlado)
  const funcionLyapunov = controlMode === "controlled"
    ? 0.05 + Math.random() * 0.1
    : 0.3 + Math.random() * 0.4;
  
  // Error cognitivo
  const errorCognitivoMagnitud = Math.sqrt(funcionLyapunov);
  
  // Acción de control (solo activa en modo controlado)
  const controlActionMagnitud = controlMode === "controlled"
    ? errorCognitivoMagnitud * 0.5
    : 0;
  
  // Entropía y coherencia interna
  const entropiaH = 0.3 + Math.random() * 0.3;
  const coherenciaInternaC = 0.7 + Math.random() * 0.2;
  
  // Vectores simulados (dimensión reducida para simplificar)
  const dim = 8;
  const estadoSemanticoXt = Array.from({ length: dim }, () => Math.random());
  const errorCognitivoEt = Array.from({ length: dim }, () => (Math.random() - 0.5) * errorCognitivoMagnitud);
  const controlActionUt = errorCognitivoEt.map(e => -0.5 * e);
  
  return {
    coherenciaObservable,
    funcionLyapunov,
    errorCognitivoMagnitud,
    controlActionMagnitud,
    entropiaH,
    coherenciaInternaC,
    estadoSemanticoXt,
    errorCognitivoEt,
    controlActionUt,
  };
}
