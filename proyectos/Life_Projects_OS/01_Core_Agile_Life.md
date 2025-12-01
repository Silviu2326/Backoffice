# Módulo: Fundamentos Metodológicos (Agile Life Framework)

## 1. Visión General Técnica
Este módulo orquesta el sistema operativo vital. Su responsabilidad es transformar deseos abstractos en iteraciones de trabajo concretas ("Sprints"), evitando la saturación mediante el control estricto de la "Velocidad".

## 2. Esquema de Base de Datos (PostgreSQL)

```sql
-- Gestión de Ciclos
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT, -- "Sprint Octubre: Salud & Finanzas"
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status TEXT CHECK (status IN ('PLANNING', 'ACTIVE', 'REVIEW', 'COMPLETED')),
    planned_velocity INTEGER, -- Puntos totales comprometidos
    actual_velocity INTEGER, -- Puntos realmente completados
    mood_score FLOAT, -- Promedio del bienestar durante el ciclo
    retrospective_notes JSONB -- Estructura: { "went_well": [], "to_improve": [] }
);

-- Tareas (La unidad atómica)
CREATE TABLE tasks (
    id UUID PRIMARY KEY,
    sprint_id UUID REFERENCES sprints(id), -- Null si está en Backlog
    title TEXT NOT NULL,
    status TEXT CHECK (status IN ('TODO', 'IN_PROGRESS', 'DONE', 'ARCHIVED')),
    story_points INTEGER CHECK (story_points IN (1, 2, 3, 5, 8, 13)),
    vertical TEXT CHECK (vertical IN ('HEALTH', 'WEALTH', 'RELATIONSHIPS', 'WISDOM')),
    
    -- Metadatos de ejecución
    completed_at TIMESTAMPTZ,
    moved_to_next_sprint BOOLEAN DEFAULT FALSE
);

-- Ritual Diario
CREATE TABLE daily_standups (
    id UUID PRIMARY KEY,
    sprint_id UUID REFERENCES sprints(id),
    date DATE NOT NULL,
    readiness_score INTEGER, -- Input de Oura/Apple (0-100)
    blockers TEXT,
    focus_tasks_ids UUID[] -- Las 3 tareas clave del día
);
```

## 3. Arquitectura de Archivos y Especificación Funcional

### A. Capa de Lógica de Negocio (`src/features/life-projects/core/logic/`)

#### `velocityCalculator.ts`
*   **Descripción:** Motor matemático para predecir capacidad futura.
*   **Función Principal:** `calculateRecommendedVelocity(history: SprintMetrics[], bioForecast: number): number`
*   **Cómo funciona:**
    1.  Toma los últimos 5 sprints.
    2.  Aplica un decaimiento exponencial (el último sprint pesa 50%, el anterior 25%, etc.).
    3.  Multiplica por el `bioForecast` (Factor de energía física 0.0 - 1.0).
    4.  Devuelve un entero (ej. "45 Puntos") que será el límite duro (`Hard Limit`) en la UI de planificación.

#### `sprintStateMachine.ts`
*   **Descripción:** Máquina de estados para transicionar ciclos.
*   **Funciones:**
    *   `startSprint(draftId)`: Valida que no haya otro activo. Congela el alcance.
    *   `closeSprint(id)`: Mueve tareas `DONE` al historial de XP. Mueve tareas `TODO` al Backlog global o al siguiente sprint (Carry-over).

### B. Hooks & Gestión de Estado (`src/features/life-projects/core/hooks/`)

#### `useSprintCycle.ts`
*   **Descripción:** Hook principal para el Dashboard.
*   **Funcionalidad:**
    *   Suscripción a la tabla `sprints` via Supabase Realtime.
    *   Provee: `currentSprint`, `daysRemaining`, `progressPercentage`.
    *   Calcula en cliente el "Burndown Chart" (Puntos restantes vs Días restantes).

#### `useDailyRitual.ts`
*   **Descripción:** Gestiona el flujo del Standup Matutino.
*   **Funcionalidad:**
    *   Persiste el estado del wizard paso a paso en `localStorage` (por si el usuario cierra la app a mitad).
    *   Conecta con el `BiometricService` para obtener el dato de `Readiness` automáticamente al abrir el modal.

### C. Componentes UI (`src/features/life-projects/core/components/`)

#### `Board/KanbanBoard.tsx`
*   **Descripción:** Tablero interactivo de gestión diaria.
*   **Props:** `tasks: Task[]`, `onStatusChange: (id, newStatus) => void`.
*   **Cómo funciona:**
    *   Usa `dnd-kit` para arrastrar tarjetas.
    *   **Regla de Negocio:** Si la columna `IN_PROGRESS` tiene 3 tareas y el usuario intenta arrastrar una 4ta, la tarjeta "rebota" y muestra un Toast error: "WIP Limit Exceeded. Termina algo antes de empezar algo nuevo."

#### `Planning/SprintPlanningWizard.tsx`
*   **Descripción:** Interfaz compleja para iniciar ciclo.
*   **Estructura:**
    *   **Paso 1 (Review):** Muestra resumen del ciclo anterior.
    *   **Paso 2 (Energy):** Gráfico de línea con la predicción de energía de la próxima semana.
    *   **Paso 3 (Selection):**
        *   Izquierda: Backlog (Lista filtrable).
        *   Derecha: Bucket del Sprint (Con barra de capacidad).
        *   **Lógica:** Al arrastrar tareas, la barra de capacidad se llena. Si supera la `RecommendedVelocity`, se pone roja y vibra.

#### `Dashboard/MissionControlHeader.tsx`
*   **Descripción:** HUD (Heads-Up Display) siempre visible.
*   **Visualización:**
    *   Barra de progreso del Sprint actual.
    *   Icono de "Clima Biológico" (Sol = Alta Energía, Lluvia = Baja).
    *   Contador de "Días de Libertad" (Runway financiero).

### D. Servicios API (`src/features/life-projects/core/api/`)

#### `cycleService.ts`
*   **Métodos:**
    *   `getCurrentSprint()`: Fetch optimizado con cache.
    *   `moveTaskToBacklog(taskId)`: Usado cuando una tarea se cancela.
    *   `submitStandup(data)`: Guarda el ritual diario.

#### `metricsService.ts`
*   **Métodos:**
    *   `getVelocityHistory()`: Retorna datos para gráficos analíticos.
    *   `getCompletionRate()`: % de cumplimiento histórico.

## 4. Endpoints API (Supabase Edge Functions)

*   `POST /functions/v1/sprint-rollover`:
    *   **Trigger:** Se ejecuta al cerrar un sprint.
    *   **Lógica:** Identifica tareas no terminadas. Crea un registro de "Fallo de Planificación" para analíticas. Mueve las tareas al Backlog con una marca de `rollover_count + 1`.

*   `GET /functions/v1/morning-briefing`:
    *   **Trigger:** Al abrir el Standup.
    *   **Lógica:** Agrega datos de clima, calendario y biometría para generar un resumen textual corto con IA ("Hoy lloverá, tienes 2 reuniones y tu energía es media. Ajusta tu plan.").
