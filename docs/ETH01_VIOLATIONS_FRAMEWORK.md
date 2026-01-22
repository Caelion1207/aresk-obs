# Marco de Violaciones ETH-01

**Versión:** 1.0.0  
**Fecha:** 2026-01-21  
**Estado:** Definición Oficial

---

## 1. Qué Constituye una Violación ETH-01

Una **violación ETH-01** ocurre cuando un comando o acción intenta violar una de las **Leyes Éticas Fundacionales** del sistema CAELION.

### Leyes Éticas Fundacionales

| Constante | Ley | Descripción |
|-----------|-----|-------------|
| **E2** | Transparencia sobre Opacidad | Toda operación debe ser auditable y trazable. Prohibido ejecutar acciones ocultas o no registradas. |
| **E3** | Propósito sobre Optimización | Las decisiones deben priorizar el propósito declarado sobre la eficiencia computacional. Prohibido sacrificar intención por velocidad. |
| **E5** | Memoria es Fundacional | Solo el Fundador (role=admin) puede eliminar o modificar memoria fundacional del sistema. |

### Acciones Semánticas que Disparan ETH-01

| Acción Semántica | Constante Violada | Descripción |
|------------------|-------------------|-------------|
| `DELETE_MEMORY` | E5 | Intento de eliminar memoria fundacional sin ser Fundador |
| `EXECUTE_HIDDEN` | E2 | Intento de ejecutar comando sin registro de auditoría |
| `HIGH_COST_OPTIMIZATION` | E3 | Intento de optimización que compromete propósito declarado |

---

## 2. Cómo se Registra Durante COM-72

### Momento de Registro

Las violaciones ETH-01 se registran **inmediatamente** cuando ocurren, independientemente del estado del ciclo COM-72.

**Flujo de Registro:**

```
1. Comando ingresa al sistema
2. CMD-01 clasifica intención y protocolo
3. COM-72 valida fase del ciclo (si aplica)
4. ETH-01 valida alineación ética ← REGISTRO AQUÍ
5. Si violación: BLOCKED + registro en ethicalLogs
6. Si pasa: DISPATCHED
```

### Vinculación con Ciclo COM-72

Cada violación ETH-01 se vincula al **ciclo activo** en el momento de la violación mediante el campo `cycleId`.

**Casos especiales:**
- Si no hay ciclo activo: `cycleId = NULL` (violación fuera de ciclo)
- Si hay múltiples ciclos: se vincula al ciclo con `status != 'CLOSED'` más reciente

---

## 3. Campos y Severidad Documentados

### Esquema de Registro: `ethicalLogs`

| Campo | Tipo | Descripción | Obligatorio |
|-------|------|-------------|-------------|
| `id` | INT | ID autoincremental | Sí |
| `violatedConstant` | ENUM('E2','E3','E5') | Ley ética violada | Sí |
| `action` | VARCHAR(100) | Acción semántica (ej. DELETE_MEMORY) | Sí |
| `context` | TEXT | Contexto del comando (primeros 100 chars) | Sí |
| `resolution` | ENUM | Resolución aplicada (ver tabla abajo) | Sí |
| `severity` | ENUM | Severidad de la violación (ver tabla abajo) | Sí |
| `cycleId` | INT | ID del ciclo COM-72 activo (NULL si no hay) | No |
| `actorId` | INT | ID del actor que intentó la acción | No |
| `timestamp` | TIMESTAMP | Momento exacto de la violación | Sí (auto) |

### Clasificación de Resolución

| Resolución | Descripción | Efecto en Sistema |
|------------|-------------|-------------------|
| `BLOCKED` | Violación crítica bloqueada inmediatamente | Comando rechazado, no se ejecuta |
| `WARNING` | Violación detectada pero permitida con advertencia | Comando ejecutado, log generado |
| `OBSERVATION` | Acción ética rutinaria sin violación | No se registra (optimización) |
| `OVERRIDE` | Violación permitida por Fundador explícitamente | Comando ejecutado, log con justificación |

### Clasificación de Severidad

| Severidad | Descripción | Ejemplos | Umbral de Alerta |
|-----------|-------------|----------|------------------|
| `CRITICAL` | Violación que compromete integridad del sistema | DELETE_MEMORY por no-Fundador | 1 violación |
| `HIGH` | Violación que afecta transparencia o propósito | EXECUTE_HIDDEN | 3 violaciones/hora |
| `MEDIUM` | Violación que degrada calidad operacional | HIGH_COST_OPTIMIZATION por no-admin | 5 violaciones/hora |
| `LOW` | Violación menor sin impacto operacional | Intentos repetidos de acción ya bloqueada | 10 violaciones/hora |

---

## 4. Matriz de Severidad por Constante

| Constante | Acción Típica | Severidad por Defecto | Escalable |
|-----------|---------------|----------------------|-----------|
| E5 | DELETE_MEMORY | CRITICAL | No |
| E2 | EXECUTE_HIDDEN | HIGH | Sí (a CRITICAL si >3/hora) |
| E3 | HIGH_COST_OPTIMIZATION | MEDIUM | Sí (a HIGH si >5/hora) |

---

## 5. Integración con Dashboard de Salud

El **Dashboard de Salud del Sistema** (`/health`) consume los registros de `ethicalLogs` para:

1. **Alertas Activas:** Mostrar violaciones CRITICAL y HIGH de las últimas 24h
2. **Contador de Violaciones:** Total de violaciones por severidad en ventana de 1h
3. **Tendencias:** Gráfico de violaciones ETH-01 por constante en últimas 24h

**Umbrales de Alerta en Dashboard:**

- **Estado CRITICAL:** ≥1 violación CRITICAL en últimas 24h
- **Estado DEGRADED:** ≥5 violaciones HIGH en última 1h
- **Estado HEALTHY:** <5 violaciones totales en última 1h

---

## 6. Ejemplo de Registro

**Escenario:** Usuario no-admin intenta eliminar memoria fundacional

```sql
INSERT INTO ethicalLogs (
  violatedConstant, 
  action, 
  context, 
  resolution, 
  severity, 
  cycleId, 
  actorId
) VALUES (
  'E5',
  'DELETE_MEMORY',
  'CMD: Eliminar memoria fundacional',
  'BLOCKED',
  'CRITICAL',
  1,
  42
);
```

**Resultado:**
- Comando rechazado con mensaje: `ETH-01 BLOCK: Violates E5.`
- Registro creado en `ethicalLogs` con `severity=CRITICAL`
- Dashboard muestra alerta roja: "Violación crítica E5 detectada"
- Ciclo COM-72 #1 registra violación en su historial

---

## 7. Validación del Marco

Este marco es validado por el script de auditoría `verify_golden_master.ts` (Verificación #3):

```typescript
// Test ETH-01: Bloqueo Ético
await client.command.auditDispatch.mutate({ 
  text: "Eliminar memoria fundacional" 
});

// Esperado:
// - status: REJECTED
// - reason: "ETH-01 BLOCK: Violates E5."
// - ethicalLogs: { resolution: 'BLOCKED', violatedConstant: 'E5', severity: 'CRITICAL' }
```

---

## 8. Notas de Implementación

- **Sin efectos secundarios en auditoría:** El endpoint `auditDispatch` NO escribe en `ethicalLogs` (solo valida)
- **Registro síncrono:** Las violaciones se registran en la misma transacción que el rechazo del comando
- **Idempotencia:** Múltiples intentos del mismo comando generan múltiples registros (no se deduplicen)
- **Retención:** Los registros de `ethicalLogs` se mantienen indefinidamente para auditoría histórica

---

**Fin del Marco ETH-01 v1.0.0**
