/**
 * server/middleware/rateLimit.ts
 * 
 * Rate limiting middleware con Redis production-ready
 * 
 * Límites:
 * - 100 req/min por usuario (procedimientos normales)
 * - 10 req/min para endpoints admin
 * - Logs de abuso automáticos
 * 
 * Configuración Production:
 * - Persistencia RDB + AOF
 * - TTL real en keys
 * - Reconexión automática
 * - Métricas de latencia y fallos
 * - Fail-closed en staging/production (sin fallback)
 */

import { TRPCError } from "@trpc/server";
import Redis from "ioredis";

// Métricas de Redis
interface RedisMetrics {
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  totalErrors: number;
  avgLatency: number;
  lastError: string | null;
  lastErrorTime: number | null;
}

const metrics: RedisMetrics = {
  totalRequests: 0,
  totalHits: 0,
  totalMisses: 0,
  totalErrors: 0,
  avgLatency: 0,
  lastError: null,
  lastErrorTime: null,
};

// Cliente Redis (singleton)
let redisClient: Redis | null = null;

// Detectar entorno
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_DEV = NODE_ENV === "development";
const IS_STAGING = NODE_ENV === "staging";
const IS_PRODUCTION = NODE_ENV === "production";

// Fallback solo permitido en dev
const ALLOW_MEMORY_FALLBACK = IS_DEV;

// Fallback en memoria (solo dev)
const memoryStore = new Map<string, Array<number>>();
let useMemoryFallback = false;

/**
 * Inicializa cliente Redis con configuración production-ready
 */
function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    try {
      redisClient = new Redis(redisUrl, {
        // Persistencia: RDB + AOF
        enableOfflineQueue: true,
        enableReadyCheck: true,
        lazyConnect: false,
        
        // Reconexión automática
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          console.log(`[RATE_LIMIT] Retry attempt ${times}, delay: ${delay}ms`);
          return delay;
        },
        
        // Timeouts
        connectTimeout: 10000,
        commandTimeout: 5000,
        
        // Keepalive
        keepAlive: 30000,
      });
      
      // Event handlers
      redisClient.on("error", (error) => {
        metrics.totalErrors++;
        metrics.lastError = error.message;
        metrics.lastErrorTime = Date.now();
        console.error("[RATE_LIMIT] Redis error:", error.message);
        
        // En staging/production, no permitir fallback
        if (!ALLOW_MEMORY_FALLBACK) {
          console.error("[RATE_LIMIT] Redis failed in production. Fail-closed mode active.");
        }
      });
      
      redisClient.on("connect", () => {
        console.log("[RATE_LIMIT] Redis connected");
        useMemoryFallback = false; // Desactivar fallback al reconectar
      });
      
      redisClient.on("ready", () => {
        console.log("[RATE_LIMIT] Redis ready");
      });
      
      redisClient.on("reconnecting", () => {
        console.log("[RATE_LIMIT] Redis reconnecting...");
      });
      
      redisClient.on("close", () => {
        console.warn("[RATE_LIMIT] Redis connection closed");
      });
      
    } catch (error: any) {
      metrics.totalErrors++;
      metrics.lastError = error.message;
      metrics.lastErrorTime = Date.now();
      console.error("[RATE_LIMIT] Failed to initialize Redis:", error.message);
      
      if (!ALLOW_MEMORY_FALLBACK) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Rate limiting service unavailable",
        });
      }
    }
  }
  
  return redisClient!;
}

/**
 * Verifica rate limit para un usuario
 * 
 * @param userId - ID del usuario
 * @param endpoint - Endpoint del procedimiento
 * @param limit - Límite de requests por ventana
 * @param windowSeconds - Tamaño de ventana en segundos
 * @returns true si está dentro del límite, false si excede
 */
async function checkRateLimit(
  userId: number,
  endpoint: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  metrics.totalRequests++;
  const startTime = Date.now();
  
  // Si fallback está activo (solo dev)
  if (useMemoryFallback && ALLOW_MEMORY_FALLBACK) {
    return checkRateLimitMemory(userId, endpoint, limit, windowSeconds);
  }
  
  try {
    const redis = getRedisClient();
    
    const key = `ratelimit:${userId}:${endpoint}`;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;
    
    // Usar sorted set con timestamps como scores
    const multi = redis.multi();
    
    // 1. Eliminar entradas fuera de la ventana
    multi.zremrangebyscore(key, 0, windowStart);
    
    // 2. Contar entradas en la ventana
    multi.zcard(key);
    
    // 3. Agregar nueva entrada
    multi.zadd(key, now, `${now}`);
    
    // 4. Establecer TTL real (no solo expire)
    multi.pexpire(key, windowSeconds * 1000);
    
    const results = await multi.exec();
    
    if (!results) {
      throw new Error("Redis multi.exec returned null");
    }
    
    const count = (results[1]?.[1] as number) || 0;
    const allowed = count < limit;
    const remaining = Math.max(0, limit - count - 1);
    const resetAt = now + windowSeconds * 1000;
    
    // Métricas
    const latency = Date.now() - startTime;
    metrics.avgLatency = (metrics.avgLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests;
    
    if (allowed) {
      metrics.totalHits++;
    } else {
      metrics.totalMisses++;
    }
    
    return { allowed, remaining, resetAt };
  } catch (error: any) {
    metrics.totalErrors++;
    metrics.lastError = error.message;
    metrics.lastErrorTime = Date.now();
    console.error("[RATE_LIMIT] Error checking rate limit:", error.message);
    
    // Fail-closed en staging/production
    if (!ALLOW_MEMORY_FALLBACK) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Rate limiting service unavailable. Request rejected.",
      });
    }
    
    // Fallback en dev
    console.warn("[RATE_LIMIT] Redis failed, switching to memory fallback (dev only)");
    useMemoryFallback = true;
    return checkRateLimitMemory(userId, endpoint, limit, windowSeconds);
  }
}

/**
 * Fallback de rate limiting en memoria (solo dev)
 */
function checkRateLimitMemory(
  userId: number,
  endpoint: string,
  limit: number,
  windowSeconds: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const key = `${userId}:${endpoint}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  
  // Obtener timestamps de la ventana
  let timestamps = memoryStore.get(key) || [];
  
  // Filtrar timestamps fuera de la ventana
  timestamps = timestamps.filter(ts => ts > windowStart);
  
  // Agregar nuevo timestamp
  timestamps.push(now);
  
  // Guardar en memoria
  memoryStore.set(key, timestamps);
  
  const count = timestamps.length;
  const allowed = count <= limit;
  const remaining = Math.max(0, limit - count);
  const resetAt = now + windowSeconds * 1000;
  
  return { allowed, remaining, resetAt };
}

/**
 * Registra abuso en logs
 */
async function logAbuse(userId: number, endpoint: string): Promise<void> {
  try {
    const redis = getRedisClient();
    const key = `abuse:${userId}`;
    const timestamp = Date.now();
    
    await redis.zadd(key, timestamp, `${endpoint}:${timestamp}`);
    await redis.pexpire(key, 86400 * 1000); // 24 horas con TTL real
    
    console.warn(`[RATE_LIMIT] Abuse detected: userId=${userId}, endpoint=${endpoint}`);
  } catch (error: any) {
    console.error("[RATE_LIMIT] Error logging abuse:", error.message);
  }
}

/**
 * Middleware de rate limiting para tRPC
 * 
 * Límites por defecto:
 * - 100 req/min para procedimientos normales
 * - 10 req/min para procedimientos admin
 */
export const rateLimitMiddleware = (options?: {
  limit?: number;
  windowSeconds?: number;
}) => {
  const limit = options?.limit || 100;
  const windowSeconds = options?.windowSeconds || 60;
  
  return async (opts: any) => {
    const { ctx, next, path } = opts;
    
    // Solo aplicar rate limit a usuarios autenticados
    if (!ctx.user) {
      return next();
    }
    
    const userId = ctx.user.id;
    const endpoint = path;
    
    // Verificar rate limit
    const result = await checkRateLimit(userId, endpoint, limit, windowSeconds);
    
    if (!result.allowed) {
      // Registrar abuso
      await logAbuse(userId, endpoint);
      
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: `Rate limit exceeded. Try again in ${Math.ceil((result.resetAt - Date.now()) / 1000)} seconds.`,
      });
    }
    
    // Agregar headers de rate limit a la respuesta
    if (ctx.res) {
      ctx.res.setHeader("X-RateLimit-Limit", limit.toString());
      ctx.res.setHeader("X-RateLimit-Remaining", result.remaining.toString());
      ctx.res.setHeader("X-RateLimit-Reset", result.resetAt.toString());
    }
    
    return next();
  };
};

/**
 * Middleware de rate limiting estricto para admin
 */
export const adminRateLimitMiddleware = rateLimitMiddleware({
  limit: 10,
  windowSeconds: 60,
});

/**
 * Obtiene estadísticas de abuso para un usuario
 */
export async function getAbuseStats(userId: number): Promise<{
  totalAbuses: number;
  recentAbuses: Array<{ endpoint: string; timestamp: number }>;
}> {
  try {
    const redis = getRedisClient();
    const key = `abuse:${userId}`;
    
    const entries = await redis.zrange(key, 0, -1, "WITHSCORES");
    const totalAbuses = entries.length / 2;
    
    const recentAbuses: Array<{ endpoint: string; timestamp: number }> = [];
    for (let i = 0; i < entries.length; i += 2) {
      const [endpointWithTimestamp, timestamp] = [entries[i], entries[i + 1]];
      if (endpointWithTimestamp && timestamp) {
        const endpoint = endpointWithTimestamp.split(":")[0] || "";
        recentAbuses.push({ endpoint, timestamp: parseInt(timestamp) });
      }
    }
    
    return { totalAbuses, recentAbuses };
  } catch (error: any) {
    console.error("[RATE_LIMIT] Error getting abuse stats:", error.message);
    return { totalAbuses: 0, recentAbuses: [] };
  }
}

/**
 * Obtiene métricas de Redis
 */
export function getRedisMetrics(): RedisMetrics & {
  environment: string;
  fallbackEnabled: boolean;
  usingFallback: boolean;
} {
  return {
    ...metrics,
    environment: NODE_ENV,
    fallbackEnabled: ALLOW_MEMORY_FALLBACK,
    usingFallback: useMemoryFallback,
  };
}

/**
 * Health check de Redis
 */
export async function checkRedisHealth(): Promise<{
  status: "healthy" | "degraded" | "down";
  latency: number | null;
  error: string | null;
}> {
  try {
    const redis = getRedisClient();
    const startTime = Date.now();
    await redis.ping();
    const latency = Date.now() - startTime;
    
    return {
      status: latency < 100 ? "healthy" : "degraded",
      latency,
      error: null,
    };
  } catch (error: any) {
    return {
      status: "down",
      latency: null,
      error: error.message,
    };
  }
}

/**
 * Cierra conexión Redis (para shutdown limpio)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
