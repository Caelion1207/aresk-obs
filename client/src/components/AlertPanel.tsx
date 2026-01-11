import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, XCircle, Info, X } from "lucide-react";
import { Link } from "wouter";

export default function AlertPanel() {
  const utils = trpc.useUtils();
  const { data: alerts, isLoading } = trpc.alert.list.useQuery();
  const dismissMutation = trpc.alert.dismiss.useMutation({
    onSuccess: () => {
      utils.alert.list.invalidate();
    },
  });

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Crítico</Badge>;
      case "warning":
        return <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30">Advertencia</Badge>;
      case "info":
        return <Badge variant="secondary">Info</Badge>;
      default:
        return <Badge variant="secondary">{severity}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas Activas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Cargando alertas...</p>
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Alertas Activas</CardTitle>
          <CardDescription>No hay alertas de anomalías pendientes</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Las sesiones con rendimiento anómalo aparecerán aquí automáticamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas Activas</CardTitle>
        <CardDescription>{alerts.length} alerta{alerts.length !== 1 ? "s" : ""} de anomalías detectada{alerts.length !== 1 ? "s" : ""}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card/50"
          >
            <div className="mt-0.5">
              {getSeverityIcon(alert.severity)}
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{alert.title}</h4>
                    {getSeverityBadge(alert.severity)}
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  {alert.metricValue !== null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Valor: {alert.metricValue.toFixed(2)}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dismissMutation.mutate({ id: alert.id })}
                  disabled={dismissMutation.isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/replay/${alert.sessionId}`}>
                  <Button variant="outline" size="sm">
                    Ver Sesión
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground">
                  Sesión #{alert.sessionId}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
