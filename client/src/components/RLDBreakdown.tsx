/**
 * RLDBreakdown - Visualización de Reserva de Legitimidad Dinámica
 * 
 * Muestra el desglose de RLD por módulo de gobernanza:
 * - ARGOS (observador de costos)
 * - LICURGO (regulador normativo)
 * - WABUN (memoria semántica)
 * - AUDIT_INTEGRITY (integridad de auditoría)
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface GovernanceModule {
  module: 'ARGOS' | 'LICURGO' | 'WABUN' | 'AUDIT_INTEGRITY';
  active: boolean;
  effectiveness: number;
  lastActivity?: Date;
  details: string;
}

interface RLDBreakdownProps {
  rld: number;
  modules: GovernanceModule[];
  governanceCapacity: number;
  transferRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  collapseRisk: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'IMMINENT';
  recommendations: string[];
}

const MODULE_NAMES = {
  ARGOS: 'ARGOS',
  LICURGO: 'LICURGO',
  WABUN: 'WABUN',
  AUDIT_INTEGRITY: 'Integridad de Auditoría'
};

const MODULE_DESCRIPTIONS = {
  ARGOS: 'Observador de costos',
  LICURGO: 'Regulador normativo',
  WABUN: 'Memoria semántica',
  AUDIT_INTEGRITY: 'Cadena de auditoría'
};

function getRiskColor(risk: string): string {
  switch (risk) {
    case 'NONE': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'LOW': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'CRITICAL': case 'IMMINENT': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

function getRLDColor(rld: number): string {
  if (rld >= 0.7) return 'text-green-400';
  if (rld >= 0.5) return 'text-blue-400';
  if (rld >= 0.3) return 'text-yellow-400';
  if (rld >= 0.15) return 'text-orange-400';
  return 'text-red-400';
}

function getRLDIcon(rld: number) {
  if (rld >= 0.7) return <CheckCircle className="h-5 w-5 text-green-400" />;
  if (rld >= 0.3) return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
  return <XCircle className="h-5 w-5 text-red-400" />;
}

export default function RLDBreakdown({
  rld,
  modules,
  governanceCapacity,
  transferRisk,
  collapseRisk,
  recommendations
}: RLDBreakdownProps) {
  return (
    <div className="space-y-4">
      {/* RLD Principal */}
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getRLDIcon(rld)}
            <div>
              <h3 className="text-lg font-semibold">Reserva de Legitimidad Dinámica</h3>
              <p className="text-sm text-slate-400">Gobernanza efectiva disponible</p>
            </div>
          </div>
          <div className={`text-4xl font-bold ${getRLDColor(rld)}`}>
            {rld.toFixed(3)}
          </div>
        </div>

        {/* Barra de progreso RLD */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-500 ${
              rld >= 0.7 ? 'bg-green-500' :
              rld >= 0.5 ? 'bg-blue-500' :
              rld >= 0.3 ? 'bg-yellow-500' :
              rld >= 0.15 ? 'bg-orange-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Math.min(rld * 100, 100)}%` }}
          />
        </div>

        {/* Umbrales críticos */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-slate-400">Estable: 0.7-0.8</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-slate-400">Intervención: &lt; 0.5</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-slate-400">Humano: &lt; 0.3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-400">Crítico: &lt; 0.05</span>
          </div>
        </div>

        {/* Riesgos */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-slate-400 mb-1">Riesgo de Transferencia</div>
            <Badge className={`${getRiskColor(transferRisk)} border`}>
              {transferRisk}
            </Badge>
          </div>
          <div>
            <div className="text-sm text-slate-400 mb-1">Riesgo de Colapso</div>
            <Badge className={`${getRiskColor(collapseRisk)} border`}>
              {collapseRisk}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Desglose por módulos */}
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <h3 className="text-lg font-semibold mb-4">Módulos de Gobernanza</h3>
        <div className="space-y-3">
          {modules.map(module => (
            <div key={module.module} className="p-3 rounded bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {module.active ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <div>
                    <div className="font-medium">{MODULE_NAMES[module.module]}</div>
                    <div className="text-xs text-slate-400">{MODULE_DESCRIPTIONS[module.module]}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    module.effectiveness >= 0.7 ? 'text-green-400' :
                    module.effectiveness >= 0.5 ? 'text-blue-400' :
                    module.effectiveness >= 0.3 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {(module.effectiveness * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-400">Efectividad</div>
                </div>
              </div>

              {/* Barra de efectividad */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all duration-500 ${
                    module.effectiveness >= 0.7 ? 'bg-green-500' :
                    module.effectiveness >= 0.5 ? 'bg-blue-500' :
                    module.effectiveness >= 0.3 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${module.effectiveness * 100}%` }}
                />
              </div>

              <div className="text-xs text-slate-400">{module.details}</div>
              {module.lastActivity && (
                <div className="text-xs text-slate-500 mt-1">
                  Última actividad: {new Date(module.lastActivity).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Capacidad de gobernanza agregada */}
        <div className="mt-4 p-3 rounded bg-slate-800/30 border border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Capacidad de Gobernanza Agregada</span>
            <span className={`text-lg font-bold ${getRLDColor(governanceCapacity)}`}>
              {(governanceCapacity * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

      {/* Recomendaciones */}
      {recommendations.length > 0 && (
        <Card className="p-6 bg-slate-900/50 border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-semibold">Recomendaciones</h3>
          </div>
          <ul className="space-y-2">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-yellow-400 mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
