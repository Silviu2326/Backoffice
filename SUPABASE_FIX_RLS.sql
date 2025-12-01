-- SOLUCIÓN PARA ERROR RLS (Row-Level Security)
-- Ejecuta este script en el Editor SQL de tu proyecto en Supabase

-- 1. Habilitar inserción en user_profiles para usuarios autenticados
-- Esto permite que el usuario Admin cree perfiles para otros.
CREATE POLICY "Enable insert for authenticated users" 
ON "public"."user_profiles"
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- 2. Habilitar actualización para usuarios autenticados (para editar clientes)
CREATE POLICY "Enable update for authenticated users" 
ON "public"."user_profiles"
FOR UPDATE
TO authenticated 
USING (true)
WITH CHECK (true);

-- NOTA ADICIONAL:
-- Si recibes un error de "foreign key constraint" después de arreglar el RLS,
-- significa que tu tabla user_profiles requiere que el ID del usuario exista primero en auth.users.
-- Crear usuarios en auth.users desde el frontend requiere usar la API de administración de Supabase
-- que no está disponible directamente con las claves públicas por seguridad.
--
-- Para desarrollo, puedes quitar la restricción de clave foránea temporalmente:
-- ALTER TABLE "public"."user_profiles" DROP CONSTRAINT "user_profiles_user_id_fkey";
