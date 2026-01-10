import { supabase } from '../../../lib/supabase';
import { Achievement } from '../../../types/core';

/**
 * Tipo para el achievement tal como viene de Supabase
 */
export interface SupabaseAchievement {
  id: string;
  name: string;
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  reward_points?: number;
  points_reward?: number;
  reward_description?: string;
  reward?: string;
  reward_icon?: string;
  icon_name?: string;
  icon?: string;
  icon_locked_url?: string;
  icon_locked?: string;
  icon_unlocked_url?: string;
  icon_unlocked?: string;
  accent_color?: string;
  status?: string;
  display_order?: number;
  progress_percentage?: number;
  created_at: string;
}

/**
 * Convierte un achievement de Supabase al tipo Achievement de la aplicación
 */
function mapSupabaseToAchievement(supabaseAchievement: SupabaseAchievement): Achievement {
  return {
    id: supabaseAchievement.id,
    name: supabaseAchievement.name,
    title: supabaseAchievement.title,
    description: supabaseAchievement.description,
    category: supabaseAchievement.category,
    difficulty: supabaseAchievement.difficulty as 'fácil' | 'medio' | 'difícil' | undefined,
    rewardPoints: supabaseAchievement.reward_points,
    pointsReward: supabaseAchievement.points_reward,
    rewardDescription: supabaseAchievement.reward_description,
    reward: supabaseAchievement.reward,
    rewardIcon: supabaseAchievement.reward_icon,
    iconName: supabaseAchievement.icon_name,
    icon: supabaseAchievement.icon,
    iconLockedUrl: supabaseAchievement.icon_locked_url,
    iconLocked: supabaseAchievement.icon_locked,
    iconUnlockedUrl: supabaseAchievement.icon_unlocked_url,
    iconUnlocked: supabaseAchievement.icon_unlocked,
    accentColor: supabaseAchievement.accent_color,
    status: supabaseAchievement.status as 'published' | 'draft' | undefined,
    displayOrder: supabaseAchievement.display_order,
    progressPercentage: supabaseAchievement.progress_percentage,
    createdAt: supabaseAchievement.created_at,
  };
}

/**
 * Convierte un achievement de la aplicación al formato de Supabase
 */
function mapAchievementToSupabase(achievement: Partial<Achievement>): Partial<SupabaseAchievement> {
  const supabaseAchievement: Partial<SupabaseAchievement> = {};

  if (achievement.name !== undefined) supabaseAchievement.name = achievement.name;
  if (achievement.title !== undefined) supabaseAchievement.title = achievement.title;
  if (achievement.description !== undefined) supabaseAchievement.description = achievement.description;
  if (achievement.category !== undefined) supabaseAchievement.category = achievement.category;
  if (achievement.difficulty !== undefined) supabaseAchievement.difficulty = achievement.difficulty;
  if (achievement.rewardPoints !== undefined) supabaseAchievement.reward_points = achievement.rewardPoints;
  if (achievement.pointsReward !== undefined) supabaseAchievement.points_reward = achievement.pointsReward;
  if (achievement.rewardDescription !== undefined) supabaseAchievement.reward_description = achievement.rewardDescription;
  if (achievement.reward !== undefined) supabaseAchievement.reward = achievement.reward;
  if (achievement.rewardIcon !== undefined) supabaseAchievement.reward_icon = achievement.rewardIcon;
  if (achievement.iconName !== undefined) supabaseAchievement.icon_name = achievement.iconName;
  if (achievement.icon !== undefined) supabaseAchievement.icon = achievement.icon;
  if (achievement.iconLockedUrl !== undefined) supabaseAchievement.icon_locked_url = achievement.iconLockedUrl;
  if (achievement.iconLocked !== undefined) supabaseAchievement.icon_locked = achievement.iconLocked;
  if (achievement.iconUnlockedUrl !== undefined) supabaseAchievement.icon_unlocked_url = achievement.iconUnlockedUrl;
  if (achievement.iconUnlocked !== undefined) supabaseAchievement.icon_unlocked = achievement.iconUnlocked;
  if (achievement.accentColor !== undefined) supabaseAchievement.accent_color = achievement.accentColor;
  if (achievement.status !== undefined) supabaseAchievement.status = achievement.status;
  if (achievement.displayOrder !== undefined) supabaseAchievement.display_order = achievement.displayOrder;
  if (achievement.progressPercentage !== undefined) supabaseAchievement.progress_percentage = achievement.progressPercentage;

  return supabaseAchievement;
}

/**
 * Obtiene todos los achievements
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToAchievement);
}

/**
 * Obtiene un achievement por ID
 */
export async function getAchievementById(id: string): Promise<Achievement | null> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching achievement:', error);
    throw error;
  }

  return data ? mapSupabaseToAchievement(data) : null;
}

/**
 * Obtiene achievements por categoría
 */
export async function getAchievementsByCategory(category: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('category', category)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements by category:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToAchievement);
}

/**
 * Obtiene achievements por estado
 */
export async function getAchievementsByStatus(status: 'published' | 'draft'): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('status', status)
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements by status:', error);
    throw error;
  }

  return (data || []).map(mapSupabaseToAchievement);
}

/**
 * Crea un nuevo achievement
 */
export async function createAchievement(achievement: Omit<Achievement, 'id' | 'createdAt'>): Promise<Achievement> {
  const supabaseAchievement = mapAchievementToSupabase(achievement);

  const { data, error } = await supabase
    .from('achievements')
    .insert(supabaseAchievement)
    .select()
    .single();

  if (error) {
    console.error('Error creating achievement:', error);
    throw error;
  }

  return mapSupabaseToAchievement(data);
}

/**
 * Actualiza un achievement existente
 */
export async function updateAchievement(id: string, achievement: Partial<Achievement>): Promise<Achievement> {
  const supabaseAchievement = mapAchievementToSupabase(achievement);

  const { data, error } = await supabase
    .from('achievements')
    .update(supabaseAchievement)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating achievement:', error);
    throw error;
  }

  return mapSupabaseToAchievement(data);
}

/**
 * Elimina un achievement
 */
export async function deleteAchievement(id: string): Promise<void> {
  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting achievement:', error);
    throw error;
  }
}








































