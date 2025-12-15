-- Tabla para gestionar las pestañas de navegación de la aplicación móvil
-- Esta tabla permite configurar dinámicamente qué pestañas se muestran en la app

CREATE TABLE IF NOT EXISTS navigation_tabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) NOT NULL UNIQUE, -- Identificador único de la pestaña (ej: 'INICIO', 'EVENTOS')
  label_es VARCHAR(255) NOT NULL, -- Nombre de la pestaña en español
  label_en VARCHAR(255) NOT NULL, -- Nombre de la pestaña en inglés
  icon VARCHAR(100) NOT NULL, -- Nombre del icono de Ionicons
  "order" INTEGER NOT NULL DEFAULT 0, -- Orden de aparición (menor = primero)
  is_active BOOLEAN NOT NULL DEFAULT true, -- Si la pestaña está activa/visible
  is_system BOOLEAN NOT NULL DEFAULT false, -- Si es una pestaña del sistema (no se puede eliminar)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_navigation_tabs_order ON navigation_tabs("order");
CREATE INDEX IF NOT EXISTS idx_navigation_tabs_is_active ON navigation_tabs(is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_tabs_key ON navigation_tabs(key);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_navigation_tabs_updated_at
  BEFORE UPDATE ON navigation_tabs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE navigation_tabs ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer las pestañas activas
CREATE POLICY "Anyone can view active navigation tabs"
  ON navigation_tabs
  FOR SELECT
  USING (is_active = true);

-- Política: Solo usuarios autenticados pueden ver todas las pestañas
CREATE POLICY "Authenticated users can view all navigation tabs"
  ON navigation_tabs
  FOR SELECT
  TO authenticated
  USING (true);

-- Política: Solo usuarios autenticados pueden insertar (administradores)
CREATE POLICY "Authenticated users can insert navigation tabs"
  ON navigation_tabs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Authenticated users can update navigation tabs"
  ON navigation_tabs
  FOR UPDATE
  TO authenticated
  USING (true);

-- Política: Solo usuarios autenticados pueden eliminar pestañas no del sistema
CREATE POLICY "Authenticated users can delete non-system tabs"
  ON navigation_tabs
  FOR DELETE
  TO authenticated
  USING (is_system = false);

-- Datos iniciales (comentados por seguridad, ejecutar manualmente si es necesario)
-- INSERT INTO navigation_tabs (key, label_es, label_en, icon, "order", is_active, is_system) VALUES
--   ('INICIO', 'Inicio', 'Home', 'home', 1, true, true),
--   ('EVENTOS', 'Eventos', 'Events', 'calendar', 2, true, false),
--   ('CERVEZAS', 'Cervezas', 'Beers', 'wine', 3, true, false),
--   ('PERSONAJES', 'Personajes', 'Characters', 'people', 4, true, false),
--   ('BARES', 'Bares', 'Bars', 'storefront', 5, true, false),
--   ('EL GATO COOL PUB', 'El Gato Cool Pub', 'El Gato Cool Pub', 'map', 6, true, false),
--   ('LOGROS', 'Logros y Recompensas', 'Achievements & Rewards', 'trophy', 7, true, false),
--   ('BEER RUN', 'Beer Run', 'Beer Run', 'bicycle', 8, true, false),
--   ('CHAT IA', 'Chat IA', 'AI Chat', 'chatbubbles', 9, true, false),
--   ('CONTACTO', 'Contacto', 'Contact', 'mail', 10, true, false);

-- NOTA: Los datos iniciales se pueden crear desde la página de administración
-- usando el botón "Inicializar Pestañas por Defecto"
