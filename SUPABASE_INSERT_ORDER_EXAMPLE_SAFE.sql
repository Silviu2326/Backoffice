-- ============================================================================
-- Script SEGURO para crear órdenes de ejemplo
-- ============================================================================
-- Este script PRIMERO verifica qué usuarios existen en auth.users
-- y SOLO crea órdenes para usuarios válidos
-- ============================================================================

-- ============================================================================
-- PASO 1: Verificar usuarios válidos en auth.users
-- ============================================================================
-- Ejecuta esto primero para ver qué usuarios están disponibles

SELECT
  au.id as auth_user_id,
  au.email,
  up.full_name,
  up.first_name,
  up.city
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
ORDER BY au.created_at DESC;

-- Si recibes error de permisos en auth.users, usa esta alternativa:
-- (Busca desde user_profiles donde user_id existe en auth.users)

SELECT
  user_id,
  email,
  full_name,
  first_name,
  city
FROM public.user_profiles
WHERE user_id IN (
  SELECT id FROM auth.users
)
ORDER BY created_at DESC;


-- ============================================================================
-- PASO 2: Obtener solo los primeros 7 usuarios válidos
-- ============================================================================
-- Este query te mostrará los UUIDs que SÍ puedes usar

WITH valid_users AS (
  SELECT
    user_id,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.user_profiles
  WHERE user_id IS NOT NULL
  LIMIT 7
)
SELECT * FROM valid_users;


-- ============================================================================
-- OPCIÓN SEGURA: Insertar órdenes solo para usuarios válidos
-- ============================================================================
-- Este script usa WITH para obtener usuarios válidos dinámicamente

WITH valid_users AS (
  SELECT
    user_id,
    email,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM public.user_profiles
  WHERE user_id IS NOT NULL
  LIMIT 7
),
order_data AS (
  SELECT
    user_id,
    email,
    row_num,
    -- Estados rotativos
    CASE
      WHEN row_num % 4 = 1 THEN 'completed'
      WHEN row_num % 4 = 2 THEN 'processing'
      WHEN row_num % 4 = 3 THEN 'pending'
      ELSE 'cancelled'
    END as status,
    -- Totales variados
    (20 + row_num * 8)::numeric(10,2) as total,
    (18 + row_num * 8)::numeric(10,2) as subtotal,
    CASE WHEN row_num % 2 = 0 THEN 4.95 ELSE 0.00 END as shipping_cost,
    CASE WHEN row_num % 3 = 0 THEN 2.00 ELSE 0.00 END as discount,
    -- Stripe status
    CASE
      WHEN row_num % 4 = 1 THEN 'succeeded'
      WHEN row_num % 4 = 2 THEN 'processing'
      WHEN row_num % 4 = 3 THEN 'requires_payment_method'
      ELSE 'canceled'
    END as stripe_status,
    -- Shipping method
    CASE WHEN row_num % 3 = 0 THEN 'pickup' ELSE 'home' END as shipping_method
  FROM valid_users
)
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
SELECT
  user_id,
  email,
  email,
  status,
  total,
  subtotal,
  shipping_cost,
  discount,
  'pi_safe_' || gen_random_uuid()::text,
  stripe_status,
  format('[
    {
      "id": "prod-%s",
      "name": "Cool Cat Beer Pack %s",
      "price": %s,
      "quantity": 6,
      "itemTotal": %s
    }
  ]', row_num, row_num, (subtotal / 6)::numeric(10,2), subtotal)::jsonb,
  shipping_method,
  format('{"address": "Dirección de prueba %s, España"}', row_num)::jsonb,
  format('{"safe_order": %s, "auto_generated": true}', row_num)::jsonb
FROM order_data;


-- ============================================================================
-- ALTERNATIVA SIMPLE: 1 orden para el primer usuario válido
-- ============================================================================
-- Si quieres empezar con solo 1 orden de prueba

WITH first_valid_user AS (
  SELECT user_id, email
  FROM public.user_profiles
  WHERE user_id IS NOT NULL
  ORDER BY created_at
  LIMIT 1
)
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
SELECT
  user_id,
  email,
  email,
  'completed',
  42.95,
  45.90,
  0.00,
  2.95,
  'pi_test_' || gen_random_uuid()::text,
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
      }
    }
  ]'::jsonb,
  'home',
  '{"address": "Calle Mayor 123, Madrid, España"}'::jsonb,
  '{"promo_code": "COOLCAT10", "test_order": true}'::jsonb
FROM first_valid_user;


-- ============================================================================
-- VERIFICACIÓN: Ver las órdenes creadas
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
WHERE metadata->>'auto_generated' = 'true'
   OR metadata->>'test_order' = 'true'
   OR metadata->>'safe_order' IS NOT NULL
ORDER BY created_at DESC;


-- ============================================================================
-- DIAGNÓSTICO: Si sigues teniendo problemas
-- ============================================================================
-- Ejecuta esto para ver el estado de las tablas

-- Ver constraint de foreign key
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'orders'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Ver cuántos usuarios tienes en cada tabla
SELECT
  'auth.users' as table_name,
  COUNT(*) as total_users
FROM auth.users
UNION ALL
SELECT
  'user_profiles' as table_name,
  COUNT(*) as total_users
FROM public.user_profiles
UNION ALL
SELECT
  'user_profiles (con user_id válido)' as table_name,
  COUNT(*) as total_users
FROM public.user_profiles
WHERE user_id IS NOT NULL;


-- ============================================================================
-- LIMPIEZA: Eliminar órdenes de prueba
-- ============================================================================
/*
DELETE FROM public.orders
WHERE metadata->>'auto_generated' = 'true'
   OR metadata->>'test_order' = 'true'
   OR metadata->>'safe_order' IS NOT NULL;
*/


-- ============================================================================
-- 📝 INSTRUCCIONES DE USO:
-- ============================================================================
--
-- 1. EJECUTA PRIMERO EL PASO 1 para ver qué usuarios existen
--
-- 2. Si tienes usuarios, ejecuta "OPCIÓN SEGURA" (línea 55)
--    - Esto creará hasta 7 órdenes automáticamente
--
-- 3. Si quieres probar con 1 sola orden primero, usa "ALTERNATIVA SIMPLE" (línea 120)
--
-- 4. Verifica las órdenes con la query de VERIFICACIÓN (línea 183)
--
-- 5. Si tienes errores, ejecuta DIAGNÓSTICO (línea 202)
--
-- ============================================================================
