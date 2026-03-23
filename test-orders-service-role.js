// Script de diagnóstico para órdenes con Service Role Key
// Ejecutar: node test-orders-service-role.js

import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: VITE_SUPABASE_URL no está configurada');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY no está configurada');
  console.error('ℹ️  Esta clave es necesaria para ver todas las órdenes sin restricciones RLS');
  process.exit(1);
}

async function testOrdersWithServiceRole() {
  try {
    console.log('========================================');
    console.log('DIAGNÓSTICO DE ÓRDENES (Service Role)');
    console.log('========================================\n');

    console.log('🔑 Usando Service Role Key para bypass RLS...\n');

    // Obtener todas las órdenes con Service Role
    console.log('1. Obteniendo órdenes con Service Role...');
    const ordersResponse = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc`, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!ordersResponse.ok) {
      const errorText = await ordersResponse.text();
      throw new Error(`Error al obtener órdenes: ${ordersResponse.status} ${ordersResponse.statusText}\n${errorText}`);
    }

    const orders = await ordersResponse.json();
    console.log(`   ✅ Total de órdenes encontradas: ${orders.length}`);

    if (orders.length === 0) {
      console.log('   ⚠️  No hay órdenes en la tabla');
      return;
    }

    // Mostrar resumen
    console.log('\n2. Resumen de órdenes:');
    console.log('   ----------------------------------------');
    
    orders.forEach((order, index) => {
      console.log(`\n   📦 Orden #${index + 1}: ${order.order_number}`);
      console.log(`      ID: ${order.id}`);
      console.log(`      Estado: ${order.status}`);
      console.log(`      Total: €${order.total}`);
      console.log(`      Customer ID: ${order.customer_id || 'NULL ⚠️'}`);
      console.log(`      Email: ${order.customer_email || order.email || 'N/A'}`);
      console.log(`      Stripe: ${order.stripe_payment_intent_id ? '✅ ' + order.stripe_payment_status : '❌ Sin pago'}`);
      console.log(`      Fecha: ${new Date(order.created_at).toLocaleString('es-ES')}`);
      
      // Verificar filtros
      const status = order.status;
      const tabCoincide = 
        status === 'completed' ? '✅ completados' :
        ['PENDING_PAYMENT', 'PAID', 'pending'].includes(status) ? '✅ pendientes' :
        ['PREPARING', 'READY_TO_SHIP', 'SHIPPED', 'processing'].includes(status) ? '✅ proceso' :
        ['RETURNED', 'CANCELLED', 'cancelled', 'FAILED'].includes(status) ? '✅ incidencias' :
        '❓ otro';
      console.log(`      Tab correspondiente: ${tabCoincide}`);
    });

    // Análisis de problemas
    console.log('\n\n3. Análisis de problemas:');
    console.log('   ----------------------------------------');
    
    const problemas = [];
    
    // Problema 1: customer_id null
    const sinCustomer = orders.filter(o => !o.customer_id);
    if (sinCustomer.length > 0) {
      problemas.push({
        titulo: 'Órdenes sin customer_id',
        descripcion: `${sinCustomer.length} orden(es) no tienen customer_id asignado`,
        solucion: 'Las órdenes se crearon sin vincular a un cliente. Esto puede pasar en compras de invitado.',
        ordenes: sinCustomer.map(o => o.order_number)
      });
    }
    
    // Problema 2: Verificar si hay órdenes con RLS blocking
    console.log('\n   🔒 Verificando Row Level Security (RLS)...');
    
    // Intentar obtener órdenes con anon key
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (anonKey) {
      const anonResponse = await fetch(`${supabaseUrl}/rest/v1/orders?select=*`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (anonResponse.ok) {
        const anonOrders = await anonResponse.json();
        if (anonOrders.length === 0 && orders.length > 0) {
          problemas.push({
            titulo: 'RLS bloqueando órdenes',
            descripcion: `Service Role ve ${orders.length} órdenes, pero Anon Key ve 0`,
            solucion: 'Las políticas RLS están activadas. Necesitas configurar políticas que permitan ver las órdenes a los usuarios autenticados.',
            ordenes: []
          });
        } else {
          console.log('   ✅ Anon key puede ver las órdenes (RLS OK)');
        }
      }
    }
    
    // Mostrar problemas encontrados
    if (problemas.length > 0) {
      console.log('\n   ❌ PROBLEMAS ENCONTRADOS:\n');
      problemas.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.titulo}`);
        console.log(`      Problema: ${p.descripcion}`);
        console.log(`      Solución: ${p.solucion}`);
        if (p.ordenes.length > 0) {
          console.log(`      Órdenes afectadas: ${p.ordenes.join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('\n   ✅ No se encontraron problemas principales');
    }

    console.log('\n========================================');
    console.log('DIAGNÓSTICO COMPLETADO');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Error durante el diagnóstico:', error.message);
    process.exit(1);
  }
}

testOrdersWithServiceRole();
