import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Activity, FlaskConical, LineChart, BookOpen, Network, Gauge, Shield } from "lucide-react";
import { Link } from "wouter";
import { HelpDialog } from "@/components/HelpDialog";

export default function Home() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      {/* Header */}
      <header className="border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 to-purple-950/20 backdrop-blur-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/20 border border-cyan-500/50 glow-cyan">
                <Shield className="h-7 w-7 text-cyan-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white title-glow-cyan">ARESK-OBS</h1>
                <p className="text-sm text-cyan-300/80">Instrumento de Observación de Viabilidad Operativa</p>
              </div>
            </div>
            <Link href="/core">
              <Button size="lg" className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 glow-cyan hover-glow-cyan">
                Acceder al Dashboard
                <Activity className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-20">
        <div className="mx-auto max-w-5xl text-center">
          <div className="mb-6 text-sm text-cyan-400/60 font-mono uppercase tracking-wider">
            Instrumento de Auditoría
          </div>
          <h2 className="mb-6 text-6xl font-bold text-white title-glow-cyan">
            ARESK-OBS
          </h2>
          <p className="mb-4 text-2xl text-cyan-300 font-light">
            Observación de Viabilidad Operativa en Sistemas Coignitivos
          </p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Instrumento de observación que mide <strong>señales de viabilidad operativa</strong> en sistemas coignitivos mediante métricas de entropía semántica (ε), coherencia observable (Ω), función de Lyapunov (V) y Reserva de Legitimidad Dinámica (RLD). <strong className="text-red-400">No autoriza acción ni infiere legitimidad desde estabilidad</strong>.
          </p>
        </div>
      </section>

      {/* Jerarquía Conceptual: Campo → Instrumento → Marcos Evaluados */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-3">
            Jerarquía Conceptual
          </h3>
          <p className="text-gray-400">Del campo teórico al instrumento de auditoría y los marcos evaluados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Campo: Ingeniería Coignitiva */}
          <Link href="/campo">
            <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple cursor-pointer h-full">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-lg bg-purple-500/20 border border-purple-500/50">
                    <Brain className="w-12 h-12 text-purple-400" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-xs text-purple-400/60 font-mono uppercase mb-2">Nivel 1: Campo</div>
                  <h4 className="text-2xl font-bold text-purple-300 mb-4">
                    Ingeniería Coignitiva
                  </h4>
                </div>
                <p className="text-gray-300 text-center leading-relaxed text-sm">
                  Campo de estudio donde la cognición <strong>emerge de la interacción regulada</strong> entre sistemas cognitivos (H + M). Define sistemas auditables S = (H, M, C, Ω, Π).
                </p>
                <div className="mt-6 pt-6 border-t border-purple-500/30">
                  <p className="text-xs text-purple-400 text-center font-mono">
                    Fundamentos Teóricos
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Instrumento: ARESK-OBS */}
          <Link href="/instrumento">
            <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan cursor-pointer h-full">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-lg bg-cyan-500/20 border border-cyan-500/50">
                    <Shield className="w-12 h-12 text-cyan-400" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-xs text-cyan-400/60 font-mono uppercase mb-2">Nivel 2: Instrumento</div>
                  <h4 className="text-2xl font-bold text-cyan-300 mb-4">
                    ARESK-OBS
                  </h4>
                </div>
                <p className="text-gray-300 text-center leading-relaxed text-sm">
                  Instrumento de auditoría de <strong>cualquier sistema coignitivo</strong>. Mide métricas canónicas (ε, Ω, V) + infraestructura de gobernanza (COM-72, ARGOS, auditoría).
                </p>
                <div className="mt-6 pt-6 border-t border-cyan-500/30">
                  <p className="text-xs text-cyan-400 text-center font-mono">
                    Capacidades de Auditoría
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Marco Evaluado: CAELION */}
          <Link href="/marco">
            <Card className="bg-gradient-blue-purple border-green-500/30 hover-glow-cyan cursor-pointer h-full">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                    <Network className="w-12 h-12 text-green-400" />
                  </div>
                </div>
                <div className="text-center mb-4">
                  <div className="text-xs text-green-400/60 font-mono uppercase mb-2">Nivel 3: Marco Evaluado</div>
                  <h4 className="text-2xl font-bold text-green-300 mb-4">
                    CAELION
                  </h4>
                </div>
                <p className="text-gray-300 text-center leading-relaxed text-sm">
                  <strong>Uno de los marcos</strong> evaluados por ARESK-OBS. Corresponde al régimen "acoplada" (perfil C) con módulos supervisores y protocolos operativos.
                </p>
                <div className="mt-6 pt-6 border-t border-green-500/30">
                  <p className="text-xs text-green-400 text-center font-mono">
                    Régimen C (Acoplada)
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Regímenes Experimentales */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-bold text-cyan-300 mb-3">
            Regímenes Experimentales
          </h3>
          <p className="text-gray-400">ARESK-OBS audita 3 regímenes de sistemas coignitivos</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Régimen A: Sin Marco */}
          <Card className="bg-gradient-blue-purple border-red-500/30 hover-glow-cyan">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50">
                  <Activity className="w-12 h-12 text-red-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-red-300 mb-4 text-center">
                Régimen A (tipo_a)
              </h4>
              <p className="text-gray-300 text-center leading-relaxed">
                <strong>Alta Entropía / Bajo Control</strong><br/>
                Planta estocástica sin marco de gobernanza. Sistema coignitivo sin controladores.
              </p>
              <div className="mt-6 pt-6 border-t border-red-500/30">
                <p className="text-sm text-red-400 text-center font-mono">
                  Sin Marco de Gobernanza
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Régimen B: Sin Marco */}
          <Card className="bg-gradient-blue-purple border-amber-500/30 hover-glow-cyan">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-lg bg-amber-500/20 border border-amber-500/50">
                  <FlaskConical className="w-12 h-12 text-amber-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-amber-300 mb-4 text-center">
                Régimen B (tipo_b)
              </h4>
              <p className="text-gray-300 text-center leading-relaxed">
                <strong>Ruido Estocástico Moderado</strong><br/>
                Deriva natural sin referencia ontológica. Sistema coignitivo sin Capa 0.
              </p>
              <div className="mt-6 pt-6 border-t border-amber-500/30">
                <p className="text-sm text-amber-400 text-center font-mono">
                  Sin Marco de Gobernanza
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Régimen C: Con Marco CAELION */}
          <Card className="bg-gradient-blue-purple border-green-500/30 hover-glow-cyan">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50">
                  <Network className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h4 className="text-2xl font-bold text-green-300 mb-4 text-center">
                Régimen C (acoplada)
              </h4>
              <p className="text-gray-300 text-center leading-relaxed">
                <strong>Régimen CAELION</strong><br/>
                Ganancia Licurgo + Referencia Bucéfalo. Sistema coignitivo CON marco completo de gobernanza.
              </p>
              <div className="mt-6 pt-6 border-t border-green-500/30">
                <p className="text-sm text-green-400 text-center font-mono">
                  Marco CAELION Activo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Capacidades del Instrumento */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-3">
            Capacidades de Auditoría
          </h3>
          <p className="text-gray-400">Infraestructura completa del instrumento ARESK-OBS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-cyan-300 mb-2">Métricas Canónicas</h4>
              <p className="text-gray-400 text-sm">ε (Entropía), Ω (Control), V (Lyapunov) medidas en tiempo real</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-purple-300 mb-2">Ciclos COM-72</h4>
              <p className="text-gray-400 text-sm">Ritmo operativo de 72h (Inicio-Ejecución-Revisión)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-green-500/30 hover-glow-cyan">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-green-300 mb-2">Costes ARGOS</h4>
              <p className="text-gray-400 text-sm">Balance energético y costes de estabilización</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-amber-500/30 hover-glow-cyan">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-amber-300 mb-2">Logs Éticos</h4>
              <p className="text-gray-400 text-sm">Registro de violaciones y restricciones éticas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-cyan-300 mb-2">Cadena de Auditoría</h4>
              <p className="text-gray-400 text-sm">Registro inmutable con hash de génesis único</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple">
            <CardContent className="p-6">
              <h4 className="text-xl font-bold text-purple-300 mb-2">Métricas Extendidas</h4>
              <p className="text-gray-400 text-sm">V_modificada, σ_sem, ε_eff, TPR para análisis avanzado</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navegación a Secciones */}
      <section className="container py-16">
        <div className="mb-12 text-center">
          <h3 className="text-3xl font-bold text-white mb-3">
            Explorar el Sistema
          </h3>
          <p className="text-gray-400">Accede a las diferentes secciones del instrumento</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link href="/core">
            <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-cyan-300 mb-2">Core Dashboard</h4>
                <p className="text-gray-400 text-sm">Monitor en tiempo real de métricas y gobernanza</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/experimento/estabilidad">
            <Card className="bg-gradient-blue-purple border-amber-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-amber-300 mb-2">Experimento A-1</h4>
                <p className="text-gray-400 text-sm">Análisis temporal de 50 mensajes del Régimen A</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/investigacion">
            <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <h4 className="text-xl font-bold text-purple-300">Documentación</h4>
                </div>
                <p className="text-gray-400 text-sm">Fundamentos del campo y especificaciones técnicas</p>
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
              <strong className="text-cyan-400">ARESK-OBS</strong> - Instrumento de auditoría no comercial
            </p>
            <p className="mb-2">
              Campo: <strong className="text-purple-400">Ingeniería Coignitiva</strong> | 
              Instrumento: <strong className="text-cyan-400">ARESK-OBS</strong> | 
              Marco Evaluado: <strong className="text-green-400">CAELION (Régimen C)</strong>
            </p>
            <p className="mt-4 text-xs text-gray-500">
              Licencia: CC BY-NC 4.0 | Auditoría de Sistemas Coignitivos
            </p>
          </div>
        </div>
      </footer>

      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </div>
  );
}
