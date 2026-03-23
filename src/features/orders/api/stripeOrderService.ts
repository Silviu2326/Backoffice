import { Order, OrderStatus, OrderItem } from '../../../types/core';

const STRIPE_SECRET_KEY = import.meta.env.VITE_STRIPE_SECRET_KEY;

export interface StripeCheckoutSession {
  id: string;
  object: string;
  amount_total: number;
  amount_subtotal: number;
  currency: string;
  customer: string | null;
  customer_details: {
    email: string;
    name: string;
    phone: string | null;
    address: {
      city: string;
      country: string;
      line1: string;
      line2: string | null;
      postal_code: string;
      state: string;
    } | null;
  } | null;
  status: 'open' | 'complete' | 'expired';
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  payment_intent: string | null;
  metadata: Record<string, string>;
  created: number;
  expires_at: number;
  total_details?: {
    amount_discount: number;
    amount_shipping: number;
    amount_tax: number;
  };
  line_items?: {
    data: Array<{
      id: string;
      description: string;
      amount_total: number;
      amount_subtotal: number;
      amount_discount: number;
      quantity: number;
      price: {
        unit_amount: number;
        product: string;
      };
    }>;
  };
}

/**
 * Obtiene las órdenes (checkout sessions) de Stripe
 */
export async function getStripeOrders(limit: number = 50): Promise<Order[]> {
  if (!STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY no configurada');
    return [];
  }

  try {
    console.log('🔍 [getStripeOrders] Obteniendo órdenes de Stripe...');
    
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions?limit=${limit}&expand[]=data.line_items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de Stripe: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ [getStripeOrders] ${data.data.length} órdenes encontradas en Stripe`);

    // Convertir las sesiones de Stripe al formato Order
    const orders: Order[] = data.data.map((session: StripeCheckoutSession) => 
      mapStripeSessionToOrder(session)
    );

    return orders;
  } catch (error) {
    console.error('❌ [getStripeOrders] Error:', error);
    return [];
  }
}

/**
 * Obtiene una orden específica de Stripe por ID de sesión
 */
export async function getStripeOrderById(sessionId: string): Promise<Order | null> {
  if (!STRIPE_SECRET_KEY) {
    console.warn('⚠️ STRIPE_SECRET_KEY no configurada');
    return null;
  }

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=line_items`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de Stripe: ${error.error?.message || response.statusText}`);
    }

    const session: StripeCheckoutSession = await response.json();
    return mapStripeSessionToOrder(session);
  } catch (error) {
    console.error('❌ [getStripeOrderById] Error:', error);
    return null;
  }
}

/**
 * Convierte una sesión de Stripe Checkout al formato Order de la aplicación
 */
function mapStripeSessionToOrder(session: StripeCheckoutSession): Order {
  // Determinar el estado basado en Stripe
  let status: OrderStatus;
  if (session.payment_status === 'paid') {
    status = OrderStatus.COMPLETED;
  } else if (session.status === 'expired') {
    status = OrderStatus.CANCELLED;
  } else if (session.status === 'open') {
    status = OrderStatus.PENDING_PAYMENT;
  } else {
    status = OrderStatus.PROCESSING;
  }

  // Extraer items de la sesión
  const items: OrderItem[] = session.line_items?.data.map(item => ({
    productId: item.price?.product || 'unknown',
    variantId: undefined,
    name: item.description || 'Producto',
    sku: item.id,
    quantity: item.quantity,
    unitPrice: (item.price?.unit_amount || 0) / 100,
    totalPrice: item.amount_total / 100,
  })) || [];

  // Construir dirección de envío
  const address = session.customer_details?.address;
  const shippingAddress = address ? {
    street: address.line1 + (address.line2 ? `, ${address.line2}` : ''),
    city: address.city || '',
    state: address.state || '',
    zipCode: address.postal_code || '',
    country: address.country || '',
  } : {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  };

  return {
    id: session.id,
    orderNumber: `STRIPE-${session.id.substring(session.id.length - 8)}`,
    customerId: session.customer || '',
    customerEmail: session.customer_details?.email || '',
    totalAmount: session.amount_total / 100,
    subtotal: session.amount_subtotal / 100,
    shippingCost: (session.total_details?.amount_shipping || 0) / 100,
    discount: (session.total_details?.amount_discount || 0) / 100,
    status: status,
    items: items,
    shippingAddress: shippingAddress,
    billingAddress: shippingAddress,
    stripePaymentIntentId: session.payment_intent || undefined,
    stripePaymentStatus: session.payment_status,
    shippingMethod: session.metadata?.shipping_method || 'standard',
    cart: undefined,
    metadata: session.metadata,
    paidAt: session.payment_status === 'paid' ? new Date(session.created * 1000) : undefined,
    createdAt: new Date(session.created * 1000),
    updatedAt: new Date(session.created * 1000),
  };
}

/**
 * Sincroniza una orden de Stripe a Supabase
 */
export async function syncStripeOrderToSupabase(sessionId: string): Promise<boolean> {
  try {
    // Esta función requeriría la Service Role Key para insertar en Supabase
    // Por ahora solo logueamos la intención
    console.log(`🔄 [syncStripeOrderToSupabase] Sincronizando orden ${sessionId}...`);
    console.log('ℹ️ Nota: Para sincronizar automáticamente, usa webhooks de Stripe');
    return false;
  } catch (error) {
    console.error('❌ [syncStripeOrderToSupabase] Error:', error);
    return false;
  }
}
