// Script para probar la obtención de órdenes de Stripe
// Ejecutar: node test-stripe-integration.js

import dotenv from 'dotenv';
dotenv.config();

const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.error('❌ Error: VITE_STRIPE_SECRET_KEY no está configurada');
  process.exit(1);
}

async function testStripeIntegration() {
  try {
    console.log('========================================');
    console.log('TEST DE INTEGRACIÓN STRIPE');
    console.log('========================================\n');

    console.log('🔍 Obteniendo checkout sessions de Stripe...\n');
    
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
    
    console.log(`✅ ${data.data.length} sesiones encontradas\n`);

    if (data.data.length === 0) {
      console.log('⚠️  No hay sesiones de checkout en Stripe');
      return;
    }

    console.log('📋 Detalles de las sesiones:');
    console.log('----------------------------------------\n');

    data.data.forEach((session, index) => {
      console.log(`${index + 1}. Sesión: ${session.id}`);
      console.log(`   ├─ Estado: ${session.status}`);
      console.log(`   ├─ Estado Pago: ${session.payment_status}`);
      console.log(`   ├─ Monto Total: €${(session.amount_total / 100).toFixed(2)}`);
      console.log(`   ├─ Cliente: ${session.customer_details?.email || 'N/A'}`);
      console.log(`   ├─ Fecha: ${new Date(session.created * 1000).toLocaleString('es-ES')}`);
      console.log(`   └─ Items: ${session.line_items?.data?.length || 0}`);
      
      if (session.line_items?.data?.length > 0) {
        session.line_items.data.forEach((item, i) => {
          console.log(`      ${i + 1}. ${item.description} - €${(item.amount_total / 100).toFixed(2)}`);
        });
      }
      console.log('');
    });

    // Buscar específicamente la sesión que mencionó el usuario
    console.log('🔍 Buscando sesión cs_live_b1iY1Dq0CBmKpo86HX360290bc62sDQmCW54Pt31MaR7uftwqfiOjkzZNT...');
    const targetSession = data.data.find(s => s.id.includes('cs_live_b1iY1Dq0CBmKpo86HX360290bc62sDQmCW54Pt31MaR7uftwqfiOjkzZNT'));
    
    if (targetSession) {
      console.log('✅ Sesión encontrada:\n');
      console.log(JSON.stringify(targetSession, null, 2));
    } else {
      console.log('⚠️  La sesión específica no está en los últimos 10 resultados');
      console.log('   IDs de sesiones encontradas:');
      data.data.forEach(s => console.log(`   - ${s.id}`));
    }

    console.log('\n========================================');
    console.log('TEST COMPLETADO');
    console.log('========================================');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testStripeIntegration();
