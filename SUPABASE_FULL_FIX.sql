-- SOLUCIÓN COMPLETA PARA ERROR DE PEDIDOS Y CLIENTES
-- Ejecuta todo este script en el Editor SQL de Supabase para arreglar los problemas de creación.

-- 1. PEDIDOS: Permitir crear pedidos sin restricciones de seguridad (RLS)
ALTER TABLE "public"."orders" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" DISABLE ROW LEVEL SECURITY;

-- 2. PEDIDOS: Eliminar restricciones que obligan a que el cliente sea un usuario de Auth
-- Esto permite vincular pedidos a clientes creados desde el CRM manualmente.
ALTER TABLE "public"."orders" DROP CONSTRAINT IF EXISTS "orders_customer_id_fkey";
ALTER TABLE "public"."orders" DROP CONSTRAINT IF EXISTS "orders_user_id_fkey";

-- 3. PEDIDOS: Asegurar que las columnas de dirección existan y sean del tipo correcto (JSONB)
ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "shipping_address" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "billing_address" JSONB DEFAULT '{}'::jsonb;

-- 4. CLIENTES: Deshabilitar seguridad para permitir creación desde CRM
ALTER TABLE "public"."user_profiles" DISABLE ROW LEVEL SECURITY;

-- 5. CLIENTES: Eliminar restricción de clave foránea con Auth
ALTER TABLE "public"."user_profiles" DROP CONSTRAINT IF EXISTS "user_profiles_user_id_fkey";
ALTER TABLE "public"."user_profiles" DROP CONSTRAINT IF EXISTS "user_profiles_id_fkey";

-- 6. CLIENTES: Asegurar que exista la columna email en el perfil
ALTER TABLE "public"."user_profiles" ADD COLUMN IF NOT EXISTS "email" TEXT;
