# Estado de Conexión a Supabase por Página

Este documento detalla qué páginas de la aplicación están actualmente integradas con Supabase para la persistencia de datos y cuáles funcionan con datos simulados (Mock Data) o estado local.

## ✅ Conectadas a Supabase

Estas páginas leen o escriben datos directamente en Supabase a través de servicios de API.

| Página | Ruta del Archivo | Servicios Utilizados |
| :--- | :--- | :--- |
| **Dashboard** | `src/pages/Dashboard.tsx` | `dashboardService` |
| **Lista de Pedidos** | `src/pages/orders/OrderList.tsx` | `orderService` |
| **Detalle de Pedido** | `src/pages/orders/OrderDetail.tsx` | `orderService` |
| **Lista de Clientes** | `src/pages/crm/CustomerList.tsx` | `customerService`, `orderService` |
| **Detalle de Cliente** | `src/pages/crm/CustomerDetail.tsx` | `customerService`, `orderService`, `userAchievementService` |
| **Lista de Productos** | `src/pages/products/ProductList.tsx` | `productVariantService` |
| **Editor de Productos** | `src/pages/products/ProductEditor.tsx` | `productService` |
| **Lista de Tiendas** | `src/pages/retail/StoreList.tsx` | `storeService` |
| **Detalle de Tienda** | `src/pages/retail/StoreDetail.tsx` | `storeService`, `storeHoursService`, `storeServicesService` |
| **Gestor de Servicios** | `src/pages/retail/ServiceManager.tsx` | `serviceService` |
| **Lista de Personajes** | `src/pages/brand/CharacterList.tsx` | `characterService` |
| **Editor de Personajes** | `src/pages/brand/CharacterEditor.tsx` | `characterService` |
| **Calendario de Eventos** | `src/pages/events/EventCalendar.tsx` | `eventService` |
| **Editor de Eventos** | `src/pages/events/EventEditor.tsx` | `storeService` |
| **Dashboard Gamificación** | `src/pages/loyalty/GamificationDashboard.tsx` | `rewardService` |
| **Editor de Medallas** | `src/pages/loyalty/BadgeEditor.tsx` | `achievementService` |
| **Gestor Quiz** | `src/pages/gamification/QuizManager.tsx` | `quizService`, `productService` |
| **Productos Destacados** | `src/pages/marketing/FeaturedProductManager.tsx` | `productService` |

## ❌ No Conectadas (Mock Data / Estáticas)

Estas páginas utilizan datos ficticios (`MOCK_DATA`, `faker`), estado local o son puramente visuales y requieren integración con el backend.

| Página | Ruta del Archivo | Estado Actual |
| :--- | :--- | :--- |
| **Login** | `src/pages/auth/Login.tsx` | UI solamente (sin integración de AuthContext) |
| **Configuración de Reglas** | `src/pages/loyalty/RulesConfig.tsx` | Estado local (no guarda en DB) |
| **Gestor de Banners** | `src/pages/marketing/BannerManager.tsx` | Usa `MOCK_BANNERS` |
| **Gestor de Campañas** | `src/pages/marketing/CampaignManager.tsx` | Usa `INITIAL_CAMPAIGNS` (Estático) |
| **Gestor de Cupones** | `src/pages/marketing/CouponManager.tsx` | Usa `MOCK_COUPONS` y generación local |
| **Moderación de Reseñas** | `src/pages/moderation/ReviewInbox.tsx` | Usa `MOCK_REVIEWS` |
| **Logs de Auditoría** | `src/pages/settings/AuditLogViewer.tsx` | Usa `faker` para generar logs |
| **Configuración Global** | `src/pages/settings/GlobalSettings.tsx` | Estado local (console.log al guardar) |
| **Lista de Contratos** | `src/features/legal/pages/ContractList.tsx` | Texto placeholder |

## Resumen

- **Total Páginas Analizadas:** 27
- **Conectadas:** 18
- **No Conectadas:** 9
