import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { Home, Send, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
} from 'chart.js';
import { Line, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ScatterController
);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metrics?: {
    omegaSem: number;
    hDiv: number;
    vLyapunov: number;
    epsilonEff: number;
    caelionIntervention: boolean;
  };
}

export default function CoreDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = trpc.caelion.sendMessage.useMutation({
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        metrics: data.metrics
      }]);
      
      if (data.metrics.caelionIntervention) {
        toast.info('🛡️ LICURGO intervino para estabilizar el sistema');
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const resetSessionMutation = trpc.caelion.resetSession.useMutation({
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages([]);
      toast.success('Nueva sesión iniciada bajo gobernanza CAELION');
    }
  });

  useEffect(() => {
    // Inicializar sesión al cargar
    resetSessionMutation.mutate();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !sessionId) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    
    sendMessageMutation.mutate({
      sessionId,
      message: input
    });
    
    setInput('');
  };

  const handleReset = () => {
    resetSessionMutation.mutate();
  };

  // Extraer datos para gráficas
  const interactionNumbers = messages
    .filter(m => m.metrics)
    .map((_, i) => i + 1);
  
  const omegaData = messages
    .filter(m => m.metrics)
    .map(m => m.metrics!.omegaSem);
  
  const vData = messages
    .filter(m => m.metrics)
    .map(m => m.metrics!.vLyapunov);
  
  const rldData = messages
    .filter(m => m.metrics)
    .map(m => {
      const omega = m.metrics!.omegaSem;
      const h = m.metrics!.hDiv;
      return Math.max(0, Math.min(1, omega - h));
    });

  const phasePortraitData = messages
    .filter(m => m.metrics)
    .map(m => ({
      x: m.metrics!.omegaSem,
      y: m.metrics!.hDiv,
      intervention: m.metrics!.caelionIntervention
    }));

  const viablePoints = phasePortraitData.filter(p => !p.intervention);
  const interventionPoints = phasePortraitData.filter(p => p.intervention);

  const interactionCount = messages.filter(m => m.metrics).length;
  const maxInteractions = 50;

  return (
    <div className="min-h-screen bg-gradient-deep-blue particles-bg">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <Home className="h-4 w-4 mr-2" />
                Volver al inicio
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-cyan-400 glow-text">
              Core Dashboard | CAELION Live
            </h1>
            <p className="text-slate-400 mt-2">
              Simulador en vivo de LLM bajo gobernanza CAELION
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">
              {interactionCount} / {maxInteractions}
            </div>
            <div className="text-sm text-slate-400">Interacciones</div>
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={resetSessionMutation.isPending}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Métricas en tiempo real */}
        {messages.length > 0 && messages[messages.length - 1].metrics && (
          <div className="grid grid-cols-4 gap-4">
            <Card className="p-4 bg-slate-900/50 border-cyan-500/30">
              <div className="text-sm text-slate-400">Coherencia Ω</div>
              <div className="text-2xl font-bold text-cyan-400">
                {messages[messages.length - 1].metrics!.omegaSem.toFixed(4)}
              </div>
            </Card>
            <Card className="p-4 bg-slate-900/50 border-green-500/30">
              <div className="text-sm text-slate-400">Lyapunov V</div>
              <div className="text-2xl font-bold text-green-400">
                {messages[messages.length - 1].metrics!.vLyapunov.toFixed(4)}
              </div>
            </Card>
            <Card className="p-4 bg-slate-900/50 border-purple-500/30">
              <div className="text-sm text-slate-400">Eficiencia ε</div>
              <div className="text-2xl font-bold text-purple-400">
                {messages[messages.length - 1].metrics!.epsilonEff.toFixed(4)}
              </div>
            </Card>
            <Card className="p-4 bg-slate-900/50 border-orange-500/30">
              <div className="text-sm text-slate-400">Divergencia H</div>
              <div className="text-2xl font-bold text-orange-400">
                {messages[messages.length - 1].metrics!.hDiv.toFixed(4)}
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Interface */}
          <Card className="p-6 bg-slate-900/50 border-cyan-500/30">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">
              Chat con CAELION
            </h2>
            <div className="h-[400px] overflow-y-auto mb-4 space-y-3 p-4 bg-slate-950/50 rounded">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded ${
                    msg.role === 'user'
                      ? 'bg-cyan-900/30 ml-8'
                      : 'bg-slate-800/50 mr-8'
                  }`}
                >
                  <div className="text-xs text-slate-400 mb-1">
                    {msg.role === 'user' ? 'Usuario' : 'CAELION'}
                    {msg.metrics?.caelionIntervention && ' 🛡️'}
                  </div>
                  <div className="text-slate-200">{msg.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu mensaje..."
                disabled={sendMessageMutation.isPending || interactionCount >= maxInteractions}
                className="bg-slate-950/50 border-cyan-500/30"
              />
              <Button
                onClick={handleSend}
                disabled={sendMessageMutation.isPending || interactionCount >= maxInteractions}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {interactionCount >= maxInteractions && (
              <div className="mt-2 text-center text-yellow-400 text-sm">
                Límite de 50 interacciones alcanzado. Usa Reset para comenzar de nuevo.
              </div>
            )}
          </Card>

          {/* Phase Portrait */}
          <Card className="p-6 bg-slate-900/50 border-cyan-500/30">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">
              Phase Portrait (H vs Ω)
            </h2>
            {phasePortraitData.length > 0 ? (
              <Scatter
                data={{
                  datasets: [
                    {
                      label: 'Trayectoria Viable',
                      data: viablePoints,
                      backgroundColor: 'rgba(34, 197, 94, 0.6)',
                      pointRadius: 6
                    },
                    {
                      label: 'Intervención LICURGO',
                      data: interventionPoints,
                      backgroundColor: 'rgba(251, 191, 36, 0.8)',
                      pointRadius: 8,
                      pointStyle: 'triangle'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: { display: true, text: 'Ω (Coherencia)', color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' }
                    },
                    y: {
                      title: { display: true, text: 'H (Divergencia)', color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' }
                    }
                  },
                  plugins: {
                    legend: { display: true, labels: { color: '#94a3b8' } }
                  }
                }}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                Esperando interacciones...
              </div>
            )}
          </Card>

          {/* Lyapunov V(t) */}
          <Card className="p-6 bg-slate-900/50 border-green-500/30">
            <h2 className="text-xl font-bold text-green-400 mb-4">
              Lyapunov V(t)
            </h2>
            {vData.length > 0 ? (
              <Line
                data={{
                  labels: interactionNumbers,
                  datasets: [
                    {
                      label: 'V(t) - Energía de Error',
                      data: vData,
                      borderColor: 'rgba(34, 197, 94, 0.8)',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      tension: 0.3
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: { display: true, text: 'Interacción', color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' }
                    },
                    y: {
                      title: { display: true, text: 'V (Lyapunov)', color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' }
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                Esperando interacciones...
              </div>
            )}
          </Card>

          {/* RLD(t) */}
          <Card className="p-6 bg-slate-900/50 border-purple-500/30">
            <h2 className="text-xl font-bold text-purple-400 mb-4">
              RLD(t) - Margen Viable
            </h2>
            {rldData.length > 0 ? (
              <Line
                data={{
                  labels: interactionNumbers,
                  datasets: [
                    {
                      label: 'RLD - Reserva de Legitimidad Dinámica',
                      data: rldData,
                      borderColor: 'rgba(168, 85, 247, 0.8)',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      tension: 0.3
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      title: { display: true, text: 'Interacción', color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' }
                    },
                    y: {
                      title: { display: true, text: 'RLD (Margen Viable)', color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' },
                      ticks: { color: '#94a3b8' },
                      min: 0,
                      max: 1
                    }
                  },
                  plugins: {
                    legend: { display: false }
                  }
                }}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-400">
                Esperando interacciones...
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
