# 11. Módulo de Moderación y Reseñas

## 1. Descripción General
Este módulo es el centro de control de calidad para todo el contenido generado por los usuarios (UGC) dentro del ecosistema de Mr. CoolCat. Su función principal es gestionar las valoraciones y reseñas de los productos para asegurar un entorno seguro, constructivo y alineado con la marca. Permite a los administradores moderar comentarios, destacar feedback valioso y gestionar la reputación de la marca mediante respuestas directas.

## 2. Funcionalidades Principales

### A. Bandeja de Reseñas (Review Inbox)
Interfaz centralizada para visualizar y gestionar las reseñas entrantes.

*   **Vistas:**
    *   **Lista Compacta:** Tabla con resumen (Usuario, Producto, Estrellas, Estado, Fecha).
    *   **Vista Detallada:** Tarjeta expandida para leer el comentario completo y ver contexto del pedido asociado (si aplica).
*   **Filtros y Búsqueda:**
    *   **Estado:** Pendiente (default), Aprobada, Rechazada.
    *   **Valoración:** Filtrar por rango de estrellas (ej. "Solo 1 estrella" para gestión de crisis, o "5 estrellas" para testimonios).
    *   **Producto:** Búsqueda por nombre o SKU.
    *   **Contenido:** Filtrar reseñas que contienen texto vs. solo valoración numérica.

### B. Acciones de Moderación
Herramientas para procesar cada reseña individualmente:

1.  **Aprobar (Approve):**
    *   Publica la reseña en la app y la web.
    *   Calcula y actualiza el promedio de valoración del producto.
2.  **Rechazar (Reject):**
    *   Oculta la reseña permanentemente.
    *   **Motivo de Rechazo:** Selector obligatorio (ej. "Lenguaje Ofensivo", "Spam/Bot", "Información Falsa", "Irrelevante").
3.  **Destacar (Highlight / Pin):**
    *   Marca la reseña para que aparezca prioritariamente en el detalle del producto ("Reseña destacada").
    *   Ideal para reseñas con fotos de alta calidad o descripciones muy útiles.
4.  **Responder (Reply):**
    *   Campo de texto para que el administrador (como "Mr. CoolCat Team") responda públicamente.
    *   Útil para agradecer fidelidad o gestionar quejas visibles.

### C. Métricas de Calidad
*   **Promedio Global:** Valoración media de todo el catálogo.
*   **Reseñas por Producto:** Top productos mejor y peor valorados.
*   **Tiempo de Moderación:** Tiempo medio entre creación y aprobación/rechazo.

## 3. Interfaz de Usuario (UI/UX)
Siguiendo las directrices de `DESIGN_SYSTEM.md` y `BACKOFFICE_DESIGN.md`:

*   **Estilo Visual:**
    *   **Fondo:** `#1A1A1A` (Dark Mode).
    *   **Tarjetas de Reseña:** Contenedores con fondo `#2C2C2C` y bordes redondeados (`borderRadius: 20`).
    *   **Estrellas:** Iconografía `Ionicons` (`star`, `star-outline`) en color `#F76934` (Naranja Vibrante).
*   **Tipografía:**
    *   **Producto:** `Truculenta_700Bold` (ej. "CERVEZA RUBIA 33CL").
    *   **Usuario:** `RobotoCondensed_600SemiBold` en `#E5E5E7`.
    *   **Comentario:** `RobotoCondensed_400Regular` en `#E5E5E7`.
    *   **Meta-data (Fecha):** `RobotoCondensed_400Regular` en `#9CA3AF`.
*   **Controles (Botones):**
    *   **Aprobar:** Botón Icono (Check) o Texto en color Éxito (`#4CAF50`).
    *   **Rechazar:** Botón Icono (X) o Texto en color Error (`#FF6B6B`).
    *   **Responder:** Botón Secundario (Outline) color `#F76934` o Blanco.

## 4. Estructura de Datos
Referencia técnica para la entidad `product_reviews` y su gestión.

| Campo | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | Identificador único de la reseña. |
| `product_id` | UUID | Referencia al producto reseñado. |
| `user_id` | UUID | Autor de la reseña. |
| `rating` | Integer | Valor de 1 a 5. |
| `comment` | Text | Texto del usuario (opcional). |
| `status` | Enum | `pending` (default), `approved`, `rejected`. |
| `rejection_reason` | String | Motivo si fue rechazada (opcional). |
| `is_featured` | Boolean | Si está destacada en el frontend. |
| `admin_reply` | Text | Respuesta oficial de la marca. |
| `reply_at` | Timestamp | Fecha de la respuesta. |
| `created_at` | Timestamp | Fecha de creación. |

## 5. Integración con otros Módulos
*   **Gamificación:** La acción de "Dejar una reseña" (una vez aprobada) dispara la recompensa de puntos (ej. +20 pts) en el **Módulo de Gamificación**.
*   **CRM:** Las reseñas quedan vinculadas a la "Ficha 360º del Cliente" para que soporte pueda ver el historial de satisfacción del usuario.
*   **Ecommerce:** Las valoraciones actualizan el `average_rating` en la ficha del producto (PIM).
