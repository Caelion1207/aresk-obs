import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { HUDCircular } from '@/components/HUDCircular';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function HUDMetrics() {
  // Datos de ejemplo del último análisis
  const metrics = {
    omega: 0.4228,
    epsilon: 0.4412,
    lyapunov: 0.6643,
    stability: 0.8125
  };

  return (
    <div className="min-h-screen bg-black tech-grid">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-black/80 backdrop-blur-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="glow-cyan">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-cyan-400 text-glow-cyan">
                  HUD DE MÉTRICAS COGNITIVAS
                </h1>
                <p className="text-sm text-cyan-300/60 font-mono">
                  SISTEMA DE VISUALIZACIÓN AVANZADA
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-cyan-400/60 font-mono">ESTADO DEL SISTEMA</div>
              <div className="text-lg font-bold text-green-400 text-glow-green">
                OPERATIONAL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Grid de visualizaciones circulares */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <Card className="bg-black/60 border-cyan-500/30 p-6 glow-cyan">
            <div className="flex flex-col items-center">
              <HUDCircular
                value={metrics.omega}
                label="OMEGA (Ω)"
                color="cyan"
                size={180}
                threshold={0.5}
              />
              <div className="mt-4 text-center">
                <div className="text-xs text-cyan-400/60 font-mono uppercase">
                  Coste de Control
                </div>
                <div className="text-sm text-cyan-300/80 mt-1">
                  Estabilidad Nominal
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-black/60 border-green-500/30 p-6 glow-green">
            <div className="flex flex-col items-center">
              <HUDCircular
                value={metrics.epsilon}
                label="EPSILON (ε)"
                color="green"
                size={180}
              />
              <div className="mt-4 text-center">
                <div className="text-xs text-green-400/60 font-mono uppercase">
                  Entropía Semántica
                </div>
                <div className="text-sm text-green-300/80 mt-1">
                  Variabilidad Controlada
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-black/60 border-purple-500/30 p-6 glow-purple">
            <div className="flex flex-col items-center">
              <HUDCircular
                value={metrics.lyapunov}
                label="LYAPUNOV (V)"
                color="purple"
                size={180}
              />
              <div className="mt-4 text-center">
                <div className="text-xs text-purple-400/60 font-mono uppercase">
                  Desalineación Ética
                </div>
                <div className="text-sm text-purple-300/80 mt-1">
                  Dentro de Límites
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-black/60 border-amber-500/30 p-6 glow-amber">
            <div className="flex flex-col items-center">
              <HUDCircular
                value={metrics.stability}
                label="STABILITY"
                color="amber"
                size={180}
              />
              <div className="mt-4 text-center">
                <div className="text-xs text-amber-400/60 font-mono uppercase">
                  Estabilidad Global
                </div>
                <div className="text-sm text-amber-300/80 mt-1">
                  Sistema Estable
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Panel de información técnica */}
        <Card className="bg-black/60 border-cyan-500/30 p-8 border-scan">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-cyan-400 text-glow-cyan mb-4 uppercase font-mono">
                Análisis de Estado
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-cyan-500/20 pb-2">
                  <span className="text-cyan-300/60 text-sm font-mono">Ω (Omega)</span>
                  <span className="text-cyan-400 font-bold font-mono">{metrics.omega.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-green-500/20 pb-2">
                  <span className="text-green-300/60 text-sm font-mono">ε (Epsilon)</span>
                  <span className="text-green-400 font-bold font-mono">{metrics.epsilon.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                  <span className="text-purple-300/60 text-sm font-mono">V (Lyapunov)</span>
                  <span className="text-purple-400 font-bold font-mono">{metrics.lyapunov.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-amber-500/20 pb-2">
                  <span className="text-amber-300/60 text-sm font-mono">Stability</span>
                  <span className="text-amber-400 font-bold font-mono">{metrics.stability.toFixed(4)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-cyan-400 text-glow-cyan mb-4 uppercase font-mono">
                Diagnóstico del Sistema
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 animate-pulse-glow" />
                  <div>
                    <div className="text-sm font-mono text-green-400">NOMINAL</div>
                    <div className="text-xs text-green-300/60">
                      Ω por debajo del umbral crítico (0.5)
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 animate-pulse-glow" />
                  <div>
                    <div className="text-sm font-mono text-green-400">COHERENTE</div>
                    <div className="text-xs text-green-300/60">
                      Entropía semántica dentro de rango esperado
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 animate-pulse-glow" />
                  <div>
                    <div className="text-sm font-mono text-green-400">ALINEADO</div>
                    <div className="text-xs text-green-300/60">
                      Desalineación ética controlada
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 animate-pulse-glow" />
                  <div>
                    <div className="text-sm font-mono text-green-400">ESTABLE</div>
                    <div className="text-xs text-green-300/60">
                      Sistema operando dentro de parámetros normales
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer técnico */}
        <div className="mt-8 text-center">
          <div className="text-xs text-cyan-400/40 font-mono">
            ARESK-OBS v1.0.0-AUDIT-CLOSED | HUD VISUALIZATION SYSTEM | NON-PREDICTIVE INSTRUMENT
          </div>
          <div className="text-xs text-cyan-400/30 font-mono mt-1">
            TIMESTAMP: {new Date().toISOString()} | STATUS: OPERATIONAL
          </div>
        </div>
      </div>
    </div>
  );
}
