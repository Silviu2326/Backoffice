import { supabase } from '../../../lib/supabase';
import { UserRole, UserStatus } from '../../../types/core';

/**
 * Tipo para admin_user tal como viene de Supabase
 */
export interface SupabaseAdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  avatar_url?: string;
  phone?: string;
  last_login?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Tipo para el administrador autenticado
 */
export interface AdminUser {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  phone?: string;
  lastLogin?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Convierte un admin_user de Supabase al tipo AdminUser de la aplicación
 */
function mapSupabaseToAdminUser(supabaseAdmin: SupabaseAdminUser): AdminUser {
  return {
    id: supabaseAdmin.id,
    userId: supabaseAdmin.user_id,
    email: supabaseAdmin.email,
    fullName: supabaseAdmin.full_name,
    role: supabaseAdmin.role as UserRole,
    status: supabaseAdmin.status as UserStatus,
    avatarUrl: supabaseAdmin.avatar_url,
    phone: supabaseAdmin.phone,
    lastLogin: supabaseAdmin.last_login ? new Date(supabaseAdmin.last_login) : undefined,
    metadata: supabaseAdmin.metadata,
  };
}

/**
 * Inicia sesión con email y contraseña
 */
export async function signIn(email: string, password: string): Promise<AdminUser> {
  try {
    // Autenticar con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error('Error signing in:', authError);
      throw new Error(authError.message || 'Error al iniciar sesión');
    }

    if (!authData.user) {
      throw new Error('No se pudo obtener información del usuario');
    }

    // Verificar que el usuario existe en admin_users
    // Nota: Usamos .maybeSingle() en lugar de .single() para manejar mejor el caso de no encontrado
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (adminError) {
      console.error('Error fetching admin user:', adminError);
      // Si es un error de RLS o permisos, dar un mensaje más claro
      if (adminError.code === 'PGRST301' || adminError.code === '42501') {
        await supabase.auth.signOut();
        throw new Error('No tienes permisos para acceder al backoffice. Contacta al administrador.');
      }
      // Cerrar sesión si no es un admin
      await supabase.auth.signOut();
      throw new Error('Error al verificar permisos de administrador. Contacta al administrador.');
    }

    if (!adminData) {
      await supabase.auth.signOut();
      throw new Error(
        `Usuario no encontrado en el sistema de administradores. ` +
        `Tu user_id es: ${authData.user.id}. ` +
        `Asegúrate de que existe un registro en admin_users con este user_id.`
      );
    }

    // Verificar que el usuario está activo
    if (adminData.status !== 'ACTIVE') {
      await supabase.auth.signOut();
      throw new Error('Tu cuenta ha sido desactivada. Contacta al administrador.');
    }

    // Actualizar last_login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminData.id);

    return mapSupabaseToAdminUser(adminData);
  } catch (error) {
    console.error('Error in signIn:', error);
    throw error;
  }
}

/**
 * Cierra la sesión actual
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
}

/**
 * Obtiene el usuario administrador actual
 */
export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    console.log('[getCurrentAdminUser] Starting...');
    
    // Intentar obtener el usuario directamente (más rápido que getSession)
    console.log('[getCurrentAdminUser] Getting user...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('[getCurrentAdminUser] Error getting user:', userError);
      return null;
    }

    if (!user) {
      console.log('[getCurrentAdminUser] No user found');
      return null;
    }

    console.log('[getCurrentAdminUser] User found, user_id:', user.id);
    console.log('[getCurrentAdminUser] Fetching admin_user from database...');

    // Obtener el admin_user usando maybeSingle()
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (adminError) {
      console.error('[getCurrentAdminUser] Error fetching admin user:', adminError);
      console.error('[getCurrentAdminUser] Error code:', adminError.code);
      console.error('[getCurrentAdminUser] Error message:', adminError.message);
      console.error('[getCurrentAdminUser] Error details:', adminError);
      // Si es un error de RLS o permisos, no lanzar error, solo retornar null
      return null;
    }

    if (!adminData) {
      console.log('[getCurrentAdminUser] Admin user not found in database');
      console.log('[getCurrentAdminUser] User ID searched:', user.id);
      // Usuario autenticado pero no es admin
      return null;
    }

    if (adminData.status !== 'ACTIVE') {
      console.log('[getCurrentAdminUser] Admin user is not ACTIVE, status:', adminData.status);
      // Usuario admin pero inactivo
      return null;
    }

    console.log('[getCurrentAdminUser] Admin user found and active:', adminData.email);
    return mapSupabaseToAdminUser(adminData);
  } catch (error) {
    console.error('[getCurrentAdminUser] Unexpected error:', error);
    console.error('[getCurrentAdminUser] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return null;
  }
}

/**
 * Verifica si el usuario actual tiene un rol específico
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  try {
    const adminUser = await getCurrentAdminUser();
    return adminUser?.role === role || adminUser?.role === UserRole.SUPER_ADMIN;
  } catch (error) {
    console.error('Error in hasRole:', error);
    return false;
  }
}

/**
 * Verifica si el usuario actual es Super Admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  return hasRole(UserRole.SUPER_ADMIN);
}

