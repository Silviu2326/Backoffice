# Especificación Técnica Maestra del Backoffice - Mr. CoolCat App

Este documento constituye la referencia definitiva para el desarrollo del panel de administración (Backoffice). Cubre la gestión operativa, estratégica, logística y de soporte para todo el ecosistema digital y físico de Mr. CoolCat.

---

## 1. Arquitectura, Seguridad y Control de Acceso

### A. Tecnología Base
*   **Frontend:** React (Next.js o Vite) + Framework UI (Refine, React Admin, o Tailwind UI).
*   **Backend:** Node.js + Supabase (PostgreSQL).
*   **Infraestructura:** Alojado en Vercel/Netlify o contenedor Docker.

### B. Gestión de Roles y Permisos (RBAC)
El sistema debe permitir la creación de roles granulares:
1.  **Super Admin:** Acceso irrestricto, gestión de facturación y configuración sensible.
2.  **Store Manager:** Gestión de pedidos, inventario y logística.
3.  **Marketing Lead:** Gestión de personajes, eventos, notificaciones push y CMS.
4.  **Soporte al Cliente:** Acceso a CRM, pedidos y chat (solo lectura de datos sensibles).
5.  **Content Creator:** Acceso limitado a la biblioteca de medios y blog.

### C. Auditoría y Seguridad (Audit Logs)
*   **Registro de Actividad:** Cada acción de escritura (crear, editar, borrar) debe quedar registrada:
    *   *Quién:* ID del administrador.
    *   *Qué:* Recurso modificado (ej. "Precio Cerveza Morena").
    *   *Cambio:* Valor anterior vs. Valor nuevo.
    *   *Cuándo:* Timestamp.

---

## 2. Dashboard Ejecutivo (Business Intelligence)

Un centro de mando visual con selectores de rango de fechas.

*   **Ventas y Finanzas:**
    *   Ingresos Brutos vs Netos.
    *   Ticket Medio (AOV).
    *   Tasa de Conversión (Carritos creados vs Pedidos pagados).
*   **Operativa:**
    *   Pedidos en "Alerta" (retrasados más de 48h).
    *   Inventario con Stock Crítico (<10 unidades).
*   **Comunidad:**
    *   Usuarios Activos (DAU/MAU).
    *   Retención de usuarios (Cohortes).
    *   Top Usuarios (por gasto o puntos).
*   **Gamificación:**
    *   Participación en "Beer Run".
    *   Logros desbloqueados hoy.

---

## 3. Módulo CRM (Gestión de Relaciones con Clientes)
*Gestión profunda del perfil del usuario para soporte y marketing.*

*   **Ficha 360º del Cliente:**
    *   **Datos Personales:** Nombre, Email, Teléfono, Fecha Nacimiento (Edad validada).
    *   **Resumen Financiero:** LTV (Lifetime Value), Total gastado, Número de pedidos.
    *   **Historial de Actividad:** Logins, Eventos asistidos, Partidas jugadas.
    *   **Gamificación:** Saldo de puntos actual, Historial de canjes, Nivel de lealtad.
    *   **Segmentación:** Etiquetas automáticas (ej. "VIP", "Amante de IPAs", "Inactivo > 90 días") y manuales.
*   **Acciones de Soporte:**
    *   Restablecer contraseña.
    *   Bloquear usuario (Ban) por comportamiento fraudulento.
    *   **Ajuste de Saldo:** Sumar/Restar puntos manualmente con nota justificativa ("Compensación por error en pedido").
    *   Enviar email individual desde la plataforma.

---

## 4. Módulo de E-commerce Avanzado

### A. Gestión de Pedidos
*   **Pipeline de Estados:** Pendiente Pago -> Pagado -> En Preparación -> Listo para Envío -> Enviado -> Entregado -> Devuelto.
*   **Incidencias:** Marcar pedidos con incidencias (ej. "Dirección incorrecta") que pausan el flujo logístico.
*   **Facturación:** Generación automática de PDF de factura/albarán.

### B. Logística y Envíos
*   **Zonas de Envío:** Configurar tarifas por región (ej. Península, Baleares, Canarias, Internacional).
*   **Reglas de Envío:**
    *   Coste base.
    *   Umbral de envío gratuito (ej. >35€).
    *   Incremento por peso (opcional).
*   **Integración de Transportistas:** Campo para introducir URL de seguimiento (Tracking Number) que se envía al usuario.

### C. Carritos Abandonados
*   Listado de carritos con antigüedad > 1 hora y < 48 horas.
*   Botón de "Recuperar": Envía un email automático/Push recordatorio con enlace directo al checkout.

---

## 5. Módulo de Catálogo y Productos (PIM)

*   **Gestión de Productos:**
    *   **Variantes:** Manejo de formatos (Botella individual, Pack x6, Caja x24) bajo una misma ficha padre.
    *   **Cross-selling:** Definir "Productos recomendados" que aparecen en el detalle de cada cerveza (ej. "Si te gusta Morena, prueba este Vaso").
    *   **SEO:** Meta títulos y descripciones para la web compartida.
*   **Gestión de Inventario Multi-almacén:**
    *   Stock Almacén Central (Envíos online).
    *   Stock Tiendas Físicas (Para Click & Collect).
    *   Movimientos de stock (Entradas de proveedor, Ajustes por merma/rotura).

---

## 6. Módulo de Tiendas Físicas (Retail)
*Gestión de los puntos reflejados en `MapaScreen`.*

*   **Sedes:**
    *   Datos de contacto, ubicación y fotos del local.
    *   **Horarios Dinámicos:** Configuración de horarios especiales (Festivos).
*   **Servicios:** Iconografía de servicios (Wifi, Terraza, Acceso Discapacitados).
*   **Eventos en Sede:** Vincular qué eventos del módulo de Eventos ocurren en esta sede específica.

---

## 7. Módulo de Brand Management (Personajes)
*CMS especializado para la narrativa de la marca (`PersonajesScreen`).*

*   **Editor de Personajes:**
    *   Biografía, Personalidad, Intereses.
    *   **Assets Visuales:** Avatar (PNG transparente), Fondo de Pantalla, Video de Presentación.
    *   **Paleta de Colores:** Definir Hex codes primarios y secundarios para adaptar la UI de la app al personaje.
*   **Vinculación:** Relación directa 1:1 o 1:N entre Personaje y Productos (ej. "Sifrina" es la cara de la "IPA Sin Gluten" y del "Pack Degustación").

---

## 8. Módulo de Eventos y Experiencias

*   **Gestor de Eventos:**
    *   Configuración de aforo y lista de espera.
    *   **Tipos de Ticket:** General, VIP, Early Bird.
*   **Herramientas de Check-in:**
    *   Generador de listados para puerta.
    *   Visor de escáner QR (para usar el móvil del staff como validador conectado al backoffice).
*   **Feedback:** Encuestas automáticas post-evento enviadas a los asistentes.

---

## 9. Módulo de Gamificación y Lealtad

### A. Motor de Reglas
*   Configurar la economía de puntos:
    *   Ratio Euro/Punto (ej. 1€ = 10 puntos).
    *   Bonus por acciones (Registro = 50pts, Reseña = 20pts).

### B. Logros (Badges)
*   **Editor de Condiciones:** Constructor visual de reglas (ej. `Producto.Category == 'IPA' AND Count >= 5`).
*   **Diseño:** Subida de iconos para logros bloqueados y desbloqueados.

### C. Configuración de Juegos
*   **Beer Run:**
    *   Ajustar dificultad (velocidad base, frecuencia de obstáculos).
    *   Activar/Desactivar recompensas por puntuación.
*   **Quiz:**
    *   Árbol de decisión para recomendar cervezas basado en respuestas.

---

## 10. Módulo de Marketing y Contenidos (CMS)

*   **Banners y Carruseles:** Gestión de la pantalla `InicioScreen`. Programación de banners (fecha inicio/fin).
*   **Notificaciones Push Avanzadas:**
    *   Editor de texto enriquecido (emojis).
    *   **Deep Linking:** Selector visual para elegir a dónde lleva el clic (Producto X, Evento Y, Pantalla Perfil).
    *   Programador de envíos.
*   **Cupones y Descuentos:**
    *   Códigos únicos (un solo uso) o genéricos.
    *   Restricciones (Solo nuevos usuarios, Compra mínima).

---

## 11. Módulo de Moderación y Reseñas
*Control de calidad sobre el contenido generado por el usuario.*

*   **Bandeja de Reseñas:** Ver valoraciones de cervezas.
*   **Acciones:** Aprobar, Rechazar (contenido ofensivo), Destacar (aparecer primero).
*   **Respuestas:** Capacidad del admin para responder públicamente a una reseña.

---

## 12. Configuración Global del Sistema

*   **Versiones de App:**
    *   Control de "Actualización Forzosa" (Min Client Version).
    *   Mensaje de mantenimiento (App en modo solo lectura).
*   **Textos Legales:**
    *   Editor WYSIWYG para Política de Privacidad, Términos de Uso.
    *   Versionado de documentos legales (obliga al usuario a re-aceptar si cambia la versión).
*   **Variables de Entorno:** Configuración de claves API públicas, emails de contacto, enlaces a redes sociales.

---

## 13. Resumen de Entidades de Base de Datos (Backend)

Para soportar esta especificación masiva, se requiere un esquema relacional robusto:

1.  `admin_users` (Accesos al backoffice)
2.  `audit_logs` (Seguridad)
3.  `users` (Clientes App)
4.  `user_addresses`
5.  `products`
6.  `product_variants`
7.  `product_reviews`
8.  `categories`
9.  `inventory_logs`
10. `orders`
11. `order_items`
12. `coupons`
13. `stores` (Sedes físicas)
14. `store_hours`
15. `events`
16. `tickets` (Tipos de entrada)
17. `event_registrations`
18. `characters` (CMS Personajes)
19. `achievements`
20. `user_achievements`
21. `loyalty_transactions` (Historial puntos)
22. `notifications_schedule`
23. `app_settings` (Config global)
24. `game_leaderboards`
