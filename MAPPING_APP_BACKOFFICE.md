# Mapeo de Módulos: App Móvil vs Backoffice

Este documento establece la correspondencia entre las pantallas (screens) de la aplicación móvil y los módulos del panel de administración (backoffice).

---

## 📱 Pantallas de la App Móvil → 🔧 Módulos del Backoffice

### 1. **InicioScreen** → Múltiples Módulos
**Pantalla:** Pantalla principal de la app con banners, cerveza del mes, eventos destacados, etc.

**Módulos del Backoffice relacionados:**
- **Marketing → BannerManager** (`/admin/marketing/banners`)
  - Gestión de banners promocionales que aparecen en la pantalla de inicio
  - Programación de banners con fechas de inicio/fin
  - Configuración de deep linking a productos/eventos
  
- **Products → ProductList** (`/admin/products`)
  - Configuración de "Cerveza del Mes" (producto destacado)
  - Gestión de productos que aparecen en secciones destacadas
  
- **Events → EventCalendar** (`/admin/events`)
  - Eventos destacados que se muestran en la pantalla de inicio
  - Configuración de eventos promocionados

- **Marketing → CampaignManager** (`/admin/marketing/campaigns`)
  - Campañas promocionales que se muestran como banners
  - Notificaciones push relacionadas con ofertas

---

### 2. **TiendaScreen** → Productos y Marketing
**Pantalla:** Catálogo de productos (cervezas, packs, merch) con categorías y filtros.

**Módulos del Backoffice relacionados:**
- **Products → ProductList** (`/admin/products`)
  - Gestión completa del catálogo de productos
  - Creación, edición y eliminación de productos
  - Configuración de categorías (Cervezas, Packs, Merch)
  - Gestión de variantes (Botella individual, Pack x6, Caja x24)
  - Configuración de precios y disponibilidad
  
- **Products → ProductEditor** (`/admin/products/edit`)
  - Edición detallada de productos individuales
  - Configuración de SEO (meta títulos, descripciones)
  - Gestión de imágenes y medios
  - Configuración de cross-selling (productos recomendados)

- **Marketing → CouponManager** (`/admin/marketing/coupons`)
  - Gestión de códigos promocionales aplicables en la tienda
  - Configuración de descuentos y ofertas especiales

---

### 3. **CartScreen** → Pedidos y Marketing
**Pantalla:** Carrito de compras con productos seleccionados, códigos promocionales y cálculo de envío.

**Módulos del Backoffice relacionados:**
- **Orders → OrderList** (`/admin/orders`)
  - Visualización de carritos abandonados (carritos con antigüedad > 1 hora)
  - Funcionalidad de "Recuperar carrito" (envío de email recordatorio)
  
- **Marketing → CouponManager** (`/admin/marketing/coupons`)
  - Gestión de códigos promocionales que los usuarios pueden aplicar
  - Configuración de reglas de descuento (mínimo de compra, restricciones)

- **Settings → GlobalSettings** (`/admin/settings`)
  - Configuración de umbral de envío gratis (ej: >35€)
  - Configuración de tarifas de envío

---

### 4. **CheckoutScreen** → Pedidos y Retail
**Pantalla:** Proceso de pago y selección de método de entrega (domicilio o recogida en tienda).

**Módulos del Backoffice relacionados:**
- **Orders → OrderList** (`/admin/orders`)
  - Visualización de pedidos creados desde el checkout
  - Seguimiento del estado de pedidos
  
- **Orders → OrderDetail** (`/admin/orders/:id`)
  - Detalle completo de cada pedido
  - Información de cliente, productos, método de pago y entrega
  
- **Retail → StoreList** (`/admin/retail`)
  - Gestión de tiendas físicas para opción "Click & Collect"
  - Configuración de disponibilidad de recogida

---

### 5. **CervezaScreen** → Productos
**Pantalla:** Catálogo especializado de cervezas con búsqueda, filtros y ordenamiento.

**Módulos del Backoffice relacionados:**
- **Products → ProductList** (`/admin/products`)
  - Gestión del catálogo de cervezas
  - Configuración de filtros disponibles (tipo, ABV, IBU, etc.)
  - Configuración de ordenamiento (más populares, precio, etc.)
  
- **Products → ProductEditor** (`/admin/products/edit`)
  - Edición de información detallada de cada cerveza
  - Configuración de atributos (ABV, IBU, SRM, tipo, etc.)

---

### 6. **BeerDetailScreen** → Productos y Brand
**Pantalla:** Detalle completo de una cerveza con información técnica, personaje asociado, lugares de venta.

**Módulos del Backoffice relacionados:**
- **Products → ProductEditor** (`/admin/products/edit`)
  - Edición de toda la información técnica (ABV, IBU, SRM)
  - Descripción, aroma, sabor, final
  - Ingredientes y alérgenos
  - Configuración de formatos disponibles
  - Gestión de imágenes y medios
  
- **Brand → CharacterList** (`/admin/characters`)
  - Vinculación de personajes con productos
  - Gestión de la relación 1:1 o 1:N entre personaje y cerveza
  
- **Brand → CharacterEditor** (`/admin/characters/:id`)
  - Edición de información del personaje asociado
  - Biografía, personalidad, intereses, quote
  
- **Retail → StoreList** (`/admin/retail`)
  - Gestión de puntos de venta donde está disponible la cerveza
  - Información de tiendas físicas y bares

---

### 7. **EventosScreen** → Eventos
**Pantalla:** Lista y calendario de eventos disponibles, con filtros y vista de calendario.

**Módulos del Backoffice relacionados:**
- **Events → EventCalendar** (`/admin/events`)
  - Gestión completa de eventos
  - Creación, edición y eliminación de eventos
  - Configuración de fechas, horarios, ubicaciones
  - Configuración de tipos de evento (concierto, conferencia, taller, reunión)
  - Gestión de aforo y lista de espera
  
- **Events → EventEditor** (`/admin/events/:id`)
  - Edición detallada de eventos individuales
  - Configuración de descripción, precio, puntos de recompensa
  - Gestión de tipos de ticket (General, VIP, Early Bird)

---

### 8. **EventRegistrationScreen** → Eventos y CRM
**Pantalla:** Formulario de registro a eventos con información de asistentes.

**Módulos del Backoffice relacionados:**
- **Events → EventCalendar** (`/admin/events`)
  - Visualización de registros a eventos
  - Gestión de lista de asistentes
  - Herramientas de check-in para eventos
  
- **Events → EventEditor** (`/admin/events/:id`)
  - Configuración de campos del formulario de registro
  - Configuración de restricciones (edad, aforo máximo)
  - Gestión de tipos de ticket y precios
  
- **CRM → CustomerList** (`/admin/crm/customers`)
  - Registro automático de usuarios que se registran a eventos
  - Actualización de perfil de cliente con asistencia a eventos

---

### 9. **PersonajesScreen** → Brand Management
**Pantalla:** Galería de personajes de la marca con información detallada de cada uno.

**Módulos del Backoffice relacionados:**
- **Brand → CharacterList** (`/admin/characters`)
  - Gestión de todos los personajes de la marca
  - Visualización de personajes disponibles
  
- **Brand → CharacterEditor** (`/admin/characters/:id`)
  - Edición completa de personajes
  - Biografía, personalidad, intereses
  - Gestión de assets visuales (avatar, fondo, video)
  - Configuración de paleta de colores del personaje
  - Quote y descripción
  - Vinculación con productos (cervezas asociadas)

---

### 10. **LogrosScreen** → Gamificación
**Pantalla:** Sistema de logros y badges con categorías y progreso.

**Módulos del Backoffice relacionados:**
- **Loyalty → GamificationDashboard** (`/admin/gamification`)
  - Dashboard general de gamificación
  - Visualización de estadísticas de logros
  - Participación de usuarios en el sistema de logros
  
- **Loyalty → BadgeEditor** (`/admin/gamification/badges`)
  - Creación y edición de logros/badges
  - Configuración de condiciones para desbloquear logros
  - Diseño de iconos (bloqueado/desbloqueado)
  - Configuración de recompensas (puntos, descuentos, badges especiales)
  
- **Loyalty → RulesConfig** (`/admin/gamification/rules`)
  - Configuración de reglas de gamificación
  - Ratio Euro/Punto
  - Bonus por acciones (registro, reseña, etc.)
  - Configuración de condiciones de logros (ej: "Prueba 5 cervezas diferentes")

---

### 11. **BeerRunScreen** → Gamificación
**Pantalla:** Juego Beer Run (en desarrollo).

**Módulos del Backoffice relacionados:**
- **Loyalty → GamificationDashboard** (`/admin/gamification`)
  - Configuración del juego Beer Run
  - Ajuste de dificultad (velocidad base, frecuencia de obstáculos)
  - Activación/desactivación de recompensas por puntuación
  - Visualización de estadísticas de juego (participación, puntuaciones)
  
- **Loyalty → RulesConfig** (`/admin/gamification/rules`)
  - Configuración de puntos otorgados por jugar
  - Configuración de recompensas por alcanzar ciertas puntuaciones

---

### 12. **QuizScreen** → Productos y Gamificación
**Pantalla:** Quiz interactivo para recomendar cervezas basado en preferencias del usuario.

**Módulos del Backoffice relacionados:**
- **Products → ProductList** (`/admin/products`)
  - Gestión de cervezas que aparecen como recomendaciones
  - Configuración de atributos que se usan en el algoritmo de recomendación
  
- **Loyalty → GamificationDashboard** (`/admin/gamification`)
  - Configuración del árbol de decisión del quiz
  - Lógica de recomendación basada en respuestas
  - Posible recompensa de puntos por completar el quiz
  
- **Loyalty → RulesConfig** (`/admin/gamification/rules`)
  - Configuración de puntos otorgados por completar el quiz

---

### 13. **MapaScreen** → Retail
**Pantalla:** Mapa interactivo con puntos de venta y ubicaciones de tiendas físicas.

**Módulos del Backoffice relacionados:**
- **Retail → StoreList** (`/admin/retail`)
  - Gestión de todas las tiendas físicas
  - Visualización de lista de puntos de venta
  
- **Retail → StoreDetail** (`/admin/retail/:id`)
  - Edición detallada de cada tienda
  - Configuración de coordenadas GPS (latitud, longitud)
  - Datos de contacto, dirección
  - Horarios de apertura
  - Fotos del local
  - Servicios disponibles (Wifi, Terraza, Acceso Discapacitados)

---

### 14. **BaresScreen** → Retail
**Pantalla:** Lista de bares y tiendas físicas con información detallada, filtros y búsqueda.

**Módulos del Backoffice relacionados:**
- **Retail → StoreList** (`/admin/retail`)
  - Gestión completa de bares y tiendas
  - Creación, edición y eliminación de ubicaciones
  - Configuración de información básica (nombre, dirección, teléfono)
  
- **Retail → StoreDetail** (`/admin/retail/:id`)
  - Edición detallada de cada bar/tienda
  - Horarios de apertura (incluyendo horarios especiales para festivos)
  - Configuración de servicios (iconografía)
  - Gestión de eventos en sede (vinculación con módulo de eventos)
  - Ratings y reseñas del local

---

### 15. **NotificacionesScreen** → Marketing y Gamificación
**Pantalla:** Centro de notificaciones con diferentes tipos (logros, promociones, eventos, etc.).

**Módulos del Backoffice relacionados:**
- **Marketing → CampaignManager** (`/admin/marketing/campaigns`)
  - Gestión de notificaciones push
  - Editor de notificaciones con texto enriquecido (emojis)
  - Configuración de deep linking (a dónde lleva el clic)
  - Programador de envíos de notificaciones
  - Segmentación de audiencia para notificaciones
  
- **Loyalty → GamificationDashboard** (`/admin/gamification`)
  - Notificaciones automáticas de logros desbloqueados
  - Notificaciones de recompensas disponibles
  
- **Events → EventCalendar** (`/admin/events`)
  - Notificaciones de nuevos eventos disponibles
  - Recordatorios de eventos próximos
  
- **Orders → OrderList** (`/admin/orders`)
  - Notificaciones de estado de pedidos (enviado, entregado, etc.)

---

## 📊 Resumen de Correspondencias

### Módulos del Backoffice y sus Pantallas Relacionadas

#### **Dashboard** (`/admin/dashboard`)
- No tiene pantalla directa en la app móvil
- Proporciona métricas y KPIs que reflejan el uso de todas las pantallas

#### **CRM** (`/admin/crm/customers`)
- **CustomerList**: Relacionado con todas las pantallas que requieren autenticación
- **CustomerDetail**: Perfil de usuario (no visible en las screens proporcionadas, pero implícito)

#### **Pedidos** (`/admin/orders`)
- **OrderList**: CartScreen, CheckoutScreen
- **OrderDetail**: CheckoutScreen (después de completar pedido)

#### **Productos** (`/admin/products`)
- **ProductList**: TiendaScreen, CervezaScreen
- **ProductEditor**: BeerDetailScreen, CervezaScreen

#### **Retail** (`/admin/retail`)
- **StoreList**: MapaScreen, BaresScreen
- **StoreDetail**: MapaScreen, BaresScreen, BeerDetailScreen (lugares de venta)

#### **Brand** (`/admin/characters`)
- **CharacterList**: PersonajesScreen
- **CharacterEditor**: PersonajesScreen, BeerDetailScreen

#### **Eventos** (`/admin/events`)
- **EventCalendar**: EventosScreen, InicioScreen (eventos destacados)
- **EventEditor**: EventRegistrationScreen

#### **Gamificación** (`/admin/gamification`)
- **GamificationDashboard**: LogrosScreen, BeerRunScreen, QuizScreen
- **BadgeEditor**: LogrosScreen
- **RulesConfig**: LogrosScreen, BeerRunScreen, QuizScreen

#### **Marketing** (`/admin/marketing`)
- **CampaignManager**: InicioScreen (banners), NotificacionesScreen
- **CouponManager**: CartScreen, TiendaScreen
- **BannerManager**: InicioScreen

#### **Moderación** (`/admin/moderation`)
- **ReviewInbox**: BeerDetailScreen (reseñas de cervezas)

#### **Configuración** (`/admin/settings`)
- **GlobalSettings**: Todas las pantallas (configuración global)
- **AuditLogViewer**: No tiene pantalla directa (herramienta administrativa)

---

## 🔄 Flujos de Datos Principales

### Flujo de Compra
1. **TiendaScreen** → Usuario navega productos (ProductList)
2. **BeerDetailScreen** → Usuario ve detalle (ProductEditor)
3. **CartScreen** → Usuario agrega productos (OrderList - carritos)
4. **CheckoutScreen** → Usuario completa compra (OrderList/OrderDetail)
5. **NotificacionesScreen** → Usuario recibe confirmación (CampaignManager)

### Flujo de Eventos
1. **InicioScreen** → Usuario ve eventos destacados (EventCalendar)
2. **EventosScreen** → Usuario explora eventos (EventCalendar)
3. **EventRegistrationScreen** → Usuario se registra (EventCalendar, CustomerList)
4. **NotificacionesScreen** → Usuario recibe confirmación (CampaignManager)

### Flujo de Gamificación
1. **LogrosScreen** → Usuario ve logros (BadgeEditor, RulesConfig)
2. **BeerRunScreen** → Usuario juega (GamificationDashboard, RulesConfig)
3. **QuizScreen** → Usuario completa quiz (GamificationDashboard, RulesConfig)
4. **NotificacionesScreen** → Usuario recibe notificación de logro (CampaignManager)

---

## 📝 Notas Importantes

1. **Algunas pantallas no tienen módulo directo en el backoffice:**
   - No hay un módulo específico para gestionar el contenido de **InicioScreen** (banners se gestionan en Marketing, pero el layout general no tiene editor)
   - **NotificacionesScreen** es principalmente de solo lectura para usuarios, pero se gestiona desde Marketing

2. **Módulos del backoffice sin pantalla directa en la app:**
   - **Dashboard**: Solo administrativo
   - **Moderation → ReviewInbox**: Los usuarios ven reseñas pero no las gestionan
   - **Settings**: Solo administrativo

3. **Funcionalidades cruzadas:**
   - Muchas pantallas dependen de múltiples módulos del backoffice
   - El sistema de puntos/gamificación está integrado en múltiples pantallas
   - Las notificaciones se generan desde múltiples fuentes (Marketing, Gamificación, Eventos, Pedidos)

---

## ⚠️ Pantallas Sin Gestión Completa en el Backoffice

A continuación se listan las pantallas de la app móvil que **NO tienen un módulo completo o específico** en el backoffice para su gestión:

### 🔴 **1. InicioScreen - Gestión Parcial**

**Funcionalidades que SÍ se gestionan:**
- ✅ Banners promocionales → `BannerManager` (existe pero **NO está en las rutas**)
- ✅ Eventos destacados → `EventCalendar`
- ✅ Productos → `ProductList`

**Funcionalidades que NO se gestionan:**
- ❌ **"Cerveza del Mes"**: No hay un módulo específico para configurar qué producto es la cerveza del mes
  - **Necesita**: Campo en `ProductEditor` o módulo dedicado para seleccionar producto destacado
  - **Necesita**: Configuración de fecha de inicio/fin para la promoción
  
- ❌ **Layout de la pantalla de inicio**: No hay editor para configurar qué secciones mostrar/ocultar
  - **Necesita**: Módulo de configuración de layout (orden de secciones, visibilidad)
  - **Necesita**: Gestión de secciones: "Cerveza del Mes", "Nuestras Cervezas", "Próximos Eventos", "Beer Run", etc.
  
- ❌ **Secciones destacadas**: No hay forma de configurar qué productos aparecen en "Nuestras Cervezas"
  - **Necesita**: Sistema de productos destacados/featured con orden personalizable

**Acción requerida:**
- Agregar `BannerManager` a las rutas del backoffice (`/admin/marketing/banners`)
- Crear módulo de configuración de "Homepage Layout" o extender `GlobalSettings`
- Agregar funcionalidad de "Producto Destacado" en `ProductEditor` o crear módulo dedicado

---

### 🟡 **2. QuizScreen - Gestión Parcial**

**Funcionalidades que SÍ se gestionan:**
- ✅ Productos recomendados → `ProductList`
- ✅ Puntos por completar quiz → `RulesConfig`

**Funcionalidades que NO se gestionan:**
- ❌ **Árbol de decisión del quiz**: No hay editor visual para configurar las preguntas y respuestas
  - **Necesita**: Editor de preguntas del quiz
  - **Necesita**: Configuración de lógica de recomendación (qué respuestas llevan a qué cerveza)
  - **Necesita**: Gestión de opciones de respuesta y valores asociados
  
- ❌ **Lógica de recomendación**: La relación pregunta-respuesta-recomendación no es configurable
  - **Necesita**: Sistema de reglas configurables para el algoritmo de recomendación

**Acción requerida:**
- Crear módulo `QuizEditor` (`/admin/gamification/quiz`) o extender `GamificationDashboard`
- Implementar editor visual de preguntas y respuestas
- Sistema de configuración de reglas de recomendación

---

### 🟡 **3. BeerRunScreen - Gestión Parcial**

**Funcionalidades que SÍ se gestionan:**
- ✅ Recompensas por puntuación → `RulesConfig`
- ✅ Estadísticas generales → `GamificationDashboard`

**Funcionalidades que NO se gestionan:**
- ❌ **Configuración del juego**: No hay panel específico para ajustar parámetros del juego
  - **Necesita**: Editor de configuración de dificultad (velocidad base, frecuencia de obstáculos)
  - **Necesita**: Configuración de niveles y obstáculos
  - **Necesita**: Gestión de assets del juego (sprites, sonidos)
  
- ❌ **Leaderboard/Clasificaciones**: No hay gestión de rankings del juego
  - **Necesita**: Visualización y gestión de puntuaciones altas
  - **Necesita**: Sistema de premios por posición en ranking

**Acción requerida:**
- Extender `GamificationDashboard` con pestaña "Beer Run Config"
- Crear módulo `GameConfig` para ajustar parámetros del juego
- Implementar visualización de leaderboards en el backoffice

---

### 🟡 **4. NotificacionesScreen - Gestión Indirecta**

**Estado:** La pantalla es principalmente de **solo lectura** para usuarios, pero la gestión está fragmentada.

**Funcionalidades que SÍ se gestionan:**
- ✅ Notificaciones push → `CampaignManager`
- ✅ Notificaciones de logros → `GamificationDashboard` (automáticas)
- ✅ Notificaciones de eventos → `EventCalendar` (automáticas)
- ✅ Notificaciones de pedidos → `OrderList` (automáticas)

**Funcionalidades que NO se gestionan centralizadamente:**
- ❌ **Centro de gestión unificado**: No hay un módulo único para ver todas las notificaciones enviadas
  - **Necesita**: Dashboard de notificaciones con historial completo
  - **Necesita**: Estadísticas de entrega, apertura y clics por tipo de notificación
  
- ❌ **Plantillas de notificaciones**: No hay sistema de plantillas reutilizables
  - **Necesita**: Editor de plantillas de notificaciones por tipo (logro, promoción, evento, etc.)

**Acción requerida:**
- Crear módulo `NotificationCenter` (`/admin/marketing/notifications`) o extender `CampaignManager`
- Implementar sistema de plantillas de notificaciones
- Dashboard unificado de historial y estadísticas de notificaciones

---

### 🟢 **5. CartScreen - Gestión Parcial**

**Funcionalidades que SÍ se gestionan:**
- ✅ Códigos promocionales → `CouponManager`
- ✅ Configuración de envío → `GlobalSettings`

**Funcionalidades que NO se gestionan:**
- ❌ **Carritos abandonados**: Mencionado en el documento pero puede no estar implementado
  - **Necesita**: Lista de carritos abandonados con filtros (tiempo, valor, etc.)
  - **Necesita**: Funcionalidad de "Recuperar carrito" con envío automático de email
  - **Necesita**: Estadísticas de conversión de carritos abandonados

**Acción requerida:**
- Verificar e implementar funcionalidad de carritos abandonados en `OrderList`
- Agregar sección dedicada o filtro para carritos abandonados
- Implementar sistema de emails automáticos de recuperación

---

### 🟢 **6. BaresScreen - Gestión Parcial**

**Funcionalidades que SÍ se gestionan:**
- ✅ Lista de bares → `StoreList`
- ✅ Información básica → `StoreDetail`

**Funcionalidades que NO se gestionan completamente:**
- ❌ **Ratings y reseñas de bares**: Mencionado pero puede no estar implementado
  - **Necesita**: Sistema de reseñas específico para tiendas/bares
  - **Necesita**: Moderación de reseñas de bares (similar a `ReviewInbox` pero para tiendas)
  
- ❌ **Especialidades de bares**: Gestión de qué cervezas ofrece cada bar
  - **Necesita**: Vinculación productos-tiendas en `StoreDetail`
  - **Necesita**: Configuración de "especialidades" o cervezas destacadas por bar

**Acción requerida:**
- Extender `StoreDetail` con sección de productos disponibles
- Crear sistema de reseñas para tiendas o extender `ReviewInbox`
- Agregar campo de "especialidades" en la ficha de tienda

---

## 📋 Resumen de Módulos Faltantes

### Módulos que necesitan ser creados:

1. **HomepageLayoutManager** (`/admin/marketing/homepage`)
   - Gestión del layout de la pantalla de inicio
   - Configuración de secciones visibles/ocultas
   - Orden de secciones

2. **FeaturedProductManager** (`/admin/products/featured`)
   - Configuración de "Cerveza del Mes"
   - Productos destacados
   - Fechas de promoción

3. **QuizEditor** (`/admin/gamification/quiz`)
   - Editor de preguntas del quiz
   - Configuración de lógica de recomendación
   - Gestión de opciones y respuestas

4. **GameConfig** (`/admin/gamification/games`)
   - Configuración de Beer Run
   - Parámetros de dificultad
   - Gestión de leaderboards

5. **NotificationCenter** (`/admin/marketing/notifications`)
   - Dashboard unificado de notificaciones
   - Plantillas de notificaciones
   - Historial y estadísticas

6. **AbandonedCartManager** (extensión de `OrderList`)
   - Lista de carritos abandonados
   - Sistema de recuperación automática
   - Estadísticas de conversión

### Módulos que existen pero no están en rutas:

1. **BannerManager** - Existe el archivo pero no está en `routes.ts`
   - **Acción**: Agregar ruta `/admin/marketing/banners`

---

## 🎯 Prioridades de Implementación

### Alta Prioridad:
1. ✅ Agregar `BannerManager` a las rutas
2. ✅ Implementar gestión de "Cerveza del Mes" (FeaturedProductManager)
3. ✅ Sistema de carritos abandonados

### Media Prioridad:
4. ⚠️ Editor de Quiz (QuizEditor)
5. ⚠️ Configuración de Beer Run (GameConfig)
6. ⚠️ Centro de notificaciones unificado

### Baja Prioridad:
7. ⚪ Gestión de layout de homepage
8. ⚪ Sistema de reseñas para bares
9. ⚪ Especialidades de bares

---

**Última actualización:** Diciembre 2024
**Versión del documento:** 1.1

