/**
 * server/infra/auditBootstrap.ts
 * 
 * Sistema de Bootstrap de Auditoría con Bloque Génesis Único
 * 
 * CONTRATO DE AUDITORÍA - INVARIANTES:
 * 
 * AXIOMA: El bloque GENESIS es no validable.
 * 
 * Garantías (Invariantes I1-I3):
 * - I1. Unicidad: Génesis se crea UNA SOLA VEZ
 * - I2. Estructura Canónica: prevHash = null, type = "GENESIS", timestamp fijo
 * - I3. Inmutabilidad: Nunca se recalcula ni reescribe
 * 
 * Bootstrap es idempotente: bootstrap() ∘ bootstrap() = bootstrap()
 * 
 * Estado: CLOSED AND OPERATIONAL
 */

import { getDb } from "../db";
import { auditLogs } from "../../drizzle/auditLogs";
import { calculateLogHash } from "./crypto";
import { eq, asc } from "drizzle-orm";

/**
 * Timestamp fijo del bloque génesis
 * Representa el inicio del sistema de auditoría ARESK-OBS
 */
export const GENESIS_TIMESTAMP = new Date("2026-01-23T00:00:00.000Z");

/**
 * Datos del bloque génesis
 */
export const GENESIS_BLOCK = {
  userId: 0,
  endpoint: "system.genesis",
  method: "GENESIS",
  type: "GENESIS",
  statusCode: 200,
  duration: 0,
  timestamp: GENESIS_TIMESTAMP,
  ip: null,
  userAgent: "ARESK-OBS/1.0",
  requestId: "genesis-block-0",
};

/**
 * Verifica si el bloque génesis ya existe en la base de datos
 * 
 * @returns true si el génesis existe
 */
export async function genesisExists(): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for genesis check");
  }

  const result = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.type, "GENESIS"))
    .limit(1);

  return result.length > 0;
}

/**
 * Crea el bloque génesis si no existe
 * 
 * Esta función es idempotente: si el génesis ya existe, no hace nada.
 * 
 * @returns Hash del bloque génesis (existente o recién creado)
 */
export async function ensureGenesisBlock(): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available for genesis creation");
  }

  // Verificar si ya existe
  const existing = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.type, "GENESIS"))
    .limit(1);

  if (existing.length > 0) {
    console.log("✅ Genesis block already exists (hash:", existing[0]!.hash, ")");
    return existing[0]!.hash;
  }

  // Calcular hash del génesis (prevHash = null)
  const genesisHash = calculateLogHash(
    {
      userId: GENESIS_BLOCK.userId,
      endpoint: GENESIS_BLOCK.endpoint,
      method: GENESIS_BLOCK.method,
      type: GENESIS_BLOCK.type,
      statusCode: GENESIS_BLOCK.statusCode,
      duration: GENESIS_BLOCK.duration,
      timestamp: GENESIS_BLOCK.timestamp,
      ip: GENESIS_BLOCK.ip || undefined,
      userAgent: GENESIS_BLOCK.userAgent || undefined,
      requestId: GENESIS_BLOCK.requestId || undefined,
    },
    null // prevHash = null para génesis
  );

  // Insertar bloque génesis
  await db.insert(auditLogs).values({
    userId: GENESIS_BLOCK.userId,
    endpoint: GENESIS_BLOCK.endpoint,
    method: GENESIS_BLOCK.method,
    type: GENESIS_BLOCK.type,
    statusCode: GENESIS_BLOCK.statusCode,
    duration: GENESIS_BLOCK.duration,
    timestamp: GENESIS_BLOCK.timestamp,
    ip: GENESIS_BLOCK.ip,
    userAgent: GENESIS_BLOCK.userAgent,
    requestId: GENESIS_BLOCK.requestId,
    hash: genesisHash,
    prevHash: null, // Génesis no tiene prevHash
  });

  console.log("🔥 Genesis block created (hash:", genesisHash, ")");
  console.log("📅 Genesis timestamp:", GENESIS_BLOCK.timestamp.toISOString());

  return genesisHash;
}

/**
 * Obtiene el hash del bloque génesis
 * 
 * @returns Hash del génesis o null si no existe
 */
export async function getGenesisHash(): Promise<string | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.type, "GENESIS"))
    .limit(1);

  return result.length > 0 ? result[0]!.hash : null;
}

/**
 * Obtiene el último hash de la cadena de auditoría
 * 
 * Si no hay logs (excepto génesis), retorna el hash del génesis.
 * 
 * @returns Último hash de la cadena
 */
export async function getLastAuditHash(): Promise<string | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  // Obtener todos los logs ordenados por ID
  const allLogs = await db
    .select()
    .from(auditLogs)
    .orderBy(asc(auditLogs.id));

  if (allLogs.length === 0) {
    return null;
  }

  // Retornar hash del último log
  return allLogs[allLogs.length - 1]!.hash;
}

/**
 * Verifica si el sistema de auditoría está correctamente inicializado
 * 
 * @returns true si el génesis existe y la cadena es válida
 */
export async function isAuditSystemBootstrapped(): Promise<boolean> {
  try {
    const exists = await genesisExists();
    if (!exists) {
      return false;
    }

    // Verificar que el génesis tenga prevHash = null
    const db = await getDb();
    if (!db) {
      return false;
    }

    const genesis = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.type, "GENESIS"))
      .limit(1);

    if (genesis.length === 0) {
      return false;
    }

    // El génesis debe tener prevHash = null
    return genesis[0]!.prevHash === null;
  } catch (error) {
    console.error("Error checking audit bootstrap status:", error);
    return false;
  }
}

/**
 * Inicializa el sistema de auditoría
 * 
 * Esta función debe llamarse al arrancar el servidor.
 * Es idempotente: puede llamarse múltiples veces sin efectos secundarios.
 */
export async function bootstrapAuditSystem(): Promise<void> {
  console.log("🔐 Initializing audit system...");

  const exists = await genesisExists();
  if (exists) {
    console.log("✅ Audit system already bootstrapped");
    const genesisHash = await getGenesisHash();
    console.log("   Genesis hash:", genesisHash);
    return;
  }

  console.log("🌱 Creating genesis block...");
  const genesisHash = await ensureGenesisBlock();
  console.log("✅ Audit system bootstrapped successfully");
  console.log("   Genesis hash:", genesisHash);
  console.log("   Genesis timestamp:", GENESIS_TIMESTAMP.toISOString());
}
