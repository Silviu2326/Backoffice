# Módulo 2: El Tablero Biológico del Empleado (Interfaz B2C)

## 1. Visión General Técnica
Este módulo requiere un manejo eficiente del estado local (Local Storage / IndexedDB) para funcionar incluso con conectividad intermitente. La lógica matemática de los ritmos circadianos es compleja y debe desacoplarse de la UI.

## 2. Algoritmos Core (Math & Physics)

### 2.1. Modelo Circadiano (Borchbély’s Two-Process Model)
Implementaremos una aproximación simplificada del Modelo de dos procesos de regulación del sueño:
*   **Proceso S (Presión de Sueño):** Crece exponencialmente durante la vigilia.
*   **Proceso C (Ritmo Circadiano):** Oscilación sinusoidal basada en el cronotipo.

```typescript
/**
 * Calcula el nivel de energía cognitiva (0-100) para una hora dada.
 * @param hoursAwake Horas desde el despertar
 * @param circadianPhase Offset basado en hora de despertar habitual (dlmo)
 */
function calculateCognitiveCapacity(hoursAwake: number, circadianPhase: number): number {
    // Proceso S (Homeostático) - Decay
    const processS = 100 * Math.exp(-0.04 * hoursAwake); 
    
    // Proceso C (Circadiano) - Sinusoide
    // Pico natural aprox a las 14:00 y 19:00, Valle a las 04:00 y 15:00
    const timeOfDay = (Date.now() + circadianPhase) % 24;
    const processC = 15 * Math.sin((2 * Math.PI / 24) * (timeOfDay - 14));

    return normalize(processS + processC);
}
```

### 2.2. Cálculo de Deuda de Sueño Ponderada
No todas las noches valen lo mismo. Las noches recientes pesan más.
`SleepDebt = ∑ ( (Need - Actual) * Weight_Day_N )`
*   Día 1 (Ayer): Peso 1.0
*   Día 2: Peso 0.8
*   ...
*   Día 14: Peso 0.1

## 3. Estrategia de UX/UI y Visualización

### Gráficos (Librería recomendada: Visx o Recharts)
*   **Energy Horizon:** Debe ser un `AreaChart` con gradiente (`SVG LinearGradient`).
    *   Eje X: Tiempo (Now -> +16h).
    *   Eje Y: Capacidad Cognitiva.
    *   Overlay: Bloques rectangulares semi-transparentes representando reuniones.
    *   Interacción: Tooltip al pasar por un bloque: "Reunión en Valle de Energía (-20% Performance)".

### Almacenamiento Local (Offline First)
*   Usar `TanStack Query` (React Query) con `persistQueryClient`.
*   Guardar los últimos 30 días de métricas en `localStorage` para carga instantánea.

## 4. Endpoints y Estructura de Datos JSON

### `GET /api/v1/biometrics/dashboard-snapshot`
Respuesta optimizada para carga única (reducción de RTT):
```json
{
  "status": "success",
  "data": {
    "current_energy": 78,
    "current_phase": "ULTRADIAN_HIGH",
    "sleep_debt_minutes": 145,
    "next_peak": "10:30",
    "next_dip": "14:15",
    "anomalies": [
      {
        "type": "ELEVATED_TEMP",
        "severity": "LOW",
        "message": "Ligera elevación de temperatura (+0.4°C). Hidrátate bien."
      }
    ]
  }
}
```

## 5. Integración con Wearables (Client-Side)
Para wearables que permiten lectura directa por Bluetooth (poco común en web, pero posible vía Web Bluetooth API para algunos dispositivos) o integración App-to-App.
*   La estrategia principal será **Server-Side Polling** (ver Módulo 7), pero el cliente debe tener un botón "Sincronizar Ahora" que fuerce el webhook.

## 6. Plan de Pruebas

*   **Unit Tests:** Validar la función `calculateCognitiveCapacity` contra casos conocidos (ej. 24h sin dormir debe dar capacidad < 10%).
*   **Component Tests:** Renderizar el `EnergyHorizonChart` con mock data y verificar que las zonas rojas se pintan correctamente.

## 7. Estructura de Archivos (Expandida)

```text
src/features/peak-performance/employee-dashboard/
├── algorithms/
│   ├── circadianModel.ts       # Lógica matemática pura
│   └── sleepDebtCalculator.ts
├── api/
│   └── dashboardService.ts
├── components/
│   ├── Battery/
│   │   ├── EnergyGauge.tsx     # SVG Customizado
│   │   └── ChargingState.tsx   # Animación de carga
│   ├── Scheduler/
│   │   ├── TimelineCanvas.tsx  # Gráfico complejo
│   │   ├── EventOverlay.tsx    # Bloques de reuniones
│   │   └── TimeCursor.tsx      # Línea de "Ahora"
│   ├── Insights/
│   │   ├── ActionableTipCard.tsx
│   │   └── DailyScorecard.tsx
├── hooks/
│   ├── useBiometricCache.ts    # React Query persistence logic
│   └── useEnergyProjection.ts  # Hook que devuelve array de puntos [hora, valor]
└── pages/
    └── EmployeeDashboardPage.tsx
```
