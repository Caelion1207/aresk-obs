import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Brain, Users, Target, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

export default function CampoPage() {
  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      {/* Header */}
      <div className="border-b border-purple-500/30 bg-gradient-to-r from-purple-950/20 to-cyan-950/20 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Brain className="w-8 h-8 text-purple-400" />
                <h1 className="text-4xl font-bold text-white title-glow-purple">
                  Ingeniería Coignitiva
                </h1>
              </div>
              <p className="text-purple-300 text-lg">
                Campo de estudio de sistemas coignitivos auditables
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-purple-400 border-purple-500/30">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container py-12 max-w-6xl">
        {/* Definición del Campo */}
        <Card className="mb-8 bg-gradient-blue-purple border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">1. Definición del Campo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="text-lg leading-relaxed">
              La <strong className="text-purple-400">Ingeniería Coignitiva</strong> es el campo de estudio de sistemas donde la cognición <strong>emerge de la interacción regulada</strong> entre dos o más sistemas cognitivos (H + M + ...), ninguno de los cuales tiene control total.
            </p>
            <p className="leading-relaxed">
              Se construye sobre las bases de la <strong>Ingeniería Cognitiva</strong> (Cognitive Systems Engineering), pero la extiende a un nuevo dominio donde la cognición no es una propiedad de un solo agente, sino que <strong className="text-purple-400">emerge de la interacción regulada</strong> entre dos o más sistemas cognitivos.
            </p>
            <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-300 font-semibold">Auditoría del Campo:</p>
              <p className="mt-2">
                Cualquier sistema coignitivo S = (H, M, C, Ω, Π) puede ser auditado por <strong className="text-cyan-400">ARESK-OBS</strong> para medir su estabilidad en horizonte largo, independientemente del marco de gobernanza que implemente (o no implemente).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Objeto de Estudio */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">2. Objeto de Estudio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <p className="text-lg">
              El sistema <strong className="text-cyan-400">S = (H, M, C, Ω, Π)</strong>, donde:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-cyan-300">H: Operador Humano</h4>
                </div>
                <p className="text-sm">Aporta teleología, criterio y Capa 0 (referencia ontológica del sistema)</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-purple-300">M: Sustrato de Inferencia</h4>
                </div>
                <p className="text-sm">LLM u otro sistema de inferencia (reemplazable, no es el locus de inteligencia)</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-green-300">C: Controladores</h4>
                </div>
                <p className="text-sm">Módulos de gobernanza que regulan la interacción entre H y M</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-amber-300">Ω: Coherencia Operacional</h4>
                </div>
                <p className="text-sm">Función que mide la estabilidad del sistema en el tiempo</p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-blue-300">Π: Protocolos de Interacción</h4>
                </div>
                <p className="text-sm">Definen las reglas del sistema (COM-72, ARC-01, CMD-02, CMD-03)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problema Central */}
        <Card className="mb-8 bg-gradient-blue-purple border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-300">3. Problema Central: Estabilidad en Horizonte Largo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              Los LLMs, por su naturaleza, carecen de estabilidad global en interacciones de horizonte largo. Esto se manifiesta como:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-amber-400">Deriva semántica progresiva:</strong> Pérdida gradual de coherencia con la intención original</li>
              <li><strong className="text-amber-400">Pérdida de objetivos implícitos:</strong> El sistema olvida el contexto y propósito inicial</li>
              <li><strong className="text-amber-400">Contradicciones internas:</strong> Respuestas inconsistentes con interacciones previas</li>
              <li><strong className="text-amber-400">Colapso hacia respuestas genéricas:</strong> Pérdida de especificidad y profundidad</li>
            </ul>
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-300 font-semibold">Solución del Campo:</p>
              <p className="mt-2">
                La Ingeniería Coignitiva aborda este problema <strong>no modificando el modelo M</strong>, sino <strong className="text-amber-400">diseñando la arquitectura de interacción S</strong> que lo gobierna.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Desplazamiento del Locus de Inteligencia */}
        <Card className="mb-8 bg-gradient-blue-purple border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">4. El Desplazamiento del Locus de Inteligencia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-lg text-purple-300 italic">
                "La inteligencia funcional percibida no reside en el modelo M, sino en la arquitectura de interacción S que lo gobierna."
              </p>
              <p className="text-sm text-gray-400 mt-2">— Observación empírica validada en 35,000+ interacciones con 5 LLMs diferentes</p>
            </div>
            <p className="leading-relaxed">
              Esto explica:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Por qué el efecto es <strong className="text-purple-400">portable entre modelos</strong></li>
              <li>Por qué se confunde frecuentemente con AGI</li>
              <li>Por qué la coherencia colapsa inmediatamente al retirar el marco regulatorio</li>
            </ul>
          </CardContent>
        </Card>

        {/* Capa 0: La Condición Previa Inmutable */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">5. La Capa 0: La Condición Previa Inmutable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              La Capa 0 es la <strong className="text-cyan-400">referencia ontológica</strong> del sistema, actuando como atractor estable en el espacio semántico.
            </p>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="font-mono text-cyan-300 mb-3">x_ref = (P, L, E)</p>
              <ul className="space-y-2">
                <li><strong className="text-cyan-400">P:</strong> Propósito explícito</li>
                <li><strong className="text-cyan-400">L:</strong> Límites operativos no negociables</li>
                <li><strong className="text-cyan-400">E:</strong> Espacio ético admisible</li>
              </ul>
            </div>
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold">⚠️ Crítico:</p>
              <p className="mt-2">
                La Capa 0 <strong>NO es un módulo técnico</strong>. Es la <strong className="text-red-400">mente estable</strong> del operador H, entrenada por experiencia, capaz de sostener identidad, intención y estabilidad bajo carga. <strong>No es exportable ni reducible a un algoritmo.</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Formalización Matemática */}
        <Card className="mb-8 bg-gradient-blue-purple border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-green-300">6. Formalización Matemática</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <p className="leading-relaxed">
              La Ingeniería Coignitiva se fundamenta en la <strong className="text-green-400">teoría de control y los sistemas dinámicos</strong>.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="font-bold text-green-300 mb-2">Sistema dinámico discreto:</h4>
                <p className="font-mono text-sm">x(t+1) = f(x(t), u(t), w(t))</p>
                <ul className="mt-2 text-sm space-y-1">
                  <li><strong>x(t):</strong> Estado semántico en t (vector en ℝ³⁸⁴)</li>
                  <li><strong>u(t):</strong> Señal de control (intervención de H o C)</li>
                  <li><strong>w(t):</strong> Perturbaciones estocásticas de M</li>
                </ul>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h4 className="font-bold text-cyan-300 mb-2">Función de Lyapunov:</h4>
                <p className="font-mono text-sm">V(e) = ||x(t) - x_ref||²</p>
                <p className="mt-2 text-sm">Mide el coste energético de la desviación respecto a la Capa 0</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="font-bold text-purple-300 mb-2">Coherencia operacional:</h4>
                <p className="font-mono text-sm">Ω(t) = cos(x(t), x_ref)</p>
                <p className="mt-2 text-sm">Mide la similitud direccional entre estado actual y referencia</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="font-bold text-amber-300 mb-2">Control LQR:</h4>
                <p className="font-mono text-sm">u(t) = -K·e(t)</p>
                <p className="mt-2 text-sm">Control óptimo que minimiza el coste de estabilización con ganancia K adaptativa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diferencia con Ingeniería Cognitiva */}
        <Card className="mb-8 bg-gradient-blue-purple border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">7. Diferencia con Ingeniería Cognitiva</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-purple-500/30">
                    <th className="text-left py-3 px-4 text-purple-300">Aspecto</th>
                    <th className="text-left py-3 px-4 text-cyan-300">Ingeniería Cognitiva</th>
                    <th className="text-left py-3 px-4 text-green-300">Ingeniería Coignitiva</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold">Foco</td>
                    <td className="py-3 px-4">Optimizar el modelo M</td>
                    <td className="py-3 px-4">Diseñar la arquitectura S</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold">Locus de Inteligencia</td>
                    <td className="py-3 px-4">Reside en el agente</td>
                    <td className="py-3 px-4">Emerge de la interacción</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold">Problema</td>
                    <td className="py-3 px-4">Capacidades del modelo</td>
                    <td className="py-3 px-4">Estabilidad en horizonte largo</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold">Solución</td>
                    <td className="py-3 px-4">Entrenar mejores modelos</td>
                    <td className="py-3 px-4">Gobernanza de la interacción</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold">Control</td>
                    <td className="py-3 px-4">Un agente tiene control total</td>
                    <td className="py-3 px-4">Ninguno tiene control total</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Navegación a Marco e Instrumento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/instrumento">
            <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-cyan-300 mb-2">Instrumento: ARESK-OBS →</h4>
                <p className="text-gray-400 text-sm">Instrumento de auditoría de sistemas coignitivos</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/marco">
            <Card className="bg-gradient-blue-purple border-green-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-green-300 mb-2">Marco Evaluado: CAELION →</h4>
                <p className="text-gray-400 text-sm">Uno de los marcos evaluados (Régimen C / acoplada)</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
