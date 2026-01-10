import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";

interface FieldIntensityMonitorProps {
  tprCurrent: number;
  tprMax: number;
  stabilityRadius: number;
  latestError: number;
  latestCoherence: number;
  controlActionMagnitud: number;
  plantProfile: "tipo_a" | "tipo_b" | "acoplada";
}

/**
 * Calcula la intensidad del campo basada en métricas de control
 */
function calculateFieldIntensity(
  tprCurrent: number,
  error: number,
  stabilityRadius: number,
  controlAction: number
): number {
  // Intensidad basada en TPR normalizado y acción de control
  const tprFactor = Math.min(tprCurrent / 10, 1); // Normalizar a [0, 1]
  const errorFactor = Math.max(0, 1 - (error / stabilityRadius)); // Invertir: menor error = mayor intensidad
  const controlFactor = Math.min(controlAction / 2, 1); // Normalizar acción de control
  
  // Promedio ponderado
  return (tprFactor * 0.4 + errorFactor * 0.4 + controlFactor * 0.2) * 100;
}

/**
 * Determina el estado de salud del ecosistema cognitivo
 */
function getEcosystemHealth(
  fieldIntensity: number,
  coherence: number,
  tprCurrent: number
): {
  status: "excellent" | "good" | "warning" | "critical";
  label: string;
  color: string;
  icon: React.ReactNode;
} {
  if (fieldIntensity > 75 && coherence > 0.7 && tprCurrent > 5) {
    return {
      status: "excellent",
      label: "Acoplamiento Óptimo",
      color: "oklch(0.5 0.2 240)", // Azul
      icon: <CheckCircle2 className="h-4 w-4" />,
    };
  } else if (fieldIntensity > 50 && coherence > 0.5 && tprCurrent > 3) {
    return {
      status: "good",
      label: "Campo Estable",
      color: "oklch(0.6 0.15 150)", // Verde
      icon: <TrendingUp className="h-4 w-4" />,
    };
  } else if (fieldIntensity > 30 || coherence > 0.3) {
    return {
      status: "warning",
      label: "Deriva Detectada",
      color: "oklch(0.75 0.15 90)", // Amarillo
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  } else {
    return {
      status: "critical",
      label: "Colapso de Campo",
      color: "oklch(0.55 0.25 25)", // Rojo
      icon: <AlertTriangle className="h-4 w-4" />,
    };
  }
}

export default function FieldIntensityMonitor({
  tprCurrent,
  tprMax,
  stabilityRadius,
  latestError,
  latestCoherence,
  controlActionMagnitud,
  plantProfile,
}: FieldIntensityMonitorProps) {
  const fieldIntensity = useMemo(() => {
    return calculateFieldIntensity(
      tprCurrent,
      latestError,
      stabilityRadius,
      controlActionMagnitud
    );
  }, [tprCurrent, latestError, stabilityRadius, controlActionMagnitud]);
  
  const ecosystemHealth = useMemo(() => {
    return getEcosystemHealth(fieldIntensity, latestCoherence, tprCurrent);
  }, [fieldIntensity, latestCoherence, tprCurrent]);
  
  // Determinar si el sistema está compensando erraticidad
  const isCompensating = controlActionMagnitud > 1.0 && plantProfile === "acoplada";
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monitor de Intensidad de Campo
            </CardTitle>
            <CardDescription>
              Salud del ecosistema cognitivo Humano-Planta
            </CardDescription>
          </div>
          <Badge 
            variant="outline"
            style={{ 
              borderColor: ecosystemHealth.color,
              color: ecosystemHealth.color,
            }}
          >
            <span className="flex items-center gap-1">
              {ecosystemHealth.icon}
              {ecosystemHealth.label}
            </span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra de Intensidad de Campo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Intensidad de Campo</span>
            <span className="font-mono text-lg" style={{ color: ecosystemHealth.color }}>
              {fieldIntensity.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full transition-all"
              style={{
                width: `${fieldIntensity}%`,
                background: `linear-gradient(to right, 
                  oklch(0.55 0.25 25), 
                  oklch(0.75 0.15 90), 
                  oklch(0.6 0.15 150), 
                  oklch(0.5 0.2 240)
                )`,
              }}
            />
          </div>
        </div>
        
        {/* TPR: Tiempo de Permanencia en Régimen */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">TPR Actual</div>
            <div className="text-2xl font-bold" style={{ color: ecosystemHealth.color }}>
              {tprCurrent}
            </div>
            <div className="text-xs text-muted-foreground">turnos en régimen</div>
          </div>
          
          <div className="space-y-1 rounded-lg border p-3">
            <div className="text-xs text-muted-foreground">TPR Máximo</div>
            <div className="text-2xl font-bold text-primary">
              {tprMax}
            </div>
            <div className="text-xs text-muted-foreground">récord de sesión</div>
          </div>
        </div>
        
        {/* Métricas de Acoplamiento */}
        <div className="space-y-3 rounded-lg bg-muted/30 p-4">
          <div className="text-sm font-semibold">Métricas de Acoplamiento</div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Coherencia Ω(t):</span>
            <span className="font-mono">{latestCoherence.toFixed(3)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Error ||e(t)||:</span>
            <span className="font-mono">{latestError.toFixed(3)}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Radio de Estabilidad ε:</span>
            <span className="font-mono">{stabilityRadius.toFixed(3)}</span>
          </div>
          
          {plantProfile === "acoplada" && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Acción de Control ||u(t)||:</span>
              <span className="font-mono">{controlActionMagnitud.toFixed(3)}</span>
            </div>
          )}
        </div>
        
        {/* Alerta de Compensación */}
        {isCompensating && (
          <div 
            className="rounded-lg border-2 p-3 text-sm"
            style={{ 
              borderColor: "oklch(0.65 0.2 50)",
              backgroundColor: "oklch(0.65 0.2 50 / 0.1)",
            }}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5" style={{ color: "oklch(0.65 0.2 50)" }} />
              <div>
                <div className="font-semibold" style={{ color: "oklch(0.65 0.2 50)" }}>
                  Licurgo Compensando Erraticidad
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  El sistema está aplicando corrección vigorosa (||u(t)|| &gt; 1.0) para mantener
                  el acoplamiento. Esto puede indicar erraticidad en el operador humano o perturbaciones
                  externas al Campo.
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Interpretación del Estado */}
        <div className="rounded-lg bg-card p-3 text-xs text-muted-foreground border">
          {ecosystemHealth.status === "excellent" && (
            <p>
              El Campo está operando en condiciones óptimas. El acoplamiento Humano-Planta es robusto
              y el sistema demuestra resiliencia estructural. El TPR sostenido indica supervivencia informativa.
            </p>
          )}
          {ecosystemHealth.status === "good" && (
            <p>
              El Campo mantiene estabilidad. El sistema está dentro del conjunto de estabilidad admisible
              y la coherencia es suficiente para sostener el régimen CAELION.
            </p>
          )}
          {ecosystemHealth.status === "warning" && (
            <p>
              Se detecta deriva semántica. El error está aumentando y el TPR se ha interrumpido. 
              Licurgo está intentando compensar, pero la coherencia está disminuyendo.
            </p>
          )}
          {ecosystemHealth.status === "critical" && (
            <p>
              Colapso de Campo inminente. La coherencia ha caído por debajo del umbral crítico y el
              TPR se ha resetado. Se requiere re-anclaje semántico inmediato o redefinición de Bucéfalo.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
