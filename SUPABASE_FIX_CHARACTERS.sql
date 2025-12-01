-- FIX PARA PERMISOS DE PERSONAJES (RLS)
-- Ejecuta este script en el Editor SQL de Supabase para solucionar el error al crear personajes.

-- 1. Habilitar RLS en la tabla characters
ALTER TABLE "public"."characters" ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Enable all for authenticated users" ON "public"."characters";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."characters";
DROP POLICY IF EXISTS "Enable select for anon users" ON "public"."characters";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."characters";

-- 3. Crear política para permitir TODO (Select, Insert, Update, Delete) a usuarios autenticados
CREATE POLICY "Enable all for authenticated users"
ON "public"."characters"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Crear política para permitir LECTURA a usuarios anónimos (para que se vean en la web pública)
CREATE POLICY "Enable select for anon users"
ON "public"."characters"
FOR SELECT
TO anon
USING (true);

-- 5. Asegurar que existan las columnas necesarias (para evitar errores de esquema)
-- Esto es preventivo, por si la tabla no tiene todos los campos que espera el frontend
ALTER TABLE "public"."characters" ADD COLUMN IF NOT EXISTS "role" TEXT;
ALTER TABLE "public"."characters" ADD COLUMN IF NOT EXISTS "role_subtitle" TEXT;
ALTER TABLE "public"."characters" ADD COLUMN IF NOT EXISTS "accent_color" TEXT DEFAULT '#ff6b35';
ALTER TABLE "public"."characters" ADD COLUMN IF NOT EXISTS "avatar_url" TEXT;
ALTER TABLE "public"."characters" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "public"."characters" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;
