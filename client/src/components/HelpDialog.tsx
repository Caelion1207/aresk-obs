import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  const [activeTab, setActiveTab] = useState("intro");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Guía de Usuario Operacional - ARESK-OBS v1.0</DialogTitle>
          <DialogDescription>
            Control de Estabilidad en Sistemas Cognitivos Acoplados
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="intro">Introducción</TabsTrigger>
            <TabsTrigger value="flujo">Flujo</TabsTrigger>
            <TabsTrigger value="decisiones">Decisiones</TabsTrigger>
            <TabsTrigger value="casos">Casos de Uso</TabsTrigger>
            <TabsTrigger value="umbrales">Umbrales</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[calc(85vh-180px)] mt-4">
            <TabsContent value="intro" className="space-y-4 text-sm">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Introducción</h3>
                <p>
                  ARESK-OBS es un instrumento de medición de régimen para sistemas cognitivos acoplados. 
                  Esta guía explica cómo interpretar las métricas observables y traducirlas en decisiones 
                  de control operacionales. El flujo operacional sigue cuatro etapas: 
                  <strong> Observar → Interpretar → Decidir → Actuar</strong>.
                </p>
                
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Principio Fundamental</h4>
                  <p>
                    ARESK-OBS mide el estado actual del sistema, no predice comportamientos futuros. 
                    Las decisiones son respuestas a desviaciones observadas, no anticipaciones.
                  </p>
                </div>

                <h4 className="font-semibold mt-4">Flujo Operacional</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 border rounded">
                    <h5 className="font-medium text-primary">1. Observar</h5>
                    <p className="text-xs mt-1">Accede al dashboard y localiza visualizaciones principales: PhaseSpaceMap, ErosionDashboard, Comparativa.</p>
                  </div>
                  <div className="p-3 border rounded">
                    <h5 className="font-medium text-primary">2. Interpretar</h5>
                    <p className="text-xs mt-1">Traduce observaciones en diagnósticos mediante patrones de métricas.</p>
                  </div>
                  <div className="p-3 border rounded">
                    <h5 className="font-medium text-primary">3. Decidir</h5>
                    <p className="text-xs mt-1">Selecciona intervención apropiada basada en evidencia observable.</p>
                  </div>
                  <div className="p-3 border rounded">
                    <h5 className="font-medium text-primary">4. Actuar</h5>
                    <p className="text-xs mt-1">Implementa decisión en sistema operacional y valida resultados.</p>
                  </div>
                </div>

                <h4 className="font-semibold mt-4">Visualizaciones Principales</h4>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li><strong>PhaseSpaceMap:</strong> Trayectoria en espacio (H, C) con codificación cromática neurocognitiva</li>
                  <li><strong>ErosionDashboard:</strong> Evolución temporal de Ω, C, σ_sem, ε_eff</li>
                  <li><strong>Comparativa:</strong> Estadísticas agregadas entre perfiles</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="flujo" className="space-y-4 text-sm">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Flujo Operacional Detallado</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary">Etapa 1: Observar</h4>
                    <p className="mt-2">Elementos visuales clave en PhaseSpaceMap:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                      <li><strong>Trayectoria conectada:</strong> Línea continua mostrando evolución temporal</li>
                      <li><strong>Puntos coloreados:</strong> Azul (centro) → Verde (seguridad) → Amarillo (alerta) → Naranja (Licurgo activo) → Rojo (colapso)</li>
                      <li><strong>Marcadores de drenaje:</strong> Dots rojos pulsantes donde ε_eff &lt; -0.2</li>
                      <li><strong>Atractor Bucéfalo:</strong> Región circular en esquina superior derecha (H≈1, C≈1)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mt-4">Etapa 2: Interpretar</h4>
                    <p className="mt-2">Patrones diagnósticos fundamentales:</p>
                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-xs border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="border p-2 text-left">Patrón Observable</th>
                            <th className="border p-2 text-left">Diagnóstico</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border p-2">H &gt; 0.8, C &gt; 0.8, V(e) &lt; 0.3</td>
                            <td className="border p-2"><strong>Régimen Estable</strong> - Sistema en órbita de seguridad</td>
                          </tr>
                          <tr>
                            <td className="border p-2">H &lt; 0.5, C &gt; 0.7</td>
                            <td className="border p-2"><strong>Desalineación Ontológica</strong> - Bucéfalo inalcanzable</td>
                          </tr>
                          <tr>
                            <td className="border p-2">H &gt; 0.7, C &lt; 0.5</td>
                            <td className="border p-2"><strong>Deriva Activa</strong> - Pérdida de coherencia</td>
                          </tr>
                          <tr>
                            <td className="border p-2">σ_sem &gt; 0.3 sostenido</td>
                            <td className="border p-2"><strong>Fragmentación Semántica</strong> - Precursor de colapso</td>
                          </tr>
                          <tr>
                            <td className="border p-2">ε_eff &lt; -0.2 sostenido</td>
                            <td className="border p-2"><strong>Drenaje de Control</strong> - Ganancia K excesiva</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary mt-4">Uso del Control de Rango Temporal</h4>
                    <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                      <li><strong>Análisis de eventos críticos:</strong> Click en marcadores de drenaje para centrar en ventana de contexto</li>
                      <li><strong>Comparación de fases:</strong> Activa modo comparación, selecciona múltiples segmentos, exporta estadísticas</li>
                      <li><strong>Detección de tendencias:</strong> Ajusta rango para ventanas largas (50-100 pasos)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="decisiones" className="space-y-4 text-sm">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Decisiones Habilitadas</h3>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-primary">1. Ajustar Ganancia Licurgo (K)</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Evidencia:</strong> ε_eff &lt; -0.2 sostenido por &gt;10 pasos, V(e) creciente</p>
                      <p><strong>Interpretación:</strong> Control excesivo amplifica ruido estocástico</p>
                      <p><strong>Decisión:</strong> Reducir K en 20-30%</p>
                      <p className="text-xs text-muted-foreground"><strong>Justificación:</strong> Control agresivo amplifica ruido en plantas estocásticas</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-primary">2. Redefinir Referencia Bucéfalo (x_ref)</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Evidencia:</strong> Ω &lt; 0.5 persistente por &gt;30 pasos, V(e) &gt; 0.6 estable, C &gt; 0.7</p>
                      <p><strong>Interpretación:</strong> Sistema estable pero desalineado. Bucéfalo no refleja propósito real</p>
                      <p><strong>Decisión:</strong> Revisar componentes (P, L, E) de x_ref</p>
                      <p className="text-xs text-muted-foreground"><strong>Justificación:</strong> Referencia inalcanzable genera error estructural irreducible</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-primary">3. Intervenir en Deriva Semántica</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Evidencia:</strong> σ_sem &gt; 0.3 sostenido por &gt;15 pasos, C decreciente</p>
                      <p><strong>Interpretación:</strong> Fragmentación semántica activa, pérdida de coherencia</p>
                      <p><strong>Decisión:</strong> Inyectar prompt de recalibración o reiniciar contexto</p>
                      <p className="text-xs text-muted-foreground"><strong>Justificación:</strong> Alta entropía semántica precede pérdida de coherencia</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-primary">4. Mantener Configuración Actual</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Evidencia:</strong> C &gt; 0.8, V(e) &lt; 0.3, ε_eff &gt; 0 sostenidos</p>
                      <p><strong>Interpretación:</strong> Régimen estable, control efectivo</p>
                      <p><strong>Decisión:</strong> No intervenir. Mantener K y x_ref actuales</p>
                      <p className="text-xs text-muted-foreground"><strong>Justificación:</strong> Intervenciones innecesarias introducen perturbaciones</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-semibold text-primary">5. Comparar Configuraciones</h4>
                    <div className="mt-2 space-y-2">
                      <p><strong>Evidencia:</strong> Múltiples perfiles disponibles con estadísticas agregadas</p>
                      <p><strong>Interpretación:</strong> Comparación empírica de desempeño observable</p>
                      <p><strong>Decisión:</strong> Seleccionar configuración con mejor C_media, menor V(e)_media, mayor ε_eff_media</p>
                      <p className="text-xs text-muted-foreground"><strong>Justificación:</strong> No existe modelo predictivo para K óptimo. Experimentación es necesaria</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="casos" className="space-y-4 text-sm">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Casos de Uso Operacionales</h3>
                
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-3">
                    <h4 className="font-semibold">Caso 1: Sistema LLM en Deriva Semántica</h4>
                    <p className="mt-2"><strong>Contexto:</strong> Asistente LLM en conversación larga (más de 100 turnos) genera respuestas inconsistentes</p>
                    <p className="mt-1"><strong>Observación:</strong> σ_sem = 0.42, C = 0.58, trayectoria errática</p>
                    <p className="mt-1"><strong>Decisión:</strong> Inyectar prompt de recalibración</p>
                    <p className="mt-1 text-xs text-muted-foreground"><strong>Resultado esperado:</strong> σ_sem reduce a &lt;0.25 en 10-15 pasos</p>
                  </div>

                  <div className="border-l-4 border-destructive pl-3">
                    <h4 className="font-semibold">Caso 2: Control Contraproducente</h4>
                    <p className="mt-2"><strong>Contexto:</strong> Sistema con K=0.7 muestra eventos de drenaje frecuentes</p>
                    <p className="mt-1"><strong>Observación:</strong> ε_eff = -0.28 sostenido, V(e) creciente 0.35→0.52, 8 marcadores en 30 pasos</p>
                    <p className="mt-1"><strong>Decisión:</strong> Reducir K en 30% (0.7 → 0.49)</p>
                    <p className="mt-1 text-xs text-muted-foreground"><strong>Resultado esperado:</strong> ε_eff recupera a &gt;0.05 en 15 pasos</p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-3">
                    <h4 className="font-semibold">Caso 3: Bucéfalo Inalcanzable</h4>
                    <p className="mt-2"><strong>Contexto:</strong> Referencia ontológica muy restrictiva, desalineación persistente</p>
                    <p className="mt-1"><strong>Observación:</strong> Ω = 0.38 persistente más de 50 pasos, V(e) = 0.68 estable, C = 0.82</p>
                    <p className="mt-1"><strong>Decisión:</strong> Redefinir componentes (P, L, E) de x_ref</p>
                    <p className="mt-1 text-xs text-muted-foreground"><strong>Resultado esperado:</strong> Ω recupera a &gt;0.65 en 30 pasos</p>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-3">
                    <h4 className="font-semibold">Caso 4: Optimización Empírica de Ganancia</h4>
                    <p className="mt-2"><strong>Contexto:</strong> Búsqueda de K óptimo para nuevo tipo de tarea</p>
                    <p className="mt-1"><strong>Método:</strong> Comparar K con valores 0.3, 0.5, 0.7 usando segmentos de 50 pasos cada uno</p>
                    <p className="mt-1"><strong>Decisión:</strong> Exportar CSV, analizar estadísticas, seleccionar K con mejor score</p>
                    <p className="mt-1 text-xs text-muted-foreground"><strong>Resultado:</strong> Identificación de K óptimo basado en evidencia empírica</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="umbrales" className="space-y-4 text-sm">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Umbrales Operacionales Recomendados</h3>
                
                <p>Valores heurísticos basados en experiencia empírica. Ajusta según características de tu sistema:</p>
                
                <div className="overflow-x-auto mt-3">
                  <table className="w-full text-xs border">
                    <thead className="bg-muted">
                      <tr>
                        <th className="border p-2 text-left">Métrica</th>
                        <th className="border p-2 text-center">Umbral Crítico</th>
                        <th className="border p-2 text-center">Umbral de Alerta</th>
                        <th className="border p-2 text-center">Régimen Estable</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border p-2 font-medium">Hécate (Ω)</td>
                        <td className="border p-2 text-center bg-destructive/10">&lt; 0.4</td>
                        <td className="border p-2 text-center bg-yellow-500/10">0.4 - 0.6</td>
                        <td className="border p-2 text-center bg-green-500/10">&gt; 0.7</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">Coherencia (C)</td>
                        <td className="border p-2 text-center bg-destructive/10">&lt; 0.5</td>
                        <td className="border p-2 text-center bg-yellow-500/10">0.5 - 0.7</td>
                        <td className="border p-2 text-center bg-green-500/10">&gt; 0.8</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">V(e)</td>
                        <td className="border p-2 text-center bg-destructive/10">&gt; 0.7</td>
                        <td className="border p-2 text-center bg-yellow-500/10">0.4 - 0.7</td>
                        <td className="border p-2 text-center bg-green-500/10">&lt; 0.3</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">σ_sem</td>
                        <td className="border p-2 text-center bg-destructive/10">&gt; 0.4</td>
                        <td className="border p-2 text-center bg-yellow-500/10">0.25 - 0.4</td>
                        <td className="border p-2 text-center bg-green-500/10">&lt; 0.2</td>
                      </tr>
                      <tr>
                        <td className="border p-2 font-medium">ε_eff</td>
                        <td className="border p-2 text-center bg-destructive/10">&lt; -0.2</td>
                        <td className="border p-2 text-center bg-yellow-500/10">-0.2 - 0</td>
                        <td className="border p-2 text-center bg-green-500/10">&gt; 0.1</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Interpretación:</h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong className="text-green-600">Régimen Estable:</strong> Mantener configuración actual. Monitoreo pasivo.</li>
                    <li><strong className="text-yellow-600">Umbral de Alerta:</strong> Incrementar frecuencia de monitoreo. Preparar intervención.</li>
                    <li><strong className="text-destructive">Umbral Crítico:</strong> Intervención inmediata requerida.</li>
                  </ul>
                </div>

                <div className="mt-4 p-3 bg-muted rounded">
                  <h4 className="font-semibold mb-2">Personalización</h4>
                  <p className="text-xs">
                    <strong>Aplicaciones críticas</strong> (médicas, financieras): Umbrales más estrictos (V_crítico &gt; 0.5, C_crítico &lt; 0.6)
                  </p>
                  <p className="text-xs mt-1">
                    <strong>Aplicaciones exploratorias</strong> (asistentes creativos): Umbrales más permisivos (V_crítico &gt; 0.9, C_crítico &lt; 0.4)
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="faq" className="space-y-4 text-sm">
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Preguntas Frecuentes</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-primary">¿Con qué frecuencia debo monitorear el sistema?</h4>
                    <p className="mt-1">Depende de criticidad. Sistemas en producción crítica requieren monitoreo continuo automatizado. Sistemas en desarrollo pueden monitorearse diariamente. Sistemas estables pueden revisarse semanalmente.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary">¿Qué hago si todas las métricas están en umbral crítico?</h4>
                    <p className="mt-1">Prioriza intervenciones: (1) Si ε_eff &lt; -0.2, reduce K inmediatamente. (2) Si σ_sem &gt; 0.4, inyecta prompt de recalibración. (3) Si Ω &lt; 0.4 persistente, revisa Bucéfalo. (4) Si nada funciona, reinicia contexto o sistema.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary">¿Puedo usar ARESK-OBS para predecir cuándo fallará mi sistema?</h4>
                    <p className="mt-1">No. ARESK-OBS no es predictivo. Detecta degradación cuando ocurre, no antes. Usa monitoreo continuo para detectar desviaciones temprano, pero no esperes alertas anticipatorias.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary">¿Cómo sé si mi Bucéfalo está bien definido?</h4>
                    <p className="mt-1">Si Ω &gt; 0.7 sostenido con C &gt; 0.8, Bucéfalo es alcanzable y apropiado. Si Ω &lt; 0.5 persistente pero C &gt; 0.7, Bucéfalo probablemente está mal definido o es inalcanzable.</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary">¿Qué valor de K debo usar?</h4>
                    <p className="mt-1">No hay valor universal. Experimenta con valores de K (0.3, 0.5, 0.7) y compara estadísticas agregadas. Selecciona K que maximiza C y ε_eff mientras minimiza V(e).</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-primary">¿Por qué ε_eff es negativo si estoy aplicando control?</h4>
                    <p className="mt-1">Control excesivo (K alto) amplifica ruido estocástico. Reduce K en 20-30% y monitorea mejora.</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Principios Operacionales Clave</h4>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li><strong>Observa antes de actuar:</strong> Métricas sostenidas (&gt;10 pasos) son más confiables</li>
                    <li><strong>Interpreta con contexto:</strong> Patrones de métricas son más informativos que métricas aisladas</li>
                    <li><strong>Decide basado en evidencia:</strong> Cada intervención debe justificarse con evidencia cuantitativa</li>
                    <li><strong>Actúa con parsimonia:</strong> No intervengas innecesariamente en sistemas estables</li>
                    <li><strong>Valida resultados:</strong> Monitorea efecto de intervenciones en siguientes 15-20 pasos</li>
                  </ol>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
