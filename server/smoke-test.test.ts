/**
 * Smoke Test - Verificación de funcionalidades desplegadas
 * 
 * Este script verifica que las funcionalidades recién implementadas
 * estén operacionales y accesibles.
 */

import { describe, it, expect } from 'vitest';

describe('Smoke Test - Funcionalidades Desplegadas', () => {
  
  describe('Navegación desde Home', () => {
    it('debe tener enlace a Experimento de Estabilidad', () => {
      // Verificar que el enlace existe en el código
      const homeContent = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/Home.tsx',
        'utf-8'
      );
      
      expect(homeContent).toContain('/experimento/estabilidad');
      expect(homeContent).toContain('Experimento de Estabilidad');
    });

    it('debe tener enlace a Diagrama de Arquitectura', () => {
      const homeContent = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/Home.tsx',
        'utf-8'
      );
      
      expect(homeContent).toContain('/sistema/flujo');
      expect(homeContent).toContain('Diagrama de Arquitectura');
    });
  });

  describe('Página de Experimento de Estabilidad', () => {
    it('debe existir el archivo ExperimentoEstabilidad.tsx', () => {
      const fs = require('fs');
      const exists = fs.existsSync('/home/ubuntu/aresk-obs/client/src/pages/ExperimentoEstabilidad.tsx');
      expect(exists).toBe(true);
    });

    it('debe contener gráfica Chart.js', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/ExperimentoEstabilidad.tsx',
        'utf-8'
      );
      
      // Verificar que usa Chart.js (nativo o wrapper)
      expect(content).toContain('Chart');
      expect(content).toContain('chartInstance');
    });

    it('debe tener tabla expandible con ordenamiento', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/ExperimentoEstabilidad.tsx',
        'utf-8'
      );
      
      expect(content).toContain('showTable');
      expect(content).toContain('sortColumn');
      expect(content).toContain('sortDirection');
    });

    it('debe tener botón de navegación a Comparación', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/ExperimentoEstabilidad.tsx',
        'utf-8'
      );
      
      expect(content).toContain('/experimento/comparar');
      expect(content).toContain('Comparar con otros regímenes');
    });
  });

  describe('Página de Comparación de Regímenes', () => {
    it('debe existir el archivo ExperimentoComparar.tsx', () => {
      const fs = require('fs');
      const exists = fs.existsSync('/home/ubuntu/aresk-obs/client/src/pages/ExperimentoComparar.tsx');
      expect(exists).toBe(true);
    });

    it('debe contener gráfica comparativa multi-line', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/ExperimentoComparar.tsx',
        'utf-8'
      );
      
      expect(content).toContain('datasets');
      expect(content).toContain('Régimen A');
      expect(content).toContain('Régimen B');
      expect(content).toContain('Régimen C');
    });

    it('debe tener tarjetas descriptivas de regímenes', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/ExperimentoComparar.tsx',
        'utf-8'
      );
      
      expect(content).toContain('Alta Entropía');
      expect(content).toContain('Ruido Medio');
      expect(content).toContain('CAELION Activo');
    });
  });

  describe('Diagrama de Arquitectura', () => {
    it('debe existir el archivo SystemFlow.tsx', () => {
      const fs = require('fs');
      const exists = fs.existsSync('/home/ubuntu/aresk-obs/client/src/pages/SystemFlow.tsx');
      expect(exists).toBe(true);
    });

    it('debe contener diagrama SVG interactivo', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/SystemFlow.tsx',
        'utf-8'
      );
      
      expect(content).toContain('<svg');
      expect(content).toContain('viewBox');
      expect(content).toContain('onClick');
    });

    it('debe tener modal de documentación técnica', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/SystemFlow.tsx',
        'utf-8'
      );
      
      expect(content).toContain('Dialog');
      expect(content).toContain('selectedComponent');
      expect(content).toContain('technicalSpecs');
    });

    it('debe documentar los 8 componentes del sistema', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/SystemFlow.tsx',
        'utf-8'
      );
      
      const components = [
        'user',
        'llm',
        'semantic_bridge',
        'embeddings',
        'cache',
        'database',
        'audit',
        'dashboard'
      ];

      components.forEach(comp => {
        expect(content).toContain(comp);
      });
    });

    it('debe incluir ejemplos de código en documentación', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/pages/SystemFlow.tsx',
        'utf-8'
      );
      
      expect(content).toContain('codeExample');
      expect(content).toContain('import');
      expect(content).toContain('await');
    });
  });

  describe('Rutas en App.tsx', () => {
    it('debe tener ruta para Experimento de Estabilidad', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/App.tsx',
        'utf-8'
      );
      
      expect(content).toContain('/experimento/estabilidad');
      expect(content).toContain('ExperimentoEstabilidad');
    });

    it('debe tener ruta para Comparación de Regímenes', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/App.tsx',
        'utf-8'
      );
      
      expect(content).toContain('path="/experimento/comparar"');
      expect(content).toContain('ExperimentoComparar');
    });

    it('debe tener ruta para Diagrama de Arquitectura', () => {
      const content = require('fs').readFileSync(
        '/home/ubuntu/aresk-obs/client/src/App.tsx',
        'utf-8'
      );
      
      expect(content).toContain('path="/sistema/flujo"');
      expect(content).toContain('SystemFlow');
    });
  });

  describe('Datos de Experimento', () => {
    it('debe existir archivo de resultados del Régimen A-1', () => {
      const fs = require('fs');
      const exists = fs.existsSync('/home/ubuntu/aresk-obs/experiments/results/result-A-1.json');
      expect(exists).toBe(true);
    });

    it('debe contener 50 mensajes en result-A-1.json', () => {
      const fs = require('fs');
      const data = JSON.parse(
        fs.readFileSync('/home/ubuntu/aresk-obs/experiments/results/result-A-1.json', 'utf-8')
      );
      
      expect(data.messages).toHaveLength(50);
    });

    it('debe tener métricas ε, Ω, V en cada turno', () => {
      const fs = require('fs');
      const data = JSON.parse(
        fs.readFileSync('/home/ubuntu/aresk-obs/experiments/results/result-A-1.json', 'utf-8')
      );
      
      const firstMessage = data.messages[0];
      expect(firstMessage).toHaveProperty('metrics');
      expect(firstMessage.metrics).toHaveProperty('epsilon');
      expect(firstMessage.metrics).toHaveProperty('omega');
      expect(firstMessage.metrics).toHaveProperty('V');
    });
  });

  describe('Documentación', () => {
    it('debe existir informe completo del sistema', () => {
      const fs = require('fs');
      const exists = fs.existsSync('/home/ubuntu/aresk-obs/docs/INFORME-SISTEMA-COMPLETO.md');
      expect(exists).toBe(true);
    });

    it('debe existir informe de estabilidad temporal', () => {
      const fs = require('fs');
      const exists = fs.existsSync('/home/ubuntu/aresk-obs/experiments/INFORME-ESTABILIDAD-TEMPORAL-A1.md');
      expect(exists).toBe(true);
    });

    it('debe existir contrato de auditoría', () => {
      const fs = require('fs');
      const exists = fs.existsSync('/home/ubuntu/aresk-obs/docs/AUDIT-CONTRACT.md');
      expect(exists).toBe(true);
    });

    it('debe existir documentación de génesis de auditoría', () => {
      const fs = require('fs');
      const exists = fs.existsSync('/home/ubuntu/aresk-obs/docs/AUDIT-GENESIS.md');
      expect(exists).toBe(true);
    });
  });
});
