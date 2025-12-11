-- Agregar columna character_id a la tabla products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS character_id uuid NULL;

-- Agregar foreign key constraint hacia la tabla characters
ALTER TABLE public.products
ADD CONSTRAINT fk_products_character
FOREIGN KEY (character_id)
REFERENCES public.characters(id)
ON DELETE SET NULL;

-- Crear índice para mejorar el rendimiento de búsquedas por character_id
CREATE INDEX IF NOT EXISTS idx_products_character_id
ON public.products USING btree (character_id);

-- Comentarios para documentación
COMMENT ON COLUMN public.products.character_id IS 'ID del personaje asociado a este producto (cerveza)';
