-- FIX PARA STORAGE (VERSION CORREGIDA)
-- Si recibes error 42501, es porque no tienes permisos de superusuario para alterar tablas del sistema storage.
-- Este script omite ese paso (que suele estar activo por defecto) y se enfoca en crear el bucket y las políticas.

-- 1. Crear el bucket 'media' si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Eliminar políticas antiguas para 'media' para evitar conflictos
DROP POLICY IF EXISTS "Media Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Media Delete Access" ON storage.objects;

-- 3. Crear política de LECTURA PÚBLICA
CREATE POLICY "Media Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media');

-- 4. Crear política de SUBIDA para usuarios AUTENTICADOS
CREATE POLICY "Media Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media');

-- 5. Crear política de ACTUALIZACIÓN para usuarios AUTENTICADOS
CREATE POLICY "Media Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media');

-- 6. Crear política de BORRADO para usuarios AUTENTICADOS
CREATE POLICY "Media Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media');