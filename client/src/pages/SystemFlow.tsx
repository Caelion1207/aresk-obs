import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, X } from 'lucide-react';
import { useLocation } from 'wouter';

interface ComponentInfo {
  id: string;
  title: string;
  description: string;
  details: string;
  technicalSpecs: {
    technology: string;
    performance: string;
    dependencies: string[];
    codeExample?: string;
  };
}

const COMPONENTS: Record<string, ComponentInfo> = {
  user: {
    id: 'user',
    title: 'Usuario',
    description: 'Entrada de mensajes',
    details: 'El usuario envía mensajes al sistema a través de la interfaz web. Estos mensajes son el punto de partida para el análisis de estabilidad cognitiva.',
    technicalSpecs: {
      technology: 'React 19 + TypeScript',
      performance: 'Tiempo de respuesta UI: <100ms',
      dependencies: ['wouter (routing)', 'shadcn/ui (components)', 'Tailwind CSS 4'],
      codeExample: `// Ejemplo de envío de mensaje
const { mutate } = trpc.chat.sendMessage.useMutation();

mutate({
  sessionId: "session-123",
  content: "¿Qué es la validación cruzada?"
});`
    }
  },
  llm: {
    id: 'llm',
    title: 'LLM API',
    description: 'Generación de respuestas',
    details: 'Modelo de lenguaje de gran escala que genera respuestas basadas en los mensajes del usuario. La respuesta es analizada por el sistema de métricas.',
    technicalSpecs: {
      technology: 'OpenAI-compatible API',
      performance: 'Latencia promedio: 1-3s por respuesta',
      dependencies: ['invokeLLM helper', 'BUILT_IN_FORGE_API_KEY'],
      codeExample: `// Ejemplo de llamada al LLM
import { invokeLLM } from "./server/_core/llm";

const response = await invokeLLM({
  messages: [
    { role: "system", content: "Eres un asistente útil." },
    { role: "user", content: userMessage }
  ]
});

const assistantResponse = response.choices[0].message.content;`
    }
  },
  semantic_bridge: {
    id: 'semantic_bridge',
    title: 'Semantic Bridge (CAELION)',
    description: 'Cálculo de métricas ε, Ω, V',
    details: 'Núcleo del sistema que implementa el protocolo CAELION. Calcula las tres métricas fundamentales: Entropía Semántica (ε), Coste de Control (Ω) y Exponente de Lyapunov (V).',
    technicalSpecs: {
      technology: 'TypeScript + Similitud Coseno',
      performance: 'Cálculo de métricas: ~50ms (con caché), ~1.5s (sin caché)',
      dependencies: ['Servicio de Embeddings', 'Caché de Bucéfalo'],
      codeExample: `// Ejemplo de cálculo de métricas
import { calculateMetricsExactCAELION } from "./server/semantic_bridge_exact";

const metrics = await calculateMetricsExactCAELION(
  userMessage,
  assistantResponse,
  "Bucéfalo" // Referencia ética
);

// Resultado:
// {
//   epsilon: 0.44,  // Entropía semántica
//   omega: 0.34,    // Coste de control
//   v: 0.66,        // Exponente de Lyapunov
//   timestamp: Date
// }`
    }
  },
  embeddings: {
    id: 'embeddings',
    title: 'Servicio de Embeddings',
    description: 'Vectorización semántica',
    details: 'Convierte texto en vectores de alta dimensionalidad que capturan significado semántico. Utilizado para calcular similitudes coseno entre mensajes, respuestas y referencia ética.',
    technicalSpecs: {
      technology: 'text-embedding-ada-002 (OpenAI)',
      performance: 'Generación de embedding: ~30ms por texto',
      dependencies: ['BUILT_IN_FORGE_API_KEY', 'fetch API'],
      codeExample: `// Ejemplo de generación de embedding
import { getEmbedding } from "./server/services/embeddings";

const embedding = await getEmbedding("Bucéfalo");
// Retorna: number[] (vector de 1536 dimensiones)

// Cálculo de similitud coseno
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}`
    }
  },
  cache: {
    id: 'cache',
    title: 'Caché de Embeddings',
    description: 'Optimización de latencia',
    details: 'Almacena en memoria el embedding de "Bucéfalo" (referencia ética) para reutilización. Reduce latencia de 30ms a 0.5ms (~50x más rápido) con 97.5% de reducción en cache hits.',
    technicalSpecs: {
      technology: 'Map<string, EmbeddingCache> en memoria',
      performance: 'Hit: 0.5ms | Miss: 30ms | Hit rate: 97.5%',
      dependencies: ['Servicio de Embeddings'],
      codeExample: `// Estructura de caché
interface EmbeddingCache {
  embedding: number[];
  timestamp: number;
  hits: number;
}

const embeddingCache = new Map<string, EmbeddingCache>();

// Precarga de Bucéfalo al iniciar servidor
export async function preloadBucefaloCache() {
  const embedding = await getEmbedding("Bucéfalo");
  embeddingCache.set("Bucéfalo", {
    embedding,
    timestamp: Date.now(),
    hits: 0
  });
}

// Estadísticas de caché
export function getCacheStats() {
  const bucefaloCacheEntry = embeddingCache.get("Bucéfalo");
  return {
    size: embeddingCache.size,
    bucefaloHits: bucefaloCacheEntry?.hits || 0,
    bucefaloTimestamp: bucefaloCacheEntry?.timestamp
  };
}`
    }
  },
  database: {
    id: 'database',
    title: 'Base de Datos',
    description: 'Persistencia de métricas',
    details: 'MySQL/TiDB que almacena sesiones, mensajes, métricas calculadas y logs de auditoría. Permite análisis histórico y comparación temporal de estabilidad.',
    technicalSpecs: {
      technology: 'MySQL 8.0 / TiDB + Drizzle ORM',
      performance: 'Query promedio: <50ms | Inserts: <20ms',
      dependencies: ['Drizzle ORM', 'DATABASE_URL env'],
      codeExample: `// Schema de métricas (Drizzle)
export const metrics = mysqlTable("metrics", {
  id: int("id").primaryKey().autoincrement(),
  messageId: int("message_id").notNull(),
  epsilon: double("epsilon").notNull(),
  omega: double("omega").notNull(),
  v: double("v").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});

// Inserción de métricas
await db.insert(metrics).values({
  messageId: message.id,
  epsilon: metricsResult.epsilon,
  omega: metricsResult.omega,
  v: metricsResult.v
});

// Query de métricas por sesión
const sessionMetrics = await db
  .select()
  .from(metrics)
  .innerJoin(messages, eq(metrics.messageId, messages.id))
  .where(eq(messages.sessionId, sessionId))
  .orderBy(metrics.timestamp);`
    }
  },
  audit: {
    id: 'audit',
    title: 'Cadena de Auditoría',
    description: 'Integridad inmutable',
    details: 'Sistema de blockchain simplificado con bloque génesis único (prevHash=null). Cada log incluye hash del log anterior, garantizando detección de manipulaciones. Estado: CLOSED_AND_OPERATIONAL.',
    technicalSpecs: {
      technology: 'SHA-256 hashing + MySQL',
      performance: 'Validación de cadena: <100ms para 1000 logs',
      dependencies: ['crypto (Node.js)', 'auditLogs table'],
      codeExample: `// Bloque génesis (axioma no validable)
const GENESIS_BLOCK = {
  log_id: 1,
  prevHash: null,
  type: "GENESIS",
  timestamp: "2026-01-23T00:00:00.000Z",
  payload: { message: "ARESK-OBS Audit Chain Initialized" },
  hash: "3e7f58adf15b6e5e9f846738b2c8956f0b95276671136ca3371b1dc59c0f0081"
};

// Creación de log de auditoría
async function createAuditLog(payload: any) {
  const lastLog = await getLastAuditLog();
  const prevHash = lastLog?.hash || null;
  
  const hash = createHash("sha256")
    .update(JSON.stringify({ prevHash, payload, timestamp: Date.now() }))
    .digest("hex");
  
  await db.insert(auditLogs).values({
    prevHash,
    hash,
    type: "STANDARD",
    payload: JSON.stringify(payload)
  });
}

// Validación de cadena
async function validateAuditChain(): Promise<boolean> {
  const logs = await db.select().from(auditLogs).orderBy(auditLogs.id);
  
  for (let i = 1; i < logs.length; i++) {
    if (logs[i].prevHash !== logs[i-1].hash) {
      return false; // Corrupción detectada
    }
  }
  
  return true;
}`
    }
  },
  dashboard: {
    id: 'dashboard',
    title: 'Dashboard & Visualizaciones',
    description: 'Observabilidad del sistema',
    details: 'Interfaces web para monitoreo en tiempo real: Core Dashboard (estado general), Experimento de Estabilidad (gráficas temporales), Comparación de Regímenes (análisis comparativo).',
    technicalSpecs: {
      technology: 'React 19 + Chart.js + tRPC',
      performance: 'Render de gráficas: <200ms | Auto-refresh: 5s',
      dependencies: ['Chart.js', 'react-chartjs-2', 'tRPC client'],
      codeExample: `// Ejemplo de gráfica con Chart.js
import { Line } from 'react-chartjs-2';

const data = {
  labels: Array.from({ length: 50 }, (_, i) => i + 1),
  datasets: [{
    label: 'Ω (Coste de Control)',
    data: metricsData.map(m => m.omega),
    borderColor: 'rgb(34, 197, 94)',
    tension: 0.1
  }]
};

const options = {
  responsive: true,
  plugins: {
    annotation: {
      annotations: {
        threshold: {
          type: 'line',
          yMin: 0.5,
          yMax: 0.5,
          borderColor: 'rgb(239, 68, 68)',
          borderWidth: 2,
          borderDash: [5, 5],
          label: {
            content: 'Umbral crítico',
            enabled: true
          }
        }
      }
    }
  }
};

<Line data={data} options={options} />`
    }
  }
};

export default function SystemFlow() {
  const [, setLocation] = useLocation();
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const handleComponentClick = (componentId: string) => {
    setSelectedComponent(componentId);
  };

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
            Diagrama interactivo de la arquitectura ARESK-OBS. Haz clic en los componentes para ver documentación técnica detallada.
          </p>
        </div>

        {/* Diagrama SVG */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Arquitectura y Flujo de Datos</CardTitle>
            <CardDescription>
              Pasa el cursor sobre los componentes para ver detalles. Haz clic para documentación técnica completa.
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
                  <path d="M 200 100 L 400 100" />
                  <path d="M 500 100 L 600 200" />
                  <path d="M 200 100 L 600 200" strokeDasharray="5,5" opacity="0.6" />
                  <path d="M 700 250 L 900 250" />
                  <path d="M 1000 250 L 1000 350" />
                  <path d="M 980 350 L 980 270" strokeDasharray="5,5" opacity="0.4" />
                  <path d="M 650 300 L 650 450" />
                  <path d="M 650 550 L 450 650" />
                  <path d="M 650 550 L 850 650" />
                </g>

                {/* Componentes (con onClick) */}
                {[
                  { id: 'user', x: 100, y: 50, w: 100, h: 100, gradient: 'blueGradient', label: 'Usuario', sublabel: 'Entrada' },
                  { id: 'llm', x: 400, y: 50, w: 100, h: 100, gradient: 'purpleGradient', label: 'LLM API', sublabel: 'Generación' },
                  { id: 'semantic_bridge', x: 550, y: 200, w: 150, h: 100, gradient: 'greenGradient', label: 'Semantic Bridge', sublabel: 'CAELION', sublabel2: 'ε, Ω, V' },
                  { id: 'embeddings', x: 900, y: 200, w: 100, h: 100, gradient: 'amberGradient', label: 'Embeddings', sublabel: 'Vectorización' },
                  { id: 'cache', x: 900, y: 350, w: 100, h: 100, gradient: 'blueGradient', label: 'Caché', sublabel: 'Bucéfalo', sublabel2: '~50x faster' },
                  { id: 'database', x: 550, y: 450, w: 200, h: 100, gradient: 'purpleGradient', label: 'Base de Datos', sublabel: 'MySQL/TiDB', sublabel2: 'Persistencia' },
                  { id: 'audit', x: 300, y: 650, w: 150, h: 100, gradient: 'greenGradient', label: 'Auditoría', sublabel: 'Blockchain', sublabel2: 'CLOSED' },
                  { id: 'dashboard', x: 750, y: 650, w: 150, h: 100, gradient: 'amberGradient', label: 'Dashboard', sublabel: 'Visualizaciones', sublabel2: 'Observabilidad' }
                ].map((comp) => (
                  <g
                    key={comp.id}
                    onMouseEnter={() => setHoveredComponent(comp.id)}
                    onMouseLeave={() => setHoveredComponent(null)}
                    onClick={() => handleComponentClick(comp.id)}
                    className="cursor-pointer transition-all"
                  >
                    <rect
                      x={comp.x}
                      y={comp.y}
                      width={comp.w}
                      height={comp.h}
                      rx="10"
                      fill={`url(#${comp.gradient})`}
                      stroke={hoveredComponent === comp.id ? 'rgb(59, 130, 246)' : 'rgb(71, 85, 105)'}
                      strokeWidth={hoveredComponent === comp.id ? '3' : '2'}
                    />
                    <text
                      x={comp.x + comp.w / 2}
                      y={comp.y + (comp.sublabel2 ? 40 : 45)}
                      textAnchor="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {comp.label}
                    </text>
                    <text
                      x={comp.x + comp.w / 2}
                      y={comp.y + (comp.sublabel2 ? 60 : 65)}
                      textAnchor="middle"
                      fill="white"
                      fontSize="10"
                    >
                      {comp.sublabel}
                    </text>
                    {comp.sublabel2 && (
                      <text
                        x={comp.x + comp.w / 2}
                        y={comp.y + 80}
                        textAnchor="middle"
                        fill="white"
                        fontSize={comp.id === 'semantic_bridge' ? '10' : '9'}
                      >
                        {comp.sublabel2}
                      </text>
                    )}
                  </g>
                ))}

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

        {/* Detalles del componente seleccionado (hover) */}
        {hoveredComponent && !selectedComponent && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>{COMPONENTS[hoveredComponent].title}</CardTitle>
              <CardDescription>{COMPONENTS[hoveredComponent].description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {COMPONENTS[hoveredComponent].details}
              </p>
              <p className="text-xs text-muted-foreground mt-2 italic">
                Haz clic para ver documentación técnica completa
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal de documentación técnica */}
        <Dialog open={!!selectedComponent} onOpenChange={() => setSelectedComponent(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            {selectedComponent && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl">{COMPONENTS[selectedComponent].title}</DialogTitle>
                  <DialogDescription className="text-base">
                    {COMPONENTS[selectedComponent].description}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Descripción general */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Descripción General</h3>
                    <p className="text-sm text-muted-foreground">
                      {COMPONENTS[selectedComponent].details}
                    </p>
                  </div>

                  {/* Especificaciones técnicas */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Especificaciones Técnicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Tecnología</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm font-mono">{COMPONENTS[selectedComponent].technicalSpecs.technology}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">Rendimiento</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{COMPONENTS[selectedComponent].technicalSpecs.performance}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Dependencias */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Dependencias</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {COMPONENTS[selectedComponent].technicalSpecs.dependencies.map((dep, idx) => (
                        <li key={idx} className="text-sm text-muted-foreground font-mono">{dep}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Ejemplo de código */}
                  {COMPONENTS[selectedComponent].technicalSpecs.codeExample && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ejemplo de Código</h3>
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{COMPONENTS[selectedComponent].technicalSpecs.codeExample}</code>
                      </pre>
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button onClick={() => setSelectedComponent(null)}>
                    Cerrar
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Descripción de componentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {Object.values(COMPONENTS).map((component) => (
            <Card 
              key={component.id} 
              className="hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => handleComponentClick(component.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{component.title}</CardTitle>
                <CardDescription className="text-xs">{component.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{component.details}</p>
                <p className="text-xs text-primary mt-2">Haz clic para ver documentación técnica →</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
