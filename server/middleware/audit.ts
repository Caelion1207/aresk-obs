/**
 * server/middleware/audit.ts
 * 
 * Audit Middleware con hash chain inmutable y Mutex global
 * 
 * Garantías:
 * - Serialización de escrituras (Mutex)
 * - Integridad criptográfica (SHA-256 + canonical JSON)
 * - Génesis único e inmutable
 * - No recrea génesis en reinicios
 */

import { Mutex } from "async-mutex";
import { getDb } from "../db";
import { auditLogs } from "../../drizzle/auditLogs";
import { calculateLogHash } from "../infra/crypto";
import { desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getLastAuditHash, getGenesisHash } from "../infra/auditBootstrap";

// Mutex global para serializar escrituras de audit
const auditMutex = new Mutex();

// Cache de último prevHash (rehidratación)
let lastPrevHash: string | null = null;
let cacheInitialized = false;

/**
 * Inicializa el cache de prevHash desde la última entrada
 * 
 * Si no hay logs (solo génesis), usa el hash del génesis.
 */
async function initializePrevHashCache(): Promise<void> {
  if (cacheInitialized) return;
  
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available for audit initialization",
    });
  }
  
  // Obtener última entrada (excluyendo génesis si es el único)
  const lastEntry = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.id))
    .limit(1);
  
  if (lastEntry.length > 0) {
    lastPrevHash = lastEntry[0]!.hash;
    console.log("🔄 Audit cache initialized from last entry (hash:", lastPrevHash?.substring(0, 8), "...)");
  } else {
    // No hay logs: usar hash del génesis
    const genesisHash = await getGenesisHash();
    if (!genesisHash) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Genesis block not found. Run bootstrap first.",
      });
    }
    lastPrevHash = genesisHash;
    console.log("🔄 Audit cache initialized from genesis (hash:", lastPrevHash.substring(0, 8), "...)");
  }
  
  cacheInitialized = true;
}

/**
 * Escribe entrada de auditoría con hash chain
 * 
 * @param entry - Datos de la entrada (sin hash ni prevHash)
 * @returns Hash de la entrada creada
 */
export async function writeAuditLog(entry: {
  userId: number;
  endpoint: string;
  method: string;
  statusCode: number;
  duration: number;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}): Promise<string> {
  // Adquirir Mutex para serializar escrituras
  const release = await auditMutex.acquire();
  
  try {
    // Inicializar cache si es necesario
    await initializePrevHashCache();
    
    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available for audit",
      });
    }
    
    // Preparar entrada con prevHash
    const timestamp = new Date();
    const entryWithPrev = {
      ...entry,
      timestamp,
      prevHash: lastPrevHash!,
    };
    
    // Calcular hash
    const hash = calculateLogHash({
      userId: entry.userId,
      endpoint: entry.endpoint,
      method: entry.method,
      type: "STANDARD",
      statusCode: entry.statusCode,
      duration: entry.duration,
      timestamp,
      ip: entry.ip || undefined,
      userAgent: entry.userAgent || undefined,
      requestId: entry.requestId || undefined,
    }, lastPrevHash!);
    
    // Insertar en base de datos
    await db.insert(auditLogs).values({
      userId: entry.userId,
      endpoint: entry.endpoint,
      method: entry.method,
      type: "STANDARD", // Logs normales son STANDARD
      statusCode: entry.statusCode,
      duration: entry.duration,
      timestamp,
      ip: entry.ip || null,
      userAgent: entry.userAgent || null,
      requestId: entry.requestId || null,
      hash,
      prevHash: lastPrevHash!,
    });
    
    // Actualizar cache
    lastPrevHash = hash;
    
    return hash;
  } finally {
    release();
  }
}

/**
 * Middleware de auditoría para procedimientos tRPC
 * 
 * Captura:
 * - userId del contexto
 * - Endpoint (path del procedimiento)
 * - Method (query/mutation)
 * - StatusCode (200 éxito, 500 error)
 * - Duration (tiempo de ejecución)
 * 
 * @example
 * ```ts
 * const auditedProcedure = protectedProcedure.use(auditMiddleware);
 * 
 * session: {
 *   list: auditedProcedure.query(async ({ ctx }) => {
 *     // Lógica del procedimiento
 *   }),
 * }
 * ```
 */
export const auditMiddleware = async (opts: any) => {
  const { ctx, next, path, type } = opts;
  
  // Solo auditar procedimientos protegidos
  if (!ctx.user) {
    return next();
  }
  
  const userId = ctx.user.id;
  const endpoint = path;
  const method = type.toUpperCase(); // QUERY o MUTATION
  
  const startTime = Date.now();
  
  try {
    // Ejecutar procedimiento
    const result = await next();
    
    const duration = Date.now() - startTime;
    
    // Escribir entrada de auditoría (éxito)
    await writeAuditLog({
      userId,
      endpoint,
      method,
      statusCode: 200,
      duration,
      ip: ctx.req?.ip || null,
      userAgent: ctx.req?.headers?.["user-agent"] || null,
      requestId: ctx.req?.headers?.["x-request-id"] as string || null,
    });
    
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Escribir entrada de auditoría (error)
    await writeAuditLog({
      userId,
      endpoint,
      method,
      statusCode: error.code === "UNAUTHORIZED" ? 401 : 500,
      duration,
      ip: ctx.req?.ip || null,
      userAgent: ctx.req?.headers?.["user-agent"] || null,
      requestId: ctx.req?.headers?.["x-request-id"] as string || null,
    });
    
    // Re-lanzar error
    throw error;
  }
};

/**
 * Resetea el cache de prevHash (solo para tests)
 */
export function resetAuditCache(): void {
  lastPrevHash = null;
  cacheInitialized = false;
}
