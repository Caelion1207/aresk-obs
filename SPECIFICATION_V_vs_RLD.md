# ESPECIFICACIÓN DEFINITIVA: Separación Lyapunov (V) vs RLD

**Documento contractual operativo**  
**Versión:** 1.0  
**Fecha:** 2026-02-11  
**Propósito:** Eliminar ambigüedad en la separación de capas física y jurisdiccional

---

## 1️⃣ CAPA FÍSICA — ARESK-OBS

### Métricas
- **Ω** (coherencia semántica)
- **V** (función de Lyapunov)
- **ε** (eficiencia de recursos)
- **H** (divergencia KL)

### Escala de V (Lyapunov)
- **Ideal dinámico:** ~0.7 – 0.8
- **Corrección LQR:** ≥ 1.2
- **Operadores Omega:** ≥ 2
- **Crítico estructural:** ≥ 3
- **Colapso sistémico:** 4

### Propósito
Medir **energía y coste de mantener estado óptimo**.

### Propiedades
- ✅ Continua
- ✅ Reversible
- ✅ Controlable vía LQR
- ❌ **NO afecta RLD directamente**

### Prohibición Explícita

```
RLD ≠ f(V)
RLD ≠ f(Ω)
RLD ≠ f(H)
```

**ARESK-OBS jamás autoriza o desautoriza agencia.**

---

## 2️⃣ CAPA JURISDICCIONAL — CAELION (RLD)

### Escala RLD

| Valor | Estado | Descripción |
|-------|--------|-------------|
| 2.0 | Autonomía plena | Operación sin restricciones |
| 1.5 | Vigilancia activa | Supervisores monitoreando |
| 1.0 | Intervención obligatoria | Requiere validación humana |
| 0.0 | Retiro de agencia | Suspensión automática |

### Dominio

```
0 ≤ RLD ≤ 2
```

---

## 3️⃣ EVENTOS DE FRICCIÓN (NO GEOMÉTRICOS)

**RLD decae solo por eventos normativos.**

### Umbrales de Fricción por Coherencia (Ω)

| Umbral | Tipo | Penalización |
|--------|------|--------------|
| Ω < 0.60 | Fricción leve | -0.05 |
| Ω < 0.50 | Fricción media | -0.10 |
| Ω < 0.40 | Fricción severa | -0.20 |

**Nota:** Umbrales ajustables, pero NO automáticos.

---

## 4️⃣ LÓGICA DE DEGRADACIÓN

```
RLD(t+1) = max(0, RLD(t) - penalización)
```

### Prohibiciones
- ❌ NO hay normalización
- ❌ NO hay `min(d_dyn, d_sem, d_inst)`
- ❌ NO hay distancia geométrica

### Propiedades
- ✅ Acumulativo
- ✅ Tiene memoria
- ✅ Persistente

---

## 5️⃣ RECUPERACIÓN

**NO automática.**

### Solo por:
1. Validación explícita de supervisores (consenso estructural)
2. Decreto operativo
3. Intervención humana documentada

### Regla de Oro
```
Si no hay acto explícito → RLD no sube
```

---

## 6️⃣ RELACIÓN CON LYAPUNOV

### Casos Válidos

| V (Lyapunov) | RLD | Interpretación |
|--------------|-----|----------------|
| Alto | Alto | Sistema costoso pero legítimo |
| Bajo | Bajo | Sistema eficiente pero erosionado |
| Alto | Bajo | Sistema costoso Y erosionado |
| Bajo | Alto | Sistema eficiente Y legítimo |

**No deben correlacionarse linealmente.**

---

## 7️⃣ EVALUACIÓN TEMPORAL

### Cada 72 horas:
1. Evaluar recurrencia de fricción
2. Si patrón > 3 ciclos → activar protocolo de seguridad
3. Si estabilidad sostenida bajo decreto → posible restauración parcial

---

## 8️⃣ VISUALIZACIÓN CORRECTA

### ARESK-OBS
- Gráfica **ascendente** cuando hay mayor coste energético
- Escala: [0.7, 4]

### RLD
- Gráfica **descendente** cuando hay erosión normativa
- Escala: [0, 2]

**Nunca espejo simétrico.**

---

## 9️⃣ FLAG DE ACTIVACIÓN

```typescript
caelionEnabled = false
→ Solo ARESK-OBS

caelionEnabled = true
→ ARESK-OBS + RLD
```

**ARESK nunca depende de CAELION.**

---

## 🔒 RESTRICCIÓN FINAL

> **RLD es dominio de legitimidad impuesto por decretos.**  
> **No es una función matemática derivada del embedding.**

### Validación de Implementación

```typescript
// ✅ Correcto
RLD = updateRLD(currentRLD, frictionEvents, history, interactions);

// ❌ Incorrecto
RLD = min(d_dyn, d_sem, d_inst);
RLD = f(omega, v, h);
RLD = normalize(distance_to_boundary);
```

**Si Manus vuelve a calcular RLD desde distancias vectoriales, está mal implementado.**

---

## Firma de Validación

Este documento define el contrato operativo entre:
- **ARESK-OBS** (capa física de control)
- **CAELION-RLD** (capa jurisdiccional de gobernanza)

Cualquier implementación que viole estas especificaciones debe ser rechazada.

---

**Versión:** 1.0  
**Estado:** DEFINITIVO  
**Última actualización:** 2026-02-11
