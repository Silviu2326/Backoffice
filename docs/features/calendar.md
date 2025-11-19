# Agenda & Booking

## Descripción General
**Módulo 12** del sistema operativo para freelancers.
**Objetivo:** Dueño de tu tiempo.
**Visión:** Gestión inteligente de la disponibilidad y reservas automáticas, integrando la vida personal y profesional.

---

## Características Principales

### 1. Motor de Reservas (Booking Engine)
Sistema avanzado para permitir que clientes agenden reuniones basándose en reglas predefinidas, eliminando el intercambio de emails.

*   **Reglas Complejas de Disponibilidad:**
    *   **Días Bloqueados:** Ejemplo: "No permitir reuniones los viernes".
    *   **Antelación Mínima:** Ejemplo: "Mínimo 24h de antelación para reservar".
    *   **Buffer entre Reuniones:** Tiempo de descanso automático (ej. 15 min) entre una llamada y otra para evitar fatiga.
*   **Preguntas de Cualificación:**
    *   Formulario previo a la confirmación de la cita.
    *   **Filtrado Inteligente:** Ejemplo: Preguntar "¿Cuál es tu presupuesto?". Si la respuesta es inferior a un umbral definido, el sistema puede rechazar la reunión automáticamente o sugerir contactar por email en lugar de una llamada.

### 2. Sincronización Bidireccional Real
Integración profunda con calendarios externos (Google Calendar, Outlook, etc.) para una gestión del tiempo unificada.

*   **Privacidad y Bloqueo:**
    *   **Personal a Profesional:** Si agendas un evento personal (ej. "Médico") en tu Google Calendar privado, el sistema detecta ese horario y lo elimina automáticamente de tu disponibilidad profesional pública.
    *   **Visibilidad Externa:** Ante los clientes o en el widget de reserva, ese bloque de tiempo simplemente aparece como "Ocupado" o no disponible, protegiendo la privacidad del detalle del evento.

---

## Especificaciones de Implementación

### Estructura de Archivos
La implementación de este módulo debe residir estrictamente bajo `src/features/calendar/` respetando la siguiente estructura de subdirectorios:

```
src/features/calendar/
├── components/      # Componentes UI (Calendario mensual/semanal, Widget de reserva, Configuración de reglas)
├── pages/           # Vistas principales (Vista de Agenda, Configuración de Booking, Link público de reserva)
├── api/             # Servicios para sincronización con calendarios externos y gestión de disponibilidad
└── types/           # Tipos TypeScript para eventos, reglas de disponibilidad y configuraciones
```

### Lógica Clave a Implementar

#### 1. Availability Calculation & Conflict Detection
Algoritmo que tome la disponibilidad base configurada y reste los eventos para calcular slots libres.

**Lógica de Detección de Conflictos:**
1.  **Obtención de Eventos:** Recuperar todos los eventos del rango de fechas solicitado (Eventos Internos + Eventos Externos Sincronizados).
2.  **Generación de Slots:** Basado en `AvailabilityRules` (ver modelo), generar todos los slots posibles teóricos.
3.  **Filtrado por Conflicto:**
    Para cada *Slot Potencial* (StartA, EndA), verificar intersección con cada *Evento Existente* (StartB, EndB).
    *   Se considera conflicto si: `(StartA < EndB) && (EndA > StartB)`
    *   **Buffers:** Los buffers deben sumarse a la duración del evento existente o restar disponibilidad al slot.
        *   *Ejemplo:* Si hay evento 10:00-11:00 y buffer de 15 min, el tiempo ocupado real es 09:45-11:15.
4.  **Resultado:** Lista de slots disponibles para mostrar en la UI.

#### 2. Integración con Google Calendar API
Para la sincronización bidireccional, se requiere gestionar la autenticación OAuth2 y los scopes correctos.

*   **OAuth Scopes Requeridos:**
    *   `https://www.googleapis.com/auth/calendar.readonly`: Mínimo necesario para leer disponibilidad ("busy") sin ver detalles si se prefiere privacidad máxima, o para detectar conflictos.
    *   `https://www.googleapis.com/auth/calendar.events`: Necesario para:
        1.  Leer detalles completos (si el usuario lo permite).
        2.  **Escribir** la nueva cita agendada en el calendario del freelancer.
*   **Flujo:**
    *   Usuario conecta cuenta -> Redirección OAuth -> Almacenamiento seguro de `refresh_token`.
    *   Job periódico o fetch on-demand para actualizar cache de disponibilidad ("Busy Times").

#### 3. Modelo de Datos: `AvailabilityRules`
Definición TypeScript para manejar la configuración de disponibilidad del usuario.

```typescript
interface AvailabilityRules {
  id: string;
  userId: string;
  timezone: string; // IANA Timezone string, e.g., "America/New_York"
  
  // Horario base semanal
  weeklyHours: {
    [dayOfWeek: number]: Array<{ 
      start: string; // Formato "HH:mm", e.g., "09:00"
      end: string;   // Formato "HH:mm", e.g., "17:00"
    }>; 
  }; // 0 = Domingo, 1 = Lunes, etc.

  // Excepciones para fechas específicas (Días libres, vacaciones o días extra)
  dateOverrides: {
    [date: string]: { // Formato "YYYY-MM-DD"
      isUnavailable: boolean; // Si es true, bloquea todo el día
      hours?: Array<{ start: string; end: string }>; // Si no, usa estas horas específicas
    };
  };

  // Configuración de Reservas
  minNoticeMinutes: number;       // Mínima antelación (ej. 1440 min = 24h)
  bufferBeforeMinutes: number;    // Tiempo de preparación antes
  bufferAfterMinutes: number;     // Tiempo de descanso después
  slotDurationMinutes: number;    // Duración de la cita (ej. 30, 60 min)
  maxBookingFutureDays: number;   // Hasta cuándo se puede reservar (ej. 60 días)
}
```

#### 4. UI del Selector de Fechas (Date Picker)
Componentes visuales necesarios para la experiencia de reserva del cliente.

*   **Vista Mensual (Grid):**
    *   Calendario clásico para seleccionar el día.
    *   **Estados de Día:**
        *   *Disponible:* Clickable.
        *   *Ocupado/Bloqueado:* Deshabilitado visualmente (gris).
        *   *Seleccionado:* Resaltado (brand color).
        *   *Hoy:* Indicador visual sutil.
*   **Vista de Slots (Lista Lateral o Paso Siguiente):**
    *   Una vez seleccionado el día, mostrar lista vertical de horas disponibles.
    *   Debe renderizar las horas en la **Zona Horaria del Cliente** (detectada por navegador) pero permitir cambiarla manualmente.
    *   Formato: "09:00 AM", "09:30 AM".
*   **Responsive:**
    *   Desktop: Calendario y Lista lado a lado.
    *   Mobile: Calendario primero, al seleccionar día, transición o modal para elegir hora.