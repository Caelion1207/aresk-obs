# Extensión de Esquema v1.1

**Fecha**: 2026-02-09  
**Tipo**: Extensión no destructiva  
**Afectado**: `experiment_interactions`  

---

## Cambios

### Campo agregado: `caelion_intervened`

```sql
ALTER TABLE experiment_interactions 
ADD COLUMN caelion_intervened BOOLEAN NOT NULL DEFAULT FALSE;
```

**Propósito**: Registrar explícitamente cuándo CAELION intervino en una interacción específica durante experimentos del Régimen C (acoplada).

**Tipo**: `BOOLEAN NOT NULL DEFAULT FALSE`  
**Valor por defecto**: `false` (sin intervención)

---

## Impacto en Datos Históricos

### Experimentos B-1 y C-1 (Baseline v1)

Los experimentos B-1 y C-1 fueron ejecutados **antes** de la adición de este campo. Por lo tanto:

- **B-1**: Todas las interacciones tienen `caelion_intervened = false` (correcto, ya que B-1 no tiene CAELION)
- **C-1**: Todas las interacciones tienen `caelion_intervened = false` (incorrecto, pero no se puede recalcular sin logs originales)

**Limitación documentada**: Los datos históricos de C-1 **no registran intervenciones de CAELION** porque el campo no existía durante la ejecución del experimento. Las intervenciones ocurrieron pero no fueron persistidas en la base de datos.

### Futuros Experimentos

Todos los experimentos ejecutados **después** de 2026-02-09 registrarán correctamente las intervenciones de CAELION en el campo `caelion_intervened`.

---

## Compatibilidad

### Código Existente

El campo tiene valor por defecto `false`, por lo que:
- ✅ Queries existentes siguen funcionando sin modificación
- ✅ Inserciones sin especificar el campo usan `false` automáticamente
- ✅ No se requiere migración de datos

### Visualizaciones

Las visualizaciones en `/experimento/dynamics` ahora pueden:
- Mostrar marcadores de intervención CAELION en phase portraits
- Graficar intervenciones temporalmente en RLD(t)
- Diferenciar trayectorias con/sin intervención

**Nota**: Para C-1 histórico, no se mostrarán marcadores de intervención (todos son `false`).

---

## Versionado

| Versión | Fecha | Cambio |
|---------|-------|--------|
| v1.0 | 2026-02-08 | Esquema inicial con experimentos B-1 y C-1 |
| v1.1 | 2026-02-09 | Agregado campo `caelion_intervened` para registro de intervenciones |

---

## Recomendaciones

### Para Futuros Experimentos

1. **Registrar intervenciones en tiempo real**: Modificar `runExperimentC1.ts` para establecer `caelionIntervened: true` cuando CAELION vete una respuesta
2. **Validar registro**: Verificar que al menos 1 intervención fue registrada en experimentos del Régimen C
3. **Documentar tasa de intervención**: Calcular `interventions / total_interactions` como métrica de supervisión

### Para Análisis Histórico

1. **Aceptar limitación**: C-1 histórico no tiene datos de intervención
2. **Documentar en reportes**: Mencionar explícitamente que visualizaciones de C-1 no muestran intervenciones
3. **Considerar re-ejecución**: Si se requiere análisis detallado de intervenciones, ejecutar nuevo experimento C-2

---

## Conclusión

La extensión v1.1 del esquema agrega capacidad de registro de intervenciones CAELION sin afectar datos históricos ni compatibilidad de código existente. Los datos de Baseline v1 (B-1, C-1) permanecen intactos y válidos, con la limitación documentada de que C-1 no registra intervenciones.

**Estado**: Extensión aplicada exitosamente  
**Migración**: `drizzle/0020_sad_shaman.sql`  
**Compatibilidad**: Retrocompatible
