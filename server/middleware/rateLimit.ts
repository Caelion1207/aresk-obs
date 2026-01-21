/**
 * server/middleware/rateLimit.ts
 * 
 * Rate limiting middleware con Redis
 * 
 * Límites:
 * - 100 req/min por usuario (procedimientos normales)
 * - 10 req/min para endpoints admin
 * - Logs de abuso automáticos
 */

import { TRPCError } from "@trpc/server";
import Redis from "ioredis";

// Cliente Redis (singleton)
let redisClient: Redis | null = null;

/**
 * Inicializa cliente Redis
 */
function getRedisClient(): Redis {
  if (!redisClient) {
    // En desarrollo, usar Redis local o mock
    // En producción, usar REDIS_URL del entorno
    const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
    
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });
      
      redisClient.on("error", (error) => {
        console.error("[RATE_LIMIT] Redis error:", error.message);
      });
      
      redisClient.on("connect", () => {
        console.log("[RATE_LIMIT] Redis connected");
      });
    } catch (error: any) {
      console.error("[RATE_LIMIT] Failed to initialize Redis:", error.message);
      throw error;
    }
  }
  
  return redisClient;
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
  try {
    const redis = getRedisClient();
    
    // Conectar si no está conectado
    if (redis.status !== "ready") {
      await redis.connect();
    }
    
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
    
    // 4. Establecer expiración
    multi.expire(key, windowSeconds);
    
    const results = await multi.exec();
    
    if (!results) {
      // Si Redis falla, permitir request (fail-open)
      console.warn("[RATE_LIMIT] Redis multi.exec failed, allowing request");
      return { allowed: true, remaining: limit, resetAt: now + windowSeconds * 1000 };
    }
    
    const count = (results[1]?.[1] as number) || 0;
    const allowed = count < limit;
    const remaining = Math.max(0, limit - count - 1);
    const resetAt = now + windowSeconds * 1000;
    
    return { allowed, remaining, resetAt };
  } catch (error: any) {
    // Si Redis falla, permitir request (fail-open)
    console.error("[RATE_LIMIT] Error checking rate limit:", error.message);
    return { allowed: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
  }
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
    await redis.expire(key, 86400); // 24 horas
    
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
 * Cierra conexión Redis (para shutdown limpio)
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
