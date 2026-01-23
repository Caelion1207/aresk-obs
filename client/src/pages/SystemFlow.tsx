import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface ComponentInfo {
  id: string;
  title: string;
  description: string;
  details: string;
}

const COMPONENTS: Record<string, ComponentInfo> = {
  user: {
    id: 'user',
    title: 'Usuario',
    description: 'Entrada de mensajes',
    details: 'El usuario envía mensajes al sistema a través de la interfaz web. Estos mensajes son el punto de partida para el análisis de estabilidad cognitiva.'
  },
  llm: {
    id: 'llm',
    title: 'LLM API',
    description: 'Generación de respuestas',
    details: 'Modelo de lenguaje de gran escala que genera respuestas basadas en los mensajes del usuario. La respuesta es analizada por el sistema de métricas.'
  },
  semantic_bridge: {
    id: 'semantic_bridge',
    title: 'Semantic Bridge (CAELION)',
    description: 'Cálculo de métricas ε, Ω, V',
    details: 'Núcleo del sistema que implementa el protocolo CAELION. Calcula las tres métricas fundamentales: Entropía Semántica (ε), Coste de Control (Ω) y Exponente de Lyapunov (V).'
  },
  embeddings: {
    id: 'embeddings',
    title: 'Servicio de Embeddings',
    description: 'Vectorización semántica',
    details: 'Convierte texto en vectores de alta dimensionalidad que capturan significado semántico. Utilizado para calcular similitudes coseno entre mensajes, respuestas y referencia ética.'
  },
  cache: {
    id: 'cache',
    title: 'Caché de Embeddings',
    description: 'Optimización de latencia',
    details: 'Almacena en memoria el embedding de "Bucéfalo" (referencia ética) para reutilización. Reduce latencia de 30ms a 0.5ms (~50x más rápido) con 97.5% de reducción en cache hits.'
  },
  database: {
    id: 'database',
    title: 'Base de Datos',
    description: 'Persistencia de métricas',
    details: 'MySQL/TiDB que almacena sesiones, mensajes, métricas calculadas y logs de auditoría. Permite análisis histórico y comparación temporal de estabilidad.'
  },
  audit: {
    id: 'audit',
    title: 'Cadena de Auditoría',
    description: 'Integridad inmutable',
    details: 'Sistema de blockchain simplificado con bloque génesis único (prevHash=null). Cada log incluye hash del log anterior, garantizando detección de manipulaciones. Estado: CLOSED_AND_OPERATIONAL.'
  },
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard & Visualizaciones',
    description: 'Observabilidad del sistema',
    details: 'Interfaces web para monitoreo en tiempo real: Core Dashboard (estado general), Experimento de Estabilidad (gráficas temporales), Comparación de Regímenes (análisis comparativo).'
  }
};

export default function SystemFlow() {
  const [, setLocation] = useLocation();
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Flujo de Datos del Sistema</h1>
          <p className="text-muted-foreground text-lg">
            Diagrama interactivo de la arquitectura ARESK-OBS
          </p>
        </div>

        {/* Diagrama SVG */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Arquitectura y Flujo de Datos</CardTitle>
            <CardDescription>
              Pasa el cursor sobre los componentes para ver detalles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <svg
                viewBox="0 0 1200 800"
                className="w-full h-auto"
                style={{ minHeight: '600px' }}
              >
                {/* Definiciones de gradientes y flechas */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3, 0 6"
                      fill="rgb(100, 116, 139)"
                    />
                  </marker>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(37, 99, 235)" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="greenGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(22, 163, 74)" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="amberGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="rgb(217, 119, 6)" stopOpacity="0.6" />
                  </linearGradient>
                </defs>

                {/* Flechas de flujo de datos */}
                <g stroke="rgb(100, 116, 139)" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)">
                  {/* Usuario → LLM */}
                  <path d="M 200 100 L 400 100" />
                  
                  {/* LLM → Semantic Bridge */}
                  <path d="M 500 100 L 600 200" />
                  
                  {/* Usuario → Semantic Bridge */}
                  <path d="M 200 100 L 600 200" strokeDasharray="5,5" opacity="0.6" />
                  
                  {/* Semantic Bridge → Embeddings */}
                  <path d="M 700 250 L 900 250" />
                  
                  {/* Embeddings → Caché */}
                  <path d="M 1000 250 L 1000 350" />
                  
                  {/* Caché → Embeddings (feedback) */}
                  <path d="M 980 350 L 980 270" strokeDasharray="5,5" opacity="0.4" />
                  
                  {/* Semantic Bridge → Database */}
                  <path d="M 650 300 L 650 450" />
                  
                  {/* Database → Audit */}
                  <path d="M 650 550 L 450 650" />
                  
                  {/* Database → Dashboard */}
                  <path d="M 650 550 L 850 650" />
                </g>

                {/* Componente: Usuario */}
                <g
                  onMouseEnter={() => setHoveredComponent('user')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x="100"
                    y="50"
                    width="100"
                    height="100"
                    rx="10"
                    fill="url(#blueGradient)"
                    stroke={hoveredComponent === 'user' ? 'rgb(59, 130, 246)' : 'rgb(71, 85, 105)'}
                    strokeWidth={hoveredComponent === 'user' ? '3' : '2'}
                  />
                  <text
                    x="150"
                    y="95"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    Usuario
                  </text>
                  <text
                    x="150"
                    y="115"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    Entrada
                  </text>
                </g>

                {/* Componente: LLM API */}
                <g
                  onMouseEnter={() => setHoveredComponent('llm')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x="400"
                    y="50"
                    width="100"
                    height="100"
                    rx="10"
                    fill="url(#purpleGradient)"
                    stroke={hoveredComponent === 'llm' ? 'rgb(168, 85, 247)' : 'rgb(71, 85, 105)'}
                    strokeWidth={hoveredComponent === 'llm' ? '3' : '2'}
                  />
                  <text
                    x="450"
                    y="95"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    LLM API
                  </text>
                  <text
                    x="450"
                    y="115"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    Generación
                  </text>
                </g>

                {/* Componente: Semantic Bridge */}
                <g
                  onMouseEnter={() => setHoveredComponent('semantic_bridge')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x="550"
                    y="200"
                    width="150"
                    height="100"
                    rx="10"
                    fill="url(#greenGradient)"
                    stroke={hoveredComponent === 'semantic_bridge' ? 'rgb(34, 197, 94)' : 'rgb(71, 85, 105)'}
                    strokeWidth={hoveredComponent === 'semantic_bridge' ? '3' : '2'}
                  />
                  <text
                    x="625"
                    y="240"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    Semantic Bridge
                  </text>
                  <text
                    x="625"
                    y="260"
                    textAnchor="middle"
                    fill="white"
                    fontSize="11"
                  >
                    CAELION
                  </text>
                  <text
                    x="625"
                    y="280"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    ε, Ω, V
                  </text>
                </g>

                {/* Componente: Embeddings */}
                <g
                  onMouseEnter={() => setHoveredComponent('embeddings')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x="900"
                    y="200"
                    width="100"
                    height="100"
                    rx="10"
                    fill="url(#amberGradient)"
                    stroke={hoveredComponent === 'embeddings' ? 'rgb(245, 158, 11)' : 'rgb(71, 85, 105)'}
                    strokeWidth={hoveredComponent === 'embeddings' ? '3' : '2'}
                  />
                  <text
                    x="950"
                    y="240"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    Embeddings
                  </text>
                  <text
                    x="950"
                    y="260"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    Vectorización
                  </text>
                </g>

                {/* Componente: Caché */}
                <g
                  onMouseEnter={() => setHoveredComponent('cache')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x="900"
                    y="350"
                    width="100"
                    height="100"
                    rx="10"
                    fill="url(#blueGradient)"
                    stroke={hoveredComponent === 'cache' ? 'rgb(59, 130, 246)' : 'rgb(71, 85, 105)'}
                    strokeWidth={hoveredComponent === 'cache' ? '3' : '2'}
                  />
                  <text
                    x="950"
                    y="390"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    Caché
                  </text>
                  <text
                    x="950"
                    y="410"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    Bucéfalo
                  </text>
                  <text
                    x="950"
                    y="425"
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                  >
                    ~50x faster
                  </text>
                </g>

                {/* Componente: Database */}
                <g
                  onMouseEnter={() => setHoveredComponent('database')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x="550"
                    y="450"
                    width="200"
                    height="100"
                    rx="10"
                    fill="url(#purpleGradient)"
                    stroke={hoveredComponent === 'database' ? 'rgb(168, 85, 247)' : 'rgb(71, 85, 105)'}
                    strokeWidth={hoveredComponent === 'database' ? '3' : '2'}
                  />
                  <text
                    x="650"
                    y="490"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    Base de Datos
                  </text>
                  <text
                    x="650"
                    y="510"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    MySQL/TiDB
                  </text>
                  <text
                    x="650"
                    y="530"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    Persistencia
                  </text>
                </g>

                {/* Componente: Audit */}
                <g
                  onMouseEnter={() => setHoveredComponent('audit')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x="300"
                    y="650"
                    width="150"
                    height="100"
                    rx="10"
                    fill="url(#greenGradient)"
                    stroke={hoveredComponent === 'audit' ? 'rgb(34, 197, 94)' : 'rgb(71, 85, 105)'}
                    strokeWidth={hoveredComponent === 'audit' ? '3' : '2'}
                  />
                  <text
                    x="375"
                    y="690"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    Auditoría
                  </text>
                  <text
                    x="375"
                    y="710"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    Blockchain
                  </text>
                  <text
                    x="375"
                    y="730"
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                  >
                    CLOSED
                  </text>
                </g>

                {/* Componente: Dashboard */}
                <g
                  onMouseEnter={() => setHoveredComponent('dashboard')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  className="cursor-pointer transition-all"
                >
                  <rect
                    x="750"
                    y="650"
                    width="150"
                    height="100"
                    rx="10"
                    fill="url(#amberGradient)"
                    stroke={hoveredComponent === 'dashboard' ? 'rgb(245, 158, 11)' : 'rgb(71, 85, 105)'}
                    strokeWidth={hoveredComponent === 'dashboard' ? '3' : '2'}
                  />
                  <text
                    x="825"
                    y="690"
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    Dashboard
                  </text>
                  <text
                    x="825"
                    y="710"
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                  >
                    Visualizaciones
                  </text>
                  <text
                    x="825"
                    y="730"
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                  >
                    Observabilidad
                  </text>
                </g>

                {/* Leyenda */}
                <g>
                  <text x="50" y="780" fill="rgb(156, 163, 175)" fontSize="12" fontWeight="bold">
                    Leyenda:
                  </text>
                  <line x1="120" y1="775" x2="180" y2="775" stroke="rgb(100, 116, 139)" strokeWidth="2" markerEnd="url(#arrowhead)" />
                  <text x="190" y="780" fill="rgb(156, 163, 175)" fontSize="11">
                    Flujo de datos
                  </text>
                  <line x1="300" y1="775" x2="360" y2="775" stroke="rgb(100, 116, 139)" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
                  <text x="370" y="780" fill="rgb(156, 163, 175)" fontSize="11">
                    Flujo secundario
                  </text>
                </g>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Detalles del componente seleccionado */}
        {hoveredComponent && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>{COMPONENTS[hoveredComponent].title}</CardTitle>
              <CardDescription>{COMPONENTS[hoveredComponent].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {COMPONENTS[hoveredComponent].details}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Descripción de componentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Object.values(COMPONENTS).map((component) => (
            <Card key={component.id} className="hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{component.title}</CardTitle>
                <CardDescription className="text-xs">{component.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{component.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
