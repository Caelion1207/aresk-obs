/**
 * GovernanceDashboard - Panel de control de gobernanza
 * 
 * Muestra el estado en tiempo real de RLD y módulos de gobernanza:
 * - ARGOS, LICURGO, WABUN, AUDIT_INTEGRITY
 * - Riesgos de transferencia de autoridad y colapso normativo
 * - Recomendaciones de acción
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import RLDBreakdown from '@/components/RLDBreakdown';
import { RefreshCw, Activity } from 'lucide-react';

export default function GovernanceDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { data: rldStatus, isLoading, refetch } = trpc.governance.getRLDStatus.useQuery(
    undefined,
    {
      refetchInterval: autoRefresh ? 10000 : false, // Actualizar cada 10 segundos si autoRefresh está activo
    }
  );

  useEffect(() => {
    // Refrescar al montar
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-400">Cargando estado de gobernanza...</div>
        </div>
      </div>
    );
  }

  if (!rldStatus) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Error al cargar estado de gobernanza</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Dashboard de Gobernanza
          </h1>
          <p className="text-slate-400 mt-2">
            Monitoreo en tiempo real de módulos de gobernanza y RLD
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <Activity className={`h-4 w-4 ${autoRefresh ? 'animate-pulse' : ''}`} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Alerta crítica si RLD < 0.3 */}
      {rldStatus.rld < 0.3 && (
        <Card className="p-6 bg-red-900/20 border-red-500/50">
          <div className="flex items-start gap-4">
            <div className="text-red-400 text-4xl">⚠️</div>
            <div>
              <h3 className="text-xl font-bold text-red-400 mb-2">
                ALERTA: RLD Crítico
              </h3>
              <p className="text-slate-300">
                La Reserva de Legitimidad Dinámica está por debajo del umbral crítico (0.3).
                {rldStatus.rld < 0.15 && ' El fundador debe decidir si el sistema no se estabiliza.'}
                {rldStatus.rld < 0.05 && ' SECUENCIA DE ELIMINACIÓN DEBE INICIARSE.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* RLD Breakdown */}
      <RLDBreakdown
        rld={rldStatus.rld}
        modules={rldStatus.modules}
        governanceCapacity={rldStatus.governanceCapacity}
        transferRisk={rldStatus.transferRisk}
        collapseRisk={rldStatus.collapseRisk}
        recommendations={rldStatus.recommendations}
      />

      {/* Información adicional */}
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <h3 className="text-lg font-semibold mb-3">Acerca de RLD</h3>
        <div className="space-y-2 text-sm text-slate-300">
          <p>
            <strong>RLD (Reserva de Legitimidad Dinámica)</strong> es la cantidad de gobernanza efectiva 
            disponible para sostener la acción del sistema sin transferencia de autoridad ni colapso normativo.
          </p>
          <p>
            Operacionalmente, RLD evalúa qué módulos de gobernanza siguen activos y en qué grados:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>ARGOS</strong>: Observador de costos - monitorea actividad económica del sistema</li>
            <li><strong>LICURGO</strong>: Regulador normativo - interviene cuando se detecta inestabilidad</li>
            <li><strong>WABUN</strong>: Memoria semántica - mantiene coherencia del registro histórico</li>
            <li><strong>AUDIT_INTEGRITY</strong>: Integridad de auditoría - verifica cadena de hash</li>
          </ul>
          <p className="mt-3">
            <strong>Umbrales críticos:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>0.7-0.8: Rango estable (óptimo)</li>
            <li>&lt; 0.5: LICURGO debe intervenir</li>
            <li>&lt; 0.3: Intervención humana requerida</li>
            <li>&lt; 0.15: Fundador debe decidir</li>
            <li>&lt; 0.05: Secuencia de eliminación</li>
          </ul>
        </div>
      </Card>

      {/* Footer con timestamp */}
      <div className="text-center text-sm text-slate-500">
        Última actualización: {new Date().toLocaleString()}
        {autoRefresh && ' • Actualizando cada 10 segundos'}
      </div>
    </div>
  );
}
