# Módulo de Eventos y Experiencias

Este documento detalla el funcionamiento, gestión y flujos del módulo encargado de administrar la agenda cultural, catas, fiestas y eventos de la marca Mr. CoolCat. Este módulo se integra estrechamente con el **Módulo de Tiendas Físicas** (para ubicación) y el **Módulo de CRM** (para registro de asistencia).

## 1. Gestión de Eventos

El panel de administración permite crear y gestionar el ciclo de vida completo de un evento.

### A. Ficha del Evento
Al crear o editar un evento, el administrador debe configurar los siguientes campos:

*   **Información Básica:**
    *   **Título:** Nombre público del evento (ej. "Cata de IPAs de Verano").
    *   **Descripción:** Detalles del evento (soporte para texto enriquecido).
    *   **Imagen Destacada:** Banner visual para el listado en la App (formato 16:9 o 1:1).
    *   **Sede (Lugar):** Selección de una de las Tiendas Físicas registradas o "Ubicación Externa" (requiere dirección manual).
    *   **Fechas:** Fecha/Hora de inicio y fin.

*   **Estado del Evento:**
    *   `Borrador`: Invisible para usuarios.
    *   `Publicado`: Visible en la App y web.
    *   `Cancelado`: Visible pero con indicador de cancelación; bloquea nuevas inscripciones.
    *   `Finalizado`: Ocurrió en el pasado (estado automático o manual).

### B. Configuración de Aforo y Lista de Espera
Control estricto de la capacidad para evitar overbooking.

*   **Aforo Máximo:** Número total de asistentes permitidos.
*   **Visualización de Disponibilidad:**
    *   Cálculo en tiempo real: `Aforo Total` - `Tickets Vendidos/Reservados`.
*   **Lista de Espera (Waitlist):**
    *   Opción activable: "Habilitar lista de espera al agotar entradas".
    *   Funcionamiento: Si se libera una entrada (cancelación), se notifica automáticamente al primero de la lista o se permite gestión manual por el admin.

## 2. Tipos de Tickets

El sistema permite múltiples modalidades de acceso para un mismo evento.

### Configuración de Tickets
Cada evento puede tener uno o varios tipos de ticket (relación 1:N).

| Campo | Descripción |
| :--- | :--- |
| **Nombre** | Ej. "General", "VIP", "Early Bird", "Mesa x4". |
| **Precio** | Coste en moneda local. Si es 0, es "Gratuito". |
| **Cantidad** | Stock específico para este tipo de ticket (ej. solo 10 VIPs). |
| **Restricciones** | Opcional. Ej. "Solo para usuarios Nivel Oro" (integración con Gamificación). |
| **Ventana de Venta** | Fecha de inicio y fin de venta específica para este ticket (útil para Early Bird). |

## 3. Herramientas de Check-in y Acceso

Para el día del evento, el Backoffice proporciona herramientas operativas para el staff en puerta.

### A. Generador de Listados (Guest List)
*   Exportación de lista de asistentes confirmados (PDF/Excel).
*   Datos: Nombre, Tipo de Ticket, ID de Pedido, Notas del Cliente.

### B. Escáner QR y Validación
*   **Interfaz Móvil para Staff:** Una vista simplificada del Backoffice accesible desde navegador móvil.
*   **Funcionalidad de Escaneo:**
    *   Uso de la cámara del dispositivo para leer el QR de la entrada del usuario (en la App Mr. CoolCat).
    *   **Validación Online:** Consulta en tiempo real el estado del ticket.
*   **Respuestas del Sistema:**
    *   ✅ **Acceso Permitido:** Pantalla verde. Muestra nombre y tipo de ticket. Marca el ticket como "Usado" (Check-in timestamp).
    *   ❌ **Error / Inválido:** Pantalla roja. Ticket no existe o no corresponde a este evento.
    *   ⚠️ **Ya Utilizado:** Pantalla naranja. Alerta de que el ticket ya hizo check-in previamente (prevención de fraude).

## 4. Feedback Post-Evento

Automatización para medir la satisfacción de los asistentes (NPS/CSAT).

*   **Trigger:** Tarea programada (Cron) que se ejecuta X horas después de la fecha de fin del evento.
*   **Acción:** Envío de Notificación Push / Email a los usuarios con estado `Asistió` (Checked-in).
*   **Contenido:** Enlace a una encuesta breve.
*   **Incentivo:** Configurable (ej. "Gana 50 puntos por valorar tu experiencia").

## 5. Modelo de Datos (Referencia)

Entidades principales involucradas en este módulo:

*   `events`: Tabla principal del evento.
*   `tickets`: Definiciones de tipos de entrada y precios.
*   `event_registrations`: Relación Usuario-Evento-Ticket (incluye estado de pago, código QR único y estado de check-in).
*   `stores`: Para vincular ubicación física.
