import { useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, AlertTriangle, Shield, Gavel, Command } from 'lucide-react';

/**
 * ProtocolMonitor - Monitor de Protocolos CAELION
 * 
 * Visualiza eventos de protocolos COM-72, ETH-01 y CMD-01 en tiempo real.
 * 
 * IMPORTANTE: ETH-01 es un portero de intención, NO un IDS completo.
 * - Valida distancia a referencia ética (Bucéfalo)
 * - No es sistema de detección de intrusiones
 * - No es firewall semántico
 * - Solo verifica alineación con propósito declarado
 */
export function ProtocolMonitor({ sessionId }: { sessionId: number }) {
  // Obtener eventos de protocolos
  const { data: com72Events, refetch: refetchCom72 } = trpc.protocol.com72.getHistory.useQuery(
    { sessionId, limit: 10 },
    { refetchInterval: 5000 } // Auto-refresh cada 5 segundos
  );

  const { data: eth01Events, refetch: refetchEth01 } = trpc.protocol.eth01.getViolations.useQuery(
    { sessionId, limit: 10 },
    { refetchInterval: 5000 }
  );

  const { data: cmd01Events, refetch: refetchCmd01 } = trpc.protocol.cmd01.getHistory.useQuery(
    { sessionId, limit: 10 },
    { refetchInterval: 5000 }
  );

  // Función para obtener color según estado
  const getStatusColor = (status: 'PASS' | 'WARNING' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'FAIL':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  // Función para obtener icono según estado
  const getStatusIcon = (status: 'PASS' | 'WARNING' | 'FAIL') => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-4 h-4" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4" />;
      case 'FAIL':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Función para obtener badge de severidad
  const getSeverityBadge = (severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
    const colors = {
      LOW: 'bg-blue-500/20 text-blue-400',
      MEDIUM: 'bg-yellow-500/20 text-yellow-400',
      HIGH: 'bg-orange-500/20 text-orange-400',
      CRITICAL: 'bg-red-500/20 text-red-400'
    };
    return (
      <Badge variant="outline" className={`${colors[severity]} text-xs`}>
        {severity}
      </Badge>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* COM-72: Coherencia Observable */}
      <Card className="bg-void border-structure">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <CardTitle className="text-lg">COM-72</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Coherencia Observable - Últimos 10 eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {com72Events && com72Events.length > 0 ? (
              com72Events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded bg-black/20 border border-structure/50"
                >
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(event.status as 'PASS' | 'WARNING' | 'FAIL')}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs text-gray-400 truncate">
                        Ω={event.coherenceScore.toFixed(3)} V(e)={event.stabilityScore.toFixed(3)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.severity && getSeverityBadge(event.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(event.status as 'PASS' | 'WARNING' | 'FAIL')} text-xs`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay eventos COM-72 registrados
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ETH-01: Ética (Portero de Intención) */}
      <Card className="bg-void border-structure">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-purple-400" />
            <CardTitle className="text-lg">ETH-01</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Portero de Intención - Últimas 10 violaciones
          </CardDescription>
          <div className="mt-2 p-2 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-300">
            <strong>Nota:</strong> ETH-01 es portero de intención, NO un IDS completo. 
            Valida distancia a referencia ética (Bucéfalo), no es firewall semántico.
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {eth01Events && eth01Events.length > 0 ? (
              eth01Events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-2 rounded bg-black/20 border border-red-500/30"
                >
                  <div className="flex items-center gap-2 flex-1">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-xs text-gray-400 truncate">
                        Error Norm={event.ethicalScore.toFixed(3)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.severity && getSeverityBadge(event.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay violaciones éticas registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* CMD-01: Comando y Decisión */}
      <Card className="bg-void border-structure">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-amber-400" />
            <CardTitle className="text-lg">CMD-01</CardTitle>
          </div>
          <CardDescription className="text-xs">
            Comando y Decisión - Últimas 10 decisiones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cmd01Events && cmd01Events.length > 0 ? (
              cmd01Events.map((event) => {
                const eventData = event.eventData;
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-2 rounded bg-black/20 border border-structure/50"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <Command className="w-4 h-4 text-amber-400" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-xs text-gray-400 truncate">
                          {eventData.fromProfile} → {eventData.toProfile}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No hay decisiones CMD-01 registradas
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
