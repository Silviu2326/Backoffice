-- FIX PARA VARIANTES DE PRODUCTOS (RLS)
-- Ejecuta este script en el Editor SQL de Supabase para solucionar el error "Error al guardar el inventario".

-- 1. Habilitar RLS en la tabla product_variants (si no lo está ya)
ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Enable all for authenticated users" ON "public"."product_variants";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."product_variants";
DROP POLICY IF EXISTS "Enable select for anon users" ON "public"."product_variants";

-- 3. Crear política para permitir TODO (Select, Insert, Update, Delete) a usuarios autenticados
CREATE POLICY "Enable all for authenticated users"
ON "public"."product_variants"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Crear política para permitir LECTURA a usuarios anónimos (para el ecommerce público)
CREATE POLICY "Enable select for anon users"
ON "public"."product_variants"
FOR SELECT
TO anon
USING (true);

-- 5. Asegurar que existan las columnas necesarias en product_variants
-- Esto previene errores si la tabla fue creada con un esquema básico
ALTER TABLE "public"."product_variants" ADD COLUMN IF NOT EXISTS "sku" TEXT;
ALTER TABLE "public"."product_variants" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "public"."product_variants" ADD COLUMN IF NOT EXISTS "price" NUMERIC;
ALTER TABLE "public"."product_variants" ADD COLUMN IF NOT EXISTS "stock_quantity" INTEGER DEFAULT 0;
ALTER TABLE "public"."product_variants" ADD COLUMN IF NOT EXISTS "weight_kg" NUMERIC DEFAULT 0;
ALTER TABLE "public"."product_variants" ADD COLUMN IF NOT EXISTS "is_default" BOOLEAN DEFAULT false;
