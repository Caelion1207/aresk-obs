import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Network, Shield, Eye, Zap, Scale, Heart } from "lucide-react";
import { Link } from "wouter";

export default function MarcoPage() {
  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      {/* Header */}
      <div className="border-b border-green-500/30 bg-gradient-to-r from-green-950/20 to-cyan-950/20 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Network className="w-8 h-8 text-green-400" />
                <h1 className="text-4xl font-bold text-white title-glow-cyan">
                  CAELION
                </h1>
              </div>
              <p className="text-green-300 text-lg">
                Marco de Gobernanza Evaluado por ARESK-OBS (Régimen C / Acoplada)
              </p>
            </div>
            <Link href="/">
              <Button variant="ghost" className="text-green-400 border-green-500/30">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container py-12 max-w-6xl">
        {/* Definición del Marco */}
        <Card className="mb-8 bg-gradient-blue-purple border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-green-300">1. Definición del Marco</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="text-lg leading-relaxed">
              <strong className="text-green-400">CAELION</strong> es un <strong>marco de viabilidad operativa</strong> evaluado por el instrumento ARESK-OBS. Corresponde al <strong className="text-green-400">Régimen C (acoplada)</strong> en los experimentos de viabilidad.
            </p>
            <p className="leading-relaxed">
              Implementa un <strong className="text-cyan-400">supervisor por invariancia</strong> que garantiza permanencia en el dominio de legitimidad, sin optimizar ni predecir. No describe mecanismos de optimización ni control, sino las condiciones bajo las cuales la acción del sistema es legítima y cuándo dicha legitimidad se agota.
            </p>
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 font-semibold">Principio Fundamental:</p>
              <p className="mt-2">
                CAELION <strong>NO optimiza</strong>. <strong>NO predice</strong>. <strong>Garantiza permanencia</strong> en el dominio de legitimidad D_leg(t).
              </p>
            </div>
            <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="text-cyan-300 font-semibold">Auditoría:</p>
              <p className="mt-2">
                CAELION es observado por <strong className="text-cyan-400">ARESK-OBS</strong> en el régimen "acoplada" (perfil C) y comparado con regímenes sin marco de gobernanza (tipo_a y tipo_b) para medir su efectividad en mantener viabilidad operativa.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Módulos Supervisores */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">2. Módulos Supervisores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <p className="leading-relaxed">
              CAELION implementa 5 módulos supervisores que regulan diferentes aspectos de la interacción coignitiva:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-cyan-300">WABUN</h4>
                </div>
                <p className="text-sm"><strong>Registro y Trazabilidad:</strong> Bitácora operativa inmutable con cadena de hash de génesis</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-5 h-5 text-purple-400" />
                  <h4 className="font-bold text-purple-300">LIANG</h4>
                </div>
                <p className="text-sm"><strong>Coherencia Estructural:</strong> Mantiene consistencia semántica con la Capa 0 (x_ref)</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-amber-300">ARGOS</h4>
                </div>
                <p className="text-sm"><strong>Balance Energético:</strong> Mide costes de estabilización y recursos consumidos</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-green-300">ARESK</h4>
                </div>
                <p className="text-sm"><strong>Control de Ejecución:</strong> Aplica control LQR para mantener estabilidad operacional</p>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  <h4 className="font-bold text-red-300">HÉCATE</h4>
                </div>
                <p className="text-sm"><strong>Restricciones Éticas:</strong> Registra violaciones y mantiene espacio ético admisible (E)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Protocolos Operativos */}
        <Card className="mb-8 bg-gradient-blue-purple border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">3. Protocolos Operativos (Nivel 3)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              Los protocolos definen las reglas de interacción del sistema coignitivo bajo CAELION:
            </p>
            <div className="space-y-3">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <h4 className="font-bold text-cyan-300 mb-2">ARC-01: Memoria y Conexiones</h4>
                <p className="text-sm">Gestiona la memoria de largo plazo y las conexiones entre turnos de interacción</p>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <h4 className="font-bold text-purple-300 mb-2">COM-72: Ritmo 72h (Inicio-Ejecución-Revisión)</h4>
                <p className="text-sm">Ciclo operativo de 72 horas dividido en fases de inicio, ejecución y revisión</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="font-bold text-green-300 mb-2">CMD-02: Planificador de Tareas</h4>
                <p className="text-sm">Interpreta intenciones y genera secuencias de tareas ejecutables</p>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <h4 className="font-bold text-amber-300 mb-2">CMD-03: Ejecutor de Secuencias</h4>
                <p className="text-sm">Ejecuta secuencias de tareas con supervisión y registro de resultados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Directivas Operacionales */}
        <Card className="mb-8 bg-gradient-blue-purple border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-amber-300">4. Directivas Operacionales (Nivel 2)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              Las directivas establecen políticas de alto nivel para el sistema:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                <p className="font-mono text-sm text-cyan-300">DOS-01: Generación Autónoma</p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <p className="font-mono text-sm text-purple-300">DOS-07: Soberanía Cognitiva</p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="font-mono text-sm text-green-300">DOS-08: Convergencia Total</p>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <p className="font-mono text-sm text-amber-300">DOS-09: Proyección Universal</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg col-span-1 md:col-span-2">
                <p className="font-mono text-sm text-red-300">DOS-10: Eternum (Archivo Permanente)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ciclo Operativo */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">5. Ciclo Operativo (Nivel 1)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <h4 className="font-bold text-cyan-300 mb-2">CO-01: CO-GLACTA_INICIO (Decreto NM-01)</h4>
              <p className="text-sm">
                Ciclo operativo de nivel 1 que establece el punto de inicio inmutable del sistema. Basado en el Decreto NM-01 que define la génesis operacional.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Registros Inmutables */}
        <Card className="mb-8 bg-gradient-blue-purple border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">6. Registros Inmutables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <h4 className="font-bold text-purple-300 mb-2">BO-20260124-001: Bitácora Operativa</h4>
              <p className="text-sm">
                Registro inmutable con génesis único que documenta todas las operaciones del sistema. Implementa cadena de hash para garantizar integridad histórica.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Régimen C vs Regímenes A y B */}
        <Card className="mb-8 bg-gradient-blue-purple border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-green-300">7. Régimen C (Acoplada) en Experimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              En los experimentos de ARESK-OBS, CAELION se activa como <strong className="text-green-400">Régimen C (acoplada)</strong> y se compara con regímenes sin marco de gobernanza:
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
                    <td className="py-3 px-4">Alta Entropía / Bajo Control</td>
                  </tr>
                  <tr className="border-b border-gray-700">
                    <td className="py-3 px-4 font-semibold text-amber-300">B</td>
                    <td className="py-3 px-4">tipo_b</td>
                    <td className="py-3 px-4 text-amber-400">Sin marco</td>
                    <td className="py-3 px-4">Ruido Estocástico / Sin Referencia</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-semibold text-green-300">C</td>
                    <td className="py-3 px-4">acoplada</td>
                    <td className="py-3 px-4 text-green-400">CAELION</td>
                    <td className="py-3 px-4">Ganancia Licurgo + Referencia Bucéfalo</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-300 font-semibold">Objetivo del Experimento:</p>
              <p className="mt-2">
                Medir si el marco CAELION (Régimen C) logra mantener <strong>mayor estabilidad semántica</strong> (Ω &gt; 0.5, V bajo, ε controlado) en comparación con sistemas sin gobernanza (Regímenes A y B).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Diagrama del Sistema */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">8. Diagrama del Sistema Unificado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              El diagrama completo del sistema CAELION muestra la interacción entre módulos supervisores, protocolos operativos, directivas y ciclos:
            </p>
            <Link href="/sistema/flujo">
              <Button className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400">
                Ver Diagrama del Sistema Unificado →
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Navegación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/campo">
            <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-purple-300 mb-2">← Campo: Ingeniería Coignitiva</h4>
                <p className="text-gray-400 text-sm">Fundamentos teóricos del campo</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/instrumento">
            <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan cursor-pointer">
              <CardContent className="p-6">
                <h4 className="text-xl font-bold text-cyan-300 mb-2">Instrumento: ARESK-OBS →</h4>
                <p className="text-gray-400 text-sm">Instrumento que audita CAELION</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
