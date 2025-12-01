import { supabase } from '../../../lib/supabase';
import { Product, ProductStatus, InventoryType } from '../../../types/core';

/**
 * Tipo para el producto tal como viene de Supabase
 */
export interface SupabaseProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  rich_description?: string;
  base_price: number;
  images: string[];
  category: string;
  tags: string[];
  status: string;
  inventory_type: string;
  featured_config?: {
    isFeatured: boolean;
    featuredStartDate?: string;
    featuredEndDate?: string;
    featuredType?: string;
    badge?: string;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Convierte un producto de Supabase al tipo Product de la aplicación
 */
function mapSupabaseToProduct(supabaseProduct: SupabaseProduct): Product {
  return {
    id: supabaseProduct.id,
    sku: supabaseProduct.sku,
    name: supabaseProduct.name,
    slug: supabaseProduct.slug,
    description: supabaseProduct.description,
    richDescription: supabaseProduct.rich_description,
    basePrice: supabaseProduct.base_price,
    images: Array.isArray(supabaseProduct.images) ? supabaseProduct.images : [],
    category: supabaseProduct.category,
    tags: Array.isArray(supabaseProduct.tags) ? supabaseProduct.tags : [],
    status: supabaseProduct.status as ProductStatus,
    inventoryType: supabaseProduct.inventory_type as InventoryType,
    featuredConfig: supabaseProduct.featured_config ? {
      isFeatured: supabaseProduct.featured_config.isFeatured || false,
      featuredStartDate: supabaseProduct.featured_config.featuredStartDate,
      featuredEndDate: supabaseProduct.featured_config.featuredEndDate,
      featuredType: supabaseProduct.featured_config.featuredType,
    } : undefined,
  };
}

/**
 * Convierte un producto de la aplicación al formato de Supabase
 */
function mapProductToSupabase(product: Partial<Product>): Partial<SupabaseProduct> {
  return {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    rich_description: product.richDescription,
    base_price: product.basePrice,
    images: product.images,
    category: product.category,
    tags: product.tags,
    status: product.status,
    inventory_type: product.inventoryType,
    featured_config: product.featuredConfig ? {
      isFeatured: product.featuredConfig.isFeatured,
      featuredStartDate: product.featuredConfig.featuredStartDate,
      featuredEndDate: product.featuredConfig.featuredEndDate,
      featuredType: product.featuredConfig.featuredType,
    } : null,
  };
}

/**
 * Obtiene todos los productos
 */
export async function getProducts(filters?: {
  status?: ProductStatus;
  category?: string;
  search?: string;
}): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    return (data || []).map(mapSupabaseToProduct);
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
}

/**
 * Obtiene un producto por ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching product:', error);
      throw error;
    }

    return data ? mapSupabaseToProduct(data) : null;
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
}

/**
 * Obtiene un producto por slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching product by slug:', error);
      throw error;
    }

    return data ? mapSupabaseToProduct(data) : null;
  } catch (error) {
    console.error('Error in getProductBySlug:', error);
    throw error;
  }
}

/**
 * Crea un nuevo producto
 */
export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  try {
    const supabaseProduct = mapProductToSupabase(product);
    
    // Generar slug si no existe
    if (!supabaseProduct.slug && product.name) {
      supabaseProduct.slug = product.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    const { data, error } = await supabase
      .from('products')
      .insert(supabaseProduct)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    return mapSupabaseToProduct(data);
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
}

/**
 * Actualiza un producto existente
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  try {
    const supabaseUpdates = mapProductToSupabase(updates as Product);
    
    // Actualizar updated_at automáticamente
    supabaseUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('products')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }

    return mapSupabaseToProduct(data);
  } catch (error) {
    console.error('Error in updateProduct:', error);
    throw error;
  }
}

/**
 * Elimina un producto
 */
export async function deleteProduct(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    throw error;
  }
}

/**
 * Obtiene productos destacados
 */
export async function getFeaturedProducts(featuredType?: string): Promise<Product[]> {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .not('featured_config', 'is', null);

    if (featuredType) {
      query = query.eq('featured_config->>featuredType', featuredType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }

    return (data || [])
      .map(mapSupabaseToProduct)
      .filter(p => p.featuredConfig?.isFeatured);
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    throw error;
  }
}

/**
 * Actualiza la configuración destacada de un producto
 */
export async function updateFeaturedConfig(
  productId: string,
  featuredConfig: Product['featuredConfig']
): Promise<Product> {
  try {
    const { data, error } = await supabase
      .from('products')
      .update({
        featured_config: featuredConfig || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      console.error('Error updating featured config:', error);
      throw error;
    }

    return mapSupabaseToProduct(data);
  } catch (error) {
    console.error('Error in updateFeaturedConfig:', error);
    throw error;
  }
}

