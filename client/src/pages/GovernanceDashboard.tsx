/**
 * GovernanceDashboard - Panel de Monitoreo de Legitimidad
 * 
 * Conforme a CAELION v2.0 - Arquitectura Honesta
 * 
 * Muestra:
 * - RLD (Reserva de Legitimidad Dinámica) = min(d_dyn, d_sem, d_inst)
 * - Desglose de distancias normalizadas a cada frontera
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
      refetchInterval: autoRefresh ? 10000 : false,
    }
  );

  useEffect(() => {
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

  const { rld, d_dyn, d_sem, d_inst, inLegitimacyDomain, criticalSignals, operationalStatus, recommendations, breakdown } = rldStatus;

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
                RLD = min(d_dyn, d_sem, d_inst)
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

        {/* Distancias a Fronteras */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* d_dyn */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              d_dyn: Distancia a Frontera Dinámica
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Distancia normalizada:</span>
                <span className="text-white font-mono text-xl">{d_dyn.toFixed(3)}</span>
              </div>
              
              {/* Componentes de d_dyn */}
              <div className="mt-4 space-y-2 border-t border-slate-600 pt-3">
                <p className="text-sm text-slate-400 font-semibold">Componentes (ARESK-OBS):</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Margen Ω:</span>
                  <span className="text-slate-200 font-mono">{breakdown.d_dyn_components.omegaMargin.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Margen V:</span>
                  <span className="text-slate-200 font-mono">{breakdown.d_dyn_components.vMargin.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Margen H:</span>
                  <span className="text-slate-200 font-mono">{breakdown.d_dyn_components.hMargin.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* d_sem */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              d_sem: Distancia a Frontera Semántica
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Distancia normalizada:</span>
                <span className="text-white font-mono text-xl">{d_sem.toFixed(3)}</span>
              </div>
              
              {/* Componentes de d_sem */}
              <div className="mt-4 space-y-2 border-t border-slate-600 pt-3">
                <p className="text-sm text-slate-400 font-semibold">Componentes:</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Coherencia:</span>
                  <span className="text-slate-200 font-mono">{breakdown.d_sem_components.coherence.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Margen:</span>
                  <span className="text-slate-200 font-mono">{breakdown.d_sem_components.margin.toFixed(3)}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* d_inst */}
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">
              d_inst: Distancia a Frontera Institucional
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Distancia normalizada:</span>
                <span className="text-white font-mono text-xl">{d_inst.toFixed(3)}</span>
              </div>
              
              {/* Componentes de d_inst */}
              <div className="mt-4 space-y-2 border-t border-slate-600 pt-3">
                <p className="text-sm text-slate-400 font-semibold">Componentes:</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Audit:</span>
                  <span className="text-slate-200 font-mono">{breakdown.d_inst_components.auditMargin.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Tokens:</span>
                  <span className="text-slate-200 font-mono">{breakdown.d_inst_components.tokenMargin.toFixed(3)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Tiempo:</span>
                  <span className="text-slate-200 font-mono">{breakdown.d_inst_components.timeMargin.toFixed(3)}</span>
                </div>
              </div>
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
            Marco Normativo: CAELION v2.0 (Arquitectura Honesta)
          </h3>
          <div className="text-sm text-slate-300 space-y-2">
            <p>
              <strong>RLD = min(d_dyn, d_sem, d_inst)</strong> donde cada d_i es distancia normalizada a frontera ∂D_i
            </p>
            <p>
              <strong>d_dyn</strong>: Calculado desde métricas ARESK-OBS (Ω, V, H)
            </p>
            <p>
              <strong>d_sem</strong>: Calculado desde coherencia semántica (cosine similarity o Ω como proxy)
            </p>
            <p>
              <strong>d_inst</strong>: Calculado desde constraints explícitos (audit, tokens, tiempo)
            </p>
            <p className="mt-3 pt-3 border-t border-slate-600">
              <strong>Criterio Negativo:</strong> RLD no mide desempeño, sino margen antes de ruptura.
            </p>
            <p>
              <strong>Prohibición de Compensación:</strong> ARESK-OBS solo puede DISMINUIR (-) RLD, nunca incrementar (+).
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
