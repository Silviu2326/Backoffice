# Módulo 2: Configuración del Motor (Self-Driving Money)

## 1. Visión Técnica Profunda
El motor se basa en el patrón **Directed Acyclic Graph (DAG)**. El usuario construye visualmente un grafo que el backend transpila a código ejecutable.
El frontend debe ser extremadamente robusto validando la lógica: **No permitir guardar una configuración que cree bucles infinitos de dinero.**

## 2. Arquitectura de Archivos Detallada

### 2.1 API Layer (`src/features/engine/api/`)

#### `engineDTOs.ts`
*   **Definición del Grafo**:
    ```typescript
    export type NodeType = 'SOURCE_BANK' | 'FILTER_LOGIC' | 'SPLITTER' | 'SINK_WALLET' | 'SINK_INVESTMENT';

    export interface NodeData {
      label: string;
      config: Record<string, any>; // Ej: { threshold: 2000, percentage: 50 }
    }

    export interface PipelineGraph {
      nodes: Array<{ id: string; type: NodeType; position: {x: number, y: number}; data: NodeData }>;
      edges: Array<{ id: string; source: string; target: string }>;
    }
    ```

#### `graphValidator.ts` (Utilidad Pura)
*   **Algoritmo de Detección de Ciclos**:
    *   Implementa una búsqueda en profundidad (DFS) para detectar "Back Edges".
    *   Si detecta que el Nodo A conecta con B, y B conecta con A -> **Error Crítico**.
    *   Valida "Orphans": Todo nodo debe estar conectado eventualmente a un `SOURCE` y un `SINK`.

#### `vrpService.ts`
*   **Seguridad**:
    *   Maneja los tokens de "Consentimiento de Larga Duración" (90 días) de Open Banking.
    *   Renovación: Si un token expira, la API devuelve `403`. Este servicio debe interceptarlo y disparar el flujo de re-autenticación OAuth.

### 2.2 Components Layer (`src/features/engine/components/`)

#### `PipelineCanvas.tsx`
*   **Tecnología**: `React Flow` (Librería estándar de industria).
*   **Configuración**:
    *   `nodeTypes`: Mapa de componentes personalizados (`{ source: SourceNode, filter: FilterNode ... }`).
    *   `onConnect`: Callback que invoca `graphValidator` antes de permitir la conexión visual. Si es inválida, la línea se pone roja y rebota.

#### `NodeTypes/FilterNode.tsx`
*   **UI Compleja**:
    *   Dentro del nodo, renderiza mini-inputs.
    *   Ejemplo: `[Dropdown: "Saldo"] [Operator: ">"] [Input: "2000"]`.
    *   **Estado Local**: Al cambiar un valor, actualiza el objeto global del grafo mediante un `useGraphStore` (Zustand).

#### `NodeTypes/SplitterNode.tsx`
*   **Lógica**:
    *   Tiene 1 entrada y N salidas.
    *   Debe validar que la suma de porcentajes de salida sea **exactamente 100%**.
    *   Visual: Muestra una barra de progreso multicolor indicando la distribución.

#### `SimulationPreview.tsx`
*   **Lógica de "Dry Run"**:
    *   Toma el grafo actual en memoria.
    *   Toma el saldo *real* actual del usuario.
    *   Ejecuta el grafo paso a paso en el cliente (JS puro).
    *   Muestra un log efímero: "Con este grafo, hoy se moverían 45€ a 'Hucha Viaje'".

### 2.3 Pages Layer (`src/features/engine/pages/`)

#### `EngineConfigPage.tsx`
*   **Gestión de Estado**:
    *   `isDirty`: boolean. Se activa cuando el usuario mueve un nodo o cambia un valor. Habilita el botón "Guardar Cambios".
    *   `isSaving`: boolean. Muestra spinner bloqueante.
    *   **Prompt de Salida**: Si el usuario intenta salir con `isDirty === true`, muestra un `window.confirm` para evitar pérdida de datos.

## 3. Estrategia de Testing
*   **Unit Tests (Crucial)**: Testear `graphValidator` con grafos cíclicos, grafos desconectados y grafos válidos.
*   **E2E Tests**: Usar Playwright para simular arrastrar un nodo, conectarlo y guardar.
