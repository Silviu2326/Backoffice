-- FIX PARA TIENDAS
-- Ejecuta este script en el Editor SQL de Supabase para permitir la creación de tiendas.

-- 1. Deshabilitar RLS en la tabla stores
ALTER TABLE "public"."stores" DISABLE ROW LEVEL SECURITY;

-- 2. Asegurar que existan las columnas necesarias (especialmente JSONB)
ALTER TABLE "public"."stores" ADD COLUMN IF NOT EXISTS "coordinates" JSONB DEFAULT '{"lat": 0, "lng": 0}'::jsonb;
ALTER TABLE "public"."stores" ADD COLUMN IF NOT EXISTS "opening_hours" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "public"."stores" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;
ALTER TABLE "public"."stores" ADD COLUMN IF NOT EXISTS "allow_pickup" BOOLEAN DEFAULT false;
ALTER TABLE "public"."stores" ADD COLUMN IF NOT EXISTS "pickup_instructions" TEXT;
ALTER TABLE "public"."stores" ADD COLUMN IF NOT EXISTS "image_url" TEXT;
