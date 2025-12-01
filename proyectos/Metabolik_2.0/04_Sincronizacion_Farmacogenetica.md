# Módulo 4: Sincronización Farmacogenética (La Capa de Seguridad)

## 1. Visión Técnica Profunda
Este módulo es el **Guardián de Seguridad**. Su arquitectura es única porque prioriza la privacidad absoluta (Zero-Knowledge Architecture).
Los datos genéticos crudos (23andMe.txt, ~20MB) son procesados localmente. El servidor nunca ve el ADN, solo recibe consultas abstractas ("¿Es seguro el Pomelo?").

## 2. Arquitectura de Archivos (`src/features/pharmacogenetics/`)

### 2.1 Procesamiento de ADN (`logic/genomics/`)

#### `dnaWorker.ts` (Web Worker)
*   **Función**: Descarga el procesamiento del hilo principal.
*   **Input**: `File` object (el txt subido por el usuario).
*   **Proceso**:
    1.  Lee el archivo línea por línea (Stream) para no saturar RAM.
    2.  Busca RSIDs específicos definidos en `variantDb.json`.
    3.  Genera un `GenomicPhenotype` (JSON ligero).
*   **Output**:
    ```json
    { "CYP1A2": "SLOW_METABOLIZER", "MTHFR": "C677T_HOMOZYGOUS", ... }
    ```
*   **Persistencia**: El output se cifra con AES-256 usando una clave derivada del PIN del usuario y se guarda en `SecureStorage` (Keychain/Keystore).

### 2.2 Motor de Interacciones (`logic/interactions/`)

#### `InteractionGraph.ts`
*   **Estructura de Datos**:
    *   Grafo dirigido donde los nodos son Fármacos, Genes y Alimentos.
    *   Aristas ponderadas por severidad.
*   **Algoritmo de Búsqueda**:
    *   Al escanear un alimento (AR) o añadir al carrito (Despensa):
    *   Ejecuta búsqueda de caminos: `Alimento -> (inhibe) -> Gen -> (metaboliza) -> FármacoActivo`.
    *   Si existe camino, retorna `InteractionRisk`.

### 2.3 Componentes UI (`components/`)

#### `SafetyShieldStatus.tsx`
*   **Feedback Visual Global**:
    *   Icono omnipresente en la Header Bar.
    *   Verde: "Protección Activa".
    *   Amarillo: "Faltan datos genéticos" (CTA para subir ADN).
    *   Rojo: "Conflicto Detectado" (Alerta modal inmediata).

#### `DrugInteractionTimeline.tsx`
*   **Visualización Temporal**:
    *   Eje X: 24 horas.
    *   Bloques: Ventanas de vida media de los fármacos.
    *   Zonas Prohibidas: Áreas sombreadas en rojo donde ciertos nutrientes (ej. Calcio) están bloqueados.

## 3. Integración con Bases de Datos Externas
*   **CPIC (Clinical Pharmacogenetics Implementation Consortium)**:
    *   Fuente de verdad para guías de dosificación.
    *   Se descarga una versión *minificada* de la base de datos CPIC al dispositivo periódicamente para permitir verificaciones offline.
*   **DrugBank / OpenFDA**:
    *   Para autocompletado de nombres de medicamentos y obtención de códigos ATC.

## 4. Casos Borde
1.  **Polifarmacia**:
    *   Usuario toma 10+ medicamentos.
    *   El sistema debe priorizar interacciones "Severas" (Riesgo de muerte/hospitalización) sobre "Leves" para no fatigar al usuario con alertas constantes.
2.  **Variantes Genéticas Desconocidas**:
    *   Si el archivo de ADN no contiene el SNP necesario para determinar el estado de CYP2D6, el sistema asume "Metabolizador Normal" (estadísticamente más probable) pero muestra una advertencia de "Dato Inferido".