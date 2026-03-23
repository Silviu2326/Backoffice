-- SOLUCIÓN: Políticas RLS para la tabla orders
-- Ejecutar esto en el SQL Editor de Supabase

-- 1. Primero, desactivar RLS temporalmente para verificar (opcional)
-- ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 2. Habilitar RLS (si no está habilitado)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Allow all access to orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to view orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to delete orders" ON orders;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON orders;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON orders;

-- 4. Crear políticas para el backoffice/administración

-- Política para SELECT (lectura): Permitir a usuarios autenticados ver todas las órdenes
CREATE POLICY "Enable read access for authenticated users" ON orders
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para INSERT: Permitir a usuarios autenticados crear órdenes
CREATE POLICY "Enable insert access for authenticated users" ON orders
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Política para UPDATE: Permitir a usuarios autenticados actualizar órdenes
CREATE POLICY "Enable update access for authenticated users" ON orders
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política para DELETE: Permitir a usuarios autenticados eliminar órdenes
CREATE POLICY "Enable delete access for authenticated users" ON orders
    FOR DELETE
    TO authenticated
    USING (true);

-- 5. Alternativa: Permitir acceso anónimo (solo si es necesario para el frontend público)
-- Descomenta las siguientes líneas si necesitas que usuarios no autenticados vean órdenes
-- CREATE POLICY "Enable read access for anon users" ON orders
--     FOR SELECT
--     TO anon
--     USING (true);

-- 6. Verificar las políticas creadas
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
WHERE tablename = 'orders';

-- Nota: Después de ejecutar este SQL, refresca la página del backoffice
-- y las órdenes deberían aparecer.
