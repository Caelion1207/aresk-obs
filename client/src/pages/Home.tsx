import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Activity, FlaskConical, LineChart, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { HelpDialog } from "@/components/HelpDialog";

export default function Home() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      {/* Header con gradiente */}
      <header className="border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 to-purple-950/20 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/50 glow-cyan">
                <Brain className="h-7 w-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white title-glow-cyan">ARESK-OBS</h1>
                <p className="text-sm text-cyan-300/80">Instrumento de Medición de Estabilidad Semántica</p>
              </div>
            </div>
            <Link href="/simulator">
              <Button size="lg" className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 glow-cyan hover-glow-cyan">
                Acceder al Instrumento
                <Activity className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-6 text-6xl font-bold text-white title-glow-cyan">
            ARESK-OBS
          </h2>
          <p className="mb-4 text-3xl text-cyan-300 font-light">
            Instrumento de Medición de Estabilidad Semántica
          </p>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Sistema de observabilidad para medir el coste de estabilidad en interacciones cognitivas mediante métricas de entropía semántica (ε), coste de control (Ω) y estabilidad de Lyapunov (V).
          </p>
        </div>
      </section>

      {/* Tres Pilares de Estabilidad */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-bold text-cyan-300 mb-3">
            Tres Pilares de Estabilidad: Medir, Entender, Controlar
          </h3>
          <p className="text-gray-400">Framework ARESK-OBS para la Estabilidad Semántica</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Embeddings Semánticos */}
          <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-lg bg-cyan-500/20 border border-cyan-500/50">
                  <FlaskConical className="w-12 h-12 text-cyan-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-cyan-300 mb-4 text-center">
                Embeddings Semánticos
              </h4>
              <p className="text-gray-300 text-center leading-relaxed">
                Representación vectorial 384D del significado mediante sentence-transformers. Mide la distancia semántica entre intención y respuesta.
              </p>
              <div className="mt-6 pt-6 border-t border-cyan-500/30">
                <p className="text-sm text-cyan-400 text-center font-mono">
                  Entropía Semántica (ε)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Función de Lyapunov */}
          <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500/50">
                  <LineChart className="w-12 h-12 text-purple-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-purple-300 mb-4 text-center">
                Función de Lyapunov
              </h4>
              <p className="text-gray-300 text-center leading-relaxed">
                Mide el coste energético de la desviación semántica. V(e) = ||e||² donde e es el error entre intención y respuesta.
              </p>
              <div className="mt-6 pt-6 border-t border-purple-500/30">
                <p className="text-sm text-purple-400 text-center font-mono">
                  Estabilidad (V)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Control LQR */}
          <Card className="bg-gradient-blue-purple border-green-500/30 hover-glow-cyan">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                  <Activity className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-green-300 mb-4 text-center">
                Control LQR
              </h4>
              <p className="text-gray-300 text-center leading-relaxed">
                Control óptimo mediante Linear Quadratic Regulator. Minimiza el coste de estabilización con ganancia K adaptativa.
              </p>
              <div className="mt-6 pt-6 border-t border-green-500/30">
                <p className="text-sm text-green-400 text-center font-mono">
                  Coste de Control (Ω)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navegación Principal */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-3">
            Explorar el Sistema
          </h3>
          <p className="text-gray-400">Accede a las diferentes secciones del instrumento de medición</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/core">
            <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-cyan-300 mb-2">Core Dashboard</h4>
                <p className="text-gray-400 text-sm">Monitor en tiempo real de métricas del sistema con visualizaciones HUD</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/experimento/estabilidad">
            <Card className="bg-gradient-blue-purple border-amber-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-amber-300 mb-2">Experimento de Estabilidad</h4>
                <p className="text-gray-400 text-sm">Análisis temporal de 50 mensajes del Régimen A-1 con métricas ε, Ω, V</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/experimento/comparar">
            <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-purple-300 mb-2">Comparación de Regímenes</h4>
                <p className="text-gray-400 text-sm">Comparativa entre regímenes A, B y C de control cognitivo</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/metricas/hud">
            <Card className="bg-gradient-blue-purple border-green-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-green-300 mb-2">HUD de Métricas</h4>
                <p className="text-gray-400 text-sm">Visualización futurista circular de métricas en tiempo real</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/sistema/flujo">
            <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-cyan-300 mb-2">Diagrama de Arquitectura</h4>
                <p className="text-gray-400 text-sm">Flujo interactivo de componentes del sistema con documentación técnica</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/investigacion">
            <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <h4 className="text-xl font-bold text-purple-300">Documentación de Investigación</h4>
                </div>
                <p className="text-gray-400 text-sm">8 documentos PDF con fundamentos teóricos y análisis técnicos</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer informativo */}
      <footer className="border-t border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 to-purple-950/20 mt-20">
        <div className="container py-8">
          <div className="text-center text-gray-400 text-sm">
            <p className="mb-2">
              <strong className="text-cyan-400">ARESK-OBS</strong> - Instrumento de medición no comercial
            </p>
            <p>
              Sistema de observabilidad para cuantificar costes de estabilidad en sistemas cognitivos
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Licencia: CC BY-NC 4.0 | Framework CAELION
            </p>
          </div>
        </div>
      </footer>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
