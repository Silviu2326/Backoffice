import { supabase } from '../../../lib/supabase';
import { Customer, CustomerSegment } from '../../../types/core';
import { getAllOrders } from '../../orders/api/orderService';

/**
 * Tipo para el usuario tal como viene de Supabase Auth
 */
export interface SupabaseUser {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  email_confirmed_at?: string;
  phone?: string;
  raw_user_meta_data?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    phone?: string;
  };
}

/**
 * Tipo para el perfil extendido del usuario desde la tabla user_profiles
 * Mapea exactamente los campos de la tabla user_profiles en Supabase
 */
export interface SupabaseUserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  points_balance?: number;
  segment?: string;
  created_at: string;
  updated_at: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  avatar?: string; // Default: 'buck'
  address_label?: string;
  street?: string;
  number?: string;
  floor?: string;
  postal_code?: string;
  full_address?: string;
  language?: string; // Default: 'es'
}

/**
 * Convierte un usuario de Supabase al tipo Customer de la aplicación
 */
async function mapSupabaseToCustomer(
  supabaseUser: SupabaseUser,
  profile?: SupabaseUserProfile
): Promise<Customer> {
  // Calcular estadísticas desde orders
  const orders = await getAllOrders({ customerId: supabaseUser.id });
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const lastOrder = orders.length > 0 
    ? orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
    : new Date(supabaseUser.created_at);
  
  const aov = orders.length > 0 ? totalSpent / orders.length : 0;
  const antiquity = Math.floor(
    (new Date().getTime() - new Date(supabaseUser.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Determinar segmento basado en estadísticas
  let segment: CustomerSegment = CustomerSegment.NEW;
  if (totalSpent > 1000) {
    segment = CustomerSegment.VIP;
  } else if (antiquity > 180 && totalSpent > 500) {
    segment = CustomerSegment.LOYAL;
  } else if (antiquity > 90 && totalSpent < 100) {
    segment = CustomerSegment.RISK;
  }

  return {
    id: supabaseUser.id,
    email: profile?.email || supabaseUser.email, // Preferir email del perfil si existe
    fullName: profile?.full_name ||
              supabaseUser.raw_user_meta_data?.full_name ||
              supabaseUser.raw_user_meta_data?.name ||
              supabaseUser.email.split('@')[0],
    phone: profile?.phone || supabaseUser.phone || supabaseUser.raw_user_meta_data?.phone,
    role: 'CUSTOMER' as any, // Los clientes no tienen rol de admin
    avatarUrl: profile?.avatar_url ||
               supabaseUser.raw_user_meta_data?.avatar_url ||
               undefined,
    status: 'ACTIVE' as any, // Por defecto activo
    pointsBalance: profile?.points_balance || 0,
    lifetimeValue: totalSpent,
    segment: profile?.segment as CustomerSegment || segment,
    addresses: [], // Se puede obtener de otra tabla si existe
    createdAt: new Date(supabaseUser.created_at),
    lastLogin: supabaseUser.email_confirmed_at ? new Date(supabaseUser.email_confirmed_at) : undefined,
    // Nuevos campos de user_profiles
    firstName: profile?.first_name,
    lastName: profile?.last_name,
    city: profile?.city,
    avatar: profile?.avatar || 'buck',
    addressLabel: profile?.address_label,
    street: profile?.street,
    number: profile?.number,
    floor: profile?.floor,
    postalCode: profile?.postal_code,
    fullAddress: profile?.full_address,
    language: profile?.language || 'es',
  };
}

/**
 * Obtiene todos los clientes con filtros opcionales
 * 
 * Nota: Usa la tabla `user_profiles` y obtiene el email desde `orders` cuando está disponible.
 * Para obtener el email completo, se necesita crear una función de Supabase o usar una vista.
 */
export async function getCustomers(filters?: {
  search?: string;
  segment?: CustomerSegment;
  status?: 'active' | 'inactive';
}): Promise<Customer[]> {
  try {
    // Obtener perfiles de usuarios desde user_profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Error fetching user_profiles:', profilesError);
      // Si la tabla no existe, retornar array vacío
      if (profilesError.code === 'PGRST116' || profilesError.message.includes('does not exist')) {
        return [];
      }
      throw profilesError;
    }

    if (!profilesData || profilesData.length === 0) {
      return [];
    }

    // Obtener emails desde orders (última orden de cada cliente)
    const { data: ordersData } = await supabase
      .from('orders')
      .select('customer_id, customer_email')
      .order('created_at', { ascending: false });

    // Crear un mapa de user_id -> email desde orders
    const emailMap: Record<string, string> = {};
    if (ordersData) {
      ordersData.forEach(order => {
        if (order.customer_id && order.customer_email && !emailMap[order.customer_id]) {
          emailMap[order.customer_id] = order.customer_email;
        }
      });
    }

    // Mapear perfiles a usuarios con email
    const usersData = profilesData.map(profile => ({
      id: profile.user_id,
      email: profile.email || emailMap[profile.user_id] || `user_${profile.user_id.substring(0, 8)}@example.com`,
      created_at: profile.created_at,
      raw_user_meta_data: {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        phone: profile.phone,
      },
    }));

    // Mapear usuarios a clientes
    const customers = await Promise.all(
      usersData.map(async (user) => {
        const profile = profilesData.find(p => p.user_id === user.id);
        return mapSupabaseToCustomer(user as any, profile);
      })
    );

    // Aplicar filtros
    let filtered = customers;

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        c => 
          c.fullName.toLowerCase().includes(searchLower) ||
          c.email.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.segment) {
      filtered = filtered.filter(c => c.segment === filters.segment);
    }

    if (filters?.status) {
      // Por ahora todos están activos, pero se puede extender
      filtered = filtered.filter(c => c.status === 'ACTIVE');
    }

    return filtered;
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error;
  }
}

/**
 * Obtiene un cliente por ID
 */
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    // Obtener perfil desde user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116' || profileError.message.includes('No rows')) {
        return null;
      }
      throw profileError;
    }

    if (!profileData) {
      return null;
    }

    // Obtener email desde orders (última orden)
    const { data: orderData } = await supabase
      .from('orders')
      .select('customer_email')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const email = profileData.email || orderData?.customer_email || `user_${id.substring(0, 8)}@example.com`;

    const user = {
      id: profileData.user_id,
      email: email,
      created_at: profileData.created_at,
      raw_user_meta_data: {
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        phone: profileData.phone,
      },
    };

    return mapSupabaseToCustomer(user, profileData);
  } catch (error) {
    console.error('Error in getCustomerById:', error);
    throw error;
  }
}

/**
 * Obtiene un cliente por email
 */
export async function getCustomerByEmail(email: string): Promise<Customer | null> {
  try {
    // Buscar el user_id desde orders usando el email
    const { data: orderData } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('customer_email', email)
      .limit(1)
      .single();

    if (!orderData?.customer_id) {
      return null;
    }

    // Obtener el perfil usando el customer_id
    return await getCustomerById(orderData.customer_id);
  } catch (error) {
    console.error('Error in getCustomerByEmail:', error);
    return null;
  }
}

/**
 * Actualiza el perfil de un cliente
 */
export async function updateCustomer(id: string, updates: {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  segment?: CustomerSegment;
  firstName?: string;
  lastName?: string;
  city?: string;
  avatar?: string;
  addressLabel?: string;
  street?: string;
  number?: string;
  floor?: string;
  postalCode?: string;
  language?: string;
  email?: string;
}): Promise<Customer> {
  try {
    // Preparar objeto de actualización solo con campos definidos
    const updateData: any = {
      user_id: id,
      updated_at: new Date().toISOString(),
    };

    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
    if (updates.segment !== undefined) updateData.segment = updates.segment;
    if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
    if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
    if (updates.city !== undefined) updateData.city = updates.city;
    if (updates.avatar !== undefined) updateData.avatar = updates.avatar;
    if (updates.addressLabel !== undefined) updateData.address_label = updates.addressLabel;
    if (updates.street !== undefined) updateData.street = updates.street;
    if (updates.number !== undefined) updateData.number = updates.number;
    if (updates.floor !== undefined) updateData.floor = updates.floor;
    if (updates.postalCode !== undefined) updateData.postal_code = updates.postalCode;
    if (updates.language !== undefined) updateData.language = updates.language;
    if (updates.email !== undefined) updateData.email = updates.email;

    // Actualizar en user_profiles (upsert crea si no existe)
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .upsert(updateData, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      throw profileError;
    }

    // Obtener el cliente actualizado
    const updated = await getCustomerById(id);
    if (!updated) {
      throw new Error('Customer not found after update');
    }
    return updated;
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error;
  }
}

/**
 * Crea un nuevo cliente
 * Genera un UUID aleatorio para el user_id.
 * Nota: Esto requiere que la tabla user_profiles no tenga una restricción FK estricta con auth.users
 * o que estemos en un entorno donde esto sea permitido.
 */
export async function createCustomer(customer: {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  avatar: string;
}): Promise<Customer> {
  try {
    const newId = crypto.randomUUID();
    
    // Intentar insertar en user_profiles
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: newId,
        full_name: customer.name,
        email: customer.email, // Guardar email
        phone: customer.phone,
        avatar_url: customer.avatar,
        segment: 'NEW',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      throw profileError;
    }

    // Retornar el objeto Customer construido
    return {
      id: newId,
      email: customer.email,
      fullName: customer.name,
      phone: customer.phone,
      role: 'CUSTOMER',
      avatarUrl: customer.avatar,
      status: customer.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      pointsBalance: 0,
      lifetimeValue: 0,
      segment: 'NEW',
      addresses: [],
      createdAt: new Date(),
      lastLogin: undefined,
    };
  } catch (error) {
    console.error('Error in createCustomer:', error);
    throw error;
  }
}

/**
 * Elimina un cliente (desactiva la cuenta)
 * 
 * Nota: En Supabase, normalmente no se eliminan usuarios de auth.users desde el cliente.
 * Esta función elimina el perfil de user_profiles. Para eliminar completamente el usuario
 * de auth.users, se necesita usar service_role key en el backend.
 */
export async function deleteCustomer(id: string): Promise<void> {
  try {
    // Eliminar el perfil de user_profiles
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('user_id', id);

    if (error) {
      console.error('Error deleting user profile:', error);
      throw error;
    }

    // Nota: Para eliminar el usuario de auth.users, necesitarías usar service_role key
    // o crear una función de Supabase que lo haga
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error;
  }
}

