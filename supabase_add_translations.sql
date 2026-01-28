-- =====================================================
-- SQL Migration: Add translation fields to products table
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Add English translation columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS rich_description_en TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN products.name IS 'Product name in Spanish (default language)';
COMMENT ON COLUMN products.name_en IS 'Product name in English';
COMMENT ON COLUMN products.description IS 'Short description in Spanish (default language)';
COMMENT ON COLUMN products.description_en IS 'Short description in English';
COMMENT ON COLUMN products.rich_description IS 'Detailed HTML description in Spanish (default language)';
COMMENT ON COLUMN products.rich_description_en IS 'Detailed HTML description in English';

-- Optional: Create an index for searching in both languages
CREATE INDEX IF NOT EXISTS idx_products_name_en ON products (name_en);
CREATE INDEX IF NOT EXISTS idx_products_search_multilang ON products USING gin (
  to_tsvector('english', COALESCE(name_en, '') || ' ' || COALESCE(description_en, ''))
);

-- =====================================================
-- Verification: Check the table structure after migration
-- =====================================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'products'
-- AND column_name IN ('name_en', 'description_en', 'rich_description_en');

-- =====================================================
-- Optional: Function to get product in specific language
-- =====================================================
CREATE OR REPLACE FUNCTION get_product_localized(
  p_id UUID,
  p_lang TEXT DEFAULT 'es'
)
RETURNS TABLE (
  id UUID,
  sku TEXT,
  name TEXT,
  slug TEXT,
  description TEXT,
  rich_description TEXT,
  base_price NUMERIC,
  images TEXT[],
  category TEXT,
  tags TEXT[],
  status TEXT,
  featured_config JSONB,
  character_id UUID
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.sku,
    CASE
      WHEN p_lang = 'en' AND p.name_en IS NOT NULL AND p.name_en != ''
      THEN p.name_en
      ELSE p.name
    END AS name,
    p.slug,
    CASE
      WHEN p_lang = 'en' AND p.description_en IS NOT NULL AND p.description_en != ''
      THEN p.description_en
      ELSE p.description
    END AS description,
    CASE
      WHEN p_lang = 'en' AND p.rich_description_en IS NOT NULL AND p.rich_description_en != ''
      THEN p.rich_description_en
      ELSE p.rich_description
    END AS rich_description,
    p.base_price,
    p.images,
    p.category,
    p.tags,
    p.status,
    p.featured_config,
    p.character_id
  FROM products p
  WHERE p.id = p_id;
END;
$$;

-- =====================================================
-- Optional: View for all products with both languages
-- =====================================================
CREATE OR REPLACE VIEW products_multilang AS
SELECT
  id,
  sku,
  slug,
  -- Spanish fields
  name AS name_es,
  description AS description_es,
  rich_description AS rich_description_es,
  -- English fields
  name_en,
  description_en,
  rich_description_en,
  -- Common fields
  base_price,
  images,
  category,
  tags,
  status,
  inventory_type,
  featured_config,
  character_id,
  created_at,
  updated_at
FROM products;

-- Grant access to the view
GRANT SELECT ON products_multilang TO authenticated;
GRANT SELECT ON products_multilang TO anon;

-- =====================================================
-- SQL Migration: Add translation fields to characters table
-- =====================================================

-- Add English translation columns to characters table
ALTER TABLE characters
ADD COLUMN IF NOT EXISTS name_en TEXT,
ADD COLUMN IF NOT EXISTS role_en TEXT,
ADD COLUMN IF NOT EXISTS role_subtitle_en TEXT,
ADD COLUMN IF NOT EXISTS biography_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT,
ADD COLUMN IF NOT EXISTS signature_quote_en TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN characters.name IS 'Character name in Spanish (default language)';
COMMENT ON COLUMN characters.name_en IS 'Character name in English';
COMMENT ON COLUMN characters.role IS 'Character role in Spanish (default language)';
COMMENT ON COLUMN characters.role_en IS 'Character role in English';
COMMENT ON COLUMN characters.role_subtitle IS 'Role subtitle in Spanish (default language)';
COMMENT ON COLUMN characters.role_subtitle_en IS 'Role subtitle in English';
COMMENT ON COLUMN characters.biography IS 'Full biography in Spanish (default language)';
COMMENT ON COLUMN characters.biography_en IS 'Full biography in English';
COMMENT ON COLUMN characters.description IS 'Short description in Spanish (default language)';
COMMENT ON COLUMN characters.description_en IS 'Short description in English';
COMMENT ON COLUMN characters.signature_quote IS 'Signature quote in Spanish (default language)';
COMMENT ON COLUMN characters.signature_quote_en IS 'Signature quote in English';

-- Optional: Create an index for searching in both languages
CREATE INDEX IF NOT EXISTS idx_characters_name_en ON characters (name_en);
CREATE INDEX IF NOT EXISTS idx_characters_search_multilang ON characters USING gin (
  to_tsvector('english', COALESCE(name_en, '') || ' ' || COALESCE(role_en, '') || ' ' || COALESCE(description_en, ''))
);

-- =====================================================
-- Verification: Check the characters table structure after migration
-- =====================================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'characters'
-- AND column_name IN ('name_en', 'role_en', 'role_subtitle_en', 'biography_en', 'description_en', 'signature_quote_en');

-- =====================================================
-- Optional: Function to get character in specific language
-- =====================================================
CREATE OR REPLACE FUNCTION get_character_localized(
  c_id UUID,
  c_lang TEXT DEFAULT 'es'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  role TEXT,
  role_subtitle TEXT,
  biography TEXT,
  description TEXT,
  signature_quote TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  video_presentation_url TEXT,
  accent_color TEXT,
  theme_config JSONB,
  personality_tags TEXT[],
  traits TEXT[],
  interests TEXT[],
  likes TEXT[],
  signature_beer TEXT,
  signature_beer_style TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ch.id,
    CASE
      WHEN c_lang = 'en' AND ch.name_en IS NOT NULL AND ch.name_en != ''
      THEN ch.name_en
      ELSE ch.name
    END AS name,
    ch.slug,
    CASE
      WHEN c_lang = 'en' AND ch.role_en IS NOT NULL AND ch.role_en != ''
      THEN ch.role_en
      ELSE ch.role
    END AS role,
    CASE
      WHEN c_lang = 'en' AND ch.role_subtitle_en IS NOT NULL AND ch.role_subtitle_en != ''
      THEN ch.role_subtitle_en
      ELSE ch.role_subtitle
    END AS role_subtitle,
    CASE
      WHEN c_lang = 'en' AND ch.biography_en IS NOT NULL AND ch.biography_en != ''
      THEN ch.biography_en
      ELSE ch.biography
    END AS biography,
    CASE
      WHEN c_lang = 'en' AND ch.description_en IS NOT NULL AND ch.description_en != ''
      THEN ch.description_en
      ELSE ch.description
    END AS description,
    CASE
      WHEN c_lang = 'en' AND ch.signature_quote_en IS NOT NULL AND ch.signature_quote_en != ''
      THEN ch.signature_quote_en
      ELSE ch.signature_quote
    END AS signature_quote,
    ch.avatar_url,
    ch.cover_image_url,
    ch.video_presentation_url,
    ch.accent_color,
    ch.theme_config,
    ch.personality_tags,
    ch.traits,
    ch.interests,
    ch.likes,
    ch.signature_beer,
    ch.signature_beer_style,
    ch.is_active,
    ch.created_at
  FROM characters ch
  WHERE ch.id = c_id;
END;
$$;

-- =====================================================
-- Optional: View for all characters with both languages
-- =====================================================
CREATE OR REPLACE VIEW characters_multilang AS
SELECT
  id,
  slug,
  -- Spanish fields
  name AS name_es,
  role AS role_es,
  role_subtitle AS role_subtitle_es,
  biography AS biography_es,
  description AS description_es,
  signature_quote AS signature_quote_es,
  -- English fields
  name_en,
  role_en,
  role_subtitle_en,
  biography_en,
  description_en,
  signature_quote_en,
  -- Common fields
  avatar_url,
  cover_image_url,
  video_presentation_url,
  accent_color,
  theme_config,
  personality_tags,
  traits,
  interests,
  likes,
  signature_beer,
  signature_beer_style,
  is_active,
  created_at
FROM characters;

-- Grant access to the view
GRANT SELECT ON characters_multilang TO authenticated;
GRANT SELECT ON characters_multilang TO anon;

-- =====================================================
-- SQL Migration: Add translation fields to events table
-- =====================================================

-- Add English translation columns to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Add comments to document the columns
COMMENT ON COLUMN events.title IS 'Event title in Spanish (default language)';
COMMENT ON COLUMN events.title_en IS 'Event title in English';
COMMENT ON COLUMN events.description IS 'Event description in Spanish (default language)';
COMMENT ON COLUMN events.description_en IS 'Event description in English';

-- Optional: Create an index for searching in both languages
CREATE INDEX IF NOT EXISTS idx_events_title_en ON events (title_en);
CREATE INDEX IF NOT EXISTS idx_events_search_multilang ON events USING gin (
  to_tsvector('english', COALESCE(title_en, '') || ' ' || COALESCE(description_en, ''))
);

-- =====================================================
-- Verification: Check the events table structure after migration
-- =====================================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'events'
-- AND column_name IN ('title_en', 'description_en');

-- =====================================================
-- Optional: Function to get event in specific language
-- =====================================================
CREATE OR REPLACE FUNCTION get_event_localized(
  e_id UUID,
  e_lang TEXT DEFAULT 'es'
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  cover_image_url TEXT,
  hero_image TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  location_name TEXT,
  location TEXT,
  city TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  capacity INTEGER,
  max_attendees INTEGER,
  price NUMERIC,
  currency TEXT,
  is_free BOOLEAN,
  is_premium BOOLEAN,
  is_recurring BOOLEAN,
  points_reward INTEGER,
  age_restriction TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ev.id,
    CASE
      WHEN e_lang = 'en' AND ev.title_en IS NOT NULL AND ev.title_en != ''
      THEN ev.title_en
      ELSE ev.title
    END AS title,
    CASE
      WHEN e_lang = 'en' AND ev.description_en IS NOT NULL AND ev.description_en != ''
      THEN ev.description_en
      ELSE ev.description
    END AS description,
    ev.cover_image_url,
    ev.hero_image,
    ev.category,
    ev.tags,
    ev.status,
    ev.start_date,
    ev.end_date,
    ev.location_name,
    ev.location,
    ev.city,
    ev.address,
    ev.latitude,
    ev.longitude,
    ev.capacity,
    ev.max_attendees,
    ev.price,
    ev.currency,
    ev.is_free,
    ev.is_premium,
    ev.is_recurring,
    ev.points_reward,
    ev.age_restriction,
    ev.created_at
  FROM events ev
  WHERE ev.id = e_id;
END;
$$;

-- =====================================================
-- Optional: View for all events with both languages
-- =====================================================
CREATE OR REPLACE VIEW events_multilang AS
SELECT
  id,
  -- Spanish fields
  title AS title_es,
  description AS description_es,
  -- English fields
  title_en,
  description_en,
  -- Common fields
  cover_image_url,
  hero_image,
  category,
  tags,
  status,
  start_date,
  end_date,
  location_name,
  location,
  city,
  address,
  latitude,
  longitude,
  capacity,
  max_attendees,
  registered_attendees,
  sold_tickets,
  price,
  currency,
  is_free,
  is_premium,
  is_recurring,
  points_reward,
  age_restriction,
  recurrence_group_id,
  recurrence_frequency,
  recurrence_count,
  recurrence_index,
  created_at
FROM events;

-- Grant access to the view
GRANT SELECT ON events_multilang TO authenticated;
GRANT SELECT ON events_multilang TO anon;
