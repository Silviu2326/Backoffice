-- ============================================================================
-- Script para agregar/renombrar la columna customer_id en la tabla orders
-- ============================================================================
-- Este script soluciona el error: "column orders.customer_id does not exist"
-- ============================================================================

-- OPCIÓN 1: Si la columna se llama 'user_id', la renombramos a 'customer_id'
-- Verifica primero si existe la columna user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'user_id'
    ) THEN
        -- Renombrar user_id a customer_id
        ALTER TABLE public.orders RENAME COLUMN user_id TO customer_id;
        RAISE NOTICE 'Columna user_id renombrada a customer_id';
    END IF;
END $$;

-- OPCIÓN 2: Si no existe ni user_id ni customer_id, crear la columna customer_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'orders'
        AND column_name = 'customer_id'
    ) THEN
        -- Crear columna customer_id si no existe
        ALTER TABLE public.orders ADD COLUMN customer_id UUID;
        RAISE NOTICE 'Columna customer_id creada';
    END IF;
END $$;

-- Asegurar que la columna customer_email existe
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Crear índice para mejorar las consultas por customer_id
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- Verificar las columnas de la tabla orders
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
ORDER BY ordinal_position;
