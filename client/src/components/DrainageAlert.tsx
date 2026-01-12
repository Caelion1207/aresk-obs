import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DrainageAlertProps {
  epsilonEff: number;
  sigmaSem: number;
  onDismiss?: () => void;
}

/**
 * Componente de alerta de drenaje semántico
 * Muestra alertas cuando ε_eff < -0.3 (drenaje moderado) o < -0.5 (drenaje crítico)
 */
export default function DrainageAlert({ epsilonEff, sigmaSem, onDismiss }: DrainageAlertProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [alertLevel, setAlertLevel] = useState<"warning" | "critical">("warning");
  
  useEffect(() => {
    // Determinar si debe mostrarse la alerta
    if (epsilonEff < -0.5) {
      setAlertLevel("critical");
      setIsVisible(true);
    } else if (epsilonEff < -0.3) {
      setAlertLevel("warning");
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [epsilonEff]);
  
  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };
  
  if (!isVisible) return null;
  
  return (
    <Alert 
      variant={alertLevel === "critical" ? "destructive" : "default"}
      className="relative animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-start gap-3">
        {alertLevel === "critical" ? (
          <AlertTriangle className="h-5 w-5 mt-0.5 animate-pulse" />
        ) : (
          <Shield className="h-5 w-5 mt-0.5" />
        )}
        
        <div className="flex-1 space-y-1">
          <AlertTitle className="font-semibold">
            {alertLevel === "critical" 
              ? "⚠️ Drenaje Semántico Crítico Detectado" 
              : "⚠️ Drenaje Semántico Moderado"}
          </AlertTitle>
          <AlertDescription className="text-sm">
            {alertLevel === "critical" ? (
              <>
                <p className="mb-2">
                  El campo efectivo ε_eff ha alcanzado un nivel crítico de <strong>{epsilonEff.toFixed(3)}</strong>.
                  La polaridad semántica σ_sem es <strong>{sigmaSem.toFixed(3)}</strong>, indicando drenaje estructural severo.
                </p>
                <p className="text-xs opacity-90">
                  🛡️ <strong>Control LICURGO activado:</strong> Inyección de estructura en curso para estabilizar el campo semántico.
                </p>
              </>
            ) : (
              <>
                <p className="mb-2">
                  El campo efectivo ε_eff es <strong>{epsilonEff.toFixed(3)}</strong>.
                  La polaridad semántica σ_sem es <strong>{sigmaSem.toFixed(3)}</strong>, indicando drenaje moderado.
                </p>
                <p className="text-xs opacity-90">
                  📊 <strong>Monitoreo activo:</strong> El sistema está vigilando la evolución del campo semántico.
                </p>
              </>
            )}
          </AlertDescription>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
