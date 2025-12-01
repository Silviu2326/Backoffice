# Módulo 2: Gestión de Recursos Integrada (El ERP Personal)

## 1. Visión General Técnica
Este módulo actúa como la capa de persistencia de recursos. Gestiona tres "monedas": Dinero (Serie temporal), Energía (Serie temporal) y Relaciones (Grafo). Su función es proveer datos de disponibilidad (`Constraints`) al Módulo 1 (Waze).

## 2. Esquema de Base de Datos

```sql
-- Finance
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    amount DECIMAL(12,2), -- Negativo gasto, Positivo ingreso
    date TIMESTAMPTZ,
    category TEXT, -- 'GROCERIES', 'RENT', etc.
    project_id UUID, -- Link opcional a un proyecto
    is_forecast BOOLEAN DEFAULT FALSE -- True si es una proyección futura
);

-- Social
CREATE TABLE contacts (
    id UUID PRIMARY KEY,
    name TEXT,
    relationship_tier TEXT, -- 'INNER_CIRCLE', 'STRATEGIC', 'ACQUAINTANCE'
    decay_rate INTEGER, -- Días para que la salud baje a 50%
    last_interaction TIMESTAMPTZ,
    notes TEXT
);
```

## 3. Arquitectura de Archivos y Especificación Funcional

### A. Sub-módulo Finanzas (`src/features/life-projects/resources/finance/`)

#### `logic/runwayProjector.ts`
*   **Descripción:** Calcula el futuro financiero.
*   **Función:** `calculateRunway(currentBalance, recurringTx, projectTx): ProjectionPoint[]`
*   **Lógica:**
    1.  Genera array de días (Hoy -> Hoy + 2 Años).
    2.  Aplica gastos fijos recurrentes (Alquiler, Netflix).
    3.  Superpone gastos únicos derivados del Gantt (ej. "Día 45: Comprar Vuelos - $800").
    4.  Calcula el saldo acumulado diario.
    5.  Detecta el "Zero Date" (Día de bancarrota).

#### `components/RunwayChart.tsx`
*   **Descripción:** Gráfico de línea interactivo (Recharts).
*   **Features:**
    *   **Gradient Fill:** Verde si saldo > Buffer, Rojo si < 0.
    *   **Annotations:** Puntos clicables en la línea que muestran el evento de gasto grande ("Boda").
    *   **Zoom:** Brush para seleccionar rangos de fecha.

#### `api/bankIntegrationService.ts`
*   **Descripción:** Servicio para conectar con Plaid/GoCardless.
*   **Funciones:**
    *   `syncTransactions()`: Pull incremental de nuevos movimientos.
    *   `classifyTransaction(tx)`: Usa Regex o IA simple para asignar categoría y detectar si pertenece a un proyecto activo.

### B. Sub-módulo Social (`src/features/life-projects/resources/social/`)

#### `logic/decayMath.ts`
*   **Descripción:** Algoritmo de mantenimiento de relaciones.
*   **Fórmula:** `Health = 100 * e^(-k * t)` donde `t` es tiempo sin contacto y `k` depende de la importancia de la persona.
*   **Output:** Un score 0-100 para cada contacto.

#### `components/SocialRadarNet.tsx`
*   **Descripción:** Visualización de red (Canvas/SVG).
*   **Comportamiento:**
    *   Contactos con `Health > 80` están cerca del centro.
    *   Contactos con `Health < 20` están lejos y parpadean.
    *   Al hacer clic en un nodo, abre el `ContactDetailModal`.

#### `components/ContactDetailModal.tsx`
*   **Descripción:** CRM mini.
*   **Tabs:**
    *   *Historia:* Log de interacciones.
    *   *Proyectos:* En qué proyectos participa esta persona (ej. "Inversor" en "Startup").
    *   *Acción:* Botones rápidos "Log Coffee", "Log Call".

### C. Sub-módulo Energía (`src/features/life-projects/resources/energy/`)

#### `api/biometricAdapter.ts`
*   **Descripción:** Normalizador de datos de salud.
*   **Implementación:** Patrón Strategy.
    *   `OuraStrategy`: Usa API v2 de Oura. Mapea `readiness_score`.
    *   `AppleHealthStrategy`: Usa plugin Capacitor. Calcula readiness basado en HRV/RHR si no existe score nativo.
*   **Output:** Objeto estandarizado `{ readiness: 0-100, sleepScore: 0-100, advice: string }`.

#### `components/EnergyBatteryWidget.tsx`
*   **Descripción:** UI Gauge simple.
*   **Lógica:** Muestra el score actual. Si es < 30%, muestra alerta "Considera descansar hoy".

## 4. Endpoints API

*   `GET /api/v1/resources/finance/runway`:
    *   Retorna JSON optimizado para el gráfico (array de 730 puntos para 2 años).
*   `POST /api/v1/resources/social/log-interaction`:
    *   Payload: `{ contactId, type, notes }`.
    *   Efecto: Resetea el `Health` a 100 y recalcula la fecha de próxima interacción sugerida.
*   `GET /api/v1/resources/energy/forecast`:
    *   Retorna predicción para la semana basada en historial (útil para planificar sprints).
