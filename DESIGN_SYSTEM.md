# Sistema de Diseño - Mr. CoolCat App

Este documento resume la estética, paleta de colores y estilos visuales extraídos de las pantallas de la aplicación móvil.

## 1. Paleta de Colores

La aplicación utiliza un esquema de "Modo Oscuro" predominante con acentos vibrantes.

### Colores Principales
*   **Fondo Principal:** `#1A1A1A` (Gris muy oscuro / casi negro)
*   **Fondo Secundario / Tarjetas:** `#2C2C2C` (Gris oscuro)
*   **Acento Principal (Brand Color):** `#F76934` / `#FF6B35` (Naranja Vibrante)
*   **Texto Principal:** `#E5E5E7` (Blanco roto / Gris muy claro)
*   **Texto Secundario:** `#9CA3AF` (Gris medio)

### Colores Funcionales
*   **Éxito:** `#4CAF50` (Verde)
*   **Error:** `#FF6B6B` / `#DC2626` (Rojo)
*   **Información:** `#6366F1` (Índigo/Azul)

### Degradados
*   **Fondo General:** Linear Gradient de `#1A1A1A` a `#2C2C2C`.
*   **Botones Especiales:** Linear Gradient de `#F76934` a `#FF8C42`.

---

## 2. Tipografía

La aplicación utiliza una combinación de fuentes condensadas y display para un look moderno y urbano.

*   **Títulos / Cabeceras:** `Truculenta_700Bold`
    *   Usado para encabezados grandes, nombres de avatares y botones importantes.
*   **Cuerpo de Texto / UI:** `RobotoCondensed_400Regular`
    *   Usado para párrafos, instrucciones y legales.
*   **Énfasis / Botones:** `RobotoCondensed_700Bold` o `RobotoCondensed_600SemiBold`
    *   Usado para textos de botones y etiquetas importantes.

---

## 3. Componentes UI Comunes

### Tarjetas (Cards)
*   **Estilo:** Fondo `#2C2C2C` con bordes redondeados (`borderRadius: 20-30`).
*   **Sombra:** Sombras sutiles pero presentes (`shadowOpacity: 0.15-0.25`, `elevation: 8`).
*   **Bordes:** A veces usan bordes sutiles `#3A3A4A` o bordes de acento `#FF6B35` para destacar.

### Botones
*   **Primarios:** Fondo Naranja (`#F76934`), texto blanco, bordes redondeados (`borderRadius: 15-18`). Suelen tener iconos a la izquierda.
*   **Secundarios / Outline:** Fondo transparente, borde gris claro (`#E5E5E7`) o naranja, texto del color del borde.
*   **Icon Buttons:** Botones circulares o cuadrados con fondo `#3A3A3A` (gris ligeramente más claro que el fondo de tarjeta).

### Inputs (Formularios)
*   **Fondo:** `#3A3A3A` (Contraste sobre la tarjeta `#2C2C2C`).
*   **Borde:** Transparente por defecto.
*   **Texto Placeholder:** `#9CA3AF`.
*   **Iconos:** Icono a la izquierda en color naranja (`#FF6B35`).

### Animaciones
*   La app hace uso extensivo de `react-native-animatable`.
*   **Entradas:** `fadeInUp`, `fadeInDown`, `bounceIn`.
*   **Delays:** Uso escalonado de delays (200ms, 400ms, 600ms...) para crear efectos de cascada en la carga de elementos.

---

## 4. Elementos Gráficos
*   **Avatares:** Imágenes circulares con bordes de color naranja cuando están seleccionados.
*   **Iconografía:** Uso extensivo de `Ionicons` y `MaterialIcons`.
*   **Fondos:** Uso de gradientes lineales para dar profundidad a las pantallas planas.
