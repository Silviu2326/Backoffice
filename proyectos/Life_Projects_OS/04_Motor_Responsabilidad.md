# Módulo 3: Motor de Ejecución y Responsabilidad (Accountability Engine)

## 1. Visión General Técnica
Este módulo contiene la lógica de "Cumplimiento Forzado". Requiere interacción profunda con hardware (Mobile) y servicios financieros (Stripe). Es el único módulo que tiene componentes nativos puros.

## 2. Esquema de Base de Datos

```sql
CREATE TABLE stakes (
    id UUID PRIMARY KEY,
    user_id UUID,
    task_id UUID,
    amount_cents INTEGER, -- $20.00 = 2000
    stripe_payment_intent_id TEXT,
    deadline TIMESTAMPTZ,
    status TEXT CHECK (status IN ('PENDING', 'VERIFYING', 'SAFE', 'BURNED')),
    proof_image_url TEXT,
    ai_verdict JSONB -- { "confidence": 0.98, "is_valid": true, "reason": "Gym equipment detected" }
);
```

## 3. Arquitectura de Archivos y Especificación Funcional

### A. Bloqueo de Apps (`src/features/life-projects/accountability/focus/`)

#### `FocusSessionManager.ts`
*   **Descripción:** Singleton que gestiona el estado de "Deep Work".
*   **Estado:** `isActive`, `startTime`, `blockedAppsList`.
*   **Persistencia:** Guarda estado en local para sobrevivir reinicios de app.

#### `NativeBridge.ts` (Mobile Only)
*   **Descripción:** Interface con código nativo (Kotlin/Swift).
*   **Métodos:**
    *   `enableBlocking(packageNames: string[])`: Llama a API de Accesibilidad (Android) o FamilyControls (iOS).
    *   `disableBlocking()`: Libera el teléfono.
    *   `isAppBlocked(packageName)`: Check rápido.

#### `FocusOverlay.tsx`
*   **Descripción:** La pantalla que "salta" cuando intentas abrir Instagram.
*   **UX:**
    *   Fondo negro total.
    *   Texto blanco grande: "NO."
    *   Contador: "Espera 15s para desbloquear".
    *   Botón "Emergencia": Permite desbloquear pagando $1 (Micro-multa inmediata).

### B. Apuestas Financieras (`src/features/life-projects/accountability/stakes/`)

#### `services/StripeService.ts`
*   **Descripción:** Manejo de pagos.
*   **Funciones:**
    *   `createHold(amount)`: Autoriza el dinero en la tarjeta pero no lo cobra.
    *   `capturePayment(intentId)`: Ejecuta el cobro (cuando el usuario falla).
    *   `releaseHold(intentId)`: Cancela la autorización (cuando el usuario cumple).

#### `services/VisionVerifier.ts`
*   **Descripción:** Cliente de validación de pruebas.
*   **Lógica:**
    1.  Recibe imagen (Blob).
    2.  Comprime imagen (optimización ancho de banda).
    3.  Envía a OpenAI GPT-4o-Vision con prompt específico: *"Analiza esta imagen. El usuario dice que está en 'El Gimnasio'. ¿Ves equipamiento de gimnasio? Responde JSON: { valid: boolean, confidence: number }"*.
    4.  Retorna resultado.

#### `components/StakeCard.tsx`
*   **Descripción:** UI para crear la apuesta.
*   **Inputs:** Selector de cantidad ($5, $20, $100), Selector de Beneficiario ("Donald Trump" vs "Greenpeace" - *Anti-Charity concept*).

#### `components/ProofUploader.tsx`
*   **Descripción:** Widget de cámara.
*   **Estado:**
    *   `IDLE`: Botón "Subir Prueba".
    *   `UPLOADING`: Progress bar.
    *   `ANALYZING`: Animación de "Cerebro IA" pensando.
    *   `SUCCESS/FAIL`: Resultado visual claro.

## 4. Endpoints API (Edge Functions)

*   `POST /functions/v1/verify-proof`:
    *   Endpoint seguro que maneja la lógica de validación IA + Stripe.
    *   **Seguridad:** Verifica que la foto no tenga metadatos antiguos y no sea un duplicado (Hash check).
    
*   `POST /functions/v1/trigger-burn`:
    *   Job programado (Cron).
    *   Revisa todas las apuestas expiradas (`deadline < now` y `status == 'PENDING'`).
    *   Ejecuta `StripeService.capturePayment()` automáticamente.
    *   Envía notificación push: "Has perdido $20. No subiste la prueba a tiempo."
