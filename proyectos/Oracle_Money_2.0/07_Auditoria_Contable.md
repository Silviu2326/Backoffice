# Módulo 7: Auditoría Histórica y Categorización

## 1. Visión Técnica Profunda
El desafío aquí es el volumen y la mutabilidad. Un usuario puede tener 10,000 transacciones. Necesitamos renderizar esto sin lag (Virtualization) y permitir ediciones en bloque (Batch Updates) con UI Optimista.
Es el único lugar de la app donde se hace "Write-Heavy" work por parte del usuario (limpiar datos).

## 2. Arquitectura de Archivos Detallada

### 2.1 API Layer (`src/features/accounting/api/`)

#### `accountingService.ts`
*   **Query Language**:
    *   Define una estructura JSON para filtros complejos:
        ```typescript
        interface TransactionFilter {
          AND: [
            { field: 'amount', op: 'gte', value: 100 },
            { field: 'category', op: 'in', value: ['food', 'travel'] },
            { OR: [...] }
          ]
        }
        ```
    *   El backend traduce esto a SQL.

#### `batchOperations.ts`
*   **Optimistic UI Pattern**:
    *   `updateCategory(ids: string[], newCat: string)`:
        1.  Actualiza inmediatamente el caché local de React Query.
        2.  Lanza la petición HTTP.
        3.  Si falla, hace rollback automático y notifica.

### 2.2 Components Layer (`src/features/accounting/components/`)

#### `TransactionHistoryTable.tsx`
*   **Core Tech**: `TanStack Table` (Headless) + `react-virtual` (Rendering).
*   **Features Avanzadas**:
    *   **Sticky Headers**: Las columnas de fecha y monto deben fijarse.
    *   **Multi-Select con Shift**: Permitir seleccionar rangos (Click fila 1, Shift+Click fila 10 -> Selecciona las 10).
    *   **Inline Editing**: Celda de "Notas" editable tipo Excel.

#### `AdvancedFilterBar.tsx`
*   **UX**:
    *   Sistema de "Chips" para filtros activos.
    *   Permite guardar combinaciones de filtros como "Vistas Inteligentes" (ej. "Mis Gastos de Viaje 2024").

#### `CategoryCleanupTool.tsx` (The "Tinder for Expenses")
*   **Gamificación**:
    *   Interfaz rápida para categorizar lo "Uncategorized".
    *   Muestra la transacción y atajos de teclado: "1 para Comida", "2 para Casa".
    *   Barra de progreso que celebra cuando llegas a "Inbox Zero".

#### `ExpenseTrendChart.tsx`
*   **Drill-down**:
    *   Click en la barra "Enero" -> Desglosa por semanas.
    *   Click en la semana -> Desglosa por días.

### 2.3 Pages Layer (`src/features/accounting/pages/`)

#### `AccountingPage.tsx`
*   **State**:
    *   Levanta el estado de selección (`selectedRowIds`) al nivel de página para que la `ActionToolbar` (flotante) sepa qué hacer.

## 3. Integración de Exportación
*   **Worker Thread**: La generación de CSV/PDF masivo se hace en un Web Worker para no congelar la UI principal.
*   **Formato**: Soporte para formatos estándar de contabilidad (QIF, OFX) además de Excel.

## 4. Testing
*   **Performance Tests**: Renderizar tabla con 10,000 filas mockeadas y medir FPS al scrollear.
*   **Interaction Tests**: Verificar que la selección con Shift funciona correctamente en listas virtualizadas (donde las filas intermedias no existen en el DOM).
