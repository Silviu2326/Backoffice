# Módulo 9: Fiscalidad Básica & Gastos (Finance)

## Descripción General
Este módulo tiene como objetivo simplificar la gestión fiscal trimestral del freelancer, automatizando la captura de gastos y proporcionando una visión clara de las obligaciones tributarias en tiempo real.

**Objetivo Principal:** Que el trimestre no sea un infierno.

## Características Principales

### 9.1. Buzón de Gastos (OCR) y Categorización
Sistema automatizado para la recepción, procesamiento y organización de facturas de gastos.

*   **Funcionalidad:**
    *   Dirección de correo dedicada (ej: `gastos@micrm.com`) para reenvío de facturas (Amazon, Uber, proveedores, etc.).
    *   Subida manual de archivos (PDF, Imágenes) mediante interfaz drag-and-drop.
    *   **Integración API OCR:**
        *   Se priorizará una implementación híbrida. Uso de **Tesseract.js** para una primera pasada rápida en cliente (navegador) para tickets simples.
        *   Opción de conector para servicios externos (ej: **Google Cloud Vision API** o **Azure Form Recognizer**) para facturas complejas donde Tesseract no alcance el umbral de confianza mínimo.
        *   *Flujo Técnico:* `Input File` -> `Pre-procesamiento de Imagen` -> `Extracción OCR` -> `Parsing de Texto a Entidad (Fecha, NIF, Importes)`.
    *   **Categorización Automática (Reglas Regex):**
        *   Motor de clasificación basado en patrones de texto (Regex) sobre el nombre del proveedor o concepto detectado.
        *   *Reglas por defecto:*
            *   `/(uber|cabify|taxi)/i` -> Categoría: **Transporte**.
            *   `/(aws|google cloud|azure|digitalocean|hostinger)/i` -> Categoría: **Hosting/Infraestructura**.
            *   `/(starbucks|restaurante|burger)/i` -> Categoría: **Comidas**.
        *   El sistema debe permitir al usuario añadir sus propias reglas regex en la configuración.

### 9.2. Huchas de Impuestos (Tax Jars)
Herramienta de previsión financiera para evitar sorpresas fiscales.

*   **Funcionalidad:**
    *   Calculadora en tiempo real de impuestos acumulados que deben separarse del flujo de caja operativo.
    *   **Lógica de las 'Huchas':**
        *   **Hucha IVA (VAT Piggy Bank):**
            *   *Fórmula:* `∑(IVA Repercutido en Facturas de Venta) - ∑(IVA Soportado en Gastos Deducibles)`.
            *   El sistema debe alertar si el saldo de la hucha es negativo (Hacienda nos debe dinero) o positivo (debemos guardar dinero).
        *   **Hucha IRPF (Income Tax Piggy Bank):**
            *   *Fórmula:* `(Base Imponible Ventas - Base Imponible Gastos) * %TipoImpositivo`.
            *   Permite configuración del `%TipoImpositivo` (ej: 20% para pagos fraccionados en España, o tramos progresivos).
    *   **Indicador de "Saldo Real Disponible":**
        *   Cálculo visual: `Saldo Bancario Actual - (Hucha IVA + Hucha IRPF)`. Esto evita la ilusión de riqueza antes del pago de impuestos.

## Especificaciones Técnicas de Implementación

La implementación de este módulo debe seguir estrictamente la siguiente estructura de carpetas y organización de código:

*   **Directorio Base:** `src/features/finance/`
*   **Estructura de Carpetas:**
    *   `pages/`: Componentes de página completa (ej: `ExpensesPage.tsx`, `TaxDashboard.tsx`).
    *   `components/`: Componentes reutilizables específicos de finanzas (ej: `TaxJarCard.tsx`, `ExpenseList.tsx`, `OcrUploader.tsx`).
    *   `api/`: Servicios de comunicación con el backend (ej: `financeService.ts` para endpoints de gastos e impuestos).
    *   `utils/`:
        *   `ocrParser.ts`: Lógica de limpieza y extracción de datos desde el raw text del OCR.
        *   `categoryMatcher.ts`: Implementación del motor de reglas regex para asignar categorías.
        *   `taxMath.ts`: Funciones puras para el cálculo de las huchas de impuestos.

**Nota:** Se debe asegurar que la lógica de negocio esté desacoplada de la interfaz de usuario para facilitar pruebas y mantenimiento.