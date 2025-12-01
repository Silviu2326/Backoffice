# Arquitectura Técnica y Stack de Datos (LPE-OS)

## 1. Estructura de Directorios Detallada
Este esquema refleja la estructura física de archivos que se implementará.

```text
src/
├── app/                        # Configuración global de la App
│   ├── App.tsx                 # Root component + Providers
│   ├── router.tsx              # React Router definitions
│   └── queryClient.ts          # Configuración TanStack Query
├── features/
│   ├── life-projects/          # Dominio Principal
│   │   ├── core/               # Módulo Agile (Sprints, Board)
│   │   │   ├── api/            # cycleService.ts
│   │   │   ├── components/     # KanbanBoard.tsx, StandupModal.tsx
│   │   │   ├── hooks/          # useSprint.ts
│   │   │   └── logic/          # velocityMath.ts
│   │   ├── navigation/         # Módulo Waze (Gantt, Simulation)
│   │   │   ├── engine/         # wazeSolver.ts (Algoritmo CSP)
│   │   │   └── components/     # LiquidGantt.tsx
│   │   ├── resources/          # Módulo ERP (Finance, Social, Energy)
│   │   │   ├── finance/
│   │   │   ├── social/
│   │   │   └── energy/
│   │   ├── accountability/     # Módulo Focus (Blocking, Stakes)
│   │   │   ├── mobile/         # nativeBridge.ts
│   │   │   └── stakes/         # Stripe logic
│   │   └── gamification/       # Módulo SkillTree
│   │       ├── lms/            # CourseAdapters
│   │       └── components/     # HexNodes
├── lib/                        # Utilidades Transversales
│   ├── supabase.ts             # Cliente Singleton
│   ├── crypto.ts               # E2EE Utils
│   ├── offline/                # RxDB / Dexie Config
│   └── synapse/                # Adaptadores Externos (Base Classes)
└── assets/                     # Imágenes, Iconos
```

## 2. Estrategia Offline-First (La Base de Datos Local)

### `lib/offline/db.ts` (RxDB Implementation)
*   **Descripción:** Configuración de la base de datos reactiva local.
*   **Colecciones:** `tasks`, `sprints`, `transactions`.
*   **Sync Plugin:** Configura la replicación GraphQL/REST con Supabase.
*   **Comportamiento:**
    *   Todas las lecturas de la UI (`useQuery`) van contra RxDB (latencia 0ms).
    *   Todas las escrituras van a RxDB.
    *   RxDB sincroniza en background cuando vuelve la conexión.

## 3. Seguridad y Privacidad (The Vault)

### `lib/crypto.ts`
*   **Descripción:** Utilidades de encriptación lado cliente (AES-GCM).
*   **Funciones:**
    *   `encryptData(text, passwordDerivedKey)`: Retorna string base64 cifrado.
    *   `decryptData(cipher, passwordDerivedKey)`: Retorna texto plano.
*   **Uso:** Se aplica en campos `notes` de contactos y `journal_entries` del diario personal antes de guardar.

## 4. Synapse (Capa de Integración)

### `lib/synapse/SynapseClient.ts`
*   **Descripción:** Orquestador de APIs externas.
*   **Funcionalidad:**
    *   Mantiene tokens OAuth (Google, Spotify, Oura).
    *   Gestiona Refresh Tokens automáticamente.
    *   Centraliza el manejo de errores de red (Retries, Circuit Breaker).

## 5. Pipeline de Despliegue

*   **Web (Vercel):** `git push` -> Build React -> Deploy Edge Functions.
*   **Mobile (Capacitor):**
    *   `npm run build` -> Genera `dist/`.
    *   `npx cap copy` -> Copia assets a carpetas nativas `ios/` y `android/`.
    *   `npx cap open android` -> Abre Android Studio para compilar APK.
