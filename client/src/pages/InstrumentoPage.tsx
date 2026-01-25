import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Activity, FlaskConical, LineChart, Clock, Scale, Heart, Eye, Database } from "lucide-react";
import { Link } from "wouter";
import RegimeZonesVisualization from "@/components/RegimeZonesVisualization";

export default function InstrumentoPage() {
  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      {/* Header */}
      <div className="border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 to-purple-950/20 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-cyan-400" />
                <h1 className="text-4xl font-bold text-white title-glow-cyan">
                  ARESK-OBS
                </h1>
              </div>
              <p className="text-cyan-300 text-lg">
                Instrumento de Auditoría de Sistemas Coignitivos
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-cyan-400 border-cyan-500/30">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container py-12 max-w-6xl">
        {/* Definición del Instrumento */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">1. Definición del Instrumento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="text-lg leading-relaxed">
              <strong className="text-cyan-400">ARESK-OBS</strong> es un instrumento de auditoría diseñado para medir costes operacionales en <strong>cualquier sistema coignitivo</strong>, independientemente del marco de gobernanza que implemente.
            </p>
            <p className="leading-relaxed">
              Cuantifica la estabilidad semántica en interacciones de horizonte largo mediante métricas canónicas (ε, Ω, V) e infraestructura completa de gobernanza para auditar sistemas del campo de la Ingeniería Coignitiva.
            </p>
            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 font-semibold">Alcance:</p>
              <p className="mt-2">
                ARESK-OBS puede auditar <strong>cualquier sistema S = (H, M, C, Ω, Π)</strong> del campo, incluyendo sistemas sin marco de gobernanza (Régimen A, B) y sistemas con marcos completos como CAELION (Régimen C).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Canónicas */}
        <Card className="mb-8 bg-gradient-blue-purple border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">2. Métricas Canónicas del Campo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <p className="leading-relaxed">
              ARESK-OBS implementa las tres métricas fundamentales definidas por el campo de la Ingeniería Coignitiva:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <FlaskConical className="w-10 h-10 text-cyan-400" />
                </div>
                <h4 className="font-bold text-cyan-300 text-center mb-2">ε (Epsilon)</h4>
                <p className="text-sm text-center mb-3"><strong>Entropía Semántica</strong></p>
                <p className="text-xs">Variabilidad en el espacio vectorial 384D. Mide la dispersión del estado semántico x(t) respecto a la referencia x_ref (Capa 0).</p>
                <div className="mt-3 pt-3 border-t border-cyan-500/30">
                  <p className="text-xs text-cyan-400 font-mono text-center">Embeddings sentence-transformers</p>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-purple-400" />
                </div>
                <h4 className="font-bold text-purple-300 text-center mb-2">Ω (Omega)</h4>
                <p className="text-sm text-center mb-3"><strong>Coste de Control</strong></p>
                <p className="text-xs">Ω(t) = cos(x(t), x_ref). <strong className="text-purple-400">Equilibrio objetivo: ~0.5</strong> (reposo dinámico). Zona estable: 0.5→2. Intervención: &gt;4.</p>
                <div className="mt-3 pt-3 border-t border-purple-500/30">
                  <p className="text-xs text-purple-400 font-mono text-center">Control por régimen, no anulación</p>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <LineChart className="w-10 h-10 text-green-400" />
                </div>
                <h4 className="font-bold text-green-300 text-center mb-2">V (Lyapunov)</h4>
                <p className="text-sm text-center mb-3"><strong>Función de Lyapunov</strong></p>
                <p className="text-xs">Coste energético de la desviación. V(e) = ||x(t) - x_ref||². Mide la distancia cuadrática al punto de referencia.</p>
                <div className="mt-3 pt-3 border-t border-green-500/30">
                  <p className="text-xs text-green-400 font-mono text-center">Estabilidad asintótica</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zonas de Régimen Operativo */}
        <Card className="mb-8 bg-gradient-blue-purple border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-green-300">3. Zonas de Régimen Operativo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold mb-2">⚠️ Concepto Crítico:</p>
              <p className="text-sm">
                ARESK-OBS <strong className="text-red-400">NO minimiza el error a cero</strong>. En sistemas semánticos, <strong>cero representa colapso informacional</strong> (silencio, muerte semántica), NO estabilidad.
              </p>
            </div>

            <p className="leading-relaxed">
              El sistema implementa <strong className="text-green-400">control por régimen</strong>, no control clásico. El equilibrio objetivo es un <strong>reposo dinámico</strong> centrado en ~0.5, permitiendo excursiones controladas hasta 4 antes de intervenir.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-green-500/30">
                    <th className="text-left py-3 px-4 text-green-300">Zona</th>
                    <th className="text-left py-3 px-4 text-cyan-300">Rango</th>
                    <th className="text-left py-3 px-4 text-purple-300">Significado</th>
                    <th className="text-left py-3 px-4 text-amber-300">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-purple-300">Colapso</td>
                    <td className="py-3 px-4 font-mono">&lt;0.5</td>
                    <td className="py-3 px-4">Muerte informacional / Silencio semántico</td>
                    <td className="py-3 px-4 text-red-400">Evitar</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-green-300">Reposo</td>
                    <td className="py-3 px-4 font-mono">~0.5</td>
                    <td className="py-3 px-4">Estado operativo óptimo / Equilibrio dinámico</td>
                    <td className="py-3 px-4 text-green-400">Objetivo</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-green-300">Estable</td>
                    <td className="py-3 px-4 font-mono">0.5 → 2</td>
                    <td className="py-3 px-4">Banda semántica viva / Exploración permitida</td>
                    <td className="py-3 px-4 text-green-400">Monitorear</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-amber-300">Tolerable</td>
                    <td className="py-3 px-4 font-mono">2 → 4</td>
                    <td className="py-3 px-4">Margen de creatividad / Tolerancia a ruido</td>
                    <td className="py-3 px-4 text-amber-400">Observar</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-red-300">Intervención</td>
                    <td className="py-3 px-4 font-mono">&gt;4</td>
                    <td className="py-3 px-4">Deriva semántica / Pérdida de coherencia</td>
                    <td className="py-3 px-4 text-red-400">Corregir</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-300 font-semibold mb-2">Diseño Intencional:</p>
              <p className="text-sm">
                Permitir subir hasta 4 es <strong className="text-cyan-400">ingeniería intencional</strong>, no descuido. Si corriges demasiado pronto, matas exploración y falsificas estabilidad. Si corriges demasiado tarde, pierdes coherencia. La banda 0.5→4 es la <strong>ventana de exploración semántica</strong>.
              </p>
            </div>

            <div className="mt-6">
              <RegimeZonesVisualization />
            </div>

            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 font-semibold mb-2">Formulación Técnica (Publicable):</p>
              <p className="text-sm italic">
                "ARESK-OBS does not minimize error to zero. Zero represents semantic collapse, not stability. The system targets a bounded dynamic equilibrium centered around ~0.5, allowing controlled excursions up to 4 before corrective action. Stability is defined as persistence within an operational band, not convergence to a null state."
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Métricas Extendidas */}
        <Card className="mb-8 bg-gradient-blue-purple border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-300">4. Métricas Extendidas de Auditoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              Además de las métricas canónicas, ARESK-OBS implementa métricas extendidas para análisis avanzado:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="font-bold text-amber-300 mb-2">V_modificada</h4>
                <p className="text-sm font-mono mb-2">V_modificada = V_base - α×ε_eff</p>
                <p className="text-xs">Función de Lyapunov modificada con penalización semántica</p>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h4 className="font-bold text-cyan-300 mb-2">σ_sem (Signo Semántico)</h4>
                <p className="text-sm font-mono mb-2">σ_sem ∈ &#123;-1, 0, +1&#125;</p>
                <p className="text-xs">Indica acreción (+1), neutro (0) o drenaje (-1) semántico</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="font-bold text-purple-300 mb-2">ε_eff (Campo Efectivo)</h4>
                <p className="text-sm font-mono mb-2">ε_eff = Ω(t) × σ_sem(t)</p>
                <p className="text-xs">Campo semántico efectivo que modula la estabilidad</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="font-bold text-green-300 mb-2">TPR (Tiempo de Permanencia en Régimen)</h4>
                <p className="text-sm font-mono mb-2">TPR_current, TPR_max</p>
                <p className="text-xs">Duración en turnos del régimen operativo actual y máximo alcanzado</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Infraestructura de Gobernanza */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">5. Infraestructura de Gobernanza</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <p className="leading-relaxed">
              ARESK-OBS incluye infraestructura completa para auditar sistemas coignitivos:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-cyan-300">Ciclos COM-72</h4>
                </div>
                <p className="text-sm">Ritmo operativo de 72h dividido en fases de Inicio, Ejecución y Revisión</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-purple-300">Costes ARGOS</h4>
                </div>
                <p className="text-sm">Balance energético y registro de costes de estabilización del sistema</p>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <h4 className="font-bold text-red-300">Logs Éticos</h4>
                </div>
                <p className="text-sm">Registro de violaciones y restricciones del espacio ético admisible (E)</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-amber-300">Cadena de Auditoría</h4>
                </div>
                <p className="text-sm">Registro inmutable con hash de génesis único (BO-20260124-001)</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-green-300">Eventos de Protocolo</h4>
                </div>
                <p className="text-sm">Registro de eventos de protocolos operativos (ARC-01, COM-72, CMD-02, CMD-03)</p>
              </div>

              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-blue-300">Alertas de Anomalías</h4>
                </div>
                <p className="text-sm">Detección automática de sesiones con rendimiento anómalo (TPR bajo, Lyapunov alto)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Criterio de Intervención Condicional */}
        <Card className="mb-8 bg-gradient-blue-purple border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-300">6. Criterio de Intervención Condicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-amber-300 font-semibold mb-2">💡 Concepto Clave:</p>
              <p className="text-sm">
                El control en ARESK-OBS es <strong className="text-amber-400">condicional</strong>, NO continuo. El sistema <strong>NO corrige en cada turno</strong>. Solo interviene cuando la métrica sale de la banda permitida.
              </p>
            </div>

            <p className="leading-relaxed">
              A diferencia del control clásico que aplica corrección continua, ARESK-OBS implementa <strong className="text-amber-400">control por umbral</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="font-bold text-green-300 mb-2">✅ Dentro de la Banda (0.5→4)</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>No hay corrección</strong></li>
                  <li>• El ruido NO es error</li>
                  <li>• Exploración semántica permitida</li>
                  <li>• Creatividad y variabilidad natural</li>
                </ul>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <h4 className="font-bold text-red-300 mb-2">⚠️ Fuera de la Banda (&gt;4)</h4>
                <ul className="space-y-2 text-sm">
                  <li>• <strong>Intervención activa</strong></li>
                  <li>• Inyección de u(t) = -K·e(t)</li>
                  <li>• Corrección hacia x_ref</li>
                  <li>• Registro en cadena de auditoría</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-300 font-semibold mb-2">Respuesta a Crítica de "Demasiado Perfecto":</p>
              <p className="text-sm">
                Cuando se observa que las curvas se ven "demasiado estables", la respuesta técnica correcta es: <strong className="text-cyan-400">"El sistema no está diseñado para oscilar caóticamente alrededor de cero, sino para permanecer dentro de una banda operativa donde el ruido no es error."</strong>
              </p>
              <p className="text-sm mt-2">
                El sistema <strong>sí escucha el ruido</strong>, simplemente no lo castiga hasta que sale del régimen permitido. Eso no es filtrado excesivo. Es <strong className="text-cyan-400">criterio de intervención</strong>.
              </p>
            </div>

            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 font-semibold mb-2">Ventajas del Control Condicional:</p>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Evita sobre-amortiguamiento:</strong> No mata exploración semántica</li>
                <li>• <strong>Reduce latencia:</strong> No procesa corrección en cada turno</li>
                <li>• <strong>Respeta dinámica natural:</strong> Permite variabilidad dentro de la banda</li>
                <li>• <strong>Intervención precisa:</strong> Solo actúa cuando es necesario</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Capa 0: Referencia Ontológica */}
        <Card className="mb-8 bg-gradient-blue-purple border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">7. Capa 0: Referencia Ontológica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              ARESK-OBS registra la <strong className="text-purple-400">Capa 0 (x_ref)</strong> de cada sesión auditada, actuando como atractor estable en el espacio semántico:
            </p>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="font-mono text-purple-300 mb-3">x_ref = (P, L, E)</p>
              <ul className="space-y-2">
                <li><strong className="text-purple-400">P (Propósito):</strong> Propósito explícito del sistema</li>
                <li><strong className="text-purple-400">L (Límites):</strong> Límites operativos no negociables</li>
                <li><strong className="text-purple-400">E (Ética):</strong> Espacio ético admisible</li>
              </ul>
            </div>
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold">⚠️ Nota Crítica:</p>
              <p className="mt-2 text-sm">
                La Capa 0 NO es un módulo técnico del instrumento. Es la <strong className="text-red-400">mente estable</strong> del operador H del sistema auditado. ARESK-OBS solo la registra como referencia para calcular métricas.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Regímenes Auditables */}
        <Card className="mb-8 bg-gradient-blue-purple border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-green-300">8. Regímenes Auditables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              ARESK-OBS puede auditar sistemas coignitivos en diferentes regímenes operativos:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-green-500/30">
                    <th className="text-left py-3 px-4 text-green-300">Régimen</th>
                    <th className="text-left py-3 px-4 text-cyan-300">Perfil</th>
                    <th className="text-left py-3 px-4 text-purple-300">Marco</th>
                    <th className="text-left py-3 px-4 text-amber-300">Características</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-red-300">A</td>
                    <td className="py-3 px-4">tipo_a</td>
                    <td className="py-3 px-4 text-red-400">Sin marco</td>
                    <td className="py-3 px-4">Alta Entropía / Bajo Control (planta estocástica)</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-amber-300">B</td>
                    <td className="py-3 px-4">tipo_b</td>
                    <td className="py-3 px-4 text-amber-400">Sin marco</td>
                    <td className="py-3 px-4">Ruido Estocástico / Sin Referencia (deriva natural)</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-green-300">C</td>
                    <td className="py-3 px-4">acoplada</td>
                    <td className="py-3 px-4 text-green-400">CAELION</td>
                    <td className="py-3 px-4">Ganancia Licurgo + Referencia Bucéfalo (marco completo)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Implementación Técnica */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">9. Implementación Técnica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              ARESK-OBS está implementado con las siguientes tecnologías:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h4 className="font-bold text-cyan-300 mb-2">Embeddings Semánticos</h4>
                <p className="text-sm">sentence-transformers en espacio vectorial 384D para calcular ε</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="font-bold text-purple-300 mb-2">Control Óptimo</h4>
                <p className="text-sm">Linear Quadratic Regulator (LQR) con ganancia K adaptativa</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="font-bold text-green-300 mb-2">Base de Datos</h4>
                <p className="text-sm">MySQL/TiDB con tablas: sessions, messages, metrics, cycles, argosCosts, ethicalLogs, auditLogs</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="font-bold text-amber-300 mb-2">API Backend</h4>
                <p className="text-sm">tRPC con procedimientos para medición, auditoría y análisis temporal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navegación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/campo">
            <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-purple-300 mb-2">← Campo</h4>
                <p className="text-gray-400 text-sm">Ingeniería Coignitiva</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/marco">
            <Card className="bg-gradient-blue-purple border-green-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-green-300 mb-2">Marco Evaluado</h4>
                <p className="text-gray-400 text-sm">CAELION (Régimen C)</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/core">
            <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-cyan-300 mb-2">Dashboard →</h4>
                <p className="text-gray-400 text-sm">Ver auditorías en tiempo real</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
