import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Activity,
  Database,
  Shield,
  TrendingUp,
  GitBranch,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function Proposals() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/protocols">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                ← Protocolos
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Propuestas v3.0</h1>
            <Link href="/simulator">
              <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                Ir al Simulador →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge className="mb-4 bg-purple-500/20 text-purple-300 border-purple-500/30">
            Roadmap de Evolución
          </Badge>
          <h2 className="text-5xl font-bold text-white mb-6">
            ARESK-OBS v3.0: Hacia la Simbiosis Completa
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            Propuestas de mejora para transformar ARESK-OBS de un instrumento de medición individual 
            a una plataforma de cognición simbiótica multi-agente.
          </p>
        </div>
      </section>

      {/* Matriz de Priorización */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">Matriz de Priorización</h3>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-red-950 to-slate-900 border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white">Alta Prioridad</CardTitle>
                <CardDescription className="text-slate-300">
                  Implementar en v3.0 (próximos 3 meses)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    Ritmo Cognitivo ρ(t)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    Monitor Ético ETH-01
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    K Adaptativa
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-950 to-slate-900 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-white">Media Prioridad</CardTitle>
                <CardDescription className="text-slate-300">
                  Implementar en v3.5 (6-9 meses)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    Memoria Episódica Compartida
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    Visualización de Eventos
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-950 to-slate-900 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white">Investigación Futura</CardTitle>
                <CardDescription className="text-slate-300">
                  Explorar en v4.0+ (12+ meses)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    Verificación Formal LTL
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    Redes de Petri Multi-Agente
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Propuestas Detalladas */}
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Ritmo Cognitivo */}
          <Card className="bg-slate-900/50 border-orange-500/30">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Activity className="w-10 h-10 text-orange-400" />
                  <div>
                    <CardTitle className="text-2xl text-white">Ritmo Cognitivo ρ(t)</CardTitle>
                    <CardDescription className="text-slate-400">
                      Medición de frecuencia de intercambios y detección de arritmias
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Alta Prioridad</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Descripción</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  El ritmo cognitivo ρ(t) mide la frecuencia de intercambios entre Humano y Planta por unidad 
                  de tiempo. Arritmias cognitivas (variaciones bruscas en ρ(t)) son predictores tempranos de 
                  colapso informativo, incluso antes de que V(e) exceda el umbral crítico.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Formalización Matemática</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20 font-mono text-sm text-slate-300">
                  <p>ρ(t) = N_intercambios / Δt</p>
                  <p className="mt-2">Arritmia detectada si: |ρ(t) - ρ̄| &gt; 2σ_ρ</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Implementación Propuesta</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    Calcular ρ(t) en ventanas deslizantes de 60 segundos
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    Visualizar ρ(t) vs tiempo con bandas de normalidad (μ ± 2σ)
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    Alerta visual cuando se detecta arritmia
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    Espectrograma de frecuencias para análisis avanzado
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Progreso de Implementación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Diseño conceptual</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Implementación backend</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Visualización frontend</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monitor Ético */}
          <Card className="bg-slate-900/50 border-yellow-500/30">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Shield className="w-10 h-10 text-yellow-400" />
                  <div>
                    <CardTitle className="text-2xl text-white">Monitor Ético ETH-01</CardTitle>
                    <CardDescription className="text-slate-400">
                      Dashboard de cumplimiento ético y registro de auditoría
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Alta Prioridad</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Descripción</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Actualmente ETH-01 está implícito en el componente E de Bucéfalo. Esta propuesta hace explícito 
                  el monitor ético, permitiendo auditoría, trazabilidad y justificación de decisiones éticas.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Componentes del Monitor</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                    <h5 className="font-semibold text-yellow-400 mb-2 text-sm">Dashboard de Cumplimiento</h5>
                    <p className="text-xs text-slate-300">
                      Visualización en tiempo real del estado de cumplimiento de cada principio ético
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                    <h5 className="font-semibold text-yellow-400 mb-2 text-sm">Registro de Auditoría</h5>
                    <p className="text-xs text-slate-300">
                      Base de datos persistente de todas las violaciones éticas detectadas
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                    <h5 className="font-semibold text-yellow-400 mb-2 text-sm">Trayectoria Ética</h5>
                    <p className="text-xs text-slate-300">
                      Gráfico de distancia a E vs tiempo, mostrando evolución del cumplimiento
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                    <h5 className="font-semibold text-yellow-400 mb-2 text-sm">Justificación de Decisiones</h5>
                    <p className="text-xs text-slate-300">
                      Explicaciones comprensibles de por qué se bloquearon ciertas acciones
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Progreso de Implementación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Diseño conceptual</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Implementación backend</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Dashboard frontend</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* K Adaptativa */}
          <Card className="bg-slate-900/50 border-green-500/30">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <TrendingUp className="w-10 h-10 text-green-400" />
                  <div>
                    <CardTitle className="text-2xl text-white">K Adaptativa</CardTitle>
                    <CardDescription className="text-slate-400">
                      Ganancia de control dinámica basada en magnitud del error
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Alta Prioridad</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Descripción</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Actualmente K es constante. Esta propuesta hace que K sea función del error: K(t) = K₀ + α·||e(t)||². 
                  Cuando el error es grande, la corrección es más agresiva. Cuando el sistema está cerca de x_ref, 
                  la corrección es más suave.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Formalización Matemática</h4>
                <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20 font-mono text-sm text-slate-300">
                  <p>K(t) = K₀ + α·||e(t)||²</p>
                  <p className="mt-2">u(t) = -K(t)·e(t)</p>
                  <p className="mt-2">donde α es el coeficiente de adaptación</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Beneficios</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Convergencia más rápida cuando el sistema está lejos de la referencia
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Menor oscilación cuando el sistema está cerca de la referencia
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    Respuesta proporcional a la severidad de la deriva
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Progreso de Implementación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Diseño conceptual</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Implementación backend</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Visualización de K(t)</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memoria Episódica */}
          <Card className="bg-slate-900/50 border-purple-500/30">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Database className="w-10 h-10 text-purple-400" />
                  <div>
                    <CardTitle className="text-2xl text-white">Memoria Episódica Compartida</CardTitle>
                    <CardDescription className="text-slate-400">
                      Base vectorial de todas las sesiones con recuperación por similitud
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Media Prioridad</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Descripción</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Actualmente cada sesión es aislada. Esta propuesta crea una base de vectores semánticos de 
                  todas las sesiones históricas, permitiendo recuperación por similitud y aprendizaje colectivo.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Componentes</h4>
                <div className="space-y-3">
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                    <h5 className="font-semibold text-purple-400 mb-2 text-sm">Vector Database</h5>
                    <p className="text-xs text-slate-300">
                      Almacenar embeddings de todos los estados semánticos usando Qdrant o Weaviate
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                    <h5 className="font-semibold text-purple-400 mb-2 text-sm">Recuperación por Similitud</h5>
                    <p className="text-xs text-slate-300">
                      Al iniciar sesión, recuperar episodios históricos similares para informar x_ref
                    </p>
                  </div>
                  <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                    <h5 className="font-semibold text-purple-400 mb-2 text-sm">Mapa UMAP</h5>
                    <p className="text-xs text-slate-300">
                      Proyección 2D de todos los estados históricos para visualizar clusters de experiencias
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Progreso de Implementación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Diseño conceptual</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Integración vector DB</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Visualización UMAP</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Control de Eventos */}
          <Card className="bg-slate-900/50 border-cyan-500/30">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <GitBranch className="w-10 h-10 text-cyan-400" />
                  <div>
                    <CardTitle className="text-2xl text-white">Visualización de Control de Eventos</CardTitle>
                    <CardDescription className="text-slate-400">
                      Timeline de eventos controlables y no controlables
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Media Prioridad</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold text-white mb-3">Descripción</h4>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Visualizar la secuencia de eventos del sistema como una timeline, distinguiendo entre eventos 
                  controlables (Σ_c) y no controlables (Σ_uc) según la teoría de Ramadge-Wonham.
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Componentes</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    Timeline horizontal mostrando secuencia de eventos
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    Codificación cromática: verde para Σ_c, rojo para Σ_uc
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    Detección de forcible controllability
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-3">Progreso de Implementación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Diseño conceptual</span>
                    <span className="text-green-400">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">Implementación</span>
                    <span className="text-slate-400">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-br from-purple-950 to-slate-900 border-purple-500/30 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl text-white text-center">¿Listo para Contribuir?</CardTitle>
            <CardDescription className="text-slate-300 text-center text-lg">
              ARESK-OBS es un proyecto de código abierto. Todas estas propuestas están abiertas a implementación 
              colaborativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/simulator">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                Explorar el Simulador Actual
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Propuestas de Mejora ARESK-OBS v3.0 · Roadmap de Evolución</p>
        </div>
      </footer>
    </div>
  );
}
