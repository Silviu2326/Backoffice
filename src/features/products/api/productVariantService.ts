import { supabase } from '../../../lib/supabase';
import { ProductVariant } from '../../../types/core';

/**
 * Tipo para la variante tal como viene de Supabase
 */
export interface SupabaseProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  price: number;
  promotional_price?: number;
  weight_kg: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  barcode?: string;
  is_default: boolean;
  stock_quantity: number;
  created_at: string;
}

/**
 * Convierte una variante de Supabase al tipo ProductVariant de la aplicación
 */
function mapSupabaseToVariant(supabaseVariant: SupabaseProductVariant): ProductVariant {
  return {
    id: supabaseVariant.id,
    productId: supabaseVariant.product_id,
    sku: supabaseVariant.sku,
    name: supabaseVariant.name,
    price: supabaseVariant.price,
    promotionalPrice: supabaseVariant.promotional_price,
    weightKg: supabaseVariant.weight_kg,
    dimensions: supabaseVariant.dimensions,
    barcode: supabaseVariant.barcode,
    isDefault: supabaseVariant.is_default,
    stockQuantity: supabaseVariant.stock_quantity,
  };
}

/**
 * Convierte una variante de la aplicación al formato de Supabase
 */
function mapVariantToSupabase(variant: Partial<ProductVariant>): Partial<SupabaseProductVariant> {
  return {
    product_id: variant.productId,
    sku: variant.sku,
    name: variant.name,
    price: variant.price,
    promotional_price: variant.promotionalPrice,
    weight_kg: variant.weightKg,
    dimensions: variant.dimensions,
    barcode: variant.barcode,
    is_default: variant.isDefault,
    stock_quantity: variant.stockQuantity,
  };
}

/**
 * Obtiene todas las variantes de un producto
 */
export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToVariant);
  } catch (error) {
    console.error('Error in getProductVariants:', error);
    throw error;
  }
}

/**
 * Obtiene una variante por ID
 */
export async function getVariantById(id: string): Promise<ProductVariant | null> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching variant:', error);
      throw error;
    }

    return data ? mapSupabaseToVariant(data) : null;
  } catch (error) {
    console.error('Error in getVariantById:', error);
    throw error;
  }
}

/**
 * Crea una nueva variante
 */
export async function createVariant(variant: Omit<ProductVariant, 'id'>): Promise<ProductVariant> {
  try {
    const supabaseVariant = mapVariantToSupabase(variant);
    
    // Si esta variante es por defecto, quitar el flag de otras variantes del mismo producto
    if (variant.isDefault) {
      await supabase
        .from('product_variants')
        .update({ is_default: false })
        .eq('product_id', variant.productId);
    }

    const { data, error } = await supabase
      .from('product_variants')
      .insert(supabaseVariant)
      .select()
      .single();

    if (error) {
      console.error('Error creating variant:', error);
      throw error;
    }

    return mapSupabaseToVariant(data);
  } catch (error) {
    console.error('Error in createVariant:', error);
    throw error;
  }
}

/**
 * Actualiza una variante existente
 */
export async function updateVariant(id: string, updates: Partial<ProductVariant>): Promise<ProductVariant> {
  try {
    const supabaseUpdates = mapVariantToSupabase(updates as ProductVariant);
    
    // Si esta variante se marca como por defecto, quitar el flag de otras variantes
    if (updates.isDefault === true) {
      const variant = await getVariantById(id);
      if (variant) {
        await supabase
          .from('product_variants')
          .update({ is_default: false })
          .eq('product_id', variant.productId)
          .neq('id', id);
      }
    }

    const { data, error } = await supabase
      .from('product_variants')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating variant:', error);
      throw error;
    }

    return mapSupabaseToVariant(data);
  } catch (error) {
    console.error('Error in updateVariant:', error);
    throw error;
  }
}

/**
 * Elimina una variante
 */
export async function deleteVariant(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('product_variants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting variant:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteVariant:', error);
    throw error;
  }
}

/**
 * Crea múltiples variantes a la vez
 */
export async function createVariants(variants: Omit<ProductVariant, 'id'>[]): Promise<ProductVariant[]> {
  try {
    // Si alguna variante es por defecto, quitar el flag de otras variantes del mismo producto
    const defaultVariant = variants.find(v => v.isDefault);
    if (defaultVariant) {
      await supabase
        .from('product_variants')
        .update({ is_default: false })
        .eq('product_id', defaultVariant.productId);
    }

    const supabaseVariants = variants.map(mapVariantToSupabase);

    const { data, error } = await supabase
      .from('product_variants')
      .insert(supabaseVariants)
      .select();

    if (error) {
      console.error('Error creating variants:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToVariant);
  } catch (error) {
    console.error('Error in createVariants:', error);
    throw error;
  }
}

/**
 * Calcula el stock total de un producto sumando todas sus variantes
 */
export async function getProductTotalStock(productId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .select('stock_quantity')
      .eq('product_id', productId);

    if (error) {
      console.error('Error calculating total stock:', error);
      throw error;
    }

    return (data || []).reduce((total, variant) => total + (variant.stock_quantity || 0), 0);
  } catch (error) {
    console.error('Error in getProductTotalStock:', error);
    throw error;
  }
}
















