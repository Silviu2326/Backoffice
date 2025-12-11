-- ============================================================================
-- DIAGNÓSTICO: Entender la estructura de Foreign Keys en orders
-- ============================================================================

-- ============================================================================
-- PASO 1: Ver todas las foreign keys de la tabla orders
-- ============================================================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'orders'
  AND tc.constraint_type = 'FOREIGN KEY';


-- ============================================================================
-- PASO 2: Ver si existe tabla public.users
-- ============================================================================
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'users'
) as table_users_exists;


-- ============================================================================
-- PASO 3: Ver contenido de public.users (si existe)
-- ============================================================================
-- Ejecuta esto solo si el PASO 2 devuelve 'true'
SELECT * FROM public.users LIMIT 10;


-- ============================================================================
-- PASO 4: Ver contenido de auth.users (primeros registros)
-- ============================================================================
-- Esto puede dar error de permisos
SELECT id, email, created_at FROM auth.users LIMIT 10;


-- ============================================================================
-- PASO 5: Comparar IDs entre user_profiles y las dos tablas
-- ============================================================================
-- Ver qué user_ids de user_profiles NO existen en public.users
SELECT
  up.user_id,
  up.email,
  up.full_name,
  CASE
    WHEN u.id IS NOT NULL THEN 'EXISTS in public.users'
    ELSE 'NOT FOUND in public.users'
  END as status_public_users
FROM public.user_profiles up
LEFT JOIN public.users u ON up.user_id = u.id
ORDER BY up.created_at DESC;


-- ============================================================================
-- PASO 6: Si public.users NO existe, arreglar la foreign key
-- ============================================================================
-- Esto eliminará la FK que apunta a public.users y creará una nueva a auth.users

-- SOLO ejecuta esto si el diagnóstico muestra que public.users no existe
-- y la FK apunta incorrectamente

/*
-- Eliminar la foreign key incorrecta
ALTER TABLE public.orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Crear la foreign key correcta apuntando a auth.users
ALTER TABLE public.orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (customer_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- Verificar que se creó correctamente
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'orders'
  AND tc.constraint_type = 'FOREIGN KEY';
*/


-- ============================================================================
-- PASO 7: Obtener usuarios REALMENTE válidos
-- ============================================================================
-- Ejecuta esto después de ver los resultados del PASO 1

-- Si la FK apunta a public.users:
SELECT
  id,
  email,
  created_at
FROM public.users
WHERE id IN (
  SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL
)
ORDER BY created_at DESC;

-- Si la FK apunta a auth.users:
SELECT
  au.id,
  au.email,
  au.created_at
FROM auth.users au
WHERE au.id IN (
  SELECT user_id FROM public.user_profiles WHERE user_id IS NOT NULL
)
ORDER BY au.created_at DESC;
