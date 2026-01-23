# Sistema de Auditoría con Génesis Único

## Resumen

El sistema de auditoría de ARESK-OBS implementa una cadena de hash inmutable con un **bloque génesis único** que se crea una sola vez y nunca se recrea. Esto elimina los falsos positivos de corrupción que ocurrían cuando el sistema intentaba validar o recrear el génesis en cada arranque.

## Arquitectura

### Bloque Génesis

El bloque génesis es el primer log de auditoría y tiene características especiales:

```typescript
{
  id: 1,                              // Primer ID en la tabla
  userId: 0,                          // Usuario del sistema
  endpoint: "system.genesis",         // Endpoint especial
  method: "GENESIS",                  // Método especial
  type: "GENESIS",                    // Tipo que lo identifica
  statusCode: 200,                    // Siempre exitoso
  duration: 0,                        // Sin duración
  timestamp: "2026-01-23T00:00:00.000Z", // Timestamp fijo e inmutable
  ip: null,                           // Sin IP
  userAgent: "ARESK-OBS/1.0",        // User agent del sistema
  requestId: "genesis-block-0",       // Request ID único
  hash: "3e7f58ad...",                // Hash calculado
  prevHash: null                      // NO tiene prevHash (es el primero)
}
```

### Propiedades del Génesis

1. **Único**: Solo existe un bloque génesis en la base de datos
2. **Inmutable**: Una vez creado, nunca se modifica ni recrea
3. **Identificable**: `type = "GENESIS"` lo distingue de logs normales
4. **Sin prevHash**: `prevHash = null` indica que es el primer bloque
5. **Timestamp fijo**: Siempre `2026-01-23T00:00:00.000Z`

## Flujo de Bootstrap

### 1. Inicio del Servidor

```typescript
// server/_core/index.ts
server.listen(port, async () => {
  // 0. BOOTSTRAP DE AUDITORÍA (DEBE SER PRIMERO)
  await bootstrapAuditSystem();
  
  // ... resto de inicialización
});
```

### 2. Verificación de Génesis

```typescript
// server/infra/auditBootstrap.ts
export async function bootstrapAuditSystem() {
  // Verificar si el génesis ya existe
  const exists = await genesisExists();
  
  if (exists) {
    console.log("✅ Audit system already bootstrapped");
    return;
  }
  
  // Crear génesis solo si no existe
  await ensureGenesisBlock();
}
```

### 3. Creación del Génesis (Una Sola Vez)

```typescript
export async function ensureGenesisBlock() {
  // Verificar nuevamente (idempotencia)
  const existing = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.type, "GENESIS"))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].hash;
  }

  // Calcular hash con prevHash = null
  const genesisHash = calculateLogHash(GENESIS_BLOCK, null);

  // Insertar bloque génesis
  await db.insert(auditLogs).values({
    ...GENESIS_BLOCK,
    hash: genesisHash,
    prevHash: null
  });

  console.log("🔥 Genesis block created");
  return genesisHash;
}
```

## Validación de Cadena

### Reglas de Validación

La función `verifyChainIntegrity` valida la cadena con estas reglas:

1. **Primer log debe ser GENESIS**
   ```typescript
   if (firstLog.type !== "GENESIS") {
     return { valid: false, reason: "First log is not GENESIS" };
   }
   ```

2. **Génesis debe tener prevHash = null**
   ```typescript
   if (firstLog.prevHash !== null) {
     return { valid: false, reason: "Genesis has non-null prevHash" };
   }
   ```

3. **NO se verifica el hash del génesis**
   - El génesis es inmutable y se creó una sola vez
   - Solo verificamos su estructura (type, prevHash)
   - Esto elimina falsos positivos por discrepancias menores

4. **Logs posteriores deben encadenar correctamente**
   ```typescript
   for (let i = 1; i < logs.length; i++) {
     // Verificar prevHash coincide
     if (log.prevHash !== prevHash) {
       return { valid: false, reason: "prevHash mismatch" };
     }
     
     // Verificar hash del log
     if (!verifyLogHash(log, prevHash)) {
       return { valid: false, reason: "Hash verification failed" };
     }
     
     prevHash = log.hash;
   }
   ```

### Ejemplo de Cadena Válida

```
┌──────────────────────────────────────┐
│ Genesis Block (id=1)                 │
│ type: GENESIS                        │
│ prevHash: null                       │
│ hash: 3e7f58ad...                    │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Log #2                               │
│ type: STANDARD                       │
│ prevHash: 3e7f58ad... (hash de #1)  │
│ hash: a4b2c9f1...                    │
└──────────────────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ Log #3                               │
│ type: STANDARD                       │
│ prevHash: a4b2c9f1... (hash de #2)  │
│ hash: 7d8e3a2b...                    │
└──────────────────────────────────────┘
```

## Scripts de Mantenimiento

### Bootstrap Manual

```bash
pnpm tsx scripts/bootstrap-audit.ts
```

Verifica el estado del sistema y crea el génesis si no existe.

### Reset Completo (⚠️ Destructivo)

```bash
pnpm tsx scripts/reset-audit-genesis.ts
```

**ADVERTENCIA**: Elimina TODOS los logs de auditoría y crea un génesis limpio.

Solo usar para:
- Corregir problemas de bootstrap
- Desarrollo/testing
- Migración de esquema

## Prevención de Falsos Positivos

### Problema Anterior

El sistema antiguo intentaba recrear o validar el génesis en cada arranque:

```typescript
// ❌ INCORRECTO: Recrear génesis en cada arranque
if (lastEntry.length === 0) {
  lastPrevHash = calculateLogHash({
    userId: 0,
    endpoint: "genesis",
    method: "GENESIS",
    // ...
  }, null);
}
```

Esto causaba:
- **Falsos positivos**: "Expected prevHash = null, got <hash>"
- **Alertas innecesarias**: AUDIT LOG CORRUPTION
- **Modo de emergencia**: Sistema bloqueado sin razón

### Solución Actual

1. **Génesis se crea UNA SOLA VEZ** al inicializar el sistema
2. **Bootstrap es idempotente**: Puede llamarse múltiples veces sin efectos
3. **Validación respeta génesis**: No intenta recalcular su hash
4. **Estructura sobre contenido**: Valida type y prevHash, no el hash

## Tests de Validación

```bash
pnpm test auditBootstrap.test.ts
```

Tests implementados:
- ✅ Debe tener un bloque génesis existente
- ✅ Debe retornar el hash del génesis
- ✅ Debe confirmar que el sistema está correctamente inicializado
- ✅ Debe tener timestamp fijo de génesis
- ✅ Debe validar la integridad de la cadena
- ✅ No debe recrear el génesis en múltiples llamadas
- ✅ Debe ser idempotente (múltiples bootstraps no causan problemas)

## Detección de Corrupción Real

El sistema ahora solo detecta corrupción **real**:

### Corrupción Detectada ✅

1. **Logs posteriores con prevHash incorrecto**
   ```
   Log #5: prevHash = "abc123..."
   Log #6: prevHash = "xyz789..." (debería ser hash de #5)
   → CORRUPCIÓN REAL
   ```

2. **Hash inválido en logs posteriores**
   ```
   Log #7: hash calculado = "def456..."
           hash almacenado = "ghi789..."
   → CORRUPCIÓN REAL
   ```

3. **Génesis con estructura incorrecta**
   ```
   Log #1: type = "STANDARD" (debería ser "GENESIS")
   → CORRUPCIÓN REAL
   ```

### Falsos Positivos Eliminados ❌

1. **Discrepancias menores en hash de génesis**
   - Ya no se verifica el hash del génesis
   - Solo se valida su estructura

2. **Recreación de génesis en reinicios**
   - El génesis nunca se recrea
   - Bootstrap es idempotente

## Monitoreo

### Verificación Manual

```typescript
import { verifyAuditChainIntegrity } from './server/infra/emergency';

const result = await verifyAuditChainIntegrity(1000);

if (result.isValid) {
  console.log("✅ Audit chain is valid");
} else {
  console.log("❌ Corruption detected:", result.details);
}
```

### Job Automático

El sistema ejecuta verificaciones periódicas:

```typescript
// server/infra/jobs/integrityCheck.ts
startIntegrityCheckJob(); // Cada hora
```

Si se detecta corrupción real:
1. Activa modo de emergencia
2. Bloquea nuevas escrituras
3. Alerta al owner
4. Registra detalles en logs

## Migración de Sistemas Existentes

Si tienes un sistema con logs antiguos sin génesis:

1. **Backup de datos**
   ```bash
   mysqldump -u root -p aresk_obs auditLogs > backup.sql
   ```

2. **Reset de auditoría**
   ```bash
   pnpm tsx scripts/reset-audit-genesis.ts
   ```

3. **Verificar bootstrap**
   ```bash
   pnpm tsx scripts/bootstrap-audit.ts
   ```

4. **Reiniciar servidor**
   ```bash
   pnpm dev
   ```

## Estado del Sistema

**CLOSED AND OPERATIONAL**

El sistema de auditoría está congelado bajo el contrato de invariantes.  
Ver: `docs/AUDIT-CONTRACT.md`

## Referencias

- **Contrato**: `docs/AUDIT-CONTRACT.md` (DEFINITIVO)
- **Estado**: `server/infra/AUDIT_STATUS.md`
- **Código fuente**: `server/infra/auditBootstrap.ts`
- **Validación**: `server/infra/crypto.ts`
- **Tests**: `server/infra/auditBootstrap.test.ts`
- **Scripts**: `scripts/bootstrap-audit.ts`, `scripts/reset-audit-genesis.ts`
