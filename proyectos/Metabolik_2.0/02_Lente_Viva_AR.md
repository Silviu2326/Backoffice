# Módulo 2: Realidad Aumentada Nutricional (La "Lente Viva")

## 1. Visión Técnica Profunda
Este módulo implementa un pipeline de Visión Computacional en tiempo real. La latencia crítica es el tiempo entre `Camera Frame Capture` y `AR Overlay Render`.
Objetivo: **< 100ms** para detección y tracking (client-side), **< 2s** para análisis nutricional profundo (cloud).

### Flujo de Datos (Pipeline)
1.  **Cámara (60fps)** -> Frame Buffer.
2.  **Detección (Local)**: Modelo TFLite (YOLOv8 nano) detecta regiones de interés (Texto Menú o Plato Comida).
3.  **Tracking (Local)**: ARKit/ARCore ancla coordenadas 3D a las regiones detectadas.
4.  **Análisis (Híbrido)**:
    *   Texto (OCR): Se envía a Cloud Vision API (o MLKit local si es simple).
    *   Semántica: NLP extrae entidades ("Hamburguesa", "Papas").
5.  **Predicción (Local/Cloud)**: Motor Metabólico calcula curva de glucosa.
6.  **Render (Local)**: UI dibuja gráfico sobre el ancla 3D.

## 2. Arquitectura de Archivos (`src/features/living-lens/`)

### 2.1 Lógica de Visión (`logic/visionPipeline.ts`)
*   **Gestión de Frames**:
    *   Implementa "Throttling Inteligente". No procesa cada frame.
    *   Estado `Scanning`: Procesa 1 frame cada 500ms.
    *   Estado `Tracking`: Si ya detectó objetos, deja de analizar imágenes y solo actualiza coordenadas (60fps).
*   **Estabilización**:
    *   Usa un filtro de Kalman para suavizar el movimiento de las etiquetas AR y evitar el "jitter" (temblor).

### 2.2 Componentes AR (`components/overlays/`)

#### `GlucoseProjectionCard.tsx`
*   **Diseño de Información**:
    *   **Mini-Gráfico**: SVG simplificado (Sparkline) de la curva predicha a 2h.
    *   **Score**: Círculo de color (Semáforo).
    *   **Interactividad**: Al tocar, se expande a pantalla completa con detalles ("Grasas: 20g, Proteína: 30g").

#### `MenuHighlighter.tsx`
*   **Funcionalidad**:
    *   Dibuja rectángulos semitransparentes sobre el texto del menú físico.
    *   **Colores**:
        *   Verde suave: Platos seguros.
        *   Rojo suave: Platos de riesgo.
    *   **Desafío**: Mapeo preciso de coordenadas 2D (imagen) a 3D (mundo). Requiere calibración de la matriz de proyección de la cámara.

### 2.3 API Clients (`api/`)

#### `nutritionResolver.ts`
*   **Estrategia de Fallback**:
    *   Intento 1: API Edamam (Alta precisión).
    *   Intento 2: Base de datos local offline (SQLite con 5000 platos comunes).
    *   Intento 3: LLM (GPT-4o mini) para estimación heurística si el plato es exótico ("Pollo a la fantasía del chef").

## 3. Manejo de Errores y Edge Cases
1.  **Iluminación Pobre**:
    *   Detectar nivel de lux en el frame.
    *   Si < umbral, mostrar aviso UI: "Enciende la linterna para escanear" (Botón toggle torch).
2.  **Menú en Ángulo Extremo**:
    *   El OCR falla si el texto está muy distorsionado.
    *   Detectar perspectiva (homografía) y pedir al usuario: "Alinea el menú frente a la cámara".
3.  **Platos Desconocidos**:
    *   Si la confianza de detección es baja (< 50%), mostrar etiqueta "¿Qué es esto?" y permitir input manual de voz.

## 4. Estado Global (`useARStore.ts`)
```typescript
interface ARState {
  isScanning: boolean;
  detectedItems: ARItem[]; // Lista de objetos trackeados
  selectedItem: ARItem | null; // Item focado para detalles
  torchOn: boolean;
  debugMode: boolean; // Muestra cajas delimitadoras crudas
}
```