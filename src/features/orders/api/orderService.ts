import { supabase } from '../../../lib/supabase';
import { Order, OrderItem, OrderStatus, Address } from '../../../types/core';

/**
 * Tipo para el order tal como viene de Supabase
 */
export interface SupabaseOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer_email?: string;
  total_amount: number;
  status: string;
  shipping_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  billing_address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
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
  return {
    id: supabaseOrder.id,
    orderNumber: supabaseOrder.order_number,
    customerId: supabaseOrder.customer_id,
    customerEmail: supabaseOrder.customer_email,
    totalAmount: supabaseOrder.total_amount,
    status: supabaseOrder.status as OrderStatus,
    items: items,
    shippingAddress: {
      street: supabaseOrder.shipping_address?.street || '',
      city: supabaseOrder.shipping_address?.city || '',
      state: supabaseOrder.shipping_address?.state || '',
      zipCode: supabaseOrder.shipping_address?.zip_code || '',
      country: supabaseOrder.shipping_address?.country || '',
    },
    billingAddress: {
      street: supabaseOrder.billing_address?.street || '',
      city: supabaseOrder.billing_address?.city || '',
      state: supabaseOrder.billing_address?.state || '',
      zipCode: supabaseOrder.billing_address?.zip_code || '',
      country: supabaseOrder.billing_address?.country || '',
    },
    createdAt: new Date(supabaseOrder.created_at),
    updatedAt: new Date(supabaseOrder.updated_at),
  };
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
  if (order.customerId !== undefined) supabaseOrder.customer_id = order.customerId;
  if (order.customerEmail !== undefined) supabaseOrder.customer_email = order.customerEmail;
  if (order.totalAmount !== undefined) supabaseOrder.total_amount = order.totalAmount;
  if (order.status !== undefined) supabaseOrder.status = order.status;
  if (order.shippingAddress !== undefined) {
    supabaseOrder.shipping_address = {
      street: order.shippingAddress.street,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      zip_code: order.shippingAddress.zipCode,
      country: order.shippingAddress.country,
    };
  }
  if (order.billingAddress !== undefined) {
    supabaseOrder.billing_address = {
      street: order.billingAddress.street,
      city: order.billingAddress.city,
      state: order.billingAddress.state,
      zip_code: order.billingAddress.zipCode,
      country: order.billingAddress.country,
    };
  }

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

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      throw ordersError;
    }

    if (!ordersData || ordersData.length === 0) {
      return [];
    }

    // Fetch order items for all orders
    const orderIds = ordersData.map(o => o.id);
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      throw itemsError;
    }

    // Group items by order_id
    const itemsByOrderId = (itemsData || []).reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push(mapSupabaseToOrderItem(item));
      return acc;
    }, {} as Record<string, OrderItem[]>);

    // Map orders with their items
    return ordersData.map(order => 
      mapSupabaseToOrder(order, itemsByOrderId[order.id] || [])
    );
  } catch (error) {
    console.error('Error in getAllOrders:', error);
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




