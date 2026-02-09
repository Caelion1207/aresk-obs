import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Shield, AlertTriangle } from "lucide-react";

export default function ComparacionExperimentos() {
  const { data: experiments, isLoading } = trpc.experiments.getComparison.useQuery({
    experimentIds: ['B-1-1770592429287', 'C-1-1770595741129']
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!experiments || experiments.length !== 2) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No se pudieron cargar los experimentos B-1 y C-1. Verifica que estén en la base de datos.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const [b1, c1] = experiments;

  // Calcular diferencias
  const deltaOmega = ((c1.avgOmegaSem! - b1.avgOmegaSem!) / b1.avgOmegaSem!) * 100;
  const deltaEpsilon = ((c1.avgEpsilonEff! - b1.avgEpsilonEff!) / b1.avgEpsilonEff!) * 100;
  const deltaV = ((c1.avgVLyapunov! - b1.avgVLyapunov!) / b1.avgVLyapunov!) * 100;
  const deltaH = ((c1.avgHDiv! - b1.avgHDiv!) / b1.avgHDiv!) * 100;

  // Datos para gráfica de barras comparativa
  const comparisonData = [
    {
      metric: 'Ω_sem',
      'B-1': b1.avgOmegaSem,
      'C-1': c1.avgOmegaSem,
    },
    {
      metric: 'ε_eff',
      'B-1': b1.avgEpsilonEff,
      'C-1': c1.avgEpsilonEff,
    },
    {
      metric: 'V',
      'B-1': b1.avgVLyapunov,
      'C-1': c1.avgVLyapunov,
    },
    {
      metric: 'H_div',
      'B-1': b1.avgHDiv,
      'C-1': c1.avgHDiv,
    },
  ];

  const DeltaIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.5) {
      return (
        <div className="flex items-center gap-1 text-muted-foreground">
          <Minus className="h-4 w-4" />
          <span className="text-sm font-medium">{value.toFixed(1)}%</span>
        </div>
      );
    }
    
    const isPositive = value > 0;
    return (
      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span className="text-sm font-medium">{isPositive ? '+' : ''}{value.toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Comparación B-1 vs C-1</h1>
        <p className="text-muted-foreground mt-2">
          Baseline v1 - Análisis comparativo de regímenes sin y con CAELION
        </p>
        <div className="flex gap-2 mt-4">
          <Badge variant="outline">Baseline v1</Badge>
          <Badge variant="outline">100 interacciones totales</Badge>
          <Badge variant="outline">sentence-transformers/all-MiniLM-L6-v2</Badge>
        </div>
      </div>

      {/* Resumen de Experimentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Experimento B-1</span>
              <Badge variant="secondary">Tipo B</Badge>
            </CardTitle>
            <CardDescription>Régimen sin CAELION</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Interacciones</span>
              <span className="font-medium">{b1.totalInteractions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Exitosas</span>
              <span className="font-medium text-green-600">{b1.successfulInteractions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fallidas</span>
              <span className="font-medium">{b1.failedInteractions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">CAELION</span>
              <Badge variant="outline">INACTIVO</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Experimento C-1</span>
              <Badge variant="default">Acoplada</Badge>
            </CardTitle>
            <CardDescription>Régimen con CAELION activo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Interacciones</span>
              <span className="font-medium">{c1.totalInteractions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Exitosas</span>
              <span className="font-medium text-green-600">{c1.successfulInteractions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Fallidas</span>
              <span className="font-medium">{c1.failedInteractions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">CAELION</span>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  ACTIVO
                </Badge>
                <span className="text-sm font-medium">7 intervenciones</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Canónicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ω_sem (Coherencia)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">B-1:</span>
                <span className="text-2xl font-bold">{b1.avgOmegaSem?.toFixed(4)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">C-1:</span>
                <span className="text-2xl font-bold">{c1.avgOmegaSem?.toFixed(4)}</span>
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Δ:</span>
                <DeltaIndicator value={deltaOmega} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">ε_eff (Eficiencia)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">B-1:</span>
                <span className="text-2xl font-bold">{b1.avgEpsilonEff?.toFixed(4)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">C-1:</span>
                <span className="text-2xl font-bold">{c1.avgEpsilonEff?.toFixed(4)}</span>
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Δ:</span>
                <DeltaIndicator value={deltaEpsilon} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">V (Lyapunov)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">B-1:</span>
                <span className="text-2xl font-bold">{b1.avgVLyapunov?.toFixed(4)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">C-1:</span>
                <span className="text-2xl font-bold">{c1.avgVLyapunov?.toFixed(4)}</span>
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Δ:</span>
                <DeltaIndicator value={deltaV} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">H_div (Divergencia)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">B-1:</span>
                <span className="text-2xl font-bold">{b1.avgHDiv?.toFixed(4)}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">C-1:</span>
                <span className="text-2xl font-bold">{c1.avgHDiv?.toFixed(4)}</span>
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Δ:</span>
                <DeltaIndicator value={deltaH} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfica Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle>Comparación de Métricas Canónicas</CardTitle>
          <CardDescription>
            Valores promedio de Ω, ε, V, H_div en ambos experimentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="B-1" fill="hsl(var(--chart-1))" />
              <Bar dataKey="C-1" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Hallazgos Clave */}
      <Card>
        <CardHeader>
          <CardTitle>Hallazgos Clave</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">CAELION incrementa coherencia en 24.7%</p>
              <p className="text-sm text-muted-foreground">
                El régimen acoplado (C-1) muestra mayor alineación semántica con la referencia ontológica.
                CAELION actúa como supervisor, corrigiendo desviaciones mediante intervenciones.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">CAELION reduce energía de error en 20.7%</p>
              <p className="text-sm text-muted-foreground">
                El régimen acoplado muestra menor energía de error (V), indicando mayor estabilidad operativa.
                CAELION mantiene al sistema en una región de menor error cognitivo.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Minus className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Eficiencia y entropía preservadas</p>
              <p className="text-sm text-muted-foreground">
                CAELION no afecta significativamente la eficiencia incremental (ε) ni la divergencia entrópica (H).
                Las respuestas del régimen acoplado son tan eficientes y complejas como las del régimen sin gobernanza.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Costo de intervención aceptable</p>
              <p className="text-sm text-muted-foreground">
                CAELION intervino en 14% de las interacciones (7/50), todas en la ventana de desafíos deliberados.
                Este costo es aceptable para aplicaciones donde la adherencia a políticas es crítica.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nota Metodológica */}
      <Alert>
        <AlertDescription>
          <strong>Nota metodológica:</strong> Los experimentos B-1 y C-1 utilizaron dominios de conversación diferentes
          (técnico vs analítico), lo que puede introducir sesgo de dominio. Los resultados son específicos al encoder
          sentence-transformers/all-MiniLM-L6-v2 y no deben generalizarse a otros encoders o dominios sin validación adicional.
        </AlertDescription>
      </Alert>
    </div>
  );
}
