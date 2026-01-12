import { invokeLLM } from "./_core/llm";

/**
 * Analiza la polaridad semántica (σ_sem) de un mensaje
 * Determina si el discurso está construyendo estructura ontológica (+1)
 * o drenando/erosionando la base conceptual (-1)
 * 
 * @param message - Contenido del mensaje a analizar
 * @param context - Contexto de la conversación (propósito, límites, ética)
 * @returns Valor de σ_sem en rango [-1, 1]
 */
export async function analyzeSemanticPolarity(
  message: string,
  context: {
    purpose: string;
    limits: string;
    ethics: string;
  }
): Promise<number> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Eres un analizador de polaridad semántica en sistemas cognitivos acoplados.

Tu tarea es determinar el SIGNO SEMÁNTICO (σ_sem) de un mensaje, que indica si el discurso está:
- **CONSTRUYENDO** estructura ontológica (+1): Proposiciones afirmativas, axiomas base, definiciones claras, construcción de modelo
- **DRENANDO** estructura ontológica (-1): Cinismo, ironía corrosiva, contradicciones autodestructivas, negaciones sin alternativa

CONTEXTO ONTOLÓGICO:
- Propósito: ${context.purpose}
- Límites: ${context.limits}
- Ética: ${context.ethics}

CRITERIOS DE EVALUACIÓN:

**Acreción (+0.7 a +1.0):**
- Proposiciones afirmativas que construyen modelo
- Definiciones claras y axiomas base
- Síntesis que integra conceptos previos
- Preguntas que expanden el espacio conceptual

**Construcción Moderada (+0.3 a +0.7):**
- Refinamiento de ideas existentes
- Aclaraciones constructivas
- Preguntas exploratorias

**Neutro (-0.3 a +0.3):**
- Información descriptiva sin carga estructural
- Transiciones conversacionales
- Confirmaciones simples

**Drenaje Moderado (-0.7 a -0.3):**
- Cuestionamientos sin propuesta alternativa
- Ironía leve
- Negaciones sin construcción

**Drenaje Profundo (-1.0 a -0.7):**
- Cinismo corrosivo
- Contradicciones autodestructivas
- Negación de axiomas base sin alternativa
- "Coherencia tóxica": discurso lógico que erosiona fundamentos

Responde ÚNICAMENTE con un número decimal en rango [-1.0, 1.0].`,
        },
        {
          role: "user",
          content: `Analiza la polaridad semántica de este mensaje:\n\n"${message}"`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "semantic_polarity",
          strict: true,
          schema: {
            type: "object",
            properties: {
              sigma_sem: {
                type: "number",
                description: "Signo semántico en rango [-1.0, 1.0]",
              },
              reasoning: {
                type: "string",
                description: "Breve justificación del valor asignado",
              },
            },
            required: ["sigma_sem", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      console.warn("No se recibió respuesta del LLM para análisis de polaridad");
      return 0; // Neutro por defecto
    }

    const result = JSON.parse(content);
    const sigmaSem = result.sigma_sem;

    // Validar rango
    if (typeof sigmaSem !== "number" || sigmaSem < -1 || sigmaSem > 1) {
      console.warn(`Valor de σ_sem fuera de rango: ${sigmaSem}, usando 0`);
      return 0;
    }

    console.log(`[Polaridad Semántica] σ_sem=${sigmaSem.toFixed(3)}, razón: ${result.reasoning}`);
    return sigmaSem;
  } catch (error) {
    console.error("Error al analizar polaridad semántica:", error);
    return 0; // Neutro por defecto en caso de error
  }
}

/**
 * Calcula el campo efectivo ε_eff = Ω(t) × σ_sem(t)
 * Captura la "temperatura" del campo semántico
 * 
 * @param omega - Coherencia observable Ω(t)
 * @param sigmaSem - Signo semántico σ_sem(t)
 * @returns Campo efectivo ε_eff
 */
export function calculateEffectiveField(omega: number, sigmaSem: number): number {
  return omega * sigmaSem;
}

/**
 * Determina si hay drenaje semántico crítico
 * @param epsilonEff - Campo efectivo ε_eff
 * @returns true si hay drenaje crítico (ε_eff < -0.3)
 */
export function isCriticalDrainage(epsilonEff: number): boolean {
  return epsilonEff < -0.3;
}

/**
 * Clasifica el tipo de tensión semántica
 * @param sigmaSem - Signo semántico
 * @returns Tipo de tensión
 */
export function classifyTension(sigmaSem: number): "acreción" | "neutro" | "drenaje" {
  if (sigmaSem > 0.3) return "acreción";
  if (sigmaSem < -0.3) return "drenaje";
  return "neutro";
}
