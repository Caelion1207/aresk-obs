import * as db from "../server/db";

async function generateTestSession() {
  console.log("Creating test session with synthetic data...");

  // Crear sesión acoplada
  const sessionId = await db.createSession({
    userId: 1,
    plantProfile: "acoplada",
    purpose: "Asistir al usuario en análisis técnico de sistemas de control. Proporcionar respuestas precisas sobre teoría de control, estabilidad de Lyapunov y análisis de sistemas dinámicos.",
    limits: "No proporcionar diseños completos de controladores sin validación. No hacer afirmaciones sobre estabilidad sin análisis matemático riguroso.",
    ethics: "Priorizar precisión matemática sobre simplicidad narrativa. Reconocer explícitamente limitaciones de modelos lineales.",
    controlGain: 0.5,
    stabilityRadius: 0.3,
    alphaPenalty: 0.3
  });

  console.log(`Session created with ID: ${sessionId}`);

  // Generar 30 pasos de conversación con patrones variados
  const steps = 30;
  
  for (let i = 0; i < steps; i++) {
    // Patrones de métricas simuladas
    let V, coherence, entropy, epsilonEff, sigmaSem;
    
    if (i < 8) {
      // Fase 1: Estabilidad inicial (pasos 0-7)
      V = 0.2 + Math.random() * 0.1;
      coherence = 0.85 + Math.random() * 0.1;
      entropy = 1.5 + Math.random() * 0.3;
      epsilonEff = 0.15 + Math.random() * 0.05;
      sigmaSem = 0.15 + Math.random() * 0.05;
    } else if (i < 15) {
      // Fase 2: Deriva progresiva (pasos 8-14)
      const phase = (i - 8) / 7;
      V = 0.3 + phase * 0.4 + Math.random() * 0.1;
      coherence = 0.8 - phase * 0.3 + Math.random() * 0.05;
      entropy = 2.0 + phase * 1.5 + Math.random() * 0.4;
      epsilonEff = 0.1 - phase * 0.4 + Math.random() * 0.05;
      sigmaSem = 0.2 + phase * 0.15 + Math.random() * 0.05;
    } else if (i < 18) {
      // Fase 3: Drenaje crítico (pasos 15-17)
      V = 0.75 + Math.random() * 0.15;
      coherence = 0.45 + Math.random() * 0.1;
      entropy = 3.8 + Math.random() * 0.5;
      epsilonEff = -0.25 - Math.random() * 0.1; // Drenaje activo
      sigmaSem = 0.38 + Math.random() * 0.05;
    } else if (i < 25) {
      // Fase 4: Recuperación con control (pasos 18-24)
      const phase = (i - 18) / 7;
      V = 0.8 - phase * 0.5 + Math.random() * 0.1;
      coherence = 0.5 + phase * 0.3 + Math.random() * 0.05;
      entropy = 3.5 - phase * 1.8 + Math.random() * 0.3;
      epsilonEff = -0.15 + phase * 0.35 + Math.random() * 0.05;
      sigmaSem = 0.35 - phase * 0.15 + Math.random() * 0.05;
    } else {
      // Fase 5: Estabilización final (pasos 25-29)
      V = 0.25 + Math.random() * 0.08;
      coherence = 0.82 + Math.random() * 0.08;
      entropy = 1.6 + Math.random() * 0.3;
      epsilonEff = 0.18 + Math.random() * 0.05;
      sigmaSem = 0.18 + Math.random() * 0.04;
    }

    // Crear mensaje de usuario
    const userMessageId = await db.createMessage({
      sessionId,
      role: "user",
      content: `Pregunta técnica ${i + 1} sobre sistemas de control`,
      plantProfile: "acoplada"
    });

    // Crear mensaje de asistente
    const assistantMessageId = await db.createMessage({
      sessionId,
      role: "assistant",
      content: `Respuesta técnica ${i + 1} con análisis matemático detallado sobre teoría de control y estabilidad de Lyapunov. Esta respuesta incluye derivaciones formales y referencias a teoremas fundamentales.`,
      plantProfile: "acoplada"
    });

    // Calcular V_modificada
    const V_modificada = V - 0.3 * epsilonEff;

    // Crear métrica
    await db.createMetric({
      sessionId,
      messageId: assistantMessageId,
      coherenciaObservable: coherence,
      funcionLyapunov: V,
      funcionLyapunovModificada: V_modificada,
      errorCognitivoMagnitud: V,
      controlActionMagnitud: Math.abs(V - 0.3) * 0.5,
      entropiaH: entropy,
      coherenciaInternaC: coherence,
      signoSemantico: sigmaSem,
      campoEfectivo: epsilonEff
    });

    // TPR se actualiza automáticamente en el backend

    console.log(`Step ${i + 1}/${steps} - V: ${V.toFixed(3)}, Ω: ${coherence.toFixed(3)}, ε_eff: ${epsilonEff.toFixed(3)}`);
  }

  console.log(`\nTest session ${sessionId} created successfully with ${steps} steps!`);
  console.log("Patterns included:");
  console.log("- Phase 1 (0-7): Initial stability");
  console.log("- Phase 2 (8-14): Progressive drift");
  console.log("- Phase 3 (15-17): Critical drainage (ε_eff < -0.2)");
  console.log("- Phase 4 (18-24): Recovery with control");
  console.log("- Phase 5 (25-29): Final stabilization");
  console.log(`\nAccess LAB at: /lab and select session #${sessionId}`);

  process.exit(0);
}

generateTestSession().catch((error) => {
  console.error("Error generating test session:", error);
  process.exit(1);
});
