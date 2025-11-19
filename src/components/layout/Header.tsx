import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Search, Bell, ChevronRight, ChevronDown, Sun, Moon, Settings, LogOut, User, Menu } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import { Input } from '../ui/Input';

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

export default function Header({ onMenuClick, className }: HeaderProps) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [notifications] = React.useState(3);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true); // Mock theme state

  const breadcrumbMap: Record<string, string> = {
    'crm': 'CRM Clientes',
    'orders': 'Pedidos',
    'products': 'Productos',
    'stores': 'Tiendas',
    'characters': 'Personajes',
    'events': 'Eventos',
    'gamification': 'Gamificación',
    'marketing': 'Marketing',
    'moderation': 'Moderación',
    'settings': 'Configuración',
  };

  return (
    <header className={cn("h-16 px-6 flex items-center justify-between border-b border-white/10 bg-brand-surface sticky top-0 z-40", className)}>
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden text-text-secondary hover:text-white transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Left: Breadcrumbs */}
        <nav className="flex items-center text-sm text-text-secondary">
        <Link 
          to="/" 
          className="hover:text-white transition-colors"
        >
          Inicio
        </Link>
        
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const name = breadcrumbMap[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <React.Fragment key={to}>
              <ChevronRight className="h-4 w-4 mx-2 text-white/20" />
              {isLast ? (
                <span className="text-white font-medium">
                  {name}
                </span>
              ) : (
                <Link 
                  to={to}
                  className="hover:text-white transition-colors"
                >
                  {name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
      </div>

      {/* Center: Global Search */}
     

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle (Optional) */}
     

        {/* Notifications */}
        <div className="relative">
        
        
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-brand/50"
          >
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-none">Admin User</p>
              <p className="text-xs text-text-secondary mt-1">admin@mrcoolcat.com</p>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-text-secondary transition-transform", isProfileOpen && "rotate-180")} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-brand-surface border border-white/10 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-sm font-medium text-white">Mi Cuenta</p>
              </div>
              
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-white transition-colors">
                <User className="h-4 w-4" />
                Perfil
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                Configuración
              </button>
              
              <div className="my-1 border-t border-white/10" />
              
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay for Search/Profile if needed (Optional, keeping simple for now) */}
      </div>
    </header>
  );
}
