# Módulo de Brand Management y CMS de Personajes

Este documento detalla las especificaciones para el módulo de gestión de marca, centrado en la administración de los **Personajes** que constituyen el núcleo narrativo de la experiencia Mr. CoolCat. Este CMS permite a los equipos de Marketing y Contenido controlar cómo se presentan los personajes en la aplicación móvil (`PersonajesScreen`) y cómo se vinculan con el catálogo de productos.

---

## 1. Descripción General

El objetivo de este módulo es proporcionar una interfaz administrativa para crear, editar y gestionar la "personalidad" de la marca. A diferencia de un CMS tradicional de blog, este sistema gestiona entidades vivas (Personajes) que afectan no solo al contenido, sino a la estética de la aplicación (colores, temas) y a la estrategia de ventas (vinculación con productos).

**Roles con Acceso:**
*   **Super Admin:** Acceso total.
*   **Marketing Lead:** Creación y edición de personajes, gestión de campañas.
*   **Content Creator:** Actualización de bios y assets visuales.

---

## 2. Funcionalidades del CMS

### 2.1. Editor de Ficha de Personaje
Interfaz de formulario para definir la identidad del personaje.

*   **Datos Básicos:**
    *   **Nombre:** (ej. "Sifrina").
    *   **Subtítulo/Rol:** (ej. "La Reina del Lúpulo").
    *   **Biografía:** Editor de texto enriquecido (WYSIWYG) para la historia del personaje.
    *   **Rasgos de Personalidad:** Sistema de *tags* (ej. "Extrovertida", "Aventurera", "Foodie").
    *   **Intereses:** Lista de aficiones que aparecen en su perfil.
    *   **Estado:** Activo / Inactivo (Ocultar personaje temporalmente).

### 2.2. Gestión de Assets Visuales
Control estricto de los recursos gráficos para asegurar la consistencia visual en la App.

*   **Avatar (Thumbnail):**
    *   Formato: PNG con fondo transparente.
    *   Uso: Listados, marcadores en mapa, iconos de chat.
    *   *Validación:* Relación de aspecto 1:1.
*   **Imagen de Fondo (Wallpaper/Cover):**
    *   Formato: JPG/WebP de alta resolución.
    *   Uso: Fondo de pantalla en el perfil detallado del personaje.
*   **Video de Presentación:**
    *   Formato: Enlace a hosting de video (YouTube/Vimeo) o archivo MP4 optimizado.
    *   Uso: Reproducción automática o bajo demanda en la ficha del personaje.
*   **Galería de Momentos:**
    *   Carrusel de imágenes adicionales (ej. el personaje en eventos).

### 2.3. Personalización de UI (Theming Dinámico)
Esta funcionalidad permite que la interfaz de la aplicación móvil se "vista" de los colores del personaje cuando el usuario visita su perfil, reforzando la identidad visual.

*   **Selector de Colores (Color Picker):**
    *   **Color Primario:** Define el color de los botones principales, bordes activos y acentos gráficos.
    *   **Color Secundario:** Define fondos secundarios o degradados.
*   **Previsualización:**
    *   El CMS debe mostrar un "mockup" simple de cómo se verían los botones y tarjetas con los colores seleccionados (basado en el `DESIGN_SYSTEM.md`, por defecto Naranja `#F76934` si no se especifica).

---

## 3. Vinculación con Productos (Cross-Merchandising)

Esta sección convierte la narrativa en ventas. Permite asociar productos del catálogo (PIM) a un personaje específico.

*   **Relación Personaje -> Producto (1:N):**
    *   Buscador de productos integrado (conecta con la tabla `products`).
    *   Permite seleccionar múltiples productos como "Favoritos de [Nombre Personaje]".
    *   *Ejemplo:* Vincular a "Sifrina" con "IPA Sin Gluten" y "Pack Degustación".
*   **Impacto en App:**
    *   En la pantalla del personaje, aparecerá una sección "Mis Recomendaciones" o "Lo que bebe [Nombre]".
    *   En la ficha del producto, puede aparecer un distintivo "Recomendado por [Nombre]".

---

## 4. Modelo de Datos (Referencia Técnica)

Estructura de base de datos sugerida para la entidad `characters`.

```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- Para URLs amigables y deep links
  role_subtitle VARCHAR(255),
  biography TEXT,
  
  -- Assets
  avatar_url TEXT NOT NULL,
  cover_image_url TEXT,
  video_presentation_url TEXT,
  
  -- Theming (JSON para flexibilidad futura)
  theme_config JSONB DEFAULT '{"primaryColor": "#F76934", "secondaryColor": "#2C2C2C"}',
  
  -- Metadata
  personality_tags TEXT[], -- Array de strings
  interests TEXT[],
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla intermedia para la relación N:M con productos
CREATE TABLE character_products_recommendations (
  character_id UUID REFERENCES characters(id),
  product_id UUID REFERENCES products(id),
  display_order INTEGER DEFAULT 0,
  PRIMARY KEY (character_id, product_id)
);
```
