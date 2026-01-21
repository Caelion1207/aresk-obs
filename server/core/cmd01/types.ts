export type IntentType = 
  | 'TECHNICAL'    // Ejecución técnica (ARC-06)
  | 'STRATEGIC'    // Planificación estratégica (ARC-05)
  | 'COGNITIVE'    // Consolidación de memoria (SYN-10)
  | 'ETHICAL'      // Validación ética (ETH-01)
  | 'ECONOMIC'     // Optimización de costos (ARGOS)
  | 'PHILOSOPHICAL'; // Reflexión sin acción

export type TargetProtocol = 
  | 'ARC-06'   // Protocolo de ejecución técnica
  | 'ARC-05'   // Protocolo de planificación
  | 'SYN-10'   // Protocolo de síntesis cognitiva
  | 'ETH-01'   // Protocolo ético
  | 'ARGOS'    // Protocolo económico
  | 'UNKNOWN'; // Sin protocolo identificado

export interface CommandInput {
  rawInput: string;
  actor: {
    id: number;
    role: string;
  };
}

export interface CmdResult {
  status: 'DISPATCHED' | 'REJECTED';
  protocol: TargetProtocol;
  intent: IntentType;
  confidence: number;
  reason?: string;
}
