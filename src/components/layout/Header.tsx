import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronRight, ChevronDown, Sun, Moon, Settings, LogOut, User, Menu, Globe } from 'lucide-react';
import { cn } from '../../utils/cn';
import Button from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import Avatar from '../ui/Avatar';

interface HeaderProps {
  onMenuClick?: () => void;
  className?: string;
}

export default function Header({ onMenuClick, className }: HeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [notifications] = React.useState(3);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = React.useState(false);
  const [isDark, setIsDark] = React.useState(true); // Mock theme state

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Cerrar dropdown al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isProfileOpen && !target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
      if (isLanguageOpen && !target.closest('.language-dropdown')) {
        setIsLanguageOpen(false);
      }
    };

    if (isProfileOpen || isLanguageOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isProfileOpen, isLanguageOpen]);

  const breadcrumbMap: Record<string, string> = {
    'crm': t('breadcrumb.crm'),
    'orders': t('breadcrumb.orders'),
    'products': t('breadcrumb.products'),
    'stores': t('breadcrumb.stores'),
    'characters': t('breadcrumb.characters'),
    'events': t('breadcrumb.events'),
    'gamification': t('breadcrumb.gamification'),
    'marketing': t('breadcrumb.marketing'),
    'moderation': t('breadcrumb.moderation'),
    'settings': t('breadcrumb.settings'),
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
          {t('header.home')}
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
        {/* Language Toggle */}
        <div className="relative language-dropdown">
          <button
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm text-text-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            title={language === 'es' ? 'Cambiar idioma' : 'Change language'}
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline uppercase font-medium">{language}</span>
          </button>

          {isLanguageOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-xl bg-brand-surface border border-white/10 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => { setLanguage('es'); setIsLanguageOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  language === 'es' ? "text-brand bg-brand/10" : "text-text-secondary hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="text-base">🇪🇸</span>
                {t('language.spanish')}
              </button>
              <button
                onClick={() => { setLanguage('en'); setIsLanguageOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
                  language === 'en' ? "text-brand bg-brand/10" : "text-text-secondary hover:bg-white/5 hover:text-white"
                )}
              >
                <span className="text-base">🇬🇧</span>
                {t('language.english')}
              </button>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block" />

        {/* Profile Dropdown */}
        <div className="relative profile-dropdown">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:bg-white/5 p-1.5 rounded-lg transition-colors outline-none focus:ring-2 focus:ring-brand/50"
          >
            <Avatar 
              src={user?.avatarUrl} 
              alt={user?.fullName || 'Admin'} 
              size="sm"
              fallback={user?.fullName?.substring(0, 2).toUpperCase() || 'A'}
            />
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-white leading-none">{user?.fullName || 'Admin'}</p>
              <p className="text-xs text-text-secondary mt-1">{user?.email || ''}</p>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-text-secondary transition-transform", isProfileOpen && "rotate-180")} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-brand-surface border border-white/10 shadow-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-white/10 mb-1">
                <p className="text-sm font-medium text-white">{user?.fullName}</p>
                <p className="text-xs text-text-secondary mt-0.5">{user?.role}</p>
              </div>
              
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-white transition-colors">
                <User className="h-4 w-4" />
                {t('header.profile')}
              </button>
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-white transition-colors">
                <Settings className="h-4 w-4" />
                {t('header.settings')}
              </button>

              <div className="my-1 border-t border-white/10" />

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('header.logout')}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Overlay for Search/Profile if needed (Optional, keeping simple for now) */}
      </div>
    </header>
  );
}
