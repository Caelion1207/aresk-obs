import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { experiments, experimentInteractions } from "../../drizzle/schema/experiments";
import { eq, inArray } from "drizzle-orm";

export const experimentsRouter = router({
  /**
   * Obtener comparación de experimentos por IDs
   */
  getComparison: publicProcedure
    .input(z.object({
      experimentIds: z.array(z.string()).min(2).max(10),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const results = await db
        .select()
        .from(experiments)
        .where(inArray(experiments.experimentId, input.experimentIds));

      return results;
    }),

  /**
   * Obtener interacciones de un experimento
   */
  getInteractions: publicProcedure
    .input(z.object({
      experimentId: z.string(),
      limit: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(experimentInteractions)
        .where(eq(experimentInteractions.experimentId, input.experimentId))
        .orderBy(experimentInteractions.interactionIndex);

      if (input.limit) {
        query = query.limit(input.limit) as any;
      }

      return await query;
    }),

  /**
   * Obtener distribución de métricas de un experimento
   */
  getMetricsDistribution: publicProcedure
    .input(z.object({
      experimentId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const interactions = await db
        .select({
          omegaSem: experimentInteractions.omegaSem,
          epsilonEff: experimentInteractions.epsilonEff,
          vLyapunov: experimentInteractions.vLyapunov,
          hDiv: experimentInteractions.hDiv,
        })
        .from(experimentInteractions)
        .where(eq(experimentInteractions.experimentId, input.experimentId));

      return interactions;
    }),

  /**
   * Obtener tendencia temporal de métricas
   */
  getTemporalTrend: publicProcedure
    .input(z.object({
      experimentId: z.string(),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const interactions = await db
        .select({
          index: experimentInteractions.interactionIndex,
          omegaSem: experimentInteractions.omegaSem,
          epsilonEff: experimentInteractions.epsilonEff,
          vLyapunov: experimentInteractions.vLyapunov,
          hDiv: experimentInteractions.hDiv,
        })
        .from(experimentInteractions)
        .where(eq(experimentInteractions.experimentId, input.experimentId))
        .orderBy(experimentInteractions.interactionIndex);

      return interactions;
    }),

  /**
   * Obtener todos los experimentos
   */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db.select().from(experiments);
  }),
});
