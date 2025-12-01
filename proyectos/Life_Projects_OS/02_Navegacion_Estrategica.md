# Módulo 1: Navegación Estratégica ("Waze" para Objetivos)

## 1. Visión General Técnica
Este módulo es el cerebro matemático. Implementa un **Algoritmo de Ruta Crítica (CPM)** dinámico. A diferencia de un Gantt tradicional que es estático, este es "Líquido": las tareas flotan en el tiempo buscando su hueco óptimo basándose en restricciones de recursos (Dinero, Energía, Tiempo).

## 2. Modelos de Datos (Grafos)

```typescript
// Nodo del Grafo
interface GanttNode {
    id: string;
    duration: number; // Horas estimadas
    cost: number; // Costo financiero
    energyLoad: 'LOW' | 'MEDIUM' | 'HIGH';
    
    // Conexiones
    dependencies: string[]; // IDs de tareas que deben terminar antes
    dependents: string[];   // IDs de tareas que esperan a esta
    
    // Fechas (Calculadas)
    earlyStart: number; // Timestamp
    lateStart: number;
    slack: number; // Holgura (cuánto se puede retrasar sin afectar el final)
    
    // Estado
    isCritical: boolean; // True si slack == 0
    isLocked: boolean; // Si el usuario fijó la fecha manualmente
}
```

## 3. Arquitectura de Archivos y Especificación Funcional

### A. Motor de Cálculo (`src/features/life-projects/navigation/engine/`)

#### `wazeSolver.ts` (El Núcleo)
*   **Descripción:** Implementación del algoritmo CSP (Constraint Satisfaction Problem).
*   **Función:** `solveSchedule(nodes: GanttNode[], constraints: GlobalConstraints): ScheduleResult`
*   **Lógica Interna:**
    1.  **Topological Sort:** Ordena las tareas linealmente respetando dependencias.
    2.  **Forward Pass:** Calcula la fecha más temprana posible de inicio (`EarlyStart`) para cada tarea, verificando disponibilidad de recursos en cada día.
        *   *Check Dinero:* ¿Hay saldo proyectado en `Date X`? Si no, empujar `Date X + n`.
        *   *Check Energía:* ¿La carga acumulada en `Date X` supera el límite? Si sí, empujar.
    3.  **Backward Pass:** Calcula la fecha más tardía posible (`LateStart`) desde el Deadline final hacia atrás.
    4.  **Critical Path:** Identifica tareas donde `EarlyStart == LateStart`.

#### `conflictDetector.ts`
*   **Descripción:** Analiza el resultado del solver para encontrar problemas insolubles.
*   **Output:** Array de conflictos. Ej: `Type: 'MONEY_SHORTAGE'`, `Date: '2025-10-15'`, `Deficit: $500`.

### B. Hooks (`src/features/life-projects/navigation/hooks/`)

#### `useLiquidGantt.ts`
*   **Descripción:** Hook que conecta la UI con el Web Worker del solver.
*   **Funcionalidad:**
    *   Mantiene una copia local del grafo.
    *   Cuando el usuario arrastra una barra (`onTaskMove`), envía mensaje al Worker.
    *   Recibe el nuevo grafo calculado y actualiza las posiciones con `framer-motion` para suavidad.
    *   **Debounce:** Espera 300ms tras el movimiento del mouse para recalcular, evitando lag.

#### `useSimulation.ts`
*   **Descripción:** Gestiona el modo "What-If".
*   **Funcionalidad:**
    *   Permite aplicar modificadores temporales ("Add Sick Day", "Reduce Budget").
    *   Mantiene dos estados: `actualSchedule` y `simulatedSchedule`.
    *   Calcula el `diff` para mostrar visualmente qué cambió (barras fantasma).

### C. Componentes UI (`src/features/life-projects/navigation/components/`)

#### `Gantt/LiquidGanttChart.tsx`
*   **Descripción:** El canvas principal.
*   **Props:** `nodes`, `zoomLevel`, `onNodeClick`.
*   **Implementación:**
    *   Usa SVG para renderizar líneas de conexión (Curvas Bezier).
    *   Usa componentes HTML/Divs absolutos para las barras (mejor accesibilidad que Canvas puro).
    *   **Visuals:**
        *   Barras Azules: Tareas normales.
        *   Barras Rojas Neón (Pulsantes): Ruta crítica.
        *   Barras Grises: Tareas completadas.
        *   Líneas punteadas: Dependencias.

#### `Gantt/CriticalPathHighlighter.tsx`
*   **Descripción:** Capa visual que oscurece todo lo que NO es crítico.
*   **Uso:** Al presionar un botón "Focus Critical", el usuario ve solo la cadena de tareas vitales para cumplir la fecha límite.

#### `Alerts/ConflictResolutionModal.tsx`
*   **Descripción:** Modal de emergencia cuando el algoritmo falla.
*   **Interacción:** Presenta 3 tarjetas de opción:
    1.  **"Sacrificar":** Lista tareas de baja prioridad para borrar.
    2.  **"Extender":** Slider para mover la fecha final del proyecto.
    3.  **"Inyectar Recursos":** Input para añadir dinero extra manual.

### D. Utilidades (`src/features/life-projects/navigation/utils/`)

#### `dateMath.ts`
*   Helpers para manejo de tiempo laboral vs natural (ej. saltar fines de semana si está configurado).

#### `dependencyValidator.ts`
*   Función `checkForCycles(links)`: Evita que el usuario cree bucles infinitos (A depende de B, B depende de A) antes de lanzar el solver.

## 4. Endpoints API

*   `POST /api/v1/navigation/save-plan`
    *   Guarda el estado actual del grafo en la DB. Valida integridad referencial.
*   `GET /api/v1/navigation/simulation-templates`
    *   Retorna presets de escenarios comunes (ej. "Perdí mi empleo", "Me enfermé", "Recibí un bono").
