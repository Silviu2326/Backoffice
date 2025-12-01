# Módulo 4: El Árbol de Habilidades (Gamificación y Aprendizaje)

## 1. Visión General Técnica
Este módulo aplica mecánicas de juego sobre la base de datos de tareas. Mantiene un grafo de habilidades y gestiona la importación de contenido educativo externo.

## 2. Esquema de Base de Datos

```sql
-- Árbol de Habilidades
CREATE TABLE skill_nodes (
    id UUID PRIMARY KEY,
    slug TEXT UNIQUE, -- 'python', 'calisthenics'
    display_name TEXT,
    parent_id UUID, -- Jerarquía
    unlock_requirements JSONB -- { "level_required": { "logic": 5 } }
);

-- Estado del Jugador
CREATE TABLE user_skills (
    user_id UUID,
    skill_id UUID,
    xp_total INTEGER,
    current_level INTEGER,
    PRIMARY KEY (user_id, skill_id)
);

-- Cursos Externos
CREATE TABLE external_courses (
    id UUID PRIMARY KEY,
    platform TEXT, -- 'UDEMY', 'COURSERA'
    external_id TEXT,
    title TEXT,
    modules_json JSONB, -- Estructura del curso
    sync_token TEXT
);
```

## 3. Arquitectura de Archivos y Especificación Funcional

### A. Motor de XP (`src/features/life-projects/gamification/engine/`)

#### `xpCalculator.ts`
*   **Descripción:** Fórmulas de progresión.
*   **Constantes:** `BASE_XP = 100`, `EXPONENT = 1.5`.
*   **Funciones:**
    *   `calculateLevel(xp)`: Convierte puntos totales a nivel.
    *   `getXPForTask(task)`: Calcula recompensa basada en `story_points` y `difficulty`.
    *   `checkLevelUp(oldXP, newXP)`: Retorna `true` si se cruzó un umbral de nivel.

#### `AchievementSystem.ts`
*   **Descripción:** Evaluador de logros.
*   **Lógica:** Escucha eventos `TASK_COMPLETED`.
    *   Evalúa reglas: `if (tasks_done_consecutive_days > 30) grantBadge('DISCIPLINE_MASTER')`.

### B. Visualización (`src/features/life-projects/gamification/components/`)

#### `Tree/SkillTreeGraph.tsx`
*   **Descripción:** Renderizador del árbol.
*   **Tecnología:** `React Flow`.
*   **Nodos (`SkillNode.tsx`):**
    *   Hexágonos SVG.
    *   Stroke: Gris (Bloqueado), Azul (Desbloqueado), Dorado (Maestría).
    *   Fill: Gradiente vertical indicando % de XP para el siguiente nivel.
*   **Interacción:** Pan & Zoom. Click en nodo muestra detalles y "Quests" (Tareas) disponibles para esa habilidad.

#### `Stats/RadarChartStats.tsx`
*   **Descripción:** Gráfico de araña.
*   **Datos:** Agrega niveles de habilidades hijas en categorías padre (Fuerza, Inteligencia, Carisma, Destreza).
*   **Animación:** `Recharts` con animación de crecimiento al cargar.

### C. Integración LMS (`src/features/life-projects/gamification/lms/`)

#### `CourseAdapter.ts` (Interface)
Definición abstracta para importar cursos.

#### `UdemyAdapter.ts`
*   **Descripción:** Implementación para Udemy.
*   **Funcionalidad:**
    *   Usa API pública (si disponible) o scraping de extensión de navegador.
    *   Parsea el índice de contenidos ("Section 1, Lecture 3").
    *   **Mapper:** Convierte cada Lecture en una `Task` de LPE-OS.
        *   `Title`: "Curso Python: Lecture 3"
        *   `Duration`: "15 min"
        *   `Dependency`: Lecture 2.

#### `CourseImportModal.tsx`
*   **Descripción:** UI para añadir cursos.
*   **Input:** URL del curso.
*   **Process:** Muestra preview del temario detectado. Permite al usuario seleccionar días de la semana ("Quiero estudiar Lun/Mie/Vie").
*   **Output:** Genera docenas de tareas en el Backlog con fechas pre-asignadas.

## 4. Endpoints API

*   `POST /api/v1/gamification/add-xp`:
    *   Internal endpoint llamado por otros módulos cuando se completa una tarea.
    *   Actualiza tabla `user_skills`. Retorna `levelUp: boolean`.
*   `GET /api/v1/gamification/tree`:
    *   Retorna el grafo completo con el estado actual del usuario para renderizar.
