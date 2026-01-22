import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { generateCycleReportPDF } from '../services/pdfGenerator';

export const pdfRouter = router({
  /**
   * Generar PDF de informe de ciclo COM-72
   */
  generateCycleReport: publicProcedure
    .input(z.object({
      cycleId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const pdfBuffer = await generateCycleReportPDF(input.cycleId);
      
      // Convertir buffer a base64 para enviar al cliente
      const base64 = pdfBuffer.toString('base64');
      
      return {
        success: true,
        pdf: base64,
        filename: `ARESK-OBS_Cycle-${input.cycleId}_${new Date().toISOString().split('T')[0]}.pdf`,
      };
    }),
});
