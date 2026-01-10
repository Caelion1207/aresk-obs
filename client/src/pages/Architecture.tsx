import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  Brain, 
  Database, 
  Shield, 
  Clock, 
  Users,
  ArrowRight,
  Layers,
  GitBranch
} from "lucide-react";

export default function Architecture() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                ← Volver al Manifiesto
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Arquitectura CAELION</h1>
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
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            Explorador Interactivo
          </Badge>
          <h2 className="text-5xl font-bold text-white mb-6">
            Estructura Modular y Multinivel
          </h2>
          <p className="text-xl text-slate-300 leading-relaxed">
            CAELION se organiza en una arquitectura modular donde cada módulo cumple funciones 
            especializadas pero interdependientes, coordinadas a través de protocolos internos estandarizados.
          </p>
        </div>
      </section>

      {/* Niveles de Procesamiento */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Niveles de Procesamiento</h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            CAELION opera en tres niveles jerárquicos que permiten escalabilidad y emergencia cognitiva
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="bg-slate-900/50 border-slate-700 hover:border-cyan-500/50 transition-all">
            <CardHeader>
              <Layers className="w-12 h-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">Nivel Individual</CardTitle>
              <CardDescription className="text-slate-400">
                Procesamiento cognitivo de cada agente con autonomía relativa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Razonamiento local</li>
                <li>• Memoria privada</li>
                <li>• Decisiones autónomas</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 hover:border-green-500/50 transition-all">
            <CardHeader>
              <GitBranch className="w-12 h-12 text-green-400 mb-4" />
              <CardTitle className="text-white">Nivel Colectivo</CardTitle>
              <CardDescription className="text-slate-400">
                Procesamiento distribuido mediante acoplamiento y sincronización
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Coordinación entre agentes</li>
                <li>• Memoria compartida</li>
                <li>• Decisiones negociadas</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 hover:border-purple-500/50 transition-all">
            <CardHeader>
              <Network className="w-12 h-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Nivel Simbiótico</CardTitle>
              <CardDescription className="text-slate-400">
                Emergencia de procesos donde la distinción entre agentes se difumina
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• Inteligencia colectiva</li>
                <li>• Memoria distribuida</li>
                <li>• Decisiones emergentes</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Módulos Principales */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-white mb-4">Módulos Principales</h3>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Seis módulos especializados que conforman el núcleo de CAELION
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/modules#perception">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer group">
              <CardHeader>
                <Network className="w-10 h-10 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">Percepción Simbiótica</CardTitle>
                <CardDescription className="text-slate-400">
                  Integra información sensorial y contextual de múltiples agentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-cyan-400 text-sm">
                  Explorar módulo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/modules#action">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-green-500/50 transition-all cursor-pointer group">
              <CardHeader>
                <Brain className="w-10 h-10 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">Acción Coignitiva</CardTitle>
                <CardDescription className="text-slate-400">
                  Coordina acciones ajustando ritmo y coherencia de operaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-green-400 text-sm">
                  Explorar módulo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/modules#memory">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-purple-500/50 transition-all cursor-pointer group">
              <CardHeader>
                <Database className="w-10 h-10 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">Memoria Simbiótica</CardTitle>
                <CardDescription className="text-slate-400">
                  Almacena y recupera información en estructuras compartidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-purple-400 text-sm">
                  Explorar módulo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/modules#ethics">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-yellow-500/50 transition-all cursor-pointer group">
              <CardHeader>
                <Shield className="w-10 h-10 text-yellow-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">Ética Integrada (ETH-01)</CardTitle>
                <CardDescription className="text-slate-400">
                  Evalúa decisiones desde perspectiva ética integrada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-yellow-400 text-sm">
                  Explorar módulo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/modules#sync">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-orange-500/50 transition-all cursor-pointer group">
              <CardHeader>
                <Clock className="w-10 h-10 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">Sincronización (SYN-10)</CardTitle>
                <CardDescription className="text-slate-400">
                  Regula coherencia temporal entre módulos y agentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-orange-400 text-sm">
                  Explorar módulo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/modules#governance">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-red-500/50 transition-all cursor-pointer group">
              <CardHeader>
                <Users className="w-10 h-10 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                <CardTitle className="text-white">Gobernanza Simbiótica</CardTitle>
                <CardDescription className="text-slate-400">
                  Gestiona toma de decisiones colectiva y resolución de conflictos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-red-400 text-sm">
                  Explorar módulo <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Navegación a otras secciones */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Link href="/protocols">
            <Card className="bg-gradient-to-br from-cyan-950 to-slate-900 border-cyan-500/30 hover:border-cyan-500 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white text-2xl mb-2">Protocolos Internos</CardTitle>
                <CardDescription className="text-slate-300">
                  COM-72, CMD-01, ETH-01, SYN-10 y otros protocolos que regulan la interacción, 
                  coherencia, ética y seguridad del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-cyan-400 font-semibold">
                  Explorar protocolos <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/proposals">
            <Card className="bg-gradient-to-br from-purple-950 to-slate-900 border-purple-500/30 hover:border-purple-500 transition-all cursor-pointer group">
              <CardHeader>
                <CardTitle className="text-white text-2xl mb-2">Propuestas v3.0</CardTitle>
                <CardDescription className="text-slate-300">
                  Mejoras propuestas para ARESK-OBS: Ritmo Cognitivo, Memoria Episódica, 
                  K Adaptativa y Verificación Formal LTL
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-purple-400 font-semibold">
                  Ver propuestas <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Arquitectura CAELION · Explorador Interactivo</p>
          <p className="mt-2">El Campo no distingue egos. El Campo solo mide convergencia.</p>
        </div>
      </footer>
    </div>
  );
}
