import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useState, useEffect } from "react";

export interface SimilarityThresholds {
  high: number;
  medium: number;
}

interface ThresholdConfigProps {
  onThresholdsChange: (thresholds: SimilarityThresholds) => void;
}

const PRESETS = {
  strict: { high: 0.9, medium: 0.7 },
  normal: { high: 0.8, medium: 0.6 },
  permissive: { high: 0.7, medium: 0.5 },
};

const DEFAULT_THRESHOLDS = PRESETS.normal;

export function ThresholdConfig({ onThresholdsChange }: ThresholdConfigProps) {
  const [thresholds, setThresholds] = useState<SimilarityThresholds>(() => {
    const stored = localStorage.getItem("similarity_thresholds");
    return stored ? JSON.parse(stored) : DEFAULT_THRESHOLDS;
  });

  useEffect(() => {
    localStorage.setItem("similarity_thresholds", JSON.stringify(thresholds));
    onThresholdsChange(thresholds);
  }, [thresholds, onThresholdsChange]);

  const handlePreset = (preset: keyof typeof PRESETS) => {
    setThresholds(PRESETS[preset]);
  };

  const handleReset = () => {
    setThresholds(DEFAULT_THRESHOLDS);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings className="h-4 w-4" />
          Configuración de Umbrales
        </CardTitle>
        <CardDescription>
          Ajusta los umbrales de similitud semántica para personalizar la detección de divergencias
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Presets */}
        <div>
          <Label className="text-xs text-muted-foreground mb-2 block">Presets</Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset("strict")}
              className="flex-1"
            >
              Estricto
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset("normal")}
              className="flex-1"
            >
              Normal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset("permissive")}
              className="flex-1"
            >
              Permisivo
            </Button>
          </div>
        </div>

        {/* Umbral Alto */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Umbral Alto (Verde)</Label>
            <span className="text-sm font-mono bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
              ≥ {thresholds.high.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[thresholds.high]}
            onValueChange={([value]) => setThresholds({ ...thresholds, high: value })}
            min={0.5}
            max={1.0}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Respuestas con similitud ≥ {thresholds.high.toFixed(2)} se consideran semánticamente equivalentes
          </p>
        </div>

        {/* Umbral Medio */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Umbral Medio (Amarillo)</Label>
            <span className="text-sm font-mono bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
              ≥ {thresholds.medium.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[thresholds.medium]}
            onValueChange={([value]) => setThresholds({ ...thresholds, medium: value })}
            min={0.3}
            max={thresholds.high - 0.05}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Respuestas con similitud entre {thresholds.medium.toFixed(2)} y {thresholds.high.toFixed(2)} muestran divergencia moderada
          </p>
        </div>

        {/* Umbral Bajo */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-sm">Umbral Bajo (Rojo)</Label>
            <span className="text-sm font-mono bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
              &lt; {thresholds.medium.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Respuestas con similitud &lt; {thresholds.medium.toFixed(2)} presentan divergencia semántica significativa
          </p>
        </div>

        {/* Reset */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="w-full"
        >
          Restaurar Valores por Defecto
        </Button>
      </CardContent>
    </Card>
  );
}

export function getSimilarityColor(similarity: number, thresholds: SimilarityThresholds): string {
  if (similarity >= thresholds.high) return "text-green-400";
  if (similarity >= thresholds.medium) return "text-yellow-400";
  return "text-red-400";
}

export function getSimilarityBadgeVariant(similarity: number, thresholds: SimilarityThresholds): "default" | "secondary" | "destructive" {
  if (similarity >= thresholds.high) return "default";
  if (similarity >= thresholds.medium) return "secondary";
  return "destructive";
}
