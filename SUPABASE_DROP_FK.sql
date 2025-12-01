-- SOLUCIÓN DEFINITIVA PARA CREAR CLIENTES SIN AUTH
-- Ejecuta este script en el Editor SQL de Supabase

-- 1. Eliminar la restricción que obliga a que el ID del perfil exista en la tabla de usuarios de Supabase (auth.users)
-- Esto permite crear "Clientes" en el CRM que no necesariamente tienen cuenta para loguearse en la app.
ALTER TABLE "public"."user_profiles" DROP CONSTRAINT IF EXISTS "user_profiles_user_id_fkey";

-- Por si el nombre de la restricción es diferente (formato alternativo común):
ALTER TABLE "public"."user_profiles" DROP CONSTRAINT IF EXISTS "user_profiles_id_fkey";

-- 2. Asegurarnos que RLS (Seguridad) esté deshabilitado para user_profiles (o configurado permisivamente como en el paso anterior)
-- Esto es redundante si ya ejecutaste el script anterior, pero asegura que funcione.
ALTER TABLE "public"."user_profiles" DISABLE ROW LEVEL SECURITY;
