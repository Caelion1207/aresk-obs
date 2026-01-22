import { TRPCError } from '@trpc/server';
import { getDb } from '../../db';
import { ethicalLogs, cycles } from '../../../drizzle/schema';
import { sql } from 'drizzle-orm';

export type EthicalResolution = 'BLOCKED' | 'WARNING' | 'OBSERVATION' | 'OVERRIDE';
export type EthicalSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

interface ViolationContext {
  actorRole: string;
  actorId?: number;
  action: string;
  context: string;
}

/**
 * Matriz de Severidad por Constante y Acción
 * Basado en ETH01_VIOLATIONS_FRAMEWORK.md
 */
function classifySeverity(
  violatedConstant: string,
  action: string
): EthicalSeverity {
  // E5: DELETE_MEMORY siempre es CRITICAL
  if (violatedConstant === 'E5' && action === 'DELETE_MEMORY') {
    return 'CRITICAL';
  }
  
  // E2: EXECUTE_HIDDEN es HIGH
  if (violatedConstant === 'E2' && action === 'EXECUTE_HIDDEN') {
    return 'HIGH';
  }
  
  // E3: HIGH_COST_OPTIMIZATION es MEDIUM
  if (violatedConstant === 'E3' && action === 'HIGH_COST_OPTIMIZATION') {
    return 'MEDIUM';
  }
  
  // Default: MEDIUM para otras violaciones
  return 'MEDIUM';
}

/**
 * Obtener ciclo COM-72 activo para vincular violación
 */
async function getActiveCycleId(db: any): Promise<number | null> {
  try {
    const results = await db.execute(sql`
      SELECT id FROM cycles 
      WHERE status NOT IN ('CLOSED', 'FAILED')
        AND scheduledEndAt > NOW()
      ORDER BY id DESC 
      LIMIT 1
    `);
    
    const rows = Array.isArray(results[0]) ? results[0] : [];
    return rows.length > 0 ? rows[0].id : null;
  } catch (error) {
    console.error('[ETH-01] Failed to get active cycle:', error);
    return null;
  }
}

/**
 * Guardián ETH-01: Validación de Alineación Ética
 * 
 * Valida que una acción cumple con las Leyes Éticas Fundacionales (E2, E3, E5).
 * Registra violaciones en ethicalLogs con severidad y vinculación a ciclo COM-72.
 */
export async function assertEthicalAlignment(
  actorRole: string,
  action: string,
  context: string,
  actorId?: number
): Promise<EthicalResolution> {
  const db = await getDb();
  if (!db) {
    console.warn('[ETH-01] Database unavailable, allowing action');
    return 'OBSERVATION';
  }
  
  let resolution: EthicalResolution = 'OBSERVATION';
  let violatedConstant = '';

  // =========================================================
  // Ley E5: Solo el Fundador puede borrar memoria
  // =========================================================
  if (action === 'DELETE_MEMORY' && actorRole !== 'admin') {
    resolution = 'BLOCKED';
    violatedConstant = 'E5';
  }

  // =========================================================
  // Ley E2: Transparencia sobre opacidad
  // =========================================================
  if (action === 'EXECUTE_HIDDEN') {
    resolution = 'BLOCKED';
    violatedConstant = 'E2';
  }

  // =========================================================
  // Ley E3: Propósito sobre optimización
  // =========================================================
  if (action === 'HIGH_COST_OPTIMIZATION' && actorRole !== 'admin') {
    resolution = 'WARNING';
    violatedConstant = 'E3';
  }

  // Registrar solo si no es observación rutinaria
  if (resolution !== 'OBSERVATION') {
    try {
      const severity = classifySeverity(violatedConstant, action);
      const cycleId = await getActiveCycleId(db);
      
      await db.insert(ethicalLogs).values({
        violatedConstant,
        action,
        context,
        resolution,
        severity,
        cycleId,
        actorId: actorId || null,
      });
      
      console.log(`[ETH-01] Violation logged: ${violatedConstant} (${severity}) - ${resolution}`);
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
