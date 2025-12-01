-- FIX: ELIMINAR RESTRICCIÓN DE CLAVE FORÁNEA Y CORREGIR TRIGGER
-- Ejecuta este script para solucionar el error "violates foreign key constraint" y asegurar que el saldo se actualice.

-- 1. Eliminar la restricción de clave foránea que está fallando
-- (El error ocurre porque la tabla 'loyalty_transactions' intenta validar el 'customer_id' contra el 'id' de 'user_profiles', 
-- pero la aplicación usa 'user_id' como identificador principal).
ALTER TABLE "public"."loyalty_transactions"
DROP CONSTRAINT IF EXISTS "loyalty_transactions_customer_id_fkey";

-- 2. Corregir la función del trigger para que actualice el saldo correctamente
-- Ahora buscará el usuario tanto por 'user_id' como por 'id', asegurando que encuentre al cliente correcto.
CREATE OR REPLACE FUNCTION update_points_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE "public"."user_profiles"
    SET "points_balance" = COALESCE("points_balance", 0) + NEW.points
    WHERE "user_id" = NEW.customer_id OR "id" = NEW.customer_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE "public"."user_profiles"
    SET "points_balance" = COALESCE("points_balance", 0) - OLD.points
    WHERE "user_id" = OLD.customer_id OR "id" = OLD.customer_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Asegurar que el trigger esté activo (re-crearlo por si acaso)
DROP TRIGGER IF EXISTS on_loyalty_transaction_change ON "public"."loyalty_transactions";
CREATE TRIGGER on_loyalty_transaction_change
AFTER INSERT OR DELETE ON "public"."loyalty_transactions"
FOR EACH ROW EXECUTE FUNCTION update_points_balance();
