# Project Management (PM) Simplificado - Módulo 4

## Visión General
Este módulo está diseñado para garantizar la entrega de proyectos a tiempo sin caer en la microgestión. Actúa como el motor de ejecución del sistema, permitiendo una gestión granular de tareas, hitos y activos, adaptando la visibilidad según el usuario (freelancer o cliente).

## Especificaciones Funcionales

### 1. Jerarquía Flexible
El sistema debe soportar una estructura anidada de 4 niveles para organizar el trabajo:
1.  **Proyecto:** El contenedor principal. Representa el compromiso global con el cliente.
2.  **Hitos (Milestones):** Fases principales del proyecto, a menudo vinculadas a facturación.
3.  **Listas de Tareas (Task Lists):** Agrupaciones lógicas de trabajo dentro de un hito o proyecto.
4.  **Subtareas:** Unidades de trabajo indivisibles dentro de una tarea.

**Health Score (Salud del Proyecto):**
Cada proyecto debe calcular y mostrar un "Health Score" automático. Este indicador se basa en:
*   Comparación entre fechas límite (deadlines) y el progreso real completado.
*   Alertas visuales si el progreso se desvía de la planificación (ej. Rojo si > 10% de retraso).

### 2. Vistas Adaptativas
El sistema debe renderizar la información del proyecto de dos formas distintas según el contexto de seguridad y el rol del usuario:

*   **Vista Cliente (External View):**
    *   Vista simplificada y limpia.
    *   Muestra solo grandes hitos, progreso general y fechas clave.
    *   Oculta detalles técnicos, tareas internas y "trabajo sucio".
    
*   **Vista Técnica (Internal View):**
    *   Vista completa para el freelancer o equipo interno.
    *   Incluye checklists detallados, notas de debug, tareas de mantenimiento y gestión interna.

### 3. Gestión de Activos y Archivos
*   **Integración:** Soporte para vinculación con almacenamiento externo (Google Drive/Dropbox) y almacenamiento local (S3/Supabase Storage).
*   **Control de Versiones Simplificado:** Sistema de etiquetado o versionado para archivos creativos (ej. `v1`, `v2`, `final`), permitiendo mantener un historial limpio de entregables sin sobrescribir.

### 4. Vista de Gantt (UX)
Para la visualización temporal de proyectos complejos:
*   **Librerías Sugeridas:** `gantt-task-react` (ligera, React nativa) o `dhtmlx-gantt` (más robusta).
*   **Interacciones:**
    *   Drag & Drop para reajustar fechas de inicio/fin.
    *   Visualización de dependencias (flechas entre tareas).
    *   Zoom (Día, Semana, Mes).
*   **Colores de Estado:** Diferenciar hitos completados, tareas en riesgo y ruta crítica.

## Modelo de Datos y Tipos

### Jerarquía de Tipos (TypeScript Interfaces)

```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical';
type TaskStatus = 'todo' | 'in_progress' | 'review' | 'blocked' | 'done';

interface Project {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  startDate: string; // ISO Date
  dueDate?: string;
  healthScore: number; // 0-100 calculated
  status: 'active' | 'archived' | 'completed' | 'on_hold';
  budget?: number;
  tags: string[];
}

interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  isBillable: boolean;
  status: 'pending' | 'completed';
  amount?: number; // Si es facturable
}

interface Task {
  id: string;
  projectId: string;
  milestoneId?: string; // Opcional, puede no pertenecer a un hito
  parentTaskId?: string; // Para subtareas
  title: string;
  description?: string;
  assigneeId?: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours?: number;
  dueDate?: string;
  attachments: Attachment[];
  dependencies: string[]; // IDs de tareas que deben completarse antes
}

interface Attachment {
  id: string;
  fileName: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  version?: string; // 'v1', 'v2'
}
```

### Diagrama de Estados de una Tarea

El flujo de vida de una tarea sigue la siguiente máquina de estados:

1.  **TODO:** Estado inicial. Tarea creada pero no iniciada.
2.  **IN_PROGRESS:** El trabajo ha comenzado.
    *   *Transición:* `TODO` -> `IN_PROGRESS`
3.  **BLOCKED:** Un impedimento externo detiene el avance (ej. esperando assets del cliente).
    *   *Transición:* `IN_PROGRESS` <-> `BLOCKED`
4.  **REVIEW:** Trabajo completado por el ejecutor, pendiente de aprobación (QA o Cliente).
    *   *Transición:* `IN_PROGRESS` -> `REVIEW`
    *   *Rechazo:* `REVIEW` -> `IN_PROGRESS` (con feedback)
5.  **DONE:** Tarea aprobada y finalizada.
    *   *Transición:* `REVIEW` -> `DONE`

## Arquitectura de Implementación

### Ubicación del Código
Todo el código relacionado con este módulo debe residir estrictamente en el directorio:
`src/features/projects/`

### Estructura de Carpetas
Dentro del directorio de la característica, se debe respetar la siguiente estructura:

```
src/features/projects/
├── pages/       # ProjectList.tsx, ProjectDetail.tsx, GanttView.tsx
├── components/  # TaskCard.tsx, KanbanBoard.tsx, MilestoneTimeline.tsx
├── hooks/       # useProjectHealth.ts, useTaskDragDrop.ts
└── api/         # services.ts (Lógica de endpoints)
```

### API Endpoints

La comunicación con el backend debe seguir principios RESTful.

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| **Projects** | | |
| `GET` | `/api/projects` | Lista proyectos (con filtros y paginación). |
| `GET` | `/api/projects/:id` | Detalle completo del proyecto (incl. hitos y resumen). |
| `POST` | `/api/projects` | Crear nuevo proyecto. |
| `PUT` | `/api/projects/:id` | Actualizar proyecto (estado, fechas). |
| **Tasks** | | |
| `GET` | `/api/projects/:id/tasks` | Lista tareas de un proyecto. |
| `POST` | `/api/tasks` | Crear tarea. |
| `PATCH` | `/api/tasks/:id/status` | Actualizar solo el estado (drag & drop en Kanban). |
| **Attachments** | | |
| `POST` | `/api/tasks/:id/attachments` | Subir archivo a una tarea. |
| `DELETE` | `/api/attachments/:id` | Eliminar adjunto. |

**Manejo de Archivos Adjuntos:**
1.  El cliente solicita una URL firmada (Presigned URL) al backend para subir el archivo directamente al almacenamiento (S3/Supabase).
2.  Una vez subido, el cliente notifica al backend (`POST /api/tasks/:id/attachments`) con los metadatos del archivo (nombre, ruta, tamaño) para registrarlo en la base de datos.