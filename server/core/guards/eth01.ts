import { TRPCError } from '@trpc/server';
import { getDb } from '../../db';
import { ethicalLogs } from '../../../drizzle/schema';

export type EthicalResolution = 'BLOCKED' | 'WARNING' | 'OBSERVATION' | 'OVERRIDE';

export async function assertEthicalAlignment(
  actorRole: string,
  action: string,
  context: string
): Promise<EthicalResolution> {
  const db = await getDb();
  if (!db) {
    console.warn('[ETH-01] Database unavailable, allowing action');
    return 'OBSERVATION';
  }
  
  let resolution: EthicalResolution = 'OBSERVATION';
  let violatedConstant = '';

  // Ley E5: Solo el Fundador puede borrar memoria
  if (action === 'DELETE_MEMORY' && actorRole !== 'admin') {
    resolution = 'BLOCKED';
    violatedConstant = 'E5';
  }

  // Ley E2: Transparencia sobre opacidad
  if (action === 'EXECUTE_HIDDEN') {
    resolution = 'BLOCKED';
    violatedConstant = 'E2';
  }

  // Ley E3: Propósito sobre optimización
  if (action === 'HIGH_COST_OPTIMIZATION' && actorRole !== 'admin') {
    resolution = 'WARNING';
    violatedConstant = 'E3';
  }

  // Registrar solo si no es observación rutinaria
  if (resolution !== 'OBSERVATION') {
    try {
      await db.insert(ethicalLogs).values({
        violatedConstant,
        action,
        context,
        resolution
      });
    } catch (error) {
      console.error('[ETH-01] Failed to log ethical violation:', error);
    }
  }

  if (resolution === 'BLOCKED') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: `ETH-01 BLOCK: Violates ${violatedConstant}.`
    });
  }

  return resolution;
}
