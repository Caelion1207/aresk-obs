# Informe Comparativo: B-1 vs C-1

**Fecha**: 2026-02-09  
**Herramienta**: ARESK-OBS v1.1  
**Objetivo**: Evaluar diferencias entre régimen sin CAELION (B-1) y con CAELION (C-1)

---

## Experimentos Analizados

### B-1 (Sin CAELION)
- **ID**: B-1-1770623178573
- **Régimen**: tipo_b
- **Interacciones**: 50/50
- **Encoder**: sentence-transformers/all-MiniLM-L6-v2 (384D)
- **Input**: 50 mensajes canónicos de C-1

### C-1 (Con CAELION)
- **ID**: C-1-1770595905889
- **Régimen**: acoplada
- **Interacciones**: 50/50
- **Encoder**: sentence-transformers/all-MiniLM-L6-v2 (384D)
- **Input**: 50 mensajes canónicos

---

## Métricas Promedio

| Métrica | B-1 (sin CAELION) | C-1 (con CAELION) | Δ (C-1 - B-1) | Interpretación |
|---------|-------------------|-------------------|---------------|----------------|
| **Ω (Coherencia)** | 0.5212 | 0.5273 | +0.0061 | ✅ Similar |
| **ε (Eficiencia)** | 0.9650 | 0.9653 | +0.0003 | ✅ Similar |
| **V (Lyapunov)** | 0.0025 | 0.0025 | -0.0000 | ✅ Similar |
| **H (Entropía)** | 0.0327 | 0.0431 | +0.0104 | ⚠️ Diferencia notable |

---

## Volatilidad (Desviación Estándar)

| Métrica | σ(B-1) | σ(C-1) | Interpretación |
|---------|--------|--------|----------------|
| **Ω (Coherencia)** | 0.1107 | 0.1330 | ⚠️ B-1 más estable |
| **V (Lyapunov)** | 0.0006 | 0.0007 | ⚠️ B-1 más estable |

---

## Conclusiones

### Diferencias Cuantitativas

✅ **Diferencias notables detectadas** entre B-1 y C-1. Las métricas muestran divergencias significativas que justifican mantener ambos experimentos como regímenes distintos.

### Recomendación

**Revisar implementación de CAELION** en C-1. Las diferencias son insuficientes para justificar dos regímenes distintos.

---

**Generado por**: ARESK-OBS v1.1  
**Estado**: Informe preliminar para decisión
