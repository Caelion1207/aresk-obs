# Guía de Pruebas Automatizadas - ARESK-OBS

**Última actualización:** 20 de enero de 2026, 06:48 GMT-7

---

## Resumen

Este documento describe el flujo de pruebas automatizadas para ARESK-OBS, incluyendo la configuración de usuarios de prueba, helpers de autenticación y ejecución de tests de integración.

---

## Usuario de Prueba

### Creación

El sistema incluye un script de seed que crea un usuario de prueba con sesiones sintéticas:

```bash
pnpm exec tsx scripts/seed_test_user.ts
```

**Opciones:**
- `--reset`: Elimina sesiones antiguas del usuario de prueba antes de crear nuevas

### Datos del Usuario de Prueba

```typescript
const TEST_USER = {
  id: 1440009,
  openId: "test_user_aresk_obs",
  name: "Usuario de Prueba ARESK-OBS",
  email: "test@aresk-obs.demo",
  loginMethod: "test",
  role: "user"
};
```

### Sesiones de Prueba

El script crea 3 sesiones con diferentes perfiles de planta:

```typescript
const TEST_SESSIONS = {
  ACOPLADA: 450002,  // Régimen CAELION (control activo)
  TIPO_A: 450003,    // Alta entropía (sin gobierno)
  TIPO_B: 450004     // Deriva natural (ruido moderado)
};
```

Cada sesión incluye:
- 2 mensajes de ejemplo (usuario + asistente)
- 1 métrica de ejemplo con valores sintéticos

---

## Helpers de Autenticación

### Ubicación

`server/test-helpers/auth.ts`

### Funciones Disponibles

#### `createAuthContext(user?)`

Crea un contexto de usuario autenticado para tests.

```typescript
import { createAuthContext, TEST_USER } from "./test-helpers/auth";

const ctx = createAuthContext();
const caller = appRouter.createCaller(ctx);

const sessions = await caller.session.list();
```

#### `createUnauthContext()`

Crea un contexto sin autenticación para tests de seguridad.

```typescript
import { createUnauthContext } from "./test-helpers/auth";

const ctx = createUnauthContext();
const caller = appRouter.createCaller(ctx);

// Esto debería fallar
await expect(caller.session.list()).rejects.toThrow();
```

#### `createMockRequest(userId?)`

Crea un mock de request HTTP con cookie de sesión.

```typescript
const req = createMockRequest(TEST_USER.id);
```

#### `createMockResponse()`

Crea un mock de response HTTP para tests.

```typescript
const res = createMockResponse();
```

---

## Tests de Integración

### Ubicación

`server/session.list.test.ts`

### Ejecución

**Ejecutar todos los tests:**
```bash
pnpm test
```

**Ejecutar solo tests de session.list:**
```bash
pnpm test server/session.list.test.ts
```

**Modo watch (desarrollo):**
```bash
pnpm test:watch
```

### Cobertura de Tests

#### Funcionalidad Básica
- ✅ Retornar sesiones del usuario autenticado
- ✅ Incluir sesiones de prueba creadas por seed
- ✅ Ordenar sesiones por fecha (más recientes primero)
- ✅ Fallar sin autenticación
- ✅ Respetar límite de paginación

#### Seguridad
- ✅ Prevenir IDOR (Insecure Direct Object Reference)
- ✅ Aislamiento de datos por usuario
- ✅ Usar índice en sessions.userId para optimización

#### Edge Cases
- ✅ Retornar array vacío si el usuario no tiene sesiones
- ✅ Manejar usuarios ficticios sin datos

---

## Flujo de Desarrollo con Tests

### 1. Preparación del Entorno

```bash
# Crear usuario de prueba (primera vez)
pnpm exec tsx scripts/seed_test_user.ts

# Regenerar sesiones de prueba (si es necesario)
pnpm exec tsx scripts/seed_test_user.ts --reset
```

### 2. Desarrollo con TDD

```bash
# Iniciar tests en modo watch
pnpm test:watch

# Editar código y ver resultados en tiempo real
```

### 3. Validación Antes de Commit

```bash
# Ejecutar todos los tests
pnpm test

# Verificar que no hay errores de TypeScript
pnpm tsc --noEmit
```

### 4. Limpieza de Datos de Prueba

```bash
# Eliminar sesiones antiguas de prueba
pnpm exec tsx scripts/cleanup_test_data.ts --dry-run

# Aplicar limpieza
pnpm exec tsx scripts/cleanup_test_data.ts
```

---

## Mejores Prácticas

### 1. Aislamiento de Tests

- Cada test debe ser independiente
- No depender del orden de ejecución
- Usar datos de prueba predefinidos (TEST_USER, TEST_SESSIONS)

### 2. Contextos de Autenticación

- Usar `createAuthContext()` para tests de funcionalidad
- Usar `createUnauthContext()` para tests de seguridad
- Crear contextos personalizados para edge cases

### 3. Assertions Específicas

```typescript
// ✅ Bueno: Assertion específica
expect(sessions[0].userId).toBe(TEST_USER.id);

// ❌ Malo: Assertion genérica
expect(sessions).toBeTruthy();
```

### 4. Manejo de Errores

```typescript
// ✅ Bueno: Verificar tipo de error
await expect(caller.session.list()).rejects.toThrow("UNAUTHORIZED");

// ❌ Malo: Solo verificar que falla
await expect(caller.session.list()).rejects.toThrow();
```

---

## Troubleshooting

### Error: "Database not available"

**Causa:** DATABASE_URL no está configurada.

**Solución:**
```bash
# Verificar variable de entorno
echo $DATABASE_URL

# Si no está configurada, agregar a .env
DATABASE_URL="mysql://..."
```

### Error: "User openId is required for upsert"

**Causa:** Datos de usuario incompletos en test.

**Solución:**
```typescript
// Asegurarse de incluir openId
const ctx = createAuthContext({
  id: 123,
  openId: "test_user_123",  // ← Requerido
  name: "Test User"
});
```

### Tests Fallando Después de Cambios en Schema

**Causa:** Datos de prueba desactualizados.

**Solución:**
```bash
# Regenerar usuario de prueba
pnpm exec tsx scripts/seed_test_user.ts --reset

# Aplicar migraciones si es necesario
pnpm db:push
```

---

## Métricas de Cobertura

**Estado actual (20/01/2026):**
- Tests totales: 10
- Tests pasados: 10 (100%)
- Cobertura de session.list: 100%
- Tiempo de ejecución: ~200ms

**Objetivos:**
- Mantener 100% de tests pasados
- Tiempo de ejecución < 500ms
- Cobertura de código > 80% (próxima implementación)

---

## Próximos Pasos

### Tests Adicionales Planeados

1. **Paginación Avanzada**
   - Tests con offset y limit personalizados
   - Navegación entre páginas
   - Edge cases (offset > total)

2. **Rendimiento**
   - Benchmarks con 1000+ sesiones
   - Validación de uso de índices
   - Tiempo de respuesta bajo carga

3. **Integración E2E**
   - Tests con navegador (Playwright)
   - Flujo completo de autenticación OAuth
   - Validación de UI

---

**Documentación mantenida por:** Equipo ARESK-OBS  
**Última revisión:** 20 de enero de 2026, 06:48 GMT-7
