# Módulo 1: Centro de Mando Molecular (Dashboard)

## 1. Visión Técnica y Arquitectura
El Dashboard actúa como el **Sistema Nervioso Central** de la aplicación. Su función principal es la **Síntesis de Señales**: ingesta asíncrona de múltiples fuentes de datos biológicos y su reducción a una visualización semántica (Avatar 3D) en tiempo real.

### Principios de Diseño
*   **Reactividad Extrema**: Los cambios en glucosa (CGM) deben reflejarse en la UI en < 1 segundo desde la recepción del paquete Bluetooth/API.
*   **Tolerancia a Fallos**: Si un sensor falla (ej. Apple Health no responde), el sistema debe degradarse elegantemente (mostrar última lectura + indicador "hace X min").
*   **Offline-First**: El estado biológico se persiste localmente (SQLite/WatermelonDB) para funcionar sin red.

## 2. Arquitectura de Datos y Estado (`src/features/dashboard/state/`)

### 2.1 Store Global (`useBioStore.ts` - Zustand)
Este store mantiene la "Verdad Única" del estado biológico actual.
```typescript
interface BioState {
  // Datos Crudos
  cgm: { value: number; trend: 'RISING' | 'STABLE' | 'FALLING'; timestamp: number; source: 'DEXCOM' | 'LIBRE' | 'HEALTHKIT' };
  heart: { hrv: number; restingRate: number; timestamp: number };
  sleep: { score: number; deepSleepMin: number; timestamp: number };
  
  // Estado Derivado (Calculado)
  metabolicScore: number; // 0-100
  energyState: 'PEAK' | 'STEADY' | 'CRASHING' | 'RECOVERY';
  
  // Estado de UI
  avatarMode: 'WHOLE_BODY' | 'ORGAN_FOCUS';
  focusedOrgan: string | null;
  
  // Acciones
  ingestReading: (type: 'GLUCOSE' | 'HEART', data: any) => void;
  computeDerivedState: () => void; // Ejecuta la lógica de negocio para actualizar metabolicScore
}
```

### 2.2 Motor de Ingesta (`src/features/dashboard/logic/ingestionEngine.ts`)
Clase singleton que gestiona las suscripciones a dispositivos.
*   **`HealthKitManager`**: Wrapper nativo para iOS. Maneja permisos y "Background Delivery" (despertar la app cuando hay nuevos datos).
*   **`DataNormalizer`**: Convierte unidades (mg/dL vs mmol/L) y estandariza formatos de timestamps.

## 3. Especificación de Componentes (`src/features/dashboard/components/`)

### 3.1 `BioAvatar3D` (El Gemelo Digital)
*   **Renderizado**: Utiliza `react-three-fiber`.
*   **Shaders**:
    *   `GlowShader`: Fragment shader personalizado que toma `metabolicScore` como uniforme.
        *   Si score > 80: Color base Cian, pulsación lenta (0.5Hz).
        *   Si score < 40: Color base Naranja, pulsación rápida (2Hz, simulando taquicardia/estrés).
*   **Mapeo de Órganos**:
    *   **Cerebro**: Vinculado a Glucosa (Hipoglucemia = Niebla gris; Estable = Luz clara).
    *   **Estómago**: Vinculado a Digestión (Activo post-comida).
    *   **Corazón**: Vinculado a VFC (Baja variabilidad = Color rojo estático).

### 3.2 `TimeTravelSlider` (Cronología)
*   **Funcionalidad**: Slider en la parte inferior que permite "rebobinar" el estado del avatar.
*   **Lógica**: Al mover el slider a "Hace 2 horas", el store cambia a modo `HISTORICAL` y carga snapshots pasados de la DB local, permitiendo al usuario ver correlaciones (ej. "Mi cerebro se puso rojo 1 hora después de comer pizza").

### 3.3 `AnomalyAlertWidget`
*   **Lógica de Detección**:
    *   Ejecuta análisis estadístico en ventana deslizante (últimas 3h).
    *   Si `(CurrentGlucose - MovingAverage) > 2 * Sigma`: Dispara Alerta "Pico Inusual".
*   **UX**: Tarjeta flotante con botón "Investigar Causa" (lleva al registro de alimentos).

## 4. API de Backend (`src/features/dashboard/api/`)
Aunque el dashboard es "Client-Heavy", necesita endpoints para sincronización y análisis pesado.

*   `POST /sync/biometrics`: Envía lotes comprimidos de datos históricos para backup y re-entrenamiento del modelo IA.
*   `GET /insights/daily`: Obtiene resumen generado por LLM ("Hoy tu estabilidad fue 20% mejor gracias al sueño").

## 5. Casos Borde y Manejo de Errores
1.  **Desconexión de Sensor**:
    *   *Síntoma*: No llegan datos en 15 min.
    *   *Acción*: Avatar se vuelve semitransparente ("Fantasma"). Indicador de "Señal Perdida".
2.  **Datos Contradictorios** (ej. Glucosa baja pero Pulso altísimo):
    *   *Acción*: Priorizar alerta de seguridad. Mostrar posible error de sensor o evento de estrés agudo.