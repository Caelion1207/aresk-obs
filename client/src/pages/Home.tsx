import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Brain, Activity, Shield, AlertTriangle, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import { HelpDialog } from "@/components/HelpDialog";

export default function Home() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">ARESK-OBS</h1>
                <p className="text-xs text-muted-foreground">Control de Estabilidad en Sistemas Cognitivos Acoplados</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/architecture">
                <Button size="lg" variant="outline">
                  Explorar Arquitectura
                </Button>
              </Link>
              <Link href="/lab">
                <Button variant="outline" size="lg" className="w-full">
                  LAB | Dynamics Monitor
                </Button>
              </Link>
              <Link href="/estadisticas">
                <Button variant="outline" size="lg">
                  Estadísticas
                </Button>
              </Link>
              <Link href="/comparar-sesiones">
                <Button variant="outline" size="lg">
                  Comparar Sesiones
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setHelpOpen(true)}
                className="gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Ayuda
              </Button>
              <Link href="/erosion">
                <Button variant="outline" size="lg">
                  Erosión Estructural
                </Button>
              </Link>
              <Link href="/cycles">
                <Button variant="outline" size="lg">
                  Ciclos COM-72
                </Button>
              </Link>
              <Link href="/simulator">
                <Button size="lg">
                  Acceder al Instrumento
                  <Activity className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Manifiesto del Campo */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              MEDICIÓN DE COSTE DE ESTABILIDAD
            </h2>
            <p className="text-lg text-muted-foreground">
              Instrumento de cuantificación de costes operacionales en sistemas cognitivos acoplados
            </p>
          </div>

          <div className="space-y-8">
            {/* Qué Mide */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold">1. Qué Mide</h3>
                    <p className="text-lg leading-relaxed">
                      ARESK-OBS cuantifica tres costes operacionales: <strong>Coste de Desalineación</strong> (distancia al régimen objetivo), <strong>Coste de Control</strong> (magnitud de corrección aplicada), y <strong>Coste de Entropía</strong> (dispersión semántica).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Qué No Predice */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chart-2">
                    <Activity className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold">2. Qué No Predice</h3>
                    <p className="mb-4 leading-relaxed">
                      ARESK-OBS <strong>no predice costes futuros</strong>. Mide coste actual observable. 
                      No anticipa colapsos, no extrapola trayectorias, no emite alertas anticipatorias.
                    </p>
                    <p className="leading-relaxed text-muted-foreground">
                      Detección de degradación es reactiva. Monitoreo continuo es esencial. La alerta ES la medición actual.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decisiones Habilitadas */}
            <Card className="border-chart-3/20 bg-chart-3/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chart-3">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold">3. Decisiones Habilitadas</h3>
                    <p className="mb-4 leading-relaxed">
                      ARESK-OBS proporciona evidencia cuantitativa de costes para decisiones humanas informadas:
                    </p>
                    <div className="rounded-lg bg-background/50 p-4">
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><strong>Ajustar ganancia K:</strong> Si control es contraproducente (coste sin beneficio)</li>
                        <li><strong>Redefinir referencia x_ref:</strong> Si desalineación es estructural (coste persistente)</li>
                        <li><strong>Intervenir en entropía:</strong> Si fragmentación precede colapso costoso</li>
                        <li><strong>Comparar configuraciones:</strong> Seleccionar configuración con menor coste total</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Limitaciones */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive">
                    <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold">4. Limitaciones</h3>
                    <p className="mb-4 leading-relaxed">
                      ARESK-OBS es un instrumento de medición, no un sistema de optimización automática.
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="font-mono text-sm">→</span>
                        <strong>No predictivo:</strong> Mide coste actual, no predice coste futuro
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-mono text-sm">→</span>
                        <strong>No diagnóstico causal:</strong> Cuantifica costes, no identifica causas
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-mono text-sm">→</span>
                        <strong>Requiere criterio humano:</strong> Proporciona evidencia, no decide automáticamente
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acceso */}
            <div className="rounded-lg border-2 border-primary bg-card p-8 text-center">
              <p className="mb-6 text-2xl font-bold">
                Mide costes. Habilita decisiones. Requiere criterio.
              </p>
              <Link href="/simulator">
                <Button size="lg" className="text-lg">
                  Acceder al Instrumento
                  <Activity className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Separator className="container" />

      {/* Perfiles de Planta */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-8 text-center text-3xl font-bold">Configuraciones de Control</h3>
          <p className="mb-8 text-center text-muted-foreground">
            Comparar costes operacionales bajo tres configuraciones distintas
          </p>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive">
                  <Activity className="h-6 w-6 text-destructive-foreground" />
                </div>
                <h4 className="mb-2 text-lg font-bold">Sin Control</h4>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Línea Base</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Sin corrección aplicada (u=0). Mide coste de entropía natural del sistema. 
                  Línea base para comparación.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Activity className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h4 className="mb-2 text-lg font-bold">Observación Pasiva</h4>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Referencia sin Control</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Referencia definida pero sin aplicar control. Mide desalineación sin intervención.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="mb-2 text-lg font-bold">Control Activo</h4>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Corrección Continua</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Control u(t) = -K·e(t) aplicado. Mide coste de mantener estabilidad mediante intervención continua.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="mb-2">ARESK-OBS v1.0 - Instrumento de Medición de Coste de Estabilidad</p>
          <p className="mt-4 text-xs">
            Mide costes operacionales. No predice. Habilita decisiones informadas.
          </p>
        </div>
      </footer>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
