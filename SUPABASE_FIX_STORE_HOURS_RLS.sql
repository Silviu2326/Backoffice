-- FIX PARA PERMISOS DE HORARIOS DE TIENDAS (RLS)
-- Ejecuta este script en el Editor SQL de Supabase para solucionar el error 42501 al guardar horarios.

-- 1. Habilitar RLS en la tabla store_hours (por si acaso)
ALTER TABLE "public"."store_hours" ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Enable all for authenticated users" ON "public"."store_hours";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."store_hours";
DROP POLICY IF EXISTS "Enable select for anon users" ON "public"."store_hours";
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."store_hours";

-- 3. Crear política para permitir TODO (Select, Insert, Update, Delete) a usuarios autenticados
-- Esto permite que el backoffice (que usa usuario autenticado) pueda guardar los horarios
CREATE POLICY "Enable all for authenticated users"
ON "public"."store_hours"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Crear política para permitir LECTURA a usuarios anónimos
-- Esto es necesario para que la App Móvil pueda leer los horarios sin estar logueada
CREATE POLICY "Enable select for anon users"
ON "public"."store_hours"
FOR SELECT
TO anon
USING (true);
