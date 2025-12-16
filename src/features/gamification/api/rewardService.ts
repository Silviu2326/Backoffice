import { supabase } from '../../../lib/supabase';
import { Reward } from '../../../types/core';

/**
 * Tipo para el reward tal como viene de Supabase
 */
export interface SupabaseReward {
  id: string;
  title: string;
  name?: string;
  description?: string;
  icon_name?: string;
  icon?: string;
  points_required: number;
  points?: number;
  is_active: boolean;
  available?: boolean;
  category?: string;
  created_at: string;
}

/**
 * Convierte un reward de Supabase al tipo Reward de la aplicación
 */
function mapSupabaseToReward(supabaseReward: SupabaseReward): Reward {
  return {
    id: supabaseReward.id,
    title: supabaseReward.title,
    name: supabaseReward.name,
    description: supabaseReward.description,
    iconName: supabaseReward.icon_name,
    icon: supabaseReward.icon,
    pointsRequired: supabaseReward.points_required,
    points: supabaseReward.points,
    isActive: supabaseReward.is_active,
    available: supabaseReward.available,
    category: supabaseReward.category,
    createdAt: supabaseReward.created_at,
  };
}

/**
 * Convierte un reward de la aplicación al formato de Supabase
 */
function mapRewardToSupabase(reward: Partial<Reward>): Partial<SupabaseReward> {
  const supabaseReward: Partial<SupabaseReward> = {};

  if (reward.title !== undefined) supabaseReward.title = reward.title;
  if (reward.name !== undefined) supabaseReward.name = reward.name;
  if (reward.description !== undefined) supabaseReward.description = reward.description;
  if (reward.iconName !== undefined) supabaseReward.icon_name = reward.iconName;
  if (reward.icon !== undefined) supabaseReward.icon = reward.icon;
  if (reward.pointsRequired !== undefined) supabaseReward.points_required = reward.pointsRequired;
  if (reward.points !== undefined) supabaseReward.points = reward.points;
  if (reward.isActive !== undefined) supabaseReward.is_active = reward.isActive;
  if (reward.available !== undefined) supabaseReward.available = reward.available;
  if (reward.category !== undefined) supabaseReward.category = reward.category;

  return supabaseReward;
}

/**
 * Obtiene todas las recompensas
 */
export async function getAllRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('points_required', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rewards:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToReward);
}

/**
 * Obtiene una recompensa por ID
 */
export async function getRewardById(id: string): Promise<Reward | null> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching reward:', error);
    throw error;
  }

  return data ? mapSupabaseToReward(data) : null;
}

/**
 * Obtiene recompensas por categoría
 */
export async function getRewardsByCategory(category: string): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('category', category)
    .order('points_required', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rewards by category:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToReward);
}

/**
 * Obtiene recompensas activas
 */
export async function getActiveRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('is_active', true)
    .order('points_required', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active rewards:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToReward);
}

/**
 * Crea una nueva recompensa
 */
export async function createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward> {
  const supabaseReward = mapRewardToSupabase(reward);

  const { data, error } = await supabase
    .from('rewards')
    .insert(supabaseReward)
    .select()
    .single();

  if (error) {
    console.error('Error creating reward:', error);
    throw error;
  }

  return mapSupabaseToReward(data);
}

/**
 * Actualiza una recompensa existente
 */
export async function updateReward(id: string, reward: Partial<Reward>): Promise<Reward> {
  const supabaseReward = mapRewardToSupabase(reward);

  const { data, error } = await supabase
    .from('rewards')
    .update(supabaseReward)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating reward:', error);
    throw error;
  }

  return mapSupabaseToReward(data);
}

/**
 * Elimina una recompensa
 */
export async function deleteReward(id: string): Promise<void> {
  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting reward:', error);
    throw error;
  }
}























