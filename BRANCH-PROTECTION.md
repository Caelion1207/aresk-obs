# Instrucciones para Bloqueo de Rama Main

**Repositorio**: github.com/Caelion1207/aresk-obs  
**Versión congelada**: v1.0.0-AUDIT-CLOSED  
**Fecha**: 2026-01-23

---

## Objetivo

Bloquear la rama `main` para que sea **solo lectura** y prevenir modificaciones futuras.

---

## Pasos para Configurar Branch Protection

### 1. Acceder a GitHub Repository Settings

1. Ir a: https://github.com/Caelion1207/aresk-obs
2. Click en **Settings** (pestaña superior derecha)
3. En el menú lateral izquierdo, click en **Branches**

### 2. Agregar Branch Protection Rule

1. Click en **Add branch protection rule**
2. En **Branch name pattern**, escribir: `main`

### 3. Configurar Reglas de Protección

Marcar las siguientes opciones:

#### Protección contra push directo
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: **1**
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners

#### Protección contra force push
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict who can push to matching branches**
  - Dejar vacío (nadie puede hacer push directo)

#### Protección contra eliminación
- ✅ **Do not allow deletions**

#### Protección contra force push
- ✅ **Do not allow force pushes**

### 4. Guardar Configuración

1. Scroll hacia abajo
2. Click en **Create** o **Save changes**

---

## Resultado Esperado

Después de aplicar estas reglas:

- ❌ **No se pueden hacer commits directos a `main`**
- ❌ **No se puede hacer force push**
- ❌ **No se puede eliminar la rama**
- ✅ **Solo lectura para todos los usuarios**
- ✅ **Cualquier cambio requiere Pull Request con aprobación**

---

## Desarrollo Futuro

Para cualquier desarrollo futuro:

1. **Crear nueva rama** desde `main`:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Trabajar en la nueva rama**:
   ```bash
   git add .
   git commit -m "feat: Nueva funcionalidad"
   git push origin feature/nueva-funcionalidad
   ```

3. **Crear Pull Request** (pero NO mergear a `main`)

4. **Considerar crear nuevo proyecto** si los cambios son significativos:
   - Nuevo repositorio
   - Nuevo nombre
   - Nuevo ciclo de desarrollo

---

## Política de Cambios

**La rama `main` está CONGELADA en v1.0.0-AUDIT-CLOSED.**

Cualquier modificación futura debe:
- Ocurrir en una rama separada
- Ser documentada como versión experimental
- NO afectar la versión estable v1.0.0

---

## Contacto

Para preguntas sobre el bloqueo de la rama o desarrollo futuro:
- Revisar: `docs/AUDIT-CONTRACT.md`
- Consultar: `README.md` (sección Repository Status)

---

**Estado**: Pendiente de aplicación manual por el propietario del repositorio  
**Prioridad**: ALTA  
**Acción requerida**: Configurar Branch Protection Rules en GitHub Settings
