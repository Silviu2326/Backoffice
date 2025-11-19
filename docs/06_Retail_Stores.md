# Módulo de Gestión de Sedes Físicas (Retail)

Este documento detalla las especificaciones funcionales para el módulo de administración de tiendas físicas y puntos de venta ("Retail") dentro del Backoffice de Mr. CoolCat. Este módulo alimenta la experiencia de geolocalización (`MapaScreen`) y la logística de recogida en tienda.

---

## 1. Descripción General

El objetivo es proporcionar una interfaz intuitiva para gestionar la red de establecimientos físicos. Los administradores deben poder actualizar en tiempo real la información vital (horarios, ubicación, estado) que consultan los usuarios en la aplicación móvil, así como coordinar la oferta de servicios y eventos por sede.

---

## 2. Gestión de Sedes (Stores)

### A. Listado de Sedes
Vista principal tipo tabla (Data Grid) que resume la red de locales.
*   **Columnas:**
    *   Thumbnail (Foto principal).
    *   Nombre de la Sede.
    *   Ubicación (Ciudad/Barrio).
    *   Estado (Abierto ahora / Cerrado ahora / Inactivo).
    *   Tipo (Bar / Tienda / Pop-up).
*   **Filtros:** Estado de actividad, Ciudad, Servicios disponibles.

### B. Ficha de Sede (Crear/Editar)
Formulario exhaustivo para la configuración de cada punto físico.

#### Información Básica
*   **Nombre Comercial:** El nombre público visible en la App (ej. "CoolCat Taproom Centro").
*   **Descripción Corta:** Texto promocional o ambientación (ej. "El mejor lugar para probar nuestras IPAs experimentales").
*   **Slug:** Identificador URL friendly (opcional, para web compartida).
*   **Estado Operativo:**
    *   *Activo:* Visible en la app.
    *   *Inactivo:* Oculto (reformas, cierre permanente).
    *   *Próxima Apertura:* Visible pero marcado como "Coming Soon".

#### Ubicación y Geolocalización
Fundamental para el componente de Mapas.
*   **Dirección Física:** Calle, Número, Código Postal, Ciudad, Provincia.
*   **Coordenadas (GPS):**
    *   *Latitud* y *Longitud*.
    *   *Herramienta:* Integración con widget de Google Maps/Mapbox para seleccionar el punto exacto arrastrando un pin ("Pin Drop").
*   **Instrucciones de Llegada:** Campo de texto para tips de acceso (ej. "Entrada por el pasaje peatonal").

#### Medios y Contacto
*   **Imagen de Portada:** Imagen de alta calidad (formato 16:9 o 4:3) para la tarjeta del mapa.
*   **Galería de Fotos:** Carrusel (3-5 imágenes) mostrando el interior, fachada y ambiente.
*   **Datos de Contacto:** Teléfono público y Email de la sede.

---

## 3. Horarios Dinámicos

Sistema robusto para gestionar la disponibilidad temporal de la sede, crucial para evitar frustración en los usuarios.

### A. Horario Regular (Semanal)
Configuración estándar recurrente.
*   **Matriz Semanal:** Filas de Lunes a Domingo.
*   **Configuración por Día:**
    *   *Switch:* Abierto / Cerrado.
    *   *Rangos:* Hora Apertura - Hora Cierre (ej. 18:00 - 02:00).
    *   *Turnos Partidos:* Capacidad de añadir múltiples rangos por día (ej. 12:00-16:00 y 20:00-00:00).

### B. Horarios Especiales (Excepciones)
Calendario para sobrescribir la regla semanal en fechas específicas (Festivos, Eventos privados).
*   **Selector de Fecha:** Calendario "Date Picker".
*   **Tipo de Excepción:**
    *   *Cierre Total:* "Cerrado por vacaciones".
    *   *Horario Modificado:* Definir horas específicas para ese día (ej. Nochevieja 12:00 - 18:00).
*   **Mensaje al Usuario:** Nota opcional visible en la app (ej. "Horario especial por Navidad").

---

## 4. Servicios y Características

Sistema de etiquetas (tags) con iconografía para describir las comodidades del local.

### A. Gestión de Maestros de Servicios
El Super Admin define el catálogo global de servicios disponibles.
*   **Nombre:** (ej. "Wi-Fi", "Pet Friendly", "Terraza", "TV Deportes", "Acceso PMR").
*   **Icono:** Selector de iconos (Librería Material Icons, FontAwesome o SVG personalizado).
*   **Color:** Color distintivo (opcional, acorde al Design System).

### B. Asignación a Sede
En la ficha de la sede, interfaz de selección múltiple (Chips o Checkboxes).
*   Permite marcar qué servicios ofrece esa sede específica.
*   Estos iconos se renderizan en la ficha de detalle de la tienda en la App.

---

## 5. Vinculación con Eventos

Integración cruzada con el **Módulo de Eventos**. Permite convertir la sede en un "Venue" activo.

### A. Pestaña "Agenda" en Ficha de Sede
*   Muestra un listado cronológico de los eventos programados en *esta* sede.
*   **Datos:** Nombre del Evento, Fecha/Hora, Estado de entradas (Sold Out / Disponible).
*   **Acceso Rápido:** Link para editar el evento en el Módulo de Eventos.

### B. Lógica de Visualización
*   Al crear un evento en el sistema, el campo "Ubicación" debe permitir seleccionar una de las **Sedes Físicas** registradas.
*   En la App (Lado Cliente): Al ver el detalle de la tienda, se consulta la API de eventos filtrando por `location_id = store.id` para mostrar el carrusel "Próximos Eventos Aquí".

---

## 6. Logística E-commerce (Click & Collect)

Configuración para habilitar la tienda como punto de recogida de pedidos online.

*   **Habilitar Recogida:** Switch Sí/No.
*   **Tiempo de Preparación:** Tiempo estimado (ej. "Listo en 2 horas") mostrado al usuario en el Checkout.
*   **Instrucciones de Recogida:** Texto específico que se envía en el email de confirmación del pedido (ej. "Pregunta en la barra mostrando tu QR").
*   **Inventario:** (Fase Avanzada) Vinculación con un `warehouse_id` específico si se controla stock descentralizado.

---

## 7. Modelo de Datos Relacional (Entidades)

Esquema de base de datos propuesto para soportar esta funcionalidad.

### `stores`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único |
| `name` | String | Nombre comercial |
| `slug` | String | URL friendly unique name |
| `address` | String | Dirección completa |
| `latitude` | Decimal | Coordenada GPS |
| `longitude` | Decimal | Coordenada GPS |
| `phone` | String | Contacto |
| `is_active` | Boolean | Visibilidad global |
| `allow_pickup` | Boolean | Habilitado para Click & Collect |
| `pickup_instructions`| Text | Instrucciones post-compra |

### `store_hours`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador |
| `store_id` | FK | Relación con Store |
| `day_of_week` | Integer | 0 (Domingo) - 6 (Sábado) |
| `open_time` | Time | Hora apertura |
| `close_time` | Time | Hora cierre |
| `is_closed` | Boolean | Cierre semanal fijo (ej. "Lunes cerrado") |

### `store_special_hours`
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador |
| `store_id` | FK | Relación con Store |
| `date` | Date | Fecha específica |
| `is_closed` | Boolean | Cierre total |
| `open_time` | Time | Hora apertura especial |
| `close_time` | Time | Hora cierre especial |
| `note` | String | Motivo (ej. "Festivo") |

### `services` (Catálogo)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador |
| `name` | String | Nombre del servicio |
| `icon_key` | String | Referencia al icono (ej. "wifi", "paw") |

### `store_services` (Tabla Intermedia)
| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `store_id` | FK | Sede |
| `service_id` | FK | Servicio |
