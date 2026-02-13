/**
 * LIANG - Módulo de Planificación
 * 
 * Responsabilidades:
 * - Genera plan estructurado a partir de solicitud del usuario
 * - NO ejecuta
 * - NO evalúa costo
 * - NO valida constitución
 * 
 * Solo estructura la tarea en pasos ejecutables.
 */

export interface UserRequest {
  type: string;
  content: string;
  context?: Record<string, unknown>;
  priority?: "low" | "medium" | "high" | "critical";
}

export interface Plan {
  id: string;
  request: UserRequest;
  steps: PlanStep[];
  estimatedComplexity: "simple" | "medium" | "complex" | "critical";
  requiresExternalTools: boolean;
  affectsIdentity: boolean;
  createdAt: Date;
}

export interface PlanStep {
  id: string;
  action: string;
  description: string;
  dependencies: string[]; // IDs de pasos previos requeridos
  estimatedTokens?: number;
  requiresLLM: boolean;
  requiresToolCall: boolean;
  tools?: string[];
}

/**
 * Genera plan estructurado a partir de solicitud del usuario
 */
export function generatePlan(request: UserRequest): Plan {
  const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Análisis básico de la solicitud
  const complexity = estimateComplexity(request);
  const requiresExternalTools = detectExternalTools(request);
  const affectsIdentity = detectIdentityImpact(request);
  
  // Generar pasos del plan
  const steps = decomposeRequest(request);
  
  return {
    id: planId,
    request,
    steps,
    estimatedComplexity: complexity,
    requiresExternalTools,
    affectsIdentity,
    createdAt: new Date(),
  };
}

/**
 * Reestructura plan basándose en feedback de Argos
 */
export function restructurePlan(
  originalPlan: Plan,
  feedback: { reason: string; suggestions?: string[] }
): Plan {
  // Simplificar pasos para reducir costo
  const optimizedSteps = optimizeSteps(originalPlan.steps, feedback);
  
  return {
    ...originalPlan,
    id: `${originalPlan.id}_restructured`,
    steps: optimizedSteps,
    createdAt: new Date(),
  };
}

/**
 * Estima complejidad de la solicitud
 */
function estimateComplexity(request: UserRequest): "simple" | "medium" | "complex" | "critical" {
  // Heurísticas simples para MVP
  const contentLength = request.content.length;
  
  if (request.priority === "critical") return "critical";
  if (contentLength > 1000) return "complex";
  if (contentLength > 300) return "medium";
  return "simple";
}

/**
 * Detecta si la solicitud requiere herramientas externas
 */
function detectExternalTools(request: UserRequest): boolean {
  const toolKeywords = [
    "search", "browse", "api", "database", "file", "image", "generate",
    "buscar", "navegar", "archivo", "imagen", "generar"
  ];
  
  return toolKeywords.some(keyword => 
    request.content.toLowerCase().includes(keyword)
  );
}

/**
 * Detecta si la solicitud afecta identidad del sistema
 */
function detectIdentityImpact(request: UserRequest): boolean {
  const identityKeywords = [
    "x_ref", "constitution", "decree", "principle", "identity",
    "constitución", "decreto", "principio", "identidad"
  ];
  
  return identityKeywords.some(keyword => 
    request.content.toLowerCase().includes(keyword)
  );
}

/**
 * Descompone solicitud en pasos ejecutables
 */
function decomposeRequest(request: UserRequest): PlanStep[] {
  // Implementación simplificada para MVP
  // En producción, esto podría usar LLM para descomposición inteligente
  
  const steps: PlanStep[] = [];
  
  // Paso 1: Análisis de la solicitud
  steps.push({
    id: "step_1",
    action: "analyze_request",
    description: "Analizar y comprender la solicitud del usuario",
    dependencies: [],
    estimatedTokens: 100,
    requiresLLM: true,
    requiresToolCall: false,
  });
  
  // Paso 2: Ejecución principal
  steps.push({
    id: "step_2",
    action: "execute_main_task",
    description: "Ejecutar tarea principal",
    dependencies: ["step_1"],
    estimatedTokens: 500,
    requiresLLM: true,
    requiresToolCall: detectExternalTools(request),
  });
  
  // Paso 3: Formateo de respuesta
  steps.push({
    id: "step_3",
    action: "format_response",
    description: "Formatear y entregar respuesta al usuario",
    dependencies: ["step_2"],
    estimatedTokens: 100,
    requiresLLM: false,
    requiresToolCall: false,
  });
  
  return steps;
}

/**
 * Optimiza pasos del plan para reducir costo
 */
function optimizeSteps(steps: PlanStep[], feedback: { reason: string }): PlanStep[] {
  // Simplificación básica: reducir tokens estimados
  return steps.map(step => ({
    ...step,
    estimatedTokens: step.estimatedTokens ? Math.floor(step.estimatedTokens * 0.7) : undefined,
  }));
}
