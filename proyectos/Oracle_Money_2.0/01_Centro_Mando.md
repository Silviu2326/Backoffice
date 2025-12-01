# Módulo 1: Centro de Mando "Zero-Click" (Dashboard)

## 1. Visión Técnica Profunda
El Dashboard funciona como un **Aggregator Pattern**. No posee datos propios, sino que orquesta datos de:
1.  `BankConnector` (Saldo Bruto)
2.  `BillingEngine` (Pasivos Inmediatos)
3.  `SafetyNet` (Configuración de Buffer)

El reto es la **Latencia Percibida Cero**. Usaremos `SWR` (Stale-While-Revalidate) para mostrar datos cacheados instantáneamente mientras se revalidan en segundo plano.

## 2. Arquitectura de Archivos Detallada

### 2.1 API Layer (`src/features/dashboard/api/`)

#### `dashboardDTOs.ts`
*   **Propósito**: Contrato estricto de datos.
*   **Código**:
    ```typescript
    export interface LiquiditySnapshot {
      rawBalance: number;       // Saldo bancario real
      currency: string;
      commitments: {
        bills: number;          // Suma de facturas próximas (7 días)
        savings: number;        // Barridos programados pendientes
        safetyBuffer: number;   // Configurado por usuario
      };
      safeToSpend: number;      // rawBalance - (bills + savings + safetyBuffer)
      lastUpdated: string;      // ISO Date
    }

    export interface PulseEvent {
      id: string;
      type: 'TRANSACTION' | 'AI_INTERVENTION' | 'SYSTEM_ALERT';
      actor: 'USER' | 'SYSTEM';
      amount?: number;
      metadata: Record<string, any>;
      timestamp: string;
    }
    ```

#### `dashboardService.ts`
*   **Responsabilidad**: Abstracción de Networking.
*   **Métodos**:
    *   `getSnapshot()`: `GET /api/v1/dashboard/snapshot`.
    *   `connectPulseStream(onEvent: (evt: PulseEvent) => void)`: Abre `new WebSocket('wss://api.../pulse')`. Maneja reconexión automática (Exponential Backoff) si se cae la red.

#### `useDashboardStore.ts` (Zustand)
*   **Responsabilidad**: Estado global de UI para el Dashboard.
*   **Estado**:
    *   `isBalanceHidden`: boolean (para modo privacidad).
    *   `selectedTimeframe`: 'day' | 'week' | 'month' (para el anillo de liquidez).
    *   `setBalanceHidden(bool)`: Acción.

### 2.2 Components Layer (`src/features/dashboard/components/`)

#### `SafeToSpendDisplay.tsx`
*   **Lógica de Negocio**:
    *   Recibe `snapshot: LiquiditySnapshot`.
    *   Si `snapshot.safeToSpend < 0`, cambia el tema visual a "Critical Red" y muestra una alerta: "Estás en descubierto técnico (aunque el banco diga que tienes dinero)".
    *   **Interacción**: Al hacer click, expande el desglose.
    *   **Animación**: Usa `react-spring` para interpolar el número desde 0 hasta el valor final al cargar.

#### `LiquidityRing.tsx`
*   **Lógica Geométrica**:
    *   Calcula `percentage = (currentSpend / safeToSpend) * 100`.
    *   Genera un SVG `<circle>` donde `strokeDasharray` depende de `percentage`.
    *   **Gradiente**: Si `percentage > 80%`, el color del trazo transiciona de Verde -> Naranja. Si `> 100%` -> Rojo.

#### `ActivityFeed.tsx`
*   **Optimización**:
    *   Implementa **Virtual Scrolling** si la lista tiene > 50 items.
    *   Escucha el WebSocket. Cuando llega un nuevo evento, lo inyecta al *principio* del array local sin recargar la página (`setEvents(prev => [newEvent, ...prev])`).

#### `FeedItem.tsx`
*   **Propiedades Inteligentes**:
    *   Props: `event: PulseEvent`.
    *   **Renderizado Condicional**:
        *   Si `event.type === 'AI_INTERVENTION'`, renderiza el componente `UndoActionControl` dentro de la tarjeta.
        *   Si `event.amount` es negativo, color rojo. Positivo, color verde.

#### `UndoActionControl.tsx`
*   **Lógica de Time-Travel**:
    *   Muestra un botón circular con un temporizador SVG (60s).
    *   Usa `setInterval` local para actualizar el progreso visual.
    *   Al hacer click: Llama a `dashboardService.revertAction(id)` y actualiza optimistamente la UI (elimina el item y devuelve el dinero al saldo visualmente).

### 2.3 Pages Layer (`src/features/dashboard/pages/`)

#### `DashboardPage.tsx`
*   **Estrategia de Carga**:
    *   Usa `React.Suspense` para mostrar un esqueleto (Skeleton UI) del anillo y el saldo mientras cargan los datos iniciales.
    *   Implementa un `ErrorBoundary` específico: Si falla la carga del Dashboard, muestra una pantalla de "Modo Offline" con los últimos datos conocidos (persistidos en localStorage).

## 3. Testing Strategy
*   **Unit Tests**: Verificar que `safeToSpend` se calcula correctamente (resta, no suma).
*   **Integration Tests**: Mockear el WebSocket y verificar que al recibir un evento, aparece en el Feed.
