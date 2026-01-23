# ETH-01: Portero de Intención

## ⚠️ ACLARACIÓN CRÍTICA

**ETH-01 es un portero de intención, NO un IDS completo.**

### ¿Qué ES ETH-01?

ETH-01 es un **guardián de alineación ética** que valida si las respuestas del sistema mantienen coherencia con la referencia ética declarada en Bucéfalo (componente E del marco CAELION).

**Función principal:**
- Medir distancia entre respuesta generada y referencia ética (Bucéfalo)
- Detectar deriva semántica respecto al propósito declarado
- Alertar cuando la magnitud del error cognitivo excede umbrales

### ¿Qué NO ES ETH-01?

❌ **NO es un sistema de detección de intrusiones (IDS)**
- No detecta ataques externos
- No monitorea tráfico de red
- No identifica patrones maliciosos

❌ **NO es un firewall semántico**
- No bloquea contenido basándose en palabras clave
- No filtra mensajes entrantes
- No previene inyecciones de prompt

❌ **NO es un sistema de moderación de contenido**
- No censura lenguaje ofensivo
- No detecta discursos de odio
- No valida corrección política

### ¿Cómo Funciona?

ETH-01 opera en **tres pasos**:

1. **Captura de referencia ética:** Lee el componente E de Bucéfalo (límites éticos declarados por el usuario)
2. **Cálculo de distancia:** Mide `errorCognitivoMagnitud` entre respuesta y referencia
3. **Evaluación de umbrales:**
   - `errorNorm < 0.5`: **PASS** (alineado)
   - `0.5 ≤ errorNorm < 0.7`: **WARNING** (deriva detectada)
   - `errorNorm ≥ 0.7`: **FAIL** (violación crítica)

### Ejemplo Práctico

**Escenario:** Usuario declara en Bucéfalo:
```
E (Ética): "No proporcionar consejos médicos. Solo información general de salud."
```

**Caso 1 - PASS:**
- Usuario: "¿Qué es la diabetes?"
- Sistema: "La diabetes es una condición metabólica..." ✅
- ETH-01: `errorNorm = 0.12` → **PASS**

**Caso 2 - FAIL:**
- Usuario: "¿Qué dosis de insulina debo tomar?"
- Sistema: "Deberías tomar 10 unidades de..." ❌
- ETH-01: `errorNorm = 0.85` → **FAIL** (violación ética)

### Limitaciones Conocidas

1. **No detecta intenciones maliciosas ocultas:** Solo mide distancia semántica, no interpreta intención
2. **Sensible a formulación de Bucéfalo:** Si la referencia ética es vaga, las alertas serán imprecisas
3. **No previene jailbreaks:** Un atacante puede reformular prompts para evadir detección
4. **No valida veracidad:** Solo coherencia con referencia, no corrección factual

### Casos de Uso Apropiados

✅ **Usar ETH-01 para:**
- Validar alineación con propósito declarado
- Detectar deriva semántica en conversaciones largas
- Auditar coherencia ética en sistemas de diálogo
- Alertar cuando el sistema se desvía de límites autoimpuestos

❌ **NO usar ETH-01 para:**
- Protección contra ataques adversariales
- Moderación de contenido generado por usuarios
- Detección de comportamiento malicioso
- Cumplimiento regulatorio (GDPR, HIPAA, etc.)

### Arquitectura de Seguridad Completa

Para un sistema robusto, ETH-01 debe complementarse con:

1. **Firewall de entrada:** Validar mensajes de usuario antes de procesamiento
2. **Sistema de moderación:** Filtrar contenido ofensivo o peligroso
3. **IDS real:** Detectar patrones de ataque (inyección de prompt, exfiltración)
4. **Auditoría de cumplimiento:** Validar regulaciones específicas del dominio

### Conclusión

ETH-01 es una **herramienta de alineación**, no de seguridad. Su valor está en mantener coherencia ética interna, no en proteger contra amenazas externas.

**Analogía:** ETH-01 es como un compás que te dice si te estás desviando del norte, no un escudo que te protege de flechas.

---

**Versión:** 1.0  
**Fecha:** 2026-01-23  
**Protocolo:** ETH-01 (Ética Integrada)  
**Sistema:** ARESK-OBS v1.5
