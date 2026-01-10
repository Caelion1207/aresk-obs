import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  GitBranch, 
  Shield, 
  Clock,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function Protocols() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/modules">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                ← Módulos
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Protocolos Internos</h1>
            <Link href="/proposals">
              <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                Propuestas v3.0 →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
            Protocolos Estandarizados
          </Badge>
          <h2 className="text-4xl font-bold text-white mb-4">
            Regulación de Interacción, Coherencia, Ética y Seguridad
          </h2>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Uno de los aspectos más innovadores de CAELION es la definición y estandarización de protocolos 
            internos que regulan la interacción, la coherencia, la ética y la seguridad del sistema.
          </p>
        </div>

        <Tabs defaultValue="com72" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-slate-900 mb-8">
            <TabsTrigger value="com72" className="data-[state=active]:bg-cyan-500/20">
              COM-72
            </TabsTrigger>
            <TabsTrigger value="cmd01" className="data-[state=active]:bg-green-500/20">
              CMD-01
            </TabsTrigger>
            <TabsTrigger value="eth01" className="data-[state=active]:bg-yellow-500/20">
              ETH-01
            </TabsTrigger>
            <TabsTrigger value="syn10" className="data-[state=active]:bg-orange-500/20">
              SYN-10
            </TabsTrigger>
          </TabsList>

          {/* COM-72 */}
          <TabsContent value="com72">
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Network className="w-12 h-12 text-cyan-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">COM-72: Protocolo de Coherencia y Organización Modular</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Garantiza coherencia lógica, semántica y pragmática entre módulos y agentes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    El protocolo COM-72 garantiza la coherencia lógica, semántica y pragmática entre los módulos 
                    y agentes del sistema. Incluye mecanismos de verificación, reconciliación de inconsistencias 
                    y actualización dinámica de las representaciones compartidas.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Mecanismos de Coherencia</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">Verificación Lógica</h4>
                      <p className="text-sm text-slate-300">
                        Comprueba que las creencias y acciones no contengan contradicciones formales
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">Reconciliación Semántica</h4>
                      <p className="text-sm text-slate-300">
                        Resuelve diferencias de interpretación entre agentes mediante negociación
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">Actualización Dinámica</h4>
                      <p className="text-sm text-slate-300">
                        Propaga cambios en representaciones compartidas a todos los módulos relevantes
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">Detección de Inconsistencias</h4>
                      <p className="text-sm text-slate-300">
                        Identifica conflictos entre estados de diferentes módulos en tiempo real
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-semibold mb-1">Implementado como Ω(t)</p>
                      <p className="text-slate-300 text-sm">
                        La métrica Ω(t) (Coherencia Observable) mide la coherencia semántica entre el estado actual 
                        x(t) y la referencia x_ref. COM-72 está implícito en el cálculo de similitud del coseno.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Propuesta v3.0</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Coherencia Multi-Sesión:</span> Extender Ω(t) para 
                        medir coherencia entre múltiples sesiones concurrentes
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Reconciliación Automática:</span> Cuando dos sesiones 
                        divergen, proponer x_ref intermedio que reconcilie ambas trayectorias
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CMD-01 */}
          <TabsContent value="cmd01">
            <Card className="bg-slate-900/50 border-green-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <GitBranch className="w-12 h-12 text-green-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">CMD-01: Protocolo de Comando y Decisión</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Regula toma de decisiones, asignación de tareas y coordinación de acciones
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    CMD-01 regula la toma de decisiones, la asignación de tareas y la coordinación de acciones 
                    entre agentes. Permite la delegación, la negociación y la resolución de conflictos de manera 
                    distribuida y transparente.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Funciones Principales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Toma de Decisiones</h4>
                      <p className="text-sm text-slate-300">
                        Establece procesos para que agentes tomen decisiones individuales o colectivas
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Asignación de Tareas</h4>
                      <p className="text-sm text-slate-300">
                        Distribuye responsabilidades entre agentes según capacidades y disponibilidad
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Delegación</h4>
                      <p className="text-sm text-slate-300">
                        Permite que agentes transfieran autoridad de decisión a otros de forma controlada
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Negociación</h4>
                      <p className="text-sm text-slate-300">
                        Facilita acuerdos cuando múltiples agentes tienen objetivos potencialmente conflictivos
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-semibold mb-1">Implementado como Alternancia de Perfiles</p>
                      <p className="text-slate-300 text-sm">
                        El usuario puede alternar entre Perfiles de Planta (Tipo A, Tipo B, Acoplada), lo que 
                        representa una forma de comando y decisión sobre el comportamiento del sistema.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Propuesta v3.0</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Decisiones Automáticas:</span> Permitir que el 
                        sistema cambie de perfil automáticamente si detecta que el actual no es efectivo
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Negociación Multi-Sesión:</span> Cuando múltiples 
                        sesiones compiten por recursos, usar protocolo de negociación para asignar prioridades
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ETH-01 */}
          <TabsContent value="eth01">
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="w-12 h-12 text-yellow-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">ETH-01: Protocolo de Ética Integrada</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Incorpora principios éticos en todos los procesos de decisión y acción
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    ETH-01 incorpora principios éticos en todos los procesos de decisión, aprendizaje y acción. 
                    Evalúa las consecuencias de las acciones, verifica el cumplimiento de normas y valores, y 
                    permite la auditoría y la trazabilidad de las decisiones.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Funciones del Protocolo</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Evaluación de Consecuencias</h4>
                      <p className="text-sm text-slate-300">
                        Analiza el impacto potencial de cada acción antes de su ejecución, considerando efectos 
                        a corto y largo plazo sobre todos los stakeholders
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Verificación de Cumplimiento</h4>
                      <p className="text-sm text-slate-300">
                        Comprueba que las acciones propuestas respeten principios éticos universales y normas 
                        contextuales establecidas
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Auditoría y Trazabilidad</h4>
                      <p className="text-sm text-slate-300">
                        Registra todas las decisiones éticas para revisión posterior, permitiendo aprendizaje 
                        y mejora continua del sistema
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Justificación de Decisiones</h4>
                      <p className="text-sm text-slate-300">
                        Proporciona explicaciones comprensibles de por qué ciertas acciones fueron permitidas 
                        o bloqueadas
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-300 font-semibold mb-1">Implementación Implícita</p>
                      <p className="text-slate-300 text-sm">
                        ETH-01 está implícito en el componente E (Ética) de Bucéfalo (x_ref). El sistema mide 
                        distancia a E pero no hay auditoría explícita ni justificación de violaciones.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Propuesta v3.0 (Alta Prioridad)</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Monitor de Cumplimiento Ético:</span> Dashboard 
                        que muestra en tiempo real el estado de cumplimiento de cada principio ético
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Registro de Auditoría:</span> Base de datos 
                        persistente de todas las violaciones éticas con contexto completo para análisis
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Trayectoria Ética:</span> Visualización de la 
                        evolución del cumplimiento ético a lo largo del tiempo
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SYN-10 */}
          <TabsContent value="syn10">
            <Card className="bg-slate-900/50 border-orange-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Clock className="w-12 h-12 text-orange-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">SYN-10: Protocolo de Sincronización y Seguridad</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Regula coherencia temporal y seguridad del sistema
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    SYN-10 regula la sincronización temporal y la seguridad del sistema. Incluye mecanismos de 
                    prevención y mitigación de fallos, redundancia simbiótica y defensa contra ataques de 
                    denegación de servicio (SYN flood), inspirándose en estrategias de ciberseguridad avanzadas.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Mecanismos de Seguridad</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Prevención de Fallos</h4>
                      <p className="text-sm text-slate-300">
                        Detecta condiciones que pueden llevar a fallos antes de que ocurran y toma medidas preventivas
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Mitigación de Fallos</h4>
                      <p className="text-sm text-slate-300">
                        Cuando ocurre un fallo, limita su propagación y activa mecanismos de recuperación
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Redundancia Simbiótica</h4>
                      <p className="text-sm text-slate-300">
                        Mantiene copias distribuidas de información crítica para garantizar disponibilidad
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Defensa contra Ataques</h4>
                      <p className="text-sm text-slate-300">
                        Protege contra sobrecarga intencional o accidental mediante rate limiting y filtrado
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-semibold mb-1">Implementado como TPR</p>
                      <p className="text-slate-300 text-sm">
                        TPR (Tiempo de Permanencia en Régimen) implementa el concepto de sincronización temporal. 
                        La detección de colapso (V(e) &gt; ε²) actúa como prevención de fallos.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Propuesta v3.0 (Alta Prioridad)</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Ritmo Cognitivo ρ(t):</span> Medir frecuencia de 
                        intercambios por unidad de tiempo para detectar arritmias cognitivas
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Espectrograma de Coherencia:</span> Análisis 
                        frecuencial de Ω(t) para identificar patrones temporales anormales
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Redundancia Multi-Sesión:</span> Replicar estados 
                        críticos entre sesiones para recuperación ante fallos catastróficos
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/50 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Protocolos Internos de CAELION · Regulación Estandarizada</p>
        </div>
      </footer>
    </div>
  );
}
