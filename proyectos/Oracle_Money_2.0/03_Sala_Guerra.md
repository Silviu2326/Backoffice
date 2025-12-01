# Módulo 3: La Sala de Guerra (Black Swan Simulator)

## 1. Visión Técnica Profunda
Este módulo es un **Motor de Simulación Estocástica** corriendo en el cliente.
El desafío es el rendimiento: Calcular 30 años de flujo de caja mes a mes, aplicando N escenarios de estrés superpuestos, y renderizarlo a 60fps.

## 2. Arquitectura de Archivos Detallada

### 2.1 API Layer (`src/features/simulator/api/`)

#### `simulationDTOs.ts`
*   **Estructuras**:
    ```typescript
    export interface ShockScenario {
      id: string;
      type: 'INFLATION' | 'JOB_LOSS' | 'MARKET_CRASH' | 'UNEXPECTED_EXPENSE';
      params: Record<string, number>; // Ej: { durationMonths: 6, severity: 0.5 }
      active: boolean;
    }

    export interface MonthlyProjection {
      monthIndex: number; // 0 = Actualidad
      date: string;
      baselineBalance: number;
      simulatedBalance: number;
      isInsolvent: boolean;
    }
    ```

#### `projectionEngine.ts` (Core Logic)
*   **Clase `Projector`**:
    *   No usa React. Es una clase TypeScript pura para máxima velocidad.
    *   `calculate(initialState, scenarios[], years=30)`:
        *   Crea un `Float32Array` para los balances (más rápido que Arrays normales de objetos si son muchos datos).
        *   Itera `month = 0 to 360`:
            *   Aplica Ingresos Recurrentes.
            *   Resta Gastos Recurrentes.
            *   **Aplica Shocks Activos**:
                *   Si `Scenario.JOB_LOSS` está activo en este mes -> `Income = 0`.
                *   Si `Scenario.INFLATION` -> `Expenses *= (1 + rate/12)^month`.
    *   Retorna el dataset listo para el gráfico.
    *   **Memoización**: Usa un caché simple `LastParams -> LastResult`. Si los parámetros no cambian, devuelve el resultado anterior instantáneamente.

### 2.2 Components Layer (`src/features/simulator/components/`)

#### `RunwayChart.tsx`
*   **Optimización de Renderizado**:
    *   Si usamos `Recharts`, debemos simplificar la data. No pasar 3600 puntos (días), sino agrupar por meses (360 puntos).
    *   Usar `memo` de React para evitar re-renderizados si los props de data son idénticos referencialmente.
    *   **Zona de Peligro**: Usa un `<Gradient>` en el área bajo la curva. Si `value < 0`, el gradiente cambia a rojo sólido.

#### `ScenarioDraggable.tsx`
*   **Interacción**:
    *   Usa `dnd-kit`.
    *   Al comenzar el arrastre (DragStart), comunica al componente padre que se prepare para recalcular.
    *   Visualmente debe ser semitransparente mientras se arrastra.

#### `SimulationCanvas.tsx`
*   **Gestión de Estado**:
    *   Mantiene `activeScenarios: ShockScenario[]`.
    *   Usa `useMemo` para invocar `Projector.calculate()` cada vez que `activeScenarios` cambia.
    *   Esto asegura que el cálculo es reactivo pero eficiente.

#### `DefenseChecklist.tsx`
*   **Lógica Generativa**:
    *   Recibe el resultado de la simulación.
    *   Si `minBalance < 0` en el mes M:
        *   Genera tarea: "Crear fondo de emergencia de X cantidad antes del mes M".
    *   Si `inflationScenario` causa pérdidas > 20%:
        *   Genera tarea: "Reasignar efectivo a activos protegidos contra inflación".

### 2.3 Pages Layer (`src/features/simulator/pages/`)

#### `SimulatorPage.tsx`
*   **UX Flow**:
    *   Estado inicial: Gráfico limpio (Línea base).
    *   Acción usuario: Arrastra "Despido".
    *   Reacción inmediata: La línea cae dramáticamente. Aparece zona roja.
    *   Acción usuario: Arrastra "Vender Coche" (Escenario Mitigador).
    *   Reacción: La línea sube un escalón (inyección de liquidez), reduciendo la zona roja.

## 3. Testing Strategy
*   **Math Validation**: Tests unitarios para `Projector`.
    *   Caso: "Inflación 0%, Ingreso 100, Gasto 50". Verificar que en el mes 10 el saldo incrementó en 500.
    *   Caso: "Despido en mes 2 por 3 meses". Verificar Ingreso = 0 en meses 2, 3, 4.
