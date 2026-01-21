/**
 * server/infra/crypto.ts
 * 
 * Funciones criptográficas para integridad de auditoría
 * - calculateLogHash: Calcula SHA-256 de un log con canonical JSON
 * - stripHashes: Elimina campos hash/prevHash para cálculo limpio
 */

import { createHash } from 'crypto';
import stringify from 'json-stable-stringify';

/**
 * Tipo genérico de log de auditoría
 */
export interface AuditLog {
  userId: number;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  hash?: string;
  prevHash?: string | null;
}

/**
 * Calcula el hash SHA-256 de un log de auditoría
 * 
 * @param log - Log de auditoría (sin hash/prevHash)
 * @param prevHash - Hash del log anterior en la cadena
 * @returns Hash SHA-256 en formato hexadecimal
 * 
 * Garantías:
 * - Canonical JSON (orden determinístico de claves)
 * - Incluye prevHash para encadenar
 * - Inmune a ataques de reordenamiento
 */
export function calculateLogHash(
  log: Omit<AuditLog, 'hash' | 'prevHash'>,
  prevHash: string | null
): string {
  // Crear objeto limpio sin hash/prevHash
  const cleanLog = stripHashes(log);
  
  // Agregar prevHash al payload
  const payload = {
    ...cleanLog,
    prevHash: prevHash || 'GENESIS',
    // Convertir Date a ISO string para serialización determinística
    timestamp: cleanLog.timestamp instanceof Date 
      ? cleanLog.timestamp.toISOString() 
      : cleanLog.timestamp
  };
  
  // Canonical JSON (orden alfabético de claves)
  const canonical = stringify(payload) || '';
  
  // SHA-256
  return createHash('sha256')
    .update(canonical, 'utf8')
    .digest('hex');
}

/**
 * Elimina campos hash y prevHash de un objeto
 * 
 * @param obj - Objeto a limpiar
 * @returns Objeto sin hash/prevHash
 */
export function stripHashes<T extends Record<string, any>>(obj: T): Omit<T, 'hash' | 'prevHash'> {
  const { hash, prevHash, ...clean } = obj;
  return clean as Omit<T, 'hash' | 'prevHash'>;
}

/**
 * Verifica la integridad de un log contra su hash
 * 
 * @param log - Log completo con hash
 * @param prevHash - Hash del log anterior
 * @returns true si el hash es válido
 */
export function verifyLogHash(log: AuditLog, prevHash: string | null): boolean {
  if (!log.hash) {
    throw new Error('Log does not have a hash field');
  }
  
  const cleanLog = stripHashes(log);
  const expectedHash = calculateLogHash(cleanLog, prevHash);
  
  return log.hash === expectedHash;
}

/**
 * Verifica la integridad de una cadena completa de logs
 * 
 * @param logs - Array de logs ordenados cronológicamente
 * @returns Objeto con resultado de verificación
 */
export function verifyChainIntegrity(logs: AuditLog[]): {
  valid: boolean;
  brokenAt?: number;
  expectedHash?: string;
  actualHash?: string;
} {
  if (logs.length === 0) {
    return { valid: true };
  }
  
  let prevHash: string | null = null;
  
  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];
    
    // Verificar que prevHash coincide
    if (log.prevHash !== prevHash) {
      return {
        valid: false,
        brokenAt: i,
        expectedHash: prevHash || 'GENESIS',
        actualHash: log.prevHash || 'null'
      };
    }
    
    // Verificar hash del log
    if (!verifyLogHash(log, prevHash)) {
      const expectedHash = calculateLogHash(stripHashes(log), prevHash);
      return {
        valid: false,
        brokenAt: i,
        expectedHash,
        actualHash: log.hash
      };
    }
    
    prevHash = log.hash!;
  }
  
  return { valid: true };
}
