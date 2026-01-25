import { FileText, Download, BookOpen, FlaskConical, GitCompare, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface ResearchDocument {
  id: string;
  title: string;
  filename: string;
  category: string;
  description: string;
  size: string;
  icon: typeof FileText;
  color: string;
}

const documents: ResearchDocument[] = [
  {
    id: "fund",
    title: "Fundamentos de Ingeniería Cognitiva",
    filename: "Ingenieria_Cognitiva_Parte_1_Fundamentos.pdf",
    category: "Serie: Ingeniería Cognitiva",
    description: "Fundamentos teóricos de ingeniería cognitiva, bases matemáticas y conceptuales, introducción a sistemas cognitivos.",
    size: "299 KB",
    icon: Brain,
    color: "cyan"
  },
  {
    id: "ctrl",
    title: "Control en Sistemas Cognitivos",
    filename: "Ingenieria_Cognitiva_Parte_2_Control.pdf",
    category: "Serie: Ingeniería Cognitiva",
    description: "Teoría de control aplicada a sistemas cognitivos, control LQR y estabilidad, métricas de coste de control (Ω).",
    size: "286 KB",
    icon: Brain,
    color: "cyan"
  },
  {
    id: "sem",
    title: "Semántica y Entropía",
    filename: "Ingenieria_Cognitiva_Parte_3_Semantica.pdf",
    category: "Serie: Ingeniería Cognitiva",
    description: "Análisis semántico y entropía (ε), embeddings y distancias semánticas, coherencia y deriva semántica.",
    size: "281 KB",
    icon: Brain,
    color: "cyan"
  },
  {
    id: "arch",
    title: "Arquitecturas Cognitivas Avanzadas",
    filename: "Ingenieria_Cognitiva_Parte_4_Arquitecturas.pdf",
    category: "Serie: Ingeniería Cognitiva",
    description: "Arquitecturas cognitivas avanzadas, integración de componentes, implementación práctica.",
    size: "300 KB",
    icon: Brain,
    color: "cyan"
  },
  {
    id: "384d",
    title: "Análisis Matemático 384D",
    filename: "Analisis_Matematico_384D_CAELION.pdf",
    category: "Análisis Técnicos",
    description: "Análisis matemático completo del espacio 384D, embeddings y transformaciones, propiedades geométricas del espacio semántico.",
    size: "340 KB",
    icon: FlaskConical,
    color: "purple"
  },
  {
    id: "lqr",
    title: "Control LQR Óptimo en CAELION",
    filename: "Analisis_Control_LQR_CAELION.pdf",
    category: "Análisis Técnicos",
    description: "Control LQR óptimo en CAELION, ecuación de Riccati y ganancia K, estabilidad y convergencia.",
    size: "318 KB",
    icon: FlaskConical,
    color: "purple"
  },
  {
    id: "actr",
    title: "CAELION vs ACT-R/SOAR",
    filename: "Analisis_Comparativo_CAELION_vs_ACT-R_SOAR.pdf",
    category: "Análisis Comparativos",
    description: "Comparación con arquitecturas cognitivas clásicas (ACT-R, SOAR), ventajas y limitaciones de CAELION.",
    size: "307 KB",
    icon: GitCompare,
    color: "green"
  },
  {
    id: "ml",
    title: "CAELION vs Machine Learning",
    filename: "Analisis_Comparativo_Optimizacion_CAELION_vs_ML.pdf",
    category: "Análisis Comparativos",
    description: "Comparación con técnicas de Machine Learning, optimización vs. aprendizaje estadístico, control explícito vs. modelos implícitos.",
    size: "311 KB",
    icon: GitCompare,
    color: "green"
  }
];

const categoryColors: Record<string, string> = {
  "Serie: Ingeniería Cognitiva": "cyan",
  "Análisis Técnicos": "purple",
  "Análisis Comparativos": "green"
};

export default function ResearchPage() {
  const handleDownload = (filename: string) => {
    // Crear enlace de descarga
    const link = document.createElement('a');
    link.href = `/research/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg text-white">
      {/* Header con gradiente azul-púrpura */}
      <div className="border-b border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 to-purple-950/20 backdrop-blur-sm">
        <div className="container py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="w-8 h-8 text-cyan-400" />
                <h1 className="text-4xl font-bold text-white title-glow-cyan">
                  Documentación de Investigación
                </h1>
              </div>
              <p className="text-gray-400 text-lg">
                Fundamentos teóricos y científicos del framework CAELION y el sistema ARESK-OBS
              </p>
            </div>
            <Link href="/">
              <Button 
                variant="outline" 
                className="border-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-400"
              >
                ← Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container py-12">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Serie Principal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">4 partes</p>
              <p className="text-sm text-gray-400">Ingeniería Cognitiva completa</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-purple-500/30 hover-glow-purple">
            <CardHeader>
              <CardTitle className="text-purple-400 flex items-center gap-2">
                <FlaskConical className="w-5 h-5" />
                Análisis Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">2 documentos</p>
              <p className="text-sm text-gray-400">Matemática 384D y Control LQR</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-blue-purple border-green-500/30 hover-glow-cyan">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <GitCompare className="w-5 h-5" />
                Comparativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">2 análisis</p>
              <p className="text-sm text-gray-400">vs ACT-R/SOAR y ML</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de documentos */}
        <div className="space-y-6">
          {/* Agrupar por categoría */}
          {Object.entries(
            documents.reduce((acc, doc) => {
              if (!acc[doc.category]) acc[doc.category] = [];
              acc[doc.category].push(doc);
              return acc;
            }, {} as Record<string, ResearchDocument[]>)
          ).map(([category, docs]) => (
            <div key={category}>
              <h2 className={`text-2xl font-bold mb-4 text-${categoryColors[category]}-400`}>
                {category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {docs.map((doc) => {
                  const Icon = doc.icon;
                  return (
                    <Card 
                      key={doc.id}
                      className="bg-gradient-blue-purple border-cyan-500/30 hover-glow-cyan transition-all duration-300"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg bg-${doc.color}-500/20`}>
                              <Icon className={`w-6 h-6 text-${doc.color}-400`} />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-2">{doc.title}</CardTitle>
                              <Badge 
                                variant="outline" 
                                className={`border-${doc.color}-500/50 text-${doc.color}-400 text-xs`}
                              >
                                {doc.size}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-gray-400 mb-4">
                          {doc.description}
                        </CardDescription>
                        <Button
                          onClick={() => handleDownload(doc.filename)}
                          className={`w-full bg-${doc.color}-500/20 hover:bg-${doc.color}-500/30 border border-${doc.color}-500/50 text-${doc.color}-400`}
                          variant="outline"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Descargar PDF
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer informativo */}
        <Card className="mt-12 bg-gradient-blue-purple border-amber-500/30">
          <CardHeader>
            <CardTitle className="text-amber-400">Uso de la Documentación</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-400 space-y-2">
            <p>Esta documentación es fundamental para:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Entender los fundamentos teóricos del sistema ARESK-OBS</li>
              <li>Validar las métricas implementadas (ε, Ω, V)</li>
              <li>Comparar CAELION con otros enfoques</li>
              <li>Extender el sistema con nuevas funcionalidades</li>
              <li>Replicar experimentos y análisis</li>
            </ul>
            <div className="mt-4 pt-4 border-t border-amber-500/30">
              <p className="text-sm">
                <strong className="text-amber-400">Licencia:</strong> Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)
              </p>
              <p className="text-sm mt-1">
                <strong className="text-amber-400">Repositorio:</strong>{" "}
                <a 
                  href="https://github.com/Caelion1207/aresk-obs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  github.com/Caelion1207/aresk-obs
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
