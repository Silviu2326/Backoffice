import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { AlertCircle, Clock, AlertTriangle } from 'lucide-react';

const alerts = [
  { id: 'ORD-9921', issue: 'Pago Pendiente > 24h', time: 'Hace 2h', severity: 'high' },
  { id: 'ORD-9918', issue: 'Envío Retrasado', time: 'Hace 5h', severity: 'medium' },
  { id: 'ORD-9855', issue: 'Disputa Abierta', time: 'Hace 1d', severity: 'critical' },
  { id: 'ORD-9842', issue: 'Stock Insuficiente', time: 'Hace 1d', severity: 'high' },
];

export function OrderAlertsWidget() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Alertas de Pedidos
        </CardTitle>
        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  alert.severity === 'critical' ? 'bg-red-500/20 text-red-500' :
                  alert.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                  'bg-yellow-500/20 text-yellow-500'
                }`}>
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{alert.id}</p>
                  <p className="text-xs text-text-muted">{alert.issue}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock className="h-3 w-3" />
                {alert.time}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
