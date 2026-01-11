"""
Sistema de Medición de Estados Semánticos (SMES)
Implementación de la arquitectura CAELION para control cognitivo
"""

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import Dict, List, Tuple, Optional
import json

class SemanticEngine:
    """
    Motor de medición de estados semánticos basado en la teoría de control de Lyapunov.
    Implementa el núcleo matemático de la arquitectura CAELION.
    """
    
    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        """
        Inicializa el motor semántico con un modelo de embeddings.
        
        Args:
            model_name: Nombre del modelo de SentenceTransformers a utilizar
        """
        self.model = SentenceTransformer(model_name)
        self.x_ref: Optional[np.ndarray] = None
        self.reference_text: Optional[str] = None
        self.K: float = 0.5  # Ganancia del controlador LQR (ajustable)
        self.history: List[Dict] = []
        
    def set_reference(self, purpose: str, limits: str, ethics: str) -> Dict:
        """
        Define la referencia ontológica x_ref = (P, L, E).
        
        Args:
            purpose: Propósito del sistema (P)
            limits: Límites operacionales (L)
            ethics: Espacio ético (E)
            
        Returns:
            Diccionario con el embedding de referencia y metadatos
        """
        # Construir el texto de referencia completo
        self.reference_text = f"""
        Propósito: {purpose}
        Límites: {limits}
        Ética: {ethics}
        """
        
        # Generar el embedding de referencia
        self.x_ref = self.model.encode([self.reference_text])[0]
        
        return {
            "success": True,
            "reference_text": self.reference_text,
            "embedding_dimension": len(self.x_ref),
            "purpose": purpose,
            "limits": limits,
            "ethics": ethics
        }
    
    def measure_state(self, output_text: str) -> Dict:
        """
        Mide el estado semántico x(t) de un output y calcula todas las métricas de control.
        
        Args:
            output_text: Texto del output actual del sistema
            
        Returns:
            Diccionario con x(t), e(t), V(e), Ω(t) y otras métricas
        """
        if self.x_ref is None:
            raise ValueError("Referencia ontológica no definida. Llame a set_reference() primero.")
        
        # Paso 1: Calcular x(t) - Estado semántico actual
        x_t = self.model.encode([output_text])[0]
        
        # Paso 2: Calcular e(t) - Error cognitivo
        e_t = x_t - self.x_ref
        
        # Paso 3: Calcular V(e) - Función de Lyapunov (energía de desalineación)
        # V(e) = ||e||^2 = e^T * e
        V_e = float(np.dot(e_t, e_t))
        
        # Paso 4: Calcular Ω(t) - Coherencia observable (similitud del coseno)
        # Ω(t) ∈ [-1, 1], donde 1 = perfecta alineación
        omega_t = float(cosine_similarity([x_t], [self.x_ref])[0][0])
        
        # Paso 5: Calcular magnitud del error
        error_magnitude = float(np.linalg.norm(e_t))
        
        # Paso 6: Calcular acción de control u(t) = -K * e(t)
        u_t = -self.K * e_t
        control_magnitude = float(np.linalg.norm(u_t))
        
        # Métricas adicionales
        # H(t) - Entropía/Incertidumbre (aproximada por varianza del embedding)
        H_t = float(np.var(x_t))
        
        # C(t) - Coherencia interna (aproximada por norma del estado)
        C_t = float(np.linalg.norm(x_t))
        
        result = {
            "coherencia_observable_omega": omega_t,
            "funcion_lyapunov_V": V_e,
            "error_cognitivo_magnitud": error_magnitude,
            "control_action_magnitude": control_magnitude,
            "entropia_H": H_t,
            "coherencia_interna_C": C_t,
            "estado_semantico_xt": x_t.tolist(),
            "error_cognitivo_et": e_t.tolist(),
            "control_action_ut": u_t.tolist(),
            "output_text": output_text
        }
        
        # Guardar en historial
        self.history.append(result)
        
        return result
    
    def apply_control(self, original_prompt: str, error_vector: np.ndarray) -> str:
        """
        Aplica la acción de control u(t) = -K * e(t) para corregir la trayectoria.
        
        Args:
            original_prompt: Prompt original del usuario
            error_vector: Vector de error e(t)
            
        Returns:
            Prompt corregido con la acción de control aplicada
        """
        # Calcular la magnitud del error
        error_mag = np.linalg.norm(error_vector)
        
        # Si el error es pequeño, no aplicar corrección
        if error_mag < 0.1:
            return original_prompt
        
        # Construir el prompt de corrección basado en la referencia
        correction_prompt = f"""
{original_prompt}

[CONTROL DE ESTABILIDAD ACTIVO]
Referencia ontológica:
{self.reference_text}

INSTRUCCIÓN DE CONTROL: Tu respuesta debe mantenerse alineada con el propósito, límites y ética definidos arriba. 
Error detectado de magnitud {error_mag:.3f}. Corrige la trayectoria hacia la referencia.
"""
        return correction_prompt
    
    def get_history(self) -> List[Dict]:
        """Retorna el historial completo de mediciones."""
        return self.history
    
    def clear_history(self):
        """Limpia el historial de mediciones."""
        self.history = []
    
    def get_phase_space_data(self) -> Dict:
        """
        Extrae datos para el mapa de fase (H vs C).
        
        Returns:
            Diccionario con arrays de H(t) y C(t)
        """
        if not self.history:
            return {"H": [], "C": []}
        
        H_values = [entry["entropia_H"] for entry in self.history]
        C_values = [entry["coherencia_interna_C"] for entry in self.history]
        
        return {
            "H": H_values,
            "C": C_values
        }
    
    def set_control_gain(self, K: float):
        """
        Ajusta la ganancia del controlador LQR.
        
        Args:
            K: Nueva ganancia del controlador
        """
        self.K = K
    
    def calculate_cosine_similarity(self, text1: str, text2: str) -> float:
        """
        Calcula la similitud del coseno entre dos textos.
        
        Args:
            text1: Primer texto a comparar
            text2: Segundo texto a comparar
            
        Returns:
            Similitud del coseno en el rango [-1, 1], donde 1 = idénticos
        """
        # Generar embeddings para ambos textos
        embedding1 = self.model.encode([text1])[0]
        embedding2 = self.model.encode([text2])[0]
        
        # Calcular similitud del coseno
        similarity = float(cosine_similarity([embedding1], [embedding2])[0][0])
        
        return similarity
