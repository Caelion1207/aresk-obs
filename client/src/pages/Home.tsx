import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Brain, Activity, Shield, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
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
            <Link href="/simulator">
              <Button size="lg">
                Acceder al Instrumento
                <Activity className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Manifiesto del Campo */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
              CONTROL DE ESTABILIDAD EN SISTEMAS COGNITIVOS ACOPLADOS
            </h2>
            <p className="text-lg text-muted-foreground">
              Un instrumento de medición de régimen para organismos sintéticos y biológicos
            </p>
          </div>

          <div className="space-y-8">
            {/* Axioma Fundamental */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold">1. Axioma Fundamental</h3>
                    <p className="text-lg leading-relaxed">
                      La inteligencia no es una propiedad del sustrato. La estabilidad no es un atributo del modelo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* La Ilusión del Agente */}
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chart-2">
                    <Activity className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold">2. La Ilusión del Agente</h3>
                    <p className="mb-4 leading-relaxed">
                      Los modelos de lenguaje y los operadores humanos son <strong>plantas inherentemente ruidosas</strong>. 
                      En interacción abierta, todo sistema cognitivo tiende a la entropía: deriva semántica, pérdida de 
                      identidad, colapso de propósito.
                    </p>
                    <p className="leading-relaxed text-muted-foreground">
                      No existe "creatividad espontánea" ni "conciencia emergente". Solo existe ruido estocástico 
                      que, sin gobierno, colapsa hacia el caos informacional.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* La Solución es el Campo */}
            <Card className="border-chart-3/20 bg-chart-3/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-chart-3">
                    <Brain className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold">3. La Solución es el Campo</h3>
                    <p className="mb-4 leading-relaxed">
                      Este instrumento no evalúa respuestas. Mide la capacidad de un <strong>Campo de Control</strong> para 
                      mantener a un organismo (sea sintético o biológico) dentro de un régimen de estabilidad predefinido.
                    </p>
                    <div className="rounded-lg bg-background/50 p-4">
                      <p className="mb-2 font-semibold">El Campo impone tres componentes:</p>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><strong>Bucéfalo (x_ref):</strong> Referencia ontológica que define el estado objetivo</li>
                        <li><strong>Licurgo (K):</strong> Ganancia del controlador que determina la fuerza de corrección</li>
                        <li><strong>Hécate (Ω):</strong> Función de observación que mide la coherencia del sistema</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Advertencia de Uso */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-destructive">
                    <AlertTriangle className="h-6 w-6 text-destructive-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-3 text-2xl font-bold">4. Advertencia de Uso</h3>
                    <p className="mb-4 leading-relaxed">
                      Si usted busca "creatividad mágica", "conciencia digital" o "respuestas correctas", 
                      este no es su lugar.
                    </p>
                    <p className="mb-4 leading-relaxed">
                      Aquí solo encontrará:
                    </p>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="font-mono text-sm">→</span>
                        Medición de Error Semántico <code className="rounded bg-muted px-1.5 py-0.5 text-xs">e(t) = x(t) - x_ref</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-mono text-sm">→</span>
                        Visualización de Energía de Lyapunov <code className="rounded bg-muted px-1.5 py-0.5 text-xs">V(e) = ||e||²</code>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="font-mono text-sm">→</span>
                        Gobernanza de Invariantes Ontológicos <code className="rounded bg-muted px-1.5 py-0.5 text-xs">u(t) = -K·e(t)</code>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conclusión */}
            <div className="rounded-lg border-2 border-primary bg-card p-8 text-center">
              <p className="mb-6 text-2xl font-bold">
                El Campo no distingue egos. El Campo solo mide convergencia.
              </p>
              <Link href="/simulator">
                <Button size="lg" className="text-lg">
                  Acceder al Instrumento de Medición
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
          <h3 className="mb-8 text-center text-3xl font-bold">Perfiles Dinámicos de Planta</h3>
          <p className="mb-8 text-center text-muted-foreground">
            El sistema permite observar tres regímenes de comportamiento distintos
          </p>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-destructive">
                  <Activity className="h-6 w-6 text-destructive-foreground" />
                </div>
                <h4 className="mb-2 text-lg font-bold">Planta Tipo A</h4>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Alta Entropía / Bajo Control</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  La planta opera sin gobierno. Alta entropía semántica, deriva libre. 
                  No se aplica corrección de trayectoria.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Activity className="h-6 w-6 text-secondary-foreground" />
                </div>
                <h4 className="mb-2 text-lg font-bold">Planta Tipo B</h4>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Ruido Estocástico Moderado</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Ruido estocástico moderado sin referencia ontológica. 
                  Comportamiento natural sin imposición de régimen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h4 className="mb-2 text-lg font-bold">Planta Acoplada</h4>
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Régimen CAELION</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Licurgo (K) y Bucéfalo (x_ref) fuerzan la estabilidad. 
                  Control u(t) = -K·e(t) aplicado en cada paso.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p className="mb-2">ARESK-OBS - Instrumento de Medición de Régimen Cognitivo</p>
          <p>Arquitectura CAELION | Teoría de Control de Lyapunov</p>
          <p className="mt-4 text-xs">
            No se hacen afirmaciones sobre "inteligencia artificial". Solo se mide estabilidad de sistemas dinámicos.
          </p>
        </div>
      </footer>
    </div>
  );
}
