# Especificación Técnica: Módulo de Marketing y CMS

Este documento detalla los requisitos funcionales y técnicos para el módulo de Marketing y Gestión de Contenidos (CMS) del Backoffice de Mr. CoolCat. Este módulo es el motor principal para la dinamización de ventas, retención de usuarios y comunicación de la marca.

---

## 1. Gestión de Banners y Carruseles

El objetivo es permitir al equipo de marketing controlar el contenido visual destacado en la aplicación móvil (específicamente en `InicioScreen` y cabeceras de categorías) sin requerir actualizaciones de código.

### A. Funcionalidades Clave
1.  **CRUD de Banners:**
    *   Crear, Leer, Actualizar y Eliminar banners publicitarios.
    *   **Vista Previa:** Visualización de cómo se verá el banner en el dispositivo móvil (respetando las dimensiones y estilos del *Design System*).
2.  **Programación Temporal:**
    *   Definición de `Fecha Inicio` y `Fecha Fin` de publicación.
    *   El sistema debe ocultar/mostrar automáticamente los banners según la zona horaria del servidor.
3.  **Posicionamiento y Prioridad:**
    *   Selector de ubicación (ej. "Carrusel Principal Home", "Banner Secundario", "Cabecera Categoría IPAs").
    *   Campo numérico de `Orden/Prioridad` para definir la secuencia de visualización.

### B. Atributos del Dato (Schema)
*   `id`: UUID.
*   `image_url`: Enlace a la imagen optimizada (alojada en Supabase Storage o CDN).
*   `target_screen`: Pantalla de destino al hacer clic (Deep Link).
*   `target_params`: Parámetros JSON opcionales (ej. `{ productId: "123" }`).
*   `is_active`: Booleano.
*   `start_at`: Timestamp.
*   `end_at`: Timestamp.

---

## 2. Notificaciones Push Avanzadas

Sistema centralizado para el envío de comunicaciones directas a los dispositivos de los usuarios, integrado con Firebase Cloud Messaging (FCM) o OneSignal.

### A. Editor de Notificaciones
*   **Contenido Rico:**
    *   Campo para **Título** (corto e impactante, fuente `Truculenta` en la mente del diseñador).
    *   Campo para **Cuerpo** con soporte para Emojis.
    *   **Imagen Adjunta:** URL de imagen para notificaciones expandidas (Android/iOS).
*   **Segmentación de Audiencia:**
    *   *Todos los usuarios.*
    *   *Segmentos CRM:* Selección de etiquetas (ej. "VIP", "Inactivo > 30 días", "Amante de Lager").
    *   *Usuarios Específicos:* Búsqueda por ID o Email para pruebas.

### B. Sistema de Deep Linking
El admin no debe escribir URLs manuales. Se requiere un **Selector Visual de Destino**:
1.  **Tipo de Destino:** Dropdown (Producto, Evento, Categoría, Perfil, Juego, Oferta Externa).
2.  **Entidad Específica:** Buscador dinámico dependiente del tipo (ej. si elige "Producto", busca en la tabla `products`).
3.  **Generación:** El backend construye el payload del push (ej. `myapp://product/detail/xyz`).

### C. Programación de Envíos
*   **Envío Inmediato:** Dispara la cola de trabajos al instante.
*   **Envío Programado:** Selector de fecha y hora.
*   **Historial:** Log de envíos realizados con métricas básicas (Enviados, Recibidos, Aperturas/Clicks).

---

## 3. Sistema de Cupones y Descuentos

Motor promocional flexible para generar incentivos de compra.

### A. Configuración de Cupones
1.  **Generación de Códigos:**
    *   *Personalizado:* Texto definido por marketing (ej. `VERANO2025`).
    *   *Aleatorio:* Generación masiva de códigos únicos para campañas de email marketing (ej. `X7K-9L2-M4P`).
2.  **Tipos de Beneficio:**
    *   **Descuento Fijo:** Resta una cantidad exacta (ej. -5€).
    *   **Porcentaje:** Descuento porcentual sobre el total o items específicos (ej. -20%).
    *   **Envío Gratuito:** Anula los costes de envío.
    *   **Regalo:** Añade un producto específico al carrito a coste 0 (ej. "Vaso de regalo").

### B. Reglas y Restricciones (Validation Engine)
El cupón solo es válido si cumple *todas* las condiciones configuradas:
*   **Temporalidad:** Rango de fechas válido.
*   **Límites de Uso:**
    *   Uso único por usuario.
    *   Límite global de canjes (ej. "Solo los primeros 100").
*   **Requisitos del Carrito:**
    *   Compra mínima (ej. > 30€).
    *   Productos específicos incluidos/excluidos.
*   **Target de Usuario:** Válido solo para "Nuevos Usuarios" (primera compra) o segmentos específicos.

### C. Modelo de Datos
*   `code`: String (PK, Unique).
*   `type`: Enum (`percentage`, `fixed_amount`, `free_shipping`).
*   `value`: Decimal (valor del descuento).
*   `min_cart_amount`: Decimal (nullable).
*   `max_discount_amount`: Decimal (tope para descuentos porcentuales).
*   `usage_limit`: Integer.
*   `usage_count`: Integer (contador actual).
*   `expires_at`: Timestamp.

---

## 4. Integración con Design System
Aunque este módulo es de gestión interna, los elementos visuales generados impactan la App:
*   **Validación de Assets:** El CMS debe sugerir o forzar proporciones de imagen acordes al diseño de la App (Tarjetas con `borderRadius: 20-30`).
*   **Colores:** Al previsualizar banners con texto superpuesto, asegurar contraste suficiente con la paleta oscura (`#1A1A1A`) y acentos naranjas (`#F76934`).
