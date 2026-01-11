#!/usr/bin/env python3.11
"""
Script para calcular la similitud del coseno entre dos textos
Utiliza el motor semántico de CAELION con SentenceTransformers
"""

import sys
from semantic_engine import SemanticEngine

def main():
    if len(sys.argv) != 3:
        print("Error: Se requieren exactamente 2 argumentos (text1, text2)", file=sys.stderr)
        sys.exit(1)
    
    text1 = sys.argv[1]
    text2 = sys.argv[2]
    
    # Inicializar el motor semántico
    engine = SemanticEngine()
    
    # Calcular similitud del coseno
    similarity = engine.calculate_cosine_similarity(text1, text2)
    
    # Retornar solo el valor numérico
    print(similarity)

if __name__ == "__main__":
    main()
