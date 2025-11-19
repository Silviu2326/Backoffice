# Módulo 13: Bienestar Digital (Wellness)

## 1. Visión General
El módulo de Bienestar Digital tiene como objetivo principal la prevención del agotamiento (burnout) del freelancer. Proporciona herramientas visuales y funcionales para monitorizar la carga de trabajo y gestionar periodos de descanso de manera eficiente.

## 2. Funcionalidades Principales

### 2.1 Semáforo de Carga de Trabajo (Workload Traffic Light)
Sistema de monitorización visual que analiza la carga de trabajo semanal basada en las horas estimadas de las tareas asignadas y otros factores de estrés.

*   **Lógica de Negocio Simplificada:**
    *   🟢 **Verde:** Carga ligera (< 30 horas). Indica capacidad para asumir más trabajo.
    *   🟡 **Amarillo:** Carga moderada (30 - 40 horas). Zona de productividad óptima/precaución.
    *   🔴 **Rojo:** Sobrecarga (> 40 horas). Alerta de riesgo de burnout.

#### 2.1.1 Algoritmo del Semáforo de Carga (Cálculo Avanzado)
Para una precisión mayor, el sistema utiliza la siguiente fórmula para determinar el **Índice de Carga Semanal ($I_c$)**:

$$I_c = \frac{(\sum_{i=1}^{n} (T_i \times W_i)) + M_{total}}{C_{max}} \times 100$$

**Variables:**
*   **$T_i$**: Tiempo estimado (en horas) de la tarea $i$ activa para la semana.
*   **$W_i$**: Factor de peso por complejidad de la tarea (1.0 = Normal, 1.2 = Alta Prioridad/Compleja, 1.5 = Crítica).
*   **$M_{total}$**: Suma total de horas de reuniones o eventos agendados en el calendario.
*   **$C_{max}$**: Capacidad máxima semanal definida por el usuario (ej. 40 horas).

**Interpretación del Resultado ($I_c$):**
*   $I_c \leq 75\%$: 🟢 Verde (Saludable)
*   $75\% < I_c \leq 100\%$: 🟡 Amarillo (Atención)
*   $I_c > 100\%$: 🔴 Rojo (Sobrecarga)

### 2.2 Modo Vacaciones (Botón de Pánico)
Funcionalidad de "un clic" para gestionar ausencias temporales y desconexión digital total.

*   **Acciones Automatizadas:**
    *   **Bloqueo de Agenda:** Deshabilita la disponibilidad en el módulo de Calendario/Booking para el rango de fechas seleccionado.
    *   **Respuesta Automática:** Prepara o activa respuestas automáticas de correo (si hay integración disponible).
    *   **Aviso en Portal de Cliente:** Publica un banner visible en el Portal del Cliente: "Estaré fuera del [Fecha Inicio] al [Fecha Fin]".

#### 2.2.1 Configuración de Desactivación de Triggers
Al activar el Modo Vacaciones, el sistema intercepta y desactiva los siguientes disparadores (triggers) y notificaciones:

1.  **Notificaciones Push/Email:**
    *   Se pausan todas las alertas de "Nueva Tarea Asignada".
    *   Se desactivan los recordatorios diarios (Daily Digest).
    *   Se silencian las notificaciones de comentarios en proyectos (salvo menciones marcadas como "URGENTE" si se configura excepción).
2.  **Automatizaciones de Workflow:**
    *   Detiene la asignación automática de leads o tickets de soporte; estos quedan en cola o se redirigen a un mensaje de "Fuera de oficina".
3.  **SLAs y Temporizadores:**
    *   Pausa temporal de contadores de SLA (Service Level Agreement) para evitar incumplimientos por inactividad justificada.

## 4. Integraciones Futuras: Wearables (Opcional)
Para llevar el bienestar más allá de la gestión de tareas, se plantea la integración con dispositivos de salud (IoT).

*   **Objetivo:** Correlacionar datos fisiológicos con métricas de productividad.
*   **APIs Propuestas:** Apple HealthKit, Google Fit, API de Oura Ring.
*   **Métricas Clave:**
    *   **Calidad del Sueño:** Si el usuario duerme < 6 horas durante 3 días seguidos, el sistema sugiere reducir la capacidad diaria ($C_{max}$) automáticamente un 10%.
    *   **Variabilidad de la Frecuencia Cardíaca (HRV):** Detección de niveles altos de estrés físico para sugerir pausas activas obligatorias.
    *   **Contador de Pasos:** Recordatorios de "Muevete" si el tiempo de escritorio supera las 2 horas continuas sin registro de movimiento.

## 5. Arquitectura Técnica

### 5.1 Estructura de Directorios
La implementación debe seguir estrictamente la siguiente estructura dentro de `src/features/wellness/`:

```text
src/features/wellness/
├── api/
│   ├── wellnessService.ts      # Lógica de cálculo de horas y gestión de estado
│   └── vacationMode.ts         # Endpoints/Lógica para activar modo vacaciones
├── components/
│   ├── WorkloadIndicator.tsx   # Componente visual del semáforo
│   ├── VacationModal.tsx       # Modal de configuración de vacaciones
│   └── WellnessWidget.tsx      # Widget resumen para el dashboard
└── pages/
    └── WellnessDashboard.tsx   # Página principal de métricas de bienestar
```

### 5.2 Dependencias e Integraciones
*   **Módulo de Tareas (Project Management):** Lectura de tareas asignadas y sus estimaciones (`estimated_hours`).
*   **Módulo de Calendario:** API para bloquear slots de tiempo y leer reuniones ($M_{total}$). 
*   **Contexto de Usuario/Configuración:** Persistencia del estado "En Vacaciones" y configuración de capacidad ($C_{max}$). 

### 5.3 Modelo de Datos (Supabase/Local)
Se requieren estructuras para almacenar la configuración de vacaciones y quizás métricas históricas de carga.

**Tabla sugerida (o extensión de UserSettings):**
*   `vacation_mode_enabled` (boolean)
*   `vacation_start_date` (timestamp)
*   `vacation_end_date` (timestamp)
*   `auto_reply_message` (text)
*   `weekly_capacity_hours` (integer) - Para el cálculo del algoritmo.