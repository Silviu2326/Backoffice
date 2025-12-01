-- FIX: AÑADIR COLUMNA CUSTOMER_EMAIL A ORDERS
-- El error 400 ocurre porque la aplicación intenta leer 'customer_email' de la tabla 'orders'
-- para mostrar el email del cliente, pero la columna no existe.

ALTER TABLE "public"."orders" ADD COLUMN IF NOT EXISTS "customer_email" TEXT;
