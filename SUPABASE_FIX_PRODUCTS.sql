-- FIX PARA PRODUCTOS
-- Ejecuta este script en el Editor SQL de Supabase para permitir la creación de productos.

-- 1. Deshabilitar RLS en la tabla products
ALTER TABLE "public"."products" DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar que existan las columnas necesarias (especialmente JSONB)
ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "featured_config" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "rich_description" TEXT;
ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "inventory_type" TEXT DEFAULT 'SINGLE';
ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT '{}';
ALTER TABLE "public"."products" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT '{}';

-- 3. (Opcional) Asegurar que SKU sea único si no lo es
-- ALTER TABLE "public"."products" ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");
