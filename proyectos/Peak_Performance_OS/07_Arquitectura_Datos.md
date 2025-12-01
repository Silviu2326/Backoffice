# Módulo 7: Especificaciones Técnicas y Arquitectura de Datos

## 1. Arquitectura de Ingesta (Pattern Adapter)
Este es el núcleo de integración. Debemos abstraer las diferencias de cada API externa.

### Interface Adapter
```typescript
export interface WearableAdapter {
    providerName: string;
    authUrl: string;
    
    // Normaliza el dato crudo al formato interno
    fetchSleep(date: string, accessToken: string): Promise<StandardSleepData>;
    fetchReadiness(date: string, accessToken: string): Promise<StandardReadinessData>;
    
    // Webhook Handlers
    handleWebhook(payload: any): NormalizedEvent;
}
```

### Implementaciones
*   `OuraAdapter`: Mapea `readiness.score` -> `internal.score`.
*   `WhoopAdapter`: Mapea `recovery.score` -> `internal.score`.
*   `GarminAdapter`: Mapea `bodyBattery` -> `internal.score`.

## 2. Algoritmo de Normalización (PPS - Peak Performance Score)

Para hacer los datos comparables, usamos **Z-Scores Estandarizados**.

$$ Z = \frac{X - \mu}{\sigma} $$

Donde:
*   $X$ = Valor diario (ej. 80 HRV).
*   $\mu$ = Media móvil de 30 días del usuario.
*   $\sigma$ = Desviación estándar de 30 días.

**Transformación a Score 0-100:**
Usamos una función sigmoide (función logística) para mapear el Z-Score (que va de -3 a +3 típicamente) a un rango 0-100 amigable.

```typescript
function calculatePPS(rawHrv: number, userBaseline: BaselineStats): number {
    const zScore = (rawHrv - userBaseline.mean) / userBaseline.stdDev;
    // Sigmoide ajustada para que Z=0 (promedio) sea Score=50
    const score = 100 / (1 + Math.exp(-zScore)); 
    return Math.round(score);
}
```

## 3. Estrategia de Base de Datos & Colas

### Job Queue (BullMQ / Redis)
La ingesta de webhooks no debe procesar datos síncronamente.
1.  **Webhook Endpoint:** Recibe JSON -> Guarda en Redis -> Responde 200 OK inmediatamente.
2.  **Worker:**
    *   Lee de Redis.
    *   Llama al Adapter correspondiente.
    *   Calcula PPS.
    *   Guarda en Postgres.
    *   Actualiza Vistas Materializadas.
    *   Dispara eventos de Gamificación/Alertas.

## 4. Estructura de Archivos (Expandida)

```text
src/features/peak-performance/infrastructure/
├── adapters/
│   ├── baseAdapter.ts
│   ├── oura/
│   │   ├── ouraAdapter.ts
│   │   ├── ouraTypes.ts
│   │   └── ouraMapper.ts
│   ├── whoop/
│   │   └── ...
│   └── garmin/
│       └── ...
├── db/
│   ├── schema.sql              # Definiciones SQL
│   ├── migrations/             # Control de versiones DB
│   └── views/                  # Scripts de Vistas Materializadas
├── queues/
│   ├── ingestionQueue.ts       # Configuración BullMQ
│   └── processors/
│       ├── metricNormalizer.ts
│       └── alertTrigger.ts
├── api/
│   ├── webhookEndpoints.ts
│   └── adminEndpoints.ts
└── pages/
    └── DataSourcesStatusPage.tsx # Panel técnico de estado de APIs
```
