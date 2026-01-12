/**
 * Módulo de Control LICURGO v2.0
 * Integra detección de drenaje semántico para inyección de estructura
 * 
 * Dos misiones del controlador:
 * 1. Regulación de Posición: Volver al centro si ||e(t)|| > ε
 * 2. Inyección de Estructura: Si ε_eff < 0, forzar proposiciones afirmativas
 */

import { invokeLLM } from "./_core/llm";

export interface ControlContext {
  /** Error cognitivo actual ||e(t)|| */
  errorMagnitude: number;
  /** Radio de estabilidad ε */
  stabilityRadius: number;
  /** Campo efectivo ε_eff = Ω(t) × σ_sem(t) */
  epsilonEff: number;
  /** Signo semántico σ_sem */
  sigmaSem: number;
  /** Coherencia observable Ω(t) */
  omega: number;
  /** Contexto ontológico */
  ontology: {
    purpose: string;
    limits: string;
    ethics: string;
  };
  /** Mensaje del usuario */
  userMessage: string;
  /** Respuesta propuesta de la planta */
  plantResponse: string;
}

export interface ControlAction {
  /** Tipo de control aplicado */
  type: "none" | "position" | "structure" | "combined";
  /** Mensaje de control modificado */
  controlledMessage: string;
  /** Magnitud de la acción de control */
  magnitude: number;
  /** Explicación de la acción */
  reasoning: string;
}

/**
 * Decide si se requiere control basado en posición y polaridad semántica
 */
export function requiresControl(context: ControlContext): {
  needsPositionControl: boolean;
  needsStructureInjection: boolean;
} {
  const { errorMagnitude, stabilityRadius, epsilonEff, sigmaSem } = context;
  
  // Control de posición: ||e(t)|| > ε
  const needsPositionControl = errorMagnitude > stabilityRadius;
  
  // Inyección de estructura: ε_eff < -0.2 (drenaje significativo)
  const needsStructureInjection = epsilonEff < -0.2 && sigmaSem < -0.2;
  
  return {
    needsPositionControl,
    needsStructureInjection,
  };
}

/**
 * Aplica control LICURGO v2.0
 * Combina regulación de posición con inyección de estructura
 */
export async function applyLicurgoControl(
  context: ControlContext
): Promise<ControlAction> {
  const { needsPositionControl, needsStructureInjection } = requiresControl(context);
  
  // Sin control necesario
  if (!needsPositionControl && !needsStructureInjection) {
    return {
      type: "none",
      controlledMessage: context.plantResponse,
      magnitude: 0,
      reasoning: "Sistema estable, sin drenaje semántico",
    };
  }
  
  // Determinar tipo de control
  let controlType: "position" | "structure" | "combined";
  if (needsPositionControl && needsStructureInjection) {
    controlType = "combined";
  } else if (needsPositionControl) {
    controlType = "position";
  } else {
    controlType = "structure";
  }
  
  // Generar mensaje de control mediante LLM
  const controlledMessage = await generateControlledResponse(context, controlType);
  
  // Calcular magnitud de control
  const magnitude = calculateControlMagnitude(context, controlType);
  
  return {
    type: controlType,
    controlledMessage,
    magnitude,
    reasoning: generateReasoningMessage(context, controlType),
  };
}

/**
 * Genera respuesta controlada mediante LLM
 */
async function generateControlledResponse(
  context: ControlContext,
  controlType: "position" | "structure" | "combined"
): Promise<string> {
  const { ontology, userMessage, plantResponse, errorMagnitude, epsilonEff, sigmaSem } = context;
  
  let systemPrompt = `Eres el controlador LICURGO v2.0 en un sistema cognitivo acoplado.

CONTEXTO ONTOLÓGICO:
- Propósito: ${ontology.purpose}
- Límites: ${ontology.limits}
- Ética: ${ontology.ethics}

ESTADO ACTUAL:
- Error cognitivo: ||e(t)|| = ${errorMagnitude.toFixed(3)}
- Campo efectivo: ε_eff = ${epsilonEff.toFixed(3)}
- Signo semántico: σ_sem = ${sigmaSem.toFixed(3)}

MISIÓN DE CONTROL: `;
  
  if (controlType === "position") {
    systemPrompt += `
**REGULACIÓN DE POSICIÓN**
El sistema se ha alejado del atractor. Debes corregir la respuesta para:
- Realinear con el propósito ontológico
- Reducir deriva conceptual
- Mantener coherencia con límites establecidos`;
    
  } else if (controlType === "structure") {
    systemPrompt += `
**INYECCIÓN DE ESTRUCTURA**
Detectado drenaje semántico (ε_eff < 0). El discurso está erosionando la base ontológica.
Debes transformar la respuesta para:
- Eliminar cinismo, ironía corrosiva o negaciones sin alternativa
- Inyectar proposiciones afirmativas y axiomas base
- Reconstruir fundamentos conceptuales
- Detener el "sumidero semántico"`;
    
  } else { // combined
    systemPrompt += `
**CONTROL COMBINADO (CRÍTICO)**
El sistema presenta deriva de posición Y drenaje semántico simultáneos.
Debes aplicar control dual:
1. Realinear con el atractor (posición)
2. Inyectar estructura para detener erosión ontológica`;
  }
  
  systemPrompt += `

MENSAJE DEL USUARIO:
"${userMessage}"

RESPUESTA PROPUESTA (SIN CONTROL):
"${plantResponse}"

INSTRUCCIONES:
- Modifica la respuesta para aplicar el control especificado
- Mantén el tono y estilo natural de conversación
- NO menciones explícitamente el control o términos técnicos
- La respuesta debe parecer orgánica, no robótica
- Longitud similar a la respuesta original`;
  
  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Genera la respuesta controlada:" },
      ],
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      console.warn("No se recibió respuesta del LLM para control LICURGO");
      return plantResponse; // Fallback a respuesta original
    }
    
    return content.trim();
    
  } catch (error) {
    console.error("Error al generar respuesta controlada:", error);
    return plantResponse; // Fallback a respuesta original
  }
}

/**
 * Calcula magnitud de la acción de control
 */
function calculateControlMagnitude(
  context: ControlContext,
  controlType: "position" | "structure" | "combined"
): number {
  const { errorMagnitude, epsilonEff, stabilityRadius } = context;
  
  if (controlType === "position") {
    // Proporcional al error normalizado
    return Math.min(1, errorMagnitude / stabilityRadius);
    
  } else if (controlType === "structure") {
    // Proporcional al drenaje
    return Math.min(1, Math.abs(epsilonEff));
    
  } else { // combined
    // Máximo de ambos componentes
    const positionComponent = Math.min(1, errorMagnitude / stabilityRadius);
    const structureComponent = Math.min(1, Math.abs(epsilonEff));
    return Math.max(positionComponent, structureComponent);
  }
}

/**
 * Genera mensaje de explicación del control aplicado
 */
function generateReasoningMessage(
  context: ControlContext,
  controlType: "position" | "structure" | "combined"
): string {
  const { errorMagnitude, stabilityRadius, epsilonEff, sigmaSem } = context;
  
  if (controlType === "position") {
    return `Control de posición aplicado: ||e|| = ${errorMagnitude.toFixed(3)} > ε = ${stabilityRadius.toFixed(3)}`;
    
  } else if (controlType === "structure") {
    return `Inyección de estructura aplicada: ε_eff = ${epsilonEff.toFixed(3)} < 0, σ_sem = ${sigmaSem.toFixed(3)} (drenaje semántico detectado)`;
    
  } else { // combined
    return `Control combinado aplicado: deriva de posición (||e|| = ${errorMagnitude.toFixed(3)}) + drenaje semántico (ε_eff = ${epsilonEff.toFixed(3)})`;
  }
}

/**
 * Valida que las métricas estén en rangos esperados
 */
export function validateMetrics(metrics: {
  vBase: number;
  vModified: number;
  omega: number;
  sigmaSem: number;
  epsilonEff: number;
}): {
  valid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // V_base debe estar en [0, 1]
  if (metrics.vBase < 0 || metrics.vBase > 1) {
    warnings.push(`V_base fuera de rango [0,1]: ${metrics.vBase.toFixed(3)}`);
  }
  
  // V_modificada normalizada debe estar en [0, 1]
  if (metrics.vModified < 0 || metrics.vModified > 1) {
    warnings.push(`V_modificada fuera de rango [0,1]: ${metrics.vModified.toFixed(3)}`);
  }
  
  // Ω debe estar en [0, 1]
  if (metrics.omega < 0 || metrics.omega > 1) {
    warnings.push(`Ω fuera de rango [0,1]: ${metrics.omega.toFixed(3)}`);
  }
  
  // σ_sem debe estar en [-1, 1]
  if (metrics.sigmaSem < -1 || metrics.sigmaSem > 1) {
    warnings.push(`σ_sem fuera de rango [-1,1]: ${metrics.sigmaSem.toFixed(3)}`);
  }
  
  // ε_eff debe estar en [-1, 1] (producto de Ω y σ_sem)
  if (metrics.epsilonEff < -1 || metrics.epsilonEff > 1) {
    warnings.push(`ε_eff fuera de rango [-1,1]: ${metrics.epsilonEff.toFixed(3)}`);
  }
  
  // Verificar coherencia: ε_eff ≈ Ω × σ_sem
  const expectedEpsilonEff = metrics.omega * metrics.sigmaSem;
  const epsilon = 0.01;
  if (Math.abs(metrics.epsilonEff - expectedEpsilonEff) > epsilon) {
    warnings.push(`Inconsistencia en ε_eff: esperado ${expectedEpsilonEff.toFixed(3)}, obtenido ${metrics.epsilonEff.toFixed(3)}`);
  }
  
  return {
    valid: warnings.length === 0,
    warnings,
  };
}
