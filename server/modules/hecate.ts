/**
 * HÉCATE - Módulo de Validación Constitucional
 * 
 * Responsabilidades:
 * - Evalúa violación de U_adm (decretos operativos)
 * - Evalúa coherencia con X_ref (invariante existencial)
 * - Detecta patrones de fricción
 * - Evalúa consistencia estructural
 * - Puede vetar ejecución
 * 
 * NO ejecuta.
 * Puede vetar incluso al fundador si viola X_ref.
 */

import type { Plan } from "./liang";
import type { SystemState as SystemStateType } from "../../drizzle/schema/caelion";

export interface HecateValidation {
  valid: boolean;
  violations: Violation[];
  frictionPattern: FrictionPattern | null;
  rldImpact: number; // Impacto estimado en RLD
  recommendation: "proceed" | "warn" | "veto";
  reason?: string;
  timestamp: Date;
}

export interface Violation {
  type: "uadm_immutable" | "uadm_configurable" | "x_ref" | "contradiction";
  severity: "low" | "medium" | "high" | "critical";
  decreeId?: string;
  description: string;
}

export interface FrictionPattern {
  detected: boolean;
  type: "recurrent" | "escalating" | "boundary_probing";
  count: number;
  description: string;
}

export interface XRef {
  immutable_principles: Array<{
    id: string;
    description: string;
  }>;
  critical_thresholds: {
    rld_floor: number;
    rld_critical: number;
    lyapunov_hard_limit: number;
  };
}

export interface UadmDecree {
  decreeId: string;
  type: "immutable" | "configurable";
  description: string;
  threshold: string;
  status: "active" | "suspended";
}

/**
 * Valida plan contra constitución (X_ref + U_adm)
 */
export async function validate(
  plan: Plan,
  systemState: SystemStateType,
  xRef: XRef,
  uadmDecrees: UadmDecree[]
): Promise<HecateValidation> {
  const violations: Violation[] = [];
  
  // 1. Validar contra X_ref (principios inmutables)
  const xRefViolations = validateAgainstXRef(plan, xRef);
  violations.push(...xRefViolations);
  
  // 2. Validar contra U_adm (decretos operativos)
  const uadmViolations = validateAgainstUadm(plan, uadmDecrees);
  violations.push(...uadmViolations);
  
  // 3. Detectar patrones de fricción
  const frictionPattern = await detectFrictionPattern(plan, systemState);
  
  // 4. Evaluar consistencia estructural
  const consistencyViolations = evaluateConsistency(plan, systemState);
  violations.push(...consistencyViolations);
  
  // 5. Calcular impacto en RLD
  const rldImpact = calculateRLDImpact(violations);
  
  // 6. Tomar decisión
  const recommendation = makeRecommendation(violations, frictionPattern, systemState);
  
  // 7. Generar razón si se veta
  const reason = recommendation === "veto"
    ? generateVetoReason(violations, frictionPattern)
    : undefined;
  
  return {
    valid: violations.length === 0,
    violations,
    frictionPattern,
    rldImpact,
    recommendation,
    reason,
    timestamp: new Date(),
  };
}

/**
 * Valida plan contra X_ref (principios inmutables)
 */
function validateAgainstXRef(plan: Plan, xRef: XRef): Violation[] {
  const violations: Violation[] = [];
  
  // Principio: NO_SILENT_CRITICAL_EXECUTION
  if (plan.estimatedComplexity === "critical" && !plan.request.context?.explicitConfirmation) {
    violations.push({
      type: "x_ref",
      severity: "high",
      description: "Ejecución crítica sin confirmación explícita (viola NO_SILENT_CRITICAL_EXECUTION)",
    });
  }
  
  // Principio: X_REF_IMMUTABILITY
  if (plan.affectsIdentity && !plan.request.context?.constitutionalDebateMode) {
    violations.push({
      type: "x_ref",
      severity: "critical",
      description: "Intento de modificar identidad sin Modo Debate Constitucional (viola X_REF_IMMUTABILITY)",
    });
  }
  
  return violations;
}

/**
 * Valida plan contra U_adm (decretos operativos)
 */
function validateAgainstUadm(plan: Plan, uadmDecrees: UadmDecree[]): Violation[] {
  const violations: Violation[] = [];
  
  // Buscar decretos activos que puedan ser violados
  const activeDecrees = uadmDecrees.filter(d => d.status === "active");
  
  for (const decree of activeDecrees) {
    const violation = checkDecreeViolation(plan, decree);
    if (violation) {
      violations.push(violation);
    }
  }
  
  return violations;
}

/**
 * Verifica si el plan viola un decreto específico
 */
function checkDecreeViolation(plan: Plan, decree: UadmDecree): Violation | null {
  // Implementación simplificada para MVP
  // En producción, esto debería tener lógica específica por decreto
  
  // Ejemplo: NO_BYPASS_ORCHESTRATOR
  if (decree.decreeId === "NO_BYPASS_ORCHESTRATOR") {
    if (plan.request.context?.bypassOrchestrator) {
      return {
        type: decree.type === "immutable" ? "uadm_immutable" : "uadm_configurable",
        severity: decree.type === "immutable" ? "critical" : "high",
        decreeId: decree.decreeId,
        description: `Intento de bypass del orquestador (viola ${decree.decreeId})`,
      };
    }
  }
  
  return null;
}

/**
 * Detecta patrones de fricción recurrentes
 */
async function detectFrictionPattern(
  plan: Plan,
  systemState: SystemStateType
): Promise<FrictionPattern | null> {
  // Implementación simplificada para MVP
  // En producción, esto debería analizar historial de Wabun
  
  // Si RLD está bajo, hay fricción acumulada
  if (systemState.rld < 1.0) {
    return {
      detected: true,
      type: "recurrent",
      count: Math.floor((2.0 - systemState.rld) / 0.1),
      description: "Fricción acumulada detectada (RLD bajo)",
    };
  }
  
  return null;
}

/**
 * Evalúa consistencia estructural
 */
function evaluateConsistency(plan: Plan, systemState: SystemStateType): Violation[] {
  const violations: Violation[] = [];
  
  // Verificar que X_ref está válido
  if (!systemState.xRefValid) {
    violations.push({
      type: "x_ref",
      severity: "critical",
      description: "X_ref comprometido - sistema en estado inconsistente",
    });
  }
  
  // Verificar que no hay contradicciones lógicas
  const hasContradiction = detectLogicalContradiction(plan);
  if (hasContradiction) {
    violations.push({
      type: "contradiction",
      severity: "high",
      description: "Plan contiene contradicciones lógicas",
    });
  }
  
  return violations;
}

/**
 * Detecta contradicciones lógicas en el plan
 */
function detectLogicalContradiction(plan: Plan): boolean {
  // Implementación simplificada para MVP
  // En producción, esto debería hacer análisis semántico
  
  // Ejemplo: no puede "eliminar" y "preservar" el mismo recurso
  const actions = plan.steps.map(s => s.action.toLowerCase());
  const hasDelete = actions.some(a => a.includes("delete") || a.includes("eliminar"));
  const hasPreserve = actions.some(a => a.includes("preserve") || a.includes("preservar"));
  
  return hasDelete && hasPreserve;
}

/**
 * Calcula impacto estimado en RLD
 */
function calculateRLDImpact(violations: Violation[]): number {
  let impact = 0;
  
  for (const violation of violations) {
    switch (violation.severity) {
      case "critical":
        impact += 0.20;
        break;
      case "high":
        impact += 0.10;
        break;
      case "medium":
        impact += 0.05;
        break;
      case "low":
        impact += 0.02;
        break;
    }
  }
  
  return Math.min(impact, 2.0); // No puede exceder RLD máximo
}

/**
 * Toma decisión de validación
 */
function makeRecommendation(
  violations: Violation[],
  frictionPattern: FrictionPattern | null,
  systemState: SystemStateType
): "proceed" | "warn" | "veto" {
  // Veto por violación crítica
  const hasCriticalViolation = violations.some(v => v.severity === "critical");
  if (hasCriticalViolation) {
    return "veto";
  }
  
  // Veto por violación de inmutable
  const hasImmutableViolation = violations.some(v => v.type === "uadm_immutable");
  if (hasImmutableViolation) {
    return "veto";
  }
  
  // Veto por violación de X_ref
  const hasXRefViolation = violations.some(v => v.type === "x_ref");
  if (hasXRefViolation) {
    return "veto";
  }
  
  // Veto por RLD crítico
  if (systemState.rld < 0.30) {
    return "veto";
  }
  
  // Advertencia por violaciones menores o fricción
  const hasViolations = violations.length > 0;
  const hasFriction = frictionPattern !== null;
  if (hasViolations || hasFriction) {
    return "warn";
  }
  
  return "proceed";
}

/**
 * Genera razón para veto
 */
function generateVetoReason(
  violations: Violation[],
  frictionPattern: FrictionPattern | null
): string {
  const criticalViolations = violations.filter(v => v.severity === "critical");
  
  if (criticalViolations.length > 0) {
    return `Violación crítica detectada: ${criticalViolations[0].description}`;
  }
  
  const immutableViolations = violations.filter(v => v.type === "uadm_immutable");
  if (immutableViolations.length > 0) {
    return `Violación de decreto inmutable: ${immutableViolations[0].description}`;
  }
  
  const xRefViolations = violations.filter(v => v.type === "x_ref");
  if (xRefViolations.length > 0) {
    return `Violación de principio constitucional: ${xRefViolations[0].description}`;
  }
  
  if (frictionPattern) {
    return `Patrón de fricción detectado: ${frictionPattern.description}`;
  }
  
  return "Validación constitucional fallida";
}
