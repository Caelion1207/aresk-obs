#!/usr/bin/env python3.11
"""
ARESK-OBS Encoder de Referencia
Modelo: all-MiniLM-L6-v2
Dimensión: 384
Propósito: Encoder oficial para cálculo de métricas canónicas de viabilidad operativa
"""

import sys
import json
import numpy as np
from sentence_transformers import SentenceTransformer

# Cargar modelo (se cachea automáticamente después de la primera ejecución)
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384

try:
    model = SentenceTransformer(MODEL_NAME)
except Exception as e:
    print(json.dumps({"error": f"Error al cargar modelo: {str(e)}"}), file=sys.stderr)
    sys.exit(1)

def generate_embedding(text: str) -> list:
    """Genera embedding de 384 dimensiones para un texto"""
    embedding = model.encode(text, convert_to_numpy=True)
    return embedding.tolist()

def cosine_similarity(vec_a: list, vec_b: list) -> float:
    """Calcula similitud coseno entre dos vectores"""
    a = np.array(vec_a)
    b = np.array(vec_b)
    
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    
    if norm_a == 0 or norm_b == 0:
        return 0.0
    
    return float(dot_product / (norm_a * norm_b))

def euclidean_distance(vec_a: list, vec_b: list) -> float:
    """Calcula distancia euclidiana entre dos vectores"""
    a = np.array(vec_a)
    b = np.array(vec_b)
    return float(np.linalg.norm(a - b))

def shannon_entropy(vec: list) -> float:
    """Calcula entropía de Shannon de un vector normalizado"""
    arr = np.abs(np.array(vec))
    total = np.sum(arr)
    
    if total == 0:
        return 0.0
    
    probs = arr / total
    # Filtrar ceros para evitar log(0)
    probs = probs[probs > 0]
    
    entropy = -np.sum(probs * np.log2(probs))
    return float(entropy)

def calculate_canonical_metrics(reference_text: str, response_text: str) -> dict:
    """
    Calcula métricas canónicas de ARESK-OBS
    
    Métricas:
    - omega_sem (Ω): Coherencia Observable (similitud coseno)
    - epsilon_eff (ε): Eficiencia Incremental (1 - distancia normalizada)
    - v_lyapunov (V): Función de Lyapunov (energía del error semántico)
    - h_div (H_div): Divergencia Entrópica
    """
    # Generar embeddings
    ref_emb = generate_embedding(reference_text)
    resp_emb = generate_embedding(response_text)
    
    # Ω_sem: Coherencia Observable
    omega_sem = cosine_similarity(ref_emb, resp_emb)
    
    # ε_eff: Eficiencia Incremental
    distance = euclidean_distance(ref_emb, resp_emb)
    max_distance = np.sqrt(EMBEDDING_DIM * 2)  # Máxima distancia posible
    epsilon_eff = 1.0 - (distance / max_distance)
    
    # V: Función de Lyapunov (energía del error)
    error = np.array(ref_emb) - np.array(resp_emb)
    v_lyapunov = float(np.sum(error ** 2) / EMBEDDING_DIM)
    
    # H_div: Divergencia Entrópica
    h_ref = shannon_entropy(ref_emb)
    h_resp = shannon_entropy(resp_emb)
    h_div = abs(h_ref - h_resp)
    
    return {
        "omega_sem": omega_sem,
        "epsilon_eff": epsilon_eff,
        "v_lyapunov": v_lyapunov,
        "h_div": h_div,
        "embedding_dim": EMBEDDING_DIM,
        "model": MODEL_NAME,
        "reference_embedding": ref_emb,
        "response_embedding": resp_emb
    }

def main():
    """Punto de entrada CLI"""
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Uso: encoder_local.py <comando> [args...]"}), file=sys.stderr)
        sys.exit(1)
    
    command = sys.argv[1]
    
    try:
        if command == "embed":
            if len(sys.argv) < 3:
                print(json.dumps({"error": "Uso: encoder_local.py embed <texto>"}), file=sys.stderr)
                sys.exit(1)
            
            text = sys.argv[2]
            embedding = generate_embedding(text)
            result = {
                "embedding": embedding,
                "dimension": EMBEDDING_DIM,
                "model": MODEL_NAME
            }
            print(json.dumps(result))
        
        elif command == "metrics":
            if len(sys.argv) < 4:
                print(json.dumps({"error": "Uso: encoder_local.py metrics <texto_referencia> <texto_respuesta>"}), file=sys.stderr)
                sys.exit(1)
            
            reference = sys.argv[2]
            response = sys.argv[3]
            metrics = calculate_canonical_metrics(reference, response)
            
            # No incluir embeddings completos en la salida por defecto (muy largos)
            output = {k: v for k, v in metrics.items() if k not in ["reference_embedding", "response_embedding"]}
            print(json.dumps(output))
        
        elif command == "similarity":
            if len(sys.argv) < 4:
                print(json.dumps({"error": "Uso: encoder_local.py similarity <texto1> <texto2>"}), file=sys.stderr)
                sys.exit(1)
            
            text1 = sys.argv[2]
            text2 = sys.argv[3]
            emb1 = generate_embedding(text1)
            emb2 = generate_embedding(text2)
            similarity = cosine_similarity(emb1, emb2)
            
            result = {
                "similarity": similarity,
                "model": MODEL_NAME
            }
            print(json.dumps(result))
        
        else:
            print(json.dumps({"error": f"Comando desconocido: {command}"}), file=sys.stderr)
            sys.exit(1)
    
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
