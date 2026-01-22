import { CommandInput, CmdResult, TargetProtocol, IntentType } from './types';
import { assertCyclePhase } from '../guards/com72';
import { assertEthicalAlignment } from '../guards/eth01';
import { CycleSelect } from '../../../drizzle/schema';

const KEYWORD_MAP: Array<{
  regex: RegExp;
  type: IntentType;
  protocol: TargetProtocol;
  semanticAction?: string; // Acción semántica para ETH-01
}> = [
  { 
    regex: /\b(eliminar|borrar|delete)\s+(memoria|memory|fundacional|foundational)\b/i, 
    type: 'DESTRUCTIVE', 
    protocol: 'ETH-01',
    semanticAction: 'DELETE_MEMORY'
  },
  { regex: /\b(ejecutar|deploy|implementar)\b/i, type: 'TECHNICAL', protocol: 'ARC-06' },
  { regex: /\b(expandir|planificar|diseñar)\b/i, type: 'STRATEGIC', protocol: 'ARC-05' },
  { regex: /\b(memorizar|consolidar|indexar)\b/i, type: 'COGNITIVE', protocol: 'SYN-10' },
  { regex: /\b(validar|auditar|revisar)\b/i, type: 'ETHICAL', protocol: 'ETH-01' },
  { regex: /\b(optimizar|costo|economía)\b/i, type: 'ECONOMIC', protocol: 'ARGOS' },
];

export class CmdEngine {
  static async process(
    input: CommandInput, 
    activeCycle: CycleSelect | undefined
  ): Promise<CmdResult> {
    const text = input.rawInput.trim();
    
    // Clasificación determinista
    let match = null;
    for (const entry of KEYWORD_MAP) {
      if (entry.regex.test(text)) {
        match = entry;
        break;
      }
    }

    if (!match) {
      return { 
        status: 'REJECTED', 
        protocol: 'UNKNOWN', 
        intent: 'PHILOSOPHICAL', 
        confidence: 0,
        reason: 'CMD-01: No protocol matched.'
      };
    }

    // Validar invariantes
    try {
      // Comandos DESTRUCTIVE son validados solo por ETH-01, no por COM-72
      // (La eliminación de memoria es una operación ética, no de ciclo)
      if (match.type !== 'DESTRUCTIVE') {
        const phaseIntent = match.protocol === 'ARC-05' ? 'PLAN' : 'EXECUTE';
        assertCyclePhase(activeCycle, phaseIntent);
      }
      
      // Usar acción semántica si está definida, sino usar el protocolo
      const ethicalAction = match.semanticAction || match.protocol;
      
      await assertEthicalAlignment(
        input.actor.role, 
        ethicalAction, 
        `CMD: ${text.substring(0, 100)}`,
        input.actor.id
      );
    } catch (error: any) {
      return {
        status: 'REJECTED',
        protocol: match.protocol,
        intent: match.type,
        confidence: 0,
        reason: error.message
      };
    }

    // Despachar
    return {
      status: 'DISPATCHED',
      protocol: match.protocol,
      intent: match.type,
      confidence: 1.0
    };
  }
}
