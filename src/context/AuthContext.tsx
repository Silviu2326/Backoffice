import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AdminUser } from '../features/auth/api/adminAuthService';
import { getCurrentAdminUser, signIn, signOut as signOutService } from '../features/auth/api/adminAuthService';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario al iniciar
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadUser = async () => {
      try {
        console.log('[AuthContext] Loading user...');
        const adminUser = await getCurrentAdminUser();
        console.log('[AuthContext] User loaded:', adminUser ? 'Found' : 'Not found');
        if (mounted) {
          setUser(adminUser);
        }
      } catch (error) {
        console.error('[AuthContext] Error loading user:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          console.log('[AuthContext] Setting isLoading to false');
          setIsLoading(false);
        }
      }
    };

    // Timeout de seguridad: si después de 5 segundos no se ha resuelto, establecer isLoading en false
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('[AuthContext] Timeout: Forcing isLoading to false after 5 seconds');
        setIsLoading(false);
      }
    }, 5000);

    loadUser().finally(() => {
      clearTimeout(timeoutId);
    });

    // Escuchar cambios en la sesión de Supabase
    // Nota: No cargar el usuario aquí porque loadUser() ya lo hace
    // Solo manejar cambios explícitos (sign in/out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('[AuthContext] Auth state changed:', event, session ? 'Has session' : 'No session');

      // Solo manejar SIGNED_OUT explícitamente
      // SIGNED_IN e INITIAL_SESSION ya son manejados por loadUser()
      if (event === 'SIGNED_OUT') {
        console.log('[AuthContext] User signed out');
        setUser(null);
        setIsLoading(false);
      }
      // No hacer nada para SIGNED_IN o INITIAL_SESSION porque loadUser() ya lo maneja
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const adminUser = await signIn(email, password);
      setUser(adminUser);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOutService();
      setUser(null);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn: handleSignIn,
        signOut: handleSignOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

