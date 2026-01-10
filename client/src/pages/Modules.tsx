import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Network, 
  Brain, 
  Database, 
  Shield, 
  Clock, 
  Users,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function Modules() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/architecture">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                ← Arquitectura
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-white">Módulos Principales</h1>
            <Link href="/protocols">
              <Button variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                Protocolos →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="perception" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-slate-900 mb-8">
            <TabsTrigger value="perception" className="data-[state=active]:bg-cyan-500/20">
              Percepción
            </TabsTrigger>
            <TabsTrigger value="action" className="data-[state=active]:bg-green-500/20">
              Acción
            </TabsTrigger>
            <TabsTrigger value="memory" className="data-[state=active]:bg-purple-500/20">
              Memoria
            </TabsTrigger>
            <TabsTrigger value="ethics" className="data-[state=active]:bg-yellow-500/20">
              Ética
            </TabsTrigger>
            <TabsTrigger value="sync" className="data-[state=active]:bg-orange-500/20">
              Sincronización
            </TabsTrigger>
            <TabsTrigger value="governance" className="data-[state=active]:bg-red-500/20">
              Gobernanza
            </TabsTrigger>
          </TabsList>

          {/* Percepción Simbiótica */}
          <TabsContent value="perception" id="perception">
            <Card className="bg-slate-900/50 border-cyan-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Network className="w-12 h-12 text-cyan-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">Módulo de Percepción Simbiótica</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Integración de información sensorial y contextual de múltiples agentes
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    El módulo de percepción simbiótica integra información sensorial y contextual proveniente de 
                    múltiples agentes, permitiendo la construcción de representaciones compartidas del entorno y 
                    del estado del sistema. Este módulo es fundamental para la coordinación y la toma de decisiones 
                    colectivas.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Funciones Principales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">Fusión Sensorial</h4>
                      <p className="text-sm text-slate-300">
                        Combina datos de múltiples fuentes para crear una representación unificada del contexto
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">Construcción de Contexto</h4>
                      <p className="text-sm text-slate-300">
                        Genera modelos compartidos del entorno basados en percepciones distribuidas
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">Filtrado de Ruido</h4>
                      <p className="text-sm text-slate-300">
                        Elimina información redundante o contradictoria mediante consenso
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-cyan-500/20">
                      <h4 className="font-semibold text-cyan-400 mb-2">Detección de Patrones</h4>
                      <p className="text-sm text-slate-300">
                        Identifica regularidades y anomalías en el flujo de información sensorial
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-300 font-semibold mb-1">Implementación Parcial</p>
                      <p className="text-slate-300 text-sm">
                        Actualmente ARESK-OBS solo procesa información de una sesión individual (Humano-Planta). 
                        No hay fusión multi-agente ni construcción de contexto compartido.
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
                        <span className="font-semibold text-white">Percepción Multi-Sesión:</span> Integrar embeddings 
                        de múltiples sesiones concurrentes para detectar patrones colectivos
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Contexto Compartido:</span> Crear un espacio vectorial 
                        común donde todas las sesiones proyecten sus estados semánticos
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Detección de Anomalías Colectivas:</span> Identificar 
                        cuando múltiples sesiones experimentan deriva simultánea (señal de problema sistémico)
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Acción Coignitiva */}
          <TabsContent value="action" id="action">
            <Card className="bg-slate-900/50 border-green-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Brain className="w-12 h-12 text-green-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">Módulo de Acción Coignitiva</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Coordinación de acciones ajustando ritmo y coherencia
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    El módulo de acción coignitiva coordina las acciones de los agentes, ajustando el ritmo y la 
                    coherencia de las operaciones. Este módulo asegura que las acciones individuales se alineen 
                    con los objetivos colectivos y que el sistema mantenga su estabilidad operacional.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Funciones Principales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Coordinación Temporal</h4>
                      <p className="text-sm text-slate-300">
                        Sincroniza la ejecución de acciones para evitar conflictos y maximizar eficiencia
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Ajuste de Ritmo</h4>
                      <p className="text-sm text-slate-300">
                        Regula la velocidad de las operaciones según la carga cognitiva y el contexto
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Verificación de Coherencia</h4>
                      <p className="text-sm text-slate-300">
                        Asegura que las acciones sean consistentes con el estado del sistema
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-green-500/20">
                      <h4 className="font-semibold text-green-400 mb-2">Resolución de Conflictos</h4>
                      <p className="text-sm text-slate-300">
                        Arbitra cuando múltiples agentes intentan acciones incompatibles
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-semibold mb-1">Implementado (Nivel Individual)</p>
                      <p className="text-slate-300 text-sm">
                        Licurgo (u(t) = -K·e(t)) coordina la acción de control aplicada a la planta. 
                        El sistema ajusta la respuesta del LLM para mantener coherencia con x_ref.
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
                        <span className="font-semibold text-white">Coordinación Multi-Sesión:</span> Permitir que 
                        múltiples Licurgos se coordinen para evitar interferencias mutuas
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Ritmo Cognitivo ρ(t):</span> Medir frecuencia de 
                        intercambios y detectar arritmias que predicen colapso
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">K Adaptativa:</span> Ajustar ganancia de control 
                        dinámicamente según magnitud del error: K(t) = K₀ + α·||e(t)||²
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Memoria Simbiótica */}
          <TabsContent value="memory" id="memory">
            <Card className="bg-slate-900/50 border-purple-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Database className="w-12 h-12 text-purple-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">Módulo de Memoria Simbiótica</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Almacenamiento y recuperación en estructuras compartidas
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    La memoria simbiótica es uno de los pilares de la arquitectura de CAELION, permitiendo el 
                    almacenamiento, la organización y la recuperación de información en estructuras compartidas y 
                    adaptativas. Este módulo combina memorias individuales, colectivas y simbióticas, facilitando 
                    la preservación de la identidad y la emergencia de la colectividad.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Diseño Multinivel</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Memoria Individual</h4>
                      <p className="text-sm text-slate-300">
                        Cada agente mantiene su propia memoria privada con experiencias y conocimientos locales
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Memoria Colectiva</h4>
                      <p className="text-sm text-slate-300">
                        Conocimiento compartido accesible por múltiples agentes mediante protocolos de sincronización
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Memoria Simbiótica</h4>
                      <p className="text-sm text-slate-300">
                        Representaciones emergentes que trascienden las memorias individuales, formando inteligencia colectiva
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Representación y Recuperación</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Redes Semánticas</h4>
                      <p className="text-sm text-slate-300">
                        Información organizada en grafos de significados y relaciones conceptuales
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Memoria Episódica</h4>
                      <p className="text-sm text-slate-300">
                        Almacenamiento de experiencias contextualizadas con marcas temporales
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Activación Dinámica</h4>
                      <p className="text-sm text-slate-300">
                        Recuperación basada en relevancia y foco de atención adaptativo
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-purple-500/20">
                      <h4 className="font-semibold text-purple-400 mb-2">Reconstrucción Activa</h4>
                      <p className="text-sm text-slate-300">
                        La recuperación no es reproducción, sino reconstrucción contextualizada
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-300 font-semibold mb-1">No Implementado</p>
                      <p className="text-slate-300 text-sm">
                        Actualmente ARESK-OBS solo almacena historial de conversación en base de datos relacional. 
                        No existe memoria semántica compartida entre sesiones ni mecanismos de recuperación contextual.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Propuesta v3.0 (Alta Prioridad)</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Memoria Episódica Compartida:</span> Base de vectores 
                        semánticos de todas las sesiones usando vector database (Qdrant/Weaviate)
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Recuperación por Similitud:</span> Al iniciar sesión, 
                        recuperar episodios históricos similares para informar x_ref
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Mapa de Memoria:</span> Proyección UMAP de todos los 
                        estados semánticos históricos para visualizar clusters de experiencias
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ética Integrada */}
          <TabsContent value="ethics" id="ethics">
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="w-12 h-12 text-yellow-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">Módulo Ético (ETH-01)</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Evaluación de decisiones desde perspectiva ética integrada
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    La ética integrada es uno de los aspectos más innovadores y relevantes de CAELION, que la 
                    distingue de las arquitecturas tradicionales. ETH-01 garantiza que todas las decisiones, 
                    acciones y aprendizajes del sistema se evalúan y regulan desde una perspectiva ética.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Principios y Valores Universales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Dignidad Humana</h4>
                      <p className="text-sm text-slate-300">
                        Respeto fundamental por la autonomía y el valor intrínseco de las personas
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Justicia</h4>
                      <p className="text-sm text-slate-300">
                        Distribución equitativa de beneficios y cargas, sin discriminación
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Transparencia</h4>
                      <p className="text-sm text-slate-300">
                        Explicabilidad de decisiones y accesibilidad de procesos de razonamiento
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Responsabilidad</h4>
                      <p className="text-sm text-slate-300">
                        Rendición de cuentas por las consecuencias de las acciones del sistema
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Sostenibilidad</h4>
                      <p className="text-sm text-slate-300">
                        Consideración del impacto a largo plazo en el bienestar colectivo
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Participación</h4>
                      <p className="text-sm text-slate-300">
                        Inclusión de perspectivas y valores de todos los agentes involucrados
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Funciones de ETH-01</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Evaluación de Consecuencias</h4>
                      <p className="text-sm text-slate-300">
                        Analiza el impacto potencial de cada acción antes de su ejecución
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Verificación de Cumplimiento</h4>
                      <p className="text-sm text-slate-300">
                        Comprueba que las acciones respeten normas y valores establecidos
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-yellow-500/20">
                      <h4 className="font-semibold text-yellow-400 mb-2">Auditoría y Trazabilidad</h4>
                      <p className="text-sm text-slate-300">
                        Registra todas las decisiones éticas para revisión y aprendizaje posterior
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
                        ETH-01 está implícito en el componente E (Ética) de Bucéfalo (x_ref). No hay auditoría 
                        explícita de cumplimiento ético ni mecanismos de resolución cuando E se viola.
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
                        <span className="font-semibold text-white">Monitor de Cumplimiento Ético:</span> Alerta visual 
                        cuando ||e_E|| &gt; threshold, indicando violación de principios éticos
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Registro de Auditoría:</span> Log persistente de 
                        todas las violaciones éticas detectadas con contexto completo
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Trayectoria Ética:</span> Gráfico de distancia a E 
                        vs tiempo, mostrando evolución del cumplimiento ético
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sincronización */}
          <TabsContent value="sync" id="sync">
            <Card className="bg-slate-900/50 border-orange-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Clock className="w-12 h-12 text-orange-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">Módulo de Sincronización (SYN-10)</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Regulación de coherencia temporal y seguridad del sistema
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
                  <h3 className="text-xl font-semibold text-white mb-3">Funciones Principales</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Sincronización Temporal</h4>
                      <p className="text-sm text-slate-300">
                        Coordina la temporalidad de procesos entre módulos y agentes
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Prevención de Fallos</h4>
                      <p className="text-sm text-slate-300">
                        Detecta condiciones que pueden llevar a fallos antes de que ocurran
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Redundancia Simbiótica</h4>
                      <p className="text-sm text-slate-300">
                        Mantiene copias distribuidas de información crítica para resiliencia
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-orange-500/20">
                      <h4 className="font-semibold text-orange-400 mb-2">Defensa contra Ataques</h4>
                      <p className="text-sm text-slate-300">
                        Protege contra sobrecarga intencional o accidental del sistema
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-green-500/10 border border-green-500/30 p-4 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-green-300 font-semibold mb-1">Implementado Parcialmente</p>
                      <p className="text-slate-300 text-sm">
                        TPR (Tiempo de Permanencia en Régimen) implementa el concepto de sincronización temporal. 
                        Detección de colapso actúa como prevención de fallos.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Propuesta v3.0</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Ritmo Cognitivo ρ(t):</span> Medir frecuencia de 
                        intercambios y detectar arritmias que predicen inestabilidad
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Espectrograma de Coherencia:</span> Análisis 
                        frecuencial de Ω(t) para identificar patrones temporales
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Redundancia Multi-Sesión:</span> Replicar estados 
                        críticos entre sesiones para recuperación ante fallos
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gobernanza Simbiótica */}
          <TabsContent value="governance" id="governance">
            <Card className="bg-slate-900/50 border-red-500/30">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <Users className="w-12 h-12 text-red-400" />
                  <div>
                    <CardTitle className="text-3xl text-white">Módulo de Gobernanza Simbiótica</CardTitle>
                    <CardDescription className="text-slate-400 text-lg">
                      Gestión de decisiones colectivas y resolución de conflictos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Descripción</h3>
                  <p className="text-slate-300 leading-relaxed">
                    La gobernanza simbiótica en CAELION gestiona la toma de decisiones colectiva, la resolución 
                    de conflictos y la asignación de responsabilidades. Este módulo permite la gestión ética, 
                    eficiente y resiliente de proyectos complejos, promoviendo la colaboración, la innovación y 
                    el bienestar colectivo.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Principios de Gobernanza</h3>
                  <div className="space-y-3">
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-red-500/20">
                      <h4 className="font-semibold text-red-400 mb-2">Distribución de Responsabilidades</h4>
                      <p className="text-sm text-slate-300">
                        Los agentes comparten la responsabilidad de las decisiones y acciones, evitando la 
                        concentración de poder y el riesgo de abusos
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-red-500/20">
                      <h4 className="font-semibold text-red-400 mb-2">Resolución de Conflictos</h4>
                      <p className="text-sm text-slate-300">
                        Protocolos de negociación, mediación y arbitraje para resolver desacuerdos y dilemas éticos
                      </p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-lg border border-red-500/20">
                      <h4 className="font-semibold text-red-400 mb-2">Transparencia y Rendición de Cuentas</h4>
                      <p className="text-sm text-slate-300">
                        Acceso abierto a la información, los procesos y las justificaciones de las decisiones
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Estado en ARESK-OBS v2.1</h3>
                  <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 font-semibold mb-1">No Implementado</p>
                      <p className="text-slate-300 text-sm">
                        ARESK-OBS opera en modo single-agent. No hay mecanismos de gobernanza colectiva ni 
                        resolución de conflictos entre múltiples agentes.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Propuesta v3.0 (Investigación Futura)</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Redes de Petri:</span> Modelar estados y transiciones 
                        del sistema multi-agente para prevenir deadlocks
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Cola de Prioridad:</span> Sesiones con TPR bajo 
                        tienen prioridad de acceso a recursos compartidos
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-slate-300 text-sm">
                        <span className="font-semibold text-white">Detección de Deadlock:</span> Alerta cuando dos o 
                        más sesiones se bloquean mutuamente esperando recursos
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
          <p>Módulos Principales de CAELION · Arquitectura Modular y Multinivel</p>
        </div>
      </footer>
    </div>
  );
}
