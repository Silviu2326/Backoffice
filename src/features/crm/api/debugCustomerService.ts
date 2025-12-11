/**
 * Script de debugging para diagnosticar problemas con user_profiles
 */
import { supabase } from '../../../lib/supabase';

export async function debugUserProfiles() {
  console.log('='.repeat(80));
  console.log('🔍 DEBUGGING USER_PROFILES TABLE');
  console.log('='.repeat(80));

  try {
    // Test 1: Verificar conexión a Supabase
    console.log('\n📡 Test 1: Verificando conexión a Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count');

    if (testError) {
      console.error('❌ Error de conexión:', testError);
      return;
    }
    console.log('✅ Conexión exitosa');

    // Test 2: Intentar obtener todos los perfiles
    console.log('\n📊 Test 2: Obteniendo perfiles de user_profiles...');
    const { data: profiles, error: profilesError, count } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact' });

    if (profilesError) {
      console.error('❌ Error obteniendo perfiles:', {
        code: profilesError.code,
        message: profilesError.message,
        details: profilesError.details,
        hint: profilesError.hint,
      });

      // Verificar si es un error de RLS
      if (profilesError.code === 'PGRST301' || profilesError.message.includes('policy')) {
        console.error('🔒 PROBLEMA DETECTADO: Row Level Security (RLS) está bloqueando el acceso');
        console.error('📝 SOLUCIÓN: Ejecuta el script SUPABASE_FIX_USER_PROFILES_RLS.sql en Supabase SQL Editor');
      }
      return;
    }

    console.log(`✅ Perfiles obtenidos exitosamente: ${count} registros`);

    if (profiles && profiles.length > 0) {
      console.log('\n📋 Primeros 3 perfiles:');
      profiles.slice(0, 3).forEach((profile, index) => {
        console.log(`\n  Perfil ${index + 1}:`, {
          id: profile.id?.substring(0, 8) + '...',
          user_id: profile.user_id?.substring(0, 8) + '...',
          email: profile.email || '(sin email)',
          full_name: profile.full_name || '(sin nombre)',
          phone: profile.phone || '(sin teléfono)',
          points_balance: profile.points_balance || 0,
          city: profile.city || '(sin ciudad)',
          created_at: profile.created_at,
        });
      });
    } else {
      console.warn('⚠️ La tabla user_profiles existe pero está vacía');
      console.log('📝 Verifica que hayas insertado datos en la tabla');
    }

    // Test 3: Verificar tabla orders
    console.log('\n📦 Test 3: Verificando tabla orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('customer_id, customer_email')
      .limit(3);

    if (ordersError) {
      console.warn('⚠️ Error obteniendo orders:', ordersError.message);
    } else {
      console.log(`✅ Orders table accesible: ${orders?.length || 0} registros`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ DEBUG COMPLETADO');
    console.log('='.repeat(80) + '\n');

  } catch (error: any) {
    console.error('💥 Error inesperado:', error);
  }
}

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).debugUserProfiles = debugUserProfiles;
}
