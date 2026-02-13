/**
 * ARGOS - Módulo de Evaluación Costo-Valor-Riesgo
 * 
 * Responsabilidades:
 * - Evalúa consumo estimado de tokens
 * - Evalúa uso de herramientas externas
 * - Evalúa latencia proyectada
 * - Evalúa riesgo operativo
 * - Puede: aprobar, advertir, bloquear
 * 
 * NO ejecuta.
 */

import type { Plan } from "./liang";

export interface ArgosEvaluation {
  decision: "approve" | "warn" | "block";
  estimatedTokens: number;
  estimatedCost: number; // USD
  estimatedLatency: number; // segundos
  riskScore: number; // [0, 1]
  riskFactors: string[];
  recommendations?: string[];
  reason?: string;
  timestamp: Date;
}

export interface ArgosConfig {
  tokenCostPerK: number; // USD por 1000 tokens
  energyBudget: number; // tokens disponibles
  energyMultiplierLimit: number; // máximo multiplicador permitido
  riskThreshold: number; // umbral de riesgo para bloqueo
  warningThreshold: number; // umbral de riesgo para advertencia
}

const DEFAULT_CONFIG: ArgosConfig = {
  tokenCostPerK: 0.03, // $0.03 por 1K tokens (promedio)
  energyBudget: 100000, // 100K tokens por defecto
  energyMultiplierLimit: 3.0,
  riskThreshold: 0.8,
  warningThreshold: 0.5,
};

/**
 * Evalúa plan y retorna decisión
 */
export function evaluate(
  plan: Plan,
  currentEnergyBudget: number,
  config: Partial<ArgosConfig> = {}
): ArgosEvaluation {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  // 1. Estimar consumo de tokens
  const estimatedTokens = estimateTokenConsumption(plan);
  
  // 2. Calcular costo
  const estimatedCost = (estimatedTokens / 1000) * cfg.tokenCostPerK;
  
  // 3. Estimar latencia
  const estimatedLatency = estimateLatency(plan);
  
  // 4. Evaluar riesgo
  const { riskScore, riskFactors } = evaluateRisk(plan, estimatedTokens, currentEnergyBudget, cfg);
  
  // 5. Tomar decisión
  const decision = makeDecision(riskScore, estimatedTokens, currentEnergyBudget, cfg);
  
  // 6. Generar recomendaciones si es necesario
  const recommendations = decision !== "approve" 
    ? generateRecommendations(plan, riskFactors)
    : undefined;
  
  // 7. Generar razón si se bloquea o advierte
  const reason = decision !== "approve"
    ? generateReason(decision, riskScore, estimatedTokens, currentEnergyBudget, cfg)
    : undefined;
  
  return {
    decision,
    estimatedTokens,
    estimatedCost,
    estimatedLatency,
    riskScore,
    riskFactors,
    recommendations,
    reason,
    timestamp: new Date(),
  };
}

/**
 * Estima consumo de tokens del plan
 */
function estimateTokenConsumption(plan: Plan): number {
  let total = 0;
  
  // Sumar tokens estimados de cada paso
  for (const step of plan.steps) {
    if (step.estimatedTokens) {
      total += step.estimatedTokens;
    } else {
      // Estimación por defecto si no está especificado
      total += step.requiresLLM ? 500 : 100;
    }
  }
  
  // Multiplicador por complejidad
  const complexityMultiplier = {
    simple: 1.0,
    medium: 1.5,
    complex: 2.5,
    critical: 4.0,
  }[plan.estimatedComplexity];
  
  return Math.ceil(total * complexityMultiplier);
}

/**
 * Estima latencia del plan en segundos
 */
function estimateLatency(plan: Plan): number {
  let latency = 0;
  
  // Latencia base por paso
  for (const step of plan.steps) {
    if (step.requiresLLM) {
      latency += 2; // 2 segundos por llamada LLM
    }
    if (step.requiresToolCall) {
      latency += 1; // 1 segundo por tool call
    }
  }
  
  // Multiplicador por complejidad
  const complexityMultiplier = {
    simple: 1.0,
    medium: 1.3,
    complex: 2.0,
    critical: 3.0,
  }[plan.estimatedComplexity];
  
  return Math.ceil(latency * complexityMultiplier);
}

/**
 * Evalúa riesgo operativo del plan
 */
function evaluateRisk(
  plan: Plan,
  estimatedTokens: number,
  currentEnergyBudget: number,
  config: ArgosConfig
): { riskScore: number; riskFactors: string[] } {
  const riskFactors: string[] = [];
  let riskScore = 0;
  
  // Factor 1: Consumo excesivo de energía
  const energyRatio = estimatedTokens / currentEnergyBudget;
  if (energyRatio > config.energyMultiplierLimit) {
    riskScore += 0.4;
    riskFactors.push(`Consumo excede límite (${energyRatio.toFixed(1)}x presupuesto)`);
  } else if (energyRatio > 1.0) {
    riskScore += 0.2;
    riskFactors.push(`Consumo alto (${energyRatio.toFixed(1)}x presupuesto)`);
  }
  
  // Factor 2: Complejidad crítica
  if (plan.estimatedComplexity === "critical") {
    riskScore += 0.3;
    riskFactors.push("Complejidad crítica");
  } else if (plan.estimatedComplexity === "complex") {
    riskScore += 0.15;
    riskFactors.push("Complejidad alta");
  }
  
  // Factor 3: Afecta identidad del sistema
  if (plan.affectsIdentity) {
    riskScore += 0.3;
    riskFactors.push("Afecta identidad del sistema");
  }
  
  // Factor 4: Requiere herramientas externas
  if (plan.requiresExternalTools) {
    riskScore += 0.1;
    riskFactors.push("Requiere herramientas externas");
  }
  
  return {
    riskScore: Math.min(riskScore, 1.0),
    riskFactors,
  };
}

/**
 * Toma decisión basándose en riesgo y energía
 */
function makeDecision(
  riskScore: number,
  estimatedTokens: number,
  currentEnergyBudget: number,
  config: ArgosConfig
): "approve" | "warn" | "block" {
  // Bloqueo por riesgo alto
  if (riskScore >= config.riskThreshold) {
    return "block";
  }
  
  // Bloqueo por consumo excesivo
  const energyRatio = estimatedTokens / currentEnergyBudget;
  if (energyRatio > config.energyMultiplierLimit) {
    return "block";
  }
  
  // Advertencia por riesgo moderado
  if (riskScore >= config.warningThreshold) {
    return "warn";
  }
  
  // Advertencia por consumo alto
  if (energyRatio > 1.5) {
    return "warn";
  }
  
  return "approve";
}

/**
 * Genera recomendaciones para reducir riesgo/costo
 */
function generateRecommendations(plan: Plan, riskFactors: string[]): string[] {
  const recommendations: string[] = [];
  
  if (riskFactors.some(f => f.includes("Consumo"))) {
    recommendations.push("Simplificar pasos del plan");
    recommendations.push("Reducir número de llamadas al LLM");
  }
  
  if (riskFactors.some(f => f.includes("Complejidad"))) {
    recommendations.push("Dividir tarea en subtareas más pequeñas");
  }
  
  if (riskFactors.some(f => f.includes("identidad"))) {
    recommendations.push("Activar Modo Debate Constitucional");
    recommendations.push("Requerir confirmación explícita del fundador");
  }
  
  return recommendations;
}

/**
 * Genera razón para decisión de bloqueo/advertencia
 */
function generateReason(
  decision: "warn" | "block",
  riskScore: number,
  estimatedTokens: number,
  currentEnergyBudget: number,
  config: ArgosConfig
): string {
  const energyRatio = estimatedTokens / currentEnergyBudget;
  
  if (decision === "block") {
    if (riskScore >= config.riskThreshold) {
      return `Riesgo operativo demasiado alto (${(riskScore * 100).toFixed(0)}%)`;
    }
    if (energyRatio > config.energyMultiplierLimit) {
      return `Consumo excede límite permitido (${energyRatio.toFixed(1)}x vs ${config.energyMultiplierLimit}x)`;
    }
  }
  
  if (decision === "warn") {
    return `Advertencia: Riesgo moderado (${(riskScore * 100).toFixed(0)}%) y consumo alto (${energyRatio.toFixed(1)}x presupuesto)`;
  }
  
  return "";
}
