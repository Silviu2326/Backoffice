# Módulo 14: Gestión de Activos e Inventario

## 1. Descripción General
Este módulo tiene como objetivo centralizar el control de los activos tanto físicos (hardware) como digitales (suscripciones SaaS, licencias, dominios) del freelancer. Permite tener una visión clara de los costes operativos fijos y el estado de las herramientas de trabajo.

## 2. Alcance Funcional

### 2.1. Inventario de Hardware
Sistema de registro y seguimiento de equipos físicos.
*   **Datos Maestros:** Registro de equipos con campos detallados:
    *   Nombre del dispositivo.
    *   Marca y Modelo.
    *   Número de Serie.
    *   Fecha de Compra.
    *   Proveedor.
    *   Coste de adquisición.
    *   Fecha de Fin de Garantía (con alertas).
*   **Cálculo de Amortización (Lineal):**
    *   Implementación del método de amortización lineal para reflejar el gasto contable:
        *   Fórmula: `(Valor de Adquisición - Valor Residual) / Años de Vida Útil`.
    *   Tabla de amortización automática que muestra el valor en libros al final de cada periodo fiscal.
    *   Visualización gráfica de la depreciación acumulada frente al valor neto.

### 2.2. Gestor de Suscripciones (SaaS Ops)
Control de gastos recurrentes en software y servicios.
*   **Registro de Suscripciones:** Lista unificada de todos los servicios contratados (Adobe, Hosting, Dominios, Herramientas SEO, etc.).
*   **Detección Inteligente (Scraper/API):**
    *   **Conexión Bancaria:** Integración (ej. vía Plaid/GoCardless o importación CSV) para detectar patrones de cobros recurrentes y sugerir nuevas suscripciones.
    *   **Escaneo de Emails:** Parser de correos electrónicos (Gmail API/IMAP) para localizar recibos o facturas de servicios SaaS y extraer fecha de renovación y coste.
*   **Detalles de Suscripción:**
    *   Nombre del servicio.
    *   Coste (mensual/anual).
    *   Fecha de renovación.
    *   Método de pago asociado.
*   **Alertas de Renovación:**
    *   Sistema de notificaciones proactivas (Email, Push, Dashboard) configurables (ej. 7, 3 y 1 día antes).
    *   Avisos específicos para cancelaciones de pruebas gratuitas ("Free Trials") antes del primer cobro.
    *   Alertas de subidas de precio detectadas en nuevos recibos.
*   **Análisis de Costes:**
    *   Cálculo automático del coste mensual total ("Burn rate" de herramientas).
    *   Métricas de uso para evaluar ROI: "¿Gastas 300€/mes en software, usas todo?".

## 3. Arquitectura & Implementación

### 3.1. Ubicación del Código
Todo el código relacionado con este módulo debe residir estrictamente en:
`src/features/inventory/`

### 3.2. Estructura de Carpetas
Dentro del directorio de la feature, se debe respetar la siguiente estructura:

*   `src/features/inventory/pages/`: Componentes de página (vistas completas) para listar inventario, detalles de items y dashboard de costes.
*   `src/features/inventory/components/`: Componentes UI reutilizables específicos del módulo (ej: `AssetCard`, `SubscriptionTable`, `AmortizationChart`).
*   `src/features/inventory/api/`: Definición de tipos, servicios de conexión a backend/Supabase y hooks de gestión de datos.

### 3.3. Modelo de Datos (Referencia)
*   **Asset:** Entidad para hardware.
*   **Subscription:** Entidad para software/servicios recurrentes.

---
**Nota:** Este módulo es clave para el bloque "Bienestar y Expansión" al proporcionar claridad financiera sobre los costes operativos.