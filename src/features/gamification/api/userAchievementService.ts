import { supabase } from '../../../lib/supabase';
import { Achievement } from '../../../types/core';

/**
 * Tipo para user_achievement tal como viene de Supabase
 */
export interface SupabaseUserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress_percentage: number;
  unlocked_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Tipo para user_achievement con datos del achievement
 */
export interface UserAchievementWithDetails {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  progressPercentage: number;
  unlockedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Convierte un user_achievement de Supabase al tipo de la aplicación
 */
function mapSupabaseToUserAchievement(
  supabaseUA: SupabaseUserAchievement,
  achievement: Achievement
): UserAchievementWithDetails {
  return {
    id: supabaseUA.id,
    userId: supabaseUA.user_id,
    achievementId: supabaseUA.achievement_id,
    achievement,
    progressPercentage: supabaseUA.progress_percentage,
    unlockedAt: supabaseUA.unlocked_at ? new Date(supabaseUA.unlocked_at) : null,
    createdAt: new Date(supabaseUA.created_at),
    updatedAt: new Date(supabaseUA.updated_at),
  };
}

/**
 * Obtiene todos los logros de un usuario
 */
export async function getUserAchievements(userId: string): Promise<UserAchievementWithDetails[]> {
  try {
    const { data: uaData, error: uaError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (uaError) {
      console.error('Error fetching user achievements:', uaError);
      throw uaError;
    }

    if (!uaData || uaData.length === 0) {
      return [];
    }

    // Obtener los achievements asociados
    const achievementIds = uaData.map(ua => ua.achievement_id);
    const { data: achievementsData, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .in('id', achievementIds);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      throw achievementsError;
    }

    // Crear un mapa de achievements por ID
    const achievementsMap = (achievementsData || []).reduce((acc, ach) => {
      acc[ach.id] = {
        id: ach.id,
        name: ach.name || ach.title,
        description: ach.description,
        category: ach.category,
        difficulty: ach.difficulty,
        rewardPoints: ach.reward_points || ach.points_reward || 0,
        icon: ach.icon || ach.icon_name || '',
        accentColor: ach.accent_color,
        status: ach.status,
        displayOrder: ach.display_order || 0,
        createdAt: new Date(ach.created_at),
      } as Achievement;
      return acc;
    }, {} as Record<string, Achievement>);

    // Mapear user_achievements con sus achievements
    return uaData
      .filter(ua => achievementsMap[ua.achievement_id])
      .map(ua => mapSupabaseToUserAchievement(ua, achievementsMap[ua.achievement_id]));
  } catch (error) {
    console.error('Error in getUserAchievements:', error);
    throw error;
  }
}

/**
 * Obtiene el progreso de un logro específico para un usuario
 */
export async function getUserAchievement(
  userId: string,
  achievementId: string
): Promise<UserAchievementWithDetails | null> {
  try {
    const { data: uaData, error: uaError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (uaError) {
      if (uaError.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching user achievement:', uaError);
      throw uaError;
    }

    if (!uaData) {
      return null;
    }

    // Obtener el achievement
    const { data: achievementData, error: achievementError } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (achievementError) {
      console.error('Error fetching achievement:', achievementError);
      throw achievementError;
    }

    const achievement: Achievement = {
      id: achievementData.id,
      name: achievementData.name || achievementData.title,
      description: achievementData.description,
      category: achievementData.category,
      difficulty: achievementData.difficulty,
      rewardPoints: achievementData.reward_points || achievementData.points_reward || 0,
      icon: achievementData.icon || achievementData.icon_name || '',
      accentColor: achievementData.accent_color,
      status: achievementData.status,
      displayOrder: achievementData.display_order || 0,
      createdAt: new Date(achievementData.created_at),
    };

    return mapSupabaseToUserAchievement(uaData, achievement);
  } catch (error) {
    console.error('Error in getUserAchievement:', error);
    throw error;
  }
}

/**
 * Actualiza el progreso de un logro para un usuario
 */
export async function updateUserAchievement(
  userId: string,
  achievementId: string,
  progressPercentage: number,
  unlockedAt?: Date
): Promise<UserAchievementWithDetails> {
  try {
    const updateData: Partial<SupabaseUserAchievement> = {
      progress_percentage: progressPercentage,
      updated_at: new Date().toISOString(),
    };

    if (unlockedAt) {
      updateData.unlocked_at = unlockedAt.toISOString();
    }

    const { data: uaData, error: uaError } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        ...updateData,
      }, {
        onConflict: 'user_id,achievement_id'
      })
      .select()
      .single();

    if (uaError) {
      console.error('Error updating user achievement:', uaError);
      throw uaError;
    }

    // Obtener el achievement para devolver el objeto completo
    const result = await getUserAchievement(userId, achievementId);
    if (!result) {
      throw new Error('Failed to fetch updated user achievement');
    }

    return result;
  } catch (error) {
    console.error('Error in updateUserAchievement:', error);
    throw error;
  }
}








































