import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { AlertCircle, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { getOrderAlerts, OrderAlert } from '../../features/dashboard/api/dashboardService';

export function OrderAlertsWidget() {
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setIsLoading(true);
        const orderAlerts = await getOrderAlerts();
        setAlerts(orderAlerts);
      } catch (error) {
        console.error('Error loading order alerts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAlerts();
    // Recargar alertas cada 5 minutos
    const interval = setInterval(loadAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand-orange" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <p>No hay alertas pendientes</p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
