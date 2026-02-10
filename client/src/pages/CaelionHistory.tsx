import { Link } from 'wouter';
import { Home, Clock, TrendingUp, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';

export default function CaelionHistory() {
  const { data: sessions, isLoading } = trpc.caelion.getSessions.useQuery();

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      abandoned: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };
    return colors[status as keyof typeof colors] || colors.abandoned;
  };

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
              Historial de Sesiones CAELION
            </h1>
            <p className="text-slate-400 mt-2">
              Registro completo de experimentos bajo gobernanza CAELION
            </p>
          </div>
          <Link href="/core">
            <Button>
              <Activity className="h-4 w-4 mr-2" />
              Nueva Sesión
            </Button>
          </Link>
        </div>

        {/* Sessions List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6 bg-slate-900/50 border-cyan-500/30">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        ) : sessions && sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map(session => (
              <Link key={session.id} href={`/caelion/session/${session.sessionId}`}>
                <Card className="p-6 bg-slate-900/50 border-cyan-500/30 hover:border-cyan-400/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(session.status)}`}>
                      {session.status === 'active' && 'Activa'}
                      {session.status === 'completed' && 'Completada'}
                      {session.status === 'abandoned' && 'Abandonada'}
                    </div>
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-400">Inicio</div>
                      <div className="text-sm text-slate-200">
                        {formatDate(session.startedAt)}
                      </div>
                    </div>

                    {session.completedAt && (
                      <div>
                        <div className="text-xs text-slate-400">Finalización</div>
                        <div className="text-sm text-slate-200">
                          {formatDate(session.completedAt)}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-700">
                      <div>
                        <div className="text-xs text-slate-400">Interacciones</div>
                        <div className="text-lg font-bold text-cyan-400">
                          {session.totalInteractions || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Intervenciones</div>
                        <div className="text-lg font-bold text-yellow-400">
                          {session.interventionCount || 0}
                        </div>
                      </div>
                    </div>

                    {session.avgOmega !== null && (
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700">
                        <div>
                          <div className="text-xs text-slate-400">Ω Prom</div>
                          <div className="text-sm font-medium text-cyan-400">
                            {session.avgOmega?.toFixed(3)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">V Prom</div>
                          <div className="text-sm font-medium text-green-400">
                            {session.avgV?.toFixed(4)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-400">RLD Prom</div>
                          <div className="text-sm font-medium text-purple-400">
                            {session.avgRLD?.toFixed(3)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs text-slate-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Ver detalles
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-12 bg-slate-900/50 border-cyan-500/30 text-center">
            <Activity className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400 mb-2">
              No hay sesiones registradas
            </h3>
            <p className="text-slate-500 mb-6">
              Inicia una nueva sesión CAELION para comenzar
            </p>
            <Link href="/core">
              <Button>
                <Activity className="h-4 w-4 mr-2" />
                Nueva Sesión
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
