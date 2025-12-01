-- FIX PARA FIDELIDAD (LOYALTY)
-- Ejecuta este script en el Editor SQL de Supabase para crear la tabla de transacciones de puntos.

-- 1. Crear tabla de transacciones de fidelidad
CREATE TABLE IF NOT EXISTS "public"."loyalty_transactions" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "customer_id" UUID NOT NULL REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE,
    "points" INTEGER NOT NULL, -- Puede ser positivo (abono) o negativo (canje/ajuste)
    "concept" TEXT NOT NULL,
    "source" TEXT, -- Origen: 'manual_adjustment', 'purchase', 'reward_redemption', 'birthday_bonus'
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS
ALTER TABLE "public"."loyalty_transactions" ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas de acceso
-- Permitir lectura a usuarios autenticados (admin/staff)
CREATE POLICY "Enable read access for authenticated users"
ON "public"."loyalty_transactions"
FOR SELECT
TO authenticated
USING (true);

-- Permitir inserción a usuarios autenticados (admin/staff para ajustes manuales)
CREATE POLICY "Enable insert access for authenticated users"
ON "public"."loyalty_transactions"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 4. Añadir columna de saldo de puntos al perfil de usuario (para acceso rápido)
ALTER TABLE "public"."user_profiles" ADD COLUMN IF NOT EXISTS "points_balance" INTEGER DEFAULT 0;

-- 5. Crear función para actualizar el saldo automáticamente
CREATE OR REPLACE FUNCTION update_points_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE "public"."user_profiles"
    SET "points_balance" = COALESCE("points_balance", 0) + NEW.points
    WHERE "id" = NEW.customer_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE "public"."user_profiles"
    SET "points_balance" = COALESCE("points_balance", 0) - OLD.points
    WHERE "id" = OLD.customer_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear trigger para mantener el saldo actualizado
DROP TRIGGER IF EXISTS on_loyalty_transaction_change ON "public"."loyalty_transactions";
CREATE TRIGGER on_loyalty_transaction_change
AFTER INSERT OR DELETE ON "public"."loyalty_transactions"
FOR EACH ROW EXECUTE FUNCTION update_points_balance();
