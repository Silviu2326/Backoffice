import React from 'react';
import Dashboard from '../pages/Dashboard';
import OrderList from '../pages/orders/OrderList';
import ProductList from '../pages/products/ProductList';
import ProductEditor from '../pages/products/ProductEditor';
import StoreList from '../pages/retail/StoreList';
import StoreDetail from '../pages/retail/StoreDetail';
import CharacterList from '../pages/brand/CharacterList';
import CharacterEditor from '../pages/brand/CharacterEditor';
import EventCalendar from '../pages/events/EventCalendar';
import EventEditor from '../pages/events/EventEditor';
import CampaignManager from '../pages/marketing/CampaignManager';
import CouponManager from '../pages/marketing/CouponManager';
import FeaturedProductManager from '../pages/marketing/FeaturedProductManager';
import BannerManager from '../pages/marketing/BannerManager';
import TabManager from '../pages/marketing/TabManager';
import ReviewInbox from '../pages/moderation/ReviewInbox';
import GlobalSettings from '../pages/settings/GlobalSettings';
import AuditLogViewer from '../pages/settings/AuditLogViewer';
import { CustomerList } from '../pages/crm/CustomerList';
import CustomerDetail from '../pages/crm/CustomerDetail';
import OrderDetail from '../pages/orders/OrderDetail';
import { RulesConfig } from '../pages/loyalty/RulesConfig';
import GamificationDashboard from '../pages/loyalty/GamificationDashboard';
import QuizManager from '../pages/gamification/QuizManager';
import ServiceManager from '../pages/retail/ServiceManager';
import NavigationManager from '../pages/settings/NavigationManager';
import Notifications from '../pages/Notifications';
import MrCoolCat from '../pages/mrcoolcat/MrCoolCat';

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  title?: string;
}

export const routes: RouteConfig[] = [
  { path: '/admin/dashboard', component: Dashboard, title: 'Dashboard' },
  { path: '/admin/notifications', component: Notifications, title: 'Notificaciones' },
  { path: '/admin/crm/customers', component: CustomerList, title: 'Clientes' },
  { path: '/admin/crm/customers/:id', component: CustomerDetail, title: 'Ficha de Cliente' },
  { path: '/admin/orders', component: OrderList, title: 'Pedidos' },
  { path: '/admin/orders/:id', component: OrderDetail, title: 'Detalle de Pedido' },
  { path: '/admin/products', component: ProductList, title: 'Productos' },
  { path: '/admin/products/edit', component: ProductEditor, title: 'Editar Producto' },
  { path: '/admin/retail', component: StoreList, title: 'Tiendas' },
  { path: '/admin/retail/:id', component: StoreDetail, title: 'Detalle de Tienda' },
  { path: '/admin/retail/services', component: ServiceManager, title: 'Gestión de Servicios' },
  { path: '/admin/characters', component: CharacterList, title: 'Personajes' },
  { path: '/admin/characters/new', component: CharacterEditor, title: 'Nuevo Personaje' },
  { path: '/admin/characters/:id', component: CharacterEditor, title: 'Editar Personaje' },
  { path: '/admin/events', component: EventCalendar, title: 'Eventos' },
  { path: '/admin/events/new', component: EventEditor, title: 'Nuevo Evento' },
  { path: '/admin/events/:id', component: EventEditor, title: 'Editar Evento' },
  { path: '/admin/gamification', component: GamificationDashboard, title: 'Gamificación' },
  { path: '/admin/gamification/quiz', component: QuizManager, title: 'Gestión de Quizzes' },
  { path: '/admin/marketing/campaigns', component: CampaignManager, title: 'Campañas' },
  { path: '/admin/marketing/coupons', component: CouponManager, title: 'Cupones' },
  { path: '/admin/marketing/banners', component: BannerManager, title: 'Banners App' },
  { path: '/admin/marketing/tabs', component: TabManager, title: 'Tabs de Navegación' },
  { path: '/admin/marketing/featured', component: FeaturedProductManager, title: 'Productos Destacados' },
  { path: '/admin/moderation', component: ReviewInbox, title: 'Moderación' },
  { path: '/admin/settings', component: GlobalSettings, title: 'Configuración' },
  { path: '/admin/settings/audit', component: AuditLogViewer, title: 'Auditoría' },
  { path: '/admin/settings/navigation', component: NavigationManager, title: 'Navegación de la App' },
  { path: '/admin/mrcoolcat', component: MrCoolCat, title: 'Mr. Cool Cat' },
];
