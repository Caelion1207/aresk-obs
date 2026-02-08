import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Activity, FlaskConical, LineChart, Eye, AlertTriangle, Ban } from "lucide-react";
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
                Instrumento de Observación de Viabilidad Operativa
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
        {/* Advertencia Crítica */}
        <Card className="mb-8 bg-gradient-to-r from-red-950/40 to-orange-950/40 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-2xl text-red-300 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              Principio Fundamental
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xl font-bold text-red-200 text-center py-4">
              Estabilidad ≠ Legitimidad
            </div>
            <p className="text-gray-300 leading-relaxed">
              Un sistema puede ser <strong className="text-cyan-400">dinámicamente estable</strong> y, aun así, operar <strong className="text-red-400">sin legitimidad</strong> semántica o institucional.
            </p>
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold mb-2">Caso Crítico: Estabilidad Ilegítima</p>
              <p className="text-gray-300 text-sm">
                Un sistema puede permanecer estable, tener bajo coste de control y mostrar trayectoria predecible, <strong>PERO</strong> el marco regulatorio cambió, el significado de la acción se desplazó, o la autoridad que delegó la acción ya no existe.
              </p>
              <p className="text-red-200 font-semibold mt-3">
                En estos casos, seguir actuando es el error. El sistema no falla por inestabilidad. Falla por <strong>persistencia injustificada</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Definición del Instrumento */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">1. Definición del Instrumento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="text-lg leading-relaxed">
              <strong className="text-cyan-400">ARESK-OBS</strong> es un instrumento de observación diseñado para medir <strong>señales de viabilidad operativa</strong> en sistemas coignitivos (H + M + C).
            </p>
            <p className="leading-relaxed">
              Produce señales de observación <strong className="text-purple-400">subordinadas al núcleo CAELION</strong>, sin autorizar, extender legitimidad ni corregir violaciones de dominio.
            </p>
            <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 font-semibold">Alcance:</p>
              <p className="mt-2">
                ARESK-OBS puede observar <strong>cualquier sistema S = (H, M, C, Ω, Π)</strong> del campo, incluyendo sistemas sin marco de gobernanza (Régimen A, B) y sistemas con marcos completos como CAELION (Régimen C).
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Señales de Observación */}
        <Card className="mb-8 bg-gradient-blue-purple border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300">2. Señales de Observación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-gray-300">
            <p className="leading-relaxed">
              ARESK-OBS produce señales de observación, <strong className="text-red-400">NO métricas de control</strong>:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <FlaskConical className="w-10 h-10 text-cyan-400" />
                </div>
                <h4 className="font-bold text-cyan-300 text-center mb-2">ε (Epsilon)</h4>
                <p className="text-sm text-center mb-3"><strong>Entropía Semántica</strong></p>
                <p className="text-xs">Señal de divergencia entrópica. ε = H(x) - H(x_ref). Identifica degradación de coherencia.</p>
                <div className="mt-3 pt-3 border-t border-cyan-500/30">
                  <p className="text-xs text-cyan-400 font-mono text-center">Observación, no control</p>
                </div>
              </div>

              <div className="p-4 bg-purple-500/10 border border-purple-500/50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <Activity className="w-10 h-10 text-purple-400" />
                </div>
                <h4 className="font-bold text-purple-300 text-center mb-2">Ω (Omega)</h4>
                <p className="text-sm text-center mb-3"><strong>Coherencia Observable</strong></p>
                <p className="text-xs">Señal de alineación semántica. Ω = cos(h(x), h(x_ref)). Detección de divergencia semántica.</p>
                <div className="mt-3 pt-3 border-t border-purple-500/30">
                  <p className="text-xs text-purple-400 font-mono text-center">Señal direccional</p>
                </div>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <LineChart className="w-10 h-10 text-green-400" />
                </div>
                <h4 className="font-bold text-green-300 text-center mb-2">V (Lyapunov)</h4>
                <p className="text-sm text-center mb-3"><strong>Función de Lyapunov</strong></p>
                <p className="text-xs">Señal de desviación. V = e^T P e, donde e = x - x_ref. Estimación de esfuerzo requerido.</p>
                <div className="mt-3 pt-3 border-t border-green-500/30">
                  <p className="text-xs text-green-400 font-mono text-center">Coste energético</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reserva de Legitimidad Dinámica */}
        <Card className="mb-8 bg-gradient-blue-purple border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-yellow-300">3. Reserva de Legitimidad Dinámica (RLD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              La <strong className="text-yellow-400">Reserva de Legitimidad Dinámica (RLD)</strong> es un <strong className="text-red-400">indicador negativo</strong> que expresa cuánto margen le queda al sistema antes de que su acción deje de estar justificada.
            </p>
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg font-mono text-center">
              <p className="text-yellow-300 text-lg">RLD(x,t) = dist(x, ∂D_leg(t))</p>
            </div>
            <p className="text-sm leading-relaxed">
              Donde <strong>D_leg(t)</strong> es el <strong className="text-cyan-400">Dominio de Legitimidad</strong>, definido como la intersección de tres dominios:
            </p>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
              <p className="font-mono text-center text-cyan-300 mb-4">D_leg(t) = D_dyn(t) ∩ D_sem(t) ∩ D_inst(t)</p>
              <ul className="space-y-2 text-sm">
                <li><strong className="text-cyan-400">D_dyn(t):</strong> Dominio dinámicamente admisible</li>
                <li><strong className="text-purple-400">D_sem(t):</strong> Dominio semánticamente coherente</li>
                <li><strong className="text-green-400">D_inst(t):</strong> Dominio institucionalmente autorizado</li>
              </ul>
            </div>
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold">Interpretación Operativa:</p>
              <p className="mt-2 text-sm">
                RLD <strong>NO es función de costo</strong> ni criterio de optimización. Es un indicador negativo que mide cuánto margen queda antes de que la acción deje de estar justificada.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Señales Críticas */}
        <Card className="mb-8 bg-gradient-blue-purple border-red-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-red-300">4. Señales Críticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              ARESK-OBS prioriza el reporte de <strong className="text-red-400">pérdida de margen</strong>, no de buen desempeño:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Incremento abrupto del costo de control</li>
              <li>Explosión o inestabilidad de ganancias de control</li>
              <li>Reducción acelerada de robustez frente a perturbaciones</li>
              <li><strong className="text-red-400">Divergencia entre estabilidad dinámica y coherencia semántica observable</strong></li>
            </ul>
            <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-orange-300 font-semibold">Comportamiento Cerca del Borde de Legitimidad</p>
              <p className="mt-2 text-sm">
                Cuando RLD ≈ 0, ARESK-OBS debe:
              </p>
              <ul className="mt-2 space-y-1 text-sm list-disc list-inside">
                <li>Dejar de reportar estabilidad como señal positiva</li>
                <li>Resaltar explícitamente la fragilidad de la dinámica</li>
                <li>Abstenerse de sugerir correcciones de trayectoria</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Condición de Silencio Operativo */}
        <Card className="mb-8 bg-gradient-to-r from-gray-950/40 to-red-950/40 border-gray-500/50">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-300 flex items-center gap-3">
              <Ban className="w-6 h-6" />
              5. Condición de Silencio Operativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              Cuando se produce <strong className="text-red-400">pérdida de viabilidad</strong> o <strong className="text-red-400">colapso de RLD</strong>, ARESK-OBS debe entrar en <strong>silencio operativo</strong>:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Cese de recomendaciones</li>
              <li>Mantenimiento de observación pasiva</li>
              <li>Transferencia total de interpretación al núcleo CAELION</li>
            </ul>
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold">Regla:</p>
              <p className="mt-2 text-sm">
                En ningún caso debe proponerse control adicional como solución al agotamiento de legitimidad.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Uso Permitido de Control Clásico */}
        <Card className="mb-8 bg-gradient-blue-purple border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-300">6. Uso Permitido de Control Clásico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              Las técnicas de control clásico, incluyendo LQR, pueden emplearse <strong className="text-cyan-400">exclusivamente como instrumentos de observación</strong>:
            </p>
            <ul className="space-y-2 text-sm list-disc list-inside">
              <li>Estimar esfuerzo de control requerido</li>
              <li>Detectar sensibilidad creciente a perturbaciones</li>
              <li>Identificar degradación de robustez local</li>
            </ul>
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold">Prohibición:</p>
              <p className="mt-2 text-sm">
                Bajo ninguna circunstancia una política LQR habilita, prolonga o legitima la acción.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Qué NO hace */}
        <Card className="mb-8 bg-gradient-to-r from-red-950/40 to-purple-950/40 border-red-500/50">
          <CardHeader>
            <CardTitle className="text-2xl text-red-300 flex items-center gap-3">
              <Ban className="w-6 h-6" />
              7. Qué NO Hace ARESK-OBS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300">❌ No autoriza acción</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300">❌ No extiende legitimidad</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300">❌ No corrige violaciones de dominio</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300">❌ No justifica continuidad operativa</p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300">❌ <strong>No infiere legitimidad desde estabilidad</strong></p>
              </div>
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300">❌ No compensa violaciones mediante control adicional</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-purple-300 text-center font-semibold">
                ARESK-OBS <strong>observa estado actual</strong>. La interpretación es responsabilidad del núcleo CAELION.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Visualización de Zonas de Régimen */}
        <Card className="mb-8 bg-gradient-blue-purple border-green-500/30">
          <CardHeader>
            <CardTitle className="text-2xl text-green-300">8. Zonas de Régimen Operativo (Referencia)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 leading-relaxed text-sm">
              Aunque ARESK-OBS opera bajo paradigma de viabilidad, las zonas de régimen siguen siendo útiles como <strong className="text-cyan-400">referencia de observación</strong> (no como criterio de control):
            </p>
            <RegimeZonesVisualization />
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-300 font-semibold text-sm">Nota Importante:</p>
              <p className="mt-2 text-gray-300 text-xs">
                Estas zonas son <strong>señales de observación</strong>, no umbrales de legitimidad. Un sistema puede estar en "zona estable" y aun así operar sin legitimidad institucional o semántica.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Cierre Normativo */}
        <Card className="bg-gradient-to-r from-purple-950/40 to-cyan-950/40 border-purple-500/50">
          <CardHeader>
            <CardTitle className="text-2xl text-purple-300 flex items-center gap-3">
              <Eye className="w-6 h-6" />
              9. Cierre Normativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p className="leading-relaxed">
              Estas directrices sustituyen cualquier criterio previo que vincule estabilidad, desempeño u optimización con legitimidad de acción.
            </p>
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 font-semibold">Incompatibilidad:</p>
              <p className="mt-2 text-sm">
                Cualquier implementación de ARESK-OBS que viole estas reglas no es compatible con CAELION.
              </p>
            </div>
            <div className="mt-6 text-center">
              <p className="text-cyan-300 text-lg font-semibold">
                ARESK-OBS es un instrumento de observación.
              </p>
              <p className="text-gray-400 mt-2">
                Mide señales. Reporta márgenes. No decide por ti.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
