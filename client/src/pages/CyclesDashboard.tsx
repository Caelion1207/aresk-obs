import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Activity, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type CycleStatus = 'INIT' | 'EXECUTION' | 'REVIEW' | 'CLOSED' | 'FAILED';

const STATUS_CONFIG: Record<CycleStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: any }> = {
  INIT: { label: 'Inicialización', variant: 'secondary', icon: Clock },
  EXECUTION: { label: 'Ejecución', variant: 'default', icon: Activity },
  REVIEW: { label: 'Revisión', variant: 'outline', icon: AlertTriangle },
  CLOSED: { label: 'Cerrado', variant: 'secondary', icon: CheckCircle2 },
  FAILED: { label: 'Fallido', variant: 'destructive', icon: XCircle },
};

export function CyclesDashboard() {
  const { data: cycles, isLoading, refetch } = trpc.cycles.list.useQuery();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar tiempo cada segundo para countdown en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTimeRemaining = (scheduledEndAt: Date) => {
    const end = new Date(scheduledEndAt);
    const diff = end.getTime() - currentTime.getTime();
    
    if (diff <= 0) return { expired: true, text: 'Expirado', color: 'text-red-500' };
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours < 24) {
      return { 
        expired: false, 
        text: `${hours}h ${minutes}m ${seconds}s`, 
        color: hours < 6 ? 'text-orange-500' : 'text-green-500' 
      };
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return { 
      expired: false, 
      text: `${days}d ${remainingHours}h`, 
      color: 'text-green-500' 
    };
  };

  const getValidTransitions = (status: CycleStatus): CycleStatus[] => {
    const transitions: Record<CycleStatus, CycleStatus[]> = {
      'INIT': ['EXECUTION'],
      'EXECUTION': ['REVIEW', 'FAILED'],
      'REVIEW': ['CLOSED', 'EXECUTION'],
      'CLOSED': [],
      'FAILED': [],
    };
    return transitions[status] || [];
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Cargando ciclos...</div>
        </div>
      </div>
    );
  }

  const activeCycles = cycles?.filter(c => 
    c.status !== 'CLOSED' && 
    c.status !== 'FAILED' && 
    new Date(c.scheduledEndAt) > currentTime
  ) || [];
  
  const completedCycles = cycles?.filter(c => 
    c.status === 'CLOSED' || 
    c.status === 'FAILED' ||
    new Date(c.scheduledEndAt) <= currentTime
  ) || [];

  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Ciclos COM-72</h1>
        <p className="text-muted-foreground">
          Monitoreo de ciclos activos y gestión de estados del sistema
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ciclos Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeCycles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Ejecución</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeCycles.filter(c => c.status === 'EXECUTION').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {activeCycles.filter(c => c.status === 'REVIEW').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedCycles.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ciclos Activos */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Ciclos Activos</h2>
        {activeCycles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No hay ciclos activos en este momento
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {activeCycles.map((cycle) => {
              const StatusIcon = STATUS_CONFIG[cycle.status as CycleStatus].icon;
              const timeRemaining = getTimeRemaining(cycle.scheduledEndAt);
              const validTransitions = getValidTransitions(cycle.status as CycleStatus);
              
              return (
                <Card key={cycle.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">Ciclo #{cycle.id}</CardTitle>
                          <Badge variant={STATUS_CONFIG[cycle.status as CycleStatus].variant}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {STATUS_CONFIG[cycle.status as CycleStatus].label}
                          </Badge>
                          <Badge variant="outline">{cycle.protocolId}</Badge>
                        </div>
                        <CardDescription>{cycle.objective}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Tiempo restante</div>
                        <div className={`text-xl font-mono font-bold ${timeRemaining.color}`}>
                          {timeRemaining.text}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Iniciado:</span>
                        <div className="font-medium">
                          {formatDistanceToNow(new Date(cycle.startedAt), { addSuffix: true, locale: es })}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expira:</span>
                        <div className="font-medium">
                          {new Date(cycle.scheduledEndAt).toLocaleString('es', { 
                            dateStyle: 'short', 
                            timeStyle: 'short' 
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Disparador:</span>
                        <div className="font-medium">{cycle.triggerType}</div>
                      </div>
                      {validTransitions.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">Transiciones válidas:</span>
                          <div className="flex gap-1 mt-1">
                            {validTransitions.map(t => (
                              <Badge key={t} variant="outline" className="text-xs">
                                {STATUS_CONFIG[t].label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Ciclos Completados */}
      {completedCycles.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Ciclos Completados</h2>
          <div className="space-y-3">
            {completedCycles.slice(0, 5).map((cycle) => {
              const StatusIcon = STATUS_CONFIG[cycle.status as CycleStatus].icon;
              
              return (
                <Card key={cycle.id} className="opacity-75">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={STATUS_CONFIG[cycle.status as CycleStatus].variant}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {STATUS_CONFIG[cycle.status as CycleStatus].label}
                        </Badge>
                        <div>
                          <div className="font-medium">Ciclo #{cycle.id}</div>
                          <div className="text-sm text-muted-foreground">{cycle.objective}</div>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {cycle.closedAt 
                          ? formatDistanceToNow(new Date(cycle.closedAt), { addSuffix: true, locale: es })
                          : 'Expirado'
                        }
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
