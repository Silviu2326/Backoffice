-- ============================================================================
-- Script para habilitar políticas RLS en user_profiles
-- ============================================================================
-- Este script soluciona el problema de que no se muestran usuarios
-- en el CRM habilitando las políticas de lectura pública
-- ============================================================================

-- 1. Habilitar RLS en la tabla user_profiles (si no está habilitado)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow public read access to user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow authenticated users to read user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_profiles;

-- 3. Crear política para permitir lectura pública de todos los perfiles
-- IMPORTANTE: Esta política permite que cualquier usuario (autenticado o anónimo) pueda leer todos los perfiles
CREATE POLICY "Enable read access for all users"
ON public.user_profiles
FOR SELECT
USING (true);

-- 4. Crear política para permitir que usuarios autenticados puedan actualizar su propio perfil
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Crear política para permitir que usuarios autenticados puedan insertar su propio perfil
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile"
ON public.user_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. Verificar que las políticas se aplicaron correctamente
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles';

-- ============================================================================
-- NOTA IMPORTANTE:
-- ============================================================================
-- Si prefieres desactivar RLS completamente (no recomendado en producción),
-- puedes ejecutar este comando en su lugar:
--
-- ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
--
-- Sin embargo, esto expone todos los datos sin ningún control de seguridad.
-- La configuración de políticas de arriba es más segura.
-- ============================================================================
