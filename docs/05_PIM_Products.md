# Módulo de Catálogo y Productos (PIM)

Este documento detalla las especificaciones funcionales y técnicas para el módulo de **Gestión de Información de Producto (PIM)**. Este sistema es el corazón comercial de Mr. CoolCat, centralizando toda la información relativa a los productos, sus variantes y su disponibilidad física en múltiples ubicaciones.

---

## 1. Gestión de Ficha de Producto

El administrador debe poder crear y editar productos con un alto nivel de detalle. La arquitectura distingue entre el **Producto Padre** (la entidad conceptual) y sus **Variantes** (las unidades vendibles).

### A. Información General (Producto Padre)
Datos compartidos por todas las variantes del producto:
*   **Identificación:** Nombre comercial, Descripción corta (para listados) y Descripción larga (HTML/Markdown para detalle).
*   **Categorización:** Categoría principal (ej. "Cervezas", "Merch", "Eventos") y Subcategorías (ej. "IPA", "Lager").
*   **Brand Management:** Vinculación con un **Personaje** (ver Módulo 7). Esto permite que la app adapte sus colores y "voz" al mostrar el producto.
*   **Estado:** Activo / Borrador / Archivado.

### B. Gestión de Variantes (SKUs)
El sistema debe permitir múltiples formatos de venta para un mismo producto base.
*   **Ejemplo:**
    *   *Producto Padre:* Cerveza Morena.
    *   *Variante 1:* Botella individual 33cl.
    *   *Variante 2:* Pack x6.
    *   *Variante 3:* Caja x24.
*   **Atributos de Variante:**
    *   **SKU:** Identificador único de stock.
    *   **Precio:** PVP (Precio Venta Público) y Precio Promocional (opcional con fecha de validez).
    *   **Logística:** Peso (kg) y Dimensiones (para cálculo de envío).
    *   **Código de Barras:** EAN/UPC para escaneo en almacén o tienda física.

### C. Multimedia
*   **Galería:** Carga de múltiples imágenes con soporte *drag-and-drop*.
*   **Asignación:** Posibilidad de asignar una foto específica a una variante (ej. foto de la caja para la variante "Caja x24").

---

## 2. Estrategia SEO y Marketing

Para maximizar la visibilidad en la web compartida y buscadores, cada producto cuenta con campos dedicados de SEO.

*   **Meta Título:** Título optimizado para Google (max 60 caracteres).
*   **Meta Descripción:** Resumen atractivo para CTR (max 160 caracteres).
*   **Slug URL:** Generación automática amigable (ej. `/tienda/cerveza-morena-ipa`) con opción de edición manual.
*   **Cross-selling (Venta Cruzada):**
    *   Selector de "Productos Recomendados" que aparecerán en la ficha de la app (ej. "Si compras esta cerveza, te recomendamos este Vaso Oficial").

---

## 3. Inventario Multi-almacén

El sistema de gestión de stock es centralizado pero soporta múltiples ubicaciones físicas, permitiendo estrategias de logística flexible como *Click & Collect*.

### A. Ubicaciones de Stock
El sistema debe rastrear la cantidad de cada variante en diferentes "contenedores":
1.  **Almacén Central:** Inventario dedicado exclusivamente a pedidos online con envío a domicilio.
2.  **Tiendas Físicas (Sedes):** Inventario local en cada punto de venta (ej. Madrid, Barcelona). Este stock alimenta la disponibilidad para recogida en tienda.

### B. Movimientos de Inventario (Stock Logs)
Para garantizar la integridad de los datos y prevenir robos o pérdidas, **el stock nunca se edita directamente** (ej. cambiar un "5" por un "10"). Se realiza a través de **Movimientos**:

*   **Tipos de Movimiento:**
    *   `PURCHASE_ORDER`: Entrada de mercancía desde proveedor.
    *   `SALE`: Salida automática por pedido confirmado.
    *   `ADJUSTMENT`: Corrección manual (ej. rotura en almacén, merma, degustación interna).
    *   `RETURN`: Reingreso por devolución de cliente.
*   **Trazabilidad:** Cada movimiento registra:
    *   Usuario responsable (Admin ID).
    *   Fecha y Hora.
    *   Motivo (nota de texto obligatoria en ajustes manuales).
    *   Delta (+/- cantidad).

### C. Alertas de Stock
Visualización en el Dashboard Ejecutivo de variantes con:
*   **Stock Crítico:** Configurable por producto (ej. < 10 unidades).
*   **Fuera de Stock (OOS):** Cantidad 0.

---

## 4. Modelo de Datos Relacionado

Estructura técnica de referencia para la base de datos (Supabase/PostgreSQL).

### Entidades Principales
*   `products`: Tabla padre (Nombre, Slug, SEO, Character_ID).
*   `product_variants`: Tabla hija (SKU, Precio, Peso, Product_ID).
*   `stores`: Definición de almacenes y tiendas físicas.
*   `inventory_levels`: Tabla pivote (`variant_id`, `store_id`, `quantity`).
*   `inventory_logs`: Histórico inmutable de movimientos (`variant_id`, `store_id`, `delta`, `reason`, `admin_id`).

---

## 5. Interfaz de Usuario (Backoffice)

Basado en el **Design System** (`#1A1A1A` Background, `#F76934` Accents):

*   **Listado de Productos:** Tabla con filtros por Categoría, Estado y Stock Total. Indicadores visuales (círculos de color) para el estado del stock.
*   **Formulario de Edición:** Diseño en pestañas o secciones colapsables:
    1.  *General:* Datos básicos.
    2.  *Variantes:* Tabla anidada para añadir/editar SKUs rápidamente.
    3.  *Inventario:* Vista de matriz (Variante x Almacén) para ver disponibilidad rápida.
    4.  *SEO:* Campos de metadatos.
