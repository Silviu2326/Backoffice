# Módulo 5: Gestión de Riesgo de Fatiga (Para Industrias Críticas)

## 1. Visión General Técnica
Este módulo es "Mission Critical". Debe funcionar incluso si se cae la red (Offline First). La validación de identidad y estado debe ser criptográficamente segura para evitar suplantaciones (ej. usar el pantallazo del QR de un compañero descansado).

## 2. Seguridad y Anti-Fraude

### QR Dinámico (TOTP-like)
El código QR de acceso no puede ser estático.
*   Payload: `Encrypted({ userId, timestamp, readiScore, salt })`
*   Validez: 30 segundos.
*   El scanner (Tablet/IoT) desencripta y verifica:
    1.  Firma válida (Clave pública del servidor).
    2.  Timestamp dentro de ventana permitida.
    3.  Score > Umbral.

### Offline Mode (PWA)
*   **Service Workers:** Cachear la interfaz completa (Shell App).
*   **Estrategia de Datos:**
    *   Si hay red: Consultar API real.
    *   Si no hay red: Usar último `ReadiScore` calculado localmente (siempre que la sincronización del wearable haya sido reciente, < 4 horas). Si data es vieja -> Bloquear acceso por seguridad ("Data Stale").

## 3. Integración IoT (Hardware)

### Protocolo de Comunicación con Torniquetes
*   Websocket directo o MQTT si el frontend controla el acceso.
*   Alternativa simple: El frontend muestra el QR, el torniquete tiene un lector óptico que valida contra una API local o central.

## 4. UI/UX para Operarios y Supervisores

### Interfaz "Glanceable" (Supervisor)
*   Diseño de alto contraste. Texto grande.
*   Uso de iconografía universal (Semáforo).
*   **Sonido:** Alertas auditivas distintivas si entra una notificación de "Riesgo Crítico".

### Interfaz "Fit-to-Work" (Operario)
*   Botón gigante: "Generar Pase".
*   Feedback háptico (vibración) al aprobar/rechazar.

## 5. Modelado de Datos Específico

```sql
CREATE TABLE fatigue_access_logs (
    id UUID PRIMARY KEY,
    operator_id UUID REFERENCES users(id),
    shift_id UUID,
    attempt_timestamp TIMESTAMPTZ,
    readi_score_snapshot INTEGER, -- Guardar el score exacto del momento
    decision_result TEXT, -- 'GRANTED', 'DENIED_FATIGUE', 'DENIED_STALE_DATA'
    location_gate_id TEXT
);
```

## 6. Estructura de Archivos (Expandida)

```text
src/features/peak-performance/fatigue-risk/
├── api/
│   ├── offlineSyncService.ts   # Sincronización background
│   └── iotGatewayService.ts    # Comunicación con hardware
├── components/
│   ├── Supervisor/
│   │   ├── RadarGrid.tsx       # Matriz de operarios
│   │   └── AlertBanner.tsx
│   ├── Operator/
│   │   ├── QrAccessPass.tsx    # Generación Canvas de QR
│   │   ├── CountDownTimer.tsx  # "Este código expira en 15s"
│   │   └── StatusTrafficLight.tsx # Componente visual Rojo/Verde
├── context/
│   └── OfflineStatusContext.tsx
├── lib/
│   ├── totpGenerator.ts        # Generación de códigos temporales
│   └── safteAlgorithm.ts       # Versión JS del modelo para cálculo local
└── pages/
    ├── SupervisorMonitorPage.tsx
    └── OperatorAccessPage.tsx
```
