import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Brain, LineChart, Shield } from "lucide-react";
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
                <p className="text-xs text-muted-foreground">Visualizador de Estabilidad Cognitiva</p>
              </div>
            </div>
            <Link href="/simulator">
              <Button size="lg">
                Iniciar Simulación
                <Activity className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Control Semántico para Conversaciones con LLM
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Sistema de demostración interactiva basado en teoría de control de Lyapunov para estabilizar
            la coherencia cognitiva en modelos de lenguaje de gran escala.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/simulator">
              <Button size="lg" variant="default">
                Explorar el Simulador
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Documentación Técnica
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <Brain className="mb-2 h-8 w-8 text-primary" />
              <CardTitle>Referencia Ontológica</CardTitle>
              <CardDescription>
                Define x_ref con Propósito, Límites y Ética para establecer el estado objetivo del sistema.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <LineChart className="mb-2 h-8 w-8 text-chart-2" />
              <CardTitle>Función de Lyapunov</CardTitle>
              <CardDescription>
                Visualiza V(t) en tiempo real mostrando el decaimiento monótono hacia la estabilidad.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Activity className="mb-2 h-8 w-8 text-chart-3" />
              <CardTitle>Coherencia Observable</CardTitle>
              <CardDescription>
                Mide Ω(t) mediante similitud del coseno entre el estado actual y la referencia.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 h-8 w-8 text-chart-4" />
              <CardTitle>Control LQR</CardTitle>
              <CardDescription>
                Aplica u(t) = -K·e(t) para corregir la trayectoria y mantener la alineación semántica.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl">
          <h3 className="mb-8 text-center text-3xl font-bold">Arquitectura CAELION</h3>
          <Card className="bg-card/50">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div>
                  <h4 className="mb-2 font-semibold text-primary">1. Definición de Referencia</h4>
                  <p className="text-sm text-muted-foreground">
                    El usuario establece la referencia ontológica x_ref = (P, L, E) que representa el
                    propósito, límites operacionales y espacio ético del sistema.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-chart-2">2. Medición de Estado</h4>
                  <p className="text-sm text-muted-foreground">
                    Cada output del LLM se convierte en un embedding x(t), permitiendo calcular el error
                    cognitivo e(t) = x(t) - x_ref y las métricas de control.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-chart-3">3. Aplicación de Control</h4>
                  <p className="text-sm text-muted-foreground">
                    En modo controlado, se aplica u(t) = -K·e(t) para inyectar correcciones que guían al
                    LLM de vuelta hacia la referencia ontológica.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-chart-4">4. Verificación de Estabilidad</h4>
                  <p className="text-sm text-muted-foreground">
                    La Función de Lyapunov V(e) = ||e||² demuestra matemáticamente que el sistema converge
                    asintóticamente hacia el estado de referencia.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-16">
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h3 className="mb-4 text-3xl font-bold">Experimenta el Control Cognitivo</h3>
            <p className="mb-8 text-lg text-muted-foreground">
              Compara en tiempo real el comportamiento de un LLM con y sin control semántico.
            </p>
            <Link href="/simulator">
              <Button size="lg" variant="default">
                Iniciar Simulación Ahora
                <Activity className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>ARESK-OBS - Sistema de Demostración de Control Semántico</p>
          <p className="mt-2">Basado en la arquitectura CAELION y teoría de control de Lyapunov</p>
        </div>
      </footer>
    </div>
  );
}
