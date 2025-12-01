-- FIX PARA PERMISOS DE TIENDAS (RLS)
-- Ejecuta este script en el Editor SQL de Supabase para solucionar el error "new row violates row-level security policy".

-- 1. Asegurarnos de que RLS esté habilitado (o deshabilitarlo si prefieres acceso total sin control)
-- Para este fix, vamos a configurar políticas correctas en lugar de desactivar la seguridad.
ALTER TABLE "public"."stores" ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Enable all for authenticated users" ON "public"."stores";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."stores";
DROP POLICY IF EXISTS "Enable select for anon users" ON "public"."stores";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."stores";

-- 3. Crear política para permitir TODO (Select, Insert, Update, Delete) a usuarios autenticados
CREATE POLICY "Enable all for authenticated users"
ON "public"."stores"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Crear política para permitir LECTURA a usuarios anónimos (si es necesario para la web pública)
CREATE POLICY "Enable select for anon users"
ON "public"."stores"
FOR SELECT
TO anon
USING (true);
