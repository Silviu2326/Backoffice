-- FIX EXTREMO PARA RLS DE SUPABASE
-- Este script deshabilita RLS temporalmente en la tabla problemática para confirmar si es la causa.
-- ADVERTENCIA: Solo para desarrollo.

-- 1. Deshabilitar RLS en user_profiles (Esto permite todo)
ALTER TABLE "public"."user_profiles" DISABLE ROW LEVEL SECURITY;

-- 2. Asegurarse de que el admin autenticado pueda insertar en auth.users (usualmente no se puede desde cliente, pero intentemos políticas)
-- Nota: Insertar en auth.users directamente desde el cliente generalmente ESTÁ BLOQUEADO por Supabase a nivel de API, no solo RLS.
-- La única forma de crear usuarios de Auth es usando supabase.auth.signUp()

-- 3. Crear políticas ultra permisivas por si acaso se reactiva RLS
CREATE POLICY "Allow ALL for authenticated" ON "public"."user_profiles"
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow ALL for anon" ON "public"."user_profiles"
FOR ALL
TO anon
USING (true)
WITH CHECK (true);
