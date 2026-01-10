import { supabase } from '../../../lib/supabase';
import { Order, OrderItem, OrderStatus, Address } from '../../../types/core';

/**
 * Tipo para el order tal como viene de Supabase
 */
export interface SupabaseOrder {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_email?: string;
  total: number;  // Cambiado de total_amount a total
  subtotal?: number;
  shipping_cost?: number;
  discount?: number;
  status: string;
  shipping_address?: any;  // JSONB flexible
  stripe_payment_intent_id?: string;
  stripe_payment_status?: string;
  shipping_method?: string;
  cart?: any;
  email?: string;
  metadata?: any;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Tipo para el order_item tal como viene de Supabase
 */
export interface SupabaseOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

/**
 * Convierte un order de Supabase al tipo Order de la aplicación
 */
function mapSupabaseToOrder(supabaseOrder: SupabaseOrder, items: OrderItem[]): Order {
  console.log('🔄 [mapSupabaseToOrder] Iniciando mapeo para orden:', supabaseOrder.id);
  console.log('📦 [mapSupabaseToOrder] Datos recibidos:', {
    id: supabaseOrder.id,
    order_number: supabaseOrder.order_number,
    total: supabaseOrder.total,
    customer_id: supabaseOrder.customer_id,
    shipping_address: supabaseOrder.shipping_address,
    shipping_address_type: typeof supabaseOrder.shipping_address
  });

  // Parsear shipping_address si es string JSON
  let shippingAddr: any = {};
  if (typeof supabaseOrder.shipping_address === 'string') {
    try {
      shippingAddr = JSON.parse(supabaseOrder.shipping_address);
      console.log('✅ [mapSupabaseToOrder] Shipping address parseado:', shippingAddr);
    } catch (e) {
      console.error('❌ [mapSupabaseToOrder] Error parseando shipping_address:', e);
      shippingAddr = {};
    }
  } else if (supabaseOrder.shipping_address) {
    shippingAddr = supabaseOrder.shipping_address;
    console.log('✅ [mapSupabaseToOrder] Shipping address (objeto):', shippingAddr);
  }

  const mappedOrder = {
    id: supabaseOrder.id,
    orderNumber: supabaseOrder.order_number,
    customerId: supabaseOrder.customer_id || '',
    customerEmail: supabaseOrder.customer_email || supabaseOrder.email || '',
    totalAmount: supabaseOrder.total,  // Cambiado de total_amount a total
    subtotal: supabaseOrder.subtotal || 0,
    shippingCost: supabaseOrder.shipping_cost || 0,
    discount: supabaseOrder.discount || 0,
    status: supabaseOrder.status as OrderStatus,
    items: items,
    shippingAddress: {
      street: shippingAddr.street || shippingAddr.address || '',
      city: shippingAddr.city || '',
      state: shippingAddr.state || '',
      zipCode: shippingAddr.zip_code || shippingAddr.zipCode || '',
      country: shippingAddr.country || '',
    },
    billingAddress: {
      street: shippingAddr.street || shippingAddr.address || '',
      city: shippingAddr.city || '',
      state: shippingAddr.state || '',
      zipCode: shippingAddr.zip_code || shippingAddr.zipCode || '',
      country: shippingAddr.country || '',
    },
    stripePaymentIntentId: supabaseOrder.stripe_payment_intent_id,
    stripePaymentStatus: supabaseOrder.stripe_payment_status,
    shippingMethod: supabaseOrder.shipping_method,
    cart: supabaseOrder.cart,
    metadata: supabaseOrder.metadata,
    paidAt: supabaseOrder.paid_at ? new Date(supabaseOrder.paid_at) : undefined,
    createdAt: new Date(supabaseOrder.created_at),
    updatedAt: new Date(supabaseOrder.updated_at),
  };

  console.log('✅ [mapSupabaseToOrder] Orden mapeada:', mappedOrder);

  return mappedOrder;
}

/**
 * Convierte un order_item de Supabase al tipo OrderItem de la aplicación
 */
function mapSupabaseToOrderItem(supabaseItem: SupabaseOrderItem): OrderItem {
  return {
    productId: supabaseItem.product_id,
    variantId: supabaseItem.variant_id,
    name: supabaseItem.name,
    sku: supabaseItem.sku,
    quantity: supabaseItem.quantity,
    unitPrice: supabaseItem.unit_price,
    totalPrice: supabaseItem.total_price,
  };
}

/**
 * Convierte un order de la aplicación al formato de Supabase
 */
function mapOrderToSupabase(order: Partial<Order>): Partial<SupabaseOrder> {
  const supabaseOrder: Partial<SupabaseOrder> = {};

  if (order.orderNumber !== undefined) supabaseOrder.order_number = order.orderNumber;
  if (order.customerId !== undefined) supabaseOrder.customer_id = order.customerId || null;
  if (order.customerEmail !== undefined) {
    supabaseOrder.customer_email = order.customerEmail;
    supabaseOrder.email = order.customerEmail;
  }
  if (order.totalAmount !== undefined) supabaseOrder.total = order.totalAmount;  // Cambiado de total_amount a total
  if (order.subtotal !== undefined) supabaseOrder.subtotal = order.subtotal;
  if (order.shippingCost !== undefined) supabaseOrder.shipping_cost = order.shippingCost;
  if (order.discount !== undefined) supabaseOrder.discount = order.discount;
  if (order.status !== undefined) supabaseOrder.status = order.status;
  if (order.stripePaymentIntentId !== undefined) supabaseOrder.stripe_payment_intent_id = order.stripePaymentIntentId;
  if (order.stripePaymentStatus !== undefined) supabaseOrder.stripe_payment_status = order.stripePaymentStatus;
  if (order.shippingMethod !== undefined) supabaseOrder.shipping_method = order.shippingMethod;
  if (order.cart !== undefined) supabaseOrder.cart = order.cart;
  if (order.metadata !== undefined) supabaseOrder.metadata = order.metadata;
  if (order.shippingAddress !== undefined) {
    supabaseOrder.shipping_address = {
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zip_code: order.shippingAddress.zipCode,
      country: order.shippingAddress.country,
    };
  }
  // billing_address eliminado - no existe en el esquema real

  return supabaseOrder;
}

/**
 * Convierte un order_item de la aplicación al formato de Supabase
 */
function mapOrderItemToSupabase(orderId: string, item: OrderItem): Partial<SupabaseOrderItem> {
  return {
    order_id: orderId,
    product_id: item.productId,
    variant_id: item.variantId,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    total_price: item.totalPrice,
  };
}

/**
 * Obtiene todos los pedidos
 */
export async function getAllOrders(filters?: {
  status?: OrderStatus;
  customerId?: string;
}): Promise<Order[]> {
  try {
    console.log('🔍 [getAllOrders] Iniciando...', { filters });

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.customerId) {
      query = query.eq('customer_id', filters.customerId);
    }

    const { data: ordersData, error: ordersError } = await query;

    console.log('📦 [getAllOrders] Respuesta de Supabase:', {
      success: !ordersError,
      ordersCount: ordersData?.length || 0,
      error: ordersError,
      firstOrder: ordersData?.[0]
    });

    if (ordersError) {
      console.error('❌ [getAllOrders] Error fetching orders:', ordersError);
      throw ordersError;
    }

    if (!ordersData || ordersData.length === 0) {
      console.log('⚠️ [getAllOrders] No se encontraron órdenes');
      return [];
    }

    console.log('✅ [getAllOrders] Órdenes obtenidas:', ordersData.length);

    // Fetch order items for all orders
    const orderIds = ordersData.map(o => o.id);
    console.log('🔍 [getAllOrders] Buscando items para órdenes:', orderIds);

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    console.log('📦 [getAllOrders] Items obtenidos:', {
      success: !itemsError,
      itemsCount: itemsData?.length || 0,
      error: itemsError
    });

    if (itemsError) {
      console.error('❌ [getAllOrders] Error fetching order items:', itemsError);
      // No lanzar error, continuar sin items
    }

    // Group items by order_id
    const itemsByOrderId = (itemsData || []).reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push(mapSupabaseToOrderItem(item));
      return acc;
    }, {} as Record<string, OrderItem[]>);

    console.log('📊 [getAllOrders] Items agrupados por orden:', itemsByOrderId);

    // Map orders with their items
    const mappedOrders = ordersData.map(order => {
      console.log('🔄 [getAllOrders] Mapeando orden:', {
        id: order.id,
        order_number: order.order_number,
        total: order.total,
        customer_id: order.customer_id,
        raw: order
      });
      return mapSupabaseToOrder(order, itemsByOrderId[order.id] || []);
    });

    console.log('✅ [getAllOrders] Órdenes mapeadas:', mappedOrders.length, mappedOrders);

    return mappedOrders;
  } catch (error) {
    console.error('❌ [getAllOrders] Error fatal:', error);
    throw error;
  }
}

/**
 * Obtiene un pedido por ID
 */
export async function getOrderById(id: string): Promise<Order | null> {
  try {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderError) {
      if (orderError.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching order:', orderError);
      throw orderError;
    }

    if (!orderData) {
      return null;
    }

    // Fetch order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      throw itemsError;
    }

    const items = (itemsData || []).map(mapSupabaseToOrderItem);

    return mapSupabaseToOrder(orderData, items);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    throw error;
  }
}

/**
 * Crea un nuevo pedido
 */
export async function createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  try {
    const supabaseOrder = mapOrderToSupabase(order);

    // Generate order number if not provided
    if (!supabaseOrder.order_number) {
      const timestamp = Date.now();
      supabaseOrder.order_number = `ORD-${timestamp.toString().slice(-6)}`;
    }

    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert(supabaseOrder)
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw orderError;
    }

    // Insert order items
    if (order.items && order.items.length > 0) {
      const orderItems = order.items.map(item => mapOrderItemToSupabase(orderData.id, item));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw itemsError;
      }
    }

    // Fetch the complete order with items
    return await getOrderById(orderData.id) || orderData as any;
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
}

/**
 * Actualiza un pedido existente
 */
export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  try {
    const supabaseUpdates = mapOrderToSupabase(updates);

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (orderError) {
      console.error('Error updating order:', orderError);
      throw orderError;
    }

    // If items are being updated, replace all items
    if (updates.items !== undefined) {
      // Delete existing items
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);

      // Insert new items
      if (updates.items.length > 0) {
        const orderItems = updates.items.map(item => mapOrderItemToSupabase(id, item));
        
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
          console.error('Error updating order items:', itemsError);
          throw itemsError;
        }
      }
    }

    // Fetch the complete order with items
    return await getOrderById(id) || orderData as any;
  } catch (error) {
    console.error('Error in updateOrder:', error);
    throw error;
  }
}

/**
 * Actualiza solo el estado de un pedido
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  return updateOrder(id, { status });
}

/**
 * Elimina un pedido
 */
export async function deleteOrder(id: string): Promise<void> {
  try {
    // Delete order items first (foreign key constraint)
    const { error: itemsError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', id);

    if (itemsError) {
      console.error('Error deleting order items:', itemsError);
      throw itemsError;
    }

    // Delete order
    const { error: orderError } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (orderError) {
      console.error('Error deleting order:', orderError);
      throw orderError;
    }
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    throw error;
  }
}








































