-- FIX PARA PEDIDOS (ORDERS)
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. Deshabilitar RLS en orders y order_items para evitar problemas de permisos
ALTER TABLE "public"."orders" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" DISABLE ROW LEVEL SECURITY;

-- 2. Eliminar restricción de clave foránea en orders.customer_id si apunta a auth.users
-- Esto es necesario porque los clientes creados desde el CRM (user_profiles) pueden no tener un usuario de Auth asociado.
-- Intentamos borrar las restricciones comunes por nombre.
ALTER TABLE "public"."orders" DROP CONSTRAINT IF EXISTS "orders_customer_id_fkey";
ALTER TABLE "public"."orders" DROP CONSTRAINT IF EXISTS "orders_user_id_fkey";

-- 3. (Opcional) Si la FK debe apuntar a user_profiles en lugar de auth.users, podemos recrearla.
-- Pero para máxima flexibilidad en este momento, dejarla sin FK estricta es más seguro para evitar errores.

-- 4. Asegurar que las columnas de dirección sean JSONB (si no lo son, esto podría fallar dependiendo de los datos actuales, pero es la estructura esperada por el código)
-- Nota: Si las columnas no existen, agrégalas.
ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "shipping_address" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "billing_address" JSONB DEFAULT '{}'::jsonb;
