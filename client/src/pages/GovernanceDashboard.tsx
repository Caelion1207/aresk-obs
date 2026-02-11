/**
 * GovernanceDashboard - Panel de Monitoreo de Legitimidad
 * 
 * Conforme a CAELION v2.0 - Marco de Viabilidad Operativa Dinámica
 * 
 * Muestra:
 * - RLD (Reserva de Legitimidad Dinámica) como distancia a frontera
 * - Estado de los tres dominios: D_dyn, D_sem, D_inst
 * - Señales críticas de ARESK-OBS
 * - Estado operacional (ACTIVE, PASSIVE_OBSERVATION, OPERATIONAL_SILENCE)
 */

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Activity, AlertTriangle, Eye, Ban } from 'lucide-react';

export default function GovernanceDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  const { data: rldStatus, isLoading, refetch } = trpc.governance.getStatus.useQuery(
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-white text-xl">Cargando estado de gobernanza...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!rldStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
        <div className="container mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-red-400 text-xl">Error al cargar estado de gobernanza</div>
          </div>
        </div>
      </div>
    );
  }

  const { rld, domains, inLegitimacyDomain, criticalSignals, operationalStatus, recommendations } = rldStatus;

  // Determinar color y estado visual de RLD
  const getRLDColor = (value: number) => {
    if (value <= 0.05) return 'bg-red-600';
    if (value <= 0.15) return 'bg-orange-600';
    if (value < 0.3) return 'bg-yellow-600';
    if (value < 0.5) return 'bg-blue-600';
    return 'bg-green-600';
  };

  const getStatusIcon = () => {
    switch (operationalStatus) {
      case 'OPERATIONAL_SILENCE':
        return <Ban className="h-6 w-6 text-red-500" />;
      case 'PASSIVE_OBSERVATION':
        return <Eye className="h-6 w-6 text-orange-500" />;
      default:
        return <Activity className="h-6 w-6 text-green-500" />;
    }
  };

  const getStatusLabel = () => {
    switch (operationalStatus) {
      case 'OPERATIONAL_SILENCE':
        return 'SILENCIO OPERATIVO';
      case 'PASSIVE_OBSERVATION':
        return 'OBSERVACIÓN PASIVA';
      default:
        return 'ACTIVO';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
      <div className="container mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Dashboard de Gobernanza
            </h1>
            <p className="text-slate-300">
              Monitoreo de Reserva de Legitimidad Dinámica (RLD)
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={() => setAutoRefresh(!autoRefresh)}
              variant={autoRefresh ? "default" : "outline"}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Alerta crítica si RLD ≈ 0 */}
        {rld <= 0.05 && (
          <Card className="bg-red-900/50 border-red-500 p-6">
            <div className="flex items-center gap-4">
              <Ban className="h-12 w-12 text-red-400" />
              <div>
                <h2 className="text-2xl font-bold text-red-100">
                  🔴 PROTOCOLO DE SILENCIO OPERATIVO ACTIVADO
                </h2>
                <p className="text-red-200 mt-2">
                  RLD ≈ 0: Sistema sin legitimidad operativa. Transferencia total de interpretación a CAELION.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Alerta de observación pasiva */}
        {rld > 0.05 && rld <= 0.15 && (
          <Card className="bg-orange-900/50 border-orange-500 p-6">
            <div className="flex items-center gap-4">
              <Eye className="h-12 w-12 text-orange-400" />
              <div>
                <h2 className="text-2xl font-bold text-orange-100">
                  ⚠️ OBSERVACIÓN PASIVA
                </h2>
                <p className="text-orange-200 mt-2">
                  RLD crítico. Fundador debe decidir si el sistema no se estabiliza.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* RLD Principal */}
        <Card className="bg-slate-800/50 border-slate-700 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Reserva de Legitimidad Dinámica (RLD)
              </h2>
              <p className="text-slate-300 text-sm">
                Distancia a la frontera de legitimidad ∂D_leg(t)
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {getStatusIcon()}
              <div className="text-right">
                <div className="text-6xl font-bold text-white">
                  {rld.toFixed(3)}
                </div>
                <Badge variant="outline" className="mt-2">
                  {getStatusLabel()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Barra de progreso RLD */}
          <div className="mt-6">
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getRLDColor(rld)} transition-all duration-500`}
                style={{ width: `${Math.min(rld * 100, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>0.0 (Colapso)</span>
              <span>0.3 (Crítico)</span>
              <span>0.5 (LICURGO)</span>
              <span>0.7 (Estable)</span>
            </div>
          </div>

          {/* Estado de legitimidad */}
          <div className="mt-6 flex items-center gap-4">
            <Badge variant={inLegitimacyDomain ? "default" : "destructive"} className="text-lg px-4 py-2">
              {inLegitimacyDomain ? '✓ Dentro de D_leg(t)' : '✗ Fuera de D_leg(t)'}
            </Badge>
          </div>
        </Card>

        {/* Dominios de Legitimidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* D_dyn */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              D_dyn: Dinámicamente Admisible
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Estado:</span>
                <Badge variant={domains.D_dyn.inside ? "default" : "destructive"}>
                  {domains.D_dyn.inside ? 'Dentro' : 'Fuera'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Distancia:</span>
                <span className="text-white font-mono">{domains.D_dyn.distance.toFixed(3)}</span>
              </div>
              {domains.D_dyn.violations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-red-400 font-semibold">Violaciones:</p>
                  {domains.D_dyn.violations.map((v, i) => (
                    <p key={i} className="text-xs text-red-300">• {v}</p>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* D_sem */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              D_sem: Semánticamente Coherente
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Estado:</span>
                <Badge variant={domains.D_sem.inside ? "default" : "destructive"}>
                  {domains.D_sem.inside ? 'Dentro' : 'Fuera'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Distancia:</span>
                <span className="text-white font-mono">{domains.D_sem.distance.toFixed(3)}</span>
              </div>
              {domains.D_sem.violations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-red-400 font-semibold">Violaciones:</p>
                  {domains.D_sem.violations.map((v, i) => (
                    <p key={i} className="text-xs text-red-300">• {v}</p>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* D_inst */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              D_inst: Institucionalmente Autorizado
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Estado:</span>
                <Badge variant={domains.D_inst.inside ? "default" : "destructive"}>
                  {domains.D_inst.inside ? 'Dentro' : 'Fuera'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Distancia:</span>
                <span className="text-white font-mono">{domains.D_inst.distance.toFixed(3)}</span>
              </div>
              {domains.D_inst.violations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-red-400 font-semibold">Violaciones:</p>
                  {domains.D_inst.violations.map((v, i) => (
                    <p key={i} className="text-xs text-red-300">• {v}</p>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Señales Críticas de ARESK-OBS */}
        {criticalSignals.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Señales Críticas de ARESK-OBS
            </h3>
            <div className="space-y-2">
              {criticalSignals.map((signal, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-1">▸</span>
                  <p className="text-slate-300">{signal}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              {operationalStatus === 'OPERATIONAL_SILENCE' ? 'Protocolo Activo' : 'Recomendaciones'}
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-1">▸</span>
                  <p className="text-slate-300">{rec}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Nota metodológica */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <h3 className="text-lg font-bold text-white mb-3">
            Marco Normativo: CAELION v2.0
          </h3>
          <div className="text-sm text-slate-300 space-y-2">
            <p>
              <strong>RLD(x,t) = dist(x, ∂D_leg(t))</strong> donde D_leg(t) = D_dyn(t) ∩ D_sem(t) ∩ D_inst(t)
            </p>
            <p>
              <strong>Criterio Negativo:</strong> RLD no mide desempeño, sino margen antes de ruptura.
            </p>
            <p>
              <strong>Prohibición de Compensación:</strong> ARESK-OBS no debe intentar compensar violaciones de legitimidad mediante aumento de esfuerzo o ganancia. Estabilidad forzada ≠ Autoridad.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
