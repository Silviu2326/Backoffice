// Script de diagnóstico para órdenes (ES Modules)
// Ejecutar: node test-orders-diagnosis.js

import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Variables de entorno de Supabase no configuradas');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Configurada' : 'No configurada');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'Configurada' : 'No configurada');
  process.exit(1);
}

async function testOrders() {
  try {
    console.log('========================================');
    console.log('DIAGNÓSTICO DE ÓRDENES');
    console.log('========================================\n');

    // 1. Verificar conexión a Supabase
    console.log('1. Verificando conexión a Supabase...');
    const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    console.log('   Estado de conexión:', healthCheck.status === 200 ? '✅ OK' : '❌ Error');

    // 2. Obtener todas las órdenes
    console.log('\n2. Obteniendo órdenes de la tabla...');
    const ordersResponse = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ordersResponse.ok) {
      throw new Error(`Error al obtener órdenes: ${ordersResponse.statusText}`);
    }

    const orders = await ordersResponse.json();
    console.log(`   ✅ Total de órdenes encontradas: ${orders.length}`);

    if (orders.length === 0) {
      console.log('   ⚠️  No hay órdenes en la tabla');
      return;
    }

    // 3. Mostrar detalles de cada orden
    console.log('\n3. Detalles de las órdenes:');
    console.log('   ----------------------------------------');
    
    orders.forEach((order, index) => {
      console.log(`\n   Orden #${index + 1}:`);
      console.log(`   - ID: ${order.id}`);
      console.log(`   - Número: ${order.order_number}`);
      console.log(`   - Estado: ${order.status}`);
      console.log(`   - Total: ${order.total}`);
      console.log(`   - Customer ID: ${order.customer_id || 'NULL'}`);
      console.log(`   - Email: ${order.customer_email || order.email || 'N/A'}`);
      console.log(`   - Stripe Payment Intent: ${order.stripe_payment_intent_id || 'N/A'}`);
      console.log(`   - Stripe Payment Status: ${order.stripe_payment_status || 'N/A'}`);
      console.log(`   - Fecha: ${order.created_at}`);
      
      // Verificar si coincidiría con los filtros
      const status = order.status;
      const filtros = {
        todos: true,
        pendientes: ['PENDING_PAYMENT', 'PAID', 'pending'].includes(status),
        proceso: ['PREPARING', 'READY_TO_SHIP', 'SHIPPED', 'processing'].includes(status),
        completados: status === 'DELIVERED' || status === 'completed',
        incidencias: ['RETURNED', 'CANCELLED', 'cancelled', 'FAILED'].includes(status)
      };
      
      console.log(`   - Coincide con filtros:`, filtros);
    });

    // 4. Verificar tabla order_items
    console.log('\n4. Verificando tabla order_items...');
    const orderIds = orders.map(o => o.id);
    const itemsResponse = await fetch(
      `${supabaseUrl}/rest/v1/order_items?select=*&order_id=in.(${orderIds.join(',')})`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (itemsResponse.ok) {
      const items = await itemsResponse.json();
      console.log(`   ✅ Total de items encontrados: ${items.length}`);
      
      // Agrupar por orden
      const itemsByOrder = items.reduce((acc, item) => {
        if (!acc[item.order_id]) acc[item.order_id] = [];
        acc[item.order_id].push(item);
        return acc;
      }, {});
      
      console.log('\n   Items por orden:');
      Object.entries(itemsByOrder).forEach(([orderId, orderItems]) => {
        console.log(`   - Orden ${orderId.substring(0, 8)}...: ${orderItems.length} items`);
      });
    } else {
      console.log('   ❌ Error al obtener items:', itemsResponse.statusText);
    }

    // 5. Verificar si hay problema con customer_id null
    console.log('\n5. Análisis de customer_id:');
    const withCustomer = orders.filter(o => o.customer_id !== null);
    const withoutCustomer = orders.filter(o => o.customer_id === null);
    console.log(`   - Órdenes CON customer_id: ${withCustomer.length}`);
    console.log(`   - Órdenes SIN customer_id: ${withoutCustomer.length}`);
    
    if (withoutCustomer.length > 0) {
      console.log('\n   ⚠️  ADVERTENCIA: Las órdenes sin customer_id pueden no mostrar correctamente el nombre del cliente.');
      console.log('      IDs de órdenes afectadas:');
      withoutCustomer.forEach(o => {
        console.log(`      - ${o.order_number} (${o.id.substring(0, 8)}...)`);
      });
    }

    // 6. Verificar políticas RLS
    console.log('\n6. Verificando políticas RLS (Row Level Security)...');
    console.log('   ℹ️  Nota: Si RLS está habilitado y no hay políticas adecuadas,');
    console.log('      las órdenes pueden no ser visibles para el usuario actual.');

    console.log('\n========================================');
    console.log('DIAGNÓSTICO COMPLETADO');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Error durante el diagnóstico:', error.message);
    process.exit(1);
  }
}

testOrders();
