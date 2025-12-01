-- FIX PARA PERMISOS DE EVENTOS (RLS)
-- Ejecuta este script en el Editor SQL de Supabase para solucionar el error al crear eventos.

-- 1. Habilitar RLS en la tabla events
ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Enable all for authenticated users" ON "public"."events";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."events";
DROP POLICY IF EXISTS "Enable select for anon users" ON "public"."events";

-- 3. Crear política para permitir TODO (Select, Insert, Update, Delete) a usuarios autenticados
CREATE POLICY "Enable all for authenticated users"
ON "public"."events"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Crear política para permitir LECTURA a usuarios anónimos
CREATE POLICY "Enable select for anon users"
ON "public"."events"
FOR SELECT
TO anon
USING (true);

-- 5. Asegurar que existan las columnas necesarias
ALTER TABLE "public"."events" ADD COLUMN IF NOT EXISTS "max_attendees" INTEGER;
