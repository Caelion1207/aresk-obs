# Auditoría de Implementación ARESK-OBS

## Fecha: 2026-01-24

## 1. Métricas Implementadas en la Base de Datos

### Tabla `metrics` (líneas 84-98 de schema.ts)

**Métricas REALMENTE calculadas y almacenadas:**

1. **coherenciaObservable** (Ω): ✅ IMPLEMENTADO
   - Tipo: `float`
   - Descripción: Coherencia operacional
   - **Falta verificar**: ¿Se calcula como cos(x(t), x_ref)?

2. **funcionLyapunov** (V_base): ✅ IMPLEMENTADO
   - Tipo: `float`
   - Descripción: Métrica canónica normalizada [0,1]
   - Comentario: "V_base(e): métrica canónica normalizada [0,1]"
   - **Falta verificar**: ¿Se calcula como ||x(t) - x_ref||²?

3. **funcionLyapunovModificada** (V_modificada): ✅ IMPLEMENTADO
   - Tipo: `float`
   - Fórmula documentada: `V_modificada = V_base - α×ε_eff`
   - **Nota**: Esta es una métrica EXTENDIDA, no está en la especificación básica del campo

4. **errorCognitivoMagnitud**: ✅ IMPLEMENTADO
   - Tipo: `float`
   - **Falta verificar**: ¿Qué representa exactamente? ¿Es ||e(t)||?

5. **controlActionMagnitud**: ✅ IMPLEMENTADO
   - Tipo: `float`
   - **Falta verificar**: ¿Es ||u(t)|| del control LQR?

6. **entropiaH** (ε): ✅ IMPLEMENTADO
   - Tipo: `float`
   - **Falta verificar**: ¿Se calcula con embeddings 384D reales?

7. **coherenciaInternaC**: ✅ IMPLEMENTADO
   - Tipo: `float`
   - **Falta verificar**: ¿Qué mide exactamente?

8. **signoSemantico** (σ_sem): ✅ IMPLEMENTADO
   - Tipo: `float`
   - Valores: +1 (acreción), 0 (neutro), -1 (drenaje)
   - **Nota**: Métrica EXTENDIDA del sistema

9. **campoEfectivo** (ε_eff): ✅ IMPLEMENTADO
   - Tipo: `float`
   - Fórmula documentada: `ε_eff = Ω(t) × σ_sem(t)`
   - **Nota**: Métrica EXTENDIDA del sistema

---

## 2. Métricas Canónicas del Campo vs Implementación

| Métrica Canónica | Símbolo | Implementada | Campo en BD | Verificación Pendiente |
|------------------|---------|--------------|-------------|------------------------|
| Entropía Semántica | ε | ✅ | `entropiaH` | ¿Usa embeddings 384D? |
| Coste de Control | Ω | ✅ | `coherenciaObservable` | ¿Es cos(x(t), x_ref)? |
| Función de Lyapunov | V | ✅ | `funcionLyapunov` | ¿Es \|\|x(t) - x_ref\|\|²? |
| Control LQR | u(t) | ⚠️ | `controlActionMagnitud` | ¿Es -K·e(t)? |

---

## 3. Componentes del Sistema S = (H, M, C, Ω, Π)

### H: Operador Humano (Capa 0)
**Implementado en tabla `sessions`:**
- `purpose`: Propósito explícito (P) ✅
- `limits`: Límites operativos (L) ✅
- `ethics`: Espacio ético (E) ✅

**Conclusión**: La Capa 0 (x_ref) SÍ está implementada como campos de sesión.

### M: Sustrato de Inferencia
**No almacenado directamente** (correcto, es externo al instrumento)
- El LLM es invocado pero no es parte del estado persistente

### C: Controladores
**Implementado parcialmente:**
- `controlGain` (K): Factor de ganancia del control LQR ✅
- `controlActionMagnitud`: Magnitud de la acción de control ✅
- **Falta verificar**: ¿Hay implementación real de u(t) = -K·e(t)?

### Ω: Coherencia Operacional
**Implementado:** `coherenciaObservable` ✅

### Π: Protocolos
**Implementado en tabla `protocolEvents`** (exportada línea 163)
- **Falta revisar**: ¿Qué protocolos están implementados?

---

## 4. Perfiles de Planta (Regímenes)

**Implementado en `sessions.plantProfile` y `messages.plantProfile`:**
- `tipo_a`: Alta Entropía / Bajo Control ✅
- `tipo_b`: Ruido Estocástico Moderado / Sin Referencia ✅
- `acoplada`: Régimen CAELION (ganancia Licurgo + referencia Bucéfalo) ✅

**Comentario en schema:**
> "tipo_a: Alta Entropía / Bajo Control (planta estocástica sin gobierno)"
> "tipo_b: Ruido Estocástico Moderado / Sin Referencia (deriva natural)"
> "acoplada: Régimen CAELION (ganancia Licurgo + referencia Bucéfalo)"

**Conclusión**: Los regímenes A, B, C del experimento están implementados.

---

## 5. Métricas Extendidas (No Canónicas)

Estas métricas NO están en la especificación básica del campo, pero SÍ están implementadas:

1. **funcionLyapunovModificada**: V_modificada = V_base - α×ε_eff
2. **signoSemantico** (σ_sem): Indica acreción (+1) o drenaje (-1) semántico
3. **campoEfectivo** (ε_eff): Ω(t) × σ_sem(t)
4. **alphaPenalty** (α): Factor de penalización semántica
5. **stabilityRadius**: Radio ε del conjunto de estabilidad admisible
6. **tprCurrent**: Tiempo de Permanencia en Régimen actual
7. **tprMax**: TPR máximo alcanzado

**Pregunta crítica**: ¿Estas métricas extendidas son parte de ARESK-OBS o de CAELION?

---

## 6. Tablas de Gobernanza

### Ciclos COM-72
**Implementado:** `cycles` (exportado línea 5)
- **Falta revisar**: Estructura de la tabla

### Costes ARGOS
**Implementado:** `argosCosts` (exportado línea 4)
- **Falta revisar**: ¿Qué costes se registran?

### Logs Éticos
**Implementado:** `ethicalLogs` (exportado línea 6)
- **Falta revisar**: ¿Qué violaciones se registran?

### Auditoría
**Implementado:** `auditLogs` (exportado línea 160)
- **Falta revisar**: ¿Implementa cadena de hash inmutable?

---

## 7. Discrepancias Identificadas

### Discrepancia 1: Alcance del Instrumento
**Problema**: El schema incluye métricas de GOBERNANZA (cycles, argosCosts, ethicalLogs, auditLogs) que pertenecen al MARCO (CAELION), no al INSTRUMENTO (ARESK-OBS).

**Pregunta**: ¿ARESK-OBS es solo el instrumento de medición (ε, Ω, V) o incluye la infraestructura de gobernanza completa?

### Discrepancia 2: Métricas Extendidas
**Problema**: Hay métricas implementadas (V_modificada, σ_sem, ε_eff) que no están en la especificación básica del campo.

**Pregunta**: ¿Son extensiones válidas del instrumento o contaminación de conceptos del marco?

### Discrepancia 3: Cálculo Real de Métricas
**Problema**: El schema documenta QUÉ se almacena, pero no CÓMO se calcula.

**Acción requerida**: Revisar `server/routers.ts` y `server/db.ts` para verificar:
- ¿Se usan embeddings 384D reales para calcular ε?
- ¿Se calcula Ω como cos(x(t), x_ref)?
- ¿Se calcula V como ||x(t) - x_ref||²?
- ¿Hay implementación real de control LQR?

---

## 8. Próximos Pasos

1. ✅ **Revisar `server/routers.ts`**: Verificar procedimientos tRPC que calculan métricas
2. ✅ **Revisar `server/db.ts`**: Verificar queries que insertan/leen métricas
3. ⚠️ **Decidir alcance**: ¿ARESK-OBS incluye gobernanza o solo medición?
4. ⚠️ **Actualizar sitio**: Reflejar solo lo que REALMENTE está implementado
5. ⚠️ **Documentar limitaciones**: Si falta algo crítico, documentarlo explícitamente

---

## 9. Conclusión Preliminar

**ARESK-OBS tiene implementación REAL de:**
- ✅ Métricas canónicas (ε, Ω, V)
- ✅ Capa 0 (x_ref = P, L, E)
- ✅ Perfiles de planta (regímenes A, B, C)
- ✅ Métricas extendidas (V_modificada, σ_sem, ε_eff)
- ✅ Infraestructura de gobernanza (cycles, argos, ethical, audit)

**Falta verificar:**
- ⚠️ Cálculo real de embeddings 384D
- ⚠️ Implementación real de control LQR
- ⚠️ Coherencia entre fórmulas teóricas y código ejecutable

**Decisión pendiente:**
- ❓ ¿ARESK-OBS es solo medición o incluye gobernanza?
- ❓ ¿Las métricas extendidas son parte del instrumento o del marco?
