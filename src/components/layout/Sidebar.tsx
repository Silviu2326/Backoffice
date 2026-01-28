import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Store,
  Smile,
  Calendar,
  Trophy,
  Megaphone,
  Star,
  ShieldAlert,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  Image as ImageIcon,
  Bell,
  Cat,
  ClipboardList,
  MessageSquareWarning
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const SidebarLogoutButton = ({ onClose }: { onClose?: () => void }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
      onClose?.();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex w-full items-center px-3 py-2 text-sm font-medium text-text-secondary hover:text-red-400 transition-colors"
    >
      <LogOut className="mr-3 h-5 w-5" />
      {t('sidebar.logout')}
    </button>
  );
};


const navItems = [
  { nameKey: 'sidebar.dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { nameKey: 'sidebar.notifications', path: '/admin/notifications', icon: Bell },
  { nameKey: 'sidebar.crmCustomers', path: '/admin/crm/customers', icon: Users },
  { nameKey: 'sidebar.userRecords', path: '/admin/crm/user-records', icon: ClipboardList },
  { nameKey: 'sidebar.orders', path: '/admin/orders', icon: ShoppingCart },
  { nameKey: 'sidebar.products', path: '/admin/products', icon: Package },
  { nameKey: 'sidebar.stores', path: '/admin/retail', icon: Store },
  { nameKey: 'sidebar.characters', path: '/admin/characters', icon: Smile },
  { nameKey: 'sidebar.events', path: '/admin/events', icon: Calendar },
  { nameKey: 'sidebar.gamification', path: '/admin/gamification', icon: Trophy },
  { nameKey: 'sidebar.featuredProducts', path: '/admin/marketing/featured', icon: Star },
  { nameKey: 'sidebar.appBanners', path: '/admin/marketing/banners', icon: ImageIcon },
  { nameKey: 'sidebar.navTabs', path: '/admin/marketing/tabs', icon: Menu },
  { nameKey: 'sidebar.appNavigation', path: '/admin/settings/navigation', icon: Menu },
  { nameKey: 'sidebar.mrCoolCat', path: '/admin/mrcoolcat', icon: Cat },
  { nameKey: 'sidebar.wallModeration', path: '/admin/moderation/community', icon: MessageSquareWarning },
];

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ className, onClose }) => {
  const { t } = useLanguage();

  return (
    <div className={cn("flex flex-col bg-brand-surface text-text-primary h-full border-r border-white/10", className)}>
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
        <span className="text-xl font-bold text-brand">Mr. CoolCat</span>
        <span className="ml-2 text-xs text-text-secondary uppercase tracking-wider">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.nameKey}
            to={item.path}
            onClick={onClose}
            style={({ isActive }) => isActive ? { backgroundColor: '#F76934' } : undefined}
            className={({ isActive }) =>
              cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "text-white"
                  : "text-text-secondary hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
            {t(item.nameKey)}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 shrink-0">
        <SidebarLogoutButton onClose={onClose} />
        <div className="mt-4 text-xs text-text-secondary text-center">
          v1.0.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;