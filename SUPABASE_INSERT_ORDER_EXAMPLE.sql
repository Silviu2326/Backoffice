-- ============================================================================
-- Script para crear órdenes de ejemplo en la tabla orders
-- ============================================================================
-- Este script inserta órdenes completas con todos los campos necesarios
-- Usa los customer_id REALES de tu base de datos (users.json)
-- ============================================================================

-- ============================================================================
-- 📋 USUARIOS DISPONIBLES EN TU SISTEMA
-- ============================================================================
-- Estos son los user_id reales que puedes usar:
--
-- 1. silxarseb@gmail.com           → 1b226b6e-a012-49fd-902e-ec9d0e8852a0
-- 2. sebaxy5270@gmail.com          → c3b6003b-370d-4fc8-bc53-066102af7d08
-- 3. sebacsy58@gmail.com           → 448dd250-5535-4514-9353-5b83658f0d3a (tiene dirección completa)
-- 4. holaaaaapruebaaa124@gmail.com → ebb810a2-e482-4cef-a2b1-71600fb7d259
-- 5. pruebaaaa1231vdhdh@gmail.com  → d847a750-3099-4df9-800e-6209c99a0e84
-- 6. opre8364@gmail.com            → 13b7095d-b96a-4093-aa93-956161f62ad6
-- 7. hola@hola.com                 → 806ce86c-3c1c-448c-889b-15ed65f40a4c
-- ============================================================================


-- ============================================================================
-- 🚀 OPCIÓN 1: ORDEN INDIVIDUAL - Usuario silxarseb@gmail.com
-- ============================================================================
-- Esta es una orden completada con envío gratis (subtotal > 35€)

INSERT INTO public.orders (
  customer_id,
  customer_email,
  email,
  status,
  total,
  subtotal,
  shipping_cost,
  discount,
  stripe_payment_intent_id,
  stripe_payment_status,
  cart,
  shipping_method,
  shipping_address,
  metadata
) VALUES (
  '1b226b6e-a012-49fd-902e-ec9d0e8852a0'::uuid,  -- silxarseb@gmail.com
  'silxarseb@gmail.com',
  'silxarseb@gmail.com',
  'completed',
  42.95,  -- total
  45.90,  -- subtotal
  0.00,   -- shipping_cost (gratis porque subtotal > 35€)
  2.95,   -- discount (código COOLCAT10 = -10%)
  'pi_' || gen_random_uuid()::text,
  'succeeded',
  '[
    {
      "id": "prod-001",
      "name": "Cool Cat IPA",
      "price": 3.50,
      "quantity": 6,
      "itemTotal": 21.00,
      "variant": {
        "id": "var-001",
        "name": "330ml",
        "weight_kg": 0.33
      },
      "product": {
        "category": "Cerveza Artesanal"
      }
    },
    {
      "id": "prod-002",
      "name": "Buck Pale Ale",
      "price": 4.15,
      "quantity": 6,
      "itemTotal": 24.90,
      "variant": {
        "id": "var-002",
        "name": "330ml",
        "weight_kg": 0.33
      },
      "product": {
        "category": "Cerveza Artesanal"
      }
    }
  ]'::jsonb,
  'home',
  '{"address": "Calle Mayor 123, 3º B, 28013 Madrid, España"}'::jsonb,
  '{"promo_code": "COOLCAT10", "notes": "Orden de ejemplo - Usuario 1"}'::jsonb
);


-- ============================================================================
-- 🚀 OPCIÓN 2: ORDEN INDIVIDUAL - Usuario sebaxy5270@gmail.com
-- ============================================================================
-- Esta es una orden en proceso con dirección específica

INSERT INTO public.orders (
  customer_id,
  customer_email,
  email,
  status,
  total,
  subtotal,
  shipping_cost,
  discount,
  stripe_payment_intent_id,
  stripe_payment_status,
  cart,
  shipping_method,
  shipping_address,
  metadata
) VALUES (
  'c3b6003b-370d-4fc8-bc53-066102af7d08'::uuid,  -- sebaxy5270@gmail.com
  'sebaxy5270@gmail.com',
  'sebaxy5270@gmail.com',
  'processing',
  23.95,  -- total
  20.00,  -- subtotal
  4.95,   -- shipping_cost (porque subtotal < 35€)
  1.00,   -- discount (código WELCOME = -5%)
  'pi_' || gen_random_uuid()::text,
  'processing',
  '[
    {
      "id": "prod-003",
      "name": "Cool Cat Lager",
      "price": 2.80,
      "quantity": 5,
      "itemTotal": 14.00,
      "variant": {
        "id": "var-003",
        "name": "330ml",
        "weight_kg": 0.33
      },
      "product": {
        "category": "Cerveza Artesanal"
      }
    },
    {
      "id": "prod-004",
      "name": "Sifrina Blonde Ale",
      "price": 3.00,
      "quantity": 2,
      "itemTotal": 6.00,
      "variant": {
        "id": "var-004",
        "name": "330ml",
        "weight_kg": 0.33
      },
      "product": {
        "category": "Cerveza Artesanal"
      }
    }
  ]'::jsonb,
  'home',
  '{"address": "Avenida Ejemplo 456, 2º C, 08001 Barcelona, España"}'::jsonb,
  '{"promo_code": "WELCOME", "notes": "Orden de ejemplo - Usuario 2"}'::jsonb
);


-- ============================================================================
-- 🚀 OPCIÓN 3: ORDEN CON RECOGIDA EN TIENDA - Usuario sebacsy58@gmail.com
-- ============================================================================
-- Usa la dirección real del usuario (asdadsa, 1, 46152, asdadsadsa)

INSERT INTO public.orders (
  customer_id,
  customer_email,
  email,
  status,
  total,
  subtotal,
  shipping_cost,
  discount,
  stripe_payment_intent_id,
  stripe_payment_status,
  cart,
  shipping_method,
  shipping_address,
  metadata
) VALUES (
  '448dd250-5535-4514-9353-5b83658f0d3a'::uuid,  -- sebacsy58@gmail.com
  'sebacsy58@gmail.com',
  'sebacsy58@gmail.com',
  'completed',
  18.50,  -- total
  18.50,  -- subtotal
  0.00,   -- shipping_cost (recogida en tienda)
  0.00,   -- discount (sin código)
  'pi_' || gen_random_uuid()::text,
  'succeeded',
  '[
    {
      "id": "prod-005",
      "name": "Pack Degustación Cool Cat",
      "price": 18.50,
      "quantity": 1,
      "itemTotal": 18.50,
      "variant": {
        "id": "var-005",
        "name": "Pack 6 variedades",
        "weight_kg": 2.00
      },
      "product": {
        "category": "Packs"
      }
    }
  ]'::jsonb,
  'pickup',
  '{"address": "asdadsa, 1, 46152, asdadsadsa"}'::jsonb,
  '{"notes": "Orden de ejemplo - Usuario 3 - Recogida en tienda"}'::jsonb
);


-- ============================================================================
-- 🚀 OPCIÓN 4: MÚLTIPLES ÓRDENES - Para diferentes usuarios
-- ============================================================================
-- Crea 7 órdenes (una para cada usuario) con diferentes estados y totales

INSERT INTO public.orders (
  customer_id,
  customer_email,
  email,
  status,
  total,
  subtotal,
  shipping_cost,
  discount,
  stripe_payment_intent_id,
  stripe_payment_status,
  cart,
  shipping_method,
  shipping_address,
  metadata
)
VALUES
  -- Orden 1: silxarseb@gmail.com - Completada
  (
    '1b226b6e-a012-49fd-902e-ec9d0e8852a0'::uuid,
    'silxarseb@gmail.com',
    'silxarseb@gmail.com',
    'completed',
    38.50, 35.00, 0.00, 3.50,
    'pi_' || gen_random_uuid()::text,
    'succeeded',
    '[{"id":"prod-001","name":"Cool Cat IPA","price":3.50,"quantity":10,"itemTotal":35.00}]'::jsonb,
    'home',
    '{"address": "Calle Test 1, Madrid"}'::jsonb,
    '{"batch_order": 1}'::jsonb
  ),
  -- Orden 2: sebaxy5270@gmail.com - En proceso
  (
    'c3b6003b-370d-4fc8-bc53-066102af7d08'::uuid,
    'sebaxy5270@gmail.com',
    'sebaxy5270@gmail.com',
    'processing',
    29.95, 25.00, 4.95, 0.00,
    'pi_' || gen_random_uuid()::text,
    'processing',
    '[{"id":"prod-002","name":"Buck Pale Ale","price":4.00,"quantity":6,"itemTotal":24.00}]'::jsonb,
    'home',
    '{"address": "Calle Test 2, Barcelona"}'::jsonb,
    '{"batch_order": 2}'::jsonb
  ),
  -- Orden 3: sebacsy58@gmail.com - Pendiente
  (
    '448dd250-5535-4514-9353-5b83658f0d3a'::uuid,
    'sebacsy58@gmail.com',
    'sebacsy58@gmail.com',
    'pending',
    21.00, 21.00, 0.00, 0.00,
    'pi_' || gen_random_uuid()::text,
    'requires_payment_method',
    '[{"id":"prod-003","name":"Cool Cat Lager","price":3.00,"quantity":7,"itemTotal":21.00}]'::jsonb,
    'pickup',
    '{"address": "asdadsa, 1, 46152, asdadsadsa"}'::jsonb,
    '{"batch_order": 3}'::jsonb
  ),
  -- Orden 4: holaaaaapruebaaa124@gmail.com - Completada
  (
    'ebb810a2-e482-4cef-a2b1-71600fb7d259'::uuid,
    'holaaaaapruebaaa124@gmail.com',
    'holaaaaapruebaaa124@gmail.com',
    'completed',
    52.00, 48.00, 4.95, 0.95,
    'pi_' || gen_random_uuid()::text,
    'succeeded',
    '[{"id":"prod-004","name":"Pack Mixto","price":24.00,"quantity":2,"itemTotal":48.00}]'::jsonb,
    'home',
    '{"address": "Calle Test 4, Valencia"}'::jsonb,
    '{"batch_order": 4}'::jsonb
  ),
  -- Orden 5: pruebaaaa1231vdhdh@gmail.com - Cancelada
  (
    'd847a750-3099-4df9-800e-6209c99a0e84'::uuid,
    'pruebaaaa1231vdhdh@gmail.com',
    'pruebaaaa1231vdhdh@gmail.com',
    'cancelled',
    15.00, 15.00, 4.95, 4.95,
    'pi_' || gen_random_uuid()::text,
    'canceled',
    '[{"id":"prod-005","name":"Sifrina Blonde","price":3.00,"quantity":5,"itemTotal":15.00}]'::jsonb,
    'home',
    '{"address": "Calle Test 5, Sevilla"}'::jsonb,
    '{"batch_order": 5, "cancel_reason": "Cliente canceló"}'::jsonb
  ),
  -- Orden 6: opre8364@gmail.com - En proceso
  (
    '13b7095d-b96a-4093-aa93-956161f62ad6'::uuid,
    'opre8364@gmail.com',
    'opre8364@gmail.com',
    'processing',
    66.50, 62.50, 0.00, 6.00,
    'pi_' || gen_random_uuid()::text,
    'processing',
    '[{"id":"prod-006","name":"Pack Premium","price":31.25,"quantity":2,"itemTotal":62.50}]'::jsonb,
    'home',
    '{"address": "Calle Test 6, Bilbao"}'::jsonb,
    '{"batch_order": 6}'::jsonb
  ),
  -- Orden 7: hola@hola.com - Completada
  (
    '806ce86c-3c1c-448c-889b-15ed65f40a4c'::uuid,
    'hola@hola.com',
    'hola@hola.com',
    'completed',
    27.50, 24.50, 4.95, 1.95,
    'pi_' || gen_random_uuid()::text,
    'succeeded',
    '[{"id":"prod-007","name":"Candela IPA","price":3.50,"quantity":7,"itemTotal":24.50}]'::jsonb,
    'home',
    '{"address": "valencia"}'::jsonb,
    '{"batch_order": 7}'::jsonb
  );


-- ============================================================================
-- 🔍 VERIFICACIÓN: Ver todas las órdenes creadas
-- ============================================================================
SELECT
  order_number,
  customer_email,
  status,
  total,
  subtotal,
  shipping_cost,
  discount,
  stripe_payment_status,
  shipping_method,
  created_at
FROM public.orders
WHERE
  customer_email IN (
    'silxarseb@gmail.com',
    'sebaxy5270@gmail.com',
    'sebacsy58@gmail.com',
    'holaaaaapruebaaa124@gmail.com',
    'pruebaaaa1231vdhdh@gmail.com',
    'opre8364@gmail.com',
    'hola@hola.com'
  )
ORDER BY created_at DESC;


-- ============================================================================
-- 📊 ESTADÍSTICAS: Ver resumen por usuario
-- ============================================================================
SELECT
  customer_email,
  COUNT(*) as total_orders,
  SUM(total) as total_spent,
  AVG(total) as average_order,
  MAX(created_at) as last_order_date
FROM public.orders
WHERE
  customer_email IN (
    'silxarseb@gmail.com',
    'sebaxy5270@gmail.com',
    'sebacsy58@gmail.com',
    'holaaaaapruebaaa124@gmail.com',
    'pruebaaaa1231vdhdh@gmail.com',
    'opre8364@gmail.com',
    'hola@hola.com'
  )
GROUP BY customer_email
ORDER BY total_spent DESC;


-- ============================================================================
-- 📦 VER DETALLES COMPLETOS: Última orden con cart expandido
-- ============================================================================
SELECT
  order_number,
  customer_email,
  status,
  total,
  jsonb_pretty(cart) as cart_details,
  jsonb_pretty(shipping_address) as shipping_details,
  jsonb_pretty(metadata) as metadata_details,
  created_at
FROM public.orders
WHERE
  customer_email IN (
    'silxarseb@gmail.com',
    'sebaxy5270@gmail.com',
    'sebacsy58@gmail.com',
    'holaaaaapruebaaa124@gmail.com',
    'pruebaaaa1231vdhdh@gmail.com',
    'opre8364@gmail.com',
    'hola@hola.com'
  )
ORDER BY created_at DESC
LIMIT 5;


-- ============================================================================
-- 🧹 LIMPIEZA: Eliminar todas las órdenes de ejemplo
-- ============================================================================
-- ⚠️ CUIDADO: Esto eliminará TODAS las órdenes de los usuarios de prueba
-- Descomenta solo si quieres limpiar completamente

/*
DELETE FROM public.orders
WHERE customer_email IN (
  'silxarseb@gmail.com',
  'sebaxy5270@gmail.com',
  'sebacsy58@gmail.com',
  'holaaaaapruebaaa124@gmail.com',
  'pruebaaaa1231vdhdh@gmail.com',
  'opre8364@gmail.com',
  'hola@hola.com'
);
*/


-- ============================================================================
-- 🎯 LIMPIEZA SELECTIVA: Eliminar solo órdenes de batch
-- ============================================================================
-- Esto solo eliminará las órdenes creadas con la OPCIÓN 4

/*
DELETE FROM public.orders
WHERE metadata->>'batch_order' IS NOT NULL;
*/


-- ============================================================================
-- 📝 NOTAS IMPORTANTES:
-- ============================================================================
--
-- 1. Todos los user_id son REALES de tu base de datos (users.json)
-- 2. Los emails coinciden con los usuarios existentes
-- 3. El trigger 'set_order_number' generará automáticamente el order_number
-- 4. El trigger 'update_orders_updated_at' actualizará updated_at
-- 5. Los stripe_payment_intent_id son únicos (usan gen_random_uuid())
-- 6. Los estados válidos son: pending, processing, completed, failed, cancelled
-- 7. Los stripe_payment_status válidos son: succeeded, processing, requires_payment_method, canceled
-- 8. shipping_method válidos: 'home', 'pickup'
--
-- ============================================================================
