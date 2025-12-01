-- AÑADIR COLUMNA EMAIL A USER_PROFILES
-- Esto es necesario para guardar el email de clientes creados manualmente desde el CRM
-- ya que no tienen una entrada correspondiente en auth.users

ALTER TABLE "public"."user_profiles" ADD COLUMN IF NOT EXISTS "email" TEXT;
