// Test para verificar pedidos en Stripe con información completa
// Ejecutar: node test-stripe-orders.js

import dotenv from 'dotenv';
dotenv.config();

const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Error: VITE_STRIPE_SECRET_KEY no está configurada en el archivo .env');
  process.exit(1);
}

console.log('🔍 Verificando pedidos en Stripe...');
console.log('💳 Usando clave:', stripeSecretKey.substring(0, 7) + '...' + stripeSecretKey.substring(stripeSecretKey.length - 4));

async function checkStripeOrders() {
  try {
    // Obtener las últimas 10 sesiones de checkout con line_items expandidos
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions?limit=10&expand[]=data.line_items', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error de Stripe: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    console.log('\n' + '='.repeat(70));
    console.log('RESUMEN DE ÓRDENES EN STRIPE');
    console.log('='.repeat(70));
    console.log(`📦 Total de sesiones encontradas: ${data.data.length}`);
    console.log(`📄 Tiene más páginas: ${data.has_more ? 'Sí' : 'No'}`);
    
    // Filtrar solo las completadas y pagadas
    const completedOrders = data.data.filter(s => s.status === 'complete' && s.payment_status === 'paid');
    
    console.log(`✅ Órdenes completadas y pagadas: ${completedOrders.length}`);
    console.log(`⏳ Otras órdenes: ${data.data.length - completedOrders.length}`);
    
    if (data.data.length === 0) {
      console.log('\n⚠️  No se encontraron pedidos en Stripe.');
      return;
    }

    // Mostrar información completa de las órdenes completadas
    if (completedOrders.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('🎉 ÓRDENES COMPLETADAS Y PAGADAS - DETALLE COMPLETO');
      console.log('='.repeat(70));
      
      completedOrders.forEach((session, index) => {
        console.log(`\n${'─'.repeat(70)}`);
        console.log(`📋 ORDEN #${index + 1}: ${session.id}`);
        console.log(`${'─'.repeat(70)}\n`);
        
        // Información General
        console.log('🏪 INFORMACIÓN GENERAL');
        console.log(`   ├─ ID Sesión:        ${session.id}`);
        console.log(`   ├─ Payment Intent:   ${session.payment_intent || 'N/A'}`);
        console.log(`   ├─ Estado:           ✅ COMPLETE`);
        console.log(`   ├─ Estado Pago:      ✅ PAID`);
        console.log(`   ├─ Modo:             ${session.mode}`);
        console.log(`   ├─ Livemode:         ${session.livemode ? '✅ Sí (Producción)' : '⚠️ No (Test)'}`);
        console.log(`   └─ Fecha Creación:   ${new Date(session.created * 1000).toLocaleString('es-ES')}`);
        
        // Información Financiera
        console.log('\n💰 INFORMACIÓN FINANCIERA');
        console.log(`   ├─ Subtotal:         €${(session.amount_subtotal / 100).toFixed(2)}`);
        console.log(`   ├─ Descuento:        €${((session.total_details?.amount_discount || 0) / 100).toFixed(2)}`);
        console.log(`   ├─ Envío:            €${((session.total_details?.amount_shipping || 0) / 100).toFixed(2)}`);
        console.log(`   ├─ Impuestos:        €${((session.total_details?.amount_tax || 0) / 100).toFixed(2)}`);
        console.log(`   └─ TOTAL PAGADO:     €${(session.amount_total / 100).toFixed(2)} ${session.currency.toUpperCase()}`);
        
        // Información del Cliente
        console.log('\n👤 INFORMACIÓN DEL CLIENTE');
        if (session.customer_details) {
          console.log(`   ├─ Nombre:           ${session.customer_details.name || 'N/A'}`);
          console.log(`   ├─ Email:            ${session.customer_details.email || 'N/A'}`);
          console.log(`   ├─ Teléfono:         ${session.customer_details.phone || 'N/A'}`);
          
          if (session.customer_details.address) {
            const addr = session.customer_details.address;
            console.log(`   └─ Dirección:`);
            console.log(`      ├─ Línea 1:       ${addr.line1 || 'N/A'}`);
            console.log(`      ├─ Línea 2:       ${addr.line2 || 'N/A'}`);
            console.log(`      ├─ Ciudad:        ${addr.city || 'N/A'}`);
            console.log(`      ├─ Estado:        ${addr.state || 'N/A'}`);
            console.log(`      ├─ Código Postal: ${addr.postal_code || 'N/A'}`);
            console.log(`      └─ País:          ${addr.country || 'N/A'}`);
          }
        } else {
          console.log(`   └─ Cliente:          ${session.customer_email || 'No disponible'}`);
        }
        
        // Información del Cliente de Stripe
        if (session.customer) {
          console.log(`\n   🆔 Cliente Stripe ID: ${session.customer}`);
        }
        
        // Items de la Orden
        console.log('\n🛍️  ITEMS DE LA ORDEN');
        if (session.line_items && session.line_items.data.length > 0) {
          session.line_items.data.forEach((item, i) => {
            console.log(`   ${i + 1}. ${item.description}`);
            console.log(`      ├─ Cantidad:      ${item.quantity}`);
            console.log(`      ├─ Precio Unit.:  €${((item.price?.unit_amount || 0) / 100).toFixed(2)}`);
            console.log(`      ├─ Descuento:     €${(item.amount_discount / 100).toFixed(2)}`);
            console.log(`      ├─ Subtotal:      €${(item.amount_subtotal / 100).toFixed(2)}`);
            console.log(`      └─ Total:         €${(item.amount_total / 100).toFixed(2)}`);
          });
        } else {
          console.log('   ⚠️  No hay items disponibles');
        }
        
        // URLs y Metadata
        console.log('\n🔗 URLS Y CONFIGURACIÓN');
        console.log(`   ├─ URL Éxito:        ${session.success_url}`);
        console.log(`   ├─ URL Cancelación:  ${session.cancel_url}`);
        console.log(`   └─ Expira:           ${new Date(session.expires_at * 1000).toLocaleString('es-ES')}`);
        
        if (session.metadata && Object.keys(session.metadata).length > 0) {
          console.log('\n📎 METADATA');
          Object.entries(session.metadata).forEach(([key, value]) => {
            console.log(`   ├─ ${key}: ${value}`);
          });
        }
        
        // Información de Pago
        console.log('\n💳 INFORMACIÓN DE PAGO');
        console.log(`   ├─ Métodos Aceptados: ${session.payment_method_types?.join(', ') || 'N/A'}`);
        console.log(`   ├─ Colección Método:  ${session.payment_method_collection}`);
        console.log(`   ├─ Recaudación Email: ${session.customer_email || 'N/A'}`);
        console.log(`   └─ Factura Creada:    ${session.invoice ? 'Sí' : 'No'}`);
        
        console.log('\n');
      });
    }
    
    // Mostrar resumen de otras órdenes (no completadas)
    const otherOrders = data.data.filter(s => !(s.status === 'complete' && s.payment_status === 'paid'));
    if (otherOrders.length > 0) {
      console.log('\n' + '='.repeat(70));
      console.log('📋 OTRAS ÓRDENES (Abiertas, Expiradas, Sin Pagar)');
      console.log('='.repeat(70));
      
      otherOrders.forEach((session, index) => {
        const statusIcon = session.status === 'open' ? '⏳' : '❌';
        const paymentIcon = session.payment_status === 'paid' ? '✅' : '❌';
        
        console.log(`\n${index + 1}. ${statusIcon} ${session.id}`);
        console.log(`   ├─ Estado Sesión: ${session.status}`);
        console.log(`   ├─ Estado Pago:   ${paymentIcon} ${session.payment_status}`);
        console.log(`   ├─ Total:         €${(session.amount_total / 100).toFixed(2)}`);
        console.log(`   ├─ Cliente:       ${session.customer_details?.email || session.customer_email || 'N/A'}`);
        console.log(`   └─ Fecha:         ${new Date(session.created * 1000).toLocaleString('es-ES')}`);
      });
    }

    // Verificar Payment Intents relacionados
    console.log('\n\n' + '='.repeat(70));
    console.log('💳 PAYMENT INTENTS RELACIONADOS');
    console.log('='.repeat(70));
    
    const paymentIntentIds = completedOrders
      .map(s => s.payment_intent)
      .filter(Boolean);
    
    if (paymentIntentIds.length > 0) {
      console.log(`\nEncontrados ${paymentIntentIds.length} payment intents:`);
      
      for (const piId of paymentIntentIds.slice(0, 3)) { // Mostrar solo los primeros 3
        try {
          const piResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${piId}`, {
            headers: {
              'Authorization': `Bearer ${stripeSecretKey}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          });
          
          if (piResponse.ok) {
            const pi = await piResponse.json();
            console.log(`\n📄 Payment Intent: ${pi.id}`);
            console.log(`   ├─ Monto:        €${(pi.amount / 100).toFixed(2)}`);
            console.log(`   ├─ Estado:       ${pi.status}`);
            console.log(`   ├─ Método:       ${pi.payment_method_types?.join(', ') || 'N/A'}`);
            console.log(`   └─ Cargos:       ${pi.charges?.data?.length || 0} realizado(s)`);
          }
        } catch (e) {
          console.log(`   ⚠️  Error obteniendo ${piId}: ${e.message}`);
        }
      }
    } else {
      console.log('\nℹ️  No hay payment intents asociados a órdenes completadas');
    }

    // Verificar Balance
    console.log('\n\n' + '='.repeat(70));
    console.log('💰 BALANCE DE LA CUENTA STRIPE');
    console.log('='.repeat(70));
    
    const balanceResponse = await fetch('https://api.stripe.com/v1/balance', {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (balanceResponse.ok) {
      const balanceData = await balanceResponse.json();
      console.log('\n💵 Disponible:');
      balanceData.available.forEach(b => {
        console.log(`   ├─ ${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`);
      });
      console.log('\n⏳ Pendiente:');
      balanceData.pending.forEach(b => {
        console.log(`   ├─ ${(b.amount / 100).toFixed(2)} ${b.currency.toUpperCase()}`);
      });
    }

    console.log('\n' + '='.repeat(70));
    console.log('✅ TEST COMPLETADO EXITOSAMENTE');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Error al verificar pedidos en Stripe:');
    console.error(error.message);
    process.exit(1);
  }
}

checkStripeOrders();
