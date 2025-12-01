import { supabase } from '../../../lib/supabase';
import { Character } from '../../../types/core';

/**
 * Tipo para el personaje tal como viene de Supabase
 */
export interface SupabaseCharacter {
  id: string;
  name: string;
  slug: string;
  role: string;
  role_subtitle?: string;
  biography?: string;
  description?: string;
  signature_quote?: string;
  quote?: string;
  avatar_url?: string;
  cover_image_url?: string;
  video_presentation_url?: string;
  accent_color: string;
  theme_config?: {
    primaryColor?: string;
    secondaryColor?: string;
  };
  personality_tags?: string[];
  traits?: string[];
  interests?: string[];
  likes?: string[];
  signature_beer?: string;
  signature_beer_style?: string;
  cerveza?: string;
  signature_abv?: string;
  abv?: string;
  tipo?: string;
  is_active: boolean;
  created_at: string;
}

/**
 * Convierte un personaje de Supabase al tipo Character de la aplicación
 */
function mapSupabaseToCharacter(supabaseCharacter: SupabaseCharacter): Character {
  return {
    id: supabaseCharacter.id,
    name: supabaseCharacter.name,
    slug: supabaseCharacter.slug,
    role: supabaseCharacter.role,
    roleSubtitle: supabaseCharacter.role_subtitle,
    biography: supabaseCharacter.biography,
    description: supabaseCharacter.description,
    signatureQuote: supabaseCharacter.signature_quote,
    quote: supabaseCharacter.quote,
    avatarUrl: supabaseCharacter.avatar_url,
    coverImageUrl: supabaseCharacter.cover_image_url,
    videoPresentationUrl: supabaseCharacter.video_presentation_url,
    accentColor: supabaseCharacter.accent_color,
    themeConfig: supabaseCharacter.theme_config,
    personalityTags: supabaseCharacter.personality_tags || [],
    traits: supabaseCharacter.traits || [],
    interests: supabaseCharacter.interests || [],
    likes: supabaseCharacter.likes || [],
    signatureBeer: supabaseCharacter.signature_beer,
    signatureBeerStyle: supabaseCharacter.signature_beer_style,
    cerveza: supabaseCharacter.cerveza,
    signatureAbv: supabaseCharacter.signature_abv,
    abv: supabaseCharacter.abv,
    tipo: supabaseCharacter.tipo,
    isActive: supabaseCharacter.is_active,
    createdAt: supabaseCharacter.created_at,
    // Campos legacy para compatibilidad
    color: supabaseCharacter.accent_color,
    fullBodyArtUrl: supabaseCharacter.avatar_url || supabaseCharacter.cover_image_url,
  };
}

/**
 * Convierte un personaje de la aplicación al formato de Supabase
 */
function mapCharacterToSupabase(character: Partial<Character>): Partial<SupabaseCharacter> {
  return {
    name: character.name,
    slug: character.slug,
    role: character.role,
    role_subtitle: character.roleSubtitle,
    biography: character.biography,
    description: character.description,
    signature_quote: character.signatureQuote,
    quote: character.quote,
    avatar_url: character.avatarUrl,
    cover_image_url: character.coverImageUrl,
    video_presentation_url: character.videoPresentationUrl,
    accent_color: character.accentColor || character.color,
    theme_config: character.themeConfig,
    personality_tags: character.personalityTags,
    traits: character.traits,
    interests: character.interests,
    likes: character.likes,
    signature_beer: character.signatureBeer,
    signature_beer_style: character.signatureBeerStyle,
    cerveza: character.cerveza,
    signature_abv: character.signatureAbv,
    abv: character.abv,
    tipo: character.tipo,
    is_active: character.isActive ?? true,
  };
}

/**
 * Obtiene todos los personajes
 */
export async function getCharacters(filters?: {
  isActive?: boolean;
  search?: string;
}): Promise<Character[]> {
  try {
    let query = supabase
      .from('characters')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,role.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching characters:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToCharacter);
  } catch (error) {
    console.error('Error in getCharacters:', error);
    throw error;
  }
}

/**
 * Obtiene un personaje por ID
 */
export async function getCharacterById(id: string): Promise<Character | null> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching character:', error);
      throw error;
    }

    return data ? mapSupabaseToCharacter(data) : null;
  } catch (error) {
    console.error('Error in getCharacterById:', error);
    throw error;
  }
}

/**
 * Obtiene un personaje por slug
 */
export async function getCharacterBySlug(slug: string): Promise<Character | null> {
  try {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching character by slug:', error);
      throw error;
    }

    return data ? mapSupabaseToCharacter(data) : null;
  } catch (error) {
    console.error('Error in getCharacterBySlug:', error);
    throw error;
  }
}

/**
 * Crea un nuevo personaje
 */
export async function createCharacter(character: Omit<Character, 'id' | 'createdAt'>): Promise<Character> {
  try {
    const supabaseCharacter = mapCharacterToSupabase(character);
    
    // Generar slug si no existe
    if (!supabaseCharacter.slug && character.name) {
      supabaseCharacter.slug = character.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const { data, error } = await supabase
      .from('characters')
      .insert(supabaseCharacter)
      .select()
      .single();

    if (error) {
      console.error('Error creating character:', error);
      throw error;
    }

    return mapSupabaseToCharacter(data);
  } catch (error) {
    console.error('Error in createCharacter:', error);
    throw error;
  }
}

/**
 * Actualiza un personaje existente
 */
export async function updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
  try {
    const supabaseUpdates = mapCharacterToSupabase(updates);

    const { data, error } = await supabase
      .from('characters')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating character:', error);
      throw error;
    }

    return mapSupabaseToCharacter(data);
  } catch (error) {
    console.error('Error in updateCharacter:', error);
    throw error;
  }
}

/**
 * Elimina un personaje
 */
export async function deleteCharacter(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting character:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCharacter:', error);
    throw error;
  }
}




