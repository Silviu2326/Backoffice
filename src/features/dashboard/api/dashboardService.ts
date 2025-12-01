import { supabase } from '../../../lib/supabase';
import { getAllOrders } from '../../orders/api/orderService';
import { OrderStatus } from '../../../types/core';
import { getProducts } from '../../products/api/productService';
import { getProductTotalStock } from '../../products/api/productVariantService';
import { getCustomers } from '../../crm/api/customerService';

/**
 * Estadísticas generales del dashboard
 */
export interface DashboardStats {
  totalRevenue: number;
  averageOrderValue: number;
  totalOrders: number;
  conversionRate: number;
  revenueTrend: number; // Porcentaje de cambio vs período anterior
  aovTrend: number;
  ordersTrend: number;
}

/**
 * Datos de ingresos por día
 */
export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

/**
 * Alerta de pedido
 */
export interface OrderAlert {
  id: string;
  orderNumber: string;
  issue: string;
  time: string;
  severity: 'critical' | 'high' | 'medium';
}

/**
 * Producto con stock bajo
 */
export interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  min: number;
}

/**
 * Cliente top
 */
export interface TopCustomer {
  id: string;
  name: string;
  spent: number;
  orders: number;
  tier: string;
  avatarUrl?: string;
}

/**
 * Obtiene estadísticas generales del dashboard
 */
export async function getDashboardStats(period: 'day' | 'week' | 'month' = 'month'): Promise<DashboardStats> {
  try {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 1);
        break;
      case 'week':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        break;
      case 'month':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        break;
    }

    // Obtener pedidos del período actual
    const currentOrders = await getAllOrders();
    const currentPeriodOrders = currentOrders.filter(
      order => new Date(order.createdAt) >= startDate
    );

    // Obtener pedidos del período anterior
    const previousPeriodOrders = currentOrders.filter(
      order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= previousStartDate && orderDate < startDate;
      }
    );

    // Calcular estadísticas del período actual
    const totalRevenue = currentPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = currentPeriodOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calcular estadísticas del período anterior
    const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const previousOrders = previousPeriodOrders.length;
    const previousAOV = previousOrders > 0 ? previousRevenue / previousOrders : 0;

    // Calcular tendencias
    const revenueTrend = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;
    const aovTrend = previousAOV > 0 
      ? ((averageOrderValue - previousAOV) / previousAOV) * 100 
      : 0;
    const ordersTrend = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders) * 100 
      : 0;

    // Tasa de conversión (simplificado: pedidos / visitas estimadas)
    // En un sistema real, esto vendría de analytics
    const estimatedVisits = totalOrders * 30; // Estimación: 30 visitas por pedido
    const conversionRate = estimatedVisits > 0 
      ? (totalOrders / estimatedVisits) * 100 
      : 0;

    return {
      totalRevenue,
      averageOrderValue,
      totalOrders,
      conversionRate,
      revenueTrend,
      aovTrend,
      ordersTrend,
    };
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    throw error;
  }
}

/**
 * Obtiene datos de ingresos por día
 */
export async function getRevenueData(days: number = 30): Promise<RevenueDataPoint[]> {
  try {
    const orders = await getAllOrders();
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);

    // Filtrar pedidos del período
    const periodOrders = orders.filter(
      order => new Date(order.createdAt) >= startDate
    );

    // Agrupar por día
    const revenueByDay: Record<string, { revenue: number; orders: number }> = {};

    periodOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!revenueByDay[dateKey]) {
        revenueByDay[dateKey] = { revenue: 0, orders: 0 };
      }

      revenueByDay[dateKey].revenue += order.totalAmount;
      revenueByDay[dateKey].orders += 1;
    });

    // Convertir a array y ordenar por fecha
    const data: RevenueDataPoint[] = Object.entries(revenueByDay)
      .map(([date, stats]) => ({
        date: new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
        revenue: stats.revenue,
        orders: stats.orders,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });

    // Rellenar días sin pedidos con 0
    const filledData: RevenueDataPoint[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const dateFormatted = date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });

      const existing = data.find(d => {
        const dDate = new Date(d.date.split('/').reverse().join('-'));
        return dDate.toDateString() === date.toDateString();
      });

      filledData.push(
        existing || {
          date: dateFormatted,
          revenue: 0,
          orders: 0,
        }
      );
    }

    return filledData;
  } catch (error) {
    console.error('Error in getRevenueData:', error);
    throw error;
  }
}

/**
 * Obtiene alertas de pedidos
 */
export async function getOrderAlerts(): Promise<OrderAlert[]> {
  try {
    const orders = await getAllOrders();
    const alerts: OrderAlert[] = [];
    const now = new Date();

    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const hoursSinceOrder = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

      // Alerta: Pago pendiente > 24h
      if (order.status === OrderStatus.PENDING_PAYMENT && hoursSinceOrder > 24) {
        alerts.push({
          id: order.id,
          orderNumber: order.orderNumber,
          issue: 'Pago Pendiente > 24h',
          time: hoursSinceOrder < 48 
            ? `Hace ${Math.floor(hoursSinceOrder - 24)}h` 
            : `Hace ${Math.floor(hoursSinceOrder / 24)}d`,
          severity: 'high',
        });
      }

      // Alerta: Envío retrasado (más de 3 días en estado PREPARING o READY_TO_SHIP)
      if (
        (order.status === OrderStatus.PREPARING || order.status === OrderStatus.READY_TO_SHIP) &&
        hoursSinceOrder > 72
      ) {
        alerts.push({
          id: order.id,
          orderNumber: order.orderNumber,
          issue: 'Envío Retrasado',
          time: `Hace ${Math.floor(hoursSinceOrder / 24)}d`,
          severity: 'medium',
        });
      }

      // Alerta: Pedido cancelado recientemente
      if (order.status === OrderStatus.CANCELLED && hoursSinceOrder < 24) {
        alerts.push({
          id: order.id,
          orderNumber: order.orderNumber,
          issue: 'Pedido Cancelado',
          time: hoursSinceOrder < 1 
            ? `Hace ${Math.floor(hoursSinceOrder * 60)}min` 
            : `Hace ${Math.floor(hoursSinceOrder)}h`,
          severity: 'critical',
        });
      }
    });

    // Ordenar por severidad y tiempo
    alerts.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return 0;
    });

    return alerts.slice(0, 10); // Limitar a 10 alertas
  } catch (error) {
    console.error('Error in getOrderAlerts:', error);
    throw error;
  }
}

/**
 * Obtiene productos con stock bajo
 */
export async function getLowStockItems(threshold: number = 10): Promise<LowStockItem[]> {
  try {
    const products = await getProducts({});
    const lowStockItems: LowStockItem[] = [];

    for (const product of products) {
      try {
        const stock = await getProductTotalStock(product.id);
        if (stock > 0 && stock <= threshold) {
          lowStockItems.push({
            id: product.id,
            name: product.name,
            stock,
            min: threshold,
          });
        }
      } catch (err) {
        // Si hay error calculando stock, continuar
        console.warn(`Error calculating stock for product ${product.id}:`, err);
      }
    }

    // Ordenar por stock (menor primero)
    lowStockItems.sort((a, b) => a.stock - b.stock);

    return lowStockItems.slice(0, 10); // Limitar a 10 items
  } catch (error) {
    console.error('Error in getLowStockItems:', error);
    throw error;
  }
}

/**
 * Obtiene los top clientes
 */
export async function getTopCustomers(limit: number = 5): Promise<TopCustomer[]> {
  try {
    const customers = await getCustomers();
    const orders = await getAllOrders();

    // Calcular gasto total por cliente
    const customerStats: Record<string, { spent: number; orders: number; name: string; avatarUrl?: string }> = {};

    orders.forEach(order => {
      if (!customerStats[order.customerId]) {
        const customer = customers.find(c => c.id === order.customerId);
        customerStats[order.customerId] = {
          spent: 0,
          orders: 0,
          name: customer?.fullName || `Cliente ${order.customerId.substring(0, 8)}`,
          avatarUrl: customer?.avatarUrl,
        };
      }

      customerStats[order.customerId].spent += order.totalAmount;
      customerStats[order.customerId].orders += 1;
    });

    // Convertir a array y ordenar por gasto
    const topCustomers: TopCustomer[] = Object.entries(customerStats)
      .map(([id, stats]) => ({
        id,
        name: stats.name,
        spent: stats.spent,
        orders: stats.orders,
        tier: getCustomerTier(stats.spent),
        avatarUrl: stats.avatarUrl,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, limit);

    return topCustomers;
  } catch (error) {
    console.error('Error in getTopCustomers:', error);
    throw error;
  }
}

/**
 * Determina el tier del cliente basado en el gasto
 */
function getCustomerTier(spent: number): string {
  if (spent >= 2000) return 'Diamond';
  if (spent >= 1000) return 'Gold';
  if (spent >= 500) return 'Silver';
  return 'Bronze';
}

