# 🚀 Solución Rápida para Mostrar Clientes

## ❌ Problema Identificado

La tabla `orders` en Supabase no tiene la columna `customer_id`. Error:
```
column orders.customer_id does not exist
```

## ✅ Soluciones (elige una)

### Opción 1: Renombrar columna en Supabase (RECOMENDADO)

Si tu tabla `orders` tiene una columna llamada `user_id`, ve a **Supabase SQL Editor** y ejecuta:

```sql
-- Renombrar user_id a customer_id
ALTER TABLE public.orders RENAME COLUMN user_id TO customer_id;

-- Crear índice para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
```

O ejecuta el archivo completo: `SUPABASE_ADD_CUSTOMER_ID_COLUMN.sql`

### Opción 2: Agregar la columna customer_id

Si la tabla no tiene ni `user_id` ni `customer_id`, ejecuta en Supabase:

```sql
-- Agregar columna customer_id
ALTER TABLE public.orders ADD COLUMN customer_id UUID;

-- Agregar índice
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
```

### Opción 3: Deshabilitar cálculo de órdenes temporalmente

Si quieres ver los clientes YA sin arreglar la base de datos, puedes **comentar temporalmente** el cálculo de órdenes en el código.

**PERO** esto ya no es necesario si ejecutas una de las opciones SQL de arriba.

## 🔍 Verificar qué columnas tienes

Para ver qué columnas tiene tu tabla `orders`, ejecuta en Supabase SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'orders'
ORDER BY ordinal_position;
```

Esto te mostrará todas las columnas. Busca si existe:
- `user_id` → Ejecuta Opción 1
- `customer_id` → Ya está bien, el problema puede ser otro (verifica RLS)
- Ninguna de las dos → Ejecuta Opción 2

## ⚡ Pasos Rápidos

1. Abre Supabase → SQL Editor
2. Ejecuta el script `SUPABASE_ADD_CUSTOMER_ID_COLUMN.sql`
3. Recarga la página de clientes en tu app
4. ✅ Los clientes deberían aparecer

## 📋 Verificación

Después de ejecutar el script SQL:
1. Abre http://localhost:5174
2. Ve a la sección de Clientes
3. Abre la consola del navegador (F12)
4. Deberías ver tus 6 usuarios listados

Si aún no aparecen, comparte el error nuevo de la consola.
