/**
 * Tests para Sistema de Auditoría con Génesis Único
 * 
 * Valida que el bloque génesis se cree correctamente y la cadena sea válida.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  genesisExists,
  getGenesisHash,
  isAuditSystemBootstrapped,
  bootstrapAuditSystem,
  GENESIS_TIMESTAMP
} from './auditBootstrap';
import { verifyAuditChainIntegrity } from './emergency';

describe('Sistema de Auditoría con Génesis Único', () => {
  beforeAll(async () => {
    // Asegurar que el sistema esté inicializado
    await bootstrapAuditSystem();
  });

  it('debe tener un bloque génesis existente', async () => {
    const exists = await genesisExists();
    expect(exists).toBe(true);
  });

  it('debe retornar el hash del génesis', async () => {
    const hash = await getGenesisHash();
    expect(hash).toBeTruthy();
    expect(typeof hash).toBe('string');
    expect(hash!.length).toBe(64); // SHA-256 hex = 64 caracteres
  });

  it('debe confirmar que el sistema está correctamente inicializado', async () => {
    const isBootstrapped = await isAuditSystemBootstrapped();
    expect(isBootstrapped).toBe(true);
  });

  it('debe tener timestamp fijo de génesis', () => {
    expect(GENESIS_TIMESTAMP.toISOString()).toBe('2026-01-23T00:00:00.000Z');
  });

  it('debe validar la integridad de la cadena', async () => {
    const result = await verifyAuditChainIntegrity(1000);
    expect(result.isValid).toBe(true);
    expect(result.details).toBeUndefined();
  });

  it('no debe recrear el génesis en múltiples llamadas', async () => {
    const hash1 = await getGenesisHash();
    
    // Llamar bootstrap nuevamente
    await bootstrapAuditSystem();
    
    const hash2 = await getGenesisHash();
    
    // El hash debe ser el mismo (no se recreó)
    expect(hash2).toBe(hash1);
  });

  it('debe ser idempotente (múltiples bootstraps no causan problemas)', async () => {
    // Llamar bootstrap 3 veces
    await bootstrapAuditSystem();
    await bootstrapAuditSystem();
    await bootstrapAuditSystem();
    
    // El sistema debe seguir válido
    const isBootstrapped = await isAuditSystemBootstrapped();
    expect(isBootstrapped).toBe(true);
    
    const result = await verifyAuditChainIntegrity(1000);
    expect(result.isValid).toBe(true);
  });
});
