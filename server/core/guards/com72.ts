import { TRPCError } from '@trpc/server';
import { differenceInHours, isAfter } from 'date-fns';
import { CycleSelect } from '../../../drizzle/schema';

export function assertCyclePhase(
  cycle: CycleSelect | undefined, 
  intent: 'PLAN' | 'EXECUTE' | 'REVIEW'
): void {
  if (!cycle) {
    if (intent !== 'PLAN') {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'COM-72 VIOLATION: No active cycle.'
      });
    }
    return;
  }

  // Máquina de estados
  const validTransitions: Record<string, string[]> = {
    'INIT': ['PLAN', 'EXECUTE'],
    'EXECUTION': ['EXECUTE', 'REVIEW'],
    'REVIEW': ['REVIEW', 'PLAN'],
    'CLOSED': ['PLAN'],
    'FAILED': ['PLAN']
  };

  const allowedIntents = validTransitions[cycle.status] || [];
  if (!allowedIntents.includes(intent)) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: `COM-72 VIOLATION: Cannot ${intent} during ${cycle.status}.`
    });
  }

  // Ciclo expirado
  if (isAfter(new Date(), cycle.scheduledEndAt)) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'COM-72 VIOLATION: Cycle expired.'
    });
  }

  // Ventana de contexto (24h mínimo en INIT)
  if (cycle.status === 'INIT' && intent === 'EXECUTE') {
    const hoursElapsed = differenceInHours(new Date(), cycle.startedAt);
    if (hoursElapsed < 24) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: `COM-72 VIOLATION: Context Window Lock (${hoursElapsed}h/24h).`
      });
    }
  }
}
