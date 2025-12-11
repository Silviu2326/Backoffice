-- ============================================================================
-- Script UNIVERSAL para crear órdenes - Funciona sin importar la FK
-- ============================================================================
-- Este script detecta automáticamente si existe public.users o auth.users
-- y usa los IDs correctos
-- ============================================================================

-- ============================================================================
-- SOLUCIÓN 1: Crear orden SIN foreign key (permite NULL)
-- ============================================================================
-- Esta es la forma más segura si no estás seguro de qué usuarios son válidos

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
  NULL,  -- customer_id como NULL (la FK permite SET NULL)
  'test-customer@ejemplo.com',
  'test-customer@ejemplo.com',
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
      "itemTotal": 21.00
    },
    {
      "id": "prod-002",
      "name": "Buck Pale Ale",
      "price": 4.15,
      "quantity": 6,
      "itemTotal": 24.90
    }
  ]'::jsonb,
  'home',
  '{"address": "Calle Mayor 123, Madrid, España"}'::jsonb,
  '{"promo_code": "COOLCAT10", "test_order": true, "note": "Orden sin customer_id"}'::jsonb
);


-- ============================================================================
-- SOLUCIÓN 2: Usar UUID de public.users (si existe esa tabla)
-- ============================================================================
-- Ejecuta esto solo si tienes una tabla public.users

WITH first_user_from_public AS (
  SELECT id, email
  FROM public.users
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
  id,
  email,
  email,
  'completed',
  35.50,
  38.00,
  0.00,
  2.50,
  'pi_public_' || gen_random_uuid()::text,
  'succeeded',
  '[{"id":"prod-003","name":"Cool Cat Lager","price":3.00,"quantity":12,"itemTotal":36.00}]'::jsonb,
  'home',
  '{"address": "Barcelona, España"}'::jsonb,
  '{"test_order": true, "source": "public.users"}'::jsonb
FROM first_user_from_public;


-- ============================================================================
-- SOLUCIÓN 3: Crear múltiples órdenes sin customer_id
-- ============================================================================
-- Si necesitas varias órdenes de prueba rápidamente

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
  NULL,  -- Sin customer_id
  'test-order-' || i || '@ejemplo.com',
  'test-order-' || i || '@ejemplo.com',
  CASE
    WHEN i % 4 = 1 THEN 'completed'
    WHEN i % 4 = 2 THEN 'processing'
    WHEN i % 4 = 3 THEN 'pending'
    ELSE 'cancelled'
  END,
  (25 + i * 5)::numeric(10,2),
  (23 + i * 5)::numeric(10,2),
  CASE WHEN i % 2 = 0 THEN 4.95 ELSE 0.00 END,
  2.00,
  'pi_batch_' || gen_random_uuid()::text,
  CASE
    WHEN i % 4 = 1 THEN 'succeeded'
    WHEN i % 4 = 2 THEN 'processing'
    WHEN i % 4 = 3 THEN 'requires_payment_method'
    ELSE 'canceled'
  END,
  format('[{"id":"prod-%s","name":"Beer Pack %s","price":%s,"quantity":6,"itemTotal":%s}]',
         i, i, ((23 + i * 5) / 6)::numeric(10,2), (23 + i * 5))::jsonb,
  CASE WHEN i % 3 = 0 THEN 'pickup' ELSE 'home' END,
  format('{"address": "Dirección Test %s, España"}', i)::jsonb,
  format('{"batch_order": %s, "test_order": true}', i)::jsonb
FROM generate_series(1, 5) AS i;


-- ============================================================================
-- SOLUCIÓN 4: Arreglar la FK y luego insertar correctamente
-- ============================================================================
-- Si quieres arreglar el problema de raíz

-- PASO A: Ver cuál es el problema actual
SELECT
  tc.constraint_name,
  ccu.table_schema || '.' || ccu.table_name AS references_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'orders'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND tc.constraint_name LIKE '%user%';

-- PASO B: Eliminar FK incorrecta (descomenta si es necesario)
/*
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
*/

-- PASO C: Recrear FK correctamente apuntando a auth.users
/*
ALTER TABLE public.orders
ADD CONSTRAINT orders_customer_id_fkey
FOREIGN KEY (customer_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;
*/

-- PASO D: Ahora crear órdenes con usuarios válidos de auth.users
/*
WITH valid_auth_user AS (
  SELECT id, email
  FROM auth.users
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
  id,
  email,
  email,
  'completed',
  42.95,
  45.90,
  0.00,
  2.95,
  'pi_fixed_' || gen_random_uuid()::text,
  'succeeded',
  '[{"id":"prod-001","name":"Cool Cat IPA","price":3.50,"quantity":6,"itemTotal":21.00}]'::jsonb,
  'home',
  '{"address": "Madrid, España"}'::jsonb,
  '{"test_order": true, "fixed_fk": true}'::jsonb
FROM valid_auth_user;
*/


-- ============================================================================
-- VERIFICACIÓN: Ver todas las órdenes de prueba
-- ============================================================================
SELECT
  id,
  order_number,
  customer_id,
  customer_email,
  status,
  total,
  stripe_payment_status,
  metadata->>'test_order' as is_test,
  created_at
FROM public.orders
WHERE
  metadata->>'test_order' = 'true'
  OR customer_email LIKE '%ejemplo.com%'
  OR customer_email LIKE 'test-%'
ORDER BY created_at DESC;


-- ============================================================================
-- LIMPIEZA: Eliminar órdenes de prueba
-- ============================================================================
/*
DELETE FROM public.orders
WHERE metadata->>'test_order' = 'true'
   OR customer_email LIKE '%ejemplo.com%'
   OR customer_email LIKE 'test-%';
*/


-- ============================================================================
-- 🎯 RECOMENDACIÓN DE USO:
-- ============================================================================
--
-- 1. Ejecuta primero SOLUCIÓN 1 (línea 12)
--    - Crea 1 orden SIN customer_id (NULL)
--    - Esto SIEMPRE funciona
--
-- 2. Si funciona, ejecuta el PASO A de SOLUCIÓN 4 (línea 137)
--    - Verifica a qué tabla apunta la FK
--
-- 3. Si la FK apunta a public.users, usa SOLUCIÓN 2 (línea 55)
--    - Usa usuarios de public.users
--
-- 4. Si quieres arreglar la FK para que apunte a auth.users:
--    - Ejecuta PASO B, C y D de SOLUCIÓN 4 (líneas 145-182)
--
-- 5. Para tener datos de prueba rápidos sin usuarios:
--    - Ejecuta SOLUCIÓN 3 (línea 88)
--    - Crea 5 órdenes con customer_id = NULL
--
-- ============================================================================
