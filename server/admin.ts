/**
 * server/routers/admin.ts
 * 
 * Procedimientos administrativos para monitoreo y auditoría
 * 
 * Requiere rol admin en ctx.user
 */

import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import { getDb } from "./db";
import { auditLogs } from "../drizzle/auditLogs";
import { desc, and, gte, lte, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminRateLimitMiddleware, getAbuseStats } from "./middleware/rateLimit";
import { checkSchemaHealth } from "./db/validateSchema";
import { stripHashes } from "./infra/crypto";

/**
 * Middleware para verificar rol admin
 */
const adminProcedure = protectedProcedure.use(async ({ ctx, next }: any) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  
  return next({ ctx });
});

/**
 * Procedimiento admin con rate limiting estricto
 */
const rateLimitedAdminProcedure = adminProcedure.use(adminRateLimitMiddleware);

export const adminRouter = router({
  /**
   * Consulta logs de auditoría
   * 
   * Filtros:
   * - userId: ID del usuario
   * - endpoint: Endpoint del procedimiento
   * - startDate: Fecha de inicio
   * - endDate: Fecha de fin
   * - limit: Límite de resultados (max 100)
   */
  queryAuditLogs: rateLimitedAdminProcedure
    .input(
      z.object({
        userId: z.number().optional(),
        endpoint: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }: any) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }
      
      // Construir filtros
      const filters: any[] = [];
      
      if (input.userId) {
        filters.push(eq(auditLogs.userId, input.userId));
      }
      
      if (input.endpoint) {
        filters.push(eq(auditLogs.endpoint, input.endpoint));
      }
      
      if (input.startDate) {
        filters.push(gte(auditLogs.timestamp, input.startDate));
      }
      
      if (input.endDate) {
        filters.push(lte(auditLogs.timestamp, input.endDate));
      }
      
      // Query con filtros
      const logs = await db
        .select()
        .from(auditLogs)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(auditLogs.timestamp))
        .limit(input.limit)
        .offset(input.offset);
      
      // Contar total (para paginación)
      const totalResult = await db
        .select({ count: auditLogs.id })
        .from(auditLogs)
        .where(filters.length > 0 ? and(...filters) : undefined);
      
      const total = totalResult.length;
      
      return {
        logs: logs.map((log: any) => stripHashes(log)),
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),
  
  /**
   * Obtiene estadísticas de abuso para un usuario
   */
  getAbuseStats: rateLimitedAdminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }: any) => {
      return await getAbuseStats(input.userId);
    }),
  
  /**
   * Health check del sistema
   */
  healthCheck: adminProcedure.query(async () => {
    const schemaHealth = await checkSchemaHealth();
    
    return {
      timestamp: new Date(),
      schema: schemaHealth,
      redis: {
        // TODO: Implementar health check de Redis
        connected: true,
      },
    };
  }),
});
