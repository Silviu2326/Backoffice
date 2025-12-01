# Módulo 5: Motor Metabólico (IA Predictiva)

## 1. Visión Técnica Profunda
El núcleo de la inteligencia. Implementa un sistema de **Continuous Learning**.
El modelo inicial es genérico (poblacional). Con cada comida registrada y dato de CGM recibido, el modelo se "especializa" (Fine-tuning) en la fisiología del usuario.

## 2. Arquitectura de Archivos (`src/features/metabolic-engine/`)

### 2.1 Modelo de Machine Learning (`logic/model/`)

#### `GlucoseLSTM.ts` (TensorFlow.js / ONNX Runtime)
*   **Arquitectura**: LSTM (Long Short-Term Memory) o Transformer ligero.
*   **Inputs (Tensores)**:
    *   `MealVector`: [Carbs, Fat, Protein, Fiber, GI].
    *   `StateVector`: [GlucosaActual, Tendencia, InsulinaActiva, HoraDia].
    *   `HistoryVector`: [Glucosa t-1, Glucosa t-2...].
*   **Output**:
    *   Secuencia de 12 puntos (predicción cada 15 min por 3 horas).

#### `PersonalizationLoop.ts`
*   **Entrenamiento en Dispositivo**:
    *   Se ejecuta cada noche (cuando el teléfono carga y tiene WiFi).
    *   Toma los "Experimentos Naturales" del día (Comida -> Respuesta real).
    *   Ejecuta 5-10 épocas de entrenamiento para ajustar los pesos de la última capa densa del modelo.

### 2.2 Aprendizaje Federado (`logic/federated/`)

#### `GradientSync.ts`
*   **Privacidad Diferencial**:
    *   Antes de subir los gradientes (ajustes del modelo) al servidor, les añade ruido matemático (Laplace Noise).
    *   Esto garantiza que el servidor no pueda realizar ingeniería inversa para saber qué comió el usuario, pero sí pueda mejorar el modelo global.

### 2.3 Componentes UI (`components/`)

#### `PredictionCanvas.tsx`
*   **Visualización Científica**:
    *   Usa `D3.js` o `Victory Charts` para dibujar la curva.
    *   **Cono de Incertidumbre**: Sombreado alrededor de la línea que muestra el intervalo de confianza (P10-P90).
    *   Si el modelo está poco entrenado, el cono es ancho.

#### `InsightGenerator.tsx`
*   **NLG (Natural Language Generation)**:
    *   Plantillas lógicas para explicar la predicción.
    *   "Vemos un pico probable debido a la combinación de Alta Grasa + Alto Carbohidrato a esta hora tardía (resistencia a la insulina nocturna)."

## 3. Calibración
*   **Fase de "Onboarding Metabólico"**:
    *   Los primeros 14 días son de recolección de datos.
    *   La app pide al usuario realizar "Desafíos de Calibración":
        1.  "Come 50g de pan blanco en ayunas" (Test de tolerancia oral simplificado).
        2.  "Camina 10 min después de la cena".
    *   Esto establece la línea base de sensibilidad a la insulina.

## 4. API Backend (Coordinación)
*   `POST /model/weights`: Recibe actualizaciones de pesos (binario) de miles de usuarios para promediar el modelo maestro.
*   `GET /model/latest`: Descarga la última versión del modelo base optimizado.