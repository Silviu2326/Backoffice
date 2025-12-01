# Módulo 5: Centro de Transparencia (IA Explicable)

## 1. Visión Técnica Profunda
El objetivo es la **Explicabilidad (XAI)**. No basta con loguear "Se movió dinero". Hay que persistir el **Contexto de Decisión**.
Cada decisión de la IA es un snapshot que captura: El estado del mundo (saldos), las reglas evaluadas y el resultado.
Esto permite "Replayability": El usuario puede ver exactamente qué datos tenía la IA cuando tomó una decisión, incluso si esos datos ya cambiaron.

## 2. Arquitectura de Archivos Detallada

### 2.1 API Layer (`src/features/transparency/api/`)

#### `auditDTOs.ts`
*   **Estructura de Causalidad**:
    ```typescript
    interface LogicStep {
      ruleName: string;      // ej. "MinBalanceCheck"
      expected: string;      // ej. "> 2000"
      actual: string;        // ej. "2450"
      passed: boolean;
    }

    export interface DecisionRecord {
      id: string;
      timestamp: string;
      actionType: 'SWEEP' | 'BLOCK' | 'INVEST';
      confidenceScore: number; // 0.0 a 1.0
      logicTrace: LogicStep[]; // La cadena de "pensamiento"
      outcome: {
        description: string;
        amount?: number;
      };
      userFeedback?: 'THUMBS_UP' | 'THUMBS_DOWN' | 'CORRECTED';
    }
    ```

#### `auditService.ts`
*   **Funciones**:
    *   `getDecisionStream(cursor)`: Paginación infinita de logs.
    *   `submitCorrection(decisionId, correctionData)`:
        *   Envía feedback negativo al backend.
        *   Esto debería disparar un "Shadow Mode" en el backend donde la IA aprende del error sin ejecutar acciones riesgosas por un tiempo.

### 2.2 Components Layer (`src/features/transparency/components/`)

#### `DecisionLogTable.tsx`
*   **Diseño**:
    *   No es una tabla de Excel. Es una línea de tiempo vertical (Timeline UI).
    *   Cada nodo de la línea de tiempo tiene un icono de estado (Verde/Amarillo/Rojo).

#### `ReasoningChain.tsx`
*   **Visualización**:
    *   Renderiza el array `logicTrace` como un diagrama de flujo simplificado o una lista de checkmarks.
    *   Ejemplo visual:
        *   [✅] Saldo > 2000 (Fue 2450)
        *   [✅] Facturas < 500 (Fue 200)
        *   [⬇️] Ejecutando: Transferir 250€

#### `AuditCard.tsx` (Fact Checking)
*   **Interacción de Verdad**:
    *   Muestra premisas ("Tu alquiler es 800€").
    *   Tiene un estado `verificationStatus`: 'PENDING', 'VERIFIED', 'DISPUTED'.
    *   Si el usuario disputa, se abre un input inline para corregir el valor.

#### `CorrectionDialog.tsx`
*   **UX de Impacto**:
    *   Cuando el usuario corrige un dato (ej. "No, mi alquiler subió a 900€"), el diálogo calcula el impacto inmediato.
    *   Muestra: "Al corregir esto, tu Safe-to-Spend bajará 100€ automáticamente. ¿Confirmar?".

### 2.3 Pages Layer (`src/features/transparency/pages/`)

#### `TransparencyPage.tsx`
*   **Layout**:
    *   **Panel Izquierdo (Pasado)**: Feed de decisiones tomadas.
    *   **Panel Derecho (Presente)**: "Modelo Mental" de la IA (Lista de variables conocidas).

## 3. Estrategia de Datos
*   **Inmutabilidad**: Los logs de decisiones NUNCA se borran ni se editan. Las correcciones crean *nuevos* registros de corrección que referencian al original.
*   **Compresión**: El `logicTrace` puede ser muy verboso. En base de datos se guarda comprimido, el frontend lo infla al recibirlo.

## 4. Testing
*   **UI Tests**: Verificar que al corregir una premisa, el estado visual de la tarjeta cambia a "VERIFIED".
*   **Service Tests**: Mockear una respuesta con `confidenceScore < 0.5` y asegurar que la UI lo muestra con advertencias amarillas (Low Confidence).
